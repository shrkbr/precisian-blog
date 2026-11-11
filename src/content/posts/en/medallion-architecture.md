---
title: "Medallion architecture: bronze, silver, gold, and what still sits above gold"
description: "Medallion architecture sorts lake data into bronze (raw), silver (validated) and gold (business-ready). Gold holds tables; it doesn't define your metrics."
slug: "medallion-architecture"
lang: "en"
translationKey: "medallion-architecture"
publishedAt: 2026-11-11
tags: ["data-lake", "semantic-layer", "pipeline", "ecommerce", "data-warehouse"]
draft: false
llmSummary: "Medallion architecture is a data design pattern that moves data through bronze (raw), silver (validated) and gold (enriched) layers. Databricks docs, updated October 29, 2026, call it a recommended best practice, not a requirement, and note some teams run several gold layers."
citations: ["https://docs.databricks.com/aws/en/lakehouse/medallion", "https://learn.microsoft.com/en-us/fabric/onelake/onelake-medallion-lakehouse-architecture", "https://docs.databricks.com/aws/en/uc-semantics/metric-views", "https://shopify.dev/docs/api/usage/access-scopes"]
about: ["https://en.wikipedia.org/wiki/Data_lakehouse", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
cta: newsletter
---
Medallion architecture is a data design pattern that moves data through three layers of increasing quality: bronze (raw), silver (validated) and gold (enriched for business use). The [Databricks documentation](https://docs.databricks.com/aws/en/lakehouse/medallion), last updated October 29, 2026, calls it "a recommended best practice but not a requirement," and notes that "some customers create multiple gold layers to meet different business needs, such as HR, finance, and IT."

> **Medallion architecture** (also called *multi-hop architecture*): "a data design pattern used to organize data logically," whose goal is "to incrementally and progressively improve the structure and quality of data as it flows through each layer," from bronze to silver to gold ([Databricks](https://docs.databricks.com/aws/en/lakehouse/medallion), accessed November 11, 2026).

Every source in this piece was read on November 11, 2026. Microsoft uses the same pattern as "the recommended design approach" for Microsoft Fabric, and its page links back to the Databricks one ([Microsoft Learn](https://learn.microsoft.com/en-us/fabric/onelake/onelake-medallion-lakehouse-architecture), revised February 12, 2026).

## What happens in the bronze, silver and gold layers?

Databricks sums up each layer in one line: bronze is "raw data ingestion," silver is "data cleaning and validation," gold is "dimensional modeling and aggregation." The details are what decide what you can do later.

| Layer | What happens (Databricks) | Intended users (Databricks) | Example for a Shopify brand |
|---|---|---|---|
| **Bronze** | Raw ingestion, minimal validation, full history | Data engineers, data operations, compliance and audit | Shopify order payloads and daily Meta Ads and Google Ads reports, exactly as they arrived |
| **Silver** | Schema enforcement, nulls, deduplication, late-arriving data, type casting, joins | Data engineers, analysts, data scientists | One row per order, one time zone, normalized status, Amazon orders matched to the same customer as web orders |
| **Gold** | Dimensional models, measures, domain aggregates | Business analysts, BI developers, executives | Daily sales by channel, ad spend by campaign, repeat rate by cohort |

**Bronze.** Databricks says this layer "contains and maintains the raw state of the data source in its original formats," is appended incrementally, and "enables reprocessing and auditing by retaining all historical data." It recommends storing most fields "as string, VARIANT, or binary to protect against unexpected schema changes." Analysts aren't supposed to query it.

**Silver.** The docs say Databricks "does not recommend writing to silver tables directly from ingestion," because schema changes or corrupt records at the source would break the load. Silver reads from bronze. It "should always include at least one validated, non-aggregated representation of each record," which, in retail, means one row per order before anything gets summed.

**Gold.** This is where, per the docs, you model data "by establishing relationships and defining measures." Databricks' own example is a materialized view called `weekly_bookings` that sums `total_amount` as `total_revenue`, grouped by week, property and `status`.

## What does medallion architecture look like for an ecommerce brand?

Microsoft's Fabric guide uses an ecommerce example. Bronze holds raw website sales (JSON), warehouse inventory (CSV) and a CRM SQL export. Silver will "standardize date formats across all sources," "convert all currency to USD," "remove test transactions" and "match customer records across systems." Gold builds a daily sales table, a customer lifetime value table and an inventory forecasting table ([Microsoft Learn](https://learn.microsoft.com/en-us/fabric/onelake/onelake-medallion-lakehouse-architecture)).

Map that onto a brand selling on Shopify and Amazon, buying Meta and Google ads, and silver is where the arguments happen:

- the same shopper has a Shopify customer ID and an Amazon order with no shared key;
- authorized-but-not-captured payments, test orders and draft orders land in bronze looking like sales;
- every ad platform reports conversions in its own attribution window and its own time zone.

The layer order is the same question as [ETL vs ELT](https://precisian.io/blog/en/posts/etl-vs-elt/): medallion is an ELT design, where data lands raw and gets transformed inside the lake, in steps you can rerun.

## Why doesn't the gold layer decide what revenue means?

Because gold stores tables, and the business rule that produces a number usually ends up scattered across them.

Go back to the Databricks example. `weekly_bookings` sums `total_amount` and keeps `status` as a column. The table is fine. Whoever queries it still has to decide whether a cancelled booking counts as revenue. One analyst filters cancellations out, another doesn't, and the AI agent reading the table picks on its own. That makes three different numbers, and all three come from gold.

The docs open the door to this themselves with multiple gold layers for HR, finance and IT. Run a marketing gold and a finance gold, and "revenue" now has two definitions, each certified by the layer's name. That's the gap described in [how marketing and finance end up with different revenue](https://precisian.io/blog/en/posts/marketing-finance-revenue-definition/).

Databricks answered it with a separate feature that sits above gold. Unity Catalog metric views exist, per the [docs](https://docs.databricks.com/aws/en/uc-semantics/metric-views) (updated October 29, 2026), because "standard views lock in aggregations and groupings at creation time." With a metric view, "you define the metric once" and any consumer can group by any field. That's a [semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/): a versioned definition every tool reads before it calculates.

## Is medallion architecture the same as a data lake, a data warehouse or a semantic layer?

No. They're different kinds of things, and they often show up in the same sentence.

| | Medallion architecture | Data lake | Data warehouse | Semantic layer |
|---|---|---|---|---|
| What it is | A layering pattern | Raw storage, schema on read | Structured storage, schema on write | Versioned definitions of metrics and entities |
| What it holds | Nothing on its own; it organizes the lake | Everything, in source format | Modeled tables | Rules, not rows |
| Answers "what is revenue?" | No. Each gold can have its own | No | Only if a table hard-codes the rule | Yes, that's its job |
| Where you see it | Bronze, silver and gold schemas in a lake or lakehouse | Object storage | Warehouse platform | Definition files read by BI, APIs and agents |

Microsoft shows how the lines blur: one pattern it documents keeps bronze and silver in a lakehouse and puts gold in a data warehouse ([Microsoft Learn](https://learn.microsoft.com/en-us/fabric/onelake/onelake-medallion-lakehouse-architecture)). The storage side is covered in [data lake vs data warehouse for ecommerce](https://precisian.io/blog/en/posts/data-lake-vs-warehouse-ecommerce/); the definition side in [semantic layer vs data warehouse](https://precisian.io/blog/en/posts/semantic-layer-vs-data-warehouse/).

## What isn't medallion architecture?

**It isn't mandatory.** Databricks calls it a recommendation, not a requirement. Three layers is a convention; some teams run two, some run a gold per department.

**It isn't a product.** Nobody buys "a medallion." It's a naming and staging convention for schemas, tables and pipeline steps inside a platform.

**It isn't a guarantee of correct data.** Silver checks formats, nulls and duplicates. It doesn't know your company only books revenue on shipped orders.

**It isn't a consumption layer.** Gold feeds BI, agents and automations, but tells none of them how to read the column. Without that rule written down, an AI answers fluently on a criterion nobody signed off on, which we call [metric hallucination](https://precisian.io/blog/en/posts/metric-hallucination/).

## When is it worth layering your data?

When you need to recompute a number from source data the source no longer returns. Shopify's `read_orders` scope only reaches "orders created within the last 60 days"; older orders need `read_all_orders` on top of it ([Shopify](https://shopify.dev/docs/api/usage/access-scopes), accessed November 11, 2026). If your revenue rule changes next year, only a bronze copy lets you recompute last year under the new rule. How long each source keeps its data is in [how long to keep marketing data](https://precisian.io/blog/en/posts/marketing-data-retention-how-long/).

A synthetic example with round numbers: a brand decides that orders refunded within 7 days no longer count as sales. Without bronze, history already aggregated in gold keeps the old rule, and the series breaks the month the rule changed. With bronze, silver gets reprocessed and the whole series follows one rule.

When it isn't worth it: one store, one ad platform, and questions that fit inside native reports. Three layers for one source is maintenance with no question to justify it.

## Where does Precisian fit?

Precisian delivers a data lake isolated per client, on Precisian's infrastructure, with the full contract history and a semantic layer on top. How the internal layers are organized doesn't change what matters to the client: revenue has one definition, versioned and approved by them, read by their own AI, API or BI tool. The infrastructure is ours, the data is yours. You can access it any time, and if you leave, you take all of it.

## What does this article not cover?

It doesn't compare table formats (Delta, Iceberg, Parquet), ingestion frequency or compute cost; the Databricks page has its own table on continuous versus batch ingestion. It doesn't teach metric view syntax, which lives in the [docs](https://docs.databricks.com/aws/en/uc-semantics/metric-views). And it doesn't say who coined the term: Databricks documents it and Microsoft points to Databricks, but neither page dates its origin.

---

If your team already has a gold layer and marketing and finance still land on different revenue, start by listing how many gold tables compute revenue and which status filter each one applies. What changed, what broke and what Precisian's research measured lands every two weeks, on Thursdays, in [Precisian's newsletter](https://precisian.io/en/newsletter?utm_source=blog&utm_medium=cta&utm_campaign=medallion-architecture&utm_content=texto).
