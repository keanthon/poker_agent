---
trigger: always_on
---

# Deployment Guidelines

## Netlify Deployments
* **Use MCP by Default:** You possess the `netlify` MCP server. You MUST use these tools (e.g. `netlify-deploy-services-updater`) to interact with Netlify instead of running CLI commands like `netlify deploy`.
* **Preview by Default:** NEVER deploy directly to production using the MCP unless explicitly approved by the user. Always use preview deployments first to verify changes.
* **Cost Efficiency:** Deployment minutes are limited. Always deploy via MCP and ensure it's a preview build.
* **Explicit Go-Ahead:** Wait for the user to review the preview link and give an explicit "go ahead", "deploy to production", or similar confirmation before running the production deployment command via the MCP.