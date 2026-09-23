---
title: "Redirect payments and your missing GA4 purchase event"
description: "Mollie says it plainly: the customer may not return. Your purchase event lives on the page they never reached."
slug: "redirect-payments-break-ga4-purchase"
lang: "en"
translationKey: "pix-breaks-ga4-purchase"
publishedAt: 2027-01-14
tags: ["ga4", "pagamento", "divergencia-de-dados"]
draft: false
llmSummary: "Redirect payment methods break the GA4 purchase event because the buyer may never return to the landing page where it fires. GA4 does not document a new session on return; that is a Universal Analytics behaviour. The documented fixes are the unwanted-referrals list and server-side webhooks."
citations: ["https://support.google.com/analytics/answer/9191807", "https://support.google.com/analytics/answer/10327750", "https://support.google.com/analytics/answer/10071811", "https://docs.stripe.com/checkout/fulfillment", "https://docs.mollie.com/docs/triggering-fulfilment", "https://docs.adyen.com/online-payments/build-your-integration/payment-result-codes/", "https://docs.klarna.com/payments/web-payments/integrate-with-klarna-payments/other-actions/authorization-callback/", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy", "https://support.google.com/analytics/answer/2731565"]
about: ["https://en.wikipedia.org/wiki/Payment_service_provider", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

Mollie states it in two sentences that should end the debate: "Your customer may not always return to your website. Always make sure to listen to webhooks as a back-up" ([Mollie](https://docs.mollie.com/docs/triggering-fulfilment)). Stripe says the same thing differently, warning that "you can't rely on triggering fulfillment only from your checkout landing page, because it's not guaranteed customers visit that page" ([Stripe](https://docs.stripe.com/checkout/fulfillment)).

Your `purchase` event lives on that landing page. If the buyer never arrives, it never fires, and the order exists only in the payment provider. There are 2 failures hiding in this, and most teams only fix the visible one.

> **Two different failures.** One is attribution: the referral source gets overwritten on return. The other is a missing event: the buyer never came back. They have different fixes, and only the second one costs you revenue data.

## Does returning from a payment page start a new GA4 session?

Not according to Google, and this is the most repeated wrong claim in the category.

GA4's own sessions documentation describes exactly two ways a session begins: "a session initiates when a user either opens your app in the foreground or views a page or screen and no session is currently active", and "by default, a session ends or times out after 30 minutes of user inactivity" ([Google](https://support.google.com/analytics/answer/9191807)).

It says nothing about a changed source creating a session, and nothing about returning from another domain.

The claim traces to Universal Analytics, where it **was** true and **is** documented: "every time a user's campaign source changes, Analytics opens a new session ... if the campaign source changes mid-session the first session is closed and a new session is opened" ([Google, page labelled Legacy](https://support.google.com/analytics/answer/2731565)).

That is a legacy behaviour being repeated as current. The honest version: the **referral source is overwritten**, and a session restarts only if 30 minutes of inactivity elapsed, which genuinely happens when someone authenticates in a banking app, gets interrupted, and comes back later.

## Don't browsers hide the referrer anyway?

No, and the correction matters because it explains why the problem exists.

The default referrer policy is `strict-origin-when-cross-origin`, which sends "the origin, path, and query string when performing a same-origin request" and, for cross-origin requests, sends "the origin (only) when the protocol security level stays same (HTTPS→HTTPS)" ([MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy)).

So on a normal HTTPS return, the browser still sends the origin. GA4 sees the payment provider's domain and attributes the session to it. The policy truncates path and query; it does not suppress the origin.

Note also who controls this: the policy in force is set by the **provider's** page, not yours. So the failure mode varies by provider, and a provider using `no-referrer` sends the visitor back as Direct instead of as a referral. Two different wrong answers from the same mechanism.

## What is the documented fix for the referral?

The unwanted-referrals list, and Google's own documentation names this exact case.

Its example is explicit: "Third-party payment processors: An ecommerce site that uses a third-party payment processor, and users return to your site after checking out on the third-party domain" ([Google](https://support.google.com/analytics/answer/10327750)). The setting lives under Admin, in the data stream's tag settings.

One gotcha worth knowing before a developer touches it. The Help Center states that setting `ignore_referrer` "to any value (for example: true, false, yes, no, 1, 0) will result in the same behavior, the referrer will be ignored". The developer reference types the same parameter as a boolean defaulting to false. **Those two Google pages disagree**, and the practical risk is a developer writing `ignore_referrer: false` expecting a no-op and suppressing the referrer instead. I did not test which behaviour wins at runtime, so treat it as a documented conflict and configure through the Admin list rather than the parameter where you can.

Google also cautions against blanket application: "do not set this parameter up on all pages of your website: you may lose valuable information regarding your traffic sources".

## Isn't cross-domain measurement the answer?

It cannot be, and the requirement says why.

Cross-domain measurement requires that "the tag on each page must use the same tag ID (i.e., the same `G-` ID) from the same web data stream" ([Google](https://support.google.com/analytics/answer/10071811)). You cannot install your tag on a bank's domain or a payment provider's checkout.

Cross-domain is for domains **you control**, such as a separate cart or checkout subdomain. Articles that recommend it for payment providers are conflating two different tools, and following that advice produces an afternoon of configuration and no change.

## How do you recover the purchase event?

From the server, because that is the only path that survives the buyer not returning.

Stripe is unambiguous: "set up a webhook event handler so Stripe can send payment events directly to your server, bypassing the client entirely. Webhooks provide the most reliable way to confirm when you get paid. If webhook event delivery fails, Stripe retries multiple times" ([Stripe](https://docs.stripe.com/checkout/fulfillment)). Its relevant events include `checkout.session.completed` and `checkout.session.async_payment_succeeded`.

Adyen goes further and warns against the obvious shortcut: "the status of a payment can sometimes change after you get the result code, so we recommend that you do not use the result code to update your order management system", pointing instead at the authorisation webhook ([Adyen](https://docs.adyen.com/online-payments/build-your-integration/payment-result-codes/)).

Mollie adds the operational detail that catches teams on the second week: make fulfilment **idempotent**, "to prevent fulfilment multiple times for a single order". If both the browser return and the webhook can trigger your event, you will double count unless the handler deduplicates.

## Are webhooks actually reliable?

Reliable enough to be authoritative, and not perfect, and one provider says so plainly.

Klarna documents that it "strives to consistently trigger the merchant authorization URL as effectively as possible. However, it's crucial to understand that delivery cannot be guaranteed 100% of the time", and that merchants "should be ready to manage the occasional failures or delays in receiving authorization callbacks" ([Klarna](https://docs.klarna.com/payments/web-payments/integrate-with-klarna-payments/other-actions/authorization-callback/)).

That candour is useful, because it sets the correct standard: webhooks as the authoritative source **plus** periodic reconciliation against the provider's own order list. A design that treats webhooks as infallible has simply moved the silent failure rather than removed it, which is [the same pattern as any pipeline that exits green on partial data](https://precisian.io/blog/en/posts/detect-silently-broken-data-pipeline/).

One more detail from Stripe worth designing around: it waits up to 10 seconds for your webhook endpoint to respond before redirecting the customer. A slow handler degrades the buyer's experience, so acknowledge fast and process asynchronously.

## Why do teams spend weeks on the wrong half?

Because the attribution symptom is visible and the missing-event symptom is not.

A referral overwrite shows up immediately: your payment provider appears in the traffic source report, ranked absurdly high, and somebody notices within a day. It is annoying, it is easy to explain, and it is cosmetic in the sense that no revenue data was lost.

A missing purchase event shows up as slightly lower revenue than the provider reports, which is what everyone already expects from analytics. It hides inside an expected discrepancy. So teams fix the visible half, feel finished, and carry the invisible half indefinitely.

The tell is directional. If your analytics revenue is lower than your provider's by an amount that does not move when you fix tracking, you are probably looking at events that never fired rather than events that fired wrong. That is a different investigation, and it starts at the webhook rather than at the tag.

Worth separating this from the definitional gap too. Analytics and the store platform [count different things on purpose](https://precisian.io/blog/en/posts/shopify-ga4-revenue-mismatch/), so part of any gap is structural and unfixable. The part described in this article is not structural: it is an event that should exist and does not, and it is recoverable.

## What does a correct setup look like?

Four decisions, and none of them is a tag change.

**Fire `purchase` from the server**, on the webhook, using the Measurement Protocol, rather than from the return page. The return page becomes a nice-to-have confirmation screen instead of your revenue instrument.

**Deduplicate by transaction ID.** Whether the event originates from the browser, the webhook or both, one order produces one event. Mollie's idempotency warning applies to your analytics exactly as it applies to your fulfilment.

**Add the provider domain to the unwanted-referrals list**, so the sessions that do return keep their original source.

**Reconcile weekly against the provider.** Count orders in the provider and purchase events in analytics for the same period. A persistent gap is a bug in the handler; a growing gap is a bug that started on a date you can find.

## What does this article not cover?

It gives no percentage for the gap between provider-recorded orders and analytics-recorded purchases. I looked for a primary source with a stated methodology and found none. Everything occupying that space is vendor or agency content repeating each other, and the entire secondary literature on this topic traces back to a single Google Help page rather than to any measurement.

It does not attribute the "customer may not return" warning to every provider. Stripe and Mollie state it explicitly. PayPal documents its webhook events without making that statement, and I am not putting words in its documentation.

It does not resolve the `ignore_referrer` conflict. Two Google pages disagree about how a false value behaves, I did not test it, and reporting the conflict is more useful than picking a side.

And it does not cover locally-specific deferred payment methods, where confirmation can arrive days later and shift revenue across a month boundary. That is [a separate article](https://precisian.io/blog/pt-BR/posts/pix-quebra-o-purchase-do-ga4/) (in Portuguese), and the mechanism there compounds everything described here.
