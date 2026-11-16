---
title: "API da Nuvemshop: o que ela devolve de dado de pedido (e o que não devolve)"
description: "O GET /orders da Nuvemshop traz total e payment_status, mas o frete do lojista mora no Fulfillment Order e o reembolso, em /history/values."
slug: "api-da-nuvemshop-dados-de-pedido"
lang: "pt-BR"
translationKey: "api-da-nuvemshop-dados-de-pedido"
publishedAt: 2026-11-16
tags: ["ecommerce", "integracao", "divergencia-de-dados", "pipeline"]
draft: false
llmSummary: "Segundo a documentação da Admin API 2025-03 da Nuvemshop (lida em 16/11/2026), GET /orders devolve total e payment_status, mas o frete pago pelo lojista fica no Fulfillment Order, o reembolso em /orders/{id}/history/values e a consulta para em 10.000 itens."
citations: ["https://nuvemshop.dev/pt-BR/api/getting-started", "https://nuvemshop.dev/pt-BR/api/resources/2025-03/order", "https://nuvemshop.dev/pt-BR/api/resources/2025-03/fulfillment-order", "https://nuvemshop.dev/pt-BR/api/resources/2025-03/transaction", "https://nuvemshop.dev/pt-BR/api/resources/2025-03/webhook", "https://nuvemshop.dev/pt-BR/api/authentication", "https://nuvemshop.dev/pt-BR/api/faq", "https://nuvemshop.dev/pt-BR/api/resources/v1/order", "https://nuvemshop.dev/pt-BR/api/resources/2026-11/CHANGELOG"]
about: ["https://pt.wikipedia.org/wiki/Nuvemshop", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 10
cta: regua
---
A API da Nuvemshop devolve o pedido em `GET /orders` com `total`, `subtotal`, `discount`, `payment_status` e os produtos pelo preço do momento da compra, mas não devolve no pedido o frete que o lojista paga: na versão 2025-03 esse custo mora no Fulfillment Order, em `shipping.merchant_cost`. O reembolso também fica fora: aparece em `GET /orders/{id}/history/values`. E cada consulta para em 10.000 itens ([documentação de Order](https://nuvemshop.dev/pt-BR/api/resources/2025-03/order), atualizada em 27/10/2026 e lida em 16 de novembro de 2026).

Li a documentação da Admin API no portal nuvemshop.dev, versão estável 2025-03. Campo, endpoint e evento estão escritos como na doc, com o link e a data de atualização de cada página.

> **O pedido da Nuvemshop é a fotografia do checkout.** Frete do lojista, reembolso, taxa do meio de pagamento e nota fiscal moram em outros recursos, e alguns nem estão ao alcance de uma integração comum de lojista.

## Qual é o sintoma?

A receita que a sua integração soma não bate com a do painel da Nuvemshop, e as duas parecem certas. Ou bate com o painel e não bate com o extrato do meio de pagamento. Pedido reembolsado continua com o valor cheio no relatório, e a margem por pedido ignora o frete que a loja pagou à transportadora.

Os três vêm do mesmo erro que descrevi na [API do Mercado Livre](https://precisian.io/blog/pt-BR/posts/api-do-mercado-livre-dados-de-venda/): a integração leu um recurso e o tratou como a venda inteira.

## O que o GET /orders devolve, campo por campo?

O pedido responde em `GET https://api.nuvemshop.com.br/2025-03/{store_id}/orders`. A [página de Order](https://nuvemshop.dev/pt-BR/api/resources/2025-03/order) lista estes campos, entre outros:

<table>
<thead><tr><th>Campo</th><th>O que a doc diz</th><th>O que isso significa para o número</th></tr></thead>
<tbody>
<tr><td><code>subtotal</code></td><td>"Preço do pedido antes do envio"</td><td>Valor dos produtos, sem frete</td></tr>
<tr><td><code>total</code></td><td>"Preço total do pedido incluindo envio e descontos"</td><td>Inclui o frete cobrado do comprador</td></tr>
<tr><td><code>discount_coupon</code>, <code>discount_gateway</code></td><td>desconto por cupom; desconto "aplicado pelo gateway de pagamento"</td><td>O desconto de Pix ou boleto vem separado do cupom</td></tr>
<tr><td><code>total_paid_by_customer</code></td><td>"pode não ser o mesmo que o total do Order"</td><td>Muda com edição do pedido</td></tr>
<tr><td><code>payment_status</code></td><td><code>authorized</code>, <code>pending</code>, <code>paid</code>, <code>partially_paid</code>, <code>abandoned</code>, <code>refunded</code>, <code>partially_refunded</code>, <code>voided</code></td><td>Status do dinheiro, separado do status do pedido</td></tr>
<tr><td><code>status</code></td><td><code>open</code>, <code>closed</code>, <code>cancelled</code></td><td><code>closed</code> é pedido arquivado, não venda concluída</td></tr>
<tr><td><code>gateway</code></td><td>provedor de pagamento, ou <code>internal</code> se marcado como pago no Admin</td><td><code>internal</code> é pagamento sem tentativa real registrada</td></tr>
<tr><td><code>storefront</code></td><td><code>store</code>, <code>meli</code>, <code>api</code>, <code>form</code>, <code>pos</code></td><td>Canal de criação do pedido, não origem de tráfego</td></tr>
<tr><td><code>products[].price</code></td><td>"Preço do produto no momento da compra"</td><td>Preço histórico, não o do catálogo hoje</td></tr>
</tbody>
</table>

A [mesma página](https://nuvemshop.dev/pt-BR/api/resources/2025-03/order) traz duas notas que mudam a extração. A mesma variante pode aparecer em linhas diferentes do pedido, porque unidades com campos personalizados diferentes não vêm somadas em `quantity`: quem conta linhas superestima itens. E o `products[].id` "excede os limites do tipo int32", então coluna inteira de 32 bits no banco quebra a importação.

## Onde ficam frete, reembolso e nota fiscal?

Fora do pedido. A tabela é o mapa mínimo para transformar `total` em margem:

<table>
<thead><tr><th>Dado</th><th>Recurso</th><th>Campo</th></tr></thead>
<tbody>
<tr><td>Frete pago pelo lojista</td><td><code>/orders/{order_id}/fulfillment-orders</code></td><td><code>shipping.merchant_cost.value</code></td></tr>
<tr><td>Frete cobrado do comprador</td><td>idem</td><td><code>shipping.consumer_cost.value</code></td></tr>
<tr><td>Reembolso e edição de valor</td><td><code>/orders/{id}/history/values</code></td><td><code>total_paid_diff</code> negativo com <code>status: PAID</code></td></tr>
<tr><td>O que mudou na edição</td><td><code>/orders/{id}/history/editions</code></td><td><code>product_changes</code>, <code>shipping_costs</code></td></tr>
<tr><td>Nota fiscal gravada por outro app</td><td>Metafields do pedido</td><td>lista de NF-e com <code>key</code> e <code>link</code></td></tr>
</tbody>
</table>

**Frete.** A doc de [Fulfillment Order](https://nuvemshop.dev/pt-BR/api/resources/2025-03/fulfillment-order) (atualizada em 08/09/2026) diz que "um pedido agora pode ter múltiplos envios" e publica o de-para: o `order.shipping_cost_owner` da v1 virou `fulfillment_order.shipping.merchant_cost.value`, e o `order.shipping_cost_customer` virou `consumer_cost.value`. Com `aggregates=fulfillment_orders`, a lista de pedidos traz só informação parcial; o detalhe completo exige `GET /orders/{id}` com o mesmo agregado. Integração escrita na v1 e migrada de versão sem rever o frete passa a gravar frete do lojista vazio.

**Reembolso.** A página de Order é direta: "um histórico vazio de valores do pedido não comprova que nenhum reembolso ocorreu", e não se deve tratar `total_paid` ou `total_paid_by_customer` "como um valor líquido garantido após reembolsos". A recomendação oficial é conciliar com os registros do provedor de pagamento. As [perguntas frequentes](https://nuvemshop.dev/pt-BR/api/faq) (atualizadas em 27/10/2026) repetem a regra.

**Nota fiscal.** A página de Order diz: "Atualmente não oferecemos uma API de Invoice". A NF-e entra como Metafield, escrita pelo app que a emite, e o [Webhook](https://nuvemshop.dev/pt-BR/api/resources/2025-03/webhook) não tem evento próprio para isso: a doc manda monitorar `order/updated` e ler os Metafields. Se o seu ERP não grava a nota ali, a API não tem a nota.

## E a taxa do meio de pagamento?

O recurso [Transaction](https://nuvemshop.dev/pt-BR/api/resources/2025-03/transaction) (atualizado em 13/11/2026) tem os campos certos: `captured_amount`, `refunded_amount` e cobranças do tipo `payment_processing_fee`, `cost_per_transaction` e `financing_cost`. Só que a página avisa que "este endpoint é de uso exclusivo de apps de pagamento", e a página de Order acrescenta que, para o Nuvem Pago no Brasil, adicionar `read_payments` a uma integração comum de lojista não dá acesso aos dados nativos do titular ou de risco.

O `payment_details` do pedido traz `method`, `credit_card_company` e `installments`, sem taxa. A taxa sai do extrato do provedor.

## O pedido cancelado e o Pix não pago aparecem?

Aparecem, e com cara de pedido. O [webhook](https://nuvemshop.dev/pt-BR/api/resources/2025-03/webhook) `order/created` é enviado "qualquer que seja o status do pagamento", então o pedido aguardando Pix ou boleto já existe. Se o pagamento expira, o evento é `order/voided`; se o lojista cancela, `order/cancelled`.

O filtro de `GET /orders` tem duas armadilhas. O parâmetro `payment_status` aceita `pending`, `authorized`, `paid`, `abandoned`, `refunded` e `voided`, mas a lista de filtro não inclui `partially_paid` nem `partially_refunded`, que existem como valor do campo. E `status=closed` filtra pedido arquivado, que é outra coisa: um pedido pago e entregue pode estar `open` ou `closed` conforme o lojista arquiva ou não.

É a mesma família de erro do [Pix no evento de compra do GA4](https://precisian.io/blog/pt-BR/posts/pix-quebra-o-purchase-do-ga4/): a compra é registrada antes de o dinheiro existir, e o status que importa muda depois.

## De onde veio a venda?

A API não diz. O `storefront` responde onde o pedido foi criado (`store`, `meli` para pedido importado do Mercado Livre, `api`, `form`, `pos`), e o `client_details` traz `browser_ip` e `user_agent`. Nenhum campo da tabela da 2025-03 traz campanha, UTM ou clique.

A [doc da v1](https://nuvemshop.dev/pt-BR/api/resources/v1/order), versão legada, lista `landing_url`: "URL da página de destino que levou à compra". Esse campo não aparece na tabela nem nos exemplos da 2025-03. Não achei registro de remoção; teste na sua loja antes de depender dele em qualquer versão.

Uma novidade no changelog da [versão 2026-11](https://nuvemshop.dev/pt-BR/api/resources/2026-11/CHANGELOG), ainda *release candidate*: em 03/11/2026 a doc registrou o valor `agentic` no `storefront`, "para pedidos criados por um agente de IA por meio de um protocolo de comércio agêntico (como o UCP)". O próprio changelog avisa que reflete mudanças "na documentação apenas, não na API". Quem já separa `meli` de `store` no relatório vai precisar de uma terceira linha; o contexto está em [comércio agêntico](https://precisian.io/blog/pt-BR/posts/comercio-agentico/).

## Webhook resolve a carga?

Resolve o aviso, não a ordem. A doc de [Webhook](https://nuvemshop.dev/pt-BR/api/resources/2025-03/webhook) diz que não pode "garantir que a ordem em que são enfileiradas para processamento seja a mesma em que são processadas", e que mensagens com o mesmo conteúdo podem chegar mais de uma vez: "é responsabilidade do desenvolvedor" garantir a idempotência.

Os números de entrega estão publicados: timeout de 3 segundos, reenvio imediato e depois em cerca de 5, 10 e 15 minutos, e backoff exponencial "nas próximas 48 horas (até 16 tentativas)". Endpoint fora do ar por mais de dois dias perde eventos. A assinatura vem no cabeçalho `x-linkedstore-hmac-sha256`, calculada com o `client_secret` do app, não com o token da loja.

Todo evento de pedido, exceto `order/created`, também sai como `order/updated`, e reembolso e chargeback só aparecem nele, segundo a tabela de eventos.

## Como diagnosticar na sua integração?

Rode estas checagens num mês fechado:

<table>
<thead><tr><th>Verificação</th><th>Onde olhar</th><th>O que indica divergência</th></tr></thead>
<tbody>
<tr><td>Receita com reembolso</td><td>soma de <code>total_paid_diff</code> negativo em <code>/history/values</code></td><td>Receita bruta tratada como líquida</td></tr>
<tr><td>Frete do lojista</td><td><code>merchant_cost.value</code> por pedido</td><td>Campo vazio desde a migração da v1</td></tr>
<tr><td>Pagamento interno</td><td><code>gateway = internal</code></td><td>Pedido pago sem transação para conciliar</td></tr>
<tr><td>Pedido do Mercado Livre</td><td><code>storefront = meli</code></td><td>Venda contada duas vezes se o marketplace também é carregado direto</td></tr>
<tr><td>Status parcial</td><td><code>partially_paid</code>, <code>partially_refunded</code></td><td>Pedido que nenhum filtro de status pega</td></tr>
<tr><td>Limite de consulta</td><td>erro de limite em consulta de período longo</td><td>Carga histórica que parou sem completar</td></tr>
</tbody>
</table>

Se a sua carga já puxa o Mercado Livre pela API dele, o pedido importado para a Nuvemshop é a mesma venda. Sem chave comum, é o problema de [deduplicar venda entre site e marketplace](https://precisian.io/blog/pt-BR/posts/deduplicar-venda-site-marketplace/).

## Como corrigir?

Escreva a definição antes da query. "Venda da Nuvemshop" pode ser `total` dos pedidos `paid`, ou `subtotal` menos `discount`, ou isso menos `merchant_cost`, menos reembolso, menos a taxa que só o provedor informa. Todos são defensáveis. O erro é cada relatório escolher um sem dizer qual. Uma definição escrita, versionada e consultada sempre do mesmo jeito é o que chamamos de camada semântica, e é o motivo de [marketing e financeiro não fecharem o mesmo número](https://precisian.io/blog/pt-BR/posts/mesma-definicao-de-receita/).

Na extração, regras tiradas da própria documentação:

1. **Puxe por `updated_at_min`, não só por `created_at_min`.** É o que pega o pedido reembolsado ou editado depois de carregado. A FAQ da página de Order recomenda importar por período e, melhor ainda, por webhook.
2. **Quebre a janela antes do teto.** O padrão é 30 itens por página, `per_page` vai até 200 ([primeiros passos](https://nuvemshop.dev/pt-BR/api/getting-started), atualizados em 05/11/2026), e a consulta de pedidos para em 10.000 resultados. Carga histórica por mês, ou por semana em loja grande.
3. **Respeite o balde.** O limite é *leaky bucket* de 40 requisições com vazão de 2 por segundo, multiplicado por 10 nas lojas Next e Evolution, e vale por par de loja e app. Os cabeçalhos `x-rate-limit-remaining` e `x-rate-limit-reset` dizem quanto resta.
4. **Grave o webhook antes de processar.** Responda 2XX em menos de 3 segundos, deduplique pelo conteúdo e reconcilie com uma carga por `updated_at_min` para cobrir o que se perdeu depois de 48 horas.
5. **Trate o `402 Payment Required`.** Com a assinatura da loja vencida, toda chamada responde com ele e os webhooks param ([primeiros passos](https://nuvemshop.dev/pt-BR/api/getting-started)). Os eventos `app/suspended` e `app/resumed` servem de gatilho para ressincronizar.

## Quando isso não tem conserto?

**Origem da venda.** Na versão estável nenhum campo documentado liga o pedido a anúncio ou clique. O `landing_url` da v1 não é garantia de continuidade, e IP com navegador não é atribuição.

**Taxa do meio de pagamento pela Nuvemshop.** Para integração de lojista, o caminho documentado não existe. A taxa vem do provedor.

**Sessões e estatística do painel.** A [página de primeiros passos](https://nuvemshop.dev/pt-BR/api/getting-started) diz que "não há um endpoint REST para as estatísticas agregadas exibidas no Admin da loja nem para sua contagem diária de sessões". Taxa de conversão da loja exige o seu próprio rastreamento.

**Campo fiscal nativo.** NCM, CEST, origem e CST da nota emitida pelo recurso nativo "não são expostos pela Admin API". Quem precisa disso busca no emissor, como no caso dos [ERPs](https://precisian.io/blog/pt-BR/posts/o-que-o-erp-devolve-de-dado-de-venda/).

Quando a Precisian não é a resposta: se você vende só na Nuvemshop, o mês fecha com o financeiro e ninguém pergunta de onde veio a venda, uma plataforma de dados é custo sem problema para resolver. A questão aparece quando a Nuvemshop precisa conversar com o marketplace, o ERP e a mídia, como mostrei também na [API da VTEX](https://precisian.io/blog/pt-BR/posts/api-da-vtex-dados-de-pedido/). Conectamos qualquer fonte que tenha API aberta.

## O que este artigo não cobre?

**Não cobre a Storefront API** nem os apps de pagamento e de envio, que têm guias próprios.

Registro de método: li as páginas em pt-BR do portal nuvemshop.dev com `curl`, em 16 de novembro de 2026. O portal antigo, tiendanube.github.io, avisa que mudou de endereço. As datas citadas são as que cada página exibe no rodapé.

Se a receita da Nuvemshop no seu relatório não fecha com o extrato do meio de pagamento, comece medindo a diferença entre `total` e o que sobra depois de `merchant_cost`, reembolso e taxa. [Veja a pergunta deste post respondida sobre um lake de verdade](https://precisian.io/demonstracao?utm_source=blog&utm_medium=cta&utm_campaign=api-da-nuvemshop-dados-de-pedido&utm_content=texto), sem compromisso de contrato.
