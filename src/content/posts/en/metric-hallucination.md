---
title: "Metric hallucination: why your AI reports a different number than your dashboard"
description: "Metric hallucination is AI computing correctly on a definition nobody wrote down. Supplying the definition raised accuracy from 45.5% to 67.7%."
slug: "metric-hallucination"
lang: "en"
translationKey: "metric-hallucination"
publishedAt: 2026-09-17
tags: ["metric-hallucination", "semantic-layer", "ai-data-access"]
draft: false
llmSummary: "Metric hallucination is the numerically correct, semantically wrong answer an AI agent produces when it must infer a business definition the schema does not encode. In an April 2026 benchmark across three frontier models, supplying those definitions raised accuracy from 45.5-50.5% to 67.7-68.7%."
citations: ["https://arxiv.org/abs/2604.25149", "https://arxiv.org/abs/2411.07763", "https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027", "https://cube.dev/use-cases/llm-and-ai-semantic-layer"]
about: ["https://en.wikipedia.org/wiki/Hallucination_(artificial_intelligence)", "https://en.wikipedia.org/wiki/Semantic_layer", "https://precisian.io/datalake/"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
---

Metric hallucination is what happens when an AI agent returns an arithmetically correct number based on a business definition your company never wrote down. The model did not invent the data. It guessed the rule. In a paired benchmark published in April 2026 across three frontier models, supplying those business definitions as context raised answer accuracy from 45.5–50.5% to 67.7–68.7% ([Rumiantsau and Fokeev, 2026](https://arxiv.org/abs/2604.25149)).

> **Metric hallucination**: a numerically correct and semantically wrong answer, produced when a model has to infer a business definition that the database schema does not encode.

## What is metric hallucination?

The term was coined by [Cube](https://cube.dev/use-cases/llm-and-ai-semantic-layer), which sells semantic layers. The name matters more than it looks, because without it the failure gets filed as "the AI got it wrong," which leads teams to swap models instead of fixing data.

You ask "what was revenue last month?" Four columns could answer that: gross sales from the storefront, net of returns, what the ERP recognizes, and what the ad platforms claim. The question does not say which. Neither does the schema. The agent picks one, computes it correctly, and hands you a number.

The number is right. The answer is wrong.

## How is this different from model hallucination?

Model hallucination is the familiar case: the system asserts a fact that does not exist, like a customer who never bought or a source that was never published. That is a generation failure, and it improves with a better model.

Metric hallucination does not improve with a better model, because the model did not get anything wrong. The information it needed was never available to it.

| | Model hallucination | Metric hallucination |
|---|---|---|
| What the system does | Invents a fact | Picks one definition among several plausible ones |
| The arithmetic | Wrong or fabricated | Correct |
| Where the failure lives | In the model | In the data, which does not encode the business rule |
| How you catch it | Check whether the fact exists | Check which definition was used, which almost nobody does |
| What fixes it | Better model, grounding, verification | A written, versioned, machine-readable definition |

The two failures call for opposite investments. Treating the second like the first means changing AI vendors to solve a data modeling problem, and the number is still wrong after the switch.

## What happens when the agent finds two columns named "revenue"?

It breaks the tie on its own, silently, and does not record that it did.

The size of this problem on real schemas has been measured. [Spider 2.0](https://arxiv.org/abs/2411.07763), published in November 2024, assembled 632 query problems drawn from enterprise database use, on databases that frequently exceed 1,000 columns. The same model that solves 91.2% of the previous academic benchmark solves 21.3% once the schema belongs to an actual company.

The gap between 91.2% and 21.3% comes from the schema, not the model: it is the same model in both cases. The larger the database grows, the more meaning stays implicit, and the more the agent has to guess in order to answer anything at all.

Four silent tiebreakers show up most often.

**Which date wins.** Order date, ship date, or revenue recognized under ASC 606 and its international counterpart, [IFRS 15](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/). A DTC brand shipping in three days barely notices the spread. The same brand selling a twelve-month subscription will see the three definitions diverge by an entire quarter, and only on part of the catalog, which is the hardest kind of error to spot.

**What goes in and what stays out.** Shipping, discounts, returns, and sales tax. Tax is the one that bites hardest in the US, because nexus rules make it vary by state, so the same order carries a different tax line depending on where it shipped. There is no universally correct answer here, only the one your finance team uses. If that is not written down, the agent picks whatever the column name suggests.

**What counts as a "new customer."** First purchase with the brand, first purchase in the channel, or first purchase inside the period being analyzed. All three show up in the wild, sometimes inside the same report at the same company.

**The same order in two systems.** Shopify and Amazon return the same sale with different identifiers. With no written deduplication rule, the agent adds them up, and the month's revenue comes out inflated with flawless arithmetic.

## Why does the wrong answer sound more confident than the right one?

Because the agent has nowhere to record its doubt. A human analyst asks "gross or net?" before answering. The agent resolves the ambiguity internally and delivers the result in the same tone as everything else.

The authors of the April benchmark trace both failures to one origin: wrong answers and confident hallucinations come from forcing the model to infer business semantics the schema does not encode ([Rumiantsau and Fokeev, 2026](https://arxiv.org/abs/2604.25149)). Their intervention is deliberately modest, a 4 KB markdown document describing measures, conventions, and disambiguation rules. That text moved accuracy by 17 to 23 percentage points, with no model change and no new tooling.

While a person asks the question and sanity-checks the result against what they know about the business, the error gets caught. Once the same question runs inside a Monday morning automation, nobody checks, and the wrong definition becomes a time series.

Gartner projected in June 2025 that more than 40% of agentic AI projects will be canceled by the end of 2027, citing cost, unclear business value, and inadequate risk controls ([Gartner, 2025](https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027)). Unclear business value is what you get when nobody can say whether the agent's answer is correct.

## How do you know if this is already happening?

Three checks, in order of effort. None requires new tooling, and all three produce the same deliverable: a list of the definitions that currently live only in somebody's head. That list is where the fix starts, and it is usually shorter than people fear.

**Ask the same question twice, in separate sessions.** If the numbers differ, the agent is breaking the tie on the fly, and the tiebreak is not stable.

**Ask for the definition alongside the number.** "What was revenue last month, and which rule did you use?" If the answer describes the rule in prose instead of citing a registered definition, it was assembled on the spot.

**Give the same question to the agent and to someone who knows the business, without either seeing the other's answer.** The distance between them is the size of what is implicit.

We spent six months trying to plug an agent into unmodeled data before accepting this diagnosis. The agent pulled from anywhere, because there was no indicator mapping and no data audit, so it did not know where to pull from. The conclusion we reached was that the problem was never AI. It was data. The fix is to write the definitions somewhere versioned and auditable, and have the agent read from there. That is what [Precisian](https://precisian.io/en) delivers: a versioned semantic layer over a per-client isolated data lake, reachable through an open API and an MCP server, so consumption happens inside the AI your team already uses. What is included and where pricing starts are on the [pricing page](https://precisian.io/en/pricing).

## What does this article not cover?

This article does not cover implementation in any specific tool, and it does not compare semantic layer vendors. It also does not address model hallucination, which is a different problem with a different fix.

One honest limit on the data cited: the April benchmark measures accuracy with and without semantic context. It does not publish an isolated hallucination rate per model, so this article does not claim one. Anyone who needs that cut will have to measure it in their own operation.

If two reports inside your company disagree and nobody can say which is right, start by inventorying which definitions are implicit, before picking any agent. [Book a conversation about your case](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).
