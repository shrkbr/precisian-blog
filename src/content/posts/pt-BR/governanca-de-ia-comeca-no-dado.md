---
title: "Governança de IA começa no dado: o que a política precisa cobrir quando o agente lê dado de cliente"
description: "Governança de IA decide quem usa o modelo e o que ele pode ler. A segunda parte pede cinco respostas: escopo, isolamento, retenção, trilha e métrica."
slug: "governanca-de-ia-comeca-no-dado"
lang: "pt-BR"
translationKey: "ai-data-governance"
publishedAt: 2026-10-14
tags: ["governanca", "dados-para-ia", "lgpd", "anpd", "auditoria", "seguranca-de-dados"]
draft: false
llmSummary: "A Resolução CD/ANPD nº 30/2025 prevê 20 atividades de fiscalização sobre dados pessoais em sistemas de IA em 2026-2027. Política de IA que só regula o uso do modelo deixa de fora o que o agente pode ler: escopo, isolamento, retenção, trilha de auditoria e definição de métrica."
citations: ["https://www.in.gov.br/web/dou/-/resolucao-cd/anpd-n-30-de-23-de-dezembro-de-2025-677947163", "https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-publica-mapa-de-temas-prioritarios-para-o-bienio-2026-2027-e-atualiza-agenda-regulatoria-2025-2026", "https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd", "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm", "https://support.google.com/analytics/answer/7667196", "https://arxiv.org/abs/2604.25149"]
about: ["https://pt.wikipedia.org/wiki/Governan%C3%A7a_de_dados", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

Governança de IA é o conjunto de regras que decide quem pode usar um sistema de inteligência artificial, para quê e, na parte que quase sempre falta, o que ele pode ler. Essa lacuna agora tem prazo. Pela Resolução CD/ANPD nº 30, de 23 de dezembro de 2025, a ANPD prevê 20 atividades de fiscalização sobre dados pessoais em sistemas de IA em 2026-2027, com 50% delas até o primeiro semestre de 2027 ([DOU](https://www.in.gov.br/web/dou/-/resolucao-cd/anpd-n-30-de-23-de-dezembro-de-2025-677947163)).

> **Governança de IA**: as decisões registradas sobre o que um sistema de IA pode fazer, com quais dados, por quanto tempo e com que registro, de modo que qualquer resposta dele possa ser explicada depois por alguém que não estava na conversa.

## O que uma política de IA costuma cobrir, e o que fica de fora?

A política típica tem quatro capítulos: ferramentas aprovadas, proibição de colar informação confidencial em chat público, revisão humana antes de publicar e treinamento. Todos regulam o **uso**. E todos partem da mesma premissa: o dado chega ao modelo porque uma pessoa o colou lá.

Essa premissa cai no dia em que o agente ganha acesso direto à base, por servidor MCP ou por API. Ninguém cola nada. O agente consulta a tabela de pedidos sozinho, quantas vezes precisar para responder, e a regra "não cole CPF no chat" fica sem objeto. A pergunta da política muda de "o que o funcionário pode mandar ao modelo" para "o que o modelo pode buscar".

Escrevo isso do lado de quem já viu agente ligado a dado sem essa segunda metade: o que vaza é o que está ao alcance dele. Se a permissão é "leitura no banco", o agente lê o banco.

| Critério | Política de uso de IA | Governança do dado que a IA lê |
|---|---|---|
| Pergunta central | Quem pode usar e para quê | O que o agente alcança e sob qual regra |
| Quem aplica | A pessoa, por disciplina | O sistema, por permissão |
| Falha típica | Alguém cola dado sensível no chat | O agente consulta uma tabela que ninguém liberou |
| Como se comprova | Treinamento e termo assinado | Registro de cada consulta |
| Muda quando o agente ganha MCP? | Não | Passa a existir por causa dele |

## Por que a ANPD tornou isso concreto em 2026?

Porque a Resolução nº 30 não fala de IA em tese: ela põe meta numérica e cronograma. O anexo da resolução, publicado no Diário Oficial em 24 de dezembro de 2025, lista quatro temas prioritários de fiscalização para 2026-2027 ([DOU](https://www.in.gov.br/web/dou/-/resolucao-cd/anpd-n-30-de-23-de-dezembro-de-2025-677947163)). Dois deles encostam diretamente em quem trabalha com dado de marketing.

| Item do Mapa de Temas Prioritários | Meta | Prazo |
|---|---|---|
| Tema 4: IA e tecnologias emergentes no contexto do tratamento de dados pessoais | 20 atividades de fiscalização sobre tratamento de dados pessoais em sistemas de IA | 50% até o 1º semestre de 2027, 50% até o 2º semestre de 2027 |
| Tema 1, item iii: uso secundário de dados pessoais para publicidade comercial direcionada, "especialmente mediante técnicas de perfilamento" | 5 atividades de fiscalização | 1º semestre de 2027 |

Fonte: [Resolução CD/ANPD nº 30/2025, Anexo](https://www.in.gov.br/web/dou/-/resolucao-cd/anpd-n-30-de-23-de-dezembro-de-2025-677947163).

O §2º do art. 1º acrescenta que os temas do mapa "terão prioridade sobre eventuais pedidos de atividades de fiscalização a respeito de matérias que não estejam nele elencadas" ([DOU](https://www.in.gov.br/web/dou/-/resolucao-cd/anpd-n-30-de-23-de-dezembro-de-2025-677947163)). Na prática, IA e publicidade direcionada estão na frente da fila.

O segundo item alcança também quem nunca pensou em si como "empresa de IA". Um agente que cruza a base de clientes com dado de campanha para montar público pode se enquadrar em uso secundário para publicidade direcionada, com ou sem a palavra IA no projeto. A resolução não detalha o roteiro de cada atividade, então não especulo sobre o que será perguntado. O que dá para afirmar é que a régua chegou e tem data.

A Nota Técnica 12/2025 não é diretriz de fiscalização de IA, embora circule assim. Ela consolida contribuições de uma tomada de subsídios, e o detalhe está no post sobre [LGPD e IA com dado de cliente](https://precisian.io/blog/pt-BR/posts/lgpd-ia-dados-de-cliente/).

## Quais são as cinco perguntas que a política precisa responder?

Uma política que cobre o dado responde, por escrito e antes de ligar o agente, a cinco perguntas. As quatro primeiras têm âncora na [LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm). A quinta não tem, e é a que mais erra número.

### 1. Escopo: o que o agente pode ler?

O princípio da necessidade, no art. 6º, III, limita o tratamento "ao mínimo necessário para a realização de suas finalidades" ([Lei 13.709/2018](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm)). Aplicado a um agente, isso vira uma lista positiva: quais tabelas, quais métricas, quais colunas. O agente que responde "qual canal trouxe mais receita em setembro" não precisa do nome, do e-mail nem do telefone de WhatsApp de nenhum cliente. Coluna de identificação fica fora por padrão e entra por exceção justificada.

A resposta que não serve é "o agente tem acesso de leitura ao banco". O protocolo também não vai impor esse limite por você: a especificação do MCP trata autorização como opcional, como detalho em [como conectar IA sem expor a base](https://precisian.io/blog/pt-BR/posts/conectar-ia-sem-expor-a-base/).

### 2. Isolamento: de quem é o dado que ele alcança?

O art. 46 exige medidas de segurança contra "acessos não autorizados" ([Lei 13.709/2018](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm)). No varejo brasileiro, acesso não autorizado raramente é um invasor. É a agência que atende três marcas e pergunta ao agente sobre a marca A recebendo linha da marca B, ou o grupo com várias lojas VTEX em que cada operação deveria enxergar só a sua.

O isolamento tem que ser aplicado pelo sistema, não pedido no prompt. "Filtre pelo cliente X" é instrução, e instrução se descumpre. O desenho que funciona está em [isolamento por cliente em servidor MCP](https://precisian.io/blog/pt-BR/posts/isolamento-por-cliente-mcp/).

### 3. Retenção: quanto tempo o dado e a resposta ficam?

O art. 16 manda eliminar o dado pessoal "após o término de seu tratamento", com exceções listadas ([Lei 13.709/2018](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm)). Com agente no meio, existem dois relógios. Um é o do dado que ele lê, e esse muitas vezes já está decidido pela ferramenta: o GA4 padrão retém dado de evento por 2 ou 14 meses ([Google](https://support.google.com/analytics/answer/7667196)). O outro é o do que o agente produz: a pergunta, o resultado da consulta e a resposta guardada no histórico do fornecedor do modelo.

A política costuma regular só o primeiro relógio. O segundo guarda dado pessoal do mesmo jeito, num lugar que ninguém inventariou. Prazos por tipo de dado estão em [quanto tempo guardar dado de marketing](https://precisian.io/blog/pt-BR/posts/quanto-tempo-guardar-dado-de-marketing/).

### 4. Trilha de auditoria: dá para reconstruir a resposta depois?

O art. 37 obriga controlador e operador a "manter registro das operações de tratamento de dados pessoais que realizarem" ([Lei 13.709/2018](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm)). Quando quem trata é um agente, o registro útil responde quatro coisas sobre cada resposta: quem perguntou, qual definição foi aplicada, quais dados foram lidos e quando.

O histórico do chat não responde nenhuma das quatro com segurança. Ele guarda o texto da conversa, não a consulta que produziu o número. O que registrar, campo por campo, está em [trilha de auditoria de resposta de IA](https://precisian.io/blog/pt-BR/posts/trilha-de-auditoria-de-resposta-de-ia/).

### 5. Definição de métrica: o número segue a regra de quem?

A LGPD não fala disso, e a Resolução nº 30 também não. Mesmo assim, é a pergunta que decide se a resposta do agente serve para alguma coisa. Quando a base tem dois campos chamados "receita", o agente escolhe um, e escolhe com a mesma confiança com que acertaria. Num teste pareado de abril de 2026 com três modelos de fronteira, entregar as definições de negócio como contexto elevou a acurácia de 45,5–50,5% para 67,7–68,7% ([Rumiantsau e Fokeev, 2026](https://arxiv.org/abs/2604.25149)).

A resposta que serve é uma definição versionada, com dono, que o agente lê antes de calcular. O erro que aparece sem ela tem nome: [alucinação de métrica](https://precisian.io/blog/pt-BR/posts/alucinacao-de-metrica/).

| Pergunta | Resposta que não serve | Resposta que serve | Âncora na LGPD |
|---|---|---|---|
| Escopo | "Acesso de leitura ao banco" | Lista de tabelas e métricas liberadas, sem coluna de identificação por padrão | art. 6º, III |
| Isolamento | "O prompt manda filtrar pelo cliente" | Separação aplicada pelo sistema, cliente a cliente | art. 46 |
| Retenção | "Segue a política de TI" | Prazos separados para o dado lido e para a resposta gerada | art. 16 |
| Trilha de auditoria | "O histórico do chat fica salvo" | Registro de quem perguntou, qual definição, quais dados e quando | art. 37 |
| Definição de métrica | "O agente sabe o que é receita" | Definição versionada, com dono, lida antes do cálculo | nenhuma |

## O que governança de IA não é?

Governança de IA não se resume a carta de princípios nem a lista de ferramentas aprovadas. Princípio sem permissão técnica correspondente não impede consulta nenhuma, e a lista diz qual modelo pode ser usado sem dizer o que ele alcança depois de conectado.

O relatório de impacto do [art. 38 da LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm), que a ANPD pode exigir, também não cumpre esse papel: ele descreve o tratamento, e a governança o limita. Relatório sem governança documenta um acesso que ninguém limitou.

O contrato com o fornecedor do modelo continua necessário, porque é ele que decide onde o dado repousa e se pode ser usado em treino. Essa parte é de transferência internacional e de papéis de controlador e operador.

## Quando isso passa a importar na sua operação?

Em três momentos, e o primeiro costuma chegar antes de alguém perceber.

**Quando o agente passa a ler sozinho.** Enquanto uma pessoa copia e cola, a política de uso dá conta. No dia em que alguém conecta o agente à base por MCP ou API, as cinco perguntas viram obrigatórias, porque não há mais ninguém entre o modelo e o dado.

**Quando há mais de uma empresa na mesma base.** Agência com vários clientes, grupo com várias marcas, operação com loja própria e Mercado Livre em contas separadas. Isolamento deixa de ser detalhe.

**Quando a resposta vira decisão de dinheiro.** Um exemplo sintético, com números redondos: se o agente soma a receita de pedido e a de faturamento numa pergunta sobre o mês, o corte de verba da semana seguinte se baseia num número que ninguém consegue reconstruir. Sem trilha e sem definição, não há como provar onde o erro entrou.

Na Precisian, três das cinco respostas estão na arquitetura: o data lake é isolado por cliente na infraestrutura da Precisian, as definições vivem numa camada semântica versionada, e o acesso por MCP e API passa por um ponto que mantém trilha de auditoria. Escopo e retenção continuam sendo decisão sua, como devem ser. *A infraestrutura é nossa, o dado é seu. Você acessa a qualquer momento e, se sair, leva tudo.*

## O que este artigo não cobre?

Não é parecer jurídico. Base legal, contrato com fornecedor e relatório de impacto são decisões do seu jurídico.

Não trato do projeto de lei de IA em tramitação nem de regulação setorial, que mudam mais rápido do que este texto seria revisado. Sobre a Resolução nº 30, cito só o que está no texto publicado: metas, temas e prazos. O anexo não descreve o roteiro das atividades de fiscalização, e por isso não digo o que o fiscal vai perguntar.

E não entro em treino de modelo com dado de cliente nem em transferência internacional, que estão no post sobre [LGPD e IA](https://precisian.io/blog/pt-BR/posts/lgpd-ia-dados-de-cliente/).

Se a política de IA da sua empresa diz quem pode usar o agente e não diz o que ele pode ler, o primeiro passo é listar o que ele alcança hoje, tabela por tabela, e comparar com o que deveria alcançar. [Agende uma conversa sobre o seu caso](https://calendar.notion.so/meet/rodrigomartucci/precisian-io), sem compromisso de contrato.
