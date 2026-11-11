---
title: "Stripe MCP server: letting an AI agent read revenue without letting it refund"
description: "Stripe's MCP server puts every API read and write behind two tools. A read-only agent API key is what keeps stripe_api_write from refunding anything."
slug: "stripe-mcp-server"
lang: "en"
translationKey: "stripe-mcp-server"
publishedAt: 2026-11-11
tags: ["mcp", "ai-data-access", "security", "governance", "data-discrepancy", "ecommerce"]
draft: false
llmSummary: "Stripe's MCP server (mcp.stripe.com) reads any Stripe GET method through stripe_api_read and writes through stripe_api_write. From December 2026 it accepts only OAuth or agent-tagged restricted keys, whose Read/Write/None permissions decide what an agent can do (Stripe docs, November 11, 2026)."
citations: ["https://docs.stripe.com/mcp", "https://docs.stripe.com/keys", "https://docs.stripe.com/keys/restricted-api-keys", "https://docs.stripe.com/api/balance_transactions/object", "https://docs.stripe.com/reports/reporting-categories", "https://github.com/stripe/ai"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://en.wikipedia.org/wiki/Stripe%2C_Inc.", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
cta: demo
---
Stripe's official MCP server can refund a charge as easily as it can list one, so the only reliable way to give an AI agent read-only access is a key that can't write. The server at `https://mcp.stripe.com` routes every Stripe `GET` method through one tool, `stripe_api_read`, and every `POST`, `PATCH`, `PUT` and `DELETE` through another, `stripe_api_write` ([Stripe MCP docs](https://docs.stripe.com/mcp), read November 11, 2026). A restricted key set to **Read** decides which of the two works, and Stripe is making that key mandatory: from December 2026, the server stops accepting full-access secret keys.

> **Stripe MCP server**: Stripe's hosted implementation of the Model Context Protocol, at `https://mcp.stripe.com`, that lets an AI client search Stripe's API and documentation and call Stripe API methods, authenticated by OAuth or by an agent API key sent as a bearer token.

## What does the problem look like?

You connect Claude or Cursor to Stripe to answer finance questions: what did we collect in October, how many subscriptions churned, which disputes are open. The OAuth screen asks for permissions, you click through, and the agent starts answering. Two things are now true that nobody wrote down.

The same session that reads charges can, in principle, create a refund, cancel a subscription, void an invoice or update a dispute. Those are all methods the docs list under `stripe_api_write`.

And the number it calls "revenue" is whatever it summed. Ask for October revenue and you might get the gross of all charges, in cents, in three currencies, before refunds and fees. It will look precise. It won't match the number your Shopify admin shows, or the one your accountant books.

## What does the official server expose?

The tool list is short, because most of the API sits behind two generic tools. From the [tools table](https://docs.stripe.com/mcp), checked November 11, 2026:

| Tool | What it does | Reads or writes |
|---|---|---|
| `stripe_api_search` | Search Stripe API methods by keyword | neither |
| `stripe_api_details` | Parameter details for one API method | neither |
| `stripe_api_read` | Calls any Stripe API `GET` method | reads |
| `stripe_api_write` | Calls any `POST`, `PATCH`, `PUT` or `DELETE` method | writes |
| `get_stripe_account_info` | Retrieves the account | reads |
| `stripe_analytics` | (Preview) Finds metrics and reports, builds SQL from natural language | reads |
| `search_stripe_documentation` | Searches the docs | neither |
| `send_money`, `transfer_money`, `convert_currency` | Treasury actions (public preview) | writes, with human confirmation |

The supported-methods list under `stripe_api_write` includes creating refunds, cancelling subscriptions, voiding invoices, marking invoices uncollectible, updating disputes, and creating coupons, prices and payment links.

The old local package is gone. The `stripe/ai` repository marks `@stripe/mcp` and `@stripe/agent-toolkit` as deprecated and says they "will receive no further updates, including security fixes" ([GitHub](https://github.com/stripe/ai)). If a teammate set up Stripe MCP with `npx` last year, that is the first thing to replace.

## Why can't the tool list protect you?

Because `stripe_api_write` covers every write method the server supports, and Stripe says so: "creating a refund uses `stripe_api_write`, which also supports other actions that don't use this confirmation flow. Confirmation depends on the action, not only the tool name."

Stripe does add a guard for some actions. In the supported-methods list, **Create refund** carries a **Human confirmation** badge, as do the Treasury money movements. The agent hands you a URL, you approve in the Dashboard, and Stripe returns an approval token; unapproved requests expire after 24 hours. That is a real control, but it covers specific actions. Cancelling a subscription or voiding an invoice carries no such badge in the list. Your MCP client's own tool-approval prompt helps, yet it shows `stripe_api_write`, the same name for a refund and for a coupon.

The credential is what bounds the agent. Stripe's restricted API keys set each resource to **None**, **Read** or **Write**, and "Write permissions include Read permissions" ([restricted keys](https://docs.stripe.com/keys/restricted-api-keys)). The HTTP mapping is direct: `GET` needs read, `POST` and `DELETE` need write. A key with only read permission on Charges, Refunds and Balance Transactions can call `stripe_api_read` all day; a `stripe_api_write` call to the refunds endpoint fails on permissions.

Stripe's MCP page also sets a deadline: "Starting in December, Stripe MCP will stop accepting full-access secret keys and restricted API keys without the Agent tag." Requests with those keys get a `401` with an OAuth discovery challenge. Agent keys are restricted keys created with the option **Authorize agent access to your account**, and Stripe automatically applies [approval rules](https://docs.stripe.com/keys) to them, with defaults that cover payouts, refunds and account-settings changes. If your current setup passes an `sk_live_` key, it stops working after November 30, 2026.

## Why isn't the number it reads your revenue?

Even with a perfect read-only key, the data has its own traps. They're all in the [Balance Transaction object](https://docs.stripe.com/api/balance_transactions/object):

- **Units.** `amount`, `fee` and `net` are integers "in the smallest currency unit". A $1,234.00 charge arrives as `123400`. Agents misplace that decimal often enough that it belongs in the system prompt.
- **Gross versus net.** `amount` is gross; `net` is `amount` minus `fee`. Summing charges gives what customers paid, not what landed in your balance.
- **Currency.** When money converts, `exchange_rate` links the presentment amount to the settlement amount. A list of charges in EUR, GBP and USD added together is not a number.
- **Refunds, disputes and partial captures.** `reporting_category` groups `charge` and `payment` into `charge`, and `refund` and `payment_refund` into `refund`. It also splits `type=adjustment` into disputes, dispute reversals and failed refunds, and labels the uncaptured remainder of a partial capture `partial_capture_reversal` ([reporting categories](https://docs.stripe.com/reports/reporting-categories)). An agent that filters only on `type=charge` misses card-free payments and every dispute.
- **Time.** `created` is when the transaction happened; `available_on` is when the funds clear. October by one is not October by the other.

And the boundary: Stripe only sees payments it processed. Orders paid through PayPal, Amazon Pay or another processor, or a wholesale invoice paid by ACH outside Stripe never appear. The question "what did we sell?" usually spans more than one system, which is why [marketing and finance never close the same revenue number](https://precisian.io/blog/en/posts/marketing-finance-revenue-definition/).

## How do you check what your agent can do and read?

| Check | Where to look | What signals a problem |
|---|---|---|
| Authentication type | The MCP client config (`.mcp.json`, Codex `config.toml`) | An `sk_live_` or untagged `rk_live_` key: rejected from December 2026 and broader than needed |
| Key permissions | Dashboard › API keys › the agent key › Edit | **Write** on Refunds, Subscriptions, Invoices or Disputes for an analysis agent |
| Who can connect | Dashboard › Settings › MCP and CLI access | MCP enabled for live mode when only the sandbox was meant to be used |
| Open sessions | User settings › OAuth sessions; Team and security for admins | Sessions from clients nobody recognizes |
| What it actually called | Workbench › MCP tool call logs; the key's request logs | Any `POST` from a key meant for reading |
| Revenue definition | Ask the agent which field and filter it used | `amount` summed without `reporting_category`, currency or refunds |

Sources: [Stripe MCP](https://docs.stripe.com/mcp), [API keys](https://docs.stripe.com/keys), [restricted keys](https://docs.stripe.com/keys/restricted-api-keys).

Then run the tie-out: October `net` from balance transactions grouped by `reporting_category` and `currency`, against October net sales in your store admin. Expect a gap, and write down its parts.

## How do you set it up for reading only?

**1. Create an agent API key in a sandbox first.** Start with every permission at **None**, then grant **Read** only on what the questions need: typically Charges, Refunds, Disputes, Balance Transactions, Invoices, Subscriptions and Customers. Stripe's own migration advice is to test in a sandbox, read the request logs for `403` errors, and add only the permissions that failed.

**2. Replicate it in live mode and attach an access policy.** Stripe recommends access policies on every live key, restricting it by IP range or by ASN and country.

**3. Keep human confirmation as a second layer, not the first.** Leave the client's tool-approval setting on. Stripe asks you to "exercise caution when using the Stripe MCP with other servers to avoid prompt injection attacks"; a read-only key turns a successful injection into a data-exposure problem instead of a money-movement one.

**4. Put the definition in writing.** Tell the agent what "revenue" means: net or gross, which `reporting_category` values, which currency conversion, which date field. Better still, define it once outside the chat. For warehouse-side queries generated by tools like `stripe_analytics`, the cost side is covered in [query cost guardrails](https://precisian.io/blog/en/posts/query-cost-guardrails/).

**5. Log it in your inventory.** One row per key: owner, permissions, expiry, client. The seven-column version is in [building the agent and MCP permission inventory](https://precisian.io/blog/en/posts/ai-agent-mcp-permissions-inventory/).

## When can't it be fixed?

**When the person connecting needs write access for their own job.** With OAuth, the agent acts as you. If your Dashboard role can issue refunds, the session can attempt them, and only per-action confirmation stands in the way. For analysis, use a separate agent key rather than a support lead's login.

**When the data you need was never in Stripe's objects.** Product margin, shipping cost and the marketing channel that drove the order live in your store, your 3PL and your ad accounts. A read-only key makes the agent safe; it doesn't make Stripe complete. Metadata fields can carry an order ID across, but only if your checkout wrote it there at payment time.

**When the agent works across connected accounts with OAuth.** Stripe states that "MCP doesn't support OAuth when acting on behalf of connected accounts"; platforms need an agent key with connected-account permissions and the `Stripe-Account` header.

**When the question is bigger than Stripe.** A round-number example, synthetic, for a US Shopify brand that takes Stripe on its headless checkout and PayPal on the rest:

| Reading | Value | In Stripe? |
|---|---|---|
| Gross charges, October | $500,000 | yes |
| Refunds and lost disputes | − $35,000 | yes |
| Stripe fees | − $15,000 | yes |
| PayPal orders | $120,000 | no |
| Amazon orders | $80,000 | no |

The agent answers $500,000 or $450,000 depending on what it summed, and the business sold more than either. The numbers are illustrative.

That last case is where Precisian fits. It keeps payments, store, marketplace and media data in a data lake isolated per customer, on Precisian's infrastructure, with the revenue definition written once in a semantic layer and served to the AI you already use through its own governed MCP, plus API and BI. If every sale you make runs through Stripe and your questions stop at Stripe, a read-only agent key on the official server is the right setup, and you don't need a data platform for it. The broader picture of what an MCP server should expose is in [what is an MCP server](https://precisian.io/blog/en/posts/what-is-an-mcp-server/).

## What does this article not cover?

It isn't an installation guide; the client commands for Claude Code, Codex, Cursor and VS Code are on [Stripe's MCP page](https://docs.stripe.com/mcp) and change often. It doesn't cover Stripe Atlas or Treasury flows beyond noting their confirmation step, and it doesn't detail `stripe_analytics`, which is in preview.

---

If your agent reports Stripe "revenue" and nobody can say whether it's gross, net, or in cents, the first step is the tie-out by `reporting_category` and currency against your store's net sales. [Watch a governed MCP answer](https://precisian.io/en/demo?utm_source=blog&utm_medium=cta&utm_campaign=stripe-mcp-server&utm_content=texto) over an isolated lake, with no contract commitment.
