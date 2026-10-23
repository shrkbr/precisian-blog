---
title: "Como registrar tudo o que um agente de IA consultou nos seus dados"
description: "O log de auditoria do agente é gravado no servidor que executa a consulta. O logging do MCP foi descontinuado na revisão 2026-07-28 e não serve para isso."
slug: "log-de-auditoria-de-agente-de-ia"
lang: "pt-BR"
translationKey: "agent-audit-log"
publishedAt: 2026-10-23
tags: ["auditoria", "mcp", "dados-para-ia", "governanca"]
draft: false
llmSummary: "O log de auditoria de um agente de IA precisa ser gravado no servidor que executa a consulta. A especificação do MCP descontinuou o recurso de logging na revisão 2026-07-28, proíbe dado pessoal nessas mensagens e só recomenda ao cliente registrar uso de ferramenta para auditoria."
citations: ["https://modelcontextprotocol.io/specification/2026-07-28/server/utilities/logging", "https://modelcontextprotocol.io/specification/2025-11-25/server/utilities/logging", "https://modelcontextprotocol.io/specification/2026-07-28/deprecated", "https://modelcontextprotocol.io/specification/2026-07-28/server/tools", "https://modelcontextprotocol.io/specification/2026-07-28/basic/index", "https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/security-considerations", "https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2577", "https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/mcp.md", "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final", "https://docs.cloud.google.com/bigquery/docs/information-schema-jobs", "https://docs.cloud.google.com/bigquery/docs/adding-labels", "https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-publicacaooriginal-156212-pl.html"]
about: ["https://en.wikipedia.org/wiki/Audit_trail", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

Para registrar tudo o que um agente de IA consultou, grave o log no servidor que executa a consulta, um registro por chamada de ferramenta, com a identidade de quem pediu. O chat não serve, e o logging do protocolo também não: a especificação do Model Context Protocol marcou o recurso de logging como descontinuado na revisão 2026-07-28 e proíbe dado pessoal nessas mensagens ([MCP](https://modelcontextprotocol.io/specification/2026-07-28/server/utilities/logging)).

> **Log de auditoria do agente**: registro gravado pela camada que executa a consulta, uma linha por chamada de ferramenta, que permite responder depois quem pediu, por qual agente, o que rodou, sobre quais dados, a que custo e com que resultado.

Este texto trata do registro operacional e de onde ele precisa morar. A pergunta "de onde saiu este número", que é a da resposta, está em [trilha de auditoria de resposta de IA](https://precisian.io/blog/pt-BR/posts/trilha-de-auditoria-de-resposta-de-ia/).

## Qual é o sintoma de um agente sem log de auditoria?

Alguém pergunta o que o agente consultou na terça passada, e ninguém consegue responder em menos de um dia.

A pergunta chega de três jeitos. O diretor de e-commerce quer saber de onde saiu o número de margem que foi parar na reunião de segunda. O jurídico recebe um pedido de titular, como manda a LGPD, e precisa saber se o agente leu os pedidos daquela cliente na VTEX. Ou a fatura do warehouse dobra no mês em que o time começou a usar o agente e não há como separar o que foi gente do que foi máquina.

Em todos os casos, o time abre o que tem. O histórico do chat mostra a pergunta e o texto da resposta. O log do banco mostra centenas de consultas, todas feitas pela mesma conta de serviço. E o servidor MCP, se registrou alguma coisa, mandou para um terminal que já foi fechado.

As três peças existem, e nenhuma delas liga a pessoa à consulta. No Brasil, o artigo 37 da LGPD exige de controlador e operador o registro das operações de tratamento de dados pessoais, e um agente lendo pedidos de clientes faz exatamente isso ([Lei 13.709/2018](https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-publicacaooriginal-156212-pl.html)).

## Por que o logging do MCP não serve como log de auditoria?

Porque ele foi desenhado para depuração em tempo real, no sentido servidor para cliente, e a especificação diz isso no próprio texto.

O mecanismo é a notificação `notifications/message`, que o servidor envia ao cliente com um nível de severidade no padrão syslog. Na revisão 2025-11-25, o cliente ajustava o nível com `logging/setLevel` ([MCP 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/server/utilities/logging)). Na revisão 2026-07-28, o nível passou a ser pedido a cada requisição, e o servidor está proibido de emitir a notificação para uma requisição que não pediu ([MCP](https://modelcontextprotocol.io/specification/2026-07-28/server/utilities/logging)). Quatro regras da especificação tiram esse canal da conta de auditoria:

1. **É opcional dos dois lados.** O servidor pode enviar; o cliente pode persistir. A lista de implementação diz que clientes "MAY persist log messages", e nada obriga.
2. **Não pode carregar quem pediu.** Mensagens de log "MUST NOT contain" credenciais nem informação de identificação pessoal. Um log de auditoria sem identidade não responde à primeira pergunta.
3. **Mora no lado errado.** A mensagem viaja para o cliente, que é exatamente o software cujo comportamento você quer auditar.
4. **Está de saída.** O registro de recursos descontinuados lista o logging na revisão 2026-07-28, com remoção possível a partir da primeira revisão publicada em ou depois de 28/07/2027, e indica `stderr` e OpenTelemetry como substitutos ([MCP](https://modelcontextprotocol.io/specification/2026-07-28/deprecated)). A justificativa na proposta SEP-2577, incorporada em 15/05/2026, é uma linha: o recurso se sobrepõe a stderr e OpenTelemetry ([GitHub](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2577)).

O que sobra no protocolo é uma recomendação. Na seção de segurança de ferramentas, a especificação diz que clientes "SHOULD" registrar o uso de ferramentas para fins de auditoria ([MCP](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)). É um "deveria", e é endereçado ao cliente.

A convenção semântica do OpenTelemetry para MCP, indicada pela própria especificação como substituta, está em estado "Development" e define atributos como `mcp.method.name`, `gen_ai.tool.name` e `mcp.session.id`. Nenhum deles identifica a pessoa por trás da chamada, e argumentos e resultado da ferramenta são opcionais, com aviso de que podem conter informação sensível ([OpenTelemetry](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/mcp.md)). Ela mede desempenho e encadeia chamadas; quem leu o quê fica de fora.

| Mecanismo | Quem grava | O que falta para auditoria |
|---|---|---|
| Histórico do chat | o aplicativo do agente | a consulta executada, a identidade técnica, o custo |
| `notifications/message` | servidor, se o cliente pedir | identidade (proibida), persistência (opcional), futuro (descontinuado) |
| `stderr` do servidor | o processo do servidor | estrutura e retenção; some com o terminal |
| Span OpenTelemetry de MCP | quem instrumentar | a pessoa, a versão da métrica, o resultado por padrão |
| Log de jobs do warehouse | o banco | a pessoa, quando tudo roda numa conta de serviço |
| **Registro no servidor que executa** | **você** | **nada, se for desenhado para isso** |

## O que um log de auditoria de agente precisa gravar?

O ponto de partida que não depende de fornecedor é o controle AU-3 do NIST SP 800-53, revisão 5: o registro de auditoria precisa estabelecer o tipo do evento, quando, onde, a origem, o resultado e a identidade de quem estava associado a ele ([NIST](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final)). Traduzido para uma chamada de agente, isso vira dez campos.

| Campo | Exemplo | Por que importa |
|---|---|---|
| Quem pediu | e-mail ou ID da pessoa, vindo do token validado | sem isso, o resto não se atribui a ninguém |
| Qual agente | `clientInfo` declarado na requisição | separa o Claude do time do script da agência |
| Ferramenta MCP | `receita_por_canal` | o que foi pedido |
| Argumentos | período, canal, filtros | o que foi pedido de fato, depois de qualquer ajuste |
| Consulta executada | o SQL ou o ID do job no banco | o que rodou, que nem sempre é o que foi pedido |
| Definição de métrica | versão da camada semântica | qual regra calculou o número |
| Volume retornado | linhas e tabelas lidas | o tamanho da exposição |
| Resposta | hash do resultado, não o conteúdo | prova o que saiu sem duplicar o dado |
| Custo | bytes faturados ou tempo de warehouse | separa gente de máquina na fatura |
| Resultado e horário | sucesso, erro ou negado; timestamp em UTC | reconstrói a ordem dos fatos |

A revisão 2026-07-28 pede que o cliente envie `clientInfo` em toda requisição, mas a própria especificação avisa que o campo é autodeclarado, não é verificado pelo protocolo e serve para exibição, log e depuração, nunca para decisão de segurança ([MCP](https://modelcontextprotocol.io/specification/2026-07-28/basic/index)). Ele separa agentes; a identidade vem do token. A resposta entra como hash porque guardar o conteúdo devolvido cria uma segunda cópia de dado de cliente, com controle mais fraco que a primeira.

## Como diagnosticar se o seu log de hoje responde a uma auditoria?

Faça o teste de reconstrução: escolha uma resposta do agente da semana passada e tente, em 15 minutos, chegar à pessoa, à consulta e às linhas lidas. Se não der, a primeira suspeita é identidade.

No BigQuery, a visão `INFORMATION_SCHEMA.JOBS` guarda o histórico de jobs dos últimos 180 dias, e a coluna `user_email` registra o "e-mail ou conta de serviço" de quem rodou ([Google Cloud](https://docs.cloud.google.com/bigquery/docs/information-schema-jobs)). A consulta abaixo mostra quem consulta o banco e quanto isso custa:

```sql
SELECT user_email,
       COUNT(*) AS consultas,
       SUM(total_bytes_billed) AS bytes_faturados
FROM `region-southamerica-east1`.INFORMATION_SCHEMA.JOBS
WHERE creation_time >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
  AND job_type = 'QUERY'
GROUP BY user_email
ORDER BY consultas DESC;
```

Se a conta de serviço do servidor MCP aparece no topo e nenhuma consulta dela traz rótulo, o banco sabe que o agente perguntou, e mais nada.

| Verificação | Onde olhar | Sinal de problema |
|---|---|---|
| Identidade | `user_email` no histórico de jobs | uma conta de serviço responde por todas as consultas do agente |
| Correlação | coluna `labels` dos jobs | job do agente sem ID de requisição |
| Cobertura | log do servidor contra chamadas `tools/call` | chamada sem registro correspondente |
| Retenção | política do destino do log | menor que o prazo em que a pergunta costuma chegar |
| Separação | permissões do destino | o agente consegue apagar ou editar o próprio log |

Se a mesma credencial do agente escreve e apaga no destino do log, qualquer linha dele pode sumir sem rastro, e o registro não prova nada.

## Como corrigir?

Mova o registro para a camada que executa e ligue-o ao log do banco. São cinco passos, nesta ordem.

**Um registro por `tools/call`, gravado pelo servidor antes de devolver a resposta.** Se a gravação falhar, a chamada falha. Log que pode ser pulado em caso de erro vira log que falta justo no dia do incidente. E como o MCP é um protocolo sem estado, em que conexão aberta não equivale a sessão, a ligação entre chamadas precisa de um identificador explícito; o campo `traceparent`, reservado no `_meta` para contexto do OpenTelemetry, é o candidato natural ([MCP](https://modelcontextprotocol.io/specification/2026-07-28/basic/index)).

**Identidade vinda do token, não da conversa.** O servidor valida um token por pessoa e grava o sujeito desse token. A especificação proíbe repassar o token recebido para o serviço de destino ([MCP](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/security-considerations)), e o escopo que esse token deveria ter está em [segurança de servidor MCP](https://precisian.io/blog/pt-BR/posts/seguranca-de-servidor-mcp/).

**Rótulo no job do banco.** No BigQuery, rótulos de job aceitam até 63 caracteres, só letras minúsculas, números, hífen e sublinhado ([Google Cloud](https://docs.cloud.google.com/bigquery/docs/adding-labels)). E-mail não cabe; grave o ID da requisição. É ele que liga a linha do seu log ao job, ao custo e às tabelas lidas.

**Versão da definição junto com o resultado.** Se as métricas vêm de uma [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/) versionada, o servidor já sabe qual versão rodou. Gravar isso é uma coluna a mais.

**Destino só de acréscimo, com dono diferente.** O agente escreve, e nenhuma credencial do lado do agente apaga. E o log ganha retenção própria, decidida por alguém, em vez de herdar o padrão da ferramenta.

Um limiar prático para dar o trabalho por concluído: 100% das chamadas `tools/call` com registro, e nenhum registro em que a única identidade seja a conta de serviço. Para a parte de custo, os limites por consulta estão em [quanto custa cada consulta de um agente de IA](https://precisian.io/blog/pt-BR/posts/custo-de-consulta-de-agente-ia/).

Para quem também precisa saber quais agentes existem antes de saber o que cada um fez, o inventário é tratado em [quais agentes de IA têm acesso aos seus dados](https://precisian.io/blog/pt-BR/posts/inventario-de-agentes-de-ia/).

## Quando isso não tem conserto?

Em três situações, e convém saber antes de prometer auditoria a alguém.

**O passado sob conta de serviço não se recupera.** Consultas que rodaram sem identidade continuam sem identidade. Dá para corrigir daqui para a frente, nunca para trás.

**Servidor MCP de terceiro.** Quando o agente fala com o servidor de uma plataforma de mídia ou de e-commerce, o registro do lado que executa é do fornecedor, e você recebe o que ele expõe. Sobra o log do cliente, que é o agente contando o que fez. Um exemplo desses limites está no texto sobre [o MCP do Google Ads](https://precisian.io/blog/pt-BR/posts/mcp-do-google-ads/).

**Servidor local no notebook.** Servidor MCP rodando por stdio na máquina de cada analista escreve em `stderr`, num computador que a empresa nem sempre controla. Ou ele passa a apontar para um servidor central, ou não há auditoria possível.

E há o caso em que a Precisian não é a resposta. Se você tem um warehouse próprio, um único agente interno e identidade por pessoa já configurada no banco, o histórico nativo de jobs, com rótulo por requisição, resolve. Não precisa de plataforma para isso.

Na Precisian, o lake de cada cliente fica isolado na infraestrutura da própria Precisian, e o servidor MCP que executa as consultas sobre a camada semântica também é dela. O registro mora na mesma camada que executa, com a versão da definição ao lado.

## O que este artigo não cobre?

Não recomenda ferramenta de observabilidade nem de armazenamento de log. Não define prazo de retenção, que é decisão jurídica de cada empresa. Não trata de auditoria do modelo, que pergunta como o texto foi gerado; aqui a pergunta é o que foi consultado.

E não afirma que registrar previne vazamento. O log torna a consulta reconstituível depois. Impedir a consulta errada é trabalho de permissão e de [isolamento por cliente](https://precisian.io/blog/pt-BR/posts/isolamento-por-cliente-mcp/).

---

Se hoje ninguém na sua operação consegue dizer o que o agente consultou na semana passada, o primeiro passo é medir quantas consultas dele chegam ao banco sem identidade. [Agende uma conversa sobre o seu caso](https://calendar.notion.so/meet/rodrigomartucci/precisian-io), sem compromisso de contrato, mas sem promessa de resposta em 30 minutos também.
