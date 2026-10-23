---
title: "Which AI agents can reach your data? Building the agent and MCP permission inventory"
description: "No console lists every AI agent touching your data. An MCP permission inventory needs seven columns and a monthly and quarterly review."
slug: "ai-agent-mcp-permissions-inventory"
lang: "en"
translationKey: "agent-permissions"
publishedAt: 2026-10-23
tags: ["mcp", "governance", "security", "ai-data-access", "audit", "data-security"]
draft: false
llmSummary: "A Google OAuth grant only expires on its own after 6 months unused, and a Meta system user token can be set to never expire. So an AI agent and MCP permission inventory tracks agent, owner, MCP server, token scope, write tools, reachable data and last review date."
citations: ["https://developers.google.com/identity/protocols/oauth2", "https://developers.facebook.com/docs/business-management-apis/system-users/install-apps-and-generate-tokens", "https://developers.facebook.com/docs/facebook-login/auth-vs-data", "https://developers.facebook.com/docs/graph-api/reference/debug_token/", "https://knowledge.workspace.google.com/admin/apps/control-which-apps-access-google-workspace-data", "https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/manage-application-permissions", "https://developers.google.com/google-ads/api/docs/change-event", "https://help.shopify.com/en/manual/apps/install-setup-apps", "https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization", "https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices", "https://modelcontextprotocol.io/docs/develop/connect-local-servers", "https://genai.owasp.org/llmrisk/llm062025-excessive-agency/", "https://media.defense.gov/2026/Jun/02/2003943289/-1/-1/0/CSI_MCP_SECURITY.PDF"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://en.wikipedia.org/wiki/Principle_of_least_privilege", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 9
---

No single console shows which AI agents can reach your data, because every grant is recorded by the platform that issued it. And grants last: Google only retires a refresh token on its own after 6 months without use ([Google](https://developers.google.com/identity/protocols/oauth2)), and Meta lets you mint system user tokens that never expire ([Meta for Developers](https://developers.facebook.com/docs/business-management-apis/system-users/install-apps-and-generate-tokens)). A working MCP permission inventory has seven columns: agent, owner, MCP server, token scope, write tools, reachable data, and last review date.

> **An AI agent permission inventory** is a list, owned by a named person, of every agent that reads or changes company data: which MCP server it goes through, which credential it holds, what that credential allows, and when someone last checked.

This builds on [MCP security for marketing data](https://precisian.io/blog/en/posts/mcp-security-marketing-data/), which covers why, on Google Ads and Meta, the risk lives in the token's scope rather than in the protocol. This piece is about the list, and the routine that keeps it true.

## What does the problem look like?

Someone asks "which AIs are connected to our accounts?" and the answer takes a week, comes from three people, and doesn't reconcile.

The paid media analyst hooked Claude up to Google Ads through the [Google Ads MCP server](https://precisian.io/blog/en/posts/google-ads-mcp-what-it-sees/). The agency connected its own agent to the Meta ad account. Someone on the retention team tried a community MCP server for Shopify and never turned it off. A contractor who left in August authorized GA4 on a personal laptop. Each connection was approved with one click, by one person, on a consent screen nobody else saw.

Three versions of the same symptom keep showing up:

- **The question comes from outside marketing.** Legal, security, or a customer's vendor questionnaire wants to know who can touch shopper PII. Nobody can answer in writing.
- **The person left; the access stayed.** The login was disabled, but the credential saved in a config file still works.
- **A number changed and nobody touched it.** A budget, an audience, or a campaign name is different, and the change history says it came through the API.

## Why doesn't anyone know how many agents are already connected?

Because an agent's access is the sum of four records that live in different places, and none of them was designed to be read together.

**Consent is per person, not per company.** When someone authorizes an MCP server with Google, the grant is tied to that person's Google account. The MCP spec makes visibility worse in two ways: authorization is *"OPTIONAL,"* and servers running locally over the STDIO transport *"SHOULD NOT"* use the OAuth flow and instead retrieve credentials from the environment ([MCP spec, Authorization, 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization)). In practice, an API key pasted into a config file never passes through a consent screen and never shows up in an admin console.

**The credential outlives the reason it was created.** Google lists when a refresh token stops working: the user revoked access, six months without use, a password change when Gmail scopes are involved, and a few more ([Google](https://developers.google.com/identity/protocols/oauth2)). An agent that runs every Monday never hits six months. On Meta, a regular user token refreshed by Meta's SDKs lasts about 60 days from last use and data access expires after 90 days of inactivity ([Meta for Developers](https://developers.facebook.com/docs/facebook-login/auth-vs-data)), but a system user token can be generated as permanent ([Meta for Developers](https://developers.facebook.com/docs/business-management-apis/system-users/install-apps-and-generate-tokens)).

**The requested scope is usually the widest one on offer.** When a server doesn't say which scope it needs, the client falls back to requesting everything listed in `scopes_supported` (same spec). MCP's security best practices name the cumulative effect *"scope inflation blindness,"* where a lack of metrics makes over-broad requests normal ([MCP, Security Best Practices](https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices)).

**Write tools ship alongside read tools.** OWASP files this under excessive agency, with three root causes: excessive functionality, excessive permissions, and excessive autonomy. Its example is an extension that only needed to read and was granted update, insert, and delete as well ([OWASP, LLM06:2025](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/)).

Together, the four records explain the usual picture, where access was granted by individuals, sits where admins can't see it, has no expiration date, and is wider than the job.

## How do you find what's already connected?

Start with whatever covers the most ground for the least effort. The table says where to look; the steps after it handle what no console shows.

| Where | Path | What you learn |
|---|---|---|
| Google Workspace | Admin console: Security, Access and data control, API controls, Accessed apps, View list | Every app that accessed org data, user count, and requested services (OAuth scopes). Shows up 24 to 48 hours after authorization |
| Microsoft Entra | Entra ID, Enterprise apps, All applications, Permissions | Admin consent and user consent per app |
| Personal Google account | myaccount.google.com, third-party connections | Apps that one person authorized |
| Meta | `debug_token` on every token you know about | `scopes`, `granular_scopes`, `expires_at`, `data_access_expires_at` |
| Meta Business Suite | Settings, Integrations, Ads MCP server | Rules that cap what agents can do per ad account |
| Shopify | Each installed app's about page | The app's activity and permissions, split into personal data and store data it can view and edit |
| Google Ads | The `change_event` API resource | What changed, when, by which user, and through which client type |

Sources: [Google Workspace](https://knowledge.workspace.google.com/admin/apps/control-which-apps-access-google-workspace-data) (page updated October 22, 2026), [Microsoft Entra](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/manage-application-permissions), [Meta, debug_token](https://developers.facebook.com/docs/graph-api/reference/debug_token/), [Shopify Help Center](https://help.shopify.com/en/manual/apps/install-setup-apps), [Google Ads API, change_event](https://developers.google.com/google-ads/api/docs/change-event). Meta's agent rules are covered in [Meta Ads MCP: the official connector and its permissions](https://precisian.io/blog/en/posts/meta-ads-mcp-permissions/).

**After the consoles, the laptops.** Local servers don't appear in any admin list. In Claude Desktop, the config lives at `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS and `%APPDATA%\Claude\claude_desktop_config.json` on Windows, and MCP's own docs warn that the server *"runs with your user account permissions"* ([MCP, local servers](https://modelcontextprotocol.io/docs/develop/connect-local-servers)). Ask everyone who uses an agent to open that file and list the `mcpServers` entries, including the `env` block, which is where API keys tend to sit.

**After the laptops, the tools.** For every server you find, save the `tools/list` response and flag every tool with create, update, delete, pause, or enable in its name. A `readOnlyHint` annotation is no substitute for reading that list, for the reason covered in [MCP security for marketing data](https://precisian.io/blog/en/posts/mcp-security-marketing-data/).

**Last, the trail.** On Google Ads, the query below returns recent changes along with the client type that made them. The resource only keeps the last 30 days and requires a `LIMIT` of at most 10,000 rows ([Google Ads API](https://developers.google.com/google-ads/api/docs/change-event)).

```sql
SELECT change_event.change_date_time, change_event.user_email,
       change_event.client_type, change_event.change_resource_type,
       change_event.resource_change_operation
FROM change_event
WHERE change_event.change_date_time >= '2026-09-24'
  AND change_event.change_date_time <= '2026-10-23'
ORDER BY change_event.change_date_time DESC
LIMIT 1000
```

An API change made under an email nobody associates with an agent is the first row your inventory was missing.

## What goes in each row of the inventory?

Seven columns. Fewer and the list can't answer the question that started it; more and nobody keeps it updated.

| Column | What to record | Why it matters |
|---|---|---|
| Agent | Name and job ("weekly paid media report") | An agent with no stated job is the first to revoke |
| Owner | One named person who still works here | A row with no owner has nobody accountable for the access |
| MCP server | Which one, official or community, local or remote, version | A third-party remote server keeps the token outside your infrastructure |
| Credential and scope | Type, scopes, the user behind it, expiration date | This is the real ceiling on what the agent can do |
| Write tools | Every tool that changes data or spends money | Sets the blast radius of a planted instruction |
| Reachable data | Accounts, properties, stores; whether PII is in reach | Answers the question legal and security will ask |
| Last review | Date and reviewer | Without a date, the list is a snapshot of one afternoon |

A fictional example, only to show the level of detail a row needs:

| Agent | Owner | MCP server | Credential and scope | Write | Reachable data | Review |
|---|---|---|---|---|---|---|
| Weekly paid media report | Dana, growth | Official google-ads-mcp, local, Claude Desktop | OAuth `adwords`, user on Read only access level | None | 3 Google Ads accounts, no PII | Oct 1, 2026, Dana |

The spreadsheet doesn't need a paid tool. It needs an owner for the whole sheet, separate from the owners of each row. In my view the natural candidate is whoever already manages agency access and platform users, as described in [agency data access without handing over everything](https://precisian.io/blog/en/posts/agency-data-access-without-everything/).

## How do you manage permissions across agents, MCP servers, and AI tools over time?

With three review rhythms, each tied to a clock the platform already imposes.

**Monthly, for every agent with a write tool or access to PII.** The reason is the `change_event` window: Google Ads keeps 30 days ([Google Ads API](https://developers.google.com/google-ads/api/docs/change-event)). If nobody exports the history each month, "who changed that budget in July?" stops having an answer. In the same pass, run `debug_token` on your Meta tokens and check `expires_at`.

**Quarterly, for the whole list.** Reconcile Workspace's (or Entra's) accessed-apps list against the spreadsheet. Any app in the console that isn't in the sheet becomes a new row or a revocation. Any row whose owner has left gets revoked on the spot and, if still needed, recreated under a new owner.

**On event, without waiting for the calendar.** Someone leaves, you switch agencies, a new server shows up, a server update changes its `tools/list`, a new scope is requested. Each of these reopens the matching row.

Four rules make every cycle shorter than the last:

1. **One agent, one credential.** A credential shared across agents makes it impossible to tell which one did what. The MCP spec forbids servers from passing through tokens issued for another audience and lists the loss of an audit trail among the reasons ([MCP, Security Best Practices](https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices)).
2. **An agent that reads gets no write tools.** OWASP recommends limiting extensions and permissions to the minimum necessary ([OWASP, LLM06:2025](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/)). On Google Ads, that means authorizing with a Read only user; on Meta, using the server rules.
3. **Tokens with an end date.** On Meta, generate system user tokens with the 60-day expiry, which Meta itself marks as recommended ([Meta for Developers](https://developers.facebook.com/docs/business-management-apis/system-users/install-apps-and-generate-tokens)). The renewal becomes the review reminder.
4. **Log every call.** The inventory records who has access, and the log records what each agent did with it. The NSA recommends logging every invocation with exact parameters and the identities involved ([NSA, CSI U/OO/6030316-26](https://media.defense.gov/2026/Jun/02/2003943289/-1/-1/0/CSI_MCP_SECURITY.PDF)). What to keep is in [how to log every query an AI agent makes through MCP](https://precisian.io/blog/en/posts/mcp-logging-agent-audit-log/).

For teams that only need analysis, there's a structural shortcut. With Precisian, Google Ads, Meta, GA4 and Shopify data is ingested into a data lake isolated per client on Precisian's infrastructure, and the customer's own agent queries metrics defined in the semantic layer over MCP. The inventory then holds one row per agent pointing at a read-only server, instead of one ad platform credential per agent. The full design is in [connecting an AI agent to production data without exposing it](https://precisian.io/blog/en/posts/connect-ai-to-production-data/).

## When doesn't an inventory fix it?

In four situations, and it's worth knowing them before you treat the spreadsheet as a guarantee.

**When the agent has to act.** If the goal is an agent that launches campaigns, changes bids, or pauses ads, the inventory lowers the risk but the token still writes. Precisian doesn't solve that case either: it doesn't run campaigns and never hands an ad platform token to the agent.

**When someone else's login made the grant.** If the agency authorized the server with one of its own Google accounts, the grant is tied to that account and you can't revoke it from your side. What you control is the user the agency holds on your ad account, and the review now depends on the agency.

**When revoking doesn't stop it coming back.** Microsoft notes that revoking a granted permission doesn't stop users from consenting again; for that you have to configure who is allowed to consent ([Microsoft Entra](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/manage-application-permissions)). In Workspace, the equivalent is marking the app Blocked or Limited in the same API controls panel ([Google Workspace](https://knowledge.workspace.google.com/admin/apps/control-which-apps-access-google-workspace-data)). Without that policy, the quarterly review finds the same apps again.

**When the community server is remote.** You can list it and revoke it, but you can't know what it did with the token while it had one. The record of those calls sits with whoever hosts it.

## What does this article not cover?

It doesn't compare agent gateways or commercial agent management platforms, which change too fast for a durable review. It doesn't cover agent-native identity (credentials issued to the agent rather than to a person), which the specs are still working out. It doesn't detail what goes into the audit log itself, which the logging post covers. And it gives no share of companies without an inventory: I found no survey with a published methodology that measures it.

---

If nobody can say today how many agents reach your ad accounts and your store, the first step is filling in the seven columns for the agents you already know about, then checking them against your Workspace accessed-apps list. [Book a conversation about your setup](https://calendar.notion.so/meet/rodrigomartucci/precisian-io), with no contract commitment, and no promise of an answer in 30 minutes either.
