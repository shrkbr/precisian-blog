---
title: "AI Max in Google Ads: what it changes and what to check"
description: "AI Max picks the search term, ad text and landing page, then optimizes to the conversion Google Ads records. Your booked revenue sits outside that loop."
slug: "ai-max-for-search"
lang: "en"
translationKey: "ai-max-for-search"
publishedAt: 2026-11-23
tags: ["roas", "attribution", "data-discrepancy", "tracking", "ecommerce"]
draft: false
llmSummary: "AI Max for Search campaigns lets Google Ads choose the search term, ad text and landing page, and Google says it requires conversion-based Smart Bidding (Google Ads Help, Nov 23, 2026). It optimizes to the conversion recorded in Google Ads, not to the order your store actually booked."
citations: ["https://support.google.com/google-ads/answer/15910187", "https://support.google.com/google-ads/answer/15909989", "https://support.google.com/google-ads/answer/15913066", "https://support.google.com/google-ads/answer/16470459", "https://support.google.com/google-ads/answer/16450159", "https://support.google.com/google-ads/answer/11461796", "https://support.google.com/google-ads/answer/7686280", "https://support.google.com/google-ads/answer/10029210", "https://developers.google.com/google-ads/api/docs/campaigns/ai-max-for-search-campaigns/ai-max-reporting", "https://blog.google/products/ads-commerce/google-ai-max-for-search-campaigns/", "https://blog.google/products/ads-commerce/dsa-upgrade-to-ai-max-2026/", "https://blog.google/products/ads-commerce/ai-max-new-features/"]
about: ["https://en.wikipedia.org/wiki/Google_Ads", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 9
cta: regua
---
AI Max for Search campaigns is a feature suite that lets Google Ads decide which searches your ad shows on, rewrite the ad text, and swap the landing page. In [Google Ads Help](https://support.google.com/google-ads/answer/15909989) (read November 23, 2026), Google says these features "require conversion-based Smart Bidding strategies in order to function effectively." The system optimizes toward the conversion Google Ads recorded. Whether that conversion became a shipped, paid order is outside its loop.

> **AI Max for Search campaigns**: an optimization layer inside an existing Search campaign, not a new campaign type. It bundles search term matching, text customization, Final URL expansion, locations of interest, and brand and URL controls ([Google](https://support.google.com/google-ads/answer/15910187)).

Precisian doesn't run media and has no stake in whether you turn AI Max on. This piece covers what feeds the system as a signal, and what you should measure before and after.

## Why is AI Max on the agenda now?

Because for many accounts it stopped being a choice. Google announced AI Max on May 6, 2025 ([Google blog](https://blog.google/products/ads-commerce/google-ai-max-for-search-campaigns/)). On April 15, 2026, it said automatically created assets and campaign-level broad match "will continue to be auto-upgraded starting in September 2026," and that the Dynamic Search Ads sunset and auto-upgrade "will begin in February 2027" ([Google blog, updated June 11, 2026](https://blog.google/products/ads-commerce/dsa-upgrade-to-ai-max-2026/)).

New Search campaigns already start with it checked: "New Search campaigns have the AI Max feature turned on by default" ([Google](https://support.google.com/google-ads/answer/15909989)). If nobody on your team touched the setting, you may be running it.

## What does AI Max change, feature by feature?

It moves three decisions from the advertiser to the system. The table summarizes [Google's documentation](https://support.google.com/google-ads/answer/15910187), read on November 23, 2026.

| Feature | What Google documents | Level | Where it shows up in reporting |
|---|---|---|---|
| Search term matching | Uses broad match plus asset-based and landing page-based (keywordless) technology | Ad group, on by default | Search terms report, match type "AI Max" and the "Source" column |
| Text customization | Writes headlines and descriptions from your ads, landing pages and generative AI | Campaign | Asset report, "Google AI" in the "Added by" column |
| Final URL expansion | Sends the click to the URL on your site the system judges most relevant; requires text customization | Campaign | Landing pages report, "Selected by" column |
| Locations of interest | Reaches people by geographic intent, including keywordless matches | Ad group | Dedicated API view |
| Brand and URL controls | Brand inclusions and exclusions; URL inclusions and exclusions | Campaign and ad group | AI Max settings panel |

Sources: [how AI Max works](https://support.google.com/google-ads/answer/15910187) and [AI Max reporting](https://support.google.com/google-ads/answer/16470459), Google Ads Help.

Google lists two side effects itself. With Final URL expansion on, pinned responsive search ad assets "aren't used if a more relevant URL is chosen." And after AI Max is turned on, "broad keywords are not treated as exact match keywords in prioritization" ([Google](https://support.google.com/google-ads/answer/15910187)).

## What does the symptom look like in your store's numbers?

The most visible symptom is Google Ads reporting more conversions while revenue in Shopify, or in your ERP, stays flat.

By Google's own account, advertisers that activate AI Max "will typically see 14% more conversions or conversion value" at a similar CPA or ROAS, and 27% for campaigns still mostly on exact and phrase match ([Google blog, May 6, 2025](https://blog.google/products/ads-commerce/google-ai-max-for-search-campaigns/)). That is Google internal data, measured in Google's own Conversions column, not a forecast for your account. It can be true while your bank balance doesn't move, for three reasons.

The other symptoms show up in separate reports: queries nobody bid on in the search terms report, landing pages nobody picked (sometimes returning a 404), and headlines nobody wrote.

## Why do conversions rise while revenue doesn't?

First, **the system optimizes to whatever your primary conversion is.** Primary actions are "used for bidding as long as the standard goal they are part of is used for bidding" ([Google, primary and secondary actions](https://support.google.com/google-ads/answer/11461796)). If your primary action is a purchase tag that fires on the order confirmation page, it counts the order your fraud filter later cancels and the order that gets returned in week two, because the tag fires before either outcome. Shopify and GA4 also define revenue differently, which [the Shopify vs GA4 piece](https://precisian.io/blog/en/posts/shopify-ga4-revenue-mismatch/) walks through. AI Max expands terms, text and pages toward whatever produces that conversion. Feed it an inflated number and it learns from the inflated number.

Second, **a conversion that moved campaigns is not a new sale.** Google's FAQ says that when a query is eligible for both AI Max and Performance Max, "the one with the highest Ad Rank will serve" ([Google, AI Max FAQ](https://support.google.com/google-ads/answer/15913066)). The AI Max campaign can pick up conversions that used to land in another campaign in the same account. Read by campaign, it looks like growth. Read across the account, it may be redistribution.

Third, **a swapped landing page can break tracking.** Google warns that with tracking templates, Final URL expansion's dynamic URLs "can sometimes lead to broken expanded landing pages with a 404 error," and that a static tracking URL without an `{lpurl}` tag sends users to that static URL instead ([Google](https://support.google.com/google-ads/answer/15910187)). The lost click drops out of your GA4 landing page report, while the spend still counts.

All three push the same way: platform ROAS goes up. It is the pattern described in [why platform ROAS adds up to more than your revenue](https://precisian.io/blog/en/posts/roas-exceeds-actual-revenue/).

## How do you diagnose what AI Max is doing in your account?

Five checks. The first four live inside Google Ads.

| Check | Where to look | What signals a problem |
|---|---|---|
| New queries | Search terms report, filter "Match type" = "AI Max", add the "Source" column | Terms unrelated to your catalog, or competitor brand terms |
| Expansion share | Keywords report, rows "Total: AI Max expanded matches" and "Total: AI Max landing page matches" | A large share of spend with no matching orders in your store |
| Chosen pages | Landing pages report, "Selected by" column | Policy pages, blog posts or out-of-stock products getting clicks |
| What counts as a conversion | Goals, primary conversion actions | More than one primary purchase action, or one without a `transaction_id` |
| Real orders | Store orders with a captured `gclid` vs Google Ads conversions, same dates | Platform conversions rising while booked orders stay flat |

Report and column names: [AI Max reporting](https://support.google.com/google-ads/answer/16470459), read November 23, 2026.

The API gives you the same cut. The `segments.search_term_match_source` field on `search_term_view` separates `AI_MAX_KEYWORDLESS` and `AI_MAX_BROAD_MATCH` from `ADVERTISER_PROVIDED_KEYWORD`, and `ai_max_search_term_ad_combination_view` returns `search_term`, `headline` and `landing_page` ([Google Ads API, AI Max reporting](https://developers.google.com/google-ads/api/docs/campaigns/ai-max-for-search-campaigns/ai-max-reporting), read November 23, 2026):

```sql
SELECT campaign.name, search_term_view.search_term,
  segments.search_term_match_source,
  metrics.clicks, metrics.cost_micros, metrics.conversions
FROM search_term_view
WHERE segments.search_term_match_source IN ('AI_MAX_KEYWORDLESS', 'AI_MAX_BROAD_MATCH')
  AND segments.date DURING LAST_30_DAYS
```

The last row of the table only works if the `gclid` reaches the order record. If it dies in a browser cookie, the check can't close; the [gclid explainer](https://precisian.io/blog/en/posts/what-is-gclid/) shows where it gets lost.

A synthetic example with round numbers: the campaign goes from 100 to 114 conversions in a month, Google's advertised 14%. Of those 114, Shopify shows 96 paid, unrefunded orders carrying that campaign's `gclid`, and Performance Max in the same account dropped from 60 to 50. Account-wide, the change is 4 conversions, not 14. The question that decides it applies to the whole account, Performance Max included: how many of the 164 conversions became booked orders, against how many of the 160 the month before.

## How do you fix the signal before judging AI Max?

Fix the conversion first. If the conversion is wrong, every reading of AI Max inherits the error.

1. **One primary purchase action, with your order number as `transaction_id`.** Everything else goes secondary, which Google describes as "for observation only" ([Google](https://support.google.com/google-ads/answer/11461796)).
2. **Conversion adjustments for what the store canceled or refunded.** Google accepts `RETRACT` and `RESTATE`, with "up to 7 days after they're first recorded for autobidding readability" and 54 days overall ([Google, adjust conversions](https://support.google.com/google-ads/answer/7686280)). A fraud cancellation usually lands inside the 7 days; a refund after that corrects your reports, not the bidding signal.
3. **Off-site orders imported by `gclid`.** Google accepts a GCLID conversion "so long as it's no longer than 90 days" and deduplicates on the GCLID, conversion name and conversion time ([Google, offline import FAQ](https://support.google.com/google-ads/answer/10029210)).
4. **A test with a control arm.** An AI Max experiment splits one campaign into an arm with AI Max off and one with it on, and "diverts traffic and budget within an existing campaign" ([Google, AI Max experiments](https://support.google.com/google-ads/answer/16450159)). Read the result against booked orders, not only in the Experiments tab.
5. **A tracking template built on `{lpurl}`**, tested on an expanded URL before you enable expansion, plus URL exclusions for pages that don't sell.

Two more details from Google's FAQ change how you read the data. Negative keywords keep working: "Negative keywords will be respected even with AI Max turned on." And on manual bidding, "The Search Term Matching feature in AI Max will not work with manual CPC bidding" ([Google, AI Max FAQ](https://support.google.com/google-ads/answer/15913066)). So an account on manual CPC that turns AI Max on gets the rewritten text and the swapped pages without the query expansion, and its search terms report will look almost unchanged. Turning AI Max off later also disables brand exclusions set inside it, per the same FAQ, which matters if those exclusions are what kept you off a competitor's name.

Google also asks you to wait "at least 2 weeks" after enabling AI Max before making changes such as adding negative keywords ([Google](https://support.google.com/google-ads/answer/16470459)). That wait is for the system's ramp-up. Measuring booked orders starts on day one.

## When can't Google Ads fix this?

When the sale never returns to Google with a click ID.

Phone orders without a captured `gclid`, Amazon marketplace sales, in-store purchases and sales cycles longer than 90 days all fall outside offline import. There, AI Max optimizes only to the slice of revenue Google can see, and no campaign setting changes that.

The question "how much of this is a new sale" can't be answered inside the campaign either. Google measures inside its own account. Answering it takes Google Ads spend and conversions next to booked orders and your other channels, under one written definition of revenue, which is the job of a semantic layer ([what goes into one](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/)).

That is the part Precisian works on: Google Ads data and booked orders in the same lake, isolated per client on Precisian's infrastructure, queried by the AI, BI tool or automation your team already uses. If all you need is to audit AI Max's terms and pages, Google's own reports and the [Google Ads MCP server](https://precisian.io/blog/en/posts/google-ads-mcp-what-it-sees/) are enough, and Precisian isn't the right answer.

## What doesn't this article cover?

It doesn't recommend turning AI Max on or off, and it doesn't estimate gains or losses. The 14% and 27% figures are Google's, measured by Google.

It doesn't cover AI Max for Shopping campaigns or Search campaigns for travel, announced on April 30, 2026 ([Google blog](https://blog.google/products/ads-commerce/ai-max-new-features/)).

It doesn't say whether you can decline the February 2027 auto-upgrade, because Google's announcement doesn't describe that option.

If your campaign gained conversions after AI Max, the first step is counting how many your store booked, across the whole account rather than one campaign. [See this article's question answered on a real lake](https://precisian.io/en/demo?utm_source=blog&utm_medium=cta&utm_campaign=ai-max-for-search&utm_content=texto), with no contract commitment.
