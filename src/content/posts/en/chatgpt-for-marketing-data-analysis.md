---
title: "ChatGPT and Claude for marketing data analysis: what they get right and what they make up"
description: "ChatGPT data analysis is safe for exploring a spreadsheet and unsafe for deciding with it: the math is right, the revenue definition is a guess."
slug: "chatgpt-for-marketing-data-analysis"
lang: "en"
translationKey: "ai-data-analysis"
publishedAt: 2026-10-14
tags: ["ai-data-access", "metric-hallucination", "semantic-layer", "roas", "ga4", "data-discrepancy"]
draft: false
llmSummary: "ChatGPT analyzes spreadsheets up to about 50 MB by running Python, and Claude handles files up to 30 MB (OpenAI and Anthropic docs, Oct 2026). The arithmetic is correct; the definition of revenue or ROAS is not in the file, so the model picks one. Use it to explore, not to decide."
citations: ["https://help.openai.com/en/articles/8437071-data-analysis-with-chatgpt", "https://help.openai.com/en/articles/8555545-uploading-files-and-audio-to-chatgpt", "https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude", "https://support.claude.com/en/articles/8241126-upload-files-to-claude", "https://support.claude.com/en/articles/10366421-how-does-claude-handle-mathematical-equations-and-calculations", "https://support.google.com/analytics/answer/13331684", "https://support.google.com/analytics/answer/10596866"]
about: ["https://en.wikipedia.org/wiki/Data_analysis", "https://en.wikipedia.org/wiki/Large_language_model", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

ChatGPT data analysis is reliable for exploring marketing data and unreliable for making decisions with it. ChatGPT accepts spreadsheets of roughly 50 MB and writes and runs Python in a Jupyter notebook to do the math ([OpenAI](https://help.openai.com/en/articles/8555545-uploading-files-and-audio-to-chatgpt), checked October 14, 2026); Claude does the same with files up to 30 MB ([Anthropic](https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude)). The arithmetic comes out right. What never ships with the CSV is your definition of revenue, ROAS or new customer, so the model picks one.

> **The triage rule**: when the answer depends on a business definition that is not written in the file, the AI will not make up the number. It will make up the definition, then compute the number correctly on top of it.

## What does the failure look like from the inside?

It looks like a workflow you have probably run yourself. You export the GA4 acquisition report, drop it into ChatGPT or Claude, and ask for "ROAS by channel for Q3." A minute later you have a clean table, a chart and a suggestion about which channel to cut.

The table is persuasive because it is shaped like analysis. Nobody asks which column the revenue came from.

The problem shows up later, somewhere else. Finance closes the quarter on Shopify net sales or on the books, and the AI's channel totals don't add up to it. Someone reruns the question in a fresh chat with the same file, and Google Ads ROAS moves. Your CFO asks whether that ROAS includes Amazon orders, and nobody knows.

Three signals give it away:

- **The total doesn't tie out to the system of record.** The channel sum in the AI's table differs from the revenue finance recognizes.
- **The same question returns different numbers in different sessions.** The model broke a tie one way the first time and another way the second.
- **Nobody can name the definition that was used.** If you can't answer "gross or net, by order date or by payout date?", neither could the model. It chose.

## Why is the math right and the answer wrong?

Because the tool does exactly what it says. OpenAI describes the feature as one that "writes and runs Python code" over the files in your session ([OpenAI](https://help.openai.com/en/articles/8437071-data-analysis-with-chatgpt)). The code operates on the columns it finds. If the sheet has a column called Revenue, the code sums that column, correctly. The error sits upstream of the code, in four places.

**1. The export already carries the definition of whoever produced it.** Revenue out of GA4 is revenue according to GA4: credited by a model that, per Google's own documentation, excludes direct visits from attribution credit unless the whole path is direct ([Google](https://support.google.com/analytics/answer/10596866)). The model doesn't know that unless you tell it. It treats the column as revenue and divides by spend. What you get is [ROAS](https://precisian.io/blog/en/posts/mer-vs-roas/) according to GA4, presented as ROAS.

**2. The file can be incomplete without saying so.** When a table exceeds its row limit, GA4 groups the less common values into an "(other)" row ([Google](https://support.google.com/analytics/answer/13331684)). In an export that crosses campaign, source and medium, part of your long tail disappears in there. The model sums what is in the file. OpenAI itself warns that a file can upload successfully and still be too large or complex for complete analysis ([OpenAI](https://help.openai.com/en/articles/8437071-data-analysis-with-chatgpt)).

**3. The model picks the method.** The documentation says it plainly: ChatGPT may choose an analysis method or chart type that does not match your intent on the first try ([OpenAI](https://help.openai.com/en/articles/8437071-data-analysis-with-chatgpt)). In a marketing question, "method" includes calls like whether to drop refunded orders, whether shipping and tax count, and whether a sale lands on the order date or the payout date.

**4. Joining sources is where failure goes silent.** ChatGPT's Python environment cannot make external web requests or API calls ([OpenAI](https://help.openai.com/en/articles/8437071-data-analysis-with-chatgpt)), so Meta spend has to come in as a second file. To combine them, the model matches rows on channel name. "facebook / cpc" in GA4 and "Meta" in your media sheet don't match on their own, and a failed join throws no error: it just returns fewer rows. The same goes for Shopify and Amazon orders, which arrive with different identifiers and get counted twice unless someone wrote a deduplication rule. Amazon adds a gap of its own: [marketplaces return traffic, never its source](https://precisian.io/blog/en/posts/marketplace-attribution-blackhole/).

None of the four is a model failure, and swapping ChatGPT for Claude fixes none of them. It is the mechanism we call [metric hallucination](https://precisian.io/blog/en/posts/metric-hallucination/): a numerically correct answer built on a definition the company never wrote down.

A synthetic example with round numbers, labeled as such, shows how far it travels:

| Channel | Revenue in the GA4 export | Spend | ROAS the AI returns |
|---|---|---|---|
| Google Ads | $400K | $80K | 5.0 |
| Meta Ads | $150K | $60K | 2.5 |
| Direct and organic | $250K | $0 | n/a |
| **Total** | **$800K** | **$140K** | |

If Shopify books less than that for the same quarter, after refunds, cancellations and chargebacks, every ROAS in the table is inflated by the same ratio, and the advice to "double Google" was made on revenue that never landed. The model got every division right.

## Which tasks are safe to hand to ChatGPT or Claude?

One question draws the line: **does the answer depend on a business definition?** If it doesn't, the AI is fast and good. If it does, the AI has to guess.

| Task | Safe? | Why |
|---|---|---|
| Finding patterns and seasonality in a series | Yes | The shape of the curve doesn't change with the revenue definition |
| Flagging anomalies (spikes, drops, zero days) | Yes | It is a lead to investigate, not a conclusion |
| Cleaning and standardizing (UTMs, campaign names, dates) | Yes, with review | Mechanical work, verifiable row by row |
| Drafting a hypothesis ("the drop lines up with the creative swap") | Yes | A hypothesis asks for a test; nobody moves budget on one |
| Writing the formula, query or script for you to review | Yes | The logic stays readable and auditable |
| Monthly revenue | No | Gross, net, booked or attributed: the file doesn't say |
| ROAS or CAC by channel | No | Depends on who gets credit for the sale and which revenue counts |
| LTV or repeat rate | No | Depends on what counts as a customer and on joining DTC with Amazon |
| Comparing two sources (GA4 vs Shopify, Meta vs GA4) | No | Each source has its own definition; the join fails quietly |
| "Which channel should I cut?" | No | It is a decision on all four rows above at once |

Marketing analysis has two layers: the arithmetic, which Python handles, and the semantics, which nobody put in the file. Anthropic itself advises verifying complex or mission-critical calculations with specialized software or by hand ([Anthropic](https://support.claude.com/en/articles/10366421-how-does-claude-handle-mathematical-equations-and-calculations)); in marketing, the check that matters is on the definition.

## How do you tell whether an analysis is already contaminated?

Six checks, all doable in the same chat where the analysis happened. OpenAI's documentation already asks for the first one: review the generated code, outputs and assumptions before relying on the result ([OpenAI](https://help.openai.com/en/articles/8437071-data-analysis-with-chatgpt)).

| Check | How | Red flag |
|---|---|---|
| Open the code | Ask "show me the code that produced this table" | A filter, join or column you didn't ask for |
| Ask for the definition | "Which column did you use as revenue, and what does it include?" | It describes a rule in prose instead of citing one of yours |
| Rerun in a fresh session | Same file, same question, clean chat | Different numbers: the tie-break isn't stable |
| Tie out the total before splitting | Compare the table's sum with Shopify or the books for the same period | A gap with no named explanation |
| Count the join | "How many rows from each file had no match?" | A channel or campaign that vanished after the merge |
| Look for "(other)" | Search the export before you upload it | Part of the revenue sits on a row with no channel |

If you only run one, run the fourth. Splitting a total that doesn't tie to finance gives you a precise allocation of a wrong number.

## How do you fix it without giving up on AI?

Three levels, from cheapest to permanent.

**Level 1: put the definition in the prompt.** "Revenue = paid orders, excluding shipping and tax, by payout date, excluding refunds." That removes the silent tie-break for that conversation. Also give the model explicit permission to say "I don't know," so a missing definition becomes a refusal instead of a guess; the mechanism is in [teaching an agent to say I don't know](https://precisian.io/blog/en/posts/teaching-an-agent-to-say-i-dont-know/).

**Level 2: upload a definitions file alongside the data.** A short document with each metric, its formula, its source and what it excludes. In a ChatGPT or Claude project it is available to every chat. The definition stops depending on memory, but it is still fragile: the file goes stale, everyone keeps a copy, and nobody can audit which version answered.

**Level 3: move the definition out of the file and into the data.** The AI stops receiving spreadsheets and starts querying metrics that are already defined, versioned and auditable, through an MCP server or an API. When the question arrives, revenue already has one rule, and the same rule serves finance, the BI tool and the agent. It is the difference between [text-to-SQL that fails with valid SQL](https://precisian.io/blog/en/posts/governed-text-to-sql/) and one that answers on definitions.

We got this wrong before we understood it. At Precisian we spent six months trying to plug an agent into unmodeled data, and it kept making things up. The full account is in the post on [metric hallucination](https://precisian.io/blog/en/posts/metric-hallucination/). What I take from it for this triage is simple: the exploratory part was never the problem. The problem was asking for decisions from a model that had nowhere to read what our numbers meant.

That is the work Precisian does: a per-client isolated data lake with a versioned semantic layer on top, reachable by the AI your team already uses through MCP, API or your BI. The AI stays yours. We deliver data that is ready to be asked.

## When can't this be fixed?

In four situations, and switching tools helps in none of them.

**When the data doesn't exist.** Sales closed over the phone with no source captured, retail purchases with no customer identifier, Amazon orders with no link back to the shopper. The AI can estimate, and the estimate will come out with the same confidence as a measured number. The fix starts with collection.

**When the company never decided the definition.** If marketing and finance use different revenues and nobody has arbitrated, no technical layer will choose for them. Writing the definition is a business decision with an owner. AI only makes its absence faster to notice.

**When the question is causal.** "Why did sales drop in September?" isn't answerable from a spreadsheet, however well it is modeled. The AI will return a correlation narrated as a cause. Treat the answer as a hypothesis and test it before acting.

**When the business is too small to need it.** A store with one paid channel, one sales source and one person who checks the number every week doesn't need a semantic layer. Level 1 above, plus the human check they already do, is enough. Precisian is the wrong answer for that case, and saying so saves both sides the call.

## What doesn't this article cover?

It doesn't compare ChatGPT's accuracy with Claude's on data analysis. I found no primary source with a stated method that makes that comparison on marketing data, and any figure on it would go stale with the next model release.

The file limits cited are the ones [OpenAI](https://help.openai.com/en/articles/8555545-uploading-files-and-audio-to-chatgpt) and [Anthropic](https://support.claude.com/en/articles/8241126-upload-files-to-claude) published as of October 14, 2026. Both vendors note that limits vary by plan, model or workspace settings.

And it doesn't address the privacy question of uploading customer records into an AI chat, which depends on your contracts and on state privacy law. That is a separate decision with its own owner.

---

If your team has already moved budget on a ROAS that came out of a GA4 export in an AI chat, the first step is measuring how far that export's revenue sits from the revenue finance closed for the same period. [Book a conversation about your case](https://calendar.notion.so/meet/rodrigomartucci/precisian-io), with no contract commitment, and no promise of an answer in 30 minutes either.
