---
title: "Agents Schema ou MCP: não competem pelo mesmo trabalho"
description: "Um publica contexto em tabelas dentro do warehouse; o outro é transporte para ferramentas. A diferença real é de governança."
slug: "agents-schema-ou-mcp"
lang: "pt-BR"
translationKey: "agents-schema-vs-mcp"
publishedAt: 2027-01-07
tags: ["mcp", "camada-semantica", "governanca"]
draft: false
llmSummary: "Agents Schema e MCP nao competem: o primeiro publica contexto como tabelas no proprio warehouse, legivel por SQL comum, e o segundo e um protocolo de transporte que carrega autorizacao, escopo e trilha. O FAQ do Agents Schema afirma que MCP nao e necessario para le-lo."
citations: ["https://www.opendatainfrastructure.com/agents-schema", "https://github.com/dbt-labs/agents_schema", "https://modelcontextprotocol.io/community/governance", "https://modelcontextprotocol.io/specification/versioning", "https://docs.getdbt.com/docs/dbt-ai/about-mcp", "https://www.fivetran.com/press/fivetran-dbt-labs-complete-merger-to-create-the-data-infrastructure-for-trusted-ai-agents"]
about: ["https://pt.wikipedia.org/wiki/Metadados", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
---

O Agents Schema, na versão **0.0.11**, e o Model Context Protocol, na revisão **2026-07-28**, não disputam a mesma função. A declaração mais clara disso vem do próprio FAQ do Agents Schema, que pergunta "preciso de MCP?" e responde: *"Não. `AGENTS.*` são apenas tabelas, então qualquer agente que consiga rodar SQL pode lê-lo. MCP é uma opção; uma CLI e uma skill também funcionam"* ([Agents Schema](https://www.opendatainfrastructure.com/agents-schema)).

Um publica contexto dentro do warehouse. O outro é transporte para ferramentas. A diferença real entre eles é de governança, não de função.

> **Agents Schema**: especificação de tabelas de metadado escritas num esquema padrão `AGENTS` dentro do seu próprio warehouse, para que um agente leia contexto com SQL comum, ao lado do dado sobre o qual raciocina.

## O que cada um resolve, exatamente?

Camadas diferentes da mesma pilha, e a confusão vem de os dois aparecerem no mesmo diagrama.

| | Agents Schema | MCP |
|---|---|---|
| O que é | convenção de tabelas de metadado | protocolo de transporte |
| Onde mora | dentro do seu warehouse | entre o modelo e o servidor |
| Como se lê | SQL comum | chamada de ferramenta |
| Depende de | ter um warehouse | ter um servidor rodando |
| Versionado por | número de versão da spec | data da revisão |

A linha que mais importa é a terceira. Se o contexto está em tabelas, qualquer coisa que consulte o warehouse alcança, inclusive ferramentas que nada sabem de agente. Se o contexto está atrás de um protocolo, só quem fala o protocolo alcança.

## Então é só escolher tabelas e pronto?

Não, porque as duas coisas respondem perguntas diferentes.

Tabelas de metadado dizem ao agente **o que existe e o que significa**: quais modelos, quais colunas, quais definições. Isso é contexto, e contexto lido por SQL tem uma vantagem real de simplicidade.

O protocolo resolve outra coisa: **como o agente executa uma ação com identidade, escopo e limite**. Autorização, escopo mínimo, proibição de repasse de token, registro para auditoria. Nada disso é expressável como tabela, porque não é informação, é controle.

Colocar os dois na mesma frase como alternativas é a confusão de categoria que o próprio FAQ desfaz. Você pode ter contexto em tabelas e ainda precisar de um protocolo para executar; pode ter protocolo e ainda não ter contexto nenhum, que é a situação mais comum hoje.

## Onde está a diferença de verdade?

Na governança, e esse é o critério que sobrevive às mudanças de produto.

O MCP publica um modelo de governança comunitário e uma política de versionamento por data, incrementada apenas quando há quebra de compatibilidade ([MCP](https://modelcontextprotocol.io/specification/versioning)). Isso significa que "qual revisão você implementa" é uma pergunta respondível, e que a mudança de comportamento tem um marcador.

O Agents Schema tem repositório aberto ([GitHub](https://github.com/dbt-labs/agents_schema)) e número de versão ainda abaixo de 1.0, o que é informação relevante para quem vai construir em cima: especificação nesse estágio muda, e mudar significa reescrever tabelas.

Nenhum dos dois fatos é crítica. São dados de planejamento: um deles tem processo de governança público e o outro está numa fase de spec em que estabilidade não foi prometida.

## Qual adotar primeiro?

Depende de qual problema você tem hoje, e quase sempre não é o que parece.

**Se o agente já se conecta e responde errado**, seu problema é contexto. Ele alcança o dado e não sabe o que as colunas significam. Tabelas de metadado atacam isso direto, e a barreira de entrada é baixa porque não exige serviço novo.

**Se o agente ainda não se conecta, ou conecta com credencial administrativa**, seu problema é controle. Aí o protocolo é o caminho, porque é ele que carrega autorização, escopo e trilha.

**Se você não tem definição de métrica escrita em lugar nenhum**, nenhum dos dois ajuda, e essa é a resposta mais comum. Tabela de metadado sem definição acordada publica a ambiguidade em formato legível por máquina; protocolo sem definição transporta a ambiguidade com autenticação. É o mesmo argumento de [camada semântica contra data warehouse](https://precisian.io/blog/pt-BR/posts/camada-semantica-ou-data-warehouse/): a ferramenta não inventa a regra de negócio.

## O que muda na prática para quem já tem agente rodando?

Pouco no curto prazo, e uma decisão de arquitetura no médio.

No curto prazo, se o seu agente já lê dados e responde razoavelmente, publicar metadado em tabelas é uma melhoria incremental: ele passa a ter onde consultar o que uma coluna significa, em vez de inferir pelo nome. Isso reduz uma categoria específica de erro, a de interpretação de esquema, que é real mas não é a maior.

No médio prazo, a decisão que importa é **onde o contexto vive**. Contexto em tabelas viaja com o dado: quem copia o warehouse copia o significado junto, e quem consulta por qualquer caminho encontra. Contexto atrás de um protocolo fica com o serviço, e some quando alguém consulta direto.

Essa diferença tem consequência de governança. Metadado em tabela é auditável com as mesmas ferramentas do resto do warehouse, entra nos mesmos backups e obedece às mesmas permissões. É uma propriedade subestimada, e costuma pesar mais do que qualquer comparação de funcionalidade.

Vale lembrar o limite dos dois: nenhum deles registra o que o agente efetivamente leu ao responder. Essa é [a trilha de auditoria de resposta](https://precisian.io/blog/pt-BR/posts/trilha-de-auditoria-de-resposta-de-ia/), que é uma terceira camada e não vem de graça com nenhum dos padrões.

## Como chegamos aqui?

Por consolidação de mercado, e vale saber para ler os anúncios com a distância certa.

A Fivetran e a dbt Labs completaram fusão para formar uma empresa posicionada em infraestrutura de dados para agentes confiáveis ([anúncio oficial](https://www.fivetran.com/press/fivetran-dbt-labs-complete-merger-to-create-the-data-infrastructure-for-trusted-ai-agents)), e a dbt documenta o próprio suporte a MCP ([dbt](https://docs.getdbt.com/docs/dbt-ai/about-mcp)).

Ou seja: a mesma organização publica uma convenção de tabelas e apoia o protocolo. Isso reforça a leitura de que não são concorrentes, e ao mesmo tempo é um bom lembrete de que a escolha entre padrões nesta área é também uma escolha de a quem você amarra a sua pilha.

## Quando nenhum dos dois é a resposta?

Quando o problema é humano e não técnico, o que acontece com mais frequência do que o mercado admite.

Se marketing e financeiro discordam do que é receita, nenhum padrão de metadado resolve, porque não há o que publicar: a definição não existe. Se ninguém é dono da métrica, publicar a versão atual só congela a ambiguidade num arquivo.

O teste é barato: peça a duas pessoas de times diferentes o mesmo número e compare. Se vierem iguais, existe definição viva e vale publicá-la em tabela. Se vierem diferentes, você tem uma reunião pela frente antes de ter uma especificação.

Vale também o alerta inverso, porque ele produz desperdício silencioso: times que adotam os dois padrões antes de ter uma métrica definida ganham duas superfícies novas para manter e nenhuma resposta a mais.

## O que este artigo não cobre?

Não recomenda implementação nem fornecedor. A área se move mais rápido do que qualquer comparação publicada permanece correta, e a fusão citada é justamente um exemplo de como o mapa muda.

Não traz número de adoção de nenhum dos dois. Não encontrei levantamento com metodologia declarada, e os dois padrões são novos o bastante para que qualquer porcentagem hoje venha de amostra de conveniência.

Não descreve a lista completa de tabelas do Agents Schema. A especificação está abaixo de 1.0 e em movimento; reproduzir um esquema que muda entre versões produziria um artigo errado em poucos meses, que é exatamente o erro que este texto está tentando evitar.

E não afirma que um dos dois vencerá. Eles resolvem camadas diferentes, e o desfecho mais provável é os dois coexistirem, com a escolha real sendo sobre definição, que nenhum dos dois entrega.
