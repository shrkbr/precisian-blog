---
title: "WhatsApp MCP server: what's official and what an agent shouldn't read"
description: "Meta's official WhatsApp MCP server, in beta since September 15, 2026, has 18 setup and messaging tools. None of them reads chat history."
slug: "whatsapp-mcp-server"
lang: "en"
translationKey: "whatsapp-mcp-server"
publishedAt: 2026-11-23
tags: ["mcp", "messaging", "privacy", "ai-data-access", "governance", "data-security", "prompt-injection"]
draft: false
llmSummary: "Meta's official WhatsApp MCP server is WhatsApp Business Tools MCP (mcp.facebook.com/whatsapp_business_tools), in beta since September 15, 2026. Its 18 tools manage accounts, numbers, templates and webhooks and send messages; none reads chat history (Meta docs, read November 23, 2026)."
citations: ["https://developers.facebook.com/blog/post/2026/09/15/whatsapp-business-messaging-mcp-ai-agent/", "https://developers.facebook.com/documentation/mcp/whatsapp-business-tools-mcp", "https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/overview", "https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages", "https://developers.facebook.com/documentation/business-messaging/whatsapp/data-privacy-and-security", "https://www.whatsapp.com/legal/terms-of-service", "https://www.facebook.com/legal/Meta-Terms-for-WhatsApp-Business-Platform", "https://github.com/lharries/whatsapp-mcp", "https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://en.wikipedia.org/wiki/WhatsApp", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 10
cta: demo
---
Meta has an official WhatsApp MCP server, and it can't read your chats. Meta announced WhatsApp Business Tools MCP on September 15, 2026 ([Meta for Developers blog](https://developers.facebook.com/blog/post/2026/09/15/whatsapp-business-messaging-mcp-ai-agent/)), and its documentation, updated October 29, 2026, lists 18 tools that manage accounts, phone numbers, templates and webhooks and send messages ([Meta for Developers](https://developers.facebook.com/documentation/mcp/whatsapp-business-tools-mcp), read November 23, 2026). The servers that read chat history are community projects, not Meta's.

> **WhatsApp Business Tools MCP**: a Meta-hosted Model Context Protocol server at `https://mcp.facebook.com/whatsapp_business_tools`, authenticated through OAuth with your Meta developer account, that lets an AI agent manage a WhatsApp Business Platform (Cloud API) integration. Declared status: beta, with an interface and tool set that may change.

## What does the official WhatsApp MCP server do?

It sets up and tests a business messaging integration. Every tool carries the `whatsapp_biz_` prefix and acts "as you, on the apps and businesses you administer," per the [docs](https://developers.facebook.com/documentation/mcp/whatsapp-business-tools-mcp) read November 23, 2026:

<table>
<thead><tr><th>Group</th><th>Tools</th><th>What they do</th></tr></thead>
<tbody>
<tr><td>Discovery</td><td><code>whatsapp_biz_businesses</code>, <code>whatsapp_biz_accounts</code>, <code>whatsapp_biz_phone_numbers</code></td><td>List businesses, WhatsApp accounts and phone numbers, with status</td></tr>
<tr><td>Phone numbers</td><td><code>whatsapp_biz_add_phone_number</code>, <code>whatsapp_biz_send_verification_code</code>, <code>whatsapp_biz_verify_phone_number</code>, <code>whatsapp_biz_register_phone_number</code></td><td>Add, verify by code and register a number to send and receive</td></tr>
<tr><td>Templates</td><td><code>whatsapp_biz_list_templates</code>, <code>whatsapp_biz_get_template</code>, <code>whatsapp_biz_create_template</code>, <code>whatsapp_biz_update_template</code>, <code>whatsapp_biz_delete_template</code></td><td>List, create, edit and delete message templates</td></tr>
<tr><td>Sending</td><td><code>whatsapp_biz_send_message</code></td><td>Sends free-form text (inside the customer service window only) or an approved template, and confirms the target first</td></tr>
<tr><td>Webhooks</td><td><code>whatsapp_biz_configure_webhooks</code>, <code>whatsapp_biz_subscribe_webhook</code></td><td>Set the callback URL and subscribe event fields</td></tr>
<tr><td>Account</td><td><code>whatsapp_biz_configure_payments</code>, <code>whatsapp_biz_verify_business</code>, <code>whatsapp_biz_system_user_token</code></td><td>Payment method, business verification, and a link to generate a system user token</td></tr>
</tbody>
</table>

Consent requests three scopes: `business_management`, `whatsapp_business_management` and `whatsapp_business_messaging`. Supported clients are Claude Code, Claude Desktop, ChatGPT, Codex CLI and the Codex app. The announcement says the release "is built for development and testing workflows, not production sending at scale," and the docs warn that it is rolling out gradually and may not be on your account yet.

## Why can't the official server answer what customers complained about?

A support lead at a Shopify brand that runs customer service over WhatsApp connects the official server to Claude and asks what customers complained about most this week. The agent lists businesses, numbers and templates and can't answer, because no tool returns an incoming message.

The next stop is usually GitHub. There she finds servers that do exactly what she wanted: read chats, search contacts and send messages from her own phone. The most cited one, [`lharries/whatsapp-mcp`](https://github.com/lharries/whatsapp-mcp), says in its README that it connects to "your personal WhatsApp account directly via the Whatsapp web multidevice API," using the `whatsmeow` library, after you scan a QR code. Messages sit in a local SQLite database and reach the LLM "when the agent accesses them through tools."

On a support phone, that history holds order numbers, home addresses, photos of damaged products, and the occasional card number a customer typed in anyway. Swapping the official server for an unofficial one changes whose account it is, which path the message takes, and who answers for the data.

## Why can't the official server read conversations?

Because the Cloud API pushes each message to the business's server and keeps no history for the business to query. According to the [webhooks overview](https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/overview), updated November 4, 2026, incoming messages reach the business's server through the `messages` webhook, and if the endpoint doesn't return 200, Meta retries "for up to 7 days."

On Meta's side, the [data privacy and security page](https://developers.facebook.com/documentation/business-messaging/whatsapp/data-privacy-and-security), updated June 16, 2026, says messages "have a maximum retention period of 30 days" to support features such as retransmission, and that Meta acts as a data processor on the business's behalf. If you want history, you write it to your own store when the webhook arrives.

The official MCP server manages that plumbing: numbers, templates, webhooks. History, if it exists, lives in whatever system receives the webhook: a help desk, a CRM, or your own database.

Community servers take a different route. Instead of the business API, they use the consumer app account, which keeps history on the device. That is why they can read old chats, and why the contractual picture changes.

## What do WhatsApp's terms say about automation?

I quote the official text and don't evaluate any project. Whether a specific use fits the terms is between the user and WhatsApp.

The [WhatsApp Terms of Service](https://www.whatsapp.com/legal/terms-of-service), effective January 4, 2021 (read November 23, 2026), say under "Legal And Acceptable Use" that you will not use the Services in ways that "involve any non-personal use of our Services unless otherwise authorized by us." Under "Harm To WhatsApp Or Our Users," they bar accessing or using the Services "through automated or other means" in "impermissible or unauthorized manners," and list among the examples "collect information of or about our users in any impermissible or unauthorized manner."

On the business side, the [Meta Terms for WhatsApp Business Platform](https://www.facebook.com/legal/Meta-Terms-for-WhatsApp-Business-Platform), last modified September 23, 2026, name Meta Platforms, Inc. as the contracting entity for companies located in the United States or Canada (section 1.2). Two clauses matter for AI agents:

- **4.1(b):** you may not share WhatsApp Business Platform Data, "including any anonymous, aggregate, or derived forms," with third parties, except a Solution Provider under the terms.
- **4.7:** if you retain an AI Provider as your Solution Provider, you may not let platform data be used to "create, develop, train, or improve" AI models. The exception is fine-tuning a model "for your exclusive use."

The `lharries/whatsapp-mcp` README carries its author's own caution: the server is subject to [the lethal trifecta](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/), and prompt injection "could lead to private data exfiltration." The same risk applies to any agent that reads messages from strangers and holds a send tool.

## What should an agent never read?

The message text and anything that identifies the sender. The [`messages` webhook reference](https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages), updated November 4, 2026, shows the fields that arrive with every incoming message:

<table>
<thead><tr><th>Webhook field</th><th>What it is</th><th>Does the agent need it?</th></tr></thead>
<tbody>
<tr><td><code>text.body</code> (and media)</td><td>The message content</td><td>No. It needs the classification (question, return, complaint)</td></tr>
<tr><td><code>contacts.profile.name</code></td><td>Profile name</td><td>No</td></tr>
<tr><td><code>contacts.wa_id</code>, <code>messages.from</code></td><td>Phone number</td><td>No. A pseudonymous key does the job</td></tr>
<tr><td><code>contacts.user_id</code></td><td>Business-scoped user ID (BSUID)</td><td>Only as a join key, kept out of the agent's context</td></tr>
<tr><td><code>messages.timestamp</code>, <code>type</code></td><td>Time and message type</td><td>Yes</td></tr>
</tbody>
</table>

"How many return requests did we get in October?" is answered by a count. Sending every conversation to a model to get there moves personal data into a prompt, a provider's logs and possibly a chat transcript. Whether that provider counts as a Solution Provider under clause 4.1(b), or as a third party, is the point to check with your counsel. If you sell to Brazil, the same conversations fall under the LGPD; the cross-border rules are in [LGPD and AI: where your customer's data can live](https://precisian.io/blog/en/posts/lgpd-ai-customer-data/).

## How do you check which WhatsApp MCP server you connected?

Four checks, all in your AI client or a terminal.

1. **List the tools.** In Claude Code, `/mcp` shows servers and tools. A WhatsApp tool without the `whatsapp_biz_` prefix didn't come from Meta's server.
2. **Check the address.** The official server is remote, at `https://mcp.facebook.com/whatsapp_business_tools`. A server launched by a local `command` with `uv`, `node` or `go` is something else.
3. **Remember how you logged in.** The official server uses OAuth with your Meta developer account. A QR code scanned with your phone means the server paired as a device on your consumer account.
4. **Find the file.** A server that reads history stores messages somewhere. If it is a `.db` file on someone's laptop, customer conversations sit outside every access control your company has.

## How do you fix it?

Split the two jobs, because each has its own right tool.

**To set up and test, use the official server.** Creating templates, registering numbers and pointing webhooks are what it was built for, with your developer account's scope and a confirmation step before sending.

**To analyze conversations, store the webhook and give the agent derived data, not messages.** The minimum design has three steps:

1. The webhook endpoint writes each event to a company store, with the phone number replaced by a pseudonymous key and the text kept separately under restricted access.
2. A process classifies each conversation (reason, product, whether it became an order) and stores only the label. If the chat started from a Click-to-WhatsApp ad, the `referral` object carries the [`ctwa_clid`](https://precisian.io/blog/en/posts/ctwa-clid-explained/) that ties the conversation to the click.
3. The agent queries counts and rates defined once: "conversation," "conversation that became an order," "complaint." The rule is written in a versioned [semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/), so every prompt uses the same definition.

Attributing a sale that closes inside WhatsApp has limits of its own, covered in [attributing sales that close inside WhatsApp](https://precisian.io/blog/en/posts/whatsapp-attribution-dark-funnel/). And before giving any server a send tool, run through [MCP security for marketing data](https://precisian.io/blog/en/posts/mcp-security-marketing-data/).

## When can't this be fixed?

**Conversations that never went through a webhook won't come back through the API.** If your team answers from the WhatsApp Business app on a phone, without the Cloud API, there is no event to store. Meta documents a `history` webhook that syncs Business app chat history, but only for businesses onboarded by a solution provider ([webhooks overview](https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/overview)). Otherwise the past stays on the device.

**The official server won't read conversations through configuration.** No scope or parameter in the design documented on November 23, 2026 does that, and the server is in beta. If Meta changes it, the docs are where to check.

**The AI provider you hire can't train models on conversation data.** Under clause 4.7 of the platform terms, if you retain an AI Provider as your Solution Provider, platform data may not be used to create, train or improve AI models, except to fine-tune a model for your exclusive use. The ban on sharing the data with third parties, "including any anonymous, aggregate, or derived forms," is in clause 4.1(b).

**When Precisian isn't the answer.** If you need to set up numbers and templates, Meta's server does it, and a data platform adds nothing. If you are small and the question is qualitative ("what are people asking for"), reading conversations with proper consent and care is more honest than building a pipeline. Precisian has no ready-made WhatsApp connector to announce. Its role starts when conversation metrics have to join orders, the ERP and ad spend: a lake isolated per client on Precisian's infrastructure, definitions written in the semantic layer, and access through Precisian's MCP server from the AI your team already uses.

## What doesn't this article cover?

**It isn't legal advice.** It is a dated reading of official texts. Using customer conversations with AI calls for your privacy counsel.

**It doesn't review commercial customer-messaging platforms** that offer their own MCP server on top of the Cloud API, or Meta's documentation server. I didn't read their docs for this piece.

**It doesn't show how to build the webhook endpoint.** Meta's reference covers each message type.

A note on method: the [Meta for Developers](https://developers.facebook.com/documentation/mcp/whatsapp-business-tools-mcp) pages were read on November 23, 2026 through a reader that renders the HTML, and the update dates are the ones each page displays.

---

If your team wants to ask AI what is happening in your WhatsApp inbox, decide which metric answers the question before you decide which server reads the chat. [Watch a governed MCP answer](https://precisian.io/en/demo?utm_source=blog&utm_medium=cta&utm_campaign=whatsapp-mcp-server&utm_content=texto) over an isolated lake, with no contract commitment.
