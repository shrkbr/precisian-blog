---
title: "What is data lineage, and how do you trace a marketing metric back to its source?"
description: "Data lineage maps a number from source to report. dbt's column-level lineage shows the columns, but not the filter that changed the result."
slug: "data-lineage-marketing-metrics"
lang: "en"
translationKey: "data-lineage"
publishedAt: 2026-10-23
tags: ["data-lineage", "governance", "audit", "roas"]
draft: false
llmSummary: "Data lineage records which sources and transformations produced a number. The OpenLineage spec models a WHERE filter as indirect lineage; dbt's column-level lineage, per its docs updated Oct 1, 2026, does not reflect joins or filters."
citations: ["https://openlineage.io/docs/", "https://openlineage.io/docs/spec/object-model", "https://openlineage.io/docs/spec/facets/dataset-facets/column_lineage_facet", "https://docs.getdbt.com/docs/explore/column-level-lineage", "https://docs.getdbt.com/reference/dbt-jinja-functions/ref", "https://support.google.com/google-ads/answer/3123169"]
about: ["https://en.wikipedia.org/wiki/Data_lineage", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 6
---

Data lineage is the record of the path a number took: which source tables it came from, which transformations it passed through, and which rule produced it. The open [OpenLineage](https://openlineage.io/docs/) specification, a graduated LF AI & Data Foundation project at version 1.54.0 in October 2026, models that path with three entities: dataset, job and run. For a marketing metric, lineage is what answers "which orders is this ROAS built on?"

> **Data lineage**: a machine-maintained map of the dependencies between sources, transformations and outputs, which lets you start from a published number and work back to the rows and rules that produced it.

For marketing, one passage in dbt's documentation decides whether lineage is any use. The documentation, updated October 1, 2026, says column-level lineage "reflects the lineage from `select` statements" and "doesn't reflect other usage like joins and filters" ([dbt, column-level lineage](https://docs.getdbt.com/docs/explore/column-level-lineage)). In marketing metrics, the discrepancy usually lives in exactly that filter.

## How does data lineage work in practice?

There are two ways to produce lineage, and most tools use one or both.

**Declared in code.** In dbt, each model points at the models it depends on through the `ref` function. The docs say dbt uses those references "to automatically build the dependency graph," which is how it knows the run order ([dbt, ref](https://docs.getdbt.com/reference/dbt-jinja-functions/ref)). Lineage falls out as a side effect: if your ROAS model refs your orders model, the dependency is on record without anyone drawing it.

**Emitted at runtime.** In the [OpenLineage object model](https://openlineage.io/docs/spec/object-model), each run of a job emits events listing its input and output datasets. A job is "a process that consumes or produces Datasets"; a run is "an instance of a Job" at a point in time. Lineage here is a history of what actually executed, not only what the code declares.

Both approaches also split by grain. **Table-level** lineage tells you the ROAS table depends on the orders table. **Column-level** lineage tells you `attributed_revenue` comes from `orders.total_price`. The second is more useful and costs more: in dbt it requires an Enterprise plan with Catalog access, or strict static analysis if you run it locally ([dbt](https://docs.getdbt.com/docs/explore/column-level-lineage)).

## How do you trace a ROAS figure back to its source?

Take the ROAS for one campaign in Monday's report. Its full lineage answers four questions, and each one is a different stage of the path.

**Which orders?** Is the revenue in the numerator the conversion value the ad platform reported, the order Shopify recorded, or the net sale your accounting system booked after refunds? Three different source tables.

**From which platform?** If Google Ads and Meta both claim the same Shopify order, it lands in the sum twice. That is the mechanism behind [ROAS that adds up to more than actual revenue](https://precisian.io/blog/en/posts/roas-exceeds-actual-revenue/).

**Over which window?** In Google Ads, the click-through conversion window defaults to 30 days, can be set anywhere from 1 to 90, and a change only applies to conversions going forward ([Google Ads Help](https://support.google.com/google-ads/answer/3123169)). A trend line that crosses the change blends two regimes.

**With which exclusions?** Do canceled orders come out? Refunds? Is shipping in? Sales tax?

The table below uses round, synthetic numbers, labeled as such, to show how one ROAS moves depending on which stage of the path it was computed at.

| Lineage stage | Decision made | Revenue in numerator | ROAS on $10,000 spend |
|---|---|---|---|
| Source: platform-reported conversions | 30-day window, no deduplication | $60,000 | 6.0 |
| Join to store orders | Only orders that exist in Shopify | $48,000 | 4.8 |
| Status filter | Canceled and refunded orders removed | $41,000 | 4.1 |
| Revenue rule | Shipping and sales tax excluded | $37,000 | 3.7 |

The VP of ecommerce sees a single number. Without lineage, nobody can say which of those four rows it came from.

## Why doesn't column-level lineage show the filter?

Because to a SQL parser, `attributed_revenue` comes from `orders.total_price` in all four rows. What changes between them is the `WHERE` and the `JOIN`, which is precisely what [dbt's column-level lineage](https://docs.getdbt.com/docs/explore/column-level-lineage) says it does not reflect.

The OpenLineage spec handles this differently. In its [column lineage facet](https://openlineage.io/docs/spec/facets/dataset-facets/column_lineage_facet), a transformation is **direct** when the output value is derived from the input, and **indirect** when the input affects the output without being its source. The indirect subtypes include `FILTER`, an input "used as a filtering condition (e.g. `WHERE` clause)", and `JOIN`, an input "used in join condition."

In a graph that only records direct lineage, `financial_status` never shows up as a dependency of ROAS. It contributes no value to the number; it only decides which rows get in. In the example above, that filter alone takes seven thousand dollars out of the numerator.

Before you trust the lineage graph your tool draws, check whether it records the column that filtered or only the column that got summed.

## How is data lineage different from an audit trail or a data contract?

The three terms travel together in governance conversations, and they answer different questions.

| Criterion | Data lineage | Audit trail | Data contract |
|---|---|---|---|
| Question it answers | Where did this number come from? | Who queried what, and when? | What does this table promise to deliver? |
| Object | Dependencies between sources, transformations and outputs | Access and query events | Shape, guarantees and meaning of a dataset |
| When it's produced | At pipeline build or run time | At the moment of access | Up front, as an agreement between producer and consumers |
| Typical failure | Graph with no filters and no joins | Chat history standing in for a query log | Primary key declared and never enforced |
| Further reading | This article | [Answer lineage and audit trails](https://precisian.io/blog/en/posts/answer-lineage-audit-trail/) | [What is a data contract](https://precisian.io/blog/en/posts/what-is-a-data-contract/) |

Lineage looks backward from the output. An audit trail looks at who accessed it. A contract looks forward, at what the table is supposed to uphold. A mature stack runs all three, and none of them covers for a missing one.

## What isn't data lineage?

**It isn't a catalog.** A catalog lists which tables exist and what each column means. Lineage connects them. You can have a spotless catalog and still not know which table feeds which.

**It isn't data quality.** Lineage traces the path of a wrong number as faithfully as a right one. Knowing whether the pipeline delivered an empty or stale table is a separate job, covered in [how to tell if your data pipeline broke, or just lied](https://precisian.io/blog/en/posts/detect-silently-broken-data-pipeline/).

**It isn't the metric definition.** Lineage tells you ROAS passed through a status filter. Whether refunded orders should come out is a business decision, and that decision belongs in a [semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/), versioned and owned.

**It isn't a hand-drawn diagram.** A flowchart from 2024 on a wiki describes the pipeline that existed in 2024. Lineage that isn't generated by the code or the runs themselves goes stale on the first deploy.

## When does lineage start to matter for an ecommerce team?

With one source and one person answering for the numbers, lineage fits in the head of whoever built the report. Not having it written down costs little.

That changes at three points, and any one is enough:

1. **When a second source starts reporting the same number.** Your Shopify store plus Amazon, or two ad platforms claiming the same order.
2. **When the number moves and nobody changed anything.** An attribution window edited, a new order status, a field renamed in the ERP. Without lineage, every investigation starts from zero.
3. **When an AI agent starts answering on its own.** A person who sees a 6.0 ROAS gets suspicious and asks. An agent returns it with its usual confidence. If there's no way to get from the answer back to the rows and the rule that produced it, nobody can challenge it, and the error becomes [metric hallucination](https://precisian.io/blog/en/posts/metric-hallucination/): correct arithmetic on the wrong definition.

At Precisian, each customer's data sits in an isolated data lake on Precisian's infrastructure, and metric definitions are versioned in the semantic layer. Whatever does the asking, whether the customer's own AI through the MCP server, the API or their BI tool, reads the same rule. "Which filter was this ROAS computed with?" has a written, dated answer.

## What does this article not cover?

It doesn't compare lineage tools or catalogs. It doesn't walk through implementing OpenLineage in Airflow, Spark or dbt, which shifts with every release: the [project docs](https://openlineage.io/docs/) listed version 1.54.0 on October 23, 2026.

And the ROAS example here is synthetic. The four values show the mechanism; they don't estimate the gap at any real business.

If the ROAS in your report doesn't match what finance sees and nobody can say at which stage the two split, the first step is to trace one number back to its source orders, filter by filter. [See how that works in practice](https://precisian.io/en/demo): no contract commitment, but no promise of an answer in 30 minutes either.
