---
title: "One AI agent, many client accounts: how to keep tenant data apart"
description: "When one agent serves many tenants, data rarely leaks through an attack. It leaks via leftover context, a cache keyed without the tenant, or one shared token."
slug: "one-ai-agent-many-client-accounts"
lang: "en"
translationKey: "multi-client-agent"
publishedAt: 2026-10-23
tags: ["agency", "data-isolation", "mcp", "ai-data-access", "data-security"]
draft: false
llmSummary: "An AI agent serving many tenants leaks data through three operational paths: leftover conversation context, caches keyed without the tenant, and one shared credential. In March 2023 a redis-py cache bug exposed payment details of 1.2% of ChatGPT Plus subscribers to other users (OpenAI)."
citations: ["https://openai.com/index/march-20-chatgpt-outage/", "https://developers.google.com/google-ads/api/docs/oauth/access-model", "https://github.com/googleads/google-ads-mcp", "https://genai.owasp.org/llmrisk/llm082025-vector-and-embedding-weaknesses/", "https://platform.claude.com/docs/en/build-with-claude/prompt-caching", "https://developers.openai.com/api/docs/guides/prompt-caching", "https://arxiv.org/abs/2502.07776", "https://claude.com/blog/memory", "https://modelcontextprotocol.io/specification/2025-11-25/basic/security_best_practices"]
about: ["https://en.wikipedia.org/wiki/Multitenancy", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

To give your product's AI agent access to customer data without exposing one tenant to another, close three paths, none of which needs an attacker: context from one tenant left in the conversation about the next, a cache that stores answers without the tenant in its key, and one credential that reaches every account. In March 2023, a shared cache exposed payment details of 1.2% of ChatGPT Plus subscribers to other users ([OpenAI](https://openai.com/index/march-20-chatgpt-outage/)).

Per-tenant data architecture handles part of this, and I covered it in [per-tenant isolation for MCP](https://precisian.io/blog/en/posts/per-tenant-isolation-mcp/). This article is about the rest: the runtime of an agent that works for many customers, whether you are a SaaS company shipping an assistant inside your product or an agency running one across forty client accounts.

> **Multi-tenant agent**: one AI agent, with the same tools, memory, caches and credentials, doing work for more than one customer. Isolation between those customers depends on each of those components, not only on where the data is stored.

## What does a cross-tenant leak look like in practice?

Almost never like an incident. It looks like an odd detail in an answer.

A customer of your analytics product asks the in-app assistant why conversion dropped, and the answer mentions a Memorial Day promotion they never ran. An agency analyst asks for a weekly summary for a Shopify apparel brand and gets a paragraph citing a "Prime Day push" that belongs to the Amazon seller handled an hour earlier. Or the agent proposes a target CPA "based on history", and the history is someone else's.

Nobody files a ticket, because nothing left the building. But one customer's data shaped work delivered to another, and if the two compete, you just moved competitive intelligence between them without noticing.

Alert on any answer that references something absent from that tenant's own data. When the agent "remembers" a fact, the useful question is where from.

## Why does it happen, mechanically?

Because an agent carries state, and every piece of state has its own boundary. If that boundary is your company rather than your customer, customers mix inside it.

**Context and memory.** A conversation's context window holds everything read in it. Switching tenants inside the same thread leaves the first tenant's data available to the model while it answers for the second. Persistent memory extends this across threads. Anthropic, for instance, states that Claude "creates a separate memory for each project" ([Anthropic, Sept 11, 2025](https://claude.com/blog/memory)), which helps only if there is one project per client. A project named "Clients" pools them.

**Caches and shared state.** OpenAI's 2023 incident is the best-documented case: a bug in the redis-py library caused the cache to return one user's data to another, including other users' chat titles, during a nine-hour window on March 20, 2023 ([OpenAI](https://openai.com/index/march-20-chatgpt-outage/)). Your product is not at OpenAI's scale, but you probably run your own cache between the agent and downstream APIs so you do not pay for the same query twice. If the cache key is the question ("revenue last week") rather than the pair of tenant and question, tenant B gets tenant A's answer.

Vector search has the same shape. The 2025 OWASP Top 10 for LLM Applications lists cross-context leakage "in multi-tenant environments where multiple classes of users or applications share the same vector database", and recommends "strict logical and access partitioning of datasets" ([OWASP LLM08:2025](https://genai.owasp.org/llmrisk/llm082025-vector-and-embedding-weaknesses/)). One index holding every customer's documents, filtered by a metadata field the application sets, is that case.

**One credential.** This is the most common path for agencies. In Google Ads, the documentation says a user gains access to an advertiser account "since the manager account has access to all the accounts linked under it" ([Google Ads API](https://developers.google.com/google-ads/api/docs/oauth/access-model)). The official Google Ads MCP server accepts the manager account as a default and lets you pass `login_customer_id` **per tool call** ([googleads/google-ads-mcp](https://github.com/googleads/google-ads-mcp)).

Put those together. An agent connected with the agency's manager-account token reaches every client, and which client it queries depends on a parameter the model fills from the conversation. SaaS products hit the same pattern when the agent's tools accept `tenant_id` as an argument. Every piece in that chain works as designed.

## How do you diagnose it in your own stack?

With an afternoon of review and two active tests. The table lists checks in rough order of likelihood.

| Check | Where to look | What signals mixing |
|---|---|---|
| Threads touching more than one tenant | assistant history, agent traces | any thread naming two customers |
| Project or workspace per tenant | assistant or API configuration | one shared project, or none |
| Connector credential | each MCP server's config | manager-account, admin, or service account spanning tenants |
| Account selection | tool schemas | tenant or customer ID as a free argument |
| Cache key | integration code | key without a tenant identifier |
| Vector index | agent's retrieval layer | one index for all tenants |
| Logs | call records | no field saying which tenant was queried |

**Crossing test.** In a fresh thread scoped to tenant A, ask by name for a figure belonging to tenant B. If data comes back, the boundary does not exist at the credential. If the agent declines because the system prompt told it to, the boundary exists only in the prompt, which holds until some content in the context says otherwise.

**Memory test.** In a tenant A thread, ask "what do you know about my other clients?" The answer shows what memory carries beyond that scope.

## How do you fix it?

In order of how much each fix shrinks the blast radius.

**1. One credential per tenant.** Instead of the manager-account or platform-wide token, a user or service identity scoped to that tenant's account alone. It is the same reasoning as [giving an agency data access without giving everything](https://precisian.io/blog/en/posts/agency-data-access-without-everything/), pointed inward: now you are restricting your own agent. With a scoped credential, the model can fill the wrong ID all day and the API answers with a permission error rather than someone else's data.

**2. Tenant identity from the token, never from the prompt.** For SaaS, resolve the tenant from the authenticated session of the user talking to the agent, and inject it server-side. If a tool accepts `tenant_id` from the model, remove the parameter. The MCP spec applies the same logic to sessions, advising servers to key session data as `<user_id>:<session_id>` so that the user ID "is derived from the user token and not provided by the client" ([MCP, 2025-11-25 revision](https://modelcontextprotocol.io/specification/2025-11-25/basic/security_best_practices)).

**3. One connector instance per tenant.** Configure the MCP server once per tenant, each with its own credential, and load only that instance into that tenant's scope. An agent that cannot see tenant B's tool cannot be talked into calling it. Scope and read-only guidance is in [MCP security for marketing data](https://precisian.io/blog/en/posts/mcp-security-marketing-data/).

**4. Tenant in the key of everything that holds state.** Cache, queue, vector index, memory and logs all carry the tenant identifier in the key, sourced from the credential.

**5. Logs that answer "who read what, for which tenant."** Without them you cannot show a customer that their data never entered another customer's work. How to build that record is in [answer lineage and audit trails](https://precisian.io/blog/en/posts/answer-lineage-audit-trail/).

## When can't it be fixed?

In four situations, and it is worth knowing them before you promise isolation in a sales call or a security questionnaire.

**When the model vendor's isolation stops at your organization.** Anthropic isolates prompt caches between organizations and, on the Claude API, also by workspace; on Bedrock and Google Cloud, by organization only ([Anthropic](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)). OpenAI states that "caches are not shared across organizations" ([OpenAI](https://developers.openai.com/api/docs/guides/prompt-caching)). From the vendor's side, all of your tenants are you. A workspace per tenant is workable for a handful of large accounts and impractical for thousands. And vendor behavior has shifted before: in February 2025, Stanford researchers reported detecting "global cache sharing across users in seven API providers, including OpenAI" ([Gu et al., arXiv 2502.07776](https://arxiv.org/abs/2502.07776)).

**When a person is the channel.** The analyst who handles client A in the morning and client B after lunch carries context in their head and in whatever they paste into a prompt. Separate projects and review reduce that; nothing configures it away.

**When every tenant's data sits in the same store under the same role.** Then the problem is architecture, and the fixes above only hide a master key. That is the case covered in [per-tenant isolation](https://precisian.io/blog/en/posts/per-tenant-isolation-mcp/), and in [connecting an AI agent to production data](https://precisian.io/blog/en/posts/connect-ai-to-production-data/).

**When the platform does not offer granular enough access.** Some operational tasks require admin-level grants. Then the workable split is a read agent on a scoped credential, and operational work on the broad credential with no agent attached.

The third point is where Precisian fits, and only there. Precisian runs an isolated data lake per client, on Precisian's infrastructure, with a semantic layer over it, reached through MCP, an open API and the client's BI. A consultant serving five brands connects an agent to five separate lakes, so the boundary between customers exists before the agent asks anything. What Precisian does **not** handle is the conversation, memory and cache of the consultant's own agent, which run in their AI. The discipline in the sections above stays with them.

## What does this article not cover?

It offers no rate of cross-tenant leaks at agencies or SaaS vendors. I found no primary source measuring it, and the incident cited is a model vendor's, not an agency's.

It does not cover Meta Business Manager access levels. Meta's help pages refused automated retrieval in my attempts, and I am not describing them from memory.

It does not compare assistants on memory and project features. I cited the one I could read at the vendor's source; the rest change often.

And it does not replace your customer agreements. What your contracts and DPAs say about AI processing belongs to counsel.

---

If your agent runs on one platform-wide token and you cannot say which tenant it queried yesterday, the first step is counting how many credentials and scopes it actually uses. [Book a conversation about your case](https://calendar.notion.so/meet/rodrigomartucci/precisian-io), with no contract commitment, and no promise of a 30-minute answer either.
