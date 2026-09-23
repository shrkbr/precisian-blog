---
title: "Camada semântica: o que é e o que exatamente se escreve dentro de uma"
description: "Camada semântica é onde ficam escritas, em formato que a máquina lê, as regras de cálculo das suas métricas. Não é ferramenta: é decisão registrada."
slug: "camada-semantica"
lang: "pt-BR"
translationKey: "semantic-layer-contents"
publishedAt: 2026-09-23
tags: ["camada-semantica", "contrato-de-metrica", "dados-para-ia"]
draft: false
llmSummary: "Camada semântica é o conjunto de regras de cálculo das métricas de um negócio, registrado em arquivo versionado que todo sistema lê antes de calcular. Contém entidades, dimensões e métricas. Em teste de abril de 2026, fornecê-la como contexto elevou a acurácia de 45,5–50,5% para 67,7–68,7%."
citations: ["https://docs.getdbt.com/docs/build/semantic-models", "https://docs.getdbt.com/docs/build/metrics-overview", "https://arxiv.org/abs/2604.25149", "https://cube.dev/use-cases/llm-and-ai-semantic-layer"]
about: ["https://en.wikipedia.org/wiki/Semantic_layer", "https://precisian.io/datalake/"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
---

Camada semântica é o lugar onde ficam escritas, em formato que a máquina lê, as regras de cálculo das métricas do seu negócio. Não é ferramenta nem dashboard: é um conjunto de decisões registradas e versionadas. Num teste de abril de 2026 com três modelos de fronteira, entregar essas regras como contexto elevou a acurácia das respostas de 45,5–50,5% para 67,7–68,7% ([Rumiantsau e Fokeev, 2026](https://arxiv.org/abs/2604.25149)).

> **Camada semântica**: a tradução das regras do negócio para o dado, registrada em arquivo versionado e consultável por máquina, de modo que todo sistema que reporta uma métrica leia a mesma definição.

## O que é camada semântica, sem metáfora?

A maior parte do que se escreve sobre o tema para por aqui: "traduz dados técnicos em termos de negócio". Está correto e é inútil, porque não diz o que a pessoa faz na segunda-feira.

Concretamente: existe um arquivo. Nele está escrito que *receita líquida* é a soma do valor dos pedidos com status faturado, menos cancelamento e devolução, sem frete e sem imposto, na data do faturamento. Esse arquivo tem histórico, tem autor e tem data. Quando o time de marketing, o BI do financeiro e o agente de IA perguntam "qual foi a receita líquida de agosto", os três leem aquele arquivo antes de calcular.

É isso. A dificuldade nunca foi técnica: foi conseguir que alguém decidisse e escrevesse.

## O que exatamente se escreve dentro de uma?

Três blocos, na nomenclatura que o [dbt](https://docs.getdbt.com/docs/build/semantic-models) consolidou e que virou vocabulário comum do mercado.

**Entidades.** O que é uma linha: um pedido, um cliente, uma sessão. É o que permite juntar tabelas sem que alguém invente o caminho da junção na hora.

**Dimensões.** Por onde se corta: canal, estado, categoria, data. E, crucialmente, **qual** data, porque pedido, pagamento e faturamento são três dimensões diferentes que costumam usar o mesmo nome.

**Medidas e métricas.** O número em si e a regra que o produz. A [documentação do dbt](https://docs.getdbt.com/docs/build/metrics-overview) separa quatro tipos: simples, razão, acumulada e derivada. A distinção importa porque razão e acumulada são onde mora quase todo desentendimento: *ticket médio* é razão, e duas pessoas dividindo coisas diferentes chegam a dois ticket médios igualmente defensáveis.

| Bloco | A pergunta que responde | Onde se erra |
|---|---|---|
| Entidade | O que conta como uma linha? | Junção inventada na hora, venda contada duas vezes |
| Dimensão | Por onde eu corto? | Três datas com o mesmo nome |
| Medida | Qual é o número? | Bruto e líquido no mesmo rótulo |
| Métrica | Qual é a regra? | Razão com denominadores diferentes |

## Por que documentação em wiki não conta como camada semântica?

Porque a definição precisa estar no caminho do cálculo, não ao lado dele.

Uma página de wiki descrevendo o que é receita líquida não impede ninguém de calcular diferente. Ela depende de a pessoa lembrar de abrir, e de o agente de IA ter sido apontado para lá. O que caracteriza uma camada semântica é que **o sistema não consegue responder sem passar por ela**.

Esse é o teste prático: se dá para produzir o número ignorando o documento, o documento é documentação, não camada semântica. A diferença aparece no dia em que alguém novo entra no time, ou no dia em que um agente de IA começa a responder sozinho — que é quando definição implícita vira [alucinação de métrica](https://precisian.io/blog/pt-BR/posts/alucinacao-de-metrica/), o número certo sobre a regra errada.

Vale insistir no "versionado", que costuma passar como detalhe burocrático e é metade do valor. Quando a regra muda, e ela muda, você precisa saber em que data mudou e quem decidiu. Sem isso, uma série histórica vira uma mistura de dois regimes sem aviso: o número de junho foi calculado com a regra velha, o de julho com a nova, e a queda de 8% que apareceu no meio é artefato de definição, não de negócio. Já vi time inteiro caçar causa de mercado para uma variação que tinha nascido de alguém corrigir um filtro.

Com histórico, essa investigação dura um minuto: abre-se o log da definição, vê-se a data da mudança e compara-se apenas dentro de cada regime. Sem histórico, ela dura uma semana e às vezes termina numa conclusão errada, que é pior do que não ter conclusão.

## Como escrever o primeiro contrato de métrica?

Comece por uma métrica só, e pela mais disputada. Quatro campos bastam.

**Nome.** Exato, e sem sinônimo circulando em paralelo. Se metade da empresa fala "faturamento" e a outra "receita", isso se resolve aqui, escolhendo um.

**A regra de cálculo.** Em linguagem de negócio antes de virar SQL. "Soma do valor dos pedidos faturados, menos cancelamento e devolução."

**O que entra e o que sai.** Frete, imposto, desconto, devolução, cancelamento, venda de marketplace. Cada item com sim ou não, sem "depende". O "depende" é exatamente a ambiguidade que se está eliminando.

**Qual data manda.** Pedido, pagamento ou faturamento. No Brasil isso não é detalhe: com Pix, pedido e pagamento colapsam no mesmo instante e a diferença some, até entrar um boleto e voltar.

E um quinto campo que não é técnico e decide o resto: **quem é o dono**. A pessoa que arbitra quando alguém discorda. Contrato de métrica sem dono é sugestão, e volta a divergir no trimestre seguinte.

Na prática, o primeiro contrato cabe numa tabela. Este é o de *receita líquida* de uma operação de e-commerce com loja própria e marketplace, que é onde a discussão costuma começar.

| Campo | Valor |
|---|---|
| **Nome** | `receita_liquida` — aposenta "faturamento líquido" e "receita real" |
| **Regra** | Soma do valor dos pedidos com status `faturado`, menos cancelamento e devolução |
| **Frete** | Não entra |
| **Imposto** | Não entra |
| **Desconto** | Entra, já abatido |
| **Devolução** | Sai, na data da devolução, não na do pedido |
| **Marketplace** | Entra, deduplicado por `pedido_id` da origem |
| **Data que manda** | Data de faturamento |
| **Dono** | Controladoria |

Escrito assim, some a pergunta "mas você está contando frete?". E aparece a segunda coisa, que é a mais valiosa: os pontos em que o time **não** concordava e ninguém tinha percebido. A devolução sair na data dela e não na do pedido, por exemplo, muda o número de todo mês fechado para trás. Essa é uma decisão de negócio, não de engenharia, e é por isso que o campo "dono" existe.

Feito o primeiro, o segundo leva um quarto do tempo. O custo está em estabelecer o formato e em descobrir quem decide, não em digitar.

## Quando você ainda não precisa de uma?

Quando existe uma fonte só. Loja única, um sistema, um relatório: a definição pode morar na cabeça de uma pessoa sem custo, porque não há duas versões para conflitar.

O limiar aparece quando surge a segunda fonte que fala do mesmo número, ou a segunda pessoa que responde a mesma pergunta. Antes disso, escrever contrato de métrica é cerimônia. Depois disso, cada trimestre sem ele custa retrabalho de reunião, e o custo cresce de um jeito desagradável: não é o esforço de escrever a definição que aumenta, é a quantidade de relatório, painel e automação já construídos em cima da definição implícita, que vão ter que ser conferidos um a um quando a regra finalmente for escrita.

Na Precisian, a camada semântica fica sobre um [data lake isolado por cliente](https://precisian.io/datalake/) e é entregue por API aberta e servidor MCP, para que o consumo aconteça na IA e no BI que o time já usa. O que está incluso e a faixa de entrada estão em [preços](https://precisian.io/precos).

## O que este artigo não cobre?

Não compara fornecedores de camada semântica, e não entra em implementação em ferramenta específica. A nomenclatura de entidades, dimensões e métricas está na do dbt porque virou vocabulário comum, não porque seja a única.

E um limite honesto no número citado: o teste de abril mede acurácia de resposta com e sem contexto semântico, num benchmark. Ele não mede retorno financeiro, e este artigo não afirma nenhum.

Se duas áreas da sua empresa reportam números diferentes para a mesma métrica, o primeiro passo não é escolher ferramenta: é escrever um contrato de métrica para a métrica mais disputada e achar o dono dela. [Agende uma conversa sobre o seu caso](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).
