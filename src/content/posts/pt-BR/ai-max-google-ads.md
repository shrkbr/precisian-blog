---
title: "AI Max no Google Ads: o que muda na busca e no relatório de termos"
description: "O AI Max escolhe termo de busca, texto e página de destino e otimiza para a conversão que o Google Ads registra. O pedido faturado fica fora dessa conta."
slug: "ai-max-google-ads"
lang: "pt-BR"
translationKey: "ai-max-for-search"
publishedAt: 2026-11-23
tags: ["roas", "atribuicao", "divergencia-de-dados", "tracking", "ecommerce"]
draft: false
llmSummary: "O AI Max do Google Ads escolhe termo de busca, texto e página de destino em campanhas de pesquisa e exige lance automático baseado em conversão (Ajuda do Google Ads, 23/11/2026). Ele otimiza para a conversão registrada no Google Ads, não para o pedido faturado no ERP."
citations: ["https://support.google.com/google-ads/answer/15910187", "https://support.google.com/google-ads/answer/15909989", "https://support.google.com/google-ads/answer/15913066", "https://support.google.com/google-ads/answer/16470459", "https://support.google.com/google-ads/answer/16450159", "https://support.google.com/google-ads/answer/11461796", "https://support.google.com/google-ads/answer/7686280", "https://support.google.com/google-ads/answer/10029210", "https://developers.google.com/google-ads/api/docs/campaigns/ai-max-for-search-campaigns/ai-max-reporting", "https://blog.google/products/ads-commerce/google-ai-max-for-search-campaigns/", "https://blog.google/products/ads-commerce/dsa-upgrade-to-ai-max-2026/", "https://blog.google/products/ads-commerce/ai-max-new-features/"]
about: ["https://en.wikipedia.org/wiki/Google_Ads", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 10
cta: regua
---
O AI Max é um conjunto de recursos que o Google liga dentro de uma campanha de pesquisa: ele escolhe para quais buscas o anúncio aparece, reescreve o texto e troca a página de destino. Na [Ajuda do Google Ads](https://support.google.com/google-ads/answer/15909989) (lida em 23/11/2026), o Google diz que esses recursos *"exigem estratégias de lances inteligentes baseadas em conversão"*. O sistema otimiza para a conversão que o Google Ads registrou, e o pedido faturado no ERP fica de fora dessa conta.

> **AI Max para campanhas de pesquisa** (na interface em português, "IA Max"): camada de otimização dentro de uma campanha de pesquisa existente, não um tipo novo de campanha. Reúne correspondência de termos de pesquisa, personalização de texto, expansão do URL final, locais de interesse e controles de marca e de URL ([Google](https://support.google.com/google-ads/answer/15910187)).

A Precisian não opera mídia e não recomenda ligar ou desligar o AI Max. Este texto trata do que entra no sistema como sinal e do que você precisa medir antes e depois. Os trechos entre aspas das páginas do Google lidas em inglês estão em tradução minha; os nomes de relatório e de coluna vêm da versão em português da Ajuda.

## Por que o AI Max virou assunto em novembro de 2026?

Porque deixou de ser opcional para muita conta. O Google anunciou o AI Max em 06/05/2025 ([blog do Google](https://blog.google/products/ads-commerce/google-ai-max-for-search-campaigns/)). Em 15/04/2026, publicou que os recursos criados automaticamente e a configuração de correspondência ampla no nível da campanha passam ao AI Max por atualização automática a partir de setembro de 2026, e que a atualização automática das campanhas de anúncios dinâmicos de pesquisa (DSA) começa em fevereiro de 2027 ([blog do Google, atualizado em 11/06/2026](https://blog.google/products/ads-commerce/dsa-upgrade-to-ai-max-2026/)).

Campanha de pesquisa nova já nasce com o AI Max marcado: *"Novas campanhas de pesquisa têm o recurso AI Max ativado por padrão"* ([Google](https://support.google.com/google-ads/answer/15909989)). Quem não mexeu em nada pode estar rodando com ele.

## O que o AI Max muda, recurso por recurso?

O sistema passa a decidir o que antes era escolha do anunciante. A tabela resume a [documentação do Google](https://support.google.com/google-ads/answer/15910187), lida em 23/11/2026.

| Recurso | O que o Google documenta | Nível | Onde aparece no relatório |
|---|---|---|---|
| Correspondência de termos de pesquisa | Usa correspondência ampla e tecnologia sem palavra-chave, baseada em recurso e página de destino | Grupo de anúncios, ligado por padrão | Relatório de termos de pesquisa, tipo de correspondência "IA Max" e coluna "Fonte" |
| Personalização de texto | Gera títulos e descrições a partir dos anúncios, da página e de IA generativa | Campanha | Relatório de recursos, "IA do Google" na coluna "Adicionado por" |
| Expansão do URL final | Manda o clique para a URL do site que o sistema julga mais relevante; exige a personalização de texto ligada | Campanha | Relatório de páginas de destino, coluna "Selecionado por" |
| Locais de interesse | Alcança pela intenção geográfica, inclusive em correspondência sem palavra-chave | Grupo de anúncios | Visualização própria na API |
| Marca e URL | Inclusão e exclusão de marca; inclusão e exclusão de URL | Campanha e grupo | Configurações do AI Max |

Fontes: [como o AI Max funciona](https://support.google.com/google-ads/answer/15910187) e [relatórios do AI Max](https://support.google.com/google-ads/answer/16470459), Ajuda do Google Ads.

Dois efeitos colaterais estão na própria documentação. Com a expansão do URL final ligada, recursos fixados no anúncio responsivo *"não são usados se uma URL mais relevante for escolhida"*. E a palavra-chave ampla deixa de ser tratada como exata na priorização ([Google](https://support.google.com/google-ads/answer/15910187)).

## Qual é o sintoma no dado da loja?

O sintoma mais visível é o Google Ads mostrar mais conversões enquanto o faturamento não acompanha.

Segundo o próprio Google, anunciantes que ativam o AI Max normalmente veem 14% mais conversões ou valor de conversão com CPA ou ROAS parecidos, e 27% em campanhas que ainda usam majoritariamente correspondência exata e de frase ([blog do Google, 06/05/2025](https://blog.google/products/ads-commerce/google-ai-max-for-search-campaigns/)). É um dado interno do Google, medido na coluna de conversões do próprio Google Ads, e não uma previsão para a sua conta. Ele pode ser verdadeiro e o seu caixa não mudar, por três motivos que descrevo abaixo.

Os outros sintomas aparecem em relatórios diferentes: buscas que ninguém comprou no relatório de termos, páginas de destino que ninguém escolheu (às vezes com erro 404) e títulos que ninguém escreveu.

## Por que a conversão sobe e o faturamento não, mecanicamente?

Primeiro motivo: **o sistema otimiza para a conversão primária, seja ela qual for.** As ações primárias são as *"usadas para lances"*, desde que a meta delas esteja na estratégia ([Google, ações primárias e secundárias](https://support.google.com/google-ads/answer/11461796)). Se a ação primária é o `purchase` disparado na página de confirmação, ela inclui o Pix que expirou e o pedido barrado no antifraude, porque a tag dispara antes de qualquer um desses desfechos. O mecanismo está detalhado no texto sobre [o Pix e o evento de compra do GA4](https://precisian.io/blog/pt-BR/posts/pix-quebra-o-purchase-do-ga4/). O AI Max expande termo, texto e página na direção que gera essa conversão. Se ela vem inflada, a expansão aprende com o número inflado.

Segundo motivo: **conversão que mudou de campanha não é venda nova.** O FAQ do Google diz que, se uma busca é elegível para o AI Max e para a Performance Max, *"o que tiver o maior Ad Rank será veiculado"* ([Google, FAQ do AI Max](https://support.google.com/google-ads/answer/15913066)). A campanha com AI Max pode ganhar conversões que antes caíam em outra campanha da mesma conta. Lida por campanha, a mudança parece crescimento. Lida pela conta inteira, pode ser só redistribuição.

Terceiro motivo: **a página trocada quebra o rastreamento.** O Google avisa que, com modelo de acompanhamento, as URLs dinâmicas da expansão *"às vezes podem levar a páginas de destino quebradas com erro 404"*, e que um modelo com URL estática, sem a tag `{lpurl}`, manda o usuário para a URL estática ([Google](https://support.google.com/google-ads/answer/15910187)). O clique perdido some do relatório de página do GA4, e o gasto continua contando.

Os três somam na mesma direção: ROAS da plataforma subindo. É o padrão descrito em [por que o ROAS das plataformas soma mais que o faturamento](https://precisian.io/blog/pt-BR/posts/roas-soma-maior-que-faturamento/).

## Como diagnosticar o que o AI Max está fazendo na sua conta?

Com cinco conferências. As quatro primeiras ficam dentro do Google Ads.

| Verificação | Onde olhar | O que indica problema |
|---|---|---|
| Buscas novas | Relatório de termos de pesquisa, filtro "Tipo de correspondência" = "IA Max", coluna "Fonte" adicionada | Termo sem relação com o catálogo, ou de marca de concorrente |
| Peso da expansão | Relatório de palavras-chave, linhas "Total: correspondências expandidas da IA Max" e "Total: correspondências de páginas de destino da IA Max" | Fatia grande do gasto sem conversão correspondente no ERP |
| Páginas escolhidas | Relatório de páginas de destino, coluna "Selecionado por" | Página de política, blog ou produto sem estoque recebendo clique |
| O que conta como conversão | Metas, ações de conversão primárias | Mais de uma ação primária de compra, ou ação sem `transaction_id` |
| Pedido real | Pedidos do ERP com `gclid` gravado × conversões do Google Ads, mesmo período | Conversão da plataforma crescendo e pedido faturado parado |

Fonte dos nomes de relatório e de coluna: [relatórios do AI Max](https://support.google.com/google-ads/answer/16470459), lido em 23/11/2026 na versão em português.

Quem extrai pela API tem o mesmo recorte. O campo `segments.search_term_match_source` do recurso `search_term_view` separa `AI_MAX_KEYWORDLESS` e `AI_MAX_BROAD_MATCH` de `ADVERTISER_PROVIDED_KEYWORD`, e a visão `ai_max_search_term_ad_combination_view` devolve `search_term`, `headline` e `landing_page` ([Google Ads API, relatórios do AI Max](https://developers.google.com/google-ads/api/docs/campaigns/ai-max-for-search-campaigns/ai-max-reporting), lida em 23/11/2026):

```sql
SELECT campaign.name, search_term_view.search_term,
  segments.search_term_match_source,
  metrics.clicks, metrics.cost_micros, metrics.conversions
FROM search_term_view
WHERE segments.search_term_match_source IN ('AI_MAX_KEYWORDLESS', 'AI_MAX_BROAD_MATCH')
  AND segments.date DURING LAST_30_DAYS
```

A última linha da tabela depende do `gclid` chegar ao pedido. Se ele morre no cookie do navegador, a conferência não fecha; o [verbete do gclid](https://precisian.io/blog/pt-BR/posts/gclid/) mostra onde ele se perde.

Um exemplo com números redondos, sintético: a campanha passa de 100 para 114 conversões no mês, os 14% do anúncio do Google. Desses 114, o ERP tem 96 pedidos faturados com `gclid` da campanha, e a Performance Max da mesma conta caiu de 60 para 50. Na conta inteira, a mudança foi de 4 conversões, não 14. A pergunta que decide vale para a conta inteira, Performance Max incluída: quantas das 164 conversões viraram pedido faturado, contra quantas das 160 do mês anterior.

## Como corrigir antes de julgar o AI Max?

Corrigindo o sinal primeiro. Se a conversão está errada, qualquer leitura do AI Max herda o erro. Na Meta vale o mesmo raciocínio, porque a entrega aprende com o evento que a loja envia, como mostra [Meta Andromeda e o papel do seu dado](https://precisian.io/blog/pt-BR/posts/meta-andromeda/).

1. **Uma ação primária de compra, com o número do pedido como `transaction_id`.** As outras viram secundárias, que ficam *"apenas para observação"* ([Google](https://support.google.com/google-ads/answer/11461796)).
2. **Ajuste de conversão para o que o ERP cancelou.** O Google aceita `RETRACT` (retirar) e `RESTATE` (corrigir o valor), com prazo de *"até 7 dias"* após o registro para a leitura do lance automático e 54 dias no total ([Google, ajustar conversões](https://support.google.com/google-ads/answer/7686280)). Pedido barrado no antifraude costuma cair dentro dos 7 dias; o que for cancelado depois disso corrige o relatório, não o sinal do lance.
3. **Pedido fora do site importado pelo `gclid`.** O Google aceita conversão com GCLID *"desde que não tenha mais de 90 dias"* e deduplica pela combinação de GCLID, nome e horário da conversão ([Google, FAQ de importação offline](https://support.google.com/google-ads/answer/10029210)).
4. **Teste com grupo de controle.** O experimento do AI Max divide a mesma campanha entre um braço com o AI Max desligado e outro ligado, desviando *"tráfego e orçamento"* dentro da campanha existente ([Google, experimentos do AI Max](https://support.google.com/google-ads/answer/16450159)). Leia o resultado contra o pedido faturado, não só na aba de experimentos.
5. **Modelo de acompanhamento com `{lpurl}`**, testado numa URL expandida antes de ligar a expansão, e exclusão de URL para as páginas que não vendem.

Dois detalhes do FAQ do Google mudam a leitura do dado. A palavra-chave negativa continua valendo: *"as palavras-chave negativas serão respeitadas mesmo com o AI Max ativado"*. E, com lance manual, *"o recurso de correspondência de termos de pesquisa do AI Max não funciona com lances de CPC manual"* ([Google, FAQ do AI Max](https://support.google.com/google-ads/answer/15913066)). Uma conta em CPC manual que liga o AI Max recebe o texto reescrito e a página trocada sem a expansão de busca, e o relatório de termos quase não muda. Desligar o AI Max depois também desativa as exclusões de marca configuradas nele, pelo mesmo FAQ, o que importa se era essa exclusão que mantinha o anúncio longe do nome de um concorrente.

O Google pede ainda que você espere *"pelo menos 2 semanas"* depois de ativar o AI Max antes de mexer, inclusive em palavra-chave negativa ([Google](https://support.google.com/google-ads/answer/16470459)). Essa espera vale para o sistema aprender. A medição do pedido faturado começa no primeiro dia.

## Quando isso não tem conserto pelo Google Ads?

Quando a venda não volta para o Google com um identificador de clique.

Pedido fechado no WhatsApp sem `gclid` gravado, venda em marketplace, compra em loja física e ciclo maior que 90 dias ficam fora da importação offline. Nesses casos, o AI Max otimiza só para a parte da venda que o Google enxerga, e nenhuma configuração da campanha muda isso.

Também não tem conserto pela campanha a pergunta "quanto dessa conversão é venda nova". O Google mede dentro da conta dele. A resposta exige o gasto e a conversão do Google Ads ao lado do pedido do ERP e das outras mídias, com uma definição única de receita, escrita antes da análise numa [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/).

Essa é a parte em que a Precisian trabalha: o dado do Google Ads e o pedido faturado no mesmo lake, isolado por cliente na infraestrutura da Precisian, consultado pela IA, pelo BI ou pela automação que o seu time já usa. Para quem quer só auditar termos e páginas do AI Max, o próprio relatório do Google e o [MCP do Google Ads](https://precisian.io/blog/pt-BR/posts/mcp-do-google-ads/) bastam, e a Precisian não é a resposta certa.

## O que este artigo não cobre?

Não recomenda ligar nem desligar o AI Max, e não estima ganho ou perda. O 14% e o 27% citados são do Google, medidos pelo Google.

Não cobre o AI Max para campanhas do Shopping nem as campanhas de pesquisa para viagens, anunciados em 30/04/2026 ([blog do Google](https://blog.google/products/ads-commerce/ai-max-new-features/)).

Não afirma se há como recusar a atualização automática de fevereiro de 2027: o anúncio do Google não descreve essa opção.

Se a sua campanha ganhou conversões depois do AI Max, o primeiro passo é contar quantas delas o ERP faturou, na conta inteira e não só na campanha. [Veja a pergunta deste post respondida sobre um lake de verdade](https://precisian.io/demonstracao?utm_source=blog&utm_medium=cta&utm_campaign=ai-max-google-ads&utm_content=texto), sem compromisso de contrato.
