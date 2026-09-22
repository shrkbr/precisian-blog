---
title: "What actually goes into a semantic layer, field by field"
description: "A semantic layer is where your metric definitions live in a form a machine reads before it computes. Not a tool: a set of written decisions."
slug: "what-goes-into-a-semantic-layer"
lang: "en"
translationKey: "semantic-layer-contents"
publishedAt: 2026-09-23
tags: ["semantic-layer", "metric-contract", "ai-data-access"]
draft: false
llmSummary: "A semantic layer stores a business's metric rules in a versioned file every system reads before computing, so all of them return the same number. It holds entities, dimensions and metrics. In an April 2026 benchmark, supplying it as context raised accuracy from 45.5-50.5% to 67.7-68.7%."
citations: ["https://docs.getdbt.com/docs/build/semantic-models", "https://docs.getdbt.com/docs/build/metrics-overview", "https://arxiv.org/abs/2604.25149", "https://cube.dev/use-cases/llm-and-ai-semantic-layer"]
about: ["https://en.wikipedia.org/wiki/Semantic_layer", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
---

A semantic layer is the place where your metric definitions live in a form a machine reads before it computes anything. It is not a tool and not a dashboard: it is a set of decisions, written down and versioned. In an April 2026 benchmark across three frontier models, supplying those definitions as context raised answer accuracy from 45.5–50.5% to 67.7–68.7% ([Rumiantsau and Fokeev, 2026](https://arxiv.org/abs/2604.25149)).

> **Semantic layer**: the translation of business rules into data, stored in a versioned file and queryable by machine, so that every system reporting a metric reads the same definition.

## What is a semantic layer, without the metaphor?

Most writing on this topic stops at "it translates technical data into business terms." That is accurate and useless, because it does not tell you what to do on Monday.

Concretely: there is a file. It says that *net revenue* is the sum of orders in `invoiced` status, minus cancellations and returns, excluding shipping and sales tax, dated on the invoice. The file has history, an author, and a date. When the marketing team, the finance BI, and the AI agent each ask "what was net revenue last month," all three read that file before computing.

That is the whole idea. The hard part was never technical. It was getting someone to decide and write it down.

## What exactly goes inside one?

Three blocks, in the vocabulary [dbt](https://docs.getdbt.com/docs/build/semantic-models) consolidated and the market adopted.

**Entities.** What a row is: an order, a customer, a session. This is what lets systems join tables without somebody inventing the join path at query time.

**Dimensions.** How you slice: channel, state, category, date. And critically **which** date, because order, payment, and revenue recognition are three different dimensions that usually share one name.

**Measures and metrics.** The number and the rule that produces it. The [dbt docs](https://docs.getdbt.com/docs/build/metrics-overview) distinguish four types: simple, ratio, cumulative, and derived. That distinction matters because ratio and cumulative are where nearly every disagreement lives. *Average order value* is a ratio, and two people dividing different things arrive at two equally defensible numbers.

| Block | The question it answers | Where it goes wrong |
|---|---|---|
| Entity | What counts as one row? | Invented joins, the same sale counted twice |
| Dimension | How do I slice it? | Three dates sharing one name |
| Measure | What is the number? | Gross and net under one label |
| Metric | What is the rule? | Ratios with different denominators |

## Why doesn't a wiki page count as a semantic layer?

Because the definition has to sit in the path of the calculation, not beside it.

A Confluence page describing net revenue stops nobody from computing it differently. It depends on a person remembering to open it, and on an agent having been pointed at it. What makes a semantic layer a semantic layer is that **the system cannot answer without going through it**.

That is the practical test: if you can produce the number while ignoring the document, the document is documentation. The difference shows up the day somebody new joins, or the day an agent starts answering on its own, which is when an implicit definition becomes [metric hallucination](https://precisian.io/blog/en/posts/metric-hallucination/), the right arithmetic over the wrong rule.

It is worth pressing on "versioned," which reads like bureaucracy and is half the value. When a rule changes, and it will, you need to know the date it changed and who decided. Without that, a time series quietly becomes two regimes stitched together: June computed under the old rule, July under the new one, and the 8% drop in between is an artifact of definition rather than a fact about the business. Teams hunt for market explanations of variances that were born when somebody fixed a filter.

With history, that investigation takes a minute. You open the definition log, find the change date, and compare only within each regime. Without history it takes a week and sometimes ends in a confident wrong answer, which is worse than no answer.

There is a second reason the file has to be machine-readable rather than prose, and it has become the dominant one. A person reading a wiki page can resolve an ambiguity by asking a colleague. An agent cannot. When an LLM is handed a raw schema and a question, it has to reconstruct your join paths, your filters and your metric rules from column names, on every single prompt, and it will do so confidently and inconsistently. Giving it a governed set of definitions to select from replaces that reconstruction with a lookup.

That is why the same artifact serves two audiences that used to need different things. The semantic layer your analysts wanted for consistency is the same one your agents need for correctness, and building it twice was never necessary. The work you defer is the same work either way, only more expensive later.

## How do you write the first metric contract?

Start with one metric, and pick the most contested one. Four fields are enough, plus one that is not technical.

Here is a filled-in contract for *net revenue* at a US DTC brand selling through its own store and Amazon, which is where the argument usually starts.

| Field | Value |
|---|---|
| **Name** | `net_revenue` — retires "net sales" and "real revenue" |
| **Rule** | Sum of orders in `invoiced` status, minus cancellations and returns |
| **Shipping** | Excluded |
| **Sales tax** | Excluded (it varies by nexus and is not revenue) |
| **Discounts** | Included, already deducted |
| **Returns** | Deducted on the return date, not the order date |
| **Amazon** | Included, deduplicated on the source `order_id` |
| **Governing date** | Invoice date |
| **Owner** | Controller |

Written down, "wait, are you counting shipping?" disappears. And the second, more valuable thing surfaces: the points where the team did **not** agree and nobody had noticed. Returns landing on the return date rather than the order date, for instance, changes every closed month going backward. That is a business decision, not an engineering one, which is exactly why the owner field exists.

The owner is the part teams skip and the part that decides whether this survives. A metric contract without a named arbiter is a suggestion, and it drifts back apart the following quarter.

Once the first one exists, the second takes a quarter of the time. The cost is in settling the format and finding who decides, not in typing.

## When do you not need one yet?

When there is a single source. One store, one system, one report: the definition can live in one person's head at no cost, because there is no second version to conflict with.

The threshold arrives with the second source describing the same number, or the second person answering the same question. Before that, writing metric contracts is ceremony. After it, every quarter without them costs rework, and the cost grows in an unpleasant way. What increases is not the effort of writing the definition, it is the pile of reports, dashboards, and automations already built on the implicit one, each of which has to be checked when the rule finally gets written.

At Precisian the semantic layer sits over a per-client isolated data lake and is delivered through an open API and an MCP server, so consumption happens in the AI and the BI your team already uses. What is included and where pricing starts are on the [pricing page](https://precisian.io/en/pricing), and the architecture is described at [precisian.io](https://precisian.io/en).

## What does this article not cover?

It does not compare semantic layer vendors, and it does not cover implementation in any specific tool. The entity, dimension, and metric vocabulary follows dbt's because it became common language, not because it is the only one.

One honest limit on the number cited: the April benchmark measures answer accuracy with and without semantic context. It does not measure financial return, and this article claims none.

If two teams in your company report different numbers for the same metric, the first step is not picking a tool. It is writing one metric contract for the most contested metric and naming its owner. [Book a conversation about your case](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).
