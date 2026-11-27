---
title: "Stape: o que é, quanto custa e o que o GTM server-side não resolve sozinho"
description: "A Stape hospeda o contêiner server-side do GTM a partir de US$ 20/mês (Pro, 500 mil requisições). Ela muda a coleta, não a venda faturada no ERP."
slug: "stape-gtm-server-side"
lang: "pt-BR"
translationKey: "stape-gtm-server-side"
publishedAt: 2026-11-16
tags: ["tracking", "ga4", "divergencia-de-dados", "ecommerce", "custo"]
draft: false
llmSummary: "A Stape hospeda o contêiner server-side do Google Tag Manager e cobra por requisição: Pro US$ 20/mês até 500 mil, Business US$ 100 até 5 milhões (stape.io/price, 16/11/2026). O server-side muda a coleta; sem reconciliação, o evento de compra segue divergindo do pedido faturado no ERP."
citations: ["https://stape.io/price", "https://stape.io/helpdesk/knowledgebase/what-is-a-request", "https://stape.io/helpdesk/documentation/request-limits-and-pause-logic", "https://stape.io/helpdesk/documentation/plan-tiers-and-limits", "https://developers.google.com/tag-platform/tag-manager/server-side/cloud-run-setup-guide", "https://developers.google.com/tag-platform/tag-manager/server-side/manual-setup-guide", "https://support.google.com/analytics/answer/12313109", "https://developers.google.com/analytics/devguides/collection/ga4/reference/events", "https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events/"]
about: ["https://pt.wikipedia.org/wiki/Google_Tag_Manager", "https://stape.io", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 9
cta: regua
---
A Stape é uma empresa que hospeda o contêiner server-side do Google Tag Manager para você, cobrando por requisição recebida: o plano Pro custa **US$ 20 por mês** (US$ 17 no anual) para até 500 mil requisições, e o Business, **US$ 100** (US$ 83 no anual) para até 5 milhões ([Stape, página de preços](https://stape.io/price), lida em 16/11/2026). Ela troca o lugar onde a tag roda. Não troca o lugar onde a venda é registrada, que continua sendo o ERP.

> **Stape** é um serviço de hospedagem gerenciada para o servidor de tagueamento do Google Tag Manager (sGTM). O mesmo servidor pode rodar no Google Cloud, sob sua conta, ou em qualquer ambiente com Docker. O que a Stape vende é não ter de operar essa infraestrutura, mais um conjunto de recursos próprios em cima dela.

## O que a Stape faz, exatamente?

Roda por você o servidor que o Google distribui como imagem pronta.

O GTM server-side não é software da Stape. O servidor de tagueamento *"é um servidor Node.js dentro de uma imagem Docker"*, e o Google documenta o provisionamento automático no Cloud Run e o manual *"em outros ambientes"* ([Google, guia de provisionamento manual](https://developers.google.com/tag-platform/tag-manager/server-side/manual-setup-guide), lido em 16/11/2026). Qualquer hospedagem se liga ao seu contêiner pelo valor `Container Config` do Tag Manager, passado na variável `CONTAINER_CONFIG`. A Stape faz esse encaixe e mantém o servidor no ar.

Em cima disso, a página de preços lista recursos próprios. Três deles aparecem em quase toda conversa sobre a ferramenta, e cito a descrição da própria Stape ([stape.io/price](https://stape.io/price), lido em 16/11/2026):

- `Custom Loader`: *"modifica os caminhos do gtm.js e do gtag.js"* para tornar o rastreamento resistente a bloqueadores.
- `Cookie Keeper`: *"estende cookies quando a pessoa usa um navegador com a versão mais recente do ITP"*.
- `Click ID Restorer`: *"recupera identificadores de clique perdidos, como GCLID e MSCLKID, no modo privado do Safari e do Brave"*.

Os três atuam na **coleta**: no caminho entre o navegador e o servidor, e na vida do cookie. O Google tem um recurso próprio para servir a tag pelo domínio da loja, o [Google tag gateway](https://precisian.io/blog/pt-BR/posts/google-tag-gateway/).

## Quanto custa a Stape em 2026?

Estes são os planos de hospedagem de sGTM publicados pela [Stape](https://stape.io/price) e lidos em 16/11/2026, em dólar.

| Plano | Mensal | Anual (por mês) | Requisições/mês | O que entra além do plano anterior |
|---|---|---|---|---|
| Free | US$ 0 | US$ 0 | até 10 mil | Custom Loader, CDN global, Anonymizer |
| Pro | US$ 20 | US$ 17 | até 500 mil | logs de 3 dias, Cookie Keeper (cookies padrão), detecção de bot, Data Store |
| Business | US$ 100 | US$ 83 | até 5 milhões | infraestrutura multizona, logs de 10 dias, até 20 domínios, monitoramento |
| Enterprise | US$ 200 | US$ 167 | até 20 milhões | gerente de conta, até 50 domínios, exportação de logs para S3/GCS |
| Custom | sob consulta | sob consulta | ilimitadas | IP dedicado, cluster privado, DPA e SSA sob medida |

Fonte: [Stape, página de preços](https://stape.io/price), lida em 16/11/2026. A página não mostrou preço em real no dia da leitura.

O que define o plano é a contagem de requisições, e ela não é a contagem de eventos do GA4. A Stape conta *"toda requisição recebida pelo seu servidor"*, incluindo o carregamento de `gtm.js` e `gtag.js`, e sugere estimar pelos eventos dos últimos 30 dias **mais 30%**: 10 mil eventos no GA4 viram cerca de 13 mil requisições ([Stape, "What is a request"](https://stape.io/helpdesk/knowledgebase/what-is-a-request), atualizado em 12/10/2026).

A regra do teto também entra na conta. Pela documentação da Stape, ao chegar a **110%** do limite o contêiner é pausado e *"para de processar requisições completamente"*; no Pro, *"sem período de carência"*; do Business para cima, há uma carência única de 30 dias por contêiner ([Stape, limites e pausa](https://stape.io/helpdesk/documentation/request-limits-and-pause-logic), atualizado em 01/09/2026). A alternativa é ligar o upgrade automático, que sobe um plano e cobra o novo valor a partir dali ([Stape, planos e limites](https://stape.io/helpdesk/documentation/plan-tiers-and-limits)).

Em loja sazonal, novembro é o mês em que o contador estoura, e contêiner pausado não coleta nada. Outros limites que falham em silêncio no pico, como o do export do GA4 para o BigQuery, estão em [o que quebra no dado na Black Friday](https://precisian.io/blog/pt-BR/posts/black-friday-o-que-quebra-no-dado/).

## Sai mais barato hospedar no Google Cloud?

Depende do volume e, principalmente, de quem vai operar o servidor.

O Google estima que cada servidor no Cloud Run custa *"aproximadamente US$ 45 por mês"* e recomenda *"no mínimo 2 instâncias"*, com autoescala de 2 a 10 servidores atendendo de 35 a 350 requisições por segundo ([Google, guia do Cloud Run](https://developers.google.com/tag-platform/tag-manager/server-side/cloud-run-setup-guide), lido em 16/11/2026). O mesmo guia avisa que, acima de cerca de 1 milhão de requisições por mês, o log padrão de cada requisição *"pode gerar cobranças significativas"* de logging.

Um exemplo com números redondos, sintético: uma loja com 2 milhões de eventos de GA4 por mês gera cerca de 2,6 milhões de requisições pela regra dos 30% da Stape.

| Opção | Custo de infraestrutura/mês | O que fica com o seu time |
|---|---|---|
| Stape Business | US$ 100 (US$ 83 no anual) | configuração do contêiner e das tags |
| Cloud Run, 2 servidores | ~US$ 90, mais servidor de preview, log e tráfego de saída | a mesma configuração, mais atualização de versão, escala, log e faturamento do Google Cloud |

Fontes: [Stape](https://stape.io/price) e [Google](https://developers.google.com/tag-platform/tag-manager/server-side/cloud-run-setup-guide), lidas em 16/11/2026. A soma é minha; os valores unitários são deles.

O Google pede que você atualize o servidor *"a cada versão principal"* e reimplante a revisão quando o Tag Manager avisar ([mesmo guia](https://developers.google.com/tag-platform/tag-manager/server-side/cloud-run-setup-guide)). Na Stape, essa manutenção sai da sua lista, e é isso que se compra, mais do que a diferença de US$ 10 na fatura.

Para a pergunta anterior, se server-side em si vale a pena, e o que ele não entrega em cookie e consentimento, já escrevi [um texto só sobre isso](https://precisian.io/blog/pt-BR/posts/server-side-tagging-vale-a-pena/). Aqui o foco é outro: o que muda no número de venda.

## Qual é o sintoma que leva alguém a contratar a Stape?

Quase sempre o mesmo: o GA4 ou o Gerenciador de Anúncios mostra menos compras do que o ERP fechou, e alguém diz que é bloqueador de anúncio e Safari.

Parte disso é verdade. Parte é outra coisa com o mesmo sintoma. A venda por Pix que não volta à página de confirmação [some do GA4 por outro mecanismo](https://precisian.io/blog/pt-BR/posts/pix-quebra-o-purchase-do-ga4/). A receita que o GA4 calcula sem frete [não é a receita que a VTEX soma](https://precisian.io/blog/pt-BR/posts/vtex-ga4-nao-batem/). Nenhuma das duas é problema de coleta, e nenhuma melhora com servidor.

A forma de separar é olhar a contagem de **pedidos**, não a de receita. Se faltam pedidos, pode ser coleta. Se os pedidos batem e a receita não, é definição.

## O que o GTM server-side muda no dado, mecanicamente?

Muda o caminho do evento; o conteúdo dele continua o mesmo.

Sem servidor, o navegador dispara o `purchase` direto para o Google, a Meta e o TikTok. Com servidor, dispara uma vez para o seu domínio, e o contêiner repassa a cada destino. Os recursos da Stape descritos acima aumentam a chance de esse disparo chegar e de o cookie ainda estar lá.

O evento continua sendo uma afirmação feita **no momento do checkout**. O GA4 define `purchase` como o evento que *"indica que um ou mais itens foram comprados"* ([Google, referência de eventos](https://developers.google.com/analytics/devguides/collection/ga4/reference/events), lida em 16/11/2026). O ERP registra o que aconteceu depois: o Pix que expirou, o boleto não pago, o pedido barrado pelo antifraude, a troca, a devolução. O servidor de tagueamento não tem como saber nada disso, porque recebe só o que alguém mandou para ele.

## O que o GTM server-side não resolve sozinho?

Quatro coisas, todas documentadas pelos próprios fabricantes.

**Compra duplicada sem identificador.** O GA4 só deduplica compras com o mesmo `transaction_id`, e avisa que um `transaction_id` vazio faz com que *"todas as compras com transaction_id=\"\""* sejam tratadas como uma só ([Google, ajuda do GA4](https://support.google.com/analytics/answer/12313109), lida em 16/11/2026). Mandar pelo servidor não preenche esse campo.

**Pixel e API de Conversões contando duas vezes.** A Meta só descarta o segundo evento quando `event_id` e `event_name` coincidem e chegam *"dentro de 48 horas"* ([Meta, deduplicação](https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events/), lida em 16/11/2026). Quem liga a API de Conversões pela Stape sem o mesmo `event_id` no navegador e no servidor passa a contar a compra em dobro. O detalhe está no [post sobre a API de Conversões da Meta](https://precisian.io/blog/pt-BR/posts/api-de-conversoes-da-meta/).

**Cancelamento e devolução.** O GA4 tem o evento `refund`, com `transaction_id` e `value` obrigatórios ([Google, referência de eventos](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)). Ele só existe se alguém mandar a partir do sistema que sabe do cancelamento. Na maior parte das lojas, ninguém manda.

**A definição de receita.** Bruta ou líquida, com ou sem frete, na data do pedido ou do faturamento. Cada plataforma tem a regra dela, e a regra viaja intacta pelo servidor.

## Como diagnosticar se o problema é coleta ou definição?

Com um dia fechado e quatro conferências. Nenhuma precisa de ferramenta nova.

| Verificação | Onde olhar | O que indica |
|---|---|---|
| Pedidos no ERP × eventos `purchase` com `transaction_id` distinto no GA4, mesmo dia | ERP; GA4 em Relatórios, Monetização, Transações | Faltando eventos: coleta ou Pix. Sobrando: duplicidade |
| Eventos `purchase` com `transaction_id` vazio ou repetido | Exportação do GA4 para o BigQuery, ou a prévia do contêiner | Deduplicação quebrada antes de qualquer servidor |
| Mesmo `event_id` no Pixel e na API de Conversões | Gerenciador de Eventos da Meta, evento de compra | Sem coincidência, a compra conta duas vezes |
| Pedidos cancelados no ERP × eventos `refund` no GA4 | ERP; GA4 | Zero `refund` significa receita de pedido cancelado contada como venda |

Se a primeira linha mostra o GA4 com menos pedidos e as outras três estão limpas, servidor de tagueamento é uma resposta razoável, na Stape ou no Google Cloud. Se o problema aparece da segunda linha para baixo, o servidor vai entregar o mesmo erro com mais confiabilidade.

## Como corrigir?

Na ordem em que o erro custa.

1. **Número do pedido como `transaction_id`**, o mesmo que o ERP usa, nunca um identificador gerado no navegador.
2. **`event_id` idêntico** no Pixel e na API de Conversões, gerado uma vez e reaproveitado.
3. **Evento `refund` disparado pelo sistema que cancela**, não pela página. Nesse ponto o servidor ajuda, porque aceita requisição que não vem do navegador. A própria Stape lista integrações que enviam atualização de status de CRMs como HubSpot e Salesforce para as plataformas de anúncio ([stape.io/price](https://stape.io/price)).
4. **Uma reconciliação diária contra o ERP**, com tolerância escrita. Um exemplo de regra, não um padrão de mercado: diferença de pedidos acima de 2% num dia vira incidente, abaixo disso vira registro.

O item 4 é o que costuma faltar: sem ele, a coleta melhora e ninguém sabe quanto.

## Quando isso não tem conserto pelo servidor?

Quando a venda nunca passou pelo navegador.

Pedido de marketplace, de loja física, de vendedor no WhatsApp ou de televendas não dispara `gtm.js` em lugar nenhum. O servidor de tagueamento só enxerga essas vendas se outro sistema as empurrar para ele, e aí o problema virou integração, não coleta. O mesmo vale para o dado que o consentimento negado ou o navegador removem antes da requisição sair: o servidor recebe o que sobrou.

Nesses casos, a fonte de verdade da venda é o ERP, e a pergunta útil passa a ser qual número governa qual decisão. Essa regra precisa estar escrita num lugar onde analista e agente de IA leiam antes de calcular, que é o papel de uma [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/).

A Precisian trabalha nessa parte: pedido do ERP, evento do GA4 e gasto de mídia no mesmo lake, isolado por cliente na infraestrutura da Precisian, com a definição de receita versionada e a divergência residual medida. Para a coleta, ela tem o Precisian Pixel, coleta server-side first-party e o único add-on da Precisian. Se o seu problema é só perda de evento num site, com a reconciliação já resolvida, a Stape ou um Cloud Run bem operado resolvem, e a Precisian não é a resposta certa.

## O que este artigo não cobre?

Não traz percentual de evento recuperado pela Stape. A página de preços tem uma calculadora de impacto em ROAS, mas não encontrei metodologia publicada para ela, então não reproduzo o número.

Não compara a Stape com outros serviços de hospedagem de sGTM. Esse comparativo exige a página de preço oficial de cada um, com data, e fica para outro texto.

Não traz preço em real nem impostos de importação de serviço. A página consultada mostrava valores em dólar, e o custo final em reais depende do cartão e do enquadramento fiscal da sua empresa.

E não afirma nada sobre o funcionamento interno do `Cookie Keeper` ou do `Click ID Restorer` além da descrição publicada pela Stape.

Se o GA4 e o ERP divergem na sua operação, o primeiro passo é contar pedidos dos dois lados, num dia fechado, antes de mudar onde a tag roda. [Veja a pergunta deste post respondida sobre um lake de verdade](https://precisian.io/demonstracao?utm_source=blog&utm_medium=cta&utm_campaign=stape-gtm-server-side&utm_content=texto), sem compromisso de contrato.
