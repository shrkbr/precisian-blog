---
title: "BigQuery MCP server: what an AI agent can query, and the guardrails it needs"
description: "Google's BigQuery MCP server gives an agent 9 tools, SQL on raw tables and up to 3,000 rows. It has no per-query byte cap and no metric definitions."
slug: "bigquery-mcp-server"
lang: "en"
translationKey: "bigquery-mcp"
publishedAt: 2026-11-03
tags: ["mcp", "data-warehouse", "cost", "governance", "ai-data-access", "metric-hallucination", "ga4"]
draft: false
llmSummary: "Google's remote BigQuery MCP server (bigquery.googleapis.com/mcp) exposes 9 tools, including execute_sql_readonly and execute_sql, with a 3-minute and 3,000-row limit. Its input schema has no maximumBytesBilled; MCP Toolbox for Databases has one, defaulting to 0 (no cap)."
citations: ["https://docs.cloud.google.com/bigquery/docs/use-bigquery-mcp", "https://docs.cloud.google.com/bigquery/docs/reference/mcp", "https://docs.cloud.google.com/bigquery/docs/reference/mcp/tools_list/execute_sql_readonly", "https://docs.cloud.google.com/bigquery/docs/pre-built-tools-with-mcp-toolbox", "https://github.com/googleapis/mcp-toolbox", "https://github.com/googleapis/mcp-toolbox/blob/main/docs/en/integrations/bigquery/source.md", "https://github.com/googleapis/mcp-toolbox/blob/main/internal/prebuiltconfigs/tools/bigquery.yaml", "https://cloud.google.com/bigquery/pricing", "https://docs.cloud.google.com/bigquery/docs/custom-quotas", "https://support.google.com/analytics/answer/7029846"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://en.wikipedia.org/wiki/BigQuery", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 9
cta: demo
updatedAt: 2026-11-08
---
The BigQuery MCP server lets an AI agent list datasets, read table schemas and run SQL in your Google Cloud project, but it has no idea what any column means to your business. Google's remote server at `https://bigquery.googleapis.com/mcp` exposes nine tools, cancels queries after three minutes and returns at most 3,000 rows ([Google Cloud](https://docs.cloud.google.com/bigquery/docs/use-bigquery-mcp), page updated October 29, 2026). Its SQL tool accepts no per-query byte cap, and the agent rewrites the definition of "revenue" every time someone asks.

> **BigQuery MCP server**: a server that implements the Model Context Protocol on top of the BigQuery API, giving a language model tools to discover metadata and run GoogleSQL in a Google Cloud project, under the IAM permissions of whatever identity the agent uses.

## What does the failure look like?

You connect BigQuery to Claude or Gemini, ask "what was revenue yesterday?", and get a number in ten seconds. The agent found your GA4 export dataset, read the schema, wrote a `SUM` over `ecommerce.purchase_revenue` and answered. As SQL, the query is fine.

The trouble shows up in three places:

- **Tomorrow the number changes.** The agent read a daily table GA4 hasn't finished filling.
- **It doesn't tie to finance.** The sum includes canceled orders, a duplicated purchase and test transactions, and it leaves out Amazon and every refund processed in Shopify after the purchase event fired.
- **The Google Cloud bill climbs.** Each question became a scan across every `events_*` table, and nobody saw the size first.

None of this is a server bug. The server does what it promises: it gives the agent access to the table. What the table means was never part of the deal.

## What are Google's official options?

There are two, and they don't ship the same guardrails.

**1. The remote (managed) server.** It runs on Google's infrastructure, is enabled along with the BigQuery API, and uses OAuth 2.0 with IAM. The docs require three roles: MCP Tool User (`mcp.tools.call`), BigQuery Job User (`bigquery.jobs.create`) and BigQuery Data Viewer (`bigquery.tables.getData`), and recommend creating "a separate identity for agents" ([Google Cloud](https://docs.cloud.google.com/bigquery/docs/use-bigquery-mcp)).

**2. MCP Toolbox for Databases (local, open source).** The repository used to be `googleapis/genai-toolbox`; it now redirects to `googleapis/mcp-toolbox`, Apache 2.0, with v1.15.0 released October 23, 2026 ([GitHub](https://github.com/googleapis/mcp-toolbox)). Google points to it when you need a custom tool over parameterized SQL or can't enable the remote server. The prebuilt config starts with `--prebuilt bigquery` ([Google Cloud](https://docs.cloud.google.com/bigquery/docs/pre-built-tools-with-mcp-toolbox), updated October 27, 2026).

Tools in each, checked November 3, 2026:

| Tool | Remote server | Toolbox (`--prebuilt bigquery`) |
|---|---|---|
| `list_dataset_ids`, `list_table_ids` | yes | yes |
| `get_dataset_info`, `get_table_info` | yes | yes |
| `execute_sql_readonly` (`SELECT` only) | yes | no |
| `execute_sql` (DML and DDL allowed) | yes | yes |
| `get_query_results`, `get_job`, `cancel_job` | yes | no |
| `search_catalog`, `forecast`, `analyze_contribution`, `ask_data_insights` | no | yes |

Sources: [BigQuery MCP reference](https://docs.cloud.google.com/bigquery/docs/reference/mcp) (updated October 15, 2026) and the Toolbox [`bigquery.yaml`](https://github.com/googleapis/mcp-toolbox/blob/main/internal/prebuiltconfigs/tools/bigquery.yaml).

On the remote server, `execute_sql` is the only tool that isn't read-only, and Google documents an IAM deny policy to block it. Every query the server runs carries the job label `goog-mcp-server: true`.

## What is left out of the BigQuery MCP server?

The [documentation](https://docs.cloud.google.com/bigquery/docs/use-bigquery-mcp#limitations) lists the remote server's limits as of October 29, 2026:

- `execute_sql` and `execute_sql_readonly` can't query Google Drive external tables.
- Queries running longer than three minutes are automatically canceled.
- Results are capped at 3,000 rows ([Google Cloud](https://docs.cloud.google.com/bigquery/docs/use-bigquery-mcp#limitations)).
- `execute_sql_readonly` rejects DML, DDL, Python UDFs and Graph Query Language.

One limit isn't on that list. The [input schema for `execute_sql_readonly`](https://docs.cloud.google.com/bigquery/docs/reference/mcp/tools_list/execute_sql_readonly) accepts `projectId`, `query`, `dryRun`, `labels`, `jobTimeoutMs` and `timeoutMs`. There is no `maximumBytesBilled`. BigQuery's most direct cost control, the byte cap that fails a query before it bills, doesn't pass through the tool. What comes back is the cost after the fact: the output includes `totalBytesProcessed` and `totalBytesBilled`.

Toolbox has the cap, switched off. Its `bigquery` source accepts `maximumBytesBilled` ("queries that exceed this limit fail before executing"), `allowedDatasets`, and a `writeMode` of `allowed`, `blocked` or `protected` ([source docs](https://github.com/googleapis/mcp-toolbox/blob/main/docs/en/integrations/bigquery/source.md)). In the prebuilt config, `maximumBytesBilled` defaults to 0, meaning no cap, `writeMode` defaults to `allowed`, and results are trimmed to 50 rows.

Neither option carries the metric definition. `get_table_info` returns the schema and each column's description, if someone wrote one. If nobody did, the agent infers meaning from the column name.

## Why do raw tables produce wrong numbers?

Because the agent reads data as it was written, and the GA4 export writes events, not sales. Google documents four details that change the answer ([Google Analytics](https://support.google.com/analytics/answer/7029846)):

1. **Yesterday's table isn't final.** GA4 keeps updating `events_YYYYMMDD` daily tables with late events "for up to three days".
2. **Revenue and refunds are separate events.** `ecommerce.purchase_revenue` is populated on purchase events only; `ecommerce.refund_value`, on refund events only. Summing the first without subtracting the second gives gross revenue.
3. **Currency has two columns.** `purchase_revenue` is local currency, `purchase_revenue_in_usd` is dollars. For a US store they match; add a Canadian storefront and the agent picks one by name.
4. **Duplicates hinge on `ecommerce.transaction_id`.** If the thank-you page fires `purchase` twice, the sum counts it twice unless the query dedupes.

Every question makes the agent re-decide all four. Pick differently on Monday and Thursday and you get two queries that are both valid SQL and mutually inconsistent. That is [metric hallucination](https://precisian.io/blog/en/posts/metric-hallucination/): the model doesn't invent data, it invents the definition.

Cost follows the same logic. On-demand, BigQuery charges $6.25 per TiB processed in `us-central1`, with the first TiB each month not billed, a 10 MB minimum per referenced table, and billing on columns read "even if you set an explicit LIMIT" ([BigQuery pricing](https://cloud.google.com/bigquery/pricing), updated October 15, 2026). The default `QueryUsagePerDay` quota is 200 TiB per project per day, and `QueryUsagePerUserPerDay` is unlimited by default ([custom quotas](https://docs.cloud.google.com/bigquery/docs/custom-quotas)). Multiply the two pages and the default ceiling allows up to $1,250 a day in query charges on one `us-central1` project.

## How do you audit what the agent already ran?

By label. Every MCP query carries `goog-mcp-server: true`, so you can isolate them in the region's `INFORMATION_SCHEMA.JOBS` view:

```sql
SELECT
  DATE(creation_time) AS day,
  user_email,
  COUNT(*) AS queries,
  ROUND(SUM(total_bytes_billed) / POW(2, 8 * 5), 3) AS tib_billed  -- 2^40 bytes = 1 TiB
FROM `region-us`.INFORMATION_SCHEMA.JOBS
WHERE EXISTS (
  SELECT 1 FROM UNNEST(labels) l
  WHERE l.key = 'goog-mcp-server' AND l.value = 'true')
  AND creation_time >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
GROUP BY day, user_email
ORDER BY tib_billed DESC;
```

Then the checklist:

| Check | Where to look | What signals a problem |
|---|---|---|
| Who the agent is | `user_email` in the query above | A person's account instead of a dedicated identity |
| Write tool exposed | IAM deny policies | `execute_sql` available to a read-only agent |
| Daily cap per user | Quotas: "Query usage per day per user" | Unlimited (the default) |
| Scans without a date filter | Query text in `INFORMATION_SCHEMA.JOBS` | `events_*` with no `_TABLE_SUFFIX` |
| Undocumented columns | `get_table_info` output | Revenue field with no `description` |
| Same question, different answer | Ask it on two different days | Refund or currency handling switched |

## What guardrails should you put in place?

In order of payoff per hour of work:

**1. A dedicated, read-only identity.** Create a service account for the agent, grant BigQuery Data Viewer only on the datasets it needs, and apply the deny policy that blocks read-write MCP tools. That removes `execute_sql` and leaves `execute_sql_readonly`.

**2. A daily byte cap.** Since the remote server doesn't accept `maximumBytesBilled`, the brake is the quota: set `QueryUsagePerUserPerDay` for the agent's identity. Past the limit, BigQuery returns `quotaExceeded` and the agent is done until midnight Pacific. On Toolbox, set `maximumBytesBilled` and `allowedDatasets`, and switch `writeMode` to `blocked`. The full cost argument is in [query cost guardrails](https://precisian.io/blog/en/posts/query-cost-guardrails/).

**3. Ask for `dryRun` before big queries.** The parameter exists on the remote server and returns the bytes a query would process without running it. A system instruction like "above 50 GB, show the estimate and ask first" prevents most surprises.

**4. Get the agent off raw tables.** The first three steps cap the bill; this one fixes the number. Instead of `events_*`, the agent queries a view or table where revenue is already defined: gross or net, with or without shipping, deduped on `transaction_id`, with the three-day window settled. That is what a semantic layer does, and [what goes into one](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/) is a short list. Why letting the model write the whole query is the riskier path is in [governed text-to-SQL](https://precisian.io/blog/en/posts/governed-text-to-sql/).

## When can't this be fixed?

In three cases.

**Sales that never reached BigQuery don't exist to the agent.** The server reads the project. If Amazon orders, phone orders and Shopify refunds were never loaded there, no tool brings them in. It's the same limit as the [Google Analytics MCP server](https://precisian.io/blog/en/posts/google-analytics-mcp-limits/), one layer down.

**A per-query cap on the remote server.** There is no parameter for it today. The daily quota limits cumulative damage, not the first big query of the day.

**Results above 3,000 rows.** The agent can page with [`get_query_results`](https://docs.cloud.google.com/bigquery/docs/reference/mcp), but each page lands in the model's context. A question that needs thousands of rows to answer should be aggregated in the warehouse, not in the chat.

A synthetic example with round numbers, to size it:

| Scenario (synthetic) | Value |
|---|---|
| Size of a year of `events_*` tables | 2 TiB |
| Bytes read per question with no date filter (revenue and date columns only) | 0.2 TiB |
| Questions per day across the team | 40 |
| TiB per month (22 business days) | 176 |
| Cost in `us-central1`, after the first unbilled TiB | $1,093.75 |

Filter `_TABLE_SUFFIX` to the last month and the same routine reads roughly a twelfth of that. These numbers are illustrative; yours come out of the audit query above.

For some teams, the BigQuery MCP server is enough. If your team already maintains modeled views in BigQuery, with revenue defined and every source loaded there, the remote server with a read-only identity and a quota does the job, and you don't need another platform. Precisian fits when sales data is spread across GA4, Shopify, ERP and ad platforms and nobody owns those definitions: it brings the sources into a data lake isolated per customer, on Precisian's infrastructure, writes the revenue definition once in a semantic layer, and serves it to your agent over MCP, API or BI.

## What does this article not cover?

It isn't an install guide: per-client setup lives in [Google's documentation](https://docs.cloud.google.com/bigquery/docs/use-bigquery-mcp) and changes with the protocol version. It doesn't cover the Google Cloud CLI MCP server (`run_bq_command`), which reaches scheduling and reservations. It doesn't compare on-demand pricing with capacity (slot) pricing. And it doesn't go into Model Armor, the optional prompt and response filter that, with logging on, records the full payload of each call.

---

If the agent connected to BigQuery answers "revenue yesterday" and the number moves by Wednesday, the first step is to compare the GA4 export total with booked orders in Shopify, day by day, with refunds and Amazon included. [Watch a governed MCP answer](https://precisian.io/en/demo?utm_source=blog&utm_medium=cta&utm_campaign=bigquery-mcp-server&utm_content=texto) over an isolated lake, with no contract commitment.
