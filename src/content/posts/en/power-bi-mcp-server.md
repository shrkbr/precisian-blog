---
title: "Power BI MCP server: what an AI agent can query and change in a semantic model"
description: "Microsoft documents two Power BI MCP servers: one reads and runs DAX, the other creates and edits measures. Both repeat whatever DAX the model already holds."
slug: "power-bi-mcp-server"
lang: "en"
translationKey: "power-bi-mcp-server"
publishedAt: 2026-11-11
tags: ["mcp", "semantic-layer", "ai-data-access", "metric-hallucination", "governance", "security", "ecommerce"]
draft: false
llmSummary: "Microsoft documents two Power BI MCP servers: Fabric IQ MCP, read-only, which runs DAX under the signed-in user's permissions, and the Power BI Authoring MCP server, which creates and edits measures with Write permission. Both read the semantic model as it is, wrong measures included."
citations: ["https://learn.microsoft.com/en-us/power-bi/developer/mcp/mcp-servers-overview", "https://learn.microsoft.com/en-us/power-bi/developer/mcp/power-bi-authoring-mcp", "https://learn.microsoft.com/en-us/power-bi/developer/mcp/remote-mcp-server-get-started", "https://learn.microsoft.com/en-us/fabric/iq/connectors/fabric-iq-mcp", "https://github.com/microsoft/powerbi-modeling-mcp", "https://www.npmjs.com/package/@microsoft/powerbi-modeling-mcp", "https://learn.microsoft.com/en-us/power-bi/create-reports/copilot-prepare-data-ai"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://en.wikipedia.org/wiki/Microsoft_Power_BI", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
cta: demo
---
A Power BI MCP server lets an AI agent query a semantic model in DAX and, through a second server, create and edit its measures, tables and relationships. Microsoft's overview, last updated September 24, 2026, splits the two jobs: the **Power BI Authoring MCP server** builds and changes models, and **Fabric IQ** answers questions against them ([Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/developer/mcp/mcp-servers-overview)). Neither one checks whether your `Revenue` measure is right. The agent repeats the DAX it finds.

> **Power BI MCP server**: one of Microsoft's servers that implement the Model Context Protocol on top of Power BI semantic models. One only reads and runs DAX queries under the signed-in user's permissions; the other also writes to the model when that user has Write permission.

## Which MCP servers does Microsoft offer for Power BI?

Two current ones, plus an older endpoint kept for existing integrations, and the names changed along the way. If you read about a "remote server" and a "modeling server" earlier this year, the labels are different now. The table below reflects the official [Power BI MCP documentation](https://learn.microsoft.com/en-us/power-bi/developer/mcp/) as read on November 11, 2026.

| Server | Job | Endpoint or package | Status | Writes to the model? |
|---|---|---|---|---|
| Fabric IQ MCP | Consumption: find reports, read schema, run DAX | `https://fabriciq.svc.cloud.microsoft/v1/mcp/fabriciq` | generally available | no |
| Power BI Authoring MCP, hosted | Authoring models in Fabric workspaces | `https://api.fabric.microsoft.com/v1/mcp/powerbi/authoring` | preview | yes |
| Power BI Authoring MCP, local | Authoring in Power BI Desktop, PBIP files and Fabric | `@microsoft/powerbi-modeling-mcp` (npm) | generally available | yes |
| Power BI Consumption MCP (earlier) | Natural-language querying | `https://api.fabric.microsoft.com/v1/mcp/powerbi` | preview, kept for existing integrations | no |

Sources: [overview](https://learn.microsoft.com/en-us/power-bi/developer/mcp/mcp-servers-overview) (September 24, 2026), [Authoring MCP](https://learn.microsoft.com/en-us/power-bi/developer/mcp/power-bi-authoring-mcp) (September 17, 2026), [Fabric IQ MCP](https://learn.microsoft.com/en-us/fabric/iq/connectors/fabric-iq-mcp) (November 10, 2026) and [Consumption MCP](https://learn.microsoft.com/en-us/power-bi/developer/mcp/remote-mcp-server-get-started) (September 17, 2026).

Microsoft tells you not to mix the roles: "Don't use the Power BI Authoring MCP server for consumption scenarios." It can run DAX to validate a model you're building, "but it isn't designed to answer business questions for end users" ([Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/developer/mcp/mcp-servers-overview)).

The local server lives in the `microsoft/powerbi-modeling-mcp` repository, created in October 2025, MIT-licensed, with a EULA that, in the npm package, blocks every other tool call until you accept it ([GitHub](https://github.com/microsoft/powerbi-modeling-mcp)). Version 1.0.0 of the npm package shipped September 25, 2026, and 1.0.1 on November 6, 2026 ([npm](https://www.npmjs.com/package/@microsoft/powerbi-modeling-mcp)).

## What does the failure look like?

Your BI team points Copilot, Claude or another MCP client at the sales semantic model and asks, "What was October revenue by channel?" The agent finds the model, reads the schema, writes DAX, runs it and returns a clean table. Someone opens the Power BI report and sees the same figure. Looks done.

The trouble shows up in three places:

- **Finance closes a different number.** The `Revenue` measure sums gross order value from Shopify, before refunds and chargebacks. The report always showed that figure; now the agent states it too, in a confident sentence.
- **The agent skips the measure.** To answer "revenue by channel," it writes its own `SUM` over a column in the orders table, and the logic that lived in the measure (excluding test orders, converting Canadian dollars) drops out.
- **The agent edits the measure.** With the authoring server and Write permission, a request like "fix revenue so it excludes shipping" becomes a model change that every report now reads.

In all three cases the server behaved as documented. The error sits in the definition, or in the lack of one.

## Why does it happen?

Four reasons, each written down in Microsoft's documentation.

**1. The agent writes the DAX; the server only runs it.** The Fabric IQ page says it "doesn't expose a natural-language answering tool" and that "the calling AI agent selects and combines the tools, composes DAX queries, and explains the results" ([Microsoft Learn](https://learn.microsoft.com/en-us/fabric/iq/connectors/fabric-iq-mcp)). The tools are `DiscoverArtifacts`, `ResolveFabricItem`, `GetReportMetadata`, `GetSemanticModelSchema`, `ValueSearch` and `ExecuteQuery`. A DAX query can call `[Revenue]` or define its own `SUM`; the language model makes that choice.

**2. A wrong measure reads as a right one.** The schema the agent receives lists tables, columns, measures and relationships. If `Revenue` was written without netting out refunds, the agent has no way to know. It's the same [metric hallucination](https://precisian.io/blog/en/posts/metric-hallucination/) you get on top of a warehouse: a fluent answer built on a definition nobody wrote down properly.

**3. The authoring server writes by default.** On the local server, the `--readwrite` option is on by default and asks for confirmation before applying an edit, "once per database"; the safe mode is `--readonly` ([README](https://github.com/microsoft/powerbi-modeling-mcp)). After that first confirmation, further edits to the same model don't ask again. The `measure_operations` tool creates, updates, deletes and moves measures.

**4. Permissions belong to the user, not the agent.** "MCP clients invoke operations with the signed-in user's Fabric role-based access control (RBAC) permissions. An autonomous or misconfigured client might perform destructive actions" ([Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/developer/mcp/mcp-servers-overview)). Whoever holds Write on the model hands the agent that same Write.

A fifth point isn't a bug, but it matters for governance. Microsoft writes that "an MCP server doesn't expand data access, but it does move data." Metadata and query results go to the MCP client, and from there to your LLM provider ([Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/developer/mcp/mcp-servers-overview)).

## How do you diagnose it in your own tenant?

Six checks, doable in an afternoon.

| Check | Where to look | What signals a problem |
|---|---|---|
| Which DAX the agent ran | Ask the agent for the exact query it sent to `ExecuteQuery` | A `SUM` over a column where a measure already exists |
| Who connects, with what permission | Semantic model permissions in the Power BI service | Write for someone who only needed to query |
| Local server mode | The `args` in the server's registration in your MCP client | No `--readonly` |
| Tenant setting | Admin portal: "Users can use the Power BI Model Context Protocol server endpoint" | On, with no decision about who uses it |
| XMLA endpoint | Capacity settings | Read Write enabled with no owner |
| Model refresh | Semantic model refresh history | Data older than the question |

Two details from the docs matter here. First, "no tenant setting blocks you from using the local server": it connects through the XMLA endpoint, and blocking it means disabling XMLA for every tool that relies on it ([Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/developer/mcp/power-bi-authoring-mcp)). Second, on the earlier Consumption MCP, "Power BI doesn't enforce RLS when you use service principal authentication" ([Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/developer/mcp/remote-mcp-server-get-started)). Fabric IQ MCP doesn't accept service principals at all, and row-level security (RLS) and object-level security (OLS) keep applying ([Microsoft Learn](https://learn.microsoft.com/en-us/fabric/iq/connectors/fabric-iq-mcp)).

The control test is the most useful one. Pick three questions finance has already closed (net revenue for the month, shipped orders, average order value) and compare the agent's answer with the close. If the gap comes from the DAX, the query shows it. If it comes from the measure, the report is wrong too.

## How do you fix it?

**Split consumption from authoring.** People who only ask questions get Fabric IQ MCP: read-only, delegated `Item.Read.All` and `Item.Execute.All` permissions, no service principal ([Microsoft Learn](https://learn.microsoft.com/en-us/fabric/iq/connectors/fabric-iq-mcp)). The authoring server stays with whoever models, and Microsoft advises against registering the hosted and local servers at the same time, because the agent then sees two overlapping tool sets.

**Write to the model only through versioned files.** The docs recommend working in PBIP files under Git, so every agent change becomes a reviewable diff, and backing up the model first ([Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/developer/mcp/power-bi-authoring-mcp)). To explore a production model, use `--readonly`.

**Give the agent the definition, not just the schema.** Measure descriptions, AI instructions and verified answers go in through "Prep data for AI," which saves everything to the semantic model ([Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/create-reports/copilot-prepare-data-ai)). The same page warns these features "can't ensure a specific output every time." For the question that matters, tell the agent to use the measure by name and show the DAX before the number.

**Fix the measure before you plug in the agent.** If `Revenue` doesn't match the close, an MCP server just spreads the wrong figure faster. The conversation about what counts as revenue is in [marketing and finance never close the same revenue number](https://precisian.io/blog/en/posts/marketing-finance-revenue-definition/), and the permission checklist is in [the agent and MCP permission inventory](https://precisian.io/blog/en/posts/ai-agent-mcp-permissions-inventory/).

## When can't it be fixed?

In four cases, and it helps to know them before you promise the board an answer.

**The data isn't in the model.** Amazon marketplace sales, phone orders keyed into NetSuite and refunds processed after month-end exist for the agent only if someone loaded them into the semantic model. Fabric IQ says query results "are only as current as its latest successful refresh."

**The question spans models.** "Each ExecuteQuery call targets one semantic model" ([Microsoft Learn](https://learn.microsoft.com/en-us/fabric/iq/connectors/fabric-iq-mcp)). If ad spend lives in one model and orders in another, the agent joins them on its own, outside DAX.

**Your environment isn't supported.** Fabric IQ MCP isn't available in Power BI-only regions or sovereign clouds. The local authoring server doesn't run on macOS. The hosted one requires Microsoft Entra ID, which doesn't support dynamic OAuth client registration, so MCP clients that depend on it connect only through an Entra app you register yourself.

**Results have row caps.** Fabric IQ's `ExecuteQuery` returns up to 250 rows without `maxRows` ([Microsoft Learn](https://learn.microsoft.com/en-us/fabric/iq/connectors/fabric-iq-mcp)), and the authoring server's DAX tools have a hard limit of 100,000 rows ([Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/developer/mcp/power-bi-authoring-mcp)).

A round-number example, synthetic, for a Shopify store that also sells on Amazon, in one month:

| Reading | Amount | In the `Revenue` measure? |
|---|---|---|
| Shopify orders, gross value | $800,000 | yes |
| Refunded after capture | −$40,000 | no |
| Chargebacks | −$20,000 | no |
| Amazon sales | $200,000 | no (not in the model) |
| Revenue finance closes | $940,000 | no |

In this made-up example, the agent answers $800,000 with the same confidence it would answer $940,000, and the report agrees with it. The numbers are illustrative.

The Power BI MCP server isn't the wrong choice for everyone. If your semantic model already carries the definition finance accepts and the question fits in one model, Fabric IQ handles it well, no extra platform needed. My read is that the weak point in the setup is the measure, written once, by one person, inside a report file. Precisian comes in when that definition has to hold outside Power BI: GA4, Shopify, marketplaces and ad platforms in a data lake isolated per client, on Precisian's infrastructure, with the revenue rule written once in a [semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/) and delivered over MCP, API or to the BI tool you already use. How those doors differ is in [MCP server vs BI tool](https://precisian.io/blog/en/posts/mcp-server-vs-bi-tool/).

## What doesn't this article cover?

It isn't an install guide; the steps change with each release and live in Microsoft's [documentation](https://learn.microsoft.com/en-us/power-bi/developer/mcp/). It doesn't cover Fabric's broader MCP servers (lakehouses, pipelines, workspace admin). It doesn't compare third-party Power BI MCP servers. And it doesn't detail the earlier Consumption MCP's `Generate Query` tool, which runs on Copilot and requires a Copilot license.

---

If the agent wired to Power BI answers "revenue" and the number doesn't tie to finance, start by reading the measure's DAX and checking what it sums, before you debug the agent. [Watch a governed MCP answer](https://precisian.io/en/demo?utm_source=blog&utm_medium=cta&utm_campaign=power-bi-mcp-server&utm_content=texto) over an isolated lake, with no contract commitment.
