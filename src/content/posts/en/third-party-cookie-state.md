---
title: "Are third-party cookies actually gone? Read the dates"
description: "Chrome still enables them by default. Safari and Firefox blocked years ago. The replacement programme was wound down."
slug: "third-party-cookie-state"
lang: "en"
translationKey: "third-party-cookie-state"
publishedAt: 2027-01-05
tags: ["tracking", "consentimento", "divergencia-de-dados"]
draft: false
llmSummary: "Third-party cookies still work in Chrome by default: in April 2025 Google said it would maintain its current approach and not ship the user prompt, and in October 2025 retired much of the replacement technology. Safari and Firefox have blocked by default for years."
citations: ["https://privacysandbox.google.com/blog/privacy-sandbox-next-steps", "https://privacysandbox.google.com/blog/update-on-plans-for-privacy-sandbox-technologies", "https://www.gov.uk/government/news/cma-consults-on-releasing-google-from-privacy-sandbox-commitments", "https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/", "https://blog.mozilla.org/en/mozilla/firefox-rolls-out-total-cookie-protection-by-default-to-all-users-worldwide/"]
about: ["https://en.wikipedia.org/wiki/HTTP_cookie", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
---

Third-party cookies still work in Chrome, on by default. In April 2025 Google stated it would "maintain our current approach" and that it would **not** ship the prompt that would have asked users to choose ([Privacy Sandbox](https://privacysandbox.google.com/blog/privacy-sandbox-next-steps)). In October 2025 it went further and retired much of the technology that was meant to replace the cookie ([Privacy Sandbox](https://privacysandbox.google.com/blog/update-on-plans-for-privacy-sandbox-technologies)).

Anyone who planned their measurement around the cookie's disappearance planned for an event that did not happen.

> **The current state, in one line**: blocked by default in Safari and Firefox for years, still enabled by default in Chrome, with no announced date for that to change.

## What did Google actually say, and when?

Three moments, and the order matters because most summaries collapse them.

The deprecation plan existed and was repeatedly delayed. Then in **April 2025** came the reversal: the approach stays, and the user-choice prompt would not ship. Then in **October 2025**, a set of Privacy Sandbox technologies was retired rather than advanced.

The regulatory thread runs alongside it. Google's Privacy Sandbox work in the UK operated under commitments to the competition regulator, and the regulator has consulted on releasing Google from them ([CMA](https://www.gov.uk/government/news/cma-consults-on-releasing-google-from-privacy-sandbox-commitments)).

Read together, the picture is not "delayed again". It is that the replacement programme was wound down while the thing it would have replaced stayed in place.

## Then why does my data still look broken?

Because the other two browsers did it years ago, and they never reversed.

WebKit shipped full third-party cookie blocking in **March 2020**, stating that it had "aligned the remaining script-writable storage forms with the existing client-side cookie restriction, deleting all of a website's script-writable storage after seven days of Safari use without user interaction on the site" ([WebKit](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)).

Firefox rolled out Total Cookie Protection to all users worldwide, isolating cookies to the site that set them ([Mozilla](https://blog.mozilla.org/en/mozilla/firefox-rolls-out-total-cookie-protection-by-default-to-all-users-worldwide/)).

So the loss you are measuring is real, and it has a known cause that is not Chrome. Your Safari and Firefox traffic has been degraded for years, and whether that is a large or small problem depends entirely on your traffic mix, which is a number you have and nobody else does.

## Which number actually changed in your reports?

The modelled share, and it changed for a different reason than most teams assume.

Cookie restrictions remove identifiers, which removes the ability to stitch a journey. What they do not remove is the event itself: a purchase still fires, it just arrives without a durable link to the session that preceded it. So revenue totals degrade less than attribution does, and teams that measure the damage by looking at revenue conclude the problem is small.

The place it shows up sharply is anywhere a number depends on connecting two moments. Returning-visitor rates, multi-session attribution, cross-device journeys and lifetime value all rest on that link, and all of them have been quietly drifting for years in the browsers that block.

There is a second effect that compounds it. Where consent is declined, [the interface fills the gap with modelled data while the export does not](https://precisian.io/blog/en/posts/consent-mode-modeled-data/), so the same underlying loss produces two different-looking numbers depending on which surface you read. A team investigating "cookie loss" by comparing those two surfaces is measuring the modelling difference and attributing it to browsers.

Separating the two is worth an afternoon. One is a browser behaviour you cannot change; the other is a documented product behaviour you can account for.

## What should you stop doing?

Three things, all of them common and all of them now wrong.

**Stop citing a deprecation date.** There isn't one. A roadmap built on "before cookies go away" has no deadline, which means it has no urgency, which means it will not get resourced.

**Stop treating Privacy Sandbox APIs as the successor.** Much of that stack was retired. Building measurement on a technology whose vendor has stopped advancing it is a choice you should make knowingly, not by inheriting a plan written years ago.

**Stop describing the problem as future.** It is present, it is uneven across browsers, and it has been for years. Framing it as upcoming delays the work that should already be underway.

## What is actually worth doing?

The things that were worth doing regardless of what Chrome decided.

**Measure your own browser mix.** The size of your exposure is the share of your revenue arriving through browsers that already block. That is a query you can run today, and it converts an industry narrative into your number.

**Fix first-party collection.** Whatever fraction of your measurement depends on a third party setting an identifier on your behalf is the fraction at risk. Reducing it is durable work, and it does not become obsolete if a browser vendor reverses again.

**Separate the identity problem from the measurement problem.** Knowing that a purchase happened does not require knowing which anonymous session it belongs to. A large share of what teams lose to cookie restrictions is attribution rather than revenue, and those have different fixes and different urgency.

**Design for degradation rather than for a cliff.** The realistic future is continued unevenness between browsers, not a synchronized end. A measurement approach that produces a defensible number under partial data beats one that assumes either full data or none.

## Does server-side tagging solve it?

Partly, conditionally, and not in the way it is usually sold.

Moving tag execution to your own server changes where the request comes from, and in a genuine first-party context it allows server-set cookies rather than script-set ones. That is a real difference in some browsers.

It is not a general escape. WebKit's rules cap cookies set in HTTP responses at seven days when it classifies the request as CNAME-cloaked, and the classification depends on how your subdomain resolves rather than on your intent. [The full argument is a separate article](https://precisian.io/blog/en/posts/server-side-tagging-worth-it/), but the short version is that the durability benefit depends on a condition the vendor selling it rarely mentions.

And it changes nothing about consent. A user who declines still declines, whichever machine runs the tag.

## How do you talk about this internally?

By separating what is known from what is forecast, because the forecasts have been wrong repeatedly.

What is known: two of three major browsers block by default, and have for years. The third does not, as of now. The replacement programme was wound down. Your exposure equals your traffic share in the blocking browsers.

What is forecast: everything else. Whether Chrome changes course again, what regulators require, what replaces what. The industry has produced several confident timelines on this and none of them held.

The practical consequence is to resource the work by present measured loss rather than by anticipated future loss. Present loss is a number you can put on a slide and defend. Anticipated loss is a date somebody will move.

That distinction also protects you from the opposite error, which is concluding that because the cliff did not arrive, nothing needs doing. Something does. It is just already happening rather than about to.

## What does this article not cover?

It gives no percentage of data lost to cookie restrictions. That figure depends on your browser mix, your consent rate and your measurement setup, and the numbers in circulation are vendor estimates over other people's traffic.

It does not predict what Chrome will do. Everyone who has predicted this has been wrong at least once, and a dated claim in a durable article is a liability rather than a service.

It does not cover the legal layer. What consent your jurisdiction requires is a question for counsel working from the instrument, and it is a separate question from what any browser technically permits.

And it does not describe the current state of individual Privacy Sandbox APIs in detail. That surface has been changing, some pieces were retired and others were not, and describing a moving target precisely enough to be useful would make this article wrong within a quarter.
