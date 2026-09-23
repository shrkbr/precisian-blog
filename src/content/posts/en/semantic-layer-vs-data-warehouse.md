---
title: "Semantic layer vs data warehouse: they don't compete"
description: "One stores and computes; the other defines what is being computed. There is no NOT NULL for semantics."
slug: "semantic-layer-vs-data-warehouse"
lang: "en"
translationKey: "semantic-layer-or-warehouse"
publishedAt: 2026-12-19
tags: ["camada-semantica", "data-warehouse", "governanca"]
draft: false
llmSummary: "A data warehouse stores data and runs queries; a semantic layer defines what each metric means so every system reads the same rule. The warehouse can hold definitions as SQL but cannot enforce their use, and no database constraint covers meaning."
citations: ["https://docs.getdbt.com/docs/build/semantic-models", "https://docs.getdbt.com/docs/build/about-metricflow", "https://docs.cloud.google.com/bigquery/docs/best-practices-costs", "https://docs.snowflake.com/en/user-guide/cost-understanding-compute", "https://arxiv.org/abs/2604.25149"]
about: ["https://en.wikipedia.org/wiki/Semantic_layer", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
---

A semantic layer and a data warehouse do not compete: one stores and computes, the other defines what is being computed. The confusion exists because vendor material puts both in the same sentence, and because you can operate without the second, badly. In an April 2026 test across three frontier models, supplying business definitions as context raised answer accuracy from **45.5–50.5% to 67.7–68.7%** ([Rumiantsau and Fokeev](https://arxiv.org/abs/2604.25149)).

> **Data warehouse**: where data is stored and queries execute. **Semantic layer**: where it is written down what each metric means, so that every system reporting it reads the same rule.

## What does each one actually own?

Different questions, with almost no overlap once you separate them.

| | Data warehouse | Semantic layer |
|---|---|---|
| Answers | where is the data, how fast can I read it | what does this metric mean |
| Enforces | types, permissions, partitions | definitions, dimensions, grain |
| Fails as | slow or expensive queries | two teams defending two numbers |
| Changed by | a data engineer | whoever owns the metric |
| Consumed by | every query | every query, before it runs |

The last row is the one people miss. A semantic layer is not a reporting tool sitting next to the warehouse. It sits in front of it, translating a request for "revenue" into the specific SQL that the organisation has agreed represents revenue.

## Can't the warehouse just hold the definitions?

It can hold them as SQL. It cannot enforce that everyone uses that SQL.

You can materialise a `fct_revenue` table encoding the agreed rule, and that helps. What it does not do is prevent the next person from writing their own aggregation against the underlying orders table, because nothing stops them. The definition exists; its use is voluntary.

And warehouse constraints do not cover meaning at all. Shape is enforced at build time and rows at query time, under a correctly configured role, but no database mechanism prevents a column called `revenue` from meaning gross in one table and net in another. Both pass every validation. There is no `NOT NULL` for semantics, which is [also why a data contract does not close this gap](https://precisian.io/blog/en/posts/what-is-a-data-contract/).

The semantic layer's contribution is making the agreed definition the *path of least resistance* rather than a document somebody should have read.

## What does a semantic layer look like in practice?

Specifications, not dashboards.

In dbt's implementation, you define semantic models describing entities, dimensions and measures over your existing tables, then define metrics on top of them ([dbt](https://docs.getdbt.com/docs/build/semantic-models)). A query engine then assembles the correct SQL for a requested metric and grain, rather than the analyst assembling it by hand ([MetricFlow](https://docs.getdbt.com/docs/build/about-metricflow)).

Two consequences follow, and they are the practical payoff.

**The same metric at different grains is one definition, not many.** Revenue by day, by channel and by cohort come from one specification, so they cannot drift apart. In hand-written SQL, each is a separate query and each can be wrong independently.

**Invalid combinations can be refused.** If a measure has no meaningful relationship to a dimension, the layer can say so, instead of returning a number that computes cleanly and means nothing.

## Does it reduce cost or increase it?

Both, in different places, and the net depends on how your team works today.

It adds compute in one sense: a request goes through a translation step and produces SQL that may not be the cheapest possible hand-tuned query. It removes compute in a larger sense, by eliminating the exploratory scans people run while figuring out how revenue is supposed to be calculated.

The warehouse pricing model determines which effect dominates. On BigQuery, the bill follows bytes scanned, and it is worth knowing that on non-clustered tables "applying a LIMIT clause to a query doesn't affect the amount of data that is read" ([Google](https://docs.cloud.google.com/bigquery/docs/best-practices-costs)). On Snowflake, cost follows warehouse uptime and size rather than bytes ([Snowflake](https://docs.snowflake.com/en/user-guide/cost-understanding-compute)).

So the same semantic layer that saves money on a scan-billed platform by generating tighter filters may save nothing on a time-billed one, where what matters is how long a warehouse stays awake. Anyone promising cost savings without asking which model you are on is guessing.

## How do you know you need one?

Three symptoms, and none of them is "we have a lot of data".

**Two reports disagree and both are defensible.** Someone pulls revenue for a period, someone else pulls the same period, the numbers differ, and the investigation finds no bug because there is none. Both queries were correct against different interpretations. This symptom alone justifies the work.

**A new analyst takes weeks to produce a trustworthy number.** Not because the SQL is hard, but because the knowledge of which table, which filter and which exclusion is in people's heads. Onboarding time is a direct measure of how much definition lives outside the system.

**Nobody can say when a metric changed.** If the definition of revenue was adjusted last year, and there is no record of when or by whom, then every year-over-year comparison crossing that date is comparing two definitions. That is not a reporting problem; it is a missing version history for a business rule.

Teams with none of these three probably do not need a layer yet. Teams with all three have been paying for one in analyst hours for a while, without the artifact.

## What does it cost to skip?

The cost is real and it hides in places nobody attributes to definitions.

It shows up as reconciliation work, where somebody spends the first days of every month explaining a difference that was structural. It shows up as decisions deferred because two numbers are in play and nobody wants to choose. And it shows up as rework, when a report is rebuilt because the original used the wrong interpretation and nobody noticed until a quarter later.

None of those appear on a budget line called "missing semantic layer". They appear as analyst time, which is why the problem persists: it is expensive without ever being visibly expensive.

## Which should you build first?

The warehouse, because the layer has nothing to sit on otherwise. But the ordering question is usually asked too late.

The failure pattern is consistent: a team builds the warehouse, connects reporting, and discovers eighteen months later that four teams have four revenue definitions encoded in four places. The semantic layer then arrives as a migration rather than a foundation, and migrations are where these projects die.

A cheaper sequence exists. While building the warehouse, write the definitions down in plain language: what revenue means, what an order means, which channels are in scope for each. That document is not a semantic layer, and it is the input to one. Teams that have it can adopt a layer in weeks; teams that do not spend those weeks arguing before they can start.

## Does an AI agent change the answer?

It changes the urgency, not the architecture.

A human analyst who receives an odd number hesitates and checks. That hesitation was doing unwritten work. An agent computes over whichever column it finds and [answers at its usual confidence](https://precisian.io/blog/en/posts/metric-hallucination/), so a definitional ambiguity that used to cause a meeting now causes a decision.

The accuracy study above measures exactly that gap closing. Note also what it does not show: even with definitions supplied, accuracy landed near two-thirds rather than near certainty. The layer removes a category of error. It does not make the agent reliable, and treating it as though it did is how a governance project becomes a liability.

## What does this article not cover?

It names no vendor as a recommendation. Implementations differ substantially in how they express metrics and what they refuse, and the category moves faster than a comparison stays accurate.

It cites the accuracy study as a preprint, which it is. It is here for its paired design and stated numbers, not for a journal's authority, and the result should be read as a direction rather than a benchmark for your data.

It gives no cost figure for adopting a semantic layer. That depends on your warehouse pricing model, your query mix and how much definitional rework you are carrying, and any published number describes somebody else's configuration.

And it does not claim a semantic layer resolves disagreements about what a metric *should* be. It makes the current answer explicit and consistent. Deciding that answer is an organisational act with an owner, and no tool performs it.
