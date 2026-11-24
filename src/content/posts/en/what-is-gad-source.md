---
title: "What is gad_source? The Google Ads URL parameter explained"
description: "gad_source is the parameter Google adds to every ad URL to mark where the click came from. Google doesn't publish what each value means."
slug: "what-is-gad-source"
lang: "en"
translationKey: "what-is-gad-source"
publishedAt: 2026-11-23
tags: ["tracking", "attribution", "integration", "ga4"]
draft: false
llmSummary: "gad_source is an aggregate URL parameter Google adds to every URL coming from a Google ad to identify the traffic source (Search, Display Network). It isn't customizable, and Google doesn't document what individual values such as gad_source=1 mean (Google Ads Help, accessed Nov 23, 2026)."
citations: ["https://support.google.com/google-ads/answer/16193746", "https://support.google.com/google-ads/answer/3095550", "https://support.google.com/google-ads/answer/13327296", "https://support.google.com/analytics/answer/16479993", "https://support.google.com/google-ads/answer/16194756", "https://developers.google.com/google-ads/api/docs/conversions/upload-clicks", "https://developers.google.com/data-manager/api/reference/rest/v1/events/ingest", "https://support.google.com/campaignmanager/answer/9182069", "https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema"]
about: ["https://en.wikipedia.org/wiki/Google_Ads", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
cta: newsletter
---
`gad_source` is a URL parameter Google appends to every URL coming from a Google ad to identify the source of the traffic, such as Google Search or the Display Network ([Google Ads Help](https://support.google.com/google-ads/answer/16193746), accessed November 23, 2026). It doesn't identify a person or a click: every advertiser with the same source gets the same value. Google doesn't publish what each value means, `gad_source=1` included.

> **gad_source**: an aggregate URL parameter "used to identify the source of ads URLs" in order to "improve the accuracy of ads conversion measurement." It "isn't customizable and all advertisers and campaigns with the same source will have the same `gad_source`" ([Google Ads Help: gad_source parameter](https://support.google.com/google-ads/answer/13327296) and [gad_* URL parameters](https://support.google.com/google-ads/answer/16193746), accessed November 23, 2026).

I wrote this entry with Google's help pages open next to it, all read on November 23, 2026. For anyone who sells off-site, the detail that matters most is on the `session_attributes` page: since version v19 of the Google Ads API, `gad_source` and its sibling `gad_campaignid` can go into offline conversion imports through that field, and Google uses them when no `gclid` is present ([Google Ads Help](https://support.google.com/google-ads/answer/16194756)).

## What does gad_source=1 mean?

Nobody outside Google knows for sure, because Google doesn't document it. Both official pages on the parameter say it identifies the traffic source and give examples of sources ("Google Search, Display Network"), but neither includes a table mapping numbers to sources ([Google Ads Help](https://support.google.com/google-ads/answer/16193746); [Analytics Help](https://support.google.com/analytics/answer/16479993)). The value `1` shows up only in Google's own sample URLs, such as `example.com/foo?a=b&gad_source=1#xyz`.

*Blogs and forums circulate tables that tie each number to a campaign type. None of them is confirmed by Google, and they don't agree with each other. This entry doesn't repeat any of them.*

What Google does state, and what you can rely on:

- **The value is shared.** "All advertisers and campaigns with the same source will have the same `gad_source`." It says nothing about your ad in particular.
- **You can't customize it.** You don't pick the value or the name.
- **It's case-sensitive.** The testing section warns that the parameter "should appear the same across all pages on your site" ([Google Ads Help](https://support.google.com/google-ads/answer/16193746)).
- **It used to have another name.** "`&gad_source` was formerly called `&gad`." If an old report filters URLs on `gad=`, it's looking at the same parameter.

## What is gad_campaignid?

It's the parameter that identifies the Google campaign behind the click. "Any URL coming from a Google ad now has `&gad_campaignid` in its final URL," and "all conversions from the same campaign will have the same `gad_campaignid`" ([Google Ads Help](https://support.google.com/google-ads/answer/16193746), accessed November 23, 2026).

On the `session_attributes` page, Google describes the value as "the valid Google Ads Campaign ID associated with the ad click," formatted as `gad_campaignid=1234567890` ([Google Ads Help](https://support.google.com/google-ads/answer/16194756)). In practice, the landing URL already says which campaign paid for the visit, with no lookup in Google Ads, as long as something stores the value.

## How is gad_source different from gclid, gbraid, wbraid and UTMs?

`gclid` identifies one click. `gad_source` and `gad_campaignid` identify groups: a source and a campaign. Google calls GBRAID and the `gad_*` parameters "aggregate identifiers" and says they help in cases where Analytics "can't automatically retrieve campaign information from Google advertising platforms using the standard GCLID or DCLID" ([Analytics Help](https://support.google.com/analytics/answer/16479993)).

| | `gclid` | `gbraid` / `wbraid` | `gad_source` | `gad_campaignid` | UTM |
|---|---|---|---|---|---|
| Created by | Google Ads auto-tagging | Google Ads, iOS 14+ clicks | Google, on every ad URL | Google, on every ad URL | You, by hand |
| Identifies | One click (sometimes an impression) | Campaign data, not tied to a user (Google's description of GBRAID) | Traffic source | Campaign | Whatever you write |
| Unique per person or click | Yes | No | No | No | No |
| Values documented | N/A (it's an ID) | N/A | **No**: Google publishes no table | Yes: it's the campaign ID | Yes: it's your text |
| Goes into offline imports | `gclid` field | `gbraid` and `wbraid` fields | Inside `session_attributes` | Inside `session_attributes` | No |

Sources: [Analytics Help](https://support.google.com/analytics/answer/16479993) (GBRAID "measures campaign data in a non-unique fashion"), [Google Ads Help on `session_attributes`](https://support.google.com/google-ads/answer/16194756), [Google Ads Help on auto-tagging](https://support.google.com/google-ads/answer/3095550) ("sometimes" the GCLID is created at impression), and the entry on [what gclid is](https://precisian.io/blog/en/posts/what-is-gclid/), which covers the click identifier in depth. All accessed November 23, 2026.

`gad_source` doesn't replace UTMs either. A UTM carries names you chose, and keeping those names consistent is still your job (see the [UTM naming convention](https://precisian.io/blog/en/posts/utm-parameters-naming-convention/) piece). `gad_source` carries a number only Google can read.

## Where does gad_source show up in GA4?

In the full URL, and only there. The GA4 Data API defines three page dimensions. `pageLocation` holds protocol, hostname, path and query string. `pagePathPlusQueryString` holds the path with the query string. `pagePath` holds only "the portion of the URL between the hostname and query string" ([GA4 Data API](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema), accessed November 23, 2026).

What that means on a Shopify store: in a `pagePath` report, a product page appears once. In a `pageLocation` report, every combination of `gad_source`, `gad_campaignid` and `gclid` becomes its own row, and one landing page gets split across dozens of rows. Anyone who exports GA4 to a spreadsheet and groups by full URL counts the same page many times. The entry on [what srsltid is](https://precisian.io/blog/en/posts/what-is-srsltid/) describes the same effect with the Merchant Center parameter.

Google asks you to leave it alone: "For the most accurate attribution and measurement, don't remove or block aggregate identifiers from your landing page URL" ([Analytics Help](https://support.google.com/analytics/answer/16479993)). Clean the URL in the report, never on the site.

## Where does gad_source get lost?

In two places, both documented by Google.

**1. In a redirect.** "If your website contains redirects, it's important that you keep the `gad_*` URL parameter in your redirect," because Google Ads and Analytics tags expect to find it as a top-level parameter on the page where they load. Google also warns that "a small percentage of websites don't allow arbitrary URL parameters and serve an error page" ([Google Ads Help](https://support.google.com/google-ads/answer/16193746)).

The test Google describes takes two minutes. Go to **Campaigns → Insights and reports → Landing pages**, copy a URL, append `?gad_source=1` (or `&gad_source=1` if there's already a `?`), and load it. If the parameter disappears from the address bar or the page breaks, the problem is on the site, and it affects `gclid` too.

**2. When the sale closes off-site.** With a Google tag on the page, `gad_*` parameters "are automatically captured with conversion events." With offline imports, they aren't: "it is necessary to capture these parameters from all landing pages, attribute them to your conversions, and import them to Google Ads" ([Google Ads Help](https://support.google.com/google-ads/answer/16193746)). In a US store, that's the quote request that closes by phone, the B2B order invoiced net-30, or the lead that converts in Salesforce weeks later. If the form only saved name and email, `gad_campaignid` stayed in the landing URL and died there.

Campaign Manager 360 traffic gets the parameter too: Google says `gad_source` is added to all click trackers (`/clk` and `/trackclk`), and for traffic outside Google Ads only when enhanced attribution is turned on ([Campaign Manager 360 Help](https://support.google.com/campaignmanager/answer/9182069)).

## How does gad_source get back to Google Ads in an offline import?

Through the `session_attributes` field. Google lists six sub-fields and recommends sending all of them, though only four are required: `gad_source`, `gad_campaignid`, `session_start_time_usec` (session start in UNIX epoch microseconds) and `landing_page_user_agent`. The optional two are `landing_page_url` and `landing_page_referrer` ([Google Ads Help](https://support.google.com/google-ads/answer/16194756), accessed November 23, 2026).

The same page ships a landing-page script that reads every parameter starting with `gad_`, builds a JSON object with the other fields, base64-encodes it and stores it in `localStorage` under the key `google_session_attributes`. A hidden form field carries the value to your CRM. Google notes the code persists data to `localStorage` and that your site's consent and data retention requirements must be honored before you deploy it.

To send it back:

- **Google Ads API:** `ClickConversion.session_attributes_encoded` (the encoded string) or `ClickConversion.session_attributes_key_value_pairs` (pair by pair), from v19 onward. The official code samples say these fields "are only available to allowlisted users" and point to the Data Manager API ([Google Ads API](https://developers.google.com/google-ads/api/docs/conversions/upload-clicks), last updated November 13, 2026).
- **Data Manager API:** the `sessionAttributes` field on the `AdIdentifiers` object, next to `gclid`, `gbraid` and `wbraid` ([Data Manager API](https://developers.google.com/data-manager/api/reference/rest/v1/events/ingest)). "All new users must use the Data Manager API," the `session_attributes` page says.

Google adds two data-quality rules. An incomplete or placeholder landing URL is "detrimental to modeling," so leaving out `landing_page_url` beats sending an internal app path. And the same conversion shouldn't be sent twice: deduplicate with a unique identifier such as the order ID.

## What is gad_source not?

It isn't a person or click identifier. It's a value shared by every advertiser with the same source.

It isn't a setting. You don't turn it on, turn it off or choose its value.

It isn't the answer to "which channel drove this sale." It says the visit came from a Google ad, and Google then attributes the conversion under its own model. Meta and TikTok may be claiming the same order, which is how [reported ROAS ends up exceeding actual revenue](https://precisian.io/blog/en/posts/roas-exceeds-actual-revenue/).

It isn't fully documented. The value tables that circulate online come from third-party observation, with no backing in Google's documentation.

## When does this start to matter for a store?

When `gclid` is missing. Denied consent, iOS clicks and sales that close away from the confirmation page are three common cases where Google falls back on aggregate identifiers and modeling (the piece on [consent mode and modeled data](https://precisian.io/blog/en/posts/consent-mode-modeled-data/) shows what Google fills in with estimates). In those cases, having `gad_source` and `gad_campaignid` stored with the order is the difference between a conversion credited to the right campaign and one with no campaign at all.

The fix is a data-modeling one: `gad_*` parameters become columns on the order record, captured on the landing page, in their original casing. At Precisian, that data sits in a per-client isolated lake on our infrastructure, and the rule for which identifier wins when several arrive together becomes a versioned definition in the semantic layer instead of logic buried in a spreadsheet.

## What does this article not cover?

It doesn't say what each `gad_source` value means, because Google doesn't publish it and no primary source confirms it.

It doesn't say whether browsers with tracking protection strip `gad_*` parameters from the URL. Google's documentation doesn't address it. The test is the same as for redirects: click your own ad and look at the URL that lands.

It doesn't cover other `gad_*` parameters beyond `gad_source` and `gad_campaignid`, because the pages cited here only document those two.

If you buy Google Ads and close sales by phone, quote or invoice, the first step is to check whether `gad_campaignid` reaches the order record or gets left behind in the landing URL. What changed, what broke and what Precisian's research measured lands every two weeks, on Thursdays, in [Precisian's newsletter](https://precisian.io/en/newsletter?utm_source=blog&utm_medium=cta&utm_campaign=what-is-gad-source&utm_content=texto).
