---
title: "Como saber se o pipeline de dados quebrou (ou só mentiu)"
description: "O Airflow documenta o modo de falha numa frase: se a execução nunca termina, o prazo nunca é verificado."
slug: "como-saber-se-o-pipeline-de-dados-quebrou"
lang: "pt-BR"
translationKey: "detect-broken-data-pipeline"
publishedAt: 2026-11-12
tags: ["pipeline", "observabilidade", "divergencia-de-dados"]
draft: false
llmSummary: "Pipeline que quebra alto e facil; o caro e o que sai verde com dado errado ou vazio. O dbt documenta tres modos silenciosos: verificacao que nao roda, regra incompleta que nao derruba a execucao, e severity warn. Execucao que nunca comecou nao tem mecanismo documentado."
citations: ["https://airflow.apache.org/docs/apache-airflow/stable/howto/sla-to-deadlines.html", "https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/tasks.html", "https://docs.getdbt.com/reference/resource-configs/freshness", "https://docs.getdbt.com/docs/build/sources", "https://docs.getdbt.com/reference/resource-configs/severity", "https://airflow.apache.org/docs/apache-airflow-providers-common-sql/stable/operators.html", "https://research.google/pubs/everyone-wants-to-do-the-model-work-not-the-data-work-data-cascades-in-high-stakes-ai/"]
about: ["https://pt.wikipedia.org/wiki/Pipeline_de_dados", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 9
---

A documentação do Airflow descreve o modo de falha em uma frase: *"se o Dag run nunca termina, o SLA nunca é verificado"*. Foi um dos motivos para o recurso ser **removido na versão 3.0** e substituído por alertas de prazo na 3.1, que passam a ser calculados quando a execução **começa** e conferidos a cada 5 segundos ([Airflow](https://airflow.apache.org/docs/apache-airflow/stable/howto/sla-to-deadlines.html)).

Um monitor que só dispara no fim não enxerga o processo que não terminou. E essa é a versão fácil. Num estudo do CHI 2021 com 53 profissionais entrevistados, problemas de dado em cascata apareceram com 92% de prevalência, caracterizados como *"invisíveis, atrasados, mas frequentemente evitáveis"* ([CHI 2021](https://research.google/pubs/everyone-wants-to-do-the-model-work-not-the-data-work-data-cascades-in-high-stakes-ai/)).

> **Duas falhas diferentes.** "Quebrou" é a alta: código de saída diferente de zero, exceção, alerta. "Rodou e mentiu" é a silenciosa: o processo sai verde com dado errado, incompleto ou vazio. A segunda é a cara, e é a que quase nenhum alarme cobre.

O dbt documenta 3 maneiras de a verificação de atualidade simplesmente não rodar sem gerar erro nenhum, e orienta rodar a checagem com pelo menos 2 vezes a frequência do prazo que você prometeu ([dbt](https://docs.getdbt.com/docs/deploy/source-freshness)). Quase nenhum time faz as duas coisas.

## Seu monitor é da versão que não existe mais?

Vale conferir antes de qualquer outra coisa, porque duas ferramentas centrais mudaram a API recentemente.

No Airflow, *"o recurso de SLA do Airflow 2 foi removido no 3.0 e substituído no Airflow 3.1 por Alertas de Prazo"* ([Airflow](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/tasks.html)). No dbt, `dbt source freshness` passou a ser subcomando legado, e a verificação de sources e models virou o comando de topo `dbt freshness`.

A maior parte dos times brasileiros ainda roda versões anteriores, então as duas APIs convivem no mundo real. O risco não é usar a velha: é seguir um tutorial que ensina a velha sem dizer que ela morreu, e concluir que "está monitorado".

A diferença entre as duas gerações não é cosmética. O SLA antigo conferia o prazo *depois* que a execução terminava. O alerta de prazo calcula o vencimento *quando ela começa* e dispara *"imediatamente"*, sem esperar o fim. É a diferença entre saber que atrasou e saber que travou.

## Quais são as formas documentadas de falhar em silêncio?

Três, e as três estão descritas pelo próprio fornecedor. Não são bugs.

**A verificação que não roda.** No dbt, se você não informar `warn_after` nem `error_after`, *"o dbt não vai calcular a atualidade das tabelas dessa fonte"*. E se faltar o campo de carga sem alternativa viável, *"o dbt não vai calcular a atualidade da tabela"* ([dbt](https://docs.getdbt.com/docs/build/sources)). Nos dois casos não há erro. Há ausência de verificação, que na tela parece verde.

**A regra incompleta que não derruba a execução.** A documentação registra que uma regra parcial, por exemplo `warn_after` com contagem mas sem período, *"emite um aviso em tempo de análise"*, e que `dbt run` e `dbt build` *"avisam mas mesmo assim têm sucesso"* ([dbt](https://docs.getdbt.com/reference/resource-configs/freshness)). Só o comando de atualidade trata como erro.

**A severidade que rebaixa a falha.** Testes de dado no dbt têm `severity` com padrão `error`, mas aceitam `warn`, além de limiares configuráveis: `error_if` e `warn_if` aceitam comparações contra a contagem de linhas que falharam ([dbt](https://docs.getdbt.com/reference/resource-configs/severity)). Configurar `severity: warn` é uma forma deliberada e documentada de fazer uma asserção violada não derrubar o pipeline.

Essa terceira merece um parágrafo de honestidade: ela existe por bons motivos. O problema aparece quando o `warn` foi posto ali para calar um alarme barulhento numa terça-feira e ninguém voltou.

## O que faz um teste falhar alto?

Uma coisa só, e convém saber qual é.

No dbt, *"testes em recursos anteriores bloqueiam os posteriores, e uma falha de teste faz esses recursos serem pulados por completo"* ([dbt](https://docs.getdbt.com/reference/commands/build)). A ordem por modelo é testar, materializar e testar de novo.

Repare que essa garantia é do comando `build`. Quem roda transformação e teste em etapas separadas não tem esse bloqueio: o dado ruim já foi publicado quando o teste reclama, e a reclamação vira um aviso sobre algo que já está na mesa de alguém.

Os quatro testes que vêm de fábrica cobrem menos do que se imagina: unicidade, não-nulo, valores aceitos e integridade referencial. Todos são asserções sobre o conteúdo que **existe**. Nenhum deles pergunta se o conteúdo existe.

## Como detectar a tabela que ficou vazia?

Com uma verificação que precisa ser escrita, porque o padrão quase nunca é o que você quer.

O operador de checagem do Airflow avalia cada valor da primeira linha como booleano de Python, e a documentação dá o exemplo que resolve o caso: *"dada uma consulta como `SELECT COUNT(*) FROM foo`, ela falha apenas se a contagem for igual a zero"* ([Airflow](https://airflow.apache.org/docs/apache-airflow-providers-common-sql/stable/operators.html)). O mesmo texto lista o que o Python considera falso, entre eles o zero, a string vazia e a lista vazia.

Há aqui uma pegadinha que vale ouro e que quase ninguém checa: **os operadores irmãos têm padrões opostos.** No operador de tabela, o parâmetro que aceita vazio vem como falso, e a documentação o descreve como *"se verdadeiro, uma tabela vazia (contagem de linhas = 0) não vai disparar uma falha"*. No operador de coluna, o parâmetro análogo vem como **verdadeiro**, convertendo nulo em zero.

Ou seja: dependendo de qual dos dois você usou, a tabela vazia derruba o pipeline ou passa convertida em zero. Ler o padrão errado é fácil, e o erro se manifesta como um número plausível.

A mesma documentação enuncia a decisão de desenho que todo time precisa tomar conscientemente: colocar a checagem no caminho crítico *"impedindo a publicação de dado duvidoso"*, ou ao lado dele, recebendo alerta *"sem interromper o progresso"*. As duas são legítimas. O que não é legítimo é não ter decidido.

## Com que frequência verificar?

O próprio dbt publica a regra, e ela é mais exigente do que a prática comum.

A orientação é rodar os trabalhos de atualidade com *"pelo menos o dobro da frequência do seu menor acordo de nível de serviço"*, com exemplos: prazo de uma hora pede verificação a cada 30 minutos; prazo de um dia pede a cada 12 horas ([dbt](https://docs.getdbt.com/docs/deploy/source-freshness)).

A leitura prática é desconfortável. Se o time promete dado do dia anterior até as 9h e verifica uma vez por dia às 8h, ele descobre o atraso no mesmo instante em que o usuário descobre. A verificação não está prevenindo nada, só documentando.

## Qual falha nenhuma ferramenta pega sozinha?

A execução que nunca começou.

Os alertas de prazo do Airflow são registrados **quando uma execução inicia**. Uma execução que nunca iniciou, porque o agendador estava fora, porque o cron foi apagado, porque a credencial venceu, não entra nesse mecanismo. Procurei um recurso documentado para esse caso e não encontrei nenhum.

A mitigação existe e é arquitetural, não um recurso: um vigia externo ao pipeline, que espera um sinal periódico e alerta quando ele não chega. É o inverso de todo o resto, porque alerta pela **ausência** de evento. E é justamente o formato que cobre a falha que este artigo abriu descrevendo.

Registro explicitamente que isso é recomendação de desenho, não recurso documentado das ferramentas citadas. A diferença importa, porque significa que alguém precisa construir e manter.

É a mesma família de problema que faz [canal parado por falta de insumo não aparecer em log nenhum](https://precisian.io/blog/pt-BR/posts/vtex-ga4-nao-batem/): o que não acontece não gera registro, e monitoramento construído sobre registros é cego para isso por definição.

## Por que isso não é problema só de engenharia?

Porque a consequência aparece primeiro na decisão, não no log.

O estudo citado na abertura entrevistou profissionais de IA na Índia, na África Oriental e Ocidental e nos Estados Unidos, e a palavra que ele usa para o padrão é a que interessa aqui: *invisível*. Não é que o problema seja raro. É que ele não se anuncia (Sambasivan, Kapania, Highfill, Akrong, Paritosh e Aroyo, [CHI 2021](https://research.google/pubs/everyone-wants-to-do-the-model-work-not-the-data-work-data-cascades-in-high-stakes-ai/)).

Vale marcar o escopo: essa prevalência foi medida entre projetos de IA nessa amostra de entrevistados, não em pipelines de e-commerce. O que viaja para cá é a caracterização, invisível e atrasada, não o número.

E há um agravante recente. Enquanto o consumidor do dado é uma pessoa, a tabela vazia produz um gráfico estranho que alguém questiona. Quando o consumidor é um agente de IA, ele calcula sobre o que encontrou e [responde com a mesma confiança de sempre](https://precisian.io/blog/pt-BR/posts/alucinacao-de-metrica/). A janela entre a falha silenciosa e a decisão errada encurtou.

## O que este artigo não cobre?

Não traz tempo médio de detecção de incidente de dado. Procurei pesquisa revisada por pares com metodologia declarada sobre isso e **não existe**. O que circula com esse formato é pesquisa encomendada por fornecedor de observabilidade, autodeclarada, e a mais citada foi a campo três anos antes de aparecer numa página cujo título anuncia o ano corrente. Quem cita "tempo médio de detecção" está citando pesquisa de fornecedor, não literatura.

Não publica exemplo de configuração do macro de recência do dbt-utils. O arquivo existe e o comportamento é conhecido, mas não obtive reprodução literal dos argumentos, e exemplo de código errado é pior que exemplo nenhum.

Não afirma que a coluna de última alteração do Snowflake mente por causa de DDL. A documentação do dbt diz apenas que a atualidade usa essa coluna naquele banco; a consequência é plausível, circula bastante, e eu não a verifiquei na fonte do próprio banco.

E um registro de método, porque é o segundo desta série: ao levantar o artigo do CHI, um extrator automático devolveu uma **lista de autores inteiramente errada**, de outro trabalho da mesma pesquisadora. A lista acima veio das páginas de anais. Número com citação colada não é número conferido, e nome com citação colada também não.

Se o seu relatório de ontem estava verde e o número de hoje não fecha, [vale uma conversa sobre o seu caso](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).
