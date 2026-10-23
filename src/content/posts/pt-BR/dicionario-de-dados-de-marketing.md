---
title: "Dicionário de dados de marketing: o que entra e por que a IA precisa dele"
description: "Dicionário de dados descreve cada métrica: nome, definição, fonte, dono, fórmula e exclusões. Um documento de 4 KB elevou a acurácia da IA em 17 a 23 pontos."
slug: "dicionario-de-dados-de-marketing"
lang: "pt-BR"
translationKey: "data-dictionary"
publishedAt: 2026-10-23
tags: ["camada-semantica", "governanca", "dados-para-ia", "contrato-de-dados"]
draft: false
llmSummary: "Dicionário de dados é o registro que descreve cada campo e métrica de uma base: nome, definição, fonte, dono, fórmula e exclusões. Em teste de abril de 2026 (arXiv 2604.25149), um documento de definições de 4 KB elevou a acurácia de três modelos de IA em 17 a 23 pontos percentuais."
citations: ["https://arxiv.org/abs/2604.25149", "https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema", "https://docs.getdbt.com/reference/resource-properties/description", "https://docs.getdbt.com/reference/resource-configs/persist_docs", "https://docs.getdbt.com/docs/build/metrics-overview", "https://docs.snowflake.com/en/user-guide/views-semantic/overview", "https://help.vtex.com/en/docs/tutorials/order-flow-and-status"]
about: ["https://en.wikipedia.org/wiki/Data_dictionary", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
---

Dicionário de dados é o registro que diz, para cada campo e cada métrica de uma base, o nome, o que significa, de onde vem, quem responde por ele, como se calcula e o que fica de fora. Para a IA, ele é o mínimo: num teste de abril de 2026, um documento de definições de 4 KB elevou a acurácia de três modelos em 17 a 23 pontos percentuais ([Rumiantsau e Fokeev, 2026](https://arxiv.org/abs/2604.25149)).

> **Dicionário de dados**: documento, mantido junto com a base, que registra para cada campo ou métrica o nome canônico, a definição em linguagem de negócio, a fonte, o dono, a fórmula e as exclusões, de modo que qualquer pessoa ou sistema que leia o número saiba o que ele contém.

## O que entra num dicionário de dados de marketing?

Seis campos por métrica. Menos que isso deixa espaço para adivinhação; mais que isso vira formulário que ninguém preenche.

**Nome.** Um só, em minúsculas, sem sinônimo circulando em paralelo. Se o time fala "faturamento" e o financeiro fala "receita", o dicionário escolhe um e registra o outro como apelido aposentado.

**Definição.** Uma frase em português de negócio, que o diretor entende sem abrir o SQL.

**Fonte.** O sistema e a tabela de onde o número sai: VTEX, ERP, Google Ads, Meta Ads, GA4. Quando duas fontes podem responder, o dicionário diz qual manda.

**Dono.** A pessoa ou área que arbitra quando alguém discorda. Sem dono, a definição volta a divergir no trimestre seguinte.

**Fórmula.** A conta, escrita de um jeito que dê para conferir: numerador, denominador, agregação e qual data manda (pedido, pagamento ou faturamento).

**Exclusões.** O que não entra: frete, imposto, cancelamento, devolução, pedido de teste, venda interna. É o campo mais curto e o que mais evita discussão.

Abaixo, um modelo com dez métricas de e-commerce. As regras são um exemplo, não uma recomendação universal: a sua operação pode decidir diferente, e o que importa é que decida por escrito.

| Nome | Definição | Fonte | Dono | Fórmula | Exclusões |
|---|---|---|---|---|---|
| `receita_bruta` | Valor dos pedidos aprovados no período | VTEX (pedidos) | E-commerce | soma do valor dos itens, por data de pagamento | frete, pedido de teste |
| `receita_liquida` | O que a empresa reconhece como venda | ERP | Controladoria | receita faturada − cancelamento − devolução, por data de faturamento | frete, imposto |
| `pedidos` | Pedidos que chegaram ao status faturado | [VTEX, status `invoiced`](https://help.vtex.com/en/docs/tutorials/order-flow-and-status) | E-commerce | contagem de `pedido_id` distintos | cancelados, pedidos de teste |
| `ticket_medio` | Valor médio por pedido faturado | derivada | Controladoria | `receita_liquida` ÷ `pedidos` | as de cada componente |
| `sessoes` | Visitas ao site | GA4 | Marketing | contagem de sessões | tráfego interno filtrado |
| `taxa_de_conversao` | Fração das sessões que viraram pedido | derivada | Marketing | `pedidos` ÷ `sessoes` | pedidos de marketplace (não têm sessão no site) |
| `investimento_midia` | Gasto em mídia paga | Google Ads, Meta Ads | Mídia | soma do custo, por data de veiculação | impostos sobre mídia, se lançados à parte |
| `roas` | Receita por real investido em mídia | derivada | Mídia + Controladoria | `receita_liquida` ÷ `investimento_midia` | receita que a plataforma atribui a si mesma |
| `clientes_novos` | Clientes com a primeira compra no período | ERP | CRM | contagem de CPF sem pedido anterior na marca | compras só em marketplace |
| `taxa_de_devolucao` | Fração da receita devolvida | ERP | Operações | devolução ÷ receita faturada, por data da devolução | troca sem estorno |

O `roas` está definido sobre a receita líquida do ERP, não sobre a receita que cada plataforma declara, e isso sozinho muda o número em qualquer operação que anuncie em mais de um canal. E a devolução sai na data da devolução, não na do pedido, o que reescreve todo mês já fechado. As duas são decisões de negócio. O dicionário só as torna visíveis.

## Como um dicionário de dados funciona na prática?

Ele funciona quando está onde o número é lido, não numa pasta de onboarding.

O exemplo mais à mão é o do próprio Google. A [referência de métricas da API de dados do GA4](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema), atualizada em 22 de outubro de 2026, é um dicionário de dados: descreve `grossPurchaseRevenue` como "a soma da receita de compras", `purchaseRevenue` como essa soma menos as transações reembolsadas e `totalRevenue` como a soma de compras, assinaturas e publicidade. São três receitas com três definições escritas. Quem pergunta "qual foi a receita?" e não diz qual vai receber uma delas, escolhida por quem respondeu.

No seu próprio banco, o dicionário costuma morar em três lugares, do mais frágil ao mais útil:

1. **Planilha ou wiki.** Funciona enquanto alguém lembra de abrir. O agente de IA não abre.
2. **Descrição de coluna no projeto de dados.** No dbt, o campo `description` documenta modelos e colunas e aparece no site de documentação ([dbt](https://docs.getdbt.com/reference/resource-properties/description)). Com `persist_docs`, essas descrições viram comentário de coluna dentro do próprio warehouse, em Postgres, Redshift, Snowflake, BigQuery e Databricks ([dbt](https://docs.getdbt.com/reference/resource-configs/persist_docs)).
3. **Contexto entregue à IA a cada pergunta.** É onde o dicionário passa a mudar resposta, e é o caso que o teste de abril mediu.

A própria documentação do dbt trata `description` como metadado. Ela não altera o SQL nem o resultado. A descrição informa quem lê; ela não impede ninguém de calcular diferente.

## Qual a diferença entre dicionário de dados e camada semântica?

O dicionário descreve; a [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/) executa. É a fronteira que mais confunde, porque os dois guardam "a definição de receita líquida".

| Critério | Dicionário de dados | Camada semântica | Contrato de dados |
|---|---|---|---|
| O que guarda | Significado, fonte, dono, exclusões | A regra de cálculo em formato que a máquina executa | Formato, tipos e garantias de uma tabela |
| Quem lê | Pessoas e a IA, como contexto | O sistema, antes de gerar a consulta | O pipeline, no momento do build |
| Se alguém ignorar | O número sai diferente e ninguém é avisado | Não dá para ignorar: a consulta passa por ela | O build falha, se a cláusula for aplicada |
| Exemplo concreto | `description` de coluna no dbt | métrica do tipo `ratio` no dbt, com numerador e denominador | `contract: enforced` no dbt |
| Pergunta que responde | O que este número quer dizer? | Como este número é calculado, sempre igual? | Esta tabela chegou no formato prometido? |

Na camada semântica, a métrica é um objeto com tipo e parâmetros. O dbt aceita cinco tipos (simples, razão, acumulada, derivada e conversão), e uma métrica de razão declara numerador e denominador em YAML ([dbt](https://docs.getdbt.com/docs/build/metrics-overview)). A Snowflake descreve o mesmo mecanismo do lado do agente: o Cortex Agents lê a definição da *semantic view* e gera o SQL contra as tabelas físicas a partir dela ([Snowflake](https://docs.snowflake.com/en/user-guide/views-semantic/overview)). O contrato, por sua vez, protege o formato da tabela e não o significado; o [post sobre contrato de dados](https://precisian.io/blog/pt-BR/posts/contrato-de-dados/) mostra o que ele aplica e o que só declara.

## Por que a IA precisa do dicionário, e por que só ele não basta?

Porque o erro mais comum de um agente sobre dado de marketing não é de conta: é de definição. O modelo escolhe um campo entre vários plausíveis, calcula certo e entrega o número errado. É o que chamamos de [alucinação de métrica](https://precisian.io/blog/pt-BR/posts/alucinacao-de-metrica/).

O teste de [Rumiantsau e Fokeev](https://arxiv.org/abs/2604.25149), publicado em 28 de abril de 2026, mediu exatamente isso: 100 perguntas em linguagem natural sobre uma base de varejo, respondidas por Claude Opus 4.7, Claude Sonnet 4.6 e GPT-5.4. Sem contexto, a acurácia ficou entre 45,5% e 50,5%. Com um arquivo markdown de 4 KB descrevendo medidas, convenções e regras de desempate, subiu para 67,7% a 68,7%. A diferença entre modelos foi pequena perto da diferença que o documento fez.

Quatro quilobytes de texto pesaram mais do que a escolha do modelo, e esse é o melhor motivo para escrever o dicionário.

E é também o limite dele. Mesmo com o documento, cerca de um terço das respostas continuou errada. Na minha leitura, o motivo é mecânico: o agente lê a descrição e ainda precisa escrever a consulta. Entre "receita líquida exclui frete" e o SQL correto existe uma tradução, e cada tradução é uma chance de errar o filtro, a junção ou a data. Quando a regra está numa camada semântica, essa tradução já foi feita e testada uma vez, e o agente consulta a métrica em vez de reconstruí-la. É o que diferencia [text-to-SQL governado](https://precisian.io/blog/pt-BR/posts/text-to-sql-dado-de-marketing/) de text-to-SQL solto.

Então a ordem prática é esta: o dicionário vem primeiro, porque sem decisão escrita não há o que executar. A camada semântica vem depois, para as métricas que a IA vai consultar sem supervisão. Na Precisian, essa camada fica sobre um data lake isolado por cliente, na nossa infraestrutura, e chega à IA, ao BI ou à automação do cliente por servidor MCP e API.

## O que um dicionário de dados não é?

**Não é catálogo de dados.** O catálogo inventaria o que existe (tabelas, colunas, quem acessa). O dicionário diz o que cada coisa significa. Um catálogo pode listar dez colunas chamadas `receita` sem dizer qual delas é a certa.

**Não é glossário de negócio.** O glossário define o conceito ("cliente novo é quem compra pela primeira vez"). O dicionário amarra o conceito a uma coluna, uma fonte e uma fórmula.

**Não é o esquema do banco.** O tipo `numeric(12,2)` diz que o campo guarda dinheiro. Não diz se é bruto ou líquido, nem em qual data.

**Não é tarefa de TI sozinha.** Quem escreve a coluna "dono" é o negócio. Um dicionário preenchido só pela engenharia descreve o que o código faz, que pode não ser o que a empresa decidiu.

## Quando vale a pena escrever um?

Quando aparece a segunda fonte para o mesmo número, ou o primeiro agente de IA com acesso à base. Antes disso, com uma loja, um sistema e uma pessoa respondendo, a definição pode morar na cabeça de alguém sem custo.

No varejo brasileiro, esse ponto chega cedo. Basta vender em loja própria e em marketplace ao mesmo tempo: o pedido do Mercado Livre não tem sessão no seu GA4, a conversão do site e a do marketplace deixam de ser comparáveis, e "cliente novo" passa a depender de qual base você consultou. Com Pix, pedido e pagamento caem no mesmo instante; com boleto, ficam dias separados, e a métrica que não diz qual data manda muda de valor conforme o mix de pagamento do mês.

Um exemplo sintético, com números redondos inventados para a conta: dois meses com o mesmo faturamento e uma devolução feita em abril, de um pedido de março.

| Regra de data da devolução | Receita líquida de março | Receita líquida de abril |
|---|---|---|
| Sai na data do pedido | R$ 950 mil | R$ 1 milhão |
| Sai na data da devolução | R$ 1 milhão | R$ 950 mil |

Nenhum dos dois números está errado. Só um deles é o da sua empresa, e é o dicionário que diz qual.

Minha sugestão é começar pelas três métricas que geram mais reunião, quase sempre receita, ROAS e cliente novo, e não pelas cem colunas da base. Os outros campos entram quando alguém perguntar por eles.

## O que este artigo não cobre?

Não compara ferramentas de catálogo nem de documentação. Não mostra a implementação de uma camada semântica completa, que está em [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/). E o número citado mede acurácia de resposta num benchmark de varejo com 100 perguntas: não mede retorno financeiro, e este artigo não afirma nenhum.

---

Se a IA da sua empresa responde "receita" e ninguém sabe dizer qual das receitas ela usou, o primeiro passo é medir quantas definições do mesmo número circulam hoje. [Veja na prática como a definição chega à IA pela camada semântica](https://precisian.io/demonstracao), sem compromisso de contrato, mas sem promessa de resposta em 30 minutos também.
