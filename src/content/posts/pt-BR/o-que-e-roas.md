---
title: "O que é ROAS, como calcular e quando ele mente"
description: "ROAS é a receita atribuída à campanha dividida pelo gasto nela. R$ 100 mil sobre R$ 20 mil de mídia dão ROAS 5. Fórmula, ROI, MER e limites."
slug: "o-que-e-roas"
lang: "pt-BR"
translationKey: "roas-definition"
publishedAt: 2026-10-14
tags: ["roas", "atribuicao", "ecommerce", "camada-semantica"]
draft: false
llmSummary: "ROAS é a receita que uma plataforma atribui a uma campanha dividida pelo gasto nela. O Google Ads documenta: R$ 5 em vendas sobre R$ 1 de mídia = 500% de ROAS. ROAS mede receita, não lucro; ROI desconta custo e MER usa a receita total da loja."
citations: ["https://support.google.com/google-ads/answer/6268637?hl=pt-BR", "https://support.google.com/google-ads/answer/6270625?hl=pt-BR", "https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema", "https://developers.facebook.com/documentation/ads-commerce/marketing-api/ad-rules/guides/roas-ad-rules", "https://advertising.amazon.com/library/guides/acos-advertising-cost-of-sales", "https://support.google.com/google-ads/answer/14102986", "https://www.facebook.com/business/news/click-attribution"]
about: ["https://pt.wikipedia.org/wiki/Retorno_sobre_investimento", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
---

ROAS (retorno sobre o investimento em anúncios) é a receita atribuída a uma campanha dividida pelo valor gasto nela. Num exemplo com números redondos, R$ 20.000 de mídia que geram R$ 100.000 de receita atribuída dão ROAS de 5, ou 500%. É a mesma conta que o Google Ads usa para o ROAS desejado: "R$ 5 em vendas ÷ R$ 1 em gastos com publicidade x 100% = 500%" ([Google Ads, Ajuda](https://support.google.com/google-ads/answer/6268637?hl=pt-BR)). O ROAS mede receita, não lucro.

> **ROAS**: receita atribuída a um conjunto de anúncios dividida pelo custo desses anúncios, no mesmo período e pelas regras de atribuição de quem fez a conta. Expresso como múltiplo (5) ou como percentual (500%).

## Como calcular o ROAS, passo a passo?

Três números e uma divisão. O trabalho está em escolher os três números.

1. **Defina o período.** Mês, semana, campanha inteira. O custo e a receita precisam cobrir o mesmo intervalo.
2. **Some o custo de mídia** do conjunto que você quer avaliar: uma campanha, um canal, uma plataforma.
3. **Pegue a receita atribuída** a esse conjunto. Aqui mora a decisão que muda o resultado: atribuída por quem, com qual janela, contando o quê.
4. **Divida a receita pelo custo.** Multiplique por 100 se quiser o percentual. O Google orienta exatamente isso: *"multiplique a métrica de valor de conversão por custo por 100 para chegar ao seu percentual do ROAS desejado"* ([Google Ads](https://support.google.com/google-ads/answer/6268637?hl=pt-BR)).

O mesmo exemplo sintético, linha a linha:

| Item | Valor (exemplo sintético) |
|---|---|
| Custo de mídia no mês | R$ 20.000 |
| Receita atribuída pela plataforma | R$ 100.000 |
| ROAS (múltiplo) | 100.000 ÷ 20.000 = **5** |
| ROAS (percentual) | 5 × 100 = **500%** |
| ACOS, a métrica inversa | 20.000 ÷ 100.000 = **20%** |

A última linha aparece para quem vende no Mercado Livre ou na Amazon, onde o painel costuma falar em ACOS. A Amazon define as duas como espelho uma da outra: o ACOS é *"gasto com anúncio ÷ receita do anúncio x 100"*, e o ROAS *"é o inverso"* ([Amazon Ads](https://advertising.amazon.com/library/guides/acos-advertising-cost-of-sales)). ROAS 5 e ACOS 20% descrevem a mesma campanha.

## De onde vem a receita que entra na conta?

De quem calcula. Cada ferramenta tem um numerador diferente, e é por isso que o mesmo mês produz ROAS diferentes no Google Ads, no Meta e no GA4.

**Google Ads.** A coluna "Valor conv./custo" *"é calculada com a divisão do valor total de conversão pelo custo total de todas as interações de anúncios"* ([Google Ads](https://support.google.com/google-ads/answer/6270625?hl=pt-BR)). O valor de conversão é o que a sua tag manda para o Google, nas regras de contagem e janela da conta.

**Meta.** O valor vem dos eventos de compra do Pixel e do app, e a documentação de regras automáticas avisa que, *"se a janela de atribuição inclui janelas de clique e de visualização, o ROAS calculado é a soma dos valores"* ([Meta for Developers](https://developers.facebook.com/documentation/ads-commerce/marketing-api/ad-rules/guides/roas-ad-rules)). Visualização sem clique entra no numerador.

**GA4.** Na API de relatórios, *"Return On Ad Spend (ROAS) is total revenue divided by advertiser ad cost"*, e a receita total é a soma de compras, assinaturas e receita de anúncios, menos reembolsos ([Google Analytics, Data API](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema)). Outro numerador, com outro modelo de crédito.

A Ajuda do Google Ads diz que o "Valor conv./custo" *"calcula o retorno do investimento"* ([Google Ads](https://support.google.com/google-ads/answer/6270625?hl=pt-BR)). A conta, porém, não desconta custo de produto nem a própria mídia. É ROAS com nome de ROI.

## Qual é a diferença entre ROAS, ROI e MER?

O numerador, o denominador e o que cada um deixa de fora.

| Métrica | Fórmula | De onde vem o numerador | O que ela ignora | Serve para |
|---|---|---|---|---|
| **ROAS** | receita atribuída ÷ gasto com anúncio | A plataforma ou ferramenta que atribuiu a venda, pelas regras dela | Margem, custo do produto, frete, imposto, devolução; venda que aconteceria sem o anúncio | Otimizar dentro de uma plataforma |
| **ROI** | (lucro gerado − investimento) ÷ investimento | Receita convertida em lucro com a margem do produto | Quase nada, se a margem estiver certa; depende de a receita de origem estar certa | Responder ao financeiro se a mídia se paga |
| **MER** | receita total da loja ÷ gasto total de marketing | O fechamento da operação (ERP, plataforma de e-commerce), sem atribuição | Qual canal gerou a venda; venda orgânica e recompra entram junto | Acompanhar a eficiência do conjunto, mês contra mês |

O MER não tem definição oficial. Nenhuma plataforma de mídia nem norma contábil o define, e não encontrei autor reconhecido do termo. É métrica de mercado, também chamada de *blended ROAS*, e cada empresa decide sozinha se a receita é bruta ou líquida e se o gasto inclui só mídia ou também agência, ferramenta e brinde. Por isso o MER de duas empresas quase nunca é comparável. A versão americana deste post trata dele em detalhe: [MER vs ROAS](https://precisian.io/blog/en/posts/mer-vs-roas/) (em inglês).

## Como o mesmo mês dá ROAS 5 e ROI de 50%?

Pela margem. Continuando o exemplo sintético, agora com a margem de contribuição do produto na conta:

| Etapa | Conta (exemplo sintético) | Resultado |
|---|---|---|
| Receita atribuída | dada pela plataforma | R$ 100.000 |
| Lucro de contribuição da venda | 100.000 × 30% | R$ 30.000 |
| ROI | (30.000 − 20.000) ÷ 20.000 | **50%** |
| ROAS de equilíbrio | 1 ÷ 30% | **3,33** |
| ROAS de equilíbrio com margem de 20% | 1 ÷ 20% | **5** |

O ROAS que empata a conta é o inverso da margem de contribuição. Com a margem menor da última linha, o mesmo ROAS 5 que parecia ótimo é exatamente o ponto em que a mídia paga a si mesma e não sobra nada.

Daí a resposta para "qual é um bom ROAS": não existe número universal. Existe o ROAS mínimo da sua margem, e ele muda por categoria de produto. Uma loja que mistura eletrônico de margem baixa com acessório de margem alta tem dois ROAS de equilíbrio dentro da mesma conta de anúncio.

## O que o ROAS não é?

Quatro confusões que vale fixar.

**Não é lucro.** Já está na tabela acima: receita atribuída não desconta nada.

**Não é receita incremental.** O ROAS conta a venda que a plataforma atribuiu a si, inclusive a que aconteceria sem o anúncio. O Google mantém uma métrica separada para o efeito causal, *"valor de conversão incremental / custo incremental = iROAS"* ([Google Ads](https://support.google.com/google-ads/answer/14102986)). Se o ROAS já fosse incremental, ela não precisaria existir.

**Não é somável entre plataformas.** Cada uma atribui pelas próprias regras e nenhuma desconta o que a outra já contou. O mecanismo está explicado em [por que a soma do ROAS passa do seu faturamento](https://precisian.io/blog/pt-BR/posts/roas-soma-maior-que-faturamento/).

**Não é faturamento.** A receita atribuída é registrada na data do clique e com o valor que a tag mandou; o financeiro fecha na data da venda faturada, sem cancelamento. São dois números corretos sobre eventos diferentes, como mostra o post sobre [por que marketing e financeiro não fecham a mesma receita](https://precisian.io/blog/pt-BR/posts/mesma-definicao-de-receita/).

## Quando o ROAS mente?

Quando alguém usa o número fora do lugar em que ele foi calculado. Os modos de falha mais comuns têm post próprio, e aqui fica só o mapa:

- **Somar o ROAS das plataformas** e comparar com o ERP. O total passa do faturamento por desenho ([mecanismo](https://precisian.io/blog/pt-BR/posts/roas-soma-maior-que-faturamento/); versão americana com exemplos de Shopify em [roas-exceeds-actual-revenue](https://precisian.io/blog/en/posts/roas-exceeds-actual-revenue/), em inglês).
- **Pagamento por redirecionamento.** Quando o cliente sai para pagar e não volta, a venda existe no ERP e some do numerador, o que derruba o ROAS sem que nada tenha mudado na mídia ([Pix e o evento de compra do GA4](https://precisian.io/blog/pt-BR/posts/pix-quebra-o-purchase-do-ga4/)).
- **Comparar meses com regras diferentes.** Em março de 2026 o Meta passou a atribuir por clique *"exclusivamente cliques em link"*, onde antes compartilhamento, salvamento e curtida contavam ([Meta, março de 2026](https://www.facebook.com/business/news/click-attribution)). O ROAS de fevereiro e o de abril saíram de numeradores diferentes, e a variação entre eles não é só desempenho.

## Quando escolher ROAS, ROI ou MER na sua operação?

Cada número governa uma decisão diferente, e o erro mais caro é usar um no lugar do outro.

- **ROAS** para otimizar dentro de uma plataforma: qual campanha, qual público, qual lance. Lá o viés da atribuição é constante e a comparação interna funciona.
- **ROI** para a conversa com o financeiro e para definir o ROAS mínimo de cada categoria.
- **MER** para o fechamento do mês: receita do ERP sobre o gasto total, sem discussão de atribuição. Ele não diz qual canal funcionou, mas não pode ser inflado por nenhuma plataforma.

Na prática, as três precisam de definição escrita antes de existir: qual receita (bruta, líquida, faturada), qual data, qual gasto. Quando essa regra mora numa planilha de alguém, o ROAS do relatório de segunda e o do agente de IA de terça saem diferentes. Quando mora numa [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/), todo sistema lê a mesma conta antes de calcular.

## O que este artigo não cobre?

Não diz qual é o ROAS certo para o seu segmento, porque a resposta depende da sua margem e nenhuma fonte primária publica uma referência por categoria no Brasil. Também não compara modelos de atribuição nem mede incrementalidade; esses temas estão nos posts linkados acima. Os valores dos exemplos são sintéticos e servem só para mostrar a aritmética.

---

Se o ROAS que o time comemora não fecha com a margem que o financeiro enxerga, o primeiro passo é escrever qual receita e qual gasto entram em cada conta e medir a distância entre os dois números. [Vale uma conversa sobre o seu caso](https://calendar.notion.so/meet/rodrigomartucci/precisian-io), sem compromisso de contrato.
