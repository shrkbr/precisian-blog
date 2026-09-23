---
title: "Answer lineage: auditing what an AI agent actually read"
description: "The chat transcript records what was said, not what was true. Lineage links an answer to the definition and data behind it."
slug: "answer-lineage-audit-trail"
lang: "en"
translationKey: "answer-lineage-audit-trail"
publishedAt: 2026-12-29
tags: ["mcp", "governanca", "camada-semantica"]
draft: false
llmSummary: "Answer lineage is the record linking an AI agent's answer to the definition and data that produced it: caller identity, tool and arguments, definition version, data extent and timestamp. MCP recommends logging tool usage for audit but does not require it."
citations: ["https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization", "https://modelcontextprotocol.io/specification/2026-07-28/server/tools", "https://owasp.org/www-project-mcp-top-10/", "https://code.claude.com/docs/en/security"]
about: ["https://en.wikipedia.org/wiki/Data_lineage", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 6
---

Answer lineage is the record that lets you reconstruct, afterwards, which definition and which data produced a number an AI agent delivered. It is not the conversation log and not the chat history: it is the link between an answer and its origin. The Model Context Protocol recommends that clients log tool usage "for audit purposes" ([MCP, revision 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)), which is a recommendation rather than a requirement, and almost nobody implements it.

> **Answer lineage**: the set of records that can answer, about an answer already given, who asked, which definition was applied, which data was read, and when.

## Why isn't the chat history enough?

Because it records what was said, not what was true.

A transcript tells you the agent reported revenue of a certain amount. It does not tell you which table that came from, which definition of revenue was applied, what date range was actually used after any clamping, or how fresh the underlying data was at that moment. Those four facts are what an investigation needs, and none of them is in the conversation.

There is a second problem with transcripts: they are produced by the same system whose output is in question. An agent's account of what it did is generated text, not an execution record. Using it as evidence is circular in a way that becomes obvious the first time it matters.

The record has to come from the layer that executed, not the layer that narrated.

## What does a usable trail contain?

Five fields, and the list is shorter than most governance frameworks suggest.

| Field | Answers |
|---|---|
| **Caller identity** | who asked, as a real person rather than a service account |
| **Tool and arguments** | what was requested, with the parameters actually used |
| **Definition version** | which rule computed the number |
| **Data extent** | which rows or range were read, and their freshness |
| **Timestamp** | when, so the state of the data can be reconstructed |

The third and fourth are the ones usually missing, and they are the ones that make the difference between a log and a lineage. Knowing that a tool called `revenue_by_period` on a Tuesday afternoon tells you nothing if revenue was redefined last quarter and you cannot tell which version ran.

## Why does identity break first?

Because most deployments run the agent under a service credential, and the warehouse logs that credential.

The result is a log that says the agent asked, which is the one fact nobody needed. The question in any real investigation is which person's request caused the read, and a shared credential erases exactly that.

The specification closes one shortcut here: it **forbids token passthrough**, stating that "the MCP server MUST NOT pass through the token it received from the MCP client". The stated reason is precisely this one, that passthrough breaks the trail because the downstream service logs the wrong origin.

So identity has to be propagated deliberately, by design rather than by forwarding a credential. That usually means a per-caller token validated at the server, with the real identity attached to the query as metadata the warehouse records. It is not difficult. It is just work that nobody schedules until after the first question they cannot answer.

## What does the specification actually require?

Less than you would want, which is worth knowing before assuming coverage.

Logging for audit is a **SHOULD** for clients, not a MUST. Servers **MUST** validate tool inputs, implement access controls, rate limit invocations and sanitize outputs, but the specification does not mandate a lineage record. It also tells clients they **MUST** treat tool annotations as untrusted unless the server is trusted, which means a server's own description of what it logged is not evidence either.

The OWASP MCP Top 10 project catalogues the risk categories in this space ([OWASP](https://owasp.org/www-project-mcp-top-10/)), and the shape of that list is itself informative: the failures are operational and configurational rather than protocol-level, which is another way of saying the protocol assumes you will build this.

One more boundary worth stating plainly. The model vendor does not audit the server you connect it to. Anthropic says about its own directory that it reviews connectors against listing criteria "but does not security-audit or manage any MCP server" ([Anthropic](https://code.claude.com/docs/en/security)). Whatever trail exists is yours to produce.

## When will you actually need it?

Three moments, and all three arrive without warning.

**A number in a board deck is challenged.** Somebody asks where it came from. Without lineage, the honest answer is that an agent produced it from data that has since changed, which is not an answer anyone accepts.

**An agent reads something it should not have.** The question becomes what exactly was in the context. If the log records tool names but not the rows returned, you can say which tool ran and not what it exposed, which is the half of the answer that does not help.

**A definition changes and historical reports need reinterpreting.** If revenue was redefined in March, every answer given before and after used a different rule, and without a version stamp you cannot tell which reports need revisiting. This is the most common case and the least dramatic, which is why it goes unplanned.

## How much of this can you build this quarter?

More than the framing suggests, because the useful subset is small.

**Start by recording the definition version with every answer.** If you have [a semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/), it already knows which specification produced the number, and emitting that alongside the value is a change to the output schema rather than a project.

**Add data extent next.** The maximum timestamp behind the result and the row count are two fields that turn "the number looked wrong" into "the number was computed over a stale table", which is a diagnosis rather than a suspicion.

**Then fix identity.** This one is genuinely more work, because it touches authentication, but it is also the one that cannot be retrofitted onto past queries. Every month it waits is a month of logs that will never answer who asked.

**Leave full row-level capture for last, or never.** Recording everything an agent read is expensive in storage and in privacy exposure, and it is rarely what an investigation needs. Extent and version usually suffice.

## Does this conflict with data minimisation?

It creates a tension worth naming rather than pretending away.

An audit trail is itself data about people: who asked what, when, about which customers. Retaining it indefinitely is its own exposure, and a lineage system that logs query contents may be storing personal data in a second place with weaker controls than the first.

The workable position is to log **structure rather than content**: which definition, which extent, which identity, which timestamp, without the returned rows. That answers the questions investigations actually ask while keeping the trail from becoming a shadow copy of the database.

And it deserves its own retention policy, set deliberately, rather than inheriting whatever default the logging infrastructure came with.

## What does this article not cover?

It recommends no tooling. The category is young, and implementations differ more in what they capture than in how they present it, which makes a feature comparison misleading.

It gives no incident statistic for agent deployments. What exists measures configuration exposure rather than realized incidents, and treating one as the other overstates what anyone knows.

It does not address regulatory retention requirements, which vary by jurisdiction and by data category, and which your counsel answers from the instrument rather than from an article.

And it does not claim lineage prevents anything. It makes an answer reconstructible after the fact. Preventing the wrong answer is [a different guarantee](https://precisian.io/blog/en/posts/trusted-data-layer-for-ai-agents/), and confusing the two produces a system that can explain its failures beautifully.
