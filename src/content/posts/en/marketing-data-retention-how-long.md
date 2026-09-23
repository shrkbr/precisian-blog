---
title: "How long to keep marketing data (GA4 already decided)"
description: "GA4 standard allows 2 or 14 months, and large properties get 2. The aggregate report survives; the exploration does not."
slug: "marketing-data-retention-how-long"
lang: "en"
translationKey: "marketing-data-retention"
publishedAt: 2026-11-28
tags: ["governanca", "ga4", "divergencia-de-dados"]
draft: false
llmSummary: "GA4 standard properties retain user and event data for 2 or 14 months; 26, 38 and 50 months are 360 only, and large properties are limited to 2 months at event level. The setting does not affect standard aggregate reports, only explorations and funnels."
citations: ["https://support.google.com/analytics/answer/7667196", "https://support.google.com/analytics/answer/10596866", "https://docs.getdbt.com/reference/resource-properties/freshness"]
about: ["https://en.wikipedia.org/wiki/Data_retention", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

The question arrives as governance policy and the answer was settled for you. On standard GA4 properties, user and event data can be retained for **2 or 14 months**, and that is the whole menu: the 26, 38 and 50-month options are Analytics 360 only ([Google](https://support.google.com/analytics/answer/7667196)). Once the window passes, "data is deleted automatically on a monthly basis". The paid tier's ceiling is more than three times the free one.

What makes this dangerous is not the limit. It is that the report keeps looking normal after the data beneath it evaporates.

> **Retention is not archiving.** The GA4 window governs the granular data feeding explorations and funnels. The aggregate report keeps answering, with the same number as always, about a period whose detail no longer exists.

## What are the real limits, by data type?

Shorter than almost anyone assumes, and uneven between types.

| Data type | GA4 standard | Analytics 360 |
|---|---|---|
| User data | 2 or 14 months | 2 or 14 months |
| Event data | 2 or 14 months | up to 50 months |
| Age, gender, interest | 2 months, always | 2 months, always |
| Large or XL property | 2 months at event level | per plan |
| Standard aggregate reports | not affected | not affected |

Source: [Google](https://support.google.com/analytics/answer/7667196).

Two rows there overturn common assumptions. Age, gender and interest are fixed at two months with no setting that extends them. And the large-property row means the 14-month ceiling your team believes it has may not exist for your business at all.

## What exactly gets deleted?

Only the part you use when you need to investigate.

The documentation separates the two layers cleanly: "the data retention setting does not affect standard aggregated reports (including primary and secondary dimensions) in your Google Analytics property, even if you create comparisons in the reports" ([Google](https://support.google.com/analytics/answer/7667196)). But it does affect explorations and funnel reports.

In daily terms: the sessions-per-month chart stays, years back. The question "who were those people, where did they come from, what did they do before buying" stops being answerable the moment the window passes.

That is the worst possible shape for a loss, because it produces no error. It produces an empty exploration, which most people read as a filter mistake and retry three times before giving up.

## Are there limits you cannot configure away?

Two, and both hit exactly the businesses with the most data.

The demographic fields are fixed regardless of setting. And large and XL properties are "limited to 2 months" of event-level retention.

Read that second one again. The bigger the store, the smaller the window of granular data it can hold inside the tool. The business that would most need a historical series is the one least able to keep it where it originates.

That is the entire argument for extracting data out of the analytics tool, and it has nothing to do with sophistication. It is about the clock running out.

## So how long should you actually keep it?

The right question is not how long. It is in order to answer what.

A period without a question attached becomes either waste or regret. Three horizons cover most of e-commerce:

| Horizon | For what | Cost of not having it |
|---|---|---|
| **13 months** | comparing against the same month last year | every seasonality read dies |
| **25 months** | comparing two complete peak seasons | you cannot tell a good year from a good market |
| **customer lifecycle** | repeat rate, lifetime value, cohorts | retention analysis becomes estimation |

The third is what usually blows the budget. If your typical repurchase interval is eight months, a fourteen-month window shows one repeat per customer and not a single closed cohort.

And note that **none** of the three fits in two months, which is the ceiling imposed on large properties. Which produces an uncomfortable conclusion for the largest stores: the horizon they need most is the one their own scale denies them inside the tool.

## Where should the policy live?

Somewhere that outlives the person who set it, which rules out their head and their spreadsheet.

Retention is a decision someone makes once and nobody revisits until it hurts. So it needs three things written down: **which purpose justifies the window**, **who owns the decision**, and **when it gets reviewed**. Without the third, the policy ages alongside the business: a window that made sense when the repurchase cycle was three months stays put when it becomes ten.

Record what was discarded too, not only what was kept. The question that most often stalls a future investigation is not "why do we have this", it is "where is the rest". One line stating that browsing events are not retained beyond fourteen months saves a day of searching for data that never existed.

There is a second-order effect that is new. When the consumer of the data is a person, a silent absence produces an odd chart someone questions. When it is an AI agent, the agent averages over whatever it found and [answers at its usual confidence](https://precisian.io/blog/en/posts/metric-hallucination/). The retention window stopped being a governance topic and became an input to answers.

## What belongs outside the analytics tool?

Anything you would need to defend a number more than a year from now.

The split is not sophisticated and it holds up well. Keep inside the tool whatever you only ever read inside the tool: exploratory session analysis, funnel debugging, the questions you ask while looking at a chart. Move outside whatever feeds a decision that gets audited, compared year over year, or recomputed under a different definition later.

In practice that means three things leave. **Orders and revenue**, because those get reconciled against finance and the reconciliation happens after the analytics window closes. **Spend by channel**, because channel comparison is a multi-year question and platforms rewrite their own history when attribution models change. And **the raw event stream**, if you can afford it, because it is the only artifact from which a question you have not thought of yet can still be answered.

What can safely stay is the derived, the exploratory and the demographic, the last one mostly because you have no choice: two months is two months regardless of your architecture.

The cost of moving data out is real and it is mostly engineering time rather than storage, which is cheap at this volume. The cost of not moving it is invisible until the day someone asks a two-year question and the answer is that the data aged out of a tool nobody thought of as temporary.

## How do you find out whether you already lost it?

With a five-minute test, today.

Open an exploration and request a granular slice from fourteen months ago. Not a standard report: an exploration, with a user-scoped dimension. If it comes back empty, the window has already passed and you have just discovered the real limit of your historical series.

Then ask the same question of your own warehouse. If the data was extracted, the question becomes different: was the extractor running during that period, and did it store the raw event or only the pre-aggregated summary?

That second one usually stings. It is common to find that the connector has stored, since forever, the one metric somebody chose when they configured it, and discarded the rest, which makes it impossible to answer any question nobody had thought to ask back then.

This is also where a silent pipeline failure hides. A connector that stopped six weeks ago and a connector that is running against a quiet period look identical in storage, which is why [detecting a broken pipeline](https://precisian.io/blog/pt-BR/posts/como-saber-se-o-pipeline-de-dados-quebrou/) (in Portuguese) is a retention problem as much as an engineering one: what was never captured cannot be retained, and neither absence announces itself.

## What should you store, in practice?

The raw event, with the timestamp of when it was collected.

That rule survives a change of tool, of team and of question. You can reconstruct a summary from events; you cannot reconstruct events from a summary.

Three fields deserve particular discipline. The **native event identifier**, to deduplicate reprocessing. The **status at collection time**, kept as a series rather than overwritten, because overwriting is what erased the cancellation somebody will ask you to explain. And the **collection date**, separate from the event date, which is what lets you reconstruct what you knew at a past moment.

It is also worth watching for the capture stopping. Transformation tools treat this as a first-class check: dbt lets you declare a freshness threshold per source and fail when the newest row exceeds an acceptable age ([dbt](https://docs.getdbt.com/reference/resource-properties/freshness)). Without that alarm, a stalled pipeline is indistinguishable from a slow week until somebody questions the number.

## What does this article not cover?

It does not state GA4's default retention for a new property. The documentation page I read lists the available options and does not say which one ships selected, and I am not going to declare a default the source does not declare. Check your own property, which takes less time than finding the answer.

It does not cover retention on advertising platforms. Each has its own rules and the comparison ages quickly. The pattern to look for is the same: what the dashboard shows in aggregate usually outlives the granular data feeding it.

It gives no legal retention period. Data protection law generally sets principles rather than a number of months, and whoever turns a principle into a policy for a specific business is that business's counsel, not an article.

And it does not treat attribution modelling as retention, though the two interact. GA4 states that "all attribution models exclude direct visits from receiving attribution credit, unless the path to key event consists entirely of direct visits" ([GA4](https://support.google.com/analytics/answer/10596866)), which means the historical series you keep is already modelled before you store it.
