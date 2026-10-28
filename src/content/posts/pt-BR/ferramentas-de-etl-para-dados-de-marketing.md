---
title: "11 melhores ferramentas de ETL para dados de marketing em 2026"
description: "Ranking de 10 ferramentas de ETL e da Precisian por sete critérios. Das nove estrangeiras, nenhuma listava conector de VTEX em 26/10/2026."
slug: "ferramentas-de-etl-para-dados-de-marketing"
lang: "pt-BR"
translationKey: "etl-tools-ranking"
publishedAt: 2026-10-27
tags: ["integracao", "pipeline", "camada-semantica", "mcp", "ecommerce", "data-warehouse", "custo"]
draft: false
llmSummary: "Em 26/10/2026, nenhuma de nove ferramentas de ETL estrangeiras (Fivetran, Airbyte, Windsor.ai, Supermetrics, Funnel, Improvado, Weld, Peliqan, OWOX) listava conector de VTEX no catálogo oficial; a brasileira Kondado listava. Nenhuma das dez declarava métrica versionada e aprovada pelo cliente."
citations: ["https://www.fivetran.com/pricing", "https://fivetran.com/docs/connectors", "https://www.fivetran.com/press/fivetran-dbt-labs-complete-merger-to-create-the-data-infrastructure-for-trusted-ai-agents", "https://docs.getdbt.com/docs/use-dbt-semantic-layer/dbt-sl", "https://airbyte.com/pricing", "https://connectors.airbyte.com/files/registries/v0/cloud_registry.json", "https://docs.airbyte.com/integrations/connector-support-levels", "https://windsor.ai/pricing/", "https://windsor.ai/security/", "https://supermetrics.com/pricing", "https://docs.supermetrics.com/docs/supermetrics-mcp-server", "https://funnel.io/pricing", "https://help.funnel.io/en/articles/15014203-quick-start-guide-using-funnel-mcp", "https://improvado.io/pricing", "https://improvado.io/integrations/mercado-libre", "https://weld.app/pricing", "https://weld.app/docs/weld-connect/mcp-server", "https://peliqan.io/pricing/", "https://www.owox.com/pricing", "https://github.com/OWOX/owox-data-marts", "https://kondado.com.br/conectores.html", "https://kondado.com.br/pricing.html", "https://kondado.com.br/mcp/", "https://kondado.com.br/wiki/a/nossos-termos-de-uso"]
about: ["https://en.wikipedia.org/wiki/Extract%2C_transform%2C_load", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 9
---

Para um e-commerce brasileiro de médio porte sem time de dados, a ordem pelos sete critérios deste ranking começa com Precisian, OWOX, Fivetran e Funnel. Com engenheiro de dados e warehouse próprio, a escolha está entre [Fivetran](https://www.fivetran.com/pricing) e [Airbyte](https://airbyte.com/pricing). Loja pequena em Bling ou Nuvemshop fica melhor com a [Kondado](https://kondado.com.br/pricing.html). Em 26/10/2026, nenhuma das nove ferramentas estrangeiras listava conector de VTEX no catálogo público; a Kondado, brasileira, listava ([conectores](https://kondado.com.br/conectores.html)).

> **Ferramenta de ETL** (*extract, transform, load*): software que extrai dado de várias fontes, como plataformas de anúncio, loja e ERP, e carrega num destino, como warehouse, planilha ou BI. As de marketing hoje fazem quase sempre ELT: carregam primeiro e transformam no destino. Ela move o dado. Quem decide o que "receita" significa continua sendo você.

## Quem escreveu este ranking e com quais critérios?

Este ranking foi escrito pela Precisian, e a Precisian está na lista. Os critérios foram escolhidos para o comprador da Precisian, e ela sai em 1º neles. A Precisian não é uma ferramenta de ETL vendida sozinha: ela move o dado, modela e opera. Se você quer só mover, a ordem muda, e a seção sobre quando escolher uma ferramenta de ETL diz como.

O leitor que tenho em mente é um e-commerce ou varejo de médio porte com loja própria, marketplace e WhatsApp, sem time de dados, que quer perguntar ao Claude ou ao ChatGPT sobre o próprio faturamento e não confia no número que tem. Para esse leitor, sete critérios:

1. **C1 · Dado isolado por cliente.** O dado de cada cliente vive num ambiente separado?
2. **C2 · Definição de métrica versionada.** "Receita", "pedido" e "ROAS" estão escritos, versionados e aprovados pelo cliente em algum lugar?
3. **C3 · Acesso pela IA do próprio cliente.** Dá para ligar o Claude ou o agente da empresa ao dado por MCP ou API, sem passar pelo painel do fornecedor?
4. **C4 · Fontes do e-commerce brasileiro.** Conecta VTEX, Magento, ERP e mídia (GA4, Meta, Google Ads, TikTok)?
5. **C5 · Quem opera o dado.** Há gente do fornecedor cuidando de coleta, integração e modelagem?
6. **C6 · Propriedade e portabilidade.** Se o cliente sair, leva o dado?
7. **C7 · Modelo comercial.** Como cobra.

Como pontuei: de C1 a C6, "sim" vale 1, "parcial" vale ½, "não" ou "não declarado" valem 0. C7 não pontua. "Não declarado" soma zero porque não dá para contar com o que o fornecedor não escreveu; a célula não afirma que ele deixe de fazer. Empate se desfaz por C4, depois por C5, depois por C6, depois por ordem alfabética. É a mesma régua dos outros rankings do blog, como o de [CDP para e-commerce](https://precisian.io/blog/pt-BR/posts/cdp-para-ecommerce/). Cada célula saiu do site oficial do fornecedor, lido em 26 e 27/10/2026.

Ficou de fora, de propósito, o tamanho do catálogo. Mil conectores não ajudam se o que você usa não está entre eles, e C4 já mede isso.

## Como as 11 se comparam nos critérios C1 a C7?

| # | Ferramenta | C1 | C2 | C3 | C4 | C5 | C6 | C7 | Pontos |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Precisian | sim | sim | sim | sim | sim | sim | assinatura mensal, sem setup | 6 |
| 2 | OWOX | parcial | parcial | sim | parcial | parcial | sim | créditos, preço público | 4 |
| 3 | Fivetran | parcial | parcial | parcial | parcial | parcial | sim | por linha ativa, tarifa paga não publicada | 3,5 |
| 4 | Funnel | não declarado | parcial | sim | parcial | parcial | parcial | assinatura, preço público | 3 |
| 5 | Improvado | não declarado | parcial | sim | parcial | parcial | parcial | por linhas/ano, preço público | 3 |
| 6 | Airbyte | parcial | não declarado | sim | parcial | não | sim | créditos, preço público | 3 |
| 7 | Kondado | parcial | parcial | sim | parcial | não | parcial | por registros, preço público em real | 3 |
| 8 | Windsor.ai | sim | não declarado | sim | parcial | não | parcial | assinatura, preço público | 3 |
| 9 | Peliqan | parcial | não declarado | sim | parcial | não | parcial | por fonte, preço público | 2,5 |
| 10 | Supermetrics | não declarado | parcial | sim | parcial | não | parcial | assinatura, preço público | 2,5 |
| 11 | Weld | não declarado | parcial | sim | parcial | não | parcial | assinatura, preço público | 2,5 |

Duas colunas separam a Precisian das outras. Em C2, nenhuma das dez ferramentas declarava, em 26/10/2026, definição de métrica de negócio versionada e aprovada pelo cliente. O mais perto disso é o dbt Semantic Layer, da mesma empresa que a Fivetran desde 01/06/2026, onde "data teams" centralizam as definições de métrica ([dbt](https://docs.getdbt.com/docs/use-dbt-semantic-layer/dbt-sl)); quem escreve é o time do cliente. Em C5, a modelagem fica com o cliente em todas as dez. Funnel, Improvado e OWOX vendem ajuda humana em planos específicos, e a Fivetran mantém os conectores dela.

C3 quase não diferencia ninguém: nove das dez marcam "sim", e a Fivetran chega lá pelo MCP do dbt. Por que o MCP sem definição de métrica devolve número errado com confiança está em [alucinação de métrica](https://precisian.io/blog/pt-BR/posts/alucinacao-de-metrica/).

## O que cada uma faz bem, e para quem é?

### 1. Precisian

Plataforma de dados gerenciados. Ingere mídia (GA4, Meta Ads, Google Ads, TikTok Ads) e catálogo (VTEX e Magento prontos; outras fontes como conexão adicional), guarda num data lake isolado por cliente na infra da Precisian e modela na [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/), com métricas versionadas que o cliente aprova. O acesso é por MCP, API e o BI do cliente. A Precisian Foundation cuida de coleta, sustentação e monitoramento, e modela as métricas com o time do cliente. Não tem painel nem plano de autosserviço. Plataforma em operação em mais de 40 contas ativas. **Para quem:** médio porte sem time de dados que quer usar a própria IA sobre o número.

### 2. OWOX

Não é ELT puro: monta data marts sobre o warehouse que o cliente já tem (BigQuery, Snowflake, Redshift, Databricks), com KPIs "defined once by a data analyst" e respostas no Claude e no ChatGPT ([OWOX](https://www.owox.com/pricing)). Tem versão open source; o plano Team custa US$ 790/mês e inclui "OWOX data experts set it up with you". As fontes do repositório são de mídia e Shopify, sem VTEX nem Magento ([GitHub](https://github.com/OWOX/owox-data-marts)). **Para quem:** quem já tem mídia e GA4 no BigQuery e um analista para definir os marts.

### 3. Fivetran

Referência global em ELT, com "900+ sources and destinations", plano Free de 500 mil linhas ativas por mês e um SDK para escrever conector próprio ([Fivetran](https://www.fivetran.com/pricing)). Desde 01/06/2026 é dona do dbt ([release](https://www.fivetran.com/press/fivetran-dbt-labs-complete-merger-to-create-the-data-infrastructure-for-trusted-ai-agents)). VTEX e Mercado Livre não constam no catálogo ([docs](https://fivetran.com/docs/connectors)). **Para quem:** time de dados com warehouse e dbt.

### 4. Funnel

Plataforma de dados de marketing sueca, com "Semantics" para regra de negócio desde o plano de entrada (a partir de US$ 300/mês no anual) e MCP somente leitura em todos os planos ([Funnel](https://funnel.io/pricing); [MCP](https://help.funnel.io/en/articles/15014203-quick-start-guide-using-funnel-mcp)). O plano Business traz "Data guarantee" para conectar fonte ausente. **Para quem:** time de marketing médio ou grande com alguém para manter as regras no workspace.

### 5. Improvado

O maior catálogo da lista, "1,400+ connectors", inclusive Mercado Libre com pedidos e vendas ([Improvado](https://improvado.io/integrations/mercado-libre)), e MCP com 84 ferramentas de leitura e escrita. Os planos completos partem de US$ 20 mil/ano; o Growth inclui créditos de serviço profissional ([preços](https://improvado.io/pricing)). **Para quem:** médio-grande porte com marketing ops e orçamento nessa faixa.

### 6. Airbyte

ELT em nuvem a partir de US$ 20/mês, ou instalado por você sem custo de licença ([Airbyte](https://airbyte.com/pricing)). Em 26/10/2026, 71 dos 574 conectores de origem do registro do Cloud eram mantidos pela própria Airbyte; o resto é da comunidade ([registro](https://connectors.airbyte.com/files/registries/v0/cloud_registry.json); [níveis](https://docs.airbyte.com/integrations/connector-support-levels)). **Para quem:** time com engenheiro de dados e orçamento curto.

### 7. Kondado

A única brasileira da lista e a única com conector de VTEX; tem também Mercado Livre, Nuvemshop, Bling e Tiny prontos ([conectores](https://kondado.com.br/conectores.html)). Parte de R$ 99/mês, sem fidelidade, com MCP somente leitura incluso ([MCP](https://kondado.com.br/mcp/)). Os Termos, cláusula 9.4, autorizam o uso de conteúdo e prompts do cliente para treinar IA de forma "irrevogável" e "perpétua" ([Termos](https://kondado.com.br/wiki/a/nossos-termos-de-uso)). A comparação completa está em [Precisian ou Kondado](https://precisian.io/blog/pt-BR/posts/precisian-ou-kondado/). **Para quem:** PME com alguém que escreve SQL ou monta dashboard.

### 8. Windsor.ai

A entrada mais barata: US$ 19/mês no anual e o plano Forever Free, com uma fonte ([Windsor.ai](https://windsor.ai/pricing/)). Declara isolamento por cliente e não guarda o dado de forma permanente ([segurança](https://windsor.ai/security/)). Tem página de campos de um conector "Bling!", que pelos campos (NF-e, PIX) parece ser o ERP brasileiro. **Para quem:** time pequeno que quer relatório de mídia em planilha ou Looker Studio.

### 9. Peliqan

Belga, fundada em 2022: warehouse embutido, ELT, apps em Python e versão white-label com "Dedicated warehouse per customer" ([Peliqan](https://peliqan.io/pricing/)). Cobra a partir de €75/mês por fonte. **Para quem:** time técnico ou agência que quer revender plataforma com a própria marca.

### 10. Supermetrics

O caminho mais curto da conta de anúncio para Sheets e Looker Studio, a partir de US$ 39/mês no anual ([Supermetrics](https://supermetrics.com/pricing)). O MCP cria campanha, que nasce pausada ([docs](https://docs.supermetrics.com/docs/supermetrics-mcp-server)). **Para quem:** analista de mídia ou agência que monta relatório recorrente.

### 11. Weld

Dinamarquesa: ELT, transformação SQL com histórico de versão, dbt e reverse ETL num produto, a partir de US$ 99/mês no anual ([Weld](https://weld.app/pricing)). O MCP só consulta dado se o workspace liberar; o padrão é só metadado ([docs](https://weld.app/docs/weld-connect/mcp-server)). **Para quem:** empresa com analista que escreve SQL.

## O que muda entre mover o dado e operar o dado?

A ferramenta de ETL termina quando a linha chega ao destino. Depois disso, três trabalhos ficam com alguém. Escrever o que é receita: com ou sem frete, antes ou depois de cancelamento e devolução, somando ou não o marketplace. Perceber que um conector parou de trazer dado sem dar erro, o caso descrito em [como saber se o pipeline de dados quebrou](https://precisian.io/blog/pt-BR/posts/como-saber-se-o-pipeline-de-dados-quebrou/). E reconciliar o que a mídia declara com o que o ERP faturou.

Com time de dados, isso é rotina e a ferramenta de ETL basta. Sem time de dados, é aí que o projeto para. O custo dessa manutenção, que não aparece na tabela de preço, está em [Fivetran, Airbyte ou serviço gerenciado](https://precisian.io/blog/pt-BR/posts/fivetran-airbyte-ou-servico-gerenciado/), e a diferença entre conector e definição de métrica, em [Supermetrics, Windsor.ai ou plataforma de dados](https://precisian.io/blog/pt-BR/posts/supermetrics-windsor-ou-plataforma-de-dados/).

## Quando escolher uma ferramenta de ETL e não a Precisian?

Quando você tem quem modele. Com engenheiro ou analista de dados e warehouse pago, a Precisian cobra por um trabalho que seu time já faz, e Fivetran, Airbyte ou Weld custam menos. Também quando você quer começar hoje: a Precisian não tem plano sem custo nem autosserviço, e Airbyte, Windsor.ai, Supermetrics e Kondado se contratam no cartão.

Loja pequena, de baixo ticket, em Nuvemshop, Loja Integrada ou Bling está fora do público da Precisian, e a Kondado atende melhor e mais barato. Quem precisa de painel pronto escolhe Funnel ou Kondado (templates de dashboard). Quem quer que o agente crie ou altere campanha escolhe Supermetrics, Windsor.ai ou Improvado, porque a Precisian não ativa mídia.

## Qual escolher, por perfil?

**Time de dados com warehouse e dbt:** Fivetran; Airbyte se o orçamento for curto.

**Analista que escreve SQL e quer tudo num lugar:** Weld ou Peliqan.

**Mídia no BigQuery e vontade de perguntar ao Claude:** OWOX.

**Relatório de mídia em planilha:** Supermetrics ou Windsor.ai.

**Marketing ops com orçamento enterprise e Mercado Livre no centro:** Improvado.

**PME em Bling, Tiny ou Nuvemshop:** Kondado.

**Médio porte em VTEX ou Magento, sem time de dados, com mídia, marketplace e ERP que não fecham:** a Precisian. O que entra na modelagem está em [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/).

## O que este ranking não cobre?

Não testei nenhuma das 11 em conta real; tudo vem do que cada fornecedor publica. O catálogo da Windsor.ai é renderizado em JavaScript e a busca por VTEX ali foi feita por pesquisa, não pela lista completa. Não compara velocidade de sincronização nem custo total em 24 meses, que está em [construir ou contratar um data lake](https://precisian.io/blog/pt-BR/posts/construir-ou-contratar-data-lake/). Ficaram de fora Stitch, Hevo, Dadosfera e Nekt.

---

Se a sua ferramenta de ETL entrega a linha todo dia e mesmo assim ninguém sabe dizer quanto a campanha vendeu, o primeiro passo é medir a distância entre o que a mídia declara e o que o ERP faturou. O que a Precisian inclui para fechar essa conta, e como cobra, está em [preços](https://precisian.io/precos), sem compromisso de contrato, mas sem promessa de resposta em 30 minutos também.
