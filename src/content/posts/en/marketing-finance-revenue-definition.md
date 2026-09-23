---
title: "Marketing and finance never close the same revenue number"
description: "Both numbers are right. The accounting standard recognises revenue on transfer of control; marketing measures at checkout."
slug: "marketing-finance-revenue-definition"
lang: "en"
translationKey: "same-revenue-definition"
publishedAt: 2026-10-24
tags: ["camada-semantica", "divergencia-de-dados", "governanca"]
draft: false
llmSummary: "Marketing and finance disagree on revenue because the accounting standard recognises revenue when the customer obtains control of the good, not when they pay. Different events, different dates. A data contract protects shape, not meaning: there is no NOT NULL for semantics."
citations: ["https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/", "https://docs.getdbt.com/reference/resource-properties/constraints", "https://support.google.com/analytics/answer/10596866"]
about: ["https://en.wikipedia.org/wiki/Revenue_recognition", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

Two teams export revenue for the same month and the numbers differ. Neither made a mistake. Finance follows a five-step model, effective for annual reporting periods beginning on or after 1 January 2018, that governs when revenue may be recognised ([IFRS Foundation](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/)). Marketing measures at checkout. Different events, different dates, both defensible.

Most attempts to fix this fail at the first move, because they treat a definitional difference as carelessness. Nobody is going to talk the controller into recognising revenue earlier.

## What does the accounting standard actually require?

Recognition when the customer obtains control, not when the customer pays.

The wording is specific. An entity "recognises revenue when a performance obligation is satisfied by transferring a promised good or service to a customer (which is when the customer obtains control of that good or service)", in an amount reflecting "the consideration to which the entity expects to be entitled" ([IFRS Foundation](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/)).

For a physical-goods business, control often transfers **on delivery**. An order placed on 28 September and delivered on 3 October is October revenue to finance and September revenue to marketing.

There is no error to find. There are two clocks.

## How many definitions of revenue does one company hold?

More than anyone expects, and all of them are defensible.

| Definition | Who uses it | When it counts |
|---|---|---|
| Order value at checkout | media, analytics | at the purchase event |
| Orders less cancellations | operations | days later |
| Orders less returns | commercial | weeks later |
| With or without shipping | varies by team | same instant |
| Gross or net of tax | finance vs marketing | same instant |
| Recognised revenue | accounting | on transfer of control |

Six readings of one month. None invented. Each answers a different question, and each becomes "revenue" the moment someone exports a spreadsheet without a label.

The problem is not that six exist. It is that all six share a word.

## Why doesn't better reporting fix it?

Because the divergence is not in the data. It is in the name.

A number without its definition attached is a number the next reader will reinterpret. When marketing sends "revenue: $1.4M" and finance answers "I have 1.26", both exported correctly from correct systems. What failed to travel alongside the number was the sentence saying **what was counted**.

It is the same structural failure that makes [a platform and an analytics tool never agree](https://precisian.io/blog/pt-BR/posts/vtex-ga4-nao-batem/) (in Portuguese), and that makes [summed ROAS exceed actual revenue](https://precisian.io/blog/en/posts/roas-exceeds-actual-revenue/). In each case two systems measure similar things under different rules, and nobody wrote the rules anywhere both of them read.

## Doesn't a data contract cover this?

No, and this is the most common misconception among teams who have started organizing their data properly.

[A data contract](https://precisian.io/blog/en/posts/what-is-a-data-contract/) protects shape: column name, type, nullability. That is real and worth having. But no database constraint prevents `revenue` from meaning gross in one table and net in another. Both pass every validation. Both are `numeric`. Both are correct according to the contract.

The guarantees are also weaker than most teams assume. On Snowflake, BigQuery and Redshift, a primary key declared in a contract exists "for metadata purposes only", and the model builds even when building it violates the constraint ([dbt](https://docs.getdbt.com/reference/resource-properties/constraints)). If the warehouse will not enforce key uniqueness, it certainly will not enforce what a column means.

Meaning is not a data type. There is no `NOT NULL` for semantics.

## Why does this get worse with an agent in the loop?

Because the safety mechanism that used to catch it was human doubt.

An analyst who sees an odd revenue figure hesitates, asks a colleague, checks the export. That hesitation was doing real work, and it was never written down anywhere. An agent has no equivalent. It answers with whichever column it finds, at its usual confidence, and [the wrong answer arrives formatted exactly like the right one](https://precisian.io/blog/en/posts/metric-hallucination/).

Worse, the agent is often reading a tool that already applied a model. GA4, for instance, states that "all attribution models exclude direct visits from receiving attribution credit, unless the path to key event consists entirely of direct visits" ([GA4](https://support.google.com/analytics/answer/10596866)). That is a defensible choice, and it is also a transformation the agent will not mention unless something makes it.

When the consumer of a number cannot doubt, the definition has to live in the system rather than in the reader's judgment.

## So how do you close the gap?

By reconciling, not by unifying. Forcing both teams onto a single number is the approach that fails.

**Pick one official number per question, not one official number.** "How much did we sell" and "how much may we recognise" are different questions with different answers. Collapsing them into one field destroys information.

**Ship the definition with the number, every time.** Every report carries its slice: gross revenue on paid orders, excluding shipping and tax, by order date. The sentence matters more than the value, because the value without it cannot be audited.

**Measure the difference instead of hiding it.** A monthly bridge between the marketing number and the finance number, with a line for each step (cancellations, returns, shipping, tax, delivery lag), turns a recurring argument into a four-line report. When the bridge fails to close, there genuinely is an error, and you know where to look.

**Name an owner.** A definition without one diverges again within a quarter, because the next person who needs a number will invent theirs.

## Which of the two mistakes costs more?

Using the marketing number to decide money.

Revenue measured at checkout is excellent for optimizing campaigns: it arrives fast, it is granular, and its bias is roughly constant within the month. The damage starts when that same number becomes the basis for commission, quota or cash forecasting, because it has not yet survived cancellations, returns or transfer of control.

The reverse happens too, and it is quieter. Using the accounting number to judge campaigns means acting on data that arrives too late to correct spend, and delivery lag pushes a campaign's results into the following month, which leads competent people to switch off the thing that was working.

Each number serves a decision. The mistake is not having two. It is using one outside its job, which happens because both are called "revenue" in the spreadsheet.

## What about revenue that arrives through a marketplace?

It needs a seventh row, on a clock of its own.

When the sale happens on a marketplace, there is a gross order value the buyer paid and a net remittance that reaches your account, on a date that is not the order date. Marketing reporting usually sees the full amount. The bank statement sees the remittance. The difference is commission, and it is nobody's error: it is how the channel works.

Add that many of these channels return no traffic-source field at all, and you have a slice of revenue that agrees with the rest of the report neither by definition nor by attribution.

The practical handling is the same as everything else here, with one addition: marketplace revenue needs its own field from day one. Teams that push it into the same `revenue` column as the direct store lose the ability to explain the difference later, and that explanation is exactly what gets asked for.

## Who decides, in practice?

Someone with the authority to overrule a team's preferred number, which is rarely the person who owns the pipeline.

This is where most attempts quietly die. Data engineering can build the bridge, publish the definitions and wire up the semantic layer, but it cannot tell the commercial team that its favorite figure is now called something else. That decision is organizational, and if it is never made, every technical fix gets reverted by the first person who needs a number in a hurry.

The workable pattern is narrow: one named owner per metric, a written definition, and a rule that changing it is a reviewed change rather than a conversation. It sounds bureaucratic for exactly one metric. It is, and one metric is where it should start.

## Where should the definition live?

In one place that both the human query and the agent read before computing.

That is the job of a [semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/): the business rule stops being a verbal agreement between people and becomes a versioned definition the system applies. Whoever asks for "revenue" receives the defined revenue, not the interpretation of whoever wrote that day's query.

A cheap test tells you whether you are there. Ask two people on different teams for last month's revenue, without saying why, and compare. If the figures match, a definition is alive somewhere. If they differ, you have just measured the cost of the problem for free, and you have the concrete example you needed to open the conversation with whoever decides.

## What does this article not cover?

It offers no accounting guidance. Recognition depends on the contract, the delivery terms and the structure of the operation, and the people who answer that are your accountants, working from the standard itself. What is here is the consequence for the data, not the rule.

It quotes [IFRS 15](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/) rather than the US codification for a specific reason: the FASB site refuses automated retrieval outright, so I could not read its exact wording at source. Rather than quote a converged standard secondhand, I quoted the one I could verify, and I am telling you which one it is.

It also carries no statistic on how many companies run conflicting definitions. I found no survey with a stated methodology, and an invented number inside an article about invented numbers would be an expensive irony.
