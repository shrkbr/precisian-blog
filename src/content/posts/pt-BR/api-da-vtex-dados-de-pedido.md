---
title: "API da VTEX: como tirar pedido, faturamento e cancelamento sem o número divergir"
description: "O List orders da VTEX para em 30 páginas e só vê pedido indexado. Faturado, cancelado e devolvido moram em campos diferentes do OMS."
slug: "api-da-vtex-dados-de-pedido"
lang: "pt-BR"
translationKey: "api-vtex"
publishedAt: 2026-11-03
tags: ["ecommerce", "divergencia-de-dados", "integracao", "pipeline"]
draft: false
llmSummary: "A Orders API da VTEX limita o List orders a 30 páginas de até 100 pedidos, só devolve pedido já indexado (cerca de 4 minutos) e manda usar Feed ou Hook em integração. Pedido faturado não cancela: devolução vira nota do tipo Input (doc VTEX, 03/11/2026)."
citations: ["https://developers.vtex.com/docs/api-reference/orders-api", "https://github.com/vtex/openapi-schemas", "https://developers.vtex.com/docs/guides/orders-feed", "https://help.vtex.com/docs/tutorials/order-flow-and-status", "https://help.vtex.com/pt/docs/tutorials/compreenda-o-valor-da-receita-aprovada", "https://help.vtex.com/docs/tutorials/calculating-revenue-through-the-worksheet-exported-from-orders-module", "https://support.google.com/analytics/answer/12924131"]
about: ["https://pt.wikipedia.org/wiki/VTEX", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
cta: regua
updatedAt: 2026-11-08
---
A API da VTEX devolve pedido pelo OMS por três caminhos, e o número diverge porque cada caminho vê o pedido num momento diferente. O endpoint `List orders` só devolve pedido já indexado, o que "takes approximately four minutes", para em 30 páginas de até 100 pedidos (3.000 por consulta) e, nas palavras da própria VTEX, "should not be used for integrations" ([Orders API, consultada em 03/11/2026](https://developers.vtex.com/docs/api-reference/orders-api#get-/api/oms/pvt/orders)). Para integração, a VTEX indica o Feed ou o Hook.

Tudo o que segue foi lido na especificação de máquina da Orders API, publicada pela VTEX no repositório [`vtex/openapi-schemas`](https://github.com/vtex/openapi-schemas), e nos tutoriais oficiais, em 3 de novembro de 2026. Nomes de endpoint, campo e status estão como a documentação escreve.

> **Pedido, faturamento e cancelamento na VTEX são três leituras do mesmo documento.** O pedido é o objeto do OMS. O faturamento é a nota anexada a ele. O cancelamento é um status que só existe antes da nota. Quem soma os três como se fossem colunas independentes produz um número que muda conforme o dia da extração.

## Qual é o sintoma de quem extrai pedido da VTEX?

O total do mês muda de uma extração para a outra, sem que ninguém tenha mexido em nada. A planilha de outubro tirada ontem e a tirada hoje, com o mesmo filtro, trazem totais diferentes. O faturamento que a integração calcula não bate com o painel **Todos os pedidos**, não bate com a fatura da VTEX e não bate com o GA4. E o pedido que o cliente devolveu na semana passada não aparece como cancelado em lugar nenhum.

Os quatro vêm de decisões de leitura que a integração tomou sem perceber, e nenhum é bug.

## Quais endpoints do OMS devolvem pedido, e com que limite?

São três caminhos com propósitos diferentes. A tabela resume o que a documentação declara para cada um.

| Caminho | Endpoint | O que devolve | Limite documentado |
|---|---|---|---|
| List orders | `GET /api/oms/pvt/orders` | Resumo: `orderId`, `creationDate`, `authorizedDate`, `totalValue`, `status`, `origin`. Sem `items` desde 03/10/2018 | 30 páginas; `per_page` de 15 a 100; só pedido indexado; só os últimos dois anos ([Orders API](https://developers.vtex.com/docs/api-reference/orders-api)) |
| Get order | `GET /api/oms/pvt/orders/{orderId}` | O documento inteiro: `value`, `totals`, `items`, `packageAttachment`, `cancellationData`, `marketingData` | 6.000 requisições por minuto por conta; só os últimos dois anos ([Orders API](https://developers.vtex.com/docs/api-reference/orders-api)) |
| Feed v3 | `GET /api/orders/feed` e `POST /api/orders/feed` (commit) | Eventos de mudança, não pedidos | `maxlot` até 10 por leitura; retenção de 345.600 a 1.209.600 segundos (4 a 14 dias) ([guia do Feed](https://developers.vtex.com/docs/guides/orders-feed)) |
| Hook | `POST /api/orders/hook/config` | O mesmo evento, empurrado para a sua URL | Responder 200 em até 5.000 ms; sem notificação por três dias, a configuração é removida ([guia do Feed](https://developers.vtex.com/docs/guides/orders-feed)) |

Documentação consultada em 03/11/2026.

O guia do Feed avisa que ele "is not a list of orders, but rather a list of events" ([VTEX](https://developers.vtex.com/docs/guides/orders-feed)). Um pedido que passou por cinco status gera cinco eventos. Quem soma valor a partir do Feed conta o mesmo pedido cinco vezes.

## Por que o mesmo pedido dá números diferentes?

Por seis mecanismos, todos documentados.

**1. O `List orders` corta em silêncio.** Trinta páginas de cem dão 3.000 pedidos. Uma loja que vende 4.000 pedidos em outubro e consulta o mês inteiro de uma vez recebe 3.000, e a resposta não dá erro. O campo `paging.total` traz o total real; quem não o compara com o que baixou não percebe o corte.

**2. O índice atrasa.** Pedido criado há menos de quatro minutos ainda não existe para o `List orders`. A própria VTEX avisa que, por isso, "the data retrieved may present inconsistencies" ([Orders API](https://developers.vtex.com/docs/api-reference/orders-api#get-/api/oms/pvt/orders)). Extração rodada à meia-noite em ponto perde o fim do dia.

**3. O `value` do pedido muda depois da nota.** A doc do endpoint de nota é direta: "After the insertion of the invoice, the order's total value will be updated, even in partial invoice scenarios" ([`POST /api/oms/pvt/orders/{orderId}/invoice`](https://developers.vtex.com/docs/api-reference/orders-api#post-/api/oms/pvt/orders/-orderId-/invoice)). O mesmo `orderId` tem um `value` antes do faturamento e outro depois. Ainda existe o campo `roundingError`, em centavos, para a diferença de arredondamento de desconto aplicado item a item.

**4. "Faturamento" quer dizer três coisas na VTEX.**

| O que chamam de faturamento | Onde está | O que entra |
|---|---|---|
| Receita aprovada (a base da fatura da VTEX) | Relatório Financeiro, no módulo Faturas | Todo pedido aprovado, "incluindo o frete e imposto", inclusive cancelados, recusados por antifraude e testes de compra |
| Pedido com nota | `status` = `invoiced` e `invoicedDate` | Pedido que recebeu a nota de venda; depois disso, o status não muda mais |
| Valor faturado | `packageAttachment.packages[].invoiceValue`, com `type` | `Output` é nota de venda; `Input` é nota de devolução |

A primeira linha vem do tutorial [Compreenda o valor da receita aprovada](https://help.vtex.com/pt/docs/tutorials/compreenda-o-valor-da-receita-aprovada), que afirma que os pedidos aprovados "são considerados na fatura, independentemente de cancelamentos ou devoluções subsequentes". As outras duas vêm da [Orders API](https://developers.vtex.com/docs/api-reference/orders-api#get-/api/oms/pvt/orders/-orderId-). Os três números são legítimos e nunca vão coincidir.

**5. Pedido faturado não cancela; ele devolve.** O endpoint `POST /api/oms/pvt/orders/{orderId}/cancel` recusa pedido com status `invoiced`, pedido com nota parcial e pedido incompleto. Para o que já foi faturado, a VTEX manda gerar nota de devolução com `type: Input`, e essa nota "will automatically create a refund" ([Orders API](https://developers.vtex.com/docs/api-reference/orders-api#post-/api/oms/pvt/orders/-orderId-/cancel)). Por isso, a devolução nunca aparece como `canceled`. Ela aparece como um segundo pacote, de tipo `Input`, com o campo `restitutions` preenchido. Quem mede cancelamento só pelo status ignora toda devolução pós-nota.

**6. Uma compra pode virar vários pedidos.** O campo `orderGroup` agrupa "all orders related to the same purchase": a compra `v71021570str` pode gerar os pedidos `-01` e `-02`, um por vendedor. E, quando há marketplace e seller, a mesma venda existe nas duas contas, ligada por `marketplaceOrderId` e `sellerOrderId`. Somar as duas contas conta a venda duas vezes. Esse problema tem irmão fora da VTEX, quando a venda passa por marketplace de terceiro: [não existe chave comum entre o site e o marketplace](https://precisian.io/blog/pt-BR/posts/deduplicar-venda-site-marketplace/).

## Que status a API devolve, e qual deles é "cancelado"?

A tabela oficial de status do fluxo tem mais de 30 linhas ([Order flow and status](https://help.vtex.com/docs/tutorials/order-flow-and-status)). O filtro `f_status` do `List orders` aceita só sete: `waiting-for-sellers-confirmation`, `payment-pending`, `payment-approved`, `ready-for-handling`, `handling`, `invoiced` e `canceled`.

Três nomes parecidos confundem a contagem de cancelamento:

- `request-cancel`: o cliente pediu para cancelar. O pedido ainda não foi cancelado.
- `cancel`: o pedido está **sendo** cancelado; o Admin mostra "Canceling" enquanto o módulo de pagamentos processa.
- `canceled`: o cancelamento terminou e a transação foi cancelada.

E há a janela `window-to-cancel`: depois da aprovação do pagamento, o cliente tem "30 minutes (default)" para cancelar sem aprovação da loja ([VTEX](https://help.vtex.com/docs/tutorials/order-flow-and-status)). Pedido aprovado às 23h50 do dia 31 pode ser cancelado às 0h10 do dia 1º. Se o seu fechamento olha o status no dia 31, ele contou uma venda que não existiu.

O guia do Feed acrescenta um alerta que vale para qualquer integração: o status `null`, de pedido incompleto, "may be unidentified and end up being mapped as another status" ([VTEX](https://developers.vtex.com/docs/guides/orders-feed)).

## Como diagnosticar a divergência na sua operação?

Cinco verificações, em ordem de esforço. Todas rodam com uma chave de API com o recurso **List Orders** ou **View order**.

| Verificação | Onde olhar | O que indica divergência |
|---|---|---|
| Corte de 3.000 | `paging.total` contra o número de linhas baixadas | Total maior que o baixado: a consulta foi truncada ([Orders API](https://developers.vtex.com/docs/api-reference/orders-api)) |
| Fuso do filtro | `f_creationDate` recebe timestamp em UTC (o `Z` no fim) | O dia de Brasília começa às 03:00Z; filtro de 00:00Z a 23:59Z desloca três horas de venda para o dia anterior ([Orders API](https://developers.vtex.com/docs/api-reference/orders-api)) |
| Data escolhida | `creationDate`, `authorizedDate`, `invoicedDate` | Boleto e Pix aprovados dias depois mudam de mês conforme a data usada ([VTEX](https://help.vtex.com/pt/docs/tutorials/compreenda-o-valor-da-receita-aprovada)) |
| Devolução escondida | `packageAttachment.packages[].type` | Pedido `invoiced` com pacote `Input`: venda devolvida que o status não mostra |
| Dupla contagem | `orderGroup`, `origin`, `marketplaceOrderId` | A mesma compra somada em mais de um pedido ou em mais de uma conta |

A primeira verificação, em uma chamada:

```bash
curl -s "https://{conta}.vtexcommercestable.com.br/api/oms/pvt/orders?f_creationDate=creationDate:%5B2026-10-01T03:00:00.000Z%20TO%202026-11-01T02:59:59.999Z%5D&per_page=100&page=1" \
  -H "X-VTEX-API-AppKey: $VTEX_APP_KEY" \
  -H "X-VTEX-API-AppToken: $VTEX_APP_TOKEN" | jq '.paging'
```

Se `paging.pages` passar de 30, a extração mensal está perdendo pedido. A faixa de datas acima é outubro de 2026 no horário de Brasília, em UTC. O fuso de 3 horas é aritmética do horário de Brasília, sem horário de verão desde 2019; o formato do filtro é o da documentação.

A conferência mais rápida contra o painel é a que a própria VTEX ensina: exportar **Todos os pedidos**, remover os números de pedido duplicados (cada SKU gera uma linha) e somar a coluna **Total Value** ([VTEX](https://help.vtex.com/docs/tutorials/calculating-revenue-through-the-worksheet-exported-from-orders-module)). Se esse total bate com a sua integração e não bate com a fatura da VTEX, a diferença é definição, não extração.

## Como corrigir a extração?

Separe os dois trabalhos que o `List orders` faz mal.

**Para saber o que mudou, use o Feed.** Configure o filtro (`FromWorkflow` por status, ou `FromOrders` com expressão JSONata), leia em lotes de até 10, processe e faça o commit. O guia recomenda uma chave de API por feed, porque "each appKey can configure or access only one feed": duas pessoas com a mesma chave consomem a mesma fila, e o commit de uma apaga o evento da outra ([VTEX](https://developers.vtex.com/docs/guides/orders-feed)).

**Para saber o valor, use o `Get order`.** Para cada `orderId` que o Feed apontar, busque o documento inteiro e guarde a versão com data. Guardar só o último estado apaga a informação de que o pedido valia uma coisa antes da nota e outra depois.

**Para carga histórica, fatie.** Consultas de `List orders` por dia, cada uma abaixo de 3.000 pedidos, com conferência de `paging.total` em cada fatia.

**Escreva a definição de faturamento uma vez.** Qual data (`invoicedDate` ou `issuanceDate` da nota, que a doc diz que podem diferir "days or even months"), qual sinal (nota `Output` menos nota `Input`), com ou sem frete (o objeto `totals` separa `Items`, `Discounts`, `Shipping` e `Tax`, em centavos). É a mesma discussão de [por que marketing e financeiro nunca fecham o mesmo número de receita](https://precisian.io/blog/pt-BR/posts/mesma-definicao-de-receita/), com nome de campo. Essa definição fica na [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/), não em cada relatório.

Na Precisian, a VTEX é conector pronto: o pedido entra no data lake isolado do cliente, na infraestrutura da Precisian, com o histórico de estado preservado, e a definição de faturamento vive versionada na camada semântica. O cliente consome pela IA, pela API ou pelo BI dele.

## E por que ainda não vai bater com o GA4?

Porque o GA4 mede outra coisa. A receita de item do GA4 é "The total revenue from items only, excluding tax and shipping" ([Google](https://support.google.com/analytics/answer/12924131)), enquanto o `value` da VTEX inclui frete e imposto. O `purchase` dispara no checkout, e a VTEX marca boleto e Pix como aprovados só após a confirmação de pagamento. E pedido de televendas nunca passou pelo navegador. A cascata completa de reconciliação está em [VTEX e GA4 não batem](https://precisian.io/blog/pt-BR/posts/vtex-ga4-nao-batem/).

## Quando isso não tem conserto?

Em três situações.

**Pedido com mais de dois anos.** O `Get order` e o `List orders` só acessam "orders created in the last two years" ([Orders API](https://developers.vtex.com/docs/api-reference/orders-api#get-/api/oms/pvt/orders/-orderId-)). Se ninguém guardou o pedido antes disso, a API não o devolve mais.

**Histórico de status perdido.** O Feed descarta o evento ao fim da retenção, no máximo 14 dias, mesmo sem commit, e um feed sem eventos novos pelo período de retenção tem a configuração removida. Uma integração parada por três semanas perde as transições daquele período. O `Get order` devolve o estado atual, não o caminho até ele. O `lastChange` diz quando mudou pela última vez, não o que mudou antes.

**A fatura da VTEX contra a nota fiscal.** A receita aprovada inclui teste de compra e pedido recusado por antifraude, e o relatório financeiro é estático depois de gerado. Esse número não vai bater com o faturamento por nota, e nenhuma integração resolve isso. O que resolve é parar de compará-los como se fossem a mesma métrica.

**Quando a Precisian não é a resposta.** Loja com um só canal, sem marketplace, que precisa do total do mês uma vez por mês: a exportação do Admin, com a deduplicação que a VTEX ensina, resolve. Plataforma de dados se paga quando o pedido precisa cruzar com mídia, ERP e marketplace, e ser lido por uma IA sem que alguém refaça a definição a cada pergunta.

## O que este artigo não cobre?

Não cobre a API de Pagamentos (liquidação e conciliação de adquirente), a API de modificação de pedido (`/api/order-system/orders/{changeOrderId}/changes`), os fluxos de B2B e de marketplace externo. Também não traz uma divergência típica entre VTEX e GA4: a VTEX não publica uma, e este blog não repete as faixas que circulam sem dado.

Os servidores MCP oficiais da VTEX, que não leem pedido, estão em [Existe MCP para VTEX, Shopify e Nuvemshop?](https://precisian.io/blog/pt-BR/posts/mcp-de-plataforma-de-ecommerce/).

---

Se o faturamento que sai da sua API da VTEX muda conforme o dia da extração, o primeiro passo é separar quanto da diferença vem de data e quanto vem de status. [Veja a pergunta deste post respondida sobre um lake de verdade](https://precisian.io/demonstracao?utm_source=blog&utm_medium=cta&utm_campaign=api-da-vtex-dados-de-pedido&utm_content=texto), sem compromisso de contrato.
