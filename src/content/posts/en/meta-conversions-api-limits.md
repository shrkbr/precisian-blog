---
title: "Meta Conversions API: what it recovers and what it doesn't fix"
description: "The Conversions API sends Meta the events your server recorded. Without a Pixel-matching event_id inside 48 hours, one purchase counts twice."
slug: "meta-conversions-api-limits"
lang: "en"
translationKey: "meta-capi"
publishedAt: 2026-10-23
tags: ["tracking", "attribution", "data-discrepancy", "ecommerce"]
draft: false
llmSummary: "Meta's Conversions API sends server events without relying on the browser. Per Meta's developer docs (checked October 23, 2026), Pixel and server events deduplicate only with matching event_id and event_name within 48 hours, and a batch with any event over 7 days old is rejected whole."
citations: ["https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events/", "https://developers.facebook.com/docs/marketing-api/conversions-api", "https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/server-event", "https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters", "https://developers.facebook.com/docs/marketing-api/conversions-api/best-practices", "https://developers.facebook.com/docs/marketing-api/conversions-api/dataset-quality-api", "https://developers.facebook.com/docs/marketing-api/reference/ads-action-stats/"]
about: ["https://en.wikipedia.org/wiki/Meta_Platforms", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 9
---

Meta's Conversions API sends Meta the events your own server recorded, without depending on the shopper's browser, so it recovers part of what the Pixel loses, and nothing more. Meta's developer documentation (checked October 23, 2026) says a Pixel event and a server event are treated as one purchase only when they share the same `event_id` and `event_name` and arrive within 48 hours of each other ([Meta](https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events/)). Miss any of those and the order counts twice.

> **Conversions API (CAPI)** is the server-to-server connection an advertiser uses to send Meta the events its own systems recorded. In Meta's words, those events "are linked to a dataset ID and are processed like events sent using the Meta Pixel" ([Meta](https://developers.facebook.com/docs/marketing-api/conversions-api)).

CAPI improves what goes into Meta. It does not change what Meta does with it afterward.

## What does a broken Conversions API setup look like in your reports?

Three patterns, and the first one usually gets celebrated before anyone checks it.

**Purchases jump the week CAPI goes live, and Shopify doesn't.** Ads Manager starts showing more purchases than the store actually took. The likeliest cause is deduplication failing, with the Pixel and the server both counting the same order.

**Nothing changes.** The integration is on, the partner says it's healthy, and volume looks exactly like it did before. Usually the server is sending the same event the Pixel already sent, with too little customer data for Meta to match it to an account.

**The nightly sync fails now and then, with no obvious pattern.** That is the seven-day rule, covered below.

## What does the Conversions API actually recover?

The event the browser never delivered, as long as your server recorded it.

The Pixel depends on a script running in the visitor's browser. Ad blockers, a script that didn't load, a tab closed before the confirmation page fired: those losses happen before anything reaches Meta. A server event comes from somewhere else, the system that wrote the order. If the order is in your database, it can reach Meta even if the thank-you page never rendered.

Meta recommends running both: "Use the Conversions API in addition to the Meta Pixel, and share the same events using both tools" ([Meta, best practices](https://developers.facebook.com/docs/marketing-api/conversions-api/best-practices)). That redundancy is what creates the double-count risk, which is why deduplication is the center of this topic.

How much it recovers, Meta doesn't state as a fixed number. The only official measure is one Meta computes itself, **Additional Conversions Reported (ACR)**, described as a metric that "helps you understand how much your business benefits from using the Conversions API alongside the Meta Pixel" ([Meta, Dataset Quality API](https://developers.facebook.com/docs/marketing-api/conversions-api/dataset-quality-api)). The same page shows a median of 30.1% for PageView events among "similar advertisers" inside a sample API response. It is an example payload, not a benchmark, and I don't treat it as an estimate for any store.

To match an event to a person, the server sends customer information. The docs split it into groups ([Meta, customer information parameters](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters)):

| Parameter | What it is | Hashing |
|---|---|---|
| `em`, `ph`, `fn`, `ln`, `ct`, `st`, `zp`, `country` | Email, phone, name, city, state, ZIP, country | Required |
| `external_id` | Your own ID, such as a customer or loyalty ID | Recommended |
| `client_ip_address`, `client_user_agent` | Visitor IP and browser | Do not hash |
| `fbc`, `fbp` | Meta's click and browser cookies | Do not hash |

Every website event also requires `client_user_agent` and `event_source_url` ([Meta, server event parameters](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/server-event)).

## Why does the same purchase show up twice?

Because deduplication has three conditions, and any one can fail.

Meta decides whether two events are the same "based on their ID and name": the Pixel's `eventID` must equal the server's `event_id`, and the event name must match on both sides. And events "are only deduplicated if they are received within 48 hours" of the first event with that ID ([Meta](https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events/)).

The three most common ways this breaks:

1. **IDs generated in different places.** The Pixel creates a random value in the browser while the server sends the Shopify order number. Both are unique. They never match.
2. **The server event arrives outside 48 hours.** The Pixel fires `Purchase` at checkout. The server fires `Purchase` when the order clears manual fraud review or the payment settles days later. Past the window, Meta counts two purchases.
3. **Relying on the fallback method.** Meta can deduplicate on `fbp` or `external_id`, but that method "only works for deduplicating events sent first from the browser and then through the server," and it does not deduplicate when only one source is used ([Meta](https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events/)).

The `event_id` documentation points to the fix itself: the field is optional but recommended for deduplication, and an order or transaction number makes a good identifier ([Meta, server event parameters](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/server-event)).

## Why does the nightly sync fail for no reason?

It is the strictest rule in the API, and it sits in the description of the `event_time` parameter.

`event_time` is when the event actually happened, as a Unix timestamp in seconds, in GMT, and it "can be up to 7 days before you send an event to Facebook." If any event in the batch is older than that, Meta returns "an error for the entire request" and processes none of them ([Meta, server event parameters](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/server-event)).

A job that reads your order system every night and sends the day's completed orders works until the day an order placed eight days ago finally completes, or until a weekend outage leaves a backlog. That night the whole batch bounces, yesterday's purchases included. Use the order's creation time and the error appears. Use the completion time and it doesn't, but then the server purchase sits far from the Pixel purchase and the deduplication above breaks.

## How do you diagnose Conversions API problems?

With five checks. The first four come from Meta's Dataset Quality API, which returns dataset quality metrics event by event.

| Check | Where to look | What signals a problem |
|---|---|---|
| Event Match Quality | `event_match_quality.composite_score` | Score out of 10, computed in real time, web events only. Meta publishes no minimum: compare events and watch the trend |
| Event coverage | `event_coverage` | Below 75%, the threshold Meta uses in its own response |
| Deduplication keys | `dedupe_key_feedback` | Low share of browser and server events carrying `event_id` |
| Delay | `event_delay` | Share of events delayed more than 2 hours and more than 24 hours |
| Purchases vs. orders | Purchase events received per day vs. completed orders in Shopify or your OMS | Meta receiving more purchases than the store completed |

Source for the first four rows: [Meta, Dataset Quality API](https://developers.facebook.com/docs/marketing-api/conversions-api/dataset-quality-api). Event coverage is "the 7-day average percentage of Meta Pixel events that are covered by the Conversions API" and share deduplication keys with server events.

The query is a plain GET, in the documentation's format:

```
curl -X GET -G \
  -d 'fields=web{event_name,event_match_quality,event_coverage,dedupe_key_feedback,event_delay}' \
  -d 'dataset_id=<DATASET_ID>' \
  -d 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/<VERSION>/dataset_quality
```

The token needs `ads_read` plus either `ads_management` or `business_management`, and the user needs at least partial access to use the dataset ([Meta](https://developers.facebook.com/docs/marketing-api/conversions-api/dataset-quality-api)).

For the fifth check, compare total events received, not attributed purchases. A synthetic example with round numbers: the store completes 1,000 orders in a month, the Pixel records 800 and the server sends all 1,000. With deduplication working, Meta ends up near 1,000. With mismatched `event_id`s, it can end up with as many as 1,800, and what looked like lift from the integration is double counting.

## How do you fix it?

In the order the problems show up.

**Generate `event_id` on the server.** The order number is the natural candidate. Render it on the confirmation page so the Pixel passes the same value as `eventID`, and send that value through the API.

**Decide when a purchase happens.** If the Pixel fires at checkout, the server should send the `Purchase` for that same moment, inside 48 hours, and settlement becomes a separate event. The longer payment takes to settle, the more likely confirmation lands outside that window; manual fraud review and delayed payment methods are the typical cases. Meta won't decide this for you. It is a business definition, and it has to be the same in the Pixel, on the server and in the report that compares both against your order system.

**Normalize customer data before hashing.** The docs ask for phone numbers with the country code and no leading zeros, email trimmed and lowercased, city in lowercase with no spaces or punctuation, ZIP as the first five digits for the US, and country as a two-letter lowercase ISO code ([Meta, customer information parameters](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters)). Meta's own example turns `(650)555-1212` into `16505551212`. Do not hash IP, user agent, `fbc` or `fbp`.

**Send close to real time, and filter the batch.** Meta says you can share server events "in real time or in batches close to real time" ([Meta, best practices](https://developers.facebook.com/docs/marketing-api/conversions-api/best-practices)). If you batch, drop anything older than seven days before sending so one stale order can't sink the rest.

**Target event coverage of 75% or more**, Meta's own threshold. Below it, deduplication doesn't have enough keys to work with.

If CAPI runs through a server-side tagging container, also read [what server-side tagging can't recover](https://precisian.io/blog/en/posts/server-side-tagging-worth-it/): the container changes the event's route, not consent and not the identifier the browser already deleted.

## When can't the Conversions API fix it?

In three cases, and none of them is configuration.

**Sales your server never recorded.** The API sends what exists in your systems. An Amazon sale happens on a domain you don't control, and [marketplaces return traffic, never its source](https://precisian.io/blog/en/posts/marketplace-attribution-blackhole/). A sale closed over text message only becomes an event if someone records it: the API accepts `chat` and `business_messaging` as `action_source` values ([Meta](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/server-event)), but it can't create the order nobody entered.

**Meta's judgment of its own media.** Meta's deduplication runs between the Pixel and the server of the same advertiser. It does not discount a purchase that Google also claimed, which is why [reported ROAS can exceed actual revenue](https://precisian.io/blog/en/posts/roas-exceeds-actual-revenue/). CAPI gives Meta more events to attribute under its own rules. The insights API reference lists, next to the default window, a separate window called "Incremental Attribution" ([Meta](https://developers.facebook.com/docs/marketing-api/reference/ads-action-stats/)). My reading: a separate incremental window tells you the default one isn't. And ACR, the metric that sizes the integration's benefit, is computed by the company selling the media.

**Asking the platform to grade itself.** Ask Meta how many purchases Meta drove and you get Meta's answer, whether through Ads Manager or through [the official Meta Ads MCP](https://precisian.io/blog/en/posts/meta-ads-mcp-permissions/), which returns the conversions the platform attributes to itself.

And one case where Precisian is not the answer: if your only problem is a mismatched `event_id`, the fix is an afternoon of developer time and you don't need a data platform for it. What takes more than an afternoon is the ongoing comparison against your order system, because it depends on a written definition of "order" (placed, paid, shipped) that analysts and AI tools read from the same place. That is the job of a [semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/).

The signal loss CAPI addresses is structural and doesn't hinge on Chrome, where [third-party cookies are still enabled by default](https://precisian.io/blog/en/posts/third-party-cookie-state/).

## What does this article not cover?

It doesn't cover consent or state privacy law. Sending an event from the server doesn't change your obligations toward someone who opted out. The API has a `data_processing_options` field whose accepted value is `LDU`, for Limited Data Use ([Meta](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/server-event)), but when to use it is a question for counsel, not for Meta's docs.

It doesn't cover app events, since Event Match Quality currently exists only for web events, or partner and gateway integrations, which have their own documentation.

And it doesn't say how many conversions CAPI will recover for your store. Meta doesn't publish that number outside the sample payload cited above, and the figures in circulation come from the people selling the implementation.

If Ads Manager purchases climbed past your completed orders after CAPI went live, the first step is measuring how many events arrive without a matching `event_id` on both sides. [Let's talk about your setup](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).
