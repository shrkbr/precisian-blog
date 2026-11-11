---
title: "What is fbclid? How Meta's click ID gets lost before the sale"
description: "fbclid is Meta's ad click ID. It arrives in the URL, becomes the _fbc cookie on your domain, and only reaches Meta again if you send it as fbc."
slug: "what-is-fbclid"
lang: "en"
translationKey: "what-is-fbclid"
publishedAt: 2026-11-11
tags: ["tracking", "attribution", "integration", "privacy"]
draft: false
llmSummary: "fbclid is the ClickID Meta appends to landing URLs when someone clicks a Facebook or Instagram ad. The Meta Pixel stores it in the _fbc cookie, and the Conversions API takes it back in the fbc field, formatted fb.1.<timestamp>.<fbclid>, per Meta's developer docs (Jan 2026)."
citations: ["https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/fbp-and-fbc", "https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters", "https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/server-event", "https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameter-builder-library", "https://developers.facebook.com/docs/meta-pixel/support", "https://www.facebook.com/business/help/471978536642445", "https://webkit.org/tracking-prevention/", "https://webkit.org/blog/15697/", "https://www.mozilla.org/en-US/firefox/102.0/releasenotes/", "https://firefox.settings.services.mozilla.com/v1/buckets/main/collections/query-stripping/records", "https://brave.com/privacy-updates/5-grab-bag/"]
about: ["https://en.wikipedia.org/wiki/Meta_Platforms", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
cta: newsletter
---
`fbclid` is the click identifier (Meta calls it ClickID) that Meta appends to your site's URL when someone clicks a Facebook or Instagram ad, as in `https://example.com/?fbclid=IwAR2F4-...` ([Meta for Developers](https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/fbp-and-fbc), page updated January 9, 2026, accessed November 11, 2026). The Meta Pixel stores it in the `_fbc` cookie on your domain. The Conversions API takes it back in the `fbc` field. When the sale closes somewhere other than that page, someone has to store the value with the order.

> **fbclid** (Meta ClickID): "a Meta-generated parameter that is passed with the URL of an advertiser's website when a user clicks an ad on Facebook and/or Instagram" ([Meta for Developers](https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/fbp-and-fbc), accessed November 11, 2026).

I wrote this entry with Meta's developer docs open next to it, read on November 11, 2026. The name covers three different things. `fbclid` is the URL parameter. `_fbc` is the cookie that holds it. And `fbc` is the Conversions API field that carries the same value, formatted as `fb.1.1554763741205.<fbclid>`.

## Where does fbclid come from, and where is it stored?

From the click, and Meta adds it on its own. The docs call it auto-attachment and say it "does not impact other custom tracking parameters you may have enabled." Your UTMs still arrive alongside it (see the [UTM naming convention](https://precisian.io/blog/en/posts/utm-parameters-naming-convention/) piece).

After the click, the value can live in two places, per the same page:

- **In the `_fbc` cookie, set by the Pixel.** With the Pixel installed, it "automatically stores ClickID value in the `_fbc` browser cookie once available." It's a first-party cookie on your domain, and first-party cookies are the Pixel's default setting ([Meta Business Help Center](https://www.facebook.com/business/help/471978536642445)).
- **On your server.** Without the Pixel, Meta tells you to read `fbclid` from the request's query string and build the value yourself. It recommends setting `_fbc` as an HTTP cookie in the server response "with the 90 days expiration time," or keeping the value in your own database.

The format has four parts: `fb`, the subdomain index (`1` for `example.com`, and the value to use when your server generates the field), the creation time in milliseconds, and the `fbclid` itself. If you use Meta's parameter builder library, you get a fifth piece: an 8-character appendix with the SDK version and language ([parameter builder library](https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameter-builder-library), updated July 21, 2026).

Two rules from the docs change how you capture it:

- **Case matters.** "ClickID value is case sensitive - do not apply any modifications before using, such as lower or upper case." A CRM field, spreadsheet formula or Zapier step that lowercases text breaks it.
- **Capture on the landing page.** Meta asks you to save `_fbp` and `_fbc` "as early as possible in the customer journey," ideally on landing page load, and "not only from down-funnel events."

## How is fbclid different from _fbc, fbc and fbp?

| | `fbclid` | `_fbc` | `fbc` | `_fbp` / `fbp` | `gclid` |
|---|---|---|---|---|---|
| What it is | URL parameter | Cookie on your domain | `user_data` field in the Conversions API | Browser cookie and field | Google Ads URL parameter |
| Created by | Meta, on an ad click | The Pixel, or your server | You, when building the event | The Pixel, on every visit | Google Ads auto-tagging |
| Identifies | One click | The latest stored click | The click, formatted | A browser, ad or no ad | One click (sometimes an impression) |
| Format | Opaque string | `fb.1.<ms>.<fbclid>` | `fb.1.<ms>.<fbclid>` | `fb.1.<ms>.<random number>` | Opaque string |
| Hash before sending | N/A | N/A | No | No | N/A |

Sources: [fbp and fbc](https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/fbp-and-fbc) and [customer information parameters](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters), which mark both `fbc` and `fbp` "Do not hash," accessed November 11, 2026. The `gclid` column summarizes [what gclid is](https://precisian.io/blog/en/posts/what-is-gclid/).

`_fbp` exists without any ad: the Pixel sets it on any visit to identify the browser. `_fbc` only exists after an ad click. Meta recommends sending `fbc` "with every event you send to the Conversions API."

## Where does fbclid get lost before the sale?

In five places. None of them shows up as an error in Ads Manager.

**1. In a redirect.** Meta's Pixel support page lists two cases: a URL shortener or vanity URL that swaps `&` for `?` in front of `fbclid` and breaks the address, and a page that "does not accept unexpected URL parameters" ([Meta Pixel support](https://developers.facebook.com/docs/meta-pixel/support), updated March 28, 2025). A link-in-bio tool, an `http`-to-`https` hop or a geo redirect that drops the query string wipes `fbclid` before any tag runs.

**2. When checkout finishes on another domain.** `_fbc` lives "under your domain," in Meta's words. A hosted payment page (PayPal, a buy-now-pay-later provider) can't read it, and if the shopper never returns to the confirmation page, the browser event never fires. That's the [redirect payment problem behind missing GA4 purchases](https://precisian.io/blog/en/posts/redirect-payments-break-ga4-purchase/), seen from Meta's side.

**3. When the deal closes by phone or with a sales rep.** Someone clicks the ad, lands on the site, calls the number in the header and buys over the phone. `fbclid` stays in the browser cookie and the order gets created in the CRM without it. Click-to-WhatsApp and Messenger ads are a different case: they skip the site and produce a `ctwa_clid` delivered by webhook ([ctwa_clid explained](https://precisian.io/blog/en/posts/ctwa-clid-explained/)).

**4. In the browser.** Three browsers document stripping tracking parameters:

- **Brave** strips `fbclid` by default, "before your browser makes the request," and names it explicitly ([Brave](https://brave.com/privacy-updates/5-grab-bag/), July 20, 2020).
- **Firefox** "mitigates query parameter tracking when navigating sites" when Enhanced Tracking Protection is in strict mode ([Firefox 102 release notes](https://www.mozilla.org/en-US/firefox/102.0/releasenotes/)). The strip list Mozilla ships to browsers includes `fbclid` ([Mozilla Remote Settings](https://firefox.settings.services.mozilla.com/v1/buckets/main/collections/query-stripping/records), accessed November 11, 2026).
- **Safari** Private Browsing "removes a subset of query parameters that have been identified as being used for pervasive cross-site tracking," prior to navigation ([WebKit](https://webkit.org/blog/15697/), July 16, 2024). WebKit doesn't publish the list or name `fbclid`.

Outside Private Browsing, Safari caps cookies created in JavaScript on the landing page to 24 hours when it detects click IDs in the URL ([WebKit](https://webkit.org/tracking-prevention/), accessed November 11, 2026). The Pixel sets `_fbc` in JavaScript, and Meta recommends also setting it from the server, as an HTTP cookie.

**5. When the conversion arrives too late.** In the Conversions API, `event_time` "can be up to 7 days before you send an event." If any event in the batch is older, Meta returns "an error for the entire request and process[es] no events" ([server event parameters](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/server-event), updated October 15, 2026). A net-30 invoice paid on day 12 can't go back through the API with its real timestamp.

## How does fbclid get back to Meta when the sale happens offline?

Through the Conversions API, with `fbc` inside `user_data`. Meta's own example is a `Purchase` event with `action_source: "website"`, the `fbc`, and SHA-256-hashed email and phone in `em` and `ph`.

The routine, in the order Meta describes it:

1. **Read** `fbclid` from the URL on the server, or `_fbc` from the request's `Cookie` header.
2. **Format** it as `fb.1.<milliseconds>.<fbclid>`, without touching the casing.
3. **Store** it as a 90-day HTTP cookie or in your database ([Meta for Developers](https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/fbp-and-fbc)). Rewrite it only when a new `fbclid` differs from the one in the cookie.
4. **Send** `fbc` with every event, plus `fbp` when you have it.

For sales that didn't happen on the site, `action_source` accepts `phone_call`, `chat`, `physical_store`, `system_generated` and `business_messaging` ([Meta for Developers](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/server-event)). `fbc` doesn't replace customer data. When the click got lost, the hashed email and phone still allow a match, as covered in [what the Meta Conversions API recovers](https://precisian.io/blog/en/posts/meta-conversions-api-limits/).

## What is fbclid not?

It isn't a person identifier. It identifies a click, and one browser can collect many.

It isn't a UTM. It carries no readable campaign name; Meta resolves the click on its side.

It isn't attribution. It's the key that lets Meta attribute under its own model. Google Ads may be claiming the same order at the same time, which is how [reported ROAS ends up exceeding actual revenue](https://precisian.io/blog/en/posts/roas-exceeds-actual-revenue/).

It isn't `_fbp`. `_fbp` identifies the browser on any visit, ad or no ad.

## When does this start to matter for a store?

When a meaningful share of revenue closes away from the order confirmation page: hosted payment redirects, phone orders, invoiced B2B deals, quotes approved by email. In those cases the Pixel sees the click and never sees the sale.

The fix is a data-modeling one. `fbc` needs to be a column on the order record, in its original casing, captured on the landing page and carried through to the order system. At Precisian, that data sits in a per-client isolated lake on our infrastructure, and the rule for which click gets the sale becomes a versioned definition in the semantic layer instead of logic buried in an automation.

## What does this article not cover?

It doesn't say how old an `fbclid` Meta will still accept. [Meta's docs](https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/fbp-and-fbc) recommend 90 days for the cookie and publish no limit for the identifier itself.

It doesn't confirm whether Safari strips `fbclid` specifically. Testing takes minutes: click your own ad in a Safari private window and look at the URL that lands.

It doesn't cover attribution window settings in Ads Manager or app events.

If you buy Meta ads and a share of your sales closes by phone, invoice or hosted checkout, the first step is to check whether `fbc` reaches the order record or dies in the browser cookie. What changed, what broke and what Precisian's research measured lands every two weeks, on Thursdays, in [Precisian's newsletter](https://precisian.io/en/newsletter?utm_source=blog&utm_medium=cta&utm_campaign=what-is-fbclid&utm_content=texto).
