---
title: "Attributing sales that close inside WhatsApp"
description: "The webhook hands you the ad ID, not the campaign. And the person identifier has no equivalent on the web side."
slug: "whatsapp-attribution-dark-funnel"
lang: "en"
translationKey: "whatsapp-dark-funnel"
publishedAt: 2027-01-12
tags: ["atribuicao", "messaging", "divergencia-de-dados"]
draft: false
llmSummary: "WhatsApp attribution breaks because the referral object carries the ad identifier, not the campaign, and the person identifier (wa_id) has no web-side equivalent. The 24-hour service window and the 72-hour Free Entry Point are independent: the second is a billing exemption, not format freedom."
citations: ["https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages/text", "https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing", "https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/automatic-events-api", "https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/template-categorization"]
about: ["https://en.wikipedia.org/wiki/Conversational_commerce", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

When someone clicks an ad and lands in your WhatsApp conversation, the API hands you the identifier of the **ad**, not the campaign, not the ad set, not a UTM. In Meta's published webhook reference, the `referral` object carries **11 fields**, among them `source_id` and `ctwa_clid`, and appears only "if message via a Click to WhatsApp ad" ([Meta for Developers](https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages/text)).

Everything after that is conversation, and conversation has no fields.

> **Dark funnel**: the part of the buying process that happens outside any system the company measures, producing revenue whose origin cannot be reconstructed from available data.

## What arrives when the conversation starts from an ad?

More than most teams expect, in a key almost no BI tool speaks.

The 11 fields documented by [Meta](https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages/text) are `source_url`, `source_id`, `source_type`, `body`, `headline`, `media_type`, `image_url`, `video_url`, `thumbnail_url`, `ctwa_clid` and `welcome_message`. That is a good deal of creative context, and more than most teams realise they are already receiving and discarding at the webhook.

But `source_id` identifies the **ad**. To know which campaign it belongs to, you resolve that ID against the Marketing API in a second step and store the mapping. If nobody does that at the moment the message arrives, the information keeps existing and stops being usable, because six months from now that ad may no longer exist.

That is the first thing to build, and it is plumbing rather than analytics: capture the referral object on arrival, resolve the ad to its campaign, and store both alongside the conversation.

## Why does the person identifier break the join?

Because it is not a cookie and not an analytics client ID. It is the `wa_id`, arriving with `profile.name` in the webhook payload.

Neither exists on the web side. The visitor who browsed your site has a browser identifier; the person who sent a message has a WhatsApp identifier. They are separate universes by construction, and no tag configuration unites them.

The practical consequence is a journey split into two halves that never meet on their own: everything before the click lives in analytics, everything after lives in the conversation. Stitching them requires storing the `ctwa_clid` when it arrives and carrying it forward, to the order, to the CRM, to wherever the sale is recorded. Done once, it works. Skipped, no attribution is possible afterwards.

## What are the two windows, and why does confusing them cost money?

Because they look like one window and are two, with independent counters.

| Window | Duration | What it permits |
|---|---|---|
| Customer service | **24 hours**, restarting with each user message | free-form messages, no template |
| Free Entry Point | **72 hours**, for conversations from a Click to WhatsApp ad | a billing exemption, **not** format freedom |

Both are documented on the [platform pricing page](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing), in effect since 1 July 2025, when billing moved to per-message.

The classic operational error is reading the 72-hour window as permission to converse for three days. It is not. Once the 24-hour window closes, only approved templates go out, even with the Free Entry Point open. Teams that build recovery flows on that confusion discover it when messages fail to deliver, and usually blame the tool.

There is a categorisation side effect that hits the bill: a template mixing utility with marketing is classified as **marketing**, and so is an ambiguous one ([Meta](https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/template-categorization)). Meta recategorises automatically, and a review request is only accepted within 60 days of approval. One promotional sentence inside a delivery notice changes the category, and the invoice.

## Meta can guess your sale. How accurately?

It does not say, and that is the part deserving a conscious decision.

The Automatic Events API observes conversations originating from ads and infers events such as `LeadSubmitted` and `Purchase`. The method is described in the documentation: Meta applies "regex and natural language processing" over the thread and returns the event, with message identifier, timestamp and `ctwa_clid`, and for a purchase, value and currency ([Meta for Developers](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/automatic-events-api)).

It is convenient and it removes the tedious part of the work. But **Meta publishes no accuracy metric** for that classifier. No hit rate, no false-positive rate, no description of what counts as a purchase.

Enabling it outsources the definition of "sale" to a closed classifier operated by the party that also sells the media the sale will justify. That can be a reasonable decision for a small operation. It is a bad decision to make without knowing you made it.

Note also the availability boundary, which matters for anyone reading this from Europe: the feature is opt-in and is not available to customers in the European Union, the United Kingdom and Japan. So teams in those markets face the same attribution gap without the shortcut, which makes the plumbing above the only route rather than one of two.

## Where does measurement break without anyone noticing?

At the handoff, and it breaks quietly in three places.

**The referral object is absent for organic conversations.** It appears only for ad-originated ones. So a conversation starting from a link in your bio, a QR code or a friend's recommendation carries no origin at all, and those conversations are indistinguishable from each other in the data.

**The mapping expires.** An ad ID resolved against the Marketing API today resolves cleanly; the same ID looked up after the campaign is deleted may not. Attribution built on a lookup performed later is attribution that degrades over time, silently.

**The sale is recorded elsewhere.** The conversation produces an intent; the order is created in a store, an ERP or by hand. Unless the `ctwa_clid` travels into that record, the revenue arrives in the books with no channel, and gets bucketed as direct.

That third one is the expensive failure, and it is a data engineering problem rather than a marketing one, which is usually why it goes unowned.

It is worth naming who owns each of the three, because the answer is different every time. The missing referral on organic conversations is nobody's fault and needs a reporting convention. The expiring mapping belongs to whoever built the webhook handler. And the identifier that never reaches the order belongs to whoever owns the order record, who usually does not know the field exists. A gap with three owners and no named one is a gap that survives every quarterly review.

## What should you build, in order?

Four steps, and the first two are cheap enough to do this week.

**Capture the referral object on arrival.** Write the whole thing to storage, not just the fields you think you need today. It costs nothing and it is the only moment the data is guaranteed present.

**Resolve the ad to its campaign immediately.** The lookup works now and degrades later. Store the resolved campaign alongside the conversation rather than planning to resolve it at report time.

**Carry `ctwa_clid` to the sale.** Whatever system records the order needs a field for it, and whoever creates orders manually needs a way to paste it. This is the step that fails most often, because it crosses a team boundary.

**Report the edges, and say so.** Conversations started from ads, by campaign, and sales recorded with a carried identifier. Label everything else as unattributed rather than distributing it across channels by assumption.

That fourth point is where discipline pays. An unattributed bucket that stays honest is more useful than a complete-looking chart built on inference, for the same reason [an agent that abstains beats one that guesses](https://precisian.io/blog/en/posts/teaching-an-agent-to-say-i-dont-know/): the visible gap is what prompts someone to fix the plumbing.

## How is this different from a badly configured channel?

Because there is no configuration that fixes it.

A misconfigured channel is one where the data exists and is not being captured. Here, a large part of the journey produces no data at all: a conversation is text between two people, and text has no dimensions. No tag, no pixel and no connector changes that.

So the honest posture is to measure the edges and accept the middle: what came in, from which ad, and what came out, as a recorded sale, with an identifier carried between them. Everything in between is not measured and is not measurable, and a report claiming otherwise is presenting an inference as an observation, which is [the same failure as marketplace attribution](https://precisian.io/blog/en/posts/marketplace-attribution-blackhole/).

## What does this article not cover?

It gives no figure for messaging-channel share of commerce in any market. I have no verified survey with a stated methodology for the US or EU, and the figures in circulation come from vendor reports.

It does not evaluate messaging platform vendors. Several will capture and store the referral object for you, which is genuinely useful, and the category moves faster than a comparison stays accurate.

It does not cover messaging platforms other than WhatsApp. The mechanism differs per platform and the field names certainly do, and describing one from memory is how a confident article becomes a wrong one.

It does not describe pricing rates. The billing model is documented; the per-message rates vary by country and category, and quoting one would date this article immediately.

And it makes no claim about the Automatic Events classifier's accuracy in either direction. Meta does not publish it. Treating the absence of a published metric as evidence of poor accuracy would be the same error, in the opposite direction, as treating it as evidence of good accuracy. What is knowable is that you cannot audit it, and that is enough to decide with.
