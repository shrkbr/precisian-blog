---
title: "ctwa_clid explained: the click ID behind Click-to-WhatsApp ads"
description: "ctwa_clid is the click ID of a Click-to-WhatsApp ad. It arrives once, in a webhook, and only attributes a sale if you store it with the order."
slug: "ctwa-clid-explained"
lang: "en"
translationKey: "ctwa-clid"
publishedAt: 2026-10-23
tags: ["messaging", "attribution", "tracking", "integration"]
draft: false
llmSummary: "ctwa_clid is the click ID of a Click-to-WhatsApp ad. Per Meta's docs it arrives in the referral object of the messages webhook (field added September 27, 2023), should be stored with the conversation and sent back through the Conversions API for Business Messaging. Meta publishes no expiry for it."
citations: ["https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages/text", "https://developers.facebook.com/docs/marketing-api/conversions-api/business-messaging", "https://developers.facebook.com/docs/whatsapp/business-platform/changelog", "https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/automatic-events-api", "https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/fbp-and-fbc", "https://support.google.com/google-ads/answer/9744275"]
about: ["https://en.wikipedia.org/wiki/WhatsApp", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
---

`ctwa_clid` is the click identifier for a Click-to-WhatsApp ad. Meta delivers it inside the `referral` object of the WhatsApp Business Platform messages webhook, a field added to the Cloud API on September 27, 2023 ([Meta changelog](https://developers.facebook.com/docs/whatsapp/business-platform/changelog)). You store it with the conversation and send it back through the Conversions API when the sale happens. If nothing stores it, the revenue reaches your books with no source.

> **ctwa_clid** (Click-to-WhatsApp Click ID): a personal identifier, unique per click, that Meta exposes to the business when a conversation starts from an ad that opens WhatsApp, and that needs to be sent back to Meta in the Conversions API call ([Meta for Developers](https://developers.facebook.com/docs/marketing-api/conversions-api/business-messaging), accessed October 23, 2026).

Much of what's written about this term comes from messaging-tool vendors, and some of it drifts from what Meta documents. Everything below was checked against Meta's developer documentation on October 23, 2026. Where the docs are silent, I say so.

## Where does ctwa_clid show up?

In the `messages` webhook, inside the `referral` object. Meta's text-message webhook reference annotates that object as "only included if message sent via a Click to WhatsApp ad" ([Meta for Developers](https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages/text)). A conversation that starts from a link in your bio, a QR code on packaging or a friend's forward carries no `referral` and no `ctwa_clid`.

The shape, per the reference:

```json
"referral": {
  "source_url": "<AD_URL>",
  "source_id": "<AD_ID>",
  "source_type": "ad",
  "body": "<AD_PRIMARY_TEXT>",
  "headline": "<AD_HEADLINE>",
  "media_type": "<AD_MEDIA_TYPE>",
  "ctwa_clid": "<AD_CLICK_ID>",
  "welcome_message": { "text": "<AD_GREETING_TEXT>" }
}
```

Three details in the docs change how you build the capture.

**Status ads don't send it.** On October 20, 2025, the [changelog](https://developers.facebook.com/docs/whatsapp/business-platform/changelog) announced that ad click IDs would no longer be included in text-message webhooks from WhatsApp Status ad placements. The reference agrees: "the `ctwa_clid` property is omitted entirely for messages originating from an ad in WhatsApp Status." You get the `referral`, minus the click ID.

**It's a Cloud API field.** The [Conversions API for Business Messaging docs](https://developers.facebook.com/docs/marketing-api/conversions-api/business-messaging) say `ctwa_clid` only exists in the On-Premises API webhook from version 2.45.1 onward, and that the final supported On-Premises client expired on October 23, 2025. If you aren't on the Cloud API, there is nothing to capture.

**`source_id` is the ad, not the campaign.** It rides in the same object, but mapping ad to campaign is a second lookup against the Marketing API. The piece on [attributing sales that close inside WhatsApp](https://precisian.io/blog/en/posts/whatsapp-attribution-dark-funnel/) covers why that lookup has to happen on arrival.

## How long is a ctwa_clid valid?

Meta doesn't publish an expiry for `ctwa_clid`. I checked the three pages that cover it (the webhook reference, the Conversions API page and the changelog), and none gives a number.

The "seven days" you'll see quoted belongs to a different mechanism. The [Conversions API for Business Messaging page](https://developers.facebook.com/docs/marketing-api/conversions-api/business-messaging) says the fallback path, matching on hashed customer data such as email and phone, "attributes an event to an ad interaction from the past seven days," and that later conversions are accepted but not attributed. About `ctwa_clid`, the same page says the opposite: it "matches more reliably than hashed customer information and is not subject to the limits below."

No published expiry also means no guarantee that an old click still works. The same docs describe the expected flow as real time: "during an advertiser's campaign period, events happen in real time." The safe reading is to send the event when the sale happens, not to batch a month of orders.

## How do you send ctwa_clid back through the Conversions API?

With a `POST` to your dataset's events endpoint, flagged as a messaging event. The [docs](https://developers.facebook.com/docs/marketing-api/conversions-api/business-messaging) show the WhatsApp shape:

```json
{
  "event_name": "Purchase",
  "event_time": "<UNIX_TIMESTAMP>",
  "action_source": "business_messaging",
  "messaging_channel": "whatsapp",
  "user_data": {
    "whatsapp_business_account_id": "<WABA_ID>",
    "ctwa_clid": "<CTWA_CLID>"
  },
  "custom_data": { "currency": "USD", "value": "<ORDER_VALUE>" }
}
```

Four rules from the same page:

1. **Send `ctwa_clid` as received.** Meta's sample passes it in plain text. SHA-256 hashing applies to the customer-information fields, not to the click ID.
2. **Only in-thread events belong here.** "Messaging events should only represent customer interactions that occur in the messaging thread." If the customer tapped a link and checked out on your Shopify store, Meta points you to the Conversions API for web instead.
3. **Meta won't dedupe for you.** "Meta does not assist with deduplicating events for Conversions API for Business Messaging." Deduplication happens on your side, before the call.
4. **The event list is closed.** It includes `Purchase`, `LeadSubmitted`, `InitiateCheckout`, `AddToCart`, `OrderCreated` and `OrderShipped`.

Meta also offers a shortcut, the [Automatic Events API](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/automatic-events-api), where Meta reads the thread with "regex and natural language processing," infers a `Purchase` or `LeadSubmitted` and returns the event with the `ctwa_clid` attached. It isn't available in the European Union, the United Kingdom or Japan, and Meta publishes no accuracy figure for the classifier.

## How is ctwa_clid different from gclid and fbclid?

All three identify an ad click. What differs is the route they travel, and the route decides who can store them.

| | `ctwa_clid` | `fbclid` | `gclid` |
|---|---|---|---|
| Platform | Meta, ad that opens a WhatsApp chat | Meta, ad that lands on your site | Google Ads |
| How it arrives | Server webhook, in the `referral` object | URL parameter on your site | URL parameter on your site |
| Stored by default by | Nobody: your server has to write it | Meta Pixel, in the `_fbc` cookie | The Google Ads tag, with auto-tagging |
| Sent back through | Conversions API for Business Messaging | Conversions API for web (`fbc` field) | Site conversion or offline import |
| Published expiry | None | Cookie recommended at 90 days | Out of scope here |

Table sources: [messages webhook](https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages/text), [fbp and fbc](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/fbp-and-fbc) and [GCLID in Google Ads](https://support.google.com/google-ads/answer/9744275), accessed October 23, 2026.

`fbclid` and `gclid` pass through the browser, and an installed tag stores them without anyone thinking about it. `ctwa_clid` passes through your server once, and no tag stores it for you.

## What is ctwa_clid not?

It isn't the person's identifier. That's the `wa_id`, which arrives in the same webhook and addresses every later message. `ctwa_clid` identifies **one click**: the same person tapping two ads produces two.

It isn't the ad ID. That's `source_id`.

It isn't a UTM. It carries no readable campaign, ad set or creative name; to get to the campaign you resolve `source_id`.

It isn't attribution. It's the key that lets Meta attribute. The tally of what each ad sold is still Meta's, under Meta's model, and comparing it with your analytics compares two models, not two datasets.

## Why does ctwa_clid get lost before the sale is recorded?

Because a WhatsApp sale almost never lands in the system that holds the conversation. The rep closes the deal in the chat, sends a Stripe payment link or a Shopify draft-order invoice, and the order gets created in the store admin, the ERP or a spreadsheet. The conversation has the `ctwa_clid`; the order doesn't.

When it's time to send the `Purchase` to Meta, someone has to answer which click produced this order. If the identifier only lives in a webhook log, or inside the inbox tool with no link to the order number, that answer doesn't exist. The event either goes out without `ctwa_clid` (falling back to hashed matching, with its seven-day and country limits) or doesn't go out at all.

The fix lives in how the data is modeled, in three steps:

- **Write the whole `referral` object** the moment the webhook arrives, with the `wa_id` and a timestamp.
- **Add the field to the order.** The sales record needs a column for the `ctwa_clid` of the conversation that produced it, filled by the system or pasted by the rep.
- **Write down the rule.** If the same person tapped two ads before buying, which `ctwa_clid` goes on the event? The docs don't decide that for you, and the rule needs to exist before the first sale.

It's the same pattern as [marketplace attribution going dark](https://precisian.io/blog/en/posts/marketplace-attribution-blackhole/) and [redirect payments breaking the GA4 purchase](https://precisian.io/blog/en/posts/redirect-payments-break-ga4-purchase/): the source exists for an instant, in another system, and disappears unless something persists it. At Precisian that data sits in a per-client isolated lake on our infrastructure, and the rule for which click gets the sale becomes a versioned definition in the semantic layer instead of logic buried in an automation.

## What does this article not cover?

It doesn't say how long a `ctwa_clid` lasts, because Meta doesn't publish that.

It doesn't confirm whether `referral` arrives only on the first message after the click. Vendors say it does; the webhook reference doesn't say. Testing it takes an hour: one cheap ad and three messages in a row.

It doesn't cover Messenger or Instagram Direct, which use other identifiers in the same Conversions API (`page_scoped_user_id` and `ig_sid`).

It doesn't describe what happens for teams answering only from the WhatsApp Business app on a phone. The documentation I read covers the platform webhook.

If you sell over WhatsApp and can't say which ad produced each order, the first step is to check where `ctwa_clid` is being written and whether it reaches the sales record. [Book a conversation about your setup](https://calendar.notion.so/meet/rodrigomartucci/precisian-io) — no contract commitment, and no promise of an answer in 30 minutes either.
