---
title: "Trilha de auditoria de resposta de IA: como provar o que o agente leu"
description: "O histórico do chat guarda o que foi dito, não o que foi consultado. E o art. 37 da LGPD exige registro das operações de tratamento."
slug: "trilha-de-auditoria-de-resposta-de-ia"
lang: "pt-BR"
translationKey: "answer-lineage-audit-trail"
publishedAt: 2026-10-14
tags: ["auditoria", "mcp", "dados-para-ia"]
draft: false
llmSummary: "Trilha de auditoria de resposta liga o número entregue por um agente à definição e aos dados que o produziram. A spec do MCP proíbe repasse de token justamente por quebrar a prestação de contas, e o art. 37 da LGPD obriga controlador e operador a manter registro das operações de tratamento."
citations: ["https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization", "https://modelcontextprotocol.io/specification/2026-07-28/server/tools", "https://owasp.org/www-project-mcp-top-10/", "https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-publicacaooriginal-156212-pl.html", "https://code.claude.com/docs/en/security"]
about: ["https://en.wikipedia.org/wiki/Audit_trail", "https://precisian.io/datalake/"]
author: "Gabriel Sorato"
readingTimeMinutes: 6
---

Trilha de auditoria de resposta é o registro que permite reconstruir, depois, qual definição e quais dados produziram um número que um agente de IA entregou. Não é o log da conversa nem o histórico do chat: é a ligação entre a resposta e a origem dela. A especificação do Model Context Protocol recomenda que clientes registrem o uso de ferramentas "for audit purposes" ([MCP, revisão 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)).

> **Trilha de auditoria de resposta**: conjunto de registros que permite responder, sobre uma resposta já entregue, quem perguntou, qual definição foi aplicada, quais dados foram lidos e quando.

## Por que o histórico do chat não basta?

Porque ele guarda o que foi dito, não o que foi consultado.

Um histórico mostra a pergunta e a resposta. Não mostra qual consulta rodou, com que identidade, sobre quais tabelas, nem qual versão da definição de métrica estava valendo naquele momento. Se a regra de receita líquida mudou em agosto, o histórico de julho não diz qual regra foi aplicada — e a resposta de julho continua lá, com aparência de verdade atual.

É a diferença entre gravar uma conversa sobre um cálculo e guardar o cálculo. Só o segundo se confere.

Na prática, a pergunta que chega meses depois é sempre da mesma família: "de onde saiu esse número?". Sem trilha, a resposta honesta é reconstruir por aproximação, que é o mesmo que dizer que não se sabe.

## O que a especificação do MCP exige?

Menos do que parece, e a parte mais interessante é o motivo de uma proibição.

A especificação **proíbe repasse de token**: "the MCP server MUST NOT pass through the token it received from the MCP client". O argumento dado não é de confidencialidade, é de rastreabilidade — repasse de token quebra a prestação de contas, porque o log do serviço de destino passa a registrar a origem errada, o que dificulta investigação de incidente e auditoria ([MCP](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization)).

Traduzindo: quando o agente usa a credencial de outra pessoa ou de um serviço genérico, o registro existe e aponta para o lugar errado. Isso é pior que não ter registro, porque parece funcionar.

A especificação também fecha uma porta correlata ao determinar que servidores **não devem usar sessões para autenticação**, e sugere atrelar a sessão à identidade num formato como `<user_id>:<session_id>`. É tenancy escrita como chave, e é o que torna a trilha atribuível a alguém.

Do lado das obrigações positivas, o texto é curto: validar entradas, aplicar controle de acesso, limitar taxa de invocação e sanitizar saídas, com registro de uso recomendado ao cliente.

Vale registrar que a ausência de auditoria é reconhecida como categoria de risco: a lista de dez riscos de MCP mantida pela OWASP, ainda em versão beta, inclui explicitamente a falta de auditoria e telemetria ([OWASP](https://owasp.org/www-project-mcp-top-10/)).

## O que a LGPD exige disso?

Mais do que a maioria dos times percebe, e a exigência não é opcional.

O artigo 37 determina que "o controlador e o operador devem manter registro das operações de tratamento de dados pessoais que realizarem" ([Lei 13.709/2018](https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-publicacaooriginal-156212-pl.html)). Não há ressalva para tratamento feito por agente de IA: se o agente consultou dado pessoal, houve operação de tratamento, e ela precisa estar registrada.

Isso muda a natureza da conversa dentro da empresa. Trilha de auditoria deixa de ser refinamento de engenharia e passa a ser requisito legal de quem decidiu conectar o agente. E a obrigação alcança os dois lados: o artigo nomeia controlador e operador.

Quem quiser o contexto completo de base legal e transferência internacional encontra aqui: [LGPD e IA, onde o dado do seu cliente pode viver](https://precisian.io/blog/pt-BR/posts/lgpd-ia-dados-de-cliente/).

## O que registrar, na prática?

Cinco campos respondem quase toda pergunta futura, e nenhum deles é exótico.

**Identidade real de quem perguntou.** Não a do serviço, não a do agente: a da pessoa. É o campo que o repasse de token destrói.

**A consulta efetivamente executada.** Não a pergunta em linguagem natural, que é ambígua por natureza, mas o que rodou contra o dado.

**A versão da definição aplicada.** Se a métrica vem de uma [camada semântica versionada](https://precisian.io/blog/pt-BR/posts/camada-semantica/), isso é o identificador do commit. Sem versionamento, esse campo não existe, e é por isso que trilha e camada semântica são o mesmo projeto visto de ângulos diferentes.

**O recorte de dado retornado.** Quantas linhas, de quais tabelas, em que janela.

**Carimbo de tempo com fuso.** Parece óbvio e é onde a reconstrução costuma falhar, porque o agente, o banco e o relatório frequentemente registram em fusos diferentes.

Um detalhe que decide se isso funciona: o registro precisa ser feito do lado do servidor, não do cliente. Log produzido pelo próprio agente é log que o agente pode omitir.

## E a confiança declarada pelo modelo, serve?

Serve menos do que a trilha, e por um motivo mensurável.

A calibração de confiança verbalizada por modelos é fraca e depende mais da formulação do prompt que do modelo, com desvio da ordem de dez pontos percentuais entre confiança declarada e acurácia real em modelos grandes. Uma resposta que se declara noventa por cento confiante não é noventa por cento confiável.

Rastreabilidade não tem esse problema porque não é uma estimativa: ou a consulta está registrada, ou não está. Por isso a recomendação prática é não reportar índice de confiança para o usuário final e, em vez disso, oferecer o caminho — a definição usada e as linhas lidas. Um número pode ser conferido; uma porcentagem de autoconfiança, não.

É também o que a documentação de segurança do Claude Code sinaliza ao tratar registro por OpenTelemetry e auditoria de sessões como itens de configuração, e não como recurso do modelo ([Anthropic](https://code.claude.com/docs/en/security)).

## Quando isso ainda não vale o esforço?

Quando ninguém age sobre a resposta.

Agente usado para exploração, rascunho ou primeira aproximação não precisa de trilha: a pessoa vai conferir antes de fazer qualquer coisa, e a conferência é a auditoria. Montar registro completo nesse cenário é cerimônia.

O limiar aparece em três situações, e basta uma: a resposta vira decisão sem revisão humana; o dado consultado é pessoal, o que aciona o artigo 37; ou existe terceiro no meio, como agência ou cliente, caso em que a pergunta "o que exatamente eles viram" vai aparecer mais cedo ou mais tarde.

Na Precisian, esse registro é uma propriedade do [lake isolado por cliente](https://precisian.io/datalake/): como o acesso passa por API e servidor MCP sobre uma camada semântica versionada, dá para reconstruir qual definição respondeu o quê. É a mesma arquitetura resolvendo um problema diferente, e é por isso que ela aparece nestas duas conversas.

## O que este artigo não cobre?

Não cobre implementação de observabilidade nem escolha de ferramenta de log, e não entra em retenção, que depende de política jurídica de cada empresa.

Também não trata de auditoria de modelo, que é outra disciplina: aqui a pergunta é o que foi consultado, não como o modelo chegou ao texto. As duas são úteis; confundi-las leva a comprar a ferramenta errada.

Um limite honesto: a lista de riscos de MCP citada está em versão beta e pode mudar, e a especificação do protocolo recomenda o registro sem prescrever formato. Não existe, hoje, padrão consolidado de trilha de auditoria para resposta de agente. O que existe é a obrigação legal e a mecânica; o formato ainda é escolha de cada casa.

Se um agente responde perguntas sobre dado de cliente na sua empresa, a pergunta para hoje é se dá para reconstruir uma resposta de ontem. [Agende uma conversa sobre o seu caso](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).
