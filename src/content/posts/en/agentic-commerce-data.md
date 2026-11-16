---
title: "Agentic commerce: what your catalog and order data need before an AI agent buys from you"
description: "An AI agent buys from what your feed and API say. Price, stock and order status must agree across channels, and the sale must arrive tagged."
slug: "agentic-commerce-data"
lang: "en"
translationKey: "agentic-commerce-data"
publishedAt: 2026-11-16
tags: ["ecommerce", "ai-data-access", "mcp", "attribution", "integration", "semantic-layer"]
draft: false
llmSummary: "Agentic commerce runs on published specs: ACP (OpenAI and Stripe, Sept 29, 2025), UCP (Google, Jan 11, 2026) and AP2 (Google, Sept 16, 2025). The agent quotes your feed and settles at your checkout, so price, stock and order status must agree."
citations: ["https://github.com/agentic-commerce-protocol/agentic-commerce-protocol", "https://stripe.com/newsroom/news/stripe-openai-instant-checkout", "https://openai.com/index/powering-product-discovery-in-chatgpt/", "https://developers.openai.com/commerce/specs/file-upload/products", "https://developers.openai.com/commerce/guides/submit-product-feeds", "https://developers.openai.com/commerce/guides/accept-payments", "https://developers.googleblog.com/en/under-the-hood-universal-commerce-protocol-ucp/", "https://ucp.dev/specification/overview/", "https://ucp.dev/latest/specification/shopping/order/", "https://developers.google.com/merchant/ucp/faq", "https://support.google.com/merchants/answer/16992327", "https://ap2-protocol.org/"]
about: ["https://en.wikipedia.org/wiki/Agentic_commerce", "https://en.wikipedia.org/wiki/Agentic_AI", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
cta: demo
---
Agentic commerce is a purchase an AI agent completes on a shopper's behalf, and in the US it already runs on published specs: the Agentic Commerce Protocol from OpenAI and Stripe, released September 29, 2025 ([Stripe](https://stripe.com/newsroom/news/stripe-openai-instant-checkout)), and Google's Universal Commerce Protocol, released January 11, 2026 ([Google](https://developers.googleblog.com/en/under-the-hood-universal-commerce-protocol-ucp/)). The agent quotes your feed and settles at your checkout. When those two disagree, the shopper sees one price in the chat and another at payment.

If you sell on Shopify, you may already be in this channel without having chosen it. OpenAI's March 24, 2026 announcement says product data from Shopify merchants *"is already integrated into ChatGPT through Shopify Catalog"*, and that *"no additional work is required from individual merchants"* ([OpenAI](https://openai.com/index/powering-product-discovery-in-chatgpt/)). Whatever your Shopify catalog says is what the agent repeats to the shopper.

> **Agentic commerce** is a sale in which an AI agent discovers the product, builds the cart and completes payment by talking to the store through an API or an MCP server, without the shopper browsing the site. The store remains the merchant of record.

## Which protocols exist, and what does each one specify?

They are API contracts. None of them is a new storefront; all of them assume you keep owning checkout, inventory and the order.

| Protocol | Maintained by | Date | What it specifies | Status, Nov 16, 2026 |
|---|---|---|---|---|
| **ACP** (Agentic Commerce Protocol) | OpenAI and Stripe | Sept 29, 2025; latest stable `2026-04-17` | Checkout (`POST /checkout_sessions`, `/complete`, `/cancel`), delegated payment, feed, orders | `beta`, Apache 2.0 |
| **UCP** (Universal Commerce Protocol) | Google, with Shopify, Etsy, Wayfair, Target and Walmart | Jan 11, 2026; current spec `2026-08-25` | Profile at `/.well-known/ucp`, `dev.ucp.shopping.checkout`, `dev.ucp.shopping.order`, REST, MCP or A2A transport | Merchant Center integration rolling out gradually in the US |
| **AP2** (Agent Payments Protocol) | Google, donated to the FIDO Alliance | Sept 16, 2025; `v0.2` | Signed mandates: `Checkout Mandate` and `Payment Mandate` | Apache 2.0, standardization at FIDO |

Sources, read November 16, 2026: [ACP repository](https://github.com/agentic-commerce-protocol/agentic-commerce-protocol), [UCP specification overview](https://ucp.dev/specification/overview/), [Merchant Center](https://support.google.com/merchants/answer/16992327) and [AP2](https://ap2-protocol.org/).

On March 24, 2026, OpenAI wrote that *"the initial version of Instant Checkout did not offer the level of flexibility that we aspire to provide"* and moved to *"allowing merchants to use their own checkout experiences while we focus our efforts on product discovery"* ([OpenAI](https://openai.com/index/powering-product-discovery-in-chatgpt/)). The protocol lives on. What ChatGPT mostly does with it today is read catalogs.

## What does the agent actually read from your catalog?

The feed. OpenAI's feed schema requires nine fields per item: `item_id`, `title`, `description`, `url`, `brand`, `seller_name`, `image_url`, `availability` and `price`, plus `target_countries` and `store_country` ([OpenAI feed schema](https://developers.openai.com/commerce/specs/file-upload/products), read November 16, 2026).

In the same schema, `availability` accepts `in_stock`, `out_of_stock`, `pre_order`, `backorder` or `unknown`, and a missing value rejects the row. And `price` is a string in major units with the currency code: `79.99 USD`.

The same documentation states that *"the feed does not update a cart or confirm a purchase"* and that *"your live website or plugin still checks the current offer when a customer acts"* ([OpenAI](https://developers.openai.com/commerce/guides/submit-product-feeds)). The agent builds its recommendation from the feed and learns the truth at checkout.

## What breaks when the data isn't ready?

Three things, and you have seen each one in another channel.

**The agent recommends an item you no longer have.** The feed says `in_stock`; your OMS hit zero two hours ago. UCP puts the burden in writing: as merchant of record, the store runs the real-time inventory check and returns an `out_of_stock` error code if the item sells out mid-checkout ([Google UCP FAQ](https://developers.google.com/merchant/ucp/faq)). The agent shows an error. The sale dies inside the conversation, with no abandoned cart for you to measure.

**The price moves between the chat and the payment.** Sales tax is the classic cause in the US: Google tells merchants to exclude tax from `price` for the US and Canada and include it elsewhere, and a feed copied across markets breaks ([why your product isn't showing on Google Shopping](https://precisian.io/blog/en/posts/product-not-showing-google-shopping/)). One feed feeding several agents carries that risk several times.

**The order lands in your books with no source.** Revenue is there, the order is there, and no report says an agent sent it. It is the same gap [marketplaces already create](https://precisian.io/blog/en/posts/marketplace-attribution-blackhole/), with a new channel inside it.

## Why does it happen, mechanically?

Because one order now exists in four representations, and each protocol picked its own.

OpenAI's feed writes price as a major-unit string (`79.99 USD`). ACP's checkout writes price as an integer in minor units, *"100 cents for $1.00"* ([ACP checkout OpenAPI, `2026-04-17`](https://github.com/agentic-commerce-protocol/agentic-commerce-protocol/blob/main/spec/2026-04-17/openapi/openapi.agentic_checkout.yaml)). UCP's order also uses ISO 4217 minor units ([UCP order capability](https://ucp.dev/latest/specification/shopping/order/)). Your OMS and your Shopify reports store the amount their own way, with shipping, discounts and tax in fields none of the three protocols knows about.

Order status diverges the same way. ACP defines `created`, `confirmed`, `manual_review`, `processing`, `shipped`, `completed` and `canceled`, and has the store notify the platform by webhook with `order_create` and `order_update` events ([ACP webhooks](https://github.com/agentic-commerce-protocol/agentic-commerce-protocol/blob/main/spec/2026-04-17/openapi/openapi.agentic_checkout_webhook.yaml)). Refunds, credits, returns and disputes go in `adjustments[]`. UCP requires full order snapshots on every event, never deltas, posted to the platform's `webhook_url` ([UCP](https://ucp.dev/latest/specification/shopping/order/)). Neither knows your fulfillment states. Somebody has to write the mapping, and it has to be the same mapping everywhere.

Shopify adds a fourth definition on top. Its sales report counts gross sales minus discounts and sales reversals, plus taxes, duties, shipping and fees, while GA4 counts item revenue without tax or shipping, which is why [the two never match](https://precisian.io/blog/en/posts/shopify-ga4-revenue-mismatch/). An agent order flows into both. If the agent channel is reported from GA4 and the rest of the business from Shopify, agent revenue looks smaller than it is, every month, for reasons that have nothing to do with the agent.

Source is the third piece, and the easiest to lose. ACP has an `affiliate_attribution` field, and the spec says that attribution *"is stored alongside the resulting order but not returned in the response"* ([ACP](https://github.com/agentic-commerce-protocol/agentic-commerce-protocol/blob/main/spec/2026-04-17/openapi/openapi.agentic_checkout.yaml)). UCP identifies checkout calls with a `UCP-Agent` header, and Google warns that callers can spoof it, so it is not authentication ([UCP FAQ](https://developers.google.com/merchant/ucp/faq)). Both signals reach your server. If your order system does not write them to a field, the sale enters your books like any other.

## How do you check your own store?

Pull a sample of SKUs and run five comparisons. No protocol has to be live.

| Check | Where to look | What signals a problem |
|---|---|---|
| Feed price vs. checkout price vs. invoiced price | Feed file, cart on site, order record for the same SKU | Any gap that is not declared shipping or tax |
| Feed availability vs. sellable inventory | Feed `availability`, OMS balance at the same timestamp | `in_stock` with zero sellable units, or the reverse |
| OMS status vs. protocol vocabulary | Your order statuses against ACP's seven | A status with no match, or two of yours collapsing into one |
| Order source | Order record in your OMS or warehouse | No field able to hold "channel = agent" plus the platform ID |
| Amount unit | The integration that writes the order | Cents read as dollars, or the reverse |

The fourth row decides whether the channel exists in your numbers at all. Anyone who sells on Amazon and on their own site has met the version of this with no fix. With an agent, the signal at least reaches your API.

## How do you fix it?

Write the definitions before the first order.

**One definition of current price.** Which OMS field becomes the feed price, with or without tax, under which promotion, converted to which format. One rule, applied to every feed that leaves the store.

**One definition of sellable inventory.** On hand minus reserved minus what is committed to marketplaces, refreshed as often as you send the feed. OpenAI takes full snapshots by upload, hosted URL or SFTP ([OpenAI](https://developers.openai.com/commerce/guides/submit-product-feeds)). A daily snapshot means the agent's stock can be up to a day stale.

**One status mapping.** Your fulfillment states against ACP's seven and UCP's equivalent, versioned, with an owner.

**One source field on the order.** "Channel = agent", which platform, which protocol, written when the order is created from `affiliate_attribution` or `UCP-Agent`. Without it, no later analysis can split agent sales from site sales.

In my view those four definitions are the job of a [semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/): rules written where an analyst and an AI read before they compute. That is what Precisian delivers. Each client gets an isolated data lake on Precisian's infrastructure, the semantic layer holds these definitions, and the client's own AI, BI or automation queries them over MCP, API or a direct connection. The design choice is the one behind [exposing questions instead of tables over MCP](https://precisian.io/blog/en/posts/mcp-for-ecommerce-analytics/).

## When can't it be fixed?

In four cases, and two are outside your control.

**When the agent buys by browsing, not through the API.** OpenAI documents ChatGPT using a cloud browser on your site, through your normal checkout, with ChatGPT Wallet as one way to pay ([OpenAI](https://developers.openai.com/commerce/guides/accept-payments)). That path carries no `affiliate_attribution`. OpenAI relays some user signals in a `Forwarded` header, which it describes as rolling out for risk systems. If nothing on the order marks the source, the sale is indistinguishable from a normal session, and nothing downstream recovers what was never written.

**When the sale happens on a marketplace.** If the agent buys your product on Amazon, the source stays with Amazon. Your warehouse receives the order without the channel.

**When the protocol changes under you.** ACP is labeled `beta` and has shipped five dated versions since September 2025 ([ACP](https://github.com/agentic-commerce-protocol/agentic-commerce-protocol)). Instant Checkout itself was pulled back in March 2026. Anything you hard-code to one version will be rewritten.

**When your market isn't covered.** OpenAI's standard feed upload *"currently targets the US"* ([OpenAI](https://developers.openai.com/commerce/specs/file-upload/products)), and Merchant Center's UCP onboarding is US-only, with Australia and Canada *"to follow next year"* ([Google](https://support.google.com/merchants/answer/16992327)).

And there is the case where Precisian is the wrong answer: a single-channel Shopify store whose catalog already lives in Shopify Catalog needs feed hygiene and a source field, which your own team can add without a data platform.

## What does this article not cover?

It does not explain how to implement ACP or UCP checkout; the specs linked above are the source. It does not compare fees, because OpenAI's changed when Instant Checkout was pulled back and I found no current published table. It does not cover identity linking (`dev.ucp.common.identity_linking`) or bot authentication.

It makes no market-size forecast. Almost every agentic commerce number in circulation comes from consultancies or from vendors selling the integration, and none I found publishes its method.

If you want your store ready before agent orders show up in volume, the first check is whether feed price, checkout price and invoiced price are the same number across a hundred SKUs. [Watch a governed MCP answer](https://precisian.io/en/demo?utm_source=blog&utm_medium=cta&utm_campaign=agentic-commerce-data&utm_content=texto) over an isolated lake, with no contract commitment.
