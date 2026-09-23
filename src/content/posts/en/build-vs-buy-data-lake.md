---
title: "Build or buy a data lake: only one side publishes prices"
description: "S3 storage is US$ 0.023 per GB-month from a published table. The managed side documents the model and not the rate."
slug: "build-vs-buy-data-lake"
lang: "en"
translationKey: "build-vs-buy-data-lake"
publishedAt: 2027-01-09
tags: ["data-lake", "custo", "governanca"]
draft: false
llmSummary: "Build versus buy for a data lake is asymmetric in information: AWS publishes S3 at US$ 0.023 per GB-month for the first 50 TB, while managed platforms document their pricing model without the rate. What decides it is connector coverage and who absorbs maintenance."
citations: ["https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonS3/current/us-east-1/index.json", "https://docs.cloud.google.com/bigquery/docs/best-practices-costs", "https://docs.snowflake.com/en/user-guide/cost-understanding-compute", "https://airbyte.com/pricing", "https://fivetran.com/docs/core-concepts/usage-based-pricing", "https://docs.airbyte.com/integrations/connector-support-levels", "https://www.getdbt.com/resources/state-of-analytics-engineering-2026"]
about: ["https://en.wikipedia.org/wiki/Data_lake", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
---

The most useful difference between building and buying is not price. It is that only one side publishes one. You can compute the cost of your own lake from open official tables: S3 storage in North Virginia costs **US$ 0.023 per GB-month** for the first 50 TB, from a price file published 18 September 2026 ([AWS Price List API](https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonS3/current/us-east-1/index.json)).

On the managed side, Fivetran does not publish its per-MAR rate on the pages that describe the model, Snowflake refers credit value to a separate document, and Databricks serves its pricing page as JavaScript with no figures in the HTML.

> **What the asymmetry means**: one option can be modelled before you commit, and the other requires a conversation with sales to produce a number. That is a real difference in decision quality, separate from which is cheaper.

## What does the build side actually cost?

Three meters, all published, all computable in advance.

**Storage** is the cheapest and the easiest to forecast. At the rate above, a terabyte of raw event data costs roughly twenty-three dollars a month, and raw e-commerce events compress well.

**Compute** depends on which warehouse model you chose, and the two dominant models behave differently under the same workload. BigQuery bills by bytes scanned, and it is worth knowing that on non-clustered tables "applying a LIMIT clause to a query doesn't affect the amount of data that is read" ([Google](https://docs.cloud.google.com/bigquery/docs/best-practices-costs)). Snowflake bills by warehouse uptime and size ([Snowflake](https://docs.snowflake.com/en/user-guide/cost-understanding-compute)).

**Movement** is where teams under-forecast. Getting data from each source into the lake is either a connector you maintain or a connector you rent, and this is the line that decides the whole comparison.

## What does the buy side actually cost?

Unknown until you ask, which is itself the finding.

Fivetran documents that its pricing is usage-based, measured in monthly active rows ([Fivetran](https://fivetran.com/docs/core-concepts/usage-based-pricing)). What the pages describing that model do not carry is the rate per MAR. So you can understand the mechanism precisely and still not compute a bill.

Airbyte publishes a pricing page ([Airbyte](https://airbyte.com/pricing)) and, more usefully for a build decision, publishes connector support levels, which distinguish certified connectors from community ones ([Airbyte](https://docs.airbyte.com/integrations/connector-support-levels)). That second document is the one to read before assuming a source is covered.

The pattern is consistent across the category: the model is documented, the rate is not. That is a legitimate commercial choice and it has a consequence for you: a build-versus-buy spreadsheet where one column is derived from published tables and the other from a sales quote is not comparing like with like, and the quote is negotiable in a way the AWS price file is not.

## So which is cheaper?

The wrong question, and the one every comparison answers.

At low volume, managed almost always wins, because the fixed cost of building is engineering time and engineering time is expensive at any volume. At high volume, the managed meter grows with your data while your engineering cost does not, so the lines cross somewhere.

Where they cross depends on variables nobody else has: how many sources, how unusual they are, how much your row volume grows, and what an engineer costs you. Anyone publishing a crossover point is publishing their own situation.

What is worth computing is the **shape**, not the number. Model your managed cost at three volumes: current, double, and five times. If the curve is uncomfortable at five times and your growth plan says five times, you have learned something real without needing a quote.

## What actually decides it, then?

Three things, and price is rarely first.

**Connector coverage for your specific sources.** A managed platform covers the long tail of common SaaS tools and rarely covers a regional marketplace, a local ERP or an in-house system. If half your sources need custom connectors anyway, you are building regardless, and the managed platform becomes a partial solution at a full price.

**Who maintains the breakage.** Source APIs change. Someone absorbs that work. With managed, it is the vendor for covered sources and you for the rest. With build, it is always you. This is the cost that never appears in the comparison and always appears in the calendar.

**Whether you need the raw event.** Managed platforms are optimised for replicating tables. If your requirement is to keep raw events for questions nobody has asked yet, check specifically that your configuration does that, because a pipeline that stores a pre-aggregated summary makes future questions unanswerable no matter how much you paid.

## What does the industry actually do?

Mixed, and the honest answer is that there is no dominant pattern worth copying.

dbt Labs publishes an annual survey of analytics engineering practice ([dbt](https://www.getdbt.com/resources/state-of-analytics-engineering-2026)), which is the best available window into how teams are organised, and it is a vendor-run survey of a self-selecting population, which I note because it matters for how much weight to put on it.

What is observable without a survey is that most non-trivial operations end up hybrid: managed connectors for the common SaaS sources, custom extraction for the ones nobody supports, one warehouse underneath. The build-versus-buy framing is largely a false binary, and teams that treat it as one spend the decision period arguing instead of shipping the half that was never in question.

## What breaks either way?

The same three things, which is a useful argument against expecting the decision to solve them.

**Silent extraction failures.** A connector that throttles and partially succeeds writes a partial day, and a partial day looks like a slow day. Managed platforms fail this way too; the difference is whose dashboard shows it, and whether anyone is watching that dashboard at 3am. [Detecting this is its own discipline](https://precisian.io/blog/en/posts/detect-silently-broken-data-pipeline/), and neither purchase includes it.

**Definitions that never got written.** Moving data does not decide what revenue means. A pipeline that lands orders in a warehouse where two teams compute revenue differently has relocated [the disagreement between marketing and finance](https://precisian.io/blog/en/posts/marketing-finance-revenue-definition/) rather than resolved it, and relocating it into a more expensive system is a common outcome of this project.

**The source that returns nothing useful.** Some sources do not emit what you need, at any price. A marketplace that publishes no traffic origin will not start because you bought a better connector. Confirming what each source actually returns, before selecting a platform, prevents the most demoralising version of this project: a working pipeline delivering data that cannot answer the question that justified it.

Worth budgeting for all three explicitly, because none of them appears in a vendor comparison and all three appear in the first quarter.

## What should you decide first?

Not the platform. The retention and the grain.

Decide what you will keep, for how long, and at what granularity, before deciding who moves it. Those three choices determine your storage bill, your ability to answer future questions, and whether a managed platform's default configuration is even acceptable.

They also outlive the tooling decision. Platforms get swapped; a decision to keep only aggregates for two years cannot be undone, because the detail was never stored. That is the irreversible part of this project, and it is usually made implicitly by whoever configures the first connector.

Then decide movement, which is reversible, and which is where the pricing asymmetry above actually bites.

## What does this article not cover?

It gives no total cost of ownership figure. That depends on your source count, volume, growth and engineering rates, and any published number describes somebody else's operation.

It does not quote managed-platform rates, because the pages describing their models do not carry them. Quoting a figure from a third-party blog would be repeating a number nobody stands behind.

It does not compare specific warehouses on price. The two billing models described here are structurally different enough that a per-unit comparison is meaningless without a workload, and your workload is the input nobody else has.

And it does not tell you which to choose. The decision turns on connector coverage for your sources and who absorbs maintenance, both of which are facts about your stack rather than about the products.
