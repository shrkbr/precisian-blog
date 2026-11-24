---
title: "Snowflake semantic views: what they define, what the business decides"
description: "A Snowflake semantic view stores tables, relationships, facts, dimensions and metrics as one SQL object. It computes the rule you write; it doesn't choose it."
slug: "snowflake-semantic-views"
lang: "en"
translationKey: "snowflake-semantic-views"
publishedAt: 2026-11-23
tags: ["semantic-layer", "data-warehouse", "metric-hallucination", "governance", "text-to-sql", "ai-data-access"]
draft: false
llmSummary: "A Snowflake semantic view is a schema-level object defined with CREATE SEMANTIC VIEW (tables, relationships, facts, dimensions, metrics). Defining views went GA in June 2025, querying in August 2025. Cortex Analyst reads them, but the business rule in each metric is still a human decision."
citations: ["https://docs.snowflake.com/en/user-guide/views-semantic/overview", "https://docs.snowflake.com/en/sql-reference/sql/create-semantic-view", "https://docs.snowflake.com/en/user-guide/views-semantic/querying", "https://docs.snowflake.com/en/user-guide/views-semantic/sql", "https://docs.snowflake.com/en/release-notes/2025/june-summit", "https://docs.snowflake.com/en/release-notes/2025/9_25", "https://docs.snowflake.com/en/release-notes/2026/other/2026-04-05-semantic-views-verified-queries", "https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst", "https://docs.snowflake.com/en/user-guide/views-semantic/autopilot", "https://docs.snowflake.com/en/user-guide/views-semantic/best-practices-modeling", "https://docs.snowflake.com/en/user-guide/views-semantic/best-practices-dev", "https://docs.snowflake.com/en/sql-reference/sql/desc-semantic-view", "https://docs.snowflake.com/en/sql-reference/sql/show-semantic-metrics", "https://docs.snowflake.com/en/sql-reference/sql/show-semantic-dimensions-for-metric", "https://docs.snowflake.com/en/sql-reference/functions/system_read_yaml_from_semantic_view", "https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents-mcp", "https://docs.getdbt.com/docs/use-dbt-semantic-layer/sl-faqs", "https://docs.getdbt.com/docs/dbt-ai/about-mcp"]
about: ["https://en.wikipedia.org/wiki/Semantic_layer", "https://en.wikipedia.org/wiki/Snowflake_Inc.", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
cta: demo
---
A Snowflake semantic view is a schema-level object, created with `CREATE SEMANTIC VIEW`, that stores logical tables, relationships, facts, dimensions and metrics so that SQL clients and Cortex Analyst compute a metric the same way every time. Snowflake made defining semantic views generally available at its June 2025 Summit ([release notes](https://docs.snowflake.com/en/release-notes/2025/june-summit)) and querying them in the August 25 to 28, 2025 release ([9.25 release notes](https://docs.snowflake.com/en/release-notes/2025/9_25)). The view computes whatever rule you wrote. Whether net revenue subtracts refunds, and in which month, is a decision it can't make for you.

> **Snowflake semantic view**: a Snowflake database object that holds business definitions next to the physical tables. Its clauses are `TABLES`, `RELATIONSHIPS`, `FACTS`, `DIMENSIONS` and `METRICS`, plus optional AI instructions and verified queries. Querying it needs `SELECT` on the view only, not on the underlying tables.

I read every Snowflake page cited here on November 23, 2026, starting with the [semantic views overview](https://docs.snowflake.com/en/user-guide/views-semantic/overview). Snowflake's docs show no "last updated" date, so the date of reading is the one that applies.

## What does the failure look like once the view is live?

The rollout went well. The data team built a `sales` semantic view over Shopify orders and refunds, [Cortex Analyst](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst) answers in plain English, and the view passes every compile. Then finance closes November and the numbers drift (the figures are synthetic; the arithmetic is in the table further down):

- **Finance reports $372,000 of net revenue for November. The agent says $384,000.** Both are summing the same tables.
- **October's net revenue changed after it was closed.** Nobody edited anything. A December refund on an October order landed in October.
- **Someone asks for "revenue" and gets gross.** The view holds `gross_sales` and `net_sales`, and the model picked by name.

Nothing is broken. Snowflake describes the purpose plainly: if net revenue "always means gross revenue after discounts," you define it once as a metric, for example `SUM(gross_revenue * (1 - discount))` ([Snowflake, semantic views overview](https://docs.snowflake.com/en/user-guide/views-semantic/overview)). The view does that faithfully. The open question is which "always" your company agreed on.

## What does a semantic view actually define?

Five clauses, in a fixed order. The [`CREATE SEMANTIC VIEW` reference](https://docs.snowflake.com/en/sql-reference/sql/create-semantic-view) says "the order of the clauses is important" and that you "must define at least one dimension or metric." The overview defines each piece:

| Clause | Snowflake's definition | The business decision hidden in it |
|---|---|---|
| `TABLES` | Logical tables that "typically correspond to business entities," with `PRIMARY KEY` and `UNIQUE` | What one row means (an order, a line item, a refund) |
| `RELATIONSHIPS` | Joins "on shared keys," including `ASOF` and range joins | Which entity a refund or a session belongs to |
| `FACTS` | "Row-level attributes" that "represent specific business events or transactions" | Whether shipping and tax are part of the amount |
| `DIMENSIONS` | "Categorical attributes" used to group and filter | Which date a sale is booked on |
| `METRICS` | "Quantifiable measures of business performance" | Which orders count, and which metric is "the" revenue |

The optional clauses carry more decisions. `AI_SQL_GENERATION` and `AI_QUESTION_CATEGORIZATION` hold natural-language instructions such as a fiscal-year rule. `AI_VERIFIED_QUERIES`, added on [April 5, 2026](https://docs.snowflake.com/en/release-notes/2026/other/2026-04-05-semantic-views-verified-queries), pairs a `QUESTION` with approved `SQL`, plus optional `VERIFIED_AT` and `VERIFIED_BY`. Facts and metrics can be `PRIVATE`, which means they "cannot be queried or used in a query condition"; dimensions are always public. `NON ADDITIVE BY` makes a metric semi-additive, the right shape for inventory or account balances.

## Why does the number still disagree with finance, mechanically?

Three mechanisms, all documented behavior.

**1. The relationship decides which date a refund can land on.** Here is a minimal view for a Shopify store, with names invented for this example:

```sql
CREATE OR REPLACE SEMANTIC VIEW sales
  TABLES (
    orders  AS analytics.shopify.orders  PRIMARY KEY (order_id)
      COMMENT = 'One row per Shopify order',
    refunds AS analytics.shopify.refunds PRIMARY KEY (refund_id)
      COMMENT = 'One row per refund transaction'
  )
  RELATIONSHIPS (
    refund_to_order AS refunds (order_id) REFERENCES orders
  )
  FACTS (
    PRIVATE orders.order_amount   AS subtotal_price,
    PRIVATE refunds.refund_amount AS amount
  )
  DIMENSIONS (
    orders.order_date   AS DATE(created_at)   COMMENT = 'Date the order was placed',
    refunds.refund_date AS DATE(processed_at) COMMENT = 'Date the refund was issued'
  )
  METRICS (
    orders.gross_sales      AS SUM(orders.order_amount),
    refunds.refunded_amount AS SUM(refunds.refund_amount),
    net_sales AS orders.gross_sales - refunds.refunded_amount
      COMMENT = 'Gross sales minus refunds, booked on order date'
  );
```

`net_sales` is a derived metric: Snowflake lets a metric "combine metrics from multiple logical tables" if you omit the table name ([Snowflake, SQL for semantic views](https://docs.snowflake.com/en/user-guide/views-semantic/sql)). The catch is the granularity rule. A dimension's logical table "must have an equal or lower level of granularity" than the metric's table ([Snowflake, querying](https://docs.snowflake.com/en/user-guide/views-semantic/querying)). One order has many refunds, so `orders.order_date` can group the refund metric, but `refunds.refund_date` can't group `gross_sales`. Ask for net sales by refund date and the documented rule rejects it with error `010234`, "Invalid dimension specified." The model you drew makes "refunds booked on the order's date" the only net revenue the view can compute.

Run it over one synthetic month, with round numbers invented for this example:

| Synthetic November | Finance (refund booked when issued) | `net_sales` by `order_date` |
|---|---|---|
| Orders placed in November | $400,000 | $400,000 |
| Refunds issued in November on November orders | −$16,000 | −$16,000 |
| Refunds issued in November on October orders | −$12,000 | not in November (moves to October) |
| **November net revenue** | **$372,000** | **$384,000** |
| Refunds issued in December on November orders | lands in December | rewrites November after close |

Both columns are correct answers to different questions. Only one matches the books.

**2. The model chooses among metrics by name and comment.** Snowflake's modeling guide says descriptions "are the single most important element for accuracy" because language models "can't reliably infer proprietary terms, abbreviations, or business logic" ([Snowflake, best practices for modeling](https://docs.snowflake.com/en/user-guide/views-semantic/best-practices-modeling)). Two revenue metrics with thin comments leave Cortex Analyst guessing, and you get [metric hallucination](https://precisian.io/blog/en/posts/metric-hallucination/) through a governed object.

**3. Public facts and dimensions allow ad hoc math.** In the standard-SQL form, you can "define and select ad-hoc metrics by passing a dimension or fact to any aggregate function" ([Snowflake, querying](https://docs.snowflake.com/en/user-guide/views-semantic/querying)). If `order_amount` were public, `SUM(order_amount)` would be a third revenue that skips your definitions. That's why the example marks the amounts `PRIVATE`.

## Does Semantic View Autopilot make these decisions for you?

No. It drafts them, and a person still has to settle them. Autopilot generates "the logical tables, relationships, and metrics" from a description, example SQL, a Tableau or Power BI file, or a YAML specification. It also mines query history: Cortex Analyst "uses the query history accessible by the role used to create the semantic view to generate both relationships and verified query suggestions" ([Snowflake, Autopilot](https://docs.snowflake.com/en/user-guide/views-semantic/autopilot)).

That's a fast start, and it has a side effect. If three analysts have been computing revenue three ways for a year, query history holds all three. Autopilot turns existing habits into suggestions, and someone still has to pick one. Snowflake itself warns against "starting with a domain such as Finance or Legal where near-100% accuracy is required" and suggests beginning with Sales or Marketing ([Snowflake, modeling pitfalls](https://docs.snowflake.com/en/user-guide/views-semantic/best-practices-modeling)). Revenue sits right where those domains meet.

## How do you diagnose a semantic view you already have?

Run these as the role your users and agents connect with. Every command is in Snowflake's SQL reference.

| Check | Command | What signals trouble |
|---|---|---|
| Competing metrics | [`SHOW SEMANTIC METRICS IN sales;`](https://docs.snowflake.com/en/sql-reference/sql/show-semantic-metrics) | Two or more `name` values for one business term, or an empty `comment` |
| The actual rule | [`DESCRIBE SEMANTIC VIEW sales;`](https://docs.snowflake.com/en/sql-reference/sql/desc-semantic-view) and read rows where `property = 'EXPRESSION'` | Refunds, tax or shipping handled differently from finance's policy |
| What can be bypassed | Same output, `property = 'ACCESS_MODIFIER'` | Monetary facts marked `PUBLIC` |
| Which dates a metric accepts | [`SHOW SEMANTIC DIMENSIONS IN sales FOR METRIC net_sales;`](https://docs.snowflake.com/en/sql-reference/sql/show-semantic-dimensions-for-metric) | Finance's booking date isn't on the list |
| The whole definition | ``SELECT SYSTEM$READ_YAML_FROM_SEMANTIC_VIEW('sales');`` | A spec that differs from the copy in Git |
| The number itself | `SELECT * FROM SEMANTIC_VIEW(sales DIMENSIONS orders.order_date METRICS net_sales)` for a closed month | Any gap against the figure finance closed |

For the last row, Snowflake's [modeling guide](https://docs.snowflake.com/en/user-guide/views-semantic/best-practices-modeling) recommends starting with "about 10 representative benchmark questions" and scoring them with native evaluations. Pick ten questions finance has already answered for a closed month and compare line by line.

## How do you fix it?

Most of the work is a decision, then a few lines of DDL.

1. **Agree on the definition before writing it.** Finance and growth decide, in writing, what net revenue includes, which order status counts and which date it's booked on. Why those two teams drift apart is covered in [marketing and finance never close the same revenue number](https://precisian.io/blog/en/posts/marketing-finance-revenue-definition/). The field-by-field checklist is in [what goes into a semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/).
2. **Model the date you agreed on.** If finance books refunds when issued, the refund metric needs its own date path, for example a calendar table that both orders and refunds reference. The relationship clause is where the accounting policy lives.
3. **Keep one public metric per business term.** Make building blocks `PRIVATE`, and give the public metric a comment that states inclusions, exclusions, the booking date and who approved it.
4. **Put tie-breakers in the instructions.** `AI_SQL_GENERATION` can say "revenue means `net_sales` unless the user asks for gross," and `AI_VERIFIED_QUERIES` can lock the answer to "net revenue last month," with `VERIFIED_BY` naming finance.
5. **Version the DDL.** Snowflake recommends storing "the semantic view YAML (or SQL DDL) in a Git repository" for "version control, peer review, history, and rollback" ([Snowflake, development best practices](https://docs.snowflake.com/en/user-guide/views-semantic/best-practices-dev)). Require the business owner on the pull request. dbt users can materialize views with the `dbt_semantic_view` package from Snowflake Labs; the same page notes those samples "aren't covered by any Service-Level Agreement."

## How does it compare with the dbt Semantic Layer?

Both compute a definition someone else decided. Where they differ is where the definition lives.

| | Snowflake semantic view | dbt Semantic Layer |
|---|---|---|
| Where definitions live | A Snowflake schema object (DDL or YAML) | YAML in a dbt project, compiled by MetricFlow |
| Platforms | Snowflake | Snowflake, BigQuery, Databricks, Redshift, Postgres, Trino |
| Native AI consumer | Cortex Analyst, Cortex Agents, Snowflake's MCP server | dbt MCP server |
| Access control | Snowflake RBAC; `SELECT` on the view only | Credentials configured for the Semantic Layer |

The dbt column comes from dbt's [Semantic Layer FAQs](https://docs.getdbt.com/docs/use-dbt-semantic-layer/sl-faqs) and the [dbt MCP docs](https://docs.getdbt.com/docs/dbt-ai/about-mcp), read November 23, 2026, and is covered in depth in [dbt Semantic Layer: what MetricFlow solves](https://precisian.io/blog/en/posts/dbt-semantic-layer/). The Snowflake MCP server's `CORTEX_ANALYST_MESSAGE` tool is documented in [Snowflake-managed MCP server](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-agents-mcp). How the view reaches Claude or ChatGPT is in [Snowflake MCP server](https://precisian.io/blog/en/posts/snowflake-mcp-server/).

## When can't a semantic view fix it?

**When the data isn't in Snowflake.** Cortex Analyst "is limited to answering questions that can be resolved with SQL" over what the view covers ([Snowflake, Cortex Analyst](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst)). Amazon orders, payment processor refunds or ERP invoices that were never loaded don't exist for it.

**When the business hasn't agreed.** A semantic view stores one definition per metric. If marketing and finance disagree, the view encodes whichever one the engineer typed.

**When nobody owns it.** Snowflake's guide says data engineering and business teams "need to share ownership of the semantic model." A view nobody maintains drifts the first time a source table changes.

**When you need definitions outside Snowflake.** The view lives in one account. A team that wants the same definition in a different warehouse, or across tools that don't read Snowflake, needs a layer that sits above storage. [Semantic layer vs data warehouse](https://precisian.io/blog/en/posts/semantic-layer-vs-data-warehouse/) explains the split.

If your data already lives in Snowflake and you have people to model it, semantic views are the right place for definitions, and you don't need another platform. Precisian fits the other case: a team without that capacity. We ingest the store, the ad platforms and the ERP into a data lake isolated per customer on Precisian's infrastructure, write the semantic layer with your finance and growth teams, and serve it to the AI, BI or automation you already use through MCP, API or a direct BI connection. The definitions are yours, and they leave with you.

## What does this article not cover?

It doesn't cover range and `ASOF` joins, or many-to-many relationships and level-of-detail metrics, which the docs list as preview features. It doesn't cover materializations, `MAX_STALENESS`, Cortex Search dimensions or sharing views through listings. It doesn't quote Cortex Analyst credit rates; Snowflake bills "based on the number of messages processed" and counts only HTTP 200 responses ([Snowflake, Cortex Analyst](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst)). The DDL and the $400,000 month are synthetic, not from any client.

If your semantic view holds two revenue metrics, run `DESCRIBE SEMANTIC VIEW`, read both expressions and the date each one can be grouped by, and check them against how finance books refunds before an agent answers anyone. [Watch a governed MCP answer](https://precisian.io/en/demo?utm_source=blog&utm_medium=cta&utm_campaign=snowflake-semantic-views&utm_content=texto) over an isolated lake, with no contract commitment.
