---
title: "Por que a soma do ROAS passa do seu faturamento"
description: "Nenhuma plataforma desconta a conversão que a concorrente já contou. O mesmo pedido cabe na janela de três delas ao mesmo tempo."
slug: "roas-soma-maior-que-faturamento"
lang: "pt-BR"
translationKey: "roas-vs-actual-revenue"
publishedAt: 2026-10-22
tags: ["roas", "atribuicao", "divergencia-de-dados"]
draft: false
llmSummary: "Nenhuma plataforma de midia deduplica conversao contra a concorrente: cada documentacao de deduplicacao para na fronteira do proprio fornecedor. Em 663 experimentos no Facebook, o metodo nao experimental superou o experimental em ate 12,8 vezes no fundo do funil."
citations: ["https://support.google.com/google-ads/answer/15299024", "https://support.google.com/google-ads/answer/3123169", "https://support.google.com/google-ads/answer/3438531", "https://support.google.com/google-ads/answer/6270625", "https://arxiv.org/abs/2201.07055", "https://www.chicagobooth.edu/review/why-companies-may-be-overpaying-for-web-search-ads"]
about: ["https://pt.wikipedia.org/wiki/Retorno_sobre_investimento", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 9
---

Você abre o Meta, o Google e o TikTok, soma a receita que cada um declara e o total passa do que o ERP fechou no mês. Nada está quebrado. A janela padrão do Google Ads sozinha conta uma compra até 30 dias depois do clique ([Google Ads](https://support.google.com/google-ads/answer/3123169)), e o mesmo pedido cabe dentro da janela de três plataformas ao mesmo tempo.

O Google documenta o comportamento dos concorrentes por escrito: *"Outras plataformas de publicidade recebem crédito integral por um anúncio mesmo quando há outros pontos de contato no caminho de conversão"* ([Google Ads](https://support.google.com/google-ads/answer/15299024)). Ele diz isso apresentando uma coluna feita para imitar esse comportamento.

> **ROAS declarado** é a receita que uma plataforma atribui a si mesma dividida pelo que você gastou nela, calculada pelas regras dela. Não é receita incremental, e nenhuma plataforma afirma que seja.

## Alguma plataforma desconta o que a outra já contou?

Nenhuma, e a ausência é uniforme o bastante para ser uma conclusão, não uma lacuna de pesquisa.

Cada uma deduplica dentro da própria casa. O Google resolve conflito entre clique e visualização dentro do próprio stack ([Campaign Manager 360](https://support.google.com/campaignmanager/answer/2823400)). O Meta deduplica entre o pixel e a API de conversões do mesmo anunciante, casando por identificador e nome do evento ([Meta](https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events/)). O TikTok afirma que a janela dele *"não impacta o relatório do seu MMP"* ([TikTok](https://ads.tiktok.com/help/article/about-the-attribution-window-on-tiktok-ads-manager)).

Toda documentação de deduplicação para na fronteira do próprio fornecedor. Procurando na documentação das três, não encontrei nenhuma afirmação de que qualquer uma remova uma conversão porque a concorrente também a reivindicou. O mecanismo não existe. A sobreposição não é um defeito que alguém esqueceu de corrigir: é o desenho.

## As janelas nem cobrem os mesmos dias

Antes de qualquer modelagem, as plataformas já estão contando intervalos diferentes.

| Plataforma | Janela de clique | Janela de visualização |
|---|---|---|
| Google Ads | **30 dias** por padrão | **1 dia** por padrão |
| Meta | 1, 7 ou 28 dias, em campos separados | 1, 7 ou 28 dias |
| TikTok | 1 ou 7 dias | desligada ou 1 dia |
| GA4 | 30 dias para aquisição, 90 para outros eventos-chave |, |

Fontes: [Google Ads](https://support.google.com/google-ads/answer/3123169), [Meta](https://developers.facebook.com/docs/marketing-api/reference/ads-action-stats/), [TikTok](https://ads.tiktok.com/help/article/about-the-attribution-window-on-tiktok-ads-manager) e [GA4](https://support.google.com/analytics/answer/10597962).

Uma compra 20 dias depois de um clique no Google e 10 dias depois de um clique no Meta cai dentro das duas janelas. As duas contam. Nenhuma está errada pelas próprias regras.

Sobre o padrão atual do Meta, uma ressalva: as páginas de ajuda dele renderizam no navegador e não devolvem corpo legível para leitura automatizada, então não afirmo aqui qual é o default. Os campos de janela acima vêm da documentação para desenvolvedores, que renderiza.

## O que mais infla a conta antes de qualquer modelo?

Três mecânicas documentadas, todas ligadas por padrão.

**O relatório é pela data do clique, não da venda.** O Google afirma que as colunas principais de conversão são *"calculadas com base no horário do clique, não no horário da conversão"* ([Google Ads](https://support.google.com/google-ads/answer/6270625)). O seu fechamento é por data de venda. Os dois relatórios estão descrevendo meses diferentes.

**A contagem padrão multiplica pedidos.** Para conversões de site e importadas, o padrão é "todas as conversões", e a própria documentação do Google ilustra cinco conversões vindas de um cliente num único clique ([Google Ads](https://support.google.com/google-ads/answer/3438531)).

**Parte das conversões é modelada, não observada.** O Google documenta três superfícies de modelagem: jornadas entre dispositivos que *"não podem ser observadas diretamente"*, conversões perdidas por restrição de cookie no navegador, e jornadas em app sem identificador disponível ([Google Ads](https://support.google.com/google-ads/answer/12442973)).

O Meta estreitou uma dessas por conta própria. Em março de 2026 mudou a atribuição por clique para *"incluir exclusivamente cliques em link"*, onde antes compartilhamentos, salvamentos e curtidas contavam, e nomeou o motivo: outras plataformas *"atribuem principalmente a cliques em link do site"*, e a diferença *"pode gerar inconsistência entre o que o anunciante vê no Gerenciador de Anúncios e o que vê em ferramentas de relatório de terceiros"* ([Meta, março de 2026](https://www.facebook.com/business/news/click-attribution)). O Meta não disse que os números dele estavam inflados, e eu também não estou dizendo. Ele estreitou a definição e apontou o desalinhamento como causa.

## No Brasil, o que piora?

Duas coisas que não aparecem em material gringo sobre o assunto.

A primeira é o meio de pagamento. Quando o checkout manda o cliente para fora para pagar e ele volta sem o evento de compra, a venda existe no ERP e não existe no analytics, o que é [um problema de Pix, não de mídia](https://precisian.io/blog/pt-BR/posts/pix-quebra-o-purchase-do-ga4/). O efeito é o oposto da inflação: some receita de um lado enquanto sobra do outro. As duas distorções convivem no mesmo relatório.

A segunda é o marketplace. A venda acontece num domínio que não é seu, e boa parte dos canais [não devolve origem nenhuma](https://precisian.io/blog/pt-BR/posts/marketplace-buraco-negro-de-dados/). Quem soma plataforma com marketplace está somando um número atribuído com um número que ninguém atribuiu.

## Qual é o tamanho da diferença entre atribuído e incremental?

Grande, e a resposta vem de experimento, não de fornecedor.

O estudo com mais poder estatístico comparou experimentos aleatorizados contra os métodos não experimentais que costumam substituí-los. Em **663 experimentos de grande escala no Facebook**, o efeito mediano por etapa de funil foi de 29%, 18% e 5% para topo, meio e fundo. As mesmas campanhas medidas por *double machine learning* deram 83%, 58% e 24%; por pareamento estratificado de escore de propensão, 173%, 176% e 64% ([Gordon, Moakler e Zettelmeyer, *Marketing Science*, 2023](https://arxiv.org/abs/2201.07055)).

No fundo do funil, que é onde compra e ROAS vivem, a estimativa não experimental supera a experimental em algo entre **4,8 e 12,8 vezes**.

O experimento isolado mais conhecido continua sendo o mais limpo. O eBay desligou busca paga em boa parte dos mercados americanos por 60 dias. Em palavras de marca, *"99,5% do tráfego que teria vindo ao site pelos anúncios chegou lá de qualquer forma"*. Fora de marca, os anúncios *"aparentemente aumentaram as compras dessas pessoas em 0,66%, estatisticamente insignificante"* ([Chicago Booth Review](https://www.chicagobooth.edu/review/why-companies-may-be-overpaying-for-web-search-ads), sobre o trabalho de Blake, Nosko e Tadelis publicado na *Econometrica*).

## As plataformas admitem isso?

Não em palavras. Em produto.

Nenhuma delas publica uma frase dizendo que as conversões declaradas superam o resultado incremental, e eu não vou colocar essa frase na boca de ninguém. O argumento é estrutural, e é mais forte por ser estrutural.

O Google define uma métrica separada exatamente para aquilo que o ROAS declarado não é: *"valor de conversão incremental / custo incremental = iROAS"* ([Google Ads](https://support.google.com/google-ads/answer/14102986)). E vende um produto separado, o Conversion Lift, para medir *"o impacto causal dos anúncios"* contra um grupo de controle de *"pessoas que não veem seus anúncios"* ([Google Ads](https://support.google.com/google-ads/answer/12003020)).

Se o ROAS declarado já fosse incremental, nem a métrica nem o produto precisariam existir.

## E o GA4, não resolve?

Dá um quarto número, não um juiz.

O GA4 credita pelas regras dele, e uma delas muda a conta na origem: *"Todos os modelos de atribuição excluem visitas diretas de receber crédito de atribuição, a menos que o caminho até o evento-chave seja composto inteiramente de visitas diretas"* ([GA4](https://support.google.com/analytics/answer/10596866)). Tráfego direto absorve link colado, abertura de app e tudo que perde referenciador, e o GA4 entrega esse crédito ao ponto de contato anterior. É uma escolha de modelagem defensável. Não é uma contagem neutra.

O GA4 também conta algumas impressões, o que contraria o hábito de tratá-lo como a linha de base só de clique: na atribuição baseada em dados, *"uma visualização engajada é contada"* quando o usuário *"assiste a um anúncio por 30 segundos (ou até o fim, se for mais curto)"*.

Então o GA4 vai discordar de toda plataforma, por construção. A discordância é informação sobre os modelos, não prova de que o GA4 está certo.

## O que fazer com o número que você já tem?

Quatro coisas, e nenhuma delas é trocar de fornecedor.

**Pare de somar entre plataformas.** A soma da receita declarada não é um número de portfólio, porque cada parcela conta as outras por desenho. Relatório que soma produz um valor que fornecedor nenhum reivindica.

**Compare contra a fonte de registro, não entre plataformas.** A única conferência externa é o seu ERP. Essa comparação tem um problema de definição próprio, que é [outro assunto](https://precisian.io/blog/pt-BR/posts/vtex-ga4-nao-batem/), mas é o eixo certo.

**Rode um desligamento antes de acreditar em qualquer alegação de incremento.** Campanha de marca merece o teste primeiro: foi ali que o resultado do eBay foi mais extremo.

**Escreva qual número governa qual decisão.** ROAS declarado serve para otimizar dentro de uma plataforma, onde o viés é constante. Não serve para alocar entre plataformas nem para reportar ao financeiro, onde o viés muda por canal.

Esse último item é um problema de definição antes de ser de medição. Torná-lo durável significa a regra morar onde o analista e o agente de IA leem antes de calcular, que é o trabalho de uma [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/).

## O que este artigo não cobre?

Não diz quanto o seu ROAS declarado passa da sua receita, porque nenhuma fonte primária publica esse multiplicador e os números que circulam vêm de quem vende a correção. O tamanho da diferença depende do seu mix de canal.

Três números foram deixados de fora de propósito. Uma redução de retorno muito repetida atribuída ao estudo do eBay, que não aparece no material da universidade e que não consegui confirmar no artigo. A mediana de testes geográficos de um fornecedor, publicada sem metodologia. E um percentual atribuído ao estudo dos 663 experimentos que se revelou **inventado por um extrator automático** lendo o PDF, lembrete útil de que número com citação colada não é número conferido.

Se as suas plataformas declaram mais receita do que o ERP fechou, o primeiro passo é parar de somá-las. [Vale uma conversa sobre o seu caso](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).
