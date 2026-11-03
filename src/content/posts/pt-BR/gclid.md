---
title: "gclid: o que é e por que ele some antes de chegar à venda"
description: "O gclid é o ID do clique no Google Ads. Chega na URL, vive num cookie do seu domínio e só volta ao Google se for guardado junto com o pedido."
slug: "gclid"
lang: "pt-BR"
translationKey: "gclid"
publishedAt: 2026-11-03
tags: ["tracking", "atribuicao", "consentimento", "integracao"]
draft: false
llmSummary: "O gclid é o parâmetro que o auto-tagging do Google Ads acrescenta à URL do anúncio. A tag o guarda no cookie _gcl_aw do seu domínio. Desde 15/06/2026, a importação offline com gclid passa pela Data Manager API, segundo a documentação da Google Ads API."
citations: ["https://support.google.com/google-ads/answer/9744275", "https://support.google.com/google-ads/answer/3095550", "https://support.google.com/google-ads/answer/7012522", "https://support.google.com/google-ads/answer/2998031", "https://support.google.com/google-ads/answer/3123169", "https://developers.google.com/google-ads/api/docs/conversions/upload-clicks", "https://developers.google.com/google-ads/api/reference/rpc/v26/ConversionUploadErrorEnum.ConversionUploadError", "https://developers.google.com/data-manager/api/reference/rest/v1/events/ingest", "https://developers.google.com/tag-platform/security/guides/consent", "https://support.google.com/tagmanager/answer/7549390", "https://webkit.org/tracking-prevention/", "https://webkit.org/blog/15697/"]
about: ["https://en.wikipedia.org/wiki/Google_Ads", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

O `gclid` (Google Click Identifier) é o parâmetro que o auto-tagging do Google Ads acrescenta à URL de destino de cada anúncio clicado, no formato `www.exemplo.com/?gclid=123xyz` ([Ajuda do Google Ads](https://support.google.com/google-ads/answer/3095550), consultada em 03/11/2026). A tag do Google o grava num cookie do seu domínio e o usa para ligar a conversão ao clique. Se a venda acontece longe dessa página, alguém precisa guardar o `gclid` com o pedido.

> **gclid** (Google Click Identifier): "um parâmetro de URL passado com os cliques em anúncios", que identifica a campanha e outros atributos do clique, ativado pela configuração de auto-tagging e exigido pelo acompanhamento de conversões de site do Google Ads ([Ajuda do Google Ads](https://support.google.com/google-ads/answer/9744275), consultada em 03/11/2026).

Escrevi este verbete com a documentação do Google aberta ao lado, toda lida em 3 de novembro de 2026. A mudança recente que mais afeta quem importa conversão é de 15 de junho de 2026. Desde então, o método `UploadClickConversions` da Google Ads API falha com o erro `CUSTOMER_NOT_ALLOWLISTED_FOR_THIS_FEATURE` para tokens de desenvolvedor que não enviaram nenhum upload de conversão offline entre 17 de dezembro de 2025 e 15 de junho de 2026. O Google manda usar a Data Manager API ([Google Ads API](https://developers.google.com/google-ads/api/docs/conversions/upload-clicks)). Muito tutorial de importação de `gclid` ainda descreve o caminho antigo.

## Onde o gclid nasce?

No clique, quando o auto-tagging está ligado. O Google diz que o recurso vem ligado por padrão em contas novas e que, com uma tag do Google Analytics no site, o `gclid` "é armazenado em um novo cookie do Google Analytics no domínio do seu site" ([Ajuda do Google Ads](https://support.google.com/google-ads/answer/3095550)). Do lado do Google Ads, quem lê a URL é a tag de vinculação de conversões (*conversion linker*), que grava a informação do clique "em cookies chamados `_gcl_*`, como `_gcl_aw` e `_gcl_gs`", no domínio de nível mais alto, e também no armazenamento local do navegador ([Ajuda do Tag Manager](https://support.google.com/tagmanager/answer/7549390)).

Três detalhes da mesma documentação mudam a forma de capturar:

- **O `gclid` pode nascer na impressão.** "Às vezes, o GCLID é criado no momento de uma impressão, e não de um clique." Se a pessoa clica duas vezes no mesmo anúncio, o identificador se repete ([Ajuda do Google Ads](https://support.google.com/google-ads/answer/3095550)).
- **Diferencia maiúsculas de minúsculas.** O Google avisa que o valor é *case sensitive* ([Ajuda do Google Ads](https://support.google.com/google-ads/answer/7012522)). Planilha ou CRM que padroniza texto em minúsculas estraga o identificador.
- **No GA4, o auto-tagging vence a UTM manual.** A página do auto-tagging diz que o GA4 o prioriza "devido à ausência de uma opção de substituição". Quem padroniza UTM (assunto do post sobre [o que é UTM](https://precisian.io/blog/pt-BR/posts/o-que-e-utm/)) precisa saber que, no tráfego do Google Ads, o `gclid` decide.

## Quanto tempo o gclid vale?

O Google não publica um prazo de validade para o `gclid` em si. A página de definição não fala em expiração ([Ajuda do Google Ads](https://support.google.com/google-ads/answer/9744275)). O limite que existe na prática é o da ação de conversão.

A janela de conversão por clique vai de 1 a 90 dias, conforme a origem da conversão ([Ajuda do Google Ads](https://support.google.com/google-ads/answer/3123169)). Na importação, conversão de clique anterior à janela volta com o erro `EXPIRED_EVENT`, e clique com menos de 6 horas volta com `TOO_RECENT_EVENT`, que pede para tentar de novo depois ([Google Ads API, v26](https://developers.google.com/google-ads/api/reference/rpc/v26/ConversionUploadErrorEnum.ConversionUploadError)). O script de captura que o próprio Google sugere guarda o `gclid` com expiração de 90 dias ([Ajuda do Google Ads](https://support.google.com/google-ads/answer/7012522)).

O navegador pode encurtar isso. A página de prevenção de rastreamento do WebKit diz que o Safari detecta "click IDs" como parâmetro de URL e "limita a validade dos cookies criados em JavaScript na página de destino a 24 horas", e que apaga todo cookie criado em JavaScript após 7 dias sem interação do usuário com o site ([WebKit](https://webkit.org/tracking-prevention/), consultada em 03/11/2026). O WebKit não publica a lista de parâmetros nem cita o `gclid` pelo nome.

## Onde o gclid some antes da venda?

Em quatro lugares. Todos estão na documentação, e nenhum aparece como erro no painel.

**1. No redirecionamento.** "Se o seu site usa redirecionamentos, também é importante garantir que o GCLID seja passado para a página de destino final" ([Ajuda do Google Ads](https://support.google.com/google-ads/answer/3095550)). Encurtador, redirecionamento de `http` para `https` ou regra de idioma que descarta a query string apagam o `gclid` antes de qualquer tag rodar. O mesmo texto avisa que alguns sites devolvem página de erro quando recebem parâmetro desconhecido.

**2. Quando a compra termina em outro sistema.** O cookie `_gcl_aw` vive no seu domínio. Se o pagamento acontece num checkout hospedado por terceiro e o comprador não volta, a página que dispararia a conversão nunca carrega. É o problema do [Pix que quebra o purchase do GA4](https://precisian.io/blog/pt-BR/posts/pix-quebra-o-purchase-do-ga4/), visto pelo lado do Google Ads. A venda fechada no WhatsApp depois de um clique no site segue o mesmo caminho: o `gclid` fica no navegador, e o pedido nasce no ERP sem ele.

**3. Quando o consentimento é negado.** Com `ad_storage` negado, "novos cookies não serão definidos para fins de publicidade". O Google oferece o `url_passthrough`, que carrega `gclid`, `dclid`, `gclsrc`, `_gl` e `wbraid` de página em página pela URL. Uma das condições: o link de saída precisa apontar para o mesmo domínio da página atual ([Google Tag Platform](https://developers.google.com/tag-platform/security/guides/consent), consultada em 03/11/2026). No checkout em outro domínio, o passthrough não chega. O post sobre [consent mode e dado modelado](https://precisian.io/blog/pt-BR/posts/consent-mode-dado-modelado/) mostra o que o Google preenche com estimativa nesse caso.

**4. No navegador.** Além do limite de 24 horas, o modo de navegação privada do Safari "remove um subconjunto de parâmetros de consulta identificados como usados para rastreamento entre sites", antes da navegação ([WebKit](https://webkit.org/blog/15697/)). Servidor nenhum recupera o que não chegou na URL, ponto que o post sobre [server-side tagging](https://precisian.io/blog/pt-BR/posts/server-side-tagging-vale-a-pena/) desenvolve.

## Qual a diferença entre gclid, gbraid, wbraid e UTM?

O `gbraid` e o `wbraid` existem para os cliques em iOS. A Data Manager API define o primeiro como identificador de cliques "associados a eventos de app e originados de dispositivos iOS a partir do iOS 14", e o segundo como o mesmo para eventos de web ([Data Manager API](https://developers.google.com/data-manager/api/reference/rest/v1/events/ingest), consultada em 03/11/2026).

| | `gclid` | `wbraid` | `gbraid` | UTM |
|---|---|---|---|---|
| Quem cria | Auto-tagging do Google Ads | Google Ads, clique em iOS | Google Ads, clique em iOS | Você, à mão |
| Destino do clique | Site | Site (clique vindo de app iOS) | App iOS (clique vindo da web) | Qualquer URL |
| Identifica | Um clique (às vezes, uma impressão) | Um clique em iOS 14 ou posterior | Um clique em iOS 14 ou posterior | Campanha, origem e mídia, por texto |
| Aceita `cart_data` e variáveis personalizadas sem `gclid` | Sim | Não | Não | Não se aplica |
| Aceita dado do cliente junto na importação | Sim | Não: o Google ignora `user_identifiers` | Não: o Google ignora `user_identifiers` | Não se aplica |
| Prioridade quando vêm juntos | 1º | 2º | 3º | — |

Fonte da prioridade e das regras de `user_identifiers` e `cart_data`: [Google Ads API](https://developers.google.com/google-ads/api/docs/conversions/upload-clicks), consultada em 03/11/2026.

## Como o gclid volta ao Google Ads quando a venda acontece fora do site?

Por importação de conversão offline. A [Ajuda do Google Ads](https://support.google.com/google-ads/answer/2998031) descreve o fluxo: você salva o `gclid` com os dados do lead e, quando a venda fecha, devolve o identificador com o tipo de conversão e o horário.

Os campos, como a [documentação da Google Ads API](https://developers.google.com/google-ads/api/docs/conversions/upload-clicks) lista para o objeto `ClickConversion`:

- `conversion_action`: ação do tipo `UPLOAD_CLICKS`.
- `conversion_date_time`: posterior ao clique, com fuso no formato `yyyy-mm-dd HH:mm:ss+|-HH:mm`.
- `gclid`, `gbraid`, `wbraid`: "defina todo identificador que você capturou".
- `order_id`: recomendado, evita importação duplicada.
- `consent`: sem ele, "é possível que suas conversões não sejam atribuíveis".

Na Data Manager API, que é o caminho desde 15 de junho de 2026, os mesmos identificadores ficam no objeto `AdIdentifiers`, enviados por `POST` para `https://datamanager.googleapis.com/v1/events:ingest` ([Data Manager API](https://developers.google.com/data-manager/api/reference/rest/v1/events/ingest)).

O Google recomenda começar pelas **conversões otimizadas para leads** (*enhanced conversions for leads*). Elas somam ao `gclid` o e-mail ou telefone com hash SHA-256 e cruzam esse dado com contas Google logadas ([Ajuda do Google Ads](https://support.google.com/google-ads/answer/2998031)). A documentação da API diz que conversão só com dado do cliente, sem `gclid`, "ainda é útil". É o remendo para a venda em que o identificador se perdeu, desde que o cliente tenha deixado e-mail ou telefone.

## O que o gclid não é?

Não é identificador de pessoa. Identifica um clique, e às vezes uma impressão.

Não é UTM. Não carrega nome de campanha legível; quem resolve o clique é o Google.

Não é atribuição. É a chave que deixa o Google Ads atribuir no modelo dele. O mesmo pedido pode estar sendo contado por outras plataformas ao mesmo tempo, o que explica por que [a soma do ROAS passa do faturamento](https://precisian.io/blog/pt-BR/posts/roas-soma-maior-que-faturamento/).

Não é o `ctwa_clid`. O ID do clique no anúncio de WhatsApp chega por webhook, não pela URL, e ninguém o guarda por você ([verbete do ctwa_clid](https://precisian.io/blog/pt-BR/posts/ctwa-clid/)).

## Quando isso passa a importar na operação?

Quando parte relevante da receita fecha fora da página de confirmação: Pix com prazo longo, boleto, venda pelo WhatsApp, B2B com proposta. Nesses casos, a tag do site enxerga o clique e não enxerga a venda.

A correção é de modelagem de dado. O `gclid` precisa entrar no registro do pedido como coluna, com a grafia original, e a regra de qual clique fica com a venda precisa estar escrita antes da primeira importação. Na Precisian, esse dado fica num lake isolado por cliente, na nossa infraestrutura, e a regra vira definição versionada na camada semântica, em vez de lógica escondida numa automação.

## O que este artigo não cobre?

Não diz quanto tempo o `gclid` vale no servidor do Google, porque o Google não publica.

Não confirma se o Safari remove o `gclid` especificamente. O WebKit descreve a regra sem listar os parâmetros. O teste leva minutos: clicar no próprio anúncio numa janela privada do Safari e olhar a URL que chega.

Não trata de campanhas de app, que, segundo o Google, "não respeitam" o auto-tagging, nem do `dclid` do Campaign Manager.

Se a sua operação compra Google Ads e vende por Pix, boleto ou WhatsApp, o primeiro passo é verificar se o `gclid` chega até o registro do pedido ou morre no cookie do navegador. [Agende uma conversa sobre o seu caso](https://calendar.notion.so/meet/rodrigomartucci/precisian-io) — sem compromisso de contrato, mas sem promessa de resposta em 30 minutos também.
