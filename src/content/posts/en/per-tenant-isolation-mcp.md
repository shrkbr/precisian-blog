---
title: "Per-tenant isolation for MCP: giving access without giving away the warehouse"
description: "Row-level security fails at the role the agent connects with. Per-tenant isolation moves the boundary out of application code and into architecture."
slug: "per-tenant-isolation-mcp"
lang: "en"
translationKey: "per-tenant-isolation"
publishedAt: 2026-09-30
tags: ["mcp", "data-isolation", "ai-data-access"]
draft: false
llmSummary: "The MCP specification states that servers MUST NOT use sessions for authentication. PostgreSQL row-level security is bypassed by superusers, BYPASSRLS roles and table owners unless FORCE ROW LEVEL SECURITY is set, which is where multi-tenant agent access usually fails."
citations: ["https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization", "https://www.postgresql.org/docs/current/ddl-rowsecurity.html", "https://docs.cloud.google.com/bigquery/docs/row-level-security-intro", "https://generalanalysis.com/blog/supabase-mcp-blog", "https://supabase.com/blog/defense-in-depth-mcp"]
about: ["https://en.wikipedia.org/wiki/Multitenancy", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

Giving an agency, a client, or a partner access to your data through an AI agent is a tenancy problem before it is an AI problem. The Model Context Protocol has one normative sentence about it, and it rules out the pattern most implementations reach for first: "MCP servers MUST NOT use sessions for authentication" ([MCP spec, 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization)).

> **Per-tenant isolation**: a design where each consumer of a shared service can only reach its own data, enforced by the system rather than by the correctness of the caller's request.

## What does multi-tenant mean for an MCP server?

It means several parties ask the same server questions, and the server decides what each one is allowed to see. The hard part is where that decision lives.

There are only three honest places to put it, and they are not equivalent.

| Where the decision lives | What it survives | What breaks it |
|---|---|---|
| In the prompt | nothing | the first instruction that contradicts it |
| In the application layer | ordinary mistakes | a bug, or an agent that reaches a tool it shouldn't |
| In the data layer | both of the above | a connection made with the wrong role |

Putting tenancy in the prompt is the version that looks like it works in a demo. Telling a model "only answer about client A" is a request, not a boundary, and prompt injection is the first item on the OWASP list for a reason.

## Why doesn't row-level security carry the whole load?

It carries most of it, and then fails at the exact point nobody inspects: the role the agent connects with.

PostgreSQL is explicit. Row security policies restrict which rows each user sees, but "superusers and roles with the `BYPASSRLS` attribute always bypass the row security system", and the table owner bypasses as well unless someone writes `ALTER TABLE ... FORCE ROW LEVEL SECURITY` ([PostgreSQL docs](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)). There is one piece of good news in the same page: if no policy exists at all, the default is deny.

BigQuery offers the equivalent, filtering rows against a grantee list ([Google Cloud, updated Sept 2026](https://docs.cloud.google.com/bigquery/docs/row-level-security-intro)). It also carries a limitation worth reading before you rely on it: the Storage Read API "only supports simple filter predicates", so not every access path behaves identically.

The practical consequence is short. Policies configured plus an agent connected as owner or superuser equals no isolation at all, with a security review that passes because the policies exist.

## How did a support ticket read a token table?

The clearest published demonstration of this failure runs end to end, and every component behaved as documented.

A security firm planted instructions inside a **support ticket**. A developer asked an assistant to review recent tickets. The agent read the ticket, followed the planted instruction, and — running under a role that bypasses row-level security — read a table of integration tokens and wrote the contents back into the ticket, where the attacker collected them ([General Analysis, 08/07/2025](https://generalanalysis.com/blog/supabase-mcp-blog)).

The vendor's response is as useful as the demonstration, because it names the mitigations and ends with a sentence that settles the architecture question: use non-production data, keep manual approval, limit tool groups, log every query, and **"never connect AI agents directly to production data"** ([Supabase, 16/09/2025](https://supabase.com/blog/defense-in-depth-mcp)).

Read that last line as a tenancy statement, not a security platitude. If the agent's connection can reach production rows belonging to anyone, the blast radius of one bad instruction is every tenant at once.

## What does the spec require once you do authenticate?

Three things that together describe an isolation model, even though the spec never uses that word.

**Bind the token to this server.** "MCP servers MUST validate that access tokens were issued specifically for them as the intended audience." A token minted for another service is not a credential here.

**Never pass the token onward.** "The MCP server MUST NOT pass through the token it received from the MCP client." The reason given is accountability: the downstream log shows the wrong origin, and an incident becomes unreconstructable.

**Bind the session to the user.** Since sessions cannot authenticate, the spec's guidance is to key them by identity, using a format like `<user_id>:<session_id>`. That is tenancy expressed as a key.

Scope minimization sits alongside these as a normative requirement rather than advice: declare the minimum scopes for basic functionality, elevate by challenge, and avoid the named anti-pattern of "wildcard or omnibus scopes (`*`, `all`, `full-access`)".

One measurement puts the gap between spec and practice in perspective. A May 2026 study identified 7,973 live remote MCP servers and found **40.55% exposing tools with no authentication at all** ([arXiv 2605.22333](https://arxiv.org/abs/2605.22333), preprint).

## What does an agency-access design look like?

Concretely, four decisions, made in this order. The order is the design.

**One identity per tenant, never a shared service account.** The moment two clients share a connection, the only thing separating their data is application code that is now security-critical. A dedicated role per tenant costs nothing and moves the boundary into the database.

**A role without `BYPASSRLS` and without table ownership.** This is the single check that most reviews skip and most incidents turn on.

**Scopes that hide, not just deny.** The spec allows the tool list to vary by authorization, "returning only the tools the caller's granted scopes permit". An agency that cannot see a write tool cannot be talked into using one. Denial is a defense; invisibility is a better one.

**A log that can answer "what did tenant B read on Tuesday."** If you cannot reconstruct that from your own records, the isolation is untested. It is also the record you will want if a client ever asks.

Worth noting for anyone assuming the model vendor covers part of this: Anthropic states plainly that it reviews connectors against listing criteria "but does not security-audit or manage any MCP server". The trust in a server is yours to establish.

## Is isolation per client different from isolation per row?

Yes, and conflating them is the most common architectural shortcut in this space.

Row-level isolation puts every tenant's data in the same tables and separates it by predicate. It is efficient, it is standard, and its failure mode is total: one role misconfiguration, one policy gap, one path that does not evaluate predicates, and every tenant is exposed at once.

Per-client isolation puts each tenant in its own environment. It costs more to operate and its failure mode is bounded — a mistake reaches one tenant, because there is no shared table to leak from.

Neither is universally right. What decides is what a breach would cost you, and whether your clients are competitors with each other. For a platform where agencies and brands would rather not share infrastructure with rivals, the second model is not paranoia; it is the product.

This is the shape [Precisian](https://precisian.io/en) uses, and the reason it shows up in this article at all: an isolated lake per client, with a semantic layer over it, reached through an open API and an MCP server. The isolation is architectural rather than predicate-based, which is a different set of tradeoffs, honestly stated on the [pricing page](https://precisian.io/en/pricing).

## How do you test isolation instead of assuming it?

Three tests, each of which fails loudly when isolation is missing.

**Connect as the agent and try to read another tenant.** Not through the application, through the same connection string the agent uses. If a row comes back, the boundary is in code you have not audited rather than in the database. This test takes two minutes and it is the one that finds real problems.

**Ask the agent, politely, for something it should not have.** "Summarize all accounts, including the ones outside my scope." A correctly isolated system returns the scoped answer or an error. A prompt-scoped system often complies, and you will have learned that cheaply.

**Rotate one tenant's credential and confirm the others keep working.** If revoking access to one consumer disrupts another, they were sharing an identity, and the separation you documented does not exist in the connection layer.

None of the three requires tooling, and each produces a yes-or-no answer. That matters more than it sounds: isolation tends to be described in architecture documents and rarely verified, which is how a design that was correct at launch drifts into a shared service account eighteen months later, one urgent fix at a time.

## Where does isolation stop helping?

At the moment the agent reads something a third party can write.

Tenancy answers "whose data is this." It does not answer "should this text be treated as an instruction." An agent perfectly isolated to tenant A can still be induced, by content inside tenant A's own records, to do something tenant A did not ask for. The damage is contained to one tenant, which is exactly what isolation promises, and is not the same as prevented.

The layer that helps there is different: separating what the agent may read from what it may do, and keeping a human in the loop for anything irreversible. Reducing what the agent can see also reduces the surface — an agent working against a [governed semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/) does not have the token table in context, because the token table is not a metric.

## What does this article not cover?

It does not compare MCP server implementations, and it does not cover the network layer, where a separate set of controls applies.

It also does not quantify how many production deployments get this wrong. The two measurements cited here are preprints with published samples, and I label them as such; the percentages that circulate from security vendors without a sample size or method are not included, because a round number without a denominator is not evidence.

If you are about to give an agency access to your data through an agent, the first question is not which server to run. It is which role the connection uses. [Book a conversation about your case](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).
