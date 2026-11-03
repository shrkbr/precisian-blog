---
title: "Testing an MCP server before it touches production data (MCP Inspector and beyond)"
description: "MCP Inspector proves your server speaks the protocol, not that its answers are right. The rest: a scrubbed copy, an answer key, scope and cost checks."
slug: "mcp-inspector-test-before-production"
lang: "en"
translationKey: "mcp-testing"
publishedAt: 2026-11-03
tags: ["mcp", "security", "ai-data-access", "metric-hallucination", "cost", "governance"]
draft: false
llmSummary: "MCP Inspector (@modelcontextprotocol/inspector, v2.13.0, Oct 28 2026) checks the handshake, tool listing and tool calls, with exit codes 0 to 6. Its own smoke-testing guide says it is deliberately not a conformance suite. Before production: a scrubbed copy, an answer key, scope and cost checks."
citations: ["https://github.com/modelcontextprotocol/inspector", "https://modelcontextprotocol.io/docs/tools/inspector", "https://github.com/modelcontextprotocol/inspector/blob/main/docs/cli-smoke-testing.md", "https://modelcontextprotocol.io/docs/2026-07-28/tools/inspector/security", "https://www.npmjs.com/package/@modelcontextprotocol/inspector", "https://github.com/advisories/GHSA-7f8r-222p-6f5g", "https://modelcontextprotocol.io/specification/2026-07-28/server/tools", "https://www.postgresql.org/docs/current/ddl-rowsecurity.html", "https://docs.cloud.google.com/bigquery/docs/best-practices-costs", "https://supabase.com/blog/defense-in-depth-mcp"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://en.wikipedia.org/wiki/Smoke_testing_(software)", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 9
---

MCP Inspector, the reference testing tool for the Model Context Protocol, tells you whether your server speaks the protocol: the handshake completes, the tools list, a call returns, and the exit code is stable. It does not tell you whether the number that came back is correct. The project's own smoke-testing guide, read on November 3, 2026, calls the workflow "deliberately not a conformance suite" ([modelcontextprotocol/inspector](https://github.com/modelcontextprotocol/inspector/blob/main/docs/cli-smoke-testing.md)). Four checks sit between a green Inspector run and production data: a scrubbed copy, an answer key, a scope check and a cost ceiling.

> **MCP Inspector**: a client for testing and debugging MCP servers, shipped as the npm package `@modelcontextprotocol/inspector` (version `2.13.0`, published October 28, 2026, per [npm](https://www.npmjs.com/package/@modelcontextprotocol/inspector)). It has a web UI, a CLI (`--cli`) and a terminal UI (`--tui`), and it talks to your server with no language model in between.

## How do you run MCP Inspector?

Through `npx`, with nothing to install. The [official Inspector docs](https://modelcontextprotocol.io/docs/tools/inspector), read on November 3, 2026, require Node 22.19.0 or newer and give these commands:

```bash
# web UI against a local stdio server
npx @modelcontextprotocol/inspector node path/to/server/index.js

# CLI: list the tools and exit
npx @modelcontextprotocol/inspector --cli node path/to/server/index.js --method tools/list

# a remote server over Streamable HTTP
npx @modelcontextprotocol/inspector --server-url https://api.example.com/mcp --transport http
```

The web UI prints a URL carrying a per-launch API token and opens it in the browser. The CLI is the one to script: it prints a single JSON object with `--format json` and returns a stable exit code ([cli-smoke-testing.md, section 5](https://github.com/modelcontextprotocol/inspector/blob/main/docs/cli-smoke-testing.md)):

| Exit code | Meaning |
|---|---|
| `0` | success |
| `1` | usage or unexpected error |
| `3` | server requires authentication (401/403, OAuth) |
| `4` | server unreachable |
| `5` | tool error (`isError:true`) or tool not found |
| `6` | `--strict` found an error-severity schema portability problem |

The repository's README adds an experimental fourth client, `mcpdo`, which keeps a connection open between commands. A v1 line still exists for security fixes only, under the `v1-latest` tag ([README](https://github.com/modelcontextprotocol/inspector)).

## What does a passing test look like when it proved nothing?

A team stands up an MCP server over the Shopify orders data in their warehouse, runs the Inspector, sees the tools listed and a call return JSON, and marks it tested. Two weeks later, three things surface:

- The agent answers "October revenue" with a figure that includes refunded orders and orders still in fraud review, and nobody notices because the number looks plausible.
- Someone finds that the `run_query` tool accepted `UPDATE`, and the agent was one ambiguous prompt away from using it.
- The BigQuery bill climbs because every question scans the full events table.

The Inspector would have caught none of them, and that is not a bug in the Inspector. The test checked the layer the tool was built to check. The other three layers went untested.

## What does MCP Inspector actually test?

The protocol contract, one call at a time. The smoke-testing guide states the goal in its first lines: connect, "prove it speaks MCP", prove the one or two things you depend on still work, and fail the job when they don't ([cli-smoke-testing.md](https://github.com/modelcontextprotocol/inspector/blob/main/docs/cli-smoke-testing.md)).

Everything in the exit-code table is about shape. If a `revenue_by_channel` tool returns `{"revenue": 184000}`, the Inspector confirms the field exists and the call did not error. Whether 184,000 is gross sales, net of refunds, with or without shipping and sales tax, is not part of the protocol and cannot be.

There is a second limit. The annotation that says a tool only reads (`readOnlyHint`) is the server's own claim, and the spec tells clients to distrust it: "clients MUST consider tool annotations to be untrusted unless they come from trusted servers" ([MCP spec, revision 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)). The Inspector displays the annotation. It does not verify it.

The Inspector itself needs care too. It stores OAuth tokens and stdio `env:` values; on a machine with no OS keychain it writes them to `~/.mcp-inspector/secrets.json`, "unencrypted unless you supply a key", and any stdio server it launches runs as your user ([Inspector security docs](https://modelcontextprotocol.io/docs/2026-07-28/tools/inspector/security)). The same page warns that a bare `-p 6274:6274` in Docker exposes the process-spawning backend to your whole network. The older line has a published advisory: versions before `0.14.1` shipped a proxy with no authentication between client and proxy ([GHSA-7f8r-222p-6f5g, June 2025](https://github.com/advisories/GHSA-7f8r-222p-6f5g)). So the Inspector should not point at production with an admin credential loaded.

## What database setup works best for testing an agent before production access?

A copy with the production schema, roughly production volume, and no data that identifies a customer.

**Same schema**, because the mistakes worth finding live in column names and near-duplicate tables: `orders` and `orders_fulfilled`, `total_price` and `subtotal_price`. A three-table toy database never reproduces the confusion the agent will meet.

**Similar volume**, because cost and latency only show up when the events table is its real size. A thousand rows teach you nothing about the query that scans the whole table.

**No identifying data**, because the agent rarely needs a name, email or phone number to answer a business question, and a hashed email without a secret key is not anonymous. The detail is in [giving an agent customer context without PII](https://precisian.io/blog/en/posts/ai-agent-customer-context-without-pii/).

The vendor behind the most cited MCP incident wrote the rule plainly: use MCP with non-production data and "never connect AI agents directly to production data" ([Supabase, September 16, 2025](https://supabase.com/blog/defense-in-depth-mcp)). The case itself is covered in [connecting an AI agent to production data without exposing it](https://precisian.io/blog/en/posts/connect-ai-to-production-data/).

On the copy, the agent connects with its own role: `SELECT` only, no `BYPASSRLS`, not the table owner. PostgreSQL documents that superusers, roles with `BYPASSRLS` and table owners skip row policies unless `FORCE ROW LEVEL SECURITY` is set ([PostgreSQL](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)). Testing under the wrong role approves a configuration production will not have.

Finally, isolate the Inspector's own state. The guide tells you to set both `MCP_STORAGE_DIR` and `MCP_INSPECTOR_OAUTH_STATE_PATH`, because the second is checked first and an inherited value "silently wins", so the run reaches a developer's real token file anyway ([cli-smoke-testing.md, section 6](https://github.com/modelcontextprotocol/inspector/blob/main/docs/cli-smoke-testing.md)).

## How do you build an answer key for an AI agent?

Write the answers before you ask the questions. On the copy, someone computes in plain SQL, with no agent involved, the answer to a dozen or two questions the business asks every week. Then the same questions go through two paths.

**Path 1, the tool alone, through the Inspector CLI.** No model is involved, so you can compare against the key in a script:

```bash
npx @modelcontextprotocol/inspector --cli node build/index.js \
  --method tools/call --tool-name revenue_by_channel \
  --tool-args-json '{"month":"2026-10","channel":"organic"}' --format json \
  | jq -e '.result.structuredContent.net_revenue == 184000'
```

The guide recommends `--tool-args-json` over `--tool-arg` for typed arguments, because `--tool-arg` turns an all-digit string into a number, so an order ID or a zip code arrives as an integer ([cli-smoke-testing.md, section 4](https://github.com/modelcontextprotocol/inspector/blob/main/docs/cli-smoke-testing.md)).

**Path 2, the full agent.** The same question, in plain English, to the assistant that will use the server.

Comparing the two paths locates the error:

| Tool (Inspector) | Agent | Where the problem is |
|---|---|---|
| matches the key | matches | nowhere, for this question |
| matches | does not match | the model picked the wrong tool, filter or metric |
| does not match | does not match | the server or the data under it |
| does not match | matches | coincidence; investigate the tool anyway |

The second row is [metric hallucination](https://precisian.io/blog/en/posts/metric-hallucination/): the tool was right, and the agent read "revenue" as gross when finance means net of refunds. The fix belongs wherever the definition of revenue is written down.

Add two questions the copy cannot answer, such as margin for a channel with no cost data loaded. The expected result is the agent saying it does not know. If it invents a number instead, that is a separate problem, covered in [teaching a data agent to say I don't know](https://precisian.io/blog/en/posts/teaching-an-agent-to-say-i-dont-know/).

A synthetic example with round numbers: out of 20 questions, 17 match on both paths, 2 match on the tool and miss on the agent, 1 misses on both. Those three groups need fixes in three different places, and without the key every one of them would read as "the agent got it wrong".

## How do you check scope and cost before go-live?

With negative assertions, which the Inspector guide treats as part of the test: "A smoke test that only proves the happy path will not notice the day a tool starts answering questions it should refuse" ([cli-smoke-testing.md, section 7](https://github.com/modelcontextprotocol/inspector/blob/main/docs/cli-smoke-testing.md)).

| Check | How to run it | What fails it |
|---|---|---|
| Closed tool list | `--method tools/list` + `jq` diffed against the approved list, both directions | any tool nobody approved, such as write or delete |
| Refusals stay refusals | a call that should fail (out-of-scope table, `DELETE`), requiring exit `5` | exit `0`: the server accepted it |
| Auth is real | run with no token in an isolated store, requiring exit `3` | exit `0`: the route went public |
| Cost ceiling | `maximum_bytes_billed` on BigQuery for the agent's role | any answer-key query that hits the ceiling |
| Secrets in output | `grep` for key patterns in the captured output | any match |

The approved list in the first row comes from the permission review in [MCP security for marketing data](https://precisian.io/blog/en/posts/mcp-security-marketing-data/): read-only, minimum scope, and no write tool for an agent that should only query.

The docs add two caveats on reading results.

First, `--stored-auth-only` is a no-op against a server that never challenges, so "a green run is *not* evidence that your token store was seeded correctly." The guide's fix is to prove the negative on purpose: run without a usable token and require exit `3` ([cli-smoke-testing.md, section 6](https://github.com/modelcontextprotocol/inspector/blob/main/docs/cli-smoke-testing.md)).

Second, cost. On BigQuery, with maximum bytes billed set, bytes read are estimated before execution and, if the estimate exceeds the limit, "the query fails without incurring a charge" ([Google Cloud, read November 3, 2026](https://docs.cloud.google.com/bigquery/docs/best-practices-costs)). The same page notes that a dry run always returns 0 bytes when the table is masked with row-level security. A team estimating agent cost by dry run on a policy-protected table will read zero and sign off. The ceiling that works is the one enforced before execution; more in [query cost guardrails](https://precisian.io/blog/en/posts/query-cost-guardrails/).

In CI, pin the exact Inspector version. The guide warns that `@2` is not a pin, since `npx` will resolve any newer 2.x and the same commit can run against a different Inspector the next day. And log every call during testing: the [agent audit log](https://precisian.io/blog/en/posts/mcp-logging-agent-audit-log/) you build here is the one that answers "what did it read" in production.

## When does testing not fix it?

In four cases, worth knowing before you promise anyone the agent is safe.

**Indirect prompt injection.** The scrubbed copy does not contain the campaign name or product description a third party wrote with an instruction hidden inside. You can plant a test case, but the vector stays open in production for as long as the agent reads text other people write ([prompt injection through marketing data](https://precisian.io/blog/en/posts/prompt-injection-marketing-data/)).

**Distributions that scrubbing erases.** Good anonymization scrambles exactly what identifies: the small town, the customer with 300 orders, the wholesale buyer. If the business question depends on those cases, the copy answers differently from production and the key passes without proving anything.

**Questions nobody wrote down.** The key covers what the team remembered to ask. The agent will get everything else. Testing shrinks the unknown surface; it does not remove it.

**A definition that does not exist.** If the company never decided whether revenue is gross or net, the answer key reflects the opinion of whoever wrote the SQL, and the test passes or fails on that opinion. No testing tool fixes that. It is [semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/) work, versioned and owned.

And where Precisian is not the answer: if your MCP server sits on a single source, with a metric dictionary already written and a properly scoped read role, the Inspector plus the answer key in this post are enough. A managed platform makes sense when there are many sources, each with its own definition of revenue, and nobody has time to keep the copy, the key and the cost ceiling current. Even then the agent stays yours: Precisian delivers up to the semantic layer, and the AI asking the questions is the one you already use.

## What does this article not cover?

It does not explain how to build an MCP server or compare implementations; the field moves faster than any list stays accurate. It does not cover MCP App review, which has its own recipe in the Inspector repository. It does not cover streaming and session-only methods, which the CLI rejects by design: one invocation is one request and one response. And it does not evaluate the language model itself, only the path between the question and the data.

---

If your agent has already reported a revenue figure nobody could reproduce in SQL, the first step is building the answer key and finding which of the three layers changes the number. [See how Precisian hands modeled data to your agent](https://precisian.io/en/demo), with no contract commitment, and no promise of an answer in 30 minutes either.
