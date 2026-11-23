---
title: "Amazon SP-API for sales data: orders, payouts and limits"
description: "In the Amazon SP-API, orders come from searchOrders and payouts from listTransactions. An order's proceeds carry no referral or FBA fee."
slug: "amazon-sp-api-sales-data"
lang: "en"
translationKey: "amazon-sp-api-sales-data"
publishedAt: 2026-11-23
tags: ["marketplace", "integration", "data-discrepancy", "ecommerce", "privacy"]
draft: false
llmSummary: "Per Amazon's SP-API docs (read November 23, 2026), the proceeds and expense fields in Orders API v2026-01-01 carry no Amazon referral or FBA fee; payouts come from listTransactions in the Finances API, which may omit orders from the last 48 hours. Orders API v0 is removed on March 27, 2027."
citations: ["https://developer-docs.amazon/sp-api/docs/orders-api", "https://developer-docs.amazon/sp-api/docs/orders-api-migration-guide", "https://developer-docs.amazon/sp-api/reference/searchorders", "https://developer-docs.amazon/sp-api/docs/orders-api-rate-limits", "https://developer-docs.amazon/sp-api/docs/access-orders-pii", "https://developer-docs.amazon/sp-api/docs/sp-api-deprecations", "https://developer-docs.amazon/sp-api/docs/finances-api", "https://developer-docs.amazon/sp-api/reference/listtransactions", "https://developer-docs.amazon/sp-api/docs/list-transactions-by-order", "https://developer-docs.amazon/sp-api/docs/retrieve-financial-summary", "https://developer-docs.amazon/sp-api/docs/report-type-values-settlement", "https://developer-docs.amazon/sp-api/docs/report-type-values-order", "https://developer-docs.amazon/sp-api/docs/report-type-values-analytics", "https://developer-docs.amazon/sp-api/docs/guidance-to-address-key-security-controls-in-sp-api-integration", "https://developer-docs.amazon/sp-api/docs/sp-api-endpoints"]
about: ["https://en.wikipedia.org/wiki/Amazon_(company)", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
cta: regua
---
The Amazon SP-API (Selling Partner API) splits sales data in two: orders come from the `searchOrders` operation of Orders API v2026-01-01, and money comes from the `listTransactions` operation of Finances API v2024-06-19. The order's `proceeds` field lists item, shipping, tax and discount amounts, but no referral fee and no FBA fee. Orders API v0 was deprecated on January 28, 2026 and will be removed on March 27, 2027 ([SP-API Deprecation Schedule](https://developer-docs.amazon/sp-api/docs/sp-api-deprecations), updated September 9, 2026, read November 23, 2026).

I read every Amazon page cited here on November 23, 2026. Field names appear exactly as Amazon writes them, in code format, with a link to the page.

> **SP-API (Selling Partner API)**: Amazon's REST APIs for sellers and vendors. US store calls go to `https://sellingpartnerapi-na.amazon.com` ([SP-API Endpoints](https://developer-docs.amazon/sp-api/docs/sp-api-endpoints)) with marketplace ID `ATVPDKIKX0DER`.

## What does the problem look like?

Your Amazon revenue in the spreadsheet does not match the disbursement that lands in the bank. The gap is bigger than the fee rate someone remembers. It moves month to month, and part of it shows up weeks after the sale.

Or the job that used to pull payouts went quiet in November. If it read the legacy settlement report, the reason is in the reports section below.

## What does an order return in Orders API v2026-01-01?

The new version collapses six v0 operations into two. The [migration guide](https://developer-docs.amazon/sp-api/docs/orders-api-migration-guide) (updated September 9, 2026) maps `GetOrders` to `searchOrders`, and `GetOrder`, `GetOrderItems`, `GetOrderBuyerInfo` and `GetOrderAddress` to `getOrder` with an `includedData` parameter. That parameter decides what the response carries:

| `includedData` value | Amazon's description | Field |
|---|---|---|
| `PROCEEDS` | "Revenue and financial breakdown" | `Order.proceeds`, `Order.orderItems.proceeds` |
| `EXPENSE` | "Cost information" | `Order.orderItems.expense` |
| `PROMOTION` | "Discount and promotional offers" | `Order.orderItems.promotion` |
| `CANCELLATION` | "Cancellation information" | `Order.orderItems.cancellation` |
| `BUYER` | "Buyer information" | `Order.buyer` |
| `RECIPIENT` | "Delivery address and preferences" | `Order.recipient` |
| `FULFILLMENT` | "Shipping and fulfillment details" | `Order.fulfillment` |

The old `OrderTotal` is now `Order.proceeds.grandTotal`, and it only shows up when you ask for `includedData=PROCEEDS`. A migration that skipped that value writes orders with no total.

`expense`, labeled *"Cost information"* in the table, holds no fee either: in the reference, `ItemExpense` has a single property, `pointsCost`, the cost of points granted to the buyer ([searchOrders](https://developer-docs.amazon/sp-api/reference/searchorders)).

The [searchOrders reference](https://developer-docs.amazon/sp-api/reference/searchorders) (updated September 10, 2026) defines `OrderProceeds` as *"the money that the seller receives from the sale of the order."* But `breakdowns[].type` only accepts `ITEM`, `SHIPPING`, `GIFT_WRAP`, `COD_FEE`, `TAX`, `DISCOUNT`, `DELIVERY_TIP` and `OTHER`. There is no category for the referral fee or for FBA fulfillment fees. Judged by its categories, proceeds describes what the buyer paid, split by type. What the seller keeps lives in a different API.

The order doesn't tell you where the sale came from either. `salesChannel` carries `channelName`, `marketplaceId` and `marketplaceName`, and none of the documented order fields hold a traffic source, campaign or click. That's the pattern I covered in [marketplaces return traffic, never its source](https://precisian.io/blog/en/posts/marketplace-attribution-blackhole/).

## Which order statuses count as a sale?

The v2026-01-01 `fulfillmentStatus` list has seven values: `PENDING_AVAILABILITY`, `PENDING`, `UNSHIPPED`, `PARTIALLY_SHIPPED`, `SHIPPED`, `CANCELLED` and `UNFULFILLABLE` ([searchOrders](https://developer-docs.amazon/sp-api/reference/searchorders)). Amazon says that *"for standard orders, the initial order status is `PENDING`."* A pending order is not a confirmed sale yet.

Two renames break filters without throwing an error ([migration guide](https://developer-docs.amazon/sp-api/docs/orders-api-migration-guide)):

- `Canceled` became `CANCELLED`, with a double L. A filter that excludes `Canceled` now lets canceled orders through.
- In `fulfilledBy`, `MFN` became `MERCHANT` and `AFN` became `AMAZON`. A report that splits FBA from FBM stops matching on both sides.

For merchant-fulfilled orders in a pending state, the order reports hide the price as well: *"item price is not shown for orders in a pending state"* ([Order Reports](https://developer-docs.amazon/sp-api/docs/report-type-values-order), updated November 18, 2026).

## Where do fees and payouts live?

In the Finances API. The current version is v2024-06-19. The v0 operations (`listFinancialEvents` and its siblings) were deprecated on July 21, 2025 and will be removed on August 27, 2027 ([deprecation schedule](https://developer-docs.amazon/sp-api/docs/sp-api-deprecations)).

The [`listTransactions`](https://developer-docs.amazon/sp-api/reference/listtransactions) reference (updated September 10, 2026) carries four warnings that change how you extract:

- *"Financial events might not include orders from the last 48 hours."*
- *"If you want to retrieve MFN orders in the US store, do not supply the `marketplaceId` parameter."* A US job that filters by marketplace drops merchant-fulfilled orders.
- If `postedAfter` and `postedBefore` are more than 180 days apart, *"the response is empty"* ([listTransactions](https://developer-docs.amazon/sp-api/reference/listtransactions)); the doc mentions no error.
- `transactionStatus` takes `DEFERRED`, `RELEASED` and `DEFERRED_RELEASED`. `DeferredContext` explains the hold in `deferralReason`, with the examples `B2B` (invoiced orders) and `DD7` (delivery date policy), plus a `maturityDate`.

To close out one order, the [transactions-by-order guide](https://developer-docs.amazon/sp-api/docs/list-transactions-by-order) calls `listTransactions` with `relatedIdentifierName=ORDER_ID`, and notes that refunds and adjustments *"can occur days, weeks, or even months later."* The other filterable identifiers are `SETTLEMENT_ID` and `FINANCIAL_EVENT_GROUP_ID`.

The field that separates fees from principal is `breakdowns[].breakdownType`, described only as *"the type of charge."* The reference does not publish a list of values; its example shows `Sales`, `Product Charges` and `Principle` (spelled that way). Store the full `breakdowns` tree and map the types your account produces.

For daily close, `listSummary` aggregates by date range or settlement, and the summary is calculated *"based on the marketplace timezone of the seller, not UTC"* ([Retrieve a financial summary](https://developer-docs.amazon/sp-api/docs/retrieve-financial-summary)).

## Are the reports still useful?

Yes, with two dated traps.

**Settlement.** You cannot request it: *"Settlement reports cannot be requested or scheduled. They are automatically scheduled by Amazon,"* and you find them with `getReports` ([Settlement Reports](https://developer-docs.amazon/sp-api/docs/report-type-values-settlement), updated October 14, 2026). The `GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE` and `GET_V2_SETTLEMENT_REPORT_DATA_XML` types were removed on November 11, 2026 ([deprecation schedule](https://developer-docs.amazon/sp-api/docs/sp-api-deprecations)). What remains is `GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE_V2`, with amounts in the `amount-type`, `amount-description` and `amount` columns. If you also sell in Europe, watch the parser: values come in local format, *"`95,00` for EU instead of `95.00`."*

**Orders.** `GET_FLAT_FILE_ALL_ORDERS_DATA_BY_LAST_UPDATE_GENERAL` lists every order updated in the period, but the date range is *"limited to 30 days"* and these reports *"do not include customer-identifying information"* ([Order Reports](https://developer-docs.amazon/sp-api/docs/report-type-values-order)).

**Traffic.** `GET_SALES_AND_TRAFFIC_REPORT` returns ordered product sales, units, page views and Buy Box percentage by date and ASIN. It requires the Brand Analytics role and accepts up to three requests every five minutes ([Analytics Reports](https://developer-docs.amazon/sp-api/docs/report-type-values-analytics), updated November 18, 2026). It is aggregated, so it never ties a session to an order.

## What buyer data can you get, and for how long?

Very little, and briefly. In v2026-01-01, PII access depends on the roles assigned to your app; the Restricted Data Token from v0 is gone ([Access Orders PII](https://developer-docs.amazon/sp-api/docs/access-orders-pii), updated September 30, 2026). `buyer.buyerEmail` requires the Direct-to-Consumer Shipping (Restricted) role, exists only for merchant-fulfilled orders, and only in `UNSHIPPED`, `PARTIALLY_SHIPPED` or `SHIPPED` status. The reference calls it *"the anonymized email address of the buyer."* For the US, Japan and Singapore stores, the same page says developers with the Tax Invoicing (Restricted) and Tax Remittance (Restricted) roles *"are not permitted to access buyer's name."*

Then the retention clock. Amazon's [security controls guidance](https://developer-docs.amazon/sp-api/docs/guidance-to-address-key-security-controls-in-sp-api-integration) (updated September 9, 2026) sets the limit for PII at *"30 days after order delivery."* An Amazon buyer email cannot become a durable customer key, which is why [LTV across marketplace and your own store](https://precisian.io/blog/en/posts/ltv-by-channel-marketplace-own-store/) has no clean join.

## How do you diagnose your integration?

Run these checks on a closed month:

| Check | Where to look | What a mismatch means | Source |
|---|---|---|---|
| Orders API version | calls to `getOrders` or `getOrderItems` in your logs | Still on v0, removed March 27, 2027 | [schedule](https://developer-docs.amazon/sp-api/docs/sp-api-deprecations) |
| Order total | null `proceeds.grandTotal` | Queried without `includedData=PROCEEDS` | [migration guide](https://developer-docs.amazon/sp-api/docs/orders-api-migration-guide) |
| Canceled filter | `CANCELLED` vs `Canceled` | Canceled orders counted as sales after migration | [migration guide](https://developer-docs.amazon/sp-api/docs/orders-api-migration-guide) |
| US FBM payouts | `marketplaceId` passed to `listTransactions` | Merchant-fulfilled orders missing from finance data | [listTransactions](https://developer-docs.amazon/sp-api/reference/listtransactions) |
| Recent payouts | orders from the last 48 hours with no transaction | Documented lag, not a lost order | [listTransactions](https://developer-docs.amazon/sp-api/reference/listtransactions) |
| Deferred money | `transactionStatus=DEFERRED` | Sale booked, cash still held | [listTransactions](https://developer-docs.amazon/sp-api/reference/listtransactions) |
| Settlement feed | latest `getReports` call using a legacy V2 type | Payout load stalled since November 11, 2026 | [schedule](https://developer-docs.amazon/sp-api/docs/sp-api-deprecations) |

## How do you fix it?

Start with the definition. "Amazon revenue" can mean `grandTotal` on `SHIPPED` orders, the sum of `RELEASED` transactions in a period, or the `total-amount` of a deposited settlement. Those are three different numbers, each right for a different question. Writing down which number answers which question, and querying it the same way every time, is what a semantic layer does. It's the same argument I made in [why marketing and finance never close the same revenue number](https://precisian.io/blog/en/posts/marketing-finance-revenue-definition/).

On extraction, four rules taken from Amazon's own pages:

1. **Pull orders by `lastUpdatedAfter`.** `searchOrders` requires exactly one of `createdAfter` and `lastUpdatedAfter`, and defines an update as *"any change made by Amazon or the seller, including changes to order status."* Only the second one catches an order canceled after you loaded it.
2. **Budget the quota.** `searchOrders` runs at 0.0056 requests per second with a burst of 20; `getOrder` at 0.5 with a burst of 30 ([Orders API Rate Limits](https://developer-docs.amazon/sp-api/docs/orders-api-rate-limits), updated September 9, 2026). By simple arithmetic, the sustained `searchOrders` rate is one call about every three minutes once the burst is spent. Request the data you need inside `searchOrders` with `includedData`, in pages of up to 100 orders (`maxResultsPerPage`, [searchOrders](https://developer-docs.amazon/sp-api/reference/searchorders)).
3. **Reconcile per order, then per settlement.** Call `listTransactions` with `ORDER_ID` for each order in a period that closed more than 48 hours ago, then tie out against `listSummary` for the settlement, in marketplace time.
4. **Keep everything.** The Orders API does not show orders older than two years outside Japan, Australia and Singapore ([Orders API](https://developer-docs.amazon/sp-api/docs/orders-api), updated September 9, 2026). Older history exists only if you saved it.

## When can't it be fixed?

**Where the sale came from.** No documented order field ties a sale to an ad or a search. The traffic report is aggregated by date and ASIN.

**One customer across channels.** The email is anonymized, merchant-fulfilled only, and must be deleted 30 days after delivery ([security controls](https://developer-docs.amazon/sp-api/docs/guidance-to-address-key-security-controls-in-sp-api-integration)). Counting distinct customers across Shopify and Amazon has no reliable key.

**A closed list of fees.** Finances v2024-06-19 does not publish the values of `breakdownType`. A new type can appear without notice, so your mapping has to handle the unknown.

When Precisian is the wrong answer: if you sell only on Amazon and the disbursement already ties out with your bookkeeping, a data platform is a cost with no problem attached. The problem starts when Amazon has to agree with Shopify, the ERP and ad spend. We connect any source that has an open API.

## What does this article not cover?

**The Amazon Ads API.** Sponsored ads have their own API. In Finances v0, the charge shows up as `ProductAdsPaymentEventList`; I did not read the Ads documentation for this piece.

**Vendor Central.** Vendor APIs are a separate set.

If your Amazon revenue in the spreadsheet doesn't match the deposit, the first step is to measure the distance between order `grandTotal` and the sum of `RELEASED` transactions for the same period. [See this article's question answered on a real lake](https://precisian.io/en/demo?utm_source=blog&utm_medium=cta&utm_campaign=amazon-sp-api-sales-data&utm_content=texto), with no contract commitment.
