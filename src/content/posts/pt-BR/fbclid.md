---
title: "fbclid: o que é e por que ele não chega até a venda"
description: "O fbclid é o ID do clique em anúncio da Meta. Chega na URL, vira o cookie _fbc no seu domínio e só volta à Meta se for enviado no campo fbc."
slug: "fbclid"
lang: "pt-BR"
translationKey: "what-is-fbclid"
publishedAt: 2026-11-11
tags: ["tracking", "atribuicao", "integracao", "privacidade"]
draft: false
llmSummary: "O fbclid é o ClickID que a Meta acrescenta à URL quando alguém clica num anúncio do Facebook ou do Instagram. O Pixel o grava no cookie _fbc, e a API de Conversões o recebe no campo fbc, no formato fb.1.<timestamp>.<fbclid>, segundo a documentação da Meta (jan/2026)."
citations: ["https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/fbp-and-fbc", "https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters", "https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/server-event", "https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameter-builder-library", "https://developers.facebook.com/docs/meta-pixel/support", "https://www.facebook.com/business/help/471978536642445", "https://webkit.org/tracking-prevention/", "https://webkit.org/blog/15697/", "https://www.mozilla.org/en-US/firefox/102.0/releasenotes/", "https://firefox.settings.services.mozilla.com/v1/buckets/main/collections/query-stripping/records", "https://brave.com/privacy-updates/5-grab-bag/"]
about: ["https://en.wikipedia.org/wiki/Meta_Platforms", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
cta: newsletter
---
O `fbclid` é o identificador de clique (ClickID) que a Meta acrescenta à URL do site quando alguém clica num anúncio do Facebook ou do Instagram, no formato `https://example.com/?fbclid=IwAR2F4-...` ([Meta for Developers](https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/fbp-and-fbc), página atualizada em 9/01/2026 e consultada em 11/11/2026). O Pixel da Meta o grava no cookie `_fbc` do seu domínio. A API de Conversões o recebe de volta no campo `fbc`. Se a venda fecha longe dessa página, alguém precisa guardar o valor com o pedido.

> **fbclid** (Meta ClickID): "um parâmetro gerado pela Meta que é passado com a URL do site de um anunciante quando um usuário clica num anúncio no Facebook e/ou Instagram" ([Meta for Developers](https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/fbp-and-fbc), consultada em 11/11/2026).

Escrevi este verbete com a documentação da Meta aberta ao lado, lida em 11 de novembro de 2026. O nome confunde porque cobre três coisas diferentes. O `fbclid` é o parâmetro na URL. O `_fbc` é o cookie em que ele fica guardado. E o `fbc` é o campo da API de Conversões que carrega o mesmo valor formatado como `fb.1.1554763741205.<fbclid>`.

## Onde o fbclid nasce e onde ele fica guardado?

Nasce no clique, e a Meta o acrescenta sozinha. A documentação chama isso de *auto-attachment* e diz que ele "não afeta outros parâmetros de rastreamento personalizados" que você tenha configurado. A UTM continua chegando junto (o post sobre [o que é UTM](https://precisian.io/blog/pt-BR/posts/o-que-e-utm/) trata da nomenclatura).

Depois do clique, o valor pode ficar em dois lugares, segundo a mesma página:

- **No cookie `_fbc`, gravado pelo Pixel.** Com o Pixel instalado, ele "armazena automaticamente o valor do ClickID no cookie `_fbc`". O cookie é primário, do seu domínio. A opção de cookie primário vem ligada por padrão no Pixel ([Central de Ajuda da Meta](https://www.facebook.com/business/help/471978536642445)).
- **No seu servidor.** Sem Pixel, a Meta manda ler o `fbclid` da query string da requisição HTTP e montar o valor você mesmo. Ela recomenda gravar o `_fbc` como cookie HTTP, na resposta do servidor, "com expiração de 90 dias", ou guardar o valor no seu banco.

O formato tem quatro partes: `fb`, o índice do subdomínio (`1` para `example.com`, no exemplo da Meta, e o valor a usar quando o servidor gera o campo), o horário de criação em milissegundos e o próprio `fbclid`. Quem usa a biblioteca *parameter builder* da Meta recebe um quinto pedaço, um apêndice de 8 caracteres com versão e linguagem do SDK ([parameter builder library](https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameter-builder-library), atualizada em 21/07/2026).

Duas regras da documentação mudam a forma de capturar:

- **Maiúsculas e minúsculas importam.** "O valor do ClickID diferencia maiúsculas de minúsculas: não aplique nenhuma modificação antes de usar." Planilha, CRM ou automação que padroniza texto em minúsculas estraga o identificador.
- **Capture na página de entrada.** A Meta pede para salvar `_fbc` e `_fbp` "o mais cedo possível na jornada", de preferência ao carregar a landing page, e "não apenas em eventos do fundo do funil".

## Qual a diferença entre fbclid, _fbc, fbc e fbp?

| | `fbclid` | `_fbc` | `fbc` | `_fbp` / `fbp` | `gclid` |
|---|---|---|---|---|---|
| O que é | Parâmetro na URL | Cookie no seu domínio | Campo de `user_data` na API de Conversões | Cookie e campo do navegador | Parâmetro na URL do Google Ads |
| Quem cria | A Meta, no clique em anúncio | O Pixel, ou o seu servidor | Você, ao montar o evento | O Pixel, em toda visita | O auto-tagging do Google Ads |
| Identifica | Um clique | O último clique guardado | O clique, formatado | Um navegador, com ou sem anúncio | Um clique (às vezes, uma impressão) |
| Formato | Texto opaco | `fb.1.<ms>.<fbclid>` | `fb.1.<ms>.<fbclid>` | `fb.1.<ms>.<número aleatório>` | Texto opaco |
| Hash antes de enviar | Não se aplica | Não se aplica | Não | Não | Não se aplica |

Fontes: [fbp e fbc](https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/fbp-and-fbc) e [parâmetros de cliente](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters), que marcam `fbc` e `fbp` com "Do not hash", consultadas em 11/11/2026. A coluna do `gclid` resume o [verbete do gclid](https://precisian.io/blog/pt-BR/posts/gclid/).

O `_fbp` existe mesmo sem anúncio: o Pixel o grava em qualquer visita para identificar o navegador. O `_fbc` só existe depois de um clique em anúncio. Na API de Conversões, a Meta recomenda mandar o `fbc` "em todo evento".

## Onde o fbclid se perde antes da venda?

Em cinco lugares. Nenhum aparece como erro no Gerenciador de Anúncios.

**1. No redirecionamento.** A página de suporte do Pixel lista dois casos: encurtador ou URL personalizada que troca o `&` por `?` antes do `fbclid` e quebra o endereço, e página que "não aceita parâmetros de URL inesperados" ([Meta Pixel support](https://developers.facebook.com/docs/meta-pixel/support), atualizada em 28/03/2025). Redirecionamento de idioma, de `http` para `https` ou de link da bio que descarta a query string apaga o `fbclid` antes de qualquer tag rodar.

**2. Quando a compra termina em outro domínio.** O `_fbc` vive "sob o seu domínio", nas palavras da Meta. Checkout hospedado por intermediador de pagamento não lê esse cookie, e, se o comprador não volta à página de confirmação, o evento do navegador não dispara. É o mesmo mecanismo do [Pix que quebra o purchase do GA4](https://precisian.io/blog/pt-BR/posts/pix-quebra-o-purchase-do-ga4/), visto pelo lado da Meta.

**3. Quando a venda fecha no WhatsApp.** A pessoa clica no anúncio, chega no site, toca no botão do WhatsApp e compra pelo vendedor. O `fbclid` fica no cookie do navegador, e o pedido nasce no ERP sem ele. Anúncio de clique para WhatsApp é outro caso: não passa pelo site e gera o `ctwa_clid`, que chega por webhook ([verbete do ctwa_clid](https://precisian.io/blog/pt-BR/posts/ctwa-clid/)).

**4. No navegador.** Três navegadores documentam remoção de parâmetro de rastreamento:

- O **Brave** remove o `fbclid` da URL por padrão, "antes de o navegador fazer a requisição", e o cita pelo nome ([Brave](https://brave.com/privacy-updates/5-grab-bag/), 20/07/2020).
- O **Firefox** remove parâmetros conhecidos quando o modo estrito da Proteção Aprimorada contra Rastreamento está ligado ([notas do Firefox 102](https://www.mozilla.org/en-US/firefox/102.0/releasenotes/)). A lista que a Mozilla distribui aos navegadores inclui `fbclid` ([Mozilla Remote Settings](https://firefox.settings.services.mozilla.com/v1/buckets/main/collections/query-stripping/records), consultada em 11/11/2026).
- O **Safari**, na navegação privada, "remove um subconjunto de parâmetros de consulta identificados como usados para rastreamento entre sites", antes da navegação ([WebKit](https://webkit.org/blog/15697/), 16/07/2024). O WebKit não publica a lista nem cita o `fbclid`.

Fora da navegação privada, o Safari limita a 24 horas a validade de cookies criados em JavaScript na página de destino quando detecta *click IDs* na URL ([WebKit](https://webkit.org/tracking-prevention/), consultada em 11/11/2026). O Pixel grava o `_fbc` por JavaScript, e a Meta recomenda gravá-lo também pelo servidor, como cookie HTTP.

**5. Quando a conversão chega tarde demais.** Na API de Conversões, o `event_time` pode ser "até 7 dias antes" do envio. Se um evento do lote passar disso, a Meta "retorna um erro para a requisição inteira e não processa nenhum evento" ([parâmetros de evento do servidor](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/server-event), atualizada em 15/10/2026). Boleto compensado no oitavo dia não volta pela API com o horário real.

## Como o fbclid volta à Meta quando a venda acontece fora do site?

Pela API de Conversões, com o `fbc` dentro de `user_data`. O exemplo da documentação é um evento `Purchase` com `action_source: "website"`, o `fbc` e o e-mail e o telefone com hash SHA-256 em `em` e `ph`.

O roteiro, na ordem em que a Meta descreve:

1. **Ler** o `fbclid` da URL no servidor ou o `_fbc` do cabeçalho `Cookie` da requisição.
2. **Formatar** como `fb.1.<milissegundos>.<fbclid>`, sem mexer na caixa.
3. **Guardar** como cookie HTTP de 90 dias ou no seu banco ([Meta for Developers](https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/fbp-and-fbc)). Grave de novo só quando chegar um `fbclid` diferente do que está no cookie.
4. **Enviar** o `fbc` em todo evento, junto com o `fbp` quando houver.

Para venda que não foi no site, o campo `action_source` aceita `chat`, `phone_call`, `physical_store`, `system_generated` e `business_messaging` ([Meta for Developers](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/server-event)). O `fbc` não substitui dado do cliente. Quando o clique se perdeu, o e-mail e o telefone com hash ainda permitem o cruzamento, como mostra o post sobre a [API de Conversões da Meta](https://precisian.io/blog/pt-BR/posts/api-de-conversoes-da-meta/).

## O que o fbclid não é?

Não é identificador de pessoa. Identifica um clique, e o mesmo navegador pode receber vários.

Não é UTM. Não carrega nome de campanha legível; quem resolve o clique é a Meta.

Não é atribuição. É a chave que deixa a Meta atribuir no modelo dela. O mesmo pedido pode estar sendo contado pelo Google Ads ao mesmo tempo, o que explica por que [a soma do ROAS passa do faturamento](https://precisian.io/blog/pt-BR/posts/roas-soma-maior-que-faturamento/).

Não é o `_fbp`. O `_fbp` identifica o navegador em qualquer visita, com ou sem anúncio.

## Quando isso passa a importar na operação?

Quando parte relevante da receita fecha fora da página de confirmação: Pix com prazo longo, boleto, venda pelo WhatsApp, checkout de intermediador. Nesses casos o Pixel enxerga o clique e não enxerga a venda.

A correção é de modelagem de dado. O `fbc` precisa entrar no registro do pedido como coluna, com a grafia original, capturado na landing page e levado até o ERP. Na Precisian, esse dado fica num lake isolado por cliente, na nossa infraestrutura, e a regra de qual clique fica com a venda vira definição versionada na camada semântica, em vez de lógica escondida numa automação.

## O que este artigo não cobre?

Não diz por quanto tempo a Meta aceita um `fbclid` antigo. A [documentação da Meta](https://developers.facebook.com/documentation/ads-commerce/conversions-api/parameters/fbp-and-fbc) recomenda 90 dias para o cookie e não publica limite para o identificador.

Não confirma se o Safari remove o `fbclid` especificamente. O teste leva minutos: clicar no próprio anúncio numa janela privada do Safari e olhar a URL que chega.

Não trata da configuração de janela de atribuição no Gerenciador de Anúncios nem de eventos de app.

Se a sua operação compra Meta Ads e vende por Pix, boleto ou WhatsApp, o primeiro passo é verificar se o `fbc` chega até o registro do pedido ou morre no cookie do navegador. O que mudou, o que quebrou e o que a pesquisa da Precisian mediu chega a cada quinze dias, às quintas, na [newsletter da Precisian](https://precisian.io/newsletter?utm_source=blog&utm_medium=cta&utm_campaign=fbclid&utm_content=texto).
