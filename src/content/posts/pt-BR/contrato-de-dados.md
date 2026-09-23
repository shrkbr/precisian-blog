---
title: "Contrato de dados: o que é e o que o banco não cobra"
description: "Um contrato de dados declara forma, garantias e significado. Em Snowflake, BigQuery e Redshift, a chave primária declarada e nunca cobrada."
slug: "contrato-de-dados"
lang: "pt-BR"
translationKey: "data-contract"
publishedAt: 2026-10-20
tags: ["contrato-de-dados", "governanca", "camada-semantica"]
draft: false
llmSummary: "Contrato de dados e o acordo versionado entre produtor e consumidor de uma tabela. Em Snowflake, BigQuery e Redshift, primary_key e foreign_key sao declaraveis mas nao cobradas: existem apenas para fins de metadado, e o modelo constroi mesmo violando a restricao."
citations: ["https://docs.getdbt.com/reference/resource-properties/constraints", "https://docs.getdbt.com/reference/resource-configs/contract", "https://github.com/bitol-io/open-data-contract-standard", "https://bitol-io.github.io/open-data-contract-standard/latest/"]
about: ["https://pt.wikipedia.org/wiki/Governan%C3%A7a_de_dados", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
---

Um contrato de dados é um acordo versionado entre quem produz e quem consome uma tabela, declarando nomes de colunas, tipos e garantias de qualidade. No padrão aberto mais usado hoje, apenas 4 dos 23 campos de topo são obrigatórios ([ODCS v3.2.0](https://github.com/bitol-io/open-data-contract-standard)). E na maioria dos data warehouses, a parte do contrato que as pessoas mais confiam não é cobrada por ninguém.

Antes de qualquer coisa, duas desambiguações. Este artigo não trata do **contrato de tratamento de dados** da LGPD, o documento jurídico entre controlador e operador. E não trata do `[DataContract]` do .NET, um atributo de serialização. O assunto aqui é engenharia de dados.

## O que um contrato de dados declara?

Quatro coisas, em ordem de quanto costumam ser levadas a sério.

**A forma.** Quais colunas existem, com que nome e que tipo. É a parte que quebra pipeline quando muda sem aviso.

**As garantias.** Chave primária, obrigatoriedade, unicidade, faixas de valor aceitáveis.

**A semântica.** O que a coluna significa. `receita` é com ou sem frete? Com ou sem imposto? Essa é a parte que quase nunca entra no arquivo, e é a que gera a divergência que ninguém consegue explicar na reunião.

**O compromisso operacional.** Frequência de atualização, janela de atraso tolerada, quem é o dono, como avisar antes de mudar.

O padrão aberto governado pela LF AI & Data Foundation em conjunto com o Bitol, o Open Data Contract Standard, organiza isso em seções de fundamentos, esquema, qualidade, times, papéis e níveis de serviço ([ODCS](https://bitol-io.github.io/open-data-contract-standard/latest/)).

O detalhe que diz mais sobre o estado do assunto está no schema legível por máquina: dos 23 campos de topo, só `version`, `apiVersion`, `kind` e `id` são obrigatórios. **`name` não é.** Um arquivo válido pelo padrão pode não dizer o nome do que está contratando. O padrão oferece vocabulário, não rigor.

## Declarar uma chave primária garante que ela é única?

Na maioria dos data warehouses, não. E essa é a confusão mais cara do tema.

O dbt publica a matriz de suporte por plataforma. Ela é desconfortável de ler:

| Plataforma | `not_null` | `primary_key` | `unique` | `check` |
|---|---|---|---|---|
| PostgreSQL | cobrado | cobrado | cobrado | cobrado |
| Snowflake | cobrado | só metadado | nem declarável | nem declarável |
| BigQuery | cobrado | só metadado | nem declarável | nem declarável |
| Redshift | cobrado | só metadado | só metadado | nem declarável |
| Databricks | cobrado | só metadado | nem declarável | cobrado |
| Athena | nada | nada | nada | nada |

Fonte: [dbt, constraints](https://docs.getdbt.com/reference/resource-properties/constraints).

A coluna do meio é a que importa. A documentação define o status assim, textualmente: *"A plataforma suporta especificar o tipo de restrição, mas um modelo ainda pode ser construído mesmo que construí-lo viole a restrição. Essa restrição existe apenas para fins de metadado."*

Traduzindo para a consequência: em Snowflake, BigQuery e Redshift, você pode declarar `primary_key` no seu contrato, o build passa, a documentação fica bonita, e a tabela pode ter a chave duplicada mesmo assim. O contrato descreve uma intenção. Ninguém a cobra.

Em Snowflake e BigQuery, `unique` nem sequer é declarável. A garantia que mais gente acha que tem é a que menos existe.

## Então o contrato do dbt não cobra nada?

Cobra uma coisa, e cobra bem.

Com `contract: {enforced: true}`, o dbt valida nome e tipo de dado de cada coluna no momento do build, e falha se o modelo divergir do declarado ([dbt](https://docs.getdbt.com/reference/resource-configs/contract)). Isso é real e é valioso: é o que impede alguém de renomear `order_total` para `total` numa terça-feira e descobrir na sexta.

O que o mecanismo não faz é garantir conteúdo. Forma é cobrada no build. Conteúdo, nos warehouses da tabela acima, não é.

O próprio dbt explica por que algumas restrições ficam de fora, num caso que ilustra o critério: no Spark, `not_null` e `check` só são verificadas depois que o modelo é construído, e por isso *"o dbt considera essas restrições declaráveis mas não cobradas, o que significa que não fazem parte do contrato do modelo, já que não podem ser cobradas no momento do build."*

A régua é essa: o que não trava o build não é contrato. É documentação.

## Como cobrir o que o banco não cobre?

Com teste, não com declaração. São camadas diferentes, e a confusão entre elas é o problema.

**Restrição** é o que o banco aplica na escrita. Curta a lista, como a tabela mostra.

**Teste de dados** é uma consulta que roda depois e falha se o resultado não for o esperado. É aí que `unique` de verdade acontece em Snowflake e BigQuery: não como restrição declarada, e sim como um teste que conta duplicatas e derruba o pipeline quando acha alguma.

**Contrato** é o documento que diz o que as duas camadas anteriores deveriam sustentar, mais a parte que nenhuma das duas cobre: significado e compromisso operacional.

Quem escreve `primary_key` no YAML e não escreve o teste correspondente tem o desenho de uma garantia, não a garantia.

## Qual tabela merece um contrato primeiro?

A que tem mais de um consumidor e uma decisão com dinheiro do outro lado.

Contrato tem custo: alguém precisa manter, revisar e negociar mudança. Aplicado a tudo, vira cerimônia e morre em seis meses. O critério que sobrevive é o de exposição.

**Tem mais de um consumidor?** Tabela que só o autor lê não precisa de contrato, precisa de teste. O contrato existe para proteger quem não estava na sala quando a coluna mudou.

**Alimenta decisão de dinheiro?** A tabela que define verba, preço ou margem merece garantia explícita. A que alimenta um gráfico de acompanhamento pode esperar.

**Já quebrou alguma vez?** A tabela que já causou um incidente é a candidata óbvia, e é a única para a qual você consegue aprovação sem discussão, porque a dor é lembrada.

**Vai ser lida por um agente?** Aqui o critério muda de peso. Uma pessoa que vê `receita` estranha desconfia e pergunta. Um agente responde com a coluna que encontrar, com a mesma confiança de sempre. Quando o consumidor não sabe duvidar, a garantia precisa estar no dado, não no bom senso de quem lê.

## E a parte semântica, quem cobra?

Ninguém, e por isso ela é a que mais custa.

Nenhuma restrição de banco impede que `receita` signifique uma coisa no relatório do time de mídia e outra no fechamento financeiro. Os dois campos passam em qualquer validação de tipo. Os dois são `numeric`. Os dois estão certos pelo contrato.

É a mesma falha que faz [plataforma e analytics nunca baterem](https://precisian.io/blog/pt-BR/posts/vtex-ga4-nao-batem/), e a razão de ela não se resolver com mais um teste é que não é um erro de dado. É um desacordo de definição registrado em lugar nenhum.

Resolver isso significa colocar a definição num lugar único que tanto a consulta humana quanto o agente de IA leiam antes de calcular, que é o trabalho de uma [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/). O contrato de dados protege a tubulação. A camada semântica protege o significado. Confundir as duas é como conferir o cano e não perguntar o que está passando dentro.

## O que este artigo não cobre?

Não traz número de adoção de contratos de dados no mercado. A pesquisa mais citada sobre o tema está publicada numa página cujo título anuncia o ano corrente, mas cujo campo foi a campo três anos antes, e repassar aquilo como retrato de hoje seria desonesto.

Também não afirma que um padrão concorrente foi descontinuado em favor do ODCS, afirmação que circula e que não encontrei declarada em nenhuma página oficial do projeto citado.

E não recomenda ferramenta. A matriz acima muda conforme as plataformas evoluem, e a própria documentação do dbt avisa que ela vai mudar. A pergunta que não muda é outra: o que no seu contrato trava o build hoje, e o que só está escrito?

Se a resposta for "quase tudo só está escrito", [vale uma conversa sobre o seu caso](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).
