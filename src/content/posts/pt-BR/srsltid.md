---
title: "srsltid: o que é esse parâmetro na URL e se atrapalha o GA4"
description: "O srsltid é o parâmetro que o auto-tagging do Merchant Center põe na URL após um clique no Google. Não afeta ranking; duplica páginas no GA4 e no cache."
slug: "srsltid"
lang: "pt-BR"
translationKey: "what-is-srsltid"
publishedAt: 2026-11-23
tags: ["tracking", "ga4", "google-shopping", "ecommerce", "divergencia-de-dados"]
draft: false
llmSummary: "O srsltid é o parâmetro que a codificação automática do Google Merchant Center acrescenta à URL quando alguém clica num produto na Pesquisa Google. Vem ativada por padrão em contas novas e se desliga em Configurações > Geral. O GA4 o classifica como Organic Shopping, segundo a Ajuda do Google."
citations: ["https://support.google.com/merchants/answer/15191080?hl=pt-BR", "https://support.google.com/analytics/answer/11479699", "https://www.seroundtable.com/google-search-srsltid-url-parameters-37875.html", "https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema", "https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls", "https://developers.cloudflare.com/cache/how-to/cache-keys/", "https://support.google.com/google-ads/answer/3095550"]
about: ["https://en.wikipedia.org/wiki/Google_Merchant_Center", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
cta: newsletter
---
O `srsltid` é o parâmetro que a codificação automática (*auto-tagging*) do Google Merchant Center acrescenta à URL quando alguém clica num produto na Pesquisa Google e cai na sua loja, no formato `www.exemplo.com/?srsltid=123xyz` ([Ajuda do Merchant Center](https://support.google.com/merchants/answer/15191080?hl=pt-BR), consultada em 23/11/2026). Serve para medir conversão das listagens gratuitas. Não muda o ranking, mas multiplica a mesma página nos relatórios do GA4 e no cache.

> **srsltid**: parâmetro de URL que o Google Merchant Center adiciona aos links das listagens gratuitas quando a codificação automática está ativa, usado para acompanhar eventos principais (compras, ligações, cadastros) gerados por esses cliques. A codificação automática "fica ativada por padrão nas novas contas" ([Ajuda do Merchant Center](https://support.google.com/merchants/answer/15191080?hl=pt-BR)).

Escrevi este verbete porque o `srsltid` costuma aparecer primeiro como susto: alguém abre o GA4 ou uma ferramenta de SEO, vê a home da loja repetida com um código estranho no fim e conclui que o site foi invadido. Não foi. Toda a documentação citada abaixo foi lida em 23 de novembro de 2026.

## De onde vem o srsltid?

Do Merchant Center, não do Google Ads. A página de ajuda diz que, quando alguém clica num produto na Pesquisa Google que leva à loja on-line, a codificação automática "adiciona outras informações aos URLs e, mais especificamente, um parâmetro chamado srsltid" ([Ajuda do Merchant Center](https://support.google.com/merchants/answer/15191080?hl=pt-BR)). O clique pago tem outro parâmetro: o auto-tagging do Google Ads acrescenta o `gclid` ([Ajuda do Google Ads](https://support.google.com/google-ads/answer/3095550)), assunto do [verbete do gclid](https://precisian.io/blog/pt-BR/posts/gclid/).

Três trechos da mesma documentação explicam o comportamento:

- **É obrigatório para medir.** "A codificação automática é um recurso obrigatório" para avaliar se os cliques nas listagens gratuitas e nas listagens locais gratuitas geram compra, ligação, download de app ou inscrição em newsletter.
- **Não basta sozinho.** "Só a codificação automática não é suficiente para ativar esse acompanhamento." Falta adicionar a origem do evento principal.
- **Alguns sites quebram.** "Uma pequena porcentagem de sites não permite parâmetros arbitrários de URL e exibe uma página de erro" com o recurso ativo. O próprio Google manda desligar, pedir ao desenvolvedor que aceite parâmetros arbitrários e religar.

## Por que o srsltid aparece em URL de blog e da home?

Porque o Google estendeu o parâmetro aos resultados orgânicos comuns, não só à aba Shopping. Em agosto de 2024, John Mueller, do Google, explicou num comentário no LinkedIn que os IDs são acrescentados "diretamente na busca", que "não é uma configuração nova", já usada na aba Shopping, e que o Google o tinha "expandido para os resultados de busca tradicionais" ([Search Engine Roundtable](https://www.seroundtable.com/google-search-srsltid-url-parameters-37875.html), 12/08/2024, que transcreve o comentário em inglês; as citações de Mueller neste post são tradução nossa). Por isso o parâmetro aparece em página que nem é de produto: post de blog, categoria, home.

Na mesma resposta, Mueller afirmou que o `srsltid` "não afeta rastreamento, indexação nem ranking", que as URLs "não são indexadas nem rastreadas" com o parâmetro e que "é basicamente só para analytics de quem vende". Até a data desta consulta, a página de ajuda do Merchant Center não incorporou esse trecho.

## O srsltid atrapalha o GA4?

Atrapalha a leitura, não a coleta. Dois efeitos estão documentados.

**1. A origem do tráfego muda.** Com o Merchant Center vinculado ao GA4 e a codificação automática mantida, os relatórios classificam esse tráfego com plataforma de origem `Shopping Free Listings`, origem `Google`, mídia `Organic` e grupo de canais `Organic Shopping` ([Ajuda do Google Analytics](https://support.google.com/analytics/answer/11479699), consultada em 23/11/2026). Quem acompanhava "busca orgânica" como um bloco único vê parte dele migrar de canal. O Google documenta esse comportamento só para propriedades vinculadas; não descreve o que acontece sem o vínculo.

**2. A mesma página vira várias linhas.** O valor do `srsltid` muda a cada clique. A dimensão `pagePath` do GA4 pega "a parte do URL entre o nome do host e a string de consulta"; já `pagePathPlusQueryString` e `pageLocation` incluem a string de consulta ([esquema da Data API do GA4](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema)). Relatório montado com a dimensão que leva a query string mostra `/produto-x?srsltid=AfmB…` como uma página por clique. Na exportação para o BigQuery, o parâmetro de evento `page_location` traz o mesmo problema para qualquer SQL que agrupe por URL.

A correção no relatório é escolher a dimensão sem query string. Na base, é normalizar a URL removendo o parâmetro antes de agrupar.

## Qual a diferença entre srsltid, gclid, fbclid e UTM?

| | `srsltid` | `gclid` | `fbclid` | UTM |
|---|---|---|---|---|
| Quem cria | Codificação automática do Merchant Center | Auto-tagging do Google Ads | Meta, no clique em anúncio | Você, à mão |
| Onde aparece | Clique orgânico em produto e, desde 2024, em resultado comum da Pesquisa | Clique em anúncio do Google | Clique em anúncio do Facebook e do Instagram | Qualquer link |
| O Google ou a Meta documenta o significado do valor? | Não | Sim: identificador do clique | Sim: ClickID, formato `fbc` | O valor é texto seu |
| Como desligar | Merchant Center > Configurações > Geral > Configuração do evento principal | Configuração de auto-tagging da conta do Google Ads | Não há chave descrita na doc citada | Não usar |
| Efeito no ranking | Nenhum, segundo o Google | Não se aplica (tráfego pago) | Não se aplica | Não se aplica |

Fontes: [Merchant Center](https://support.google.com/merchants/answer/15191080?hl=pt-BR), [Google Ads](https://support.google.com/google-ads/answer/3095550) e o [verbete do fbclid](https://precisian.io/blog/pt-BR/posts/fbclid/), consultados em 23/11/2026. Para padronizar a UTM que você controla, veja [o que é UTM](https://precisian.io/blog/pt-BR/posts/o-que-e-utm/). O vizinho de nome mais confuso, o [gad_source](https://precisian.io/blog/pt-BR/posts/gad-source/), é do Google Ads.

## O srsltid cria conteúdo duplicado ou quebra o cache?

Conteúdo duplicado, para o Google, não. O cache pode sofrer, e o canonical também, se estiver mal montado.

**Canonical.** Mueller disse que, "embora não seja necessário", dá para usar o `rel=canonical` apontando para a URL preferida, como de costume ([Search Engine Roundtable](https://www.seroundtable.com/google-search-srsltid-url-parameters-37875.html)). A documentação do Google sobre URLs duplicadas usa justamente uma URL com parâmetro de rastreamento como exemplo do que não deve ser a canônica: `https://example.com/dresses/cocktail?gclid=ABCD` ([Google Search Central](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)). O risco real está no tema da loja: se o template monta o canonical a partir da URL requisitada, com query string, a tag passa a apontar para a versão com `srsltid`. Vale abrir o código-fonte de uma página aberta pelo Google e conferir.

**Cache.** No Cloudflare, a chave de cache padrão inclui a URI com a string de consulta, e o exemplo da própria documentação é `/logo.jpg?utm_source=newsletter`. O nível de cache *Ignore Query String*, disponível em todos os planos, monta a chave sem a string de consulta; excluir só alguns parâmetros é recurso do plano Enterprise ([Cloudflare Docs](https://developers.cloudflare.com/cache/how-to/cache-keys/), consultada em 23/11/2026). Com a chave padrão, cada clique com `srsltid` novo é uma URL que o CDN nunca viu, e a página volta à origem. Outros CDNs têm configuração equivalente; confira na documentação do seu.

**robots.txt.** Não resolve. Segundo Mueller, as URLs com o parâmetro nem são rastreadas; o `srsltid` é acrescentado na hora do clique.

## O que o srsltid não é?

Não é ataque nem parâmetro de spam. Vem do Merchant Center da própria loja, ou de quem administra a conta dela.

Não é o `gclid`. Não vem de anúncio pago, e o Google não documenta que ele sirva para importar conversão offline.

Não é identificador de pessoa. O Google não documenta o significado do valor, nem prazo de validade, nem se ele pode ser lido por terceiros.

Não é motivo de queda de posição. Se o tráfego orgânico caiu na mesma semana em que o `srsltid` apareceu, a primeira coisa a conferir é se o tráfego só mudou de canal no GA4, de `Organic Search` para `Organic Shopping`.

## Quando isso passa a importar na operação?

Quando relatório de página, teste A/B ou análise de SEO depende de agrupar por URL. Numa loja com catálogo grande, um mesmo produto pode virar uma linha por clique vindo do Google, e quem soma sessões por página no BigQuery ou numa planilha subestima as páginas que recebem clique do Google.

Também importa quando o tráfego de produto pesa na receita e o time compara canais. Se o `Organic Shopping` cresce e a busca orgânica encolhe, alguém precisa saber que o tráfego foi reclassificado antes de mexer em orçamento ou em conteúdo.

A correção que dura é de modelagem: a URL entra no dado já normalizada, sem `srsltid`, e a regra de qual canal recebe o clique fica escrita uma vez. Na Precisian, esse dado fica num lake isolado por cliente, na nossa infraestrutura, e a normalização vira definição versionada na camada semântica, em vez de filtro refeito em cada relatório. Quem também usa o feed para anúncio pago lê, no post sobre [produto que não aparece no Google Shopping](https://precisian.io/blog/pt-BR/posts/produto-nao-aparece-google-shopping/), o que reprova o item antes de qualquer clique.

## O que este artigo não cobre?

Não diz o que o valor do `srsltid` codifica. O Google não publica.

Não confirma a observação da ferramenta de SEO [Oncrawl](https://www.oncrawl.com/technical-seo/srsltid-impacting-google-crawling/) (03/12/2024), repetida pelo [Search Engine Journal](https://www.searchenginejournal.com/googles-srsltid-parameter-appears-in-organic-urls-creating-confusion/549967/) em 25/06/2025, de que *as URLs com `srsltid` deixaram de somar cliques e impressões no Search Console a partir de setembro de 2024 (não confirmado pelo Google)*. O que o Google disse, pela voz de Mueller, é que tenta filtrar o parâmetro dos resultados normais e que o Search Console mostra "principalmente o uso antigo".

Não trata de anúncios do Shopping pagos, que seguem o `gclid`.

Se o GA4 da sua loja mostra a mesma página de produto repetida com `srsltid`, o primeiro passo é trocar a dimensão do relatório e conferir para onde aponta o canonical. O que mudou, o que quebrou e o que a pesquisa da Precisian mediu chega a cada quinze dias, às quintas, na [newsletter da Precisian](https://precisian.io/newsletter?utm_source=blog&utm_medium=cta&utm_campaign=srsltid&utm_content=texto).
