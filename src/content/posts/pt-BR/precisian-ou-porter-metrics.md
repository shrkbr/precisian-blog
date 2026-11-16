---
title: "Precisian ou Porter Metrics: qual escolher para dados de marketing"
description: "A Porter Metrics liga mídia e VTEX ao Claude e ao Looker Studio a partir de US$ 15/mês por conta. A Precisian guarda, define e opera o dado do varejo médio."
slug: "precisian-ou-porter-metrics"
lang: "pt-BR"
translationKey: "precisian-ou-porter-metrics"
publishedAt: 2026-11-16
tags: ["mcp", "camada-semantica", "integracao", "ecommerce", "dados-para-ia", "alucinacao-de-metrica", "custo", "governanca"]
draft: false
llmSummary: "Em 16/11/2026, a Porter Metrics, conector de dados de marketing com servidor MCP, cobra por conta de fonte de dados, de US$ 15/mês por uma conta a US$ 2 por conta acima de 200, com MCP incluso, segundo portermetrics.com/en/pricing. A Precisian entrega lake isolado e métrica versionada."
citations: ["https://portermetrics.com/en/pricing/", "https://portermetrics.com/pt/precos/", "https://portermetrics.com/pt/home-pt/", "https://portermetrics.com/llms.txt", "https://portermetrics.com/en/connectors/", "https://portermetrics.com/en/connectors/claude/vtex/", "https://portermetrics.com/en/connectors/bigquery/", "https://portermetrics.com/en/tos/", "https://portermetrics.com/en/privacy-policy/", "https://forbes.co/2022/11/03/emprendedores/esta-startup-de-automatizacion-de-datos-de-manizales-factura-mas-de-us500-000-al-ano/"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://en.wikipedia.org/wiki/Semantic_layer", "https://portermetrics.com/", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
cta: ficha
---
Escolha a Porter Metrics se você é agência ou time de marketing e quer relatório de mídia no Looker Studio, no Sheets ou no Power BI, ou quer operar campanha pelo Claude, pagando por conta conectada. Escolha a Precisian se você é um e-commerce médio sem time de dados e precisa que a IA responda a receita com a definição do seu financeiro. Em 16/11/2026, a Porter cobra US$ 15 por mês por uma conta de fonte de dados e US$ 40 por quatro, com o MCP incluso em todos os planos ([Porter, preços](https://portermetrics.com/en/pricing/)).

> **Resumo para quem decide.** A Precisian publica o preço: plano único a partir de R$ 3.000/mês, sem setup e sem cobrança por assento ([preços](https://precisian.io/precos?utm_source=blog&utm_medium=cta&utm_campaign=precisian-ou-porter-metrics&utm_content=topo)). Quando o outro lado é a escolha certa está na seção "Quando escolher a Porter Metrics e não a Precisian?", abaixo.

> **Porter Metrics**: plataforma de dados de marketing sem código, fundada em Manizales, na Colômbia ([Forbes Colombia, 03/11/2022](https://forbes.co/2022/11/03/emprendedores/esta-startup-de-automatizacion-de-datos-de-manizales-factura-mas-de-us500-000-al-ano/)), hoje contratada pela Porter Metrics Inc., de Delaware ([termos](https://portermetrics.com/en/tos/)). Conecta mais de 30 fontes a Looker Studio, Google Sheets, Power BI, BigQuery e a chats de IA via MCP, e também executa ações em plataformas de anúncio e redes ([llms.txt da Porter](https://portermetrics.com/llms.txt)).

Quem escreveu este texto fui eu, da Precisian, então os critérios estão declarados abaixo para você poder discordar deles. Se a dúvida ainda é de categoria, se basta um conector ou se você precisa de uma plataforma de dados, ela está respondida em [Supermetrics, Windsor.ai ou plataforma de dados](https://precisian.io/blog/pt-BR/posts/supermetrics-windsor-ou-plataforma-de-dados/). Aqui a comparação é um a um.

## Quais critérios usamos para comparar Precisian e Porter Metrics?

São os sete critérios de todos os nossos comparativos, escolhidos para quem compra a Precisian: e-commerce e varejo brasileiro de médio porte, com loja própria, marketplace e WhatsApp, sem time de dados, que quer usar Claude, ChatGPT ou um agente próprio sobre os números do negócio.

1. **Dado isolado por cliente.** O dado de cada cliente vive num ambiente separado?
2. **Definição de métrica versionada.** Existe um lugar onde "receita", "pedido" e "ROAS" estão escritos, versionados e aprovados pelo cliente?
3. **Acesso pela IA do próprio cliente.** Dá para ligar o Claude ou o ChatGPT ao dado por MCP ou API sem passar por um painel do fornecedor?
4. **Fontes do e-commerce brasileiro.** Conecta VTEX, Magento, ERP e mídia?
5. **Quem opera o dado.** Há gente do fornecedor cuidando de coleta, integração e modelagem?
6. **Propriedade e portabilidade.** Se o cliente sair, leva o dado?
7. **Modelo comercial.** Como cobra?

Ficaram de fora o preço de entrada, os dashboards prontos e a automação de campanha. Os três favorecem a Porter e aparecem na seção sobre quando escolhê-la.

## O que a Porter Metrics faz bem?

**Preço por conta, com plano gratuito.** A Porter cobra "per data source account": uma conta de anúncio, uma propriedade do GA4, uma loja. A tabela mensal publicada vai de US$ 15 por uma conta e US$ 40 por quatro até US$ 100 fixos para 13 a 20 contas e US$ 2 por conta acima de 200; no anual, o desconto é de 16,6%. A conta de administrador do Google Ads (MCC) não é cobrada. Há teste de 14 dias sem cartão e, depois, um plano gratuito permanente, com contas ilimitadas e histórico de até 30 dias ([preços](https://portermetrics.com/en/pricing/), lidos em 16/11/2026; a [página em português](https://portermetrics.com/pt/precos/) traz a mesma tabela, em dólar).

**MCP em todos os planos.** O servidor fica em `https://mcp.portermetrics.com/mcp`, a mesma URL para Claude, ChatGPT, Cursor e Claude Code ([llms.txt](https://portermetrics.com/llms.txt)). A página de preços diz que o MCP está incluído "in every Porter plan at no extra cost—including the Free forever plan".

**Um conector VTEX documentado com cuidado.** A página do conector para Claude lista 36 campos em quatro grupos (pedidos, linhas de pedido, catálogo de SKU e estoque por armazém), só leitura, e avisa que "VTEX counts cancelled orders in its sales totals". Também explica que `Order Value` inclui frete e imposto e `Line Revenue` não, e que o dia de cada pedido segue o fuso do canal de venda ([Porter, VTEX para Claude](https://portermetrics.com/en/connectors/claude/vtex/), atualizada em 20/10/2026). O conector deixa de fora os clientes do Master Data.

**Escreve nas plataformas, com aprovação.** Com créditos de IA, a Porter cria campanhas, sobe criativos, agenda posts e responde avaliações em Meta, Google, LinkedIn, TikTok e Microsoft. Campanhas e anúncios novos nascem pausados, e cada mudança espera um sim do usuário ([home em português](https://portermetrics.com/pt/home-pt/); [llms.txt](https://portermetrics.com/llms.txt)).

**Catálogo largo de mídia e destinos.** São 12 conectores de mídia paga, inclusive Reddit, X, DV360, StackAdapt e Snapchat, e e-commerce internacional (Shopify, WooCommerce, Amazon Seller e Vendor Central, TikTok Shop) ([conectores](https://portermetrics.com/en/connectors/)). Uma assinatura cobre todos os clientes de uma agência, com relatório white-label.

## Como Precisian e Porter Metrics se comparam, critério a critério?

| Critério | Porter Metrics | Precisian |
|---|---|---|
| C1 · Dado isolado por cliente | **Não declarado.** "You choose where it's stored: our warehouse, or your own"; a plataforma "is hosted on Google Cloud and uses BigQuery". Nenhuma página diz se o warehouse da Porter é separado por cliente | **Sim.** Data lake isolado por cliente, na infraestrutura da Precisian, com o histórico guardado |
| C2 · Definição de métrica versionada | **Parcial.** Campos personalizados e métricas calculadas sem SQL; o conector VTEX traz a definição de cada campo. Versionamento, histórico e aprovação da definição não são declarados | **Sim.** Camada semântica com definição única por métrica, versionada com data, autor e histórico, aprovada pelo cliente |
| C3 · Acesso pela IA do cliente | **Sim.** MCP em todos os planos, inclusive o gratuito, para Claude, ChatGPT, Gemini e outros clientes MCP | **Sim.** MCP, API e conexão com o BI do cliente (Looker, Power BI, Metabase, Tableau), sem painel próprio |
| C4 · Fontes do e-commerce brasileiro | **Parcial.** GA4, Meta, Google Ads, TikTok Ads e mais oito de mídia; VTEX pronta para Claude (pedidos, SKU, estoque). Magento, Mercado Livre, Nuvemshop, RD Station e ERP não têm página | **Sim.** GA4, Meta Ads, Google Ads e TikTok Ads inclusos; VTEX e Magento prontos; ERP, CRM e demais fontes como conexão adicional |
| C5 · Quem opera o dado | **Parcial.** Autosserviço sem código; serviço gerenciado de BigQuery e de implantação vendido à parte, por agendamento e sem preço publicado | **Sim.** Precisian Foundation inclusa: coleta, integrações, server-side, sustentação e modelagem com o time do cliente |
| C6 · Propriedade e portabilidade | **Parcial.** "You retain full ownership of all Customer Data"; após o cancelamento, o dado é apagado em até 30 dias. Quem grava no próprio BigQuery já está com ele | **Sim.** A infraestrutura é nossa, o dado é seu. Você acessa a qualquer momento e, se sair, leva tudo |
| C7 · Modelo comercial | Assinatura em dólar por conta de fonte de dados, de US$ 15/mês (1 conta) a US$ 2/conta (200+); créditos de IA à parte; plano gratuito | Assinatura mensal, sem setup e sem cobrança por assento ([preços](https://precisian.io/precos)) |

Fontes da coluna Porter, todas consultadas em 16/11/2026: [termos de serviço](https://portermetrics.com/en/tos/) (C1, C6), [preços](https://portermetrics.com/en/pricing/) (C1, C2, C3, C5, C7), [conector VTEX](https://portermetrics.com/en/connectors/claude/vtex/) (C2, C4), [conectores](https://portermetrics.com/en/connectors/) (C4) e [llms.txt](https://portermetrics.com/llms.txt) (C3).

## Onde a diferença pesa para um e-commerce médio?

Em três pontos: onde a definição de receita mora (C2), quem opera (C5) e o que fica de fora da fonte (C4).

**C2: a definição mora no prompt.** O conector VTEX da Porter documenta a armadilha: a VTEX soma pedido cancelado no total de vendas, por isso "the prompts ask for **invoiced** orders whenever they mean net sales" ([Porter, VTEX](https://portermetrics.com/en/connectors/claude/vtex/)). A regra "receita é pedido faturado, com ou sem frete" fica, então, na frase que cada pessoa digita no Claude. Um exemplo sintético, com números redondos: a loja teve R$ 1 milhão em `Order Value` no mês, R$ 80 mil disso foram pedidos cancelados e, nos pedidos faturados, R$ 70 mil foram frete e imposto. Três pessoas do time perguntam "quanto vendemos em outubro" e recebem R$ 1 milhão, R$ 920 mil ou R$ 850 mil, conforme o prompt de cada uma. Cada resposta é correta para a sua pergunta, e nenhuma está registrada como a receita da empresa. No blog, esse efeito se chama [alucinação de métrica](https://precisian.io/blog/pt-BR/posts/alucinacao-de-metrica/), e a origem do problema na VTEX está em [VTEX e GA4 não batem](https://precisian.io/blog/pt-BR/posts/vtex-ga4-nao-batem/). Na Precisian, a definição é escrita uma vez com o seu financeiro, versionada e aprovada por você, e toda pergunta passa por ela; é o que descrevemos em [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/).

**C5: quem faz o trabalho.** A Porter é sem código e de autosserviço: você conecta, escolhe os campos e escreve as perguntas. Sem time de dados, ninguém fica encarregado de deduplicar a venda entre site e marketplace nem de perceber quando a tag do GA4 parou de mandar `purchase`. A Porter oferece um serviço gerenciado à parte ("Our marketers and developers build your marketing data warehouse"), sem preço publicado ([preços](https://portermetrics.com/en/pricing/)). Na Precisian, esse trabalho é da Precisian Foundation, incluída na mensalidade.

**C4: o resto da venda.** VTEX e mídia cobrem boa parte de uma loja brasileira, e a Porter tem as duas. O que não aparece no catálogo é Magento, Mercado Livre e ERP; o caminho para juntar marketplace e loja própria está em [deduplicar venda entre site e marketplace](https://precisian.io/blog/pt-BR/posts/deduplicar-venda-site-marketplace/).

## Quando escolher a Porter Metrics e não a Precisian?

**Você é agência ou freelancer.** Uma assinatura cobre todos os clientes, com relatório white-label no Looker Studio, no Sheets ou num dashboard hospedado. A Precisian não vende painel nem relatório.

**Você quer operar campanha pelo chat.** A Porter cria campanha pausada, sobe criativo e agenda post, com aprovação por ação. A Precisian não ativa campanha.

**Seu orçamento é de dezenas de dólares.** Uma loja com GA4, Meta, Google Ads, TikTok Ads e VTEX tem cinco contas; pela tabela publicada, isso dá 5 × US$ 8 = US$ 40 por mês no plano mensal (conta minha sobre a [tabela de preços](https://portermetrics.com/en/pricing/)). E há plano gratuito para começar.

**Você vende em Shopify, Amazon ou TikTok Shop.** São conectores prontos na Porter e fora do perfil da Precisian.

**Você já tem BigQuery e alguém de SQL.** A Porter vira um transporte barato para dentro do que já existe, e a regra de negócio fica com o seu analista.

## O que recomendar, por perfil?

**Agência, freelancer ou time de mídia:** Porter Metrics. Escolha pelo destino que você já usa e pelo número de contas.

**Time com warehouse e analista de SQL:** Porter como conector de mídia e de VTEX, com a camada de regra escrita pelo seu time.

**E-commerce médio na VTEX ou no Magento, com marketplace e ERP, sem time de dados, que quer o Claude ou o ChatGPT respondendo receita:** Precisian. Aqui pesam C2, C5 e C4: a definição versionada e aprovada, a operação inclusa e a venda inteira dentro do lake.

**Quem quer ver outros conectores na mesma régua:** [Precisian ou Stract](https://precisian.io/blog/pt-BR/posts/precisian-ou-stract/), [Precisian ou Windsor.ai](https://precisian.io/blog/pt-BR/posts/precisian-ou-windsor-ai/) e o ranking de [ferramentas de ETL para dados de marketing](https://precisian.io/blog/pt-BR/posts/ferramentas-de-etl-para-dados-de-marketing/).

## O que este artigo não cobre?

Não testei a Porter em uso; tudo o que está aqui sobre ela vem do site, da página de preços, das páginas de conectores, do llms.txt e dos [termos públicos](https://portermetrics.com/en/tos/), lidos em 16/11/2026. Ficaram sem confirmação: *se o warehouse da Porter separa o dado de cada cliente*, que nenhuma página declara; *se o conector VTEX também alimenta BigQuery, Sheets e Looker Studio*, porque só li a página do conector para Claude e a [lista de conectores do BigQuery](https://portermetrics.com/en/connectors/bigquery/) não o traz; *o período de cobrança dos planos de créditos de IA* (US$ 28, US$ 100 e US$ 250 nos dados estruturados da página), que o texto visível não esclarece; *a lista completa de ferramentas do MCP*; e *qualquer certificação de segurança*, que não encontrei. A [política de privacidade](https://portermetrics.com/en/privacy-policy/) diz que o dado não é armazenado nos servidores da Porter, salvo serviço de backup, e a página de preços oferece o warehouse da Porter como destino; usei os dois textos como estão publicados.

---

Se o Claude ligado ao seu conector devolve uma receita diferente a cada pessoa que pergunta, o primeiro passo é escrever qual definição o financeiro aceita e fazer toda pergunta passar por ela. O que a Precisian inclui, e quanto custa, está em [preços da Precisian](https://precisian.io/precos?utm_source=blog&utm_medium=cta&utm_campaign=precisian-ou-porter-metrics&utm_content=texto), sem compromisso de contrato.
