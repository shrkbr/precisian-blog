---
title: "MCP vs API: what changes when an AI agent is the client"
description: "MCP doesn't replace your API; most MCP servers call one. What changes is who writes the call: a developer at build time, or a model at runtime."
slug: "mcp-vs-api"
lang: "en"
translationKey: "mcp-vs-api"
publishedAt: 2026-11-03
tags: ["mcp", "ai-data-access", "integration", "semantic-layer", "security"]
draft: false
llmSummary: "MCP does not replace APIs; most MCP servers wrap one. The 2026-07-28 MCP spec defines tools as model-controlled: the model reads name, description and inputSchema from tools/list and decides when to send tools/call. With an API, a developer makes that decision in code."
citations: ["https://modelcontextprotocol.io/specification/2026-07-28", "https://modelcontextprotocol.io/specification/versioning", "https://modelcontextprotocol.io/specification/2026-07-28/server/tools", "https://modelcontextprotocol.io/specification/2026-07-28/changelog", "https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization", "https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/security-considerations", "https://modelcontextprotocol.io/specification/2026-07-28/basic/transports", "https://modelcontextprotocol.io/community/governance", "https://www.anthropic.com/news/model-context-protocol", "https://github.com/googleanalytics/google-analytics-mcp", "https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/runReport", "https://shopify.dev/docs/api/admin-graphql/latest/queries/shopifyqlQuery", "https://spec.openapis.org/oas/latest.html", "https://arxiv.org/abs/2605.22333"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://en.wikipedia.org/wiki/API", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 6
cta: ficha
updatedAt: 2026-11-08
---
MCP and APIs are not competing options: most MCP servers call an API underneath. What changes is who writes the call. With an API, a developer decides at build time which endpoint, fields and filters to use. With MCP, the model decides at runtime. The current Model Context Protocol spec, revision 2026-07-28, defines tools as "model-controlled," meaning the model "can discover and invoke tools automatically" ([MCP spec, read Nov 3, 2026](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)).

> **MCP (Model Context Protocol)**: an open specification, built on JSON-RPC 2.0 messages, that standardizes how an AI application discovers and calls tools, reads data and uses prompt templates exposed by a server. It is stewarded as "Model Context Protocol a Series of LF Projects, LLC" under the Apache 2.0 license.

## Where did MCP come from, and which version is current?

Anthropic open-sourced the protocol on November 25, 2024, calling it "a new standard for connecting AI assistants to the systems where data lives" ([Anthropic](https://www.anthropic.com/news/model-context-protocol)). The project's governance page now lists it as a series of LF Projects, LLC, with the specification under Apache 2.0 and steering seats held by individuals rather than companies ([MCP governance](https://modelcontextprotocol.io/community/governance)).

Versions are dates. The identifier uses `YYYY-MM-DD` to mark the last backwards-incompatible change, and the current version as of November 3, 2026 is **2026-07-28** ([MCP versioning](https://modelcontextprotocol.io/specification/versioning)). That matters when you read older explainers. The previous revision, 2025-11-25, opened every connection with an `initialize` handshake and kept a session. Revision 2026-07-28 removed both: every request now carries its own protocol version and client capabilities in `_meta` ([changelog](https://modelcontextprotocol.io/specification/2026-07-28/changelog)).

## How does an MCP call actually work?

There are three roles. The **host** is the AI application (Claude, ChatGPT, your own agent). The **client** is the connector inside it. The **server** provides context and capabilities ([MCP spec](https://modelcontextprotocol.io/specification/2026-07-28)). Servers expose three primitives, each with a different owner:

- **Tools** are "model-controlled": the model chooses to call them.
- **Resources** are "application-driven": the host decides what enters context.
- **Prompts** are "user-controlled": a person picks a template.

A tool call takes two methods. The client sends `tools/list` and gets back, for each tool, a `name`, a plain-text `description` and an `inputSchema` written in JSON Schema. The model reads that list, picks the tool that fits the question and fills in the arguments. The client then sends `tools/call` with `name` and `arguments` and hands the result back to the model ([MCP tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)).

For transport, the spec defines **stdio**, where the server runs as a subprocess on the user's machine, and **Streamable HTTP**, where "each message is an HTTP POST to a single MCP endpoint" ([MCP transports](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports)).

Google's official Analytics MCP server exposes a tool named `run_report`, which its README describes as "Runs a Google Analytics report using the Data API" ([googleanalytics/google-analytics-mcp](https://github.com/googleanalytics/google-analytics-mcp)). Underneath, that is the same `POST https://analyticsdata.googleapis.com/v1beta/{property=properties/*}:runReport` any integration would send ([Google Analytics Data API](https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/runReport)). The data and the endpoint are unchanged; the model now picks the dimensions, metrics and date range.

## MCP vs API: what changes, line by line?

An API is a contract between a system and programs a developer writes. MCP is a contract between a server and a model that decides on its own, at runtime.

| | API (REST, GraphQL) | MCP |
|---|---|---|
| Who decides the call | A developer, in code, before it runs | The model, at runtime, from the user's question |
| How capabilities are discovered | Docs read by a person; an [OpenAPI](https://spec.openapis.org/oas/latest.html) description if one exists | `tools/list` returns name, description and `inputSchema` on demand |
| Wire format | Each API has its own endpoints, verbs and pagination | JSON-RPC 2.0, the same for every server |
| Authorization | Set by each vendor (API key, OAuth, token) | "OPTIONAL"; when present, OAuth 2.1 over HTTP and environment credentials over stdio |
| State | Depends on the API | Stateless as of 2026-07-28; each request carries version and capabilities |
| What the description does | Guides the person writing code | Becomes an instruction the model reads to choose a tool |
| How failure shows up | Wrong endpoint, failing test | Wrong tool or filter, an answer that still looks right |

Sources: [MCP tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools), [MCP authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization) and the [2026-07-28 changelog](https://modelcontextprotocol.io/specification/2026-07-28/changelog), read Nov 3, 2026.

On authorization, the spec says in capitals that authorization "is OPTIONAL for MCP implementations" ([MCP authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization)). When the server calls an upstream API, it needs its own token for it, and it "MUST NOT pass through the token it received from the MCP client" ([MCP security considerations](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/security-considerations)). In practice, MCP adds a credential on top of the API's own.

## What is MCP not?

**Not a data connector by itself.** An MCP server exposes what its author chose to expose. Shopify's sales analytics live in the Admin GraphQL API's `shopifyqlQuery`, behind the `read_reports` scope ([Shopify](https://shopify.dev/docs/api/admin-graphql/latest/queries/shopifyqlQuery)), and none of Shopify's official MCP servers is built to answer a merchant's revenue question ([Shopify's MCP servers explained](https://precisian.io/blog/en/posts/shopify-mcp-servers-explained/)).

**Not a security layer.** The spec lists what servers "MUST" do (validate inputs, implement access controls, rate limit, sanitize outputs) and concedes that "MCP itself cannot enforce these security principles at the protocol level" ([MCP spec](https://modelcontextprotocol.io/specification/2026-07-28)). A measurement study submitted May 21, 2026 found 7,973 live remote MCP servers, 40.55% of which exposed tools without any authentication ([arXiv 2605.22333](https://arxiv.org/abs/2605.22333), preprint). Scopes remain your job; see [MCP security for marketing data](https://precisian.io/blog/en/posts/mcp-security-marketing-data/).

**Not a metric definition.** An `inputSchema` says a tool accepts a metric name and a date range. It does not say whether "revenue" includes shipping, refunds or Amazon sales. That rule lives outside the protocol.

**Not a BI replacement.** A dashboard answers the question someone anticipated; an MCP server opens the door to the one nobody did. The trade-off is laid out in [MCP server vs BI tool](https://precisian.io/blog/en/posts/mcp-server-vs-bi-tool/).

## Why does the agent-as-client shift matter for data teams?

Because an API integration makes its interpretation mistake once, in code that someone reviews. An agent can make it on every question, unreviewed. The engineer wiring the GA4 Data API into a revenue report picks "revenue" once and ships it. Over MCP, the model picks again in every conversation, guided by a text description.

We call the result [metric hallucination](https://precisian.io/blog/en/posts/metric-hallucination/): a number computed correctly on the wrong rule. The model picks a real slice of data, just a different one from what your finance team uses. GA4 is the clearest case, since `run_report` returns what the property has already modeled and the assistant presents it as a count ([Google Analytics MCP limits](https://precisian.io/blog/en/posts/google-analytics-mcp-limits/)).

Connect Google Ads, Meta and GA4 to the same assistant and you get three revenue numbers, each on its vendor's attribution window. The protocol delivers all three without complaint, because each is a valid tool result. The arithmetic is in [three MCPs, three revenues](https://precisian.io/blog/en/posts/three-mcps-three-revenues/).

At Precisian, one semantic layer feeds three access paths: API, MCP server and a direct connection to the client's BI. Revenue is defined once, versioned, and every consumer, human or agent, reads the same rule before computing.

## When do you need MCP, and when is an API enough?

**An API is enough** when the question is known and repeats: Monday's report, the nightly warehouse load, the Shopify-to-ERP sync. Deterministic, reviewed, tested code is cheaper and more predictable than a model deciding on every run.

**MCP earns its place** when the question changes every time and the person asking doesn't code. The VP of ecommerce who wants campaign spend against category margin at 4 p.m. on a Tuesday is the use case. Nobody could have written that call in advance.

**MCP needs groundwork** when more than one definition of a metric is in circulation. Before connecting, answer three questions:

1. Which metric definition does the tool apply, and is it written down somewhere other than a person's head?
2. Which credential does the server use, and is it read-only?
3. Who logs each `tools/call`, under which identity? (See [how to log every agent query](https://precisian.io/blog/en/posts/mcp-logging-agent-audit-log/).)

## What does this article not cover?

It doesn't compare specific MCP servers or clients. It skips the features deprecated in revision 2026-07-28 (roots, sampling and logging, listed in the [changelog](https://modelcontextprotocol.io/specification/2026-07-28/changelog)) and optional extensions such as Tasks and MCP Apps. And it describes the spec as of November 3, 2026: because versions are dates, a new revision can rename the methods quoted here, and this page will be updated when that happens.

---

If your team already connected an AI assistant to GA4 or your ad accounts and got numbers finance doesn't recognize, start by comparing the definition the tool applies with the one your business uses. What Precisian includes, and what it costs, is on the [pricing page](https://precisian.io/en/pricing?utm_source=blog&utm_medium=cta&utm_campaign=mcp-vs-api&utm_content=texto), with no contract commitment.
