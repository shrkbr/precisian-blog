---
title: "Giving an agency data access without giving everything"
description: "GA4 has 5 roles and 2 data restrictions, one hiding revenue. The market default is to grant Administrator anyway."
slug: "agency-data-access-without-everything"
lang: "en"
translationKey: "agency-data-access"
publishedAt: 2026-12-12
tags: ["governanca", "seguranca", "agencia"]
draft: false
llmSummary: "GA4 offers five roles and two data restrictions (no cost metrics, no revenue metrics), and account-level roles are inherited by every property. Most agency work fits in Viewer or Analyst, never Administrator."
citations: ["https://support.google.com/analytics/answer/9305587", "https://support.google.com/google-ads/answer/9978556", "https://www.postgresql.org/docs/current/ddl-rowsecurity.html", "https://code.claude.com/docs/en/security"]
about: ["https://en.wikipedia.org/wiki/Access_control", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

GA4 ships **5 roles and 2 data restrictions** that almost nobody uses, one of which hides revenue metrics and another of which hides cost metrics ([Google](https://support.google.com/analytics/answer/9305587)). The market default, regardless, is to grant Administrator and move on, which hands over user management along with the data.

The problem is not the agency. It is that "give them access" became a binary decision inside systems that were never binary.

> **Administrator in GA4** has "full control of Analytics" and can "manage users (add/delete users, assign any role or data restriction)". Whoever holds it can grant access to third parties without passing through you.

## What does each level actually grant?

More gradation than the contract conversation assumes.

| GA4 role | What it can do |
|---|---|
| **Administrator** | full control, including user management |
| **Editor** | "full control of settings at the property level", no user management |
| **Marketer** | create and edit audiences, events and key events; edit attribution settings |
| **Analyst** | share explorations; create, edit and delete explorations |
| **Viewer** | see settings and data, and create their own explorations |

Source: [Google](https://support.google.com/analytics/answer/9305587).

Notice where most agency work actually fits: **Analyst** or **Viewer**. Reading data, building an exploration and delivering an interpretation requires neither Editor nor, ever, Administrator.

Google Ads has a comparable ladder. Read-only can "view campaigns and use planning tools" and "edit and run campaign performance reports". Admin "can give account access, change access levels, and cancel invitations from other users" and "can add or remove product links" ([Google](https://support.google.com/google-ads/answer/9978556)).

Whoever runs media needs Standard to edit campaigns. Whoever only reports needs nothing beyond read-only, and that distinction usually goes unmade because nobody asks which of the two a person does.

## Do the data restrictions cover the rest?

They cover a part most people do not know exists.

GA4 has two restrictions assignable per user: **No Cost Metrics**, meaning the user "cannot see metrics related to cost", and **No Revenue Metrics**, meaning they "cannot see metrics related to revenue" ([Google](https://support.google.com/analytics/answer/9305587)).

The second is the one that matters to anyone with sensitive margins. You can release browsing behaviour, funnel and traffic source without releasing what the business earns. That is the difference between "the agency sees what it needs" and "the agency sees your revenue".

It does not solve everything: anyone with linked Google Ads access sees cost regardless, and anyone exporting raw data bypasses an interface restriction. But it is a free control, already available, that most accounts have never opened.

## Why does granting at the wrong level give away everything?

Inheritance, and this is the quietest failure on the list.

The documentation states that "parent roles are inherited by default (e.g., account > property)" ([Google](https://support.google.com/analytics/answer/9305587)).

Granting Viewer at the **account** level grants Viewer on **every property** in it, including the ones you forgot exist, including the corporate site, including the test property with real customer data in it. Granting at property level grants that property and nothing else.

The rule fits in one line: **always grant at the lowest level that accomplishes the task.** An agency handling one brand does not need access on the account holding the others.

## What if the agency needs the database, not the dashboard?

Then the control moves somewhere easier to get wrong.

The classic error is creating a database user "for the agency" by reusing a role that already existed, usually the table owner. PostgreSQL's documentation explains why that voids the protection: row policies restrict what each user sees, but "superusers and roles with the `BYPASSRLS` attribute always bypass the row security system", and the table owner bypasses too unless someone writes `ALTER TABLE ... FORCE ROW LEVEL SECURITY` ([PostgreSQL](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)).

The correct design is dull and short: a dedicated read-only role, owning nothing, with no bypass attribute, row policy applied and `FORCE` on. With no policy defined, the default is to deny everything, which is the safe side of the mistake.

One architectural note that saves argument: the slice should arrive pre-cut. Handing over a filtered view with the columns that matter is different from handing over the database and trusting nobody looks at the rest. The first is your decision; the second is the other party's promise.

## Who should audit the result?

Not whoever produced it, and that is an access argument rather than a trust argument.

The practical distinction is simple. Whoever runs the campaign needs **edit** permission in the media tool. Whoever checks the result needs **read** access to the data, including what the media tool does not show. Those are two different grants at two different levels, and merging them into one invitation produces the situation where the only available reading of the result belongs to the party with an interest in it.

This requires neither switching vendors nor building an in-house team. It requires that the raw data, orders, recognised revenue and cost by channel, live somewhere you control, and that access to it be granted separately from operational access. From there, any interpretation is checkable against the same base.

The symptom that this does not exist is familiar: the monthly report arrives with numbers nobody can reproduce, and the conversation ends in who believes whom.

Note what that costs beyond the argument itself. A number you cannot reproduce cannot be used to negotiate, to forecast, or to decide whether to keep spending. So the access question quietly becomes a commercial one: the party holding the only readable copy of the result also holds the terms of the conversation about it.

## What happens when the contract ends?

Usually nothing, and that is the real problem.

Access is granted in a meeting and revoked in none. The user list of an e-commerce account a few years old typically contains former agencies, former employees, former freelancers and at least one email nobody recognizes.

Three habits handle most of it, and none costs money:

**Review the user list quarterly.** Open the panel, read the emails aloud, and ask who each one is. The discomfort of that reading is the indicator.

**Treat offboarding as part of closing.** The same checklist that returns files and passwords should remove access, the same day. A closed contract with live access is a risk nobody is monitoring, precisely because nobody remembers it.

**Set a review date when you grant, not after.** A grant with no expiry is a grant forever, because the moment to question it never arrives on its own. Even a note in a calendar beats the alternative, which is discovering the stale access during an incident.

**Grant to people, never to shared inboxes.** Access given to a collective agency address survives the departure of whoever used it, and the audit trail loses the ability to say who did what. If the log points to an address four people read, a future investigation ends there.

## What if the agency puts an AI in the middle?

The question stopped being hypothetical, and it changes the arithmetic.

When an agency connects an assistant to the data it has access to, the reach of that access stops being what a person can read manually and becomes what a system can traverse in minutes. The level you granted is unchanged. Its consequence is not.

Add that the model vendor does not audit the server it connects to. Anthropic states about its own directory that it reviews connectors against listing criteria "but does not security-audit or manage any MCP server", and recommends "either writing your own MCP servers or using MCP servers from providers that you trust" ([Anthropic](https://code.claude.com/docs/en/security)). The trust is yours, and the access you granted is its boundary.

So the contract question stopped being "who on your team will access this" and became "**what will you connect to this access**". Both answers change the risk, and only the first is usually written down. Worth reading [what contains an agent connected to production data](https://precisian.io/blog/en/posts/connect-ai-to-production-data/) before deciding the level.

## Where do you start today?

With a thirty-minute inventory, not with a policy.

List who has access to what, in each tool, with the level. That alone usually surfaces two or three grants nobody would defend out loud. Then reduce what can be reduced without breaking the work, which is almost always more than it seems: most reporting lives comfortably in read-only.

And write down what remains, with the reason. One line per grant, saying what it is for. Without that, the next review starts from zero, because nobody remembers why the access was given, and in doubt nobody removes it. It is the same logic that makes [a definition without an owner diverge again](https://precisian.io/blog/en/posts/marketing-finance-revenue-definition/) a few months later.

## What does this article not cover?

It does not cover data warehouse platforms individually. The row-security mechanism above is documented for one engine; others use different names and carry their own gotchas, and writing from memory about access policy is exactly the error that costs the most.

It does not describe Meta's access levels. Its help pages refused automated retrieval in my attempts, and I am not describing from memory a panel that renames things frequently.

It does not address contract clauses. What a services agreement should say about data belongs to your counsel, and an article pretending to answer that does a disservice.

It does not claim Google Ads roles have narrative definitions. The page I read presents permissions as a checkmark table rather than closed per-level descriptions, and the phrases quoted here are specific permissions, not official definitions of each role.

And it leaves aside data-protection roles, controller and processor, which sit as an entire legal layer on top of this one and deserve their own article.
