---
title: "UTM parameters: a naming convention that survives five teams and three agencies"
description: "GA4 reads nine UTM parameters and treats values as case-sensitive text. Without one written convention, a single campaign splits across report rows."
slug: "utm-parameters-naming-convention"
lang: "en"
translationKey: "utm"
publishedAt: 2026-11-03
tags: ["ga4", "tracking", "attribution", "governance", "data-discrepancy"]
draft: false
llmSummary: "GA4 reads nine UTM parameters, including utm_source_platform, utm_creative_format and utm_marketing_tactic. Per Google Analytics Help (accessed Nov 3, 2026), parameter values are case sensitive, so utm_source=google and utm_source=Google are reported as different sources."
citations: ["https://support.google.com/analytics/answer/10917952", "https://support.google.com/analytics/answer/9756891", "https://support.google.com/analytics/answer/10723328", "https://support.google.com/google-ads/answer/3095550", "https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema", "https://support.google.com/analytics/answer/7029846"]
about: ["https://en.wikipedia.org/wiki/UTM_parameters", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 10
cta: newsletter
updatedAt: 2026-11-08
---
UTM parameters are tags appended to a link (`?utm_source=...&utm_medium=...&utm_campaign=...`) that tell Google Analytics where a visit came from. They only add up when every team spells them the same way, because GA4 compares values as exact text: [Google Analytics Help](https://support.google.com/analytics/answer/10917952) states that `utm_source=google` is different from `utm_source=Google`. One campaign tagged by five teams and three agencies ends up as several rows nobody can reconcile.

> **UTM parameters** (Urchin Tracking Module): URL query parameters that Google Analytics reads when a visit lands, to fill in source, medium, campaign and content. GA4 documents nine: `utm_id`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_source_platform`, `utm_term`, `utm_content`, `utm_creative_format` and `utm_marketing_tactic` ([Google Analytics Help](https://support.google.com/analytics/answer/10917952), accessed November 3, 2026).

Google Analytics 4 reads nine UTM parameters and treats every value as case-sensitive text, according to [Google Analytics Help](https://support.google.com/analytics/answer/10917952) as of November 3, 2026. Everything below was checked against Google's documentation on that date. Where the docs are silent, I say so.

## Which UTM parameters does GA4 read, and where does each one land?

Nine, and GA4 collects two of them without showing them in the interface. The table summarizes the [GA4 URL builders page](https://support.google.com/analytics/answer/10917952) and the [Data API schema](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema), both read on November 3, 2026.

| Parameter | What Google says it is | Google's own example | Data API dimension |
|---|---|---|---|
| `utm_source` | The referrer | google, newsletter4, billboard | `sessionManualSource` |
| `utm_medium` | The marketing medium | cpc, banner, email | `sessionManualMedium` |
| `utm_campaign` | Product, slogan or promo code | spring_sale | `sessionCampaignName` |
| `utm_id` | Campaign ID, the same one used when uploading campaign data | (none given) | `sessionCampaignId` |
| `utm_term` | Paid keyword | (none given) | `sessionManualTerm` |
| `utm_content` | Differentiates creatives, such as two links in one email | (none given) | `sessionManualAdContent` |
| `utm_source_platform` | The platform directing traffic, such as a media-buying platform | Search Ads 360, Display & Video 360 | `sessionSourcePlatform` |
| `utm_creative_format` | Type of creative | display, native, video, search | `sessionManualCreativeFormat` |
| `utm_marketing_tactic` | Targeting criteria | remarketing, prospecting | `sessionManualMarketingTactic` |

Three rules on the same page shape any convention:

1. **Three are mandatory in practice.** "When you add parameters to a URL, you should always use `utm_source`, `utm_medium`, and `utm_campaign`." Leave one out and the report shows `(not set)`.
2. **Two are collected but not reported.** Google says `utm_creative_format` and `utm_marketing_tactic` each "isn't currently reported in Google Analytics properties." The Data API schema still lists both dimensions, and the [BigQuery export schema](https://support.google.com/analytics/answer/7029846) keeps them as `manual_creative_format` and `manual_marketing_tactic`. If you plan to use them, plan to read them in BigQuery.
3. **Page URLs drop the tags.** The "Landing page + query string" and "Page path + query string" dimensions omit UTM parameters; they survive only in "Page location."

## What does an unenforced UTM convention look like in GA4?

You open Traffic acquisition, filter for the Memorial Day sale and get the same push spread over five rows. A synthetic example, with round numbers made up for illustration:

| Session source / medium | Sessions | Who built the link |
|---|---|---|
| `facebook / paid_social` | 4,000 | Paid media agency |
| `Facebook / paid_social` | 1,200 | Creative agency |
| `fb / cpc` | 800 | Old link reused from last quarter |
| `instagram / social_paid` | 600 | In-house social team |
| `meta / paidsocial` | 400 | Influencer agency |

All five rows are one media buy, and the largest holds a little over half of it. Whoever reads only the top row undercounts the campaign. Whoever adds them up by hand can't tell whether `fb / cpc` belongs to this campaign or to a reused link from another one.

The second symptom shows up in channels: "Unassigned" grows when nobody launched anything new, or paid traffic lands in Organic Social and makes the paid program look weaker than it is.

## Why does GA4 split one campaign into many rows?

Four documented GA4 rules, all on by default.

**Values are matched as exact text.** Google Analytics Help is literal: "Parameter values are case sensitive, e.g. `utm_source=google` is different from `utm_source=Google`." Its best-practices table adds another pair: "SpringSale and Spring_Sale are considered distinct." GA4 does not normalize case, hyphens or underscores in source, medium or campaign.

**Channels follow their own rules, and those ignore case.** The [default channel group page](https://support.google.com/analytics/answer/9756891) says "Channel definitions aren't case sensitive and can't be edited." So `Facebook` and `facebook` can land in the same channel and still sit on separate rows in the source report. The channel total looks fine; the campaign detail doesn't.

**Medium decides paid versus organic, and word order matters.** For manually tagged traffic, GA4 assigns Paid Social only when the source is on Google's social-site list **and** the medium matches `^(.*cp.*|ppc|retargeting|paid.*)$`. Under that documented rule, `paidsocial` and `paid_social` match. `social_paid` does not, because the pattern needs "paid" at the start. With a `facebook` source, those visits fall to Organic Social, which only requires a social source. One team's word order moves paid spend into the organic line.

**Email has a closed list too.** The Email channel requires a source or medium equal to `email`, `e-mail`, `e_mail` or `e mail`. A Klaviyo send tagged `utm_source=klaviyo&utm_medium=newsletter` matches neither condition. If no other rule catches it, it becomes Unassigned, which Google defines as the value used "when there are no other channel rules that match the event data."

A fifth rule applies only to Google Ads. With auto-tagging on, `gclid` wins. The [GA4 auto-tagging article](https://support.google.com/analytics/answer/10723328) says that when both are used, "the source, medium, and other traffic-classification dimensions use the auto-tagged values," and [Google Ads Help](https://support.google.com/google-ads/answer/3095550) adds that GA4 has no override option. Only `utm_content` and `utm_term` survive, in the manual content and term dimensions. The [gclid explainer](https://precisian.io/blog/en/posts/what-is-gclid/) covers where that identifier gets lost.

## How is a UTM parameter different from gclid?

A person writes the UTM; Google Ads generates the `gclid`. That difference decides who makes the mistakes.

UTM values are readable text that someone typed or that a platform filled in through a dynamic parameter. They work on any channel: Meta, TikTok, Klaviyo, Pinterest, an affiliate network, a podcast promo code page, a QR code on Shopify packaging inserts. Because they are free text, they inherit every typo of whoever built the link.

`gclid` is an opaque identifier, one per click, that Google Ads appends on its own when auto-tagging is on. Nobody types it, so nobody misspells it. In exchange, it exists only for Google Ads and only becomes a readable campaign once GA4 is linked to the ads account.

In practice both coexist. Google Ads keeps `gclid`, which the [GA4 Help article](https://support.google.com/analytics/answer/10723328) recommends, and every other channel uses UTM. The naming convention governs that second group, which for most Shopify brands is the bulk of tagged links.

## How do you audit UTM naming across teams?

Three checks, from fastest to most complete.

| Check | Where to look | What signals a problem |
|---|---|---|
| Duplicate spellings | GA4 free-form exploration, "Session manual source," last 90 days | Same source with different case, abbreviation or separator |
| Paid traffic outside paid channels | Traffic acquisition, "Session default channel group" × "Session manual medium" | Paid-campaign mediums under Organic Social, Unassigned or Referral |
| Incomplete tagging | Same exploration, "Session campaign" = `(not set)` with a medium present | Links built without `utm_campaign` |

If you export GA4 to BigQuery, the first check becomes a query. It groups by lowercase value and returns only sources with more than one spelling:

```sql
SELECT
  LOWER(collected_traffic_source.manual_source) AS normalized_source,
  ARRAY_AGG(DISTINCT collected_traffic_source.manual_source) AS spellings,
  COUNT(*) AS events
FROM `your-project.analytics_123456789.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20261001' AND '20261031'
  AND collected_traffic_source.manual_source IS NOT NULL
GROUP BY 1
HAVING COUNT(DISTINCT collected_traffic_source.manual_source) > 1
ORDER BY events DESC;
```

Field names come from the [BigQuery export schema](https://support.google.com/analytics/answer/7029846). Rerun it with `manual_medium` and `manual_campaign_name`. The query catches case; it won't catch `fb` against `facebook`. That takes an alias table someone writes down.

## What naming convention holds up across agencies?

One short convention, one owner, one generator, and a check every agency's links have to pass.

**The minimum convention.** Five rules cover most ecommerce brands:

| Rule | Passes | Breaks |
|---|---|---|
| Lowercase only | `facebook` | `Facebook` |
| One spelling per platform, from a closed list | `facebook`, `instagram`, `tiktok`, `klaviyo`, `pinterest` | `fb`, `meta`, `insta` mixed in |
| Medium from the values GA4 recognizes | `paid_social`, `cpc`, `email`, `referral`, `affiliate` | `social_paid`, `newsletter`, `boosted` |
| Campaign equals the name in the ad platform | the exact Ads Manager text | a hand-retyped name |
| Underscore as the only separator | `memorial_day_2026` | `Memorial-Day 2026` |

Your source list can follow Google's own advice. Its best-practices table recommends a distinct source per sub-platform ("use fb for Facebook and insta for Instagram") and lowercase as the standard. Either spelling works, as long as only one circulates.

**Dynamic parameters wherever the platform supports them.** Google recommends letting the platform fill the value, citing `utm_campaign={{campaign.name}}` and `{{site_source_name}}`. The campaign name then comes from Ads Manager with no typing involved.

**A generator, not a free-text field.** Google's [Campaign URL Builder](https://ga-dev-tools.google/campaign-url-builder/) assembles links but accepts any text. A shared sheet with dropdowns fed by the convention stops new spellings at the source. Put the sheet in each agency's statement of work, and reject any link whose values fail a simple pattern such as `^[a-z0-9_]+$` or fall outside the list.

**One owner and a changelog.** When a fourth agency arrives with TikTok Shop, someone adds `tiktok_shop` to the list, dates the change and tells everyone. Without an owner, the list forks within a quarter.

**The convention lives in the data dictionary.** The list of accepted sources and mediums is a business definition like any other: owner, date, version. The natural home is the same [marketing data dictionary](https://precisian.io/blog/en/posts/marketing-data-dictionary/) that defines revenue and ROAS. At Precisian, that table becomes a rule in the semantic layer: an agency's `Facebook` maps to `facebook` before any query runs, and the mapping is versioned in each client's isolated lake on our infrastructure. The mechanism is the same as [marketing and finance closing different revenue numbers](https://precisian.io/blog/en/posts/marketing-finance-revenue-definition/), at a smaller scale: two teams spell the same thing two ways, and the report totals them separately.

## When can't a UTM convention fix the numbers?

In three situations.

**GA4 history doesn't rewrite.** The convention applies from the day it starts. Old rows stay split inside GA4. You can merge them outside it, in BigQuery or in a semantic layer, but not in the standard reports.

**The default channel group can't be edited.** Google says the default grouping "can't be edited." If an old medium landed in Unassigned, it stays there in default-group reports. A custom channel group fixes the reading, not the collected data.

**UTMs don't beat auto-tagging.** On Google Ads with `gclid`, your source, medium and campaign UTMs are ignored for classification. Standardizing them there changes nothing; getting the right source depends on `gclid` arriving.

And one case where Precisian is the wrong answer: if one team builds every link and you run fewer than ten campaigns a month, the dropdown sheet is enough. A semantic layer for UTM normalization pays off when several agencies, several teams and an AI agent or BI tool all read the same number.

## What does this article not cover?

It doesn't confirm which channel `utm_source=pinterest` or other mid-size platforms land in. The Organic Social and Paid Social rules depend on Google's list of social sites, published as a spreadsheet I didn't check. _Not confirmed._

It doesn't cover UTM tagging for Android app campaigns, which uses a different builder (the Play Campaign URL Builder, per the same Help page).

It doesn't walk through cost-data import keyed on `utm_id`, which has its own documentation.

If your campaign shows up on five rows and nobody knows which one is right, the first step is to count how many spellings each source and medium has today. What changed, what broke and what Precisian's research measured lands every two weeks, on Thursdays, in [Precisian's newsletter](https://precisian.io/en/newsletter?utm_source=blog&utm_medium=cta&utm_campaign=utm-parameters-naming-convention&utm_content=texto).
