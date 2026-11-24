---
title: "Databricks MCP server: Genie, Unity Catalog grants, what agents see"
description: "Databricks ships managed MCP servers under system.ai, gated by Unity Catalog grants. Genie One answers from metric views; the SQL server writes by default."
slug: "databricks-mcp-server"
lang: "en"
translationKey: "databricks-mcp-server"
publishedAt: 2026-11-23
tags: ["mcp", "semantic-layer", "data-lake", "text-to-sql", "ai-data-access", "governance", "metric-hallucination"]
draft: false
llmSummary: "Databricks provides managed MCP servers in the system.ai schema, each a Unity Catalog securable called through Unity Gateway. Genie One MCP (GA) answers from Genie Ontology and metric views; the SQL MCP (Beta) permits writes by default and has no semantic context (Databricks docs, Nov 2026)."
citations: ["https://docs.databricks.com/aws/en/agents/mcp-tools/built-in-mcp-services", "https://docs.databricks.com/aws/en/agents/mcp-tools/genie-mcp", "https://docs.databricks.com/aws/en/agents/mcp-tools/databricks-sql", "https://docs.databricks.com/aws/en/agents/mcp-tools/genie-agent", "https://docs.databricks.com/aws/en/ai-gateway/govern-mcp-service", "https://docs.databricks.com/aws/en/agents/mcp-tools/authentication-networking", "https://docs.databricks.com/aws/en/genie-one/chat", "https://docs.databricks.com/aws/en/uc-semantics/metric-views", "https://docs.databricks.com/aws/en/uc-semantics/metric-views/manage", "https://docs.databricks.com/aws/en/ingestion/lakeflow-connect/saas-overview"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://en.wikipedia.org/wiki/Databricks", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
cta: demo
---
Databricks hosts its MCP servers for you: each one lives in the `system.ai` schema as a Unity Catalog securable, called through Unity Gateway, and an agent can only reach what the caller's Unity Catalog grants allow ([Databricks, read November 23, 2026](https://docs.databricks.com/aws/en/agents/mcp-tools/built-in-mcp-services)). For business questions, Databricks recommends `system.ai.genie_one_mcp`, which answers from your metric views. The SQL server, `system.ai.dbsql`, permits reads and writes by default.

> **Databricks managed MCP server**: an MCP endpoint that Databricks runs inside your workspace, at `https://<workspace-hostname>/ai-gateway/mcp-services/<mcp-name>`, exposing Genie, Databricks SQL or connected apps as tools to clients such as Claude, ChatGPT or Cursor, with access decided by Unity Catalog.

## What does the failure look like?

A typical rollout, illustrative: your data team connects Claude to Databricks over MCP. A marketing lead asks "what was net revenue by channel last month?" and gets a clean table. Over the following weeks, three things can surface:

- **Two people get two numbers.** One connected to Genie One, which routed the question to a curated Genie Agent with a revenue metric view. The other connected to the SQL server, and the model wrote its own `SUM()` over the raw `orders` table, refunds included.
- **A table changed that nobody meant to change.** The SQL server's `execute_sql` tool runs "statements that write data" unless someone turned on `disallow_writes`. An agent asked to "clean up the duplicate test orders" did exactly that.
- **Amazon revenue is missing.** Shopify and the ad platforms were piped in; the marketplace never was. No grant fixes data that isn't there.

None of this is a Databricks bug. Each server returned what its configuration allowed.

## Which MCP servers does Databricks provide?

Databricks groups them into servers it hosts under Unity Gateway, older workspace endpoints that bypass the gateway, and servers you register or build yourself. The data-facing ones, per the [Databricks-provided MCPs page](https://docs.databricks.com/aws/en/agents/mcp-tools/built-in-mcp-services) (read November 23, 2026):

| Server | Status | What the agent gets | Governance |
|---|---|---|---|
| `system.ai.genie_one_mcp` | Generally available | Natural-language questions across the workspace, answered by Genie One | Unity Gateway grants and policies, plus resource permissions |
| `system.ai.dbsql` | Beta | Runs the SQL it's given on a SQL warehouse | Unity Gateway grants and policies, plus resource permissions |
| Genie Agent (`/api/2.0/mcp/genie/{genie_space_id}`) | Public Preview | Questions scoped to one curated Genie Agent | Permissions on the Genie Agent; "calls bypass Unity Gateway" |
| AI Search and Unity Catalog functions (`/api/2.0/mcp/...`) | Public Preview | Vector search over an index, or a registered function | Resource permissions only |
| Databricks SQL, workspace endpoint (`/api/2.0/mcp/sql`) | Public Preview | The older URL for the same SQL tools | Resource permissions only; no gateway tracing, grants or policies |

Databricks also ships connectors for external apps (`system.ai.slack`, `system.ai.github`, `system.ai.google_drive` and others), where each user signs in to the provider with their own account. Those don't touch your warehouse data, so this article leaves them aside.

The Genie Beta endpoint, `https://<workspace-hostname>/api/2.0/mcp/genie`, "reaches end of life on November 30, 2026," after which requests fail. The migration is a new URL, the `ai-gateway` OAuth scope instead of `genie`, and the new permissions ([Databricks, Genie One MCP](https://docs.databricks.com/aws/en/agents/mcp-tools/genie-mcp)). Tool names don't change.

## What can each server actually query?

**Genie One** exposes five tools: `genie_ask`, `genie_poll_response`, `genie_get_query_result`, `genie_cancel_response` and `view_ask`. Answers are asynchronous: `genie_ask` returns a `conversation_id`, a `response_id` and `status: in_progress`, and the client polls until the status is `completed`, `incomplete` or `failed` ([Databricks](https://docs.databricks.com/aws/en/agents/mcp-tools/genie-mcp)). Genie resolves "business terms, metric definitions, and table relationships" through Genie Ontology, which Databricks calls "your governed semantic layer." In practice, that context is what your team curates in Unity Catalog semantics: metric views, domains and Pages ([Chat in Genie One](https://docs.databricks.com/aws/en/genie-one/chat)). When the question arrives, chat first looks for a matching Genie Agent; if none fits, it searches for relevant data assets on its own.

**Databricks SQL** exposes `execute_sql`, `execute_sql_read_only` and `poll_sql_result`. Its limitations section reads: "No semantic context. The server runs the SQL it's given. It doesn't resolve business terms, metric definitions, or table relationships, so an agent must infer them from schemas alone" ([Databricks SQL MCP](https://docs.databricks.com/aws/en/agents/mcp-tools/databricks-sql), page dated November 13, 2026). Databricks positions it for development and data engineering, not business questions.

**A Genie Agent** is "a collection of up to 50 Unity Catalog tables, views, or metric views." Its MCP server is read-only and keeps no conversation history ([Genie Agent MCP](https://docs.databricks.com/aws/en/agents/mcp-tools/genie-agent)). It is the narrowest and most predictable of the three, and it sits outside Unity Gateway.

## How do Unity Catalog permissions apply to an agent?

Two layers decide what an agent can do, and both have to line up.

**Layer 1: who may call the server.** For `system.ai.genie_one_mcp`, a caller needs `EXECUTE` on the MCP (securable type `mcp_service`), `USE CATALOG` on `system`, `USE SCHEMA` on `system.ai`, and assignment to the workspace. You can check with `databricks grants get-effective mcp_service system.ai.genie_one_mcp --principal <user>` ([Databricks](https://docs.databricks.com/aws/en/agents/mcp-tools/genie-mcp)). The governance page adds that these MCPs "can inherit a default `EXECUTE` grant on `system.ai`" ([Govern an MCP](https://docs.databricks.com/aws/en/ai-gateway/govern-mcp-service)). Restricting them starts with reviewing that broad grant.

**Layer 2: what the caller can read.** "Unity Catalog permissions are always enforced, so users and agents can only query data they're allowed to access." With on-behalf-of OAuth (U2M), the agent queries as the signed-in person. With a service principal (M2M) it queries as that principal, and a personal access token "calls the MCP as the token's owner" ([MCP authentication](https://docs.databricks.com/aws/en/agents/mcp-tools/authentication-networking)). An automation built on an admin's token inherits the admin's reach.

Metric views fit the same model. A metric view is a Unity Catalog securable, `GRANT SELECT ON orders_metric_view TO ...` is the minimum to query it, and "you must be the owner of a metric view to edit its definition" ([Manage metric views](https://docs.databricks.com/aws/en/uc-semantics/metric-views/manage)). That ownership rule is your change control on what "revenue" means.

For the general method of listing who can reach what through which agent, see [the MCP permissions inventory](https://precisian.io/blog/en/posts/ai-agent-mcp-permissions-inventory/).

## Why does the agent still get the number wrong?

Because permissions decide what the agent may touch, not what a word means. Four mechanisms account for most wrong answers.

**1. The question bypassed the semantic layer.** If the client has both Genie One and `system.ai.dbsql`, the model chooses. When it picks SQL, it is back to guessing joins from column names, which Databricks itself warns against. The broader failure is covered in [governed text-to-SQL](https://precisian.io/blog/en/posts/governed-text-to-sql/).

**2. The metric view encodes one definition, maybe not finance's.** Metric views let you "define the metric once" and query it by any dimension ([Unity Catalog metric views](https://docs.databricks.com/aws/en/uc-semantics/metric-views)). If `net_revenue` subtracts refunds by order date and finance subtracts them by refund date, Genie answers consistently and still disagrees with the close.

**3. Routing picked the wrong Genie Agent.** Genie One searches your Genie Agents for a relevant one, and Databricks lists as a limitation that "workspaces with many Genie Agents might experience reduced routing accuracy" ([Chat in Genie One](https://docs.databricks.com/aws/en/genie-one/chat)). Three overlapping revenue spaces mean three candidate answers.

**4. The data was never loaded.** Lakeflow Connect's SaaS list includes Shopify, Google Ads, Meta Ads, TikTok Ads, Google Analytics and NetSuite; read on November 23, 2026, it listed no Amazon seller connector ([Lakeflow Connect SaaS connectors](https://docs.databricks.com/aws/en/ingestion/lakeflow-connect/saas-overview)). Anything outside Unity Catalog is invisible to every server above.

## How do you check what your agent can see?

Run these as the identity your users or automations actually connect with.

| Check | Where | What signals a problem |
|---|---|---|
| Servers reachable | Unity Gateway → MCPs, or `GET /api/2.1/unity-catalog/mcp-services?parent=schemas/system.ai` | `system.ai.dbsql` available to business users |
| Who can call | `databricks grants get-effective mcp_service <name> --principal <user>` | `EXECUTE` inherited from a broad grant on `system.ai` |
| Write access | `system.ai.dbsql_policy` | `disallow_writes` not set to `true` |
| Calls outside the gateway | Client configs using `/api/2.0/mcp/...` URLs | No tracing, grants or policies on those calls |
| Identity used | OAuth flow vs. service principal vs. PAT | An admin's personal token powering a shared agent |
| Who called what | `system.ai_gateway.usage` with `service_type = 'MCP_SERVICE'`; `mcpCall` events in `system.access.audit` | Calls you can't attribute to a person or agent |

The last row comes from [Govern an MCP](https://docs.databricks.com/aws/en/ai-gateway/govern-mcp-service). The `/api/2.0/mcp/...` endpoints "don't appear in its tracing tables or support MCP-level grants, policies, or guardrails" ([Databricks](https://docs.databricks.com/aws/en/agents/mcp-tools/built-in-mcp-services)), so an audit built on the gateway's tables won't see them. More on what an agent log should hold in [MCP logging and audit trails](https://precisian.io/blog/en/posts/mcp-logging-agent-audit-log/).

Then take ten questions finance already answered for a closed month, ask them through the MCP connection, and compare line by line.

## How do you fix it?

Most of the fix is configuration Databricks documents. The rest is modeling only your team can do.

**Give business users Genie One, not SQL.** Grant `EXECUTE` on `system.ai.genie_one_mcp` to the groups that ask business questions, and keep `system.ai.dbsql` for engineers. Where the SQL server stays on, set `disallow_writes` to `true` in `system.ai.dbsql_policy`.

**Move everything behind Unity Gateway.** Migrate clients off `/api/2.0/mcp/genie` before November 30, 2026, and off `/api/2.0/mcp/sql` when the Beta fits your use. Gateway calls get grants, policies, rate limits (HTTP 429 over the per-minute cap) and usage tables. Service policies, including the Sensitive Data Detection guardrail, are themselves in Beta and need a workspace preview turned on ([Govern an MCP](https://docs.databricks.com/aws/en/ai-gateway/govern-mcp-service), read November 23, 2026).

**Write the metric views finance signs off on.** Decide whether net revenue subtracts refunds, shipping and marketplace fees, and by which date. Put that in one metric view, owned by a group with a review process. [What goes into a semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/) lists the decisions; [marketing and finance revenue definitions](https://precisian.io/blog/en/posts/marketing-finance-revenue-definition/) covers the argument you'll have first.

**Keep fewer, sharper Genie Agents.** One curated revenue agent beats three overlapping ones, given the routing limitation above.

## When can't it be fixed?

In three cases, and none is a Databricks defect.

**Revenue that never reaches Unity Catalog.** A round-number example, synthetic, for a Shopify brand that also sells on Amazon, for one quarter:

| Reading | Revenue | Does the agent see it? |
|---|---|---|
| Shopify orders in the metric view | $820,000 | yes |
| Refunds not modeled in the metric view | − $41,000 | no |
| Amazon orders never loaded | $260,000 | no |
| Revenue finance recognizes | $1,039,000 | no |

In this made-up example, Genie reports the Shopify-only figure in the same tone it would use for the total finance recognizes. The numbers are illustrative; your own gap only shows up when you measure it.

**No agreed definition.** A metric view records a decision. If marketing and finance haven't made one, the view records the disagreement.

**No one to own the model.** The servers are managed by Databricks; the metric views, Genie Agents and grants aren't. Without an owner, they drift the first time a source table changes.

If your data already lives in Databricks and you have people to model it, Genie One over curated metric views is a strong setup, and you don't need another platform. Precisian fits the other case: a team without that capacity that needs Shopify, Amazon, the ad platforms and the ERP in one data lake, isolated per customer on Precisian's infrastructure, with revenue defined once, together with your team, in a semantic layer Precisian keeps running, served to the assistant you already use through MCP, API or BI. For the same question on other warehouses, see [Snowflake MCP server](https://precisian.io/blog/en/posts/snowflake-mcp-server/) and [BigQuery MCP server](https://precisian.io/blog/en/posts/bigquery-mcp-server/).

## What does this article not cover?

It isn't an installation guide; [Databricks' MCP documentation](https://docs.databricks.com/aws/en/agents/mcp-tools/built-in-mcp-services) has the steps for each client. It doesn't quote prices. Databricks says the Genie One MCP server "uses Chat in Genie One" and points to [Genie pricing](https://www.databricks.com/product/pricing/genie), while Genie Agent MCP calls "use Databricks SQL pricing" ([Databricks, read November 23, 2026](https://docs.databricks.com/aws/en/agents/mcp-tools/genie-agent)); the rates themselves change and aren't reproduced here. It skips custom MCP servers on Databricks Apps, registered third-party servers and the Azure and GCP variants, and it doesn't benchmark Genie's accuracy, since Databricks publishes no per-customer figure.

---

If an agent on Databricks answers "revenue" and the number doesn't tie to what finance closed, start by listing which server it called and which metric view, if any, it used. [Watch a governed MCP answer](https://precisian.io/en/demo?utm_source=blog&utm_medium=cta&utm_campaign=databricks-mcp-server&utm_content=texto) over an isolated lake, with no contract commitment.
