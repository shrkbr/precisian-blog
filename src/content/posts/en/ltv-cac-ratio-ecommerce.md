---
title: "LTV:CAC for ecommerce brands that also sell on Amazon"
description: "LTV:CAC divides the margin a customer returns by what it cost to win them. Selling on Amazon hides repeat buyers and platform data shrinks CAC."
slug: "ltv-cac-ratio-ecommerce"
lang: "en"
translationKey: "ltv-cac"
publishedAt: 2026-10-14
tags: ["ltv-cac", "marketplace", "ecommerce", "roas", "divergencia-de-dados"]
draft: false
llmSummary: "LTV:CAC is cumulative contribution margin per customer divided by the cost to acquire them. For DTC brands also on Amazon, own-store LTV misses repeat buyers Amazon reports only in aggregate, and CAC built on platform conversions comes out too low."
citations: ["https://developer-docs.amazon/sp-api/reference/getorders", "https://developer-docs.amazon/sp-api/docs/report-type-values-analytics", "https://support.google.com/google-ads/answer/3123169", "https://developers.facebook.com/docs/marketing-api/reference/ads-action-stats/", "https://support.google.com/analytics/answer/9670133", "https://www.forentrepreneurs.com/saas-metrics-2/"]
about: ["https://en.wikipedia.org/wiki/Customer_lifetime_value", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
---

LTV:CAC is the ratio between the contribution margin a customer generates over a set horizon (LTV) and what it cost to acquire that customer (CAC). For a DTC brand that also sells on Amazon, both halves drift. Amazon's Repeat Purchase report counts repeat customers per ASIN by week, month or quarter, but never says who they are ([Amazon SP-API](https://developer-docs.amazon/sp-api/docs/report-type-values-analytics)). And CAC built on platform conversions inherits attribution windows of up to 90 days in Google Ads ([Google](https://support.google.com/google-ads/answer/3123169)).

> **LTV:CAC**: cumulative contribution margin per customer in an acquisition cohort, over a stated horizon, divided by the fully loaded cost of acquiring that cohort. Without a horizon and without margin, the ratio has no meaning.

## How do you calculate LTV for an ecommerce brand?

Lifetime value is the margin a customer leaves behind over time. There are two ways to compute it, and only one of them is a measurement.

**The textbook formula.** Average order value × orders per year × expected customer lifespan × contribution margin. The weak factor is lifespan. Retail has no cancellation event. A customer stops buying, and you find out months later, so "lifespan" is a churn guess dressed as an input.

**The cohort method.** Take every customer whose first order landed in the same month, add up the margin they produced month by month, and divide by the number of customers in the cohort. Twelve-month LTV for the January cohort is the margin that cohort accumulated through December, per customer. Churn is already inside the observed number.

That is all cohort analysis means. Google Analytics defines a cohort as "a group of users who share a common characteristic" and lets you set an inclusion criterion, such as first transaction, and a return criterion ([Google Analytics](https://support.google.com/analytics/answer/9670133)). For LTV the inclusion event is the first purchase, and the source should be booked orders from Shopify or your OMS, not browser events.

Three decisions belong in writing before the first calculation:

- **Margin, not revenue.** Revenue LTV over cost-based CAC compares different units and inflates the ratio by the inverse of your margin.
- **A fixed horizon.** One-year LTV and three-year LTV are different metrics. A number without a horizon compares to nothing.
- **What a customer is.** An account, an email, a device and a card produce four different counts of the same people.

## How do you calculate CAC?

Customer acquisition cost is total acquisition spend for a period divided by the number of **new** customers in that period.

**The numerator** covers all acquisition media, plus what media reports leave out: first-order discount codes, free shipping for new buyers, agency retainers, tooling. Media spend alone gives you media CAC, a legitimate metric that deserves its own name.

**The denominator** is first-time buyers counted in your own order data. It is not the sum of conversions reported by Google Ads, Meta and TikTok. Swapping one for the other is how CAC ends up too low, as the next sections show.

## What does LTV:CAC measure that ROAS doesn't?

It asks how many times each acquisition dollar comes back as margin within the horizon you chose.

| Metric | Formula | Data source | What it ignores |
|---|---|---|---|
| LTV:CAC | Cumulative margin per customer ÷ acquisition cost per new customer | Booked orders + full acquisition cost | Time to payback |
| ROAS | Attributed revenue ÷ ad spend | Each platform's own report | Margin, repeat orders, overlap between platforms |
| CAC payback | Months until cohort margin equals CAC | Order cohorts | Everything after payback |
| Blended CAC | Total acquisition cost ÷ all new customers | Your books + order data | Which channel did the work |

ROAS reads revenue over a short window, credited by the platform that sold the ad. LTV:CAC reads margin over a long horizon, measured in your own data. That is why [summed platform ROAS can exceed actual revenue](https://precisian.io/blog/en/posts/roas-exceeds-actual-revenue/) while a correctly built LTV:CAC cannot double count.

## What is a good LTV to CAC ratio for ecommerce?

The number everyone repeats is 3:1, and it comes from SaaS. David Skok wrote that "the best SaaS businesses have a LTV to CAC ratio that is higher than 3, sometimes as high as 7 or 8" ([Skok, For Entrepreneurs](https://www.forentrepreneurs.com/saas-metrics-2/)). The page shows no original publication date, and the article itself calls these guidelines that can be broken.

It does not carry over to a DTC brand unchanged.

**Margin.** Software has high gross margin and almost no variable cost per customer. In ecommerce, shipping, payment processing, returns and, on Amazon, referral and fulfillment fees come out of every order. The same ratio means different things at a wide margin and at a thin one.

**Repurchase cycle.** Coffee, supplements and skincare reorder in weeks. Mattresses and grills reorder in years. A mattress brand's one-year ratio will look poor even when the business is healthy, because the second purchase falls outside the window.

What decides it is **payback**: how many months until a cohort's cumulative margin covers its CAC, against how long your cash can fund that gap. In the same article, Skok treats payback beyond 12 months as a sign of anemic profitability for SaaS ([Skok](https://www.forentrepreneurs.com/saas-metrics-2/)). Your target comes from your margin and your reorder cycle, not from a borrowed multiple.

## Why does selling on Amazon distort LTV?

Because a customer you acquired on your Shopify store can reorder on Amazon, and that order reaches you with no key that ties it to the same person.

Amazon's order payload describes the buyer email as "the anonymized email address of the buyer" and carries no customer identifier ([Amazon SP-API](https://developer-docs.amazon/sp-api/reference/getorders)). Without a shared key, the Amazon order cannot be attached to the customer's history in your store. The channel-by-channel detail is in [why you can't compute LTV across marketplace and own store](https://precisian.io/blog/en/posts/ltv-by-channel-marketplace-own-store/).

What Amazon does give you is an aggregate. The Repeat Purchase report, available to sellers with the Brand Analytics role who are enrolled in Brand Registry, returns order count, unique customers, repeat customers as a share of the total and repeat purchase revenue per ASIN ([Amazon SP-API](https://developer-docs.amazon/sp-api/docs/report-type-values-analytics)). It tells you how many came back. It never tells you whether they first found you on your own site.

So own-store LTV **understates** the multichannel customer. How much depends on how much of your repeat demand migrates to Amazon, and that is the number no API returns at customer level, for the reasons covered in [the marketplace attribution black hole](https://precisian.io/blog/en/posts/marketplace-attribution-blackhole/).

## Why does platform-reported CAC come out too low?

Because each ad platform counts as its own conversion anything that happens inside its window, and the windows overlap.

Google Ads applies a default 30-day click window to Search and Display, configurable from 1 to 90 days ([Google](https://support.google.com/google-ads/answer/3123169)). Meta reports conversions across 1-, 7- and 28-day click windows and a 1-day view window, among others ([Meta Marketing API](https://developers.facebook.com/docs/marketing-api/reference/ads-action-stats/)). A shopper who clicked a Google ad and saw an Instagram ad before buying becomes one conversion in each.

Platform conversions also do not separate new from returning customers by default. An existing customer who comes back through an ad is counted. Spend divided by summed platform conversions uses an inflated denominator, and CAC lands below the real cost of a new buyer.

The two errors push in opposite directions. Own-store LTV drags the ratio down; platform CAC pushes it up. The ratio can look healthy by accident, with no way to tell which error is winning.

## What does the math look like?

A **synthetic** example with round numbers: a US supplement brand selling on its own Shopify store and on Amazon. None of these figures comes from a real company.

| Item | Synthetic value |
|---|---|
| Total acquisition cost for the quarter | $120,000 |
| New customers in Shopify order data | 1,000 |
| Conversions reported: Google Ads + Meta | 900 + 700 = 1,600 |
| 12-month margin per customer, Shopify only | $240 |
| 12-month margin per customer, including Amazon reorders (not observable per customer) | $310 |

| How the ratio was built | CAC | LTV | LTV:CAC |
|---|---|---|---|
| Platform conversions + Shopify LTV | $75 | $240 | 3.2 |
| New customers from order data + Shopify LTV | $120 | $240 | 2.0 |
| New customers from order data + LTV with Amazon | $120 | $310 | 2.6 |

The first row clears the 3:1 bar and is the most wrong of the three. The second is the only one you can compute from your own data, and it is conservative. The third is the truth of the example, and in practice it cannot be observed customer by customer. You can only estimate it from Amazon's aggregate, with the assumption written down.

Amazon reorders also carry less margin, after referral and fulfillment fees. Adding their revenue to LTV as if it were a Shopify order brings the error back from the other side.

## What isn't LTV:CAC?

It is not a channel metric. "LTV:CAC for Meta" requires assigning each customer an acquisition source, and Amazon orders carry none. LTV:CAC is a cohort metric.

It is not a forecast. The cohort method describes what a cohort already did. Projecting three-year LTV from a cohort four months old is modeling, and the report should label it that way.

And it is not one number for the company. It moves by category, by first-order offer and by acquisition channel inside your own store.

## When does this start to matter?

When Amazon stops being an overflow channel and becomes where your repeat customers shop. From then on, own-store LTV describes only part of the relationship.

To check, compare Shopify repeat curves for cohorts acquired before and after you launched on Amazon. If repeat rate fell while total brand margin did not, the customers are still buying, on Amazon. The fix starts with writing down, somewhere both the analyst and the AI read before computing, what counts as a new customer, which margin is in, and which horizon applies. It is the same discipline behind getting [marketing and finance to close one revenue number](https://precisian.io/blog/en/posts/marketing-finance-revenue-definition/).

At Precisian, store orders, marketplace orders and ad spend sit in the same data lake, isolated per client on Precisian's infrastructure, with those definitions recorded in the semantic layer and reachable through MCP, API or the client's own BI.

## What does this article not cover?

It gives no average LTV:CAC for DTC brands. I looked for research with a published methodology and found none; the benchmarks in circulation come from software vendors without a disclosed sample.

It does not say whether the Repeat Purchase report is available in every Amazon marketplace. The SP-API documentation describes the report and its access role, and availability is something to confirm in your own Seller Central.

And it does not cover predictive LTV models. They are legitimate, but they depend on clean order data, which is what this article is about.

If your LTV:CAC looks healthy and cash flow disagrees, the first step is recomputing CAC with new customers from your own order data instead of platform conversions. [See how Precisian's data lake joins store orders, Amazon and ad spend](https://precisian.io/en/demo), with no contract commitment, and no promise of an answer in 30 minutes either.
