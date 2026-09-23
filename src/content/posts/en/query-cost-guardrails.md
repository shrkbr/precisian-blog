---
title: "Query cost guardrails: what an AI agent can do to your warehouse bill"
description: "An AI agent can scan your whole warehouse without breaking a rule. Adding a LIMIT does not reduce what you are billed on non-clustered tables."
slug: "query-cost-guardrails"
lang: "en"
translationKey: "query-cost-guardrails"
publishedAt: 2026-09-24
tags: ["query-cost", "ai-data-access", "semantic-layer"]
draft: false
llmSummary: "On BigQuery a LIMIT clause does not reduce bytes read on non-clustered tables; maximum_bytes_billed does, failing before charge. Databricks defaults STATEMENT_TIMEOUT to 172,800 seconds, two days. MCP readOnlyHint is a hint, not enforcement."
citations: ["https://docs.cloud.google.com/bigquery/docs/best-practices-costs", "https://docs.cloud.google.com/bigquery/docs/use-bigquery-mcp", "https://docs.snowflake.com/en/user-guide/snowflake-cortex/governance-and-availability/ai-cost-management-and-governance", "https://docs.databricks.com/aws/en/sql/language-manual/parameters/statement_timeout", "https://modelcontextprotocol.io/specification/2026-07-28/server/tools", "https://arxiv.org/abs/2512.22364"]
about: ["https://en.wikipedia.org/wiki/Data_warehouse", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

An AI agent querying your warehouse can cost more than a human analyst doing the same work, and the reason is not that it asks more questions. It is that nothing in the default configuration stops one query from scanning everything. Databricks ships `STATEMENT_TIMEOUT` with a system default of 172,800 seconds, which is two days ([Databricks docs](https://docs.databricks.com/aws/en/sql/language-manual/parameters/statement_timeout)). That default was written for humans who notice.

## What does an agent actually do to your bill?

It runs more queries, and it runs them without the instinct that stops a person.

A human analyst who writes a query against a 400-million-row table hesitates before hitting run. They check the partition filter. They glance at the estimate. An agent has no hesitation to lose: it produces syntactically valid SQL, submits it, reads the result, and submits the next one. Multiply that by a retry loop and the volume is structural, not occasional.

Anthropic published a measurement of the multiplier on its own systems: agents use about 4× more tokens than chat interactions, and multi-agent systems about 15× more ([Anthropic Engineering, June 2025](https://www.anthropic.com/engineering/multi-agent-research-system)). That figure is about **LLM tokens, not warehouse bytes**, and it does not translate into a compute bill. It does establish the thing that matters here: agent workloads multiply the number of operations, and every operation downstream has its own meter.

## Why doesn't adding a LIMIT fix it?

Because on most tables it does nothing at all to what you are charged for.

Google states it plainly: "For non-clustered tables, applying a LIMIT clause to a query doesn't affect the amount of data that is read" ([BigQuery cost best practices](https://docs.cloud.google.com/bigquery/docs/best-practices-costs)). The scan happens, the bill accrues, and the LIMIT trims the output afterward.

This is the single most expensive misconception in the space, and an agent is unusually likely to fall into it, because "add a LIMIT to be safe" is exactly the kind of plausible-sounding mitigation that appears in training data. The agent adds the LIMIT, reports that it constrained the query, and the invoice disagrees.

The control that works on BigQuery is `maximum_bytes_billed`, which is evaluated before execution: the engine estimates bytes first, and if the estimate exceeds the cap "the query fails without incurring a charge" ([BigQuery docs](https://docs.cloud.google.com/bigquery/docs/best-practices-costs)). Failing is the feature.

## What do the vendors' own defaults tell you?

More than any vendor blog post does. Defaults are where a platform team records what it expects to go wrong.

Google ships a documentation page specifically about managing BigQuery costs for AI data agents, and it names the risk directly: agents "built on a very large or unpartitioned table" ([Google, updated Sept 2026](https://docs.cloud.google.com/gemini/data-agents/conversational-analytics-api/manage-costs)). Its BigQuery MCP server hard-codes two defaults that no human-facing product would tolerate: queries are "automatically canceled" after three minutes, and results cap at 3,000 rows ([BigQuery MCP server docs](https://docs.cloud.google.com/bigquery/docs/use-bigquery-mcp)).

| Platform | Pre-execution cap | In-flight cap | Spend enforcement |
|---|---|---|---|
| BigQuery | `maximum_bytes_billed`, fails free | 3 min in the MCP server | Custom quotas, "approximate" by Google's own wording |
| Snowflake | none published | `STATEMENT_TIMEOUT_IN_SECONDS` | Resource monitors: NOTIFY, SUSPEND, SUSPEND_IMMEDIATE |
| Databricks | API `byte_limit` if you set it | `STATEMENT_TIMEOUT`, default 2 days | Budgets are alerting, not a cap |

The asymmetry in that table is the finding. BigQuery and Snowflake both ship a hard stop. Databricks publishes a two-day default timeout and an API-level `byte_limit` you have to set yourself ([Statement Execution API](https://docs.databricks.com/api/workspace/statementexecution/executestatement)). Connecting an agent to each of the three with default settings gives you three very different blast radii.

Two Snowflake details are worth knowing before you rely on them. Budget enforcement is periodic, and after a threshold is crossed "actions can take up to eight hours to take effect," while per-user quotas apply "within minutes" ([Snowflake AI cost governance](https://docs.snowflake.com/en/user-guide/snowflake-cortex/governance-and-availability/ai-cost-management-and-governance)). And those quotas are never pooled: the same page notes a 100-credit quota across 10 users permits up to 1,000 credits in total.

## Does read-only mode protect the budget?

It protects your data. It does nothing for your bill, and the distinction gets lost constantly.

A read-only agent cannot drop a table. It can still scan one. Cost and mutation are separate risks with separate controls, and conflating them is how teams end up feeling safe while spending.

There is a sharper trap in the MCP specification itself. Tool annotations include `readOnlyHint`, which defaults to false, and `destructiveHint`, which defaults to true. But the spec is explicit that these are hints: "they are not guaranteed to provide a faithful description of tool behavior," and clients "should never make tool use decisions based on ToolAnnotations received from untrusted servers" ([MCP spec, 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)).

`readOnlyHint` is documentation. Enforcement has to live somewhere that cannot lie about itself: IAM, database roles, and warehouse limits. The same spec requires servers to rate limit tool invocations and recommends clients implement timeouts and log usage for audit.

## Is LLM-generated SQL actually more expensive?

The honest answer is that almost nobody has measured it against a bill, and the one study that did found the field has been measuring the wrong thing.

A December 2025 preprint (not peer reviewed) ran 180 query executions from six models against a 230 GB dataset on BigQuery. Its central result: execution time correlates with query cost at **r = 0.16**, so the efficiency metrics the benchmarks use are, in the authors' words, "fundamentally decoupled from consumption-based cloud billing" ([arXiv 2512.22364](https://arxiv.org/abs/2512.22364)). At equivalent correctness, reasoning models scanned 44.5% fewer bytes than non-reasoning ones, and the spread between the best average and the worst outlier query exceeded 20×.

A peer-reviewed EuroMLSys '26 paper reaches a compatible conclusion from the other side: benchmarks "remain narrowly scoped and overlook the cost and performance implications that arise at scale," and small translation errors become substantial cost overhead as data grows ([arXiv 2602.21480](https://arxiv.org/abs/2602.21480)).

So the argument is not that models write bad SQL. Accuracy is climbing fast. It is that **cost efficiency is an independent axis, and nothing in the training objective optimizes for it.**

## Who pays when the agent is the one asking?

There is a billing question underneath the technical one, and it decides who notices the problem.

Snowflake's Cortex Analyst charges per message, and its documentation is careful to separate the two meters: the AI fee is one line, and then "additional warehouse costs apply when you execute the SQL generated by Cortex Analyst" ([Snowflake](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst)). Teams budget the first meter because it is the one with the new vendor invoice attached, and absorb the second into a warehouse line that was already large.

That is how this failure mode stays invisible for a quarter. The AI spend looks modest and predictable. The compute spend drifts up inside a number nobody attributes to the agent, because nothing in the bill says which query came from a person and which came from a model. Tagging agent traffic with its own service account, before you turn it on, is what makes the two separable later.

## How do you diagnose your exposure this week?

Four checks, none requiring new tooling.

**Read your defaults out loud.** Open the timeout and byte-limit settings for the warehouse the agent connects to and say the numbers. If your Databricks statement timeout is still 172,800 seconds, you have a two-day default ([Databricks](https://docs.databricks.com/aws/en/sql/language-manual/parameters/statement_timeout)).

**Find the unpartitioned tables the agent can reach.** Google names this as the specific risk. The list is usually shorter than feared and older than expected.

**Run your five most common agent questions and record bytes scanned, not latency.** The preprint's r = 0.16 ([arXiv 2512.22364](https://arxiv.org/abs/2512.22364)) is the reason: a fast query and a cheap query are close to unrelated.

**Check whether your quota is per-user.** If it is, multiply by your seat count to get the real ceiling.

## What can't be fixed with limits?

A cap stops a runaway query. It does not make the agent ask a better one.

An agent that scans a whole fact table because it cannot tell which column carries net revenue is not a budget problem; it is a modeling problem wearing a budget costume. Capping it converts an expensive wrong answer into a failed query, which is progress, but the question still has no cheap path to an answer.

That is where the two problems meet. Definitions written once, in a place the agent queries before it plans, shrink the search space that produces the expensive query in the first place. That is what a [semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/) does, and why cost and correctness tend to get fixed by the same work. At Precisian that layer sits over a per-client isolated lake, reached through an open API and an MCP server ([precisian.io](https://precisian.io/en)), with what is included on the [pricing page](https://precisian.io/en/pricing).

## What does this article not cover?

It does not benchmark platforms against each other on price, and it does not cover slot reservations or committed-use pricing, where the cost model differs from on-demand entirely. Google notes its agent cost tools "apply only to projects that use on-demand billing."

One deliberate omission: there is a widely circulated anecdote about a multi-agent loop running for days and burning tens of thousands of dollars. It appears only on vendor marketing pages, with no named company, no postmortem, and no methodology. It is not cited here.

There is also a real gap in the record. No Tier 1 source has published incident data on runaway agent warehouse cost. The strongest available evidence is indirect and, I would argue, sufficient: vendors do not hard-code a three-minute timeout and a 3,000-row cap against a hypothetical problem.

If an agent is about to get access to your warehouse, the first step is reading your current defaults rather than picking a tool. [Book a conversation about your case](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).
