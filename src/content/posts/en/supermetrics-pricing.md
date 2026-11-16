---
title: "Supermetrics pricing in 2026: what each plan includes and what drives the bill"
description: "Supermetrics Starter lists at $44 a month billed yearly and Growth at $177. The bill grows with destinations, data sources, users and accounts, not data volume."
slug: "supermetrics-pricing"
lang: "en"
translationKey: "supermetrics-pricing"
publishedAt: 2026-11-16
tags: ["cost", "pipeline", "integration", "ai-data-access", "mcp", "ecommerce"]
draft: false
llmSummary: "On November 16, 2026, Supermetrics' pricing page listed Starter at $44 a month billed yearly ($59 monthly) and Growth at $177 ($222 monthly), with Enterprise by quote. Plans are fixed price; only AI Credits are metered, and add-ons are priced per destination, source, user and account."
citations: ["https://supermetrics.com/pricing", "https://docs.supermetrics.com/docs/how-to-add-more-features-and-upgrade-a-supermetrics-subscription", "https://docs.supermetrics.com/docs/about-data-source-accounts", "https://docs.supermetrics.com/docs/how-to-swap-data-sources-and-destinations", "https://docs.supermetrics.com/docs/supermetrics-mcp-server", "https://docs.supermetrics.com/docs/how-to-connect-supermetrics-to-ai-tools", "https://docs.supermetrics.com/docs/about-subscription-renewal", "https://supermetrics.com/platform/data-security", "https://web.archive.org/web/20261109201243/https://supermetrics.com/pricing"]
about: ["https://en.wikipedia.org/wiki/Extract%2C_transform%2C_load", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
cta: ficha
---
Supermetrics sells fixed-price plans, not metered data. On November 16, 2026, its [pricing page](https://supermetrics.com/pricing) listed Starter at $44 a month billed yearly ($59 billed monthly) and Growth at $177 a month billed yearly ($222 billed monthly), with Enterprise by quote. Both self-serve plans include one core destination. The bill grows with the destinations, data sources, users and accounts you add; row volume does not change it.

> **Data source account**: the unit Supermetrics counts against your quota, such as one Facebook Ads account or one Google Analytics 4 property. Each data source names it differently; Amazon Seller Central calls it a marketplace, Adobe Commerce a store ([Supermetrics docs](https://docs.supermetrics.com/docs/about-data-source-accounts), read November 16, 2026).

Every figure below comes from Supermetrics' own pages, read on November 16, 2026. Prices are list prices in US dollars, before tax and before any negotiated discount.

## What does each Supermetrics plan include?

The [pricing page](https://supermetrics.com/pricing) shows three packages. The two self-serve ones differ mainly in quotas:

| | Starter | Growth | Enterprise |
|---|---|---|---|
| Price, billed yearly | $44/month | $177/month | Quote |
| Price, billed monthly | $59/month | $222/month | Quote |
| Core destinations | 1 | 1 | 1+, core and data warehouse |
| Data sources | 2 | 7 | All, custom |
| Accounts per data source | 2 | 7 | Custom |
| Users | 1 | 2 | Custom |
| AI Credits | 1,000 | 4,000 | Custom |
| Data API, Storage, Transformations, Custom Data Import, warehousing | No | No | Yes |

Source: [Supermetrics pricing](https://supermetrics.com/pricing), read November 16, 2026.

The "core destination" is the place the data lands. The list for Starter and Growth is ChatGPT, Claude and Microsoft Copilot (sold together as AI chats), Looker Studio, Google Sheets, Microsoft Excel and Power BI. Snowflake and BigQuery appear only under Enterprise. Every plan lists Campaign Management, described as "Create, launch and manage ad campaigns straight from your AI chat."

## How much do add-ons cost?

The "Compare all features" table on the [pricing page](https://supermetrics.com/pricing) lists the extras, each with a cap on the total:

| Add-on | Starter (monthly / yearly billing) | Growth (monthly / yearly billing) |
|---|---|---|
| Destination | +$62 / +$49, up to 2 in total | +$187 / +$149, up to 4 in total |
| User | not listed | +$124 / +$99, up to 5 in total |
| Data source | +$47 / +$37, up to 3 in total | +$47 / +$37, up to 15 in total |
| Ad account | +$14 / +$11, up to 3 in total | +$14 / +$11, up to 20 in total |

Source: [Supermetrics pricing](https://supermetrics.com/pricing), read November 16, 2026. Prices per month.

Past those caps you are in Enterprise. Supermetrics' [upgrade guide](https://docs.supermetrics.com/docs/how-to-add-more-features-and-upgrade-a-supermetrics-subscription) says premium data sources, more than 5 subscription users and more than 20 data source accounts come only in custom packages through sales. On the connector list, Salesforce, Amazon DSP and Criteo carry the Premium tag; Shopify, Amazon Seller Central, Klaviyo, Google Ads, Facebook Ads and TikTok Ads do not.

## Does Supermetrics charge for data volume?

No. The FAQ on the [pricing page](https://supermetrics.com/pricing) says: "All Supermetrics plans are fixed price. Your subscription covers your usage, and we don't bill you for the volume of data you move." The one metered element is AI Credits, used by the Supermetrics Studio destination. The page adds that "Chatting with AI tools like Claude and ChatGPT doesn't use credits."

This is the opposite of [Fivetran's model](https://precisian.io/blog/en/posts/fivetran-pricing/), where each connection is billed by monthly active rows. With Supermetrics, a Shopify store with ten million orders and one with ten thousand pay the same plan price. You pay for how many places the data goes, how many sources and accounts feed it, and how many people log in.

## What does a real stack cost on Supermetrics?

A synthetic example with round numbers, not a quote. Take a US direct-to-consumer brand that wants seven sources: Shopify, Amazon Seller Central, Google Ads, Facebook Ads, TikTok Ads, Klaviyo and Google Analytics 4. It wants the data in Looker Studio for the weekly report and in Claude for questions, and three people need access.

| Line | Billed yearly |
|---|---|
| Growth plan (7 sources, 1 destination, 2 users) | $177 |
| Second destination (AI chats next to Looker Studio) | $149 |
| Third user | $99 |
| **Total per month** | **$425** |

That is $5,100 a year at the list prices on the [pricing page](https://supermetrics.com/pricing), on our reading that each add-on is priced per unit. The same setup on Starter is not possible: Starter caps at 3 data sources and 1 user. Seven sources is also exactly the Growth quota, so an eighth (Pinterest Ads, say) adds $37 a month.

A smaller shop with Shopify, Google Ads and Facebook Ads in one Google Sheet fits Starter with one extra source: $44 plus $37, or $81 a month billed yearly ([pricing page](https://supermetrics.com/pricing)).

## What moves the bill up or down?

Four things, all documented by Supermetrics.

**1. The second destination.** Each plan includes one. A team that wants a spreadsheet and an AI chat pays for two. The [AI chats guide](https://docs.supermetrics.com/docs/how-to-connect-supermetrics-to-ai-tools) says AI chats "is a separate destination" that "doesn't come with every package automatically."

**2. Account count, not source count.** The [accounts guide](https://docs.supermetrics.com/docs/about-data-source-accounts) explains that all data sources on a subscription share one account quota. An agency pulling 10 Facebook Ads accounts and 7 LinkedIn Ads accounts needs a subscription that supports at least 10. Brands with one store per country hit this first.

**3. Swapping instead of adding.** On card-paid subscriptions, Supermetrics allows "one data source or one destination every 30 days" to be swapped ([swap guide](https://docs.supermetrics.com/docs/how-to-swap-data-sources-and-destinations)). The old source's queries stop working when you swap, so this suits a seasonal channel better than a permanent one.

**4. Billing cycle.** Yearly billing saves 25% on Starter and 20% on Growth, as the page states. Subscriptions "renew automatically until they're cancelled," and an invoiced subscription cannot be cancelled by not paying the invoice ([renewal guide](https://docs.supermetrics.com/docs/about-subscription-renewal)).

The displayed price also moves. Copies of the same page on the [Wayback Machine](https://web.archive.org/web/20261109201243/https://supermetrics.com/pricing) from September 11 to November 9, 2026 show Starter at $55 billed monthly, against $59 on November 16. We also saw a lower Starter price on some loads in October and November, as noted in our [Windsor.ai alternatives](https://precisian.io/blog/en/posts/windsor-ai-alternatives/) piece. Check the page on the day you buy.

## Is the Supermetrics MCP server included?

Not by default on the self-serve plans. The [MCP server docs](https://docs.supermetrics.com/docs/supermetrics-mcp-server) say it "is available for all users with a valid Supermetrics subscription with access to the Supermetrics API," and on the [pricing page](https://supermetrics.com/pricing) Data API access appears only under Enterprise. Starter and Growth reach Claude, ChatGPT and Copilot through the AI chats destination instead, which the docs describe as a different product. The MCP server can also create or modify campaigns; "New campaigns start in a paused state."

## How does Supermetrics compare with a managed data platform?

The seven criteria we use for every comparison, for a mid-sized retailer that wants its own AI to read its numbers. "Not stated" means the vendor's pages do not say, not that the feature is missing.

| Criterion | Supermetrics | Precisian |
|---|---|---|
| C1. Data isolated per client | Not stated. Data is not stored permanently by default; Storage is "encrypted at rest and access controlled" ([security](https://supermetrics.com/platform/data-security)) | Yes, a data lake isolated per client on Precisian's infrastructure |
| C2. Versioned metric definitions | Partial. Data Transformations on Enterprise; versioning not stated | Yes, a semantic layer with versioned definitions the client approves |
| C3. Access from the client's own AI | Yes. AI chats on every plan; MCP server with API access | Yes, MCP, API and the client's BI |
| C4. Ecommerce sources (Brazilian stack) | Partial. Shopify, Adobe Commerce (Magento 2), Amazon Seller Central listed; VTEX not on the connector list on November 16, 2026 | Yes. VTEX and Magento connectors, plus GA4, Meta Ads, Google Ads, TikTok Ads |
| C5. Who operates the data | Self-serve; modeling service not stated | Precisian's team runs collection, integrations and modeling |
| C6. Ownership and portability | Data goes to the client's destination | "The infrastructure is ours, the data is yours. You can access it at any time and, if you leave, you take all of it." |
| C7. Commercial model | Fixed-price tiers plus per-unit add-ons, public prices | Monthly subscription, no setup fee, no per-seat charge |

## When is Supermetrics the better buy?

When a person reads the number and knows where it came from. A media buyer or an agency that wants a recurring report in Sheets or Looker Studio gets there faster with Supermetrics than with anything that involves a warehouse: a 14-day trial with no credit card, and a plan under $100 a month for a small stack. It also fits teams who want an AI chat to manage campaigns, a feature the [pricing page](https://supermetrics.com/pricing) lists on every plan. Supermetrics states SOC 2 Type II and ISO 27001 on its [security page](https://supermetrics.com/platform/data-security).

If you are weighing other connectors, the side-by-side with Windsor.ai, Funnel and Improvado is in [Supermetrics alternatives for AI data access](https://precisian.io/blog/en/posts/supermetrics-alternatives-ai-data/).

## When is a managed platform the better fit?

When the reader is an AI agent, or when nobody on the team owns the definition of revenue. A connector moves fields from each platform; Facebook's purchase value and Shopify's net sales still arrive as two different numbers, and someone has to decide which one the agent quotes. That work is the argument in [build or buy a data lake](https://precisian.io/blog/en/posts/build-vs-buy-data-lake/).

Precisian is one such platform: ingestion, a data lake isolated per client on our infrastructure, a semantic layer with versioned metric definitions, and access through MCP, API or your own BI. It bills a monthly subscription with no setup fee and no per-seat charge. It is the wrong choice if you want a ready-made dashboard (we don't sell one), if you want a tool to launch campaigns, or if your company operates only in the US: Precisian serves companies in Brazil.

## What does this article not cover?

Enterprise quotes, regional or promotional prices, the price of extra AI Credits (sold in Studio or through sales, per the FAQ), subscriptions on packages sold before November 2024, which Supermetrics' [upgrade guide](https://docs.supermetrics.com/docs/how-to-add-more-features-and-upgrade-a-supermetrics-subscription) calls older packages, and the cost of the warehouse or BI tool on the receiving end.

---

If your Supermetrics estimate keeps growing one destination and one user at a time, and the real question is which revenue number your AI should trust, compare it against a subscription that includes the modeling. What Precisian includes, and what it costs, is on the [pricing page](https://precisian.io/en/pricing?utm_source=blog&utm_medium=cta&utm_campaign=supermetrics-pricing&utm_content=texto), with no contract commitment.
