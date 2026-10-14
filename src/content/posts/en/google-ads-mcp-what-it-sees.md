---
title: "The official Google Ads MCP server: what it answers and what it can't see"
description: "Google's Ads MCP server reads your account through GAQL, read-only. It reports what Google logged as a conversion, not shipped orders, Amazon sales or returns."
slug: "google-ads-mcp-what-it-sees"
lang: "en"
translationKey: "google-ads-mcp"
publishedAt: 2026-10-14
tags: ["mcp", "roas", "atribuicao", "dados-para-ia", "divergencia-de-dados", "ecommerce"]
draft: false
llmSummary: "The Google Ads MCP server (googleads/google-ads-mcp, v0.0.5, released Oct 9, 2026) is read-only and exposes three tools, including search, which runs GAQL. It returns conversions as Google Ads recorded them, dated by click, and cannot see shipped orders, marketplace sales or returns."
citations: ["https://developers.google.com/google-ads/api/docs/developer-toolkit/mcp-server", "https://github.com/googleads/google-ads-mcp", "https://pypi.org/project/google-ads-mcp/", "https://developers.google.com/google-ads/api/fields/latest/metrics", "https://support.google.com/google-ads/answer/9549009", "https://support.google.com/google-ads/answer/3123169", "https://support.google.com/google-ads/answer/10632359", "https://developers.google.com/google-ads/api/docs/conversions/upload-adjustments"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://en.wikipedia.org/wiki/Google_Ads", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
---

The Google Ads MCP server lets an AI assistant query your ad account in plain English, with read-only access. According to Google's documentation, last updated October 14, 2026, it exposes three tools, and the main one, `search`, runs Google Ads Query Language (GAQL) queries ([Google Ads API](https://developers.google.com/google-ads/api/docs/developer-toolkit/mcp-server)). It answers precisely what Google Ads recorded as a conversion. How much of that became a shipped, paid order is something it has no way to know.

> **Google Ads MCP server**: a server that implements the Model Context Protocol on top of the Google Ads API, giving a language model your account data (campaigns, spend, conversions, budgets) through GAQL queries, with no permission to change anything.

## How does the Google Ads MCP server actually work?

You ask Claude, ChatGPT or Gemini something like "which campaigns spent the most in the last 7 days?" The model inspects the tools it has, picks `search`, builds the query, the server calls the Google Ads API, and the rows land in the conversation context. The model then writes the answer.

The three tools, per the [official guide](https://developers.google.com/google-ads/api/docs/developer-toolkit/mcp-server) and the [repository README](https://github.com/googleads/google-ads-mcp):

- `list_accessible_customers`: lists the accounts the authenticated user can reach.
- `search`: pulls fields from a resource (campaign, ad group, keyword) with filters and sorting. GAQL under the hood.
- `get_resource_metadata`: tells the model which fields each resource accepts, so it stops guessing column names.

Most third-party write-ups mention only the first two. The third one matters, because it is what keeps the model from writing queries that fail.

What the documentation pins down:

- **Read-only.** Google's words: the implementation "is strictly read-only. It cannot modify bids, pause campaigns, or create new assets." In the code, all three tools carry the `readOnlyHint` annotation ([repository](https://github.com/googleads/google-ads-mcp)). A comment in the source code notes that Google Ads does not publish a read-only OAuth scope. The credential uses the full `adwords` scope, and what prevents writes is that the server simply offers no write tool.
- **Transport:** `stdio` (your client launches the process locally) or Streamable HTTP, including a Cloud Run deployment.
- **Authentication:** OAuth 2.0 or a service account.
- **Developer token:** the guide says `GOOGLE_ADS_DEVELOPER_TOKEN` was sunset on September 9, 2026, and that access levels now attach to the Google Cloud project ([Google Ads API](https://developers.google.com/google-ads/api/docs/developer-toolkit/mcp-server)). Any setup tutorial telling you to apply for a token is out of date.

## Is it an official Google product?

It is published by Google and documented by Google, and it still looks like an early-stage project. As of October 14, 2026:

- The code lives in the `googleads` GitHub organization under the Apache 2.0 license. The current release on [PyPI](https://pypi.org/project/google-ads-mcp/) is 0.0.5, from October 9, 2026; the first package, 0.0.1, shipped on October 22, 2025.
- The [developers.google.com guide](https://developers.google.com/google-ads/api/docs/developer-toolkit/mcp-server) presents it as part of the Google Ads API developer toolkit, but routes support to GitHub issues and a community Discord channel. There is no commercial support path.
- The README does not carry the "not an officially supported Google product" disclaimer that several sites attribute to it. I searched the full repository history and it was never there.

In practice, it is Google's own reference implementation, versioned 0.0.x. Treat it as a developer tool, not a product with an SLA.

## What can it answer, and what can't it see?

The question that decides whether the Google Ads MCP server is enough for you: does the answer you need live inside Google Ads, or outside it?

| Question to the assistant | What comes back | What's missing |
|---|---|---|
| "What did I spend per campaign in September?" | Cost per campaign, exact | Nothing. Spend is native Google Ads data |
| "Which keywords have the highest CPC?" | CPC, clicks, impressions, search terms | Nothing that matters |
| "How many sales did the brand campaign drive?" | `metrics.conversions` from primary conversion actions | How many became shipped, paid orders in Shopify or your ERP |
| "What was September's ROAS?" | Conversion value over cost, by Google's yardstick | Net revenue: cancellations, failed payments, shipping, sales tax |
| "How much did Google Ads sell on Amazon?" | Nothing | The entire marketplace sale; the click started on Google, the purchase closed off your site |
| "How much of the Black Friday revenue got refunded?" | Only what someone uploaded as a conversion adjustment | Returns and refunds recorded in Shopify or your returns app |
| "Which channel drove the most revenue this month?" | Google's view of Google | Meta, TikTok, email, SMS, retail stores |
| "Did customers from Google come back and buy again?" | Nothing useful | Customer history, repeat purchase, LTV |

The first three rows are the server at its best: spend, bids and search terms are platform truth, and no better source exists for them. From the fourth row down, the question becomes a business question while the answer stays a platform answer. The model does not flag the switch. It writes "ROAS was 6.2" in the same confident tone it used for spend.

## Why isn't a Google Ads conversion a shipped order?

Four mechanisms, all documented by Google itself.

**The date is the click date.** In the standard columns, Google Ads has always reported conversions on the date the ad was clicked. A click on September 28 that turns into a purchase on October 3 shows up in September. The "by conversion time" columns exist to fix exactly that, and Google suggests comparing them against your own sales reports ([Google Ads Help](https://support.google.com/google-ads/answer/9549009)). In the API, the split is `metrics.conversions` versus `metrics.conversions_by_conversion_date` ([metrics reference](https://developers.google.com/google-ads/api/fields/latest/metrics)). The assistant only uses the second one if someone asks for it.

**The window decides what counts.** The default click-through conversion window is 30 days, adjustable from 1 to 90 ([Google Ads Help](https://support.google.com/google-ads/answer/3123169)). A purchase outside the window vanishes; a purchase inside it counts even if the customer came back through five other paths afterward.

**A GA4 import brings GA4's rules.** When the conversion is a GA4 key event, Google Ads respects the Analytics settings, and properties linking for the first time give credit, by default, only to Google paid channels ([Google Ads Help](https://support.google.com/google-ads/answer/10632359)). That default favors the channel being measured.

**A refund only exists if someone reports it.** The API accepts `RETRACTION` adjustments (remove the conversion) and `RESTATEMENT` adjustments (correct its value) ([Google Ads API](https://developers.google.com/google-ads/api/docs/conversions/upload-adjustments)). If your stack doesn't push those from Shopify or your ERP, the refund never happened as far as Google Ads knows, and so it never happened for the MCP server either.

None of this is a bug in the server. It faithfully reads what the account holds. The problem is that "how much did I sell?" is answered in a different system.

## What is the Google Ads MCP server not?

It is not a revenue source. It is a media source, and the best one available for Google media.

It is not a definitions layer either. It has no idea what your company means by "sale," "revenue" or "ROAS." If finance computes ROAS on net shipped revenue and the assistant computes it on conversion value, both numbers come out correct and incompatible. That is textbook [metric hallucination](https://precisian.io/blog/en/posts/metric-hallucination/): the right number on the wrong rule.

And it does not replace a BI tool. The difference between the two access paths is covered in [MCP server vs BI tool: which question is each one for?](https://precisian.io/blog/en/posts/mcp-server-vs-bi-tool/)

## When does this start to matter for your business?

The day someone moves budget based on the assistant's answer. Here is a synthetic example with round numbers: a Shopify store that also sells on Amazon, looking at the same month.

| Reading | Orders | Revenue | Source |
|---|---|---|---|
| Google Ads via MCP | 120 conversions | $60,000 conversion value | Ad account, click date, 30-day window |
| Shopify, paid and fulfilled orders attributed to Google | 104 | $50,000 | Excludes canceled and fraud-flagged orders |
| Shopify, after returns | 98 | $47,000 | Refunds booked on the refund date |
| Amazon, shoppers who searched the brand on Google | not attributable | not attributable | Neither system links the click to the sale |

In this made-up example, the ROAS the assistant reports runs 28% above what the bank account supports, and nobody lied; there are three different yardsticks. The numbers are illustrative; the size of the gap in your own business only shows up when you measure it.

It gets worse once the same assistant is also wired to the Meta and GA4 MCP servers. Each answers with its own platform's truth, and adding the three up recreates inside the chat the math that already didn't close in the spreadsheet, the one described in [why your reported ROAS exceeds actual revenue](https://precisian.io/blog/en/posts/roas-exceeds-actual-revenue/). MCP solves access. The definition of a sale still has no owner.

Closing that gap means joining media with paid orders, refunds and marketplace sales, and writing down once what the rule is. That is the work Precisian does: each source's data in a data lake isolated per client, running on Precisian's infrastructure, with metric definitions in a semantic layer, delivered to the assistant you already use through MCP, API or your BI tool.

## What does this article not cover?

It is not an installation guide; the steps are in the [README](https://github.com/googleads/google-ads-mcp) and change with every release. It does not compare third-party Google Ads MCP servers, some of which do allow writes. And it gives no launch date: I found no announcement of the server on Google's Ads developer blog, so the time reference here is the published package.

---

If the assistant connected to Google Ads reports one ROAS and finance closes the month on another, the first step is measuring the gap between platform conversions and paid orders, month by month. [See how that works in practice](https://precisian.io/demonstracao). No contract commitment, and no promise of an answer in 30 minutes either.
