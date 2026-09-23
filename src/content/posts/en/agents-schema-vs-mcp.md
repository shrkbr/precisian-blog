---
title: "Agents Schema and MCP: not competing standards, and the difference that matters"
description: "Fivetran's own FAQ answers 'Do I need MCP?' with 'No. MCP is one option.' They are layers, not rivals. The real difference is governance."
slug: "agents-schema-vs-mcp"
lang: "en"
translationKey: "agents-schema-vs-mcp"
publishedAt: 2026-10-06
tags: ["agents-schema", "mcp", "data-standards"]
draft: false
llmSummary: "Agents Schema publishes metadata tables inside the warehouse; MCP is a transport for tools. Fivetran's FAQ states MCP is optional and its README calls Agents Schema narrower. The difference is governance: MIT and single-vendor at v0.0.11, versus Apache 2.0 under a Linux Foundation entity."
citations: ["https://www.opendatainfrastructure.com/agents-schema", "https://github.com/dbt-labs/agents_schema", "https://raw.githubusercontent.com/dbt-labs/agents_schema/main/README.md", "https://modelcontextprotocol.io/community/governance", "https://modelcontextprotocol.io/specification/versioning", "https://www.fivetran.com/press/fivetran-dbt-labs-complete-merger-to-create-the-data-infrastructure-for-trusted-ai-agents", "https://docs.getdbt.com/docs/dbt-ai/about-mcp"]
about: ["https://en.wikipedia.org/wiki/Data_warehouse", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 6
---

Agents Schema, at version 0.0.11, and the Model Context Protocol, at revision 2026-07-28, are not competing for the same job, and the clearest statement of that comes from Fivetran's own FAQ, which asks "Do I need MCP?" and answers: "No. `AGENTS.*` is just tables, so any agent that can run SQL can read it. MCP is one option; a CLI and a skill work too" ([Agents Schema](https://www.opendatainfrastructure.com/agents-schema)). One publishes context inside the warehouse. The other is a transport for tools. The real difference between them is governance, not function.

> **Agents Schema**: a specification for metadata tables written into a standard `AGENTS` schema inside your own warehouse, so an agent can read context with plain SQL next to the data it reasons over.

## Are these actually competing?

Not according to either party's documentation, and the repository README says so directly.

It describes Agents Schema as "not a replacement for specialized systems, source-native metadata APIs, or development-time tooling," and draws the boundary itself: "Compared with MCP servers, Agents Schema is narrower: it publishes context inside the warehouse, while MCP servers can expose tools, actions, and source-specific workflows" ([README](https://raw.githubusercontent.com/dbt-labs/agents_schema/main/README.md)).

The same company ships an official dbt MCP server, with remote MCP available across dbt platform plans and tools that list and query semantic layer metrics ([dbt docs](https://docs.getdbt.com/docs/dbt-ai/about-mcp)). A vendor does not ship a product against its own standard.

So if you arrived at this page looking for a winner, the honest answer is that the question is malformed. The useful question is which layer solves the problem you actually have.

## What is Agents Schema, precisely?

A set of metadata tables with a defined shape, living in your warehouse.

The specification defines six table families: `AGENTS.ROOT` as the provider registry, plus families for dbt, LookML, OSI, Sigma and skill usage. The repository README compares it to `information_schema`, "but extensible across many providers." The spec carries exactly one hard requirement — uniqueness of the provider-and-key pair in the registry.

It matters that this is two things with one name, and the distinction gets blurred constantly:

- **The specification** is public and MIT licensed, first tagged `v0.0.3` on 28 May 2026 and at `v0.0.11` by 20 August 2026 ([GitHub](https://github.com/dbt-labs/agents_schema)). Still a 0.x.
- **Fivetran Context Layer** is the commercial service built on it, announced as Private Beta on 16 September 2026.

Writing about the spec as though it were the product, or the reverse, produces an article that is wrong in both directions.

## What does MCP do that Agents Schema does not?

It carries actions, not just context.

Agents Schema answers "what does this data mean" by putting the answer where SQL can reach it. MCP answers "what can this agent do" by defining how a client and a server negotiate tools, with the full apparatus around that: input validation, access control, rate limiting on tool invocation, and a recommendation that a human remain able to deny an invocation.

Those are different problems. An agent that needs to know which column holds net revenue is served by a table. An agent that needs to run a job, write a record, or reach a system outside the warehouse needs a protocol.

The interesting consequence is that they stack. Fivetran's own September announcement describes Context Layer as reachable "via preferred MCP or AI tools," which is the stack working as designed rather than a concession.

## Where does the real difference sit?

In how each one is governed. Both are described as open, and the published artifacts show two materially different meanings of the word.

| | Agents Schema | Model Context Protocol |
|---|---|---|
| License | MIT | Apache 2.0 |
| Copyright holder | Fivetran, Inc. | contributions under the project |
| Governing body | none published | "a Series of LF Projects, LLC" |
| Change process | none published | Specification Enhancement Proposals |
| Maintainer model | not documented | four-tier ladder; **no seats reserved for companies** |
| Current version | `v0.0.11` (Aug 2026) | `2026-07-28` |
| Versioning | semver, pre-1.0 | date string, bumped only on breaking change |

The MCP side of that table comes from its published [governance document](https://modelcontextprotocol.io/community/governance) and [versioning policy](https://modelcontextprotocol.io/specification/versioning). The Agents Schema side comes from the repository's own LICENSE and CONTRIBUTING files — the latter covering technical contribution and saying nothing about who decides what enters the specification.

This is an observation about documents that exist, not a claim about anyone's intentions. A single-vendor specification can be excellent, move faster, and serve users well. But the two are open in different senses, and a team adopting one should know which sense applies, because that is what determines what happens when your needs and the vendor's roadmap diverge.

## How did we get here?

Quickly, which is part of why the landscape is confusing.

Fivetran and dbt Labs announced an all-stock merger agreement on 13 October 2025 and completed it on **1 June 2026**, with the combined company describing itself as "the data infrastructure for trusted AI agents" ([Fivetran](https://www.fivetran.com/press/fivetran-dbt-labs-complete-merger-to-create-the-data-infrastructure-for-trusted-ai-agents)). Agents Schema was announced at completion, and the dbt Fusion engine was open-sourced as dbt Core v2.0 under Apache 2.0 at the same moment.

The first spec tag predates the merger announcement by four days. MCP's current revision landed on 28 July 2026. Context Layer reached Private Beta on 16 September 2026. That is an entire competitive landscape forming inside sixteen months, which is worth remembering when reading anything written about it more than a quarter ago.

## Which should you adopt?

Depends on which problem is actually blocking you, and for most teams the answer is neither, yet.

**If your agent gives inconsistent answers about the same metric**, your problem is upstream of both. No transport and no metadata table fixes an undefined metric — that is what a [semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/) is for, and both of these standards assume you have one.

**If your definitions exist and agents cannot find them**, Agents Schema is the lighter answer, because publishing tables requires no new service.

**If agents need to do things**, not just read, you need MCP or something like it, and you need the access controls that come with it — starting with the role the connection uses, which is where [multi-tenant setups usually fail](https://precisian.io/blog/en/posts/per-tenant-isolation-mcp/).

**If you are choosing between vendors**, the governance table above is the more durable input. Function converges; governance does not.

## When is neither the answer?

When the data underneath is not modeled.

Both standards are distribution mechanisms for context that has to already exist. Adopting either against unmodeled tables produces a faster path to a confident wrong number, which is worse than the slow path, because it scales. The work that has to happen first is unglamorous and does not have a standard: deciding what net revenue means, writing it down, and naming who arbitrates it.

## What does this article not cover?

It does not evaluate Fivetran Context Layer, which is in Private Beta and which I have not used. It does not benchmark either standard, and it does not cover implementation.

Two limits on what is asserted here. The MCP project's documentation makes no reference to Agents Schema anywhere I could find, and I take that as absence of evidence rather than evidence of a position. And the September announcement's reference to integrations through Anthropic is Fivetran's statement; I did not find a corresponding statement from the other side, so it appears here attributed rather than as a joint fact.

There is also no practitioner counter-perspective in this article. I looked for one, and the two independent analyses I found were unreachable. A comparison built only from the parties' own documentation has that limitation by construction, and you should weigh it accordingly.

If your agents disagree about a number, neither of these standards is your first move. Write the definition down first. [Book a conversation about your case](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).
