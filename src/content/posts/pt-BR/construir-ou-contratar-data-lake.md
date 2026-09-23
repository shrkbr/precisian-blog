---
title: "Construir ou contratar um data lake: o que dá para calcular de cada lado"
description: "Dá para calcular o custo do lake próprio com tabela oficial aberta. Do lado gerenciado, a tarifa por volume não é publicada."
slug: "construir-ou-contratar-data-lake"
lang: "pt-BR"
translationKey: "build-vs-buy-data-lake"
publishedAt: 2026-10-02
tags: ["build-vs-buy", "data-lake", "custo"]
draft: false
llmSummary: "No S3 em São Paulo o armazenamento custa US$ 0,0405 por GB-mês nos primeiros 50 TB, com vigência de setembro de 2026. A Fivetran define MAR com precisão mas não publica a tarifa por MAR em nenhuma página oficial, e a Snowflake remete o valor do crédito a um PDF."
citations: ["https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonS3/20260918174747/sa-east-1/index.json", "https://docs.cloud.google.com/bigquery/docs/best-practices-costs", "https://docs.snowflake.com/en/user-guide/cost-understanding-compute", "https://airbyte.com/pricing", "https://fivetran.com/docs/core-concepts/usage-based-pricing", "https://docs.airbyte.com/integrations/connector-support-levels", "https://www.getdbt.com/resources/state-of-analytics-engineering-2026"]
about: ["https://en.wikipedia.org/wiki/Data_lake", "https://precisian.io/precos"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

A diferença mais útil entre construir e contratar não é preço: é que só um dos dois lados publica o preço. Dá para calcular o custo de um lake próprio com tabelas oficiais abertas: o S3 em São Paulo custa US$ 0,0405 por GB-mês nos primeiros 50 TB, com vigência de setembro de 2026 ([AWS Price List API](https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonS3/20260918174747/sa-east-1/index.json)). Do lado gerenciado, a Fivetran não publica a tarifa por MAR em nenhuma das três páginas oficiais que tratam do assunto, a Snowflake remete o valor do crédito a um PDF, e a Databricks serve a página de preço em JavaScript sem cifra no HTML.

> **Build vs buy de plataforma de dados**: decisão entre montar ingestão, armazenamento e modelagem com peças contratadas separadamente, ou contratar uma plataforma que entrega o conjunto sob um contrato único.

## Quais critérios decidem essa escolha?

Antes de qualquer número, vale declarar o que está sendo comparado, porque a maior parte das comparações publicadas troca os critérios no meio do caminho.

1. **Custo de infraestrutura**: armazenar e consultar.
2. **Custo de ingestão**: trazer e manter as fontes conectadas.
3. **Custo de pessoa**: quem opera, e quanto do tempo dela isso consome.
4. **Custo de quebra**: o que acontece quando uma API de origem muda.
5. **Previsibilidade**: quanto do total você consegue estimar antes de assinar.

O quinto critério é o que quase ninguém lista, e é o que mais muda a decisão na prática.

## Quanto custa guardar, de verdade, no Brasil?

Este é o número mais blindado do artigo, porque veio da API oficial de preços da AWS, com data de vigência.

Em **São Paulo (`sa-east-1`)**, o S3 Standard custa **US$ 0,0405 por GB-mês** nos primeiros 50 TB, US$ 0,0390 nos 450 TB seguintes e US$ 0,0370 acima de 500 TB ([AWS Price List API](https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonS3/20260918174747/sa-east-1/index.json), vigência 1º/09/2026).

Duas observações que quase nunca aparecem em material brasileiro sobre o tema.

**São Paulo custa bem mais caro que a Virgínia.** Comparando a mesma tabela oficial entre regiões ([AWS](https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonS3/20260918174747/sa-east-1/index.json)), a diferença é da ordem de 76% acima do preço da região americana. Post que copia preço de `us-east-1` subestima o armazenamento de qualquer operação que precise manter o dado no Brasil.

**As requisições têm unidades diferentes.** PUT, COPY, POST e LIST custam US$ 0,007 por **mil** requisições; GET e demais custam US$ 0,0056 por **dez mil** ([AWS](https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonS3/20260918174747/sa-east-1/index.json)). Quem compara as duas linhas sem olhar a unidade erra por dez vezes. Ingestão de e-commerce é intensiva em PUT, muitos arquivos pequenos, e é justamente a tarifa cara.

## E consultar?

Aqui a mecânica importa mais que a tarifa, e a mecânica está documentada.

**BigQuery** cobra por bytes lidos, sempre **lógicos (descomprimidos)**, com franquia permanente de 1 TB de consulta por mês por projeto. E repete o alerta que vale para qualquer agente: `LIMIT` não reduz o custo em tabela não clusterizada ([Google Cloud](https://docs.cloud.google.com/bigquery/docs/best-practices-costs)).

**Snowflake** cobra créditos **por segundo, com mínimo de 60 segundos**, todo start ou resume de warehouse já consome um minuto inteiro, e cada salto de tamanho de warehouse **dobra** os créditos por hora ([Snowflake](https://docs.snowflake.com/en/user-guide/cost-understanding-compute)).

Note o que não está aqui: o preço por TiB do BigQuery e o preço por crédito da Snowflake. Os dois circulam amplamente, e eu não consegui confirmar nenhum dos dois em fonte oficial. Preferi trazer a mecânica confirmada a repetir uma cifra de agregador.

## Onde o custo do conector aparece?

Em dois modelos diferentes, e um deles é calculável.

| | Airbyte Cloud | Fivetran |
|---|---|---|
| Unidade | crédito | MAR (linha distinta sincronizada no mês) |
| Entrada | **US$ 20/mês**, 5 créditos | **US$ 5,00** de base por conexão de 1 a 1M MAR |
| Crédito extra | **US$ 5,00** | — |
| Tarifa por unidade de volume | publicada | **não publicada** |
| Conectores | 700+ inclusos | 500+, cobrança por conexão |

Fontes: [Airbyte](https://airbyte.com/pricing) e [Fivetran](https://fivetran.com/docs/core-concepts/usage-based-pricing).

A Fivetran define MAR com precisão, "the number of distinct rows synced from the source system to your destination system in a given calendar month", contado por chave primária distinta, uma vez por mês mesmo que sincronize várias vezes, e publica a tabela de transformações (US$ 0,01 por run entre 5.001 e 30.000, caindo a US$ 0,002 acima de 100.000). **Mas a tarifa por MAR não está publicada.** Conferi nas três páginas oficiais que tratam de preço e uso.

Isso não é crítica: é o critério 5 se manifestando. Um dos lados deixa você montar a planilha sozinho; o outro exige uma conversa antes de existir número.

## Qual é o custo que não está em nenhuma tabela?

A manutenção. E a documentação dos próprios fornecedores descreve esse custo melhor do que qualquer artigo de opinião.

A Airbyte classifica o suporte dos conectores em níveis, e o texto sobre os da comunidade é direto: são "not maintained by Airbyte", não cobertos pelos SLAs de suporte, e "might not be feature complete and may experience backward-incompatible breaking changes with no notice" ([Airbyte](https://docs.airbyte.com/integrations/connector-support-levels)).

A mesma documentação detalha o que acontece quando a origem muda. Só duas mudanças são consideradas quebra, remoção da chave primária e remoção do cursor, e ambas **pausam a conexão** até alguém intervir. A verificação de schema acontece a cada 15 minutos na versão gerenciada e a cada **24 horas** em instalação própria: quem roda a própria casa descobre a quebra até um dia depois ([Airbyte](https://docs.airbyte.com/platform/using-airbyte/schema-change-management)).

Do outro lado, a Fivetran não cobra MAR em re-sync de troubleshooting nem em backfill de migração automática de schema, mas as linhas re-sincronizadas **que tiverem mudanças contam como MAR pago**.

Sobre o custo de pessoa, a pesquisa mais recente com metodologia aberta que encontrei é a da dbt Labs: 363 respondentes, coleta entre dezembro de 2025 e fevereiro de 2026, com **57% relatando aumento de gasto com warehouse contra 13% relatando queda**, e apenas 36% relatando aumento de orçamento de time ([dbt Labs, 14/04/2026](https://www.getdbt.com/resources/state-of-analytics-engineering-2026)). É pesquisa de fornecedor, com amostra pequena e majoritariamente não-brasileira, e declaro isso, mas o recorte é o dado mais defensável que achei para a assimetria entre custo e orçamento.

## Quando **não** escolher a Precisian?

Três casos, e eles são reais.

**Quando existe uma fonte só.** Uma operação com uma plataforma, um sistema de pagamento e nenhuma integração adicional não tem problema de reconciliação. Contratar plataforma de dados aí é resolver uma dor que não existe. O relatório nativo basta.

**Quando já existe time de dados maduro com o problema resolvido.** Se a empresa tem engenharia de dados própria, conectores estáveis e definições de métrica escritas, o ganho marginal é pequeno e o custo de migração é real. Nesse caso a conversa útil é sobre uma peça específica, não sobre a plataforma.

**Quando o que se procura é a camada de aplicação.** Quem precisa de painel pronto, agente configurado ou análise entregue está procurando outra coisa. A entrega da Precisian termina na camada semântica; o consumo acontece na IA, no BI ou na automação do próprio cliente. Se a necessidade é o painel, o caminho é o canal de consultores, não a plataforma.

## O que recomendar, por perfil?

**Fonte única, operação enxuta:** não construa e não contrate. Use o relatório nativo até ele doer.

**Duas a quatro fontes, sem time de dados:** o custo real não é infraestrutura, é a pessoa que não existe. Contratar tende a ganhar, porque o item mais caro da planilha própria é justamente o que você não vai contratar.

**Cinco ou mais fontes, com time:** a decisão vira de foco. Construir é viável e o custo é calculável; a pergunta é se manter conector é o melhor uso do seu time de dados. A documentação da Airbyte sobre conector de comunidade responde boa parte disso.

**Grupo multimarca ou operação com agência:** o critério que domina passa a ser isolamento, e aí a arquitetura importa mais que o preço. Vale ler sobre [isolamento por cliente](https://precisian.io/blog/en/posts/per-tenant-isolation-mcp/) (em inglês) antes de comparar planilha.

O que está incluso do lado da Precisian, e a faixa de entrada, estão publicados em [preços](https://precisian.io/precos), o que, dado o resto deste artigo, é uma escolha de posicionamento e não um detalhe.

## O que este artigo não cobre?

Não traz preço de Google Cloud Storage, Databricks nem valor de crédito da Snowflake. As três páginas falharam em servir os números a uma leitura automatizada, e não publico cifra que não consegui abrir na fonte.

Também não traz faixa salarial de engenheiro de dados no Brasil. A melhor fonte nacional está atrás de cadastro, e a alternativa que encontrei mede **cientista** de dados, que é outra função, sem deixar claro se o valor é mensal ou anual. Trocar uma função pela outra para preencher uma linha de planilha seria o tipo de erro que este artigo critica.

E há um número que **não** vai aparecer aqui: o de que 85% dos projetos de dados fracassam. Ele é citado em praticamente todo material sobre o tema. Rastreando a origem, ela é um **tweet hoje deletado** de um analista comentando que um número anterior era conservador demais. Não existe nota de pesquisa com metodologia por trás. É redondo, é memorável e não tem lastro.

Se você está decidindo entre montar e contratar, comece pelo critério que ninguém lista: quanto do custo total você consegue estimar antes de assinar. [Agende uma conversa sobre o seu caso](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).
