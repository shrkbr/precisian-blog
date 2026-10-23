---
title: "Governança de dados no e-commerce: o mínimo que funciona"
description: "Governança de dados é o registro de quem decide sobre cada dado. No e-commerce, o mínimo útil cabe em cinco itens: dono, definição, acesso, retenção e mudança."
slug: "governanca-de-dados-ecommerce"
lang: "pt-BR"
translationKey: "data-governance"
publishedAt: 2026-10-23
tags: ["governanca", "lgpd", "ecommerce", "contrato-de-dados", "auditoria", "camada-semantica"]
draft: false
llmSummary: "Governança de dados é o conjunto de decisões registradas sobre dono, definição, acesso, retenção e mudança de cada dado. A LGPD (art. 50) torna o programa facultativo e proporcional à escala, mas o art. 52 conta a política de governança na dosimetria da sanção."
citations: ["https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm", "https://dama.org/learning-resources/dama-data-management-body-of-knowledge-dmbok/", "https://help.vtex.com/pt/tutorial/perfis-de-acesso--7HKK5Uau2H6wxE1rH5oRbc", "https://support.google.com/analytics/answer/7667196"]
about: ["https://pt.wikipedia.org/wiki/Governan%C3%A7a_de_dados", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 6
---

Governança de dados é o conjunto de decisões registradas sobre quem é dono de cada dado, como ele é definido, quem pode acessá-lo, por quanto tempo é guardado e quem aprova uma mudança. A LGPD não obriga um programa formal: o art. 50 diz que o controlador "poderá" implementá-lo, adaptado "à estrutura, à escala e ao volume de suas operações". Mas o art. 52 lista "a adoção de política de boas práticas e governança" entre os critérios para dosar a sanção, cuja multa simples chega a 2% do faturamento no Brasil, limitada a R$ 50 milhões por infração ([Lei 13.709/2018](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm)).

> **Governança de dados**: as decisões sobre o dado de uma empresa (dono, definição, acesso, retenção e mudança), registradas num lugar que qualquer pessoa ou sistema consulta antes de usar o dado, e não na memória de quem estava na reunião.

## O que é governança de dados, segundo o manual?

A referência mais citada é o DAMA-DMBOK, o guia de gestão de dados da DAMA International. Ele está na 2ª edição, teve uma revisão lançada em 2024, e a própria DAMA informa que o projeto da versão 3.0 começou em 2025 ([DAMA](https://dama.org/learning-resources/dama-data-management-body-of-knowledge-dmbok/)).

*A definição que circula atribuída ao DMBOK fala em "exercício de autoridade e controle (planejamento, monitoramento e aplicação) sobre a gestão de ativos de dados". Não consegui conferir essa redação numa página pública da DAMA, e ela aparece com e sem a expressão "decisão compartilhada" em fontes secundárias. Fica aqui como não confirmada.*

O manual está correto e cobre tudo. Ele trata governança como a disciplina que orienta todas as outras áreas da gestão de dados: arquitetura, qualidade, metadados, segurança, integração. Para um banco com mil analistas, faz sentido. Para um e-commerce com quinze pessoas, uma loja VTEX, dois marketplaces e uma planilha de fechamento, ler o DMBOK de ponta a ponta produz um projeto que ninguém vai terminar.

A própria LGPD aponta para a saída. O programa de governança em privacidade do art. 50 deve ser "adaptado à estrutura, à escala e ao volume de suas operações, bem como à sensibilidade dos dados tratados" ([Lei 13.709/2018](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm)).

## Qual é o mínimo que funciona num e-commerce?

Cinco registros. Se você tem os cinco escritos, tem governança de dados. Se não tem, nenhuma ferramenta comprada substitui.

**1. Dono por métrica.** Receita líquida, CAC, taxa de recompra: cada uma tem uma pessoa que arbitra quando duas áreas discordam. Não precisa ser alguém de dados. Muitas vezes é a controladoria ou o head de e-commerce. Métrica sem dono volta a divergir no trimestre seguinte, porque ninguém tem autoridade para encerrar a discussão.

**2. Definição escrita e versionada.** O que entra e o que sai de cada número: frete, imposto, cancelamento, devolução, venda de Mercado Livre. E qual data manda, pedido, pagamento ou faturamento. Versionada quer dizer com histórico: quando a regra mudou, quem decidiu e por quê. É o que separa uma queda de vendas de uma queda de definição. O formato está em [contrato de dados](https://precisian.io/blog/pt-BR/posts/contrato-de-dados/), e o caso mais disputado, a receita, em [por que marketing e financeiro nunca fecham o mesmo número](https://precisian.io/blog/pt-BR/posts/mesma-definicao-de-receita/).

**3. Acesso por papel.** Quem vê dado de cliente identificado, quem vê só agregado, quem exporta. A VTEX já organiza isso por perfis de acesso: um perfil "determina o conjunto de recursos que um grupo de usuários pode acessar", e cada usuário administrativo pode ter um ou mais perfis ([VTEX](https://help.vtex.com/pt/tutorial/perfis-de-acesso--7HKK5Uau2H6wxE1rH5oRbc)). O limite é que isso vale dentro da VTEX. O mesmo dado exportado para planilha, BI ou agente de IA sai sem o perfil junto.

**4. Retenção decidida.** Quanto tempo cada tipo de dado fica guardado, decidido por alguém, e não herdado da configuração padrão. No GA4 padrão, o dado de evento e de usuário fica 2 ou 14 meses, e essa configuração afeta as explorações e os relatórios de funil, não os relatórios padrão agregados ([Google](https://support.google.com/analytics/answer/7667196)). Quem nunca abriu essa tela já tomou a decisão sem saber. Os prazos por tipo de dado estão em [quanto tempo guardar dado de marketing](https://precisian.io/blog/pt-BR/posts/quanto-tempo-guardar-dado-de-marketing/).

**5. Registro do que mudou.** Uma linha por mudança: data, o que mudou (definição, fonte, permissão, prazo), quem aprovou. É o item mais barato e o mais pulado. Sem ele, os outros quatro envelhecem em silêncio.

| Registro | Pergunta que responde | Onde costuma estar hoje | Mínimo aceitável |
|---|---|---|---|
| Dono por métrica | Quem arbitra a divergência? | Em ninguém, ou em quem grita mais | Um nome por métrica principal |
| Definição versionada | O que entra no número? | Na cabeça do analista | Arquivo com regra, data e autor |
| Acesso por papel | Quem vê o quê? | Em cada ferramenta, separado | Lista de papéis aplicada também fora da plataforma |
| Retenção decidida | Por quanto tempo? | No padrão do fornecedor | Prazo escrito por tipo de dado |
| Registro de mudança | O que mudou e quando? | Em lugar nenhum | Uma linha por mudança, com aprovador |

Nenhum dos cinco exige comitê, software de catálogo ou cargo novo. Exige que alguém decida e escreva.

## Governança de dados, governança de IA e segurança são a mesma coisa?

Não, e a confusão custa caro porque cada uma é comprada como se resolvesse as outras.

| Critério | Governança de dados | Governança de IA | Segurança da informação |
|---|---|---|---|
| Pergunta central | Quem decide sobre o dado e com que regra | O que o sistema de IA pode fazer e ler | Quem consegue entrar e o que acontece se entrar |
| Objeto | Métrica, definição, dono, prazo | Modelo, agente, uso, escopo de leitura | Infraestrutura, credencial, rede |
| Falha típica | Dois números de receita igualmente "certos" | Agente lê tabela que ninguém liberou | Vazamento por credencial exposta |
| Âncora na LGPD | art. 50 (boas práticas e governança) | arts. 6º, 37 e 46 aplicados ao agente | art. 46 (medidas de segurança) |
| Depende das outras? | É a base | Depende da governança de dados | Protege as duas, não define nenhuma |

A governança de IA é, na prática, a governança de dados aplicada a um consumidor que não hesita. Uma pessoa que vê uma receita estranha desconfia e pergunta. Um agente responde com a mesma confiança com que acertaria. Por isso as cinco perguntas de [governança de IA](https://precisian.io/blog/pt-BR/posts/governanca-de-ia-comeca-no-dado/) repetem quatro destes cinco registros.

E segurança não é governança. Criptografia, MFA e backup impedem que alguém de fora leia o dado. Não impedem que duas pessoas de dentro leiam o mesmo dado com duas regras diferentes.

## O que governança de dados não é?

Comprar uma ferramenta de catálogo não cria governança. Catálogo é útil quando já existe decisão para catalogar; antes disso, ele lista campos que ninguém definiu.

Um comitê mensal também não basta. Comitê sem registro escrito produz ata, e nenhum sistema consulta ata na hora de calcular.

Adequação à LGPD é outra coisa, porque a lei cobre dado pessoal. Boa parte da divergência que trava um e-commerce está em dado que não é pessoal: receita, custo de mídia, margem por SKU.

Qualidade de dado é vizinha, e governança depende dela. Qualidade pergunta se o número está correto em relação à regra. Governança decide qual é a regra.

## Quando isso passa a importar na sua operação?

Na minha leitura, em três momentos, e quase sempre antes de alguém dar nome ao problema.

**Quando aparece a segunda fonte do mesmo número.** Loja própria e marketplace, GA4 e ERP, plataforma de mídia e financeiro. Com uma fonte só, a definição pode viver na cabeça de uma pessoa. Com duas, ela diverge.

**Quando aparece a segunda pessoa que responde à mesma pergunta.** Um exemplo sintético, com números redondos: o marketing fecha setembro em R$ 1,2 milhão de receita pela data do pedido; o financeiro fecha em R$ 1,05 milhão pela data do faturamento, sem frete. Os dois estão certos pelas próprias regras. Sem dono e sem definição escrita, a reunião discute qual número vale em vez de discutir o que fazer com ele.

**Quando um agente de IA passa a ler a base sozinho.** Aí os cinco registros deixam de ser boa prática e viram a única coisa entre a pergunta e uma resposta errada dita com segurança. Esse erro se chama [alucinação de métrica](https://precisian.io/blog/pt-BR/posts/alucinacao-de-metrica/).

Na Precisian, três dos cinco registros estão na arquitetura. As definições vivem numa [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/) versionada, sobre um data lake isolado por cliente na infraestrutura da Precisian, e o acesso por MCP, API ou BI do cliente passa por um ponto com [trilha de auditoria](https://precisian.io/blog/pt-BR/posts/trilha-de-auditoria-de-resposta-de-ia/). Dono e retenção continuam sendo decisão da sua empresa, como devem ser.

## O que este artigo não cobre?

Não é parecer jurídico. Base legal, relatório de impacto e contrato com fornecedor são decisões do seu jurídico.

Não compara ferramentas de catálogo nem de qualidade de dado, e não resume o DMBOK. O recorte é o mínimo para uma operação de e-commerce de porte médio. Uma empresa regulada, como um banco ou uma operadora de saúde, precisa de mais do que isto.

Se marketing e financeiro levam números diferentes para a mesma reunião, o primeiro passo é escolher a métrica mais disputada e escrever os cinco registros dela. [Agende uma conversa sobre o seu caso](https://calendar.notion.so/meet/rodrigomartucci/precisian-io), sem compromisso de contrato.
