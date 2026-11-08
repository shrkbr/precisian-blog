---
title: "MCP do BigQuery: o que o agente consegue consultar e o que fica de fora"
description: "O MCP do BigQuery dá ao agente 9 ferramentas, SQL em tabela crua e 3.000 linhas por resposta. Não traz teto de bytes por consulta nem definição de métrica."
slug: "mcp-do-bigquery"
lang: "pt-BR"
translationKey: "bigquery-mcp"
publishedAt: 2026-11-03
tags: ["mcp", "data-warehouse", "custo", "governanca", "dados-para-ia", "alucinacao-de-metrica", "ga4"]
draft: false
llmSummary: "O servidor MCP remoto do BigQuery (bigquery.googleapis.com/mcp) expõe 9 ferramentas, entre elas execute_sql_readonly e execute_sql, com teto de 3 minutos e 3.000 linhas. O esquema de entrada não aceita maximumBytesBilled; o MCP Toolbox for Databases aceita, com padrão 0 (sem teto)."
citations: ["https://docs.cloud.google.com/bigquery/docs/use-bigquery-mcp", "https://docs.cloud.google.com/bigquery/docs/reference/mcp", "https://docs.cloud.google.com/bigquery/docs/reference/mcp/tools_list/execute_sql_readonly", "https://docs.cloud.google.com/bigquery/docs/pre-built-tools-with-mcp-toolbox", "https://github.com/googleapis/mcp-toolbox", "https://github.com/googleapis/mcp-toolbox/blob/main/docs/en/integrations/bigquery/source.md", "https://github.com/googleapis/mcp-toolbox/blob/main/internal/prebuiltconfigs/tools/bigquery.yaml", "https://cloud.google.com/bigquery/pricing", "https://docs.cloud.google.com/bigquery/docs/custom-quotas", "https://support.google.com/analytics/answer/7029846"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://en.wikipedia.org/wiki/BigQuery", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 10
cta: demo
updatedAt: 2026-11-08
---
O MCP do BigQuery deixa um agente de IA listar datasets, ler o esquema das tabelas e rodar SQL no seu projeto, mas não sabe o que cada coluna significa para o negócio. O servidor remoto do Google, em `https://bigquery.googleapis.com/mcp`, expõe nove ferramentas, corta a consulta em três minutos e devolve no máximo 3.000 linhas ([Google Cloud](https://docs.cloud.google.com/bigquery/docs/use-bigquery-mcp), página atualizada em 29/10/2026). O esquema de entrada da ferramenta de SQL não aceita teto de bytes por consulta, e a definição de "receita" continua sendo escrita pelo agente, a cada pergunta.

> **MCP do BigQuery**: servidor que implementa o Model Context Protocol sobre a API do BigQuery e entrega a um modelo de linguagem ferramentas para descobrir metadados e executar GoogleSQL num projeto do Google Cloud, com a permissão de IAM da identidade que o agente usa.

## Qual é o sintoma?

Você conecta o BigQuery no Claude ou no Gemini, pergunta "quanto faturamos ontem" e recebe um número em dez segundos. O agente achou o dataset do export do GA4, leu o esquema, escreveu um `SUM` sobre `ecommerce.purchase_revenue` e respondeu. A consulta está certa como SQL.

O problema aparece em três lugares:

- **O número muda amanhã.** O agente consultou uma tabela diária que o GA4 ainda vai completar.
- **O número não fecha com o financeiro.** A soma inclui pedido cancelado, pedido duplicado e venda de teste, e não inclui Mercado Livre nem WhatsApp.
- **A fatura do Google Cloud sobe.** Cada pergunta virou uma varredura em todas as tabelas `events_*`, e ninguém viu o tamanho antes.

Nenhum dos três é falha do servidor. Ele faz o que promete: dá ao agente acesso à tabela. O que a tabela significa ficou de fora.

## Quais são as opções oficiais do Google?

São duas, e elas não têm as mesmas proteções.

**1. O servidor remoto (gerenciado).** Roda na infraestrutura do Google, é habilitado junto com a API do BigQuery e usa OAuth 2.0 com IAM. A documentação pede três papéis: MCP Tool User (`mcp.tools.call`), BigQuery Job User (`bigquery.jobs.create`) e BigQuery Data Viewer (`bigquery.tables.getData`), e recomenda "criar uma identidade separada para os agentes" ([Google Cloud](https://docs.cloud.google.com/bigquery/docs/use-bigquery-mcp)).

**2. O MCP Toolbox for Databases (local, código aberto).** O repositório se chamava `googleapis/genai-toolbox` e hoje redireciona para `googleapis/mcp-toolbox`, licença Apache 2.0, versão v1.15.0 de 23/10/2026 ([GitHub](https://github.com/googleapis/mcp-toolbox)). O Google o indica quando você precisa de ferramenta sobre SQL parametrizado ou não tem permissão para habilitar o servidor remoto. A configuração pronta sobe com `--prebuilt bigquery` ([Google Cloud](https://docs.cloud.google.com/bigquery/docs/pre-built-tools-with-mcp-toolbox), atualizada em 27/10/2026).

As ferramentas de cada um, conferidas em 03/11/2026:

| Ferramenta | Servidor remoto | Toolbox (`--prebuilt bigquery`) |
|---|---|---|
| `list_dataset_ids`, `list_table_ids` | sim | sim |
| `get_dataset_info`, `get_table_info` | sim | sim |
| `execute_sql_readonly` (só `SELECT`) | sim | não |
| `execute_sql` (inclui DML e DDL) | sim | sim |
| `get_query_results`, `get_job`, `cancel_job` | sim | não |
| `search_catalog`, `forecast`, `analyze_contribution`, `ask_data_insights` | não | sim |

Fontes: [referência MCP do BigQuery](https://docs.cloud.google.com/bigquery/docs/reference/mcp) (atualizada em 15/10/2026) e [`bigquery.yaml`](https://github.com/googleapis/mcp-toolbox/blob/main/internal/prebuiltconfigs/tools/bigquery.yaml) do Toolbox.

No servidor remoto, a única ferramenta que não é só leitura é `execute_sql`, e o Google documenta uma política de negação de IAM para bloqueá-la. Toda consulta feita pelo MCP leva o rótulo de job `goog-mcp-server: true`.

## O que fica de fora do MCP do BigQuery?

A [documentação](https://docs.cloud.google.com/bigquery/docs/use-bigquery-mcp#limitations) lista os limites do servidor remoto, em 29/10/2026:

- `execute_sql` e `execute_sql_readonly` não consultam tabela externa do Google Drive.
- Consulta que passa de três minutos é cancelada automaticamente.
- O resultado tem no máximo 3.000 linhas ([Google Cloud](https://docs.cloud.google.com/bigquery/docs/use-bigquery-mcp#limitations)).
- `execute_sql_readonly` não aceita DML, DDL, UDF em Python nem Graph Query Language.

Há mais um limite que não está nessa lista: o [esquema de entrada de `execute_sql_readonly`](https://docs.cloud.google.com/bigquery/docs/reference/mcp/tools_list/execute_sql_readonly) aceita `projectId`, `query`, `dryRun`, `labels`, `jobTimeoutMs` e `timeoutMs`. Não existe `maximumBytesBilled`. O teto de bytes que falha a consulta antes de cobrar, o controle de custo mais direto do BigQuery, não passa pela ferramenta. O que volta é o custo depois do fato: a saída traz `totalBytesProcessed` e `totalBytesBilled`.

O Toolbox tem o teto, mas desligado. A fonte `bigquery` aceita `maximumBytesBilled` ("consultas que excedem esse limite falham antes de executar"), `allowedDatasets` e `writeMode` com três valores: `allowed`, `blocked` e `protected` ([documentação da fonte](https://github.com/googleapis/mcp-toolbox/blob/main/docs/en/integrations/bigquery/source.md)). Na configuração pronta, `maximumBytesBilled` vem com 0, ou seja, sem teto, `writeMode` vem como `allowed` e o resultado é cortado em 50 linhas.

Nenhum dos dois traz a definição da métrica. `get_table_info` devolve o esquema e a descrição de cada coluna, quando alguém a escreveu. Se ninguém escreveu, o agente deduz o significado pelo nome.

## Por que a tabela crua gera número errado?

Porque o agente lê o dado como ele foi gravado, e o export do GA4 grava evento, não venda. O Google documenta quatro detalhes que mudam a resposta ([Google Analytics](https://support.google.com/analytics/answer/7029846)):

1. **A tabela de ontem não está pronta.** O GA4 atualiza as tabelas diárias `events_YYYYMMDD` com eventos que chegam atrasados "por até três dias".
2. **Receita e reembolso são eventos diferentes.** `ecommerce.purchase_revenue` só é preenchido no evento de compra; `ecommerce.refund_value`, só no de reembolso. Somar o primeiro sem subtrair o segundo dá receita bruta.
3. **A moeda tem duas colunas.** `purchase_revenue` está na moeda local e `purchase_revenue_in_usd` em dólar. O agente escolhe uma pelo nome.
4. **Duplicidade é por `ecommerce.transaction_id`.** Se a página de confirmação dispara o `purchase` duas vezes, a soma conta duas vezes, a menos que a consulta deduplique.

Cada pergunta faz o agente reescrever essas quatro decisões. Se ele escolher diferente na segunda-feira e na quinta, os dois números saem corretos como SQL e incompatíveis entre si. É a [alucinação de métrica](https://precisian.io/blog/pt-BR/posts/alucinacao-de-metrica/): o modelo não inventa dado, inventa a definição.

O custo segue a mesma lógica. No modelo sob demanda, o BigQuery cobra US$ 6,25 por TiB processado em Iowa (`us-central1`), sem cobrança no primeiro TiB do mês por conta, mínimo de 10 MB por tabela referenciada, e cobra pelas colunas lidas "mesmo se você definir um LIMIT explícito" ([preços do BigQuery](https://cloud.google.com/bigquery/pricing), página atualizada em 15/10/2026). Outras regiões, como São Paulo, têm tabela própria na mesma página. A cota padrão `QueryUsagePerDay` é de 200 TiB por projeto por dia, e `QueryUsagePerUserPerDay` é ilimitada por padrão ([cotas personalizadas](https://docs.cloud.google.com/bigquery/docs/custom-quotas)). Multiplicando as duas páginas, o teto padrão permite até US$ 1.250 por dia em consulta num projeto em `us-central1`.

## Como diagnosticar o que o agente já fez?

Pelo rótulo. Toda consulta do MCP sai com `goog-mcp-server: true`, então dá para isolá-las na view `INFORMATION_SCHEMA.JOBS` da região:

```sql
SELECT
  DATE(creation_time) AS dia,
  user_email,
  COUNT(*) AS consultas,
  ROUND(SUM(total_bytes_billed) / POW(2, 8 * 5), 3) AS tib_cobrados  -- 2^40 bytes = 1 TiB
FROM `region-us`.INFORMATION_SCHEMA.JOBS
WHERE EXISTS (
  SELECT 1 FROM UNNEST(labels) l
  WHERE l.key = 'goog-mcp-server' AND l.value = 'true')
  AND creation_time >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
GROUP BY dia, user_email
ORDER BY tib_cobrados DESC;
```

Depois, o checklist:

| Verificação | Onde olhar | O que indica problema |
|---|---|---|
| Quem é o agente | `user_email` na consulta acima | Conta de pessoa em vez de identidade dedicada |
| Ferramenta de escrita liberada | Política de negação de IAM | `execute_sql` disponível para um agente de leitura |
| Teto diário por usuário | Cotas: "Query usage per day per user" | Ilimitado (o padrão) |
| Varredura sem filtro de data | Texto da consulta em `INFORMATION_SCHEMA.JOBS` | `events_*` sem `_TABLE_SUFFIX` |
| Coluna sem descrição | Saída de `get_table_info` | Campo de receita sem `description` |
| Mesma pergunta, número diferente | Repetir a pergunta em dois dias | Tratamento de reembolso ou de moeda trocado |

## Como colocar guarda-corpo?

Em ordem do que dá mais retorno com menos esforço:

**1. Identidade própria e só leitura.** Crie uma conta de serviço para o agente, com BigQuery Data Viewer apenas nos datasets de que ele precisa, e aplique a política de negação que bloqueia ferramenta MCP de escrita. Assim `execute_sql` sai de cena e sobra `execute_sql_readonly`.

**2. Teto de bytes por dia.** Como o servidor remoto não aceita `maximumBytesBilled`, o freio está na cota: defina `QueryUsagePerUserPerDay` para a identidade do agente. Ao estourar, o BigQuery devolve `quotaExceeded`, e o agente para de consultar até a meia-noite do Pacífico. Se usar o Toolbox, preencha `maximumBytesBilled` e `allowedDatasets` e troque `writeMode` para `blocked`. O raciocínio completo de custo está em [quanto custa a consulta de um agente de IA](https://precisian.io/blog/pt-BR/posts/custo-de-consulta-de-agente-ia/).

**3. Peça `dryRun` antes de consulta grande.** O parâmetro existe no servidor remoto e devolve os bytes que seriam processados sem rodar nada. Uma instrução de sistema do tipo "acima de 50 GB, mostre a estimativa e pergunte" resolve boa parte do susto.

**4. Tire o agente da tabela crua.** Os três passos anteriores limitam a conta; este corrige o número. Em vez de `events_*`, o agente consulta uma view ou tabela em que receita já está definida: bruta ou líquida, com ou sem frete, deduplicada por `transaction_id`, com a janela de três dias resolvida. É isso que uma [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/) faz: a definição é escrita uma vez, versionada, e o agente só escolhe qual métrica pedir. A diferença para deixar o modelo escrever o SQL inteiro está em [text-to-SQL em dado de marketing](https://precisian.io/blog/pt-BR/posts/text-to-sql-dado-de-marketing/).

## Quando isso não tem conserto?

Em três casos.

**Venda que não está no BigQuery não aparece.** O MCP lê o projeto. Se o pedido do Mercado Livre, o fechamento no WhatsApp e o cancelamento do ERP não foram carregados ali, nenhuma ferramenta os traz. É o mesmo limite do [MCP do Google Analytics](https://precisian.io/blog/pt-BR/posts/mcp-do-google-analytics/), um nível abaixo.

**Teto por consulta no servidor remoto.** Hoje não existe parâmetro para isso na ferramenta. A cota diária limita o estrago acumulado, não a primeira consulta grande do dia.

**Resultado acima de 3.000 linhas.** O agente pode paginar com [`get_query_results`](https://docs.cloud.google.com/bigquery/docs/reference/mcp), mas cada página volta para o contexto do modelo. Pergunta que precisa de milhares de linhas para ser respondida é pergunta para agregar no warehouse, não no chat.

Um exemplo com números redondos, sintético, para dimensionar:

| Cenário (sintético) | Valor |
|---|---|
| Tamanho de todas as tabelas `events_*` de um ano | 2 TiB |
| Bytes lidos por pergunta sem filtro de data (colunas de receita e data, não a tabela toda) | 0,2 TiB |
| Perguntas por dia, somando o time | 40 |
| TiB por mês (22 dias úteis) | 176 |
| Custo em `us-central1`, descontado o primeiro TiB do mês | US$ 1.093,75 |

Com filtro de data em `_TABLE_SUFFIX` restrito ao último mês, a mesma rotina lê perto de um duodécimo disso. Os números são ilustrativos; o seu está na consulta de diagnóstico acima.

Para parte dos times, o MCP do BigQuery basta. Se o seu time já mantém views modeladas no BigQuery, com receita definida e tudo carregado ali, o servidor remoto com identidade de leitura e cota resolve, e você não precisa de outra plataforma. A Precisian entra quando o dado de venda está espalhado entre GA4, VTEX, marketplace e mídia e ninguém mantém essas definições: ela junta as fontes num data lake isolado por cliente, na infraestrutura da Precisian, escreve a definição de receita numa camada semântica e entrega ao seu agente por MCP, API ou BI.

## O que este artigo não cobre?

Não é tutorial de instalação: a configuração de cada cliente está na [documentação do Google](https://docs.cloud.google.com/bigquery/docs/use-bigquery-mcp) e muda com a versão do protocolo. Não cobre o servidor MCP da Google Cloud CLI (`run_bq_command`), que dá acesso a agendamento e reservas. Não compara preço sob demanda com o modelo por capacidade (slots). E não detalha o Model Armor, filtro opcional de prompt e resposta que, com log ligado, grava o conteúdo inteiro da chamada.

---

Se o agente ligado ao BigQuery responde "faturamento de ontem" e o número muda na quarta, o primeiro passo é comparar a soma do export do GA4 com o pedido faturado no ERP, dia a dia, com cancelamento e marketplace na conta. [Veja um MCP governado respondendo](https://precisian.io/demonstracao?utm_source=blog&utm_medium=cta&utm_campaign=mcp-do-bigquery&utm_content=texto) sobre um lake isolado, sem compromisso de contrato.
