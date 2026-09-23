---
title: "What is a data contract, and what does it enforce?"
description: "A data contract declares shape, guarantees and meaning. On Snowflake, BigQuery and Redshift, a declared primary key is enforced by nobody."
slug: "what-is-a-data-contract"
lang: "en"
translationKey: "data-contract"
publishedAt: 2026-10-20
tags: ["contrato-de-dados", "governanca", "camada-semantica"]
draft: false
llmSummary: "A data contract is a versioned agreement between the producer and consumers of a dataset. On Snowflake, BigQuery and Redshift, primary_key and foreign_key are definable but not enforced: they exist for metadata purposes only, and a model still builds when it violates them."
citations: ["https://docs.getdbt.com/reference/resource-properties/constraints", "https://docs.getdbt.com/reference/resource-configs/contract", "https://github.com/bitol-io/open-data-contract-standard", "https://bitol-io.github.io/open-data-contract-standard/latest/"]
about: ["https://en.wikipedia.org/wiki/Data_governance", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 6
---

A data contract is a versioned agreement between the producer and the consumers of a dataset, declaring column names, types, quality guarantees and operational commitments. In the open standard most teams reach for, only 4 of 23 top-level fields are required ([ODCS v3.2.0](https://github.com/bitol-io/open-data-contract-standard)). And on the three warehouses most analytics teams run on, the guarantee people trust most is enforced by nobody.

One disambiguation first, because the term is overloaded. This is not .NET's `[DataContract]`, the serialization attribute that controls which members get serialized by `DataContractSerializer`. Same words, unrelated problem.

## What does a data contract actually contain?

Four layers, listed in descending order of how seriously teams treat them.

**Shape.** Which columns exist, under which names, with which types. This is the layer that breaks pipelines when it changes without warning, which is why it gets the attention.

**Guarantees.** Primary key, nullability, uniqueness, acceptable value ranges.

**Semantics.** What the column means. Is `revenue` gross or net of returns? Before or after shipping? This layer is usually absent from the file, and it is the one that produces the disagreement nobody can resolve in the meeting.

**Operational commitment.** Refresh cadence, tolerated lateness, owner, and how a breaking change gets announced.

The Open Data Contract Standard, governed by the LF AI & Data Foundation together with Bitol, organizes these into sections for fundamentals, schema, data quality, team, roles and service levels ([ODCS](https://bitol-io.github.io/open-data-contract-standard/latest/)).

Its machine-readable schema says something quieter about the maturity of the field. Of 23 top-level properties, exactly four are required: `version`, `apiVersion`, `kind` and `id`. **`name` is not among them.** A file can be a valid data contract without stating what it is a contract for. The standard supplies vocabulary. It does not supply rigor.

## Does declaring a primary key make it unique?

On most cloud warehouses, no. This is the expensive misunderstanding in the whole topic.

dbt publishes the per-platform support matrix, and it is uncomfortable reading:

| Platform | `not_null` | `primary_key` | `unique` | `check` |
|---|---|---|---|---|
| PostgreSQL | enforced | enforced | enforced | enforced |
| Snowflake | enforced | metadata only | not definable | not definable |
| BigQuery | enforced | metadata only | not definable | not definable |
| Redshift | enforced | metadata only | metadata only | not definable |
| Databricks | enforced | metadata only | not definable | enforced |
| Athena | none | none | none | none |

Source: [dbt, constraints](https://docs.getdbt.com/reference/resource-properties/constraints).

The middle columns are the story. dbt defines that status in its own words: "The platform supports specifying the type of constraint, but a model can still build even if building the model violates the constraint. This constraint exists for metadata purposes only. This approach is more typical in cloud data warehouses than in transactional databases, where strict rule enforcement is more common."

Read that against what people believe they have. On Snowflake, BigQuery and Redshift you can declare `primary_key` in your contract, watch the build pass, generate clean documentation, and still ship a table with a duplicated key. The contract records an intention. Nothing collects on it.

On Snowflake and BigQuery, `unique` is not even definable. The guarantee most teams assume they have is the one least likely to exist.

## Then what does a dbt contract enforce?

One thing, and it does it well.

With `contract: {enforced: true}`, dbt validates each column's name and data type at build time and fails the model if it diverges from the declaration ([dbt](https://docs.getdbt.com/reference/resource-configs/contract)). That is real protection. It is what stops someone renaming `order_total` to `total` on a Tuesday and the finance dashboard finding out on Friday.

What the mechanism does not do is guarantee contents. Shape is enforced at build. On the platforms above, content is not.

dbt states the principle openly in a neighboring case. On Spark, `not_null` and `check` are verified only after a model is built, and for that reason "dbt considers these constraints definable but not enforced, which means they're not part of the model contract since they can't be enforced at build time."

That is the usable test. If it does not fail the build, it is not a contract. It is documentation with good posture.

## How do you cover what the warehouse won't?

With tests, not with declarations. These are three distinct layers, and collapsing them is the actual failure.

**A constraint** is what the database applies on write. The matrix above shows how short that list really is.

**A data test** is a query that runs afterward and fails when the result is wrong. This is where real uniqueness lives on Snowflake and BigQuery: not as a declared constraint, but as a test that counts duplicates and stops the pipeline when it finds one.

**A contract** is the document describing what those two layers are supposed to uphold, plus the part neither covers: meaning and operational commitment.

Writing `primary_key` in YAML without the matching test gives you the drawing of a guarantee rather than the guarantee.

There is a fourth layer with no technical enforcement at all: the version. A contract that changes silently is not a contract, it is a moving target with a filename. The minimum discipline is that a breaking change bumps the version, lands as a reviewed pull request, and reaches consumers before it reaches production, not through the incident channel afterward.

## Which table deserves a contract first?

The one with more than one consumer and money attached to the decision it feeds.

Contracts cost something. Someone maintains them, reviews them and negotiates changes. Applied everywhere, they become ceremony and are abandoned within a year. The filter that survives contact with a real team is exposure.

**Does more than one team read it?** A table only its author queries needs tests, not a contract. Contracts protect the people who were not in the room when the column changed.

**Does it decide money?** Budget, pricing and margin tables earn explicit guarantees. A monitoring chart can wait.

**Has it broken before?** The table that already caused an incident is the obvious candidate, and the only one you can get approved without argument, because the pain is remembered.

**Will an agent read it?** This changes the weight of the question. A human who sees an odd `revenue` figure hesitates and asks. An agent answers with whatever column it finds, at its usual confidence. When the consumer cannot doubt, the guarantee has to live in the data rather than in the reader's judgment. That is also why [isolation and permission](https://precisian.io/blog/en/posts/per-tenant-isolation-mcp/) belong to the same conversation.

## Who enforces the semantic layer of the contract?

Nobody, which is why it costs the most.

No database constraint prevents `revenue` from meaning one thing to the media team and another at financial close. Both pass every type check. Both are `numeric`. Both are correct according to the contract.

The fix is not another test, because this is not a data error. It is a definitional disagreement recorded nowhere. Resolving it means putting the definition in one place that both the human query and the agent read before computing, which is the job of a [semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/). A data contract protects the pipe. A semantic layer protects the meaning.

## What does this article not cover?

It gives no adoption statistic for data contracts. The most-cited survey on the subject sits on a page whose title advertises the current year while its fieldwork was collected three years earlier, and passing that off as a picture of today would be dishonest.

It also does not claim that a competing specification was deprecated in favor of ODCS. That claim circulates, and I could not find it stated on any official page of the project in question, so it is not repeated here.

And it recommends no tool. The matrix above will change as platforms evolve, and dbt's own documentation says so. The question that outlives it: in your contract today, which clauses fail the build, and which ones are only written down?
