---
title: "Shopify's MCP servers are built for shopping, not for revenue questions"
description: "Shopify's official MCP servers act for buyers, customers and developers. None answers a merchant's margin-by-channel question; community servers fill that gap."
slug: "shopify-mcp-servers-explained"
lang: "en"
translationKey: "commerce-platform-mcp"
publishedAt: 2026-10-14
tags: ["mcp", "ecommerce", "ai-data-access", "data-discrepancy", "security", "semantic-layer"]
draft: false
llmSummary: "As of Oct 14, 2026, Shopify's official MCP servers (Catalog, Cart, Checkout, Order, Customer Accounts, Dev MCP) serve buyer agents, logged-in customers and developers. None exposes merchant sales analytics; that lives in the Admin API's shopifyqlQuery, reached only by community servers."
citations: ["https://shopify.dev/docs/agents", "https://shopify.dev/docs/apps/build/storefront-mcp", "https://shopify.dev/docs/apps/build/customer-accounts-mcp", "https://shopify.dev/docs/apps/build/ai-toolkit", "https://shopify.dev/docs/apps/build/sidekick", "https://shopify.dev/docs/api/admin-graphql/latest/queries/shopifyqlQuery", "https://shopify.dev/docs/api/usage/access-scopes", "https://github.com/GeLi2001/shopify-mcp", "https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/report-types/default-reports/sales-report"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://en.wikipedia.org/wiki/Shopify", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

Shopify publishes several official MCP servers, and every one of them works for someone other than the merchant asking about revenue. Its agentic commerce servers exist to "act on behalf of buyers" ([Shopify, checked Oct 14, 2026](https://shopify.dev/docs/agents)); Customer Accounts MCP serves a logged-in shopper checking an order; Dev MCP serves a developer reading docs. The query that answers "what did Google Ads return in margin last month" lives in the Admin API, and only community servers wire it to an AI assistant.

> **Shopify MCP server**: an MCP endpoint that gives an AI assistant tools over some slice of Shopify. Which slice, and on whose behalf, is the whole question. Shopify's official servers cover product discovery, carts, checkout, order status for a buyer, and developer documentation.

## What do people expect when they search "shopify mcp"?

Usually this: connect Claude or ChatGPT to the store, then ask "which channel drove the most profit in September, net of returns?" in plain English.

What they get depends on which server they install, and the first results mix three different things. Shopify's buyer-side servers, which answer "find me a waterproof rain jacket in a medium" for a shopping agent. Shopify's developer server, which explains the GraphQL schema instead of querying it. And community servers that connect to the Admin API with a store token, often with write access the merchant never meant to grant.

All three show up as "Shopify MCP," and none of the official pages is written for a merchant who wants analytics.

## Which official Shopify MCP servers exist, and who are they for?

Here is what [shopify.dev](https://shopify.dev/docs/agents) documents, checked on October 14, 2026.

| Server | Built for | What it can see | Answers merchant revenue questions? |
|---|---|---|---|
| Global Catalog | Shopping agents | Products across Shopify merchants | No |
| Storefront Catalog | Shopping agents | One store's products | No |
| Cart MCP | Shopping agents | The cart being built | No |
| Checkout MCP | Trusted shopping agents | The checkout being completed | No |
| Order MCP (`get_order`) | Shopping agents | The state of an order the agent placed | No |
| Customer Accounts MCP | A logged-in customer | That customer's own orders and account | No |
| Dev MCP | Developers | Docs and API schemas, run locally | No |

Sources: [Shopify agents docs](https://shopify.dev/docs/agents), [Storefront MCP](https://shopify.dev/docs/apps/build/storefront-mcp), [Customer Accounts MCP](https://shopify.dev/docs/apps/build/customer-accounts-mcp) and [Shopify AI Toolkit](https://shopify.dev/docs/apps/build/ai-toolkit).

**The buyer side.** Shopify describes Global Catalog as a way to "search products across every Shopify merchant from a single endpoint," and Checkout MCP as the step that will "convert carts into checkouts and complete purchases for trusted agents" ([Shopify](https://shopify.dev/docs/agents)). These servers implement the Universal Commerce Protocol. The older per-store Storefront MCP endpoint lost its catalog and cart tools, which moved to `/api/ucp/mcp`; only `search_shop_policies_and_faqs` stays on the old path ([Shopify](https://shopify.dev/docs/apps/build/storefront-mcp)).

**The customer side.** Customer Accounts MCP handles "authenticated customer requests, such as checking order status," through OAuth with PKCE, and the store needs a custom domain ([Shopify](https://shopify.dev/docs/apps/build/customer-accounts-mcp)). A shopper sees their own orders. A merchant sees nothing new.

**The developer side.** Dev MCP "runs locally and doesn't require authentication" ([Shopify](https://shopify.dev/docs/apps/build/ai-toolkit)). It helps someone write a query. It does not run one against your store.

## What about Sidekick?

Sidekick is "the AI assistant built into Shopify," and apps can feed it data through app extensions ([Shopify](https://shopify.dev/docs/apps/build/sidekick)). It is a merchant tool, and it answers inside the Shopify admin. The documentation does not describe it as an MCP server that Claude or ChatGPT can connect to, so it does not solve the "ask my own assistant" use case. I found secondary sources claiming otherwise and none on shopify.dev.

## Where do the revenue numbers actually live?

In the Admin GraphQL API, behind two scopes most people have not heard of.

`shopifyqlQuery` "executes a ShopifyQL query to analyze store data and returns results in a tabular format," with examples such as `FROM sales SHOW total_sales TIMESERIES month SINCE -12m` ([Shopify](https://shopify.dev/docs/api/admin-graphql/latest/queries/shopifyqlQuery)). It requires the `read_reports` scope and Level 2 protected customer data access.

Raw orders are narrower than people assume. The `read_orders` scope covers "orders created within the last 60 days"; anything older needs `read_all_orders`, which requires Shopify's approval ([Shopify](https://shopify.dev/docs/api/usage/access-scopes)). An agent asked for year-over-year growth through `read_orders` alone gets two months of data and no warning.

No official Shopify MCP server exposes either of these to an outside assistant. That is the gap community servers fill.

## What does a community Shopify MCP server actually grant?

More than the question needs, typically.

Take one of the most visible open-source options, [GeLi2001/shopify-mcp](https://github.com/GeLi2001/shopify-mcp), with 237 GitHub stars when I checked. It exposes 31 tools: 8 read, 23 write. The write set includes `order-cancel`, which its README marks as irreversible, plus `refund-create`, `delete-product` and `delete-customer`. It asks for `write_orders`, `write_products` and `write_customers`. None of its read tools calls `shopifyqlQuery`, so it lists orders but does not run sales reports.

The project was built for store management and says so. The trouble is the install pattern: someone wants analytics, installs a management server, and hands a language model a token that can refund orders. The model, not the merchant, decides which tool to call, and the MCP spec tells clients to treat tool annotations as untrusted ([why your tool surface is the boundary](https://precisian.io/blog/en/posts/mcp-for-ecommerce-analytics/)). Add a product review or order note carrying an embedded instruction, and you have the [prompt injection scenario](https://precisian.io/blog/en/posts/prompt-injection-marketing-data/) with a write token attached.

## Why can't even a read-only Shopify server answer margin by channel?

Because the answer needs data Shopify does not hold and a definition Shopify does not choose for you.

Shopify defines total sales as "gross sales − discounts − sales reversals + taxes + duties + shipping charges + fees" ([Shopify Help Center](https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/report-types/default-reports/sales-report)). That is a defensible number with tax and shipping inside it, which finance will strip out and GA4 already excludes, the subject of [why Shopify and GA4 revenue never match](https://precisian.io/blog/en/posts/shopify-ga4-revenue-mismatch/).

Ad cost lives in Google Ads and Meta. The [Google Ads MCP server](https://precisian.io/blog/en/posts/google-ads-mcp-what-it-sees/) returns what Google logged as a conversion, dated by click. Amazon orders live in Seller Central unless a channel app pushes them into Shopify. Connect Shopify, Google Ads and Meta to the same assistant and ask for margin by channel, and the model will join three numbers with different dates, windows and definitions, then answer at its usual confidence, which is how [metric hallucination](https://precisian.io/blog/en/posts/metric-hallucination/) happens.

## How do you diagnose what your assistant is reading?

Five checks, in order.

1. **List the tools.** Ask your MCP client for the server's `tools/list`. If nothing returns orders or reports, it reads docs or acts for buyers.
2. **Check the publisher.** Official Shopify endpoints are documented on shopify.dev. A package named "shopify-mcp" on npm or GitHub is third-party unless Shopify says otherwise.
3. **Read the scopes on the token.** In the app's configuration, look for any `write_` scope. For analytics you need `read_reports`, and maybe `read_orders`. Anything else is surplus.
4. **Ask a question you already know.** Pick a closed month and compare the assistant's total sales with Shopify's sales report and with your bank deposits or ERP. A gap with Shopify is a tool bug. A gap with the ERP is definition.
5. **Ask what it summed.** Request the date field, the order status filter, and whether tax and shipping are included. An assistant that cannot say has produced an unauditable number.

## How do you fix it?

Cheapest first.

**Use each official server for its job.** If you are building a shopping agent, the UCP servers are the right tools. If you are writing an app, Dev MCP saves time. Neither belongs in an analytics setup.

**Build a read-only custom app.** If you must connect the Admin API to an assistant, create an app with `read_reports` and nothing with `write_` in it, and point a server at that token.

**Move the business rule out of the model.** Margin by channel needs Shopify sales, ad spend, returns and product cost in one place, with revenue defined once. Expose that answer as a closed tool rather than raw tables, and keep the definition in a [semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/) that both analysts and agents read before computing.

## When can't this be fixed?

Three situations, and a better MCP server helps with none of them.

**When the sale never touched a system.** A wholesale order closed by email and invoiced in QuickBooks, a pop-up event run on a separate POS, a return handled by support in a spreadsheet. No server reads what nobody recorded.

**When the business has not agreed on revenue.** If marketing reports gross sales and finance reports net of returns and shipping, the agent will pick one and the person asking will not know which.

**When the store is simple.** A single Shopify store with one ad channel and no marketplace can live well with Shopify's own reports, a read-only token and a monthly check against deposits. A managed data lake with a semantic layer, which is what Precisian runs, costs more than that question is worth. The math changes with the second sales channel, the third ad platform, and the first board meeting where two people bring different revenue numbers.

## What does this article not cover?

It does not review community Shopify MCP servers one by one; they change weekly and none carries Shopify's guarantee. It does not cover Shopify Plus-only features or Shopify's own analytics roadmap. If Shopify ships an official merchant analytics MCP server after the check date above, the table goes stale and this piece will be updated. The Brazilian-platform version of this question, covering VTEX and Nuvemshop, is [a separate article](https://precisian.io/blog/pt-BR/posts/mcp-de-plataforma-de-ecommerce/) (in Portuguese).

---

If your assistant reports revenue and nobody can say which date, which status, and whether tax and shipping are in it, the first step is measuring the gap between that number and your books for one closed month. [See how that works in practice](https://precisian.io/en/demo): no contract commitment, and no promise of an answer in 30 minutes either.
