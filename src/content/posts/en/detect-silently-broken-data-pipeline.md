---
title: "How to tell if your data pipeline broke, or just lied"
description: "Airflow documents it in one line: if the run never finishes, the SLA is never checked. That is the easy version."
slug: "detect-silently-broken-data-pipeline"
lang: "en"
translationKey: "detect-broken-data-pipeline"
publishedAt: 2026-12-15
tags: ["pipeline", "observabilidade", "divergencia-de-dados"]
draft: false
llmSummary: "A pipeline that breaks loudly is easy; the costly one exits green with wrong or empty data. dbt documents three silent modes: a freshness check that never runs, an incomplete rule that still lets the run succeed, and severity warn. A run that never started has no documented mechanism."
citations: ["https://airflow.apache.org/docs/apache-airflow/stable/howto/sla-to-deadlines.html", "https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/tasks.html", "https://docs.getdbt.com/reference/resource-configs/freshness", "https://docs.getdbt.com/docs/build/sources", "https://docs.getdbt.com/reference/resource-configs/severity", "https://airflow.apache.org/docs/apache-airflow-providers-common-sql/stable/operators.html", "https://research.google/pubs/everyone-wants-to-do-the-model-work-not-the-data-work-data-cascades-in-high-stakes-ai/"]
about: ["https://en.wikipedia.org/wiki/Data_lineage", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

Airflow's own migration guide states the failure mode in one line: "**If the Dag run never finishes, the SLA is never checked**" ([Airflow](https://airflow.apache.org/docs/apache-airflow/stable/howto/sla-to-deadlines.html)). In a CHI 2021 study of 53 interviewed practitioners, cascading data problems showed a **92% prevalence**, characterised as "invisible, delayed, but often avoidable" ([CHI 2021](https://research.google/pubs/everyone-wants-to-do-the-model-work-not-the-data-work-data-cascades-in-high-stakes-ai/)).

A monitor that only fires at completion cannot see a job that never completed. And that is the easy version of the problem.

> **Two different failures.** "Broke" is the loud one: non-zero exit code, exception, alert. "Ran and lied" is the quiet one: the job exits green with data that is wrong, incomplete or empty. The second is the expensive one, and almost no alarm covers it.

## Is your monitor built on an API that no longer exists?

Worth checking before anything else, because two central tools changed recently.

In Airflow, "the SLA feature from Airflow 2 has been removed in 3.0 and was replaced in Airflow 3.1 with Deadline Alerts" ([Airflow](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/tasks.html)). In dbt, `dbt source freshness` became a legacy subcommand, and checking sources and models moved to the top-level `dbt freshness`.

Most teams still run earlier versions, so both APIs coexist in the real world. The risk is not using the old one. It is following a tutorial that teaches the old one without saying it died, and concluding that you are monitored.

The generational difference is not cosmetic. The old SLA checked the deadline **after** the run finished. Deadline Alerts compute the expiry **when it starts** and fire "immediately", without waiting for the end. That is the difference between knowing something was late and knowing something is stuck.

## What are the documented ways to fail silently?

Three, and all three are described by the vendor. None is a bug.

**The check that never runs.** In dbt, if you supply neither `warn_after` nor `error_after`, "dbt will not calculate freshness for the tables in this source". And if the loaded-at field is missing with no viable alternative, "dbt will not calculate freshness for the table" ([dbt](https://docs.getdbt.com/docs/build/sources)). Neither case raises an error. There is an absence of checking, which on a dashboard looks green.

**The incomplete rule that does not fail the run.** The documentation records that a partial rule, for example `warn_after` with a count but no period, "issues a warning at parse time", and that `dbt run` and `dbt build` "warn but still succeed" ([dbt](https://docs.getdbt.com/reference/resource-configs/freshness)). Only the freshness command treats it as an error.

**The severity that demotes the failure.** dbt data tests default to `severity: error` but accept `warn`, alongside configurable thresholds where `error_if` and `warn_if` take comparisons against the failing row count ([dbt](https://docs.getdbt.com/reference/resource-configs/severity)). Setting `severity: warn` is a deliberate, documented way to make a violated assertion not stop the pipeline.

That third one deserves an honest paragraph: it exists for good reasons. The problem appears when the `warn` was added to silence a noisy alarm on a Tuesday and nobody came back.

## What makes a test fail loudly?

One thing, and it is worth knowing which.

In dbt, "tests on upstream resources will block downstream resources from running, and a test failure will cause those downstream resources to skip entirely" ([dbt](https://docs.getdbt.com/reference/commands/build)). The per-model order is test, materialize, test again.

Note that the guarantee belongs to `build`. Teams running transformation and tests as separate steps do not get that blocking: the bad data was already published by the time the test complains, and the complaint becomes a notice about something already on someone's desk.

The four generic tests that ship out of the box cover less than people assume: uniqueness, not-null, accepted values and referential integrity. All four are assertions about content that **exists**. None of them asks whether the content exists.

## How do you catch a table that went empty?

With a check you have to write, because the default is rarely what you want.

Airflow's check operator evaluates each value in the first row as a Python boolean, and the documentation supplies the example that solves this case: "given a query like `SELECT COUNT(*) FROM foo`, it will fail only if the count `== 0`" ([Airflow](https://airflow.apache.org/docs/apache-airflow-providers-common-sql/stable/operators.html)). The same text lists what Python treats as false, including zero, the empty string and the empty list.

There is a gotcha here worth its weight, and almost nobody checks it: **sibling operators ship opposite defaults.** On the table-level operator, the parameter that accepts emptiness defaults to false, documented as "if True, an empty table (row count=0) will not trigger a failure". On the column-level operator, the analogous parameter defaults to **true**, converting null to zero.

So depending on which of the two you used, an empty table either stops the pipeline or passes through converted into a zero. Reading the default backwards is easy, and the mistake surfaces as a plausible number.

The same documentation states the design decision every team should make consciously: put the check on the critical path, "preventing from publishing dubious data", or beside it, receiving an alert "without stopping the progress of the DAG". Both are legitimate. What is not legitimate is having never decided.

## How often should the check run?

dbt publishes the rule, and it is stricter than common practice.

The guidance is to run freshness jobs at "at least double the frequency of your lowest SLA", with examples: a one-hour SLA calls for a check every 30 minutes; a one-day SLA every 12 hours ([dbt](https://docs.getdbt.com/docs/deploy/source-freshness)).

The practical reading is uncomfortable. If the team promises yesterday's data by 9am and checks once daily at 8am, it discovers the delay at the same instant the user does. The check is not preventing anything. It is documenting.

## What should you check first, on Monday?

Three things, ordered by how much they hurt if you skip them.

**Find out whether freshness is actually being calculated.** Not whether it is configured: whether the calculation runs. Given the two documented no-op conditions above, a source can carry a freshness block and produce no check at all. The way to know is to look for a freshness result, not a freshness config.

**Count your `severity: warn` settings.** Each one is a deliberate decision that an assertion may fail without stopping anything. Some are right. The question is whether anyone alive remembers making them, and whether the alarm they silenced was ever fixed.

**Write down what has no check at all.** Most pipelines have a well-instrumented core and an uninstrumented edge, usually the tables added last quarter under time pressure. Those are also the ones feeding the newest reports, which is where the highest-stakes questions get asked.

The output of that hour is a short list, and its value is that it distinguishes "we are monitored" from "we have monitoring configured". Those two sentences describe very different systems, and only one of them tells you when something went quietly wrong.

## Which failure does no tool catch on its own?

The run that never started.

Airflow's deadline alerts are registered **when a run begins**. A run that never began, because the scheduler was down, because the cron entry was deleted, because a credential expired, never enters that mechanism. I looked for a documented feature covering this case and found none.

The mitigation exists and is architectural rather than a feature: a watchdog outside the pipeline that expects a periodic signal and alerts when it does not arrive. It is the inverse of everything else, because it alerts on the **absence** of an event. And it is exactly the shape that covers the failure this article opened with.

I am flagging explicitly that this is a design recommendation, not a documented feature of the tools cited. The difference matters, because it means somebody has to build and maintain it.

## Why is this not only an engineering problem?

Because the consequence lands in a decision before it lands in a log.

The study cited at the top interviewed AI practitioners across India, East and West Africa and the United States, and the word it uses for the pattern is the one that matters here: *invisible*. The problem is not rare. It is that it does not announce itself.

There is a recent aggravating factor. While the data's consumer is a person, an empty table produces a strange chart somebody questions. When the consumer is an AI agent, it computes over whatever it found and [answers at its usual confidence](https://precisian.io/blog/en/posts/metric-hallucination/). The window between a silent failure and a wrong decision has shortened, which is also why [freshness belongs in the tool's output](https://precisian.io/blog/en/posts/mcp-for-ecommerce-analytics/) rather than in a monitoring dashboard nobody reads mid-answer.

## What does this article not cover?

It gives no mean time to detect for data incidents. I looked for peer-reviewed research with a stated methodology on this and **there is none**. What circulates in that shape is vendor-commissioned survey material, self-reported, and the most cited one went to field three years before appearing on a page whose title advertises the current year. Anyone quoting a "mean time to detect" is quoting a vendor survey, not literature.

It publishes no configuration example for the dbt-utils recency macro. The file exists and its behaviour is known, but I did not obtain a verbatim reproduction of its arguments, and a wrong code sample is worse than none.

It does not claim that Snowflake's last-altered column lies because of DDL. dbt's documentation states only that source freshness uses that column on that platform; the consequence is plausible, widely repeated, and unverified by me against the platform's own docs.

And a note on method, because it is the third in this series: while sourcing the CHI paper, an automated extractor returned an **entirely wrong author list**, belonging to a different paper by the same researcher. The names above came from the proceedings pages. A number with a citation attached is not a checked number, and neither is a name.
