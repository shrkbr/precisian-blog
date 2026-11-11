---
title: "API do Mercado Livre: o que ela devolve de dado de venda (e o que não devolve)"
description: "O /orders do Mercado Livre traz a comissão em sale_fee, mas o frete do vendedor exige /shipments/{id}/costs e a devolução vive em outro recurso."
slug: "api-do-mercado-livre-dados-de-venda"
lang: "pt-BR"
translationKey: "api-do-mercado-livre-dados-de-venda"
publishedAt: 2026-11-03
tags: ["marketplace", "integracao", "divergencia-de-dados", "ecommerce"]
draft: false
llmSummary: "Segundo a documentação oficial do Mercado Livre (lida em 03/11/2026), GET /orders devolve a comissão por item em sale_fee, mas o frete do vendedor exige /shipments/{id}/costs, a devolução fica em /post-purchase e os pedidos ficam salvos por até 12 meses."
citations: ["https://developers.mercadolivre.com.br/pt_br/gerenciamento-de-vendas", "https://developers.mercadolivre.com.br/pt_br/gerenciamento-de-envios", "https://developers.mercadolivre.com.br/pt_br/gestao-packs", "https://developers.mercadolivre.com.br/pt_br/gerenciar-devolucoes", "https://developers.mercadolivre.com.br/pt_br/gerenciar-reclamacoes", "https://developers.mercadolivre.com.br/pt_br/faturamento-billing-info", "https://developers.mercadolivre.com.br/pt_br/boas-praticas-para-o-consumo-das-apis-de-relatorios-de-faturamento", "https://developers.mercadolivre.com.br/pt_br/obtendo-nota-fiscal", "https://developers.mercadolivre.com.br/pt_br/autenticacao-e-autorizacao", "https://developers.mercadolivre.com.br/pt_br/rate-limit-erro-429"]
about: ["https://pt.wikipedia.org/wiki/Mercado_Livre", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 10
cta: regua
updatedAt: 2026-11-08
---
A API do Mercado Livre devolve o pedido em `GET /orders/$ORDER_ID` com preço, quantidade e a comissão de cada item no campo `sale_fee`, mas não devolve o custo do frete do vendedor: esse exige uma segunda chamada, a `/shipments/$SHIPMENT_ID/costs`. A devolução fica em outro recurso, o `/post-purchase`, e os pedidos ficam salvos por até 12 meses ([documentação de Orders](https://developers.mercadolivre.com.br/pt_br/gerenciamento-de-vendas), atualizada em 21/09/2026 e lida em 3 de novembro de 2026).

Em dois posts anteriores desta série eu disse que não tinha conseguido ler essa documentação. Desta vez li. Tudo abaixo tem o nome do campo como está na doc, com o link e a data de atualização que a página mostra.

> **A margem da venda não está no pedido.** No Mercado Livre, receita, comissão, frete, desconto e devolução moram em recursos diferentes. Quem soma só o `/orders` mede faturamento bruto e chama de venda.

## Qual é o sintoma?

O relatório de vendas do Mercado Livre não fecha com o repasse, e a diferença não cabe na comissão que alguém tem de cabeça. Ou a contagem de pedidos da integração não bate com a de "vendas" do painel do vendedor, e os dois números parecem certos.

Os dois vêm do mesmo erro: a integração leu um recurso só e o tratou como a venda inteira.

## O que o /orders devolve, campo por campo?

O pedido responde em `GET https://api.mercadolibre.com/orders/$ORDER_ID`. A documentação lista estes campos de resposta, entre outros ([Orders](https://developers.mercadolivre.com.br/pt_br/gerenciamento-de-vendas)):

<table>
<thead><tr><th>Campo</th><th>O que a doc diz</th><th>O que isso significa para o número</th></tr></thead>
<tbody>
<tr><td><code>total_amount</code></td><td>"valor total da order"</td><td>É o valor do produto. Frete do vendedor não entra</td></tr>
<tr><td><code>order_items[].unit_price</code></td><td>preço unitário, "após aplicar os descontos"</td><td>Já é líquido de desconto</td></tr>
<tr><td><code>order_items[].gross_price</code></td><td><code>(unit_price + discounts.full) × quantity</code></td><td>Preço cheio. "Pode não estar presente em pedidos antigos"</td></tr>
<tr><td><code>order_items[].sale_fee</code></td><td>"comissão de vendas"</td><td>Calculada "no momento da acreditação do pagamento"</td></tr>
<tr><td><code>shipping.id</code></td><td>"ID do envio para esta order"</td><td>Só o ID. O custo está em outro recurso</td></tr>
<tr><td><code>buyer.id</code></td><td>informações do comprador</td><td>No exemplo da doc, só o ID numérico</td></tr>
<tr><td><code>context.channel</code></td><td><code>proximity | mp-channel | marketplace</code></td><td>Canal de venda do Mercado Livre, não origem de tráfego</td></tr>
<tr><td><code>cancel_detail</code></td><td><code>group</code>, <code>code</code>, <code>requested_by</code>, <code>date</code></td><td>Quem cancelou e por quê</td></tr>
</tbody>
</table>

Duas notas mudam a extração. A primeira: o recurso pode responder `206 Partial Content`, com o cabeçalho `X-Content-Missing` listando os campos vazios; o exemplo publicado mostra `buyer` e `feedback` faltando. Quem aceita essa resposta sem ler o cabeçalho grava pedido com comprador nulo.

A segunda: `context.channel` não responde "de onde veio a venda". Entre os campos documentados do pedido não há nenhum de origem de tráfego, campanha ou clique. É o mesmo desenho que descrevi em [marketplace como buraco negro de dados](https://precisian.io/blog/pt-BR/posts/marketplace-buraco-negro-de-dados/): o canal entrega volume e não entrega procedência.

## O que precisa de mais de uma chamada?

Quase tudo o que transforma faturamento em margem. A tabela é o mapa mínimo de recursos para fechar uma venda:

<table>
<thead><tr><th>Dado</th><th>Recurso</th><th>Campo</th></tr></thead>
<tbody>
<tr><td>Itens do carrinho</td><td><code>/packs/$PACK_ID</code></td><td>pedidos do pack (relação 1 para N)</td></tr>
<tr><td>Frete pago pelo vendedor</td><td><code>/shipments/$SHIPMENT_ID/costs</code></td><td><code>senders[].cost</code>, <code>gross_amount</code></td></tr>
<tr><td>Envios e devoluções de um pedido</td><td><code>/orders/$ORDER_ID/shipments</code></td><td><code>type</code>: <code>forward</code>, <code>return</code></td></tr>
<tr><td>Descontos e quem os pagou</td><td><code>/orders/$ORDER_ID/discounts</code></td><td><code>amounts.total</code>, <code>amounts.seller</code></td></tr>
<tr><td>Documento fiscal do comprador</td><td><code>/orders/billing-info/{site_id}/{billing_info_id}</code></td><td><code>doc_type</code>, <code>doc_number</code></td></tr>
<tr><td>Devolução e dinheiro</td><td><code>/post-purchase/v2/claims/$CLAIM_ID/returns</code></td><td><code>status_money</code>, <code>refund_at</code></td></tr>
<tr><td>Cobranças do mês</td><td><code>/billing/integration/periods/key/{key}/summary/details</code></td><td><code>charges[].type</code>, <code>amount</code></td></tr>
</tbody>
</table>

**Carrinho.** A [doc de Packs](https://developers.mercadolivre.com.br/pt_br/gestao-packs) (atualizada em 29/12/2025) diz que o pack "torna-se um componente obrigatório em todas as compras, pois todos os pedidos estarão associados a um `pack_id`", com relação de 1 para N entre pack e pedidos. Contar `order_id` conta pedido, não compra. É um bom primeiro suspeito quando a contagem da integração não bate com a do painel.

**Frete.** O recurso [`/shipments/$SHIPMENT_ID/costs`](https://developers.mercadolivre.com.br/pt_br/gerenciamento-de-envios) (atualizado em 18/09/2026) devolve `gross_amount`, descrito como "o custo total do shipment sem nenhum tipo de desconto", e a lista `senders` com "os valores pagos pelo vendedor". A mesma doc avisa que um envio "poderá conter produtos de diferentes vendedores". Para chegar ao total com frete, a doc de Orders publica a fórmula `total_amount_with_shipping = total_amount + taxes.amount + lead_time.cost`, e o `lead_time.cost` só existe em `/shipments`.

**Comprador.** O documento fiscal saiu do pedido. O fluxo atual, segundo a [FAQ de Billing info](https://developers.mercadolivre.com.br/pt_br/faturamento-billing-info) (atualizada em 14/08/2026), é ler `buyer.billing_info.id` no pedido e consultar `/orders/billing-info/{site_id}/{billing_info_id}`; a FAQ registra que o endpoint antigo, `/orders/{order_id}/billing_info`, responde 404. A mesma FAQ avisa que `doc_type` e `doc_number` podem vir nulos enquanto o documento fiscal está em `PROCESSING`, e que o endereço fiscal "pode ser diferente do endereço de entrega", que mora em `/shipments`.

## O pedido cancelado aparece?

Depende de como você pergunta, e a documentação tem uma armadilha de status.

A busca é `GET /orders/search`, que "não realiza nenhuma ação se não é seguido por um filtro". Os filtros incluem `order.status`, `order.date_created.from`, `order.date_closed.from` e `order.date_last_updated.from`. A doc traz dois avisos que pesam na extração ([Orders](https://developers.mercadolivre.com.br/pt_br/gerenciamento-de-vendas)):

- *"os pedidos criados são salvos por até 12 meses e se você pesquisar como vendedor, continuará a filtrar os pedidos cancelados"*;
- o filtro de data *"usa até a hora e descarta a informação dos minutos, segundos e milissegundos"*.

A frase sobre cancelados é ambígua: não deixa claro se o cancelado some do resultado. Teste na sua conta. Se ele some, um pedido que você gravou como pago e foi cancelado depois nunca reaparece na busca para corrigir o seu registro.

A armadilha de status é mais séria. A lista oficial tem `confirmed`, `payment_required`, `payment_in_process`, `partially_paid`, `paid`, `partially_refunded`, `pending_cancel`, `cancelled` e `invalid`. E a doc registra: *"uma order não concretizada pelo vendedor será visualizada como 'Cancelada' por front e por api terá 'status = confirmed'"*. O mesmo valor, `confirmed`, é o status inicial de um pedido ainda não pago. Um filtro que exclui só `cancelled` deixa passar venda que o painel mostra como cancelada.

É a mesma família de erro que vi [no pedido cancelado dos ERPs](https://precisian.io/blog/pt-BR/posts/o-que-o-erp-devolve-de-dado-de-venda/): o cancelado volta pelo mesmo endereço, com cara de venda.

## Onde fica a devolução?

Fora do pedido. A doc de [Devoluções](https://developers.mercadolivre.com.br/pt_br/gerenciar-devolucoes) manda escutar o feed de reclamações, ler `related_entities` em `/claims/$CLAIM_ID` e, se houver `return`, consultar `/post-purchase/v2/claims/$CLAIM_ID/returns`.

Três campos interessam a quem fecha o mês. `status_money` admite `retained` ("dinheiro na conta mas retido"), `refunded` e `available`. `refund_at` diz quando o dinheiro volta ao comprador: `shipped`, `delivered` ("3 dias após o vendedor receber o envio") ou `n/a` para casos *low cost*. O `subtype` separa `return_total`, `return_partial` e `low_cost`.

Para listar as reclamações, a [doc de Reclamações](https://developers.mercadolivre.com.br/pt_br/gerenciar-reclamacoes) documenta `GET /post-purchase/v1/claims/search`, que exige pelo menos um filtro e aceita `stage` (`claim`, `dispute`, `recontact`, `stale`, `none`). No pedido, o rastro é o status `partially_refunded` e o envio do tipo `return` em `/orders/$ORDER_ID/shipments`.

## E as taxas do mês?

Ficam nos relatórios de faturamento, que a própria documentação pede para não usar como fonte de venda. A página de [boas práticas dos relatórios de faturamento](https://developers.mercadolivre.com.br/pt_br/boas-praticas-para-o-consumo-das-apis-de-relatorios-de-faturamento) diz que os recursos são "estritamente destinados a operações de Pós-Venda" e "não devem ser utilizados como fonte de dados primária para gestão de vendas".

O resumo `/billing/integration/periods/key/{key}/summary/details` traz as cobranças por `type`; o exemplo publicado mostra `CV` ("Cobrança por venda"), `CXD` ("Cobrança por Mercado Envios") e `PADS` ("Campanhas de publicidade - Product Ads"). A regra de conciliação está escrita: a soma de `detail_amount` por `detail_sub_type` no detalhe "deve ser igual ao `amount` para o mesmo `type`" no resumo. A chave do período é sempre o primeiro dia do mês, `YYYY-MM-01`.

## Como diagnosticar na sua integração?

Rode estas checagens num mês fechado:

<table>
<thead><tr><th>Verificação</th><th>Onde olhar</th><th>O que indica divergência</th></tr></thead>
<tbody>
<tr><td>Pedidos por pack</td><td><code>pack_id</code> no <code>/orders</code></td><td>Contagem de pedidos maior que a de vendas do painel</td></tr>
<tr><td>Status <code>confirmed</code> antigo</td><td><code>order.status=confirmed</code> com <code>date_created</code> de semanas atrás</td><td>Venda não concretizada contada como pendente ou como venda</td></tr>
<tr><td>Comissão somada</td><td>soma de <code>sale_fee</code> × tipo <code>CV</code> do resumo</td><td>Diferença indica pedido faltando ou estorno de comissão</td></tr>
<tr><td>Frete do vendedor</td><td>soma de <code>senders[].cost</code> × tipo <code>CXD</code></td><td>Frete tratado como zero no relatório</td></tr>
<tr><td>Respostas parciais</td><td>log do cabeçalho <code>X-Content-Missing</code></td><td>Pedidos gravados com comprador nulo</td></tr>
<tr><td>Devolução</td><td><code>status_money</code> em <code>/returns</code></td><td>Receita contada com dinheiro <code>retained</code> ou <code>refunded</code></td></tr>
</tbody>
</table>

## Como corrigir?

Escreva a definição antes de escrever a query. "Venda do Mercado Livre" pode ser `total_amount` dos pedidos `paid`, ou isso menos `sale_fee`, menos `senders[].cost`, menos `amounts.seller` dos descontos, menos o que voltou com `status_money = refunded`. São números diferentes e todos defensáveis. O erro é não ter decidido qual. Uma definição escrita e versionada, consultada sempre do mesmo jeito, é o que chamamos de camada semântica.

Na extração, quatro regras práticas tiradas da própria doc:

1. **Puxe por `order.date_last_updated`, não por data de criação.** É o filtro que pega o pedido que mudou de status depois de carregado. Como a busca descarta minutos, sobreponha a janela em pelo menos uma hora.
2. **Guarde tudo.** Pedido com mais de 12 meses sai do alcance da API, e o histórico passa a existir só se você o salvou.
3. **Renove o token antes de expirar.** A [doc de autenticação](https://developers.mercadolivre.com.br/pt_br/autenticacao-e-autorizacao) informa `expires_in: 21600` (6 horas). O `refresh_token` é "de utilização única" e expira em 6 meses. Rotina noturna que perde o refresh para de carregar em silêncio.
4. **Não paralelize os relatórios de faturamento.** A doc recomenda "uma chamada por seller, uma vez ao dia", paginação por `from_id` (o `offset` para em 10.000) e trata o 429 desses endpoints como "bloqueio preventivo por IP".

O limite geral não tem número publicado: a [FAQ de rate limit](https://developers.mercadolivre.com.br/pt_br/rate-limit-erro-429) (atualizada em 05/05/2026) diz que o controle é "por Client ID (aplicação) na maioria dos casos e por endpoint".

A doc de Orders também avisa que a "vista atual" de `/orders/$ORDER_ID/shipments` "será descontinuada a partir do final de setembro de 2026". A vista nova sempre devolve um *array*; integração que lia um objeto único "falhará automaticamente". Se a sua carga de frete parou em outubro, comece por aí.

## Quando isso não tem conserto?

**Origem da venda.** Nenhum campo documentado do pedido diz de qual anúncio, busca ou campanha a venda veio. Dá para saber quanto você pagou de Product Ads no mês pelo tipo `PADS`; não dá para ligar uma venda específica a um clique pela API de pedidos.

**Cliente único entre canais.** O comprador vem como `buyer.id` interno, e o documento fiscal pode estar nulo. Cruzar a mesma pessoa entre o site e o Mercado Livre continua sem chave confiável, como mostrei em [deduplicar venda entre site e marketplace](https://precisian.io/blog/pt-BR/posts/deduplicar-venda-site-marketplace/).

**Histórico anterior a 12 meses.** Se ninguém salvou, a API de pedidos não devolve mais.

**Nota fiscal emitida fora do Mercado Livre.** Os recursos de nota fiscal (`/users/$USER_ID/invoices/orders/$ORDER_ID` e afins) cobrem operações "que utilizam nosso emissor de notas fiscais", segundo a [doc de notas fiscais](https://developers.mercadolivre.com.br/pt_br/obtendo-nota-fiscal) (atualizada em 19/10/2026). Quem emite pelo próprio ERP busca a nota no ERP.

Quando a Precisian não é a resposta: se você vende só no Mercado Livre e o faturamento mensal já fecha com o financeiro, uma plataforma de dados é custo sem problema para resolver. O problema aparece quando o Mercado Livre precisa conversar com o site, o ERP e a mídia. Conectamos qualquer fonte que tenha API aberta.

## O que este artigo não cobre?

**Não cobre o Mercado Pago.** O dinheiro liberado e a data de liberação são domínio da API do Mercado Pago (`/v1/payments/{id}`, citada na doc de Packs). Não li essa documentação para este texto.

**Não traz limite numérico de requisições.** Não está publicado, e não repito número de fórum.

Registro de método: o portal developers.mercadolivre.com.br responde 403 a `curl` direto, então li cada página por um leitor que renderiza o HTML e conferi os nomes de campo no JSON de exemplo da própria página. As páginas de autenticação, de reclamações e de boas práticas de faturamento não exibiram data de atualização; para elas vale a data da leitura, 3 de novembro de 2026.

Se o faturamento do Mercado Livre na sua planilha não fecha com o repasse, o primeiro passo é medir a diferença entre `total_amount` e o que sobra depois de comissão, frete e devolução. [Veja a pergunta deste post respondida sobre um lake de verdade](https://precisian.io/demonstracao?utm_source=blog&utm_medium=cta&utm_campaign=api-do-mercado-livre-dados-de-venda&utm_content=texto), sem compromisso de contrato.
