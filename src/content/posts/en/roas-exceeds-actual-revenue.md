---
title: "Why your reported ROAS exceeds actual revenue, mechanically"
description: "Google documents that other platforms take full credit for a conversion with other touchpoints. Nobody deduplicates across vendors."
slug: "roas-exceeds-actual-revenue"
lang: "en"
translationKey: "roas-vs-actual-revenue"
publishedAt: 2026-10-17
tags: ["roas", "atribuicao", "divergencia-de-dados"]
draft: false
llmSummary: "No ad platform deduplicates conversions against a competitor; every deduplication document stops at the vendor boundary. Across 663 randomized experiments on Facebook, lower-funnel non-experimental estimates overstated the experimental result by roughly 4.8 to 12.8 times."
citations: ["https://support.google.com/google-ads/answer/15299024", "https://support.google.com/google-ads/answer/3123169", "https://support.google.com/google-ads/answer/3438531", "https://arxiv.org/abs/2201.07055", "https://www.chicagobooth.edu/review/why-companies-may-be-overpaying-for-web-search-ads", "https://www.facebook.com/business/news/click-attribution"]
about: ["https://en.wikipedia.org/wiki/Attribution_(marketing)", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

Google Ads documents what its competitors do, in writing: "Other advertising platforms get full credit for an ad even if there are other touchpoints in the conversion path" ([Google Ads](https://support.google.com/google-ads/answer/15299024)). It says this while introducing a column built to match that behavior, and its own default window counts a purchase up to 30 days after the click. If you run three platforms, the same order can appear in three sets of books, and nothing in any of them subtracts the others.

> **Reported ROAS**: revenue a platform claims for itself divided by spend on that platform, calculated under that platform's own attribution rules. It is not incremental revenue, and no platform claims it is.

## Does any platform deduplicate against the others?

No, and the absence is uniform enough to be a finding rather than a gap.

Google deduplicates inside its own stack: Floodlight counts a conversion as click-through if the user clicked one of your ads within the click window, even when the conversion was also view-through ([Campaign Manager 360](https://support.google.com/campaignmanager/answer/2823400)). Meta deduplicates between its pixel and its Conversions API for the same advertiser, matching on event ID and name ([Meta](https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events/)). TikTok states plainly that its attribution window "doesn't impact your MMP reporting" ([TikTok](https://ads.tiktok.com/help/article/about-the-attribution-window-on-tiktok-ads-manager)).

Every deduplication document stops at the vendor's own boundary. Searching each platform's documentation, I found no statement by any of them that it removes a conversion because a competitor also claimed it. The mechanism does not exist, so the overlap is not an error anyone is failing to fix. It is the design.

Google's Platform Comparable column is the affirmative evidence. Its stated purpose is to assign "full credit to the last interaction" and include view-throughs, because that "aligns with the default attribution used in other advertising platforms." Google built a translation layer for a behavior it describes as belonging to everyone else.

## The windows don't even cover the same days

Before any modeling, the platforms are counting different intervals.

| Platform | Click window | View window |
|---|---|---|
| Google Ads | **30 days** by default | **1 day** by default |
| Meta | 1, 7 or 28 days as separate fields | 1, 7 or 28 days |
| TikTok | 1 or 7 days | off or 1 day |
| GA4 | 30 days for acquisition, 90 for other key events |, |

Sources: [Google Ads](https://support.google.com/google-ads/answer/3123169), [Meta](https://developers.facebook.com/docs/marketing-api/reference/ads-action-stats/), [TikTok](https://ads.tiktok.com/help/article/about-the-attribution-window-on-tiktok-ads-manager) and [GA4](https://support.google.com/analytics/answer/10597962).

A purchase 20 days after a Google click and 10 days after a Meta click lands inside both windows. Both platforms count it. Neither is wrong under its own rules.

One note on Meta's current default: its help pages render client-side and returned no readable body to automated retrieval, so I am not asserting a default here. The window fields above come from the developer documentation, which does render.

## What else inflates the count before modeling starts?

Three mechanics, all documented, all default-on.

**Reporting happens on click date, not sale date.** Google states that its primary conversion columns are "calculated based on the time of the click, not the time of the conversion" ([Google Ads](https://support.google.com/google-ads/answer/6270625)). Your financial close is by sale date. The two reports are describing different months.

**The default counting option multiplies orders.** For website and import conversion actions, "Every conversion" is the default, and Google's own documentation illustrates five conversions from one customer on one ad click ([Google Ads](https://support.google.com/google-ads/answer/3438531)).

**A share of conversions is modeled, not observed.** Google documents three modeling surfaces: cross-device journeys that "can't be directly observed", conversions lost to browser cookie restrictions, and app journeys where device IDs aren't available ([Google Ads](https://support.google.com/google-ads/answer/12442973)).

Meta narrowed one of these itself. In March 2026 it changed click-through attribution "to exclusively include link clicks", where shares, saves and likes had previously counted, and named the reason: other platforms "primarily attribute only to website link clicks", and the difference "can lead to inconsistency between what an advertiser sees in Meta Ads Manager compared to third-party reporting tools" ([Meta, March 2026](https://www.facebook.com/business/news/click-attribution)). Meta did not say its numbers had been inflated, and I am not saying it did. It narrowed the definition and named misalignment as the cause.

## How large is the gap between attributed and incremental?

The research answer is large, and it comes from experiments rather than from vendors.

The best-powered study compared randomized experiments against the non-experimental methods that stand in for them. Across **663 large-scale RCTs on Facebook**, median lift by funnel stage was 29%, 18% and 5% for upper, mid and lower funnel. The same campaigns measured with double machine learning produced 83%, 58% and 24%; with stratified propensity score matching, 173%, 176% and 64% ([Gordon, Moakler and Zettelmeyer, *Marketing Science* 2023](https://arxiv.org/abs/2201.07055)).

At the lower funnel, which is where purchases and ROAS live, the non-experimental estimates overstate the experimental result by roughly **4.8 to 12.8 times**.

The most famous single experiment is still the cleanest. eBay switched paid search off across a large share of US markets for 60 days. On brand keywords, "99.5 percent of the traffic that would have come to the site via the ads ended up there anyway." On non-brand, ads "appeared to increase those people's purchases by a statistically insignificant 0.66 percent" ([Chicago Booth Review](https://www.chicagobooth.edu/review/why-companies-may-be-overpaying-for-web-search-ads)).

And there is a subtler effect underneath both. Controlled experiments using a placebo found that brand activity spikes on the day of *placebo* exposure almost identically to the day of real ad exposure. Much of the correlation that attribution reads as causation is an artifact of when people happen to be online ([Lewis, Rao and Reiley, WWW 2011](https://dblp.org/rec/conf/www/LewisRR11.html)).

## Do the platforms admit any of this?

Not in words. In product.

No platform I checked publishes a sentence saying its reported conversions overstate incremental results, and I am not going to put one in their mouths. The argument is structural instead, and it is stronger for being structural.

Google defines a separate metric for the thing reported ROAS is not: "Incremental conversion value / Incremental Cost = iROAS", described as the additional dollars per dollar invested ([Google Ads](https://support.google.com/google-ads/answer/14102986)). It sells a separate product, Conversion Lift, to measure "the causal impact of ads" against a control group of "people who don't see your ads" ([Google Ads](https://support.google.com/google-ads/answer/12003020)).

If reported ROAS were incremental, neither the metric nor the product would need to exist.

Google also concedes specific incompleteness. View-through conversions "from browsers that don't allow cross-site cookies can't be reported", and invalid conversions are removed retroactively, sometimes after as long as thirteen months ([Google Ads](https://support.google.com/google-ads/answer/7457111)).

## Doesn't GA4 settle the disagreement?

It produces a fourth number, not a referee.

GA4 credits by its own rules, and one of them changes the arithmetic outright: "All attribution models exclude direct visits from receiving attribution credit, unless the path to key event consists entirely of direct visits" ([GA4](https://support.google.com/analytics/answer/10596866)). Direct traffic absorbs app opens, pasted links and anything that loses its referrer, and GA4 hands that credit to whatever touchpoint came before. That is a defensible modeling choice. It is not a neutral count.

GA4 also counts some impressions, which cuts against the habit of treating it as the click-only baseline: in data-driven attribution, "an engaged view is counted" when a user "watches an ad for 30 seconds (or until the end if it is less than 30 seconds)". And its lookback differs again, at 30 days for acquisition and 90 for other key events.

So GA4 will disagree with every platform, by construction. The disagreement is information about the models, not evidence that GA4 is correct. When GA4 reports less revenue than the platforms do, the accurate sentence is that two sets of rules produced two numbers, not that someone is lying.

## What should you do with the number you already have?

Four things, and none of them is switching vendors.

**Stop summing across platforms.** The sum of platform-reported revenue is not a portfolio number, because each addend double counts the others by design. If a report adds them, it is producing a figure that no vendor claims.

**Compare against the source of record, not across platforms.** The only external check is your own ERP or order system. That comparison also has a definition problem, which is [a different article](https://precisian.io/blog/pt-BR/posts/vtex-ga4-nao-batem/) (in Portuguese), but it is the right axis.

**Run a holdout before you trust a lift claim.** Geo experiments are the method the platforms themselves use, and Google published the design ([Vaver and Koehler, 2011](https://research.google/pubs/measuring-ad-effectiveness-using-geo-experiments/)). Brand campaigns deserve the test first: that is where the eBay result was most extreme.

**Write down which number governs which decision.** Reported ROAS is fine for optimizing inside one platform, where the bias is constant. It is not fine for allocating between platforms or for reporting to finance, where the bias differs by channel.

That last one is a definition problem before it is a measurement problem. Making it durable means the rule lives somewhere both the analyst and the agent read before computing, which is what a [semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/) is for.

## What does this article not cover?

It does not tell you how much your reported ROAS exceeds your actual revenue, because no Tier 1 source publishes that multiplier and the numbers in circulation come from vendors selling the correction. The gap here is derived from mechanism, and its size is specific to your channel mix.

Three figures were deliberately excluded. A widely repeated ROI reduction attributed to the eBay study, which does not appear in the writeup and which I could not verify in the paper. A vendor's geo-test median, published without methodology. And a percentage attributed to the Facebook RCT paper that turned out to be **fabricated by an automated summarizer** reading the PDF, which is a useful reminder that a number with a citation attached is not the same as a number that was checked.

I also do not assert Meta's current default attribution setting. Its help pages did not render to retrieval, and a default that cannot be read at source should not be reported as fact.

If your platforms report more revenue than your ERP, the first step is to stop adding them together. [Book a conversation about your case](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).
