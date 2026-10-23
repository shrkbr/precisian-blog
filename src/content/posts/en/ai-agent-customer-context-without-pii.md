---
title: "How to give an AI agent customer context without exposing PII"
description: "Cohorts, segments and LTV all come from a pseudonymous ID. An agent almost never needs a name, email, phone number or address to answer them."
slug: "ai-agent-customer-context-without-pii"
lang: "en"
translationKey: "agent-pii"
publishedAt: 2026-10-23
tags: ["privacy", "ai-data-access", "governance", "data-security"]
draft: false
llmSummary: "NIST SP 800-122 defines PII as information that can identify a person or is linked or linkable to one. The FTC says hashing a common identifier like an email does not make it anonymous. AI agents can answer cohort and LTV questions from a keyed pseudonymous ID instead."
citations: ["https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-122.pdf", "https://www.ftc.gov/policy/advocacy-research/tech-at-ftc/2024/07/no-hashing-still-doesnt-make-your-data-anonymous", "https://dataprivacylab.org/projects/identifiability/paper1.pdf", "https://pmc.ncbi.nlm.nih.gov/articles/PMC6650473/", "https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-spans.md", "https://genai.owasp.org/llmrisk/llm022025-sensitive-information-disclosure/"]
about: ["https://en.wikipedia.org/wiki/Personal_data", "https://en.wikipedia.org/wiki/Pseudonymization", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
---

An AI agent answering a business question almost never needs a customer's name, email, phone number or shipping address. Cohorts, segments and lifetime value all come from a pseudonymous customer ID, and the identifying columns can stay out of the model's context entirely. NIST SP 800-122 gives the working definition: PII is information that can "distinguish or trace an individual's identity," plus anything "linked or linkable" to one ([NIST SP 800-122, April 2010](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-122.pdf)).

> **Pseudonymization** replaces direct identifiers with a code that can be linked back to the person only through separate information, such as a secret key or a lookup table, kept under its own access controls. Pseudonymous data is still personal data to whoever holds the key.

That "linkable" clause is the whole problem. Stripping the email column is easy. Making sure what's left can't be tied back to a person is the actual work, and it is the step a plain hash of the email skips.

A note on scope: [NIST SP 800-122](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-122.pdf) is guidance written for federal agencies, not a statute that binds a Shopify brand. US privacy obligations for a private company depend on the states it sells into and the sector it operates in, and this article doesn't map them. The definition is used here because it is precise and widely adopted.

## How does the problem show up in practice?

Rarely as an incident; usually as one of four uncomfortable moments.

Someone asks the agent for "our top customers last quarter," and it answers with names, emails and phone numbers, because the table it queried had those columns and nothing told it not to return them.

An engineer turns on detailed tracing to debug a wrong answer, and from then on every trace stores the full result of every query, email addresses included, in an observability tool with its own retention policy and its own list of people who can read it.

Legal asks which columns the agent can reach, and nobody can answer without opening the database.

The team says the data is "anonymized," and what actually exists is an unsalted SHA-256 of the email address.

In all four, the agent was given the whole table when it only needed to answer a question.

## Why does PII end up in the agent's context?

Five mechanisms, and none of them requires an attacker.

**One broad credential.** The fastest way to wire an agent to data is a read-only credential on the whole schema. From then on every `SELECT *` pulls the personal columns along, and the tool result lands in the model's context verbatim. OWASP lists sensitive information disclosure as a top LLM application risk and recommends granting access "only to data that is necessary for the specific user or process" ([OWASP LLM02:2025](https://genai.owasp.org/llmrisk/llm022025-sensitive-information-disclosure/)).

**Traces that keep everything.** OpenTelemetry's generative AI semantic conventions mark message content, tool call arguments and tool call results as `Opt-In` attributes, warn that they "may contain sensitive information," and state that instrumentations "SHOULD NOT capture them by default" ([OpenTelemetry GenAI spans](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-spans.md)). With the default, nothing is captured; the leak comes from the debug flag someone turned on and forgot.

**Hashing without a key.** The FTC's Office of Technology put it bluntly in July 2024: hashes "aren't 'anonymous' and can still be used to identify users," and hashing over common identifiers like email addresses and phone numbers "can be reversed" because the sets of possible values are small enough to guess and check ([FTC](https://www.ftc.gov/policy/advocacy-research/tech-at-ftc/2024/07/no-hashing-still-doesnt-make-your-data-anonymous)). A US phone number has 10 digits; hashing every possible one is a weekend job on a laptop, not a research project (my arithmetic, not the FTC's).

**Ordinary attributes that identify.** Removing name and email does little when birth date, gender and ZIP code remain. Using 1990 census data, Latanya Sweeney estimated that 87% of the US population was likely unique on 5-digit ZIP, gender and date of birth alone ([Sweeney, Carnegie Mellon, 2000](https://dataprivacylab.org/projects/identifiability/paper1.pdf)). A 2019 model in *Nature Communications* estimated that 99.98% of Americans would be correctly re-identified in any dataset with 15 demographic attributes ([Rocher, Hendrickx and de Montjoye, 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6650473/)).

**Purchase history is linkable by design.** A stable customer ID attached to every order is, in NIST's terms, information "linked or linkable to an individual." Pseudonymization lowers exposure. It does not turn a behavioral profile into something other than personal data.

## How do you check what your agent can reach today?

Five checks, all doable in an afternoon.

| Check | Where to look | Red flag |
|---|---|---|
| Personal columns visible to the agent's role | Database catalog (query below) | Any name, email, phone, address or birth date column with `SELECT` granted |
| What comes back in tool results | Logs of the MCP server or API the agent calls | Individual customer rows in answer to an aggregate question |
| Content capture in traces | The agent's instrumentation config | Message or tool-result capture enabled in production |
| How the customer ID was generated | The pipeline code that builds it | Plain hash (SHA-256, MD5) of email or phone, no secret |
| Size of the smallest group returned | Segmentation answers | Small groups combined with full ZIP and birth date |

In Postgres, the first check is a single query. Run it as an admin and replace `ai_agent` with the role your agent connects as:

```sql
SELECT table_schema, table_name, column_name
FROM information_schema.columns
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
  AND column_name ~* '(e_?mail|phone|mobile|first_name|last_name|full_name|address|zip|postal|birth|ssn)'
  AND has_column_privilege('ai_agent',
        format('%I.%I', table_schema, table_name), column_name, 'SELECT');
```

Any row it returns is a column the agent can read. If your column names don't follow a pattern, the regex won't catch them, and the check becomes a manual walk through the schema.

The hash test is even faster. With a colleague's permission, take their email, lowercase it, compute a plain SHA-256 and search for it in the customer table. If it matches, anyone with a copy of the table and a wordlist can reverse your IDs.

## How do you fix it without crippling the agent?

Four techniques, each with what it protects and what it lets through. None is enough on its own.

| Technique | What it protects | What it doesn't |
|---|---|---|
| Keyed pseudonymization | The agent and traces see an ID that can't be reversed without the secret | Joins across datasets that share the ID; attributes that identify in combination |
| Aggregation with a minimum group size | Segment answers never resolve to one person | Deliberate narrowing with successive filters to isolate a customer |
| Personal columns out of reach | Identifiers never enter the model's context | Free text (reviews, support tickets) with names and numbers inside |
| Masking in logs and traces | What the agent saw isn't stored in a second system | What the agent already returned to the user |

**Pseudonymize with a secret, not a bare hash.** Build the ID with a keyed hash (HMAC) or a random lookup table, and keep the key out of reach of the agent and of anyone querying the warehouse. First-order cohort, 90-day repeat rate, 12-month LTV and acquisition channel all come from that ID without a single personal column.

**Expose metrics, not tables.** The agent doesn't need the `customers` table; it needs "active customers," "LTV by channel" and "repeat rate," already defined. When those definitions live in a [semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/), access control works per entity and per metric, and the personal columns simply don't exist for the agent's role.

A synthetic example with round numbers: a Shopify brand with 200,000 customers wants the 12-month LTV of customers whose first order used a discount code, against those who paid full price. The answer needs four fields per customer: pseudonymous ID, whether the first order had a code, and the date and value of each order. Name, email, phone and address stay out, and the answer comes out the same.

**Set a minimum group size.** Any answer that aggregates customers suppresses groups below a floor you choose and write down, say ten or twenty customers. That number is a policy decision, not a legal standard. Coarsen the attributes that identify in combination: age band instead of birth date, 3-digit ZIP prefix or city instead of the full ZIP.

**Keep content capture off in production.** It is the OpenTelemetry default; leave it there. When you need to debug, capture in a separate environment with short retention, or redact fields before export.

**Re-identify outside the agent.** When the analysis turns into action ("send the offer to this segment"), the agent returns a list of pseudonymous IDs, and the system that holds the key, your ESP or CRM, resolves who is who. Personal data shows up only where the action happens.

## When can't this be fixed?

Four cases where the techniques don't help, and it's better to know before promising otherwise.

**When the task is about the person.** A support agent answering "where is my order?" needs that customer's order. The control there is different: scope per session, one person per conversation, no access to the wider table. That is a customer-service application problem, not an analytics data problem, and Precisian is not the right answer for it.

**When the PII is inside the text.** Support tickets, product reviews and chat transcripts carry names, phone numbers and addresses mid-sentence. Pattern-based redaction catches a formatted phone number and misses the rest. If the agent must read customer free text, treat that text as personal data in full.

**When the customer base is too small.** A B2B operation with a few dozen buyers re-identifies any segment from context: "the Ohio account that ordered in March" is one company and often one buyer. Below a certain volume aggregation stops protecting anyone, and sometimes the honest answer is not to give the agent that access.

**When the key leaks.** Pseudonymization holds only while the secret stays separate. An HMAC key sitting in the same repository as the pipeline, in a config file the agent can read, makes the ID reversible again.

## What doesn't this article cover?

It is not legal advice and doesn't say which US state or sector rules apply to you. That analysis belongs to counsel.

It also leaves out two neighboring problems with their own articles: authenticating the MCP server itself, covered in [connecting an AI agent to production data](https://precisian.io/blog/en/posts/connect-ai-to-production-data/) and [MCP security for marketing data](https://precisian.io/blog/en/posts/mcp-security-marketing-data/), and deciding which agent may touch which data at all, which is [AI data governance](https://precisian.io/blog/en/posts/ai-data-governance/).

The re-identification studies cited measure the US population. They show how little it takes to single someone out; they don't tell you the risk in your specific dataset.

---

If your AI agent reads the full customer table today, the first step is to measure which personal columns it can reach and which of its questions actually need them. [Let's talk through your setup](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).
