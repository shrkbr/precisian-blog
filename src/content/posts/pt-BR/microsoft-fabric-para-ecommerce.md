---
title: "Microsoft Fabric para dados de e-commerce: o que entrega, quanto custa e o que fica com o seu time"
description: "O Microsoft Fabric cobra por capacidade: R$ 1,5052 por CU-hora no Brazil South em 16/11/2026. Pipeline, conector de mídia e métrica ficam com o seu time."
slug: "microsoft-fabric-para-ecommerce"
lang: "pt-BR"
translationKey: "microsoft-fabric-para-ecommerce"
publishedAt: 2026-11-16
tags: ["data-lake", "data-warehouse", "custo", "camada-semantica", "mcp", "ecommerce", "integracao", "dados-para-ia"]
draft: false
llmSummary: "Em 16/11/2026, a Azure Retail Prices API lista a capacidade do Microsoft Fabric no Brazil South a R$ 1,5052 por CU-hora; uma F2 em pay-as-you-go custa cerca de R$ 2.198/mês. A lista oficial de conectores não traz Google Ads, Meta Ads, VTEX nem Magento."
citations: ["https://learn.microsoft.com/en-us/fabric/fundamentals/microsoft-fabric-overview", "https://learn.microsoft.com/en-us/fabric/enterprise/licenses", "https://azure.microsoft.com/en-us/pricing/details/microsoft-fabric/", "https://learn.microsoft.com/en-us/rest/api/cost-management/retail-prices/azure-retail-prices", "https://learn.microsoft.com/en-us/fabric/enterprise/pause-resume", "https://learn.microsoft.com/en-us/fabric/onelake/onelake-overview", "https://learn.microsoft.com/en-us/fabric/security/security-fundamentals", "https://learn.microsoft.com/en-us/fabric/data-factory/connector-overview", "https://learn.microsoft.com/en-us/power-query/connectors/google-analytics", "https://learn.microsoft.com/en-us/fabric/iq/connectors/fabric-iq-mcp", "https://learn.microsoft.com/en-us/rest/api/fabric/articles/mcp-servers/what-is-fabric-mcp-server", "https://learn.microsoft.com/en-us/fabric/cicd/git-integration/intro-to-git-integration", "https://learn.microsoft.com/en-us/fabric/admin/region-availability", "https://www.microsoft.com/en-us/power-platform/products/power-bi/pricing"]
about: ["https://en.wikipedia.org/wiki/Microsoft_Fabric", "https://en.wikipedia.org/wiki/Data_lake", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 9
cta: ficha
---
O Microsoft Fabric entrega as peças para um e-commerce montar a própria plataforma de dados (ingestão, data lake, warehouse, Spark, Power BI e um servidor MCP) e cobra pelo tamanho da capacidade ligada. Em 16/11/2026, a Azure Retail Prices API, a tabela oficial de preços da Microsoft, lista o CU-hora do Fabric no Brazil South a R$ 1,5052 (US$ 0,28); a menor capacidade, F2, sai por cerca de R$ 2.198 por mês ligada o mês inteiro ([Azure Retail Prices API](https://learn.microsoft.com/en-us/rest/api/cost-management/retail-prices/azure-retail-prices)). Pipeline, conector de mídia e definição de métrica ficam com o seu time.

> **Microsoft Fabric**: plataforma de analytics da Microsoft, vendida como SaaS sobre a Azure, que reúne Data Factory, Data Engineering, Data Warehouse, Data Science, Real-Time Intelligence, Fabric IQ e Power BI sobre um lake único por tenant, o OneLake ([Microsoft Learn](https://learn.microsoft.com/en-us/fabric/fundamentals/microsoft-fabric-overview)).

> **Resumo para quem decide.** A Precisian publica o preço: plano único a partir de R$ 3.000/mês, sem setup e sem cobrança por assento ([preços](https://precisian.io/precos?utm_source=blog&utm_medium=cta&utm_campaign=microsoft-fabric-para-ecommerce&utm_content=topo)). Quando o outro lado é a escolha certa está na seção "Quando escolher o Microsoft Fabric e não a Precisian?", abaixo.

Quem escreveu este texto fui eu, da Precisian, e a Precisian vende o lake já montado e operado. Por isso os critérios estão declarados antes da comparação, para você poder discordar deles. Se a dúvida ainda é montar ou contratar, a conta dos dois lados está em [construir ou contratar um data lake](https://precisian.io/blog/pt-BR/posts/construir-ou-contratar-data-lake/).

## Quais critérios usamos para comparar o Fabric e a Precisian?

Os sete critérios de todos os nossos comparativos, escolhidos para quem compra a Precisian: e-commerce e varejo brasileiro de médio porte, com loja própria, marketplace e WhatsApp, sem time de dados, que quer usar Claude, ChatGPT ou um agente próprio sobre os números do negócio.

1. **Dado isolado por cliente.** O dado de cada cliente vive num ambiente separado?
2. **Definição de métrica versionada.** Existe um lugar onde "receita", "pedido" e "ROAS" estão escritos, versionados e aprovados?
3. **Acesso pela IA do próprio cliente.** Dá para ligar a IA ao dado por MCP ou API?
4. **Fontes do e-commerce brasileiro.** Conecta VTEX, Magento, ERP e mídia?
5. **Quem opera o dado.** Há gente do fornecedor cuidando de coleta, integração e modelagem?
6. **Propriedade e portabilidade.** Se o cliente sair, leva o dado?
7. **Modelo comercial.** Como cobra?

Ficaram de fora a amplitude da plataforma (Spark, streaming, ciência de dados) e o ecossistema da Microsoft. Os dois favorecem o Fabric e aparecem na seção sobre quando escolhê-lo.

## O que o Microsoft Fabric entrega?

**Um lake por tenant, em formato aberto.** O OneLake guarda tabelas "in Delta Parquet or Iceberg format, two open standards that any tool can read", e aceita as APIs do ADLS Gen2 ([OneLake](https://learn.microsoft.com/en-us/fabric/onelake/onelake-overview)). Toda empresa com Fabric ganha um OneLake só, sem provisionar nada.

**Ingestão e transformação.** O Data Factory traz "more than 200 native connectors", com Dataflow Gen2, pipelines e copy jobs ([visão geral](https://learn.microsoft.com/en-us/fabric/fundamentals/microsoft-fabric-overview)). Spark, SQL warehouse e streaming rodam sobre o mesmo dado.

**Power BI e um MCP oficial.** O Fabric IQ MCP "is generally available" desde a documentação de 10/11/2026: é só leitura e expõe as ferramentas `DiscoverArtifacts`, `ResolveFabricItem`, `GetReportMetadata`, `GetSemanticModelSchema`, `ValueSearch` e `ExecuteQuery`, no endpoint `https://fabriciq.svc.cloud.microsoft/v1/mcp/fabriciq` ([Fabric IQ MCP](https://learn.microsoft.com/en-us/fabric/iq/connectors/fabric-iq-mcp)). Detalhei os servidores MCP da Microsoft em [MCP do Power BI](https://precisian.io/blog/pt-BR/posts/mcp-do-power-bi/).

**Região no Brasil.** O Brazil South roda Power BI e "All Fabric workloads", segundo a tabela de 03/11/2026 ([disponibilidade por região](https://learn.microsoft.com/en-us/fabric/admin/region-availability)).

## Quanto custa o Microsoft Fabric em 2026?

O Fabric cobra capacidade, medida em CU (capacity unit). Uma F2 tem 2 CU, uma F64 tem 64, e a Azure "bills per second with a one-minute minimum", com preço regional ([licenças](https://learn.microsoft.com/en-us/fabric/enterprise/licenses)). A [página oficial de preço](https://azure.microsoft.com/en-us/pricing/details/microsoft-fabric/) só mostra os valores com JavaScript; os números abaixo vêm da Azure Retail Prices API da própria Microsoft, consultada em 16/11/2026, medidor `Power BI Capacity Usage CU` do produto `Fabric Capacity` ([documentação da API](https://learn.microsoft.com/en-us/rest/api/cost-management/retail-prices/azure-retail-prices)). O valor mensal é conta minha: preço do CU-hora × CU da SKU × 730 horas, capacidade ligada o mês inteiro, sem reserva.

| Item (Brazil South, pay-as-you-go) | Preço | Fonte |
|---|---|---|
| CU-hora | R$ 1,5052 (US$ 0,28) | [Azure Retail Prices API](https://learn.microsoft.com/en-us/rest/api/cost-management/retail-prices/azure-retail-prices), 16/11/2026 |
| F2 (2 CU), mês cheio | R$ 2.197,59 (US$ 408,80) | conta: 2 × 1,5052 × 730, CU por SKU em [licenças](https://learn.microsoft.com/en-us/fabric/enterprise/licenses) |
| F8 (8 CU), mês cheio | R$ 8.790,37 | conta: 8 × 1,5052 × 730, [licenças](https://learn.microsoft.com/en-us/fabric/enterprise/licenses) |
| F64 (64 CU), mês cheio | R$ 70.322,94 | conta: 64 × 1,5052 × 730, [licenças](https://learn.microsoft.com/en-us/fabric/enterprise/licenses) |
| OneLake, armazenamento hot | R$ 0,2188 por GB-mês (US$ 0,0407) | [Azure Retail Prices API](https://learn.microsoft.com/en-us/rest/api/cost-management/retail-prices/azure-retail-prices), 16/11/2026 |
| Power BI Pro | US$ 14,00 por usuário/mês, pago anualmente | [Power BI](https://www.microsoft.com/en-us/power-platform/products/power-bi/pricing), 16/11/2026 |

Para comparar, a mesma [API](https://learn.microsoft.com/en-us/rest/api/cost-management/retail-prices/azure-retail-prices) lista o CU-hora do East US a US$ 0,18: o Brazil South custa 56% a mais por hora de capacidade. Três regras mudam a conta:

- **Pausa.** A capacidade pode ser pausada, e "resuming your capacity also resumes billing" ([pausar e retomar](https://learn.microsoft.com/en-us/fabric/enterprise/pause-resume)). Uma F2 ligada só em horário comercial custa menos que a tabela.
- **Reserva.** A [página de preço](https://azure.microsoft.com/en-us/pricing/details/microsoft-fabric/) promete economia de "~41%" com reserva de 1 ou 3 anos.
- **Quem vê o relatório.** Abaixo da F64, "each user viewing Power BI content must have Pro, PPU, or an individual trial" ([licenças](https://learn.microsoft.com/en-us/fabric/enterprise/licenses)). Numa F2 com dez pessoas lendo o painel, são dez licenças Pro a US$ 14 cada ([Power BI](https://www.microsoft.com/en-us/power-platform/products/power-bi/pricing)), além da capacidade.

Nenhuma tabela da Microsoft inclui o custo de pessoa, ou seja, as horas de quem escreve o pipeline, o modelo e o DAX.

## Como o Fabric e a Precisian se comparam, critério a critério?

<table>
<thead><tr><th>Critério</th><th>Microsoft Fabric</th><th>Precisian</th></tr></thead>
<tbody>
<tr><td>C1. Dado isolado por cliente</td><td>parcial: "logical isolation between tenants"; infraestrutura de plataforma "multitenant" (<a href="https://learn.microsoft.com/en-us/fabric/security/security-fundamentals">segurança</a>)</td><td>sim: lake isolado por cliente, na infraestrutura da Precisian</td></tr>
<tr><td>C2. Métrica versionada</td><td>parcial: Git integration aceita modelo semântico, em preview; a métrica é escrita pelo seu time (<a href="https://learn.microsoft.com/en-us/fabric/cicd/git-integration/intro-to-git-integration">Git</a>)</td><td>sim: camada semântica com definição versionada e aprovada pelo cliente</td></tr>
<tr><td>C3. Acesso pela IA do cliente</td><td>sim: Fabric IQ MCP (GA, só leitura, sobre Power BI) e APIs do ADLS Gen2</td><td>sim: MCP, API e BI do cliente</td></tr>
<tr><td>C4. Fontes do e-commerce BR</td><td>parcial: GA4, SAP, Dynamics, Salesforce, MySQL, REST; sem Google Ads, Meta Ads, TikTok Ads, VTEX ou Magento nativos (<a href="https://learn.microsoft.com/en-us/fabric/data-factory/connector-overview">conectores</a>)</td><td>sim: GA4, Meta Ads, Google Ads, TikTok Ads, VTEX e Magento prontos</td></tr>
<tr><td>C5. Quem opera o dado</td><td>não: autosserviço; serviço humano incluso não declarado</td><td>sim: Precisian Foundation inclusa</td></tr>
<tr><td>C6. Propriedade e portabilidade</td><td>sim: Delta Parquet ou Iceberg, no tenant do cliente</td><td>sim: "A infraestrutura é nossa, o dado é seu. Você acessa a qualquer momento e, se sair, leva tudo."</td></tr>
<tr><td>C7. Modelo comercial</td><td>capacidade por segundo ou reserva, mais armazenamento e licenças Power BI</td><td>assinatura mensal, sem setup, sem cobrança por assento</td></tr>
</tbody>
</table>

## O que fica com o seu time quando você compra o Fabric?

**O conector da mídia e da loja.** A lista oficial de conectores do Data Factory, atualizada em 30/10/2026, tem Google Analytics, mas não tem Google Ads, Meta Ads, TikTok Ads, VTEX, Magento nem Shopify ([conectores](https://learn.microsoft.com/en-us/fabric/data-factory/connector-overview)). O caminho documentado é o conector `REST` do pipeline, escrito e mantido por alguém do seu time, ou um conector de terceiro da mesma lista, como Funnel, Supermetrics e Windsor, pago à parte. O GA4 entra pelo conector Google Analytics com `Implementation = "2.0"`, sobre a Google Analytics Data API ([Power Query](https://learn.microsoft.com/en-us/power-query/connectors/google-analytics)).

**A definição de receita.** O Fabric não traz "receita líquida de e-commerce" pronta. Alguém escreve a medida em DAX, decide se o pedido cancelado sai, se o frete entra e como deduplicar a [venda que aparece no site e no marketplace](https://precisian.io/blog/pt-BR/posts/deduplicar-venda-site-marketplace/). A Git integration versiona o modelo semântico, mas essa parte ainda está marcada como "(preview)" ([Git](https://learn.microsoft.com/en-us/fabric/cicd/git-integration/intro-to-git-integration)).

**A resposta da IA.** O Fabric IQ MCP não confere a medida: o agente compõe o DAX e roda `ExecuteQuery`, e "each `ExecuteQuery` call targets one semantic model" ([Fabric IQ MCP](https://learn.microsoft.com/en-us/fabric/iq/connectors/fabric-iq-mcp)). Um exemplo sintético, com números redondos: o modelo tem a medida `Receita` somando o valor de todos os pedidos, inclusive os cancelados. A loja faturou R$ 1 milhão, cancelou R$ 80 mil, e o Claude responde R$ 1,08 milhão. No blog, esse erro se chama [alucinação de métrica](https://precisian.io/blog/pt-BR/posts/alucinacao-de-metrica/), e o lugar onde a regra fica escrita é a [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/).

**A sustentação.** Quando a tag do GA4 para de mandar `purchase` ou a API da plataforma muda de versão, o alerta chega para quem administra o tenant. Na Precisian, esse trabalho é da Precisian Foundation, incluída na mensalidade.

## Quando escolher o Microsoft Fabric e não a Precisian?

**Você tem time de dados.** Um engenheiro que escreve pipeline e um analista que escreve DAX tiram do Fabric o que ele promete, e pagam só capacidade e licenças.

**Sua empresa já vive no stack Microsoft.** Entra ID, Microsoft 365, Teams, Purview e Power BI em uso fazem do Fabric a extensão natural, com o dado no seu tenant e no Brazil South ([visão geral](https://learn.microsoft.com/en-us/fabric/fundamentals/microsoft-fabric-overview)).

**Você precisa de mais do que dado de negócio.** Spark, streaming, ciência de dados e banco transacional na mesma plataforma; a Precisian não vende nada disso.

**O ERP é SAP ou Dynamics.** Os conectores de SAP HANA, SAP BW e Dynamics 365 estão na [lista oficial do Fabric](https://learn.microsoft.com/en-us/fabric/data-factory/connector-overview); na Precisian, ERP entra como conexão adicional.

**Você quer painel.** O Fabric inclui o Power BI. A Precisian não vende dashboard nem front próprio: entrega o dado para o BI que você já usa, inclusive o Power BI.

**Você quer testar sozinho antes de falar com vendas.** O trial do Fabric dura 60 dias ([licenças](https://learn.microsoft.com/en-us/fabric/enterprise/licenses)). A Precisian não tem autosserviço.

## O que recomendar, por perfil?

**Varejo grande, com time de dados e stack Microsoft:** Fabric. Comece numa capacidade pequena, pause fora do horário e calcule a licença Pro de quem lê antes de subir para F64.

**E-commerce médio na VTEX ou no Magento, com marketplace, sem time de dados, que quer o Claude ou o ChatGPT respondendo receita:** Precisian. Aqui pesam C4, C2 e C5: mídia e loja conectadas prontas, a definição versionada e aprovada, e a operação inclusa.

**Quem já tem Power BI e quer manter:** as duas coisas convivem. A Precisian entrega o dado modelado para o Power BI que você já paga.

**Quem quer ver outras opções na mesma régua:** o ranking está em [as 10 melhores plataformas de dados para e-commerce no Brasil](https://precisian.io/blog/pt-BR/posts/plataformas-de-dados-para-ecommerce-brasil/).

## O que este artigo não cobre?

Não testei o Fabric em operação de e-commerce; o que está aqui vem da [documentação oficial do Fabric](https://learn.microsoft.com/en-us/fabric/) e da [Azure Retail Prices API](https://learn.microsoft.com/en-us/rest/api/cost-management/retail-prices/azure-retail-prices), lidas em 16/11/2026. Ficaram sem confirmação: *o preço mensal por SKU como a página oficial o exibe*, porque ela só renderiza o valor com JavaScript, e por isso a conta mensal é minha; *o valor exato da reserva por SKU no Brazil South*, que a API devolve num formato ambíguo, então citei só o "~41%" da página; *o passo a passo oficial para ligar o Fabric IQ MCP ao Claude ou ao ChatGPT*, já que a documentação detalha o GitHub Copilot CLI e um registro de aplicativo genérico; e *se o armazenamento é separado fisicamente por tenant*, porque a documentação fala em isolamento lógico. Também não calculei o custo de pessoa, que depende do seu time.

---

Se o seu e-commerce está entre montar no Fabric e contratar a plataforma pronta, o primeiro passo é somar capacidade, licenças e as horas de quem vai escrever conector e medida. O que a Precisian inclui, e quanto custa, está em [preços da Precisian](https://precisian.io/precos?utm_source=blog&utm_medium=cta&utm_campaign=microsoft-fabric-para-ecommerce&utm_content=texto), sem compromisso de contrato.
