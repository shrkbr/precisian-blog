---
title: "What is gclid? How the Google Ads click ID gets lost before the sale"
description: "gclid is the Google Ads click ID. It arrives in the URL, lives in a cookie on your domain, and only reaches Google again if you store it with the order."
slug: "what-is-gclid"
lang: "en"
translationKey: "gclid"
publishedAt: 2026-11-03
tags: ["tracking", "attribution", "consent", "integration"]
draft: false
llmSummary: "gclid is the parameter Google Ads auto-tagging appends to ad landing URLs. Google's conversion linker stores it in the _gcl_aw cookie on your domain. Since June 15, 2026, offline conversion imports with gclid go through the Data Manager API, per the Google Ads API docs."
citations: ["https://support.google.com/google-ads/answer/9744275", "https://support.google.com/google-ads/answer/3095550", "https://support.google.com/google-ads/answer/7012522", "https://support.google.com/google-ads/answer/2998031", "https://support.google.com/google-ads/answer/3123169", "https://developers.google.com/google-ads/api/docs/conversions/upload-clicks", "https://developers.google.com/google-ads/api/reference/rpc/v26/ConversionUploadErrorEnum.ConversionUploadError", "https://developers.google.com/data-manager/api/reference/rest/v1/events/ingest", "https://developers.google.com/tag-platform/security/guides/consent", "https://support.google.com/tagmanager/answer/7549390", "https://webkit.org/tracking-prevention/", "https://webkit.org/blog/15697/"]
about: ["https://en.wikipedia.org/wiki/Google_Ads", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
cta: newsletter
updatedAt: 2026-11-08
---
`gclid` (Google Click Identifier) is the parameter Google Ads auto-tagging appends to the landing URL of every clicked ad, as in `www.example.com/?gclid=123xyz` ([Google Ads Help](https://support.google.com/google-ads/answer/3095550), accessed November 3, 2026). Google's tag writes it to a cookie on your domain and uses it to tie a conversion back to the click. When the sale closes somewhere other than that page, someone has to store the `gclid` with the order.

> **gclid** (Google Click Identifier): "a URL parameter passed with ad clicks" that identifies the campaign and other attributes of the click, turned on by the auto-tagging setting and required for Google Ads website conversion tracking ([Google Ads Help](https://support.google.com/google-ads/answer/9744275), accessed November 3, 2026).

I wrote this entry with Google's documentation open next to it, all of it read on November 3, 2026. The recent change that matters most to anyone importing conversions dates from June 15, 2026. Since then, the Google Ads API `UploadClickConversions` method fails with `CUSTOMER_NOT_ALLOWLISTED_FOR_THIS_FEATURE` for developer tokens that sent no offline conversion uploads between December 17, 2025, and June 15, 2026. Google points everyone to the Data Manager API instead ([Google Ads API](https://developers.google.com/google-ads/api/docs/conversions/upload-clicks)). A lot of gclid-import tutorials still describe the old route.

## Where does gclid come from?

From the click, when auto-tagging is on. Google says auto-tagging is on by default for new accounts and that, with a Google Analytics tag on the site, "the GCLID is stored in a new Google Analytics cookie on your site's domain" ([Google Ads Help](https://support.google.com/google-ads/answer/3095550)). On the Google Ads side, the conversion linker tag reads the URL and "sets ad click information in cookies named `_gcl_*`, such as `_gcl_aw`, and `_gcl_gs`," on the top-most domain, plus browser local storage ([Tag Manager Help](https://support.google.com/tagmanager/answer/7549390)).

Three details from the same docs change how you capture it:

- **A gclid can be minted at impression time.** "Sometimes the GCLID is created at the time of an impression, rather than a click." Click the same ad twice and you get the same ID ([Google Ads Help](https://support.google.com/google-ads/answer/3095550)).
- **It's case sensitive.** Google says so explicitly ([Google Ads Help](https://support.google.com/google-ads/answer/7012522)). A CRM field or spreadsheet formula that lowercases text breaks it.
- **In GA4, auto-tagging beats manual UTMs.** The auto-tagging page says GA4 prioritizes it "due to the absence of an override option." If you're building a [UTM naming convention](https://precisian.io/blog/en/posts/utm-parameters-naming-convention/), know that on Google Ads traffic, `gclid` wins.

## How long is a gclid valid?

Google doesn't publish an expiry for the `gclid` itself. The definition page says nothing about it ([Google Ads Help](https://support.google.com/google-ads/answer/9744275)). The limit that bites is the conversion action's.

The click-through conversion window runs from 1 to 90 days, depending on the conversion source ([Google Ads Help](https://support.google.com/google-ads/answer/3123169)). On import, a conversion whose click falls outside the window comes back as `EXPIRED_EVENT`, and a click less than 6 hours old comes back as `TOO_RECENT_EVENT`, with an instruction to retry later ([Google Ads API, v26](https://developers.google.com/google-ads/api/reference/rpc/v26/ConversionUploadErrorEnum.ConversionUploadError)). Google's own sample capture script stores the `gclid` with a 90-day expiry ([Google Ads Help](https://support.google.com/google-ads/answer/7012522)).

The browser can cut that short. WebKit's tracking prevention page says Safari detects "click IDs" passed as URL parameters and "caps the expiry of cookies created in JavaScript on the landing webpage to 24 hours," and deletes all JavaScript-set cookies after 7 days without user interaction with the site ([WebKit](https://webkit.org/tracking-prevention/), accessed November 3, 2026). WebKit doesn't publish its parameter list or name `gclid`.

## Where does gclid get lost before the sale?

In four places. All of them are in the docs, and none shows up as an error in the Google Ads interface.

**1. In a redirect.** "If your website uses redirects, it's also important to make sure the GCLID is passed to the final landing page" ([Google Ads Help](https://support.google.com/google-ads/answer/3095550)). A link shortener, an `http`-to-`https` hop or a geo redirect that drops the query string wipes the `gclid` before any tag runs. The same page warns that some sites serve an error page when they see an unknown parameter.

**2. When checkout finishes in someone else's system.** The `_gcl_aw` cookie lives on your domain. If payment happens on a hosted page (PayPal, a buy-now-pay-later provider) and the shopper never comes back, the page that would fire the conversion never loads. That's the [redirect payment problem behind missing GA4 purchases](https://precisian.io/blog/en/posts/redirect-payments-break-ga4-purchase/), seen from the Google Ads side. A deal that closes over the phone after a site visit follows the same path: the `gclid` stays in the browser and the order gets created in the CRM without it.

**3. When consent is denied.** With `ad_storage` denied, "new cookies won't be set for advertising purposes." Google offers `url_passthrough`, which carries `gclid`, `dclid`, `gclsrc`, `_gl` and `wbraid` from page to page in the URL. One of its conditions: "the outgoing link refers to the same domain as the current page's domain" ([Google Tag Platform](https://developers.google.com/tag-platform/security/guides/consent), accessed November 3, 2026). A checkout on another domain is out of reach. The piece on [consent mode and modeled data](https://precisian.io/blog/en/posts/consent-mode-modeled-data/) covers what Google fills in with estimates when that happens.

**4. In the browser.** Beyond the 24-hour cap, Safari Private Browsing "removes a subset of query parameters that have been identified as being used for pervasive cross-site tracking," before navigation ([WebKit](https://webkit.org/blog/15697/)). No server can recover a value that never arrived in the URL, which is the core argument of [whether server-side tagging is worth it](https://precisian.io/blog/en/posts/server-side-tagging-worth-it/).

## How is gclid different from gbraid, wbraid and UTMs?

`gbraid` and `wbraid` exist for iOS clicks. The Data Manager API defines `gbraid` as the identifier "for clicks associated with app events and originating from iOS devices starting with iOS14," and `wbraid` as the same for web events ([Data Manager API](https://developers.google.com/data-manager/api/reference/rest/v1/events/ingest), accessed November 3, 2026).

| | `gclid` | `wbraid` | `gbraid` | UTM |
|---|---|---|---|---|
| Created by | Google Ads auto-tagging | Google Ads, iOS click | Google Ads, iOS click | You, by hand |
| Click lands on | Website | Website (click from an iOS app) | iOS app (click from the web) | Any URL |
| Identifies | One click (sometimes an impression) | One click on iOS 14 or later | One click on iOS 14 or later | Campaign, source and medium, as text |
| Customer data honored on import | Yes | No: Google ignores `user_identifiers` | No: Google ignores `user_identifiers` | N/A |
| `cart_data` and custom variables without a `gclid` | Yes | No | No | N/A |
| Precedence when several are sent | 1st | 2nd | 3rd | — |

Source for precedence and the `user_identifiers` and `cart_data` rules: [Google Ads API](https://developers.google.com/google-ads/api/docs/conversions/upload-clicks), accessed November 3, 2026.

## How does gclid get back to Google Ads when the sale happens offline?

Through offline conversion import. [Google Ads Help](https://support.google.com/google-ads/answer/2998031) describes the flow: save the `gclid` with the lead's details and, when the deal closes, send the ID back with the conversion type and time.

The fields, as the [Google Ads API docs](https://developers.google.com/google-ads/api/docs/conversions/upload-clicks) list them for a `ClickConversion`:

- `conversion_action`: an action of type `UPLOAD_CLICKS`.
- `conversion_date_time`: after the click, with a timezone offset, `yyyy-mm-dd HH:mm:ss+|-HH:mm`.
- `gclid`, `gbraid`, `wbraid`: "Set every identifier that you captured."
- `order_id`: recommended, prevents duplicate imports.
- `consent`: without it, "it's possible that your conversions won't be attributable."

In the Data Manager API, the route since June 15, 2026, the same identifiers sit in the `AdIdentifiers` object, sent with a `POST` to `https://datamanager.googleapis.com/v1/events:ingest` ([Data Manager API](https://developers.google.com/data-manager/api/reference/rest/v1/events/ingest)).

Google recommends starting with **enhanced conversions for leads**, which add a SHA-256-hashed email or phone number to the `gclid` and match it against signed-in Google Accounts ([Google Ads Help](https://support.google.com/google-ads/answer/2998031)). The API docs say conversions with only user-provided data and no `gclid` "are still useful." That's the patch for sales where the ID got lost, as long as the customer left an email or phone number.

## What is gclid not?

It isn't a person identifier. It identifies a click, and sometimes an impression.

It isn't a UTM. It carries no readable campaign name; Google resolves the click on its side.

It isn't attribution. It's the key that lets Google Ads attribute under its own model. Other platforms may be claiming the same order at the same time, which is how [reported ROAS ends up exceeding actual revenue](https://precisian.io/blog/en/posts/roas-exceeds-actual-revenue/).

It isn't `ctwa_clid`. The Click-to-WhatsApp click ID arrives by webhook, not in a URL, and no tag stores it for you ([ctwa_clid explained](https://precisian.io/blog/en/posts/ctwa-clid-explained/)).

## When does this start to matter for a store?

When a meaningful share of revenue closes away from the order confirmation page: hosted payment redirects, phone orders, invoiced B2B deals, quotes approved by email. In those cases the site tag sees the click and never sees the sale.

The fix is a data-modeling one. The `gclid` needs to be a column on the order record, in its original casing, and the rule for which click gets the sale has to be written down before the first import. At Precisian, that data sits in a per-client isolated lake on our infrastructure, and the rule becomes a versioned definition in the semantic layer instead of logic buried in an automation.

## What does this article not cover?

It doesn't say how long a `gclid` stays valid on Google's side, because Google doesn't publish that.

It doesn't confirm whether Safari strips `gclid` specifically. WebKit describes the rule without listing parameters. Testing takes minutes: click your own ad in a Safari private window and look at the URL that lands.

It doesn't cover app campaigns, which Google says "don't respect auto-tagging features," or Campaign Manager's `dclid`.

If you buy Google Ads and a share of your sales closes by phone, invoice or hosted checkout, the first step is to check whether the `gclid` reaches the order record or dies in the browser cookie. What changed, what broke and what Precisian's research measured lands every two weeks, on Thursdays, in [Precisian's newsletter](https://precisian.io/en/newsletter?utm_source=blog&utm_medium=cta&utm_campaign=what-is-gclid&utm_content=texto).
