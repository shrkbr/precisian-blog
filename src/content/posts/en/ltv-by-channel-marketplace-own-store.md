---
title: "Why you can't compute LTV across marketplace and own store"
description: "Amazon documents its buyer email as anonymized, and no order carries a traffic source. Cross-channel identity is absent by design."
slug: "ltv-by-channel-marketplace-own-store"
lang: "en"
translationKey: "dedupe-orders-marketplace"
publishedAt: 2026-11-14
tags: ["marketplace", "divergencia-de-dados", "governanca"]
draft: false
llmSummary: "LTV by acquisition channel cannot be computed across marketplace and own store: marketplaces return no stable customer key, and Amazon documents buyer email as anonymized. SalesChannel and MarketplaceId name the venue, not the origin, and traffic data exists only aggregated."
citations: ["https://developer-docs.amazon/sp-api/reference/getorders", "https://developer-docs.amazon/sp-api/reference/getorderitems", "https://developer-docs.amazon/sp-api/docs/access-orders-pii", "https://developer-docs.amazon/sp-api/docs/report-type-values-analytics"]
about: ["https://en.wikipedia.org/wiki/Customer_lifetime_value", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

Lifetime value by acquisition channel needs one thing: knowing that 2 orders came from the same person. Amazon documents its buyer email as "the anonymized email address of the buyer", and the order payload carries no customer key at all ([Amazon](https://developer-docs.amazon/sp-api/reference/getorders)). There is no shared key between your marketplace orders and your own store, and the marketplace documents its absence rather than hiding it.

This is not an integration gap somebody forgot to close. It is the design. The order status list holds 8 values, and 2 of them, `Canceled` and `Unfulfillable`, are not sales at all, yet they sit in the same enum as `Shipped` ([Amazon](https://developer-docs.amazon/sp-api/reference/getorders)).

> **What you can compute:** orders, revenue and contribution per channel. **What you cannot:** distinct customers across channels, repeat rate spanning channels, or true LTV by acquisition source. The second list needs identity, and identity is what the channel removes.

## What identifier does a marketplace actually return?

Enough to fulfill an order. Not enough to recognize a person.

The buyer email is anonymized by documentation, and access to it is role-gated besides. Amazon's PII redaction table makes buyer email unavailable in most reporting contexts, released only under a restricted-access role, for merchant-fulfilled orders, and only while the order sits in specific statuses ([Amazon](https://developer-docs.amazon/sp-api/docs/access-orders-pii)).

The only field that could carry a durable identifier is a generic tax slot, described simply as "the buyer's tax identifier" with no further specification ([Amazon](https://developer-docs.amazon/sp-api/reference/getorders)). What populates it varies by region and it is not designed as a customer key.

So the honest chain is short. No stable email. No stable customer ID. A tax field that is neither guaranteed nor intended for this. Any cross-channel identity you build rests on inference, and inference in this position is silent error rather than loud error.

## Isn't the acquisition source in the order?

No, and this is the field most often misread as one.

Amazon returns `SalesChannel`, documented as "the sales channel for the first item in the order", and `MarketplaceId`, "the identifier for the marketplace where the order was placed" ([Amazon](https://developer-docs.amazon/sp-api/reference/getorders)). Both name the **venue**. Neither names the **origin**.

Note the phrase "first item in the order", too. On a multi-item order, that value describes one line and gets read as if it described the whole thing.

Traffic data does exist, but in a shape that cannot be joined. The Sales and Traffic business report aggregates by day, week or month, and by parent, child or SKU ([Amazon](https://developer-docs.amazon/sp-api/docs/report-type-values-analytics)). There is no order-level row. You can know that a product got sessions on Tuesday. You cannot know which session became which order.

The consequence, stated plainly for the slide it will end up on: **marketplace attribution cannot be reconstructed from order data.** It is modelled or it is absent. Everything else is a story told over a join that does not exist.

## Can you match on value and timestamp instead?

You can, and the documentation describes three places it breaks.

**Value breaks on status.** While an Amazon order is `Pending`, the item call "does not return information about pricing, taxes, shipping charges, gift status or promotions" ([Amazon](https://developer-docs.amazon/sp-api/reference/getorderitems)). A value-based join drops or mismatches those orders without complaint.

**The window breaks on re-dating.** The last-updated filter selects orders changed after a given moment, and an update is defined as "any change in order status, including the creation of a new order" ([Amazon](https://developer-docs.amazon/sp-api/reference/getorders)). Pull by creation date and you miss cancellations. Pull by last update and the same order re-enters later windows. That is the documented double count, and it comes from reading the API exactly as written.

**Status breaks the totals.** `Canceled` and `Unfulfillable` live in the same status list as `Shipped` and `Unshipped`. A deduplication that ignores status counts cancelled orders as sales, and the error is invisible because the number stays plausible.

Returns extend all of this past any sensible close, so a month's figures keep moving for weeks after the month ends.

## How wrong does the naive version get?

Wrong in a direction that flatters the channel, which is the worst direction.

Run the usual pipeline and three errors stack the same way. Cancelled orders stay in, because status was ignored. The same order appears in two windows, because the pull used last-updated. And the cross-channel match, built on approximate name and address, merges two people more often than it splits one, because approximate matching is biased toward merging.

Each of those inflates a different figure. The first inflates revenue, the second inflates order count, and the third deflates the customer count, which inflates the value per customer twice over: a larger numerator over a smaller denominator.

The result is an LTV that looks like the channel is performing, derived entirely from three documented behaviours nobody configured wrongly. No step here is a bug. Each is the default reading of an API that was designed for fulfilment, not for analytics.

## What can you legitimately report?

Split the question in two, because one half is answerable and the other is not.

**"How many orders and how much revenue"** is answerable with precision. It needs window and status discipline, not identity: pull by creation date for period counts, treat cancellations and returns as their own lines, and never reuse a last-updated pull as if it were a sales count.

**"How many distinct customers, and what is their lifetime value"** is not answerable with what the channels return. Within your own store, where you hold the account, it is. Across channels, the honest output is a range with its assumptions stated, or a per-channel figure that does not pretend to be a total.

The tempting shortcut is a probabilistic identity match on similar name and similar address. It works well enough to look right and fails often enough to poison a decision, and the failure never surfaces, because there is no ground truth to check it against.

## What does this mean for channel investment?

It changes which question the budget conversation can even ask.

If LTV by acquisition channel is unavailable across channels, then comparing "customers acquired on Amazon" against "customers acquired on our site" is not a measurement. Teams do it anyway, usually by assuming marketplace buyers behave like direct buyers, which is the assumption the whole exercise was meant to test.

Two things are still decidable, and they are worth more than a fabricated LTV. **Contribution per channel after fees** is computable from data you already hold, and it is the number that actually constrains spend. And **repeat behaviour within a channel** is computable inside your own store, where you hold the account, even though it will not extend across the boundary.

Writing down which of these a report contains is not pedantry. It is what stops the per-channel figure from being summed into a portfolio number, the same failure that makes [summed ROAS exceed actual revenue](https://precisian.io/blog/en/posts/roas-exceeds-actual-revenue/).

## What should you store now?

The raw order response, before any transformation.

Most teams meet this problem late, when someone asks for history and the history does not exist, because the connector stored only a summary. The fix is dull and cheap: persist the channel's original payload, with its native order identifier, the status at collection time, and the collection timestamp.

Those three fields settle most future arguments. The **native order identifier** is the only genuinely stable key that exists. The **status kept as a series** rather than overwritten preserves the cancellation you will later be asked to explain, since overwriting is what erased it. And the **collection timestamp**, kept separate from the order date, is what lets you reconstruct what you knew at a past moment.

None of this deduplicates anything by itself. It moves "how many distinct customers" from impossible to expensive, which is a real improvement, and it prevents the most common failure here: discovering that the field you needed was available in the API for a few days and nobody kept it.

## Where does the definition problem start?

Before any of this, in what "a customer" means.

Even inside one store, a customer can be an account, an email, a device or a payment instrument, and those four produce four different counts of the same people. Add a channel that returns none of them and the disagreement stops being resolvable by better engineering.

Which is why the durable fix is not a matching algorithm. It is writing down, in one place both the analyst and the agent read before computing, what counts as a customer, what counts as an order, and which channels are in scope for each figure. That is the work of a [semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/), and it is the same reason [marketing and finance never close the same revenue number](https://precisian.io/blog/en/posts/marketing-finance-revenue-definition/).

## What does this article not cover?

It names no field from Mercado Libre or Shopee. Mercado Libre's developer documentation renders client-side and returns a country selector to automated retrieval rather than any field reference, and Shopee's refused access entirely. I did not read either, so I do not describe either.

It carries no duplicate-order statistic. I looked for primary research with a stated methodology on duplicate rates across own-store and marketplace channels and found none. The material occupying that space is published by integration vendors selling the remedy.

It does not mix Amazon API versions. The "anonymized" wording is documented for the version I read. A newer version exists with different field names and different access rules, and carrying an adjective across versions is exactly the error this article is about.

And it makes no claim about which regions release buyer email under which conditions. The redaction rules vary by marketplace and by fulfillment method, and that is a table to read in your own account rather than a sentence to take from an article.
