---
title: "Meta Ads MCP: the official connector, its permissions, and whose numbers it returns"
description: "Meta's official Ads MCP server entered open beta on April 29, 2026 with 91 tools. The conversions it reports are the ones Meta attributes to itself."
slug: "meta-ads-mcp-permissions"
lang: "en"
translationKey: "meta-ads-mcp"
publishedAt: 2026-10-14
tags: ["mcp", "governanca", "atribuicao", "roas", "seguranca", "ai-data-access"]
draft: false
llmSummary: "Meta launched an official MCP server in open beta on April 29, 2026, hosted at mcp.facebook.com/ads. As of October 14, 2026 its docs list 91 tools, 36 of them write tools. Conversions follow Meta's attribution windows, and per-account agent rules live in Meta Business Suite."
citations: ["https://www.facebook.com/business/news/meta-ads-ai-connectors", "https://developers.facebook.com/documentation/ads-commerce/ads-ai-connectors/ads-mcp-server/ads-mcp-server-overview", "https://developers.facebook.com/documentation/ads-commerce/ads-ai-connectors/ads-mcp-server/ads-mcp-server-get-started", "https://developers.facebook.com/documentation/ads-commerce/ads-ai-connectors/ads-mcp-server/ads-mcp-server-tools-ad-creation-and-management", "https://developers.facebook.com/documentation/ads-commerce/ads-ai-connectors/ads-mcp-server/ads-mcp-server-tools-comprehensive-reporting", "https://www.facebook.com/business/help/1456422242197840", "https://developers.facebook.com/docs/marketing-api/reference/ads-action-stats/", "https://www.facebook.com/business/news/click-attribution", "https://developers.facebook.com/blog/post/2026/04/29/introducing-ads-cli"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
---

The Meta Ads MCP server is Meta's official connector between an AI agent and a Meta ad account. Meta announced it in open beta on April 29, 2026 ([Meta](https://www.facebook.com/business/news/meta-ads-ai-connectors)). It is hosted at `https://mcp.facebook.com/ads`, and when I counted on October 14, 2026, its developer docs listed 91 tools. It reads and writes, and the conversions it reports are the ones Meta credits to its own ads.

> **Meta Ads MCP server**: a Model Context Protocol server built and hosted by Meta, part of its "ads AI connectors," that exposes reporting, campaign creation and editing, catalog, signal, experiment and change-history tools to an AI agent, authenticated through Meta login and limited by the permissions granted.

## How does Meta's official MCP server work?

You add `https://mcp.facebook.com/ads` as a custom connector in your AI client, sign in with Meta, and approve the permissions. As of October 14, 2026, Meta's Business Help Center names four supported clients: ChatGPT, Claude, Claude Code and Perplexity ([Meta Business Help Center](https://www.facebook.com/business/help/1456422242197840)). No developer app is required. Teams that want their own app add the "Create & manage ads with ads MCP server" use case ([Meta for Developers](https://developers.facebook.com/documentation/ads-commerce/ads-ai-connectors/ads-mcp-server/ads-mcp-server-get-started)).

The Ads CLI shipped alongside it, for teams that automate through scripts and CI. It authenticates with a system user token rather than a person's login, and it creates resources paused by default ([Meta for Developers, April 29, 2026](https://developers.facebook.com/blog/post/2026/04/29/introducing-ads-cli)).

Here is the tool count from the seven category pages in the developer docs ([overview](https://developers.facebook.com/documentation/ads-commerce/ads-ai-connectors/ads-mcp-server/ads-mcp-server-overview)), as of October 14, 2026:

| Category | Tools listed | Example write tool |
|---|---|---|
| Reporting | 7 | none, read-only |
| Ad creation and management | 28 | `ads_activate_entity` |
| Catalog | 34 | `ads_catalog_delete_product` |
| Signals and datasets | 13 | `ads_pixel_event_delete` |
| Help and troubleshooting | 2 | none |
| A/B tests and lift studies | 7 | `ads_experiment_lift_create_test` |
| Activity logs | 1 | none |

`ads_get_ad_entities` is listed under two categories, so the rows add up to 92 and the unique count is 91. Thirty-six have create, update, delete, activate, boost or connect in the name. Launch-week coverage put the count at 29 ([mcp.directory](https://mcp.directory/blog/meta-ads-cli-mcp)). The server has grown since, and it will keep changing, so treat any count as dated.

## Whose conversion numbers does the Meta Ads MCP return?

Meta's, computed under Meta's rules. The main reporting tool, `ads_get_ad_entities`, returns spend, impressions, CTR, CPC, CPM and conversions, with filters, breakdowns and date ranges ([Meta for Developers](https://developers.facebook.com/documentation/ads-commerce/ads-ai-connectors/ads-mcp-server/ads-mcp-server-tools-comprehensive-reporting)). A conversion there is an action Meta attributed to an ad inside a window.

The Marketing API reference shows how much rides on that window. Each action can come back in separate fields per window, including `1d_click`, `7d_click` and `28d_view`, plus a `dda` field described as a window "powered by data driven model" and an `incrementality` field ([Meta, Ads Action Stats](https://developers.facebook.com/docs/marketing-api/reference/ads-action-stats/)). The same page notes that metrics become unavailable when you try to aggregate across attribution settings. So when an agent says "this campaign drove 412 purchases," it picked one of those windows, or inherited the default, and it rarely tells you which.

The definition of a click also moved this year. In March 2026 Meta narrowed click-through attribution to link clicks only, where likes, shares and saves used to count, and cited inconsistency between Ads Manager and third-party reporting tools as the reason ([Meta, March 2026](https://www.facebook.com/business/news/click-attribution)). A year-over-year trend pulled through the MCP crosses that line without a marker.

None of this is a defect in the server, which faithfully reports what Meta measures. The trouble starts when the same agent also reads Google Ads and adds the two answers together. Each platform deduplicates only against itself, and the total ends up above what Shopify actually booked.

## What permissions does the Meta Ads MCP ask for?

On the access-token route, Meta's docs list seven permissions to grant together: `ads_mcp_management`, `ads_read`, `ads_management`, `catalog_management`, `business_management`, `pages_show_list` and `instagram_basic` ([Meta for Developers](https://developers.facebook.com/documentation/ads-commerce/ads-ai-connectors/ads-mcp-server/ads-mcp-server-get-started)). `ads_management` is the Marketing API's write permission. The official setup path does not describe a read-only configuration.

Meta documents three guardrails instead:

1. **Paused by default.** Write tools create campaigns, ad sets and ads in a paused state, and the AI client asks before activating. Meta's own description of `ads_activate_entity` says it "starts spending budget" ([Meta for Developers](https://developers.facebook.com/documentation/ads-commerce/ads-ai-connectors/ads-mcp-server/ads-mcp-server-tools-ad-creation-and-management)).
2. **Authorization in the agent.** The Help Center says any action taken on your behalf requires your authorization through the AI agent ([Meta Business Help Center](https://www.facebook.com/business/help/1456422242197840)).
3. **Ads MCP server rules.** Since a July 16, 2026 update, anyone with full control of a business portfolio can set, per ad account, what agents may do ([Meta](https://www.facebook.com/business/news/meta-ads-ai-connectors)). The path is Meta Business Suite Settings, Integrations, Ads MCP server. You can block campaign creation, block all budget edits, or cap them. In Meta's own example, with a $1,000 cap, any request to set a budget above $1,000 is denied ([Meta Business Help Center](https://www.facebook.com/business/help/1456422242197840)).

*Third-party coverage describes three permission tiers at consent: read-only; read and write; read, write and financial ([mcp.directory](https://mcp.directory/blog/meta-ads-cli-mcp)). I could not find those tiers, or the word "financial," in Meta's developer docs or Help Center on October 14, 2026. Treat that as unconfirmed.*

## Meta Ads MCP, Ads CLI, or a semantic layer?

| Criterion | Meta Ads MCP | Meta Ads CLI | Semantic layer over a data lake |
|---|---|---|---|
| Who hosts it | Meta | Your machine or pipeline | Whoever runs the lake |
| Authentication | The person's login (OAuth) | System user token | Lake credential, separate from the ad account |
| Writes to the ad account | Yes, with confirmation and rules | Yes, paused by default | No |
| Conversion it returns | Meta-attributed | Meta-attributed | Defined by the business, reconciled to orders |
| Sees Amazon sales and returns | No | No | If the source is ingested |

The first two columns solve access. The third solves definition. Those are separate problems, and most teams end up needing both.

## What is the Meta Ads MCP not?

**A revenue source.** It does not read Shopify orders, Amazon Seller Central, returns or refunds. Ask "how much did Meta sell" and you get attributed conversions, which can land above or below booked revenue.

**A read-only connector.** Writing is the point of the product. The reporting tool and the tool that starts spend live on the same server, behind the same login.

**A community server.** Third-party Meta Ads MCP servers predate the official one; [Pipeboard's repository](https://github.com/pipeboard-co/meta-ads-mcp), for instance, was created in April 2025. This one is maintained by Meta, on Meta's domain.

**A referee between platforms.** It speaks for Meta. Asking each platform's server for its own conversions recreates, inside the chat, the same double count described in [why reported ROAS exceeds actual revenue](https://precisian.io/blog/en/posts/roas-exceeds-actual-revenue/).

## Why is giving an agent write access a governance decision?

Because the agent reads text other people wrote. Campaign names, ad copy and catalog names enter its context as data. Meta documents no maximum length for a campaign name, and no ad platform documents content validation on those fields, as covered in [prompt injection through marketing data](https://precisian.io/blog/en/posts/prompt-injection-marketing-data/). Text with an embedded instruction plus a token holding `ads_management` is the whole scenario.

So the useful question is who in the company decides how much budget an agent may set, and whether that decision is written down. In practice:

- Block **Edit or set budget** until a use case justifies it. If you allow it, cap it.
- If an agency manages the account, set rules on both sides. The Help Center says a partner's rules apply only to the partner's own employees ([Meta Business Help Center](https://www.facebook.com/business/help/1456422242197840)).
- Split the agent that analyzes from the agent that acts. One that only asks questions does not need `ads_management`.
- Keep a record of what the agent read before it acted. Meta's activity log records what changed, not what the agent consulted to decide. That gap is the subject of [answer lineage](https://precisian.io/blog/en/posts/answer-lineage-audit-trail/).

## When does this start to matter?

The day someone on the team connects the server and asks which channel has the best ROAS. A synthetic example with round numbers, using the mechanism in the [ROAS post](https://precisian.io/blog/en/posts/roas-exceeds-actual-revenue/): in one month Meta credits its ads with $180,000 in purchases, Google Ads credits itself with $150,000, and Shopify booked $260,000 in online orders, part of which came from organic search and repeat buyers. The $330,000 combined already exceeds booked revenue by $70,000 before organic is even counted. An agent reading both servers has no way to know, because each one is faithful to its own model.

The second trigger is write access. If the connector was added by someone with advertiser permissions and the server rules are still at their defaults, the agent's limits are that person's limits.

The answer to the first trigger is not in Meta's server. It sits in a [semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/) that defines revenue once, reconciles it to orders, and serves that definition to the agent, which stays free to use Meta's MCP for what it does well: running the account.

## What does this article not cover?

It is not a setup walkthrough; [Meta's get-started page](https://developers.facebook.com/documentation/ads-commerce/ads-ai-connectors/ads-mcp-server/ads-mcp-server-get-started) does that.

It does not state your account's default attribution window. That is set per ad set, and Meta's help pages on the current default did not return readable content during research.

It does not promise availability for every account. The Help Center warns that not every advertiser has access to every tool, and the launch was a beta.

---

If your team's agent already adds Meta conversions to Google's and calls the result revenue, the first step is measuring the gap between that sum and what your store booked in the same month. [Book a conversation about your case](https://calendar.notion.so/meet/rodrigomartucci/precisian-io), with no contract commitment, and no promise of an answer in 30 minutes either.
