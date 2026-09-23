---
title: "Quanto custa deixar um agente de IA consultando o warehouse"
description: "Em tabela não agrupada, LIMIT não reduz o que você paga. E o Databricks entrega tempo-limite padrão de dois dias."
slug: "custo-de-consulta-de-agente-ia"
lang: "pt-BR"
translationKey: "query-cost-guardrails"
publishedAt: 2026-12-03
tags: ["custo", "mcp", "governanca"]
draft: false
llmSummary: "LIMIT nao reduz o custo em tabela nao agrupada: a varredura acontece e a conta corre. O controle que funciona no BigQuery e maximum_bytes_billed, avaliado antes da execucao. O Databricks entrega STATEMENT_TIMEOUT com padrao de 172.800 segundos, dois dias."
citations: ["https://docs.cloud.google.com/bigquery/docs/best-practices-costs", "https://docs.cloud.google.com/bigquery/docs/use-bigquery-mcp", "https://docs.snowflake.com/en/user-guide/snowflake-cortex/governance-and-availability/ai-cost-management-and-governance", "https://docs.databricks.com/aws/en/sql/language-manual/parameters/statement_timeout", "https://modelcontextprotocol.io/specification/2026-07-28/server/tools", "https://arxiv.org/abs/2512.22364", "https://www.anthropic.com/engineering/multi-agent-research-system"]
about: ["https://pt.wikipedia.org/wiki/Data_warehouse", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 9
---

O Databricks entrega `STATEMENT_TIMEOUT` com padrão de sistema de **172.800 segundos**, ou seja, dois dias ([Databricks](https://docs.databricks.com/aws/en/sql/language-manual/parameters/statement_timeout)). Esse padrão foi escrito para gente, que percebe. Um agente de IA consultando o mesmo warehouse não percebe nada: ele produz SQL válido, envia, lê o resultado e envia o próximo.

E a proteção que a maior parte dos times acredita ter não protege. Em tabela não agrupada, o `LIMIT` não reduz nada do que você paga.

> **O erro conceitual mais caro:** `LIMIT` corta o resultado, não a varredura. A conta é do que foi lido, não do que foi devolvido.

## Por que o LIMIT não resolve?

Porque ele age depois do que você paga, e a documentação diz isso com todas as letras.

O Google é direto: *"Para tabelas não agrupadas, aplicar uma cláusula LIMIT a uma consulta não afeta a quantidade de dados lida"* ([BigQuery](https://docs.cloud.google.com/bigquery/docs/best-practices-costs)). A varredura acontece, a conta corre, e o `LIMIT` apara a saída depois.

Um agente é especialmente propenso a cair nisso, porque "adicione um LIMIT por segurança" é exatamente o tipo de mitigação plausível que aparece em material de treinamento. O agente adiciona o `LIMIT`, relata que restringiu a consulta, e a fatura discorda.

O controle que funciona no BigQuery é o `maximum_bytes_billed`, avaliado **antes** da execução: o mecanismo estima os bytes primeiro e, se a estimativa passar do teto, *"a consulta falha sem gerar cobrança"*. Falhar é o recurso, não o defeito.

## Quanto um agente multiplica o volume?

Multiplica operações, e cada operação tem medidor próprio.

A Anthropic publicou a medição nos próprios sistemas: agentes usam cerca de **4 vezes** mais tokens que interação de chat, e sistemas multiagente cerca de **15 vezes** mais ([Anthropic Engineering, junho de 2025](https://www.anthropic.com/engineering/multi-agent-research-system)).

Esse número é de **tokens de modelo, não de bytes de warehouse**, e não se traduz em conta de computação. Registro isso porque a confusão é frequente e eu não vou alimentá-la. O que o dado estabelece é o que importa aqui: carga de agente multiplica o número de operações, e cada operação a jusante tem o próprio medidor.

A diferença qualitativa é a hesitação. Um analista que escreve consulta contra uma tabela enorme para antes de executar, confere o filtro de partição, olha a estimativa. O agente não tem hesitação a perder. Some um laço de repetição por erro e o volume deixa de ser eventual e passa a ser estrutural.

## O que os padrões dos fornecedores revelam?

Mais do que qualquer material de marketing, porque padrão é onde o time de plataforma registra o que espera dar errado.

O próprio servidor MCP do BigQuery vem com dois limites que nenhum produto voltado a humano toleraria: consultas são *"canceladas automaticamente"* após três minutos, e o resultado tem teto de 3.000 linhas ([Google](https://docs.cloud.google.com/bigquery/docs/use-bigquery-mcp)).

| Plataforma | Teto antes de executar | Teto durante | Controle de gasto |
|---|---|---|---|
| BigQuery | `maximum_bytes_billed`, falha sem cobrar | 3 min no servidor MCP | cotas personalizadas |
| Snowflake | não publicado | `STATEMENT_TIMEOUT_IN_SECONDS` | monitores de recurso |
| Databricks | `byte_limit` na API, se você definir | `STATEMENT_TIMEOUT`, padrão de 2 dias | orçamento é alerta, não teto |

A assimetria dessa tabela é o achado. Conectar um agente aos três com configuração padrão dá três raios de explosão muito diferentes, e quem assume que "o warehouse tem proteção" está certo em dois casos e errado num terceiro.

Dois detalhes do Snowflake valem saber antes de confiar neles. A aplicação de orçamento é periódica e, depois que um limiar é cruzado, *"as ações podem levar até oito horas para entrar em vigor"*, enquanto cotas por usuário valem *"em minutos"*. E cota não é compartilhada: a própria página observa que uma cota de 100 créditos distribuída entre 10 usuários permite até 1.000 créditos no total ([Snowflake](https://docs.snowflake.com/en/user-guide/snowflake-cortex/governance-and-availability/ai-cost-management-and-governance)).

## Modo somente-leitura protege o orçamento?

Protege o seu dado. Não faz nada pela sua conta, e essa distinção se perde o tempo todo.

Um agente somente-leitura não derruba tabela. Ele varre tabela do mesmo jeito. Custo e mutação são riscos separados, com controles separados, e confundir os dois é como um time se sente seguro enquanto gasta.

Há uma armadilha mais fina na própria especificação do MCP. As anotações de ferramenta incluem `readOnlyHint`, cujo padrão é falso, e `destructiveHint`, cujo padrão é verdadeiro. Mas a espec é explícita: elas são dicas, *"não há garantia de que forneçam uma descrição fiel do comportamento da ferramenta"*, e clientes *"nunca devem tomar decisões de uso de ferramenta com base em anotações recebidas de servidores não confiáveis"* ([spec MCP](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)).

`readOnlyHint` é documentação. A cobrança tem que morar onde não é possível mentir sobre si mesmo: permissão de nuvem, papel de banco e limite de warehouse. A mesma espec exige que servidores limitem a taxa de invocação e recomenda que clientes implementem tempo-limite e registrem uso para auditoria.

## SQL gerado por modelo custa mais?

A resposta honesta é que quase ninguém mediu contra a fatura, e o único estudo que mediu concluiu que o campo vinha medindo a coisa errada.

Um preprint de dezembro de 2025, não revisado por pares, rodou 180 execuções de consulta de seis modelos contra um conjunto de 230 GB no BigQuery. O resultado central: tempo de execução se correlaciona com custo da consulta a **r = 0,16**, de modo que as métricas de eficiência usadas nos comparativos estão, nas palavras dos autores, *"fundamentalmente desacopladas da cobrança em nuvem baseada em consumo"* ([arXiv 2512.22364](https://arxiv.org/abs/2512.22364)).

Com correção equivalente, modelos de raciocínio varreram **44,5% menos bytes** que os sem raciocínio, e a distância entre a melhor média e a pior consulta isolada passou de **20 vezes**.

Dois avisos de leitura. É preprint, e eu rotulo como tal. E a conclusão prática não é "escolha modelo de raciocínio": é que **benchmark de texto-para-SQL não diz nada sobre a sua fatura**, porque não foi desenhado para isso.

## Qual configuração colocar antes de conectar?

Quatro, na ordem em que doem menos se você errar.

**Teto de bytes antes da execução.** É o único controle que impede a cobrança em vez de reportá-la depois. Defina um valor que cubra a consulta legítima mais pesada com folga curta, não com folga generosa: folga generosa é exatamente o espaço que a varredura acidental ocupa.

**Tempo-limite curto, medido em minutos.** O padrão do fornecedor foi escrito para um analista que está olhando a tela. Ninguém está olhando a tela do agente. Três minutos, que é o que o próprio Google usa no servidor MCP dele, é um ponto de partida defensável.

**Teto de linhas no resultado.** Não pelo custo de varredura, que ele não afeta, mas porque resultado gigante entra no contexto do modelo e vira custo de token, além de degradar a resposta.

**Rótulo de identidade em toda consulta.** Antes de precisar. Depois que a conta assusta, adicionar rastreabilidade é um projeto; antes, é um parâmetro.

As quatro juntas levam menos de uma tarde e transformam a pergunta "quanto isso pode custar" de especulação em número conhecido. E o número conhecido é o que permite autorizar o uso em vez de proibi-lo por precaução, que é o desfecho mais comum quando ninguém mediu.

## Quem paga quando quem pergunta é o agente?

Uma pergunta de governança que quase nunca tem dono, e que aparece no fechamento do mês.

Num desenho comum, o agente roda sob uma credencial de serviço. O log do warehouse registra aquela credencial, não a pessoa que fez a pergunta. Então o relatório de custo mostra uma linha grande chamada "agente" e nenhuma forma de atribuir a nada.

O conserto é barato se feito antes: propagar identidade real até o warehouse, por rótulo de consulta ou por credencial por solicitante, de modo que o custo quebre por quem perguntou. Sem isso, a única alavanca disponível quando a conta assusta é desligar o agente inteiro, que é a decisão errada tomada por falta de informação.

Vale lembrar também que repasse de token é proibido pela espec, então a identidade precisa ser propagada por desenho, não por atalho. É [o mesmo problema do isolamento por cliente](https://precisian.io/blog/pt-BR/posts/isolamento-por-cliente-mcp/), visto pelo lado da fatura.

## Como diagnosticar a sua exposição esta semana?

Quatro verificações, nenhuma exige orçamento.

**Descubra o tempo-limite real em produção.** Não o do documento: o da configuração. Se for o padrão do fornecedor, você acabou de descobrir seu raio de explosão.

**Veja se existe teto antes da execução.** `maximum_bytes_billed` no BigQuery, `byte_limit` no Databricks. Se ninguém definiu, não existe.

**Meça a maior varredura do último mês.** Uma única consulta, o pior caso. Multiplique por um laço de repetição plausível. Esse é o número que interessa, não a média.

**Confira se o custo quebra por solicitante.** Se tudo aparece sob uma credencial de serviço, você não tem como responder "quem gastou" e, portanto, não tem como cobrar de ninguém.

## O que limite nenhum conserta?

A pergunta mal formulada que produz consulta cara e resposta plausível.

Teto impede a conta de explodir. Não impede o agente de varrer uma tabela inteira para responder algo que uma tabela agregada responderia em milissegundos, nem de repetir a mesma varredura porque a primeira resposta não fazia sentido.

A economia estrutural não vem de limite, vem de recorte: entregar ao agente uma camada modelada em vez da base crua reduz o custo pela mesma razão que reduz o risco, porque a tabela cara não está no contexto. É o argumento de [o que alimentar um servidor MCP](https://precisian.io/blog/pt-BR/posts/o-que-alimentar-um-mcp-server-ecommerce/), visto pelo medidor.

## O que este artigo não cobre?

Não traz custo por consulta em reais. Depende de plataforma, volume, contrato e de quantas repetições uma definição ruim provoca, e qualquer número publicado é a configuração de outra pessoa.

Não converte a multiplicação de tokens em conta de warehouse. São medidores diferentes, e fazer essa ponte sem medição seria inventar um número com aparência de fonte.

Não compara preço entre fornecedores. Tabela de preço de nuvem muda e comparação envelhece; o que não envelhece é a diferença entre ter e não ter teto antes da execução.

E cita o estudo de custo como preprint, porque é. Está aqui pelo desenho e pelos números declarados, não pela autoridade de um periódico que ele ainda não atravessou.
