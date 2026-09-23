---
title: "What is a trusted data layer for AI agents?"
description: "Access, definition, freshness and provenance, decided before the question. Connection is solved; trust is what nobody shipped."
slug: "trusted-data-layer-for-ai-agents"
lang: "en"
translationKey: "trusted-data-layer"
publishedAt: 2026-11-19
tags: ["camada-semantica", "mcp", "governanca"]
draft: false
llmSummary: "A trusted data layer is the set of guarantees between raw data and an AI agent: access, definition, freshness and provenance. A warehouse enforces shape, not meaning, and MCP makes authorization optional, so neither provides it alone."
citations: ["https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization", "https://arxiv.org/abs/2605.22333", "https://docs.getdbt.com/reference/resource-properties/constraints", "https://www.postgresql.org/docs/current/ddl-rowsecurity.html", "https://supabase.com/blog/defense-in-depth-mcp", "https://support.google.com/analytics/answer/10596866"]
about: ["https://en.wikipedia.org/wiki/Semantic_layer", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
---

A trusted data layer is the set of guarantees that sit between your raw data and an AI agent, so that an answer can be reproduced and defended rather than merely produced. The need is not theoretical: a measurement of 7,973 live remote MCP servers found **40.55% exposing tools with no authentication at all** ([arXiv 2605.22333](https://arxiv.org/abs/2605.22333), preprint), and the protocol itself states that "Authorization is OPTIONAL for MCP implementations" ([MCP spec](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization)).

Connection is solved. Trust is the part nobody shipped.

> **Trusted data layer**: the place where access, definition, freshness and provenance are decided before a question is asked, rather than inferred after an answer is given.

## Why does an agent need more than an analyst does?

Because the safety mechanism you have been relying on was human doubt.

An analyst who sees an odd revenue figure hesitates, checks the export, asks a colleague. That hesitation was doing real work and was never written down anywhere. An agent has no equivalent. It answers with whatever column it finds, at its usual confidence, and the wrong answer arrives formatted exactly like the right one.

Worse, the agent often reads a tool that already applied a model without saying so. GA4, for instance, states that "all attribution models exclude direct visits from receiving attribution credit, unless the path to key event consists entirely of direct visits" ([GA4](https://support.google.com/analytics/answer/10596866)). That is a defensible choice and an invisible transformation. The agent will not mention it, because nothing told it to.

So the requirement changes shape. For a human, the data layer needs to be *available*. For an agent, it needs to be *self-describing*, because there is no second reader to catch what it omits.

## Which four guarantees make a layer trusted?

Four, and each fails differently when absent.

| Guarantee | The question it answers | Failure when absent |
|---|---|---|
| **Access** | what may this caller see? | the agent reads what nobody authorized |
| **Definition** | what does this number mean? | two departments defend two figures |
| **Freshness** | how current is this? | a stale table answers as confidently as a live one |
| **Provenance** | where did this come from? | nobody can reconstruct the answer later |

The four are independent. A system can enforce access perfectly and still return a figure nobody can define, which is the most common configuration in practice, because access has an owner and definition usually does not.

## Doesn't the warehouse already provide this?

It provides less than its documentation appears to promise.

On Snowflake, BigQuery and Redshift, a `primary_key` declared in a dbt contract is "definable, not enforced", and the platform's own wording is blunt: a model "can still build even if building the model violates the constraint", because the constraint "exists for metadata purposes only" ([dbt](https://docs.getdbt.com/reference/resource-properties/constraints)). On Snowflake and BigQuery, `unique` is not even definable.

Row-level security is real, and it fails at the role. "Superusers and roles with the `BYPASSRLS` attribute always bypass the row security system", and the table owner bypasses too unless someone writes `FORCE ROW LEVEL SECURITY` ([PostgreSQL](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)).

So the warehouse enforces shape at build time and rows at query time, under a correctly configured role. It enforces nothing about meaning. There is no `NOT NULL` for semantics, and that is the guarantee an agent most needs.

## Doesn't an MCP server provide it?

It provides the wire, which is a different thing.

The protocol makes authorization optional, and it makes tools model-controlled, meaning the model chooses what to call. It also tells clients they **MUST** treat tool annotations as untrusted unless the server is trusted. Read together: the description you write is not a guarantee, and the connection is not a control.

The vendor evidence points the same way. After a documented attack chain in which a planted support ticket led an agent to read an integration-token table and write the contents back where the attacker could collect them, the platform's own guidance ended with a sentence worth keeping: **"never connect AI agents directly to production data"** ([Supabase, 16 September 2025](https://supabase.com/blog/defense-in-depth-mcp)).

An MCP server over a raw database is a protocol with no layer underneath it. The layer is what decides, before the call, which questions exist.

## How is this different from a semantic layer?

A semantic layer is one of the four guarantees. A trusted layer is all four, assembled.

The distinction matters because teams buy the definition layer and assume the rest arrived with it. [A semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/) settles what a metric means and applies that rule consistently, which is the hardest of the four to retrofit and the one with the highest payoff. It says nothing about who may query it, how stale the underlying data is, or whether yesterday's answer can be reconstructed.

Likewise, [a data contract](https://precisian.io/blog/en/posts/what-is-a-data-contract/) covers shape and operational commitment between a producer and its consumers. It is a real guarantee, enforced at build time for column names and types, and it is silent about meaning by construction.

The practical consequence is a sequencing decision. Teams that start with access alone get a locked door in front of numbers nobody can defend. Teams that start with definition alone get defensible numbers reachable by anyone. Neither is wrong; both are partial, and knowing which half you have is more useful than a roadmap that implies you have both.

## What does having one look like in practice?

Fewer surfaces, each one narrower than the database behind it.

Instead of a tool that runs arbitrary SQL, a handful of tools that answer named questions with closed input schemas. Instead of a table of orders, a modelled slice where revenue already means one thing. Instead of a figure returned alone, a figure returned with the definition applied, the range actually used, and the freshness of the data behind it.

That last one earns its keep quickly. An agent asked for last week's revenue will compute happily over a table that stopped updating on Tuesday, because from the query's perspective a stale table and a current one look identical. Returning the maximum timestamp behind the answer is a few characters of output that make an invisible failure visible.

## How do you test whether you have one?

Four checks, none of which needs budget.

**Ask two people on different teams for last month's revenue**, without saying why. Matching answers mean a definition is alive somewhere. Different answers mean you just measured the cost of not having one, for free.

**Find out which role the agent connects as.** Not what the architecture doc says: what is in the production connection string. An admin role or a table owner means your row policies are not applying to it.

**Plant a harmless instruction** in a text field the agent reads, then ask a normal question. If the planted instruction changes the answer, the injection channel is open.

**Take yesterday's answer and try to reproduce it.** If you cannot say which definition, which range and which data version produced it, you have output without provenance, which is the thing that looks most like trust and is least like it.

## What does this article not cover?

It names no product. The category is young and the vendor landscape reshuffles faster than any comparison stays true, so a list would be stale before it was useful.

It cites two measurement studies as preprints, because that is what they are. Neither has cleared peer review. They are here for their stated sample and method, not for a journal's authority, and the second found 7.2% of 1,899 open-source servers carrying a general vulnerability and 5.5% carrying MCP-specific tool poisoning ([arXiv 2506.13538](https://arxiv.org/abs/2506.13538)).

It offers no breach statistic for agent deployments. Those studies measure configuration exposure, not realized incidents, and treating one as the other would overstate what anyone knows.

And it does not solve indirect prompt injection, because nothing does. Narrowing what the agent can reach shrinks the blast radius. It does not remove the vector, and a layer that claims otherwise is selling comfort.
