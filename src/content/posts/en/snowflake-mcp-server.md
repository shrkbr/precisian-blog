---
title: "Snowflake MCP server: what the agent sees and what still needs a semantic layer"
description: "The Snowflake-managed MCP server exposes only the tools you declare. Answer quality still depends on a semantic view your team writes and maintains."
slug: "snowflake-mcp-server"
lang: "en"
translationKey: "snowflake-mcp"
publishedAt: 2026-11-03
tags: ["mcp", "semantic-layer", "data-warehouse", "text-to-sql", "ai-data-access", "governance", "metric-hallucination"]
draft: false
llmSummary: "Snowflake's managed MCP server (GA November 4, 2025) exposes six tool types, including CORTEX_ANALYST_MESSAGE and SYSTEM_EXECUTE_SQL, gated by the session's DEFAULT_ROLE. Cortex Analyst answers only what a customer-built semantic view defines; data outside Snowflake stays invisible."
citations: ["https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents-mcp", "https://docs.snowflake.com/en/release-notes/2025/other/2025-11-04-cortex-agents-mcp", "https://docs.snowflake.com/en/release-notes/2025/other/2025-10-02-mcp-server", "https://docs.snowflake.com/en/release-notes/2026/other/2026-07-22-mcp-external-oauth", "https://docs.snowflake.com/en/release-notes/bcr-bundles/un-bundled/bcr-2405", "https://github.com/Snowflake-Labs/mcp", "https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst", "https://docs.snowflake.com/en/user-guide/views-semantic/overview", "https://docs.snowflake.com/en/user-guide/views-semantic/querying", "https://docs.snowflake.com/en/user-guide/views-semantic/autopilot", "https://docs.snowflake.com/en/user-guide/data-integration/openflow/connectors/about-openflow-connectors"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://en.wikipedia.org/wiki/Snowflake_Inc.", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

The Snowflake-managed MCP server shows an AI agent only the tools you list in one `CREATE MCP SERVER` statement, and each tool runs under the role of the person who connected. Snowflake's documentation, read November 3, 2026, lists six tool types, from `CORTEX_ANALYST_MESSAGE` to raw `SYSTEM_EXECUTE_SQL` ([Snowflake](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents-mcp)). The server reached general availability on November 4, 2025. Whether the agent's revenue number is right still depends on a semantic view your team writes, tests and keeps current.

> **Snowflake-managed MCP server**: a schema-level object, created with SQL, that implements the Model Context Protocol inside your Snowflake account and exposes Cortex Analyst, Cortex Search, Cortex Agents, SQL execution and custom functions as tools to clients such as Claude, ChatGPT or Cursor, under Snowflake role-based access control.

## What does the failure look like?

You add Snowflake as a connector in Claude, sign in through OAuth, and ask "what was net revenue last quarter, by channel?" The agent comes back with a table, a total and a confident paragraph. Then three things happen over the next two weeks:

- **Finance closes the quarter and the totals differ.** The agent's figure includes orders that were later refunded, because the semantic view's `net_revenue` metric sums order totals and the refunds table was never added as a related logical table.
- **Someone else asks the same question and gets another number.** Their `DEFAULT_ROLE` can see a different set of tools, or the server they connected to exposes `SYSTEM_EXECUTE_SQL`, so the model wrote its own SQL against raw tables instead of going through the semantic view.
- **Amazon is missing.** Marketplace orders live in a spreadsheet or a separate tool and never landed in Snowflake. No tool on the server can see them.

The server did nothing wrong in any of these cases. It returned what the configuration allowed, with no field telling the agent which definition produced the number.

## What is the Snowflake-managed MCP server, and what does it expose?

It is Snowflake's own MCP implementation, hosted inside your account, with no infrastructure to run. Snowflake announced it in preview on [October 2, 2025](https://docs.snowflake.com/en/release-notes/2025/other/2025-10-02-mcp-server) and in general availability on [November 4, 2025](https://docs.snowflake.com/en/release-notes/2025/other/2025-11-04-cortex-agents-mcp). External OAuth (Okta, Microsoft Entra ID) and configurable scopes became generally available on [July 22, 2026](https://docs.snowflake.com/en/release-notes/2026/other/2026-07-22-mcp-external-oauth). Since August 20, 2026, `tools/call` responses arrive as a Server-Sent Events stream, so clients must send `Accept: application/json, text/event-stream` ([Snowflake](https://docs.snowflake.com/en/release-notes/bcr-bundles/un-bundled/bcr-2405)).

If you found the community repository first, note its status. `Snowflake-Labs/mcp` now opens with "This project is deprecated and no longer maintained" and points to the managed server; its last release, v1.4.2 on May 15, 2026, only bumped dependencies to resolve CVEs ([GitHub](https://github.com/Snowflake-Labs/mcp), checked November 3, 2026).

The managed server's tool types, from the [official documentation](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents-mcp):

| Tool type | What it gives the agent | Privilege the role needs |
|---|---|---|
| `CORTEX_AGENT_RUN` | A Cortex Agent that orchestrates Analyst, Search and custom tools | `USAGE` on the agent, plus its resources |
| `CORTEX_ANALYST_MESSAGE` | Text-to-SQL over one semantic view; "generates SQL and returns the statement to the client" | `SELECT` on the semantic view |
| `CORTEX_SEARCH_SERVICE_QUERY` | Search over unstructured text, with optional `columns` and `limit` | `USAGE` on the search service |
| `SYSTEM_EXECUTE_SQL` | Runs SQL "without Cortex Agent orchestration" | Whatever the role can already query |
| `GENERIC` | A UDF or stored procedure | `USAGE` on the function or procedure |
| `CODING_AGENT` | A coding agent with no stored agent object | not detailed on the page |

The client connects to `https://<account_url>/api/v2/databases/{database}/schemas/{schema}/mcp-servers/{name}`. The server "currently only supports tool capabilities": no resources, prompts, roots or sampling. Each server holds at most 50 tools, and generic and SQL execution responses are truncated at 250 KB ([Snowflake, Limitations](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents-mcp#limitations)).

## Why does the agent still get the number wrong?

Because MCP only decides which doors are open. The meaning of "net revenue" lives one layer down, and four mechanisms decide which meaning the agent gets.

**1. Cortex Analyst only knows what the semantic view defines.** Snowflake says Cortex Analyst "uses Semantic Views to understand your data and generate accurate SQL queries" ([Snowflake](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst)). A semantic view holds logical tables, relationships, facts, dimensions and metrics. Snowflake's own example: net revenue defined once as `SUM(gross_revenue * (1 - discount))` instead of "dozens of inconsistent calculations" across reports ([Snowflake](https://docs.snowflake.com/en/user-guide/views-semantic/overview)). That is a real semantic layer, and it is the right design. It also means a refund, a cancelled order or a marketplace fee that is missing from the view is missing from every answer.

**2. A directly exposed Analyst tool hands back SQL, not the answer.** Per the documentation, `CORTEX_ANALYST_MESSAGE` returns the generated statement to the client. Something still has to run it, and in many setups that something is `SYSTEM_EXECUTE_SQL` on the same server. Once raw SQL execution is available, the model can skip the semantic view and write its own joins against physical tables. Snowflake's migration steps say to "remove direct SQL execution from that server unless the client requires it."

**3. The role is the user's default role, not the one you planned.** Some clients, Claude included, "don't support specifying a role in the OAuth scope and request `session:role:all`," so "the session uses the user's `DEFAULT_ROLE`" ([Snowflake](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents-mcp)). Two analysts with different default roles see different tools and different tables through the same URL. Snowflake's advice is to set each user's `DEFAULT_ROLE` to the MCP access role, or to run separate servers per access level.

**4. Data outside Snowflake doesn't exist for the server.** Cortex Analyst answers about "structured data in Snowflake." Loading data is a separate product: Openflow lists connectors for Shopify, Google Ads, Meta Ads, Amazon Ads and LinkedIn Ads, among others ([Snowflake](https://docs.snowflake.com/en/user-guide/data-integration/openflow/connectors/about-openflow-connectors), checked November 3, 2026). Anything you haven't piped in and modeled stays invisible.

The general version of this problem, where a model writes valid SQL that answers a different question, is covered in [governed text-to-SQL](https://precisian.io/blog/en/posts/governed-text-to-sql/).

## How do you check what your agent can actually see?

Run these as the role your users connect with, not as `ACCOUNTADMIN`.

| Check | Command or place | What signals a problem |
|---|---|---|
| Tools on the server | `DESCRIBE MCP SERVER <name>;` and read `server_spec` | `SYSTEM_EXECUTE_SQL` listed next to `CORTEX_ANALYST_MESSAGE` |
| Effective role | `SHOW USERS` → `default_role` for each MCP user | Different default roles across people asking the same questions |
| What the role can read | `SHOW GRANTS TO ROLE <mcp_access_role>;` | `SELECT` on raw tables the semantic view was meant to hide |
| Metrics defined in the view | [`SHOW SEMANTIC METRICS`](https://docs.snowflake.com/en/user-guide/views-semantic/overview) on the view | No metric for refunds, cancellations or marketplace revenue |
| Missing data | Table list behind the semantic view vs. your sales channels | A channel finance counts that no logical table covers |
| Analyst usage and cost | `SNOWFLAKE.ACCOUNT_USAGE.CORTEX_ANALYST_USAGE_HISTORY` | Heavy use with no evaluation run behind it |

Then do the test that matters: pick ten questions finance has already answered for a closed month, ask them through the MCP connection, and compare. Snowflake supports this pattern with verified queries and [Cortex Analyst evaluations](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst), which run your verified questions and measure how accurately the SQL comes back.

## How do you fix it?

Most of the fix is configuration Snowflake already documents, plus modeling work only your team can do.

**Expose one governed agent, not a toolbox.** Snowflake recommends "exposing a Cortex Agent as the client-facing MCP tool," configured with the Analyst and Search resources it needs. The external client gets one interface; the agent picks the resource. Drop `SYSTEM_EXECUTE_SQL` unless someone needs it, and if they do, put it on a separate server with its own role.

**Lock the role down.** Keep `OAUTH_USE_SECONDARY_ROLES = NONE`, restrict `ALLOWED_ROLES_LIST` to the MCP access role, and set `DEFAULT_ROLE` and `DEFAULT_WAREHOUSE` on every MCP user, exactly as the documentation shows. Grant `SELECT` on the semantic view instead of the tables: querying a semantic view "you don't need the SELECT privilege on the tables used in the semantic view" ([Snowflake](https://docs.snowflake.com/en/user-guide/views-semantic/querying)). For the inventory side of this, see [who has access to what](https://precisian.io/blog/en/posts/ai-agent-mcp-permissions-inventory/).

**Write the definitions finance signs off on.** Semantic View Autopilot can draft the view from a description, a YAML file, or a Tableau or Power BI file ([Snowflake](https://docs.snowflake.com/en/user-guide/views-semantic/autopilot)). The draft still leaves the decisions to you: someone has to decide whether net revenue subtracts refunds by order date or refund date, whether shipping counts, and which table is the source of truth for Amazon. [What goes into a semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/) lists those choices.

**Keep the definition history yourself.** The semantic view overview describes creating, altering and sharing views; it doesn't describe a version history of past definitions. Store the `CREATE SEMANTIC VIEW` DDL in git so you can answer "which definition produced last month's number?"

## When can't it be fixed?

In four cases, and none of them is a Snowflake defect.

**Revenue that never reaches Snowflake.** If Amazon, wholesale or the phone order live elsewhere, no grant or tool brings them in. Here is a round-number example, synthetic, for a Shopify brand that also sells on Amazon, for one quarter:

| Reading | Revenue | Does the agent see it? |
|---|---|---|
| Shopify orders in the semantic view | $900,000 | yes |
| Refunds not modeled as a related table | − $54,000 | no |
| Amazon orders not loaded into Snowflake | $310,000 | no |
| Revenue finance recognizes | $1,156,000 | no |

In this made-up example, the agent answers $900,000 with the same tone it would use for $1,156,000. The numbers are illustrative; your gap only shows up when you measure it.

**Two teams that disagree on the definition.** A semantic view writes down one definition. If marketing and finance haven't agreed which one, the view encodes the disagreement. No Snowflake setting resolves that; the agreement has to come first, as described in [marketing and finance revenue definitions](https://precisian.io/blog/en/posts/marketing-finance-revenue-definition/).

**Cost you can't cap from the client.** Cortex Analyst is billed "based on the number of messages processed," counting only HTTP 200 responses, and "additional warehouse costs apply when you execute the SQL" ([Snowflake](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst)). Agent tool responses can reach "200 KB or more," and Snowflake caps recursive agent calls at 10. Guardrails belong on the warehouse, as in [query cost guardrails](https://precisian.io/blog/en/posts/query-cost-guardrails/).

**No team to own the model.** The server is managed; the semantic view isn't. If nobody owns it, it drifts the first time a table changes.

If your data already lives in Snowflake and you have people to model it, the managed server plus semantic views is a strong setup, and you don't need another platform. Precisian fits the other case: a team without that capacity that needs Shopify, Amazon, ads and the ERP in one data lake, isolated per customer on Precisian's infrastructure, with revenue defined once, together with your team, in a semantic layer Precisian keeps running, served to the assistant you already use through MCP, API or BI. The definitions are yours and leave with you. For the same question in BigQuery, see [BigQuery MCP server](https://precisian.io/blog/en/posts/bigquery-mcp-server/).

## What does this article not cover?

It isn't an installation guide; the [Snowflake documentation](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents-mcp) has the full steps. It doesn't quote credits per Cortex Analyst message: those live in Snowflake's Service Consumption Table, a PDF this article didn't verify. It doesn't cover MCP servers shared across accounts, a limited-access feature, or Snowflake Native Apps. And it doesn't benchmark Cortex Analyst accuracy; Snowflake publishes no per-customer figure, and yours depends on your semantic view.

---

If the agent connected to Snowflake answers "revenue" and the number doesn't tie to what finance closed, the first step is listing which channels and adjustments the semantic view leaves out, month by month. [Book a conversation about your setup](https://calendar.notion.so/meet/rodrigomartucci/precisian-io). No contract commitment, and no promise of an answer in 30 minutes either.
