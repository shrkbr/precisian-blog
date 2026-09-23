---
title: "LGPD e IA: onde o dado do seu cliente pode viver se você usa um LLM estrangeiro"
description: "Para mandar dado de cliente a um LLM fora do Brasil existem dois caminhos legais vivos, não três. Normas corporativas globais não é um deles."
slug: "lgpd-ia-dados-de-cliente"
lang: "pt-BR"
translationKey: "lgpd-ai-customer-data"
publishedAt: 2026-09-25
tags: ["lgpd", "anpd", "dados-para-ia"]
draft: false
llmSummary: "A ANPD considerou a União Europeia destino adequado pela Resolução 32/2026. Para os Estados Unidos, o caminho é contratual: as cláusulas-padrão da Resolução 19/2024, com prazo de adequação vencido em 23/08/2025. A ANPD declara nunca ter aprovado normas corporativas globais."
citations: ["https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-publicacaooriginal-156212-pl.html", "https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-19-de-23-de-agosto-de-2024", "https://www.gov.br/anpd/pt-br/assuntos/assuntos-internacionais/transferencia-internacional-de-dados", "https://www.gov.br/anpd/pt-br/acesso-a-informacao/participacao-social/outras-acoes", "https://www.gov.br/anpd/pt-br/centrais-de-conteudo/documentos-tecnicos-orientativos"]
about: ["https://pt.wikipedia.org/wiki/Lei_Geral_de_Prote%C3%A7%C3%A3o_de_Dados_Pessoais", "https://precisian.io/datalake/"]
author: "Gabriel Sorato"
readingTimeMinutes: 6
---

Se você manda dado de cliente para um LLM hospedado fora do Brasil, hoje existem dois caminhos legais vivos, e não três. Ou o dado fica na União Europeia, considerada adequada pela ANPD desde janeiro de 2026, ou o contrato incorpora as cláusulas-padrão da [Resolução 19/2024](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-19-de-23-de-agosto-de-2024) — cujo prazo de adequação **já venceu**. A terceira saída que todo fornecedor oferece, normas corporativas globais, não está disponível: a ANPD declara por escrito que nunca aprovou nenhuma.

> **Transferência internacional de dados**: envio de dado pessoal para fora do país, permitido pelo art. 33 da LGPD apenas nas hipóteses que a lei lista, entre elas país com grau de proteção adequado e contrato com cláusulas-padrão aprovadas pela autoridade.

## A Nota Técnica 12/2025 é o que dizem que é?

Não, e isso importa porque quase todo material sobre o tema começa por ela.

A leitura que circula é que a NT 12/2025 seria uma diretriz de fiscalização de IA. Abrindo o documento oficial, ela se apresenta de outro jeito já no cabeçalho: **"Consolidação das contribuições recebidas na Tomada de Subsídios"**, dentro do projeto de regulamentação do Item 7 da Agenda Regulatória 2025-2026 ([ANPD, participação social](https://www.gov.br/anpd/pt-br/acesso-a-informacao/participacao-social/outras-acoes)).

Ou seja: é o apanhado do que a sociedade respondeu numa consulta pública, insumo para regulamentar o **art. 20** da LGPD, que trata do direito de revisão de decisões automatizadas. Não é norma, não é orientação vinculante e não é plano de fiscalização.

Os números do próprio documento ajudam a dimensionar: foram 99 contribuições pela plataforma e 25 por e-mail, totalizando 124 participantes, dos quais cerca de 56% declararam responder em nome de algum agente de tratamento, e 7% vieram do exterior ([ANPD](https://www.gov.br/anpd/pt-br/acesso-a-informacao/participacao-social/outras-acoes)). É uma consulta, com o tamanho de uma consulta.

**O documento que de fato coloca IA como eixo de fiscalização é outro:** a Resolução CD/ANPD nº 30, de 23 de dezembro de 2025, que aprova o Mapa de Temas Prioritários para 2026-2027, e lista inteligência artificial e tecnologias emergentes entre os quatro eixos ([ANPD, regulamentações](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd)).

Se o seu jurídico recebeu um alerta citando a NT 12/2025 como base de risco, ele está certo na conclusão e errado na fonte — e fonte errada é o tipo de coisa que desmonta numa reunião.

## Para onde o dado pode ir hoje?

A página oficial de transferência internacional da ANPD responde isso de forma que não deixa margem.

A União Europeia foi considerada adequada pelo Conselho Diretor por meio da **Resolução nº 32/2026, de 26 de janeiro de 2026**. E, na mesma página, a autoridade afirma que "até a presente data não houve decisão do Conselho Diretor sobre cláusulas contratuais específicas, cláusulas-padrão contratuais equivalentes ou normas corporativas globais" ([ANPD](https://www.gov.br/anpd/pt-br/assuntos/assuntos-internacionais/transferencia-internacional-de-dados)).

| Destino | Base do art. 33 | Situação hoje |
|---|---|---|
| União Europeia | inciso I, país adequado | ✅ disponível desde 26/01/2026 |
| Estados Unidos | inciso II, "a", cláusulas-padrão | ✅ disponível, com o contrato adequado |
| Qualquer destino via normas corporativas globais | inciso II, "b" | ❌ a ANPD nunca aprovou nenhuma |

Essa última linha é a que muda conversa comercial. Quando um fornecedor americano responde à objeção de LGPD dizendo que tem normas corporativas globais ou um certificado próprio, ele está citando um mecanismo que no Brasil ainda não existe na prática. O caminho que resta para os Estados Unidos é contratual, e é específico.

## O prazo das cláusulas-padrão já venceu

A Resolução CD/ANPD nº 19, de 23 de agosto de 2024, aprovou o regulamento de transferência internacional e o texto das cláusulas-padrão. O parágrafo único do art. 2º deu um prazo: os agentes que usam cláusulas contratuais "deverão incorporar as cláusulas-padrão contratuais aprovadas pela ANPD aos seus respectivos instrumentos contratuais, no prazo de até 12 (doze) meses" ([ANPD](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-19-de-23-de-agosto-de-2024)).

Doze meses contados de agosto de 2024 significa que o prazo se encerrou em **23 de agosto de 2025**. Não é uma regra que vai entrar em vigor. É uma regra em vigor há mais de um ano, e o texto integral das cláusulas está no Anexo II da própria resolução.

## Quem responde se o fornecedor usar seu dado para treinar?

Você, e possivelmente ele junto — e essa é a parte que a maioria dos contratos de IA não trata.

A LGPD separa os papéis pela titularidade da decisão. Controlador é quem toma "as decisões referentes ao tratamento", operador é quem "realiza o tratamento de dados pessoais em nome do controlador" (art. 5º, VI e VII). O art. 39 prende o operador às instruções recebidas, e o art. 37 obriga os dois a manter registro das operações ([Lei 13.709/2018](https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-publicacaooriginal-156212-pl.html)). A distinção não é formal: ela define quem paga a conta quando algo dá errado.

A empresa que decide mandar o dado do cliente para o modelo é controladora. O fornecedor do LLM que processa conforme instruções é operador. Até aí, arranjo comum.

O deslocamento está no art. 42, §1º, I, que o Guia Orientativo da própria ANPD destaca: o operador responde solidariamente "quando descumprir as obrigações da legislação de proteção de dados ou quando não tiver seguido as instruções lícitas do controlador, **hipótese em que o operador equipara-se ao controlador**". O Guia acrescenta que, em princípio, essa é a única hipótese de equiparação ([Guia Orientativo — Agentes de Tratamento, v2.0](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-para-definicoes-dos-agentes-de-tratamento-de-dados-pessoais-e-do-encarregado)).

Traduzindo para a cláusula que interessa: se o contrato permite que o fornecedor use o conteúdo dos seus prompts para treinar o modelo dele, isso é tratamento com finalidade própria, fora das suas instruções. Não é detalhe de termo de uso — é o que decide quem responde.

Vale notar que a ANPD já atuou nesse terreno. O índice oficial de documentos técnicos lista a Nota Técnica nº 27/2024, sobre tratamento de dados de terceiros para desenvolver modelo de IA generativa, a NT nº 39/2024 sobre o plano de conformidade da Meta, e a NT nº 1/2026 sobre o sistema Grok ([ANPD](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/documentos-tecnicos-orientativos)).

## Como isso muda a decisão de arquitetura?

Ela deixa de ser sobre qual modelo usar e passa a ser sobre onde o dado repousa.

O modelo que responde a pergunta pode estar em qualquer lugar; o que precisa de base legal é o **dado pessoal que sai do país**. São decisões separáveis, e separá-las é o que abre as opções: manter a base num ambiente isolado e sob controle contratual conhecido, e expor ao modelo apenas o recorte necessário, muda o perímetro da transferência.

É por isso que um [data lake isolado por cliente](https://precisian.io/datalake/) deixa de ser detalhe técnico nesse contexto. Quando as definições vivem numa [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/) e o acesso passa por API e servidor MCP, dá para responder com precisão o que foi consultado, por quem e quando — que é exatamente o registro das operações exigido pelo art. 37.

## O que este artigo não cobre?

Não é parecer jurídico, e a decisão sobre base legal e contrato é do seu jurídico, não deste texto.

Três limites honestos no que foi citado. Não reproduzo o conteúdo analítico da NT 12/2025 além de sua natureza e dos números de participação, porque o mérito das contribuições não cabe em resumo. Não cito números de fiscalização que circulam na imprensa setorial e não constam das páginas oficiais que abri. E a norma de referência da LGPD aqui aponta para a publicação da Câmara dos Deputados, não para o Planalto, porque foi a que respondeu na verificação.

Se você está decidindo agora se pode conectar um agente de IA à base de clientes, o primeiro passo não é escolher fornecedor: é saber em que país o dado repousa e o que o contrato diz sobre treino. [Agende uma conversa sobre o seu caso](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).
