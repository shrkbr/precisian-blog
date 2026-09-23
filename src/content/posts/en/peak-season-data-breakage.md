---
title: "What breaks in your analytics during peak season"
description: "GA4's BigQuery export caps at 1 million events a day, and an exceeded export pauses without reprocessing previous days."
slug: "peak-season-data-breakage"
lang: "en"
translationKey: "black-friday-data-readiness"
publishedAt: 2026-12-26
tags: ["ga4", "pipeline", "divergencia-de-dados"]
draft: false
llmSummary: "Peak season breaks analytics silently: GA4's BigQuery export caps at 1 million events per day on standard properties and, if consistently exceeded, pauses without reprocessing previous days. Dimensions above 500 unique values per day collapse into an (other) bucket."
citations: ["https://support.google.com/analytics/answer/9823238", "https://support.google.com/analytics/answer/11198161", "https://support.google.com/analytics/answer/12226705", "https://developers.google.com/google-ads/api/docs/best-practices/rate-limits", "https://developers.facebook.com/docs/graph-api/overview/rate-limiting/", "https://shopify.dev/docs/api/storefront"]
about: ["https://en.wikipedia.org/wiki/Black_Friday_(shopping)", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
---

The limit that ruins peak season does not take anything down. GA4's BigQuery export caps at **1 million events per day** on a standard property, and if you exceed it consistently, Google's documentation states that "the daily export will be paused and previous days will not be reprocessed" ([Google](https://support.google.com/analytics/answer/9823238)).

The site stays up. The dashboard opens. The data for the most important day of your year simply does not exist afterward, and no alert fired, because nothing failed.

> **The peak-season pattern**: systems that behave correctly at normal volume degrade in ways that produce plausible numbers rather than errors. The failure is silent by construction.

## Why is the export cap the worst one?

Because it is the only failure on this list that destroys history rather than delaying it.

Rate limits cause retries. Timeouts cause reruns. A paused export causes an absence, and the documentation is explicit that previous days are not reprocessed. That data is not late. It is gone.

Worse, the pause is triggered by consistent excess rather than a single spike, which means the mechanism is most likely to engage exactly when a promotion runs for several days rather than one. Teams that survived a single-day peak conclude they are fine, and then a five-day campaign crosses the threshold.

The mitigation has to happen before the season: either the property moves to a tier without that cap, or the event volume comes down, which usually means auditing which events you are sending and why. Both take longer than the week before the sale.

## What happens to your dimensions at volume?

They collapse into a bucket named `(other)`, and the bucket is not labelled as a problem.

GA4 documents cardinality limits: a dimension with more than 500 unique values per day is treated as high cardinality, against a general ceiling of 50,000 values ([Google](https://support.google.com/analytics/answer/12226705)). When the table overflows, the excess is grouped under `(other)` ([Google](https://support.google.com/analytics/answer/11198161)).

In peak season, dimensions that behave all year blow past this in a single day. Campaign name, product variant and landing page path are the usual casualties, because a promotional period multiplies distinct values rather than volume alone.

The reporting consequence is specific and easy to misread. Your top campaigns still look right, because they are above the cut. Everything in the tail merges into one row, so the long tail appears to have vanished, and a team optimising against that report will conclude that only the big campaigns work.

Worth noting that campaign name is a field written by people outside your company, which makes it both the most likely to explode in cardinality and [an unvalidated input your AI agent will later read](https://precisian.io/blog/en/posts/prompt-injection-marketing-data/).

## Which rate limits bite when traffic triples?

The ones on the platforms you pull from, not the one on your own site.

Google Ads publishes API rate limits and documents that they vary by access level and operation ([Google](https://developers.google.com/google-ads/api/docs/best-practices/rate-limits)). Meta's Graph API documents rate limiting as a per-application and per-user mechanism with its own headers ([Meta](https://developers.facebook.com/docs/graph-api/overview/rate-limiting/)). Shopify documents its Storefront API access and limits ([Shopify](https://shopify.dev/docs/api/storefront)).

None of these breaks your store. They break your **extraction**, and the failure shape is what matters: a throttled job that retries and partially succeeds writes a partial day. A partial day looks exactly like a slow day.

This is the compounding risk with the cardinality issue above. One produces a report missing its tail, the other produces a report missing rows, and neither announces itself. A team reading both together sees a coherent, wrong picture.

## Does a warehouse protect you?

Only if the extraction into it survives, which is the part usually untested.

Moving data out of the tools is the right architecture, and it moves the failure point rather than removing it. Your nightly job now has to complete against platforms that are throttling harder, over volumes several times normal, inside the same window.

Three things decide whether it holds. Whether the job is **incremental** rather than full-refresh, because a full refresh at peak volume may not finish. Whether it **checkpoints**, so a throttled run resumes rather than restarting. And whether **a partial run is detectable**, which requires a row-count or freshness check rather than an exit code, for [the reasons a silent pipeline failure is hard to see](https://precisian.io/blog/en/posts/detect-silently-broken-data-pipeline/).

The last one is the one to add if you only add one. An exit code of zero on a job that wrote 40% of the day is the most expensive green light in this article.

## What changes about the numbers themselves?

Definitions that were stable all year stop being stable.

**Discounting changes what revenue means.** If your revenue definition is gross of discounts in one system and net in another, a period with heavy promotion widens that gap from a rounding difference into a headline difference. The definitions did not change. The conditions that made them look similar did.

**Returns arrive after the window.** Peak season pushes an unusual share of orders into a return period that closes after the month does. The figure you report in early December keeps moving into January, which means anything compared year-over-year should be compared at the same age, not at the same calendar date.

**Traffic mix shifts.** Channels that contribute marginally all year contribute meaningfully during promotion, and attribution models weight recent behaviour, so channel splits computed during peak do not generalise to the rest of the year. Using a peak-season split to set annual budget is a common and expensive inference.

## Why do these failures all look the same?

Because every one of them degrades into a plausible number instead of an error.

That is the property worth internalising, and it is not a coincidence. Systems built for reliability are designed to keep serving under load, which means shedding precision rather than refusing. A rate limiter returns fewer rows rather than failing. A cardinality cap groups rather than rejects. A paused export stops rather than alerting.

Each of those choices is correct in isolation, and together they produce a reporting surface that stays confident while getting quieter. Nothing in the chain is engineered to say "this number is now less trustworthy than it was last week", because no single component knows that.

Which means the detection has to be yours, and it has to be comparative rather than absolute. The check that catches all four failure modes above is the same one: does this period's data look structurally like the last comparable period's, in row count, in distinct-value count, and in freshness. Not in revenue, which is supposed to change. In shape.

A team that runs that comparison on the Monday after a peak weekend finds problems while they are still fixable. A team that reads the revenue chart finds them in January, when somebody asks a question the data can no longer answer.

## What should you actually do, and when?

Four things, and three of them have to happen before the season.

**Check the export cap now.** Look at your daily event volume against the documented ceiling, with headroom for a multiple. This is the only item on the list whose failure is unrecoverable, so it goes first.

**Audit event volume.** Most properties send events nobody reads. Removing them is the cheapest way under a cap, and it improves everything downstream.

**Add a row-count check to the extraction.** Not a "did it run" check, a "did it write a plausible number of rows" check, with the threshold set against last year's peak rather than against an average day.

**Write down this year's numbers while you still have the detail.** Whatever you will want to compare against next year, compute and store it in January, not next November. The granular data behind it may not survive the retention window, and a stored summary you can no longer recompute is better than a question you cannot answer.

**Freeze definition changes during the season.** Whatever revenue means on 1 November should mean the same thing on 1 December. Changing it mid-season makes the comparison you most need impossible, and somebody always wants to change it mid-season.

## What does this article not cover?

It gives no traffic multiplier for peak season. That varies by category, geography and promotion intensity, and the figures in circulation come from vendor reports without published sampling.

It does not cover infrastructure capacity for the storefront itself. That is a real concern and a different discipline, and this article is about what happens to the data when the store works fine.

It names no specific limit for platforms whose documentation I could not read at source. Several publish limits that vary by contract and are not stated publicly, and the honest move is to check yours rather than take a number from an article.

It also does not tell you which tier your property is on, which decides whether the first limit applies to you at all. That is a two-minute check in your own account and a guess in any article.

And it does not claim these limits are unreasonable. Every one of them exists for a defensible engineering reason. The point is that they were sized for normal operation, and the day you most need the data is the day you are least like normal.
