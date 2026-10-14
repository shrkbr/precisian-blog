---
title: "Google Analytics MCP: why the numbers it returns are already modeled"
description: "The Google Analytics MCP server reads GA4 through the Data API, which follows your reporting identity. On Blended, the numbers arrive already modeled."
slug: "google-analytics-mcp-limits"
lang: "en"
translationKey: "ga4-mcp"
publishedAt: 2026-10-14
tags: ["mcp", "ga4", "consent", "ai-data-access", "data-discrepancy", "metric-hallucination", "ecommerce"]
draft: false
llmSummary: "Google's Analytics MCP server (googleanalytics/google-analytics-mcp, experimental, v0.7.0) reads GA4 through the Data API, which follows the property's reporting identity, modeling included. Responses carry subject_to_thresholding and sampling_metadatas, but no field says what was modeled."
citations: ["https://github.com/googleanalytics/google-analytics-mcp", "https://developers.google.com/analytics/devguides/MCP", "https://pypi.org/project/analytics-mcp/", "https://developers.google.com/analytics/devguides/reporting/data/v1", "https://developers.google.com/analytics/devguides/reporting/data/v1/reporting-data-expectations", "https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/ResponseMetaData", "https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/PropertyQuota", "https://support.google.com/analytics/answer/11161109", "https://support.google.com/analytics/answer/10976610", "https://support.google.com/analytics/answer/9383630", "https://support.google.com/analytics/answer/13504892"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://en.wikipedia.org/wiki/Google_Analytics", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

The Google Analytics MCP server hands your AI assistant the same numbers GA4 already holds, modeling, thresholds and `(not set)` included, and the assistant reports them as if they were counts. The official server reads GA4 through the Data API, and Google's documentation, last updated October 13, 2026, says that API respects the property's reporting identity, so user counts, deduplication and data modeling all follow that setting ([Google Analytics Data API](https://developers.google.com/analytics/devguides/reporting/data/v1)). On the Blended identity, part of the answer is an estimate, and nothing in the response says so.

> **Google Analytics MCP server**: a read-only server that implements the Model Context Protocol on top of the GA4 Admin API and Data API, giving a language model your property's reports under the same identity, threshold and sampling rules as the GA4 interface.

## What does the failure look like?

You connect GA4 to Claude or Gemini, ask "how many users bought from organic search in September?", and get a clean integer in a confident paragraph. Someone opens GA4 and sees roughly the same number. Nobody questions it, because the two match.

They match because they come from the same ruler. The trouble shows up later, in three places:

- **Finance asks "what did we sell?"** The assistant answers with GA4 revenue, which leaves out Amazon, the phone order your team keyed in, and the refunds processed in Shopify or NetSuite after the purchase event fired.
- **Someone checks BigQuery.** The export carries no modeled data, so the assistant's figure lands above the warehouse.
- **The question gets granular** (a single state, an age bracket, a small campaign). Rows get withheld by thresholding, and the assistant adds up what is left as if it were the whole.

In none of these cases does the assistant get the math wrong. It reads a source that already contained estimates and gaps, correctly, and writes the answer in the voice of someone who counted every order by hand.

## What is the official server, and what does it expose?

It is a Google project, labeled experimental, that runs on your machine. The `googleanalytics/google-analytics-mcp` repository titles itself "Google Analytics MCP Server (Experimental)" and uses the GA4 Admin API and Data API ([repository](https://github.com/googleanalytics/google-analytics-mcp)). The current release on [PyPI](https://pypi.org/project/analytics-mcp/) is 0.7.0, from July 29, 2026; the first, 0.1.0, shipped August 22, 2025.

Google's guide says the server "is available for read requests only" and can't edit your property's configuration ([Google for Developers](https://developers.google.com/analytics/devguides/MCP)). In the code, credentials are requested with the `analytics.readonly` scope, the same one the README requires.

The README lists seven tools. The 0.7.0 code registers nine:

| Tool | What it does | In the README? |
|---|---|---|
| `get_account_summaries` | Lists accounts and properties the user can reach | yes |
| `get_property_details` | Details for one property | yes |
| `list_google_ads_links` | Links to Google Ads accounts | yes |
| `get_custom_dimensions_and_metrics` | Custom dimensions and metrics | yes |
| `run_report` | A Data API report | yes |
| `run_funnel_report` | A funnel report | yes |
| `run_realtime_report` | A realtime report | yes |
| `list_property_annotations` | The property's annotations | no |
| `run_conversions_report` | Conversions report with an attribution model, on Data API v1alpha | no |

Source: [README and `coordinator.py`](https://github.com/googleanalytics/google-analytics-mcp), checked October 14, 2026.

For diagnosis, the relevant code detail is that `run_report` returns the full Data API response converted to a dictionary, `metadata` block included. Threshold and sampling information reaches the model. Whether the model mentions it depends on whether anyone asked.

## Why are the numbers already modeled?

Because the Data API reads the same data as the interface, under the same rules. Four mechanisms, each documented.

**Consent modeling.** On the **Blended** reporting identity, GA4 estimates the behavior of users who declined consent from the behavior of those who accepted ([Google](https://support.google.com/analytics/answer/10976610)). The Data API's expectations page states that "both the Google Analytics UI and Data API use the same reporting identity setting" ([Google](https://developers.google.com/analytics/devguides/reporting/data/v1/reporting-data-expectations)). Modeled users and conversions reach the MCP exactly as they appear on screen. How much of a number is estimated, the response won't tell you: [`ResponseMetaData`](https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/ResponseMetaData) has fields for thresholding, sampling and the `(other)` row, and none for modeling. Eligibility rules and what modeling excludes are covered in [why GA4 and your BigQuery export will never agree](https://precisian.io/blog/en/posts/consent-mode-modeled-data/).

**Data thresholds.** GA4 can withhold rows with few users to prevent identifying individuals, more often with high-cardinality or custom dimensions ([Google](https://developers.google.com/analytics/devguides/reporting/data/v1/reporting-data-expectations)). Thresholds are system-defined and can't be adjusted ([Google](https://support.google.com/analytics/answer/9383630)). A withheld row drops out of the response rather than showing as zero.

**The `(other)` row and `(not set)`.** Dimensions with more than 500 unique values per day tend to have rare values rolled into `(other)`, and Data API filters run after that grouping, so they can't see inside it ([Google](https://developers.google.com/analytics/devguides/reporting/data/v1/reporting-data-expectations)). `(not set)` is GA4's placeholder when it received no value for a dimension, for example a session missing `session_start` or an unlinked Google Ads account ([Google](https://support.google.com/analytics/answer/13504892)). The assistant treats both as just another category.

**Sampling and approximate counts.** `runReport` can return sampled data for large reports, and active users and sessions are estimated with the HyperLogLog++ algorithm, in the interface and the API alike ([Google](https://developers.google.com/analytics/devguides/reporting/data/v1/reporting-data-expectations)). The sampling-level control exists only in `properties.reportTasks.create`, which the server doesn't expose.

Add quota on top. A standard property gets 200,000 tokens per day and 40,000 per hour, and a single Google Cloud project can use at most 14,000 per hour against any one property ([Google](https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/PropertyQuota)). An agent that chains dozens of reports to answer one question hits that ceiling, and the error comes back as text the model may summarize instead of showing you.

## How do you check whether a response was thresholded, sampled or modeled?

Ask the assistant for the raw `metadata` block from its last call, unsummarized. Because the server preserves protobuf field names, the fields arrive in snake_case ([code](https://github.com/googleanalytics/google-analytics-mcp)), not in the camelCase of the REST reference.

| Check | Where to look | What signals a problem |
|---|---|---|
| Thresholding | `metadata.subject_to_thresholding` | `true`: the report only returns rows above the minimum aggregation threshold |
| `(other)` row | `metadata.data_loss_from_other_row` | `true`: some dimension combinations were rolled into `(other)` |
| Sampling | `metadata.sampling_metadatas` | Present: `samples_read_count` and `sampling_space_size` per date range; absent means unsampled |
| Truncation | `metadata.data_truncation_reasons` | Present: part of the date range wasn't served, for data retention or another listed reason |
| Metric restriction | `metadata.schema_restriction_response` | `REVENUE_DATA` or `COST_DATA` restricted for the credential's user |
| Quota | call `run_report` with `return_property_quota: true` | `tokens_per_hour.remaining` close to zero |
| `(not set)` | run the report by `sessionSourceMedium` and sum the `(not set)` rows | A meaningful share of revenue with no source |
| Modeling | Admin › Data display › Reporting identity, in the GA4 interface | "Blended" with modeling active: users and conversions may include estimates |

Sources: [ResponseMetaData](https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/ResponseMetaData), [PropertyQuota](https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/PropertyQuota), [reporting identity](https://support.google.com/analytics/answer/10976610).

Modeling weighs the most, and it's the one check the MCP can't answer. Reporting identity isn't returned by `get_property_details` or by the report response; a person has to open the interface and look.

A quick revenue test: pull the same month from GA4 through the assistant and from Shopify (net sales, after refunds). The gap has known causes, laid out in [why Shopify and GA4 revenue never match](https://precisian.io/blog/en/posts/shopify-ga4-revenue-mismatch/). If the assistant presented the GA4 figure as "sales," you've found the first error, and it isn't the server's.

## How do you fix it?

Three changes handle most of it, and none requires switching tools.

**1. Make the assistant state the metadata.** A standing instruction in the project or system prompt: "every answer with a GA4 number states the property's reporting identity and the values of `subject_to_thresholding`, `data_loss_from_other_row` and any `sampling_metadatas`; if any of them signal loss, say so before the number." Same principle as [teaching an agent to say "I don't know"](https://precisian.io/blog/en/posts/teaching-an-agent-to-say-i-dont-know/): uncertainty belongs in the text of the answer, not buried in the JSON.

**2. Pick the reporting identity for the job.** Google says the choice "does not affect data collection or processing" and that you can switch at any time without permanent impact ([Google](https://support.google.com/analytics/answer/10976610)). If you'll use the assistant to check numbers, the **Observed** identity removes modeling from the interface and the API at once. The cost is lower user counts, because users who declined consent stop being estimated.

**3. Lower the odds of thresholding and `(other)`.** Longer date ranges can surface data withheld by thresholds ([Google](https://support.google.com/analytics/answer/9383630)). Fewer dimensions per report means less `(other)`. Skipping age, gender and interests spares the quota of 120 requests per hour that include potentially thresholded dimensions ([Google](https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/PropertyQuota)).

And one reading rule: while Blended is active, treat user and conversion counts from the MCP as trend, not as numbers for closing the books.

## When can't it be fixed?

In four cases, and it's worth knowing which before you promise leadership a number.

**Revenue that never passed through GA4 doesn't exist for this server.** Amazon orders, TikTok Shop orders, wholesale invoiced in NetSuite, the phone order a rep keyed in, and the return processed two weeks later fire no GA4 event. The MCP reads the property and nothing else; no tool or parameter brings those rows in. The marketplace side is covered in [the marketplace attribution black hole](https://precisian.io/blog/en/posts/marketplace-attribution-blackhole/).

**The modeled share can't be separated in the response.** The Data API has no field that says how much of a number is estimated. You can switch identity and compare, but the switch applies to the whole property, including anyone viewing the interface at that moment.

**Rows withheld by thresholds don't come back through the API.** The threshold belongs to the system and can't be tuned. What you can change is the question.

**Sampling on a standard property.** Without `reportTasks` in the server, there's no way to request an unsampled report through it.

A round-number example, synthetic, for a Shopify store that also sells on Amazon and takes wholesale orders, for one month:

| Reading | Revenue | Does the GA4 MCP see it? |
|---|---|---|
| GA4 `purchase` events from the Shopify store | $400,000 | yes |
| Shopify refunds after the event fired | − $24,000 | no |
| Amazon orders | $150,000 | no |
| Wholesale invoiced in NetSuite | $60,000 | no |
| Revenue finance recognizes | $586,000 | no |

In this made-up example, the assistant answers $400,000 with the same confidence it would answer $586,000. The numbers are illustrative; the size of the gap in your business only shows up when you measure it.

The GA4 MCP isn't the wrong answer for everyone either. If every sale happens on your site and the question is about traffic, funnels and behavior, it does the job, and you don't need a data platform for that. Precisian comes in when the question is "what did we sell, and where did it come from?": GA4, Shopify, marketplaces and media in a data lake isolated per customer, on Precisian's infrastructure, with the revenue definition written once in a semantic layer and served to the assistant you already use, through MCP, API or BI. For the ad-platform counterpart, see [the official Google Ads MCP server](https://precisian.io/blog/en/posts/google-ads-mcp-what-it-sees/); for what happens when all three servers share one chat, see [three MCPs, three revenues](https://precisian.io/blog/en/posts/three-mcps-three-revenues/).

## What does this article not cover?

It isn't an installation guide; the steps live in the [README](https://github.com/googleanalytics/google-analytics-mcp) and change with each release. It doesn't compare third-party GA4 MCP servers. It doesn't measure how much of your number is modeled: Google publishes no per-property percentage, and any figure you see in vendor material is an estimate with no stated method. And it doesn't detail `run_conversions_report`, which runs on Data API v1alpha and can change without notice.

---

If the assistant connected to GA4 answers "sales" and the number doesn't tie to Shopify, the first step is measuring the gap between GA4 revenue and recognized revenue, month by month, with Amazon and wholesale in the count. [Book a conversation about your setup](https://calendar.notion.so/meet/rodrigomartucci/precisian-io). No contract commitment, and no promise of an answer in 30 minutes either.
