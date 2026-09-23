---
title: "Teaching a data agent to say I don't know, and why that is hard"
description: "On a benchmark that prices wrong SQL, abstaining from everything scores 50% and the best real systems score 29.8% to 54.5%."
slug: "teaching-an-agent-to-say-i-dont-know"
lang: "en"
translationKey: "agent-abstention"
publishedAt: 2026-10-10
tags: ["abstention", "text-to-sql", "ai-data-access"]
draft: false
llmSummary: "On TrustSQL, a baseline that abstains from every question scores a flat 50% while the best text-to-SQL pipelines score 29.8% to 54.5% once wrong answers are penalized. AbstentionBench finds reasoning fine-tuning degrades abstention by 24% on average across 20 frontier models."
citations: ["https://arxiv.org/abs/2403.15879", "https://arxiv.org/abs/2506.09038", "https://arxiv.org/abs/2509.04664", "https://arxiv.org/abs/2412.14737", "https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations", "https://cube.dev/blog/how-semantic-sql-works", "https://docs.getdbt.com/docs/dbt-ai/mcp-available-tools"]
about: ["https://en.wikipedia.org/wiki/Uncertainty_quantification", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

On a benchmark that penalizes wrong SQL, a system that abstains from every single question scores 50%, and the best real text-to-SQL pipelines score between 29.8% and 54.5% depending on how harshly errors are priced ([TrustSQL](https://arxiv.org/abs/2403.15879)). Answering nothing beats most production systems once a wrong answer costs something. That is the whole problem in one number.

> **Abstention**: a system declining to answer when it lacks the grounding to answer correctly, instead of producing its best guess.

## Why does a model guess instead of abstaining?

Because guessing is what it was rewarded for, and researchers at OpenAI say so directly.

Their framing is that hallucinations persist because "language models are optimized to be good test-takers, and guessing when uncertain improves test performance" ([Kalai et al., September 2025](https://arxiv.org/abs/2509.04664)). Under binary grading, a wrong answer and no answer both score zero, so a model that guesses strictly dominates one that abstains. The paper surveys the major benchmarks and finds the vast majority grade exactly that way.

This reframes the failure. It is not that models cannot recognize uncertainty. It is that nothing in their training ever made silence pay.

## What happens when you price a wrong answer?

The ranking inverts, and that is the finding worth sitting with.

TrustSQL evaluates 21,358 instances, of which 2,479 are deliberately infeasible questions — things the database cannot answer. Its reliability score awards a point for correct SQL on answerable questions or for abstaining on unanswerable ones, and subtracts a penalty for wrong SQL or for attempting an infeasible question.

At zero penalty, the best pipeline on one dataset reaches 54.5% ([TrustSQL](https://arxiv.org/abs/2403.15879)). Raise the penalty to ten and it falls to 51.4%. Raise it further and it collapses to −245.5. On another dataset a system drops from 85.3% to 36.1% to −9,100.

Meanwhile, the trivial baseline that abstains from everything sits flat at 50% ([TrustSQL](https://arxiv.org/abs/2403.15879)), at every penalty level, forever.

That is not an argument for building a system that refuses to work. It is a measurement of how much of a text-to-SQL system's apparent performance is borrowed from a grading scheme that does not charge for being wrong. Your business charges for being wrong.

## Does reasoning help?

It makes abstention worse, which is the opposite of what almost everyone assumes.

AbstentionBench evaluated 20 frontier models against more than 35,000 unanswerable questions across 20 datasets and six scenarios, including questions with false premises, stale facts and underspecified intent. Its headline result: **reasoning fine-tuning degrades abstention by 24% on average** ([Kirichenko et al., Meta FAIR, June 2025](https://arxiv.org/abs/2506.09038)).

The degradation shows up even in mathematics and science, the domains reasoning models are explicitly trained on. A model that reasons harder builds a more elaborate path to an answer that should not exist.

The same paper finds that a carefully written system prompt improves abstention, and then adds the caveat that matters: it is "unlikely to fundamentally address a lack of reasoning about uncertainty." Prompting moves the number. It does not install the capability.

## Can you just ask the model how confident it is?

Partly, and the research disagrees productively about how much.

One line of work found that asking an RLHF-trained model to verbalize its confidence produces better calibration than reading its own token probabilities, cutting expected calibration error by roughly half ([Tian et al., EMNLP 2023](https://aclanthology.org/2023.emnlp-main.330/)).

A later study complicates that. Across 11 models, 10 datasets and 17 prompting methods on 9,361 validation samples, it found calibration quality is mostly a property of the prompt rather than the model, with large models landing around 10% deviation between stated confidence and actual accuracy. Its uncomfortable observation: as capacity rises, accuracy improves but "confidence remains at a high level" even where accuracy drops ([Yang et al., arXiv 2412.14737](https://arxiv.org/abs/2412.14737)).

So asking works, sometimes, depending on how you ask, and the gap between stated and real confidence widens as models get better. Treat a verbalized confidence score as a weak signal to route on, not as a number to report.

There is a concrete proposal worth knowing. The OpenAI paper suggests stating the threshold in the instruction itself: answer only if confidence exceeds *t*, where mistakes cost *t*/(1−*t*) points and an explicit "I don't know" costs zero. At *t* = 0.9 a wrong answer costs nine times what a correct one earns. That is a scoring rule, and scoring rules are the thing the field skipped.

## What do the providers actually recommend?

Anthropic is the most explicit, and its guidance is one sentence long: "Allow Claude to say 'I don't know': explicitly give Claude permission to admit uncertainty. This simple technique can drastically reduce false information" ([Anthropic](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations)).

Its worked example is a financial analysis task, and the instruction it models is directly reusable: if the report lacks the necessary information, say so rather than assess. The same page recommends grounding claims in direct quotes and retracting any claim whose quote cannot be found, and ends with its own hedge that these techniques reduce hallucinations without eliminating them.

OpenAI's prompting guidance runs parallel: never fabricate exact figures when uncertain, hedge explicitly when relying on provided context, call out ambiguity rather than resolving it silently, and do not invent citations.

One asymmetry worth reporting: I looked for equivalent Google guidance recommending prompt wording that lets a model decline, and did not find it. Google's official factuality documentation routes primarily to grounding with search. That is what I found, not proof that nothing exists.

## Does a semantic layer fix this?

Here I have to be careful, because we sell one.

The mechanistic argument is real and well articulated. Cube's CTO describes two failure modes of raw text-to-SQL: SQL evaluates bottom-up while OLAP measures need top-down context, and "the agent can hallucinate a join that doesn't exist. It can reference a column that the user shouldn't have access to." A semantic layer, in that framing, "defines what's available and it enforces how it can be queried" ([Cube, May 2026](https://cube.dev/blog/how-semantic-sql-works)).

dbt's tooling encodes the same judgment architecturally. Among its MCP tools, `text_to_sql` is the **only** one gated behind an account-level AI toggle: turn AI features off and free-form text-to-SQL disappears from the tool list while governed metric queries keep working ([dbt](https://docs.getdbt.com/docs/dbt-ai/mcp-available-tools)). That is a vendor stating, in code, which path it considers risky.

And now the part that belongs in the article. **Every source making this argument sells a semantic layer.** I went looking for independent, peer-reviewed evidence that semantic layers reduce agent hallucination and did not find it. The closest independent work — TrustSQL and the confidence-estimation literature — measures abstention and calibration without testing a semantic layer at all.

So the honest statement is: constraining an agent to a defined set of metrics is a coherent mechanism, argued by interested parties, without independent measurement behind it. It is what we build, and it is not proven. Anyone telling you otherwise is selling with more confidence than the evidence supports, which is a strange posture in an article about abstention.

## What does this look like in a marketing data stack?

The unanswerable questions are not exotic. They are Tuesday.

"Which campaign drove this marketplace sale" has no answer, because the marketplace API returns no origin field. "What was net revenue in March" has several answers if nobody wrote the definition. "How did the WhatsApp conversation convert" is unanswerable unless somebody persisted the click identifier at the moment it arrived.

An agent that guesses on these three produces plausible numbers that a director will quote in a meeting. An agent that abstains produces three sentences naming exactly what is missing, which is a worse demo and a better system.

The difference is not model quality. It is whether the surrounding architecture gives the model a way to distinguish "the data says X" from "the data does not contain this" — and whether anyone bothered to make the second outcome acceptable to the person who asked.

## What would make an agent trustworthy here?

Three properties, in order of how rarely they are implemented.

**It can return nothing.** If the interface has no representation for "this cannot be answered," the system will always answer. That is an interface decision made before any model is chosen, and it is the same reflex that keeps an agent from [answering confidently over an undefined metric](https://precisian.io/blog/en/posts/metric-hallucination/).

**Wrong answers cost more than silence, and somebody wrote down how much.** Without a scoring rule, every evaluation you run rewards guessing, exactly as the benchmarks do.

**It can point at what it used.** Not a confidence score, which is weakly calibrated, but the definition and the rows. A claim that can be traced can be checked; a percentage cannot.

The third is where a [governed semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/) does unambiguous work, independent of the contested claim above: it makes the answer's provenance inspectable. That is a property of the architecture, not a performance claim.

## What does this article not cover?

It does not benchmark models, and it does not cover retrieval-augmented generation, where grounding has its own literature.

Three things were deliberately excluded for lack of verifiable sourcing. A vendor's widely cited text-to-SQL accuracy figure, reported from an internal 40-question test with the model unnamed and no established benchmark. A table of abstention rates from a provider blog that could not be retrieved at source and does not appear in the corresponding paper. And a national standards framework whose document would not parse, and which I will not paraphrase from a summary.

If you are evaluating a data agent, ask the vendor what happens when the answer does not exist. The response tells you more than any accuracy number. [Book a conversation about your case](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).
