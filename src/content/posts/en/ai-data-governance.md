---
title: "AI data governance: what the policy has to cover once an agent reads customer data"
description: "AI data governance decides what a model may read, not just who may use it. Five questions cover it: scope, isolation, retention, audit trail, metrics."
slug: "ai-data-governance"
lang: "en"
translationKey: "ai-data-governance"
publishedAt: 2026-10-14
tags: ["governance", "ai-data-access", "data-isolation", "audit", "data-security"]
draft: false
llmSummary: "NIST's Generative AI Profile (NIST AI 600-1, July 2024) tells organizations to establish policies for collection, retention and minimum quality of data. AI data governance answers five questions an acceptable-use policy skips: scope, isolation, retention, audit trail and metric definition."
citations: ["https://www.nist.gov/itl/ai-risk-management-framework", "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf", "https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf", "https://www.aicpa-cima.com/resources/download/2017-trust-services-criteria-with-revised-points-of-focus-2022", "https://support.google.com/analytics/answer/7667196", "https://arxiv.org/abs/2604.25149"]
about: ["https://en.wikipedia.org/wiki/Data_governance", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

AI data governance is the part of an AI policy that decides what a model may read, not only who may use it and for what. Most policies stop before that line. NIST's Generative AI Profile, released on July 26, 2024, tells organizations to "establish policies for collection, retention, and minimum quality of data" (action MP-4.1-005), which is a data question, not a usage question ([NIST AI 600-1](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)).

> **AI data governance**: the recorded decisions about which data an AI system can reach, under whose definitions, for how long and with what record, so that any answer it gives can be explained later by someone who was not in the conversation.

## What does a typical AI policy cover, and what does it miss?

The standard acceptable-use policy has four sections: approved tools, a ban on pasting confidential information into public chatbots, human review before anything ships, and training. Every one of them governs **use**. And every one assumes the same thing: data reaches the model because a person pasted it there.

That assumption breaks the day the agent gets direct access, through an MCP server or an API. Nobody pastes anything. The agent queries the Shopify orders table on its own, as many times as it needs to answer, and "don't paste customer data into ChatGPT" has nothing left to prohibit. The question shifts from "what may an employee send the model" to "what may the model go and fetch".

I have watched agents wired to data without that second half. What leaks is whatever sits within the agent's reach. If the grant is "read access to the warehouse", the agent reads the warehouse.

| Criterion | Acceptable-use policy | AI data governance |
|---|---|---|
| Core question | Who may use AI, and for what | What the agent can reach, and under which rules |
| Enforced by | The person, through discipline | The system, through permissions |
| Typical failure | Someone pastes sensitive data into a chat | The agent queries a table nobody approved |
| Evidence | Training records and signed attestations | A log of every query |
| Changes when the agent gets MCP access? | No | Exists because of it |

## What does the NIST AI RMF actually ask for?

The AI Risk Management Framework 1.0 was released on January 26, 2023, is "intended for voluntary use", and is being revised as part of the White House AI Action Plan, with no publication date announced ([NIST](https://www.nist.gov/itl/ai-risk-management-framework)). Voluntary means nobody fines you for skipping it. Its value is vocabulary your auditor, your customer's security team and your board already recognize.

The framework splits AI risk management into four functions, Govern, Map, Measure and Manage, broken into categories and subcategories that NIST says "do not constitute a checklist" ([NIST AI 100-1](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf)). A handful of them speak directly to data an agent reads:

| Reference | What it says | Where it lands |
|---|---|---|
| GOVERN 1.6 | "Mechanisms are in place to inventory AI systems" | You can't scope what you haven't listed |
| MAP 4.1 | Legal and technology risks of components are mapped, "including the use of third-party data or software" | Third-party data feeding the agent |
| MEASURE 2.10 | "Privacy risk of the AI system ... is examined and documented" | Personal data in reach of the agent |
| GV-6.1-007 (GAI Profile) | "Inventory all third-party entities with access to organizational content" | Agencies, vendors, model providers |
| MP-4.1-005 (GAI Profile) | "Establish policies for collection, retention, and minimum quality of data" | Retention and data quality |

Sources: [NIST AI 100-1](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf) and [NIST AI 600-1](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf).

The Generative AI Profile also defines 12 risks that generative AI creates or makes worse. Number 4 is data privacy: "leakage and unauthorized use, disclosure, or de-anonymization" of personal or sensitive data ([NIST AI 600-1](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)). An agent with standing read access to a customer table falls under it directly.

## Where does SOC 2 fit in?

SOC 2 is not a law either. It is an attestation report in which an independent auditor evaluates controls against the AICPA's Trust Services Criteria, which cover "security, availability, processing integrity, confidentiality, or privacy" ([AICPA](https://www.aicpa-cima.com/resources/download/2017-trust-services-criteria-with-revised-points-of-focus-2022)). If you sell software to US mid-market or enterprise buyers, their security review will often ask for one.

The practical catch is scope. The auditor tests the controls in the system you describe. An agent reading production data through a connector someone set up last quarter is either in that description, with access controls and logging the auditor can test, or it sits outside the report entirely. The five questions below are what turn it into something you can put in the description.

## Which five questions does the policy have to answer?

A policy that covers data answers five questions, in writing, before the agent is connected. The first four have an anchor in NIST. The fifth has none, and it is the one that produces wrong numbers.

### 1. Scope: what can the agent read?

Write an allowlist: which tables, which metrics, which columns. An agent answering "which channel drove the most revenue in September" needs no customer names, emails or shipping addresses. Identifying columns stay out by default and come in by documented exception, which is what MEASURE 2.10 asks you to examine before the fact rather than after.

The answer that doesn't hold up is "the agent has read access to the database". The protocol won't draw that line for you either: the MCP specification makes authorization optional, as covered in [how to connect AI to production data](https://precisian.io/blog/en/posts/connect-ai-to-production-data/).

### 2. Isolation: whose data can it reach?

In US ecommerce, unauthorized access is rarely an outside attacker. It is the agency running three DTC brands whose agent, asked about brand A, returns a row from brand B. Or the company with a Shopify store and an Amazon seller account in separate entities, where each team should see only its own.

Isolation has to be enforced by the system, not requested in the prompt. "Filter to client X" is an instruction, and instructions get ignored. The design that holds is in [per-tenant isolation for MCP](https://precisian.io/blog/en/posts/per-tenant-isolation-mcp/).

### 3. Retention: how long do the data and the answer live?

MP-4.1-005 names retention explicitly ([NIST AI 600-1](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)). With an agent in the loop there are two clocks. One belongs to the data it reads, and the tool often set it already: standard GA4 properties keep event data for 2 or 14 months ([Google](https://support.google.com/analytics/answer/7667196)). The other belongs to what the agent produces: the prompt, the query result and the answer stored in the model provider's history.

Policies usually govern the first clock. The second holds personal data just the same, somewhere nobody inventoried. Limits by data type are in [how long to keep marketing data](https://precisian.io/blog/en/posts/marketing-data-retention-how-long/).

### 4. Audit trail: can you rebuild the answer later?

The GAI Profile suggests "real-time auditing tools" that help track "the lineage and authenticity of AI-generated data" (MG-2.2-007), ([NIST AI 600-1](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)), and MANAGE 4.1 in the core framework asks for post-deployment monitoring plans ([NIST AI 100-1](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf)). For an agent, a usable record answers four things about every answer: who asked, which definition was applied, which data was read, and when.

Chat history answers none of the four reliably. It keeps the text of the conversation, not the query that produced the number. Field by field, see [answer lineage and the AI audit trail](https://precisian.io/blog/en/posts/answer-lineage-audit-trail/).

### 5. Metric definition: whose rule does the number follow?

No framework asks this directly. The closest NIST gets is MS-2.5-005, which asks you to verify that retrieval-augmented generation data "is grounded" ([NIST AI 600-1](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)). Grounded data can still carry two columns called `revenue`, and the agent will pick one with the same confidence it would have had picking the right one. A paired benchmark published in April 2026 tested three frontier models with and without business definitions ([Rumiantsau and Fokeev, 2026](https://arxiv.org/abs/2604.25149)). Supplying the definitions as context raised answer accuracy from 45.5–50.5% to 67.7–68.7%.

The answer that holds is a versioned definition with an owner, read by the agent before it computes. The failure without it has a name: [metric hallucination](https://precisian.io/blog/en/posts/metric-hallucination/).

| Question | Answer that fails | Answer that holds | Closest NIST anchor |
|---|---|---|---|
| Scope | "Read access to the database" | Allowlisted tables and metrics, no identifying columns by default | MEASURE 2.10, GOVERN 1.6 |
| Isolation | "The prompt says to filter by client" | Separation enforced by the system, client by client | GV-6.1-007 |
| Retention | "We follow the IT policy" | Separate limits for data read and answers generated | MP-4.1-005 |
| Audit trail | "Chat history is saved" | Record of who asked, which definition, which data, when | MG-2.2-007, MANAGE 4.1 |
| Metric definition | "The agent knows what revenue is" | Versioned definition with an owner, read before computing | none directly |

## What is AI data governance not?

AI data governance is more than an ethics charter or an approved-tools list. A principle with no matching permission stops no query, and the tools list names which model may be used without saying what it reaches once connected.

A SOC 2 report doesn't fill the role either. It attests to controls you described; it does not decide what those controls should be.

The contract with the model provider is still needed, because it decides where data rests and whether it may be used for training.

## When does this start to matter for your team?

At three moments, and the first usually arrives before anyone notices.

**When the agent starts reading on its own.** While a person copies and pastes, an acceptable-use policy is enough. The day someone connects the agent through MCP or an API, all five questions become mandatory, because nobody stands between the model and the data anymore.

**When more than one company shares the base.** An agency with several clients, a holding company with several brands, a Shopify store and an Amazon account under different entities. Isolation stops being a detail.

**When the answer turns into a budget decision.** A synthetic example with round numbers: if the agent adds order-date revenue to invoice-date revenue in a question about the month, next week's budget cut rests on a figure nobody can reconstruct. Without a trail and a definition, there is no way to show where the error came in.

At Precisian, three of the five answers are architectural: each client's data lake is isolated on Precisian's infrastructure, definitions live in a versioned semantic layer, and MCP and API access passes through a point that keeps an audit trail. Scope and retention remain your call, as they should.

## What does this article not cover?

It is not legal advice. It does not map state privacy laws such as California's, sector rules, or any AI-specific statute, and it does not claim any law requires the NIST framework.

The AI RMF is under revision, so subcategory numbers quoted here may move in the next version. The full SOC 2 criteria text sits behind an AICPA download, so I don't quote individual control numbers from it.

And it leaves model training and cross-border transfers aside. For the Brazilian side of that question, see the post on [LGPD and AI with customer data](https://precisian.io/blog/pt-BR/posts/lgpd-ia-dados-de-cliente/) (in Portuguese).

If your AI policy says who may use the agent but not what it may read, the first step is to list what it reaches today, table by table, and compare that with what it should reach. [Book a conversation about your setup](https://calendar.notion.so/meet/rodrigomartucci/precisian-io), with no contract commitment.
