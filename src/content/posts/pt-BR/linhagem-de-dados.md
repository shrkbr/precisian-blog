---
title: "Linhagem de dados: como saber de onde veio o número da sua métrica"
description: "Linhagem de dados é o caminho de um número da origem até o relatório. A do dbt mostra as colunas, mas não mostra o filtro que mudou o resultado."
slug: "linhagem-de-dados"
lang: "pt-BR"
translationKey: "data-lineage"
publishedAt: 2026-10-23
tags: ["data-lineage", "governanca", "auditoria", "roas"]
draft: false
llmSummary: "Linhagem de dados registra de quais fontes e transformações um número saiu. A especificação OpenLineage trata filtro (WHERE) como linhagem indireta; a linhagem por coluna do dbt, segundo a documentação de 01/10/2026, não reflete joins nem filtros."
citations: ["https://openlineage.io/docs/", "https://openlineage.io/docs/spec/object-model", "https://openlineage.io/docs/spec/facets/dataset-facets/column_lineage_facet", "https://docs.getdbt.com/docs/explore/column-level-lineage", "https://docs.getdbt.com/reference/dbt-jinja-functions/ref", "https://support.google.com/google-ads/answer/3123169"]
about: ["https://en.wikipedia.org/wiki/Data_lineage", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
---

Linhagem de dados é o registro do caminho que um número percorreu: de quais tabelas de origem ele saiu, por quais transformações passou e qual regra o produziu. A especificação aberta [OpenLineage](https://openlineage.io/docs/), projeto graduado da LF AI & Data Foundation e na versão 1.54.0 em outubro de 2026, descreve esse caminho com três entidades: dataset, job e execução. Para uma métrica de marketing, é a linhagem que responde "esse ROAS veio de quais pedidos?".

> **Linhagem de dados**: o mapa, mantido por máquina, das dependências entre fontes, transformações e resultados, que permite partir de um número publicado e chegar às linhas e às regras que o produziram.

Para marketing, um trecho da documentação do dbt decide se a linhagem serve. A documentação, atualizada em 1º de outubro de 2026, avisa que a linhagem por coluna "reflete a linhagem dos `select`" e "não reflete outros usos, como joins e filtros" ([dbt, column-level lineage](https://docs.getdbt.com/docs/explore/column-level-lineage)). Em métrica de marketing, a divergência costuma morar justamente no filtro.

## Como a linhagem de dados funciona na prática?

Existem duas formas de produzir linhagem, e quase toda ferramenta usa uma delas ou as duas.

**Por declaração no código.** No dbt, cada modelo aponta para os modelos de que depende com a função `ref`. A documentação diz que o dbt usa essas referências "para construir automaticamente o grafo de dependências", e é desse grafo que sai a ordem de execução ([dbt, ref](https://docs.getdbt.com/reference/dbt-jinja-functions/ref)). O efeito colateral é a linhagem: se o modelo de ROAS faz `ref` no modelo de pedidos, a dependência fica registrada sem ninguém desenhar nada.

**Por evento em tempo de execução.** No [modelo de objetos do OpenLineage](https://openlineage.io/docs/spec/object-model), cada execução de um job emite eventos com os datasets de entrada e de saída. Um job é "um processo que consome ou produz datasets"; uma execução é "uma instância de um job" num momento. A linhagem, aqui, é o histórico do que de fato rodou, e não só do que o código declara.

As duas formas ainda se dividem em granularidade. **Por tabela** diz que a tabela de ROAS depende da tabela de pedidos. **Por coluna** diz que a coluna `receita_atribuida` vem de `pedidos.valor`. A segunda é mais útil e mais cara: no dbt, ela exige plano Enterprise com acesso ao Catalog, ou análise estática estrita na versão local ([dbt](https://docs.getdbt.com/docs/explore/column-level-lineage)).

## Como rastrear um ROAS até a origem?

Pegue o ROAS de uma campanha no relatório de segunda-feira. A linhagem completa dele responde quatro perguntas, e cada uma é uma etapa diferente do caminho.

**Quais pedidos?** A receita do numerador vem do pedido que a plataforma de mídia diz ter gerado, do pedido que a VTEX registrou ou do pedido faturado no ERP? São três tabelas de origem.

**De qual plataforma?** Se o Google Ads e a Meta reivindicam o mesmo pedido, ele entra duas vezes na soma. Esse é o mecanismo do [ROAS que soma mais que o faturamento](https://precisian.io/blog/pt-BR/posts/roas-soma-maior-que-faturamento/).

**Com qual janela?** No Google Ads, a janela de conversão por clique é de 30 dias por padrão, configurável entre 1 e 90, e a mudança só vale para as conversões dali em diante ([Google Ads, Ajuda](https://support.google.com/google-ads/answer/3123169)). Uma série histórica que atravessa a troca mistura dois regimes.

**Com que exclusão?** Pedido cancelado sai? Pix não pago sai? Frete entra?

A tabela abaixo é um exemplo com números redondos, sintético e declarado como tal, de como o mesmo ROAS muda conforme a etapa do caminho.

| Etapa da linhagem | Decisão tomada | Receita no numerador | ROAS com R$ 10.000 de investimento |
|---|---|---|---|
| Origem: conversões reportadas pela plataforma | Janela de 30 dias, sem deduplicação | R$ 60.000 | 6,0 |
| Junção com pedidos da loja | Só pedidos que existem na VTEX | R$ 48.000 | 4,8 |
| Filtro de status | Sai cancelado e Pix não pago | R$ 41.000 | 4,1 |
| Regra de receita | Sem frete | R$ 37.000 | 3,7 |

O número que o diretor vê é um só. Sem linhagem, ninguém sabe em qual das quatro linhas ele foi calculado.

## Por que a linhagem por coluna não mostra o filtro?

Porque, para o parser de SQL, a coluna `receita_atribuida` vem de `pedidos.valor` nas quatro linhas da tabela. O que muda entre elas é o `WHERE` e o `JOIN`, e é isso que a [linhagem por coluna do dbt](https://docs.getdbt.com/docs/explore/column-level-lineage) declara não refletir.

A especificação OpenLineage trata o caso de outro jeito. Na [faceta de linhagem por coluna](https://openlineage.io/docs/spec/facets/dataset-facets/column_lineage_facet), a transformação é **direta** quando o valor de saída é derivado do de entrada, e **indireta** quando a entrada afeta a saída sem ser a origem dela. Entre os subtipos indiretos estão `FILTER`, a coluna "usada como condição de filtro (por exemplo, cláusula `WHERE`)", e `JOIN`, a coluna "usada na condição de junção".

Num grafo que só registra linhagem direta, a coluna `status_pedido` não aparece como dependência do ROAS. Ela não fornece valor ao número, só decide quais linhas entram. No exemplo acima, esse filtro sozinho tira sete mil reais do numerador.

Antes de confiar no grafo de linhagem que a sua ferramenta desenha, confira se ele registra a coluna que filtrou ou só a coluna que somou.

## Qual a diferença entre linhagem de dados, trilha de auditoria e contrato de dados?

Os três termos aparecem juntos em conversa de governança e respondem a perguntas diferentes.

| Critério | Linhagem de dados | Trilha de auditoria | Contrato de dados |
|---|---|---|---|
| Pergunta que responde | De onde veio este número? | Quem consultou o quê, e quando? | O que esta tabela promete entregar? |
| Objeto | Dependências entre fontes, transformações e resultados | Eventos de acesso e de consulta | Forma, garantias e significado de um dataset |
| Quando é produzida | Na construção ou na execução do pipeline | No momento do acesso | Antes, como acordo entre quem produz e quem consome |
| Falha típica | Grafo sem filtros e sem junções | Histórico do chat no lugar do registro da consulta | Chave primária declarada e nunca cobrada |
| Leitura recomendada | Este artigo | [Trilha de auditoria de resposta de IA](https://precisian.io/blog/pt-BR/posts/trilha-de-auditoria-de-resposta-de-ia/) | [Contrato de dados](https://precisian.io/blog/pt-BR/posts/contrato-de-dados/) |

A linhagem olha para trás, a partir do resultado. A trilha de auditoria olha para quem acessou. O contrato olha para a frente, para o que a tabela deveria cumprir. Uma operação madura usa os três, e a ausência de um não é coberta pelos outros dois.

## O que linhagem de dados não é?

**Não é catálogo.** Um catálogo lista quais tabelas existem e o que cada coluna significa. A linhagem liga uma à outra. Dá para ter catálogo impecável sem saber qual tabela alimenta qual.

**Não é qualidade de dado.** A linhagem mostra o caminho de um número errado com a mesma fidelidade com que mostra o de um certo. Para saber se o pipeline entregou dado vazio ou atrasado, o trabalho é outro, e está em [como saber se o pipeline de dados quebrou](https://precisian.io/blog/pt-BR/posts/como-saber-se-o-pipeline-de-dados-quebrou/).

**Não é a definição da métrica.** A linhagem diz que o ROAS passou por um filtro de status. Se cancelado deveria sair ou não é decisão de negócio, e essa decisão mora na [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/), versionada e com dono.

**Não é diagrama desenhado à mão.** Um fluxograma de 2024 numa wiki descreve o pipeline que existia em 2024. Linhagem que não é gerada pelo próprio código ou pela própria execução envelhece no primeiro deploy.

## Quando a linhagem passa a importar na sua operação?

Com uma fonte só e uma pessoa respondendo pelos números, a linhagem cabe na cabeça de quem montou o relatório. O custo de não ter registro é baixo.

Ele sobe em três momentos, e qualquer um basta:

1. **Quando a segunda fonte passa a falar do mesmo número.** Loja própria e marketplace, ou duas plataformas de mídia reivindicando o mesmo pedido.
2. **Quando o número muda e ninguém mudou nada.** Uma janela de atribuição alterada, um status novo de pedido, um campo renomeado no ERP. Sem linhagem, a investigação começa do zero.
3. **Quando um agente de IA começa a responder sozinho.** Uma pessoa desconfia de um ROAS de 6 e pergunta. Um agente devolve o número com a confiança de sempre. Se não houver como ir da resposta até as linhas e a regra que a produziram, ninguém consegue contestar, e o erro vira [alucinação de métrica](https://precisian.io/blog/pt-BR/posts/alucinacao-de-metrica/): conta certa sobre a definição errada.

Na Precisian, o dado de cada cliente fica num data lake isolado, na infraestrutura da Precisian, e as definições de métrica ficam versionadas na camada semântica. Quem consulta, seja a IA do cliente pelo servidor MCP, seja a API ou o BI dele, lê a mesma regra. A pergunta "com qual filtro esse ROAS foi calculado?" tem resposta escrita e com data.

## O que este artigo não cobre?

Não compara ferramentas de linhagem nem catálogos. Não detalha a implementação de OpenLineage em Airflow, Spark ou dbt, que muda a cada versão: a [documentação do projeto](https://openlineage.io/docs/) listava a versão 1.54.0 em 23/10/2026.

E o exemplo de ROAS deste texto é sintético. Os quatro valores servem para mostrar o mecanismo, não para estimar a divergência de nenhuma operação real.

Se o ROAS do seu relatório não bate com o que o financeiro vê e ninguém consegue dizer em qual etapa os dois se separaram, o primeiro passo é rastrear um único número até os pedidos de origem, filtro por filtro. [Veja como isso funciona na prática](https://precisian.io/demonstracao): sem compromisso de contrato, mas sem promessa de resposta em 30 minutos também.
