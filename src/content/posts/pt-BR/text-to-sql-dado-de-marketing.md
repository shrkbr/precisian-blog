---
title: "Por que text-to-SQL erra em dado de marketing (mesmo quando a SQL roda)"
description: "A SQL que roda é o pior caso de text-to-SQL: coluna errada, janela errada e join que duplica linha devolvem um número limpo, sem erro nenhum."
slug: "text-to-sql-dado-de-marketing"
lang: "pt-BR"
translationKey: "text-to-sql"
publishedAt: 2026-10-14
tags: ["text-to-sql", "camada-semantica", "alucinacao-de-metrica", "dados-para-ia", "ecommerce"]
draft: false
llmSummary: "Text-to-SQL erra em dado de marketing sem dar erro: o modelo escolhe a coluna de receita errada, a janela errada ou um join que duplica linhas. No Spider 2.0 (ICLR 2025), o o1-preview resolveu 21,3% de 632 tarefas corporativas, contra 91,2% no Spider 1.0."
citations: ["https://arxiv.org/abs/2411.07763", "https://arxiv.org/abs/2305.03111", "https://bird-bench.github.io/", "https://docs.getdbt.com/docs/build/join-logic", "https://omni.co/blog/why-text-to-sql-fails", "https://arxiv.org/abs/2501.09310"]
about: ["https://en.wikipedia.org/wiki/Natural-language_user_interface", "https://en.wikipedia.org/wiki/Semantic_layer", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 9
---

Text-to-SQL erra em dado de marketing justamente quando a consulta roda: o modelo escolhe a coluna de receita errada, a janela de datas errada, junta uma tabela que duplica linhas ou soma o mesmo pedido em dois canais, e devolve um número limpo, sem mensagem de erro. Acertar é difícil mesmo em teste controlado: no Spider 2.0, apresentado no ICLR 2025, o o1-preview resolveu 21,3% de 632 tarefas corporativas, contra 91,2% no Spider 1.0 ([Lei et al., 2024](https://arxiv.org/abs/2411.07763)).

O conserto é dar ao modelo métricas definidas em vez de tabelas. Trocar de modelo não elimina nenhum dos quatro erros descritos abaixo.

> **Text-to-SQL** é a técnica em que um modelo de linguagem traduz uma pergunta em linguagem natural para uma consulta SQL contra o esquema de um banco. **Text-to-SQL governado** é a variante em que o modelo consulta métricas já definidas numa camada semântica, em vez de montar a conta a partir das tabelas.

## Como esse erro aparece na sua operação?

Ele aparece como um número que ninguém contesta na hora.

Alguém pergunta ao agente "qual foi a receita de setembro?" e recebe um valor redondo, com a SQL anexada, se pedir. A consulta é sintaticamente perfeita. O valor é diferente do que o financeiro fechou, mas a diferença só aparece na reunião do mês seguinte, quando alguém compara os dois slides. Até lá o número já foi para a apresentação da diretoria e para a decisão de verba.

O sintoma tem três variações que eu ouço com frequência:

- **O número muda quando a pergunta muda de palavra.** "Receita de setembro" e "faturamento de setembro" voltam diferentes, e as duas SQL rodam.
- **A soma por canal passa do total.** O agente quebra a receita por canal de mídia e a soma das partes é maior que o mês.
- **A receita sobe quando você pede um detalhe.** Pedir "receita e itens vendidos" na mesma pergunta devolve uma receita maior do que pedir só a receita.

Nenhuma dessas três dispara alerta. É por isso que a SQL válida é o pior caso: SQL com erro de sintaxe quebra na hora e alguém conserta; SQL válida com significado errado vira série histórica.

A Omni, que vende BI com camada semântica e portanto tem interesse no diagnóstico, resume o problema assim: *"o perigo real é que o text-to-SQL falha em silêncio e com confiança"*, e *"o problema não é que os LLMs escrevem SQL ruim; é que escrevem SQL plausível que significa a coisa errada"* ([Omni, abril de 2026](https://omni.co/blog/why-text-to-sql-fails)). É opinião de fornecedor. Os quatro mecanismos abaixo são o que a sustenta.

## Por que a SQL que roda é o pior caso?

Porque o modelo vê colunas, e a pergunta é sobre uma definição que não está em coluna nenhuma.

Para tornar isso concreto, usei um esquema de e-commerce **sintético**, criado para este artigo, com quatro tabelas que existem em quase toda operação de varejo:

```sql
-- Esquema sintético (não é de cliente nenhum)
pedidos    (id_pedido, data_pedido, data_faturamento, status, canal_venda,
            valor_bruto, desconto, frete, valor_liquido)
itens      (id_pedido, sku, quantidade, preco_unitario)
devolucoes (id_pedido, data_devolucao, valor_devolvido)
midia      (data, plataforma, campanha, gasto, receita_atribuida)
```

### 1. A coluna de receita errada

Pergunta: "qual foi a receita de setembro?". Existem pelo menos quatro candidatas: `valor_bruto`, `valor_liquido`, `valor_liquido` menos devolução, e `receita_atribuida` da tabela de mídia. O nome que mais se parece com "receita" ganha.

```sql
SELECT SUM(valor_bruto)
FROM pedidos
WHERE data_pedido >= '2026-09-01' AND data_pedido < '2026-10-01';
```

Roda. Inclui pedido cancelado, inclui frete, ignora desconto e não abate devolução. O financeiro, em geral, fecha outra coisa: valor faturado, sem frete, menos devolução. Qual das quatro é a certa não está no esquema; está numa decisão da empresa, quase sempre não escrita. É o mecanismo que descrevi em [alucinação de métrica](https://precisian.io/blog/pt-BR/posts/alucinacao-de-metrica/), visto pelo lado da SQL.

### 2. A janela errada

Mesma pergunta, outro erro. O modelo usa `data_pedido` quando o financeiro fecha por `data_faturamento`. Com boleto, os dois campos podem cair em meses diferentes. E há duas armadilhas de borda que passam em qualquer revisão rápida:

```sql
-- Se data_pedido é timestamp, este filtro corta o dia 30 inteiro depois da meia-noite
WHERE data_pedido BETWEEN '2026-09-01' AND '2026-09-30'

-- E se o banco grava em UTC, os pedidos das 21h às 24h do último dia
-- (horário de Brasília) caem no mês seguinte
```

"Mês passado" ainda pode virar "últimos trinta dias" se a pergunta for vaga. Nada disso dá erro.

### 3. O join que duplica linha (fan-out)

Pergunta: "qual foi a receita e quantos itens vendemos em setembro?". O modelo junta pedidos com itens, que é o caminho óbvio:

```sql
SELECT SUM(p.valor_liquido) AS receita,
       SUM(i.quantidade)   AS itens
FROM pedidos p
JOIN itens i ON i.id_pedido = p.id_pedido
WHERE p.data_faturamento >= '2026-09-01' AND p.data_faturamento < '2026-10-01';
```

Cada pedido aparece uma vez por item. Um pedido com três SKUs tem o `valor_liquido` somado três vezes. A contagem de itens sai certa; a receita sai multiplicada. A documentação do dbt define o fenômeno com precisão: *fan-out* é quando *"uma linha de uma tabela é juntada a várias linhas de outra, resultando em mais linhas de saída do que de entrada"* ([dbt, atualizado em setembro de 2026](https://docs.getdbt.com/docs/build/join-logic)). O mesmo acontece com `devolucoes`, quando um pedido tem duas devoluções parciais.

### 4. O mesmo pedido somado em dois canais

Pergunta: "quanto a mídia trouxe de receita em setembro?".

```sql
SELECT SUM(receita_atribuida)
FROM midia
WHERE data >= '2026-09-01' AND data < '2026-10-01';
```

Cada plataforma registra a receita que atribui a si mesma, pelas regras dela, e o mesmo pedido cabe na janela de mais de uma. Somar as linhas da tabela soma as reivindicações, e o total pode passar do faturamento, como mostrei em [por que a soma do ROAS passa do faturamento](https://precisian.io/blog/pt-BR/posts/roas-soma-maior-que-faturamento/). A versão de varejo do mesmo erro é somar loja própria e marketplace sem regra de [deduplicação entre site e marketplace](https://precisian.io/blog/pt-BR/posts/deduplicar-venda-site-marketplace/).

### O tamanho do estrago, num exemplo com números redondos

Os valores abaixo são **sintéticos**, montados só para mostrar a ordem de grandeza de cada erro sobre o mesmo mês:

| Pergunta | SQL que o modelo escolheu | Valor devolvido | Valor que o financeiro fecha |
|---|---|---|---|
| Receita de setembro | `SUM(valor_bruto)` por `data_pedido` | R$ 1.180.000 | R$ 1.000.000 |
| Receita e itens de setembro | `JOIN itens` + `SUM(valor_liquido)` | R$ 2.350.000 | R$ 1.000.000 |
| Receita trazida pela mídia | `SUM(receita_atribuida)` em todas as plataformas | R$ 1.420.000 | não existe esse número no financeiro |

As três consultas rodam sem aviso nenhum.

## O que os benchmarks medem, e o que não medem?

Medem se o modelo chega ao resultado de uma SQL de referência que alguém já escreveu. Não medem se essa referência é a definição da sua empresa.

O BIRD reúne 12.751 pares de pergunta e SQL sobre 95 bancos que somam 33,4 GB; no artigo original, humanos acertaram 92,96% e o ChatGPT, 40,08% ([Li et al., 2023](https://arxiv.org/abs/2305.03111)). No placar oficial consultado em 14/10/2026, a melhor entrada no conjunto de teste marcava 82,95% de acurácia de execução, numa submissão de 07/09/2026 ([BIRD](https://bird-bench.github.io/)). O Spider 2.0 subiu a régua para bancos corporativos, frequentemente com mais de 1.000 colunas em BigQuery e Snowflake, e o acerto caiu para 21,3% ([Lei et al., 2024](https://arxiv.org/abs/2411.07763)).

Os dois números contam a mesma coisa por lados diferentes. Quando a pergunta tem gabarito, o modelo chega perto do humano. Quando o esquema cresce e as decisões de significado ficam implícitas, ele cai.

Em dado de marketing, a pergunta "qual foi a receita?" não tem gabarito até alguém escrever qual receita. Um benchmark com acerto alto prova que o modelo traduz bem uma pergunta com uma resposta só. A sua pergunta tem quatro.

## Como diagnosticar na sua base?

Com seis verificações que qualquer analista roda numa tarde, a partir das SQL que o agente já gerou.

| Verificação | Como rodar | O que indica problema |
|---|---|---|
| Qual coluna foi usada | Peça a SQL junto com toda resposta de receita | `valor_bruto`, `receita_atribuida` ou soma sem abater devolução |
| Qual data manda | Procure o campo de data no `WHERE` | `data_pedido` onde o financeiro usa faturamento |
| Borda da janela | Procure `BETWEEN` em campo de timestamp e o fuso do banco | Último dia cortado ou pedidos da noite no mês errado |
| Grão depois do join | Rode a contagem abaixo | `linhas` maior que `pedidos` |
| Soma de canais | Compare a soma de `receita_atribuida` com a receita líquida do mês | Soma maior que o total |
| Estabilidade | Mesma pergunta, duas sessões, palavras diferentes | Números diferentes |

A verificação de grão é a mais barata e a que pega o erro mais caro:

```sql
SELECT COUNT(*) AS linhas,
       COUNT(DISTINCT p.id_pedido) AS pedidos
FROM pedidos p
JOIN itens i ON i.id_pedido = p.id_pedido;
-- Se linhas > pedidos, qualquer SUM de coluna de pedido nesse join está inflado
```

Depois, monte as **perguntas de ouro**: as perguntas que a diretoria faz todo mês, com a resposta que o financeiro já conferiu. Rode todas no agente e anote a distância. Se você não consegue escrever a resposta de ouro de uma pergunta, o problema está na definição, e a conversa é sobre [a mesma definição de receita para marketing e financeiro](https://precisian.io/blog/pt-BR/posts/mesma-definicao-de-receita/).

## Como corrigir?

Tirando do modelo a decisão que ele nunca deveria ter tomado. São três passos.

**Defina a métrica uma vez, versionada.** Coluna, filtro de status, o que entra e sai, qual data manda, fuso, grão e dono. O formato de um contrato de métrica está em [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/); aqui importa o efeito: os erros 1 e 2 deixam de existir, porque a escolha da coluna e da janela saiu da pergunta e foi para a definição.

**Faça o agente consultar por métrica, não por tabela.** A diferença é o que o modelo escreve:

```text
-- Por tabela: o modelo escolhe coluna, data, join e filtro
SELECT ... FROM pedidos JOIN itens ... WHERE ...

-- Por métrica: o modelo escolhe só o que a pergunta pede
metrica: receita_liquida   versao: 3
dimensoes: canal_venda
periodo: 2026-09 (mês de faturamento)
```

Quem gera a SQL é a camada, a partir de caminhos de junção declarados. O MetricFlow, do dbt, documenta exatamente isso: ele *"restringe o uso de joins de fan-out e de chasm"* e escolhe o tipo de join pelas entidades declaradas ([dbt](https://docs.getdbt.com/docs/build/join-logic)). O erro 3 some por construção. O erro 4 some por nome: receita atribuída por plataforma e receita líquida passam a ser métricas diferentes, e a primeira não se soma entre plataformas. Consulta por métrica também limita o que o agente varre, o que reduz [o custo de consulta de agente de IA](https://precisian.io/blog/pt-BR/posts/custo-de-consulta-de-agente-ia/).

**Teste com as perguntas de ouro a cada mudança.** Mudou a definição, o modelo, o esquema ou a versão do conector: roda a lista inteira e compara com o gabarito do financeiro. Uma pergunta de ouro que passa a divergir é uma regressão, tratada como bug.

É esse o recorte que a Precisian entrega: camada semântica versionada sobre um data lake isolado por cliente, na nossa infraestrutura, acessada pela IA que o seu time já usa via MCP, API ou BI. A infraestrutura é nossa, o dado é seu. Você acessa a qualquer momento e, se sair, leva tudo, incluindo as definições.

## Quando não tem conserto?

Quando a pergunta não tem métrica definida, e nem deveria ter.

**Pergunta sobre decisão que a empresa não tomou.** "A receita de marketplace entra bruta ou líquida de comissão?" Se o financeiro e o marketing respondem diferente, nenhuma camada resolve: ela só registra a resposta depois que alguém decide. Até lá, o comportamento certo do agente é dizer que não sabe, e [ensinar a IA a dizer não sei](https://precisian.io/blog/pt-BR/posts/ensinar-a-ia-a-dizer-nao-sei/) é parte do conserto.

**Pergunta sobre dado que não existe.** "Qual campanha deu mais lucro?" exige custo por SKU, frete real e comissão. Se a base não tem custo, o agente vai dividir receita por gasto e chamar de lucro. Métrica nenhuma cria a coluna que falta.

**Exploração ad hoc.** Quando um analista que lê SQL está investigando um padrão novo, text-to-SQL direto sobre tabela é útil e a governança atrapalha. A pessoa confere a consulta antes de usar o número. O risco aparece quando a mesma consulta vira resposta para quem não lê SQL.

E o caso em que a Precisian não é a resposta: se as suas perguntas são quase todas exploratórias e quem pergunta é sempre alguém que audita a SQL, o ganho de uma camada semântica é pequeno perto do esforço de definir e manter as métricas.

## O que este artigo não cobre?

Não cobre segurança: injeção de prompt e permissão por linha são outro modo de falha, tratado em [injeção de prompt em dado de marketing](https://precisian.io/blog/pt-BR/posts/injecao-de-prompt-em-dado-de-marketing/). Não compara ferramentas de camada semântica.

O texto da Omni lista outros números sobre o tema que usei só como ponteiro. Um deles mostra por que número com citação colada não é número conferido: a taxonomia de erros de text-to-SQL de Shen et al. falava em 29 tipos de erro na primeira versão, de janeiro de 2025, e o resumo da versão atual, de junho de 2026, fala em 27 ([arXiv 2501.09310](https://arxiv.org/abs/2501.09310)). Os placares de benchmark também mudam toda semana; os valores acima têm data por isso.

Se o agente da sua operação devolve receita sem dizer qual coluna usou, o primeiro passo é medir a distância entre a resposta dele e o fechamento do financeiro em algumas perguntas de ouro. [Veja como uma consulta por métrica funciona na prática](https://precisian.io/demonstracao): sem compromisso de contrato, mas sem promessa de resposta em 30 minutos também.
