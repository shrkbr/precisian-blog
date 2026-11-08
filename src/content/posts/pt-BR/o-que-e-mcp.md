---
title: "O que é MCP (Model Context Protocol) e qual a diferença para uma API"
description: "MCP é o protocolo aberto que descreve ferramentas para um modelo de IA. Ele não substitui a API: muda quem decide a chamada, o desenvolvedor ou o modelo."
slug: "o-que-e-mcp"
lang: "pt-BR"
translationKey: "mcp-vs-api"
publishedAt: 2026-11-03
tags: ["mcp", "dados-para-ia", "integracao", "camada-semantica", "seguranca"]
draft: false
llmSummary: "MCP (Model Context Protocol) é um protocolo aberto, sobre JSON-RPC 2.0, pelo qual um servidor descreve ferramentas a um modelo de IA. Na revisão 2026-07-28 da especificação, as ferramentas são 'controladas pelo modelo': ele lê nome, descrição e inputSchema em tools/list e decide a chamada."
citations: ["https://modelcontextprotocol.io/specification/2026-07-28", "https://modelcontextprotocol.io/specification/versioning", "https://modelcontextprotocol.io/specification/2026-07-28/server/tools", "https://modelcontextprotocol.io/specification/2026-07-28/changelog", "https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization", "https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/security-considerations", "https://modelcontextprotocol.io/specification/2026-07-28/basic/transports", "https://modelcontextprotocol.io/community/governance", "https://www.anthropic.com/news/model-context-protocol", "https://github.com/googleanalytics/google-analytics-mcp", "https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/runReport", "https://spec.openapis.org/oas/latest.html", "https://arxiv.org/abs/2605.22333"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://en.wikipedia.org/wiki/API", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
cta: newsletter
updatedAt: 2026-11-08
---
MCP (Model Context Protocol) é um protocolo aberto pelo qual um servidor descreve ferramentas para um modelo de IA, e o modelo decide quando usá-las. Ele não substitui a API: quase todo servidor MCP chama uma API por baixo. A diferença está em quem escreve a chamada. Na revisão atual da especificação, a 2026-07-28, as ferramentas são definidas como "controladas pelo modelo" ([MCP, lido em 03/11/2026](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)).

> **MCP (Model Context Protocol)**: especificação aberta, sobre mensagens JSON-RPC 2.0, que padroniza como uma aplicação de IA descobre e chama ferramentas, lê dados e usa modelos de prompt expostos por um servidor. Mantida como "Model Context Protocol a Series of LF Projects, LLC", sob licença Apache 2.0.

## De onde veio o MCP e quem mantém a especificação?

A Anthropic abriu o protocolo em 25/11/2024, descrito no anúncio como "um novo padrão para conectar assistentes de IA aos sistemas onde os dados vivem" ([Anthropic](https://www.anthropic.com/news/model-context-protocol)). Hoje a página de governança registra o projeto como "Model Context Protocol a Series of LF Projects, LLC", com especificação sob Apache 2.0 e assentos técnicos atribuídos a pessoas, não a empresas ([MCP, governança](https://modelcontextprotocol.io/community/governance)).

A versão é uma data. O identificador segue o formato `YYYY-MM-DD` e marca o último dia em que houve mudança incompatível; a versão corrente, em 03/11/2026, é a **2026-07-28** ([MCP, versionamento](https://modelcontextprotocol.io/specification/versioning)). Isso importa porque muita explicação de MCP na internet descreve a revisão anterior, a 2025-11-25, que tinha um aperto de mão inicial (`initialize`) e sessão. A 2026-07-28 removeu os dois: cada requisição carrega a própria versão e as capacidades do cliente no campo `_meta` ([changelog](https://modelcontextprotocol.io/specification/2026-07-28/changelog)).

## Como o MCP funciona na prática?

São três papéis. O **host** é a aplicação de IA (Claude, ChatGPT, um agente próprio). O **cliente** é o conector dentro dela. O **servidor** é quem oferece contexto e capacidades ([especificação](https://modelcontextprotocol.io/specification/2026-07-28)). O servidor pode expor três coisas, cada uma com um dono diferente:

- **Tools** (ferramentas), "controladas pelo modelo": o modelo escolhe chamar.
- **Resources** (recursos), "conduzidos pela aplicação": o host decide o que entra no contexto.
- **Prompts**, "controlados pelo usuário": a pessoa escolhe um modelo de mensagem.

O ciclo de uma ferramenta tem dois métodos. O cliente envia `tools/list` e recebe, para cada ferramenta, um `name`, uma `description` em texto e um `inputSchema` em JSON Schema. O modelo lê essa lista, decide qual ferramenta resolve a pergunta e monta os argumentos. O cliente então envia `tools/call` com `name` e `arguments`, e devolve o resultado ao modelo ([MCP, tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)).

Quanto ao transporte, a especificação define dois: **stdio**, com o servidor rodando como subprocesso na máquina do usuário, e **Streamable HTTP**, em que cada mensagem é um POST para um único endpoint ([MCP, transportes](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports)).

O servidor MCP oficial do Google Analytics expõe uma ferramenta chamada `run_report`, que o repositório descreve assim: "Runs a Google Analytics report using the Data API" ([googleanalytics/google-analytics-mcp](https://github.com/googleanalytics/google-analytics-mcp)). Por baixo, ela chama o mesmo `POST https://analyticsdata.googleapis.com/v1beta/{property=properties/*}:runReport` que qualquer integração chamaria ([Google, Data API](https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/runReport)). O dado é o mesmo. Mudou quem escolhe dimensões, métricas e período: antes um desenvolvedor, agora o modelo.

## Qual a diferença entre MCP e uma API?

Uma API é o contrato de um sistema com programas que um desenvolvedor escreve. O MCP é o contrato de um servidor com um modelo que decide sozinho, em tempo de execução. A tabela compara o que muda em cada ponto.

| Critério | API (REST, GraphQL) | MCP |
|---|---|---|
| Quem decide a chamada | O desenvolvedor, no código, antes de rodar | O modelo, em tempo de execução, a partir da pergunta |
| Como se descobre o que existe | Documentação lida por gente; descrição em [OpenAPI](https://spec.openapis.org/oas/latest.html) quando há | `tools/list` devolve nome, descrição e `inputSchema` na hora |
| Formato | Cada API tem o seu (endpoints, verbos, paginação próprios) | JSON-RPC 2.0 igual para todo servidor |
| Autorização | Definida por cada fornecedor (chave, OAuth, token) | "OPCIONAL"; quando há, OAuth 2.1 no transporte HTTP e credencial do ambiente no stdio |
| Estado | Depende da API | Sem estado na revisão 2026-07-28: cada requisição carrega versão e capacidades |
| O que a descrição faz | Orienta quem programa | Vira instrução que o modelo lê para escolher a ferramenta |
| Onde se erra | Código chama o endpoint errado e o teste pega | O modelo escolhe a ferramenta ou o filtro errado e a resposta parece certa |

Fontes: [MCP, tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools), [MCP, autorização](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization) e [changelog 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/changelog), lidos em 03/11/2026.

Sobre autorização, a especificação diz, em maiúsculas, que ela "is OPTIONAL for MCP implementations" ([MCP, autorização](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization)). Quando o servidor chama uma API a jusante, ele precisa de um token próprio para ela e "MUST NOT pass through the token it received from the MCP client" ([MCP, considerações de segurança](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/security-considerations)). Na prática, o MCP soma uma credencial à da API.

## O que o MCP não é?

**Não é um banco de dados nem um conector de dados.** O servidor MCP expõe o que alguém decidiu expor. Se o servidor da VTEX que você instalou só busca documentação, ele não lê pedido, por mais que o nome sugira ([o que cada MCP de plataforma responde](https://precisian.io/blog/pt-BR/posts/mcp-de-plataforma-de-ecommerce/)).

**Não é uma camada de segurança.** A especificação lista o que o servidor "MUST" fazer (validar entradas, controlar acesso, limitar taxa de chamadas, sanitizar saídas), mas reconhece que o protocolo não consegue impor esses princípios por conta própria ([especificação](https://modelcontextprotocol.io/specification/2026-07-28)). Uma medição publicada em maio de 2026 encontrou 7.973 servidores MCP remotos no ar, 40,55% deles expondo ferramentas sem autenticação nenhuma ([arXiv 2605.22333](https://arxiv.org/abs/2605.22333), preprint). Escopo e permissão continuam sendo trabalho de quem publica o servidor, como detalhado em [segurança de servidor MCP](https://precisian.io/blog/pt-BR/posts/seguranca-de-servidor-mcp/).

**Não é uma definição de métrica.** O `inputSchema` diz que a ferramenta aceita uma métrica e um intervalo de datas. Não diz se "receita" inclui frete, cancelamento ou venda de marketplace. Essa regra fica fora do protocolo.

**Não é um substituto de BI.** O painel responde a pergunta prevista; o MCP abre espaço para a pergunta nova. As duas coisas convivem, e a comparação está em [servidor MCP ou BI](https://precisian.io/blog/pt-BR/posts/mcp-server-vs-bi/).

## Por que a diferença entre MCP e API importa para quem trabalha com dado?

Porque na API o erro de interpretação acontece uma vez, no código, e alguém revisa. No MCP ele acontece a cada pergunta, sem revisão. O desenvolvedor que integra a Data API do GA4 decide uma vez qual métrica é "receita" e escreve isso no código. Com o MCP, o modelo decide de novo a cada conversa, a partir de um texto de descrição.

O resultado tem nome no nosso vocabulário: [alucinação de métrica](https://precisian.io/blog/pt-BR/posts/alucinacao-de-metrica/), o número calculado corretamente sobre a regra errada. O modelo escolhe, entre dados reais, um recorte diferente do que a empresa usa. O caso do GA4 é o mais visível: o `run_report` devolve o que a propriedade já modelou, e o modelo apresenta como contagem ([MCP do Google Analytics](https://precisian.io/blog/pt-BR/posts/mcp-do-google-analytics/)).

Ligue três MCPs de plataforma ao mesmo assistente (Google Ads, Meta e GA4) e cada um devolve a própria receita, com a janela de atribuição do próprio fabricante. O protocolo entrega as três sem conflito aparente, porque para ele são três ferramentas válidas.

Na Precisian, a mesma camada semântica alimenta as três portas de acesso: API, MCP e conexão direta com o BI do cliente. A definição de receita é escrita uma vez, versionada, e qualquer consumidor, gente ou agente, lê a mesma regra antes de calcular.

## Quando uma empresa precisa de MCP, e quando a API basta?

**A API basta** quando a pergunta é conhecida e se repete: o relatório de segunda-feira, a carga diária no warehouse, a integração do ERP com a loja. Código determinístico, revisado, testado, sai mais barato e mais previsível do que um modelo decidindo a cada execução.

**O MCP compensa** quando a pergunta muda toda vez e quem pergunta não programa: o diretor de e-commerce que quer cruzar campanha com margem de categoria numa terça à tarde. É o caso em que ninguém consegue escrever a chamada antes.

**O MCP exige preparo** quando o dado tem mais de uma definição circulando. Antes de ligar, responda três perguntas:

1. Qual definição de métrica a ferramenta aplica, e ela está escrita em algum lugar que não seja a cabeça de alguém?
2. Qual credencial o servidor usa, e ela tem só leitura?
3. Quem registra cada `tools/call`, com qual identidade? (Roteiro em [log de auditoria de agente](https://precisian.io/blog/pt-BR/posts/log-de-auditoria-de-agente-de-ia/).)

## O que este artigo não cobre?

Não compara servidores MCP específicos nem clientes (Claude, ChatGPT, Copilot). Não entra nos recursos descontinuados na revisão 2026-07-28 (roots, sampling e logging, listados no [changelog](https://modelcontextprotocol.io/specification/2026-07-28/changelog)) nem nas extensões opcionais, como Tasks e MCP Apps. E descreve a especificação como estava em 03/11/2026: como a versão é uma data, uma revisão nova pode mudar os nomes de método citados aqui, e o texto será atualizado.

---

Se o seu time já ligou um assistente de IA ao GA4 ou à mídia e recebeu números que não fecham com o financeiro, o primeiro passo é comparar a definição que a ferramenta aplica com a que a empresa usa. O que mudou, o que quebrou e o que a pesquisa da Precisian mediu chega a cada quinze dias, às quintas, na [newsletter da Precisian](https://precisian.io/newsletter?utm_source=blog&utm_medium=cta&utm_campaign=o-que-e-mcp&utm_content=texto).
