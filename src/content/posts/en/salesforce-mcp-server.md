---
title: "Salesforce MCP server: what an AI agent can read from your CRM, and what it shouldn't"
description: "Salesforce's hosted MCP servers give an agent the user's own CRM permissions. sobject-reads can't write, but it still reads every field that user can see."
slug: "salesforce-mcp-server"
lang: "en"
translationKey: "salesforce-mcp-server"
publishedAt: 2026-11-11
tags: ["mcp", "ai-data-access", "governance", "privacy", "data-discrepancy", "security"]
draft: false
llmSummary: "Salesforce Hosted MCP Servers, generally available since April 29, 2026, run every tool call as the authenticated user. The platform/sobject-reads server exposes six read-only tools; sobject-all adds five that create, update and delete records (Salesforce docs, read November 11, 2026)."
citations: ["https://developer.salesforce.com/blogs/2026/04/salesforce-hosted-mcp-servers-are-now-generally-available", "https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/hosted-mcp-servers-overview.html", "https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/servers-reference.html", "https://developer.salesforce.com/docs/platform/hosted-mcp-servers/references/reference/sobject-reads.html", "https://developer.salesforce.com/docs/platform/hosted-mcp-servers/references/reference/sobject-all.html", "https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/security-best-practices.html", "https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/create-external-client-app.html", "https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/activate-mcp-servers.html", "https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/beta-to-ga-transition.html", "https://developer.salesforce.com/docs/platform/object-reference/references/standard-objects/object-opportunity.html", "https://github.com/salesforcecli/mcp"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://en.wikipedia.org/wiki/Salesforce", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
cta: demo
---
Salesforce's official MCP server lets an AI agent read anything the person who connected it can read in Salesforce, and nothing more. Salesforce Hosted MCP Servers became generally available on April 29, 2026, for Enterprise Edition orgs and above ([Salesforce Developers blog](https://developer.salesforce.com/blogs/2026/04/salesforce-hosted-mcp-servers-are-now-generally-available)), and every tool call runs with that user's object permissions, field-level security and sharing rules ([security best practices](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/security-best-practices.html), read November 11, 2026). So the real question is which user you connect, and which of the servers.

> **Salesforce Hosted MCP Servers**: Salesforce-managed endpoints under `https://api.salesforce.com/platform/mcp/v1/` that expose a fixed set of tools over the Model Context Protocol. Standard servers are disabled by default, an administrator enables them, and their tool sets can't be modified ([Standard MCP Servers Reference](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/servers-reference.html)).

## What does the problem look like from the sales floor?

A sales ops lead connects Claude or ChatGPT to Salesforce with her own login, because that's how the OAuth screen works. She asks for "closed-won revenue from wholesale accounts last quarter" and gets a clean number. Three things go wrong after that, and none of them throws an error.

- **The agent read more than the question needed.** Her profile can see every contact's email, mobile number and notes, so the agent can too. Ask it to "summarize our top accounts" and it will quote names and phone numbers into a chat transcript stored outside Salesforce.
- **The number is pipeline, not revenue.** The agent summed `Amount` on won opportunities. Finance closes the quarter from invoices in NetSuite, after returns and short-shipped orders.
- **She connected a server that can write.** If the admin turned on `platform/sobject-all`, the same chat that answers questions can update a stage or delete a record.

## What do the official servers expose?

Salesforce publishes four SObject servers. They differ only in which tools they carry ([reference pages](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/references/reference/sobject-all.html), checked November 11, 2026):

| Tool | `sobject-reads` | `sobject-mutations` | `sobject-deletes` | `sobject-all` |
|---|---|---|---|---|
| `getObjectSchema` | yes | yes | yes | yes |
| `soqlQuery` | yes | yes | yes | yes |
| `find` | yes | yes | yes | yes |
| `getUserInfo` | yes | no | no | yes |
| `listRecentSobjectRecords` | yes | no | no | yes |
| `getRelatedRecords` | yes | no | no | yes |
| `createSobjectRecord` | no | yes | no | yes |
| `updateSobjectRecord` | no | yes | no | yes |
| `updateRelatedRecord` | no | yes | no | yes |
| `deleteSobjectRecord` | no | no | yes | yes |
| `deleteRelatedRecord` | no | no | yes | yes |

The production endpoint for the read-only server is `https://api.salesforce.com/platform/mcp/v1/platform/sobject-reads`; sandboxes add `/sandbox` after `v1` ([SObject Reads](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/references/reference/sobject-reads.html)). Salesforce's own launch post tells newcomers to start there: "It's read-only, risk-free, and immediately useful."

Beyond SObjects, the reference lists servers for Data 360, Tableau Next, CRM Analytics (beta), Salesforce CMS content, Metadata Grounding (beta) and Headless 360 (beta). Billing is separate from your licenses: the overview says hosted servers "are intended only for customers with Flex Credits and you may be billed for server usage" ([overview](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/hosted-mcp-servers-overview.html)).

One older project causes confusion in search results. `salesforcecli/mcp`, published on npm as `@salesforce/mcp`, is a developer-tooling server with more than 60 tools, including `run_soql_query`. Its repository was archived on November 2, 2026, and the README says the server reaches end of life the same day ([GitHub](https://github.com/salesforcecli/mcp)). For CRM data, the hosted servers are the current path.

## Why does the agent see what it sees?

Because Salesforce built the MCP layer on top of its existing permission model instead of adding a new one. The security page puts it in four lines: the agent has the user's CRUD permissions, respects field-level security, follows sharing rules, and every action is attributed to the named user. It adds: "There are no service accounts, no machine-to-machine flows, and no autonomous operation outside of user context."

That design has two consequences.

**Read scope equals the human's read scope.** `sobject-reads` removes writes, but not fields. Whatever a profile can see on Contact, Lead or Case, including email, phone, mailing address and free-text descriptions, `soqlQuery` can return. The docs describe no separate field policy for MCP traffic. If a field should stay out of the agent's reach, it has to be out of that user's reach. `getUserInfo` also returns the connected user's own email, role, manager and timezone, by design.

**Free text is an input, not only an output.** Case descriptions, email bodies logged as activities and web-to-lead comments were typed by people outside your company. When `find` or `soqlQuery` returns them, the model reads them as context, and a sentence written to look like an instruction gets read too. Salesforce's permission model limits what that instruction could make the agent do, which is one more reason the connected user should be narrow. The mechanics are in [prompt injection through marketing data](https://precisian.io/blog/en/posts/prompt-injection-marketing-data/).

**Volume is limited by the platform, not by your intent.** `soqlQuery` allows a maximum of 50,000 total records per transaction across all queries, and `find` returns at most 2,000 records ([SObject All](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/references/reference/sobject-all.html)). A sloppy question can pull tens of thousands of contact rows into a model's context before anyone notices.

Writes inherit the same rule, with two documented sharp edges. `deleteSobjectRecord` sends records to the Recycle Bin, recoverable "for up to 15 days (no undelete tool is available through MCP)". And `deleteRelatedRecord`, pointed at a master record in a master-detail relationship, "also deletes all of its detail records, including the child record you started from."

**Why the CRM number isn't revenue.** The Opportunity object stores a forecast. `Amount` is an editable currency field, `Probability` changes with the stage, and `ExpectedRevenue` is a read-only currency field derived from both ([Opportunity reference](https://developer.salesforce.com/docs/platform/object-reference/references/standard-objects/object-opportunity.html)). `IsWon` and `CloseDate` record a booking. None of them records an invoice, a payment or a return. An agent asked for "revenue" picks one of these fields, and nothing in the schema stops it.

`getObjectSchema` "includes admin-authored guidance about data quality and business definitions alongside the standard schema", with Salesforce's own example: "use `Calculated_ACV__c` instead of `Amount` for accurate forecasting." That is a small metric definition living inside the CRM. It helps, but it only covers what lives in Salesforce.

## How do you check what your agent can reach?

Six checks, all doable by an admin in an afternoon.

| Check | Where to look | What signals a problem |
|---|---|---|
| Which servers are on | Setup › Quick Find "MCP Servers" › API Catalog | `sobject-all`, `sobject-mutations` or `sobject-deletes` enabled with no written reason |
| Who can authenticate | External Client App › OAuth Policies | No required Permission Set: by default "any user in your org can authenticate" |
| Token lifetime | External Client App › OAuth Policies | Refresh Token Validity left at the default, which is indefinite |
| OAuth scopes | External Client App › OAuth Scopes | Anything beyond `mcp_api` and `refresh_token`, or beta-era scopes such as `sfap_api` still present |
| Field exposure | Field-level security on Contact, Lead, Case for the connecting profile | Email, phone, address or notes readable by a profile used for analysis |
| Actual agent traffic | API logs filtered by `API_CLIENT_CATEGORY = SALESFORCE_HOSTED_MCP` | Objects queried that the use case never needed |

Sources: [Create an External Client App](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/create-external-client-app.html), [Activate MCP Servers](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/activate-mcp-servers.html), [Transition from Beta](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/beta-to-ga-transition.html), [security best practices](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/security-best-practices.html).

Then run one revenue test: ask the agent for last quarter's closed-won total, and put it next to the invoiced total finance reported for the same accounts. Write down which field the agent used. If it was `Amount` or `ExpectedRevenue`, you've found the gap before the board deck did.

## How do you fix it?

**1. Default to `sobject-reads`.** Turn on writes only for a named workflow, with a named owner, and record that in your [AI agent and MCP permission inventory](https://precisian.io/blog/en/posts/ai-agent-mcp-permissions-inventory/).

**2. Connect a narrow user, not a power user.** Create a profile or permission set for analysis that can't see contact PII fields, and require that permission set on the External Client App. The agent then inherits a narrow view through the same mechanism that made it broad. The broader pattern, answering cohort and LTV questions from a pseudonymous ID, is in [how to give an AI agent customer context without exposing PII](https://precisian.io/blog/en/posts/ai-agent-customer-context-without-pii/).

**3. Prefer Named Queries and custom tools for recurring questions.** Salesforce recommends both: Named Queries define "specific SOQL queries as reusable APIs", and Apex Invocable Actions or Flows let you embed business logic. A tool called `closed_won_by_quarter` with fixed fields leaks less than open `soqlQuery`.

**4. Shorten tokens.** The docs suggest refresh-token validity of "30 days or less" with rotation enabled, plus single logout so revoking a Salesforce session ends the MCP session.

**5. Write the definition down.** Use `getObjectSchema` guidance to say which field means what, and give "revenue" a written definition that names its system of record. For why marketing and finance end up with two correct numbers, see [marketing and finance never close the same revenue number](https://precisian.io/blog/en/posts/marketing-finance-revenue-definition/).

## When can't it be fixed inside Salesforce?

**When the agent needs the user's permissions to do its job.** There is no service-account option: Salesforce requires the OAuth authorization code flow with PKCE for every connection. An agent meant to run unattended at 3 a.m. is outside what this server was designed for.

**When the answer lives in more than one system.** A US brand that sells direct on Shopify, wholesale through Salesforce and books revenue in NetSuite has three systems and three numbers. A round-number example, synthetic:

| Reading | Value | Visible to the Salesforce MCP? |
|---|---|---|
| Closed-won `Amount`, wholesale, Q3 | $1,200,000 | yes |
| Short-shipped and cancelled lines after booking | − $90,000 | no |
| Wholesale returns credited in NetSuite | − $40,000 | no |
| Shopify DTC net sales | $2,100,000 | no |
| Revenue finance recognizes | $3,170,000 | no |

In this made-up case the agent answers $1.2 million with the same confidence it would answer $3.17 million. The gap in your business only shows when you measure it. When two MCP servers share one chat and each returns its own "revenue", you get the problem described in [three MCPs, three revenues](https://precisian.io/blog/en/posts/three-mcps-three-revenues/).

**When the CRM data is wrong at entry.** Permissions don't fix a rep who never updates `CloseDate`. The agent repeats it faster.

That second case is where Precisian fits. It doesn't replace your CRM or its MCP server. It keeps sales, store and finance data in a data lake isolated per customer, on Precisian's infrastructure, with the revenue definition written once in a semantic layer and served to the AI you already use through its own governed MCP, plus API and BI access. If the only question your team asks is about pipeline inside Salesforce, `sobject-reads` with a narrow user is enough, and you don't need us.

## What does this article not cover?

It isn't a setup guide; the client steps for Claude, ChatGPT, Cursor and Postman are in [Salesforce's client connection guide](https://developer.salesforce.com/docs/platform/hosted-mcp-servers/guide/client-connection-overview.html) and change by release. It doesn't cover Agentforce, Data 360 or the Tableau Next server in depth. It doesn't price Flex Credits, which Salesforce doesn't publish on the MCP pages. And one documentation quirk worth knowing: the `sobject-all` page names the query tool `soqlQuery` in its tool list but refers to `soql_query` in the description of `find`. Check the name your client shows.

---

If your agent answers "revenue" from Salesforce and the number doesn't tie to the invoices, the first step is listing which field it read and which system finance closes from. [Watch a governed MCP answer](https://precisian.io/en/demo?utm_source=blog&utm_medium=cta&utm_campaign=salesforce-mcp-server&utm_content=texto) over an isolated lake, with no contract commitment.
