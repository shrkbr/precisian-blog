---
title: "MCP do Postgres: como dar acesso ao banco para a IA sem abrir escrita"
description: "O servidor MCP de referência do Postgres foi arquivado em 2025 com uma falha que escapava do modo só-leitura. Só-leitura de verdade mora no papel do banco."
slug: "mcp-do-postgres"
lang: "pt-BR"
translationKey: "postgres-mcp-server"
publishedAt: 2026-11-11
tags: ["mcp", "seguranca", "dados-para-ia", "prompt-injection", "text-to-sql", "custo", "governanca"]
draft: false
llmSummary: "O servidor MCP de referência do Postgres (@modelcontextprotocol/server-postgres) foi arquivado em 29/05/2025; a versão 0.6.2 no npm não tem a correção da injeção que escapava do modo só-leitura e teve 140.645 downloads de 04 a 10/11/2026 (npm)."
citations: ["https://github.com/modelcontextprotocol/servers", "https://github.com/modelcontextprotocol/servers-archived/tree/main/src/postgres", "https://github.com/modelcontextprotocol/servers/pull/1889", "https://github.com/modelcontextprotocol/servers/commit/d53d6cc75c9ff1957f76c6b97c1ca74771af347e", "https://www.npmjs.com/package/@modelcontextprotocol/server-postgres", "https://api.npmjs.org/downloads/point/last-week/@modelcontextprotocol/server-postgres", "https://securitylabs.datadoghq.com/articles/mcp-vulnerability-case-study-SQL-injection-in-the-postgresql-mcp-server/", "https://github.com/crystaldba/postgres-mcp", "https://modelcontextprotocol.io/specification/2026-07-28/server/tools", "https://www.postgresql.org/docs/current/sql-set-transaction.html", "https://www.postgresql.org/docs/current/hot-standby.html", "https://www.postgresql.org/docs/current/runtime-config-client.html", "https://www.postgresql.org/docs/current/ddl-priv.html", "https://www.postgresql.org/docs/current/sql-alterdefaultprivileges.html", "https://www.postgresql.org/docs/current/predefined-roles.html"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://en.wikipedia.org/wiki/PostgreSQL", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
cta: demo
---
Para dar acesso ao Postgres para a IA sem abrir escrita, a trava tem que estar no banco, não no servidor MCP. O servidor de referência do repositório oficial do MCP, `@modelcontextprotocol/server-postgres`, se apresentava como "read-only access to PostgreSQL databases", foi arquivado em 29/05/2025 e a versão 0.6.2 do npm segue sem a correção de uma injeção que saía da transação só-leitura ([Datadog Security Labs](https://securitylabs.datadoghq.com/articles/mcp-vulnerability-case-study-SQL-injection-in-the-postgresql-mcp-server/), 21/08/2025). Mesmo assim, o pacote teve 140.645 downloads entre 04 e 10/11/2026 ([npm](https://api.npmjs.org/downloads/point/last-week/@modelcontextprotocol/server-postgres)).

> **MCP do Postgres**: servidor que implementa o Model Context Protocol sobre uma conexão PostgreSQL e entrega a um modelo de linguagem ferramentas para listar tabelas, ler o esquema e executar SQL. O que ele pode fazer no banco é decidido pelo papel (role) da conexão, não pela descrição da ferramenta.

## Qual é o sintoma?

O time de produto quer que o Claude ou o Cursor respondam perguntas sobre o banco da operação: quantos pedidos por Pix ficaram pendentes ontem, quais assinaturas venceram sem renovação, quanto o cupom da Black Friday custou. Alguém acha o servidor Postgres na lista do MCP, cola a string de conexão no arquivo de configuração e testa. Funciona em cinco minutos. A ferramenta se chama `query` e a descrição diz "Run a read-only SQL query".

O problema não aparece no teste. Aparece quando:

- **A string de conexão usa o usuário da aplicação**, que é dono das tabelas, porque era o que estava no `.env`.
- **O agente lê um texto que veio de fora** (um ticket de suporte, uma observação de pedido, um e-mail) com uma instrução escondida, e a instrução vira SQL.
- **Uma consulta pesada roda no primário** às 11h de uma segunda-feira, e o checkout fica lento.

Nos três casos, o rótulo "só-leitura" estava no texto da ferramenta. A especificação do MCP trata esse tipo de rótulo como declaração do servidor e manda que os clientes "DEVEM considerar as anotações de ferramenta não confiáveis, a menos que venham de servidores confiáveis" ([especificação do MCP, 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/server/tools), lida em 11/11/2026). Isso vale para `readOnlyHint` e vale, com mais razão, para uma descrição em texto livre.

## Qual é o status do servidor de referência hoje?

Arquivado e sem manutenção. O README do repositório `modelcontextprotocol/servers` lista o PostgreSQL na seção "Archived", com a descrição "Read-only database access with schema inspection", e manda o leitor para o repositório `modelcontextprotocol/servers-archived` ([README](https://github.com/modelcontextprotocol/servers), lido em 11/11/2026). Esse segundo repositório está marcado como arquivado no GitHub e se descreve como "Reference MCP servers that are no longer maintained" ([servers-archived](https://github.com/modelcontextprotocol/servers-archived/tree/main/src/postgres)).

| Item | Estado em 11/11/2026 | Fonte |
|---|---|---|
| Código em `servers` | removido no commit de arquivamento de 29/05/2025, junto com SQLite, Redis, GitHub e outros | [commit `d53d6cc`](https://github.com/modelcontextprotocol/servers/commit/d53d6cc75c9ff1957f76c6b97c1ca74771af347e) |
| Correção da injeção | PR #1889 mesclado em 29/05/2025, horas antes do arquivamento | [PR #1889](https://github.com/modelcontextprotocol/servers/pull/1889) |
| Código em `servers-archived` | `src/postgres/index.ts` ainda executa `client.query(sql)` sem a correção | [código arquivado](https://github.com/modelcontextprotocol/servers-archived/tree/main/src/postgres) |
| Pacote no npm | `0.6.2`, publicado em 04/12/2024, marcado como "Archived and unmaintained; no security guarantees" | [npm](https://www.npmjs.com/package/@modelcontextprotocol/server-postgres) |
| Downloads | 140.645 na semana de 04 a 10/11/2026; 579.213 de 12/10 a 10/11/2026 | [API de downloads do npm](https://api.npmjs.org/downloads/point/last-week/@modelcontextprotocol/server-postgres) |

Contagem de download do npm inclui CI, espelho e reinstalação, então não é número de usuários. Mas a tendência é clara: quando a Datadog publicou a falha, em agosto de 2025, contou cerca de 21.000 downloads semanais no npm ([Datadog](https://securitylabs.datadoghq.com/articles/mcp-vulnerability-case-study-SQL-injection-in-the-postgresql-mcp-server/)); na primeira semana de novembro de 2026 foram 140.645, mais de um ano depois de o pacote ser marcado como sem garantia de segurança.

## Por que a escrita escapava do modo só-leitura?

O mecanismo cabe em três linhas do código arquivado. Para cada chamada da ferramenta `query`, o servidor abre `BEGIN TRANSACTION READ ONLY`, executa o texto que o modelo mandou com `client.query(sql)` e, no fim, roda `ROLLBACK`.

A Datadog Security Labs mostrou o furo em 21/08/2025: o `client.query` do driver `pg` aceita várias instruções separadas por ponto e vírgula. Se o texto enviado for `COMMIT; DROP SCHEMA public CASCADE;`, o `COMMIT` encerra a transação só-leitura e o `DROP` roda fora dela, com os privilégios do usuário da conexão. O `ROLLBACK` final chega tarde e o Postgres responde "there is no transaction in progress" ([Datadog](https://securitylabs.datadoghq.com/articles/mcp-vulnerability-case-study-SQL-injection-in-the-postgresql-mcp-server/)). Segundo a mesma linha do tempo, um pesquisador independente já tinha reportado a falha em 27/11/2024, oito dias depois da primeira versão.

A Datadog descreve um segundo vetor, que o papel restrito sozinho não resolve: como as conexões vêm de um pool, um `COMMIT; SET statement_timeout TO 1;` muda o estado da sessão, e a próxima chamada que pegar a mesma conexão herda o limite de 1 milissegundo.

A correção do PR #1889 trocou a chamada por uma instrução preparada, que o Postgres analisa como uma instrução só, e passou a destruir a conexão a cada uso com `client.release(true)`. O mesmo PR acrescentou ao README um aviso: se você precisa de só-leitura por segurança, crie um usuário de banco separado, só com `SELECT`, em vez de confiar nas restrições do servidor ([PR #1889](https://github.com/modelcontextprotocol/servers/pull/1889)). O conselho vale para qualquer servidor MCP de Postgres.

Mesmo quando a transação só-leitura segura, ela tem limite declarado. A documentação do Postgres lista o que ela bloqueia (`INSERT`, `UPDATE`, `DELETE`, `MERGE`, `CREATE`, `ALTER`, `DROP`, `GRANT`, `TRUNCATE`, entre outros) e conclui que "é uma noção de alto nível de só-leitura que não impede todas as escritas em disco" ([PostgreSQL 18, SET TRANSACTION](https://www.postgresql.org/docs/current/sql-set-transaction.html)).

## Como diagnosticar o seu setup?

Rode estas verificações antes de deixar qualquer agente consultar o banco. As consultas usam um administrador e o nome do papel do agente, aqui `agente_ia`.

| Verificação | Como rodar | O que indica risco |
|---|---|---|
| Qual pacote está no `command`/`args` do cliente MCP | ler o `claude_desktop_config.json`, `.cursor/mcp.json` ou equivalente | `@modelcontextprotocol/server-postgres` ou imagem `mcp/postgres` |
| Quem é o usuário da string de conexão | `SELECT current_user;` pela própria conexão do servidor | o mesmo usuário da aplicação ou `postgres` |
| Atributos do papel | `SELECT rolsuper, rolbypassrls, rolcreaterole, rolcreatedb FROM pg_roles WHERE rolname = 'agente_ia';` | qualquer `true` |
| Privilégio de escrita | `SELECT table_schema, table_name, privilege_type FROM information_schema.role_table_grants WHERE grantee = 'agente_ia' AND privilege_type <> 'SELECT';` | qualquer linha |
| Papel amplo herdado | `SELECT b.rolname FROM pg_auth_members m JOIN pg_roles b ON b.oid = m.roleid JOIN pg_roles u ON u.oid = m.member WHERE u.rolname = 'agente_ia';` | `pg_write_all_data`, ou `pg_read_all_data` quando o agente não deveria ver tudo |
| É réplica? | `SELECT pg_is_in_recovery();` pela conexão do agente | `false` quando a ideia era ler da réplica |
| Teto de tempo | `SHOW statement_timeout;` pela conexão do agente | `0`, que desliga o limite |

O `pg_read_all_data` merece atenção: ele dá leitura em todas as tabelas, visões e sequências como se houvesse `SELECT` em todas ([PostgreSQL 18, papéis predefinidos](https://www.postgresql.org/docs/current/predefined-roles.html)). Ele impede a escrita, mas não restringe nada do que o agente lê.

Para testar o servidor em si, sem o modelo no meio, o roteiro com o MCP Inspector está em [como testar um servidor MCP antes da produção](https://precisian.io/blog/pt-BR/posts/testar-servidor-mcp-antes-da-producao/). Inclua no teste a chamada `SELECT 1; COMMIT; CREATE TABLE teste_agente (id int);` e confirme que ela falha.

## Como corrigir?

Quatro camadas, da mais forte para a mais fraca. A primeira e a segunda são as que seguram uma injeção que passe pelo servidor.

**1. Réplica de leitura.** Num standby com `hot_standby` ligado, "todas as conexões são estritamente só-leitura; nem tabelas temporárias podem ser escritas" ([PostgreSQL 18, Hot Standby](https://www.postgresql.org/docs/current/hot-standby.html)). Ali não há `COMMIT` que destrave escrita, e a consulta pesada do agente não disputa CPU com o checkout. Em banco gerenciado, é a réplica de leitura do provedor.

**2. Papel próprio, só com `SELECT`, no escopo certo.**

```sql
CREATE ROLE agente_ia LOGIN PASSWORD '...' NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE;
GRANT CONNECT ON DATABASE loja TO agente_ia;
GRANT USAGE ON SCHEMA analise TO agente_ia;
GRANT SELECT ON ALL TABLES IN SCHEMA analise TO agente_ia;
ALTER DEFAULT PRIVILEGES FOR ROLE dono_analise IN SCHEMA analise GRANT SELECT ON TABLES TO agente_ia;
ALTER ROLE agente_ia SET default_transaction_read_only = on;
ALTER ROLE agente_ia SET statement_timeout = '15s';
```

O escopo é o schema `analise`, com visões que já excluem CPF, telefone e endereço, e não o banco inteiro. Um detalhe do código arquivado mostra por que isso importa: o servidor só listava como recurso as tabelas do schema `public`, mas a ferramenta `query` executava SQL em qualquer schema que o usuário alcançasse. Quem define o escopo é o `GRANT`. E o `ALTER DEFAULT PRIVILEGES` só vale para objetos criados depois dele ([PostgreSQL 18](https://www.postgresql.org/docs/current/sql-alterdefaultprivileges.html)), por isso o `GRANT ... ON ALL TABLES` vem antes.

Revise também as funções. O Postgres dá `EXECUTE` em funções e procedimentos para `PUBLIC` por padrão ([PostgreSQL 18, privilégios](https://www.postgresql.org/docs/current/ddl-priv.html)), e uma função `SECURITY DEFINER` roda com os privilégios do dono. Fora da réplica, uma função dessas que escreve é uma porta de escrita para um papel que só tem `SELECT`.

**3. Limite de custo.** `statement_timeout` aborta a instrução que passar do tempo ([PostgreSQL 18, padrões de conexão](https://www.postgresql.org/docs/current/runtime-config-client.html)). Definido no papel, é o padrão da sessão, e a própria sessão pode mudá-lo com `SET`; por isso ele contém o agente distraído e não segura quem tenta contornar o limite. Para orçamento por consulta e por dia, veja [custo de consulta de agente de IA](https://precisian.io/blog/pt-BR/posts/custo-de-consulta-de-agente-ia/).

**4. Um servidor mantido.** Se a escolha for continuar com MCP direto no Postgres, saia do pacote arquivado. Duas opções documentadas em 11/11/2026:

| Servidor | O que declara sobre só-leitura | Fonte |
|---|---|---|
| `@zeddotdev/postgres-context-server` (Zed Industries) | recebeu a correção da instrução preparada na v0.1.4, em 09/04/2025 | [Datadog](https://securitylabs.datadoghq.com/articles/mcp-vulnerability-case-study-SQL-injection-in-the-postgresql-mcp-server/) |
| Postgres MCP Pro (`crystaldba/postgres-mcp`) | `--access-mode=restricted` usa transação só-leitura, rejeita SQL com `COMMIT` ou `ROLLBACK` por análise com `pglast` e limita tempo de execução; avisa que linguagens de procedimento inseguras podem contornar a proteção | [README](https://github.com/crystaldba/postgres-mcp) |

Nenhum dos dois substitui as camadas 1 e 2. O próprio README do Postgres MCP Pro diz que o caminho mais simples para integridade é um usuário de banco com permissão só de leitura.

## Quando isso não tem conserto?

Em três situações, e convém saber antes de prometer o projeto.

**Quando a pergunta não está no banco.** O Postgres da operação guarda o pedido como a aplicação gravou. Ele não sabe que o pedido de Pix expirado não é venda, que a comissão do marketplace sai da margem ou que "receita" no financeiro é líquida de devolução. O agente escreve um `SUM(total)` correto sobre uma definição errada, e a trava de escrita não tem nada a ver com isso. É o problema que a [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/) resolve, e nenhuma configuração de papel substitui.

**Quando o dado que o agente pode ler já é o vazamento.** Só-leitura protege a integridade, não a confidencialidade. Se o papel lê a tabela de clientes e o agente processa texto de terceiros, uma instrução injetada pode pedir para resumir e devolver esse dado. O tema está em [conectar IA sem expor a base](https://precisian.io/blog/pt-BR/posts/conectar-ia-sem-expor-a-base/) e em [injeção de prompt em dado de marketing](https://precisian.io/blog/pt-BR/posts/injecao-de-prompt-em-dado-de-marketing/).

**Quando não há réplica.** Sem standby, a consulta do agente roda no primário. O `statement_timeout` corta a pior, mas não devolve a CPU que ela já usou.

O MCP direto no Postgres também não é a resposta errada para todo mundo. Para o time de engenharia investigar o próprio banco de desenvolvimento ou uma réplica, um servidor mantido com papel só-leitura resolve, e não há motivo para uma plataforma de dados no meio. A Precisian entra quando a pergunta é de negócio e cruza fontes: o banco da operação, a VTEX, o marketplace, o GA4 e a mídia num data lake isolado por cliente, na infraestrutura da Precisian, com a definição de cada métrica escrita uma vez na camada semântica e entregue à IA que você já usa pelo MCP da Precisian, sem acesso de escrita ao seu banco de produção. O isolamento por cliente está detalhado em [isolamento por cliente no MCP](https://precisian.io/blog/pt-BR/posts/isolamento-por-cliente-mcp/).

## O que este artigo não cobre?

Não é tutorial de instalação de nenhum servidor; o passo a passo muda a cada versão e está nos repositórios. Não compara todos os servidores MCP de Postgres existentes, só os dois que documentam a questão do só-leitura. Não trata de segurança em nível de linha, que está em [isolamento por cliente no MCP](https://precisian.io/blog/pt-BR/posts/isolamento-por-cliente-mcp/). E não afirma nada sobre a imagem `mcp/postgres` no Docker Hub além do que a Datadog publicou.

---

Se o assistente da sua operação já consulta o Postgres, o primeiro passo é rodar `SELECT current_user;` pela conexão dele e ver se a resposta é o usuário da aplicação. [Veja um MCP governado respondendo](https://precisian.io/demonstracao?utm_source=blog&utm_medium=cta&utm_campaign=mcp-do-postgres&utm_content=texto) sobre um lake isolado, sem compromisso de contrato.
