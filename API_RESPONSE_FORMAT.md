# PDF Upload API Response Format


## Expected API Response from 3rd Party

The 3rd party API should return a response in this format:

```json
{
  "result": {
    "data": {
      "responses": {
        "agent_response": {
          "actionItems": [
            {
              "text": "string - action item description",
              "status": "Not Started | In Progress | Completed | On Hold | Cancelled",
              "notes": "string - optional notes about the action item"
            }
          ],
          "highlights": [
            {
              "teamName": "string - team name",
              "initiatives": [
                {
                  "name": "string - initiative name",
                  "keyHighlights": "string - key accomplishments",
                  "rag": "Red | Amber | Green - status indicator",
                  "eta": "string - estimated completion date",
                  "raid": "string - risks, assumptions, issues, dependencies",
                  "challenges": "string - current challenges",
                  "releases": [
                    {
                      "releaseName": "string - release name",
                      "releaseDate": "string - release date"
                    }
                  ]
                }
              ]
            }
          ],
          "releases": [
            {
              "releaseName": "string - release name",
              "releaseDate": "string - release date",
              "releaseOpCo": "string - operating company or team",
              "releaseStatus": "Planned | In Progress | Released | Deferred"
            }
          ],
          "productPlan": [
            "string - URL to product plan documentation"
          ],
          "resourceDashboard": [
            "string - URL to resource dashboard"
          ],
          "learnings": [
            "string - learning or improvement item"
          ]
        }
      }
    }
  }
}
```

## Sample Complete Response

```json
{
  "result": {
    "data": {
      "responses": {
        "agent_response": {
          "actionItems": [
            {
              "text": "Complete Q1 sprint deliverables",
              "status": "In Progress",
              "notes": "On track for completion by end of week"
            },
            {
              "text": "Deploy v2.0 to staging environment",
              "status": "Not Started",
              "notes": ""
            },
            {
              "text": "Conduct security audit",
              "status": "Completed",
              "notes": "All critical vulnerabilities patched"
            }
          ],
          "highlights": [
            {
              "teamName": "Platform Engineering",
              "initiatives": [
                {
                  "name": "Infrastructure Migration",
                  "keyHighlights": "Successfully migrated 85% of workloads to cloud",
                  "rag": "Green",
                  "eta": "Mar 31, 2026",
                  "raid": "No blockers identified",
                  "challenges": "Legacy systems require custom adapters",
                  "releases": [
                    {
                      "releaseName": "Phase 1 - Compute Migration",
                      "releaseDate": "Mar 15, 2026"
                    },
                    {
                      "releaseName": "Phase 2 - Database Migration",
                      "releaseDate": "Apr 1, 2026"
                    }
                  ]
                },
                {
                  "name": "API Gateway Enhancement",
                  "keyHighlights": "Rate limiting and caching improvements implemented",
                  "rag": "Amber",
                  "eta": "Apr 10, 2026",
                  "raid": "Pending performance testing results",
                  "challenges": "Authentication integration needs review",
                  "releases": [
                    {
                      "releaseName": "v3.2 - Performance Update",
                      "releaseDate": "Apr 5, 2026"
                    }
                  ]
                }
              ]
            },
            {
              "teamName": "Frontend Development",
              "initiatives": [
                {
                  "name": "Dashboard UI Redesign",
                  "keyHighlights": "New design system implemented across 120 components",
                  "rag": "Green",
                  "eta": "Mar 20, 2026",
                  "raid": "Design approved by stakeholders",
                  "challenges": "Browser compatibility testing ongoing",
                  "releases": [
                    {
                      "releaseName": "v1.5 - New Dashboard",
                      "releaseDate": "Mar 18, 2026"
                    }
                  ]
                }
              ]
            }
          ],
          "releases": [
            {
              "releaseName": "Q1 2026 - Major Release",
              "releaseDate": "Mar 31, 2026",
              "releaseOpCo": "Technology",
              "releaseStatus": "In Progress"
            },
            {
              "releaseName": "Mobile App v4.0",
              "releaseDate": "Apr 15, 2026",
              "releaseOpCo": "Digital",
              "releaseStatus": "Planned"
            },
            {
              "releaseName": "Security Patch v2.5.1",
              "releaseDate": "Feb 27, 2026",
              "releaseOpCo": "Technology",
              "releaseStatus": "Released"
            }
          ],
          "productPlan": [
            "https://confluence.example.com/display/PRODUCT/Q1+2026+Roadmap",
            "https://jira.example.com/browse/PROD-2026",
            "https://docs.example.com/product-strategy"
          ],
          "resourceDashboard": [
            "https://resource-mgmt.example.com/dashboard",
            "https://teams.example.com/resource-allocation",
            "https://capacity-planning.example.com"
          ],
          "learnings": [
            "Automated testing reduced production incidents by 40%",
            "Cross-functional standups improved team velocity",
            "Proactive monitoring alerts prevent 90% of issues before user impact",
            "API pagination strategy improves performance by 60%"
          ]
        }
      }
    }
  }
}
```

## Data Field Descriptions

### Action Items
- **text**: Description of the action item (required)
- **status**: Current status (required)
- **notes**: Additional notes or context (optional)

### Highlights (Teams, Initiatives, Releases)
- **teamName**: Name of the team (required)
- **initiatives**: Array of initiatives under this team
  - **name**: Initiative name (required)
  - **keyHighlights**: Key accomplishments and highlights
  - **rag**: Red/Amber/Green status indicator
  - **eta**: Estimated Time of Arrival/completion
  - **raid**: Risks, Assumptions, Issues, Dependencies
  - **challenges**: Current blockers or challenges
  - **releases**: Nested releases related to this initiative

### Releases
- **releaseName**: Name of the release (required)
- **releaseDate**: Target release date
- **releaseOpCo**: Operating company or team responsible
- **releaseStatus**: Current release status

### Product Plan & Resource Dashboard
- Arrays of URLs to relevant documentation

### Learnings
- Array of strings describing lessons learned or improvements

## Integration Notes

1. The API route is located at `/api/upload-pdf` (POST method)
2. Send the PDF file as `multipart/form-data` with field name `file`
3. The server will forward it to your 3rd party API
4. Extract `result.data.responses.agent_response` from the response
5. All fields in the response are automatically populated into the data context
6. The dashboard will immediately reflect all changes

## Testing

For development, the API includes a mock response generator. You can test without a real 3rd party API by:
1. Setting invalid `THIRD_PARTY_API_URL` environment variable
2. The error will be caught and a mock response will be returned
3. This allows you to test the UI flow
