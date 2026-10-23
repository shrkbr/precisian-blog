---
title: "What goes in a marketing data dictionary (and why your AI needs one)"
description: "A data dictionary records each metric's name, definition, source, owner, formula and exclusions. A 4 KB definitions file lifted AI accuracy 17 to 23 points."
slug: "marketing-data-dictionary"
lang: "en"
translationKey: "data-dictionary"
publishedAt: 2026-10-23
tags: ["semantic-layer", "governance", "ai-data-access", "data-contract"]
draft: false
llmSummary: "A data dictionary records, for every field and metric in a dataset, its name, definition, source, owner, formula and exclusions. In an April 2026 benchmark (arXiv 2604.25149), a 4 KB definitions file raised the accuracy of three frontier models by 17 to 23 percentage points."
citations: ["https://arxiv.org/abs/2604.25149", "https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/report-types/default-reports/sales-report", "https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema", "https://docs.getdbt.com/reference/resource-properties/description", "https://docs.getdbt.com/reference/resource-configs/persist_docs", "https://docs.getdbt.com/docs/build/metrics-overview", "https://docs.snowflake.com/en/user-guide/views-semantic/overview"]
about: ["https://en.wikipedia.org/wiki/Data_dictionary", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
---

A data dictionary is the record that states, for every field and metric in a dataset, its name, what it means, where it comes from, who owns it, how it is calculated and what it leaves out. For AI, it is the floor: in an April 2026 benchmark, a 4 KB definitions file raised the accuracy of three frontier models by 17 to 23 percentage points ([Rumiantsau and Fokeev, 2026](https://arxiv.org/abs/2604.25149)).

> **Data dictionary**: a document, maintained alongside the data, that records each field or metric's canonical name, plain-language definition, source, owner, formula and exclusions, so that any person or system reading the number knows what it contains.

## What should a marketing data dictionary include?

Six fields per metric. Fewer leaves room for guessing. More turns it into a form nobody fills in.

**Name.** One name, lowercase, with no synonym running in parallel. If marketing says "revenue" and finance says "sales," the dictionary picks one and lists the other as a retired alias.

**Definition.** One sentence in business English that a VP can read without opening the SQL.

**Source.** The system and table the number comes from: Shopify, Amazon Seller Central, Google Ads, Meta Ads, GA4, the ERP. When two systems could answer, the dictionary says which one wins.

**Owner.** The person or team that settles disputes. Without one, the definition drifts again by next quarter.

**Formula.** The math, written so it can be checked: numerator, denominator, aggregation, and which date governs (order, payment or fulfillment).

**Exclusions.** What stays out: shipping, tax, cancellations, returns, test orders, employee orders. It is the shortest column and the one that prevents the most arguments.

Shopify's own reports are a good reminder of why the formula column matters. Shopify defines net sales as gross sales minus discounts minus sales reversals, and it books a return as a negative number on the date it was processed, not on the date of the original order ([Shopify Help Center](https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/report-types/default-reports/sales-report)). That is a defensible rule. It is also a rule your finance team may not use, and nothing on the screen tells you which one you are looking at.

Here is a starter dictionary with ten ecommerce metrics. The rules are an example, not a universal standard. Your business can decide differently; what matters is that it decides in writing.

| Name | Definition | Source | Owner | Formula | Exclusions |
|---|---|---|---|---|---|
| `gross_sales` | Value of items sold before deductions | Shopify orders | Ecommerce | price × quantity, by order date | shipping, tax, test orders |
| `net_revenue` | What the company recognizes as revenue | ERP | Finance | gross sales − discounts − returns − cancellations, by fulfillment date | shipping, tax |
| `orders` | Orders that were paid and not canceled | Shopify + Amazon | Ecommerce | count of distinct `order_id` | canceled, test, employee orders |
| `aov` | Average net revenue per order | derived | Finance | `net_revenue` ÷ `orders` | inherits both components |
| `sessions` | Visits to the storefront | GA4 | Marketing | count of sessions | filtered internal traffic |
| `conversion_rate` | Share of sessions that became an order | derived | Marketing | site `orders` ÷ `sessions` | Amazon orders (no site session) |
| `ad_spend` | Paid media cost | Google Ads, Meta Ads | Paid media | sum of cost, by delivery date | agency fees billed separately |
| `roas` | Net revenue per dollar of ad spend | derived | Paid media + Finance | `net_revenue` ÷ `ad_spend` | revenue each platform credits to itself |
| `new_customers` | Customers whose first purchase falls in the period | ERP / CRM | Lifecycle | count of customers with no prior order with the brand | Amazon-only buyers (no customer match) |
| `return_rate` | Share of revenue refunded | ERP | Operations | returns ÷ gross sales, by return date | exchanges with no refund |

`roas` is defined over the ERP's net revenue, not over what each ad platform reports, and that alone changes the number for any brand running more than one channel. And returns are dated by the return, which rewrites every closed month the moment you switch. Both are business decisions. The dictionary just makes them visible.

## How does a data dictionary work in practice?

It works when it sits where the number gets read, not in an onboarding folder.

The handiest example comes from Google. The [GA4 Data API metrics reference](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema), last updated October 22, 2026, is a data dictionary. It describes `grossPurchaseRevenue` as "the sum of revenue from purchases," `purchaseRevenue` as that sum minus refunded transaction revenue, and `totalRevenue` as revenue from purchases, subscriptions and advertising. Three revenues, three written definitions. Whoever asks "what was revenue last month?" without saying which one gets whichever the answerer picked.

In your own stack, the dictionary usually lives in one of three places, from most fragile to most useful:

1. **A spreadsheet or wiki page.** It works as long as someone remembers to open it. The AI agent does not.
2. **Column descriptions in the data project.** In dbt, the `description` property documents models and columns and renders on the docs site ([dbt](https://docs.getdbt.com/reference/resource-properties/description)). With `persist_docs`, those descriptions become column comments inside the warehouse itself, on Postgres, Redshift, Snowflake, BigQuery and Databricks ([dbt](https://docs.getdbt.com/reference/resource-configs/persist_docs)).
3. **Context handed to the AI on every question.** This is where the dictionary starts changing answers, and it is the case the April benchmark measured.

dbt itself treats `description` as metadata. It does not change the SQL or the result. A description informs whoever reads it. It does not stop anyone from computing differently.

## What is the difference between a data dictionary and a semantic layer?

The dictionary describes; the [semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/) executes. This is the boundary people blur most, because both hold "the definition of net revenue."

| Criterion | Data dictionary | Semantic layer | Data contract |
|---|---|---|---|
| What it holds | Meaning, source, owner, exclusions | The calculation rule, in a form the machine runs | Shape, types and guarantees of a table |
| Who reads it | People, and AI as context | The system, before it generates a query | The pipeline, at build time |
| If someone ignores it | The number comes out different and nobody is warned | It can't be ignored: the query goes through it | The build fails, if the clause is enforced |
| Concrete example | a column `description` in dbt | a `ratio` metric in dbt with numerator and denominator | `contract: enforced` in dbt |
| Question it answers | What does this number mean? | How is this number calculated, every time? | Did this table arrive in the promised shape? |

In a semantic layer, a metric is an object with a type and parameters. dbt supports five types (simple, ratio, cumulative, derived and conversion), and a ratio metric declares its numerator and denominator in YAML ([dbt](https://docs.getdbt.com/docs/build/metrics-overview)). Snowflake describes the same mechanism from the agent's side: Cortex Agents reads the semantic view definition and generates SQL against the physical tables from it ([Snowflake](https://docs.snowflake.com/en/user-guide/views-semantic/overview)). A data contract, for its part, protects a table's shape rather than its meaning; [what a data contract actually enforces](https://precisian.io/blog/en/posts/what-is-a-data-contract/) covers where that line falls.

## Why does AI need a data dictionary, and why isn't it enough?

Because the most common mistake an agent makes with marketing data is not arithmetic. It is definition. The model picks one field among several plausible ones, computes correctly and returns the wrong number. We call that [metric hallucination](https://precisian.io/blog/en/posts/metric-hallucination/).

The [Rumiantsau and Fokeev](https://arxiv.org/abs/2604.25149) benchmark, published April 28, 2026, measured exactly this: 100 natural-language questions over a retail dataset, answered by Claude Opus 4.7, Claude Sonnet 4.6 and GPT-5.4. Without context, accuracy ranged from 45.5% to 50.5%. With a 4 KB markdown file describing measures, conventions and disambiguation rules, it rose to 67.7% to 68.7%. The gap between models was small next to the gap the document made.

Four kilobytes of text mattered more than the choice of model, which is the best reason to write the dictionary.

It is also the dictionary's ceiling. Even with the document, roughly a third of the answers were still wrong. My read is that the reason is mechanical: the agent reads the description and still has to write the query. Between "net revenue excludes shipping" and correct SQL sits a translation, and every translation is a fresh chance to miss a filter, a join or a date. When the rule lives in a semantic layer, that translation was done and tested once, and the agent queries the metric instead of rebuilding it. That is the difference between [governed text-to-SQL](https://precisian.io/blog/en/posts/governed-text-to-sql/) and the loose kind.

So the practical order is: dictionary first, because without a written decision there is nothing to execute. Semantic layer next, for the metrics an AI will query without supervision. At Precisian, that layer sits on a data lake isolated per customer, on our infrastructure, and reaches the customer's own AI, BI or automation through an MCP server and an API.

## What is a data dictionary not?

**Not a data catalog.** A catalog inventories what exists: tables, columns, who has access. The dictionary says what each thing means. A catalog can list ten columns called `revenue` without telling you which one is right.

**Not a business glossary.** A glossary defines the concept ("a new customer is someone buying for the first time"). The dictionary ties that concept to a column, a source and a formula.

**Not the database schema.** The type `numeric(12,2)` says the field holds money. It does not say gross or net, or as of which date.

**Not an IT-only task.** The business fills in the owner column. A dictionary written only by engineering describes what the code does, which may not be what the company decided.

## When is a data dictionary worth writing?

When a second source appears for the same number, or the first AI agent gets access to the data. Before that, with one store, one system and one person answering questions, the definition can live in someone's head at no cost.

For a US brand, that point arrives the day you sell on Shopify and Amazon at once. Amazon orders have no session in your GA4, so site conversion rate and blended conversion rate stop being comparable. "New customer" starts depending on which database you checked, because an Amazon buyer and a Shopify buyer are rarely matched to the same customer record. And refunds land on whatever date each system chooses, as the Shopify rule above shows.

A synthetic example, with round numbers made up for the math: two months with identical sales, and one return processed in April for an order placed in March.

| Return dating rule | March net revenue | April net revenue |
|---|---|---|
| Dated by the original order | $950,000 | $1,000,000 |
| Dated by the return | $1,000,000 | $950,000 |

Neither number is wrong. Only one of them is your company's, and the dictionary is what says which.

My suggestion is to start with the three metrics that cause the most meetings, almost always revenue, ROAS and new customers, and not with the hundred columns in the warehouse. The rest get added when someone asks about them.

## What does this article not cover?

It does not compare catalog or documentation tools. It does not walk through a full semantic layer implementation; [what goes into a semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/) does that. And the figure cited measures answer accuracy on a 100-question retail benchmark. It does not measure financial return, and this article claims none.

---

If your AI answers "revenue" and nobody can say which revenue it used, the first step is to count how many definitions of that number are circulating today. [See how a written definition reaches the AI through a semantic layer](https://precisian.io/en/demo), with no contract commitment, and no promise of an answer in 30 minutes either.
