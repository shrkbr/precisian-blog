---
title: "gad_source: o que significa na URL do Google Ads (e o gad_source=1)"
description: "gad_source é o parâmetro que o Google Ads põe na URL de todo anúncio para indicar a origem do clique. O Google não publica a tabela de valores."
slug: "gad-source"
lang: "pt-BR"
translationKey: "what-is-gad-source"
publishedAt: 2026-11-23
tags: ["tracking", "atribuicao", "integracao", "ga4"]
draft: false
llmSummary: "gad_source é um parâmetro de URL agregado que o Google acrescenta a toda URL vinda de anúncio para identificar a origem do clique (Pesquisa, Display). Não é personalizável e o Google não documenta o significado de cada valor, como gad_source=1 (Ajuda do Google Ads, lida em 23/11/2026)."
citations: ["https://support.google.com/google-ads/answer/16193746", "https://support.google.com/google-ads/answer/3095550", "https://support.google.com/google-ads/answer/13327296", "https://support.google.com/analytics/answer/16479993", "https://support.google.com/google-ads/answer/16194756", "https://developers.google.com/google-ads/api/docs/conversions/upload-clicks", "https://developers.google.com/data-manager/api/reference/rest/v1/events/ingest", "https://support.google.com/campaignmanager/answer/9182069", "https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema"]
about: ["https://en.wikipedia.org/wiki/Google_Ads", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 9
cta: newsletter
---
O `gad_source` é um parâmetro de URL que o Google acrescenta a toda URL vinda de um anúncio para identificar a origem do clique, como a Pesquisa Google ou a Rede de Display ([Ajuda do Google Ads](https://support.google.com/google-ads/answer/16193746), consultada em 23/11/2026). Ele não identifica pessoa nem clique: é igual para todos os anunciantes com a mesma origem. O Google não publica o que cada valor significa, inclusive o `gad_source=1`.

> **gad_source**: parâmetro de URL agregado "usado para identificar a origem dos URLs dos anúncios e melhorar a precisão da medição de conversões". O parâmetro "não é personalizável", e todos os anunciantes e campanhas com a mesma origem recebem o mesmo valor ([Ajuda do Google Ads: parâmetro gad_source](https://support.google.com/google-ads/answer/13327296) e [parâmetros gad_*](https://support.google.com/google-ads/answer/16193746), consultadas em 23/11/2026).

Escrevi este verbete com as páginas de ajuda do Google abertas, todas lidas em 23 de novembro de 2026. Para quem vende fora do site, o detalhe que mais importa está na página sobre `session_attributes`: desde a versão v19 da Google Ads API, o `gad_source` e o irmão dele, o `gad_campaignid`, entram na importação de conversão offline por esse campo, e o Google os usa quando o `gclid` não existe ([Ajuda do Google Ads](https://support.google.com/google-ads/answer/16194756)).

## O que significa gad_source=1?

Ninguém fora do Google sabe ao certo, porque o Google não documenta. As duas páginas oficiais sobre o parâmetro dizem que ele identifica a origem do tráfego e dão exemplos de origem ("Pesquisa Google, Rede de Display"), mas não trazem nenhuma tabela que ligue número a origem ([Ajuda do Google Ads](https://support.google.com/google-ads/answer/16193746); [Ajuda do Google Analytics](https://support.google.com/analytics/answer/16479993)). O `1` aparece só nos exemplos de URL da própria documentação, como em `example.com/foo?a=b&gad_source=1#xyz`.

*Circulam em blogs e fóruns tabelas que associam cada número a um tipo de campanha. Nenhuma delas tem confirmação do Google, e elas não concordam entre si. Este verbete não reproduz nenhuma.*

O que o Google afirma, e dá para usar:

- **O valor é o mesmo para todos.** "Todos os anunciantes e campanhas com a mesma origem terão o mesmo `gad_source`." Ele não diz nada sobre o seu anúncio em particular.
- **Não dá para personalizar.** Você não escolhe o valor nem o nome.
- **Diferencia maiúsculas de minúsculas.** Nas palavras da página de testes, "o parâmetro 'gad' diferencia maiúsculas de minúsculas e deve aparecer da mesma forma em todas as páginas do site" ([Ajuda do Google Ads](https://support.google.com/google-ads/answer/16193746)).
- **Ele já teve outro nome.** "`&gad_source` anteriormente era o `&gad`." Quem filtra URL por `gad=` em relatório antigo está olhando o mesmo parâmetro.

## O que é gad_campaignid?

É o parâmetro que identifica a campanha do Google que gerou o clique. "Qualquer URL de um anúncio do Google agora tem `&gad_campaignid` no URL final", e "todas as conversões da mesma campanha terão o mesmo `gad_campaignid`" ([Ajuda do Google Ads](https://support.google.com/google-ads/answer/16193746), consultada em 23/11/2026).

Na página sobre `session_attributes`, o Google descreve o valor como "o ID da campanha do Google Ads válido associado ao clique no anúncio", no formato `gad_campaignid=1234567890` ([Ajuda do Google Ads](https://support.google.com/google-ads/answer/16194756)). Na prática, isso quer dizer que a URL de chegada já diz qual campanha pagou a visita, sem consulta nenhuma ao Google Ads, desde que alguém guarde o valor.

## Qual a diferença entre gad_source, gclid, gbraid, wbraid e UTM?

O `gclid` identifica um clique. O `gad_source` e o `gad_campaignid` identificam grupos: uma origem e uma campanha. O Google chama o `gbraid` e os parâmetros `gad_*` de "identificadores agregados" e explica que eles servem para os casos em que o Analytics "não consegue recuperar automaticamente as informações da campanha das plataformas de publicidade do Google usando o GCLID ou DCLID padrão" ([Ajuda do Google Analytics](https://support.google.com/analytics/answer/16479993)).

| | `gclid` | `gbraid` / `wbraid` | `gad_source` | `gad_campaignid` | UTM |
|---|---|---|---|---|---|
| Quem cria | Auto-tagging do Google Ads | Google Ads, cliques em iOS 14 ou posterior | Google, em toda URL de anúncio | Google, em toda URL de anúncio | Você, à mão |
| Identifica | Um clique (às vezes, uma impressão) | Dado de campanha, sem vínculo a usuário (descrição do Google para o `gbraid`) | A origem do tráfego | A campanha | O que você escrever |
| Único por pessoa ou clique | Sim | Não | Não | Não | Não |
| Valor documentado | Não se aplica (é um ID) | Não se aplica | **Não**: o Google não publica a tabela | Sim: é o ID da campanha | Sim: é o seu texto |
| Entra na importação offline | Campo `gclid` | Campos `gbraid` e `wbraid` | Dentro de `session_attributes` | Dentro de `session_attributes` | Não |

Fontes: [Ajuda do Google Analytics](https://support.google.com/analytics/answer/16479993) (o `gbraid` "mede os dados da campanha de forma não exclusiva"), [Ajuda do Google Ads sobre `session_attributes`](https://support.google.com/google-ads/answer/16194756), [Ajuda do Google Ads sobre auto-tagging](https://support.google.com/google-ads/answer/3095550) (o `gclid` "às vezes" é criado na impressão) e o [verbete do `gclid`](https://precisian.io/blog/pt-BR/posts/gclid/), que detalha o identificador de clique. Todas consultadas em 23/11/2026.

O `gad_source` também não substitui a UTM. A UTM carrega nomes que você escolheu, e a convenção de nomes continua sendo trabalho seu (o post sobre [o que é UTM](https://precisian.io/blog/pt-BR/posts/o-que-e-utm/) trata disso). O `gad_source` carrega um número que só o Google sabe ler.

## Onde o gad_source aparece no GA4?

Na URL completa, e só nela. A API de dados do GA4 define três dimensões de página. A `pageLocation` guarda protocolo, domínio, caminho e *query string*. A `pagePathPlusQueryString` guarda o caminho com a *query string*. A `pagePath` guarda só o trecho entre o domínio e a *query string* ([GA4 Data API](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema), consultada em 23/11/2026).

A consequência prática: num relatório por `pagePath`, a página de produto aparece uma vez só. Por `pageLocation`, cada combinação de `gad_source`, `gad_campaignid` e `gclid` vira uma linha separada, e a mesma página de destino se espalha por dezenas de linhas. Quem exporta o GA4 para planilha e agrupa por URL completa conta a mesma página várias vezes. O verbete do [`srsltid`](https://precisian.io/blog/pt-BR/posts/srsltid/) descreve o mesmo efeito com o parâmetro do Merchant Center.

O Google pede para não mexer: "Para ter a atribuição e a medição mais precisas, não remova nem bloqueie os identificadores agregados do URL da página de destino" ([Ajuda do Google Analytics](https://support.google.com/analytics/answer/16479993)). Limpe a URL no relatório, nunca no site.

## Onde o gad_source se perde?

Em dois lugares, os dois documentados pelo Google.

**1. No redirecionamento.** "Caso seu site tenha redirecionamentos, é importante manter o parâmetro de URL `gad_*` nesses redirecionamentos", porque as tags do Google Ads e do Analytics esperam encontrá-lo como parâmetro de nível superior na página onde carregam. O Google também avisa que "alguns sites não permitem parâmetros de URL arbitrários e apresentam uma página de erro" ([Ajuda do Google Ads](https://support.google.com/google-ads/answer/16193746)).

O teste que o Google descreve leva dois minutos. Abra **Campanhas → Insights e relatórios → Páginas de destino**, copie uma URL, acrescente `?gad_source=1` (ou `&gad_source=1`, se já houver `?`) e carregue a página. Se o parâmetro sumiu da barra de endereço ou a página quebrou, o problema está no site, e o mesmo vale para o `gclid`.

**2. Quando a venda fecha fora do site.** Com a tag do Google na página, os parâmetros `gad_*` "são capturados automaticamente com eventos de conversão". Na importação offline, não: "é necessário capturar esses parâmetros de todas as páginas de destino, atribuir às suas conversões e importar para o Google Ads" ([Ajuda do Google Ads](https://support.google.com/google-ads/answer/16193746)). No Brasil, isso pega a venda que começa num formulário e termina no WhatsApp, no boleto, no Pix pago depois, fora da sessão, ou na proposta B2B. Se o formulário guardou só o nome e o telefone, o `gad_campaignid` ficou na URL e morreu ali.

Campanhas do Campaign Manager 360 também recebem o parâmetro: o Google diz que o `gad_source` é acrescentado a todos os rastreadores de clique (`/clk` e `/trackclk`), e que, para tráfego de fora do Google Ads, isso só acontece com a atribuição otimizada ligada ([Ajuda do Campaign Manager 360](https://support.google.com/campaignmanager/answer/9182069)).

## Como o gad_source volta ao Google Ads numa importação offline?

Pelo campo `session_attributes`. O Google lista seis subcampos e recomenda mandar todos, embora só quatro sejam obrigatórios: `gad_source`, `gad_campaignid`, `session_start_time_usec` (início da sessão em microssegundos da época UNIX) e `landing_page_user_agent`. Os opcionais são `landing_page_url` e `landing_page_referrer` ([Ajuda do Google Ads](https://support.google.com/google-ads/answer/16194756), consultada em 23/11/2026).

A mesma página traz um script de página de destino que lê todo parâmetro começado por `gad_`, monta um JSON com os outros campos, codifica em base64 e grava no `localStorage` com a chave `google_session_attributes`. Um campo oculto do formulário leva o valor até o seu CRM. O Google avisa que o código usa `localStorage` e que o consentimento e a retenção de dados do seu site precisam ser respeitados antes de implementar.

Para devolver o dado:

- **Google Ads API:** campo `ClickConversion.session_attributes_encoded` (o texto codificado) ou `ClickConversion.session_attributes_key_value_pairs` (par a par), a partir da v19. Os exemplos de código oficiais avisam, em comentário, que esses campos só valem para contas na lista de permissões e mandam migrar para a Data Manager API ([Google Ads API](https://developers.google.com/google-ads/api/docs/conversions/upload-clicks), atualizada em 13/11/2026).
- **Data Manager API:** campo `sessionAttributes` do objeto `AdIdentifiers`, ao lado de `gclid`, `gbraid` e `wbraid` ([Data Manager API](https://developers.google.com/data-manager/api/reference/rest/v1/events/ingest)). "Todos os novos usuários precisam usar a API Data Manager", diz a página de `session_attributes`.

Duas regras de qualidade vêm do próprio Google. Valores "incorretos ou parciais" de `landing_page_url` "prejudicam a estimativa", então é melhor omitir `landing_page_url` do que mandar um caminho interno. E a mesma conversão não deve subir duas vezes: use um identificador único, como o número do pedido.

## O que o gad_source não é?

Não é identificador de pessoa nem de clique. É um valor compartilhado por todos os anunciantes com a mesma origem.

Não é configuração sua. Você não liga, não desliga e não escolhe o valor.

Não é a resposta para "de qual canal veio essa venda". Ele diz que a visita veio de um anúncio do Google, e o próprio Google atribui a conversão no modelo dele. Meta e TikTok podem estar contando o mesmo pedido, o que explica por que [a soma do ROAS passa do faturamento](https://precisian.io/blog/pt-BR/posts/roas-soma-maior-que-faturamento/).

Não é um parâmetro que o Google documente por completo. As tabelas de valores que circulam por aí vêm de observação de terceiros, sem lastro na documentação do Google.

## Quando isso passa a importar na operação?

Quando o `gclid` falta. O consentimento negado, os cliques em iOS e a venda que fecha longe da página de confirmação são três casos comuns em que o Google passa a depender dos identificadores agregados e da modelagem (o post sobre [consent mode e dado modelado](https://precisian.io/blog/pt-BR/posts/consent-mode-dado-modelado/) mostra o que o Google preenche com estimativa). Nessa situação, ter `gad_source` e `gad_campaignid` gravados com o pedido é a diferença entre uma conversão atribuída à campanha certa e uma conversão sem campanha.

A correção é de modelagem de dado: os parâmetros `gad_*` entram no registro do pedido como colunas, capturados na página de destino, com a grafia original. Na Precisian, esse dado fica num lake isolado por cliente, na nossa infraestrutura, e a regra de qual identificador vale quando vários chegam juntos vira definição versionada na camada semântica, em vez de lógica escondida numa planilha.

## O que este artigo não cobre?

Não diz o que significa cada valor do `gad_source`, porque o Google não publica e nenhuma fonte primária confirma.

Não diz se navegadores com proteção contra rastreamento removem os parâmetros `gad_*` da URL. A documentação do Google não trata disso. O teste é o mesmo do redirecionamento: clicar no próprio anúncio e olhar a URL que chega.

Não trata de outros parâmetros da família `gad_*` além de `gad_source` e `gad_campaignid`, porque as páginas citadas só documentam esses dois.

Se a sua operação compra Google Ads e fecha venda por formulário, WhatsApp ou Pix, o primeiro passo é conferir se o `gad_campaignid` chega até o registro do pedido ou fica esquecido na URL de chegada. O que mudou, o que quebrou e o que a pesquisa da Precisian mediu chega a cada quinze dias, às quintas, na [newsletter da Precisian](https://precisian.io/newsletter?utm_source=blog&utm_medium=cta&utm_campaign=gad-source&utm_content=texto).
