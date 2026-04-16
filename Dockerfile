# ── Stage 1: Build ────────────────────────────────────────────────
# Install dependencies and build the Next.js app in standalone mode.
FROM node:22-bookworm AS builder

WORKDIR /app

# Copy package files and npm config first (Docker caches this layer if they don't change)
COPY package.json package-lock.json* .npmrc ./

RUN curl -I https://registry.npmjs.org/

# Install ALL dependencies (including devDependencies for the build)
RUN npm ci --ignore-scripts --verbose

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