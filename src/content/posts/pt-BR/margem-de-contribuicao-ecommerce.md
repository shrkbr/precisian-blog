---
title: "Margem de contribuição no e-commerce: como calcular por pedido e por canal"
description: "Margem de contribuição é a receita do pedido menos CMV, frete, comissão, taxa de pagamento, imposto e mídia. Cada parcela vem de um sistema diferente."
slug: "margem-de-contribuicao-ecommerce"
lang: "pt-BR"
translationKey: "margem-de-contribuicao-ecommerce"
publishedAt: 2026-11-11
tags: ["ecommerce", "marketplace", "divergencia-de-dados", "camada-semantica"]
draft: false
llmSummary: "Margem de contribuição por pedido é a receita líquida menos CMV, frete, comissão de marketplace, taxa de pagamento, imposto e mídia. No Mercado Livre a tarifa de venda vai de 10% a 19% (central de ajuda, lida em 11/11/2026) e o valor recebido exclui publicidade e impostos."
citations: ["https://www.mercadolivre.com.br/ajuda/870", "https://www.mercadolivre.com.br/ajuda/44007", "https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp123.htm", "https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc87.htm", "https://developers.mercadolivre.com.br/pt_br/gerenciamento-de-vendas", "https://developer.bling.com.br/referencia"]
about: ["https://pt.wikipedia.org/wiki/Margem_de_contribui%C3%A7%C3%A3o", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
cta: regua
---
Margem de contribuição por pedido é a receita líquida do pedido menos os 6 custos que só existem porque ele aconteceu: custo da mercadoria (CMV), frete pago pelo vendedor, comissão do marketplace, taxa do meio de pagamento, imposto sobre a venda e a mídia que dá para atribuir a ele. A conta é uma subtração. O trabalho está em buscar cada parcela, porque cada uma vem de um sistema diferente: o CMV do ERP, a comissão da API do marketplace, o imposto da nota fiscal, a mídia das plataformas de anúncio.

Um exemplo de como uma parcela só já foge do relatório: no Mercado Livre, a tarifa de venda fica entre 10% e 14% no anúncio Clássico e entre 15% e 19% no Premium, conforme a categoria ([central de ajuda do Mercado Livre](https://www.mercadolivre.com.br/ajuda/870), lida em 11 de novembro de 2026). E o valor que o Mercado Livre mostra como "quanto você recebe" não inclui "custos com publicidade", "custos por operar com o Full" nem impostos, que o vendedor paga "conforme a sua situação fiscal" ([como calculamos quanto você recebe](https://www.mercadolivre.com.br/ajuda/44007)).

> **O repasse do marketplace ainda carrega imposto, CMV, mídia e devolução.** Ele já descontou comissão e frete, e só isso. Quem o trata como margem superestima o canal.

## Qual é o sintoma?

O canal que mais fatura não é o que mais deixa dinheiro, e ninguém consegue mostrar isso pedido a pedido. A pergunta "vale a pena continuar no marketplace X?" vira discussão de opinião, porque o comercial olha faturamento, a mídia olha [ROAS](https://precisian.io/blog/pt-BR/posts/o-que-e-roas/) e o financeiro olha o DRE do mês, que não abre por canal.

Em reunião com operações de e-commerce, ouvimos a frase que resume o sintoma: *"Tem produto que eu acho que eu tô ganhando e eu tô pagando pra trabalhar."*

## O que entra no custo variável de um pedido?

Tudo o que some se o pedido não acontecer. No e-commerce brasileiro, além da receita, são seis custos, e cada um mora num sistema diferente:

<table>
<thead><tr><th>Parcela</th><th>De onde vem</th><th>Campo ou documento</th></tr></thead>
<tbody>
<tr><td>Receita líquida (preço menos desconto, menos cancelamento e devolução)</td><td>Plataforma de loja ou ERP</td><td>Pedido e nota de devolução</td></tr>
<tr><td>CMV</td><td>ERP</td><td>Custo do produto no cadastro ou no estoque</td></tr>
<tr><td>Frete pago pelo vendedor</td><td>Transportadora, gateway de frete ou API do marketplace</td><td>No Mercado Livre, <code>/shipments/{id}/costs</code></td></tr>
<tr><td>Comissão do marketplace</td><td>API do marketplace ou ERP</td><td>No Mercado Livre, <code>sale_fee</code>; no Bling, <code>taxas.taxaComissao</code></td></tr>
<tr><td>Taxa do meio de pagamento</td><td>Adquirente ou gateway</td><td>Extrato de recebíveis</td></tr>
<tr><td>Imposto sobre a venda</td><td>Nota fiscal e regime tributário</td><td>NF-e e apuração</td></tr>
<tr><td>Mídia</td><td>Google Ads, Meta, Product Ads do marketplace</td><td>Gasto por campanha, alocado por regra</td></tr>
</tbody>
</table>

A mídia é diferente dos outros cinco custos: ela é variável por canal, mas só vira custo por pedido com uma regra de alocação. Volto a isso abaixo.

## Por que a conta não fecha quando cada área calcula?

Porque cada parcela tem uma armadilha mecânica, e cada área cai numa diferente.

**Comissão.** A API de pedidos do Mercado Livre devolve a comissão por item em `sale_fee`, calculada "no momento da acreditação do pagamento", mas o frete do vendedor exige outra chamada ([documentação de Orders](https://developers.mercadolivre.com.br/pt_br/gerenciamento-de-vendas)). Detalhei os recursos em [o que a API do Mercado Livre devolve](https://precisian.io/blog/pt-BR/posts/api-do-mercado-livre-dados-de-venda/). No Bling, a comissão existe no pedido como `taxas.taxaComissao`, mas é gravada por quem cria o pedido; se o hub de marketplace não preenche, o campo fica vazio ([referência da API do Bling](https://developer.bling.com.br/referencia); ver [API do Bling](https://precisian.io/blog/pt-BR/posts/api-do-bling-dados-de-venda/)).

**Imposto.** No Simples Nacional, a alíquota da nota não é a alíquota nominal. A Lei Complementar 123/2006, art. 18, § 1º-A, define a alíquota efetiva como `(RBT12 × Aliq − PD) / RBT12`, em que RBT12 é a receita bruta dos últimos doze meses e PD a parcela a deduzir ([LC 123/2006](https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp123.htm)). No Anexo I, do comércio, a alíquota nominal vai de 4,00% na primeira faixa a 19,00% na sexta. Ou seja, a mesma venda paga um percentual diferente conforme o faturamento acumulado, e o percentual muda todo mês.

**Venda para outro estado.** Em operação para consumidor final em outro estado, a Constituição manda adotar "a alíquota interestadual" e a diferença cabe ao estado de destino ([Emenda Constitucional 87/2015](https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc87.htm)). Como isso se aplica ao seu regime é pergunta para o contador; para a margem, basta saber que o imposto depende do destino, que está no endereço de entrega.

**CMV.** O custo cadastrado no ERP pode ser o custo de reposição, o médio ponderado ou um número digitado há dois anos. São três margens diferentes para o mesmo pedido.

**Mídia.** A plataforma de anúncio entrega gasto por campanha, não por pedido. O Product Ads do Mercado Livre entra como custo do mês, separado da venda, segundo a própria central de ajuda.

**Devolução.** Ela chega semanas depois do pedido e, em geral, em outro documento. No Bling, é uma nota com `finalidade` 4; no Mercado Livre, um recurso de pós-venda. Quem fecha a margem do mês sem esperar a janela de devolução fecha um número que vai mudar.

O resultado é previsível: o comercial calcula sem imposto, a mídia calcula sem CMV, o financeiro calcula certo, mas só no agregado. É o mesmo desenho de [marketing e financeiro sem a mesma receita](https://precisian.io/blog/pt-BR/posts/mesma-definicao-de-receita/), uma linha mais abaixo no DRE.

## Como calcular, na prática, por pedido e por canal?

Por pedido, com tudo que é do pedido; por canal, somando os pedidos e descontando a mídia do canal. Um exemplo com números redondos, sintético, para mostrar a mecânica: dois pedidos de mesmo valor e mesmo produto, um no site próprio e outro no marketplace. Todos os valores e percentuais da tabela são inventados para a conta, não são tarifa de ninguém:

| Parcela (exemplo sintético) | Site próprio | Marketplace |
|---|---|---|
| Receita líquida | R$ 200,00 | R$ 200,00 |
| CMV | − R$ 90,00 | − R$ 90,00 |
| Frete pago pelo vendedor | − R$ 20,00 | − R$ 15,00 |
| Comissão (16%) | — | − R$ 32,00 |
| Taxa de pagamento (4%) | − R$ 8,00 | — |
| Imposto (6% efetivo) | − R$ 12,00 | − R$ 12,00 |
| **Margem antes da mídia** | **R$ 70,00** | **R$ 51,00** |
| Mídia alocada ao pedido | − R$ 25,00 | − R$ 5,00 |
| **Margem de contribuição** | **R$ 45,00 (22,5%)** | **R$ 46,00 (23,0%)** |

No exemplo, o site parece muito melhor antes da mídia e empata depois dela. A decisão de canal muda conforme a linha em que a análise parou, e é por isso que a definição tem de dizer onde parar.

Por canal, some as margens antes da mídia de todos os pedidos do canal no mês e subtraia o gasto de mídia daquele canal. Esse corte dispensa atribuir mídia pedido a pedido, que é a parte frágil. Por pedido, a mídia só entra com uma regra explícita: rateio pelo faturamento do canal, ou atribuição por clique quando o identificador chega até o pedido.

## Como diagnosticar a sua margem atual?

Pegue um mês fechado e responda:

<table>
<thead><tr><th>Verificação</th><th>Onde olhar</th><th>O que indica problema</th></tr></thead>
<tbody>
<tr><td>Comissão por pedido de marketplace</td><td>API do marketplace contra o campo do ERP</td><td>Pedidos com comissão zerada no ERP</td></tr>
<tr><td>Frete: cobrado ou pago?</td><td>Campo de frete do pedido contra a fatura da transportadora</td><td>Frete cobrado do cliente lido como custo, ou o contrário</td></tr>
<tr><td>Alíquota usada</td><td>Planilha de margem contra a apuração do mês</td><td>Alíquota nominal fixa onde deveria haver a efetiva</td></tr>
<tr><td>Origem do CMV</td><td>Cadastro do ERP</td><td>Custo sem data de atualização</td></tr>
<tr><td>Devolução</td><td>Notas de devolução do mês seguinte</td><td>Margem do mês anterior que não foi revista</td></tr>
<tr><td>Mídia do marketplace</td><td>Fatura mensal do marketplace</td><td>Product Ads fora da conta do canal</td></tr>
</tbody>
</table>

Cada linha que acusar problema é uma parcela da margem por canal que hoje circula estimada.

## Como corrigir?

Escreva a definição antes de montar a planilha. "Margem de contribuição" precisa dizer, por escrito: que receita (bruta ou líquida de desconto), que CMV (reposição ou médio), que alíquota (efetiva do mês ou de referência), a partir de quantos dias a devolução é considerada fechada, e como a mídia é alocada. O que quebra a conta é cada área decidir isso sozinha.

Escrita, versionada e consultada sempre do mesmo jeito, essa definição é o que chamamos de [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/). A partir dela, a planilha, o BI e a IA do time respondem o mesmo número.

Depois, ligue cada parcela à sua fonte, por pedido:

1. **Chave do pedido em todos os sistemas.** O número do pedido na loja (`numeroLoja` no Bling, o `id` do pedido no Mercado Livre) é o que liga ERP, marketplace e nota.
2. **Comissão e frete da fonte primária**, a API do marketplace, não o campo copiado no ERP.
3. **Imposto pela nota**, quando a nota destaca o valor, ou pela alíquota efetiva do mês.
4. **Devolução com janela**: recalcule a margem do mês anterior quando a janela de devolução fechar.

## Quando não dá para calcular?

**CMV que ninguém mantém.** Sem custo atualizado no ERP, a margem herda o erro do cadastro. Nenhuma integração conserta isso.

**Mídia por pedido sem identificador de clique.** Se o `gclid` ou o identificador da Meta não chega até o pedido, a mídia por pedido é rateio, não medida. Mostrei onde ele se perde em [gclid](https://precisian.io/blog/pt-BR/posts/gclid/). Por canal, a conta continua possível.

**Venda de marketplace por origem.** A API de pedidos de marketplace não diz de qual anúncio ou busca a venda veio, como descrevi em [marketplace como buraco negro de dados](https://precisian.io/blog/pt-BR/posts/marketplace-buraco-negro-de-dados/). A margem do marketplace existe; a margem por campanha dentro dele, não.

**Custos que o marketplace só cobra no mês.** Armazenagem de fulfillment e publicidade chegam na fatura mensal. Por pedido, só por rateio.

Quando a Precisian não é a resposta: se a operação vende num canal só, e o ERP já fecha margem por pedido com custo atualizado, uma plataforma de dados não resolve nada que já não esteja resolvido. O problema aparece quando os seis custos vêm de cinco sistemas e cada área monta a própria conta, como no [que o ERP devolve de dado de venda](https://precisian.io/blog/pt-BR/posts/o-que-o-erp-devolve-de-dado-de-venda/).

## O que este artigo não cobre?

**Não é orientação tributária.** As alíquotas citadas são as da lei; a sua depende do regime, do estado e do produto. **Não cobre custo fixo nem rateio de estrutura**, que são o passo seguinte, da margem de contribuição para o lucro. **Não traz tarifas da Shopee, da Amazon nem de adquirentes**, que não conferi em fonte oficial para este texto.

Se o canal que mais fatura na sua operação ninguém consegue mostrar se é o que mais deixa dinheiro, o primeiro passo é medir a margem antes da mídia, pedido a pedido, num mês fechado. [Veja a pergunta deste post respondida sobre um lake de verdade](https://precisian.io/demonstracao?utm_source=blog&utm_medium=cta&utm_campaign=margem-de-contribuicao-ecommerce&utm_content=texto), sem compromisso de contrato.
