---
title: "Postgres MCP server: read-only access, the guardrails, and what the reference server got wrong"
description: "The reference Postgres MCP server was archived in 2025 with an injection that escaped its read-only mode. Real read-only lives in the database role."
slug: "postgres-mcp-server"
lang: "en"
translationKey: "postgres-mcp-server"
publishedAt: 2026-11-11
tags: ["mcp", "security", "ai-data-access", "prompt-injection", "text-to-sql", "cost", "governance"]
draft: false
llmSummary: "The reference Postgres MCP server (@modelcontextprotocol/server-postgres) was archived on May 29, 2025; npm version 0.6.2 lacks the fix for an injection that escaped read-only mode, yet it was downloaded 140,645 times from Nov 4 to Nov 10, 2026 (npm)."
citations: ["https://github.com/modelcontextprotocol/servers", "https://github.com/modelcontextprotocol/servers-archived/tree/main/src/postgres", "https://github.com/modelcontextprotocol/servers/pull/1889", "https://github.com/modelcontextprotocol/servers/commit/d53d6cc75c9ff1957f76c6b97c1ca74771af347e", "https://www.npmjs.com/package/@modelcontextprotocol/server-postgres", "https://api.npmjs.org/downloads/point/last-week/@modelcontextprotocol/server-postgres", "https://securitylabs.datadoghq.com/articles/mcp-vulnerability-case-study-SQL-injection-in-the-postgresql-mcp-server/", "https://github.com/crystaldba/postgres-mcp", "https://modelcontextprotocol.io/specification/2026-07-28/server/tools", "https://www.postgresql.org/docs/current/sql-set-transaction.html", "https://www.postgresql.org/docs/current/hot-standby.html", "https://www.postgresql.org/docs/current/runtime-config-client.html", "https://www.postgresql.org/docs/current/ddl-priv.html", "https://www.postgresql.org/docs/current/sql-alterdefaultprivileges.html", "https://www.postgresql.org/docs/current/predefined-roles.html"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://en.wikipedia.org/wiki/PostgreSQL", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
cta: demo
---
A Postgres MCP server is only as read-only as the database role behind it. The reference server from the official MCP repository, `@modelcontextprotocol/server-postgres`, described itself as offering "read-only access to PostgreSQL databases", was archived on May 29, 2025, and its npm release 0.6.2 still ships without the fix for an injection that broke out of its read-only transaction ([Datadog Security Labs](https://securitylabs.datadoghq.com/articles/mcp-vulnerability-case-study-SQL-injection-in-the-postgresql-mcp-server/), August 21, 2025). It was still downloaded 140,645 times between November 4 and 10, 2026 ([npm](https://api.npmjs.org/downloads/point/last-week/@modelcontextprotocol/server-postgres)).

> **Postgres MCP server**: a server that implements the Model Context Protocol over a PostgreSQL connection and gives a language model tools to list tables, read schemas and run SQL. What it can actually do to the database is set by the connection's role, not by the tool description.

## What does the failure look like?

Your team wants Claude or Cursor to answer questions about the app database: how many subscriptions failed to renew last week, how many orders are stuck in "pending fulfillment", what the BFCM discount code really cost. Someone finds the Postgres server in the MCP list, pastes a connection string into the config file, and tests it. It works in five minutes. The tool is called `query`, and its description says "Run a read-only SQL query."

The test never shows the problem. It shows up when:

- **The connection string uses the app's database user**, which owns the tables, because that's what was sitting in `.env`.
- **The agent reads text that came from outside** (a support ticket, an order note, a customer email) with a hidden instruction in it, and the instruction becomes SQL.
- **A heavy query lands on the primary** at 11 a.m. on a Monday, and checkout slows down.

In all three cases, "read-only" lived in the tool's text. The MCP specification treats labels like this as the server's own claim: "clients MUST consider tool annotations to be untrusted unless they come from trusted servers" ([MCP specification, 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/server/tools), read November 11, 2026). That covers `readOnlyHint`, and it covers a free-text description even more.

## Is the reference Postgres MCP server still maintained?

No. The README of `modelcontextprotocol/servers` lists PostgreSQL under "Archived", described as "Read-only database access with schema inspection", and points to `modelcontextprotocol/servers-archived` ([README](https://github.com/modelcontextprotocol/servers), read November 11, 2026). That repository is archived on GitHub and describes itself as "Reference MCP servers that are no longer maintained" ([servers-archived](https://github.com/modelcontextprotocol/servers-archived/tree/main/src/postgres)).

| Item | Status as of November 11, 2026 | Source |
|---|---|---|
| Code in `servers` | removed in the May 29, 2025 archive commit, along with SQLite, Redis, GitHub and others | [commit `d53d6cc`](https://github.com/modelcontextprotocol/servers/commit/d53d6cc75c9ff1957f76c6b97c1ca74771af347e) |
| Injection fix | PR #1889, merged May 29, 2025, hours before the archive | [PR #1889](https://github.com/modelcontextprotocol/servers/pull/1889) |
| Code in `servers-archived` | `src/postgres/index.ts` still runs `client.query(sql)` without the fix | [archived code](https://github.com/modelcontextprotocol/servers-archived/tree/main/src/postgres) |
| npm package | `0.6.2`, published December 4, 2024, flagged "Archived and unmaintained; no security guarantees" | [npm](https://www.npmjs.com/package/@modelcontextprotocol/server-postgres) |
| Downloads | 140,645 for November 4–10, 2026; 579,213 for October 12–November 10, 2026 | [npm downloads API](https://api.npmjs.org/downloads/point/last-week/@modelcontextprotocol/server-postgres) |

npm download counts include CI runs, mirrors and reinstalls, so they aren't a user count. The trend is still clear. When Datadog published the flaw in August 2025, it counted about 21,000 weekly npm downloads ([Datadog](https://securitylabs.datadoghq.com/articles/mcp-vulnerability-case-study-SQL-injection-in-the-postgresql-mcp-server/)); the first week of November 2026 brought 140,645, more than a year after the package was flagged as carrying no security guarantees. If one of those installs is yours, start with the checks below.

## How did writes escape the read-only mode?

The mechanism fits in three lines of the archived code. On every `query` call, the server opens `BEGIN TRANSACTION READ ONLY`, runs whatever text the model sent with `client.query(sql)`, and finishes with `ROLLBACK`.

Datadog Security Labs published the hole on August 21, 2025: the `pg` driver's `client.query` accepts multiple statements separated by semicolons. Send `COMMIT; DROP SCHEMA public CASCADE;` and the `COMMIT` closes the read-only transaction, then the `DROP` runs outside it with whatever privileges the connection user has. The final `ROLLBACK` arrives too late, and Postgres answers "there is no transaction in progress" ([Datadog](https://securitylabs.datadoghq.com/articles/mcp-vulnerability-case-study-SQL-injection-in-the-postgresql-mcp-server/)). Datadog's timeline also notes that an independent researcher had reported the flaw on November 27, 2024, eight days after the first release.

Datadog describes a second vector that a restricted role alone doesn't stop. Connections come from a pool, so `COMMIT; SET statement_timeout TO 1;` changes session state, and the next call that picks up that connection inherits a 1-millisecond timeout.

The fix in PR #1889 switched to a prepared statement, which Postgres parses as a single statement, and destroyed the connection after each use with `client.release(true)`. The same PR added a caution to the README: if you need read-only for security, create a separate database user with only `SELECT` permissions instead of relying on the server's restrictions ([PR #1889](https://github.com/modelcontextprotocol/servers/pull/1889)). That advice applies to every Postgres MCP server.

Even when the read-only transaction holds, it has a documented limit. The Postgres docs list what it blocks (`INSERT`, `UPDATE`, `DELETE`, `MERGE`, `CREATE`, `ALTER`, `DROP`, `GRANT`, `TRUNCATE` and more) and add that "this is a high-level notion of read-only that does not prevent all writes to disk" ([PostgreSQL 18, SET TRANSACTION](https://www.postgresql.org/docs/current/sql-set-transaction.html)).

## How do you check your own setup?

Run these before any agent touches the database. Queries run as an admin; the agent's role here is `ai_agent`.

| Check | How to run it | What signals risk |
|---|---|---|
| Which package your MCP client launches | read `claude_desktop_config.json`, `.cursor/mcp.json` or equivalent | `@modelcontextprotocol/server-postgres` or the `mcp/postgres` image |
| Who the connection user is | `SELECT current_user;` over the server's own connection | the app user, or `postgres` |
| Role attributes | `SELECT rolsuper, rolbypassrls, rolcreaterole, rolcreatedb FROM pg_roles WHERE rolname = 'ai_agent';` | any `true` |
| Write privileges | `SELECT table_schema, table_name, privilege_type FROM information_schema.role_table_grants WHERE grantee = 'ai_agent' AND privilege_type <> 'SELECT';` | any row |
| Inherited broad roles | `SELECT b.rolname FROM pg_auth_members m JOIN pg_roles b ON b.oid = m.roleid JOIN pg_roles u ON u.oid = m.member WHERE u.rolname = 'ai_agent';` | `pg_write_all_data`, or `pg_read_all_data` when the agent shouldn't see everything |
| Is it a replica? | `SELECT pg_is_in_recovery();` over the agent's connection | `false` when the plan was to read from a replica |
| Time ceiling | `SHOW statement_timeout;` over the agent's connection | `0`, which disables the limit |

Watch `pg_read_all_data` closely. It grants read on every table, view and sequence as if the role had `SELECT` on all of them ([PostgreSQL 18, predefined roles](https://www.postgresql.org/docs/current/predefined-roles.html)). It blocks writes and restricts nothing the agent can read.

To test the server itself without a model in the loop, the MCP Inspector walkthrough is in [how to test an MCP server before production](https://precisian.io/blog/en/posts/mcp-inspector-test-before-production/). Add `SELECT 1; COMMIT; CREATE TABLE agent_probe (id int);` to the test calls and confirm it fails.

## How do you lock it down?

Four layers, strongest first. Layers one and two are the ones that hold when an injection gets past the server.

**1. A read replica.** On a standby with `hot_standby` on, "all such connections are strictly read-only; not even temporary tables may be written" ([PostgreSQL 18, Hot Standby](https://www.postgresql.org/docs/current/hot-standby.html)). There's no `COMMIT` that unlocks writes there, and the agent's heavy query doesn't compete with checkout for CPU. On RDS, Cloud SQL or Supabase, that means the provider's read replica.

**2. A dedicated role with `SELECT` only, scoped.**

```sql
CREATE ROLE ai_agent LOGIN PASSWORD '...' NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE;
GRANT CONNECT ON DATABASE store TO ai_agent;
GRANT USAGE ON SCHEMA analytics TO ai_agent;
GRANT SELECT ON ALL TABLES IN SCHEMA analytics TO ai_agent;
ALTER DEFAULT PRIVILEGES FOR ROLE analytics_owner IN SCHEMA analytics GRANT SELECT ON TABLES TO ai_agent;
ALTER ROLE ai_agent SET default_transaction_read_only = on;
ALTER ROLE ai_agent SET statement_timeout = '15s';
```

The scope is an `analytics` schema with views that already drop email, phone and shipping address, not the whole database. A detail in the archived code shows why: the server only listed tables in the `public` schema as resources, but the `query` tool ran SQL against any schema the user could reach. The `GRANT` is what sets the scope. And `ALTER DEFAULT PRIVILEGES` only applies to objects created afterward ([PostgreSQL 18](https://www.postgresql.org/docs/current/sql-alterdefaultprivileges.html)), which is why the `GRANT ... ON ALL TABLES` comes first.

Audit functions too. Postgres grants `EXECUTE` on functions and procedures to `PUBLIC` by default ([PostgreSQL 18, privileges](https://www.postgresql.org/docs/current/ddl-priv.html)), and a `SECURITY DEFINER` function runs with its owner's privileges. Off the replica, a function like that which writes is a write path for a role that only has `SELECT`.

**3. A cost ceiling.** `statement_timeout` aborts any statement that runs past the limit ([PostgreSQL 18, client connection defaults](https://www.postgresql.org/docs/current/runtime-config-client.html)). Set on the role, it is the session default, and the session itself can change it with `SET`. So it contains a careless agent and won't stop one that is trying to get around the limit. For per-query and per-day budgets, see [query cost guardrails](https://precisian.io/blog/en/posts/query-cost-guardrails/).

**4. A maintained server.** If you're keeping MCP pointed straight at Postgres, move off the archived package. Two options documented as of November 11, 2026:

| Server | What it states about read-only | Source |
|---|---|---|
| `@zeddotdev/postgres-context-server` (Zed Industries) | shipped the prepared-statement fix in v0.1.4 on April 9, 2025 | [Datadog](https://securitylabs.datadoghq.com/articles/mcp-vulnerability-case-study-SQL-injection-in-the-postgresql-mcp-server/) |
| Postgres MCP Pro (`crystaldba/postgres-mcp`) | `--access-mode=restricted` uses read-only transactions, rejects SQL containing `COMMIT` or `ROLLBACK` by parsing it with `pglast`, and caps execution time; warns that unsafe stored-procedure languages could get around it | [README](https://github.com/crystaldba/postgres-mcp) |

Neither replaces layers one and two. Postgres MCP Pro's own README says the simplest path to integrity is a database user with read-only permissions.

## When can't a read-only setup save you?

In three situations, and it's worth knowing them before you scope the project.

**When the answer isn't in the database.** Your app database stores orders the way the app wrote them. It doesn't know that a Shopify order refunded through Stripe isn't revenue, that Amazon fees come out of margin, or that finance books revenue net of returns. The agent writes a correct `SUM(total)` over the wrong definition, and blocking writes has nothing to do with it. That's the job of a [semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/), and no role configuration replaces it.

**When what the agent can read is already the leak.** Read-only protects integrity, not confidentiality. If the role can read the customers table and the agent processes third-party text, an injected instruction can ask it to summarize that data back. More in [connecting AI to production data](https://precisian.io/blog/en/posts/connect-ai-to-production-data/) and [prompt injection in marketing data](https://precisian.io/blog/en/posts/prompt-injection-marketing-data/).

**When there's no replica.** Without a standby, the agent's query runs on the primary. `statement_timeout` kills the worst one, but it doesn't give back the CPU already spent.

A direct Postgres MCP isn't the wrong answer for everyone. For an engineering team poking at its own dev database or a replica, a maintained server and a read-only role are enough, and you don't need a data platform in the middle. Precisian fits when the question is a business question that spans sources: the app database, Shopify, Amazon, GA4 and ad platforms in a data lake isolated per client on Precisian's infrastructure, with each metric defined once in a semantic layer and served to the AI you already use through Precisian's MCP, with no write access to your production database. Per-client isolation is covered in [per-tenant isolation for MCP](https://precisian.io/blog/en/posts/per-tenant-isolation-mcp/).

## What doesn't this article cover?

It isn't an install guide for any server; those steps change every release and live in the repositories. It doesn't compare every Postgres MCP server out there, only the two that document the read-only question. It doesn't cover row-level security, which is in [per-tenant isolation for MCP](https://precisian.io/blog/en/posts/per-tenant-isolation-mcp/). And it makes no claim about the `mcp/postgres` Docker Hub image beyond what Datadog published.

---

If an assistant already queries your Postgres, the first step is to run `SELECT current_user;` over its connection and see whether the answer is your app user. [Watch a governed MCP answer](https://precisian.io/en/demo?utm_source=blog&utm_medium=cta&utm_campaign=postgres-mcp-server&utm_content=texto) over an isolated lake, with no contract commitment.
