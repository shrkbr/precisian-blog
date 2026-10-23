---
title: "Data governance for ecommerce teams: the minimum that actually works"
description: "Data governance records who decides what about each dataset. For ecommerce, the useful minimum is five records: owner, definition, access, retention, change."
slug: "data-governance-ecommerce"
lang: "en"
translationKey: "data-governance"
publishedAt: 2026-10-23
tags: ["governance", "privacy", "ecommerce", "data-contract", "audit", "semantic-layer"]
draft: false
llmSummary: "Data governance is the set of recorded decisions on owner, definition, access, retention and change for each dataset. Under the CCPA (Cal. Civ. Code 1798.100), a covered business must disclose how long it retains each category of personal information, so retention is no longer a default."
citations: ["https://cppa.ca.gov/regulations/pdf/cppa_act.pdf", "https://dama.org/learning-resources/dama-data-management-body-of-knowledge-dmbok/", "https://help.shopify.com/en/manual/your-account/users/roles/permissions/store-permissions", "https://support.google.com/analytics/answer/7667196"]
about: ["https://en.wikipedia.org/wiki/Data_governance", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 6
---

Data governance is the set of recorded decisions about who owns each dataset, how each metric is defined, who can access it, how long it is kept and who approves a change. For US ecommerce, one of those decisions is already a legal duty: under the California Consumer Privacy Act, a covered business must disclose "the length of time the business intends to retain each category of personal information" ([Cal. Civ. Code §1798.100(a)(3), CPPA text effective July 15, 2024](https://cppa.ca.gov/regulations/pdf/cppa_act.pdf)).

> **Data governance**: the decisions about a company's data (owner, definition, access, retention and change), written down in one place that every person and system checks before using the data, instead of living in the memory of whoever was in the meeting.

## What is data governance, according to the textbook?

The standard reference is the DAMA-DMBOK, DAMA International's body of knowledge for data management. It is in its 2nd edition, a revision launched in 2024, and DAMA says the 3.0 project started in 2025 ([DAMA](https://dama.org/learning-resources/dama-data-management-body-of-knowledge-dmbok/)).

*The definition widely attributed to the DMBOK describes data governance as "the exercise of authority and control (planning, monitoring, and enforcement) over the management of data assets." I could not verify that wording on a public DAMA page, and secondary sources quote it both with and without the phrase "shared decision-making." Treat it as unconfirmed.*

The textbook is correct, and it covers everything. It positions governance as the discipline that steers every other area of data management: architecture, quality, metadata, security, integration. That fits a bank with a thousand analysts. For a fifteen-person Shopify brand that also sells on Amazon and closes the month in a spreadsheet, reading the DMBOK cover to cover produces a program nobody finishes.

The law points to the same exit. The CCPA requires that collection, use and retention of personal information be "reasonably necessary and proportionate to achieve the purposes" for which it was collected ([§1798.100(c)](https://cppa.ca.gov/regulations/pdf/cppa_act.pdf)). A governance program can be held to the same test.

## What is the minimum that works for an ecommerce team?

Five records. If you have all five in writing, you have data governance. If you don't, no tool you buy will stand in for them.

**1. An owner per metric.** Net revenue, CAC, repeat purchase rate: each one gets a person who breaks the tie when two teams disagree. It doesn't have to be someone on the data team. Often it is the controller or the head of ecommerce. A metric with no owner drifts again next quarter, because nobody has the authority to end the argument.

**2. A written, versioned definition.** What goes in and what stays out: shipping, sales tax, cancellations, returns, Amazon orders. And which date rules: order, payment or fulfillment. Versioned means it has history: when the rule changed, who decided and why. That is what separates a drop in sales from a drop in definition. The format is in [what a data contract enforces](https://precisian.io/blog/en/posts/what-is-a-data-contract/), and the most contested case, revenue, in [why marketing and finance never close the same number](https://precisian.io/blog/en/posts/marketing-finance-revenue-definition/).

**3. Access by role.** Who sees identifiable customer data, who sees only aggregates, who can export. Shopify gives you part of this: Reports and customer viewing are separate permissions. But its own documentation names the limits: "within a store you can't restrict permissions to individual orders, products, or customers," and "You can't specify which reports users can access" ([Shopify](https://help.shopify.com/en/manual/your-account/users/roles/permissions/store-permissions)). And the moment the data is exported to a spreadsheet, a BI tool or an AI agent, the permission stays behind.

**4. A retention decision.** How long each kind of data is kept, decided by someone rather than inherited from a vendor default. On a standard GA4 property, event and user data can be kept for 2 or 14 months, and that setting affects explorations and funnel reports, not standard aggregated reports ([Google](https://support.google.com/analytics/answer/7667196)). If nobody on your team has opened that screen, the decision was made for you. Timelines by data type are in [how long to keep marketing data](https://precisian.io/blog/en/posts/marketing-data-retention-how-long/).

**5. A change log.** One line per change: date, what changed (definition, source, permission, retention), who approved it. It is the cheapest of the five and the one most often skipped. Without it, the other four go stale without anyone noticing.

| Record | Question it answers | Where it usually lives today | Acceptable minimum |
|---|---|---|---|
| Owner per metric | Who breaks the tie? | Nobody, or whoever argues loudest | One name per core metric |
| Versioned definition | What goes into the number? | In an analyst's head | A file with the rule, date and author |
| Access by role | Who sees what? | Separately inside each tool | A role list enforced outside the platform too |
| Retention decision | For how long? | The vendor default | A written period per data type |
| Change log | What changed, and when? | Nowhere | One line per change, with an approver |

None of the five needs a committee, a catalog product or a new hire. It requires someone to decide and write it down.

## Are data governance, AI governance and security the same thing?

No, and the confusion is expensive because each one gets bought as if it solved the other two.

| Criterion | Data governance | AI governance | Information security |
|---|---|---|---|
| Core question | Who decides about the data, under which rule | What an AI system may do and read | Who can get in, and what happens if they do |
| Object | Metric, definition, owner, retention | Model, agent, use, read scope | Infrastructure, credentials, network |
| Typical failure | Two revenue numbers, both "correct" | An agent queries a table nobody approved | A breach through an exposed credential |
| Depends on the others? | It is the base | Depends on data governance | Protects both, defines neither |

AI governance is, in practice, data governance applied to a consumer that never hesitates. A person who sees an odd revenue figure gets suspicious and asks. An agent answers with the same confidence it would have if it were right. That is why the five questions of [AI data governance](https://precisian.io/blog/en/posts/ai-data-governance/) repeat four of these five records.

Security is not governance either. Encryption, MFA and backups keep outsiders from reading the data. They do nothing to stop two insiders from reading the same data under two different rules.

## What is data governance not?

Buying a catalog tool doesn't create governance. A catalog helps once there are decisions to catalog; before that, it lists fields nobody has defined.

A monthly committee isn't enough either. Without a written record it produces minutes, and no system reads minutes before it computes a number.

Privacy compliance is a separate job, because CCPA covers personal information. Much of what stalls an ecommerce team lives in data that isn't personal at all: revenue, ad spend, margin by SKU.

Data quality is a neighbor, and governance depends on it. Quality asks whether the number is correct under the rule. Governance decides what the rule is.

## When does this start to matter for your team?

As I read it, at three points, and usually before anyone names the problem.

**When a second source reports the same number.** Your own store and Amazon, GA4 and the ERP, the ad platforms and finance. With one source, the definition can live in one person's head. With two, it diverges.

**When a second person answers the same question.** A synthetic example with round numbers: marketing closes September at $1.2 million in revenue by order date; finance closes at $1.05 million by fulfillment date, net of shipping. Both are right by their own rules. Without an owner and a written definition, the meeting argues about which number counts instead of what to do about it.

**When an AI agent starts querying the data on its own.** At that point the five records stop being good practice and become the only thing standing between a question and a wrong answer delivered with confidence. That failure is called [metric hallucination](https://precisian.io/blog/en/posts/metric-hallucination/).

At Precisian, three of the five records are built into the architecture. Definitions live in a versioned [semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/), on top of a per-client isolated data lake running on Precisian's infrastructure, and access through MCP, API or the client's own BI passes through a single point with an [audit trail](https://precisian.io/blog/en/posts/answer-lineage-audit-trail/). Ownership and retention remain your company's call, as they should.

## What does this article not cover?

It is not legal advice. Whether CCPA or another state privacy law applies to you, and what your notices must say, is a question for counsel.

It does not compare catalog or data quality tools, and it does not summarize the DMBOK. The scope is the minimum for a mid-sized ecommerce operation. A regulated business, such as a bank or a healthcare company, needs more than this.

If marketing and finance bring different numbers to the same meeting, the first step is to pick the most contested metric and write its five records. [Book a conversation about your setup](https://calendar.notion.so/meet/rodrigomartucci/precisian-io), with no contract commitment attached.
