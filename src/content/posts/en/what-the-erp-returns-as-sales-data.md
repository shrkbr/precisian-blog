---
title: "What the ERP returns as sales data (and what it does not)"
description: "The Omie order returns neither CPF nor CNPJ, and in Olist the field called origin is not the marketplace: it means point of sale."
slug: "what-the-erp-returns-as-sales-data"
lang: "en"
translationKey: "what-erp-returns-sales-data"
publishedAt: 2026-11-21
tags: ["erp", "integration", "data-discrepancy"]
draft: false
llmSummary: "ERPs disagree on the basics: the Omie order returns neither CPF nor CNPJ, only an internal code, and in Olist the origemPedido field means point of sale, not marketplace. The NF-e access key never comes in the order, and cancelled orders come back through the same endpoint."
citations: ["https://api-docs.erp.olist.com/api-reference/pedidos/obter-pedido", "https://api-docs.erp.olist.com/api-reference/notas/obter-nota-fiscal", "https://app.omie.com.br/api/v1/produtos/pedido/", "https://developer.bling.com.br/limites", "https://dfe-portal.svrs.rs.gov.br/Schemas/PRNFE/leiauteNFe_v4.00.xsd", "https://ajuda.omie.com.br/pt-BR/articles/8112984-limites-de-consumo-da-api-do-omie"]
about: ["https://pt.wikipedia.org/wiki/Nota_fiscal_eletr%C3%B4nica", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 9
---

ERPs do not agree even on the most basic question, and 2 of the 3 I tried to read answer "who bought" in incompatible ways. The Omie order returns the customer only as `codigo_cliente`, an internal integer, **with neither CPF nor CNPJ** (the Brazilian tax IDs for individuals and companies) ([Omie](https://app.omie.com.br/api/v1/produtos/pedido/)). The Olist order returns `cpfCnpj`, but marked as nullable in the specification itself ([Olist](https://api-docs.erp.olist.com/api-reference/pedidos/obter-pedido)). Whoever builds the integration assuming that "the ERP returns the customer's tax ID" finds out the difference in production.

Verified on September 23, 2026, reading the machine specification and not the documentation page, for a reason that becomes clear below.

> **A general rule that does not exist.** There is no common order format across ERPs. There are three different designs with similar names, and the similarity is where the error lives.

## Is the "origem" field the marketplace?

In Olist, no. And this is the most expensive trap in the integration.

The order has a field called `origemPedido` ("order origin"), and the specification describes it like this: *"Origem do pedido (0 = Pedido de Venda, 1 = PDV)"*, that is, order origin where 0 is a sales order and 1 is PDV, the point of sale ([Olist](https://api-docs.erp.olist.com/api-reference/pedidos/obter-pedido)). It is the difference between a sale recorded in the system and a sale at the physical point of sale. It has nothing to do with channel.

The real channel lives somewhere else, inside the `ecommerce` object: `id`, `nome`, `numeroPedidoEcommerce`, `numeroPedidoCanalVenda` and `canalVenda`.

Whoever does the mapping by matching field names, and "origem" is the obvious candidate, imports point of sale as if it were channel. The report comes out with two categories and nobody gets suspicious, because the numbers add up.

In Omie the field of the same name means yet another thing. `origem_pedido` is documented with *"Default: API - Importado via API. MLV - Mercado Livre"* (default: API, imported via API; MLV, Mercado Livre), in other words a short code that includes the marketplace. For the record, the full list of codes **is not documented** on the page I read: only the default and one example appear.

Two ERPs, one field name, two incompatible meanings.

## Who bought, after all?

It depends on the ERP, and Omie's answer is a surprise.

| | Customer identification in the order |
|---|---|
| **Olist** | `cpfCnpj`, `email`, `nome` in the `cliente` object, all nullable |
| **Omie** | only `codigo_cliente` and `codigo_cliente_integracao` |
| **Bling** | not verified, see the end of the article |

In Olist the customer object carries `nome`, `codigo`, `fantasia`, `tipoPessoa`, `cpfCnpj`, `inscricaoEstadual`, `rg`, `telefone`, `celular` and `email`. `tipoPessoa` has its own enumeration: `J - Juridica`, `F - Fisica`, `E - Estrangeiro`, `X - Estrangeiro No Brasil`.

Important: the specification marks `cpfCnpj` and `email` as nullable and **does not state** that they always come filled in. Fill rate is something you measure in your own account, not something you assume from the documentation.

In Omie, the consequence is architectural: **you cannot deduplicate customers or join with the CRM from the order alone**. A second call to the customer registry is mandatory. Whoever sized the extraction without counting that round trip finds out late.

## Does the invoice key come in the order?

No, in neither of the two I managed to read.

The Olist order carries only `idNotaFiscal`, an internal integer. The access key requires a second call, to the invoice resource, whose object carries `situacao`, `tipo`, `numero`, `serie`, `chaveAcesso`, `dataEmissao`, `cliente`, `valor`, `valorProdutos`, `valorFrete` and the tracking data ([Olist](https://api-docs.erp.olist.com/api-reference/notas/obter-nota-fiscal)).

In Bling, the structure confirms the same design by another route: there is a separate endpoint to **generate** the NF-e (the Brazilian electronic invoice) from the order, which means the invoice is a distinct object, not a field.

The extraction math, then, is worse than it looks. In Olist, to get order items and the invoice key you need one listing call, plus one detail call per order, plus one invoice call per order. The listing returns a reduced object: it carries `dataCriacao` instead of `data`, `valor` as text, and **omits** `dataFaturamento`, `itens`, `pagamento` and `idNotaFiscal`.

## Does the cancelled order come along?

It does, and through the same address.

The `situacao` enumeration in Olist is: `8 - Dados Incompletos`, `0 - Aberta`, `3 - Aprovada`, `4 - Preparando Envio`, `1 - Faturada`, `7 - Pronto Envio`, `5 - Enviada`, `6 - Entregue`, `2 - Cancelada`, `9 - Nao Entregue`.

`2 - Cancelada` (cancelled) is in the same list as `6 - Entregue` (delivered), and the listing accepts `situacao` as a filter with the same enumeration. In other words: if you do not exclude it explicitly, a cancelled order goes in as a sale. It is [the same family of error as the marketplace one](https://precisian.io/blog/en/posts/ltv-by-channel-marketplace-own-store/), and it inflates revenue silently, because the number stays plausible.

On dates, there are three distinct ones in Olist, with a type trap: the order's `data` and `dataEntrega` come as a pure date, while `dataEnvio` comes with the **time attached**. All of them are text, none is declared with a date format. Whoever does a generic conversion breaks on one and not on the other.

And there is an absence worth recording: the payment installments have `dias`, `data`, `valor` and `observacoes`, but **there is no documented "payment received" field**. Treating the installment date as the cash date is an assumption, not a reading.

## What does the NF-e carry that the order does not?

Two pieces of channel information that the ERP frequently does not return, and that the tax authority requires.

The official NF-e schema defines `indPres` as *"Indicador de presença do comprador no estabelecimento comercial no momento da oepração"* (indicator of the buyer's presence at the commercial establishment at the time of the operation), with values that include `2-Não presencial, internet` (not in person, internet). And it defines `indIntermed` like this: *"Indicador de intermediador/marketplace / 0=Operação sem intermediador (em site ou plataforma própria) / 1=Operação em site ou plataforma de terceiros (intermediadores/marketplace)"*, that is, an intermediary/marketplace indicator where 0 is an operation with no intermediary (on the seller's own site or platform) and 1 is an operation on a third-party site or platform (intermediaries/marketplace) ([SEFAZ, NF-e 4.00 schema](https://dfe-portal.svrs.rs.gov.br/Schemas/PRNFE/leiauteNFe_v4.00.xsd)).

The typo in "oepração" (for "operação") is in the official schema. I reproduce it as is.

The same document carries `dhEmi`, *"Data e Hora de emissão do Documento Fiscal"* (date and time of issue of the fiscal document), and, for the recipient, `CNPJ`, `CPF` and `idEstrangeiro`.

The conclusion is useful and underexplored: where the ERP order leaves the customer's tax ID nullable or absent, **the invoice does not have that freedom**. To separate own-store sales from marketplace sales, and to have a date with legal value, the fiscal document is a better source than the order object. It does not replace the ERP, but it answers questions the ERP leaves open.

## Why does this turn into a reporting discrepancy?

Because each of these differences becomes an implicit definition, and nobody writes it down.

If the cancelled order goes in, your revenue is one definition. If the date used is the order date instead of the invoicing date, it is another. If the channel came from a field that means point of sale, it is a third. None of them was decided in a meeting: all of them were decided by whoever wrote the mapping, probably in a hurry, probably by matching field names.

Months later, when the ERP number does not match the finance number, the investigation starts out looking for an error and finds none. There is no error. There are three scoping choices made in silence, which is [exactly why marketing and finance never close on the same number](https://precisian.io/blog/en/posts/marketing-finance-revenue-definition/).

The antidote is cheap and boring: for each field you import, write down where it came from and what it means in the source ERP, with the documentation citation next to it. A mapping file with thirty commented lines settles more future arguments than any dashboard, because it turns "the number is wrong" into "the number uses this scope, which we decided this way".

## What limits the nightly extraction?

Published limits, and they differ quite a bit.

Bling publishes *"3 requests per second"* and *"120,000 requests per day"*, plus blocks for errors and one restriction that changes planning: *"GET requests with period filters spanning more than one year will return status code 400"* ([Bling](https://developer.bling.com.br/limites)). In other words, **a historical load longer than one year has to be sliced**.

Omie publishes *"960 requests per minute per IP address"* and *"240 requests per minute per IP address + App Key + Method"*, with four simultaneous calls, one hundred records per page, and without a date parameter the response covers the *"last 30 days"* ([Omie](https://ajuda.omie.com.br/pt-BR/articles/8112984-limites-de-consumo-da-api-do-omie)).

Olist exposes the limit through a response header and states that *"The request limit is per account, not per application"*, which matters when there is more than one integration active on the same account.

Omie's design deserves some praise: the listing accepts `filtrar_apenas_alteracao`, time filters in addition to date filters, and `data_cancelamento_de` with `data_cancelamento_ate`. That last pair lets you pull only the orders cancelled since yesterday, which is exactly what is missing to reconcile without reprocessing everything.

## What does this article not cover?

**It does not include Bling's field list.** Its reference page is rendered in the browser and returns almost no text to automated reading; the specification file exists, responds, and is too large to be read in full in the attempts I made. The limits above come from a page that renders on the server. Bling's order fields do not.

**It does not cite TOTVS or Linx.** The TOTVS developer portals responded with a payment requirement and the Linx page responded as nonexistent. No reading, no claim.

**It does not break down the composition of the access key.** That table circulates a lot and I only obtained it through an automatic summary of a PDF I could not open. The structure of a fiscal key is something you publish with the manual open in front of you.

**It does not claim that these are the most used ERPs in Brazilian e-commerce.** I found no source with a methodology for market share, and that sentence tends to be repeated without one.

And a note on method that recurs in this series: on the first pass, an automatic extractor returned the field name `cnpjPagamento`. The raw specification says `cnpjPagamentoInstituicao`. The same extractor presented `origemPedido` with no description, which invited reading it as the sales channel. Both would have become wrong claims with the appearance of precision. That is why everything here was read in the machine specification, not on a documentation page.

If your ERP integration was built by matching field names, [it is worth a conversation about your case](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).
