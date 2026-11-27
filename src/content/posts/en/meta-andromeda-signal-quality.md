---
title: "Meta Andromeda: how ad retrieval changed and why signal quality matters"
description: "Andromeda is Meta's ad retrieval engine: it narrows tens of millions of ads to a few thousand. Delivery learns from the matched events your store sends."
slug: "meta-andromeda-signal-quality"
lang: "en"
translationKey: "meta-andromeda-signal-quality"
publishedAt: 2026-11-23
tags: ["attribution", "tracking", "data-discrepancy", "ecommerce", "roas"]
draft: false
llmSummary: "Andromeda is Meta's ad retrieval system, which narrows tens of millions of candidate ads to a few thousand (Meta Engineering, Dec 2, 2024). Meta's docs say only matched events feed delivery optimization, so a double-counted or mispriced purchase trains delivery on the wrong target."
citations: ["https://engineering.fb.com/2024/12/02/production-engineering/meta-andromeda-advantage-automation-next-gen-personalized-ads-retrieval-engine/", "https://s21.q4cdn.com/399680738/files/doc_financials/2024/q4/META-Q4-2024-Earnings-Call-Transcript.pdf", "https://s21.q4cdn.com/399680738/files/doc_financials/2025/q2/META-Q2-2025-Earnings-Call-Transcript.pdf", "https://s21.q4cdn.com/399680738/files/doc_financials/2025/q3/META-Q3-2025-Earnings-Call-Transcript.pdf", "https://s21.q4cdn.com/399680738/files/doc_financials/2025/q4/META-Q4-2025-Earnings-Call-Transcript.pdf", "https://s21.q4cdn.com/399680738/files/doc_financials/2026/q2/META-Q2-2026-Earnings-Call-Transcript.pdf", "https://developers.facebook.com/docs/marketing-api/conversions-api/best-practices", "https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events/", "https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/custom-data", "https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/server-event", "https://developers.facebook.com/docs/marketing-api/conversions-api/dataset-quality-api"]
about: ["https://en.wikipedia.org/wiki/Meta_Platforms", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
cta: regua
---
Meta Andromeda is the machine learning system that handles ad **retrieval** at Meta: out of tens of millions of candidate ads, it picks the few thousand that move on to ranking and the auction ([Meta Engineering](https://engineering.fb.com/2024/12/02/production-engineering/meta-andromeda-advantage-automation-next-gen-personalized-ads-retrieval-engine/), published December 2, 2024). Andromeda changed which ads get into the race. What Meta's delivery learns from is still the conversion event your store sends.

> **Andromeda** is, in Meta's words, *"Meta's proprietary machine learning (ML) system design for retrieval in ad recommendation."* Retrieval is *"the first step in our multi-stage ads recommendation system"*; after it, *"larger and more sophisticated ranking models predict people and advertiser value"* ([Meta Engineering, Dec 2, 2024](https://engineering.fb.com/2024/12/02/production-engineering/meta-andromeda-advantage-automation-next-gen-personalized-ads-retrieval-engine/)).

Meta doesn't run your store, and Precisian doesn't run your media. This piece covers the part that stays with you: the data going in.

## What has Meta actually published about Andromeda?

Every primary source on Andromeda comes from two places: [Meta's engineering blog](https://engineering.fb.com/2024/12/02/production-engineering/meta-andromeda-advantage-automation-next-gen-personalized-ads-retrieval-engine/) and the quarterly earnings calls posted on [Meta's investor site](https://investor.atmeta.com/). I read all six sources in the table on November 23, 2026.

| Date | Source | What Meta said |
|---|---|---|
| Dec 2, 2024 | [Engineering blog](https://engineering.fb.com/2024/12/02/production-engineering/meta-andromeda-advantage-automation-next-gen-personalized-ads-retrieval-engine/) | Retrieval narrows *"tens of millions"* of candidates to *"a few thousand"*; +6% recall and +8% ads quality *"on selected segments"* |
| Jan 29, 2025 | [Q4 2024 earnings call](https://s21.q4cdn.com/399680738/files/doc_financials/2024/q4/META-Q4-2024-Earnings-Call-Transcript.pdf) | Introduced in the second half of 2024 with Nvidia; a 10,000x increase in the complexity of retrieval models |
| Jul 30, 2025 | [Q2 2025 earnings call](https://s21.q4cdn.com/399680738/files/doc_financials/2025/q2/META-Q2-2025-Earnings-Call-Transcript.pdf) | Extended to Facebook Reels; *"nearly 4% higher conversions on Facebook mobile Feed and Reels."* Ranking runs on a separate model, GEM |
| Oct 29, 2025 | [Q3 2025 earnings call](https://s21.q4cdn.com/399680738/files/doc_financials/2025/q3/META-Q3-2025-Earnings-Call-Transcript.pdf) | Retrieval and early-stage ranking combined into a single model; a 14% increase in ads quality on Facebook surfaces |
| Jan 28, 2026 | [Q4 2025 earnings call](https://s21.q4cdn.com/399680738/files/doc_financials/2025/q4/META-Q4-2025-Earnings-Call-Transcript.pdf) | Now runs on Nvidia, AMD and MTIA chips; compute efficiency *"nearly"* tripled |
| Jul 29, 2026 | [Q2 2026 earnings call](https://s21.q4cdn.com/399680738/files/doc_financials/2026/q2/META-Q2-2026-Earnings-Call-Transcript.pdf) | *"We deployed the first generative model into our ads retrieval system"* |

Every percentage above is Meta measuring its own system, with no methodology published for outsiders. Read them as direction, not as a forecast for your account.

## What changed compared with the old system?

The step before the auction got far more personalized. The engineering post describes before and after like this:

| Area | Before Andromeda | With Andromeda |
|---|---|---|
| Personalization at retrieval | *"limited"* | deep neural network, 10,000x more model capacity |
| How stages fit together | *"isolated model stages and numerous rule-based heuristics"* | hierarchical index trained jointly with the retrieval models |
| Hardware | CPU-based components | NVIDIA Grace Hopper; per the January 28, 2026 earnings call, also AMD and MTIA |
| Ad volume | hard to scale | index built *"to scale up to a large volume of ads creatives"* |

Sources: [Meta Engineering, Dec 2, 2024](https://engineering.fb.com/2024/12/02/production-engineering/meta-andromeda-advantage-automation-next-gen-personalized-ads-retrieval-engine/) and the [Jan 28, 2026 earnings call](https://s21.q4cdn.com/399680738/files/doc_financials/2025/q4/META-Q4-2025-Earnings-Call-Transcript.pdf).

The stated reason is volume. The same post says Advantage+ momentum *"further increases the number of eligible ads,"* and the January 2025 call ties Andromeda to a future where *"advertisers use our generative AI tools to create and test more ads."*

That's where the most repeated Andromeda advice comes from: diversify your creative. *Agencies and consultants say Andromeda groups near-identical ads and treats them as one; I couldn't find that rule in Meta's documentation, so treat it as unconfirmed.* This piece is about the data going in.

## What does the symptom look like in your account?

Your cost per purchase moves when nobody touched the campaigns. Ads Manager reports purchases Shopify can't account for. And Meta's ROAS plus Google's [adds up to more than you actually sold](https://precisian.io/blog/en/posts/roas-exceeds-actual-revenue/).

Some of that is Meta's system changing, which you don't control. Some of it is the signal your store sends, which you do. Both show up the same way in the dashboard. The way to tell them apart is to look at what left your store, not at what Meta reports back.

## Why does your purchase event carry more weight now?

Because Meta's delivery system learns from the event you optimize for, and Meta documents that only events it can match to a person count. On Google Search, [AI Max](https://precisian.io/blog/en/posts/ai-max-for-search/) optimizes to the conversion Google Ads records.

The sentence is in the Conversions API best practices: *"You can use only matched events for ads attribution and ad delivery optimization,"* and *"Higher matching quality produces better results"* ([Meta, Conversions API best practices](https://developers.facebook.com/docs/marketing-api/conversions-api/best-practices), read November 23, 2026).

There's a caveat. Meta doesn't publish which signals Andromeda takes as input. The engineering post mentions reconstructing *"latent user-ad interaction signals"* and stops there. What is documented is the rule above, and it applies to delivery as a whole, retrieval and ranking alike. When the model picks from more ads with more personalization, the quality of the target you hand it carries more weight.

Three store-side defects train delivery on the wrong target:

**The same purchase counted twice.** Pixel and Conversions API events only merge when the Pixel's `eventID` matches the server's `event_id`, the event names match, and both arrive *"within 48 hours"* ([Meta, deduplication](https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events/), read November 23, 2026). Miss any of those and Meta sees two buyers where you had one.

**The wrong value.** The `value` parameter is *"Required for purchase events or any events that utilize value optimization,"* and `currency` is *"Required for purchase events"* ([Meta, custom data parameters](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/custom-data), read November 23, 2026). A synthetic example with round numbers: a store that sends cents instead of dollars (`5999` instead of `59.99`) tells Meta every order is worth 100 times more. On a value-optimized campaign, delivery chases whoever looks like a big spender.

**A purchase that never settled.** In many setups, the Pixel fires `Purchase` at checkout. Then the card gets declined on capture, the fraud filter cancels the order, or the customer returns everything. Shopify knows. Meta doesn't, so it learned from a sale that never hit your bank account.

Each of these is covered in detail in [what the Meta Conversions API can and can't fix](https://precisian.io/blog/en/posts/meta-conversions-api-limits/).

## How do you check the signal your store sends?

Five checks against one closed day. The first four come from Meta's Dataset Quality API, the `dataset_quality` endpoint, which returns dataset quality event by event ([Meta, Dataset Quality API](https://developers.facebook.com/docs/marketing-api/conversions-api/dataset-quality-api), read November 23, 2026).

| Check | Where to look | What signals a problem |
|---|---|---|
| Event Match Quality | `event_match_quality` field | A score out of 10, *"currently available only for web events."* Compare across events and watch the trend |
| Event coverage | `event_coverage` field | 7-day average of Pixel events covered by the API |
| Dedup key | `dedupe_key_feedback` field | Browser and server events arriving without an `event_id` |
| Delay | `event_delay` field | Events delayed more than 2 hours and more than 24 hours over the last 7 days |
| Purchases and value vs. your order system | `Purchase` events received vs. paid orders; sum of `value` vs. that day's revenue | Meta receiving more purchases or more value than the store actually took |

The first four checks are a single GET request, in the format of Meta's documentation:

```
curl -X GET -G \
  -d 'fields=web{event_name,event_match_quality,event_coverage,dedupe_key_feedback,event_delay}' \
  -d 'dataset_id=<YOUR_DATASET_ID>' \
  -d 'access_token=<TOKEN>' \
  https://graph.facebook.com/<VERSION>/dataset_quality
```

The app needs `ads_read` plus `ads_management` or `business_management`, and the user needs at least partial access to use the dataset ([Meta, Dataset Quality API](https://developers.facebook.com/docs/marketing-api/conversions-api/dataset-quality-api)). For the fifth check, pull paid orders for the same day from Shopify or your order system, in the same time zone as the ad account, and compare two numbers: order count and total value. Leave attributed conversions out of it. Attribution answers a different question, and mixing the two is how a dedup bug ends up reported as a campaign win.

The fifth row usually goes unautomated, and it's the one that separates "Meta changed something" from "we're sending bad data." If orders and value match your order system within a written tolerance, the swing in cost per purchase is on Meta's side. If they don't, your account is training Andromeda on a target that isn't your revenue.

## How do you fix the signal?

In order of what costs you most.

1. **One `event_id`, generated once, on the server.** The order number works. The confirmation page hands it to the Pixel, and the API sends the same value.
2. **`value` and `currency` checked against the order.** Dollars with a decimal point, using the same shipping, tax and discount rules your finance team uses. `currency` set to `USD`.
3. **A written decision on when a purchase happens.** Order placed, payment captured or order fulfilled. Any of them works if the Pixel, the server and your reporting use the same one, and the event lands inside the 48-hour dedup window.
4. **Near-real-time sending.** Meta recommends sending *"in real time or in batches close to real time"* ([best practices](https://developers.facebook.com/docs/marketing-api/conversions-api/best-practices)).
5. **A daily reconciliation against your order system**, with a threshold. An example rule, not an industry standard: an order gap above 2% in a day becomes an incident.

If your events run through a server-side container, read [whether server-side tagging is worth it](https://precisian.io/blog/en/posts/server-side-tagging-worth-it/) too: it changes how the event travels, not what the event says.

## When can't this be fixed?

In three situations, none of them a setup problem.

**Sales that never touched your site.** Amazon orders, phone orders, in-store sales. Andromeda only learns from what reaches Meta, and those sales only get there if another system records them and sends them. Without that, delivery optimizes for the slice of revenue it can see. The Conversions API does accept them: `action_source` takes values such as `phone_call` and `physical_store`, and the field exists so you can *"specify where your conversions occurred"* ([Meta, server event parameters](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/server-event), read November 23, 2026). But the API sends what your systems recorded. It can't invent the order nobody logged.

**The auction belongs to Meta.** Retrieval, ranking and the auction are closed boxes. The 4%, 8% and 14% gains in the table were measured and published by the company that sells the media. Nothing you fix on your side makes that process auditable.

**Meta grading Meta.** Ads Manager, the API and [Meta's official Ads MCP](https://precisian.io/blog/en/posts/meta-ads-mcp-permissions/) all return the conversions Meta attributed to itself. To know whether an Andromeda change moved your sales, compare against your order system, in a place the ad seller doesn't own.

That third part is where Precisian fits: orders from your commerce platform, the events you sent Meta and your ad spend in one lake, isolated per client on Precisian's infrastructure, with "order" and "revenue" defined once in a [semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/) that your analyst and your AI both read. Precisian doesn't run media or launch campaigns. And if your only problem is a mismatched `event_id`, that's a small developer fix; you don't need a data platform for it.

## What doesn't this article cover?

It doesn't recommend campaign structure, budgets or how many creatives to run. That's media buying, and most post-Andromeda advice on it comes from agencies, not from Meta.

It doesn't estimate how much any account gains or loses from Andromeda. Meta doesn't publish that per advertiser, and I won't project another company's percentage onto yours.

It doesn't cover consent or privacy law. Sending an event from your server doesn't change the legal basis for processing data from someone who opted out.

And it doesn't describe how GEM, the ranking model, works beyond what the cited earnings calls say.

If your cost per purchase moved and nobody knows whether it was Andromeda or your store, start by comparing one closed day of purchases and value that Meta received against the paid orders in your order system. [See this article's question answered on a real lake](https://precisian.io/en/demo?utm_source=blog&utm_medium=cta&utm_campaign=meta-andromeda-signal-quality&utm_content=texto), with no contract commitment.
