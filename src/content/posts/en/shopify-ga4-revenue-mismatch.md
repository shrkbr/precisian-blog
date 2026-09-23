---
title: "Why Shopify and GA4 revenue never match"
description: "Adobe says it plainly: the two should not match in almost every case. GA4 excludes tax and shipping; Shopify includes both."
slug: "shopify-ga4-revenue-mismatch"
lang: "en"
translationKey: "ecommerce-revenue-mismatch"
publishedAt: 2026-11-24
tags: ["divergencia-de-dados", "ga4", "camada-semantica"]
draft: false
llmSummary: "GA4 and Shopify report different revenue because they define it differently: GA4 counts item revenue excluding tax and shipping, while Shopify includes taxes, duties, shipping and fees. GA4's Transactions metric also includes refund events, not only purchases."
citations: ["https://experienceleague.adobe.com/en/docs/commerce-knowledge-base/kb/troubleshooting/miscellaneous/diagnosing-google-ecommerce-revenue-discrepancies", "https://support.google.com/analytics/answer/12924131", "https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/report-types/default-reports/sales-report", "https://support.google.com/analytics/answer/13428834", "https://support.google.com/analytics/answer/7667196", "https://support.google.com/analytics/answer/10596866"]
about: ["https://en.wikipedia.org/wiki/Web_analytics", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

Adobe answers this in its own troubleshooting documentation, without hedging. Asked whether the two numbers should be equal, it says "the answer is 'no' in almost every case" ([Adobe Commerce](https://experienceleague.adobe.com/en/docs/commerce-knowledge-base/kb/troubleshooting/miscellaneous/diagnosing-google-ecommerce-revenue-discrepancies)). The gap is not a broken tag. It is 3 different definitions of the word revenue, each documented by its own vendor.

Most teams spend weeks auditing tracking before anyone reads the definitions. The definitions take ten minutes.

> **Revenue mismatch**: the difference between what analytics reports and what the source system reports, produced by different definitions of revenue, different moments of recognition, and different collection losses.

## Do the platforms define revenue the same way?

No, and the difference is structural rather than accidental.

| System | What its documentation says revenue is | Shipping | Tax |
|---|---|---|---|
| **GA4** | "The total revenue from items only, excluding tax and shipping. Item revenue = price x quantity" | out | out |
| **Shopify** | "gross sales − discounts − sales reversals + taxes + duties + shipping charges + fees" | in | in |

Sources: [GA4](https://support.google.com/analytics/answer/12924131) and [Shopify](https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/report-types/default-reports/sales-report).

Read the two rows side by side. Shopify's figure includes shipping, duties, taxes and fees; GA4's excludes tax and shipping by definition. In a store where shipping runs at a typical single-digit percentage of order value, that alone produces two numbers that diverge every month, permanently.

No tag fix closes it, because nothing is broken. The two systems were asked different questions and answered correctly.

## What changes after the purchase event fires?

Everything that makes an order real, and none of it reaches the event that already fired.

GA4 measures intent at checkout. The platform measures final state. Between them sits a queue of changes: cancellations, refunds and fraud rejections. Adobe classifies them precisely, as "cancelled, refunded, or frauded orders, which is a state change that happens after" the tracking occurred ([Adobe](https://experienceleague.adobe.com/en/docs/commerce-knowledge-base/kb/troubleshooting/miscellaneous/diagnosing-google-ecommerce-revenue-discrepancies)).

There is also a counterintuitive asymmetry inside GA4 itself. Its Transactions metric **includes refund events**, not only purchases ([GA4](https://support.google.com/analytics/answer/13428834)). A team counting transactions in GA4 and comparing them to orders in Shopify is summing two different categories and reading the difference as a tracking loss.

This is the part worth internalizing: the platform's number keeps moving after the month closes, and the analytics number does not. Comparing them on the first of the month compares a settled figure against an unsettled one.

## Which one is right?

Neither, and that is the useful answer rather than a dodge.

Each is correct under its own definition, so the question "which do I trust" has no answer until you say what the number is for. Three uses, three correct choices:

**Optimizing campaigns** wants the analytics figure, because it arrives fast, is granular by source, and its bias stays roughly constant within a month.

**Closing the books** wants the platform figure, and then only after cancellations and refunds settle, because that is the one tied to money that moved.

**Comparing channel profitability** wants neither unadjusted. It wants a bridge: start at one figure, subtract the documented differences line by line, and land on the other. When the bridge closes, you have proven there is no error. When it does not, you know exactly which line to investigate.

That bridge is a four-line report, and building it once replaces the same argument every month.

One caution on the bridge: build it by subtraction from the larger figure, not by addition to the smaller one. Starting from Shopify and removing documented differences lands you at GA4 with every step named. Starting from GA4 and adding estimates for what it missed produces a number that agrees with nothing, because the additions are guesses and the subtractions were facts.

## What about the payment gateway's number?

It is a third figure, and it disagrees with both on purpose.

The gateway records money authorized and captured. Shopify records orders placed and their lifecycle. GA4 records a browser event at checkout. Those are three different objects, and a single purchase produces one row in each at three different moments, sometimes on three different calendar days.

The gateway's number is the one finance trusts most, and it is also the one least able to tell you where the customer came from. It carries no traffic source, no campaign, no session. So the instinct to "reconcile against the gateway because it is the truth" imports accuracy and exports attribution: you gain a defensible total and lose the ability to split it by channel.

The practical arrangement most teams land on, after trying the alternatives, is to let each system answer what it can see. The gateway settles how much. The platform settles what was sold and what came back. Analytics settles where it came from, knowing its total will be lower. Nobody tries to make one system do all three. The failure mode worth naming is the opposite instinct: picking one system as "the source of truth" for everything, which always ends with someone quietly recalculating the missing dimension in a spreadsheet that nobody else can reproduce.

## Where do you start on Monday?

With one month and a subtraction, not with a project.

Take last month. Write down the GA4 revenue figure and the Shopify figure, then build the bridge between them line by line: add shipping, add tax and duties, add fees, subtract the refund events GA4 counted as transactions, subtract orders cancelled after the event fired, subtract collection losses from blocked or abandoned sessions.

Two outcomes, and both are useful. If the bridge closes within a small residual, you have proven your tracking is fine and you never have to audit it again for this reason. If it does not close, the remaining amount sits on a named line, and you investigate that line rather than the whole system.

Then keep the bridge. Run it monthly, and the conversation changes from "these numbers are wrong" to "the residual moved this month, why". That is a manageable question, and it is the same shift that turns [a recurring revenue disagreement between marketing and finance](https://precisian.io/blog/en/posts/marketing-finance-revenue-definition/) into a four-line report.

## Isn't the fix just better tracking?

Better tracking closes the collection gap, which is the smaller half.

Collection losses are real. Blocked scripts, abandoned redirects and consent refusals all remove events that did happen. But those losses make analytics report **less** than the platform, in one direction, and they are bounded by your traffic.

The definitional differences run in both directions and are unbounded by traffic. Shipping and tax push Shopify's figure up. Refund events inside the Transactions metric push GA4's count up. Cancellations settle later on one side and never on the other.

A team that fixes tracking and still sees a gap concludes the tracking is still broken, and audits again. The second audit finds nothing, because the remaining difference was never a collection problem. This loop is common enough to name: it is what happens when a measurement question is answered with an engineering investigation.

## What else does GA4 change after collection?

More than most teams assume, and each step moves the number.

Retention is the one that ambushes people later. On standard properties, user and event data can be kept for 2 or 14 months only, with longer windows reserved for Analytics 360, and large properties are limited to 2 months at event level ([GA4](https://support.google.com/analytics/answer/7667196)). The aggregate report survives; the granular detail behind it does not. So a reconciliation you could run last quarter may be unrunnable next year, on data that still appears in the chart.

Attribution is the other. GA4 applies a model before reporting, and states that "all attribution models exclude direct visits from receiving attribution credit, unless the path to key event consists entirely of direct visits" ([GA4](https://support.google.com/analytics/answer/10596866)). That is defensible modelling and an invisible transformation. Shopify applies no such model, because it is not attributing anything, it is recording orders.

## How do you stop having this argument?

By writing the definition next to every number, permanently.

Every report carries its slice: revenue from items, excluding tax and shipping, by session date, from GA4. Or: gross sales less discounts and reversals, plus tax, duties and shipping, by order date, from Shopify. The sentence matters more than the figure, because a figure without it cannot be audited and will be reinterpreted by the next reader.

Then put that sentence somewhere both a human query and an AI agent read before computing, which is the work of a [semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/). An analyst who sees an odd number hesitates and asks. An agent computes over whichever column it finds and [answers at its usual confidence](https://precisian.io/blog/en/posts/metric-hallucination/), so the definitional gap that used to cause a meeting now causes a decision.

## What does this article not cover?

It gives no expected percentage for the gap. The size depends on your shipping share, tax treatment, refund rate and payment mix, and any published "normal discrepancy is X%" figure is a guess dressed as a benchmark. I found no primary source publishing one with a stated method.

It does not cover Brazil-specific payment timing, where deferred methods shift recognition by days and split a month's orders across two closes. That is [a separate article](https://precisian.io/blog/pt-BR/posts/pix-quebra-o-purchase-do-ga4/) (in Portuguese).

And it names no third-party reconciliation tool. The gap described here is definitional, so a tool that reports both numbers side by side has restated the problem rather than solved it. What closes it is deciding which figure answers which question, and that decision has an owner rather than a vendor.
