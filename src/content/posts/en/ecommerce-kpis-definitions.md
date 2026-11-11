---
title: "Ecommerce KPIs: the definition each team needs to agree on"
description: "Nine ecommerce KPIs, each with its formula and the choice that moves the number: gross or net, shipping, tax, cancellations and attribution window."
slug: "ecommerce-kpis-definitions"
lang: "en"
translationKey: "ecommerce-kpis"
publishedAt: 2026-11-03
tags: ["ecommerce", "semantic-layer", "governance", "roas", "data-discrepancy"]
draft: false
llmSummary: "Ecommerce KPIs such as revenue, AOV, conversion rate, CAC, ROAS, MER, LTV, refund rate and contribution margin change with definitional choices. Shopify computes AOV as (gross sales - discounts) / orders; GA4 purchase value excludes shipping and tax (official docs, Nov 2026)."
citations: ["https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/report-types/default-reports/sales-report", "https://shopify.dev/docs/api/shopifyql/2026-10/schemas/sales_revenue/sales", "https://shopify.dev/docs/api/shopifyql/latest/schemas/sessions_and_behavior/sessions", "https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/report-types/default-reports/profit-reports", "https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema", "https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag", "https://support.google.com/google-ads/answer/3123169?hl=en", "https://support.google.com/google-ads/answer/6268637?hl=en", "https://developers.facebook.com/docs/marketing-api/reference/ad-account/insights/"]
about: ["https://en.wikipedia.org/wiki/Performance_indicator", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
cta: newsletter
updatedAt: 2026-11-08
---
Ecommerce KPIs are the handful of numbers a store runs on: revenue, AOV, conversion rate, CAC, ROAS, MER, LTV, refund rate and contribution margin. Each one has a formula and at least one choice that changes the result. Shopify alone computes average order value as `(gross sales - discounts) / orders`, before returns ([ShopifyQL reference, version 2026-10](https://shopify.dev/docs/api/shopifyql/2026-10/schemas/sales_revenue/sales), read November 3, 2026), while finance usually nets returns out first.

> **Ecommerce KPI definition**: a written rule for one business number that fixes its formula, its source system, the date that governs it (order, payment, fulfillment or refund) and every inclusion or exclusion (shipping, tax, discounts, cancellations, returns, attribution window), so that two teams computing it get the same result.

## Which ecommerce KPIs need a written definition?

All nine below. The formulas are the common ones; the third column is where teams quietly diverge. Every definition in your company should answer that column out loud.

| KPI | Common formula | The choice that moves the number |
|---|---|---|
| Revenue | gross sales − discounts − returns | gross or net; shipping and tax in or out; cancellations; order date or refund date |
| AOV | revenue ÷ orders | which revenue; before or after returns; canceled orders in the denominator |
| Conversion rate | orders ÷ sessions | sessions or users; orders or converted sessions; which channels count |
| CAC | acquisition spend ÷ new customers | what counts as spend; how "new" is defined; platform or system-of-record customers |
| ROAS | attributed revenue ÷ ad spend | attribution window; click or view; whose revenue |
| MER | total revenue ÷ total marketing spend | which revenue; whether agency fees and tools count as spend |
| LTV | cumulative margin per customer over a horizon | revenue or margin; horizon length; which channels |
| Refund / return rate | refunded value ÷ gross sales | by value or by count; refund date or order date; exchanges |
| Contribution margin | net revenue − variable costs | which costs are variable; whether ad spend is subtracted |

The official references below come from the documentation of Shopify, Google Analytics 4, Google Ads and Meta, all read on this article's publication date. Platforms revise these pages, so date-stamp your own copy.

## How is revenue defined in Shopify, GA4 and finance?

Three systems, at least seven "revenues." That is the root of most KPI arguments.

Shopify's sales report defines gross sales as "product price x quantity (before taxes, shipping, discounts, and sales reversals)," net sales as gross sales minus discounts minus sales reversals, and total sales as net sales plus taxes, duties, shipping charges and fees ([Shopify Help Center](https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/report-types/default-reports/sales-report)). In API version 2026-10, the `returns` column is deprecated and replaced by `sales_reversals`: "Value removed from orders through refunds, returns, cancellations, or edits" ([ShopifyQL](https://shopify.dev/docs/api/shopifyql/2026-10/schemas/sales_revenue/sales)).

GA4 has its own three. `grossPurchaseRevenue` is "the sum of revenue from purchases made in your app or site." `purchaseRevenue` is that sum "minus refunded transaction revenue." `totalRevenue` adds subscription and advertising revenue ([GA4 Data API schema](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema)). And all three depend on what your tag sends: Google's event reference tells you to set `value` "to the sum of `(price * quantity)`" and "Don't include `shipping` or `tax`" ([GA4 events reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag)). If your developer passed the order total instead, GA4 revenue includes both, and nothing in the report says so.

Finance adds the seventh: revenue recognized when the customer obtains control of the goods, not at checkout. [Why marketing and finance never close the same revenue number](https://precisian.io/blog/en/posts/marketing-finance-revenue-definition/) walks through that gap.

Here is one order, with round numbers made up for the example: $100 of items, a $10 discount, $8 shipping, $7 tax, and a $30 partial refund processed the following month.

| Definition | Month of the order | Month of the refund |
|---|---|---|
| Shopify gross sales | $100 | $0 |
| Shopify net sales | $90 | −$30 |
| Shopify total sales | $105 | −$30 (more if refunded shipping or tax) |
| GA4 `purchaseRevenue`, tag set per Google's guidance | $90 | −$30 (if a `refund` event is sent) |
| GA4 `purchaseRevenue`, tag sending the order total | $105 | −$30 (if a `refund` event is sent) |
| "Net revenue" dated by the original order | $60 | $0 |

Shopify dates the reversal by processing day: "reversals display as a negative value for the day that they were processed" ([Shopify Help Center](https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/report-types/default-reports/sales-report)). A team that dates returns by the original order reopens every closed month. Both rules are defensible. Only one can be yours. The same mechanics explain most of [why Shopify and GA4 revenue don't match](https://precisian.io/blog/en/posts/shopify-ga4-revenue-mismatch/).

## What changes AOV and conversion rate?

The denominator, more often than the numerator.

**AOV.** Shopify's `average_order_value` is "the average amount per order before post-order adjustments," computed as `(gross sales - discounts) / orders` ([ShopifyQL](https://shopify.dev/docs/api/shopifyql/2026-10/schemas/sales_revenue/sales)). Returns do not lower it. Shopify's sales report also states that "Pending, unpaid, and canceled orders are included in the reports," with cancellations booked later as sales reversals ([Shopify Help Center](https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/report-types/default-reports/sales-report)). A finance AOV built on net revenue over paid, non-canceled orders will come out lower in any month with returns. Decide which one the board sees.

**Conversion rate.** Shopify defines `conversion_rate` as `sessions that completed checkout / sessions`, the "Percentage of online store visits (sessions) that resulted in a sale" ([ShopifyQL sessions schema](https://shopify.dev/docs/api/shopifyql/latest/schemas/sessions_and_behavior/sessions)). That is converted sessions, not orders. A shopper who places two orders in one visit counts once, and orders from Amazon, retail or a call center never enter at all. GA4 has no metric named conversion rate; its closest, `sessionKeyEventRate`, is "the percentage of sessions in which any key event was triggered" ([GA4 Data API schema](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema)). If newsletter signup is marked as a key event, it raises the rate without a single extra order.

## Why do CAC, ROAS and MER disagree?

Because each platform claims the sale through its own window, and CAC and ROAS inherit whichever window produced them.

**ROAS.** Google Ads' own example is "$5 USD in sales ÷ $1 USD in ad spend x 100% = 500% target ROAS" ([Google Ads Help](https://support.google.com/google-ads/answer/6268637?hl=en)). The sales are the conversions Google Ads attributes to itself. Its click-through conversion window defaults to 30 days and can be set from 1 to 30, 60 or 90 days; the view-through window defaults to 1 day ([Google Ads Help](https://support.google.com/google-ads/answer/3123169?hl=en)). In Meta's Insights API, the `default` value of `action_attribution_windows` "means `["7d_click","1d_view"]`," and `action_report_time` decides whether a conversion lands on the impression date or the conversion date ([Meta Marketing API](https://developers.facebook.com/docs/marketing-api/reference/ad-account/insights/)). Run both platforms and the same order can be credited by each, under different windows. GA4's `returnOnAdSpend` is "total revenue divided by advertiser ad cost," using `totalRevenue` and the costs of linked integrations ([GA4 Data API schema](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema)), which is a third number again.

**MER.** Total booked revenue divided by total marketing spend. No platform or accounting standard defines it, so your company has to: which revenue (net? total?) and which spend (media only, or agency fees and tools too?). [MER vs ROAS](https://precisian.io/blog/en/posts/mer-vs-roas/) covers the formulas side by side.

**CAC.** No official definition either. The two choices that move it most are the numerator (media only, or media plus salaries, tools and agency) and what "new customer" means. Google's own guidance for the `customer_type` parameter suggests a 540-day lookback: a new customer "hasn't purchased within a given time period (540-day window recommended and set at default, but not required)" ([GA4 events reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag)). A brand using 365 days counts more "new" customers than one using 540, and reports a lower CAC on identical spend. And a CAC built on platform-reported conversions inherits the windows above.

## How should LTV, refund rate and contribution margin be defined?

These three need a cost or a horizon that no ad platform supplies, which is why they are the ones most often left vague.

**LTV.** Cumulative contribution margin per customer, in an acquisition cohort, over a stated horizon. Without the horizon, "LTV" is whatever period someone ran the query on. Without margin, it is revenue per customer, a different number. If you sell on Amazon too, the repeat buyers there are invisible at the customer level; [LTV:CAC for ecommerce brands that also sell on Amazon](https://precisian.io/blog/en/posts/ltv-cac-ratio-ecommerce/) explains why.

**Refund and return rate.** By value or by count? Dated by the refund or by the original order? Do cancellations count? In Shopify they do: sales reversals "include the value of returned products, as well as order cancellations, edits, adjustments to shipping, taxes, fees, and discounts" ([Shopify Help Center](https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/report-types/default-reports/sales-report)). GA4's `refundAmount` is "the total refunded transaction revenues," summing `refund` events ([GA4 Data API schema](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema)), so it is only as complete as the refund events your stack sends. Exchanges with no money back are usually excluded; write it down.

**Contribution margin.** Net revenue minus variable costs: product cost, shipping and fulfillment, payment processing, and, depending on the version, ad spend. Shopify's profit reports stop earlier. Gross profit is net sales minus cost, and products sold without a recorded cost are left out of the profit reports entirely ([Shopify Help Center](https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/report-types/default-reports/profit-reports)). Payment fees and ad spend are not subtracted there. Name two lines explicitly, margin before marketing and margin after marketing, so nobody compares one to the other.

## What is a KPI definition not?

**Not a benchmark.** "A good conversion rate" means nothing until the conversion rate is defined. Comparing your converted-sessions rate to someone's orders-per-users rate is comparing two different metrics.

**Not a dashboard.** A chart displays a number. The definition decides which number it is. Two dashboards fed by the same warehouse can disagree because each one rebuilt the formula.

**Not only a dictionary entry.** A [marketing data dictionary](https://precisian.io/blog/en/posts/marketing-data-dictionary/) records meaning, owner and exclusions in text, and it is the right first step. Text still has to be translated into a query every time someone computes the KPI. A [semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/) stores the rule in a form the system executes, so the translation happens once.

## When does agreeing on definitions start to matter?

The day a second source can answer the same question. For a US brand, that is usually Shopify plus Amazon, or Shopify plus a finance system that books revenue on fulfillment. From then on, every KPI above has at least two plausible values.

It matters even more when an AI agent reads the data. A person seeing an odd AOV pauses and asks. An agent picks one of the plausible fields, computes correctly and answers with full confidence. We call that [metric hallucination](https://precisian.io/blog/en/posts/metric-hallucination/), and its cause is almost always a definition that was never written. At Precisian, the definitions live in a semantic layer on a data lake isolated per customer, on our infrastructure, and the customer's own AI, BI or automation reads them through an MCP server and an API.

A practical order: write revenue first, because AOV, ROAS, MER and LTV all inherit it. Then new customer, because CAC and LTV inherit it. The rest follow in the next meeting where two numbers disagree.

## What does this article not cover?

It gives no benchmark values for any KPI, because a benchmark without a stated definition cannot be compared to yours. It does not cover subscription metrics (MRR, churn), which have their own rules. And it quotes Shopify, GA4, Google Ads and Meta documentation as read on this article's publication date; those pages change, and the ShopifyQL version cited will move.

---

If your teams bring different revenue, AOV or ROAS numbers to the same meeting, the first step is to list every definition in circulation and find the one choice that separates them. What changed, what broke and what Precisian's research measured lands every two weeks, on Thursdays, in [Precisian's newsletter](https://precisian.io/en/newsletter?utm_source=blog&utm_medium=cta&utm_campaign=ecommerce-kpis-definitions&utm_content=texto).
