---
title: "LGPD and AI: where your customer's data can live if you use a foreign LLM"
description: "To send customer data to an LLM outside Brazil there are two live legal paths, not three. Global corporate rules are not one of them."
slug: "lgpd-ai-customer-data"
lang: "en"
translationKey: "lgpd-ai-customer-data"
publishedAt: 2026-09-25
tags: ["lgpd", "anpd", "privacy", "ai-data-access"]
draft: false
llmSummary: "The ANPD deemed the European Union an adequate destination in Resolution 32/2026. For the United States the path is contractual: the standard clauses of Resolution 19/2024, whose adoption deadline expired on August 23, 2025. The ANPD states it has never approved global corporate rules."
citations: ["https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-publicacaooriginal-156212-pl.html", "https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-19-de-23-de-agosto-de-2024", "https://www.gov.br/anpd/pt-br/assuntos/assuntos-internacionais/transferencia-internacional-de-dados", "https://www.gov.br/anpd/pt-br/acesso-a-informacao/participacao-social/outras-acoes", "https://www.gov.br/anpd/pt-br/centrais-de-conteudo/documentos-tecnicos-orientativos"]
about: ["https://en.wikipedia.org/wiki/General_Personal_Data_Protection_Law", "https://precisian.io/datalake/"]
author: "Gabriel Sorato"
readingTimeMinutes: 6
---

If you send customer data to an LLM hosted outside Brazil, today there are two live legal paths under the LGPD (Brazil's General Data Protection Law), not three. Either the data stays in the European Union, deemed adequate by the ANPD (Brazil's national data protection authority) since January 2026, or the contract incorporates the standard clauses of [Resolution 19/2024](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-19-de-23-de-agosto-de-2024), whose adoption deadline **has already expired**. The third way out that every vendor offers, global corporate rules (the LGPD's counterpart to binding corporate rules), is not available: the ANPD states in writing that it has never approved any.

> **International data transfer**: sending personal data out of the country, allowed by art. 33 of the LGPD only in the cases the law lists, among them a country with an adequate level of protection and a contract with standard clauses approved by the authority.

## Is Technical Note 12/2025 what people say it is?

No, and that matters because almost every piece written on the subject starts with it.

The reading in circulation is that Technical Note (NT) 12/2025 is an AI enforcement guideline. Open the official document and it introduces itself differently right in the header: **"Consolidação das contribuições recebidas na Tomada de Subsídios"** (consolidation of the contributions received in the call for input), within the project to regulate Item 7 of the 2025-2026 Regulatory Agenda ([ANPD, public participation](https://www.gov.br/anpd/pt-br/acesso-a-informacao/participacao-social/outras-acoes)).

In other words: it is the digest of what society answered in a public consultation, input for regulating **art. 20** of the LGPD, which deals with the right to review of automated decisions. It is not a rule, it is not binding guidance and it is not an enforcement plan.

The document's own numbers help size it: there were 99 contributions through the platform and 25 by email, totaling 124 participants, of whom about 56% said they were answering on behalf of some processing agent, and 7% came from abroad ([ANPD](https://www.gov.br/anpd/pt-br/acesso-a-informacao/participacao-social/outras-acoes)). It is a consultation, with the size of a consultation.

**The document that actually makes AI an enforcement axis is a different one:** Resolution CD/ANPD No. 30, of December 23, 2025, which approves the Map of Priority Themes for 2026-2027 and lists artificial intelligence and emerging technologies among its four axes ([ANPD, regulations](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd)).

If your legal team received an alert citing NT 12/2025 as the basis of risk, it is right about the conclusion and wrong about the source, and a wrong source is the kind of thing that falls apart in a meeting.

## Where can the data go today?

The ANPD's official international transfer page answers this in a way that leaves no room for doubt.

The European Union was deemed adequate by the Board of Directors through **Resolution No. 32/2026, of January 26, 2026**. And, on the same page, the authority states that "to date there has been no decision by the Board of Directors on specific contractual clauses, equivalent standard contractual clauses or global corporate rules" ([ANPD](https://www.gov.br/anpd/pt-br/assuntos/assuntos-internacionais/transferencia-internacional-de-dados)).

| Destination | Basis in art. 33 | Status today |
|---|---|---|
| European Union | item I, adequate country | ✅ available since 26/01/2026 |
| United States | item II, "a", standard clauses | ✅ available, with the right contract |
| Any destination via global corporate rules | item II, "b" | ❌ the ANPD has never approved any |

That last row is the one that changes a sales conversation. When an American vendor answers the LGPD objection by saying it has global corporate rules or a certification of its own, it is citing a mechanism that does not yet exist in practice in Brazil. The path left for the United States is contractual, and it is specific.

## The deadline for the standard clauses has already expired

Resolution CD/ANPD No. 19, of August 23, 2024, approved the international transfer regulation and the text of the standard clauses. The sole paragraph of art. 2 set a deadline: agents that use contractual clauses "shall incorporate the standard contractual clauses approved by the ANPD into their respective contractual instruments within up to 12 (twelve) months" ([ANPD](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-19-de-23-de-agosto-de-2024)).

Twelve months counted from August 2024 means the deadline ended on **August 23, 2025**. This is not a rule that is about to take effect. It is a rule that has been in force for more than a year, and the full text of the clauses is in Annex II of the resolution itself.

## Who is liable if the vendor uses your data for training?

You are, and possibly the vendor along with you, and this is the part most AI contracts do not address.

The LGPD separates the roles by who owns the decision. The controller is whoever makes "the decisions regarding the processing", the processor is whoever "carries out the processing of personal data on behalf of the controller" (art. 5, VI and VII). Art. 39 binds the processor to the instructions received, and art. 37 requires both to keep a record of operations ([Law 13,709/2018](https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-publicacaooriginal-156212-pl.html)). The distinction is not a formality: it defines who pays the bill when something goes wrong.

The company that decides to send the customer's data to the model is the controller. The LLM vendor that processes according to instructions is the processor. So far, a common arrangement.

The shift is in art. 42, §1, I, which the ANPD's own Guidance highlights: the processor is jointly liable "when it fails to comply with the obligations of data protection legislation or when it has not followed the controller's lawful instructions, **in which case the processor is deemed equivalent to the controller**". The Guidance adds that, in principle, this is the only case of such equivalence ([Guidance, Processing Agents, v2.0](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-para-definicoes-dos-agentes-de-tratamento-de-dados-pessoais-e-do-encarregado)).

Translated into the clause that matters: if the contract allows the vendor to use the content of your prompts to train its model, that is processing for its own purpose, outside your instructions. It is not a terms-of-use detail, it is what decides who is liable.

It is worth noting that the ANPD has already acted on this ground. The official index of technical documents lists Technical Note No. 27/2024, on processing third-party data to develop a generative AI model, NT No. 39/2024 on Meta's compliance plan, and NT No. 1/2026 on the Grok system ([ANPD](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/documentos-tecnicos-orientativos)).

## How does this change the architecture decision?

It stops being about which model to use and becomes about where the data rests.

The model that answers the question can be anywhere; what needs a legal basis is the **personal data that leaves the country**. These are separable decisions, and separating them is what opens up the options: keeping the database in an isolated environment under known contractual control, and exposing to the model only the slice it needs, changes the perimeter of the transfer.

That is why a [data lake isolated per customer](https://precisian.io/datalake/) stops being a technical detail in this context. When the definitions live in a [semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/) and access goes through an API and an MCP server, you can answer precisely what was queried, by whom and when, which is exactly the record of operations required by art. 37.

## What does this article not cover?

It is not a legal opinion, and the decision on legal basis and contract belongs to your legal team, not to this text.

Three honest limits on what was cited. I do not reproduce the analytical content of NT 12/2025 beyond its nature and the participation numbers, because the substance of the contributions does not fit in a summary. I do not cite enforcement numbers that circulate in the trade press and do not appear on the official pages I opened. And the reference text of the LGPD here points to the publication by the Chamber of Deputies, not to the Planalto (the presidency's legislation portal), because it was the one that responded during verification.

If you are deciding right now whether you can connect an AI agent to your customer database, the first step is not choosing a vendor: it is knowing in which country the data rests and what the contract says about training. [Book a conversation about your case](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).
