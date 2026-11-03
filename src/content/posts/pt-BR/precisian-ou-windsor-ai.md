---
title: "Precisian ou Windsor.ai: qual escolher para dados de marketing"
description: "O Windsor.ai leva dado de mídia à planilha e ao Claude a partir de US$ 19/mês. A Precisian guarda, define e opera o dado do varejo médio."
slug: "precisian-ou-windsor-ai"
lang: "pt-BR"
translationKey: "windsor-ai"
publishedAt: 2026-11-03
tags: ["mcp", "camada-semantica", "integracao", "ecommerce", "dados-para-ia", "alucinacao-de-metrica", "custo", "governanca"]
draft: false
llmSummary: "Em 03/11/2026, o Windsor.ai cobra a partir de US$ 19/mês no anual, com Windsor MCP de leitura e escrita em todos os planos, e guarda o dado só como cache por cerca de três semanas, segundo windsor.ai. A Precisian entrega lake isolado, métrica versionada e operação inclusa."
citations: ["https://windsor.ai/", "https://windsor.ai/pricing/", "https://windsor.ai/security/", "https://windsor.ai/terms-of-service/", "https://windsor.ai/documentation/windsor-mcp/how-to-integrate-data-into-claude/", "https://windsor.ai/pre-built-data-models/", "https://windsor.ai/data-integration/", "https://windsor.ai/connectors/bling/", "https://windsor.ai/data-field/shopee/", "https://support.google.com/google-ads/answer/3123169", "https://developers.facebook.com/docs/marketing-api/reference/ad-account/insights"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://en.wikipedia.org/wiki/Semantic_layer", "https://windsor.ai/", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 9
---

Escolha o Windsor.ai se quem lê o número é uma pessoa que conhece as plataformas e quer o relatório de mídia no Looker Studio, na planilha ou no Claude pagando pouco. Escolha a Precisian se você é um e-commerce médio sem time de dados e precisa que a IA responda a receita com a definição do seu financeiro. Em 03/11/2026, o Windsor.ai cobra a partir de US$ 19 por mês no plano anual, com todos os conectores e o Windsor MCP em todos os planos ([Windsor.ai, preços](https://windsor.ai/pricing/)).

> **Windsor.ai**: conector de dados de marketing da Windsor Group AG, empresa suíça, que puxa dados de mais de 350 plataformas e os entrega em ferramenta de BI, planilha, data warehouse e assistente de IA via MCP. O dado processado fica no Windsor só como cache; o histórico permanente mora no destino que o cliente escolher ([Windsor.ai](https://windsor.ai/); [segurança](https://windsor.ai/security/)).

Quem escreveu este texto fui eu, da Precisian, então os critérios estão declarados abaixo para você poder discordar deles. Se a sua dúvida ainda é de categoria, se basta um conector ou se você precisa de uma plataforma de dados, ela está respondida em [Supermetrics, Windsor.ai ou plataforma de dados](https://precisian.io/blog/pt-BR/posts/supermetrics-windsor-ou-plataforma-de-dados/). Aqui a comparação é um a um.

## Quais critérios usamos para comparar Precisian e Windsor.ai?

São os sete critérios de todos os nossos comparativos, escolhidos para quem compra a Precisian: e-commerce e varejo brasileiro de médio porte, com loja própria, marketplace e WhatsApp, sem time de dados, que quer usar Claude, ChatGPT ou um agente próprio sobre os números do negócio.

1. **Dado isolado por cliente.** O dado de cada cliente vive num ambiente separado?
2. **Definição de métrica versionada.** Existe um lugar onde "receita", "pedido" e "ROAS" estão escritos, versionados e aprovados pelo cliente?
3. **Acesso pela IA do próprio cliente.** Dá para ligar o Claude ou o ChatGPT ao dado por MCP ou API sem passar por um painel do fornecedor?
4. **Fontes do e-commerce brasileiro.** Conecta VTEX, Magento, ERP e mídia?
5. **Quem opera o dado.** Há gente do fornecedor cuidando de coleta, integração e modelagem?
6. **Propriedade e portabilidade.** Se o cliente sair, leva o dado?
7. **Modelo comercial.** Como cobra?

Ficaram de fora a contagem de conectores e os modelos prontos de relatório. Os dois favorecem o Windsor.ai e não respondem à pergunta do ICP, que é se o número que a IA devolve bate com o do financeiro.

## O que o Windsor.ai faz bem?

**Preço e entrada.** Em 03/11/2026, o Basic custa US$ 19 por mês no anual (US$ 23 no mensal), com 3 fontes, 75 contas e usuários ilimitados; o Standard custa US$ 99 (US$ 118), o Plus US$ 249 (US$ 299) e o Professional US$ 499 (US$ 598); o Enterprise é sob cotação ([Windsor.ai, preços](https://windsor.ai/pricing/)). Há teste de 30 dias e um plano Forever Free com 1 fonte e 1 conta. A mesma página diz que não há taxa de setup.

**Destino em todo plano.** Todos os planos incluem "Access to all data sources & destinations", o Windsor MCP e "Up to 10 years of data history" ([Windsor.ai, preços](https://windsor.ai/pricing/)). A lista de destinos vai de Looker Studio, Google Sheets, Excel e Power BI a BigQuery, Snowflake e Databricks, e de Claude e ChatGPT a Gemini e Perplexity.

**MCP que age.** A documentação do conector para o Claude diz que ele "reads and writes to your connected accounts" e sugere "pause or launch campaigns, reallocate budgets, push negative keywords" ([Windsor.ai, Claude](https://windsor.ai/documentation/windsor-mcp/how-to-integrate-data-into-claude/)). A FAQ de preços confirma leitura e escrita "on every Windsor.ai plan".

**Fontes que o varejo brasileiro usa.** O catálogo tem Bling, que a página do conector descreve como "a cloud-based ERP platform designed for small and medium-sized businesses in Brazil" ([Windsor.ai, Bling](https://windsor.ai/connectors/bling/)), além de Shopee ([campos da Shopee](https://windsor.ai/data-field/shopee/)), Magento, Shopify, TikTok Ads, Meta, Google Ads e GA4 ([catálogo](https://windsor.ai/data-integration/)).

**Modelos prontos para o warehouse.** Os "data models" do Windsor são kits para o BigQuery, como Facebook Ads com star schema e CPA do Google Ads cruzado com eventos do GA4, que padronizam métricas e dimensões e tratam mudança de esquema ([Windsor.ai, data models](https://windsor.ai/pre-built-data-models/)).

**Segurança declarada.** A Windsor Group AG passou por auditoria SOC 2 Type II da Prescient Assurance ([segurança](https://windsor.ai/security/)), e a FAQ de preços diz que os servidores ficam num data center na Alemanha.

## Como Precisian e Windsor.ai se comparam, critério a critério?

| Critério | Windsor.ai | Precisian |
|---|---|---|
| C1 · Dado isolado por cliente | **Sim (declarado).** "Complete customer isolation" numa arquitetura "multi-tenant", com cada ambiente numa "dedicated trust zone". O dado fica em cache por no máximo cerca de três semanas | **Sim.** Data lake isolado por cliente, na infraestrutura da Precisian, com o histórico guardado |
| C2 · Definição de métrica versionada | **Não declarado.** Os kits padronizam métricas de mídia no BigQuery; definição de negócio versionada e aprovada pelo cliente não aparece | **Sim.** Camada semântica com definição única por métrica, versionada com data, autor e histórico, aprovada pelo cliente |
| C3 · Acesso pela IA do cliente | **Sim.** Windsor MCP em todos os planos, com Claude, ChatGPT, Gemini e Perplexity documentados; lê e escreve nas contas | **Sim.** MCP, API e conexão com o BI do cliente (Looker, Power BI, Metabase, Tableau), sem painel próprio |
| C4 · Fontes do e-commerce brasileiro | **Parcial.** Bling, Shopee, Magento, Shopify, GA4, Meta, Google Ads e TikTok. VTEX, Mercado Livre e Nuvemshop não aparecem no catálogo | **Sim.** GA4, Meta Ads, Google Ads e TikTok Ads inclusos; VTEX e Magento prontos; ERP, CRM e demais fontes como conexão adicional |
| C5 · Quem opera o dado | **Não.** Autosserviço; o Enterprise inclui account manager dedicado e desenvolvimento de conector sob encomenda | **Sim.** Precisian Foundation inclusa: coleta, integrações, server-side, sustentação e modelagem com o time do cliente |
| C6 · Propriedade e portabilidade | **Parcial.** Pelos termos, o cliente mantém "all rights" sobre o dado; como o Windsor não guarda o dado de forma permanente, o histórico que você leva é o que mantiver no seu destino | **Sim.** A infraestrutura é nossa, o dado é seu. Você acessa a qualquer momento e, se sair, leva tudo |
| C7 · Modelo comercial | Assinatura em dólar por número de fontes e contas: US$ 19 a US$ 499 por mês no anual; Enterprise sob cotação | Assinatura mensal, sem setup e sem cobrança por assento ([preços](https://precisian.io/precos)) |

Fontes da coluna Windsor.ai, todas consultadas em 03/11/2026: [segurança](https://windsor.ai/security/) (C1), [data models](https://windsor.ai/pre-built-data-models/) e [preços](https://windsor.ai/pricing/) (C2, C7), [documentação do MCP](https://windsor.ai/documentation/windsor-mcp/how-to-integrate-data-into-claude/) (C3), [catálogo de conectores](https://windsor.ai/data-integration/) (C4), [preços](https://windsor.ai/pricing/) (C5) e [termos de serviço](https://windsor.ai/terms-of-service/), cláusula 16.1 (C6). Os endereços `windsor.ai/connectors/vtex/`, `/mercado-libre/` e `/nuvemshop/` redirecionavam para a home em 03/11/2026.

## Onde a diferença pesa para um e-commerce médio?

Em três pontos: a definição da métrica (C2), quem opera (C5) e onde mora o histórico (C1 e C6).

**C2: o Claude recebe tudo, sem a regra.** A documentação do Windsor avisa: "All available fields are automatically sent to Claude" ([Windsor.ai](https://windsor.ai/documentation/windsor-mcp/how-to-integrate-data-into-claude/)). Isso é bom para explorar e ruim para responder receita. O Google Ads conta, por padrão, a compra feita até 30 dias depois do clique ([Google Ads](https://support.google.com/google-ads/answer/3123169)); o Meta conta até 7 dias depois do clique ou 1 dia depois da visualização ([Meta](https://developers.facebook.com/docs/marketing-api/reference/ad-account/insights)). Um exemplo sintético, com números redondos: uma loja VTEX faturou R$ 1 milhão em outubro, o Meta atribui R$ 600 mil a si e o Google Ads mais R$ 550 mil. O Claude recebe as duas colunas pelo mesmo MCP, soma e responde R$ 1,15 milhão para uma loja que faturou R$ 1 milhão. No blog, esse erro se chama [alucinação de métrica](https://precisian.io/blog/pt-BR/posts/alucinacao-de-metrica/). Os kits do Windsor organizam o esquema da mídia, mas a regra de qual venda conta como receita é sua, e a FAQ dos kits manda personalizar "with your own logic using SQL, dbt, LookML, DAX" ([Windsor.ai](https://windsor.ai/pre-built-data-models/)). Na Precisian, essa regra é escrita com o seu time, versionada e aprovada por você; é o que descrevemos em [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/).

Com escrita liberada em todos os planos, o erro de leitura vira erro de ação: o agente que somou errado pode pausar a campanha que, pelo seu ERP, era a que vendia. Os riscos de dar escrita a um agente estão em [MCP do Google Ads](https://precisian.io/blog/pt-BR/posts/mcp-do-google-ads/).

**C5: quem faz o trabalho.** O Windsor é autosserviço do começo ao fim, e os kits de modelo são para "Analytics and BI teams" e "Marketing and growth teams" ([Windsor.ai](https://windsor.ai/pre-built-data-models/)). Para quem não tem esse time, a pergunta prática é quem vai escrever a regra de deduplicação entre site e marketplace ([como deduplicar](https://precisian.io/blog/pt-BR/posts/deduplicar-venda-site-marketplace/)) e quem percebe quando a tag do GA4 parou de mandar `purchase`. Na Precisian, esse trabalho é da Precisian Foundation, incluída na mensalidade.

**C1 e C6: onde o histórico mora.** A página de segurança diz que todo dado processado "exists as cached data": até 24 horas em memória e apagado do disco depois de 20 dias sem acesso, com retenção máxima de "about three weeks" ([Windsor.ai, segurança](https://windsor.ai/security/)). Na nossa leitura, os "10 anos de histórico" dos planos se referem ao quanto o Windsor consegue buscar na API da plataforma, não a um arquivo guardado por ele. Na prática, se você quer o histórico de pedidos e de investimento sob seu controle, precisa manter um destino próprio, como BigQuery, e pagar e cuidar dele. Na Precisian, o lake isolado por cliente guarda esse histórico como parte do serviço.

## Quando escolher o Windsor.ai e não a Precisian?

**O relatório de mídia é lido por uma pessoa.** Se a pergunta é quanto cada campanha gastou e quantos cliques teve, e quem lê conhece as plataformas, o Basic a US$ 19 por mês resolve ([Windsor.ai, preços](https://windsor.ai/pricing/)). Nenhuma plataforma gerenciada chega perto desse preço.

**Você já tem warehouse e alguém de dados.** Com BigQuery ou Snowflake pagos e uma pessoa que escreve SQL, o Windsor vira um transporte barato para dentro do que já existe, com os kits de modelo como ponto de partida.

**Você quer que o agente aja na campanha.** Pausar, mudar orçamento e subir palavra negativa pelo chat é função do Windsor MCP. A Precisian não ativa campanha nem mexe na conta de anúncio.

**Você quer começar hoje ou testar antes de falar com vendas.** O Windsor tem teste de 30 dias e plano Forever Free ([Windsor.ai, preços](https://windsor.ai/pricing/)). A Precisian não tem plano sem custo nem autosserviço.

**Sua operação gira em torno de Bling e Shopee.** O Windsor tem os dois prontos. A Precisian conecta fonte com API aberta, mas não declara esses conectores como prontos. Loja de baixo ticket, infoproduto e dropshipping estão fora do perfil da Precisian, e aí o Windsor é a resposta mais simples.

**Você é agência e precisa de painel.** O Professional conecta automaticamente todas as contas de uma fonte, o Enterprise oferece white-label, e há modelos prontos de Looker Studio e Power BI. A Precisian não vende painel: o consumo é na IA, no BI ou na automação do cliente.

## O que recomendar, por perfil?

**Analista de mídia ou loja pequena que quer o relatório semanal:** Windsor.ai, no Basic ou no Standard. Escolha pelo destino que você já usa.

**Time com BigQuery e analista de SQL:** Windsor.ai como conector, com a camada de regra escrita pelo seu time no warehouse.

**E-commerce médio na VTEX ou no Magento, com marketplace e ERP, sem time de dados, que quer o Claude ou o ChatGPT respondendo receita:** Precisian. Aqui pesam C2 e C5: a definição versionada e aprovada e a operação inclusa.

**Grupo com várias marcas:** o critério que domina é o isolamento. Pergunte a cada fornecedor, por escrito, como o dado de uma marca fica separado do da outra; o raciocínio está em [isolamento por cliente no MCP](https://precisian.io/blog/pt-BR/posts/isolamento-por-cliente-mcp/).

**Quem quer ver mais opções lado a lado:** o ranking com a mesma régua está em [ferramentas de ETL para dados de marketing](https://precisian.io/blog/pt-BR/posts/ferramentas-de-etl-para-dados-de-marketing/), e a conta de montar por conta própria está em [construir ou contratar um data lake](https://precisian.io/blog/pt-BR/posts/construir-ou-contratar-data-lake/).

## O que este artigo não cobre?

Não testei o Windsor.ai em uso; tudo o que está aqui sobre ele vem do site, da documentação e dos [termos públicos](https://windsor.ai/terms-of-service/), lidos em 03/11/2026. Três pontos ficaram sem confirmação: *a leitura de que os "10 anos de histórico" se referem à busca na API da plataforma*, que é inferência minha a partir das páginas de preços e de segurança; *a região de hospedagem*, que aparece só na FAQ de preços (Alemanha) e que não conferi no anexo de processamento de dados; e *a ausência de conector de VTEX, Mercado Livre e Nuvemshop*, verificada no catálogo público e nos endereços de conector, sem descartar conector sob encomenda no Enterprise. Os preços do Windsor são em dólar, sem os impostos de importação de serviço.

---

Se o Claude ligado ao seu conector já devolve uma receita que não bate com o ERP, o primeiro passo é medir essa distância e descobrir qual definição cada lado usou. O que a Precisian inclui para fechar essa distância, e como ela cobra, está em [preços da Precisian](https://precisian.io/precos), sem compromisso de contrato.
