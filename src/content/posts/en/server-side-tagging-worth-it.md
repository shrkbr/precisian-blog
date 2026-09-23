---
title: "Is server-side tagging worth it? Read both documents first"
description: "Google promises full durability on a subdomain. WebKit caps CNAME-resolved subdomain cookies at seven days. Both are current."
slug: "server-side-tagging-worth-it"
lang: "en"
translationKey: "server-side-tagging-worth-it"
publishedAt: 2026-10-27
tags: ["tracking", "consentimento", "divergencia-de-dados"]
draft: false
llmSummary: "Server-side tagging delivers PII stripping, lighter client script and server-side event routing. It does not deliver consent or identifiers the browser stripped. Its cookie durability benefit depends on not meeting WebKit's CNAME cloaking definition, which Google does not mention."
citations: ["https://developers.google.com/tag-platform/tag-manager/server-side/custom-domain", "https://webkit.org/tracking-prevention/", "https://webkit.org/blog/11338/cname-cloaking-and-bounce-tracking-defense/", "https://developers.google.com/tag-platform/learn/sst-fundamentals/7-planning-infrastructure", "https://developers.google.com/tag-platform/tag-manager/server-side/consent-mode", "https://support.google.com/tagmanager/answer/12329599"]
about: ["https://en.wikipedia.org/wiki/Google_Tag_Manager", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

Two vendor documents describe the same setup and reach opposite conclusions. Google's domain table says pointing a **subdomain** at your tagging server grants "full access to security and durability benefits" ([Google](https://developers.google.com/tag-platform/tag-manager/server-side/custom-domain)). WebKit says a first-party subresource resolving through a CNAME that differs from the first-party domain gets its HTTP-response cookies "capped to 7 days" ([WebKit](https://webkit.org/tracking-prevention/)).

Both statements are current. Only one of them appears in the sales deck.

> **What it delivers:** stripping personal data before it reaches vendors, lighter client-side script, and event transformation and routing on your own server. **What it does not deliver:** consent, identifiers the browser already removed, or guaranteed cookie durability in Safari.

## What does server-side tagging actually change?

It replaces many vendor endpoints with one endpoint you operate.

Instead of the browser talking to each vendor, it talks to a container you host. Inside it, "clients are adapters between the software running on a user's device and your server container", receiving data, transforming it into events, routing it, and packaging the response ([Google](https://developers.google.com/tag-platform/tag-manager/server-side/intro)).

Three benefits follow, and none of them is disputed. The web container hosts "only the tags necessary" to generate events, which lightens the page. You can "remove any personally identifiable information (PII) before passing the data on to marketing partners" ([Google](https://support.google.com/tagmanager/answer/13387731)). And in a first-party context the server can write cookies "that are not visible to scripts in the page", meaning `HttpOnly` ([Google](https://developers.google.com/tag-platform/tag-manager/server-side/overview)).

That third one is where the argument lives.

## Does it restore cookie lifetime in Safari?

Conditionally, and Google's documentation does not state the condition.

WebKit's rule names the architecture precisely: ITP "detects third-party CNAME cloaking and third-party IP address cloaking requests and caps the expiry of any cookies set in the HTTP response to 7 days", where CNAME cloaking means "a first-party subresource that resolves through a CNAME that differs from the first-party domain and differs from the top frame host's CNAME, if one exists" ([WebKit](https://webkit.org/tracking-prevention/), and the [2020 announcement](https://webkit.org/blog/11338/cname-cloaking-and-bounce-tracking-defense/)).

The subdomain Google recommends pointing at your tagging server is, in most deployments, a subdomain that resolves elsewhere by CNAME. That is the shape WebKit describes.

An honest limit: **I found no Google or Apple document stating that any specific sGTM endpoint trips that detector**, and I am not going to assert that it does. What is verified is that the published definition describes this architecture and that Google's durability page does not mention the question. Test on your own domain before believing either party.

## Is the seven-day cap what everyone says it is?

No. This is the most outdated claim in the category.

The founding text is from February 2019: with ITP 2.1, "all persistent client-side cookies, i.e. persistent cookies created through `document.cookie`, are capped to a seven day expiry" ([WebKit](https://webkit.org/blog/8613/intelligent-tracking-prevention-2-1/)).

WebKit's live page now describes something different. ITP "deletes all cookies created in JavaScript and all other script-writeable storage after 7 days of no user interaction with the website" ([WebKit](https://webkit.org/tracking-prevention/)).

Deletion after inactivity is not an expiry cap. For a retailer with returning customers, that difference is the whole argument: the clock restarts on each visit. Any deck presenting a flat seven-day ceiling on first-party cookies is quoting 2019 text without checking the current page.

Worth noting what the same [2019 post](https://webkit.org/blog/8613/intelligent-tracking-prevention-2-1/) says and almost nobody quotes: "Only cookies created through `document.cookie` are affected by this change."

## Is the core cookie mechanism even documented?

This is the part that should give a buyer pause.

The identifier that makes server-managed cookies work in this setup is commonly called FPID. **I could find no official Google documentation page describing it.** Google's own cookie configuration guide covers `cookie_expires`, domains and prefixes, and contains nothing about FPID, `HttpOnly`, or server-managed identifiers ([Google](https://developers.google.com/tag-platform/security/guides/customize-cookies)).

The best available description comes from an independent practitioner, Simo Ahava, who writes that "this cookie is named `FPID` (First Party Identifier) by default" and that it "is set with the `HttpOnly` flag, which means it is not accessible to browser JavaScript" ([Simo Ahava](https://www.simoahava.com/analytics/fpid-cookie-google-analytics-server-side-tagging/)). He cites no official Google page either.

A single independent source is not a reason to disbelieve it. It is a reason to verify it in your own container rather than in a proposal. A central mechanism without manufacturer documentation is a fact about the product, not a detail.

## What can it never recover?

Anything the browser removed before your server saw it.

Safari "removes a subset of query parameters that have been identified as being used for pervasive cross-site tracking" ([WebKit](https://webkit.org/blog/15697/)). No server architecture recovers a click identifier stripped from the URL in transit. Your endpoint receives whatever survived.

Firefox runs a different model entirely, based on classification lists. For resources it classifies as trackers, it will "block `Cookie` request headers and ignore `Set-Cookie` response headers" ([MDN](https://developer.mozilla.org/en-US/docs/Web/Privacy/Guides/Storage_Access_Policy)). Server-set is not a magic phrase there either. Classification and context decide.

## Does it change your consent obligations?

No, and Google says so both directly and by omission.

Directly: "It is your responsibility, as an advertiser, to understand the laws that affect you and to implement consent management solutions for any data you share with Google" ([Google](https://support.google.com/tagmanager/answer/12329599)).

By omission, which carries more weight: the server-side consent mode page contains **no sentence** stating that this architecture reduces, removes or alters any consent obligation. It says the opposite in substance, that tags "adjust the amount and kind of data they send based on the user's preferences", and that this requires "a consent solution or cookie banner on your website that is compatible with Google's consent mode API" ([Google](https://developers.google.com/tag-platform/tag-manager/server-side/consent-mode)).

The consent signal originates in the browser and is forwarded to the server. Moving tag execution backward does not change who must ask permission. Anyone selling server-side as a route to collecting without consent is selling legal exposure with an architecture's name on it.

## What does it cost to run?

More than the instance, and Google contradicts Google on the sizing.

| Item | Figure | Source |
|---|---|---|
| App Engine production instance | ~USD 40/month | [App Engine setup](https://developers.google.com/tag-platform/tag-manager/server-side/app-engine-setup) |
| Instance (planning page) | ~USD 50/month | [Planning](https://developers.google.com/tag-platform/learn/sst-fundamentals/7-planning-infrastructure) |
| Recommended minimum | 3 instances, scaling 3 to 6 | [Upgrade infrastructure](https://developers.google.com/tag-platform/learn/sst-fundamentals/8-upgrade-infrastructure) |
| Minimum on another page | 2 instances, scaling 2 to 10 | [Cloud Run setup](https://developers.google.com/tag-platform/tag-manager/server-side/cloud-run-setup-guide) |

Both minimum-instance pages are live today, carry different last-updated dates, and also disagree on supported throughput. That is not a misreading. If you are defending a budget, cite the specific page rather than the round number.

On top sits what no proposal includes. Google warns that egress "is calculated for all outgoing network data from the server container", including the HTTP responses back to the browser, and that "once you collect enough requests to surpass the free tier of Cloud Logging, the cost of storing logs can become substantial" ([Google](https://developers.google.com/tag-platform/learn/sst-fundamentals/7-planning-infrastructure)).

Three instances at USD 40 to 50 is USD 120 to 150 per month in compute alone. That multiplication is mine; the unit figures and the minimum are Google's.

## Who is this actually a good purchase for?

Size decides more than architecture does.

At low traffic, the arithmetic rarely works. Three instances of compute plus egress plus log storage is a fixed monthly cost against a variable, unproven benefit, and the engineering time to maintain a container nobody on the team has operated before is the larger line item. A small store is usually better served by fixing what it already has.

At high traffic, the calculus inverts, but for a reason that has nothing to do with cookies: when you are dispatching millions of events, controlling what leaves your domain becomes a compliance position rather than an optimization. Stripping personal data before it reaches a vendor is a documented capability (see above), and it is the one benefit that does not depend on how any browser behaves next quarter.

The uncomfortable middle is where most of these purchases happen: enough traffic for the cost to feel justifiable, not enough for the compliance argument to be the real driver. That is the band where the durability pitch does the selling, and it is exactly the band where this article's first section applies.

## So is it worth it?

It depends which of three problems you actually have.

**Worth it** if the problem is PII leaving your domain, or client-side script weight, or a need to transform and route events before dispatch. Those are the benefits the documentation supports without interpretation.

**Not worth it** if it was sold as conversion recovery. No primary source publishes that percentage, and the figures in circulation contradict each other.

**Irrelevant** if the problem is consent, or an identifier the browser stripped, or a gap between what a platform reports and what your finance system closed. That last one is [a definitional problem](https://precisian.io/blog/en/posts/marketing-finance-revenue-definition/), not a collection problem, and no server fixes it. The same applies to the share of your analytics that arrives [as modelled rather than observed data](https://precisian.io/blog/pt-BR/posts/consent-mode-dado-modelado/) (in Portuguese): relocating a tag does not turn an estimate into an observation.

Before approving the invoice, write down which of the three you are buying. If the answer is cookie durability, reread the CNAME section.

## What does this article not cover?

It gives no data-recovery percentage. The figures in circulation range from roughly a fifth to four fifths of lost data depending on which blog you read, none with a stated methodology, and the most credible-looking one comes from a vendor that hosts server-side tagging, published without a site count, a date range, or a definition of "recovered".

It quotes no statute text. Legal citation requires the statute open in front of you, not recalled from memory.

And it does not claim Google's endpoint trips WebKit's cloaking detector. It claims the published definition describes the architecture, and that Google does not address it. The distance between those two sentences is the distance between an article that holds up and one that ages badly.
