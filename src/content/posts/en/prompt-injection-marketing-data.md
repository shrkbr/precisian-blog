---
title: "Prompt injection through marketing data: the fields nobody validates"
description: "A Google Ads campaign name takes 256 characters with no documented content validation. Meta documents no maximum at all."
slug: "prompt-injection-marketing-data"
lang: "en"
translationKey: "prompt-injection-marketing-data"
publishedAt: 2026-10-07
tags: ["prompt-injection", "ai-data-access", "seguranca-de-dados"]
draft: false
llmSummary: "Ad platforms document length limits on campaign names and no content validation: Google Ads caps at 256 characters, Meta documents no maximum, and GA4's only stated UTM rule is case sensitivity. No case of injection via campaign name is documented; the closest is a lead form field."
citations: ["https://genai.owasp.org/llmrisk/llm01-prompt-injection/", "https://developers.google.com/google-ads/api/docs/best-practices/system-limits", "https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group/", "https://support.google.com/analytics/answer/10917952", "https://cveawg.mitre.org/api/cve/CVE-2025-32711", "https://unit42.paloaltonetworks.com/ai-agent-prompt-injection/", "https://arxiv.org/abs/2506.08837"]
about: ["https://en.wikipedia.org/wiki/Prompt_engineering", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

A Google Ads campaign name accepts 256 characters and Google documents no validation of what goes in them ([Google Ads API system limits](https://developers.google.com/google-ads/api/docs/best-practices/system-limits)). That is roughly forty words of anything, sitting in a field that an agency, a contractor or a compromised account can write, and that your AI agent will later read as part of a report. The length limits are documented. The content rules are not.

> **Indirect prompt injection**: an attack where instructions reach a model through content it ingests rather than through the user's prompt. OWASP defines it as occurring "when an LLM accepts input from external sources, such as websites or files."

## What counts as an attacker-writable marketing field?

More than most teams count. The test is not "is this field public" but "can someone outside my trust boundary put text in it that my agent will read."

That includes campaign, ad group and ad names, UTM parameters arriving from partners, product titles and descriptions from suppliers, review text, support ticket bodies, lead form fields, and anything a media agency edits in your account.

OWASP's definition is worth quoting exactly here, because it removes a common false comfort: these injections "do not need to be human-visible/readable, as long as the content is parsed by the model" ([OWASP LLM01:2025](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)). A payload does not have to look like an attack in your ads interface to work on a model reading the export.

## Has this actually happened?

Through a marketing field, yes. Through a campaign name specifically, not that I could verify — and I would rather say so than imply otherwise.

The closest documented case is **ForcedLeak**, reported in Salesforce Agentforce by the security firm [Noma Labs](https://noma.security/blog/forcedleak-agent-risks-exposed-in-salesforce-agentforce/). The payload was written into the description field of a **Web-to-Lead form** — a public, attacker-writable marketing field. An employee later asked the AI agent about that lead through a normal workflow, and the agent executed both the employee's request and the attacker's instructions. The description field accepts 42,000 characters, and the exfiltration path used an expired whitelisted domain bought for five dollars. It was rated CVSS 9.4, reported in July 2025 and disclosed that September, after Salesforce shipped trusted-URL enforcement.

Two caveats that belong with that case. Every detail above originates with the security firm that found it; I did not find an independent advisory confirming the character count, the domain price or the score. And it is a lead form, not a campaign name.

The second documented case is **EchoLeak**, and here the primary record is authoritative. The MITRE CVE entry for CVE-2025-32711 describes it as "Ai command injection in M365 Copilot allows an unauthorized attacker to disclose information over a network," rated CVSS 9.3 critical under CWE-74, published 11 June 2025 ([MITRE](https://cveawg.mitre.org/api/cve/CVE-2025-32711)). The payload arrived in an ordinary email. No click was required.

Unit 42 also documented what it called its first observed case of AI-based ad review evasion, in December 2025 — a payload aimed at an automated ad-review system ([Unit 42, March 2026](https://unit42.paloaltonetworks.com/ai-agent-prompt-injection/)).

So: documented in marketing-adjacent fields, documented against ad systems, and not yet documented through a campaign name. The campaign-name vector is a reasoned extension of confirmed behavior, and I am labeling it as such rather than dressing it as an incident.

## What do the ad platforms actually validate?

Length. That appears to be the whole list.

| Field | Documented limit | Documented content validation |
|---|---|---|
| Google Ads campaign name | 256 characters | none |
| Google Ads ad group name | 256 characters | none |
| Meta campaign name | **no maximum documented** | none; annotated "supports emoji" |
| Meta ad set name | 400 characters | none |
| GA4 `utm_*` parameters | none documented | none; the only stated rule is case sensitivity |

Sources: [Google Ads API](https://developers.google.com/google-ads/api/docs/best-practices/system-limits), [Meta Marketing API](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group/) and [Google Analytics](https://support.google.com/analytics/answer/10917952).

Three things fall out of that table.

**Forty words is plenty.** The 256-character cap [Google documents](https://developers.google.com/google-ads/api/docs/best-practices/system-limits) does not constrain an instruction; it constrains an essay.

**Meta documents no cap at all on campaign names**, and advertises emoji support, which means the full Unicode surface is in scope by design — homoglyphs, right-to-left overrides, zero-width characters.

**Everything marketers "know" about safe UTM characters is convention, not policy.** The rules you have read about sticking to alphanumerics and hyphens come from practitioner blogs. Google's own documentation states one rule: values are case sensitive. That gap between folk practice and documented policy is the actual finding here.

## What makes marketing data an unusually good carrier?

Three properties that rarely coincide elsewhere in a company's data.

**It is written by outsiders as a matter of routine.** Agencies edit campaign names. Partners construct UTMs. Suppliers write product titles. Affiliates build links. In most organizations the list of people who can put text into these fields is longer than the list of people with database access, and nobody thinks of it as a permission.

**It is never reviewed for content.** A campaign name is checked for naming convention, if at all. No one reads it as untrusted input, because for two decades it was not input at all — it was a label.

**It flows automatically to exactly where an agent will read it.** That is the whole point of the pipeline. The field goes from the ad platform to the warehouse to the report without a human in the path, by design and correctly. The same automation that makes reporting possible makes the payload's trip free.

Compare that with a database column, which has a schema, an owner and a review process, or with a support ticket, which at least someone reads. Marketing metadata combines outside authorship, zero content review and automatic delivery — and it has done so for years, harmlessly, which is why nobody has revisited it.

## Why doesn't "it's just a campaign name" hold?

Because the field stopped being a label the moment an agent started reading it.

For twenty years a campaign name was an internal string that appeared in a report a human skimmed. Nothing parsed it. The worst outcome of a weird one was a confusing dashboard.

Now that string flows into an export, into a warehouse, into a context window, and is read by a system whose entire job is to follow instructions found in text. Nothing about the field changed. What changed is the consumer.

OWASP's framing of severity is the useful one: how bad this gets depends on "the agency with which the model is architected." A model that can only summarize produces a wrong summary. A model that can send an email, write a row or call an API produces an action.

## What actually reduces the risk?

Architecture, not filtering. The most useful published work on this says so plainly.

A 2025 paper with authors across ETH Zurich, Google, Microsoft, IBM and EPFL states the principle directly: "once an LLM agent has ingested untrusted input, it must be constrained so that it is impossible for that input to trigger any consequential actions" ([arXiv 2506.08837](https://arxiv.org/abs/2506.08837)). It names six design patterns — Action-Selector, Plan-Then-Execute, LLM Map-Reduce, Dual LLM, Code-Then-Execute and Context-Minimization — each of which limits what tainted context can reach.

Google's published defense is layered rather than singular: injection classifiers, security thought reinforcement, markdown sanitization and URL redaction, a user confirmation framework for risky operations, and end-user notifications ([Google, June 2025](https://blog.google/security/mitigating-prompt-injection-attacks/)).

Anthropic reports a 1% attack success rate for one model against an internal adaptive attacker, and pairs it with its own caveat that this "still represents meaningful risk" and that no browser agent is immune ([Anthropic, November 2025](https://www.anthropic.com/news/prompt-injection-defenses)). That is a vendor evaluating itself on an internal benchmark, and it should be read as such — but the caveat is the honest part, and it matches the research consensus.

For a marketing data stack specifically, the practical version is short. Do not let the agent that reads campaign metadata be the same agent that can act. Keep irreversible operations behind human approval, and check which role the connection uses — the detail where [multi-tenant setups usually fail](https://precisian.io/blog/en/posts/per-tenant-isolation-mcp/). And reduce what enters context in the first place: an agent querying a [governed semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/) sees metrics, not raw name strings, which removes the payload before it is ever parsed.

## How common is this really?

Nobody credible knows, and the honest answer is more useful than the numbers on offer.

Unit 42 published twelve case studies and twenty-two payload-construction techniques from its telemetry. It does not disclose a denominator, a time window or the sensor. The percentages it reports are shares of a small undisclosed sample, so "14% of attacks" would be a misreading. Unit 42 also states that it is not aware of any confirmed real-world instance where such an attack succeeded against a deployed ad-checking agent — the detections are attempts.

Google Threat Intelligence ran a three-stage filter over Common Crawl snapshots of two to three billion pages each and reported a 32% relative increase in the malicious category between November 2025 and February 2026 ([Google, April 2026](https://blog.google/security/prompt-injections-web/)). No baseline, no raw counts, no malicious-versus-benign split. It is a trend claim, not a prevalence measurement, and Google notes most prompt-injection text on the web is educational material producing false positives.

So the defensible statement is: documented, increasing, magnitude unknown. Anyone offering you a percentage for how often this happens in marketing data is inventing it.

## What does this article not cover?

It does not cover model-level defenses in depth, and it does not evaluate security products.

It deliberately omits NIST's taxonomy. The publication exists and is authoritative, but the PDF was not machine-readable during research, so I could not verify its exact wording on indirect injection. Citing a document's reputation without reading it is the failure mode this blog is supposed to avoid.

It also omits a widely repeated benchmark figure for one defensive pattern, which traced only to secondary sources, and any list of "safe UTM characters," which is convention rather than documented platform policy.

If your agent reads campaign metadata, the first question is not which filter to add. It is whether that same agent can take an action. [Book a conversation about your case](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).
