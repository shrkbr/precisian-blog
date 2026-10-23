---
title: "What counts as first-party data for an ecommerce brand, and where should it live?"
description: "First-party data is what you record in a direct relationship with your customer. Modeled conversions and platform audiences look like it and aren't."
slug: "first-party-data-ecommerce"
lang: "en"
translationKey: "first-party-data"
publishedAt: 2026-10-23
tags: ["tracking", "privacy", "consent", "data-lake", "ecommerce", "marketplace"]
draft: false
llmSummary: "First-party data is customer information a business collects directly: orders, accounts, site events. Google's Customer Match policy only accepts data collected in a first-party context. Modeled conversions are estimates; Amazon tells seller tools to delete buyer PII 30 days after delivery."
citations: ["https://support.google.com/adspolicy/answer/6299717?hl=en", "https://support.google.com/google-ads/answer/10081327", "https://developer-docs.amazon.com/sp-api/docs/guidance-to-address-key-security-controls-in-sp-api-integration", "https://developer.apple.com/app-store/user-privacy-and-data-use/", "https://support.google.com/analytics/answer/7667196", "https://webkit.org/tracking-prevention/", "https://webkit.org/blog/14301/private-browsing-2-0/"]
about: ["https://en.wikipedia.org/wiki/First-party_data", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
---

First-party data is customer information your business records in a direct relationship with the customer: the order, the account, the site event, the support conversation. Google draws the line the same way in its Customer Match policy: advertisers may only upload customer information "collected in the first-party context," such as data from "your websites, apps, physical stores" or situations where customers shared it directly with you ([Google](https://support.google.com/adspolicy/answer/6299717?hl=en), checked October 23, 2026).

> **First-party data**: information about a customer that a business recorded firsthand, in a direct interaction with that customer, and whose use, retention and destination the business controls.

## How do you tell whether data is really first-party?

"Data you collected" is where most definitions stop, and it isn't enough. Plenty of data passes through your hands without being yours. Three tests settle it, and data only counts if it passes all of them.

**Who collected it, and in whose relationship?** An order placed on your Shopify store comes from a relationship between the customer and your brand. A list of "people similar to your buyers" comes from the relationship between those people and the ad platform. The second can be useful. It isn't yours.

**Is it an observation or an estimate?** First-party data records a fact: order 10482 was paid by card at 2:02 p.m. A number the platform computes to fill in what it couldn't see is something else, even when it lands in the same column.

**Who decides what happens to it?** If you can't decide how long the data is kept, who reads it and where it goes, someone else controls it. Amazon is the cleanest example. Its security guidance for Selling Partner API integrations tells solution providers to "delete personally identifiable information (PII) within 30 days after order delivery" ([Amazon SP-API](https://developer-docs.amazon.com/sp-api/docs/guidance-to-address-key-security-controls-in-sp-api-integration), checked October 23, 2026). The sale is in your revenue. The customer's identity is on Amazon's clock.

## What looks like first-party data but isn't?

The table separates first-party data from data that only looks like it.

| Data | First-party? | Why |
|---|---|---|
| Order in Shopify, BigCommerce or your ERP | Yes | A fact you recorded in a direct relationship with the buyer |
| Customer account (email, address, phone) | Yes | The customer gave it to you |
| Site events (view, add to cart, purchase) | Yes at collection, partial in storage | The copy in GA4 follows Google's retention settings |
| Support and SMS conversations | Yes, if stored | A thread nobody can query tied to an order is a dead end |
| Amazon marketplace sale | Partial | The order reaches you; the buyer's PII has a 30-day limit and the click origin stays with Amazon |
| Google Ads modeled conversions | No | A platform estimate, not your observation |
| Lookalike or similar audiences | No | Your seed list is yours; the derived audience lives and runs inside the platform |
| Purchased third-party data | No | Collected by another company in a relationship that isn't yours |

**Site events.** They are collected in a first-party context, but the copy your team actually queries is usually GA4's. In a standard property, event-level data is kept for "2 months" or "14 months," and that setting affects explorations and funnel reports, not standard aggregated reports ([Google](https://support.google.com/analytics/answer/7667196), checked October 23, 2026). Anyone who tries to compare Black Friday two years back at the event level finds the data was first-party at collection and borrowed in storage. Retention is covered in [how long to retain marketing data](https://precisian.io/blog/en/posts/marketing-data-retention-how-long/).

**The Amazon sale.** You own the order record. The buyer relationship, the contact channel and the traffic source belong to the marketplace. Amazon's analytics schema returns 28 traffic fields per product and none for origin, as laid out in [marketplaces return traffic, never its source](https://precisian.io/blog/en/posts/marketplace-attribution-blackhole/).

## Why aren't modeled conversions first-party data?

Because Google says they are predictions. Its documentation describes modeled conversions as using "data that doesn't identify individual users to estimate conversions," applied to slices where Google knows it "can't observe ad attribution." The model judges whether an ad interaction led to a conversion; "it doesn't determine whether or not a conversion happened" ([Google Ads](https://support.google.com/google-ads/answer/10081327), checked October 23, 2026).

In the "Conversions" column, Google reports modeled and observed conversions together. The number reads like a fact about your business and is partly an estimate made by the company selling you the media.

The model can be right and the number still unfit to be your source of truth for revenue. GA4 does the same with denied consent, which is why [the GA4 interface and your BigQuery export never agree](https://precisian.io/blog/en/posts/consent-mode-modeled-data/). First-party data is the order that exists in your system regardless of anyone's model.

## What is first-party data not?

**It isn't a collection technology.** Server-side tagging changes where requests come from and who sets the cookie. That is a collection decision, covered in [is server-side tagging worth it?](https://precisian.io/blog/en/posts/server-side-tagging-worth-it/). Collecting firsthand is necessary and not sufficient: data you collected but keep only in another company's platform still runs on that company's rules.

**It isn't the same as data on your own servers.** Ownership is about who decides, not about which building the disk sits in. A vendor can process data on your behalf. What matters is that you keep the power to decide and to take the data with you.

**It isn't a license to share it.** Apple defines tracking as "linking user or device data collected from your app with user or device data collected from other companies' apps, websites, or offline properties for targeted advertising or advertising measurement purposes" ([Apple](https://developer.apple.com/app-store/user-privacy-and-data-use/)). Data can be first-party when you collect it and become tracking the moment you combine it with someone else's.

**It isn't a 2026 trend.** The pressure to rely on it comes from structural signal loss, not from a deadline.

## Why does signal loss push everything toward first-party data?

Because the signal ad platforms observe is shrinking for several reasons at once, and none of them waits on a future announcement.

Third-party cookies are still on by default in Chrome, and the planned replacement was retired in October 2025, as covered in [are third-party cookies actually gone?](https://precisian.io/blog/en/posts/third-party-cookie-state/). The real loss comes from elsewhere:

- Safari deletes all cookies created in JavaScript and all other script-writeable storage "after 7 days of no user interaction with the website" ([WebKit](https://webkit.org/tracking-prevention/)).
- In Safari Private Browsing, query parameters used for tracking "granular to users or clicks" are removed before navigation, while campaign-only parameters pass through ([WebKit, July 16, 2024](https://webkit.org/blog/14301/private-browsing-2-0/)).
- Visitors who decline consent become an estimate in the GA4 interface, not an event.

Each mechanism takes a slice out of what the platform sees. The order in your system loses nothing: it was paid, fulfilled and delivered, cookie or no cookie. As I read it, that is the practical test for whoever sets the media budget: the order stays on record even when the rest of the signal turns into an estimate.

## Where should first-party data live?

Outside the platform that uses it to sell you media, under retention you decide, and joined to the order.

**Outside the media platform.** Google Ads and Meta need your data to optimize campaigns, and sending it makes sense. But the reference copy can't be the one that lives there, because there it gets blended with modeled numbers and follows the retention and format of whoever received it.

**Under retention you decide.** If your year-over-year comparison depends on another company's retention setting, your analysis horizon isn't yours.

**Joined to the order.** A site event, a support thread or a click is worth little on its own. Tied to the order, it answers "which channel brought in the customer who came back and bought again."

In practice that is a data lake holding the full history, with a definition layer on top that says what counts as a sale, a customer and revenue. The storage options are compared in [data lake vs data warehouse vs lakehouse](https://precisian.io/blog/en/posts/data-lake-vs-warehouse-ecommerce/).

Precisian runs exactly that part: a data lake isolated per client on Precisian's infrastructure, a semantic layer on top, and access through the AI, API or BI tool your team already uses. The infrastructure is ours; the data is yours. You can access it at any time, and if you leave, you take all of it.

## When does this start to matter for your business?

Three concrete signals. One is enough.

**Two platforms claim the same sale.** If the sum of platform-reported conversions exceeds your fulfilled orders, you are allocating budget on a number that includes estimates from the people selling the media.

**Your question needs more than 14 months.** Seasonality, repeat-purchase cohorts and LTV by channel need event- or order-level history that GA4's standard retention, capped at 14 months, doesn't keep ([Google](https://support.google.com/analytics/answer/7667196)).

**A real share of revenue runs through Amazon.** The buyer relationship sits partly outside your systems, and only what you record next to the order stays yours.

## What doesn't this article cover?

It isn't legal advice on US state privacy laws, and it doesn't compare collection tools or CDPs. It also doesn't cover Walmart Marketplace or TikTok Shop data access rules, which I didn't verify against their developer documentation.

---

If your budget decisions run on the platform's conversion column instead of fulfilled orders, the first step is measuring the gap between the two. [See how first-party data is stored and queried in practice](https://precisian.io/en/demo) — no contract commitment, and no promise of an answer in 30 minutes either.
