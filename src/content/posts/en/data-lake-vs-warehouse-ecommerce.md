---
title: "Data lake vs data warehouse vs lakehouse for ecommerce and marketing data"
description: "A lake keeps raw data, a warehouse keeps modeled data, a lakehouse puts transactions on open files. None of them defines net revenue."
slug: "data-lake-vs-warehouse-ecommerce"
lang: "en"
translationKey: "lake-vs-warehouse"
publishedAt: 2026-10-14
tags: ["data-lake", "data-warehouse", "ecommerce", "ga4", "semantic-layer", "marketplace"]
draft: false
llmSummary: "A data lake stores raw data on cheap storage; a data warehouse stores modeled data for fast queries; a lakehouse, defined by Armbrust et al. at CIDR 2021, adds ACID transactions and versioning on open files. For ecommerce, none of them defines a metric. That is the semantic layer."
citations: ["https://www.cidrdb.org/cidr2021/papers/cidr2021_paper17.pdf", "https://jamesdixon.wordpress.com/2010/10/14/pentaho-hadoop-and-data-lakes/", "https://iceberg.apache.org/docs/latest/", "https://support.google.com/analytics/answer/9358801", "https://support.google.com/analytics/answer/7029846", "https://support.google.com/analytics/answer/7667196", "https://aws.amazon.com/compare/the-difference-between-a-data-warehouse-data-lake-and-data-mart/", "https://docs.databricks.com/aws/en/lakehouse/"]
about: ["https://en.wikipedia.org/wiki/Data_lake", "https://en.wikipedia.org/wiki/Data_lakehouse", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

A data lake stores raw data exactly as the source sends it, on cheap object storage. A data warehouse stores data that has already been modeled into tables built for fast queries. A data lakehouse puts warehouse features (ACID transactions, versioning, indexing) on top of open lake files, a design Armbrust, Ghodsi, Xin and Zaharia defined at CIDR in January 2021 ([paper](https://www.cidrdb.org/cidr2021/papers/cidr2021_paper17.pdf)). For an ecommerce brand, raw comes first. And none of the three decides what "net revenue" means.

> **Data lake**: a repository that accepts data in the shape the source delivers, with no schema enforced on write; structure is applied when the data is read.
> **Data warehouse**: a repository of integrated, modeled tables with schema enforced on write, optimized for analytical queries.
> **Data lakehouse**: "a data management system based on low-cost and directly-accessible storage that also provides traditional analytical DBMS management and performance features such as ACID transactions, data versioning, auditing, indexing, caching, and query optimization" ([Armbrust et al., CIDR 2021](https://www.cidrdb.org/cidr2021/papers/cidr2021_paper17.pdf)).

## How do the three actually work?

They differ on one decision: when somebody fixes the shape of the data.

In a **data lake**, nobody fixes it on the way in. The Meta Ads API response, the Amazon settlement report and the GA4 export land as they came. James Dixon, then at Pentaho, coined the term in an October 14, 2010 post: if a data mart is bottled water, "cleansed and packaged and structured for easy consumption", the lake is "a large body of water in a more natural state" ([Dixon, 2010](https://jamesdixon.wordpress.com/2010/10/14/pentaho-hadoop-and-data-lakes/)). The flexibility gets paid for later, because every query has to interpret the files again.

In a **data warehouse**, somebody fixes it up front. A Shopify order becomes a row with defined columns, ad spend becomes another table, and the two join on date and channel. Queries are fast because the interpretation happened once.

A **lakehouse** adds a transactional metadata layer over the lake's files. The 2021 paper describes open formats such as Parquet plus a layer that records which files make up a table at each version ([CIDR 2021](https://www.cidrdb.org/cidr2021/papers/cidr2021_paper17.pdf)). In practice that layer is an open table format. Apache Iceberg calls itself "an open table format for huge analytic datasets", with atomic commits, serializable isolation and time travel, so a query can be rerun against the same snapshot ([Iceberg](https://iceberg.apache.org/docs/latest/)).

The paper also says why the third category showed up. In the two-tier setup, data is loaded into the lake and then again into the warehouse; each step "risks incurring failures or introducing bugs", and users "pay double the storage cost" for the copy ([CIDR 2021](https://www.cidrdb.org/cidr2021/papers/cidr2021_paper17.pdf)). All four authors are at Databricks, which sells lakehouses. Treat the definition as primary and the prediction that warehouses will "wither" as the view of a vendor with a stake in it.

## Which ecommerce question does each architecture answer well?

The definition pages from [AWS](https://aws.amazon.com/compare/the-difference-between-a-data-warehouse-data-lake-and-data-mart/) and [Databricks](https://docs.databricks.com/aws/en/lakehouse/) stop before this point: neither mentions ROAS, cohorts or marketplaces. For a team running a store, the useful comparison is by question, the ones leadership asks every week.

| Business question | Data lake | Data warehouse | Lakehouse |
|---|---|---|---|
| ROAS by channel last month | Poor: spend from Meta, Google and TikTok in different shapes, currency and time zone normalized on every query | Good: spend and orders already modeled and joined by date and channel | Good, once curated tables exist |
| 12-month LTV by acquisition cohort | Keeps the history, but customer IDs are not unified | Good, if history was loaded and customers have a single key | Good, with cheap history and versioned tables |
| Amazon orders plus Shopify orders, one customer count | Holds both, with no shared key | Answers if someone modeled the deduplication | Same as the warehouse: the matching rule is human work |
| Raw GA4 events, item by item | Good: the natural home for nested, high-volume data | Answers, with read cost on every query | Good |
| Restating last year when a rule changes (shipping leaves revenue) | Good: the raw copy is there | Poor, if only modeled tables were kept | Good, with prior versions queryable |
| Training a demand forecast or recommender | Good: direct file access | Poor: the paper notes TensorFlow, PyTorch and XGBoost do not work well on top of warehouses | Good |
| "What was net revenue in September?" | Cannot answer | Answers whatever the query says | Answers whatever the query says |

On the marketplace row: an Amazon order never fires your GA4 purchase event and shares no identifier with the Shopify order from the same person. I went through the consequences in [why you can't compute LTV across marketplace and own store](https://precisian.io/blog/en/posts/ltv-by-channel-marketplace-own-store/). No architecture creates a key the source never sends.

## Why does the raw GA4 export blur the categories?

Because the most lake-like data a store has lands, by default, inside a warehouse.

GA4 exports to BigQuery into one `events_YYYYMMDD` table per day. The data is nested: `event_params` is a record repeated for each parameter, and `items` repeats for each item in the event ([Google, export schema](https://support.google.com/analytics/answer/7029846)). Google describes the contents as "only the raw event data that Google Analytics receives from the client", without the processing the interface applies, and labels the export's attribution "Last click observed, no modeling" ([Google, BigQuery Export](https://support.google.com/analytics/answer/9358801)).

The same page sets the ceiling: standard properties export up to 1 million events per day ([Google](https://support.google.com/analytics/answer/9358801)).

So the product is a warehouse and the usage is a lake. The three words describe usage patterns, and one service can play two of them. The two questions worth asking your team: is there a raw copy, and is there a modeled layer?

That is also why BigQuery totals never match the GA4 screen, and why neither matches Shopify. The mechanics are in [why Shopify and GA4 revenue never match](https://precisian.io/blog/en/posts/shopify-ga4-revenue-mismatch/).

## In what order does an ecommerce brand need them?

In the order data gets lost.

**1. Keep the raw copy now.** On standard GA4, event-level data in explorations is retained for 2 or 14 months; 26, 38 and 50 months exist only on Analytics 360 ([Google](https://support.google.com/analytics/answer/7667196)). Whatever was not copied before that window closes does not come back. A lake is the cheapest answer to "don't lose it", so it comes first, even before a single query is ready.

**2. Model what leadership asks every week.** ROAS by channel, revenue by source, average order value. That is warehouse work: clean tables, defined keys, fast queries.

**3. Move to a lakehouse when the two copies start to disagree.** If the team keeps one copy in the lake and another in the warehouse and they already diverge, an open table format removes one of them. Before that, it optimizes a problem you do not have yet.

**4. Write the semantic layer before the first AI agent reads anything.** This step does not depend on which of the three you picked.

What each piece costs to run yourself, from published price tables, is in [build or buy a data lake](https://precisian.io/blog/en/posts/build-vs-buy-data-lake/).

## What do none of the three solve?

The definition of the metric.

Lake, warehouse and lakehouse store rows and run queries. None of them knows whether your revenue includes shipping, whether an order canceled the next day leaves the month, or whether a buy-now-pay-later order counts before it settles. An `order_total` column sums whatever is inside it.

That is why the last row of the table has the same answer in all three columns. Switching architecture changes where the query runs; it does not choose the right query. When the rule is not written in one place, it is spread across spreadsheets, BI calculated fields and saved queries, each with its own version. For people, that becomes a meeting. For an AI agent, it becomes [metric hallucination](https://precisian.io/blog/en/posts/metric-hallucination/): a fluent answer built on a rule nobody approved.

The place where that rule lives is the semantic layer, and [what goes into one, field by field](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/) shows the actual file. How it relates to the warehouse is in [semantic layer vs data warehouse](https://precisian.io/blog/en/posts/semantic-layer-vs-data-warehouse/).

## What is a lakehouse **not**?

A lakehouse is an architecture pattern, with more than one implementation: Delta Lake, Apache Iceberg and Apache Hudi solve the same problem with different formats. You cannot buy "a lakehouse" the way you buy a warehouse seat.

It does not remove modeling. The metadata layer gives files transactions and versions, and the curated table still needs someone to decide its columns.

It does not guarantee governance. The paper calls the metadata layer a natural place for access control and auditing ([CIDR 2021](https://www.cidrdb.org/cidr2021/papers/cidr2021_paper17.pdf)); a natural place still has to be configured by someone.

And it does not replace the warehouse in every case. The paper itself concedes that direct file access gives up some of the data independence a traditional database provides.

## When does this start to matter for your store?

When a second source starts reporting the same number.

One Shopify store, one ad platform and one analyst can live on native reports. The threshold arrives with Amazon next to the DTC store, with a second ad platform claiming the same sale, or with the first AI agent reading the data. From then on, every month without a raw copy is history you lose, and every report built on an unwritten rule is rework you will pay for later.

That is where Precisian fits. The delivery is a data lake isolated per client, on Precisian's infrastructure, with full history and maintained connectors, and it ends at the semantic layer, consumed through your own AI, the API or the BI tool your team already uses. The infrastructure is ours, the data is yours: you can access it at any time and take all of it if you leave.

## What does this article not cover?

It does not compare warehouse vendors or table formats, and it has no pricing. For cost, the [build vs buy](https://precisian.io/blog/en/posts/build-vs-buy-data-lake/) piece uses AWS's published price list.

It has no market figures on lakehouse adoption. The ones in circulation come from vendor surveys without open methodology, and I chose not to repeat any.

And the question table reflects the most common usage of each architecture. A well-run warehouse can keep raw data, and a well-curated lake can answer ROAS. The table shows where each one starts, not how far it can go with work.

---

If September revenue has a different number in every report your company produces, the architecture is not the first suspect. The first step is counting how many definitions of revenue exist today and which system each one lives in. [See how Precisian's data lake handles that](https://precisian.io/en/demo), no contract commitment, and no promise of an answer in 30 minutes either.
