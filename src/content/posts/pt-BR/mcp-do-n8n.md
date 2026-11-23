---
title: "MCP do n8n: como ligar agentes e automações aos dados da empresa"
description: "O n8n fala MCP de três jeitos: o nó MCP Server Trigger, o nó MCP Client Tool e o servidor MCP da instância. Veja o que cada um expõe e o que não ligar."
slug: "mcp-do-n8n"
lang: "pt-BR"
translationKey: "n8n-mcp"
publishedAt: 2026-11-23
tags: ["mcp", "dados-para-ia", "governanca", "seguranca", "camada-semantica", "alucinacao-de-metrica", "integracao"]
draft: false
llmSummary: "Segundo a documentação do n8n lida em 23/11/2026, o nó MCP Server Trigger expõe ferramentas de um workflow a clientes MCP, o nó MCP Client Tool liga agentes do n8n a servidores externos e o servidor MCP da instância roda os workflows que você habilita, um a um ou em lote."
citations: ["https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-langchain.mcptrigger/", "https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.toolmcp/", "https://docs.n8n.io/connect/connect-to-n8n-mcp-server", "https://docs.n8n.io/connect/connect-to-n8n-mcp-server/mcp-server-tools-reference", "https://docs.n8n.io/build/integrate-ai/mcp-servers", "https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.toolworkflow/", "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.postgres/", "https://docs.n8n.io/build/integrate-ai/ai-examples/use-ai-for-parameters", "https://modelcontextprotocol.io/specification/2025-11-25/server/tools"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://en.wikipedia.org/wiki/N8n", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
cta: demo
---
O n8n fala MCP de três jeitos, segundo a [documentação oficial](https://docs.n8n.io/connect/connect-to-n8n-mcp-server) lida em 23/11/2026: o nó `MCP Server Trigger` transforma um workflow em servidor MCP, o nó `MCP Client Tool` deixa um agente do n8n usar ferramentas de um servidor externo, e o servidor MCP da instância deixa o Claude ou o ChatGPT buscar e rodar os workflows que você habilitar. Ligar qualquer um leva minutos. O risco está no que a ferramenta devolve quando a pergunta é "quanto vendemos".

> **MCP do n8n** é o conjunto de recursos do n8n que implementam o Model Context Protocol: um nó de gatilho que publica ferramentas para clientes MCP, um nó cliente que consome ferramentas de outros servidores, e um servidor embutido na instância, com URL terminada em `/mcp-server/http`.

## Quais são os três jeitos de usar MCP no n8n?

A tabela resume o que a [documentação do n8n](https://docs.n8n.io/connect/connect-to-n8n-mcp-server) descreve para cada um, lida em 23/11/2026:

| Recurso | Direção | O que expõe | Autenticação documentada |
|---|---|---|---|
| Nó `MCP Server Trigger` | n8n é o servidor | As ferramentas ligadas àquele workflow | None, n8n User Auth (OAuth2), Bearer auth, Header auth |
| Nó `MCP Client Tool` | n8n é o cliente | Ferramentas de um servidor externo, filtradas em "Tools to Include" | Bearer, header, múltiplos headers, OAuth2 ou None |
| Servidor MCP da instância | n8n é o servidor | Busca de workflows, execução dos habilitados, edição, tabelas de dados | OAuth ou chave de API pessoal |

Fontes: [MCP Server Trigger](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-langchain.mcptrigger/), [MCP Client Tool](https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.toolmcp/) e [Connect to n8n MCP server](https://docs.n8n.io/connect/connect-to-n8n-mcp-server).

**O `MCP Server Trigger`** gera duas URLs, de teste e de produção; a de produção só existe depois que o workflow é publicado. Diferente de um gatilho comum, ele "only connects to and executes tool nodes": o cliente lista as ferramentas e chama uma por vez. Para expor um workflow inteiro como ferramenta, a doc indica o nó `Call n8n Workflow Tool` ([n8n](https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.toolworkflow/)). Há um campo opcional de instruções, que, segundo a [doc do nó](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-langchain.mcptrigger/), clientes compatíveis costumam colocar no prompt de sistema do modelo.

**O `MCP Client Tool`** vai dentro de um agente do n8n. O parâmetro "Tools to Include" aceita **All**, **Selected** ou **All Except**. O painel de nós também traz um registro de servidores MCP que conectam com login, sem credencial manual ([MCP servers](https://docs.n8n.io/build/integrate-ai/mcp-servers)).

**O servidor da instância** é ligado em **Settings > Instance-level MCP**, por owner ou admin. Cada workflow precisa ser habilitado à parte, pela opção **Available in MCP**. Desde a versão 2.13.0, o mesmo servidor também cria e edita workflows ([n8n](https://docs.n8n.io/connect/connect-to-n8n-mcp-server)).

## Qual é o sintoma quando a automação responde sobre venda?

Três números diferentes para "quanto vendemos ontem", todos saindo do mesmo n8n.

Imagine um time de e-commerce com, no mesmo n8n, um workflow que manda o resumo de vendas às 8h para a diretoria, um agente que responde perguntas no chat interno e um alerta de meta diária. Cada um foi montado por uma pessoa, em uma semana diferente, com o nó `Postgres` ou `Google BigQuery` lendo a tabela de pedidos que veio da VTEX. Um exemplo com números redondos, sintético:

| Workflow | Como calcula "receita de ontem" | Resultado |
|---|---|---|
| Resumo das 8h | Soma `valor_total` do pedido, todos os status | R$ 124.000 |
| Agente no chat | SQL escrito pelo modelo na hora, sem cancelados | R$ 113.000 |
| Alerta de meta | Soma dos itens, sem frete, sem cancelados | R$ 102.000 |

Ninguém vê erro. Cada execução aparece verde na aba **Executions**. O diretor lê um número no resumo da manhã e ouve outro do agente duas horas depois, e a primeira reunião do dia vira uma discussão sobre qual dos dois está certo. As três consultas estão certas como SQL, e cada uma usa uma régua diferente.

## Por que cada workflow calcula a métrica do jeito dele?

Porque a definição de receita mora dentro do nó, não num lugar que os três consultam.

No nó `Postgres`, a operação **Execute Query** roda o SQL que alguém digitou ([n8n](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.postgres/)). A regra de cancelamento, frete e desconto fica escrita ali, invisível para quem lê só o resultado. Copiar o workflow copia a regra; editar um não edita os outros.

No agente, é pior. O n8n deixa o modelo preencher parâmetros da ferramenta com o botão de IA ou com a função `$fromAI()`, que a doc descreve como uma forma de usar "AI to dynamically fill in parameters" ([Use AI for parameters](https://docs.n8n.io/build/integrate-ai/ai-examples/use-ai-for-parameters)). Se o parâmetro é a própria consulta SQL, o modelo decide em cada conversa o que é venda. É o que chamamos de [alucinação de métrica](https://precisian.io/blog/pt-BR/posts/alucinacao-de-metrica/): o número sai de dado real, e a definição foi inventada na hora.

O MCP não muda isso. A [especificação do protocolo](https://modelcontextprotocol.io/specification/2025-11-25/server/tools) define ferramenta por nome, descrição e `inputSchema`. Ela não tem campo para dizer o que "receita" significa. Quando o `MCP Server Trigger` publica uma ferramenta "consultar_vendas" que aceita SQL livre, o Claude do outro lado herda o mesmo problema. A diferença entre MCP e uma API comum está em [o que é MCP](https://precisian.io/blog/pt-BR/posts/o-que-e-mcp/).

## O que o servidor MCP da instância deixa um cliente ver?

Mais do que o nome "habilitar um workflow" sugere. A [referência de ferramentas](https://docs.n8n.io/connect/connect-to-n8n-mcp-server/mcp-server-tools-reference), lida em 23/11/2026, registra cinco pontos:

- `search_workflows` lista prévias de **todos** os workflows que o usuário pode ver, com ou sem **Available in MCP**. A doc marca isso como "IMPORTANT".
- `get_workflow_execution` devolve só metadados por padrão, mas com `includeData: true` traz o resultado completo de cada nó. Se o workflow processou pedido com nome, CPF e telefone do comprador, o cliente MCP lê isso.
- O acesso "isn't scoped to each MCP client": Claude Desktop e ChatGPT conectados pelo mesmo usuário veem os mesmos workflows habilitados ([n8n](https://docs.n8n.io/connect/connect-to-n8n-mcp-server)).
- `execute_workflow` roda a versão publicada em `"production"` e a versão atual, não publicada, em `"manual"`.
- Desde a versão 2.24.0 dá para ligar o acesso MCP de todos os workflows de um projeto ou pasta de uma vez, e a opção **Auto-expose new workflows**, desligada por padrão, expõe os workflows criados depois. As duas poupam cliques e as duas ampliam o que um cliente conectado pode rodar sem que alguém revise workflow por workflow.

A partir da versão 2.47.0, uma instância protegida (read-only) bloqueia toda ferramenta sem a anotação `readOnlyHint: true`, com exceção de `execute_workflow` em produção, segundo a mesma [referência](https://docs.n8n.io/connect/connect-to-n8n-mcp-server/mcp-server-tools-reference).

## Como diagnosticar o seu n8n?

Seis verificações, todas feitas em uma tarde por quem administra a instância.

| Verificação | Onde olhar | O que indica problema |
|---|---|---|
| Quantos workflows calculam receita | Busca por "receita", "vendas", "faturamento" na lista de workflows | Mais de um, com SQL diferente |
| Quem escreve a consulta | Campo de query do nó `Postgres` ou `Google BigQuery` ligado a agente | Botão de IA ativo ou `$fromAI()` no SQL |
| Autenticação do gatilho | Parâmetro **Authentication** do `MCP Server Trigger` | **None** numa URL de produção |
| Ferramentas expostas ao agente | **Tools to Include** do `MCP Client Tool` | **All** num servidor que escreve |
| Escopo do servidor da instância | **Settings > Instance-level MCP**, seção **Connected clients** | Cliente conectado com permissão de criar e executar, sem uso para isso |
| Dado pessoal nas execuções | Saída dos nós nas execuções de workflows habilitados | E-mail, CPF ou telefone de cliente no resultado |

Fontes: [MCP Server Trigger](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-langchain.mcptrigger/), [MCP Client Tool](https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/n8n-nodes-langchain.toolmcp/), [Connect to n8n MCP server](https://docs.n8n.io/connect/connect-to-n8n-mcp-server).

Depois, pergunte "quanto vendemos ontem" ao agente em três conversas novas e compare com o resumo das 8h. Se os números variam, a regra de receita está espalhada.

## Como corrigir?

**1. Uma definição, fora do workflow.** Tire a regra de receita do SQL de cada nó. Escreva uma vez, com nome ("receita líquida faturada"), versão e dono, e faça os três workflows lerem o mesmo resultado. É o que a [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/) guarda, e o motivo de marketing e financeiro fecharem números diferentes está em [mesma definição de receita](https://precisian.io/blog/pt-BR/posts/mesma-definicao-de-receita/).

**2. Ferramenta com métrica nomeada, não SQL livre.** No `MCP Client Tool`, use **Selected** e exponha só ferramentas que devolvem métrica definida. No `MCP Server Trigger`, publique "receita_liquida(periodo)", não "executar_consulta(sql)". A própria doc do n8n diz que um nó nativo como ferramenta dá "tighter control", porque fixa a operação e os parâmetros, e que um servidor MCP dá ao agente "more room, at the cost of control" ([MCP servers](https://docs.n8n.io/build/integrate-ai/mcp-servers)).

**3. Autenticação em toda URL de produção.** No gatilho, use n8n User Auth (OAuth2) ou Bearer. No servidor da instância, revise **Connected clients** e restrinja **Allowed callback URLs**, que por padrão aceita qualquer URL ([n8n](https://docs.n8n.io/connect/connect-to-n8n-mcp-server)).

**4. Credencial de leitura para agente.** O nó `Postgres` também apaga, insere e atualiza. Um agente que só responde pergunta deve usar um usuário de banco só de leitura, em réplica. O motivo, com os campos de texto que carregam instrução, está em [injeção de prompt em dado de marketing](https://precisian.io/blog/pt-BR/posts/injecao-de-prompt-em-dado-de-marketing/), e o escopo de token em [segurança de servidor MCP](https://precisian.io/blog/pt-BR/posts/seguranca-de-servidor-mcp/).

**5. Dado pessoal fora do caminho.** Para "qual canal trouxe mais recompra", o agente não precisa do CPF. Separe a identidade numa chave pseudônima antes de o dado chegar ao workflow, como em [agente de IA e dado pessoal do cliente](https://precisian.io/blog/pt-BR/posts/agente-de-ia-e-dado-pessoal-do-cliente/).

É aqui que a Precisian entra. O dado de mídia, analytics, plataforma de e-commerce e ERP vai para um data lake isolado por cliente, na infraestrutura da Precisian, com a camada semântica por cima e acesso pelo MCP da Precisian, pela API ou pelo BI. O n8n continua sendo a automação do cliente: o nó aponta para uma métrica já definida, e os três workflows devolvem o mesmo número porque nenhum deles escreveu a conta. A Precisian não declara conector pronto para o n8n; a ligação é pelo MCP ou pela API, como faria qualquer cliente.

## Quando isso não tem conserto?

**Quando o n8n roda em várias réplicas de webhook sem rota dedicada.** A doc avisa que o `MCP Server Trigger` depende de SSE ou HTTP streamable na mesma instância; com várias réplicas, todo `/mcp*` tem de ir para uma réplica só, ou as conexões "will frequently break" ([n8n](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-langchain.mcptrigger/)). O conserto é de infraestrutura e nenhuma definição de métrica resolve.

**Quando o cliente precisa enxergar só parte dos workflows.** O servidor da instância não restringe workflow por cliente MCP. Se o Claude do financeiro e o ChatGPT do marketing entram pelo mesmo usuário, veem o mesmo conjunto. A saída documentada é separar por usuário e projeto.

**Quando o dado nunca foi registrado.** Venda fechada no WhatsApp sem pedido lançado não aparece em tabela nenhuma, com ou sem MCP.

**Quando a pergunta é operar, não medir.** Se o agente existe para abrir chamado, mandar mensagem ou atualizar o CRM, um nó nativo com parâmetro fixo resolve, e uma camada semântica não acrescenta nada. Nesse caso a Precisian é a escolha errada.

## O que este artigo não cobre?

Não é tutorial de instalação: os passos por cliente estão nos [exemplos de conexão do n8n](https://docs.n8n.io/connect/connect-to-n8n-mcp-server). Não compara planos nem preços do n8n Cloud com o auto-hospedado. Não avalia os servidores MCP de comunidade para n8n publicados no GitHub. As versões citadas (2.13.0, 2.24.0, 2.47.0) e os nomes de menu foram conferidos em 23/11/2026 e mudam com frequência. Para onde mais ligar um servidor MCP, veja [MCP no Claude e no ChatGPT](https://precisian.io/blog/pt-BR/posts/mcp-no-claude-e-no-chatgpt/).

---

Se o seu n8n tem mais de um workflow somando venda, o primeiro passo é abrir o SQL de cada um e anotar o que entra e o que sai da conta. [Veja um MCP governado respondendo](https://precisian.io/demonstracao?utm_source=blog&utm_medium=cta&utm_campaign=mcp-do-n8n&utm_content=texto) sobre um lake isolado, sem compromisso de contrato.
