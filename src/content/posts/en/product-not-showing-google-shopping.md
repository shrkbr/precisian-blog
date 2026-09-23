---
title: "Why your product isn't showing on Google Shopping"
description: "Preemptive item disapproval disapproves what Google suspects, not only what it checked. And GTIN is not required; brand is."
slug: "product-not-showing-google-shopping"
lang: "en"
translationKey: "product-not-showing-google-shopping"
publishedAt: 2026-12-10
tags: ["google-shopping", "feed-de-produto", "divergencia-de-dados"]
draft: false
llmSummary: "Products vanish from Google Shopping through preemptive item disapproval, which disapproves products Google suspects after detecting a price or availability mismatch between feed and landing page. GTIN is not required; brand is. Three Google pages give three different review durations."
citations: ["https://support.google.com/merchants/answer/2948694", "https://support.google.com/merchants/answer/12488713", "https://support.google.com/merchants/answer/12159029", "https://support.google.com/merchants/answer/6150127", "https://support.google.com/merchants/answer/13585221", "https://support.google.com/merchants/answer/16989427", "https://support.google.com/merchants/answer/12157888"]
about: ["https://en.wikipedia.org/wiki/Google_Shopping", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

The symptom almost nobody can explain: nothing changed in the feed, and hundreds of SKUs were disapproved overnight. Google has a name for that and documents the mechanism. **Preemptive item disapproval** happens when price or availability disagree between your feed and your landing pages, and when it is in force, "we err on the side of caution and disapprove products that are likely to violate our requirements" ([Google](https://support.google.com/merchants/answer/2948694)). A review takes 3 to 5 business days to undo.

Read that second clause again. Google is not only disapproving what it checked. It is disapproving what it **suspects**, by association, after detecting a discrepancy somewhere. Which is why the first useful question is never "what did we change", but which of the 5 documented product states you are actually in.

## Is the product disapproved, limited, or just under review?

Five distinct states, and three of them are not errors.

| Status | What it means |
|---|---|
| **Processing** | updates in flight, "may take up to 15 minutes" |
| **Under review** | "up to 3-5 business days" for Shopping ads |
| **Approved** | serving normally |
| **Limited** | "showing on Google, but only in some instances" |
| **Not approved** | "can't be shown on Google" |

Source: [Google](https://support.google.com/merchants/answer/12488713).

The expensive confusion is between **Limited** and **Not approved**. The first is live and degraded. The second is not live. Treating both with the same urgency burns the time that belonged to the second.

There are also two silent states nobody goes looking for: products enter a "needs update" column 30 days after their last update, and hidden items are archived automatically after 14 days ([Google](https://support.google.com/merchants/answer/12488713)). A feed that stopped refreshing produces no error. It ages out.

## Is it the item or the account?

A different axis, and it decides whether you fix one row or the business.

Google separates them in two sentences: "Product-level issues only affect individual products, not your entire account", while "Account-level issues impact all of your products in Merchant Center" ([Google](https://support.google.com/merchants/answer/2948694)).

Within each axis there is a gradient that matters. Products with **warnings** "will continue to show across Google, however their performance may be limited". **Disapproved** products "stop showing across Google". And at account level, if issues go unresolved within the window, "your account will be suspended and your products will be disabled from appearing across Google".

Crossing the two axes gives four real situations, and only one is an emergency: disapproval at account level.

The ordering matters because the fixes are unrelated. An item-level disapproval is a data problem you solve in the feed or on the page. An account-level warning is a policy problem you solve by changing something about the business, and the clock on it runs whether or not anyone noticed the notification. Teams that treat the second like the first spend the warning window re-uploading a feed.

## How does Google detect a price discrepancy?

By crawling your page, and there is a technical trap in the middle of it.

The documentation is literal: "Googlebot routinely crawls your website landing pages and compares the price attribute in your data source with the prices on your landing page or in your structured data markup." Then the part that catches modern storefronts: "Googlebot crawls the data present in the HTML returned from your web server. If data on your website is passed dynamically with JavaScript after the page is loaded, this will trigger an error" ([Google](https://support.google.com/merchants/answer/12159029)).

A price that only appears after your framework hydrates does not exist for Google. The page looks correct to you and wrong to the crawler, which is why this failure survives every manual check.

Availability goes further, comparing across "the landing page, checkout page, structured data (if applicable) and your data source" ([Google](https://support.google.com/merchants/answer/9773127)). The checkout leg is what catches a store whose product page says in stock and whose cart rejects the SKU.

And there is an automation detail that inverts the hierarchy most teams assume. With automations enabled, Google uses your page to correct your feed, with its own example: if the latest upload lists a product at $4 and the page lists $3, "we'll update the product to $3 USD in your ads or free listings" ([Google](https://support.google.com/merchants/answer/12157888)). **The page wins, not the feed.**

## Is GTIN required?

No, and this is the most repeated outdated claim in the category.

The specification marks `gtin` as "it depends", with guidance that it is "recommended for all products with a GTIN assigned by the manufacturer", plus a warning worth its weight: "Only provide a GTIN if you're sure it's correct. When in doubt don't provide a GTIN" ([Google](https://support.google.com/merchants/answer/6324461)).

The attribute actually required for new products is **`brand`**, required "for each product with a clearly associated brand or manufacturer" ([Google](https://support.google.com/merchants/answer/6324351)).

Base required attributes are `id`, `title`, `description`, `link`, `image_link`, `availability` and `price` ([Google](https://support.google.com/merchants/answer/7052112)). Note that `structured_title` and `structured_description` now exist as alternatives, so any "seven required attributes" list copied from an older post is already drifting.

## What changes if you sell outside the US?

The price rule inverts, and this is the trap when a US store expands.

Google says to exclude tax from `price` when targeting the United States or Canada. For a list of other countries, it says the opposite: provide the price "including any value-added tax (VAT) or Goods and Services Tax (GST)" and ensure the landing page price matches ([Google](https://support.google.com/merchants/answer/6324371)).

A US merchant who ports their feed configuration to a VAT market keeps stripping tax, lands a price mismatch against their own checkout, and triggers the preemptive disapproval described above. The feed did not break. It was correct for the country it was written for.

Several countries also require shipping configuration or a `shipping` attribute as a condition of eligibility, and return policy appears as a separate requirement ([Google](https://support.google.com/merchants/answer/13889434)).

## How long does any of this take?

It depends which Google page you open, and that is not a joke.

| Step | Documented duration |
|---|---|
| Feed update processing | up to 15 minutes |
| Product review | 3 to 5 business days |
| Review request | up to 7 business days |
| Review request (different page) | 3 to 7 business days |
| Approved product goes live | within 24 hours |
| Site review after a price fix | up to 12 hours |
| Availability re-crawl | 24 to 48 hours |

Sources: [product status](https://support.google.com/merchants/answer/12488713), [request a review](https://support.google.com/merchants/answer/13585221), [warnings and suspensions](https://support.google.com/merchants/answer/13693195) and [mismatched price](https://support.google.com/merchants/answer/12159029).

Three live Google pages give three different review durations. None is wrong; they simply do not agree. Anyone quoting one number confidently has not opened the other two.

## What if the account is suspended for misrepresentation?

Then the rules change, and the appeal process has limits worth knowing beforehand.

The enforcement language is the harshest in the policy set: violations "are considered egregious", and if found, "your Google accounts will be suspended upon detection and without prior warning, and you won't be allowed to promote with Google Shopping again" ([Google](https://support.google.com/merchants/answer/6150127)). The four subcategories are unacceptable business practices, misleading or unrealistic offers, omission of relevant information, and unavailable offers.

The appeal mechanics matter before you spend your first attempt: "You may only have one chance to disagree with the issue"; if unresolved by the second review, "a one-week cool down period may begin"; the review button is disabled during it; support "can't bypass or shorten" it; and it "may increase with each unsuccessful review afterwards" ([Google](https://support.google.com/merchants/answer/13585221)).

The practical reading is blunt. Appeals are a limited resource. Fix the underlying issue before requesting review, because requesting and failing costs escalating time.

## Why is this a data problem, not a feed problem?

Because the mismatch Google detects is usually the one already sitting in your reports.

Price in the feed, price on the page and price at checkout are three places where the same number should agree and frequently does not, for the same reason [a platform and an analytics tool never agree](https://precisian.io/blog/en/posts/shopify-ga4-revenue-mismatch/): each system computes over its own definition, with or without tax, with or without shipping, at a different moment in the order's life.

Merchant Center is simply the first place where that becomes visible as a consequence, because it is the only one that disapproves. An internal report disapproves nothing. It presents the divergent figure with its usual composure, and somebody reconciles by hand every month.

So the reading is worth inverting. A price-mismatch disapproval is not an integration problem with Google. It is a symptom that the definition of price is not written anywhere both systems read, which is [the same failure that separates marketing from finance](https://precisian.io/blog/en/posts/marketing-finance-revenue-definition/). Fixing the feed resolves this week's disapproval. Writing the definition resolves the category.

If your feed disapproves in bulk with nobody having touched it, [book a conversation about your case](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).

## What changes in 2027?

An image rule that already issues warnings but does not yet disapprove.

The specification update sets a 500 by 500 pixel minimum, with warnings since April 2026, and **disapproval enforcement beginning 31 January 2027** ([Google](https://support.google.com/merchants/answer/16989427)).

So anyone writing today that images below 500 by 500 are disapproved is wrong now, and anyone ignoring the warning will be disapproved next year. The gap between those dates is your runway. The same update adds attributes including handling cutoff time, minimum order value and video link.

## What does this article not cover?

It does not name the most common cause of disapproval. Google publishes no frequency ranking and I found none from a primary source. Every "top reasons" list in circulation is ordered by its author's opinion.

It gives no price-mismatch tolerance. I looked for a percentage threshold by name in the mismatch documentation and it is not there. Anyone claiming a tolerated margin is publishing a number Google has not.

It does not assert that "Pending" and "Under review" are the same state. Both terms appear on different pages and I found no document reconciling them. It looks like terminology drift, and I treat it as that.

And it carries no last-updated date for the pages cited, because none of them exposes one. Everything here is dated by when I read it, in September of this year, which is the only honest claim available about the currency of these sources.
