---
title: "What is an MCP server? Tools, resources, and what it should never expose"
description: "An MCP server exposes tools, resources and prompts to an AI app over stdio or HTTP. The spec makes auth optional, so the boundary is yours to draw."
slug: "what-is-an-mcp-server"
lang: "en"
translationKey: "what-is-an-mcp-server"
publishedAt: 2026-11-11
tags: ["mcp", "ai-data-access", "security", "governance", "semantic-layer"]
draft: false
llmSummary: "An MCP server is a program that exposes tools, resources and prompts to an AI application. The current MCP spec, revision 2026-07-28, defines tools as model-controlled, resources as application-controlled and prompts as user-controlled, and makes authorization OPTIONAL."
citations: ["https://modelcontextprotocol.io/specification/versioning", "https://modelcontextprotocol.io/specification/2026-07-28/server", "https://modelcontextprotocol.io/specification/2026-07-28/server/tools", "https://modelcontextprotocol.io/specification/2026-07-28/server/resources", "https://modelcontextprotocol.io/specification/2026-07-28/server/prompts", "https://modelcontextprotocol.io/specification/2026-07-28/schema", "https://modelcontextprotocol.io/specification/2026-07-28/basic/transports", "https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/stdio", "https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http", "https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization", "https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices", "https://github.com/dbt-labs/dbt-mcp"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
cta: demo
---
An MCP server is a program that exposes three kinds of things to an AI application: tools the model can call, resources the application can read into context, and prompts a user can pick. The current Model Context Protocol specification, revision **2026-07-28**, assigns each one a different controller: tools are "Model-controlled," resources "Application-controlled" and prompts "User-controlled" ([MCP spec, server overview](https://modelcontextprotocol.io/specification/2026-07-28/server), read November 11, 2026). Authorization is "**OPTIONAL**."

> **MCP server**: a process, local or remote, that speaks JSON-RPC 2.0 under the Model Context Protocol and declares capabilities (`tools`, `resources`, `prompts`) that an MCP client inside a host application discovers and uses on the model's or the user's behalf.

If you want the comparison with a plain REST API, that's a separate piece: [MCP vs API](https://precisian.io/blog/en/posts/mcp-vs-api/). This one is the entry for the server itself: what it's made of, how it talks, and where its boundary should sit. I read every page of the spec quoted here on November 11, 2026. MCP versions are dates, the identifier "indicate[s] the last date backwards incompatible changes were made," and the page names 2026-07-28 as current ([MCP versioning](https://modelcontextprotocol.io/specification/versioning)).

## What does an MCP server expose?

Three primitives. The spec's own table gives an example for each: slash commands for prompts, "File contents, git history" for resources, "API POST requests, file writing" for tools ([MCP spec](https://modelcontextprotocol.io/specification/2026-07-28/server)).

**Tools.** Functions the model can call. The client sends `tools/list` and gets, per tool, a `name`, a `description`, an `inputSchema` in JSON Schema and, optionally, an `outputSchema` and `annotations`. Then it sends `tools/call` with `name` and `arguments` ([MCP tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)). Tool names "SHOULD be between 1 and 128 characters." A failed business check comes back as a normal result with `isError: true`, so the model can read the message and retry.

**Resources.** Data identified by a URI, such as `file:///project/src/main.rs` or a database schema. The client discovers them with `resources/list` and fetches them with `resources/read`. Parameterized ones come from `resources/templates/list`, using RFC 6570 URI templates ([MCP resources](https://modelcontextprotocol.io/specification/2026-07-28/server/resources)). The host decides what enters the model's context, not the model.

**Prompts.** Templates with arguments, listed by `prompts/list` and filled by `prompts/get`. The spec says user-controlled "refers to who decides when the prompt is used, not who authors its content. Prompt content is defined by the server" ([MCP prompts](https://modelcontextprotocol.io/specification/2026-07-28/server/prompts)).

A real server shows the split. The official dbt MCP server lists Semantic Layer tools named `list_metrics`, `get_dimensions`, `get_entities`, `get_metrics_compiled_sql` and `query_metrics`, plus a separate `execute_sql` and `text_to_sql` ([dbt-labs/dbt-mcp README](https://github.com/dbt-labs/dbt-mcp), read November 11, 2026). Every one of those is a tool, so the model chooses when to call it.

## How does an MCP server talk to a client?

Over one of two standard transports, defined in the [transports overview](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports):

- **stdio.** "The client launches the MCP server as a subprocess." The server reads JSON-RPC from `stdin`, writes to `stdout`, may log to `stderr`, and "MUST NOT write anything to its `stdout` that is not a valid MCP message" ([stdio](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/stdio)). This is the local server running on a laptop next to Claude Desktop or an IDE.
- **Streamable HTTP.** "The server exposes a single HTTP endpoint (the MCP endpoint) that accepts POST," such as `https://example.com/mcp`. Each request carries an `MCP-Protocol-Version` header, plus `Mcp-Method` and, for `tools/call`, `Mcp-Name` ([Streamable HTTP](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http)). This is the remote server a vendor hosts.

Revision 2026-07-28 removed protocol-level sessions and the GET stream endpoint from Streamable HTTP. A client that wants to know what a server supports can call `server/discover`, which returns supported versions, capabilities and identity in one request ([MCP versioning](https://modelcontextprotocol.io/specification/versioning)). Explainers written in 2025 describe an `initialize` handshake and an `Mcp-Session-Id` header; neither is part of the current revision.

## Who authorizes the calls?

The spec's answer depends on the transport ([MCP authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization)):

- Authorization "is **OPTIONAL** for MCP implementations."
- Over HTTP, implementations "SHOULD" follow the spec's flow, built on OAuth 2.1. The server acts as an OAuth resource server, "MUST implement OAuth 2.0 Protected Resource Metadata (RFC9728)," and "MUST validate that access tokens were issued specifically for them as the intended audience."
- Over stdio, implementations "SHOULD NOT follow this specification, and instead retrieve credentials from the environment." In practice, an API key in an environment variable.
- Servers "MUST NOT accept or transit any other tokens." The [security best practices](https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices) page calls the violation "token passthrough" and lists, among common scope mistakes, "Publishing all possible scopes in `scopes_supported`" and "Using wildcard or omnibus scopes."

So an MCP server can be perfectly spec-compliant and have no authentication at all. That's the first thing to check before connecting one to company data.

## How is an MCP server different from an API, a plugin or an agent?

| | MCP server | REST API | Agent | BI tool |
|---|---|---|---|---|
| Who calls it | An MCP client, on the model's choice (tools) or the app's (resources) | Code a developer wrote | It calls servers and APIs itself | A person clicking |
| Discovery | `tools/list`, `resources/list`, `prompts/list` at runtime | Docs or an OpenAPI file | Not applicable | Fixed menus and reports |
| Wire format | JSON-RPC 2.0 over stdio or Streamable HTTP | Vendor-specific | Whatever its tools use | Vendor-specific |
| Auth in the spec | Optional; OAuth 2.1 over HTTP, environment over stdio | Defined by each vendor | Inherits its tools' credentials | Per-user login |
| Holds business definitions | Only if its author put them there | Only if its author put them there | No | In its own model |

Sources: [MCP tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools), [transports](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports) and [authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization), read November 11, 2026.

The trade-off between letting an agent ask anything and giving people a fixed report is in [MCP server vs BI tool](https://precisian.io/blog/en/posts/mcp-server-vs-bi-tool/).

## What should an MCP server never expose?

The spec gives the floor. Servers "MUST" validate all tool inputs, implement access controls, rate limit invocations and sanitize outputs ([MCP tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)). For resources, servers "MUST validate all resource URIs" and "MUST sanitize file paths to prevent directory traversal attacks" ([MCP resources](https://modelcontextprotocol.io/specification/2026-07-28/server/resources)). The rest is design. For a server that sits on marketing and sales data, I'd draw the line at five things:

1. **A write tool next to read tools.** Annotations don't protect you. The schema says `readOnlyHint` defaults to `false`, `destructiveHint` defaults to `true`, and "all properties in `ToolAnnotations` are **hints**," adding that clients "should never make tool use decisions based on `ToolAnnotations` received from untrusted servers" ([MCP schema](https://modelcontextprotocol.io/specification/2026-07-28/schema)). If the credential can write, assume the model can too.
2. **Raw SQL against production tables.** A generic `execute_sql` tool turns every question into a fresh interpretation of your schema. [Governed text-to-SQL](https://precisian.io/blog/en/posts/governed-text-to-sql/) covers what to put in front of it.
3. **Personal data the question doesn't need.** Email, phone and address columns rarely answer a revenue question. See [customer context without PII](https://precisian.io/blog/en/posts/ai-agent-customer-context-without-pii/).
4. **Another client's rows.** One server serving several companies needs isolation below the tool, not a `client_id` argument the model fills in. That's the case for [per-tenant isolation](https://precisian.io/blog/en/posts/per-tenant-isolation-mcp/).
5. **Tokens and secrets in parameters.** The spec warns that server developers "SHOULD NOT mark sensitive parameters (passwords, API keys, tokens, PII) with `x-mcp-header`," because header values "are visible to network intermediaries" ([MCP tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)).

A [gateway in front of your MCP servers](https://precisian.io/blog/en/posts/mcp-gateway/) can enforce some of this centrally, and the [MCP Inspector](https://precisian.io/blog/en/posts/mcp-inspector-test-before-production/) shows you what `tools/list` actually returns before anyone connects a model.

## What is an MCP server not?

**Not a metric definition.** An `inputSchema` can say a tool accepts `metric: "revenue"`. It can't say whether revenue includes shipping, refunds or Amazon orders. When three servers each answer "revenue" by their own rule, you get [three MCPs, three revenues](https://precisian.io/blog/en/posts/three-mcps-three-revenues/).

**Not a security boundary on its own.** Tool annotations are hints, authorization is optional, and the human-in-the-loop requirement is a client-side "SHOULD": "there SHOULD always be a human in the loop with the ability to deny tool invocations" ([MCP tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)).

**Not the data.** The server is a door. What sits behind it (a warehouse, a SaaS API, a spreadsheet) decides whether the answer is right.

## When does an MCP server start to matter for a business?

As soon as someone outside the data team connects an AI assistant to company data, which on most teams already happened before anyone wrote a policy. From then on, the useful questions are which servers are connected, with which credentials, and what each one says revenue is.

The failure is quiet. The model calls a real tool, gets a real number computed on a different rule than finance uses, and presents it with full confidence. We call that [metric hallucination](https://precisian.io/blog/en/posts/metric-hallucination/). At Precisian, the MCP server sits on top of a per-client isolated lake on our infrastructure and a semantic layer where each metric is defined once and versioned. The client's own AI (Claude, ChatGPT, Copilot or an in-house agent) reads that definition before it computes. The same layer also feeds an API and a direct BI connection.

## What does this article not cover?

It doesn't cover client-side features such as sampling, elicitation and roots, which revision 2026-07-28 moved into multi round-trip requests. It doesn't compare MCP SDKs or hosting options, and it doesn't review specific vendor servers beyond the dbt example. The spec quoted here is the 2026-07-28 revision as read on November 11, 2026; a new dated revision can rename methods, and this page will be updated when one ships.

If you're about to connect an assistant to sales or ad data, start by running `tools/list` against the server and asking which of those tools could write, and which metric definition each one applies. [Watch a governed MCP answer](https://precisian.io/en/demo?utm_source=blog&utm_medium=cta&utm_campaign=what-is-an-mcp-server&utm_content=texto) over an isolated lake, with no contract commitment.
