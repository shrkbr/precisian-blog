---
title: "Marketplaces return traffic, never its source"
description: "Amazon's own schema returns 28 traffic fields per product and zero origin fields. The absence is in the schema, not your integration."
slug: "marketplace-attribution-blackhole"
lang: "en"
translationKey: "marketplace-data-blackhole"
publishedAt: 2026-12-22
tags: ["marketplace", "atribuicao", "divergencia-de-dados"]
draft: false
llmSummary: "Marketplaces return traffic volume but no origin. Amazon's salesAndTraffic schema lists 28 traffic fields per product with no referrer, channel, campaign, UTM or search term. Marketplace attribution cannot be reconstructed from order data; it is modelled or absent."
citations: ["https://raw.githubusercontent.com/amzn/selling-partner-api-models/main/schemas/data-kiosk/analytics_salesAndTraffic_2024_04_24.graphql", "https://developer-docs.amazon/sp-api/docs/orders-api-rate-limits", "https://developer-docs.amazon/sp-api/docs/access-orders-pii", "https://developer-docs.amazon/sp-api/docs/orders-api-v0-reference"]
about: ["https://en.wikipedia.org/wiki/Attribution_(marketing)", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

In the `salesAndTraffic` schema dated 24 April 2024, published by Amazon itself, the API returns **28 traffic fields per product and not one origin field**. The official Data Kiosk schema lists sessions, B2B sessions, browser sessions, app sessions, page views and buy box percentage, and contains no referrer, no channel, no campaign, no UTM and no search term ([Amazon's schema on GitHub](https://raw.githubusercontent.com/amzn/selling-partner-api-models/main/schemas/data-kiosk/analytics_salesAndTraffic_2024_04_24.graphql)).

You receive the denominator of the conversion and never the provenance. It is the difference between knowing how many people walked into the store and having no idea which street they came from.

> **The structural fact**: marketplace attribution cannot be reconstructed from the data the marketplace returns. It is modelled, or it does not exist.

## What exactly do you get, then?

Volume and outcome, at a grain that cannot be joined to a journey.

The traffic fields describe how many sessions a listing received and what share of them converted. That is genuinely useful for listing optimisation: a low conversion rate on healthy sessions points at price, images or reviews, and a low session count points at search placement.

What it cannot support is any sentence beginning "customers who came from". There is no field carrying that, and the absence is in the schema rather than in your integration.

Nor is the aggregate joinable. Traffic arrives summarised by day and by product. Orders arrive as individual records. There is no key connecting a session to an order, so the two datasets sit side by side describing the same commerce without ever touching.

## Is the buyer identifiable across orders?

Not reliably, and Amazon's own field description settles it.

Buyer email is documented as "the anonymized email address of the buyer", and access to it is gated behind restricted roles and specific order states rather than being generally available ([Amazon](https://developer-docs.amazon/sp-api/docs/access-orders-pii)).

The practical result is that repeat-purchase analysis inside the channel is limited, and across channels it is unavailable. A customer who buys from your marketplace listing and later from your own store is two records with nothing linking them, and any link you construct is inference with an error rate you cannot measure.

That is why lifetime value by acquisition channel, the metric most often requested in this context, [is not computable across the boundary](https://precisian.io/blog/en/posts/ltv-by-channel-marketplace-own-store/) rather than merely difficult.

## Doesn't the advertising side fill the gap?

It fills part of its own side, and only that.

Marketplace advertising reports attribute sales to campaigns within the marketplace's own measurement. That is real data about that channel, and it says nothing about organic placement, about external traffic you drove to the listing, or about how the two interact.

So the picture you can assemble has a shape worth naming: dense where the marketplace sells you advertising, sparse everywhere else. That is not an accident of engineering. Information is released where it supports the platform's commercial relationship with you, and withheld where it does not.

Stating that plainly is more useful than the usual framing of "the data is limited", because it predicts where the next gap will be.

## What can you actually measure?

Four things, all defensible, none of which is attribution.

**Listing conversion rate.** Sessions to orders, per product, per period. The most actionable number available and the one the schema is designed for.

**Buy box share.** Documented in the same schema and directly tied to whether your listing is winning the default purchase path.

**Contribution after fees.** Computable from data you already hold, and the number that actually constrains how much you can spend on the channel.

**Incremental effect of your own actions.** If you change price, imagery or advertising spend and hold everything else, the movement in the first metric is attributable to you by design rather than by a field.

That last one is the closest thing to attribution available here, and it requires running the change deliberately rather than reading a report.

## How do you consolidate marketplace and own store?

By keeping them apart in the model and together only in the total.

The instinct is to unify: one orders table, one revenue column, one dashboard. The instinct produces a figure nobody can explain, because the two channels differ in what they report, when they report it, and what net amount actually arrives.

A workable arrangement separates three things from the start. **Channel as a first-class field**, never inferred from a name. **Gross order value and net remittance as distinct columns**, because the commission difference is not an error to reconcile away. And **attribution scope declared per report**, so a channel-split figure never silently includes a channel that publishes no origin data.

Push marketplace revenue into the same `revenue` column as direct sales and you lose the ability to explain the difference later, which is precisely what you will be asked to do.

## How do you brief a board on a channel you cannot attribute?

By changing the question from "where did it come from" to "what happens when we change it".

Attribution answers a question the marketplace will not let you ask. Incrementality answers one it cannot prevent you from asking, because it depends on your own actions rather than on the platform's disclosure. If you raise advertising spend on a set of listings and hold a comparable set unchanged, the difference between them is yours to observe.

That is a slower instrument than a dashboard, and it is the only honest one available here. It also happens to be the instrument the platforms themselves use internally, which is a useful thing to say in the room.

The framing that lands is usually this: we can report exactly what the channel produced, we cannot report why, and here is what we learned by testing. That sentence survives scrutiny. "Marketplace attribution shows most of it coming from organic search" does not survive the first person who asks which field produced that.

## What breaks when you try to force it?

Three specific failures, all of which look like success for a while.

**Inferring channel from the listing's own advertising report.** The report covers advertising-driven sales inside the platform. Treating its complement as "organic" assumes the only two states are advertised and not, which ignores external traffic you drove yourself.

**Matching orders to your own site sessions by timing.** Somebody browsed your site, then bought on the marketplace an hour later. You will find those pairs, and you will also find coincidences, and nothing tells you the ratio. The method produces a number with an unmeasurable error rate, which is worse than no number because it carries false precision.

**Filling the gap with a modelled attribution product.** Some of these are well built. All of them are producing an estimate over data that lacks the joining key, and the output arrives in the same format as a measurement. If you use one, the obligation is to label its output as modelled everywhere it appears, which in practice almost nobody does.

## What should you store from day one?

The raw order payload, before transformation, with three fields disciplined.

The **native order identifier**, which is the only genuinely stable key. The **status kept as a series** rather than overwritten, because overwriting erased the cancellation you will later be asked to explain. And the **collection timestamp**, separate from the order date, which lets you reconstruct what you knew at a past moment.

Rate limits shape how you do this. Amazon publishes per-operation rates for the Orders API ([Amazon](https://developer-docs.amazon/sp-api/docs/orders-api-rate-limits)), and a nightly job that pulls a list and then details per order has to respect them. Designing the extraction against the documented rates, rather than discovering them through throttling, is the difference between a job that finishes and one that silently returns a partial day.

A partial day is the dangerous outcome, because it looks like a slow sales day rather than a failed extraction.

## Why does this become urgent with an AI agent?

Because the agent will answer the attribution question anyway.

Ask a human analyst where marketplace sales came from and you get a caveat: we cannot see that. Ask an agent over the same data and it will find a field named something like `sales_channel`, compute a breakdown and present it, [at its usual confidence](https://precisian.io/blog/en/posts/metric-hallucination/). The field exists. It names the venue, not the origin, and nothing in the response says so.

The defence is not a better prompt. It is making the tool refuse: a query for attribution scoped to a channel that publishes none should return an explicit "not available for this channel" rather than the nearest available column. That is [abstention as a system property](https://precisian.io/blog/en/posts/teaching-an-agent-to-say-i-dont-know/) rather than a hoped-for behaviour.

## What does this article not cover?

It names no field from marketplaces I could not read. Several major platforms serve developer documentation that renders client-side or refuses automated retrieval entirely, and I do not describe field lists I have not seen.

It gives no figure for what share of e-commerce runs through marketplaces. That number varies enormously by category and geography, and the ones in circulation trace back to vendor reports without published sampling.

It does not evaluate integration platforms. They can move the data; none of them can create an origin field that the source does not emit, and any that implies otherwise is selling a model as a measurement.

And it makes no claim about what marketplaces intend. The schema is a fact. The reasoning behind it is not published, and inferring motive from an absent field would be exactly the kind of confident overreach this article is about.
