---
title: "How to log every query an AI agent makes through MCP"
description: "Write the agent audit log on the server that runs the query. MCP logging was deprecated in the 2026-07-28 spec and was never built for audit."
slug: "mcp-logging-agent-audit-log"
lang: "en"
translationKey: "agent-audit-log"
publishedAt: 2026-10-23
tags: ["audit", "mcp", "ai-data-access", "governance"]
draft: false
llmSummary: "To log every query an AI agent makes through MCP, record each tools/call on the server that executes it. The MCP spec deprecated its logging feature in revision 2026-07-28, bars personal data from log messages and only says clients SHOULD log tool usage for audit."
citations: ["https://modelcontextprotocol.io/specification/2026-07-28/server/utilities/logging", "https://modelcontextprotocol.io/specification/2025-11-25/server/utilities/logging", "https://modelcontextprotocol.io/specification/2026-07-28/deprecated", "https://modelcontextprotocol.io/specification/2026-07-28/server/tools", "https://modelcontextprotocol.io/specification/2026-07-28/basic/index", "https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/security-considerations", "https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2577", "https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/mcp.md", "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final", "https://docs.snowflake.com/en/sql-reference/account-usage/query_history", "https://docs.snowflake.com/en/sql-reference/parameters", "https://docs.cloud.google.com/bigquery/docs/information-schema-jobs"]
about: ["https://en.wikipedia.org/wiki/Audit_trail", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
---

To log every query an AI agent makes through MCP, write one record per tool call on the server that executes it, tagged with the identity of the person behind the request. Don't rely on the chat transcript or on the protocol's own logging: the Model Context Protocol deprecated its logging feature in the 2026-07-28 revision, and the spec forbids personal information in those messages ([MCP](https://modelcontextprotocol.io/specification/2026-07-28/server/utilities/logging)).

> **Agent audit log**: a record written by the layer that executes the query, one entry per tool call, that later answers who asked, through which agent, what ran, against which data, at what cost and with what outcome.

This piece is about the operational record and where it has to live. Tracing a specific number back to its definition is a related but separate problem, covered in [answer lineage](https://precisian.io/blog/en/posts/answer-lineage-audit-trail/).

## What does it look like when an agent has no audit log?

Someone asks what the agent queried last Tuesday, and it takes the team a day to admit they can't say.

The question shows up in a few predictable forms. Your VP of ecommerce wants to know where the margin figure in Monday's deck came from. Security wants to know whether the agent touched customer order data from Shopify after a contractor's access was revoked. Finance sees the Snowflake bill jump the month the team adopted an agent and wants to know how much of that was people and how much was the model.

The team opens what it has. The chat history shows the prompt and the prose answer. The warehouse history shows hundreds of queries, all from one service user. And the MCP server, if it logged anything, wrote to a terminal that closed hours ago.

All three pieces exist, and none of them connects a person to a query.

## Why doesn't MCP's built-in logging work as an audit log?

Because it was designed as a real-time debugging channel from server to client, and the spec says as much.

The mechanism is the `notifications/message` notification, which a server sends to a client with a syslog-style severity level. In the 2025-11-25 revision, clients set the level with a `logging/setLevel` request ([MCP 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/server/utilities/logging)). In 2026-07-28, the level moved into each request's `_meta`, and the server MUST NOT emit log notifications for a request that didn't ask for them ([MCP](https://modelcontextprotocol.io/specification/2026-07-28/server/utilities/logging)). Four rules take it out of the audit conversation:

1. **It's optional on both ends.** Servers MAY send; clients "MAY persist log messages". Nothing requires either.
2. **It can't carry who asked.** Log messages "MUST NOT contain" credentials or personal identifying information. An audit record without an identity fails the first question.
3. **It flows the wrong way.** Messages go to the client, which is the very software whose behavior you're trying to audit.
4. **It's on its way out.** The deprecated-features registry lists Logging as of 2026-07-28, eligible for removal in the first revision released on or after July 28, 2027, with `stderr` and OpenTelemetry as the migration path ([MCP](https://modelcontextprotocol.io/specification/2026-07-28/deprecated)). The rationale in SEP-2577, merged May 15, 2026, is one line: it overlaps with stderr and OpenTelemetry ([GitHub](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2577)).

What remains in the protocol is a recommendation. Under tool security, the spec says clients SHOULD "log tool usage for audit purposes" ([MCP](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)). That is a should, and it's addressed to the client.

OpenTelemetry, which the spec names as the replacement, has MCP semantic conventions marked "Development" and define attributes such as `mcp.method.name`, `gen_ai.tool.name` and `mcp.session.id`. None identifies the person behind a call, and tool arguments and results are opt-in, flagged as possibly sensitive ([OpenTelemetry](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/mcp.md)). They measure latency and chain calls together; who read what is left out.

| Mechanism | Who writes it | What it's missing for audit |
|---|---|---|
| Chat transcript | the agent app | the executed query, the technical identity, the cost |
| `notifications/message` | the server, if the client asks | identity (forbidden), persistence (optional), a future (deprecated) |
| Server `stderr` | the server process | structure and retention; gone with the terminal |
| OpenTelemetry MCP span | whoever instruments it | the person, the metric version, the result by default |
| Warehouse query history | the database | the person, when everything runs as one service user |
| **Record on the executing server** | **you** | **nothing, if you design it for this** |

## What should an AI agent audit log record?

A vendor-neutral starting point is control AU-3 in NIST SP 800-53 Rev. 5: an audit record has to establish what type of event occurred, when, where, its source, its outcome, and the identity of anyone associated with it ([NIST](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)). Applied to an agent's tool call, that becomes ten fields.

| Field | Example | Why it matters |
|---|---|---|
| Who asked | the person's ID from the validated token | without it, nothing else is attributable |
| Which agent | `clientInfo` sent with the request | tells the team's Claude apart from an agency's script |
| MCP tool | `revenue_by_channel` | what was requested |
| Arguments | date range, channel, filters | what was actually requested, after any clamping |
| Executed query | the SQL or the warehouse query ID | what ran, which isn't always what was asked |
| Metric definition | semantic layer version | which rule produced the number |
| Volume returned | rows and tables read | the size of the exposure |
| Response | a hash of the result, not the content | proves what left without copying the data |
| Cost | bytes scanned or warehouse time | separates people from the model on the bill |
| Outcome and time | success, error or denied; UTC timestamp | rebuilds the order of events |

Clients SHOULD send `clientInfo` on every request in 2026-07-28, but the spec notes it is self-reported, not verified by the protocol, and meant for display, logging and debugging, never for security decisions ([MCP](https://modelcontextprotocol.io/specification/2026-07-28/basic/index)). It tells agents apart; identity comes from the token. The response goes in as a hash because storing returned rows creates a second copy of customer data under weaker controls than the first.

## How do you check whether today's logs would survive an audit?

Run a reconstruction test: pick an agent answer from last week and try to get, within 15 minutes, to the person, the query and the rows read. If you can't, suspect identity first.

In Snowflake, `ACCOUNT_USAGE.QUERY_HISTORY` covers the last 365 days, records the `user_name` that issued each query and the `role_name` active in the session, and can lag by up to 45 minutes ([Snowflake](https://docs.snowflake.com/en/sql-reference/account-usage/query_history)). This shows who is querying and how much they scan:

```sql
SELECT user_name,
       role_name,
       COUNT(*) AS queries,
       SUM(bytes_scanned) AS bytes_scanned
FROM snowflake.account_usage.query_history
WHERE start_time >= DATEADD(day, -7, CURRENT_TIMESTAMP())
GROUP BY user_name, role_name
ORDER BY queries DESC;
```

On BigQuery, the same check runs against `INFORMATION_SCHEMA.JOBS`, which keeps 180 days and records the email or service account behind each job ([Google Cloud](https://docs.cloud.google.com/bigquery/docs/information-schema-jobs)). If the MCP server's service user sits at the top and none of its queries carry a tag, the warehouse knows the agent asked, and nothing else.

| Check | Where to look | Warning sign |
|---|---|---|
| Identity | `user_name` in query history | one service user accounts for every agent query |
| Correlation | `query_tag` on agent queries | agent queries with no request ID |
| Coverage | server log against `tools/call` volume | calls with no matching record |
| Retention | the log destination's policy | shorter than the window in which questions usually arrive |
| Separation | permissions on the log destination | the agent's credential can edit or delete its own log |

If the agent's own credential can write to and delete from the log destination, any line can disappear without a trace, and the log proves nothing.

## How do you fix it?

Move the record to the layer that executes and join it to the warehouse history. Five steps, in this order.

**One record per `tools/call`, written by the server before it returns.** If the write fails, the call fails. A log that can be skipped on error is the log that's missing on the day of the incident. And because MCP is stateless, with an open connection explicitly not treated as a session, linking calls needs an explicit identifier; `traceparent`, reserved in `_meta` for OpenTelemetry context, is the natural one ([MCP](https://modelcontextprotocol.io/specification/2026-07-28/basic/index)).

**Identity from the token, not from the conversation.** The server validates a per-person token and records its subject. The spec forbids passing the client's token through to downstream services ([MCP](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/security-considerations)), and the scopes that token should carry are covered in [MCP security for marketing data](https://precisian.io/blog/en/posts/mcp-security-marketing-data/).

**A tag on the warehouse query.** In Snowflake, the `QUERY_TAG` session parameter attaches a string to every statement in the session, and it shows up in query history ([Snowflake](https://docs.snowflake.com/en/sql-reference/parameters)). Set it to the request ID. That is the join key between your log line, the query, its cost and the tables it read.

**The definition version alongside the result.** If metrics come from [a semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/) with versioned definitions, the server already knows which version ran. Logging it is one more column.

**An append-only destination with a different owner.** The agent writes; nothing on the agent's side deletes. Give the log its own retention policy, chosen by a person rather than inherited from a tool default.

A practical bar for calling it done: 100% of `tools/call` requests have a record, and zero records list the service user as the only identity. For per-query spend limits, see [query cost guardrails](https://precisian.io/blog/en/posts/query-cost-guardrails/). If you first need to know which agents exist at all, start with [the agent and MCP permission inventory](https://precisian.io/blog/en/posts/ai-agent-mcp-permissions-inventory/).

## When can't this be fixed?

In three situations, and it's worth knowing them before promising anyone an audit.

**Past queries under a service user stay anonymous.** You can fix attribution going forward, never backward.

**Third-party MCP servers.** When the agent talks to an ad platform's or a commerce platform's server, the executing side belongs to the vendor, and you get whatever it exposes. What's left is the client log, which is the agent's own account of what it did. The limits of one such server are covered in [what the Google Ads MCP sees](https://precisian.io/blog/en/posts/google-ads-mcp-what-it-sees/).

**Local servers on laptops.** An MCP server running over stdio on each analyst's machine writes to `stderr` on a computer the company may not control. Either it points to a central server, or there is no audit.

And there's the case where Precisian is the wrong answer. If you run your own warehouse, have one internal agent, and already map each person to their own warehouse user, native query history with a tag per request does the job. You don't need a platform for that.

At Precisian, each client's data lake is isolated on Precisian's infrastructure, and the MCP server that runs queries against the semantic layer is Precisian's too. The record lives in the same layer that executes, next to the definition version.

## What doesn't this article cover?

It recommends no observability or log-storage product. It sets no retention period, which is a legal decision for each company. It doesn't address model auditing, which asks how the text was generated; the question here is what was queried.

And it doesn't claim logging prevents a leak. A log makes a query reconstructible afterward. Stopping the wrong query is a job for permissions and [per-tenant isolation](https://precisian.io/blog/en/posts/per-tenant-isolation-mcp/).

---

If nobody on your team can say what the agent queried last week, the first step is measuring how many of its queries reach the warehouse with no person attached. [Book a call about your setup](https://calendar.notion.so/meet/rodrigomartucci/precisian-io), with no contract commitment, and no promise of an answer in 30 minutes either.
