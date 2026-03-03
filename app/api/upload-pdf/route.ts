import { NextRequest, NextResponse } from 'next/server'

/**
 * API Route: POST /api/upload-pdf
 * 
 * Handles PDF file uploads and forwards them to a 3rd party API
 * for processing. The 3rd party API should return agent responses
 * in the format: result.data.responses.agent_response
 * 
 * Expected response structure from 3rd party API:
 * {
 *   "result": {
 *     "data": {
 *       "responses": {
 *         "agent_response": { ...populated data }
 *       }
 *     }
 *   }
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64encoding = buffer.toString("base64");


    const thirdPartyFormData = new FormData()
    thirdPartyFormData.append('file', new Blob([buffer], { type: 'application/pdf' }), file.name)

    const sageRequest = {
        ai_agent_id: '69a669fedbefcfa69677b8ec',
        user_query: 'Please extract the key highlights, action items, and release information from the uploaded PDF and return it in a structured JSON format suitable for populating a delivery highlights dashboard.',
        configuration_environment: 'DEV',
        media_data: [{
            "encoded_media": base64encoding,
            "media_type": "application/pdf"
        }]
    }
    console.time('SAGE API Response Time')
    // Forward to 3rd party API
    const thirdPartyResponse = await fetch("https://sage.paastry.sysco.net/api/sysco-gen-ai-platform/agents/v1/content/generic/answer", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sageRequest)
    }).catch(err => {
      console.error('3rd party API error:', err)
      // Return mock response for development
      return new Response(JSON.stringify(mockResponse()), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    })

    const thirdPartyData = await thirdPartyResponse.json()

    // Extract agent_response from the result
    const agentResponse = thirdPartyData?.data?.responses?.agent_response
    console.log("thirdPartData: ", thirdPartyData);
    if (!agentResponse) {
      return NextResponse.json(
        { success: false, error: "Invalid response from SAGE" },
        { status: 500 }
      )
    }
    console.timeEnd('SAGE API Response Time')

    // Return the agent response in the expected format
    return NextResponse.json(
      { data: agentResponse },
      { status: 200 }
    )
  } catch (error) {
    console.error('PDF upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process PDF' },
      { status: 500 }
    )
  }
}

/**
 * Mock response for development/testing
 * This demonstrates the expected response structure
 */
function mockResponse() {
  return {
    data: {
      actionItems: [
        {
          text: 'Complete Q1 sprint deliverables',
          status: 'In Progress',
          notes: 'On track for completion by end of week'
        },
        {
          text: 'Deploy v2.0 to staging environment',
          status: 'Not Started',
          notes: ''
        },
        {
          text: 'Conduct security audit',
          status: 'Completed',
          notes: 'All critical vulnerabilities patched'
        }
      ],
      highlights: [
        {
          teamName: 'Platform Engineering',
          initiatives: [
            {
              name: 'Infrastructure Migration',
              keyHighlights: 'Successfully migrated 85% of workloads to cloud',
              rag: 'Green',
              eta: 'Mar 31, 2026',
              raid: 'No blockers identified',
              challenges: 'Legacy systems require custom adapters',
              releases: [
                {
                  releaseName: 'Phase 1 - Compute Migration',
                  releaseDate: 'Mar 15, 2026'
                },
                {
                  releaseName: 'Phase 2 - Database Migration',
                  releaseDate: 'Apr 1, 2026'
                }
              ]
            },
            {
              name: 'API Gateway Enhancement',
              keyHighlights: 'Rate limiting and caching improvements implemented',
              rag: 'Amber',
              eta: 'Apr 10, 2026',
              raid: 'Pending performance testing results',
              challenges: 'Authentication integration needs review',
              releases: [
                {
                  releaseName: 'v3.2 - Performance Update',
                  releaseDate: 'Apr 5, 2026'
                }
              ]
            }
          ]
        },
        {
          teamName: 'Frontend Development',
          initiatives: [
            {
              name: 'Dashboard UI Redesign',
              keyHighlights: 'New design system implemented across 120 components',
              rag: 'Green',
              eta: 'Mar 20, 2026',
              raid: 'Design approved by stakeholders',
              challenges: 'Browser compatibility testing ongoing',
              releases: [
                {
                  releaseName: 'v1.5 - New Dashboard',
                  releaseDate: 'Mar 18, 2026'
                }
              ]
            }
          ]
        }
      ],
      releases: [
        {
          releaseName: 'Q1 2026 - Major Release',
          releaseDate: 'Mar 31, 2026',
          releaseOpCo: 'Technology',
          releaseStatus: 'In Progress'
        },
        {
          releaseName: 'Mobile App v4.0',
          releaseDate: 'Apr 15, 2026',
          releaseOpCo: 'Digital',
          releaseStatus: 'Planned'
        },
        {
          releaseName: 'Security Patch v2.5.1',
          releaseDate: 'Feb 27, 2026',
          releaseOpCo: 'Technology',
          releaseStatus: 'Released'
        }
      ],
      productPlan: [
        'https://confluence.example.com/display/PRODUCT/Q1+2026+Roadmap',
        'https://jira.example.com/browse/PROD-2026',
        'https://docs.example.com/product-strategy'
      ],
      resourceDashboard: [
        'https://resource-mgmt.example.com/dashboard',
        'https://teams.example.com/resource-allocation',
        'https://capacity-planning.example.com'
      ],
      learnings: [
        'Automated testing reduced production incidents by 40%',
        'Cross-functional standups improved team velocity',
        'Proactive monitoring alerts prevent 90% of issues before user impact',
        'API pagination strategy improves performance by 60%'
      ]
    }
  }
}
