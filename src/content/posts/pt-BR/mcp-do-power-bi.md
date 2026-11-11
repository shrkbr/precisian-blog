---
title: "MCP do Power BI: o que o agente consegue fazer no modelo semântico"
description: "A Microsoft documenta dois servidores MCP para o Power BI: um só lê e consulta, o outro cria e altera medidas. Os dois repetem o DAX que já está no modelo."
slug: "mcp-do-power-bi"
lang: "pt-BR"
translationKey: "power-bi-mcp-server"
publishedAt: 2026-11-11
tags: ["mcp", "camada-semantica", "dados-para-ia", "alucinacao-de-metrica", "governanca", "seguranca", "ecommerce"]
draft: false
llmSummary: "A Microsoft documenta dois servidores MCP para o Power BI: o Fabric IQ MCP, só leitura, que roda DAX com as permissões do usuário, e o Power BI Authoring MCP, que cria e altera medidas com permissão Write. Os dois leem o modelo semântico como ele está, inclusive medidas erradas."
citations: ["https://learn.microsoft.com/en-us/power-bi/developer/mcp/mcp-servers-overview", "https://learn.microsoft.com/en-us/power-bi/developer/mcp/power-bi-authoring-mcp", "https://learn.microsoft.com/en-us/power-bi/developer/mcp/remote-mcp-server-get-started", "https://learn.microsoft.com/en-us/fabric/iq/connectors/fabric-iq-mcp", "https://github.com/microsoft/powerbi-modeling-mcp", "https://www.npmjs.com/package/@microsoft/powerbi-modeling-mcp", "https://learn.microsoft.com/en-us/power-bi/create-reports/copilot-prepare-data-ai"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://en.wikipedia.org/wiki/Microsoft_Power_BI", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
cta: demo
---
O MCP do Power BI deixa um agente de IA consultar o modelo semântico em DAX e, num segundo servidor, criar e alterar medidas, tabelas e relacionamentos. A visão geral da Microsoft, atualizada em 24/09/2026, separa os dois papéis: o **Power BI Authoring MCP server** cria e muda modelos, e o **Fabric IQ** responde perguntas sobre eles ([Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/developer/mcp/mcp-servers-overview)). Nenhum dos dois confere se a medida `Receita` está certa: o agente repete o DAX que encontrou.

> **MCP do Power BI**: conjunto de servidores da Microsoft que implementam o Model Context Protocol sobre modelos semânticos do Power BI. Um deles só lê e executa consultas DAX com as permissões de quem está conectado; o outro também escreve no modelo, se essa pessoa tiver permissão de escrita.

## Quais servidores MCP a Microsoft oferece para o Power BI?

Dois em uso e um terceiro mantido para quem já o adotou, e os nomes mudaram no caminho: quem leu sobre o "servidor remoto" e o "servidor de modelagem" no começo do ano vai achar outros rótulos hoje. A tabela abaixo reflete as páginas oficiais da [documentação do MCP do Power BI](https://learn.microsoft.com/en-us/power-bi/developer/mcp/) lidas em 11/11/2026.

| Servidor | Para quê | Endpoint ou pacote | Estado | Escreve no modelo? |
|---|---|---|---|---|
| Fabric IQ MCP | Consumo: achar relatório, ler esquema, rodar DAX | `https://fabriciq.svc.cloud.microsoft/v1/mcp/fabriciq` | disponível em geral | não |
| Power BI Authoring MCP, hospedado | Autoria em modelos de workspace do Fabric | `https://api.fabric.microsoft.com/v1/mcp/powerbi/authoring` | prévia | sim |
| Power BI Authoring MCP, local | Autoria no Power BI Desktop, em arquivos PBIP e no Fabric | `@microsoft/powerbi-modeling-mcp` (npm) | disponível em geral | sim |
| Power BI Consumption MCP (antigo) | Consulta em linguagem natural | `https://api.fabric.microsoft.com/v1/mcp/powerbi` | prévia, mantido para integrações existentes | não |

Fontes: [visão geral](https://learn.microsoft.com/en-us/power-bi/developer/mcp/mcp-servers-overview) (24/09/2026), [Authoring MCP](https://learn.microsoft.com/en-us/power-bi/developer/mcp/power-bi-authoring-mcp) (17/09/2026), [Fabric IQ MCP](https://learn.microsoft.com/en-us/fabric/iq/connectors/fabric-iq-mcp) (10/11/2026) e [Consumption MCP](https://learn.microsoft.com/en-us/power-bi/developer/mcp/remote-mcp-server-get-started) (17/09/2026).

A própria Microsoft avisa para não misturar os papéis: "não use o Power BI Authoring MCP server para cenários de consumo", porque ele roda DAX para validar o modelo em construção e "não foi desenhado para responder perguntas de negócio" ([Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/developer/mcp/mcp-servers-overview)).

O servidor local vive no repositório `microsoft/powerbi-modeling-mcp`, criado em outubro de 2025, sob licença MIT e com um EULA que, no pacote npm, bloqueia as demais ferramentas até ser aceito ([GitHub](https://github.com/microsoft/powerbi-modeling-mcp)). A versão 1.0.0 do pacote saiu no npm em 25/09/2026 e a 1.0.1 em 06/11/2026 ([npm](https://www.npmjs.com/package/@microsoft/powerbi-modeling-mcp)).

## Qual é o sintoma?

O time de BI liga o Copilot, o Claude ou outro cliente MCP ao modelo semântico de vendas e pergunta: "qual foi a receita de outubro por canal?". O agente acha o modelo, lê o esquema, escreve um DAX, roda e devolve uma tabela limpa. Alguém abre o relatório do Power BI e vê o mesmo número. Parece resolvido.

O problema aparece em três lugares:

- **O financeiro fecha outro valor.** A medida `Receita` soma o valor bruto do pedido, antes de cancelamento e devolução. O relatório sempre mostrou esse número; agora o agente também mostra, por escrito, numa frase segura.
- **O agente não usa a medida.** Para responder "receita por canal", ele escreve o próprio `SUM` sobre uma coluna da tabela de pedidos, e a regra que estava na medida (excluir pedido de teste, converter moeda) fica de fora.
- **O agente muda a medida.** Com o servidor de autoria e permissão de escrita, um pedido como "corrija a receita para tirar o frete" vira uma edição no modelo que todos os relatórios passam a ler.

Nos três casos o servidor funcionou como documentado. O erro está na definição, ou na falta dela.

## Por que isso acontece, mecanicamente?

Por quatro razões, todas escritas na documentação oficial.

**1. O agente monta o DAX, o servidor só executa.** A página do Fabric IQ diz que ele "não expõe uma ferramenta de resposta em linguagem natural" e que o agente "seleciona e combina as ferramentas, compõe as consultas DAX e explica os resultados" ([Microsoft Learn](https://learn.microsoft.com/en-us/fabric/iq/connectors/fabric-iq-mcp)). As ferramentas são `DiscoverArtifacts`, `ResolveFabricItem`, `GetReportMetadata`, `GetSemanticModelSchema`, `ValueSearch` e `ExecuteQuery`. Uma consulta DAX pode chamar a medida `[Receita]` ou definir o próprio cálculo com `SUM`; a escolha é do modelo de linguagem.

**2. A medida errada é lida como certa.** O esquema que o agente recebe traz tabelas, colunas, medidas e relacionamentos. Se `Receita` foi escrita sem descontar cancelamento, o agente não tem como saber. É a mesma [alucinação de métrica](https://precisian.io/blog/pt-BR/posts/alucinacao-de-metrica/) que acontece sobre um warehouse: resposta fluente sobre uma definição que ninguém escreveu direito.

**3. O servidor de autoria escreve por padrão.** No servidor local, a opção `--readwrite` vem ligada e pede confirmação antes de aplicar uma edição, "uma vez por banco de dados"; o modo seguro é `--readonly` ([README](https://github.com/microsoft/powerbi-modeling-mcp)). Depois da primeira confirmação, as edições seguintes no mesmo modelo não pedem outra. A ferramenta `measure_operations` cria, altera, apaga e move medidas.

**4. Permissão é a do usuário, não a do agente.** "Clientes MCP executam operações com as permissões RBAC do Fabric do usuário conectado. Um cliente autônomo ou mal configurado pode executar ações destrutivas" ([Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/developer/mcp/mcp-servers-overview)). Quem tem permissão Write no modelo dá ao agente a mesma permissão Write.

Um quinto ponto não é erro, mas pesa na governança. A Microsoft escreve que "um servidor MCP não amplia o acesso ao dado, mas move o dado". Metadados e resultados vão para o cliente MCP e dele para o provedor do modelo de linguagem ([Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/developer/mcp/mcp-servers-overview)).

## Como diagnosticar isso na sua operação?

Seis verificações, todas possíveis em uma tarde.

| Verificação | Onde olhar | O que indica problema |
|---|---|---|
| Qual DAX o agente rodou | Peça ao agente a consulta exata enviada ao `ExecuteQuery` | `SUM` em coluna onde existe medida pronta |
| Permissão de quem conecta | Permissões do modelo semântico no serviço do Power BI | Write para quem só precisava consultar |
| Modo do servidor local | `args` do registro do servidor no cliente MCP | ausência de `--readonly` |
| Configuração do tenant | Portal de administração: "Users can use the Power BI Model Context Protocol server endpoint" | ligada sem decisão de quem pode usar |
| Endpoint XMLA | Configuração da capacidade | Read Write habilitado sem dono definido |
| Atualização do modelo | Histórico de atualização do modelo semântico | dado mais velho que a pergunta |

Dois detalhes da documentação pesam aqui. Primeiro, "nenhuma configuração de tenant bloqueia o servidor local": ele conecta pelo endpoint XMLA, e bloqueá-lo significa desligar o XMLA para todas as ferramentas que dependem dele ([Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/developer/mcp/power-bi-authoring-mcp)). Segundo, no Consumption MCP antigo, "o Power BI não aplica RLS quando você usa autenticação por service principal" ([Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/developer/mcp/remote-mcp-server-get-started)). O Fabric IQ MCP não aceita service principal, e a segurança por linha (RLS) e por objeto (OLS) continuam valendo ([Microsoft Learn](https://learn.microsoft.com/en-us/fabric/iq/connectors/fabric-iq-mcp)).

O teste de controle é o mais útil. Escolha três perguntas cujo número o financeiro já fechou (receita líquida do mês, pedidos faturados, ticket médio) e compare a resposta do agente com o fechamento. Se a diferença vier do DAX, a consulta mostra. Se vier da medida, o relatório erra junto.

## Como corrigir?

**Separe consumo de autoria.** Para quem só pergunta, o Fabric IQ MCP: só leitura, permissões delegadas `Item.Read.All` e `Item.Execute.All`, sem service principal ([Microsoft Learn](https://learn.microsoft.com/en-us/fabric/iq/connectors/fabric-iq-mcp)). O servidor de autoria fica com quem modela, e a Microsoft recomenda não registrar o hospedado e o local ao mesmo tempo, porque o agente passa a ver dois conjuntos de ferramentas sobrepostos.

**Escreva no modelo só por arquivo versionado.** A documentação recomenda trabalhar em arquivos PBIP sob Git, para que cada mudança do agente vire um diff revisável, e fazer backup do modelo antes ([Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/developer/mcp/power-bi-authoring-mcp)). Para explorar um modelo em produção, `--readonly`.

**Dê ao agente a definição, não só o esquema.** Descrição em cada medida, instruções de IA e respostas verificadas entram pelo recurso "Prep data for AI", que salva tudo no modelo semântico ([Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/create-reports/copilot-prepare-data-ai)). A mesma página avisa que esses recursos "não garantem um resultado específico toda vez". Para a pergunta que importa, peça ao agente que use a medida pelo nome e mostre o DAX antes do número.

**Corrija a medida antes de ligar o agente.** Se `Receita` não bate com o fechamento, ligar um MCP só espalha o número errado mais rápido. A conversa sobre o que conta como receita está em [marketing e financeiro nunca fecham o mesmo número](https://precisian.io/blog/pt-BR/posts/mesma-definicao-de-receita/), e o roteiro de permissão está em [segurança de servidor MCP](https://precisian.io/blog/pt-BR/posts/seguranca-de-servidor-mcp/).

## Quando isso não tem conserto?

Em quatro casos, e vale saber antes de prometer a resposta para a diretoria.

**O dado não está no modelo.** A venda do Mercado Livre, o pedido fechado no WhatsApp e pago por Pix e o cancelamento lançado no ERP só existem para o agente se alguém os carregou no modelo semântico. O Fabric IQ diz que o resultado "é tão atual quanto a última atualização bem-sucedida" do modelo.

**A pergunta cruza modelos.** "Cada chamada do `ExecuteQuery` mira um modelo semântico" ([Microsoft Learn](https://learn.microsoft.com/en-us/fabric/iq/connectors/fabric-iq-mcp)). Se mídia está num modelo e pedido em outro, o agente junta os dois por conta própria, fora do DAX.

**O ambiente não suporta.** O Fabric IQ MCP não está disponível em regiões só de Power BI nem em nuvens soberanas. O servidor local de autoria não roda em macOS. O hospedado exige Microsoft Entra ID, que não suporta registro dinâmico de cliente OAuth; cliente MCP que depende disso só conecta com um app registrado por você.

**A resposta tem limite de linhas.** O `ExecuteQuery` do Fabric IQ devolve até 250 linhas sem `maxRows` ([Microsoft Learn](https://learn.microsoft.com/en-us/fabric/iq/connectors/fabric-iq-mcp)), e as ferramentas de DAX do servidor de autoria têm teto de 100.000 linhas ([Microsoft Learn](https://learn.microsoft.com/en-us/power-bi/developer/mcp/power-bi-authoring-mcp)).

Um exemplo com números redondos, sintético, de uma loja em VTEX que vende também no Mercado Livre, num mês:

| Leitura | Valor | Está na medida `Receita`? |
|---|---|---|
| Pedidos da loja própria, valor bruto | R$ 800.000 | sim |
| Cancelados depois da captura | − R$ 40.000 | não |
| Devolvidos no mês | − R$ 20.000 | não |
| Vendas no Mercado Livre | R$ 200.000 | não (fora do modelo) |
| Receita que o financeiro fecha | R$ 940.000 | não |

Neste exemplo inventado, o agente responde R$ 800.000 com a mesma segurança com que responderia R$ 940.000, e o relatório concorda com ele. Os números são ilustrativos.

O MCP do Power BI não é a escolha errada para todo mundo. Se o modelo semântico já carrega a definição que o financeiro aceita e a pergunta cabe num modelo só, o Fabric IQ resolve bem, sem outra plataforma. Na minha leitura, o ponto fraco do arranjo é a medida escrita uma vez, por uma pessoa, dentro de um arquivo de relatório. A Precisian entra quando a definição precisa valer fora do Power BI: GA4, VTEX, marketplace e mídia num data lake isolado por cliente, na infraestrutura da Precisian, com a regra de receita escrita uma vez numa [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/) e entregue por MCP, API ou ao BI que você já usa. A diferença entre as portas está em [servidor MCP ou BI](https://precisian.io/blog/pt-BR/posts/mcp-server-vs-bi/).

## O que este artigo não cobre?

Não é tutorial de instalação; o passo a passo muda a cada versão e está na [documentação](https://learn.microsoft.com/en-us/power-bi/developer/mcp/) da Microsoft. Não cobre os servidores MCP mais amplos do Fabric (lakehouse, pipeline, administração de workspace). Não compara servidores MCP de terceiros para Power BI. E não detalha a ferramenta `Generate Query` do Consumption MCP antigo, que usa o Copilot e exige licença dele.

---

Se o agente ligado ao Power BI responde "receita" e o número não fecha com o financeiro, o primeiro passo é ler o DAX da medida e conferir o que ela soma, antes de discutir o agente. [Veja um MCP governado respondendo](https://precisian.io/demonstracao?utm_source=blog&utm_medium=cta&utm_campaign=mcp-do-power-bi&utm_content=texto) sobre um lake isolado, sem compromisso de contrato.
