---
title: "O que é data warehouse (e quando o e-commerce precisa de um)"
description: "Data warehouse é o banco analítico que guarda dado de várias fontes já modelado em tabelas, com histórico, para consulta e relatório."
slug: "o-que-e-data-warehouse"
lang: "pt-BR"
translationKey: "o-que-e-data-warehouse"
publishedAt: 2026-11-11
tags: ["data-warehouse", "data-lake", "ecommerce", "ga4", "camada-semantica"]
draft: false
llmSummary: "Data warehouse é a plataforma de análise que integra dado estruturado de várias fontes, com histórico, segundo o Google Cloud. No e-commerce, o caso mais comum é o export do GA4 para o BigQuery, limitado a 1 milhão de eventos por dia em propriedades padrão (Ajuda do Google Analytics)."
citations: ["https://cloud.google.com/learn/what-is-a-data-warehouse", "https://aws.amazon.com/what-is/data-warehouse/", "https://learn.microsoft.com/en-us/azure/architecture/data-guide/relational-data/online-analytical-processing", "https://learn.microsoft.com/en-us/azure/architecture/data-guide/scenarios/data-lake", "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/grain/", "https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/star-schema-olap-cube/", "https://support.google.com/analytics/answer/9358801", "https://cloud.google.com/bigquery/docs/sandbox", "https://cloud.google.com/bigquery/pricing", "https://help.vtex.com/pt/docs/tutorials/performance-de-vendas"]
about: ["https://en.wikipedia.org/wiki/Data_warehouse", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
cta: newsletter
---
Data warehouse é o banco de dados feito para análise: ele recebe dado de várias fontes, organiza tudo em tabelas com esquema definido antes da carga e guarda o histórico para consulta e relatório. O Google Cloud o define como uma plataforma "para análise e relatório de dados estruturados e semiestruturados de várias fontes" ([Google Cloud](https://cloud.google.com/learn/what-is-a-data-warehouse), consultado em 11/11/2026). No e-commerce brasileiro, o primeiro contato costuma ser o export do GA4 para o BigQuery.

> **Data warehouse**: repositório central, separado dos sistemas que operam a venda, onde o dado de várias fontes chega já modelado em tabelas (esquema na escrita) e fica guardado com histórico para responder perguntas de negócio por consulta SQL ou ferramenta de BI.

Todas as citações deste texto foram conferidas no dia da publicação. As fontes estão em inglês no original; as traduções são livres.

## O que Google Cloud, AWS e Microsoft dizem que é um data warehouse?

As três definições concordam no essencial e põem a ênfase em lugares diferentes.

| Fonte | Definição (trecho original) | Onde põe a ênfase |
|---|---|---|
| [Google Cloud](https://cloud.google.com/learn/what-is-a-data-warehouse) | "an enterprise data platform used for the analysis and reporting of structured and semi-structured data from multiple data sources" | Integrar fontes e dar "a long-range view of data over time" |
| [AWS](https://aws.amazon.com/what-is/data-warehouse/) | "a central repository of information that can be analyzed to make more informed decisions" | O dado precisa estar "in a tabular format, which is where the schema comes into play" |
| [Microsoft](https://learn.microsoft.com/en-us/azure/architecture/data-guide/relational-data/online-analytical-processing) | Sistemas analíticos (OLAP) "optimized for heavy-read and low-write tasks", que "often preserve historical data" | Separar a leitura analítica do sistema transacional (OLTP) |

O ponto comum é a separação. O banco da loja (o OMS da VTEX, o banco do ERP) existe para registrar pedido rápido e com segurança. O warehouse existe para ler milhões de linhas de uma vez sem atrapalhar quem está vendendo. O Google Cloud resume o motivo: guardar o histórico "on a separate server from operational data", para que as consultas não afetem o desempenho dos sistemas operacionais.

## Como um data warehouse funciona na prática?

Em três passos: extrair das fontes, modelar e consultar.

**1. O dado chega das fontes.** Pedidos da plataforma de loja, notas do ERP, custo de mídia de Meta e Google Ads, eventos do GA4. Essa carga é o trabalho de ETL ou ELT, assunto do [verbete sobre ETL](https://precisian.io/blog/pt-BR/posts/o-que-e-etl/).

**2. O dado vira tabela de negócio.** O modelo clássico é o dimensional, documentado pelo Kimball Group: tabelas de fato, com as medidas (valor, quantidade, custo), ligadas a tabelas de dimensão, com o contexto (cliente, produto, canal, data). O desenho em estrela ("star schema") é isso: fatos ligados a dimensões "via primary/foreign key relationships" ([Kimball Group](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/star-schema-olap-cube/)).

A decisão mais importante desse passo tem nome: o **grão**. O Kimball Group chama a declaração do grão de "the pivotal step in a dimensional design", porque ela define "exactly what a single fact table row represents" ([Kimball Group](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/grain/)). Uma linha por pedido ou uma linha por item do pedido? A resposta muda o ticket médio, a contagem de pedidos e a soma de frete. Misturar grãos na mesma tabela é o erro que o próprio Kimball proíbe: "different grains must not be mixed in the same fact table".

**3. Alguém consulta.** Analista em SQL, ferramenta de BI, planilha conectada, automação, agente de IA. O warehouse responde rápido porque a forma do dado já foi decidida na entrada.

## Onde o data warehouse aparece num e-commerce brasileiro?

O caminho mais comum começa no GA4. A integração nativa do GA4 com o BigQuery, o warehouse do Google, entrega o evento cru, sem amostragem, uma vez por dia. Três detalhes da documentação mudam o planejamento:

| O que a documentação diz | Efeito numa loja | Fonte |
|---|---|---|
| Propriedade padrão do GA4 tem limite diário de export de 1 milhão de eventos | Loja com muito tráfego em data de pico precisa filtrar eventos ou migrar para o Analytics 360 | [Ajuda do Google Analytics](https://support.google.com/analytics/answer/9358801) |
| O export de streaming é "best-effort" e pode ter lacunas; a tabela `events_intraday_YYYYMMDD` é apagada quando a `events_YYYYMMDD` fica completa | Relatório de "hoje" lido do streaming muda depois | [Ajuda do Google Analytics](https://support.google.com/analytics/answer/9358801) |
| No sandbox do BigQuery, tabelas e partições "automatically expire after 60 days" | Quem ligou o export no sandbox e não mudou a expiração perdeu o histórico com mais de 60 dias | [BigQuery](https://cloud.google.com/bigquery/docs/sandbox) |

O sandbox funciona sem cartão de crédito e sem conta de faturamento ([BigQuery](https://cloud.google.com/bigquery/docs/sandbox)), e por isso é o caminho mais curto para testar o BigQuery. A mesma página manda atualizar a expiração padrão das tabelas depois de sair dele. Quem esquece descobre, ao comparar a Black Friday com a do ano anterior, que o histórico tem dois meses.

O custo de consulta também é documentado: no modelo sob demanda, o BigQuery cobra US$ 6,25 por TiB processado, e o primeiro TiB de cada mês não é cobrado ([BigQuery, preços](https://cloud.google.com/bigquery/pricing)). Tabela que não é alterada por 90 dias seguidos passa a armazenamento de longo prazo, com preço cerca de 50% menor. Como o agente de IA que consulta warehouse também gera custo por consulta, vale ler o post sobre o [MCP do BigQuery](https://precisian.io/blog/pt-BR/posts/mcp-do-bigquery/).

## Data warehouse é a mesma coisa que data lake?

Não. A diferença é quando a forma do dado é decidida.

| Critério | Data warehouse | Data lake | Banco da loja (OLTP) |
|---|---|---|---|
| Para que existe | Análise e relatório | Guardar tudo, inclusive o cru | Registrar a operação |
| Quando o esquema é aplicado | Na escrita | Na leitura | Na escrita |
| Forma do dado | Tabelas modeladas (fato e dimensão) | Como a fonte entregou | Tabelas normalizadas da aplicação |
| Histórico | O que foi carregado e modelado | O que foi copiado | O que a aplicação mantém |
| Reprocessar quando a regra muda | Só se o dado bruto também foi guardado | Sim, a partir do bruto | Não se aplica |
| Consulta analítica pesada | Feito para isso | Só na camada curada | Atrapalha a operação |

A coluna do lake segue a comparação da [Microsoft](https://learn.microsoft.com/en-us/azure/architecture/data-guide/scenarios/data-lake) (*schema-on-read* contra *schema-on-write*); a do banco transacional, a página de [OLAP da Microsoft](https://learn.microsoft.com/en-us/azure/architecture/data-guide/relational-data/online-analytical-processing), que registra que o OLTP usa tabelas normalizadas e o OLAP usa "a star or snowflake schema". A AWS acrescenta o *data mart*: um warehouse que "serves the needs of a specific team or business unit" ([AWS](https://aws.amazon.com/what-is/data-warehouse/)).

O verbete irmão está em [o que é data lake](https://precisian.io/blog/pt-BR/posts/o-que-e-data-lake/). A escolha entre os dois, com o lakehouse e a ordem em que um e-commerce precisa de cada peça, está em [data lake ou data warehouse](https://precisian.io/blog/pt-BR/posts/data-lake-ou-data-warehouse/). A organização em camadas bronze, prata e ouro, que aproxima as duas coisas, tem post próprio: [arquitetura medalhão](https://precisian.io/blog/pt-BR/posts/arquitetura-medalhao/).

## O que um data warehouse não é?

**Não é a definição da métrica.** O warehouse guarda a tabela de pedidos e soma o que estiver na coluna. Se a receita inclui frete, se o pedido cancelado sai do mês, se o Pix pendente conta: isso é regra de negócio, e o warehouse executa qualquer regra que alguém escrever na consulta. A própria Microsoft descreve a peça que resolve isso: "Traditionally, the semantic layer is placed over a data warehouse", para que todos vejam "a single source of truth" ([Microsoft](https://learn.microsoft.com/en-us/azure/architecture/data-guide/relational-data/online-analytical-processing)). A diferença entre as duas está em [camada semântica ou data warehouse](https://precisian.io/blog/pt-BR/posts/camada-semantica-ou-data-warehouse/).

**Não é um BI.** O warehouse guarda e calcula. Painel, gráfico e relatório ficam na ferramenta que consulta.

**Não é cópia do banco da loja.** Copiar as tabelas do OMS para o BigQuery sem modelar gera um warehouse que responde rápido e responde errado, porque o grão de cada tabela foi pensado para a aplicação, não para a análise.

**Não é o fim do relatório nativo.** O painel da VTEX ou do Google Ads continua útil para a pergunta de uma fonte só.

## Quando o e-commerce precisa de um data warehouse?

Quando uma destas três coisas acontece, e basta uma.

**A pergunta cruza fontes.** Custo de mídia por pedido faturado, margem por canal, recompra de quem veio do Instagram. Cada pergunta dessas junta pelo menos duas fontes que não conversam, e a junção precisa morar num lugar onde as duas estejam no mesmo formato.

**A planilha virou o warehouse.** Quando o fechamento do mês depende de alguém exportar quatro relatórios e cruzar no Excel, a operação já tem um warehouse. Só que manual, sem histórico confiável e com a regra escondida numa fórmula.

**Alguém vai consultar o dado por máquina.** BI, automação ou agente de IA precisa de tabela estável, com nome de coluna que não muda toda semana.

Um exemplo sintético, para mostrar o tamanho do problema: uma loja com VTEX, Mercado Livre, Meta Ads, Google Ads e GA4 quer saber o custo de aquisição por pedido faturado, por canal. São cinco fontes e, só dentro da VTEX, três estados de pedido com ticket médio próprio no painel de [Performance de Vendas](https://help.vtex.com/pt/docs/tutorials/performance-de-vendas): captado, aprovado e faturado. Sem um lugar onde isso esteja modelado num grão só, cada área volta com um número.

E quando ainda não precisa: uma loja, uma plataforma de mídia e perguntas que cabem no relatório de cada uma. Warehouse sem pergunta que cruze fontes é custo sem dor correspondente.

## Onde a Precisian entra?

A Precisian não vende warehouse avulso nem ferramenta de BI. A entrega é um data lake isolado por cliente, na infraestrutura da Precisian, com os conectores mantidos (entre eles VTEX e Magento) e a camada semântica por cima, onde fica a definição versionada de receita, pedido e canal. O consumo acontece pela API, pelo servidor MCP ou pelo BI que o seu time já usa. A infraestrutura é nossa, o dado é seu. Você acessa a qualquer momento e, se sair, leva tudo.

Montar o seu próprio warehouse também é um caminho legítimo, e o custo dele é calculável com tabela oficial: as contas estão em [construir ou contratar um data lake](https://precisian.io/blog/pt-BR/posts/construir-ou-contratar-data-lake/).

## O que este artigo não cobre?

Não compara fornecedores de warehouse (BigQuery, Snowflake, Redshift, Databricks) nem formatos de tabela. Não ensina modelagem dimensional além do grão e do desenho em estrela. Os limites do export do GA4 e o preço do BigQuery são os da documentação na data de publicação; confira as páginas antes de decidir, porque as duas mudam.

---

Se a sua operação fecha o mês cruzando exportações em planilha, o primeiro passo é escrever qual é o grão de cada tabela que entra na conta: pedido, item ou nota. O que mudou, o que quebrou e o que a pesquisa da Precisian mediu chega a cada quinze dias, às quintas, na [newsletter da Precisian](https://precisian.io/newsletter?utm_source=blog&utm_medium=cta&utm_campaign=o-que-e-data-warehouse&utm_content=texto).
