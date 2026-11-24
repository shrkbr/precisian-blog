---
title: "What is srsltid? The Google parameter in your product URLs, explained"
description: "srsltid is the parameter Merchant Center auto-tagging adds to URLs after a Google click. It doesn't affect ranking; it splits pages in GA4 and your cache."
slug: "what-is-srsltid"
lang: "en"
translationKey: "what-is-srsltid"
publishedAt: 2026-11-23
tags: ["tracking", "ga4", "google-shopping", "ecommerce", "data-discrepancy"]
draft: false
llmSummary: "srsltid is the URL parameter Google Merchant Center auto-tagging appends when someone clicks a product on Google Search. It is on by default for new accounts and is switched off under Settings > General > Key event setup. GA4 reports that traffic as Organic Shopping, per Google's help pages."
citations: ["https://support.google.com/merchants/answer/15191080?hl=en", "https://support.google.com/analytics/answer/11479699", "https://www.seroundtable.com/google-search-srsltid-url-parameters-37875.html", "https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema", "https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls", "https://developers.cloudflare.com/cache/how-to/cache-keys/", "https://support.google.com/google-ads/answer/3095550"]
about: ["https://en.wikipedia.org/wiki/Google_Merchant_Center", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
cta: newsletter
---
`srsltid` is the URL parameter that Google Merchant Center auto-tagging appends when someone clicks a product on Google Search and lands on your store, as in `www.example.com/?srsltid=123xyz` ([Merchant Center Help](https://support.google.com/merchants/answer/15191080?hl=en), accessed November 23, 2026). It exists to measure conversions from free listings. It doesn't change rankings, but it multiplies the same page across GA4 reports and your CDN cache.

> **srsltid**: a URL parameter Google Merchant Center adds to free listing links when auto-tagging is on, used to track key events (purchases, phone calls, sign-ups) driven by those clicks. Auto-tagging "is turned on by default for new accounts" ([Merchant Center Help](https://support.google.com/merchants/answer/15191080?hl=en)).

Store owners often first meet `srsltid` as a scare: a GA4 page report or a rank tracker shows the homepage ten times over, each with a random string on the end, and someone asks whether the site got hacked. It didn't. Every doc cited below was read on November 23, 2026.

## Where does srsltid come from?

From Merchant Center, not Google Ads. The help page says that when someone clicks a product on Google Search leading to your online store, "auto-tagging adds a bit of additional information to the URLs - specifically a parameter called srsltid" ([Merchant Center Help](https://support.google.com/merchants/answer/15191080?hl=en)). Paid clicks carry a different parameter: Google Ads auto-tagging adds `gclid` ([Google Ads Help](https://support.google.com/google-ads/answer/3095550)), covered in [what is gclid](https://precisian.io/blog/en/posts/what-is-gclid/).

Three lines from the same page explain how it behaves:

- **It's required for measurement.** "Auto-tagging is a required feature" for checking whether clicks on free listings and free local listings lead to purchases, calls, app downloads or newsletter sign-ups.
- **It isn't enough by itself.** "Auto-tagging alone isn't enough to turn on key event tracking." You still have to add a key event source.
- **Some sites break.** "A small percentage of websites don't allow arbitrary URL parameters and display an error page when auto-tagging is turned on." Google tells you to turn it off, have your developer allow arbitrary parameters, and turn it back on.

## Why does srsltid show up on blog posts and the homepage?

Because Google extended it from the Shopping tab to regular organic results. In August 2024, Google's John Mueller explained in a LinkedIn comment that the IDs are "added in search directly," that "it's not a new setup, we've used this for quite some time for example in the shopping tab," and that "we've now expanded it to traditional search results" ([Search Engine Roundtable](https://www.seroundtable.com/google-search-srsltid-url-parameters-37875.html), August 12, 2024, which quotes the comment in full). That's why it appears on pages that aren't products at all: blog posts, collection pages, the homepage.

In the same comment Mueller said: "This doesn't affect crawling, indexing, or ranking - it's basically just for analytics for merchants," and "the URLs are not indexed or crawled like that." As of this writing, the Merchant Center help page hasn't added that language.

## Does srsltid mess up GA4?

It messes up the reading, not the collection. Two effects are documented.

**1. The traffic source changes.** With Merchant Center linked to GA4 and auto-tagging left on, reports label that traffic with source platform `Shopping Free Listings`, source `Google`, medium `Organic` and default channel group `Organic Shopping` ([Google Analytics Help](https://support.google.com/analytics/answer/11479699), accessed November 23, 2026). If you tracked organic search as one block, part of it moves to another channel. Google documents this only for linked properties and says nothing about unlinked ones.

**2. One page becomes many rows.** The `srsltid` value changes with every click. GA4's `pagePath` dimension is "the portion of the URL between the hostname and query string," while `pagePathPlusQueryString` and `pageLocation` include the query string ([GA4 Data API schema](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema)). A report built on a query-string dimension lists `/products/blue-hoodie?srsltid=AfmB…` as a separate page per click. In the BigQuery export, the `page_location` event parameter carries the same problem into any SQL that groups by URL.

The report fix is to use the dimension without the query string. The data fix is to strip the parameter before you group.

## How is srsltid different from gclid, fbclid and UTMs?

| | `srsltid` | `gclid` | `fbclid` | UTM |
|---|---|---|---|---|
| Created by | Merchant Center auto-tagging | Google Ads auto-tagging | Meta, on an ad click | You, by hand |
| Shows up on | Organic product clicks and, since 2024, regular Search results | Google ad clicks | Facebook and Instagram ad clicks | Any link |
| Does Google or Meta document what the value means? | No | Yes: a click identifier | Yes: ClickID, sent back as `fbc` | It's your own text |
| How to turn it off | Merchant Center > Settings > General > Key event setup | Auto-tagging setting in the Google Ads account | No switch described in the docs cited | Don't use them |
| Ranking impact | None, per Google | N/A (paid traffic) | N/A | N/A |

Sources: [Merchant Center](https://support.google.com/merchants/answer/15191080?hl=en), [Google Ads](https://support.google.com/google-ads/answer/3095550) and [what is fbclid](https://precisian.io/blog/en/posts/what-is-fbclid/), accessed November 23, 2026. For the UTMs you control, see the [UTM naming convention](https://precisian.io/blog/en/posts/utm-parameters-naming-convention/). The most confusing neighbor by name, [gad_source](https://precisian.io/blog/en/posts/what-is-gad-source/), belongs to Google Ads.

## Does srsltid create duplicate content or break caching?

Duplicate content, as far as Google is concerned, no. Your cache can take a hit, and so can a badly built canonical tag.

**Canonical.** Mueller said that "while not necessary, you can use the link rel=canonical element pointing at the preferred URL for indexing as you normally would" ([Search Engine Roundtable](https://www.seroundtable.com/google-search-srsltid-url-parameters-37875.html)). Google's duplicate URL docs use a tracking-parameter URL as the example of what shouldn't be canonical: `https://example.com/dresses/cocktail?gclid=ABCD` ([Google Search Central](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)). The real risk sits in your theme. If the template builds the canonical from the requested URL, query string included, the tag points at the `srsltid` version. Open the source of a page you reached from Google and check.

**Cache.** On Cloudflare, the default cache key includes the URI with its query string, and the docs' own example is `/logo.jpg?utm_source=newsletter`. The *Ignore Query String* cache level, available on all plans, builds the key without the query string; including or excluding specific parameters is an Enterprise feature ([Cloudflare Docs](https://developers.cloudflare.com/cache/how-to/cache-keys/), accessed November 23, 2026). With the default key, every click carrying a fresh `srsltid` is a URL the CDN has never seen, and the request goes back to origin. If you use another CDN, check its docs for the equivalent setting.

**robots.txt.** Won't help. Per Mueller, URLs with the parameter aren't crawled in the first place; `srsltid` is added at click time.

## What is srsltid not?

It isn't an attack or spam. It comes from your store's own Merchant Center account, or whoever runs it.

It isn't `gclid`. It doesn't come from a paid ad, and Google doesn't document it as something you can use for offline conversion imports.

It isn't a person identifier. Google doesn't document what the value encodes, how long it lasts, or whether anyone else can read it.

It isn't a ranking penalty. If organic traffic dropped the same week `srsltid` showed up, check first whether the traffic simply moved channels in GA4, from `Organic Search` to `Organic Shopping`.

## When does this start to matter for a store?

When a page report, an A/B test or an SEO analysis depends on grouping by URL. On a large Shopify catalog, one product can turn into one row per click from Google, and anyone summing sessions per page in BigQuery or a spreadsheet undercounts the exact pages Google sends clicks to.

It also matters when product traffic drives a real share of revenue and the team compares channels. If `Organic Shopping` grows while organic search shrinks, someone has to know the traffic was relabeled before budget or content plans change.

The fix that lasts is a data-modeling one: the URL enters the data already normalized, without `srsltid`, and the rule for which channel gets the click is written once. At Precisian, that data sits in a per-client isolated lake on our infrastructure, and the normalization becomes a versioned definition in the semantic layer instead of a filter rebuilt in every report. If you also run paid Shopping off the same feed, [why your product isn't showing on Google Shopping](https://precisian.io/blog/en/posts/product-not-showing-google-shopping/) covers what gets an item disapproved before any click happens.

## What does this article not cover?

It doesn't explain what the `srsltid` value encodes. Google doesn't publish that.

It doesn't confirm the finding from SEO crawler [Oncrawl](https://www.oncrawl.com/technical-seo/srsltid-impacting-google-crawling/) (December 3, 2024), repeated by [Search Engine Journal](https://www.searchenginejournal.com/googles-srsltid-parameter-appears-in-organic-urls-creating-confusion/549967/) on June 25, 2025, that *clicks and impressions for `srsltid` URLs in Search Console dropped to zero starting in September 2024 (not confirmed by Google)*. What Google said, through Mueller, is that "in Search Console, you mostly see the old usage of the parameter, we try to filter it out for the normal search results."

It doesn't cover paid Shopping ads, which run on `gclid`.

If your GA4 page report shows the same product page repeated with `srsltid`, the first step is to switch the report dimension and check where your canonical tag points. What changed, what broke and what Precisian's research measured lands every two weeks, on Thursdays, in [Precisian's newsletter](https://precisian.io/en/newsletter?utm_source=blog&utm_medium=cta&utm_campaign=what-is-srsltid&utm_content=texto).
