---
title: "Composable CDP vs data lake: which one an ecommerce brand needs first"
description: "A composable CDP activates customer profiles that live in your warehouse. A data lake keeps every source for analysis. One sends, the other explains."
slug: "composable-cdp-vs-data-lake"
lang: "en"
translationKey: "cdp-vs-lake"
publishedAt: 2026-10-14
tags: ["data-lake", "data-warehouse", "build-vs-buy", "ecommerce", "camada-semantica", "custo"]
draft: false
llmSummary: "A composable CDP keeps customer profiles in the brand's own warehouse and syncs them to marketing tools; Hightouch documents deterministic identity resolution running directly in the warehouse. A data lake stores raw data from every source for analysis. A CDP activates; a lake explains."
citations: ["https://hightouch.com/docs/identity-resolution/overview", "https://hightouch.com/docs/syncs/schedule-sync-ui", "https://hightouch.com/docs/security/storage", "https://hightouch.com/pricing", "https://www.fivetran.com/press/fivetran-signs-agreement-to-acquire-census-delivering-the-first-end-to-end-data-movement-platform-for-the-ai-era", "https://www.cdpinstitute.org/learning-center/what-is-a-cdp/", "https://www.twilio.com/docs/segment/unify", "https://www.twilio.com/docs/segment/engage/audiences/", "https://www.twilio.com/en-us/pricing/customer-data"]
about: ["https://en.wikipedia.org/wiki/Customer_data_platform", "https://en.wikipedia.org/wiki/Data_lake", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
---

A composable CDP is a customer data platform assembled on top of the warehouse you already run: profiles live in your tables, and a reverse ETL tool syncs them to Meta, Google and your email platform. Hightouch, a vendor of the model, documents that its deterministic identity resolution runs "directly in your data warehouse" ([Hightouch docs](https://hightouch.com/docs/identity-resolution/overview), retrieved October 14, 2026). A data lake keeps raw data from every source so you can find out what actually happened. A CDP activates. A lake explains.

> **Composable CDP**: a customer data platform whose profiles are built and stored in the company's own data warehouse, with a separate activation tool reading from there and syncing audiences and traits to marketing destinations.
> **Data lake**: a repository that takes data as each source delivers it, from every source, with schema applied on read rather than on write, for later analysis.

The CDP Institute's 2026 definition of a CDP is "software that creates and maintains a persistent, unified customer record that is accessible to other systems" ([CDP Institute](https://www.cdpinstitute.org/learning-center/what-is-a-cdp/)). The noun in that sentence is the **customer**. The noun in a data lake is the **business**: orders, ad spend, refunds, shipping, inventory. That distinction decides most of this purchase.

## What criteria decide between a composable CDP and a data lake?

I'm stating the criteria before comparing anything, so you can disagree with them.

1. **Activation vs. analysis.** Is tomorrow's question "who gets this message right now?" or "how much did this campaign actually sell?"
2. **Identity resolution.** Do you need to merge the same shopper across your Shopify store, your app and Amazon into one profile so you can act on it?
3. **Cost per profile and per volume.** Segment, the reference packaged CDP, meters monthly tracked users; lakes meter storage, compute and connectors.
4. **Who operates it.** Lifecycle and CRM marketers, or a data team.
5. **Where the data lives.** In the CDP vendor's cloud, in your warehouse, or in a managed, isolated platform.

I'm leaving out journey-builder UX on purpose. It matters, but it's a criterion for choosing **between** CDPs, not between a CDP and a lake.

## How is a composable CDP different from a packaged one?

The profile moves. In a packaged CDP, it lives with the vendor. In a composable one, it lives in your warehouse.

Twilio Segment is the reference packaged CDP. Its Unify product uses identity resolution rules to merge event data "from across devices and channels" into "complete user- or account-level profiles" and describes those identities as real-time ([Twilio Segment docs](https://www.twilio.com/docs/segment/unify), retrieved October 14, 2026). Its Engage audiences are real-time by default: "By default, Segment creates all audiences as real-time computations" ([Twilio Segment docs](https://www.twilio.com/docs/segment/engage/audiences/)).

The composable side looks different. Hightouch's identity resolution writes `_resolved`, `_resolved_identifiers` and `_golden_records` tables, one golden record per person, inside your warehouse ([Hightouch docs](https://hightouch.com/docs/identity-resolution/overview)). Census, another vendor of the model, agreed to be acquired by Fivetran, which announced the deal on May 1, 2025 and called Census "the leader in Reverse ETL, data activation, and operational analytics" ([Fivetran](https://www.fivetran.com/press/fivetran-signs-agreement-to-acquire-census-delivering-the-first-end-to-end-data-movement-platform-for-the-ai-era)).

Two practical consequences follow. First, a composable CDP **presupposes** a modeled warehouse; without one there is nothing to read from. Second, activation runs on scheduled syncs. Hightouch documents manual, interval, cron and dbt Cloud triggers, with one minute as the smallest cron interval ([Hightouch docs](https://hightouch.com/docs/syncs/schedule-sync-ui)). That handles "push yesterday's repeat buyers to a Meta custom audience every morning." Firing the abandoned-cart email the moment someone leaves checkout is a different category, and that's where packaged, event-driven CDPs and email platforms still earn their place.

## What does a data lake do that a CDP doesn't?

It keeps everything that isn't a person.

Ad spend by campaign, shipping cost, Amazon fees, refunds, inventory, the GA4 export and the order total from your ERP or Shopify. None of it belongs to a customer profile, and all of it is what answers "how much did this campaign actually sell?" A CDP is designed around the shopper. It can ingest an order as an event, but it isn't where you reconcile Meta's reported ROAS against booked revenue.

A lake also keeps **history**, raw and replayable. If you're weighing the storage layer itself, [data lake vs data warehouse vs lakehouse](https://precisian.io/blog/en/posts/data-lake-vs-warehouse-ecommerce/) covers that choice. The narrower point is that neither the lake nor the CDP defines net revenue. That is the job of a [semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/), and it's what keeps the CDP and the lake from returning two different numbers for the same question.

## How do the options compare, criterion by criterion?

<table>
<thead>
<tr><th>Criterion</th><th>Packaged CDP (e.g. Segment)</th><th>Composable CDP (e.g. Hightouch)</th><th>Managed data lake (Precisian)</th></tr>
</thead>
<tbody>
<tr><td>Built for</td><td>Activation: audiences, journeys, triggers</td><td>Activation from the warehouse</td><td>Analysis, queried by the client's AI, BI or automation</td></tr>
<tr><td>Identity resolution</td><td>In the vendor, real-time profiles</td><td>In your warehouse</td><td>Customer as an analysis entity in the semantic layer; no profile served for triggering</td></tr>
<tr><td>Reaction time</td><td>Real-time audiences by default</td><td>Scheduled syncs (cron down to 1 minute)</td><td>Triggers nothing</td></tr>
<tr><td>Non-customer data (spend, shipping, refunds)</td><td>Outside the design</td><td>Whatever is in your warehouse</td><td>The center of the design</td></tr>
<tr><td>Pricing unit</td><td>Monthly tracked users; rate on request</td><td>Usage-based, no MTU limits; rate on request</td><td>Published at precisian.io/en/pricing</td></tr>
<tr><td>Who operates it</td><td>Lifecycle and CRM team</td><td>Data team plus marketing</td><td>Precisian maintains it; the client's team queries it</td></tr>
<tr><td>Where the data lives</td><td>Vendor infrastructure</td><td>Your warehouse, plus sync results in a vendor-managed bucket</td><td>A lake isolated per client, on Precisian's infrastructure</td></tr>
</tbody>
</table>

Sources for the table: Segment prices both plans on monthly tracked users and lists them as "contact sales" ([Twilio](https://www.twilio.com/en-us/pricing/customer-data), retrieved October 14, 2026). Hightouch describes pricing as usage-based with "No MTU (Monthly Tracked Users) limits," and paid plans go to "Get a demo" ([Hightouch](https://hightouch.com/pricing), retrieved October 14, 2026). Neither CDP side publishes a rate, the same pattern documented in [build or buy a data lake](https://precisian.io/blog/en/posts/build-vs-buy-data-lake/).

One nuance on "the data stays in your warehouse." Hightouch's security docs say it "stores query results and execution plans after each sync run" for change data capture, in a bucket it hosts on Free, Starter and Pro plans, where the data expires after 30 days; self-hosting that storage is a Business-tier option ([Hightouch docs](https://hightouch.com/docs/security/storage)). Tell your privacy team about that bucket before you promise them nothing leaves the warehouse.

## When should you **not** choose Precisian?

When what you need is real-time activation.

If the pain is event-triggered journeys (abandoned cart, welcome series, replenishment on the right day), an email or SMS that goes out the minute someone behaves a certain way, or ad audiences that update while the shopper browses, you need a CDP or an email and SMS platform. **Precisian does not activate campaigns.** It doesn't build journeys, send messages or push audiences to Meta. Delivery ends at the semantic layer; whatever acts on the data is the client's own AI, BI or automation.

It's also the wrong choice for a single-source store. One Shopify store, one payment processor and an email tool don't have a reconciliation problem, and a lake there solves a pain that doesn't exist.

## Which option fits which profile?

**One Shopify store, an email platform, light ad spend:** neither. Your email platform is the activation layer, and native reports are enough until they hurt.

**A brand whose pain is reacting to shopper behavior:** a packaged CDP, or the email and SMS platform you already have if it covers the events that matter. Reaction time is the deciding criterion.

**A brand with a data team and a modeled warehouse:** a composable CDP makes sense. It reuses what exists and keeps profiles next to the rest of your data.

**A brand on Shopify plus Amazon, spending across Meta, Google and TikTok, with no answer to "what did we actually sell":** that's an analysis problem, not an activation problem. Start with a lake and a semantic layer. A CDP with no trustworthy number behind it just fires faster on math that doesn't close.

**A brand that needs both:** CDPs and lakes coexist. The activation tool keeps sending; the lake keeps what it sent alongside spend, orders and refunds.

## What doesn't this article cover?

It doesn't quote CDP pricing, because neither [Twilio](https://www.twilio.com/en-us/pricing/customer-data) nor [Hightouch](https://hightouch.com/pricing) publishes a rate on the official pages I checked, and I don't print figures I couldn't open at the source. It doesn't compare CDPs with each other (Salesforce, Adobe, Bloomreach and others), and it skips probabilistic identity resolution, which Hightouch documents as processing some data outside the warehouse.

---

If the open question in your business is "what did this campaign actually sell" rather than "who gets the next message," the first step is measuring the gap between what the ad platforms report and what your store booked. What Precisian includes to run that math, and how it charges, is on the [pricing page](https://precisian.io/en/pricing).
