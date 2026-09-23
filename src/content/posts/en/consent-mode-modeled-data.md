---
title: "Why GA4 and your BigQuery export will never agree"
description: "Google lists BigQuery export among features that do not support behavioural modelling. The interface estimates; the export observes."
slug: "consent-mode-modeled-data"
lang: "en"
translationKey: "consent-mode-modeled-data"
publishedAt: 2026-12-17
tags: ["consentimento", "ga4", "divergencia-de-dados"]
draft: false
llmSummary: "GA4's interface and its BigQuery export disagree by design: Google documents that data export and the Data API do not support behavioural modelling, while standard reports and explorations do. The interface shows an estimate; the warehouse receives observed events."
citations: ["https://support.google.com/analytics/answer/11161109", "https://support.google.com/analytics/answer/12856703", "https://support.google.com/google-ads/answer/10548233", "https://developers.google.com/tag-platform/security/concepts/consent-mode", "https://support.google.com/analytics/answer/14275483"]
about: ["https://en.wikipedia.org/wiki/Web_analytics", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

The GA4 interface and the BigQuery export disagree, and it is not a configuration error. Google's documentation explicitly lists "Data export, for example, BigQuery export" among the features that **do not support behavioural modelling** ([Google](https://support.google.com/analytics/answer/11161109)). The interface shows an estimate. The warehouse receives observed events. Reconciling them is chasing a difference that was built on purpose.

Teams lose weeks to this, usually blaming the tag, the connector or the consent banner in that order.

> **Behavioural modelling**: an estimate Google produces for users who declined consent, using the behaviour of those who consented, and which exists only inside the Analytics interface.

## Which reports carry modelled data and which do not?

The split is documented, and knowing it decides which number you can defend.

| Surface | Behavioural modelling |
|---|---|
| Standard GA4 reports | yes, when thresholds are met |
| Explorations | yes |
| **BigQuery export** | **no** |
| **Data API** | **no** |

Source: [Google](https://support.google.com/analytics/answer/11161109).

Read the bottom two rows against how most companies build reporting. Anything programmatic, anything that feeds a warehouse, anything an AI agent queries, arrives without the modelled portion. Anything a human sees in the interface includes it.

So a manager reading the dashboard and an analyst reading the warehouse are not looking at differently formatted versions of one dataset. They are looking at two datasets with different construction rules, and only one of them is labelled as an estimate.

## Why does modelling exist at all?

Because consent refusal removes events, and Google chose to estimate rather than to report a hole.

When a user declines, the tags still fire but send cookieless pings carrying no identifiers ([Google](https://developers.google.com/tag-platform/security/concepts/consent-mode)). Those pings say something happened without saying to whom. Modelling uses the behaviour of consenting users to estimate what the declining ones did.

That is a defensible engineering decision and an invisible transformation. The number in the interface is partly measured and partly inferred, and the interface does not separate the two for you.

There are also thresholds. Modelling requires a minimum volume of traffic and a minimum period before it activates, and where those are not met, the report simply shows the observed subset ([Google](https://support.google.com/analytics/answer/12856703)). So the same property can be modelled one month and not the next, which produces a step in the series that looks like a business change.

## How much of my data is modelled?

The honest answer is that you cannot read it off directly, and any published percentage is somebody else's site.

The share depends on your consent rate, which depends on your banner design, your geography and your audience, and it moves when any of those move. Anyone quoting "X% of GA4 data is modelled" as a general figure is quoting a number with no owner.

What you *can* do is bound it. Take a period, compare the observed event count in the export against the reported count in the interface for the same metric and range. The gap is the modelled contribution plus any collection loss. That is not a clean decomposition, and it is far better than a guess, because it is measured on your traffic.

Do that once and record it. The value of the number is not the number: it is being able to say, when somebody asks why two reports differ, that the gap is a known quantity rather than an unexplained one.

## Does the same thing happen in Google Ads?

A related mechanism, with its own documentation and its own reporting surface.

Google Ads documents conversion modelling separately, for conversions that "can't be directly observed", including cross-device journeys and situations affected by browser restrictions ([Google Ads](https://support.google.com/google-ads/answer/10548233)).

The practical consequence compounds the first one. A conversion count in Ads, a key event count in GA4's interface, and a row count in the BigQuery export are three numbers built under three sets of rules. Summing or comparing them without saying which is which produces a figure no vendor claims, which is the same failure that makes [platform-reported ROAS exceed actual revenue](https://precisian.io/blog/en/posts/roas-exceeds-actual-revenue/).

## What should you actually do about it?

Stop trying to close the gap, and start labelling it.

**Pick the surface per question.** Interface figures for trend and direction, where the estimate helps and the bias is roughly stable. Export figures for anything reconciled against money, audited, or fed to a system that cannot doubt.

**Never reconcile interface against export.** They were built to differ. A reconciliation project between them has no successful end state, and teams that start one usually conclude, wrongly, that their tracking is broken.

**Label every report with its source surface.** "From the GA4 interface, includes modelled data" and "from the BigQuery export, observed events only" are eight words that prevent a recurring meeting.

**Watch for the threshold step.** If a series jumps without a business cause, check whether modelling activated or deactivated in that period before investigating anything else.

## Which number goes in the board deck?

The export figure, with the interface figure beside it and both labelled.

That answer disappoints people who wanted one number, so it is worth defending. The export figure is reproducible: anybody with access can rerun the query and land on the same value, next quarter and next year. The interface figure is not reproducible in that sense, because it includes an estimate produced by a model whose inputs change as your traffic changes.

For a board, reproducibility is the whole point. A number that cannot be recomputed cannot be defended when somebody challenges it, and being challenged is what board numbers are for.

That does not make the interface figure useless. It is generally the better estimate of what actually happened, precisely because it attempts to account for the consent-driven hole. It is the better *description* and the worse *evidence*, and those two properties rarely travel together.

So the honest presentation names both: what we observed, what the tool estimates including declined consent, and the difference between them. Three lines instead of one, and no meeting spent arguing about which report someone screenshotted.

## Does server-side tagging fix this?

No, and the confusion is common enough to address directly.

Moving tag execution to a server changes where the request originates. It does not change whether the user consented, and consent is what gates the identifier. A user who declined still declines; the signal still travels from the browser to the server, and the tag still adjusts its behaviour accordingly.

What server-side tagging does address is a different set of problems: what leaves your domain, script weight, and event transformation before dispatch. Those are real. None of them is the modelled-versus-observed gap described here, and buying the first to solve the second is a mistake with an invoice attached.

## Why does this matter more with an AI agent in the loop?

Because the agent reads the surface that carries no estimate, and says nothing about it.

An agent querying your warehouse or the Data API receives observed events only. If it then reports "sessions fell 18% versus the interface", it is comparing two construction rules without knowing there are two. And unlike an analyst, it has no instinct that something is off, so [the wrong comparison arrives formatted exactly like a right one](https://precisian.io/blog/en/posts/metric-hallucination/).

The fix is not to teach the agent about consent mode. It is to make the surface self-describing: return, alongside the number, which source produced it and whether that source includes modelled data. That is the provenance guarantee of [a trusted data layer](https://precisian.io/blog/en/posts/trusted-data-layer-for-ai-agents/), and this is one of the clearest cases for why it is not optional.

## What about consent rates themselves?

Worth measuring, and worth keeping separate from everything above.

Consent rate is a property of your banner and your audience, not of your analytics. It is also the only lever in this article that you fully control: banner wording, layout and default state change it, and the change propagates into every number downstream.

Google documents that consent state is passed to tags as a signal and that behaviour differs by state ([Google](https://developers.google.com/tag-platform/security/concepts/consent-mode)). What it does not do, and cannot, is tell you whether your particular banner is producing a representative sample of your traffic. A low consent rate does not only shrink the data; it shrinks it non-randomly, because the users who decline are not a random subset of users.

That last point is the one most often skipped. Modelling assumes the consenting population predicts the declining one. The further those two populations diverge in behaviour, the more the estimate drifts, and nothing in the interface flags that drift.

## What does this article not cover?

It gives no typical modelled share. The figure depends on your consent rate, geography and volume, and no primary source publishes a general number with a stated method.

It does not evaluate consent management platforms. That category moves quickly and the choice depends on jurisdiction and stack more than on features.

It makes no legal claim. Whether your consent implementation satisfies a particular regulation is a question for counsel working from the instrument, and this article describes what the analytics documentation says, not what the law requires.

And it does not assert Google's modelling methodology beyond what the documentation states. Google describes that modelling happens and when it activates. The model itself is not published, and treating an unpublished model as understood would be the same mistake this article is warning about.
