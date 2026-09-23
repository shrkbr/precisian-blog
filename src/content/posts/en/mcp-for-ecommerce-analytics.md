---
title: "MCP for e-commerce analytics: expose questions, not tables"
description: "The spec makes tools model-controlled and tool annotations untrusted. Your tool surface is the security boundary."
slug: "mcp-for-ecommerce-analytics"
lang: "en"
translationKey: "mcp-ecommerce-data"
publishedAt: 2026-11-17
tags: ["mcp", "camada-semantica", "governanca"]
draft: false
llmSummary: "For e-commerce analytics over MCP, expose tools with closed input schemas over a modelled slice rather than table access. The spec makes tools model-controlled, requires clients to treat tool annotations as untrusted, and makes authorization optional."
citations: ["https://modelcontextprotocol.io/specification/2026-07-28/server/tools", "https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization", "https://www.postgresql.org/docs/current/ddl-rowsecurity.html"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
---

The specification contains a sentence that should govern your whole design: clients "**MUST** consider tool annotations to be untrusted unless they come from trusted servers" ([MCP spec, revision 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)). The description you write is not a behavioral guarantee to anyone. Only what the tool **does** is a guarantee.

That single line settles the most common architectural question. Your tool surface is your security boundary, because the model, not you, chooses what to call.

> **Expose tools, not access.** A `revenue_by_channel` tool with a closed input schema is auditable. An `execute_sql` tool over production is unrestricted access wearing a tool's name.

## Why is exposing tables the wrong default?

Because it hands the model three decisions that were yours.

A tool accepting arbitrary SQL over the whole database transfers table selection, business-rule authorship, and result interpretation in one move. The first becomes an access risk, the second becomes a number that disagrees with finance, and the third becomes [a wrong answer formatted exactly like a right one](https://precisian.io/blog/en/posts/metric-hallucination/).

The spec is explicit about what a server owes. Servers **MUST** "validate all tool inputs", "implement proper access controls", "rate limit tool invocations" and "sanitize tool outputs". None of those obligations is satisfiable when the input is a free-form query.

Tools are also, by design, "**model-controlled**", meaning the language model "can discover and invoke tools automatically based on its contextual understanding and the user's prompts". You are not in the loop at selection time unless you build yourself in.

## What belongs in an e-commerce tool surface?

A modelled slice, shaped as the questions the business actually asks.

| Tool | Closed input | Why this shape |
|---|---|---|
| `revenue_by_period` | start, end, definition | the revenue definition lives on the server, not in the prompt |
| `orders_by_channel` | period, channel, status | explicit status stops cancelled orders counting as sales |
| `top_products` | period, limit | a bounded limit caps query cost |
| `inventory_level` | SKU or category | point lookup, no scan |
| `compare_periods` | two periods, metric | the correct comparison ships assembled |

Five tools answer most of what gets asked, and none of them needs access to any table. What they need is a settled definition of revenue, order and channel, which is the work of a [semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/).

Note the side benefit: that table is also the complete list of what the agent **can** do. Scope review becomes reading five rows instead of reasoning about a query planner.

## What should never reach the server?

Anything the agent does not need to answer the questions you exposed.

The instinct is to load everything "in case it's needed". The practical effect is that whatever sits in context can leave it, and leaving does not require a deliberate exfiltration. It only requires the agent to mention, mid-answer, a figure that particular user should not see.

Three categories belong outside by default, returning only with a reason. **Customer PII**, because revenue by channel does not need to know who bought. **Integration credentials**, because marketplace tokens and gateway keys often live in a config table inside the same schema, and a broad tool reaches them without meaning to. **Cost and margin**, whenever the server also serves an agency or a partner, since margin per product is exactly the field nobody intended to share and nobody remembered to exclude.

Build the slice by inclusion, listing what goes in, rather than by exclusion. An exclusion list always forgets the column added last quarter.

## How does an output schema help?

It converts "I trust the model understood" into "the client validates".

When a tool declares an output schema, servers **MUST** "provide structured results that conform to this schema" and clients **SHOULD** validate against it. The structured result travels in its own field, separate from the text.

In practice, revenue comes back as a number with a declared unit rather than as a sentence. The difference shows when the agent chains steps: a validated number it sums correctly, a sentence it interprets, and interpretation is where the error enters.

The error channel is worth designing too. The spec distinguishes protocol errors from tool execution errors and recommends clients pass the latter to the model "to enable self-correction", with an example message naming exactly what was wrong with the input. A tool answering "invalid date range: end precedes start" produces a corrected retry. A tool answering "error" produces an invention.

## How do you know the agent used the right definition?

By making the tool return what it used, not just what it computed.

This is the gap most implementations leave open. A tool returns `revenue: 142000` and the number enters a report, a summary, or a decision with nothing attached saying which definition produced it. Three months later nobody can reconstruct whether that figure included shipping.

The fix is to put the provenance in the output schema alongside the value: the definition applied, the date range actually used after any clamping, the row count behind the aggregate, and the freshness of the underlying data. All four are cheap to emit and each one answers a question that otherwise becomes an archaeology exercise.

The freshness field earns its place quickly. An agent asked for last week's revenue will happily compute over a table that stopped updating on Tuesday, because a stale table and a current one are indistinguishable from the query's perspective. Returning the maximum timestamp behind the answer lets the caller, human or model, notice the gap that the number itself conceals.

## What does the spec require that almost nobody implements?

Two things, both cheap.

**A human able to refuse.** Verbatim: "For trust & safety and security, there **SHOULD** always be a human in the loop with the ability to deny tool invocations", and applications **SHOULD** "present confirmation prompts to the user for operations".

**Showing inputs before the call.** Clients **SHOULD** "show tool inputs to the user before calling the server, to avoid malicious or accidental data exfiltration".

Both exist for one reason: the model chooses what to call, and the content it reads can contain instructions. In e-commerce, third-party-authored content is everywhere, in campaign names, product descriptions, support tickets and customer reviews.

## Does the protocol handle authentication?

It does not require it, which surprises most newcomers.

The text states that "Authorization is OPTIONAL for MCP implementations" ([MCP spec](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization)). Once you opt in, the requirements tighten: validate that the token was issued for your server as intended audience, never pass through the token received from the client, and declare minimum scope, with the antipattern named as "using wildcard or omnibus scopes".

Underneath, the database rule predates all of this. Use a dedicated read-only role that owns nothing and carries no bypass attribute, because "superusers and roles with the `BYPASSRLS` attribute always bypass the row security system" ([PostgreSQL](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)).

If your tools expose only questions, that care is cheap redundancy. If they expose SQL, it is the only thing between the agent and the database.

## How do you start without a large project?

With one tool, the one behind your most repeated request.

Pick the query somebody asks for every week, usually revenue for a period with one breakdown. Write the definition, close the input schema, declare the output schema, and ship that. One well-made tool delivers more than ten generic ones, because a generic tool hands the user back the job of knowing what to ask for.

Two naming details save pain later. Tool names **SHOULD** run "between 1 and 128 characters" with a restricted character set ([MCP spec](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)). And if you aggregate servers, the spec warns that collisions happen, giving the example of "two servers each exposing a `search` tool", and recommends prefixing with a server identifier.

One last caution: do not put sensitive parameters where intermediaries can read them. Server developers **SHOULD NOT** mark "sensitive parameters (passwords, API keys, tokens, PII)" for mirroring into HTTP headers, because those values are visible to network intermediaries.

## What does this article not cover?

It recommends no MCP server implementation. The field moves faster than any published comparison stays accurate, and a list of names would be stale before it was useful.

It carries no adoption figure for MCP in e-commerce. I found no survey with a stated methodology, and the subject is new enough that any percentage published today rests on a convenience sample.

It does not describe protocol session state, because there is none: the spec states that "MCP has no protocol-level session" and treats continuity as an explicit handle returned by a tool, which it labels non-normative guidance.

And it leaves the legal layer around personal data entirely aside. That sits on top of all of this and deserves its own article.
