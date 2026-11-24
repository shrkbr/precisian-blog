---
title: "Google tag gateway: o que é, como configurar e o que muda na medição"
description: "O Google tag gateway serve a tag do Google pelo domínio da loja, via CDN. O Google mediu 11% mais carregamentos de script; a venda segue no ERP."
slug: "google-tag-gateway"
lang: "pt-BR"
translationKey: "google-tag-gateway-for-advertisers"
publishedAt: 2026-11-23
tags: ["tracking", "ga4", "divergencia-de-dados", "consentimento", "ecommerce"]
draft: false
llmSummary: "O Google tag gateway para anunciantes carrega a tag do Google por um caminho do domínio da loja e encaminha a medição pela CDN. O Google relata 11% mais sinais, medidos em carregamento de script entre 9 e 16/04/2025. Não muda a definição de receita nem a venda que o ERP fatura."
citations: ["https://developers.google.com/tag-platform/tag-manager/gateway/setup-guide?setup=manual", "https://support.google.com/google-ads/answer/16214371", "https://support.google.com/tagmanager/answer/16061406?hl=pt-BR", "https://developers.google.com/tag-platform/tag-manager/gateway/sgtm-and-cdn", "https://developers.cloudflare.com/google-tag-gateway/", "https://webkit.org/tracking-prevention/", "https://support.google.com/analytics/answer/12313109", "https://developers.google.com/analytics/devguides/collection/ga4/reference/events"]
about: ["https://developers.google.com/tag-platform/tag-manager/gateway", "https://pt.wikipedia.org/wiki/Google_Tag_Manager", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 9
cta: regua
---
O Google tag gateway para anunciantes faz o site carregar a tag do Google por um caminho do próprio domínio, como `minhaloja.com.br/metrics/`, e encaminhar dali as requisições de medição para o Google, pela CDN ou pelo balanceador de carga que a loja já usa ([Google for Developers, guia de configuração](https://developers.google.com/tag-platform/tag-manager/gateway/setup-guide?setup=manual), atualizado em 06/11/2026). O Google relata 11% mais sinais em quem ativou, contados em carregamento de script. Muda a entrega da tag; o pedido que o ERP fatura continua igual.

> **Google tag gateway para anunciantes** ("gateway da tag do Google para anunciantes", na Central de Ajuda em português) é o recurso do Google que serve o `gtag.js` ou o `gtm.js` a partir de um caminho reservado no domínio do site e repassa a medição ao Google por uma infraestrutura do próprio anunciante: CDN, balanceador de carga ou servidor web.

## O que é o Google tag gateway, exatamente?

É uma rota no seu domínio que aponta para um endpoint do Google.

Numa instalação padrão, a página pede a tag a um domínio do Google e a tag, ao disparar, manda a medição direto para o produto do Google. Com o gateway, *"o site carrega a tag do Google a partir do seu domínio próprio"* e, quando ela dispara, *"algumas requisições de medição serão enviadas ao Google usando o seu domínio próprio"* ([Google for Developers](https://developers.google.com/tag-platform/tag-manager/gateway/setup-guide?setup=manual), lido em 23/11/2026, tradução minha).

O mecanismo, pela documentação:

- Você reserva um **caminho de medição** por contêiner ou tag. Ele não pode estar em uso no site, não pode ser a raiz `/` e tem no máximo 100 caracteres. O Google sugere `/metrics`, `/analytics` ou uma sequência aleatória de letras ([requisitos do caminho](https://developers.google.com/tag-platform/tag-manager/gateway/setup-guide?setup=manual)).
- A CDN encaminha esse caminho para um endpoint do Google no formato `G-12345.fps.goog` (ou `gtm-abcdef.fps.goog`, para um contêiner), trocando o cabeçalho `Host` por esse endereço.
- A CDN acrescenta a localização aproximada do visitante em cabeçalhos: `X-Forwarded-CountryRegion` (país e região num código ISO 3166-2, como `BR-SP`) ou o par `X-Forwarded-Country` + `X-Forwarded-Region` ([cabeçalhos aceitos](https://developers.google.com/tag-platform/tag-manager/gateway/setup-guide?setup=manual)).
- O snippet do site passa a apontar para o caminho: no `gtag.js`, o atributo `src` deixa de ser o endereço do `googletagmanager.com` e vira `/metrics/`.

Com o Tag Manager, um único caminho para o contêiner cobre todas as tags que estão dentro dele (GA4, Google Ads e as demais). Contêineres separados ou tags avulsas exigem um caminho cada.

## Qual é o sintoma que leva alguém a ativar o tag gateway?

O mesmo que leva ao server-side: o GA4 e o Google Ads mostram menos compras do que o ERP fechou, e a explicação que circula é bloqueador de anúncio e Safari.

Parte do sintoma é coleta, e o gateway mexe nela. A outra parte tem o mesmo sintoma e outra causa. O Pix que não volta à página de confirmação [perde o `purchase` por outro mecanismo](https://precisian.io/blog/pt-BR/posts/pix-quebra-o-purchase-do-ga4/). A referência de eventos do GA4 orienta a preencher o `value` do `purchase` com a soma de preço vezes quantidade, *"sem incluir `shipping` nem `tax`"*, que vão em parâmetros próprios ([Google, referência de eventos](https://developers.google.com/analytics/devguides/collection/ga4/reference/events), lida em 23/11/2026, tradução minha); por isso a receita do GA4 costuma vir sem frete, a depender da implementação, e [não é a receita que a VTEX soma](https://precisian.io/blog/pt-BR/posts/vtex-ga4-nao-batem/). O consentimento negado vira [dado modelado na interface e lacuna no BigQuery](https://precisian.io/blog/pt-BR/posts/consent-mode-dado-modelado/). Nenhuma dessas três melhora quando a tag passa a vir do seu domínio.

O teste rápido para separar é contar **pedidos**, não receita. Faltando pedidos no GA4, pode ser coleta. Pedidos batendo e receita não, é definição.

## O que muda na medição, mecanicamente?

Muda de onde o script vem e por onde a medição sai. O conteúdo do evento continua o mesmo.

O número do Google precisa ser lido com a nota de rodapé. A Central de Ajuda do Google Ads diz que *"anunciantes que configuraram o Google tag gateway for advertisers tiveram aumento de 11% nos sinais"*, e o rodapé define a conta: dado global do Google, mediana móvel de 7 dias entre 9 e 16 de abril de 2025, com o aumento *"baseado em carregamentos de script da tag do Google"*, comparando tags com e sem o gateway ([Google Ads, anúncio de 02/05/2025](https://support.google.com/google-ads/answer/16214371), lido em 23/11/2026, tradução minha).

O número conta script que carregou. Compra que passou a bater com o pedido seria outra conta, e o anúncio não a publica.

Dois efeitos colaterais estão documentados:

- **Consentimento.** A página de configuração com Cloudflare avisa: *"A ativação desse recurso afeta o comportamento de disparo da tag do Google. Se as ações de consentimento do usuário estiverem afetando o comportamento atual da tag, adote o modo de consentimento"* ([Google, Central de Ajuda](https://support.google.com/tagmanager/answer/16061406?hl=pt-BR), lido em 23/11/2026). A mesma página diz que, com modo de consentimento, a configuração automática de script tem de ser desligada.
- **Cookie no Safari.** O gateway não aparece, nas páginas que li, como mudança na forma de gravar cookie. E o WebKit apaga *"todos os cookies criados em JavaScript"* depois de 7 dias sem interação do usuário com o site ([WebKit, Tracking Prevention](https://webkit.org/tracking-prevention/), lido em 23/11/2026). Servir o script pelo seu domínio não transforma o cookie gravado por script em cookie de servidor.

## Qual a diferença entre o tag gateway e o GTM server-side?

O gateway serve o script e repassa a medição; o server-side recebe a medição num contêiner seu, onde dá para limpar, enriquecer e escolher o destino. O Google documenta três arranjos e recomenda o terceiro ([Google for Developers, GTG com CDN + SGTM](https://developers.google.com/tag-platform/tag-manager/gateway/sgtm-and-cdn), atualizado em 08/05/2026).

| Arranjo | Quem serve o script | Quem recebe a medição | O que você opera |
|---|---|---|---|
| Gateway com CDN | a CDN, pelo seu domínio | o Google, via CDN | uma regra de rota na CDN |
| Gateway com SGTM | o servidor de tagueamento | o servidor de tagueamento | o servidor (Cloud Run, Stape ou outro) |
| Gateway com CDN + SGTM (recomendado pelo Google) | a CDN | o servidor de tagueamento, que processa e repassa | as duas coisas |

Fonte: [Google for Developers](https://developers.google.com/tag-platform/tag-manager/gateway/sgtm-and-cdn), lido em 23/11/2026.

Na prática, o gateway puro é o arranjo de menor operação: não há servidor de tagueamento para manter. Na Cloudflare, também não há cobrança pelo uso: ela informa que o gateway *"é de uso livre"* (tradução minha) e que as requisições não contam no faturamento de CDN, WAF ou Bot Management ([Cloudflare Docs](https://developers.cloudflare.com/google-tag-gateway/), atualizado em 08/10/2026). O server-side tem custo e operação, e já detalhei o que ele resolve [no post sobre a Stape](https://precisian.io/blog/pt-BR/posts/stape-gtm-server-side/) e o que ele não resolve em [server-side tagging vale a pena?](https://precisian.io/blog/pt-BR/posts/server-side-tagging-vale-a-pena/).

## Como configurar o Google tag gateway?

Há dois caminhos, e o primeiro depende de a loja estar na Cloudflare.

**Pela interface do Google, com Cloudflare.** Em **Administrador**, você seleciona **Gateway da tag do Google**, informa o endereço do site em "Verificar seu site", confirma a Cloudflare no resultado e escolhe entre a opção **Automatizada** (login na Cloudflare e escolha dos domínios) e a **Guiada** (instruções passo a passo ou o Tag Assistant). Cada domínio fica com um status: **Próprio** (ativo), **Não iniciado**, **Pausado** ou **Pendente** ([Google, Central de Ajuda](https://support.google.com/tagmanager/answer/16061406?hl=pt-BR), lido em 23/11/2026).

Dois detalhes da documentação da Cloudflare pesam numa loja real ([Cloudflare Docs](https://developers.cloudflare.com/google-tag-gateway/), lido em 23/11/2026):

- A configuração vale para a **zona inteira**, com todos os subdomínios, e não pode ser ligada ou desligada por subdomínio.
- Se o site já tem um script do GTM, a tag servida pelo gateway *"vai sobrescrever o script existente"* (tradução minha).

**Manual, em qualquer CDN.** O guia do Google traz o passo a passo para balanceador de carga do Google Cloud, Cloudflare (com Snippets), Akamai, Amazon CloudFront e Fastly, além de uma receita genérica para outras CDNs: origem apontando para `G-12345.fps.goog`, cabeçalho `Host` sobrescrito, cookies e query strings repassados, cabeçalhos de localização, regra de caminho `/metrics/*` com prioridade acima da regra padrão ([Google for Developers](https://developers.google.com/tag-platform/tag-manager/gateway/setup-guide?setup=manual), lido em 23/11/2026). No caminho manual, você troca o snippet em todas as páginas. Sem essa troca, *"o navegador continua pedindo os scripts direto ao Google"*, ignorando o gateway ([Google, Central de Ajuda](https://support.google.com/tagmanager/answer/16061406?hl=en) (em inglês), lido em 23/11/2026, tradução minha).

## Como diagnosticar se o gateway está funcionando, e se ajudou?

Cinco verificações. As três primeiras dizem se ele está ligado; as duas últimas, se mudou alguma coisa no número que importa.

| Verificação | Onde olhar | O que indica |
|---|---|---|
| `https://seudominio/metrics/healthy` | navegador | deve responder `ok`; outra resposta é rota quebrada |
| `https://seudominio/metrics/?validate_geo=healthy` | navegador | deve responder `ok`; sem isso, a localização não está chegando |
| Hits enviados ao caminho de medição | Tag Assistant, em Summary, Output, Hits Sent | hit indo para `googletagmanager.com` ou `google-analytics.com` significa gateway ignorado |
| Pedidos do ERP × `purchase` com `transaction_id` distinto no GA4, dia a dia | ERP; GA4 em Monetização, Transações | a diferença de pedidos antes e depois da ativação |
| Eventos `purchase` com `transaction_id` vazio ou repetido | export do GA4 para o BigQuery | deduplicação quebrada, que o gateway não conserta |

Os dois primeiros endereços e o Tag Assistant vêm do [guia do Google](https://developers.google.com/tag-platform/tag-manager/gateway/setup-guide?setup=manual), lido em 23/11/2026.

Na quarta linha, compare **dia a dia**, não o agregado da semana. Um total de sete dias que atravessa a data da ativação mistura dois regimes e esconde o efeito. Um exemplo com números redondos, sintético: se o ERP fechou 1.000 pedidos num dia e o GA4 registrou 800 antes do gateway e 830 depois, os 30 a mais são o efeito observável da troca de rota, e os 170 que continuam faltando têm outra causa. Não existe base publicada para prever esse ganho a partir dos 11% do Google, que contam carregamento de script, não pedido. É a sobra que a quinta linha e a próxima seção atacam.

## Como corrigir o que o gateway não corrige?

Na ordem em que o erro custa.

1. **Número do pedido como `transaction_id`**, o mesmo do ERP. O GA4 só deduplica compras com o mesmo `transaction_id` e trata todas as compras com o campo vazio como uma só ([Google, ajuda do GA4](https://support.google.com/analytics/answer/12313109), lido em 23/11/2026).
2. **Evento `refund` disparado pelo sistema que cancela**, com `transaction_id` e `value` ([Google, referência de eventos](https://developers.google.com/analytics/devguides/collection/ga4/reference/events), lida em 23/11/2026). Sem ele, Pix expirado e pedido barrado no antifraude ficam contados como venda.
3. **Modo de consentimento revisado antes de ativar**, e configuração automática de script desligada se ele estiver em uso, como manda a [Central de Ajuda](https://support.google.com/tagmanager/answer/16061406?hl=pt-BR).
4. **Reconciliação diária contra o ERP**, com tolerância escrita. Um exemplo de regra, não um padrão de mercado: diferença de pedidos acima de 2% num dia vira incidente.

Se a loja também manda compra para a Meta, o gateway não toca nessa rota. A deduplicação entre Pixel e API de Conversões depende de `event_id`, e está descrita no [post sobre a API de Conversões da Meta](https://precisian.io/blog/pt-BR/posts/api-de-conversoes-da-meta/).

## Quando o gateway não tem como ajudar?

Quando a venda não passa pelo navegador, ou quando o problema é a definição do número.

Pedido de marketplace, de loja física, de vendedor no WhatsApp ou de televendas não carrega `gtm.js` em lugar nenhum, com gateway ou sem. Dado que o visitante recusou no banner também não volta: o gateway muda a rota da tag, não a decisão de consentimento. E receita bruta contra líquida, com ou sem frete, na data do pedido ou do faturamento, é decisão de negócio, não de rota.

Nesses casos, a fonte de verdade da venda é o ERP, e a pergunta útil passa a ser qual número governa qual decisão. Essa regra precisa estar escrita onde analista e agente de IA leiam antes de calcular, que é o papel de uma [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/).

A Precisian trabalha nessa parte: pedido do ERP, evento do GA4 e gasto de mídia no mesmo lake, isolado por cliente na infraestrutura da Precisian, com a definição de receita versionada e a divergência residual medida. Se o seu problema é só script bloqueado, numa loja já na Cloudflare e com a reconciliação resolvida, o gateway do Google resolve sozinho, e a Precisian não é a resposta certa.

## O que este artigo não cobre?

Não traz percentual de compra recuperada pelo gateway. O único número do Google é o de 11% em carregamento de script, e não encontrei medição publicada de conversão.

Não descreve a computação confidencial que o Google anunciou para o gateway *"nos próximos meses"* em maio de 2025 ([Google Ads](https://support.google.com/google-ads/answer/16214371)). Não confirmei se ela já está ativa.

Não cobre o passo a passo de cada CDN além do resumo acima. O guia oficial tem as telas e o código de cada uma.

Se o GA4 e o ERP divergem na sua operação, o primeiro passo é contar pedidos dos dois lados, dia a dia, antes e depois de mudar a rota da tag. [Veja a pergunta deste post respondida sobre um lake de verdade](https://precisian.io/demonstracao?utm_source=blog&utm_medium=cta&utm_campaign=google-tag-gateway&utm_content=texto), sem compromisso de contrato.
