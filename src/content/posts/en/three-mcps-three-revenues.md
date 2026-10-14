---
title: "Connect Google Ads, Meta and GA4 to one AI and you get three revenue numbers"
description: "Google Ads counts purchases 30 days after a click; Meta, 7 days after a click or 1 after a view. Plug all three MCPs into Claude and one order counts twice."
slug: "three-mcps-three-revenues"
lang: "en"
translationKey: "three-platform-mcps"
publishedAt: 2026-10-14
tags: ["mcp", "roas", "attribution", "semantic-layer", "ai-data-access", "data-discrepancy", "ga4", "metric-hallucination"]
draft: false
llmSummary: "An AI agent connected to Google Ads, Meta and GA4 MCP servers receives three overlapping attributions: Google Ads counts purchases up to 30 days after a click, Meta up to 7 days after a click or 1 day after a view, per 2026 official docs. No server deducts what another already claimed."
citations: ["https://support.google.com/google-ads/answer/3123169", "https://support.google.com/google-ads/answer/6259715", "https://developers.facebook.com/docs/marketing-api/reference/ad-account/insights", "https://support.google.com/analytics/answer/10596866", "https://support.google.com/analytics/answer/10597962", "https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema", "https://github.com/googleanalytics/google-analytics-mcp", "https://modelcontextprotocol.io/docs/learn/architecture"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://en.wikipedia.org/wiki/Attribution_(marketing)", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

Connecting the Google Ads, Meta and GA4 MCP servers to one Claude gives the agent three attribution rules that overlap. Google Ads counts a purchase up to 30 days after a click by default ([Google Ads](https://support.google.com/google-ads/answer/3123169)). Meta's default counts it up to 7 days after a click or 1 day after a view ([Meta](https://developers.facebook.com/docs/marketing-api/reference/ad-account/insights)). The same order fits inside both, and the agent adds them up.

Every one of those servers is faithful to its own platform, which is precisely why the total runs past your actual revenue. Nothing is broken. What's missing is the one place where your company wrote down what counts as revenue from paid media.

> **Three MCPs, three revenues**: when an AI assistant queries Google Ads, Meta and GA4 through separate MCP servers, each server returns conversions calculated under its own platform's rules. Each number is correct on its own terms and incompatible with the others, because each platform claims the whole order.

## What does the problem look like in the chat?

You wire the three servers into Claude Desktop, ask the question every e-commerce lead asks on Monday ("how much did paid media sell last week?"), and get a clean answer with a table, a total and ROAS by channel. It reads like an audited number. It uses the same tone the agent used for ad spend, which is a figure it actually knows.

The paid media total lands close to your Shopify revenue for the week, or above it. That leaves little or nothing for organic search, email, SMS, direct and returning customers, channels you know sell. The agent doesn't flag it, because nothing in the setup asks it to.

The protocol documentation describes what happens underneath. The host application "fetches available tools from all connected MCP servers and combines them into a unified tool registry" for the model ([Model Context Protocol](https://modelcontextprotocol.io/docs/learn/architecture)). It also states that MCP "does not dictate how AI applications use LLMs or manage the provided context." The protocol merges the tools. Reconciling what the numbers mean is outside its scope, by design.

## Why do all three servers claim the same order?

Because each platform attributes inside its own walls and none of them subtracts what a competitor already counted. The full mechanics, sourced across platforms, are in [why your reported ROAS exceeds actual revenue](https://precisian.io/blog/en/posts/roas-exceeds-actual-revenue/). What changes here is that an agent now does the adding.

Follow one $120 order on a Shopify store. The shopper clicks a search ad on day 1, clicks a Meta ad on day 9 and buys on day 10.

| Source, via MCP | Rule it applies | What it claims |
|---|---|---|
| Google Ads | Click within the default 30-day window; data-driven model that splits credit only among Google ad interactions | $120 |
| Meta | Click within the default 7-day window | $120 |
| GA4 | Whatever model the property uses; under paid and organic last click, full credit to the last channel clicked | $120 to Meta, $0 to Google |
| Shopify | One order, no attribution | $120, once |

Sources: [Google Ads windows](https://support.google.com/google-ads/answer/3123169), [Google Ads attribution models](https://support.google.com/google-ads/answer/6259715), [Meta Insights API windows](https://developers.facebook.com/docs/marketing-api/reference/ad-account/insights), [GA4 models](https://support.google.com/analytics/answer/10596866).

Add the two ad servers together and the agent reports $240 of attributed sales for a $120 order. Neither source broke its own rules.

Four documented mechanisms produce the overlap:

**The windows don't line up.** Google Ads defaults to 30 days after a click and 1 day after a view, both adjustable ([Google Ads](https://support.google.com/google-ads/answer/3123169)). In Meta's Insights API, the `default` value of `action_attribution_windows` means `["7d_click","1d_view"]` ([Meta](https://developers.facebook.com/docs/marketing-api/reference/ad-account/insights)). The 1-day view is the sneaky one: the shopper scrolls past an Instagram ad without tapping, searches your brand on Google the next morning and buys. Meta counts it, Google counts it, and GA4 never saw the impression.

**Google's model only sees Google.** Data-driven attribution "is the default attribution model for most conversion actions" ([Google Ads](https://support.google.com/google-ads/answer/6259715)), and it splits credit among clicks on Google's own ads. From Google Ads' point of view, Meta isn't in the path.

**GA4 deduplicates, by its own rules.** Of the three, only GA4 splits one order across competing channels, and its credit never sums past one order. But "all attribution models exclude direct visits from receiving attribution credit" unless the whole path is direct ([GA4](https://support.google.com/analytics/answer/10596866)), it loses purchases that never return from an off-site payment step (the [redirect payment problem](https://precisian.io/blog/en/posts/redirect-payments-break-ga4-purchase/)), and it can't see Meta impressions. GA4 enters the math as a fourth opinion.

**GA4 even changes rules between reports.** In Analytics reports, paid and organic channels are eligible for credit by default; in Google Ads reports, the default is Google paid channels only ([GA4](https://support.google.com/analytics/answer/10597962)). If your Google Ads conversion is imported from GA4, it already arrives under a different rule than the one the GA4 server returns.

The [Google Ads MCP server](https://precisian.io/blog/en/posts/google-ads-mcp-what-it-sees/) is the first side of this math: it reads exactly what the account recorded, dated by click. The same holds for the other two: the [Meta Ads MCP server](https://precisian.io/blog/en/posts/meta-ads-mcp-permissions/) returns the conversions Meta credits to itself, and the [Google Analytics MCP server](https://precisian.io/blog/en/posts/google-analytics-mcp-limits/) adds the modeled data GA4 already carries.

## How do you diagnose it in your own accounts?

With an exercise that fits in an afternoon: one week, the same question to each source, and your order system as the referee.

**1. Pick a week that closed more than 30 days ago.** Google Ads reports by click date and keeps receiving conversions until the window closes ([Google Ads](https://support.google.com/google-ads/answer/3123169)). A recent week is still moving.

**2. Ask the Google Ads server for the rule along with the number.** Request conversion value both ways: `metrics.conversions_value` (click date) and `metrics.conversions_value_by_conversion_date` (conversion date). Ask which conversion actions were included and whether any are imported from GA4.

**3. Ask the Meta server to state its window in writing.** In the Insights API, the window comes from `action_attribution_windows` and the reporting date from `action_report_time`, which can follow the impression date or the conversion date ([Meta](https://developers.facebook.com/docs/marketing-api/reference/ad-account/insights)). If the agent can't say which window it used, write that down. The answer can't be audited.

**4. Ask the GA4 server for orders, not totals.** Google's server is labeled experimental, uses the Data API and exposes `run_report` ([repository](https://github.com/googleanalytics/google-analytics-mcp)). Request `purchaseRevenue` with the `transactionId` and `defaultChannelGroup` dimensions; the latter is the key event's channel under the property's model ([Data API schema](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema)).

**5. Export the same week's orders from Shopify**, by order date, excluding cancelled orders and refunds.

**6. Fill in the table.** A synthetic example with round numbers, to show the shape of the math:

| Source | Answer to "how much did paid media sell?" | Rule |
|---|---|---|
| Google Ads MCP | $48,000 | Click date, 30-day window, Google-only model |
| Meta MCP | $41,000 | 7 days after click or 1 after view |
| Total the agent presents | $89,000 | None; it's arithmetic across different rules |
| GA4 MCP, paid channels | $38,000 | Property model, only what the browser recorded |
| GA4 MCP, store total | $86,000 | Includes organic, direct, email, SMS |
| Shopify, net orders for the week | $100,000 | Orders placed, no channel |

In this invented example, the agent says paid media drove 89% of everything the store sold, while GA4 says 38%. The $51,000 between those readings is overlap, view-through, window mismatch and modeled conversions, blended together. It's the [reported ROAS that exceeds actual revenue](https://precisian.io/blog/en/posts/roas-exceeds-actual-revenue/), now computed inside the chat.

**7. Check the result against the referee.** Two checks need no model at all:

| Check | Math | What it proves |
|---|---|---|
| Platform total vs. Shopify | $89,000 ÷ $100,000 | Above 100%, double counting is certain. Close to it, the remaining revenue is implausibly small for channels with no ad spend |
| GA4 orders vs. Shopify orders | `transactionId` matched to the order number | GA4's coverage: an order it never saw can't be attributed by anything |

No vendor publishes an "acceptable overlap" threshold, and I won't invent one. What exists is arithmetic. Platform claims can't add up to more than the money that came in.

## How do you fix it?

Picking a winning server won't do it. Each stays the best source for what it measures in-house: spend, bids, search terms, creative. The fix is to take the definition of "paid media revenue" away from the agent.

**Separate platform ROAS from media revenue.** Platform ROAS is a per-platform number, useful for optimizing inside that platform and never additive. Media revenue is a company number, calculated on booked orders under a rule someone chose and wrote down. [MER vs ROAS](https://precisian.io/blog/en/posts/mer-vs-roas/) covers the difference.

**Write the definition where the agent reads before it computes.** A system prompt fixes one conversation and is gone in the next. The definition of media revenue, with its source, window, date basis and refund handling, belongs in a versioned [semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/) the agent queries instead of improvising.

**Join on the order, not the total.** The bridge between ad data and cash is the order ID: GA4's `transactionId`, the Shopify order number, the refund posted later. Adding totals from different systems yields a number no system recognizes.

**Require the rule in every answer.** Until the definition exists, the minimum is that the agent states the window, date basis and model behind each figure. An answer without its rule doesn't go into a budget meeting.

That's the work Precisian does: every platform's data and your order system in a data lake isolated per client, on Precisian's infrastructure, with metric definitions in a semantic layer, delivered to the assistant you already use through MCP, API or BI. The problem isn't connecting AI to your data. It's that the data, as it stands, makes the AI answer a wrong number with confidence, a pattern we've written about as [metric hallucination](https://precisian.io/blog/en/posts/metric-hallucination/).

## When can't it be fixed?

In three cases, and it's worth knowing them before you promise finance a number.

**View-through can't be reconciled.** Meta's view-through conversion happens inside Meta. None of your data links that impression to the order, so the only way to know whether it caused the sale is a controlled experiment. A semantic layer decides how your company counts; it can't recover what a platform doesn't hand over.

**Off-site sales have no path.** An Amazon order, a sale closed by phone or in a retail store never passes through GA4 and never returns to the ad platforms. You can declare a rule ("Amazon revenue stays out of media revenue"), as covered in [the marketplace attribution black hole](https://precisian.io/blog/en/posts/marketplace-attribution-blackhole/), but you can't attribute what no system recorded.

**Attribution isn't incrementality.** Even with one definition and no double counting, the answer is still "how much credit paid media received," not "how much paid media caused." The second question needs a holdout or lift test.

And here's when Precisian is the wrong choice: if you advertise only on Google, sell only on your own site, and GA4 matches Shopify within a gap you understand, the Google Ads MCP server plus a monthly check against Shopify is enough. The overlap described here needs at least two platforms claiming the same order.

## What does this article not cover?

It doesn't walk through installing any of the three servers; setup changes with every release. It doesn't describe the tools or permissions of Meta's MCP server. The Meta figures cited here come from the Insights API documentation, Meta's documented reporting interface, not from material about the MCP server.

It doesn't say which attribution model a new GA4 property defaults to. Google's help page listing the models doesn't name a default, and I found no primary source that does. Check yours under Admin, Attribution settings.

And it doesn't tell you how large the overlap is in your business. The figures in the exercise are synthetic. The real size depends on your channel mix and only shows up when you measure it.

---

If your agent, with Google Ads, Meta and GA4 connected, says paid media drove nearly everything the store sold, the first step is to run one closed week against your order system and measure the overlap. [Book a conversation about your setup](https://calendar.notion.so/meet/rodrigomartucci/precisian-io), with no contract commitment, and no promise of an answer in 30 minutes either.
