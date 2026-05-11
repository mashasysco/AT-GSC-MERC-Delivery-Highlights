# Deploying SWMS Analytics to Amazon ECS (Fargate)

> **Audience:** Developer new to ECS, deploying a Next.js app from scratch.
> **Date:** March 2026
> **Cluster:** `swms-rnd` &nbsp;|&nbsp; **Region:** `us-east-1`

---

## Table of Contents

1. [The Big Picture — How ECS Works](#1-the-big-picture--how-ecs-works)
2. [Architecture We're Building](#2-architecture-were-building)
3. [What's Already In Place (AWS Scan Results)](#3-whats-already-in-place-aws-scan-results)
4. [Prerequisites Checklist](#4-prerequisites-checklist)
5. [Step 1 — Create the Dockerfile](#step-1--create-the-dockerfile)
6. [Step 2 — Create a .dockerignore](#step-2--create-a-dockerignore)
7. [Step 3 — Build the Docker Image](#step-3--build-the-docker-image)
8. [Step 4 — Push the Image to ECR](#step-4--push-the-image-to-ecr)
9. [Step 5 — Create a CloudWatch Log Group](#step-5--create-a-cloudwatch-log-group)
10. [Step 6 — IAM Role Setup](#step-6--iam-role-setup)
11. [Step 7 — Create a Security Group for the ECS Tasks](#step-7--create-a-security-group-for-the-ecs-tasks)
12. [Step 8 — Create a Security Group for the Load Balancer](#step-8--create-a-security-group-for-the-load-balancer)
13. [Step 9 — Create an Application Load Balancer (ALB)](#step-9--create-an-application-load-balancer-alb)
14. [Step 10 — Create a Target Group](#step-10--create-a-target-group)
15. [Step 11 — Create an ALB Listener](#step-11--create-an-alb-listener)
16. [Step 12 — Register a Task Definition](#step-12--register-a-task-definition)
17. [Step 13 — Create the ECS Service](#step-13--create-the-ecs-service)
18. [Step 14 — Verify the Deployment](#step-14--verify-the-deployment)
19. [Updating the App (Redeploy Workflow)](#updating-the-app-redeploy-workflow)
20. [Cleanup / Tear-Down](#cleanup--tear-down)
21. [Troubleshooting](#troubleshooting)
22. [Concepts Glossary](#concepts-glossary)

---

## 1. The Big Picture — How ECS Works

Amazon ECS (Elastic Container Service) is AWS's container orchestration platform. Think of it as AWS's answer to Kubernetes, but simpler. Here's the mental model:

```
┌─────────────────────────────────────────────────────────────────┐
│                        ECS CLUSTER                              │
│  (a logical grouping — like a "workspace" for your containers)  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     ECS SERVICE                           │  │
│  │  (keeps N copies of your app running, restarts them       │  │
│  │   if they crash, connects them to load balancers)         │  │
│  │                                                           │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │  │
│  │  │   TASK      │  │   TASK      │  │   TASK      │       │  │
│  │  │ (1 running  │  │ (1 running  │  │ (1 running  │       │  │
│  │  │  copy of    │  │  copy of    │  │  copy of    │       │  │
│  │  │  your app)  │  │  your app)  │  │  your app)  │       │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘       │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Key Concepts:**

| Concept | What It Is | Analogy |
|---|---|---|
| **Cluster** | Logical namespace for services/tasks | A Kubernetes cluster |
| **Task Definition** | A JSON blueprint describing your container (image, CPU, memory, env vars, ports) | A `docker-compose.yml` file |
| **Task** | A running instance of a Task Definition | A running `docker run` process |
| **Service** | A controller that keeps N tasks alive and connects to ALB | A Kubernetes Deployment |
| **Fargate** | Serverless compute — AWS manages the underlying servers | "I don't care about servers" |
| **ALB** | Application Load Balancer — routes HTTP traffic to healthy tasks | nginx reverse proxy |
| **Target Group** | A pool of targets (ECS tasks) that the ALB sends traffic to | An upstream block in nginx |
| **ECR** | Elastic Container Registry — Docker registry hosted by AWS | Docker Hub, but private |
| **Security Group** | Firewall rules (what traffic can enter/leave) | iptables / firewall rules |

**How a request flows:**

```
User (Browser)
    │
    ▼
Application Load Balancer (ALB)     ← public/internal HTTP(S) endpoint
    │
    ▼ (routes to healthy target)
Target Group
    │
    ▼
ECS Task (your Next.js container)   ← running on Fargate
    │
    ├──▶ Secrets Manager             ← fetch DB credentials
    │
    └──▶ Oracle Database             ← port 1521, corporate network
```

---

## 2. Architecture We're Building

```
┌────────────────────────────────────────────────────────────────────────┐
│                          VPC: SWMS-NP (10.133.72.0/21)                │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Private Subnets (Confidential)                                  │  │
│  │                                                                  │  │
│  │  ┌─────────────────────────┐   ┌──────────────────────────────┐  │  │
│  │  │  ALB (internal)         │   │  ECS Task (Fargate)          │  │  │
│  │  │  swms-analytics-alb     │──▶│  Next.js on port 3000        │  │  │
│  │  │  Listener: HTTP :80     │   │  Image: ECR/swms-rnd:        │  │  │
│  │  │                         │   │    swms-analytics-latest     │  │  │
│  │  └─────────────────────────┘   │                              │  │  │
│  │                                │  ──▶ Secrets Manager (VPC-E) │  │  │
│  │                                │  ──▶ Oracle DB (:1521)       │  │  │
│  │                                │  ──▶ CloudWatch Logs         │  │  │
│  │                                └──────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

**Why internal ALB?** All subnets in this VPC are private (no public IPs). The ALB will be accessible within the corporate network (Sysco VPN / Transit Gateway connected offices). This matches how other SWMS services are deployed.

---

## 3. What's Already In Place (AWS Scan Results)

Before planning, I scanned your AWS account. Here's what exists and what we need to create:

### ✅ Already Exists

| Resource | Details |
|---|---|
| ECS Cluster | `swms-rnd` — ACTIVE, Fargate + Fargate_Spot capacity providers |
| ECR Repository | `546397704060.dkr.ecr.us-east-1.amazonaws.com/swms-rnd` |
| VPC | `vpc-0687cabb1f5f6f5de` (SWMS-NP), CIDR `10.133.72.0/21` |
| Private Subnets | 4 subnets across 3 AZs (us-east-1a/b/c) — all private, no public IPs |
| VPC Endpoints | ECR API, S3, Secrets Manager, SSM, Execute-API, DynamoDB |
| Outbound Routing | Transit Gateway (`tgw-0e5b0402b2e5fabcd`) for `0.0.0.0/0` |
| IAM Role | `lambda-role` — already has Secrets Manager access, CloudWatch, VPC networking |
| Secret | `/swms/db/oracle/credentials/swmsview` — DB credentials in Secrets Manager |
| Container Runtime | **Podman 5.4.1** installed locally (no Docker — that's fine, Podman is a drop-in replacement) |

### ⚠️ Key Constraints

| Constraint | Impact |
|---|---|
| `iam:CreateRole` is **DENIED** (org SCP) | We reuse the existing `lambda-role` — already updated its trust to allow `ecs-tasks.amazonaws.com` |
| No NAT Gateway | Outbound goes via Transit Gateway (corporate network) — works fine for ECR pulls, CloudWatch, Secrets Manager |
| No public subnets | ALB will be **internal** (accessible from corporate network only) |
| Corporate Tags required | Cloud Custodian auto-deletes untagged resources — we must tag everything |

### 🔨 What We Need To Create

| Resource | Why |
|---|---|
| **Dockerfile** | Package the Next.js app as a container image |
| **Docker image** | Built and pushed to ECR |
| **CloudWatch Log Group** | Where container logs go |
| **Security Group (ECS)** | Firewall for the Fargate tasks |
| **Security Group (ALB)** | Firewall for the load balancer |
| **Application Load Balancer** | HTTP endpoint for accessing the app |
| **Target Group** | Connects ALB → ECS tasks |
| **ALB Listener** | Tells the ALB what to do with incoming traffic |
| **Task Definition** | Blueprint for running the container |
| **ECS Service** | Actually runs the container and keeps it alive |

---

## 4. Prerequisites Checklist

Before starting, verify:

```bash
# 1. AWS CLI configured and working
aws sts get-caller-identity

# 2. Podman available (we use this instead of Docker)
podman --version
# Expected: podman version 5.4.1

# 3. Node.js installed (for building the app)
node --version

# 4. You're in the project directory
cd /path/to/swms-analytics
```

> **Podman vs Docker:** Podman is a drop-in replacement for Docker. Every `docker` command in this guide can be replaced with `podman`. They produce identical OCI-compliant images. The key difference: Podman is daemonless (no background Docker daemon needed).

---

## Step 1 — Create the Dockerfile

**What is a Dockerfile?**
A Dockerfile is a recipe for building a container image. Each line is an instruction. The final image contains your app and everything it needs to run (Node.js, dependencies, built files).

**Why multi-stage build?**
We use a multi-stage build to keep the final image small. Stage 1 (`builder`) installs all dependencies and builds the app. Stage 2 (`runner`) only copies the built output — no dev dependencies, no source code.

Create this file at the project root:

```dockerfile
# ── Stage 1: Build ────────────────────────────────────────────────
# Install dependencies and build the Next.js app in standalone mode.
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first (Docker caches this layer if they don't change)
COPY package.json package-lock.json* ./

# Install ALL dependencies (including devDependencies for the build)
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build Next.js in standalone mode (output goes to .next/standalone/)
RUN npm run build

# ── Stage 2: Production Runtime ──────────────────────────────────
# Minimal image with only what's needed to run.
FROM node:22-alpine AS runner

WORKDIR /app

# Don't run as root (security best practice)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the standalone server (includes server.js + traced node_modules)
COPY --from=builder /app/.next/standalone ./

# Copy static assets (not included in standalone by default)
COPY --from=builder /app/.next/static ./.next/static

# Copy public assets
COPY --from=builder /app/public ./public

# Copy the AWS SDK (dynamic import not traced by Next.js standalone)
COPY --from=builder /app/node_modules/@aws-sdk ./node_modules/@aws-sdk
COPY --from=builder /app/node_modules/@smithy ./node_modules/@smithy

# Switch to non-root user
USER nextjs

# Next.js standalone server listens on this port
EXPOSE 3000

# Environment variables (can be overridden at runtime)
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

# Start the Next.js standalone server
CMD ["node", "server.js"]
```

> **Why `node:22-alpine`?** Alpine Linux images are ~5x smaller than Debian-based ones (~180MB vs ~1GB). Your current Lambda uses Node 22 (`nodejs22.x`), so we match that.

> **Why copy `@aws-sdk` and `@smithy` manually?** The `lib/db.ts` file uses a dynamic `import()` for the AWS SDK, which Next.js's build tracer can't detect. Without this copy, the container would crash at runtime trying to call Secrets Manager. This is the same fix used in your `build-for-lambda.sh` script.

---

## Step 2 — Create a .dockerignore

**What is `.dockerignore`?**
Like `.gitignore` but for Docker builds. Files listed here won't be copied into the image, making builds faster and images smaller.

Create `.dockerignore` in the project root:

```
node_modules
.next
.git
.gitignore
*.md
docs/
.env*
.sst/
sst.config.ts
sst-env.d.ts
scripts/
run.sh
```

> **Why exclude `node_modules`?** The Dockerfile runs `npm ci` inside the container, which installs dependencies fresh. Copying your local `node_modules` would be slower and could include macOS-specific binaries that don't work on Linux.

---

## Step 3 — Build the Docker Image

**What happens during `podman build`?**
Podman reads the Dockerfile, executes each instruction in a temporary container, and saves the final result as an image. Since we're building for ECS Fargate (Linux/x86_64), we specify the target platform.

```bash
# Navigate to project root
cd /path/to/swms-analytics

# Build the image (tag it with the ECR repository URI)
# --platform: Fargate runs linux/amd64 (x86_64), your Mac is arm64
# -t: "tag" — names the image so we can push it later
podman build \
  --platform linux/amd64 \
  -t 546397704060.dkr.ecr.us-east-1.amazonaws.com/swms-rnd:swms-analytics-latest \
  -t 546397704060.dkr.ecr.us-east-1.amazonaws.com/swms-rnd:swms-analytics-v1.0.0 \
  .
```

> **Why `--platform linux/amd64`?** Your Mac has an Apple Silicon (ARM) chip, but Fargate runs x86_64 Linux. Without this flag, the image would be built for ARM and would crash on Fargate with an exec format error.

> **Why prefixed tags (e.g. `swms-analytics-latest` instead of just `latest`)?** The `swms-rnd` ECR repository is shared across multiple R&D projects. Prefixing tags with `swms-analytics-` namespaces our images so they never collide with other projects' tags in the same repo.

> **Why two tags?** They both point to the **same image** (not two copies). Think of them as two bookmarks:
> - `swms-analytics-latest` — a **moving** pointer. Every new build overwrites it. Convenient for "always run the newest."
> - `swms-analytics-v1.0.0` — a **permanent** marker. If `v1.1.0` breaks something, you can roll back to this exact image because the tag is never overwritten.

**Verify the image was built:**

```bash
podman images | grep swms-rnd
```

---

## Step 4 — Push the Image to ECR

**What is ECR?**
Amazon Elastic Container Registry (ECR) is AWS's private Docker registry. Your ECS tasks will pull the container image from here. Think of it as a private Docker Hub within your AWS account.

**Step 4a — Authenticate Podman with ECR**

ECR requires authentication. The `aws ecr get-login-password` command fetches a temporary token that Podman uses to push/pull images.

```bash
# Get a login token from ECR and pipe it to podman login
aws ecr get-login-password --region us-east-1 | \
  podman login \
    --username AWS \
    --password-stdin \
    546397704060.dkr.ecr.us-east-1.amazonaws.com
```

> **How this works:** `aws ecr get-login-password` returns a base64-encoded token valid for 12 hours. `podman login` stores it in `~/.config/containers/auth.json`. After 12 hours, you'll need to run this again.

**Step 4b — Push the image**

```bash
# Push both tags
podman push 546397704060.dkr.ecr.us-east-1.amazonaws.com/swms-rnd:swms-analytics-latest
podman push 546397704060.dkr.ecr.us-east-1.amazonaws.com/swms-rnd:swms-analytics-v1.0.0
```

**Step 4c — Verify the image landed in ECR**

```bash
aws ecr describe-images \
  --repository-name swms-rnd \
  --query 'imageDetails[*].{Tags:imageTags,Size:imageSizeInBytes,Pushed:imagePushedAt}' \
  --output table
```

You should see your `swms-analytics-latest` and `swms-analytics-v1.0.0` tags listed.

---

## Step 5 — Create a CloudWatch Log Group

**What are CloudWatch Logs?**
CloudWatch Logs is where your container's `stdout` and `stderr` output goes. Every `console.log()` in your Next.js app will appear here. Without this, you'd have no way to debug issues.

```bash
aws logs create-log-group \
  --log-group-name /ecs/swms-analytics \
  --tags 'Technical:ApplicationID=APP-000660,Technical:ApplicationName=SWMS,Technical:Environment=NONPROD,Technical:PatchWindow=hco-offboard,Technical:PlatformOwner=SWMS-Platform-Team@Sysco.com,datacenter=AWS,env=nonprod,service=SWMS'
```

> **Why the tags?** Your org uses Cloud Custodian which **auto-deletes resources missing required tags** within seconds. These are the same corporate tags used in your `sst.config.ts`.

**Optional — Set a retention policy (saves $$$):**

```bash
# Keep logs for 30 days (default is forever, which costs money)
aws logs put-retention-policy \
  --log-group-name /ecs/swms-analytics \
  --retention-in-days 30
```

---

## Step 6 — IAM Role Setup

**What are IAM Roles in ECS?**
ECS tasks use **two** types of roles:

| Role Type | Purpose | Analogy |
|---|---|---|
| **Task Execution Role** | Used by the ECS *agent* (not your code) to pull images from ECR, push logs to CloudWatch, and fetch secrets | The "janitor key" that lets infrastructure work |
| **Task Role** | Used by your *application code* inside the container to call AWS APIs (e.g., Secrets Manager) | The "employee badge" your app uses |

In our case, we use the **same role** (`lambda-role`) for both, because:
- `iam:CreateRole` is denied by your org's SCP (Service Control Policy)
- The existing `lambda-role` already has Secrets Manager access
- We've added the necessary trust and policies to it

**What was already done (during the feasibility scan):**

```bash
# ✅ 1. Updated trust policy to allow ECS tasks to assume this role
# (originally only lambda.amazonaws.com could assume it)
aws iam update-assume-role-policy \
  --role-name lambda-role \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {
        "Service": ["lambda.amazonaws.com", "ecs-tasks.amazonaws.com"]
      },
      "Action": "sts:AssumeRole"
    }]
  }'

# ✅ 2. Attached ECR read access (so ECS agent can pull images)
aws iam attach-role-policy \
  --role-name lambda-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly

# ✅ 3. Attached ECS Task Execution policy (ECR pull + CloudWatch logs)
aws iam attach-role-policy \
  --role-name lambda-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
```

**Verify the role is properly configured:**

```bash
# Check trust policy
aws iam get-role --role-name lambda-role \
  --query 'Role.AssumeRolePolicyDocument' --output json

# Check attached policies
aws iam list-attached-role-policies --role-name lambda-role --output table
```

You should see `ecs-tasks.amazonaws.com` in the trust policy, and `AmazonECSTaskExecutionRolePolicy` + `AmazonEC2ContainerRegistryReadOnly` in the attached policies.

**The role ARN we'll use throughout:**
```
arn:aws:iam::546397704060:role/lambda-role
```

---

## Step 7 — Create a Security Group for the ECS Tasks

**What is a Security Group?**
A security group is a stateful firewall that controls what traffic can reach your container (inbound) and what traffic your container can send out (outbound). Think of it as a whitelist.

**What our ECS tasks need:**
- **Inbound:** Accept traffic on port 3000 from the ALB only
- **Outbound:** Oracle DB on port 1521 + HTTPS (443) for Secrets Manager & ECR

```bash
# Create the security group
aws ec2 create-security-group \
  --group-name swms-analytics-ecs-sg \
  --description "Security group for swms-analytics ECS Fargate tasks" \
  --vpc-id vpc-0687cabb1f5f6f5de \
  --tag-specifications 'ResourceType=security-group,Tags=[{Key=Name,Value=swms-analytics-ecs-sg},{Key=Technical:ApplicationID,Value=APP-000660},{Key=Technical:ApplicationName,Value=SWMS},{Key=Technical:Environment,Value=NONPROD},{Key=Technical:PatchWindow,Value=hco-offboard},{Key=Technical:PlatformOwner,Value=SWMS-Platform-Team@Sysco.com},{Key=datacenter,Value=AWS},{Key=env,Value=nonprod},{Key=service,Value=SWMS}]' \
  --output json
```

**Save the Security Group ID** from the output (e.g., `sg-0xxxxxxxxxxxxxxxxx`). We'll call it `ECS_SG_ID`.

```bash
# Store it in a variable for later commands
ECS_SG_ID="sg-0e9e6f7be8545bf47"
```

**Add inbound rule — allow port 3000 from the VPC CIDR:**

```bash
# Allow traffic on port 3000 from anywhere in the VPC
# (We'll tighten this to ALB-only after creating the ALB security group)
aws ec2 authorize-security-group-ingress \
  --group-id $ECS_SG_ID \
  --protocol tcp \
  --port 3000 \
  --cidr 10.133.72.0/21 \
  --tag-specifications 'ResourceType=security-group-rule,Tags=[{Key=Name,Value=Allow HTTP from VPC}]'
```

**Add outbound rules:**

```bash
# Allow Oracle DB access (port 1521)
aws ec2 authorize-security-group-egress \
  --group-id $ECS_SG_ID \
  --ip-permissions 'IpProtocol=tcp,FromPort=1521,ToPort=1521,IpRanges=[{CidrIp=0.0.0.0/0,Description=Oracle DB access}]'

# Allow HTTPS (port 443) for Secrets Manager, ECR, CloudWatch
aws ec2 authorize-security-group-egress \
  --group-id $ECS_SG_ID \
  --ip-permissions 'IpProtocol=tcp,FromPort=443,ToPort=443,IpRanges=[{CidrIp=0.0.0.0/0,Description=HTTPS - Secrets Manager and AWS APIs}]'
```

> **Note:** You may need to first revoke the default "allow all outbound" rule if you want to be strict. The default egress rule allows all traffic out, which works but is less secure. For simplicity, the default egress rule is fine.

---

## Step 8 — Create a Security Group for the Load Balancer

The ALB needs its own security group to accept inbound HTTP traffic.

```bash
aws ec2 create-security-group \
  --group-name swms-analytics-alb-sg \
  --description "Security group for swms-analytics ALB" \
  --vpc-id vpc-0687cabb1f5f6f5de \
  --tag-specifications 'ResourceType=security-group,Tags=[{Key=Name,Value=swms-analytics-alb-sg},{Key=Technical:ApplicationID,Value=APP-000660},{Key=Technical:ApplicationName,Value=SWMS},{Key=Technical:Environment,Value=NONPROD},{Key=Technical:PatchWindow,Value=hco-offboard},{Key=Technical:PlatformOwner,Value=SWMS-Platform-Team@Sysco.com},{Key=datacenter,Value=AWS},{Key=env,Value=nonprod},{Key=service,Value=SWMS}]' \
  --output json
```

```bash
ALB_SG_ID="sg-05e19c87fbed648d7"
```

**Add inbound rule — allow HTTP port 80 from the corporate network:**

```bash
# Allow HTTP from VPC CIDR (corporate users via VPN/Transit Gateway)
aws ec2 authorize-security-group-ingress \
  --group-id $ALB_SG_ID \
  --protocol tcp \
  --port 80 \
  --cidr 10.0.0.0/8 \
  --tag-specifications 'ResourceType=security-group-rule,Tags=[{Key=Name,Value=Allow HTTP from corporate network}]'
```

> **Why `10.0.0.0/8`?** This is the entire Sysco RFC-1918 private range. All offices, VPNs, and other VPCs connect through the Transit Gateway and have addresses in this range. You can tighten this later.

---

## Step 9 — Create an Application Load Balancer (ALB)

**What is an ALB?**
An Application Load Balancer operates at Layer 7 (HTTP/HTTPS) and distributes incoming traffic across your ECS tasks. It also performs health checks — if a task is unhealthy, the ALB stops sending traffic to it and ECS replaces it.

```bash
aws elbv2 create-load-balancer \
  --name swms-analytics-alb \
  --subnets subnet-0e489327234990da6 subnet-035fe68401a12684f subnet-0a264781fccaecff9 \
  --security-groups $ALB_SG_ID \
  --scheme internal \
  --type application \
  --tags 'Key=Name,Value=swms-analytics-alb' 'Key=Technical:ApplicationID,Value=APP-000660' 'Key=Technical:ApplicationName,Value=SWMS' 'Key=Technical:Environment,Value=NONPROD' 'Key=Technical:PatchWindow,Value=hco-offboard' 'Key=Technical:PlatformOwner,Value=SWMS-Platform-Team@Sysco.com' 'Key=datacenter,Value=AWS' 'Key=env,Value=nonprod' 'Key=service,Value=SWMS' \
  --output json
```

**Save the ALB ARN and DNS name** from the output:

```bash
ALB_ARN="arn:aws:elasticloadbalancing:us-east-1:546397704060:loadbalancer/app/swms-analytics-alb/1965f98480ee0f1a"
ALB_DNS="internal-swms-analytics-alb-310563789.us-east-1.elb.amazonaws.com"
```

> **`--scheme internal`** means this ALB is NOT publicly accessible from the internet. Only users on the corporate network (VPN/Transit Gateway) can reach it. This is the same pattern used by all other SWMS services (e.g., `swms-core-fargate-dev-lb`, `swms-support-sap-dashboard-be`).

> **Why 3 subnets?** ALBs require at least 2 subnets in different AZs for high availability. We use 3 for better spread. These are the same confidential subnets your Lambda function uses.

---

## Step 10 — Create a Target Group

**What is a Target Group?**
A target group tells the ALB where to send traffic. For ECS with Fargate, the target type is `ip` (because Fargate tasks get their own ENI / IP address). The target group also defines health checks.

```bash
aws elbv2 create-target-group \
  --name swms-analytics-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-0687cabb1f5f6f5de \
  --target-type ip \
  --health-check-protocol HTTP \
  --health-check-path "/" \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --tags 'Key=Name,Value=swms-analytics-tg' 'Key=Technical:ApplicationID,Value=APP-000660' 'Key=Technical:ApplicationName,Value=SWMS' 'Key=Technical:Environment,Value=NONPROD' 'Key=Technical:PatchWindow,Value=hco-offboard' 'Key=Technical:PlatformOwner,Value=SWMS-Platform-Team@Sysco.com' 'Key=datacenter,Value=AWS' 'Key=env,Value=nonprod' 'Key=service,Value=SWMS' \
  --output json
```

**Save the Target Group ARN:**

```bash
TG_ARN="arn:aws:elasticloadbalancing:us-east-1:546397704060:targetgroup/swms-analytics-tg/3a3a9bd3dbed4a2c"
```

**Understanding health checks:**
- The ALB sends `GET /` every 30 seconds to each task on port 3000
- If the task returns 200 OK twice in a row → Healthy
- If the task fails 3 times in a row → Unhealthy (ALB stops sending traffic, ECS replaces it)
- `--health-check-path "/"` uses your app's homepage — the Next.js dashboard page

---

## Step 11 — Create an ALB Listener

**What is a Listener?**
A listener is a process running on the ALB that checks for incoming connection requests. It has a port (80 for HTTP) and a default action (forward to target group).

```bash
aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=$TG_ARN \
  --tags 'Key=Name,Value=swms-analytics-listener' 'Key=Technical:ApplicationID,Value=APP-000660' 'Key=Technical:ApplicationName,Value=SWMS' 'Key=Technical:Environment,Value=NONPROD' 'Key=Technical:PatchWindow,Value=hco-offboard' 'Key=Technical:PlatformOwner,Value=SWMS-Platform-Team@Sysco.com' 'Key=datacenter,Value=AWS' 'Key=env,Value=nonprod' 'Key=service,Value=SWMS' \
  --output json
```

> **Why HTTP (not HTTPS)?** HTTPS requires an ACM certificate and a domain name. For an internal R&D tool, HTTP on port 80 is fine for now. You can add HTTPS later by requesting a certificate from your team and adding an HTTPS listener on port 443.

**At this point, the plumbing is ready:**
```
User → ALB (:80) → Listener → Target Group (:3000) → ???
                                                       ↑
                          (no targets yet — we'll add them with the ECS Service)
```

---

## Step 12 — Register a Task Definition

**What is a Task Definition?**
Think of it as a `docker-compose.yml` but in AWS JSON format. It tells ECS:
- Which Docker image to run
- How much CPU and memory to allocate
- What environment variables to set
- Where to send logs
- What IAM role to use

**Create the task definition JSON file:**

Save this as `task-definition.json` in your project root (or anywhere convenient):

```json
{
  "family": "swms-analytics",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::546397704060:role/lambda-role",
  "taskRoleArn": "arn:aws:iam::546397704060:role/lambda-role",
  "containerDefinitions": [
    {
      "name": "swms-analytics",
      "image": "546397704060.dkr.ecr.us-east-1.amazonaws.com/swms-rnd:swms-analytics-latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 3000,
          "hostPort": 3000,
          "protocol": "tcp",
          "appProtocol": "http"
        }
      ],
      "environment": [
        { "name": "PORT", "value": "3000" },
        { "name": "HOSTNAME", "value": "0.0.0.0" },
        { "name": "NODE_ENV", "value": "production" },
        { "name": "DB_SECRET_ARN", "value": "arn:aws:secretsmanager:us-east-1:546397704060:secret:/swms/db/oracle/credentials/swmsview-AhLJCK" },
        { "name": "AWS_SM_REGION", "value": "us-east-1" }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/swms-analytics",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs",
          "mode": "non-blocking",
          "max-buffer-size": "25m"
        }
      }
    }
  ],
  "tags": [
    { "key": "Technical:ApplicationID", "value": "APP-000660" },
    { "key": "Technical:ApplicationName", "value": "SWMS" },
    { "key": "Technical:Environment", "value": "NONPROD" },
    { "key": "Technical:PatchWindow", "value": "hco-offboard" },
    { "key": "Technical:PlatformOwner", "value": "SWMS-Platform-Team@Sysco.com" },
    { "key": "datacenter", "value": "AWS" },
    { "key": "env", "value": "nonprod" },
    { "key": "service", "value": "SWMS" }
  ]
}
```

**Register it:**

```bash
aws ecs register-task-definition \
  --cli-input-json file://task-definition.json \
  --output json
```

**Key fields explained:**

| Field | Value | Why |
|---|---|---|
| `cpu: "1024"` | 1 vCPU | Matches your Lambda config. Enough for a Next.js app |
| `memory: "2048"` | 2 GB | Enough for Node.js + Next.js server-side rendering |
| `networkMode: "awsvpc"` | Required for Fargate | Each task gets its own network interface |
| `executionRoleArn` | `lambda-role` | ECS agent uses this to pull from ECR and push logs |
| `taskRoleArn` | `lambda-role` | Your app code uses this to call Secrets Manager |
| `DB_SECRET_ARN` | Secret ARN | Tells `lib/db.ts` to fetch creds from Secrets Manager (same as Lambda) |
| `logDriver: "awslogs"` | CloudWatch Logs | Standard for ECS — sends stdout/stderr to CloudWatch |

> **`family` is the name.** When you register a new revision (updated image, env vars), it gets a new version number: `swms-analytics:1`, `swms-analytics:2`, etc. The old definitions are kept for rollback.

---

## Step 13 — Create the ECS Service

**What is an ECS Service?**
The service is the "glue" that:
1. Launches N tasks based on the task definition
2. Registers them in the target group (so the ALB sends traffic)
3. Monitors health and replaces unhealthy tasks
4. Handles rolling deployments when you update the image

```bash
aws ecs create-service \
  --cluster swms-rnd \
  --service-name swms-analytics \
  --task-definition swms-analytics \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-0e489327234990da6,subnet-035fe68401a12684f,subnet-0a264781fccaecff9],securityGroups=[$ECS_SG_ID],assignPublicIp=DISABLED}" \
  --load-balancers "targetGroupArn=$TG_ARN,containerName=swms-analytics,containerPort=3000" \
  --deployment-configuration "minimumHealthyPercent=100,maximumPercent=200" \
  --enable-ecs-managed-tags \
  --propagate-tags SERVICE \
  --tags 'key=Technical:ApplicationID,value=APP-000660' 'key=Technical:ApplicationName,value=SWMS' 'key=Technical:Environment,value=NONPROD' 'key=Technical:PatchWindow,value=hco-offboard' 'key=Technical:PlatformOwner,value=SWMS-Platform-Team@Sysco.com' 'key=datacenter,value=AWS' 'key=env,value=nonprod' 'key=service,value=SWMS' \
  --output json
```

**Key settings explained:**

| Setting | Value | What It Means |
|---|---|---|
| `--desired-count 1` | 1 task | Start with 1 instance. Increase later for HA |
| `--launch-type FARGATE` | Serverless | AWS manages the servers. You just pay per task per second |
| `assignPublicIp=DISABLED` | No public IP | All subnets are private. Outbound goes via Transit Gateway |
| `minimumHealthyPercent=100` | Zero-downtime deploys | During rolling update, keep at least 100% capacity (old task stays until new one is healthy) |
| `maximumPercent=200` | Allow double capacity during deploy | New task starts alongside old one, then old one drains |

> **What happens now?** ECS will immediately start pulling your image from ECR, launch a Fargate task, register it in the target group, and start the health checks. This typically takes 1-3 minutes.

---

## Step 14 — Verify the Deployment

**Check service status:**

```bash
aws ecs describe-services \
  --cluster swms-rnd \
  --services swms-analytics \
  --query 'services[0].{status:status,desiredCount:desiredCount,runningCount:runningCount,deployments:deployments[*].{status:status,runningCount:runningCount,desiredCount:desiredCount,rolloutState:rolloutState}}' \
  --output json
```

You want to see: `runningCount: 1`, `rolloutState: "COMPLETED"`

**Check the task is healthy in the target group:**

```bash
aws elbv2 describe-target-health \
  --target-group-arn $TG_ARN \
  --query 'TargetHealthDescriptions[*].{Target:Target.Id,Port:Target.Port,Health:TargetHealth.State,Reason:TargetHealth.Reason}' \
  --output table
```

You want to see: `Health: healthy`

**Check logs in CloudWatch:**

```bash
# View recent logs
aws logs tail /ecs/swms-analytics --since 10m --follow
```

**Access the app:**

```bash
# Get the ALB DNS name
aws elbv2 describe-load-balancers \
  --names swms-analytics-alb \
  --query 'LoadBalancers[0].DNSName' \
  --output text
```

Open the DNS name in your browser (from within the corporate network/VPN):
```
http://internal-swms-analytics-alb-310563789.us-east-1.elb.amazonaws.com
```

🎉 **If you see the SWMS Analytics Dashboard, you've successfully deployed to ECS!**

---

## Updating the App (Redeploy Workflow)

When you make code changes, here's the workflow to deploy updates:

```bash
# 1. Build the new image
podman build --platform linux/amd64  -t 546397704060.dkr.ecr.us-east-1.amazonaws.com/swms-rnd:delivery-highlights-latest -t 546397704060.dkr.ecr.us-east-1.amazonaws.com/swms-rnd:delivery-highlights-v1.3.0   .

# 2. Re-authenticate with ECR (if token expired — tokens last 12 hours)
aws ecr get-login-password --region us-east-1 --profile DevOpsUser-546397704060|   podman login --username AWS --password-stdin   546397704060.dkr.ecr.us-east-1.amazonaws.com 

# 3. Push the new image
podman push 546397704060.dkr.ecr.us-east-1.amazonaws.com/swms-rnd:delivery-highlights-latest
podman push 546397704060.dkr.ecr.us-east-1.amazonaws.com/swms-rnd:delivery-highlights-v1.3.0

# 4. Force ECS to pull the new image and do a rolling update
aws ecs update-service   --cluster swms-rnd --service swms-analytics --force-new-deployment --profile DevOpsUser-546397704060

# 5. Watch the deployment roll out
aws ecs describe-services   --cluster swms-rnd   --services delivery-highlights   --query 'services[0].deployments[*].{status:status,running:runningCount,desired:desiredCount,rollout:rolloutState}'   --output table --profile DevOpsUser-546397704060

```

> **How rolling deployment works:**
> 1. ECS launches a **new** task with the latest image
> 2. The new task passes health checks → registered in target group
> 3. The **old** task is drained (stops receiving new requests, finishes in-flight ones)
> 4. Old task is stopped and deregistered
> 5. Result: zero downtime!

---

## Cleanup / Tear-Down

If you need to remove everything (in reverse order of creation):

```bash
# 1. Delete the ECS Service (stops all tasks)
aws ecs update-service --cluster swms-rnd --service swms-analytics --desired-count 0
aws ecs delete-service --cluster swms-rnd --service swms-analytics --force

# 2. Deregister the task definition
aws ecs deregister-task-definition --task-definition swms-analytics:1

# 3. Delete the ALB listener, target group, and ALB
# (Get the listener ARN first)
LISTENER_ARN=$(aws elbv2 describe-listeners --load-balancer-arn $ALB_ARN --query 'Listeners[0].ListenerArn' --output text)
aws elbv2 delete-listener --listener-arn $LISTENER_ARN
aws elbv2 delete-target-group --target-group-arn $TG_ARN
aws elbv2 delete-load-balancer --load-balancer-arn $ALB_ARN

# 4. Delete security groups (wait ~30s for ALB to fully deregister)
sleep 30
aws ec2 delete-security-group --group-id $ECS_SG_ID
aws ec2 delete-security-group --group-id $ALB_SG_ID

# 5. Delete log group
aws logs delete-log-group --log-group-name /ecs/swms-analytics

# 6. Delete ECR images (optional)
aws ecr batch-delete-image --repository-name swms-rnd --image-ids imageTag=swms-analytics-latest imageTag=swms-analytics-v1.0.0
```

---

## Troubleshooting

### Task keeps restarting / STOPPED

```bash
# See why the task stopped
aws ecs describe-tasks \
  --cluster swms-rnd \
  --tasks $(aws ecs list-tasks --cluster swms-rnd --service-name swms-analytics --query 'taskArns[0]' --output text) \
  --query 'tasks[0].{lastStatus:lastStatus,stoppedReason:stoppedReason,stopCode:stopCode,containers:containers[*].{name:name,exitCode:exitCode,reason:reason}}' \
  --output json
```

**Common issues:**

| Symptom | Cause | Fix |
|---|---|---|
| `CannotPullContainerError` | ECR auth or VPC connectivity issue | Check execution role has ECR access; verify ECR VPC endpoints or TGW routing |
| `Exit code 1` | App crashed at startup | Check CloudWatch logs (`aws logs tail /ecs/swms-analytics`) |
| `ResourceNotFoundException` | Secrets Manager can't find the secret | Verify `DB_SECRET_ARN` env var; check task role has `secretsmanager:GetSecretValue` |
| `ORA-12170: TNS:Connect timeout` | Can't reach Oracle DB | Check SG allows egress on port 1521; verify Oracle host is reachable from VPC |
| Target group shows `unhealthy` | Health check failing | Check app is actually listening on port 3000; check SG inbound rule allows traffic |

### Can't access from browser

- Make sure you're on the corporate VPN
- The ALB is internal — not accessible from the public internet
- Try `curl http://<ALB-DNS>` from an EC2 instance in the same VPC

### View real-time logs

```bash
# Stream logs in real-time (like docker logs -f)
aws logs tail /ecs/swms-analytics --follow

# Search for errors
aws logs filter-log-events \
  --log-group-name /ecs/swms-analytics \
  --filter-pattern "ERROR" \
  --start-time $(date -v-1H +%s000)
```

---

## Concepts Glossary

| Term | Definition |
|---|---|
| **Container Image** | A read-only template containing your app + all its dependencies. Built from a Dockerfile. Stored in a registry (ECR). |
| **Container** | A running instance of an image. Isolated process with its own filesystem, network, and process space. |
| **ECR (Elastic Container Registry)** | AWS's private Docker image registry. Where you push images for ECS to pull. |
| **ECS (Elastic Container Service)** | AWS's container orchestration service. Manages running, scaling, and deploying containers. |
| **Fargate** | A serverless compute engine for ECS. You define CPU/memory, but AWS manages the underlying servers. You pay per task per second. |
| **Task Definition** | A JSON blueprint describing how to run your container(s). Like a `docker-compose.yml`. |
| **Task** | One running instance of a task definition. On Fargate, each task gets its own ENI (network interface) with a private IP. |
| **Service** | An ECS controller that maintains a desired number of tasks, handles rolling deployments, and integrates with load balancers. |
| **ALB (Application Load Balancer)** | An AWS load balancer that operates at HTTP layer. Routes requests to healthy targets. |
| **Target Group** | A group of targets (ECS task IPs) that an ALB routes traffic to. Includes health check configuration. |
| **Security Group** | A stateful firewall that controls inbound and outbound traffic to an AWS resource. |
| **VPC Endpoint** | A private connection between your VPC and an AWS service, avoiding the public internet. |
| **Transit Gateway** | A central hub that connects VPCs and on-premises networks. Your VPC uses this for outbound internet routing. |
| **SCP (Service Control Policy)** | An AWS Organizations policy that restricts what actions are allowed in the account. |
| **Cloud Custodian** | A policy engine that auto-enforces rules (like deleting untagged resources). |
| **awsvpc** | Network mode where each task gets its own ENI/IP. Required for Fargate. |
| **Rolling Deployment** | Update strategy: new tasks start alongside old ones, then old ones drain gracefully. Zero downtime. |

---

## Quick Reference — All IDs & ARNs

```
# Cluster
CLUSTER=swms-rnd
CLUSTER_ARN=arn:aws:ecs:us-east-1:546397704060:cluster/swms-rnd

# ECR
ECR_URI=546397704060.dkr.ecr.us-east-1.amazonaws.com/swms-rnd
ECR_ARN=arn:aws:ecr:us-east-1:546397704060:repository/swms-rnd

# VPC & Subnets
VPC_ID=vpc-0687cabb1f5f6f5de
SUBNET_1=subnet-0e489327234990da6    # us-east-1a, Confidential 1
SUBNET_2=subnet-035fe68401a12684f    # us-east-1b, Confidential 2
SUBNET_3=subnet-0a264781fccaecff9    # us-east-1c, Confidential 3

# IAM
ROLE_ARN=arn:aws:iam::546397704060:role/lambda-role

# Secrets
SECRET_ARN=arn:aws:secretsmanager:us-east-1:546397704060:secret:/swms/db/oracle/credentials/swmsview-AhLJCK

# Corporate Tags (copy-paste for --tags)
# Technical:ApplicationID=APP-000660
# Technical:ApplicationName=SWMS
# Technical:Environment=NONPROD
# Technical:PatchWindow=hco-offboard
# Technical:PlatformOwner=SWMS-Platform-Team@Sysco.com
# datacenter=AWS
# env=nonprod
# service=SWMS
```

---

*Last updated: March 2026 | Author: GitHub Copilot (via AWS environment scan)*
