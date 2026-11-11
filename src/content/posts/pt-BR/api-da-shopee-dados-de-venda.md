---
title: "API da Shopee: o que ela devolve de dado de pedido (e o que não devolve)"
description: "O get_order_detail da Shopee devolve o que o comprador pagou; o que o vendedor recebe, com comissão e frete, está no get_escrow_detail, em outro módulo."
slug: "api-da-shopee-dados-de-venda"
lang: "pt-BR"
translationKey: "api-da-shopee-dados-de-venda"
publishedAt: 2026-11-11
tags: ["marketplace", "integracao", "divergencia-de-dados", "ecommerce"]
draft: false
llmSummary: "Segundo a documentação da Shopee Open Platform (lida em 11/11/2026), v2.order.get_order_detail devolve o valor pago pelo comprador, mas comissão, taxa de serviço e frete do vendedor só aparecem em v2.payment.get_escrow_detail, e a busca de pedidos aceita janelas de no máximo 15 dias."
citations: ["https://open.shopee.com/documents/v2/v2.order.get_order_list?module=94&type=1", "https://open.shopee.com/documents/v2/v2.order.get_order_detail?module=94&type=1", "https://open.shopee.com/documents/v2/v2.payment.get_escrow_detail?module=97&type=1", "https://open.shopee.com/documents/v2/v2.payment.get_escrow_list?module=97&type=1", "https://open.shopee.com/documents/v2/v2.payment.get_income_detail?module=97&type=1", "https://open.shopee.com/documents/v2/v2.returns.get_return_list?module=102&type=1", "https://open.shopee.com/documents/v2/v2.ads.get_all_cpc_ads_daily_performance?module=117&type=1", "https://open.shopee.com/developer-guide/20", "https://open.shopee.com/developer-guide/16"]
about: ["https://pt.wikipedia.org/wiki/Shopee", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 9
cta: regua
---
A API da Shopee devolve o pedido em `v2.order.get_order_detail` com o `total_amount` pago pelo comprador, os itens e o status, mas não devolve quanto o vendedor recebe: comissão (`commission_fee`), taxa de serviço (`service_fee`) e frete pago pelo vendedor (`actual_shipping_fee`) estão em outro módulo, o `v2.payment.get_escrow_detail`. E a busca de pedidos, `v2.order.get_order_list`, aceita janelas de no máximo 15 dias por chamada ([documentação da Shopee Open Platform](https://open.shopee.com/documents/v2/v2.order.get_order_list?module=94&type=1), lida em 11 de novembro de 2026).

Este é o terceiro texto da série sobre o que cada canal de venda devolve pela API. Os dois anteriores trataram do [Mercado Livre](https://precisian.io/blog/pt-BR/posts/api-do-mercado-livre-dados-de-venda/) e dos [ERPs](https://precisian.io/blog/pt-BR/posts/o-que-o-erp-devolve-de-dado-de-venda/). Abaixo, cada nome de campo está como aparece na doc oficial, com o link e a data da última atualização que a página registra.

> **Na Shopee, pedido e dinheiro moram em módulos diferentes.** O módulo Order diz o que o comprador pagou. O módulo Payment diz o que sobra para o vendedor. Quem soma só o primeiro mede faturamento bruto e chama de venda.

## Qual é o sintoma?

O faturamento da Shopee na planilha não fecha com o que cai na carteira do vendedor, e a diferença é maior que a comissão que alguém tem de cabeça. Ou a receita de um mesmo mês muda quando você puxa de novo na semana seguinte, sem ninguém ter mexido na integração.

As duas coisas têm a mesma origem: a integração leu um módulo só, ou leu cedo demais um valor que a própria Shopee avisa que ainda vai mudar.

## O que o get_order_detail devolve?

O endpoint é `GET /api/v2/order/get_order_detail`, servido no Brasil em `openplatform.shopee.com.br`. Ele recebe até 50 pedidos por chamada no parâmetro `order_sn_list` ("limit [1,50]"), e boa parte dos campos de valor só vem se você pedir em `response_optional_fields`. A lista de opcionais inclui `total_amount`, `item_list`, `pay_time`, `cancel_by`, `cancel_reason`, `buyer_cpf_id`, `invoice_data` e `payment_info` ([get_order_detail](https://open.shopee.com/documents/v2/v2.order.get_order_detail?module=94&type=1), atualizada em 22/10/2026).

<table>
<thead><tr><th>Campo</th><th>O que a doc diz</th><th>O que isso significa para o número</th></tr></thead>
<tbody>
<tr><td><code>total_amount</code></td><td>"total amount paid by the buyer", inclui o frete pago pelo comprador e o abatimento de promoções da Shopee</td><td>É o que o comprador pagou, não o que o vendedor recebe. Só vem depois do pagamento</td></tr>
<tr><td><code>item_list[].model_discounted_price</code></td><td>preço depois do desconto</td><td>Em <code>bundle_deal</code>, a doc diz que "will return 0"</td></tr>
<tr><td><code>order_status</code></td><td>status atual, sempre devolvido</td><td><code>UNPAID</code>, <code>READY_TO_SHIP</code>, <code>PROCESSED</code>, <code>SHIPPED</code>, <code>COMPLETED</code>, <code>IN_CANCEL</code>, <code>CANCELLED</code>, <code>INVOICE_PENDING</code></td></tr>
<tr><td><code>update_time</code></td><td>última mudança de valor do pedido</td><td>É a data que pega a mudança de status depois da carga</td></tr>
<tr><td><code>estimated_shipping_fee</code> / <code>actual_shipping_fee</code></td><td>estimativa da Shopee / custo real "if available"</td><td>O real pode não estar confirmado: ver <code>actual_shipping_fee_confirmed</code></td></tr>
<tr><td><code>buyer_cpf_id</code></td><td>CPF do comprador, "Only for Brazil order"</td><td>Chave fiscal do comprador, quando vem</td></tr>
<tr><td><code>payment_info[]</code></td><td>só Brasil: <code>payment_method</code> (cartão, Pix), <code>card_brand</code>, <code>payment_amount</code></td><td>Meio de pagamento por pedido</td></tr>
<tr><td><code>invoice_data</code></td><td><code>number</code>, <code>access_key</code>, <code>total_value</code>, <code>status</code></td><td>Nota fiscal vinculada ao pedido</td></tr>
</tbody>
</table>

Entre os 153 campos de resposta documentados nesse endpoint, nenhum diz de onde veio a venda: não há campo de anúncio, campanha, busca ou clique. É o mesmo desenho que descrevi em [marketplace como buraco negro de dados](https://precisian.io/blog/pt-BR/posts/marketplace-buraco-negro-de-dados/).

## Como a busca de pedidos funciona?

`GET /api/v2/order/get_order_list` devolve só a lista de `order_sn`; o detalhe vem depois, pelo endpoint acima. Os parâmetros obrigatórios são `time_range_field` (`create_time` ou `update_time`), `time_from`, `time_to` e `page_size`, de 1 a 100 ([get_order_list](https://open.shopee.com/documents/v2/v2.order.get_order_list?module=94&type=1), atualizada em 05/11/2026).

Três detalhes da doc pesam na extração:

- **Janela de 15 dias.** "The maximum date range that may be specified with the time_from and time_to fields is 15 days." Passou disso, o erro é `order.order_list_invalid_time` ([get_order_list](https://open.shopee.com/documents/v2/v2.order.get_order_list?module=94&type=1)). Um mês exige pelo menos duas chamadas, e um histórico de um ano, 25 ou mais.
- **Um status por chamada.** O filtro `order_status` aceita "each one only every request".
- **Resultado que pode estar velho.** Em 05/11/2026 a Shopee adicionou o campo `warning` à resposta, e o exemplo publicado traz o texto "System is experiencing high load and search results might be outdated". Integração que não registra esse campo grava lista incompleta sem saber ([registro de mudanças](https://open.shopee.com/documents/v2/v2.order.get_order_list?module=94&type=1)).

A doc não publica até quantos meses para trás a busca alcança. Não repito número de terceiro.

## Onde fica o dinheiro do vendedor?

No módulo Payment. O `GET /api/v2/payment/get_escrow_detail` recebe um `order_sn` e devolve o objeto `order_income`; a versão em lote, `get_escrow_detail_batch`, aceita até 50 pedidos e recomenda de 1 a 20 por chamada ([get_escrow_detail](https://open.shopee.com/documents/v2/v2.payment.get_escrow_detail?module=97&type=1), atualizada em 05/11/2026).

O campo central é `escrow_amount`, "the total amount that the seller is expected to receive for the order". A doc publica a fórmula para loja local, com mais de 40 parcelas. As que mais pesam para um vendedor brasileiro:

<table>
<thead><tr><th>Campo</th><th>Entra como</th><th>O que é</th></tr></thead>
<tbody>
<tr><td><code>original_cost_of_goods_sold</code></td><td>+</td><td>valor pago pelo comprador pelos itens</td></tr>
<tr><td><code>voucher_from_seller</code></td><td>−</td><td>cupom dado pelo vendedor</td></tr>
<tr><td><code>buyer_paid_shipping_fee</code></td><td>+</td><td>frete pago pelo comprador</td></tr>
<tr><td><code>actual_shipping_fee</code></td><td>−</td><td>custo final do frete</td></tr>
<tr><td><code>shopee_shipping_rebate</code></td><td>+</td><td>subsídio de frete da Shopee</td></tr>
<tr><td><code>commission_fee</code></td><td>−</td><td>comissão da plataforma</td></tr>
<tr><td><code>service_fee</code></td><td>−</td><td>serviços adicionais</td></tr>
<tr><td><code>seller_transaction_fee</code></td><td>−</td><td>taxa de transação paga pelo vendedor</td></tr>
<tr><td><code>order_ams_commission_fee</code></td><td>−</td><td>comissão de afiliado</td></tr>
<tr><td><code>pay_per_sale</code></td><td>−</td><td>taxa de anúncio por venda</td></tr>
<tr><td><code>reverse_shipping_fee</code></td><td>−</td><td>frete de devolução</td></tr>
</tbody>
</table>

Para loja brasileira há ainda `net_commission_fee` e `net_service_fee`, "after the proportional rebate deduction", com o detalhamento por regra em `net_commission_fee_info_list`, além de `pix_discount`. A doc também diz que o `escrow_amount` "will change before order is completed", o que explica a receita que muda quando você puxa de novo. O objeto `buyer_payment_info`, por sua vez, é marcado como "initial value (will not be updated after RR/cancellation)": é foto do checkout e não muda com devolução.

Para listar o que já foi liberado, `get_escrow_list` filtra por `release_time_from` e `release_time_to` e devolve `order_sn`, `payout_amount` e `escrow_release_time` ([get_escrow_list](https://open.shopee.com/documents/v2/v2.payment.get_escrow_list?module=97&type=1)). Desde outubro de 2025 existe também o `get_income_detail`, que separa a renda por `income_status` (1 = liberado, 2 = pendente para loja local), com `estimated_escrow_amount` e `released_amount` ([get_income_detail](https://open.shopee.com/documents/v2/v2.payment.get_income_detail?module=97&type=1)).

O pedido registra a venda; o escrow registra o que o vendedor recebe. A [margem de contribuição por pedido](https://precisian.io/blog/pt-BR/posts/margem-de-contribuicao-ecommerce/) só pode ser calculada a partir do segundo.

## E a devolução?

Em um terceiro módulo, Returns. `GET /api/v2/returns/get_return_list` filtra por `create_time_from`/`create_time_to` ou `update_time_from`/`update_time_to`, de novo com janela máxima de 15 dias, e devolve `return_sn`, `refund_amount`, `status`, `reason` e o pedido de origem ([get_return_list](https://open.shopee.com/documents/v2/v2.returns.get_return_list?module=102&type=1), atualizada em 31/08/2026). Em 31/08/2026 a Shopee adicionou `is_partial_quantity_return` e `is_refund_amount_adjusted`, o que confirma que devolução parcial e reembolso ajustado existem e precisam de tratamento próprio.

No pedido, o rastro está nos campos de item `return_requested_qty` e `returned_qty`, e no escrow, em `seller_return_refund` e `return_order_sn_list`.

## E os anúncios da Shopee?

O módulo Ads tem `get_all_cpc_ads_daily_performance`, com `expense`, `direct_gmv`, `broad_gmv`, `direct_roas` e `broad_roas` por dia ([Ads](https://open.shopee.com/documents/v2/v2.ads.get_all_cpc_ads_daily_performance?module=117&type=1)). A doc define o pedido direto como compra feita "within 7 days after clicking on the ads" do próprio item clicado; o amplo conta qualquer item da mesma loja.

O dado é agregado por dia, não por pedido. Somar `broad_gmv` ao faturamento do pedido conta a mesma venda duas vezes, o mesmo erro que descrevi em [ROAS que soma mais que o faturamento](https://precisian.io/blog/pt-BR/posts/roas-soma-maior-que-faturamento/).

## Como diagnosticar na sua integração?

Rode estas checagens num mês fechado:

<table>
<thead><tr><th>Verificação</th><th>Onde olhar</th><th>O que indica divergência</th></tr></thead>
<tbody>
<tr><td>Campos opcionais pedidos</td><td>parâmetro <code>response_optional_fields</code> da carga</td><td><code>total_amount</code> ou <code>item_list</code> vazios no banco</td></tr>
<tr><td>Janelas sem buraco</td><td>log de <code>time_from</code>/<code>time_to</code></td><td>Dias sem pedido entre duas janelas consecutivas</td></tr>
<tr><td>Aviso de carga alta</td><td>campo <code>warning</code> do <code>get_order_list</code></td><td>Lista possivelmente desatualizada aceita como completa</td></tr>
<tr><td>Bruto × líquido</td><td>soma de <code>total_amount</code> × soma de <code>escrow_amount</code></td><td>Relatório chamando de venda o que é faturamento bruto</td></tr>
<tr><td>Escrow congelado cedo</td><td><code>escrow_amount</code> gravado antes de <code>COMPLETED</code></td><td>Receita que não bate com o <code>released_amount</code> do mês</td></tr>
<tr><td>Combo</td><td><code>model_discounted_price = 0</code> com <code>promotion_type = bundle_deal</code></td><td>Item vendido com receita zero no relatório por produto</td></tr>
</tbody>
</table>

## Como corrigir?

Escreva a definição antes da query. "Venda da Shopee" pode ser a soma de `total_amount` dos pedidos `COMPLETED`, ou a soma de `escrow_amount`, ou o `released_amount` que caiu no mês. São três números corretos para três perguntas diferentes: quanto o comprador pagou, quanto você vai receber e quanto já recebeu. O erro é a planilha de marketing usar o primeiro e a do financeiro usar o terceiro. Uma definição escrita, versionada e consultada sempre do mesmo jeito é o que chamamos de [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/).

Na extração, quatro regras tiradas da própria doc:

1. **Puxe por `update_time`, com janelas de no máximo 15 dias e sobreposição.** É o campo que pega o pedido que mudou de status depois da carga ([get_order_list](https://open.shopee.com/documents/v2/v2.order.get_order_list?module=94&type=1)).
2. **Recarregue o escrow até o pedido fechar.** Como o `escrow_amount` muda até `COMPLETED`, grave a versão final, não a primeira.
3. **Peça os campos opcionais explicitamente.** Sem `total_amount` e `item_list` em `response_optional_fields`, a resposta vem sem eles.
4. **Renove o token antes de expirar.** O `access_token` vale 4 horas; o `refresh_token` vale 30 dias e "can only be used once". A autorização da loja dura no máximo 365 dias, e o vendedor pode escolher 7, 30, 90 ou 180 ([guia de autorização](https://open.shopee.com/developer-guide/20)). Quando ela vence, só o vendedor reautoriza; até lá, a carga para.

Os endpoints brasileiros respondem em `openplatform.shopee.com.br`, e a autorização de loja do Brasil usa `open.shopee.com.br/auth`, não o endereço global ([guia de chamadas](https://open.shopee.com/developer-guide/16)).

## Quando isso não tem conserto?

**Origem da venda.** Nenhum campo do pedido liga a venda a um anúncio, busca ou clique. Dá para saber quanto você gastou em Shopee Ads no dia e quanto a Shopee atribui aos anúncios em 7 dias; não dá para dizer qual pedido veio de qual campanha.

**Cliente único entre canais.** O comprador vem como `buyer_user_id` interno da Shopee, e o `buyer_cpf_id` é campo opcional. Cruzar a mesma pessoa entre o site e a Shopee continua frágil, como mostrei em [deduplicar venda entre site e marketplace](https://precisian.io/blog/pt-BR/posts/deduplicar-venda-site-marketplace/).

**Histórico sem data publicada.** A doc limita a janela de cada chamada, mas não diz até quando o passado está disponível. Se o histórico importa, salve-o desde o primeiro dia.

**Autorização vencida.** Se a loja não reautorizar o app, os dados do período sem acesso precisam ser recuperados depois, dentro do que a API ainda devolver.

Quando a Precisian não é a resposta: se você vende só na Shopee e o repasse já fecha com o financeiro, uma plataforma de dados é custo sem problema para resolver. O problema aparece quando a Shopee precisa conversar com a loja própria, o ERP e a mídia. Conectamos qualquer fonte que tenha API aberta.

## O que este artigo não cobre?

**Não cobre o módulo de logística em detalhe** (rastreio e etiqueta), nem o programa de afiliados além da comissão no escrow. **Não traz limite numérico de requisições:** o campo `rate_limit` da documentação desses endpoints aparece vazio, e não repito número de fórum. Se você usa ERP para emitir nota da Shopee, o lado do ERP está em [API do Bling](https://precisian.io/blog/pt-BR/posts/api-do-bling-dados-de-venda/).

Registro de método: as páginas da Shopee Open Platform são renderizadas por JavaScript. Li cada endpoint pelo JSON que alimenta a própria página de documentação e conferi as citações contra a versão renderizada. As datas de atualização citadas são as do registro de mudanças ("Update Log") de cada endpoint, lido em 11 de novembro de 2026.

Se o faturamento da Shopee na sua planilha não fecha com o que caiu na carteira, o primeiro passo é medir a distância entre a soma de `total_amount` e a soma de `escrow_amount` do mesmo mês. [Veja a pergunta deste post respondida sobre um lake de verdade](https://precisian.io/demonstracao?utm_source=blog&utm_medium=cta&utm_campaign=api-da-shopee-dados-de-venda&utm_content=texto), sem compromisso de contrato.
