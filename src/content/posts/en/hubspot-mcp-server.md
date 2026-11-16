---
title: "HubSpot MCP server: what an AI agent can read from your CRM, and what it shouldn't"
description: "HubSpot's remote MCP server, GA since April 13, 2026, gives an agent the connected user's CRM access, including writes, conversations and email activity."
slug: "hubspot-mcp-server"
lang: "en"
translationKey: "hubspot-mcp-server"
publishedAt: 2026-11-16
tags: ["mcp", "ai-data-access", "governance", "privacy", "data-discrepancy", "security"]
draft: false
llmSummary: "HubSpot's remote MCP server at mcp.hubspot.com became generally available on April 13, 2026. It runs with the connected user's HubSpot permissions, reads CRM records, activities and inbox conversations, and can write records after user confirmation (HubSpot developer docs, read November 16, 2026)."
citations: ["https://developers.hubspot.com/changelog/remote-hubspot-mcp-server-is-now-generally-available", "https://developers.hubspot.com/docs/apps/developer-platform/build-apps/integrate-with-the-remote-hubspot-mcp-server", "https://developers.hubspot.com/docs/build-with-ai/remote-mcp-server", "https://developers.hubspot.com/docs/api-reference/latest/crm/search-the-crm", "https://developers.hubspot.com/docs/api-reference/latest/crm/properties/sensitive-data", "https://developers.hubspot.com/docs/api-reference/latest/crm/objects/deals/guide", "https://knowledge.hubspot.com/properties/restrict-view-edit-access-for-properties", "https://knowledge.hubspot.com/properties/hubspots-default-deal-properties", "https://www.npmjs.com/package/@hubspot/mcp-server"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://en.wikipedia.org/wiki/HubSpot", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
cta: demo
---
HubSpot's official MCP server lets an AI agent read and change whatever the HubSpot user who connected it can read and change. The remote server at `https://mcp.hubspot.com` became generally available on April 13, 2026, for all HubSpot accounts, and that release added write access to contacts, companies, deals, tickets and activities ([HubSpot Developer Changelog](https://developers.hubspot.com/changelog/remote-hubspot-mcp-server-is-now-generally-available)). The docs state that "all actions respect your existing HubSpot user permissions" ([integration guide](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/integrate-with-the-remote-hubspot-mcp-server), read November 16, 2026). Which user connects decides what the agent can reach.

> **HubSpot MCP server**: a HubSpot-hosted endpoint, `https://mcp.hubspot.com`, that exposes CRM, activity, content, email and social data as Model Context Protocol tools. Clients authenticate through an MCP connector with OAuth and PKCE, and HubSpot's own AI connectors for Claude, ChatGPT, Gemini and Microsoft Copilot run on it ([Using the HubSpot MCP server](https://developers.hubspot.com/docs/build-with-ai/remote-mcp-server)).

## What does the problem look like from a RevOps desk?

A RevOps manager at a Shopify brand that also sells wholesale connects Claude to HubSpot with her own login, because that is how the connector works. She asks for "revenue from wholesale accounts last quarter" and gets a clean number. Three things go wrong after that, and none of them throws an error.

- **The agent read more than the question needed.** Her user can open every contact, every logged email and every chat thread, so the agent can too. Ask it to "summarize what our top accounts complained about" and it quotes names, phone numbers and message text into a chat transcript that lives outside HubSpot.
- **The number is pipeline, not revenue.** The agent summed `amount` on deals in a won stage. Finance closes the quarter from invoices in QuickBooks or NetSuite, after credits and short shipments.
- **The same chat can write.** Since the April release, the connection that answers questions can also create and update deals, contacts and tasks, and the content tools can publish landing pages and blog posts.

## What does the official server expose?

HubSpot lists read access to CRM records (contacts, companies, deals, tickets, leads, users, appointments, custom objects and segments), activities (calls, emails, meetings, notes and tasks), marketing content and analytics, marketing email statistics with "per-contact delivery and engagement details", social posts, and inbox conversations from "live chat, team email, WhatsApp, SMS, Facebook Messenger, and custom channels" ([integration guide](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/integrate-with-the-remote-hubspot-mcp-server), read November 16, 2026). Revenue objects such as invoices, orders, line items, quotes and subscriptions are readable in beta.

The tools that matter most for a data question, as documented on the same page:

| Tool | What it does | Documented limit or condition |
|---|---|---|
| `get_user_details` | Returns the user, account and per-object read and write access | Run it first; the docs recommend it to check availability |
| `search_crm_objects` | Filters CRM records with filter groups, text and sorting | Five filter groups, six filters each, 200 results per page |
| `get_crm_objects` | Fetches records by ID | 100 IDs per request |
| `query_crm_data` | SQL with HubSpot extensions, aggregation and sorting | No joins, subqueries, association traversal or currency conversion |
| `search_conversations` | Searches inbox messages by record, time range or keyword | Restricted inboxes stay restricted to their users |
| `get_marketing_email_analytics` | Aggregate email stats and per-contact delivery details | Date range of sends |
| `get_campaign_attribution_reports` | Revenue and deal attribution for campaigns | "Scoped to closed-won deal attribution only" |
| `manage_crm_objects` | Creates or updates records and activities | Shows a proposed-changes summary and requires user confirmation |

Source for every row: [Integrate AI tools with the HubSpot MCP server](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/integrate-with-the-remote-hubspot-mcp-server), read November 16, 2026.

One older package confuses search results. `@hubspot/mcp-server` on npm is a local server authenticated with a private app access token; its README still says it "is in beta and subject to the Early Adopter Program terms", and its latest version, 0.4.0, was published on June 18, 2025 ([npm](https://www.npmjs.com/package/@hubspot/mcp-server)). There is also a separate developer MCP server for building apps and CMS assets. For CRM data, the remote server is the current path.

## Why does the agent see what it sees?

Because HubSpot built the MCP layer on top of the user's existing permissions, not on a separate policy. You don't pick scopes when you create the connector: "available scopes are automatically determined" by the tools on the server at install time and by what the user grants during installation. When HubSpot adds tools, existing installs must reconnect to receive the new scopes. Five consequences follow.

**Read scope equals the human's read scope.** The docs describe no MCP-only field policy. If a RevOps user can see a contact's email, mobile number and notes, `search_crm_objects` can return them. HubSpot's Enterprise property restrictions don't close this gap on their own: the knowledge base says "it's not recommended to use property restrictions as a security measure" ([Restrict view and edit access for properties](https://knowledge.hubspot.com/properties/restrict-view-edit-access-for-properties), read November 16, 2026). The reliable lever is the user, team and object access of whoever connects.

**Conversations are in reach.** Inbox threads from WhatsApp, SMS and live chat carry what customers typed, including order numbers, addresses and complaints. The integration guide notes that help desk conversations "are visible to all users". If the account has Sensitive Data turned on, conversation data is blocked from the MCP server, a restriction that "does not apply to the standard CRM APIs" ([integration guide](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/integrate-with-the-remote-hubspot-mcp-server)). Sensitive Data properties exist only in Enterprise accounts ([Sensitive Data docs](https://developers.hubspot.com/docs/api-reference/latest/crm/properties/sensitive-data)). The April changelog phrased that block as covering activity objects; the current guide says conversation data. Check `get_user_details` on your own account rather than trusting either wording.

**Free text is an input to the model.** Chat messages, logged emails and form comments were written by people outside your company. When an agent reads them, a sentence written to look like an instruction gets read too. The mechanics are in [prompt injection through marketing data](https://precisian.io/blog/en/posts/prompt-injection-marketing-data/).

**Volume is capped by the search API, not by intent.** The server is built on the CRM search API, which allows five requests per second per account and stops at 10,000 total results for any query ([Search the CRM](https://developers.hubspot.com/docs/api-reference/latest/crm/search-the-crm), read November 16, 2026). A loose question can still pull thousands of contact rows into a model's context before anyone notices.

**Why the CRM number isn't revenue.** A HubSpot deal stores a forecast. The deals API names `amount`, `closedate`, `pipeline` and `dealstage` ([Deals guide](https://developers.hubspot.com/docs/api-reference/latest/crm/objects/deals/guide)). HubSpot's own property list defines Amount as "the total value of the deal in the deal's currency" and Close date as "the day the deal is expected to close, or was closed" ([default deal properties](https://knowledge.hubspot.com/properties/hubspots-default-deal-properties)). None of those fields records a payment, a refund or a credit memo. And because `query_crm_data` can't convert currency, a sum across deals in dollars and Canadian dollars returns a number in no currency at all.

## How do you check what your agent can reach?

Six checks, all doable by a HubSpot admin in an afternoon.

| Check | Where to look | What signals a problem |
|---|---|---|
| Who connected | Development › MCP Connectors | A Super Admin or a sales leader connected the agent for analysis work |
| Tools and objects available | Run `get_user_details` in the client | Write access on deals or contacts for a reporting use case |
| Inbox exposure | Inbox and help desk access settings for the connecting user | Help desk or WhatsApp threads readable by an analysis user |
| Sensitive Data status | Account security settings, Enterprise only | Off, while conversations carry order or health details |
| Content write tools | Client tool list: `manage_landing_page`, `manage_blog_post`, `manage_social_posts` | Publishing tools enabled in a chat meant for questions |
| The revenue field | Ask for last quarter's won total and note which property it summed | `amount` on won deals reported as "revenue" |

Sources: [integration guide](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/integrate-with-the-remote-hubspot-mcp-server), [Using the HubSpot MCP server](https://developers.hubspot.com/docs/build-with-ai/remote-mcp-server). For testing outside a chat client, the docs point to the MCP Inspector with the Streamable HTTP transport; we covered that workflow in [testing an MCP server before production](https://precisian.io/blog/en/posts/mcp-inspector-test-before-production/).

Then run one revenue test. Ask the agent for last quarter's closed-won total and set it next to the invoiced total finance reported for the same accounts. If the agent used `amount` or the weighted amount, you've found the gap before the board deck did.

## How do you fix it?

**1. Connect a narrow user, not a power user.** Create a HubSpot user or team for analysis that can't open contact records in full, can't see restricted inboxes and has read-only access to deals. The agent inherits that narrow view through the same mechanism that made it broad. The broader pattern, answering cohort and LTV questions from a pseudonymous ID, is in [how to give an AI agent customer context without exposing PII](https://precisian.io/blog/en/posts/ai-agent-customer-context-without-pii/).

**2. Keep the write confirmation as a real control.** HubSpot's `manage_crm_objects` "requires explicit user confirmation before executing any create or update." That only protects you if the person confirming reads the summary. For an analysis workflow, decline writes by default and record who may approve them in your [AI agent and MCP permission inventory](https://precisian.io/blog/en/posts/ai-agent-mcp-permissions-inventory/).

**3. Turn on Sensitive Data where it applies.** In Enterprise accounts it blocks conversation data from the MCP server while the regular APIs keep working, which is the narrowest switch HubSpot documents for this channel.

**4. Write the definition down.** Give "revenue" a written definition that names its system of record, and tell the team that `get_campaign_attribution_reports` reports closed-won deal attribution, not invoiced revenue. For why marketing and finance end up with two correct numbers, see [marketing and finance never close the same revenue number](https://precisian.io/blog/en/posts/marketing-finance-revenue-definition/).

**5. Reconnect on purpose.** Scopes grow with HubSpot's tool list, and an existing install gets them only on reauthorization. Treat each reconnect as a permission review.

## When can't it be fixed inside HubSpot?

**When the agent needs to run without a person.** The server authenticates a user through OAuth with PKCE and acts "on behalf of the authenticated user". A nightly job with no human behind it is outside what this server was designed for.

**When the answer lives in more than one system.** A US brand that sells direct on Shopify, sells wholesale through HubSpot deals and books revenue in NetSuite has three systems and three numbers. A round-number example, synthetic:

| Reading | Value | Visible to the HubSpot MCP? |
|---|---|---|
| Closed-won `amount`, wholesale, Q3 | $900,000 | yes |
| Short-shipped and cancelled lines after booking | − $60,000 | no |
| Wholesale credits issued in NetSuite | − $25,000 | no |
| Shopify DTC net sales | $1,800,000 | no |
| Revenue finance recognizes | $2,615,000 | no |

In this made-up case the agent answers $900,000 with the same confidence it would answer $2.6 million. When two MCP servers share one chat and each returns its own "revenue", you get the problem described in [three MCPs, three revenues](https://precisian.io/blog/en/posts/three-mcps-three-revenues/). The same pattern on the Salesforce side is in [Salesforce MCP server: what an AI agent can read from your CRM](https://precisian.io/blog/en/posts/salesforce-mcp-server/).

**When the CRM data is wrong at entry.** Permissions don't fix a rep who never moves a deal out of "contract sent". The agent repeats the stale stage faster.

That second case is where Precisian fits. It doesn't replace HubSpot or its MCP server. It keeps sales, store and finance data in a data lake isolated per customer, on Precisian's infrastructure, with the revenue definition written once in a semantic layer and served to the AI you already use through its own governed MCP, plus API and BI access. If your team only asks about pipeline inside HubSpot, a narrow user with read-only deal access is enough, and you don't need us.

## What does this article not cover?

It isn't a setup guide; HubSpot's [integration guide](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/integrate-with-the-remote-hubspot-mcp-server) has the connector steps and changes with each tool release. It doesn't cover the developer MCP server, Breeze agents or the AEO tools in depth. It doesn't evaluate the community-built HubSpot MCP servers on GitHub. And tool availability varies by subscription and account configuration, so the list above is what HubSpot publishes, not a guarantee of what your portal shows.

---

If your agent answers "revenue" from HubSpot and the number doesn't tie to the invoices, the first step is listing which property it summed and which system finance closes from. [Watch a governed MCP answer](https://precisian.io/en/demo?utm_source=blog&utm_medium=cta&utm_campaign=hubspot-mcp-server&utm_content=texto) over an isolated lake, with no contract commitment.
