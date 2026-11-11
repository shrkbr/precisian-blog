---
title: "Ticket médio: como calcular sem cada área chegar num número diferente"
description: "Ticket médio é receita dividida por pedidos. A briga está no numerador (frete, cancelado, devolução) e no denominador (pedido captado ou faturado)."
slug: "ticket-medio-ecommerce"
lang: "pt-BR"
translationKey: "ticket-medio-ecommerce"
publishedAt: 2026-11-11
tags: ["ecommerce", "divergencia-de-dados", "camada-semantica", "ga4", "marketplace"]
draft: false
llmSummary: "Ticket médio é a receita dividida pelo número de pedidos do período. A VTEX publica quatro tickets médios (captado, aprovado, faturado, cancelado); o GA4 calcula sem frete nem imposto; a Shopify exclui devoluções e ajustes. Cada um responde uma pergunta diferente."
citations: ["https://help.vtex.com/pt/docs/tutorials/performance-de-vendas", "https://help.vtex.com/pt/docs/tutorials/todos-os-pedidos", "https://help.vtex.com/pt/docs/tutorials/compreenda-o-valor-da-receita-aprovada", "https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema", "https://developers.google.com/analytics/devguides/collection/ga4/reference/events", "https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/report-types/default-reports/sales-report"]
about: ["https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 6
cta: regua
---
Ticket médio é a receita de um período dividida pelo número de pedidos do mesmo período. A fórmula não muda; o que muda é o que cada sistema põe em cima e embaixo da divisão. A própria VTEX publica quatro tickets médios diferentes no painel de Performance de Vendas, um para pedido captado, aprovado, faturado e cancelado ([VTEX](https://help.vtex.com/pt/docs/tutorials/performance-de-vendas), consultada em 11/11/2026). Quem não diz qual deles está usando compara números que medem coisas diferentes.

> **Ticket médio** (em inglês, *average order value*): valor médio por pedido num período, calculado como receita ÷ número de pedidos. Só tem significado quando vem acompanhado de três escolhas declaradas: o que entra na receita, que estado de pedido conta e em que data o pedido entra no período.

Todas as citações de documentação deste texto foram conferidas no dia da publicação.

## Como calcular o ticket médio?

A conta é uma divisão:

**ticket médio = receita do período ÷ pedidos do período**

O trabalho está nas três decisões que vêm antes dela.

**1. O que entra na receita (o numerador).** Frete, imposto, desconto, pedido cancelado, devolução, taxa de parcelamento. Cada um entra ou sai conforme o sistema.

**2. Que pedido conta (o denominador).** Pedido captado (o cliente fechou o carrinho), aprovado (o pagamento passou), faturado (a nota saiu) ou entregue. Com Pix e boleto, a distância entre captado e aprovado é grande, porque parte dos pedidos nunca é paga; o mecanismo está em [o Pix quebra o evento de compra do GA4](https://precisian.io/blog/pt-BR/posts/pix-quebra-o-purchase-do-ga4/).

**3. Em que dia o pedido entra.** Na data da compra, da aprovação ou do faturamento. Pedido feito no dia 31 e faturado no dia 2 cai em meses diferentes conforme a escolha.

O numerador e o denominador precisam seguir a mesma regra. Somar a receita de pedidos faturados e dividir pelo número de pedidos captados produz um ticket médio menor do que qualquer definição honesta, sem que nenhum dos dois números esteja errado.

## Por que a loja, o GA4 e a Shopify dão tickets médios diferentes?

Porque cada plataforma documenta uma definição própria, e nenhuma delas está errada.

| Sistema | Como a documentação define | Frete | Cancelado e devolvido |
|---|---|---|---|
| VTEX, painel de pedidos | "média do valor captado pelos pedidos para o período selecionado" ([VTEX](https://help.vtex.com/pt/docs/tutorials/todos-os-pedidos)) | O valor do pedido no OMS inclui frete, descontos e taxas | Conta o pedido captado |
| VTEX, Performance de Vendas | Quatro métricas: Ticket Médio (Captado), (Aprovado), (Faturado) e (Cancelado) ([VTEX](https://help.vtex.com/pt/docs/tutorials/performance-de-vendas)) | Considera "o valor dos itens" | Depende de qual das quatro |
| GA4, `averagePurchaseRevenue` | "The average purchase revenue in the transaction group of events" ([GA4 Data API](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema)) | Fora: o `value` do `purchase` não deve incluir `shipping` nem `tax` | `purchaseRevenue` desconta reembolso |
| Shopify, *Average order value* | "gross sales (excluding adjustments) - discounts (excluding adjustments) / number of orders" ([Shopify](https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/report-types/default-reports/sales-report)) | Fora (vendas brutas menos desconto) | Ignora ajustes: edição, troca e devolução feitas depois do pedido |

Três detalhes da documentação explicam por que os números se afastam.

**A VTEX diverge dela mesma.** A página de Performance de Vendas avisa que "é provável que existam diferenças entre as métricas de receita e ticket médio registradas no OMS e no Performance de Vendas", porque o painel "considera o valor dos itens, enquanto o OMS também considera os descontos, frete, taxas e promoções sobre o pedido". A mesma página diz que a VTEX busca "apresentar no máximo 5% de divergência" entre os dois ([VTEX](https://help.vtex.com/pt/docs/tutorials/performance-de-vendas)).

**O GA4 parte do `value` que a sua tag mandou.** A referência de eventos manda definir o `value` do evento `purchase` como "the sum of `(price * quantity)` for all items" e diz "Don't include `shipping` or `tax`" ([Google](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)). Se a implementação da loja mandou o total do pedido com frete, o ticket médio do GA4 sobe, e ninguém percebe olhando o relatório. A definição da métrica `transactions` também lista o evento `refund` entre os eventos de transação ([GA4 Data API](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema)).

**A receita que a VTEX fatura não é a receita do financeiro.** Para cobrar a loja, a VTEX considera receita todo pedido aprovado, "incluindo o frete e imposto", e inclui "pedidos cancelados, incluindo aqueles rejeitados por antifraude" ([VTEX](https://help.vtex.com/pt/docs/tutorials/compreenda-o-valor-da-receita-aprovada)). É uma definição correta para a fatura da plataforma e errada para medir quanto a loja recebeu por pedido.

A divergência de receita entre loja e analytics tem post próprio: [VTEX e GA4 não batem](https://precisian.io/blog/pt-BR/posts/vtex-ga4-nao-batem/).

## Quanto o mesmo mês pode variar?

Um exemplo com números sintéticos e redondos, para mostrar a ordem de grandeza. O mês é inventado: a loja capta pedidos, parte deles é cancelada ou nunca é paga, e parte dos faturados volta por devolução.

| Grupo de pedidos (exemplo sintético) | Pedidos | Valor total | Frete incluído |
|---|---|---|---|
| Captados | 1.000 | R$ 300.000 | R$ 30.000 |
| Cancelados ou não pagos | 100 | R$ 45.000 | R$ 3.000 |
| Faturados | 900 | R$ 255.000 | R$ 27.000 |
| Devolvidos depois de faturados | 30 | R$ 9.000 | R$ 900 |

Com esse mesmo mês, cada área faz a conta com a definição dela:

| Quem calcula | Receita (numerador) | Pedidos (denominador) | Ticket médio |
|---|---|---|---|
| Painel da loja, captado com frete | R$ 300.000 | 1.000 captados | R$ 300,00 |
| Analytics, itens sem frete, captado | R$ 270.000 | 1.000 captados | R$ 270,00 |
| Operação, faturado com frete | R$ 255.000 | 900 faturados | R$ 283,33 |
| Comercial, faturado sem frete | R$ 228.000 | 900 faturados | R$ 253,33 |
| Financeiro, faturado sem frete, menos devolução | R$ 219.900 | 900 faturados | R$ 244,33 |

São cinco números para o mesmo mês, todos corretos dentro da própria definição. A primeira linha fica mais de um quinto acima da última. Se o marketing planeja a meta de mídia pelo ticket da primeira linha e o financeiro cobra pela última, a campanha parece rentável no plano, e o plano não bate com o fechamento.

## O que o ticket médio não é?

**Não é receita por cliente.** Um cliente que compra três vezes no mês gera três pedidos. Receita por cliente e recompra entram no LTV, assunto de [LTV/CAC no e-commerce](https://precisian.io/blog/pt-BR/posts/ltv-cac-ecommerce/). O GA4 tem métricas separadas para isso, como `averagePurchaseRevenuePerPayingUser` ([GA4 Data API](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema)).

**Não é margem.** Um ticket médio maior, puxado por frete ou por um produto de margem baixa, pode deixar menos dinheiro por pedido. A conta que responde isso é a [margem de contribuição por pedido](https://precisian.io/blog/pt-BR/posts/margem-de-contribuicao-ecommerce/).

**Não é o pedido típico.** A média é sensível a valor extremo: um pedido corporativo grande no mês sobe o ticket médio sem que o comprador comum tenha mudado. Quando a dúvida é "quanto gasta o cliente normal", a mediana responde melhor.

**Não é o valor que a mídia atribuiu.** A receita que a plataforma de anúncio declara por conversão segue a janela de atribuição dela, e a soma das plataformas pode passar da receita da loja. O mecanismo está em [o que é ROAS](https://precisian.io/blog/pt-BR/posts/o-que-e-roas/).

## Quando isso passa a importar na operação?

Em três situações.

**Quando o ticket médio vira meta.** Meta de aumento de ticket, bônus de time comercial, teto de custo por pedido na mídia. Se a definição não está escrita, quem bate a meta é quem escolheu a definição mais favorável.

**Quando há marketplace.** O pedido do Mercado Livre e o da loja própria têm frete, comissão e cancelamento com regras diferentes, e somar os dois num ticket só mistura canais com economia distinta. A deduplicação entre canais também tem limite, descrito em [deduplicar venda entre site e marketplace](https://precisian.io/blog/pt-BR/posts/deduplicar-venda-site-marketplace/).

**Quando uma IA vai responder a pergunta.** Um agente que lê o OMS e outro que lê o GA4 devolvem tickets diferentes para "qual foi o ticket médio de outubro?", ambos com fluência. Sem a definição registrada, nenhum dos dois sabe que existe outra.

## Como fazer todas as áreas chegarem no mesmo número?

Escrevendo a definição uma vez e fazendo todas as áreas consultarem a mesma fonte.

1. **Escolha o estado do pedido.** Para meta comercial, faturado costuma ser o mais defensável, porque é o que vira nota.
2. **Declare o numerador.** Com ou sem frete, com ou sem devolução, e em que prazo a devolução volta para o mês.
3. **Declare a data.** Data do pedido ou do faturamento, e o fuso.
4. **Dê nome às variantes.** "Ticket médio captado" e "ticket médio faturado" podem conviver, desde que ninguém chame os dois só de "ticket médio".
5. **Versione.** Quando a regra muda, os meses antigos precisam ser recalculados ou marcados.

Esse lugar onde a definição mora é a [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/). É o que a Precisian entrega sobre um data lake isolado por cliente, na infraestrutura da Precisian, acessado pela API, pelo servidor MCP ou pelo BI do seu time. O problema de fundo, o de marketing e financeiro com receitas diferentes, está em [marketing e financeiro nunca fecham o mesmo número de receita](https://precisian.io/blog/pt-BR/posts/mesma-definicao-de-receita/).

## O que este artigo não cobre?

Não traz ticket médio de referência por segmento: não encontrei fonte primária com metodologia aberta para o e-commerce brasileiro. Não trata de táticas para aumentar o ticket. E as definições citadas são as da documentação de VTEX, Google e Shopify na data de publicação; painéis mudam, então confira a página antes de usar.

---

Se o ticket médio da sua operação muda conforme quem apresenta, o primeiro passo é pôr lado a lado o número do OMS, o do GA4 e o do financeiro para o mesmo mês e anotar qual escolha separa cada um. [Veja a pergunta deste post respondida sobre um lake de verdade](https://precisian.io/demonstracao?utm_source=blog&utm_medium=cta&utm_campaign=ticket-medio-ecommerce&utm_content=texto), sem compromisso de contrato.
