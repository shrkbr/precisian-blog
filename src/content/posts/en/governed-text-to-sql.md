---
title: "Why text-to-SQL fails on marketing data, even when the query runs"
description: "The query that runs is the worst case of text-to-SQL: the wrong revenue column, the wrong window or a fan-out join returns a clean number and no error."
slug: "governed-text-to-sql"
lang: "en"
translationKey: "text-to-sql"
publishedAt: 2026-10-14
tags: ["text-to-sql", "semantic-layer", "metric-hallucination", "ai-data-access", "ecommerce"]
draft: false
llmSummary: "Text-to-SQL fails on marketing data without throwing errors: the model picks the wrong revenue column, the wrong date window, or a join that duplicates rows. On Spider 2.0 (ICLR 2025), o1-preview solved 21.3% of 632 enterprise tasks versus 91.2% on Spider 1.0."
citations: ["https://arxiv.org/abs/2411.07763", "https://arxiv.org/abs/2305.03111", "https://bird-bench.github.io/", "https://docs.getdbt.com/docs/build/join-logic", "https://omni.co/blog/why-text-to-sql-fails", "https://arxiv.org/abs/2501.09310"]
about: ["https://en.wikipedia.org/wiki/Natural-language_user_interface", "https://en.wikipedia.org/wiki/Semantic_layer", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 9
---

Text-to-SQL fails on marketing data precisely when the query runs: the model picks the wrong revenue column, the wrong date window, joins a table that multiplies rows, or adds up the same order under two channels, and hands back a clean number with no error message. Getting it right is hard even under test conditions: on Spider 2.0, presented at ICLR 2025, o1-preview solved 21.3% of 632 enterprise tasks, against 91.2% on Spider 1.0 ([Lei et al., 2024](https://arxiv.org/abs/2411.07763)).

The fix is giving the model defined metrics instead of tables. Switching models removes none of the four failures described below.

> **Text-to-SQL** is the technique in which a language model translates a natural-language question into a SQL query against a database schema. **Governed text-to-SQL** is the variant in which the model queries metrics already defined in a semantic layer, instead of assembling the calculation from raw tables.

## What does the failure look like from the business side?

It looks like a number nobody questions in the moment.

Someone asks the agent "what was revenue in September?" and gets a tidy figure, with the SQL attached if they ask for it. The query is syntactically perfect. The figure differs from what finance closed, but the gap only surfaces at next month's review, when someone puts the two slides side by side. By then the number has already been in the board deck and in the budget call.

The symptom comes in three variants:

- **The number changes when the wording does.** "Revenue for September" and "sales for September" come back different, and both queries run.
- **The channel breakdown adds up to more than the total.** The agent splits revenue by ad platform and the parts sum past the month.
- **Revenue goes up when you ask for more detail.** Asking for "revenue and units sold" in one question returns a higher revenue than asking for revenue alone.

None of these trips an alert. That is why valid SQL is the worst case: a syntax error breaks immediately and somebody fixes it; valid SQL with the wrong meaning becomes a time series.

Omni, which sells BI built on a semantic layer and therefore has a stake in this diagnosis, puts it this way: "the real danger is that text-to-SQL fails silently and confidently," and "the problem is not that LLMs write bad SQL. The problem is that they write plausible SQL that means the wrong thing" ([Omni, April 2026](https://omni.co/blog/why-text-to-sql-fails)). That is a vendor's opinion. The four mechanisms below are what back it up.

## Why is a query that runs the worst case?

Because the model sees columns, and the question is about a definition that lives in no column at all.

To make it concrete, I built a **synthetic** ecommerce schema for this article, with four tables that exist in nearly every Shopify-style operation:

```sql
-- Synthetic schema (not from any customer)
orders      (order_id, created_at, paid_at, financial_status, sales_channel,
             gross_sales, discounts, shipping, tax, net_sales)
order_lines (order_id, sku, quantity, unit_price)
refunds     (order_id, refunded_at, amount)
ad_spend    (date, platform, campaign, spend, attributed_revenue)
```

### 1. The wrong revenue column

Question: "what was revenue in September?" There are at least four candidates: `gross_sales`, `net_sales`, `net_sales` minus refunds, and `attributed_revenue` from the ad table. Whichever name looks most like "revenue" wins.

```sql
SELECT SUM(gross_sales)
FROM orders
WHERE created_at >= '2026-09-01' AND created_at < '2026-10-01';
```

It runs. It includes cancelled orders, ignores discounts and does not subtract refunds. Finance usually closes something else: paid orders, net of discounts, excluding shipping and sales tax, minus refunds. Which of the four is right is not in the schema; it is a company decision, almost never written down. It is the mechanism I described in [metric hallucination](https://precisian.io/blog/en/posts/metric-hallucination/), seen from the SQL side.

### 2. The wrong window

Same question, different failure. The model filters on `created_at` when finance closes on `paid_at`. With authorize-now, capture-later payments, the two can land in different months. And two edge traps survive any quick review:

```sql
-- If created_at is a timestamp, this drops everything on Sept 30 after midnight
WHERE created_at BETWEEN '2026-09-01' AND '2026-09-30'

-- And if the warehouse stores UTC, orders placed after 8 p.m. Eastern
-- on the last day of the month land in October
```

"Last month" can also become "the last thirty days" if the question is loose. None of it throws an error.

### 3. The join that multiplies rows (fan-out)

Question: "what was revenue and how many units did we sell in September?" The model joins orders to order lines, the obvious path:

```sql
SELECT SUM(o.net_sales)  AS revenue,
       SUM(l.quantity)   AS units
FROM orders o
JOIN order_lines l ON l.order_id = o.order_id
WHERE o.paid_at >= '2026-09-01' AND o.paid_at < '2026-10-01';
```

Each order now appears once per line item. An order with three SKUs has its `net_sales` counted three times. Units come out right; revenue comes out multiplied. dbt's documentation defines the pattern exactly: fan-out joins are "when one row in a table is joined to multiple rows in another table, resulting in more output rows than input rows" ([dbt, updated September 2026](https://docs.getdbt.com/docs/build/join-logic)). The same happens with `refunds` when one order has two partial refunds.

### 4. The same order counted under two channels

Question: "how much revenue did paid media drive in September?"

```sql
SELECT SUM(attributed_revenue)
FROM ad_spend
WHERE date >= '2026-09-01' AND date < '2026-10-01';
```

Each platform records the revenue it attributes to itself, under its own rules, and the same order fits inside more than one platform's window. Summing the rows sums the claims, and the total can exceed actual sales, as I walked through in [why reported ROAS exceeds actual revenue](https://precisian.io/blog/en/posts/roas-exceeds-actual-revenue/). The retail version of the same mistake is adding Shopify and Amazon orders together when a connector already synced one into the other.

### How big is the damage, in round numbers?

The figures below are **synthetic**, built only to show the order of magnitude each mistake produces on the same month:

| Question | SQL the model chose | Value returned | Value finance closes |
|---|---|---|---|
| September revenue | `SUM(gross_sales)` by `created_at` | $1,180,000 | $1,000,000 |
| September revenue and units | `JOIN order_lines` + `SUM(net_sales)` | $2,350,000 | $1,000,000 |
| Revenue driven by paid media | `SUM(attributed_revenue)` across platforms | $1,420,000 | no such number in the ledger |

All three queries run without a single warning.

## What do the benchmarks measure, and what don't they?

They measure whether the model reaches the result of a reference query someone already wrote. They do not measure whether that reference matches your company's definition.

BIRD contains 12,751 question-SQL pairs over 95 databases totaling 33.4 GB; in the original paper, humans scored 92.96% and ChatGPT 40.08% ([Li et al., 2023](https://arxiv.org/abs/2305.03111)). On the official leaderboard checked on October 14, 2026, the top test-set entry posted 82.95% execution accuracy, from a submission dated September 7, 2026 ([BIRD](https://bird-bench.github.io/)). Spider 2.0 raised the bar to enterprise databases, often above 1,000 columns on BigQuery and Snowflake, and accuracy fell to 21.3% ([Lei et al., 2024](https://arxiv.org/abs/2411.07763)).

Both numbers say the same thing from opposite ends. When the question has an answer key, models get close to humans. When the schema grows and the decisions about meaning go implicit, they fall.

With marketing data, "what was revenue?" has no answer key until someone writes down which revenue. A high benchmark score proves a model translates a question with one correct answer well. Yours has four.

## How do you diagnose it in your own warehouse?

With six checks any analyst can run in an afternoon, starting from the SQL the agent has already produced.

| Check | How to run it | What signals a problem |
|---|---|---|
| Which column was used | Require the SQL alongside every revenue answer | `gross_sales`, `attributed_revenue`, or a sum that ignores refunds |
| Which date governs | Find the date field in the `WHERE` clause | `created_at` where finance uses paid or fulfilled date |
| Window edges | Look for `BETWEEN` on timestamps and check the warehouse time zone | Last day truncated, or evening orders in the wrong month |
| Grain after a join | Run the count below | `rows` greater than `orders` |
| Channel sums | Compare total `attributed_revenue` to net revenue for the month | The sum exceeds the total |
| Stability | Same question, two sessions, different wording | Different numbers |

The grain check is the cheapest one and catches the most expensive error:

```sql
SELECT COUNT(*) AS rows,
       COUNT(DISTINCT o.order_id) AS orders
FROM orders o
JOIN order_lines l ON l.order_id = o.order_id;
-- If rows > orders, any SUM over an order-level column in this join is inflated
```

Then build your **golden questions**: the questions leadership asks every month, each paired with the answer finance has already reconciled. Run them all through the agent and record the gap. If you cannot write the golden answer to a question, the problem is the definition, and the conversation is the one in [why marketing and finance never close the same revenue number](https://precisian.io/blog/en/posts/marketing-finance-revenue-definition/).

## How do you fix it?

By taking away from the model a decision it should never have been making. Three steps.

**Define each metric once, with a version.** Column, status filter, what is in and out, which date governs, time zone, grain and owner. The format of a metric contract is laid out in [what goes into a semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/); what matters here is the effect: failures 1 and 2 stop existing, because the choice of column and window moved out of the question and into the definition.

**Make the agent query by metric, not by table.** The difference is in what the model writes:

```text
-- By table: the model picks column, date, join and filter
SELECT ... FROM orders JOIN order_lines ... WHERE ...

-- By metric: the model picks only what the question asks for
metric: net_revenue   version: 3
dimensions: sales_channel
period: 2026-09 (paid month)
```

The SQL is generated by the layer, from declared join paths. dbt's MetricFlow documents exactly this behavior: it "restricts the use of fan-out and chasm joins" and picks the join type from the declared entities ([dbt](https://docs.getdbt.com/docs/build/join-logic)). Failure 3 disappears by construction. Failure 4 disappears by naming: platform-attributed revenue and net revenue become separate metrics, and the first one is not summable across platforms. Querying by metric also bounds what the agent scans, which is the other half of [query cost guardrails](https://precisian.io/blog/en/posts/query-cost-guardrails/).

**Test against the golden questions on every change.** New definition, new model, schema change or connector upgrade: run the full list and compare it with finance's answer key. A golden question that starts to drift is a regression, handled as a bug.

That is the scope Precisian delivers: a versioned semantic layer on top of a data lake isolated per client, on our infrastructure, queried by the AI your team already uses through MCP, API or your BI tool. The infrastructure is ours, the data is yours. You can access it at any time and, if you leave, you take all of it, definitions included.

## When can't it be fixed?

When the question has no defined metric, and shouldn't have one yet.

**Questions about decisions the company hasn't made.** "Does Amazon revenue count gross or net of referral fees?" If finance and marketing answer differently, no semantic layer settles it; it only records the answer after someone decides. Until then, the correct agent behavior is to say it doesn't know, and [teaching an agent to say "I don't know"](https://precisian.io/blog/en/posts/teaching-an-agent-to-say-i-dont-know/) is part of the fix.

**Questions about data that doesn't exist.** "Which campaign was most profitable?" requires landed cost per SKU, real shipping cost and marketplace fees. If the warehouse has no cost data, the agent will divide revenue by spend and call it profit. No metric creates the missing column.

**Ad hoc exploration.** When an analyst who reads SQL is chasing a new pattern, raw text-to-SQL over tables is useful and governance gets in the way. That person checks the query before trusting the number. The risk starts when the same query becomes an answer for someone who doesn't read SQL.

And the case where Precisian is the wrong answer: if nearly all your questions are exploratory and the person asking always audits the SQL, the payoff of a semantic layer is small next to the effort of defining and maintaining metrics.

## What does this article not cover?

It does not cover security: prompt injection and row-level permissions are a separate failure mode, covered in [prompt injection in marketing data](https://precisian.io/blog/en/posts/prompt-injection-marketing-data/). It does not compare semantic-layer tools.

Omni's post lists other figures on the topic, which I used only as pointers. One of them shows why a number with a citation attached is not a checked number: Shen et al.'s taxonomy of text-to-SQL errors reported 29 error types in its first version, from January 2025, and the abstract of the current version, from June 2026, reports 27 ([arXiv 2501.09310](https://arxiv.org/abs/2501.09310)). Benchmark leaderboards move every week too, which is why every figure above carries a date.

If your agent returns revenue without saying which column it used, the first step is to measure the gap between its answers and finance's close on a handful of golden questions. [See how querying by metric works in practice](https://precisian.io/en/demo), with no contract commitment, and no promise of an answer in 30 minutes either.
