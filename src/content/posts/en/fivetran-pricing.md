---
title: "Fivetran pricing in 2026: how MAR billing works and what drives the bill"
description: "Fivetran bills each connection by monthly active rows. On Standard, the first million MAR costs $500 a month at list price, and the rate falls per connection."
slug: "fivetran-pricing"
lang: "en"
translationKey: "fivetran-pricing"
publishedAt: 2026-11-03
tags: ["cost", "pipeline", "integration", "ecommerce", "data-warehouse"]
draft: false
llmSummary: "Fivetran's Service Consumption Table (V.11, effective November 1, 2026) prices each connection on its own curve: on Standard, $5 base plus $495 per million MAR up to 1 million, then $170 per million up to 4 million. MAR cannot be pooled across connections."
citations: ["https://www.fivetran.com/pricing", "https://www.fivetran.com/legal/service-consumption-table", "https://fivetran.com/docs/core-concepts/usage-based-pricing", "https://fivetran.com/docs/core-concepts/usage-based-pricing/billing-and-plans", "https://fivetran.com/docs/core-concepts/usage-based-pricing/pricing-updates/2026-pricing-updates", "https://fivetran.com/docs/core-concepts/usage-based-pricing/tracking-and-optimizing-usage", "https://www.fivetran.com/press/fivetran-dbt-labs-complete-merger-to-create-the-data-infrastructure-for-trusted-ai-agents"]
about: ["https://en.wikipedia.org/wiki/Extract%2C_load%2C_transform", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
cta: ficha
updatedAt: 2026-11-08
---
Fivetran charges each connection separately for its monthly active rows (MAR). On the Standard plan, Fivetran's [Service Consumption Table](https://www.fivetran.com/legal/service-consumption-table) (V.11, effective November 1, 2026) lists a $5 base charge plus $495 per million MAR for a connection's first million rows, which comes to $500 a month at 1 million MAR. The rate then falls to $170 per million, then $58, but only within that one connection. Rows from different connections are never pooled.

> **MAR (monthly active rows)**: the number of distinct primary keys a connection inserts, updates or deletes in your destination during one calendar month. A row that syncs 30 times in a month counts once ([Fivetran docs](https://fivetran.com/docs/core-concepts/usage-based-pricing), read November 3, 2026).

Every figure below comes from Fivetran's official pages, read on November 3, 2026. The per-MAR rates live in the legal [Service Consumption Table](https://www.fivetran.com/legal/service-consumption-table); the [pricing page](https://www.fivetran.com/pricing) only gives the formula, `Total monthly usage x spend rate = connection monthly cost`.

## What exactly does Fivetran bill for?

Three meters, added together each calendar month:

1. **Connection MAR.** Rows moved from a source (Shopify, Google Ads, a Postgres database) into your warehouse.
2. **Activation MAR.** Reverse ETL, rows pushed from the warehouse into tools like Salesforce or HubSpot. Since February 1, 2026 this is also usage-based and has its own price curve ([2026 pricing updates](https://fivetran.com/docs/core-concepts/usage-based-pricing/pricing-updates/2026-pricing-updates)).
3. **Transformation model runs.** The first 5,000 successful runs a month are free; after that the list price is $0.01, $0.007 and then $0.002 per run as volume grows ([pricing page](https://www.fivetran.com/pricing)).

The rest of this piece is about connection MAR, the meter every pipeline pays.

## How is a connection's monthly cost calculated?

The [Service Consumption Table](https://www.fivetran.com/legal/service-consumption-table) gives the formula in plain words: *Base Spend per Month + (actual MAR − MAR Threshold) × Incremental Spend per Million MAR*. These are the list prices for connection MAR, as published in V.11:

| Connection MAR in the month | Standard: per million above threshold | Standard: base at threshold | Enterprise: per million | Business Critical: per million |
|---|---|---|---|---|
| 1 to 1M | $495.00 | $5.00 | $661.67 | $1,061.67 |
| 1M to 4M | $170.00 | $500.00 | $226.67 | $362.67 |
| 4M to 16M | $58.00 | $1,010.00 | $77.33 | $123.73 |
| 16M to 64M | $19.70 | $1,706.00 | $26.27 | $42.03 |
| 64M to 250M | $6.72 | $2,651.60 | $8.96 | $14.34 |
| 250M to 1,000M | $2.29 | $3,901.52 | $3.05 | $4.89 |
| Above 1,000M | $1.18 | $5,619.02 | $1.57 | $2.52 |

Source: [Fivetran Service Consumption Table](https://www.fivetran.com/legal/service-consumption-table), V.11, effective November 1, 2026, read November 3, 2026. List prices before any contract discount.

The formula checks out against Fivetran's own worked example. The [pricing page](https://www.fivetran.com/pricing) shows a Standard-plan company with 1 to 200 employees whose Facebook Ads connection moved a median of 34,479 MAR for $22.06, and whose Google Ads connection moved 88,240 MAR for $48.67. Plugging those volumes into the first row of the table gives $22.07 and $48.68. The four-connector example on that page (Facebook Ads, Google Analytics 4, Marketo, Google Ads) totals $511.15 a month.

Read the table per connection. Fivetran's [optimization guide](https://fivetran.com/docs/core-concepts/usage-based-pricing/tracking-and-optimizing-usage) says "Your usage and costs are determined at the connection level," and the consumption table adds that "you cannot combine MAR across multiple Connections, Activations, or Accounts to get a more favorable consumption rate."

## What moves the bill up or down?

Five things, all documented by Fivetran.

**1. How MAR is spread across connections.** Because each connection rides its own curve, the same total volume costs more when it is split. A synthetic example with round numbers, on Standard list prices: two connections with 2 million MAR each cost $670 apiece, $1,340 in total. One connection with 4 million MAR costs $1,010.

**2. How many small connections you run.** Since January 1, 2026, every standard connection with 1 to 1 million MAR in a month carries the $5 base charge ([2026 pricing updates](https://fivetran.com/docs/core-concepts/usage-based-pricing/pricing-updates/2026-pricing-updates)). Twelve connections at 5,000 MAR each cost about $90 a month on Standard, of which $60 is base charge. Fivetran's own advice is to pause "connections with a low usage that don't bring any analytical value" ([optimization guide](https://fivetran.com/docs/core-concepts/usage-based-pricing/tracking-and-optimizing-usage)).

**3. How often your source rows change.** Sync frequency is irrelevant, per the documentation: "Your connections' sync frequency makes no difference to your monthly active rows because MAR is based on how many unique rows are updated, not on how many updates occur." A Shopify order that gets paid, fulfilled and partially refunded in the same month counts once. A customer table where a marketing tool touches every profile daily counts every profile.

**4. Deletes and history mode.** From January 1, 2026, "inserts, updates, and deletes will count toward paid MAR," and in tables with history mode on, each tracked change counts too ([2026 pricing updates](https://fivetran.com/docs/core-concepts/usage-based-pricing/pricing-updates/2026-pricing-updates)). Deletes reach your warehouse as a soft delete, with `_fivetran_deleted` set to `TRUE` ([usage-based pricing](https://fivetran.com/docs/core-concepts/usage-based-pricing)).

**5. Duplicated pipelines.** Two connections that read the same source into a staging and a production destination are counted separately, "even if the connections sync the same data from the same source (with the same primary keys)" ([usage-based pricing](https://fivetran.com/docs/core-concepts/usage-based-pricing)).

Ad platforms add one more effect. The [usage-based pricing documentation](https://fivetran.com/docs/core-concepts/usage-based-pricing) counts "reporting connector rollback syncs that occur during a conversion window" as incremental MAR, and says rows a rollback sync fetches from the previous month count as new rows in the current month. Facebook Ads, Google Ads, Google Analytics 4 and Amazon Ads are on its list of ad reporting connectors.

## What does Fivetran not charge for?

The [usage-based pricing documentation](https://fivetran.com/docs/core-concepts/usage-based-pricing) lists free MAR, including:

- **Initial syncs.** "Initial syncs don't incur a cost for the historical data they sync." Backfilling three years of Shopify orders is free; the changes after it are not.
- **Most re-syncs,** such as historical data pulled because you added a column.
- **The first 14 days** of every new connection.
- **Fivetran system tables** (`FIVETRAN_QUERY`, `FIVETRAN_API_CALL` and others) and the Fivetran Platform connector, which loads your own usage data into the warehouse.
- **The Free plan,** up to 500,000 connection MAR, 3,500 activation MAR and 5,000 model runs a month ([billing and plans](https://fivetran.com/docs/core-concepts/usage-based-pricing/billing-and-plans)).

## How do the plans and contracts differ?

|   | Monthly pay-as-you-go | Annual contract |
|---|---|---|
| Plans available | Free, Standard, Enterprise, Business Critical | Standard, Enterprise, Business Critical |
| Minimum | $5 per connection with 1 to 1M MAR | $12,000 |
| Price | List price, billed monthly in arrears | 5% built-in discount, rising with contract size |
| Where to buy | Fivetran, AWS, Azure or Google Cloud marketplace | Order form with Fivetran |

Source: [Fivetran billing and plans](https://fivetran.com/docs/core-concepts/usage-based-pricing/billing-and-plans), read November 3, 2026.

The [pricing page](https://www.fivetran.com/pricing) advertises savings of "up to 22%" on an annual contract. For Standard it publishes the discount bands: 5% up to $37,900 of annual list price, 5% to 22.6% between $37,900 and $145,340, and 22.6% or more above that.

All plans use the same meter and differ in features and rate. Enterprise adds 1-minute syncs, enterprise database connectors and hybrid deployment; Business Critical adds customer-managed encryption keys, PCI DSS Level 1 certification and private networking. The same 1 million MAR costs $500 on Standard, $666.67 on Enterprise and $1,066.67 on Business Critical at list price.

## What would a Shopify brand's bill look like?

A synthetic example with round numbers, not a quote. The MAR volumes below are invented for illustration; the prices come from the Standard row of the table above.

| Connection | Assumed MAR / month | Standard list price |
|---|---|---|
| Klaviyo | 3,000,000 | $840.00 |
| Shopify | 400,000 | $203.00 |
| Amazon Selling Partner | 250,000 | $128.75 |
| Recharge | 120,000 | $64.40 |
| Google Ads | 90,000 | $49.55 |
| Facebook Ads | 40,000 | $24.80 |
| Google Analytics 4 | 25,000 | $17.37 |
| TikTok Ads | 15,000 | $12.42 |
| **Total** | **3,940,000** | **$1,340.29** |

In this example one high-churn source drives most of the bill. Klaviyo is 76% of the rows and 63% of the cost. Pooled into one curve, the same 3.94 million MAR would cost about $1,000, and the consumption table does not allow pooling.

To see your real numbers, Fivetran shows MAR per connection and per table under Account Settings > Billing & Usage, updated daily and calculated in UTC ([optimization guide](https://fivetran.com/docs/core-concepts/usage-based-pricing/tracking-and-optimizing-usage)).

## How can you lower a Fivetran bill?

The documented levers, from the [optimization guide](https://fivetran.com/docs/core-concepts/usage-based-pricing/tracking-and-optimizing-usage):

- **Block schemas or tables** you do not analyze. Not every connector supports blocking; check the connector's page.
- **Block frequently changing columns in tables without a primary key,** where Fivetran builds a synthetic key from the columns.
- **Pause low-value connections** that only pay the $5 base.
- **Consolidate** where your architecture allows it, since volume discounts apply only inside one connection.
- **Switch history mode tables to soft delete or live mode** where you do not need every version of a row, an option named in the [2026 pricing updates](https://fivetran.com/docs/core-concepts/usage-based-pricing/pricing-updates/2026-pricing-updates).

Changing sync frequency will not help, by Fivetran's own statement.

## When is Fivetran the better buy?

When you have a data engineer, a warehouse you already pay for (BigQuery, Snowflake, Databricks) and dbt. Since June 1, 2026 Fivetran and dbt Labs are one company ([merger release](https://www.fivetran.com/press/fivetran-dbt-labs-complete-merger-to-create-the-data-infrastructure-for-trusted-ai-agents)), so extraction and modeling come under one vendor, and the catalog lists Shopify, Amazon Selling Partner, Klaviyo, Facebook Ads and Google Ads ([Fivetran connectors](https://fivetran.com/docs/connectors)). It also fits a small stack: under 500,000 MAR a month across connections, the Free plan covers it.

The full comparison with Airbyte and managed options is in [Fivetran alternatives for ecommerce data](https://precisian.io/blog/en/posts/fivetran-alternatives-ecommerce/), and the scored list of nine tools is in [best ETL tools for marketing data](https://precisian.io/blog/en/posts/best-etl-tools-for-marketing-data/).

## When is a managed platform the better fit?

When the cost you cannot predict is people. Fivetran moves data into your destination; modeling net revenue, monitoring loads and maintaining the warehouse remain your team's work. If nobody on the team does that today, a per-row price is the smaller part of the cost, which is the argument in [build or buy a data lake](https://precisian.io/blog/en/posts/build-vs-buy-data-lake/).

Precisian is one such platform: ingestion, a data lake isolated per client on our infrastructure, a semantic layer with versioned metric definitions, and access through MCP, API or your own BI. It bills a monthly subscription with no setup fee and no per-seat charge. The infrastructure is ours, the data is yours: you can access it at any time and, if you leave, you take all of it. It is the wrong choice if you already run a data team on dbt, if you want a ready-made dashboard (we don't sell one), or if your company operates only in the US: Precisian serves companies in Brazil.

## What does this article not cover?

Negotiated prices, Enterprise License Agreements (Fivetran lists them as "Fixed price per year with no limits on consumption" on the [pricing page](https://www.fivetran.com/pricing)), the full activation price curve, contracts signed before March 1, 2025, which are [billed at the account level](https://fivetran.com/docs/core-concepts/usage-based-pricing/tracking-and-optimizing-usage), and the cost of the warehouse that receives the data. Fivetran says it may update the consumption table, and changes reach existing customers at renewal; check the version number at the top before you budget.

---

If your Fivetran estimate is mostly a few high-churn connections plus the people who model what lands in the warehouse, compare it against a subscription that includes both. What Precisian includes, and what it costs, is on the [pricing page](https://precisian.io/en/pricing?utm_source=blog&utm_medium=cta&utm_campaign=fivetran-pricing&utm_content=texto), with no contract commitment.
