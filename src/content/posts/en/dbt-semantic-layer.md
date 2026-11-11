---
title: "dbt Semantic Layer: what MetricFlow solves and what you still have to decide"
description: "The dbt Semantic Layer turns metric YAML into SQL with MetricFlow. It computes whatever rule you write; deciding what revenue means is still on you."
slug: "dbt-semantic-layer"
lang: "en"
translationKey: "dbt-semantic-layer"
publishedAt: 2026-11-11
tags: ["semantic-layer", "data-warehouse", "metric-hallucination", "mcp", "governance"]
draft: false
llmSummary: "The dbt Semantic Layer, powered by MetricFlow, generates SQL from metrics defined in dbt YAML. Per dbt docs updated Sep 29 and Oct 19-20, 2026, it needs a Starter, Enterprise or Enterprise+ plan for APIs, bills per queried metric, and does not decide business definitions."
citations: ["https://docs.getdbt.com/docs/use-dbt-semantic-layer/dbt-sl", "https://docs.getdbt.com/docs/build/about-metricflow", "https://docs.getdbt.com/docs/use-dbt-semantic-layer/sl-faqs", "https://docs.getdbt.com/docs/build/simple", "https://docs.getdbt.com/docs/build/metricflow-commands", "https://docs.getdbt.com/docs/platform/billing/how-pricing-works", "https://docs.getdbt.com/docs/platform-integrations/avail-sl-integrations", "https://docs.getdbt.com/docs/dbt-ai/about-mcp", "https://github.com/dbt-labs/dbt-mcp", "https://github.com/dbt-labs/metricflow", "https://github.com/apache/ossie"]
about: ["https://en.wikipedia.org/wiki/Semantic_layer", "https://www.getdbt.com", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
cta: demo
---
The dbt Semantic Layer lets a data team define metrics once in dbt YAML and have MetricFlow generate the SQL, joins included, every time someone queries them. dbt Labs' docs, updated September 29, 2026, describe it as eliminating "duplicate coding by allowing data teams to define metrics on top of existing models and automatically handling data joins" ([dbt docs](https://docs.getdbt.com/docs/use-dbt-semantic-layer/dbt-sl)). What it doesn't do is decide what revenue means. If two people write two revenue metrics, MetricFlow computes both, correctly.

> **dbt Semantic Layer**: dbt Labs' metric layer, in which semantic models, entities, dimensions and metrics are declared in a dbt project and MetricFlow, an Apache 2.0 SQL generator, compiles each metric request into SQL that runs on the customer's data platform.

I read every dbt page quoted here on November 11, 2026, and each citation carries the date dbt shows as "last updated." The product moves fast: metric definitions changed shape in dbt v1.12, and Fivetran and dbt Labs completed their merger on June 1, 2026 (covered in [Agents Schema vs MCP](https://precisian.io/blog/en/posts/agents-schema-vs-mcp/)).

## What does the failure look like after you adopt it?

The project went well. The team modeled orders, customers and campaigns, declared metrics in YAML, connected Tableau and Google Sheets, and later the [dbt MCP server](https://github.com/dbt-labs/dbt-mcp) so people could ask Claude. Six weeks later, the CFO's revenue for October and the growth team's revenue for October still differ.

Nobody's query is wrong. Run `dbt sl list metrics` and you find `revenue`, `gross_revenue`, `net_revenue` and `revenue_v2`, each written by a different person in a different sprint. The finance deck uses one; the AI assistant, calling the MCP tool `list_metrics` and then `query_metrics`, picked another because its description sounded closer to the question.

The semantic layer is in place, the numbers are reproducible, and they still don't agree, because the disagreement was never about SQL.

## Why does it happen, mechanically?

Because MetricFlow does exactly what the docs say. It's "a SQL query generation tool designed to streamline metric creation across different data dimensions" ([About MetricFlow](https://docs.getdbt.com/docs/build/about-metricflow), updated October 20, 2026). It takes a metric name and group-by dimensions, finds the join path through entities, applies the aggregation and filter you wrote, and emits SQL.

Every business rule lives in fields a person typed. In dbt v1.12 and later, a simple metric sits under `metrics:` in a model with `semantic_model: enabled: true`, and its parameters are `name`, `type`, `agg`, `expr`, `filter`, `agg_time_dimension`, `join_to_timespine` and `fill_nulls_with`, among others ([Simple metrics](https://docs.getdbt.com/docs/build/simple), updated August 6, 2026). Here is an illustrative pair on the same orders model:

```yaml
models:
  - name: orders
    semantic_model:
      enabled: true
    metrics:
      - name: gross_revenue
        type: simple
        agg: sum
        expr: order_total
      - name: net_revenue
        type: simple
        agg: sum
        expr: order_total - refund_amount - shipping_amount
        filter: "{{ Dimension('order__status') }} = 'invoiced'"
        agg_time_dimension: invoiced_at
```

Both metrics are valid. Both pass `dbt sl validate`. Run them over one synthetic month with round numbers, invented for this example:

| Synthetic month | `gross_revenue` | `net_revenue` |
|---|---|---|
| Orders placed in October | $100,000 | $100,000 |
| Refunds | not subtracted | −$6,000 |
| Shipping charged | included | −$4,000 |
| Placed Oct 30–31, invoiced in November | counted in October | −$2,600 (moves to November) |
| **October result** | **$100,000** | **$87,400** |

Same data, same platform, two answers, and MetricFlow is right both times. Each metric answers a different question, and the YAML doesn't say which one the CFO asked.

A query grouped by `metric_time` uses each metric's `agg_time_dimension`, so two metrics on the same model can put the same order in different months without anyone noticing, until a month-end report and a month-start report disagree by exactly the orders invoiced across the boundary.

Four decisions sit outside the tool:

| Decision | Where it lands in dbt | What MetricFlow does with it |
|---|---|---|
| Does revenue include shipping, tax, refunds? | `expr` | Computes the expression as written |
| Which orders count (paid, invoiced, shipped)? | `filter` | Applies the filter as written |
| Which date the sale belongs to | `agg_time_dimension` | Groups `metric_time` by that column |
| Which metric is "the" revenue | Naming, descriptions, governance | Nothing; every defined metric is queryable |

The last row is the one AI agents expose. The dbt MCP server's Semantic Layer tools are `list_metrics`, `get_dimensions`, `get_entities`, `get_dimension_values`, `get_metrics_compiled_sql`, `list_saved_queries` and `query_metrics`; the same server also ships `execute_sql` and `text_to_sql` ([dbt-mcp README](https://github.com/dbt-labs/dbt-mcp), read November 11, 2026). A model choosing between four revenue metrics reads names and descriptions. If those don't say which one finance signed off, the model guesses, and you get [metric hallucination](https://precisian.io/blog/en/posts/metric-hallucination/) through a perfectly governed pipe. If it reaches for `execute_sql` instead, it skips the metric layer entirely.

## How do you diagnose it in your project?

Everything below runs from the dbt CLI or the MCP server. Commands are from [MetricFlow commands](https://docs.getdbt.com/docs/build/metricflow-commands), updated September 10, 2026; dbt Core users swap `dbt sl` for `mf`.

| Check | Command | What signals trouble |
|---|---|---|
| Count competing metrics | `dbt sl list metrics` | More than one metric whose name or label contains the same business term |
| Compare the SQL they generate | `dbt sl query --metrics gross_revenue,net_revenue --group-by metric_time --compile` | Different `WHERE` clauses or different date columns for metrics people call the same thing |
| Check the time dimension | `dbt sl list dimensions --metrics net_revenue` | Order date in one metric, invoice or ship date in another |
| See what the agent sees | Call `list_metrics` through the MCP server | Empty or vague `description` fields |
| Check what the agent can bypass | Inspect the MCP tool list | `execute_sql` or `text_to_sql` enabled for business users |

A note on cost while you test: dbt bills the Semantic Layer in "Queried Metrics." Each successful request "counts as at least one queried metric, even if no data is returned," and compiling counts too: `dbt sl query --metrics revenue --compile` is one queried metric. Metadata requests aren't counted ([How pricing works](https://docs.getdbt.com/docs/platform/billing/how-pricing-works), updated October 8, 2026). The page doesn't publish included quantities per plan.

One more check after any cleanup: the commands page says to run `dbt parse` after changing metrics so the Semantic Layer reflects the change. Skip it and the agent keeps reading the old list, deleted `revenue_v2` included.

## How do you fix it?

The fix is mostly not in dbt.

1. **Decide the definition with the people who own the number.** Finance and growth agree, in writing, on what revenue includes, which status counts and which date it's booked on. Why the two teams diverge to begin with is in [marketing and finance never close the same revenue number](https://precisian.io/blog/en/posts/marketing-finance-revenue-definition/).
2. **Keep one metric per business term, and name the others for what they are.** `gross_order_value` is honest; `revenue_v2` is a trap for a model.
3. **Write descriptions for the model, not for the author.** State inclusions, exclusions, the date used and who approved it. The agent reads `description` before choosing, and "Net revenue" tells it nothing. Compare:

   ```yaml
   - name: net_revenue
     label: Net revenue (finance)
     description: >
       Revenue as finance reports it. Sum of invoiced orders, minus refunds
       and shipping, excluding sales tax. Booked on invoice date, not order
       date. Approved by finance and growth. Use this metric for any
       question about revenue unless the user asks for gross order value.
   ```

   That last sentence gives an agent a rule for breaking a tie between four similar names.
4. **Turn off what bypasses the layer.** The docs say an admin who disables dbt AI features hides `text_to_sql` while other tools keep working ([About dbt MCP](https://docs.getdbt.com/docs/dbt-ai/about-mcp), updated November 5, 2026). Decide whether `execute_sql` belongs in a business user's toolset.
5. **Version and review definition changes like code.** They already live in Git; require the business owner on the pull request.

What goes into that written definition, field by field, is in [what goes into a semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/).

## When is dbt the right choice?

When you already have a warehouse, a dbt project and people who write and review YAML. Then the Semantic Layer is the natural place for definitions: they sit next to the models they depend on, with lineage and tests. It supports Snowflake, BigQuery, Databricks, Redshift, Postgres and Trino, and "does not store a physical copy of your data" ([Semantic Layer FAQs](https://docs.getdbt.com/docs/use-dbt-semantic-layer/sl-faqs), updated October 19, 2026). It reaches Power BI, Tableau, Google Sheets, Excel, Hex, Mode, Sigma and others, plus JDBC, GraphQL and a Python SDK ([integrations](https://docs.getdbt.com/docs/platform-integrations/avail-sl-integrations), updated September 29, 2026).

MetricFlow itself is open: it's "distributed under the Apache 2.0 license" and "works with the Apache Ossie format" ([About MetricFlow](https://docs.getdbt.com/docs/build/about-metricflow)). Ossie, formerly Open Semantic Interchange, is incubating at Apache ([apache/ossie](https://github.com/apache/ossie)). Definitions you write aren't locked to one BI tool.

## When can't it be fixed with dbt alone?

**Without a dbt platform plan, there's no API.** The FAQ says dbt users can define metrics and "query their semantic layer locally using the command line," but "won't be able to use the APIs or available integrations to access metrics dynamically." API access requires a Starter, Enterprise or Enterprise+ plan, and "caching and using multiple credentials are available for Enterprise and Enterprise+ plans" ([FAQs](https://docs.getdbt.com/docs/use-dbt-semantic-layer/sl-faqs)).

**Without a supported platform.** "Support for other data platforms, such as Fabric, isn't available at this time" ([FAQs](https://docs.getdbt.com/docs/use-dbt-semantic-layer/sl-faqs)).

**Without per-user access control.** "The credentials you configure when setting up the dbt Semantic Layer are used for every request," unless you authenticate with personal access tokens. If marketing shouldn't see margin, that has to be enforced in the warehouse credentials, not in the metric.

**Without the data in the warehouse.** The Semantic Layer starts where dbt starts: on tables already loaded into the warehouse. Getting Shopify orders, Google Ads spend, Meta conversions and refunds from the payment processor into that warehouse is a separate job, done by an ingestion tool or your own pipelines, and each source arrives with its own idea of what a conversion or an order is. If the refunds table isn't loaded, no YAML can subtract it. If Meta's attributed revenue lands next to Shopify's order revenue without a declared rule for which one wins, the metric layer will happily expose both.

**Without a data team.** The Semantic Layer assumes someone maintains models, writes YAML, reviews changes and keeps sources flowing. A brand with no data engineer gets a well-designed empty file. Where the definitions live relative to storage is in [semantic layer vs data warehouse](https://precisian.io/blog/en/posts/semantic-layer-vs-data-warehouse/).

That last case is where Precisian sits. We run the ingestion, keep each client's data in an isolated lake on our infrastructure, and model the semantic layer with the client's team, so finance and growth approve one versioned definition per metric. The client's own AI reads it through MCP, alongside an API and a direct BI connection. If you already have a dbt team, keep dbt. The [ETL tools comparison](https://precisian.io/blog/en/posts/best-etl-tools-for-marketing-data/) scores both paths.

## What does this article not cover?

It doesn't cover saved queries, exports, caching configuration or conversion and cumulative metric types. It doesn't quote dbt plan prices, which the pages read here don't list. It describes dbt v1.12 syntax; older projects using `measures` look different. And the illustrative YAML and the $100,000 month are synthetic, not from any client.

If your dbt project lists more than one metric called revenue, compile them side by side and look at the `WHERE` clause and the date column before anyone connects an agent. [Watch a governed MCP answer](https://precisian.io/en/demo?utm_source=blog&utm_medium=cta&utm_campaign=dbt-semantic-layer&utm_content=texto) over an isolated lake, with no contract commitment.
