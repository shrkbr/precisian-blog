---
title: "API da Amazon (SP-API): pedido e repasse para o vendedor"
description: "Na API da Amazon (SP-API), o pedido sai do searchOrders e o repasse sai do listTransactions. O proceeds do pedido não traz comissão nem tarifa de logística."
slug: "api-da-amazon-dados-de-venda"
lang: "pt-BR"
translationKey: "amazon-sp-api-sales-data"
publishedAt: 2026-11-23
tags: ["marketplace", "integracao", "divergencia-de-dados", "ecommerce", "lgpd"]
draft: false
llmSummary: "Segundo a documentação da Amazon (lida em 23/11/2026), os campos proceeds e expense da Orders API v2026-01-01 não trazem comissão nem tarifa de logística; o repasse vem do listTransactions da Finances API, que pode omitir pedidos das últimas 48 horas. A Orders API v0 será removida em 27/03/2027."
citations: ["https://developer-docs.amazon/sp-api/docs/orders-api", "https://developer-docs.amazon/sp-api/docs/orders-api-migration-guide", "https://developer-docs.amazon/sp-api/reference/searchorders", "https://developer-docs.amazon/sp-api/docs/orders-api-rate-limits", "https://developer-docs.amazon/sp-api/docs/access-orders-pii", "https://developer-docs.amazon/sp-api/docs/sp-api-deprecations", "https://developer-docs.amazon/sp-api/docs/finances-api", "https://developer-docs.amazon/sp-api/reference/listtransactions", "https://developer-docs.amazon/sp-api/docs/list-transactions-by-order", "https://developer-docs.amazon/sp-api/docs/retrieve-financial-summary", "https://developer-docs.amazon/sp-api/docs/report-type-values-settlement", "https://developer-docs.amazon/sp-api/docs/report-type-values-order", "https://developer-docs.amazon/sp-api/docs/report-type-values-analytics", "https://developer-docs.amazon/sp-api/docs/guidance-to-address-key-security-controls-in-sp-api-integration", "https://developer-docs.amazon/sp-api/docs/sp-api-endpoints", "https://developer-docs.amazon/sp-api/docs/invoices-api"]
about: ["https://pt.wikipedia.org/wiki/Amazon", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
cta: regua
---
A API da Amazon para vendedores, a SP-API, devolve o pedido pela operação `searchOrders` da Orders API v2026-01-01 e o dinheiro pela operação `listTransactions` da Finances API v2024-06-19. São duas APIs porque o pedido não traz o repasse: o campo `proceeds` lista item, frete, imposto e desconto, mas nenhuma comissão da Amazon. A versão antiga da Orders API, a v0, foi descontinuada em 28/01/2026 e será removida em 27/03/2027 ([cronograma de descontinuação](https://developer-docs.amazon/sp-api/docs/sp-api-deprecations), atualizado em 09/09/2026 e lido em 23/11/2026).

Li a documentação oficial de cada API citada aqui no dia 23 de novembro de 2026. Os nomes de campo estão como a Amazon escreve, entre crases, com o link da página.

> **SP-API (Selling Partner API)**: o conjunto de APIs REST da Amazon para vendedores e fornecedores. Para a loja brasileira, as chamadas vão ao endpoint `https://sellingpartnerapi-na.amazon.com`, o mesmo da América do Norte ([SP-API Endpoints](https://developer-docs.amazon/sp-api/docs/sp-api-endpoints)), com o marketplace `A2Q3Y263D00KWC`.

## Qual é o sintoma?

O faturamento da Amazon na sua planilha não fecha com o que cai na conta. A diferença não é só a comissão que alguém lembra de cabeça: muda de mês para mês, e uma parte dela aparece semanas depois da venda.

Ou a integração que funcionava parou de trazer repasse em novembro. Se ela lia o relatório de liquidação antigo, o motivo está na seção sobre relatórios, mais abaixo.

## O que o pedido devolve na Orders API v2026-01-01?

A versão nova junta em duas operações o que a v0 espalhava em seis. O [guia de migração](https://developer-docs.amazon/sp-api/docs/orders-api-migration-guide) (atualizado em 09/09/2026) mapeia `GetOrders` para `searchOrders`, e `GetOrder`, `GetOrderItems`, `GetOrderBuyerInfo` e `GetOrderAddress` para `getOrder` com o parâmetro `includedData`. Os valores de `includedData` decidem o que vem na resposta:

<table>
<thead><tr><th>Valor de <code>includedData</code></th><th>O que a doc diz</th><th>Campo</th></tr></thead>
<tbody>
<tr><td><code>PROCEEDS</code></td><td>"Revenue and financial breakdown"</td><td><code>Order.proceeds</code>, <code>Order.orderItems.proceeds</code></td></tr>
<tr><td><code>EXPENSE</code></td><td>"Cost information"</td><td><code>Order.orderItems.expense</code></td></tr>
<tr><td><code>PROMOTION</code></td><td>"Discount and promotional offers"</td><td><code>Order.orderItems.promotion</code></td></tr>
<tr><td><code>CANCELLATION</code></td><td>"Cancellation information"</td><td><code>Order.orderItems.cancellation</code></td></tr>
<tr><td><code>BUYER</code></td><td>"Buyer information"</td><td><code>Order.buyer</code></td></tr>
<tr><td><code>RECIPIENT</code></td><td>"Delivery address and preferences"</td><td><code>Order.recipient</code></td></tr>
<tr><td><code>FULFILLMENT</code></td><td>"Shipping and fulfillment details"</td><td><code>Order.fulfillment</code></td></tr>
</tbody>
</table>

O antigo `OrderTotal` virou `Order.proceeds.grandTotal`, e só aparece se o pedido for consultado com `includedData=PROCEEDS`. Quem migrou sem pedir esse valor grava pedido sem total.

O `expense`, descrito na tabela como *"Cost information"*, também não guarda tarifa: na referência, `ItemExpense` tem uma única propriedade, `pointsCost`, o custo de pontos concedidos ao comprador ([searchOrders](https://developer-docs.amazon/sp-api/reference/searchorders)).

A [referência do searchOrders](https://developer-docs.amazon/sp-api/reference/searchorders) (atualizada em 10/09/2026) descreve `OrderProceeds` como *"the money that the seller receives from the sale of the order"*. Mas as categorias aceitas em `breakdowns[].type` são `ITEM`, `SHIPPING`, `GIFT_WRAP`, `COD_FEE`, `TAX`, `DISCOUNT`, `DELIVERY_TIP` e `OTHER`. Não há categoria para a comissão de venda nem para a tarifa de logística da Amazon. Pelas categorias, o `proceeds` descreve o que o comprador pagou, separado por tipo; o que sobra para o vendedor está em outra API.

O canal também não diz de onde veio a venda. `salesChannel` traz `channelName`, `marketplaceId` e `marketplaceName`, e entre os campos documentados do pedido não há origem de tráfego, campanha ou clique. É o desenho que descrevi em [marketplace como buraco negro de dados](https://precisian.io/blog/pt-BR/posts/marketplace-buraco-negro-de-dados/).

## Quais status contam como venda?

A lista oficial de `fulfillmentStatus` na v2026-01-01 tem sete valores: `PENDING_AVAILABILITY`, `PENDING`, `UNSHIPPED`, `PARTIALLY_SHIPPED`, `SHIPPED`, `CANCELLED` e `UNFULFILLABLE` ([searchOrders](https://developer-docs.amazon/sp-api/reference/searchorders)). A doc diz que, *"for standard orders, the initial order status is `PENDING`"*. Pedido em `PENDING` ainda não é venda confirmada.

Duas mudanças da migração quebram filtro em silêncio ([guia de migração](https://developer-docs.amazon/sp-api/docs/orders-api-migration-guide)):

- `Canceled` virou `CANCELLED`, com dois "L". Um filtro que exclui `Canceled` passa a deixar o cancelado entrar.
- `MFN` virou `MERCHANT` e `AFN` virou `AMAZON` no campo `fulfilledBy`. Um filtro que espera `MFN` ou `AFN` deixa de casar.

Para pedido com envio próprio em `PENDING`, os relatórios de pedido também escondem o preço: a doc diz que *"item price is not shown for orders in a pending state"* ([Order Reports](https://developer-docs.amazon/sp-api/docs/report-type-values-order), atualizada em 18/11/2026).

## Onde fica o repasse ao vendedor?

Na Finances API. A versão atual é a v2024-06-19; a v0 (`listFinancialEvents` e afins) foi descontinuada em 21/07/2025 e sai do ar em 27/08/2027 ([cronograma](https://developer-docs.amazon/sp-api/docs/sp-api-deprecations)).

A operação [`listTransactions`](https://developer-docs.amazon/sp-api/reference/listtransactions) (atualizada em 10/09/2026) traz três avisos que mudam a extração:

- *"Financial events might not include orders from the last 48 hours."*
- Se `postedAfter` e `postedBefore` estiverem a mais de 180 dias de distância, *"the response is empty"* ([listTransactions](https://developer-docs.amazon/sp-api/reference/listtransactions)); a doc não menciona erro.
- `transactionStatus` admite `DEFERRED`, `RELEASED` e `DEFERRED_RELEASED`. O `DeferredContext` explica o adiamento em `deferralReason`, com os exemplos `B2B` (pedidos faturados) e `DD7` (política de data de entrega), e informa a `maturityDate`.

Para fechar um pedido específico, a doc de [transações por pedido](https://developer-docs.amazon/sp-api/docs/list-transactions-by-order) manda chamar `listTransactions` com `relatedIdentifierName=ORDER_ID`. Ela lembra que estorno e ajuste *"can occur days, weeks, or even months later"*. Os outros filtros aceitos são `SETTLEMENT_ID` e `FINANCIAL_EVENT_GROUP_ID`.

O campo que separa comissão de frete é `breakdowns[].breakdownType`, descrito apenas como *"the type of charge"*. A referência não publica a lista de valores; o exemplo mostra `Sales`, `Product Charges` e `Principle` (com essa grafia). Guarde a árvore de `breakdowns` inteira e mapeie os tipos que aparecerem na sua conta, em vez de esperar uma lista fechada.

Para o fechamento diário, a operação `listSummary` agrega por período ou por liquidação, e a doc avisa que o resumo é calculado *"based on the marketplace timezone of the seller, not UTC"* ([Retrieve a financial summary](https://developer-docs.amazon/sp-api/docs/retrieve-financial-summary)).

## E os relatórios, ainda servem?

Servem, com duas armadilhas datadas.

**Liquidação.** O relatório de liquidação não pode ser pedido: *"Settlement reports cannot be requested or scheduled. They are automatically scheduled by Amazon"*, e se busca com `getReports` ([Settlement Reports](https://developer-docs.amazon/sp-api/docs/report-type-values-settlement), atualizada em 14/10/2026). Os tipos `GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE` e `GET_V2_SETTLEMENT_REPORT_DATA_XML` foram removidos em 11/11/2026, segundo o [cronograma](https://developer-docs.amazon/sp-api/docs/sp-api-deprecations). O que fica é o `GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE_V2`, com valores nas colunas `amount-type`, `amount-description` e `amount`, e com valores no formato local; o exemplo da doc é europeu, *"`95,00` for EU instead of `95.00`"*. Pela mesma regra, é de esperar vírgula decimal também na loja brasileira (dedução minha; a doc não dá exemplo do Brasil).

**Pedidos.** O `GET_FLAT_FILE_ALL_ORDERS_DATA_BY_LAST_UPDATE_GENERAL` traz todos os pedidos alterados no período, mas a janela é *"limited to 30 days"* e os relatórios *"do not include customer-identifying information"* ([Order Reports](https://developer-docs.amazon/sp-api/docs/report-type-values-order)).

**Tráfego.** O `GET_SALES_AND_TRAFFIC_REPORT` traz vendas, unidades, visualizações de página e percentual de buy box por data e ASIN. Exige o papel *Brand Analytics* e aceita até três pedidos a cada cinco minutos ([Analytics Reports](https://developer-docs.amazon/sp-api/docs/report-type-values-analytics), atualizada em 18/11/2026). É agregado: não liga visita a pedido.

## Que dado do comprador a API entrega?

Pouco, e por tempo curto. Na v2026-01-01, o acesso a dado pessoal depende só do papel atribuído ao aplicativo, sem o Restricted Data Token da v0 ([Access Orders PII](https://developer-docs.amazon/sp-api/docs/access-orders-pii), atualizada em 30/09/2026). O e-mail em `buyer.buyerEmail` exige o papel *Direct-to-Consumer Shipping (Restricted)*, só existe em pedido com envio próprio e só nos status `UNSHIPPED`, `PARTIALLY_SHIPPED` ou `SHIPPED`. A referência descreve o campo como *"the anonymized email address of the buyer"*.

E a política de proteção de dados manda apagar. A página de [controles de segurança](https://developer-docs.amazon/sp-api/docs/guidance-to-address-key-security-controls-in-sp-api-integration) (atualizada em 09/09/2026) lista o limite: dado pessoal, *"30 days after order delivery"*. Somado à LGPD, isso fecha a porta para usar o e-mail da Amazon como chave de cliente, como detalhei em [deduplicar venda entre site e marketplace](https://precisian.io/blog/pt-BR/posts/deduplicar-venda-site-marketplace/).

## Como diagnosticar na sua integração?

Rode estas checagens num mês fechado:

| Verificação | Onde olhar | O que indica divergência | Fonte |
|---|---|---|---|
| Versão da Orders API | chamadas a `getOrders` ou `getOrderItems` no log | Integração presa à v0, removida em 27/03/2027 | [cronograma](https://developer-docs.amazon/sp-api/docs/sp-api-deprecations) |
| Total do pedido | `proceeds.grandTotal` nulo | Consulta sem `includedData=PROCEEDS` | [guia de migração](https://developer-docs.amazon/sp-api/docs/orders-api-migration-guide) |
| Filtro de cancelado | `CANCELLED` × `Canceled` | Cancelado contado como venda depois da migração | [guia de migração](https://developer-docs.amazon/sp-api/docs/orders-api-migration-guide) |
| Repasse recente | pedidos das últimas 48 horas sem transação | Atraso documentado, não pedido perdido | [listTransactions](https://developer-docs.amazon/sp-api/reference/listtransactions) |
| Repasse adiado | `transactionStatus=DEFERRED` | Venda registrada com dinheiro ainda retido | [listTransactions](https://developer-docs.amazon/sp-api/reference/listtransactions) |
| Liquidação | último `getReports` com tipo V2 antigo | Carga de repasse parada desde 11/11/2026 | [cronograma](https://developer-docs.amazon/sp-api/docs/sp-api-deprecations) |
| Separador decimal (dedução) | coluna `amount` lida como texto | Valor multiplicado por 100 ou descartado | [Settlement Reports](https://developer-docs.amazon/sp-api/docs/report-type-values-settlement) |

## Como corrigir?

Comece pela definição. "Venda da Amazon" pode ser `grandTotal` dos pedidos `SHIPPED`, ou o total de transações `RELEASED` de um período, ou o `total-amount` da liquidação depositada. São três números diferentes, cada um certo para uma pergunta. Escrever qual deles responde a qual pergunta, e consultá-lo sempre do mesmo jeito, é o que chamamos de camada semântica. Foi a mesma conclusão a que cheguei na [API do Mercado Livre](https://precisian.io/blog/pt-BR/posts/api-do-mercado-livre-dados-de-venda/).

Na extração, quatro regras tiradas da própria documentação:

1. **Puxe pedido por `lastUpdatedAfter`.** O `searchOrders` exige exatamente um entre `createdAfter` e `lastUpdatedAfter`, e a doc define atualização como *"any change made by Amazon or the seller, including changes to order status"*. Só o segundo pega o pedido que foi cancelado depois de carregado.
2. **Respeite a cota.** O `searchOrders` tem taxa de 0,0056 requisição por segundo e burst de 20; o `getOrder`, 0,5 e 30 ([Orders API Rate Limits](https://developer-docs.amazon/sp-api/docs/orders-api-rate-limits), atualizada em 09/09/2026). Pela aritmética, a taxa sustentada do `searchOrders` dá uma chamada a cada três minutos, depois de gasto o burst. Peça os dados no próprio `searchOrders`, com `includedData`, em páginas de até 100 pedidos (`maxResultsPerPage`, [searchOrders](https://developer-docs.amazon/sp-api/reference/searchorders)).
3. **Reconcilie por pedido, depois por liquidação.** Rode `listTransactions` com `ORDER_ID` para cada pedido de um período fechado há mais de 48 horas, e feche contra o `listSummary` da liquidação no fuso do marketplace.
4. **Guarde tudo.** A Orders API não mostra pedido com mais de dois anos fora de Japão, Austrália e Singapura ([Orders API](https://developer-docs.amazon/sp-api/docs/orders-api), atualizada em 09/09/2026). Histórico mais velho só existe se você o salvou.

## Quando isso não tem conserto?

**Origem da venda.** Nenhum campo documentado do pedido liga a venda a um anúncio ou busca. O relatório de tráfego é agregado por data e ASIN.

**Cliente único entre canais.** O e-mail vem anonimizado, só em pedido com envio próprio, e precisa ser apagado 30 dias depois da entrega ([controles de segurança](https://developer-docs.amazon/sp-api/docs/guidance-to-address-key-security-controls-in-sp-api-integration)). Contar clientes distintos entre o site e a Amazon continua sem chave confiável.

**Lista fechada de tarifas.** A Finances v2024-06-19 não publica os valores de `breakdownType`. Um tipo novo pode aparecer sem aviso, e a sua regra de mapeamento precisa tratar o desconhecido.

**Nota fiscal de envio próprio.** A [Invoices API](https://developer-docs.amazon/sp-api/docs/invoices-api) é *"only able to retrieve Brazilian FBA invoices"*. Quem fatura pelo próprio ERP busca a nota no ERP, como em [o que o ERP devolve de dado de venda](https://precisian.io/blog/pt-BR/posts/o-que-o-erp-devolve-de-dado-de-venda/).

Quando a Precisian não é a resposta: se você vende só na Amazon e o repasse já fecha com o financeiro, uma plataforma de dados é custo sem problema para resolver. O problema aparece quando a Amazon precisa conversar com o site, o ERP e a mídia. Conectamos qualquer fonte que tenha API aberta.

## O que este artigo não cobre?

**Não cobre a Amazon Ads API.** Campanha patrocinada tem API própria. Na Finances v0, a cobrança aparece como `ProductAdsPaymentEventList`; não li a documentação de anúncios para este texto.

**Não cobre o lado do fornecedor (Vendor Central).** As APIs de fornecedor são outras.

Se o faturamento da Amazon na sua planilha não fecha com o depósito, o primeiro passo é medir a distância entre o `grandTotal` dos pedidos e o total de transações `RELEASED` do mesmo período. [Veja a pergunta deste post respondida sobre um lake de verdade](https://precisian.io/demonstracao?utm_source=blog&utm_medium=cta&utm_campaign=api-da-amazon-dados-de-venda&utm_content=texto), sem compromisso de contrato.
