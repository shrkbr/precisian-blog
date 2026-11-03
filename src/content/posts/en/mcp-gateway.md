---
title: "What an MCP gateway does (and what it can't fix)"
description: "An MCP gateway centralizes auth, call logging and rate limits for AI agents. It can't decide what a metric means. That lives in the semantic layer."
slug: "mcp-gateway"
lang: "en"
translationKey: "mcp-gateway"
publishedAt: 2026-11-03
tags: ["mcp", "governance", "security", "ai-data-access", "semantic-layer", "audit"]
draft: false
llmSummary: "An MCP gateway is a proxy between AI agents and MCP servers that centralizes auth, call logging and rate limits. The MCP spec (revision 2026-07-28) forbids passing a client's token through to upstream servers. It does not define metrics, so sources with different definitions still disagree."
citations: ["https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization", "https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices", "https://modelcontextprotocol.io/specification/2026-07-28/server/utilities/logging", "https://docs.docker.com/ai/mcp-catalog-and-toolkit/mcp-gateway/", "https://docs.docker.com/reference/cli/docker/mcp/gateway/gateway_run/", "https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway.html", "https://learn.microsoft.com/en-us/azure/api-management/mcp-server-overview", "https://learn.microsoft.com/en-us/azure/api-management/secure-mcp-servers", "https://learn.microsoft.com/en-us/azure/api-management/rate-limit-by-key-policy", "https://learn.microsoft.com/en-us/azure/api-management/llm-token-limit-policy", "https://github.com/agentgateway/agentgateway", "https://docs.cloud.google.com/bigquery/docs/best-practices-costs", "https://developers.facebook.com/docs/business-management-apis/system-users/install-apps-and-generate-tokens"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://en.wikipedia.org/wiki/API_management", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
---

An MCP gateway is a proxy that sits between your AI agents and your MCP servers and puts authentication, call logging and usage limits in one place. The MCP specification, revision 2026-07-28, says a server *"MUST NOT accept or transit any other tokens"* ([MCP Authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization), read November 3, 2026), so a compliant gateway holds its own credential for every upstream server. What it can't do is decide what your metrics mean.

> **MCP gateway:** a single entry point that receives tool calls from MCP clients, verifies who is calling, applies policy (scopes, limits, tool filtering), injects the credential for the target server, and logs the call. It governs access. It does not govern the meaning of what comes back.

## What problem sends teams looking for an MCP gateway?

MCP servers spread faster than anyone can govern them.

Marketing hooked the Google Analytics MCP server into Claude. Someone in finance connected a server that reads Snowflake. The agency asked for Meta Ads access over MCP. A developer added the Shopify server in Cursor. Each connection carries its own credential, stored on the laptop of whoever set it up, and no central list says who reaches what. When the CISO asks which agents can read order data, the answer means [building an agent permission inventory](https://precisian.io/blog/en/posts/ai-agent-mcp-permissions-inventory/) from scratch, one Slack message at a time.

The second symptom shows up later. The agent answers "October revenue" with one number, finance has another, and nobody can tell which server the agent called. The first instinct is that a gateway will fix that too. It fixes half of it.

## How does an MCP gateway work under the hood?

It terminates the client's connection and opens a separate one to the target server. Policy runs in between.

The spec defines a protected MCP server as an *"OAuth 2.1 resource server"* that must validate that a token was *"issued specifically for them as the intended audience"* ([MCP Authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization)). Clients must send the `resource` parameter, set to the server's canonical URI, on every authorization and token request (RFC 8707). For a gateway, the consequence is concrete: the token your agent presents is valid for the gateway and nothing else. To talk to the GA4 server or the warehouse server, the gateway uses a different credential that belongs to it.

The MCP security guide names the forbidden shortcut: *token passthrough*, where a server accepts a client token without checking it was issued to that server and forwards it downstream. The mitigation is one line: *"MCP servers MUST NOT accept any tokens that were not explicitly issued for the MCP server"* ([MCP Security Best Practices](https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices), read November 3, 2026). One listed risk is exactly what a gateway exists to prevent: with a passed-through token, the server *"will be unable to identify or distinguish between MCP Clients"*, and the log of who called what loses its value.

Here is what vendors say their gateways do, from their official pages as of November 3, 2026, in no particular order:

| Product | What the official documentation states |
|---|---|
| Docker MCP Gateway | Runs each MCP server *"in isolated Docker containers with restricted privileges"*, injects credentials, and includes *"built-in logging and call-tracing"*. `docker mcp gateway run` ships `--log-calls` (default `true`), `--block-secrets` (default `true`), `--tools` and `--interceptor` ([Docker](https://docs.docker.com/ai/mcp-catalog-and-toolkit/mcp-gateway/), [CLI reference](https://docs.docker.com/reference/cli/docker/mcp/gateway/gateway_run/)) |
| Amazon Bedrock AgentCore Gateway | Inbound and outbound authentication in one managed service, with *"Secure Credential Exchange"* and *"built-in observability and auditing"* ([AWS](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway.html)) |
| Azure API Management | *"Rate limiting and quota enforcement"*, JWT validation, IP filtering and caching; supports MCP tools but *"doesn't support MCP resources or prompts"* ([Microsoft](https://learn.microsoft.com/en-us/azure/api-management/mcp-server-overview)) |
| agentgateway | A Linux Foundation project with *"fine-grained RBAC with CEL policy engine, rate limiting, TLS"* and OpenTelemetry tracing ([GitHub](https://github.com/agentgateway/agentgateway)) |

All four converge on three jobs: who gets in, what gets recorded, how much gets used. None claims to decide what a metric means.

## Do you actually need an MCP gateway?

Count the problem before you buy the fix. These five checks fit in an afternoon.

| Check | Where to look | Signal that a gateway pays off |
|---|---|---|
| How many MCP servers are in use | Each client's config file (Claude Desktop, Cursor, VS Code) and the OAuth app console in Google Workspace or Microsoft Entra | More than one server touching business data, set up by different people |
| Where credentials live | Environment variables and config files on laptops | Platform API tokens sitting on personal machines |
| Whether you can revoke one person's access in one place | Your offboarding checklist | Revoking means remembering every server |
| Whether anyone logs who called which tool | MCP server logs | Per-server logs with no user identity, or none at all |
| Whether any server forwards the client's token | Server code or config; look for an incoming `Authorization` header copied to the outbound request | Any hit at all: that is the token passthrough the spec forbids |

Run the last check even on a commercial product. Azure API Management's own documentation shows both ways to reach the upstream server: copy the incoming `Authorization` header with `set-header`, or fetch a credential from the credential manager with `get-authorization-context` ([Microsoft, Secure access to MCP servers](https://learn.microsoft.com/en-us/azure/api-management/secure-mcp-servers)). Which one your instance uses decides whether the gateway meets the MCP rule.

If the count comes back as one server used by one person, a gateway is one more piece of infrastructure to maintain. Apply the policy in the server itself.

## How do you set up a gateway without creating a new blind spot?

Three decisions, in this order.

**1. Identity end to end.** The agent authenticates to the gateway as the person or service it acts for, and the gateway writes that identity on every call. That is what turns a request log into an [agent audit log](https://precisian.io/blog/en/posts/mcp-logging-agent-audit-log/). Note that revision 2026-07-28 deprecated the protocol's own logging feature ([MCP Logging](https://modelcontextprotocol.io/specification/2026-07-28/server/utilities/logging)), so the record is the job of whatever executes the call, gateway or server. At minimum, each line should carry the user behind the agent, the MCP client, the tool name, the arguments, the upstream server, the timestamp and the result status. Without the arguments, you know the agent asked for revenue but not for which dates, which store or which currency.

**2. Scope per tool, not per server.** The MCP security guide lists *"Publishing all possible scopes in `scopes_supported`"* as a common mistake and recommends starting with a minimal read scope, elevating only when a privileged tool is called. In a gateway, that becomes an allowlist of tools per profile: Docker's `--tools`, or per-operation policy in Azure.

**3. Put the limit where the cost happens.** Azure's `rate-limit-by-key` counts calls over a window of at most 300 seconds ([Microsoft](https://learn.microsoft.com/en-us/azure/api-management/rate-limit-by-key-policy)), and `llm-token-limit` counts tokens, but it *"currently counts prompt and completion tokens only"* ([Microsoft](https://learn.microsoft.com/en-us/azure/api-management/llm-token-limit-policy)). Neither one sees how many bytes a query will scan in the warehouse. One tool call can scan a few rows or an entire table, and the gateway counts both as one. The cost ceiling lives in the database: in BigQuery, `maximum_bytes_billed` makes a query that estimates over the limit *"fail without incurring a charge"* ([BigQuery](https://docs.cloud.google.com/bigquery/docs/best-practices-costs)). The [query cost guardrails](https://precisian.io/blog/en/posts/query-cost-guardrails/) post covers that setting vendor by vendor.

With those three decisions in place, the gateway handles inventory, revocation, traceability and call volume.

## What can't an MCP gateway fix?

Metric definitions, which is where the number in the board deck comes from.

> **A synthetic example with round numbers.** The agent is asked "What was October revenue?" Through the gateway it has two authorized tools: the GA4 server and a warehouse server that reads Shopify orders. GA4 returns $1.0M, which is item revenue without tax or shipping. The warehouse returns $1.15M, which is Shopify's total sales, a figure that adds shipping and taxes.

The gateway authenticated both calls, logged both, and stayed under the limit. It worked as designed. Then the agent picked one, or added them, or averaged them, and nobody ever decided which "revenue" applies to that question.

The log will show exactly which tool ran. It won't show which definition should have been used, because that definition isn't written down anywhere. This is the mechanism behind what we call metric hallucination: the model doesn't make up a number, it chooses among true numbers that measure different things.

The fix is a [semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/): one versioned definition of "net revenue", with source, filters and return rules written out, exposed to the agent as the metric it should use. The gateway decides who may ask. The semantic layer decides what the answer means. Neither replaces the other, and together they make an answer auditable: the log says who asked and when, and the definition version says what the number meant that day.

## When is a gateway the wrong tool?

Four cases where it doesn't apply, or isn't enough.

**Local stdio servers.** The spec says implementations using STDIO *"SHOULD NOT follow this specification, and instead retrieve credentials from the environment"*. An MCP server running on an analyst's laptop and reading credentials from the environment never touches the gateway unless your security policy bans that mode.

**Long-lived platform credentials.** If the upstream server runs on a long-lived token, such as a Meta system user token, which Meta lets you generate with no expiration ([Meta](https://developers.facebook.com/docs/business-management-apis/system-users/install-apps-and-generate-tokens)), the gateway guards the front door while whoever holds the token can reach the data another way. You still need the credential inventory.

**Features the gateway doesn't support.** Azure API Management, for example, supports MCP tools but not resources or prompts. Servers that rely on them stay outside or lose capability.

**Metrics nobody owns.** If the business hasn't decided what revenue means, no access layer will decide it for them. The gateway just documents the disagreement better.

Precisian doesn't sell a gateway. What it delivers sits upstream: a data lake isolated per client on Precisian's infrastructure, plus a semantic layer with client-approved definitions, reachable through the client's own MCP client, API or BI tool. If your only problem is governing access to MCP servers for generic tools like Slack, Jira or GitHub, a gateway solves it and Precisian isn't the answer.

## What doesn't this article cover?

It doesn't rank gateways or compare pricing. The market moves too fast for a durable comparison, and the table above only reproduces what each vendor states. It doesn't cover model gateways (routing across LLM providers), which some products bundle into the same component. It doesn't walk through OAuth configuration step by step. And it gives no share of companies running a gateway in production: I found no survey with a published methodology that measures it.

---

If your agent answers "revenue" with a different number than finance, the first step is to count how many revenue definitions its tools expose today. [See how a semantic layer works in practice](https://precisian.io/en/demo). No contract commitment, and no promise of an answer in 30 minutes either.
