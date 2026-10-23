---
title: "MCP do Google Analytics: por que o número que ele devolve já chega modelado"
description: "O MCP do Google Analytics lê o GA4 pela Data API, que segue a identidade de relatório da propriedade. Se ela é combinada, o número já vem modelado."
slug: "mcp-do-google-analytics"
lang: "pt-BR"
translationKey: "ga4-mcp"
publishedAt: 2026-10-14
tags: ["mcp", "ga4", "consent-mode", "dados-para-ia", "divergencia-de-dados", "metric-hallucination", "ecommerce"]
draft: false
llmSummary: "O servidor MCP do Google Analytics (googleanalytics/google-analytics-mcp, experimental, v0.7.0) lê o GA4 pela Data API, que segue a identidade de relatório da propriedade, inclusive a modelagem. A resposta traz subject_to_thresholding e sampling_metadatas, mas nenhum campo diz o que foi modelado."
citations: ["https://github.com/googleanalytics/google-analytics-mcp", "https://developers.google.com/analytics/devguides/MCP", "https://pypi.org/project/analytics-mcp/", "https://developers.google.com/analytics/devguides/reporting/data/v1", "https://developers.google.com/analytics/devguides/reporting/data/v1/reporting-data-expectations", "https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/ResponseMetaData", "https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/PropertyQuota", "https://support.google.com/analytics/answer/11161109", "https://support.google.com/analytics/answer/10976610", "https://support.google.com/analytics/answer/9383630", "https://support.google.com/analytics/answer/13504892"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://en.wikipedia.org/wiki/Google_Analytics", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

O MCP do Google Analytics devolve o número que o GA4 já carrega, com modelagem, limiar e `(not set)` incluídos, e o assistente responde como se fosse contagem. O servidor oficial lê o GA4 pela Data API, e a documentação do Google, atualizada em 13/10/2026, diz que essa API respeita a identidade de relatório da propriedade, e que contagem de usuários, deduplicação e modelagem de dados seguem essa configuração ([Google Analytics Data API](https://developers.google.com/analytics/devguides/reporting/data/v1)). Se a propriedade usa a identidade combinada, parte do número é estimativa, e nada na resposta avisa.

> **MCP do Google Analytics**: servidor que implementa o Model Context Protocol sobre a Admin API e a Data API do GA4, só em leitura, e entrega a um modelo de linguagem os relatórios da propriedade com as mesmas regras de identidade, limiar e amostragem da interface.

## Qual é o sintoma?

Você liga o GA4 no Claude ou no Gemini, pergunta "quantos usuários compraram pelo orgânico em setembro" e recebe um número inteiro, sem ressalva, num parágrafo seguro. Alguém do time abre o GA4 e vê um número parecido. Ninguém desconfia, porque os dois batem.

Os dois batem porque vêm da mesma régua. O problema aparece depois, em três situações:

- **O financeiro pergunta "quanto vendemos".** O assistente responde com a receita do GA4, que não inclui o Mercado Livre, o pedido fechado no WhatsApp nem o cancelamento lançado no ERP.
- **Alguém compara com o BigQuery.** O export não carrega o dado modelado, e o número do assistente fica acima do warehouse.
- **A pergunta desce para um recorte fino** (cidade, faixa etária, campanha pequena). Linhas somem por limiar, e o assistente soma o que sobrou como se fosse o total.

Em nenhum dos três casos o assistente erra a conta. Ele lê certo uma fonte que já vinha com estimativa e com buraco, e escreve a resposta no tom de quem contou um por um.

## O que é o servidor oficial e o que ele expõe?

É um projeto do Google, marcado como experimental, que roda na sua máquina. O repositório `googleanalytics/google-analytics-mcp` se apresenta como "Google Analytics MCP Server (Experimental)" e usa a Admin API e a Data API do GA4 ([repositório](https://github.com/googleanalytics/google-analytics-mcp)). A versão corrente no [PyPI](https://pypi.org/project/analytics-mcp/) é a 0.7.0, de 29/07/2026; a primeira, 0.1.0, saiu em 22/08/2025.

O guia do Google diz que o servidor "está disponível só para requisições de leitura" e não altera configuração da propriedade ([Google for Developers](https://developers.google.com/analytics/devguides/MCP)). No código, a credencial é pedida com o escopo `analytics.readonly`, o mesmo que o README exige.

O README lista sete ferramentas. O código da versão 0.7.0 registra nove:

| Ferramenta | O que faz | Está no README? |
|---|---|---|
| `get_account_summaries` | Lista contas e propriedades que o usuário alcança | sim |
| `get_property_details` | Detalhes de uma propriedade | sim |
| `list_google_ads_links` | Vínculos com contas do Google Ads | sim |
| `get_custom_dimensions_and_metrics` | Dimensões e métricas personalizadas | sim |
| `run_report` | Relatório da Data API | sim |
| `run_funnel_report` | Relatório de funil | sim |
| `run_realtime_report` | Relatório em tempo real | sim |
| `list_property_annotations` | Anotações da propriedade | não |
| `run_conversions_report` | Relatório de conversões com modelo de atribuição, na Data API v1alpha | não |

Fonte: [README e `coordinator.py`](https://github.com/googleanalytics/google-analytics-mcp), conferidos em 14/10/2026.

Para o diagnóstico, o que importa no código é que `run_report` devolve a resposta inteira da Data API convertida em dicionário, e isso inclui o bloco `metadata`. A informação de limiar e de amostragem chega ao modelo. Se ele a usa, depende de alguém pedir.

## Por que o número já chega modelado?

Porque a Data API lê o mesmo dado da interface, com as mesmas regras. São quatro mecanismos, cada um documentado.

**Modelagem de consentimento.** Na identidade de relatório **combinada**, o GA4 estima o comportamento de quem negou consentimento a partir de quem aceitou ([Google](https://support.google.com/analytics/answer/10976610)). A página de expectativas da Data API diz que a interface e a API "usam a mesma configuração de identidade de relatório" ([Google](https://developers.google.com/analytics/devguides/reporting/data/v1/reporting-data-expectations)). Usuário e conversão modelados chegam ao MCP do mesmo jeito que aparecem na tela. Quanto do número é estimativa, a resposta não diz: o [`ResponseMetaData`](https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/ResponseMetaData) tem campo para limiar, amostragem e linha `(other)`, e nenhum para modelagem. Os requisitos de elegibilidade e o que fica de fora da modelagem estão em [Consent Mode: por que o GA4 e o BigQuery nunca vão bater](https://precisian.io/blog/pt-BR/posts/consent-mode-dado-modelado/).

**Limiar de dados.** O GA4 pode retirar linhas com poucos usuários para impedir a identificação de pessoas, e isso é mais comum com dimensões de alta cardinalidade ou personalizadas ([Google](https://developers.google.com/analytics/devguides/reporting/data/v1/reporting-data-expectations)). O limiar é definido pelo sistema e não se ajusta ([Google](https://support.google.com/analytics/answer/9383630)). A linha retirada some da resposta, sem virar zero.

**A linha `(other)` e o `(not set)`.** Dimensões com mais de 500 valores únicos por dia tendem a ter os valores raros agrupados em `(other)`, e o filtro da API é aplicado depois desse agrupamento, então não enxerga o que está dentro ([Google](https://developers.google.com/analytics/devguides/reporting/data/v1/reporting-data-expectations)). Já `(not set)` é o nome que o GA4 usa quando não recebeu valor para a dimensão, por exemplo sessão sem `session_start` ou conta do Google Ads não vinculada ([Google](https://support.google.com/analytics/answer/13504892)). O assistente trata as duas linhas como mais uma categoria.

**Amostragem e contagem aproximada.** O `runReport` pode devolver dado amostrado em relatórios grandes, e usuários ativos e sessões são estimados pelo algoritmo HyperLogLog++, na interface e na API ([Google](https://developers.google.com/analytics/devguides/reporting/data/v1/reporting-data-expectations)). O controle de nível de amostragem existe só em `properties.reportTasks.create`, e o servidor não expõe esse método.

Some a isso a cota. Uma propriedade padrão tem 200.000 tokens por dia e 40.000 por hora, e um único projeto do Google Cloud usa no máximo 14.000 por hora em cada propriedade ([Google](https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/PropertyQuota)). Um agente que encadeia dezenas de relatórios para responder uma pergunta encontra esse teto, e o erro volta como texto que o modelo pode resumir em vez de mostrar.

## Como diagnosticar se a resposta veio com limiar, amostragem ou modelagem?

Peça ao assistente o bloco `metadata` cru da última chamada, sem resumo. Como o servidor preserva os nomes do protobuf, os campos chegam em *snake_case* ([código](https://github.com/googleanalytics/google-analytics-mcp)), e não em *camelCase* como na referência REST.

| Verificação | Onde olhar | O que indica problema |
|---|---|---|
| Limiar | `metadata.subject_to_thresholding` | `true`: o relatório só traz linhas acima do limiar mínimo de agregação |
| Linha `(other)` | `metadata.data_loss_from_other_row` | `true`: parte das combinações foi agrupada em `(other)` |
| Amostragem | `metadata.sampling_metadatas` | Presente: traz `samples_read_count` e `sampling_space_size` por período; ausente, não houve amostragem |
| Truncamento | `metadata.data_truncation_reasons` | Presente: parte do período não foi servida, por retenção de dados ou outro motivo listado |
| Restrição de métrica | `metadata.schema_restriction_response` | `REVENUE_DATA` ou `COST_DATA` restritos para o usuário da credencial |
| Cota | chamar `run_report` com `return_property_quota: true` | `tokens_per_hour.remaining` perto de zero |
| `(not set)` | rodar o relatório com `sessionSourceMedium` e somar as linhas `(not set)` | Fatia relevante da receita sem origem |
| Modelagem | Admin › Exibição de dados › Identidade de relatório, na interface | Identidade "Combinada" com modelagem ativa: usuários e conversões podem incluir estimativa |

Fontes: [ResponseMetaData](https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/ResponseMetaData), [PropertyQuota](https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/PropertyQuota), [identidade de relatório](https://support.google.com/analytics/answer/10976610).

A modelagem é o item que mais pesa e o único que o MCP não responde. A identidade de relatório não vem em `get_property_details` nem na resposta do relatório; alguém precisa abrir a interface e olhar.

Um teste rápido para a receita: pegue o mesmo mês no GA4 pelo assistente e na VTEX (pedidos faturados, sem cancelados). A diferença tem causas conhecidas, descritas em [por que a receita do GA4 não bate com a VTEX](https://precisian.io/blog/pt-BR/posts/vtex-ga4-nao-batem/). Se o assistente apresentou o número do GA4 como "vendas", você já achou o primeiro erro, e ele não é do servidor.

## Como corrigir?

Três correções resolvem a maior parte, e nenhuma exige trocar de ferramenta.

**1. Obrigue o assistente a declarar o `metadata`.** Uma instrução fixa no projeto ou no prompt de sistema: "toda resposta com número do GA4 informa a identidade de relatório da propriedade, o valor de `subject_to_thresholding`, de `data_loss_from_other_row` e se houve `sampling_metadatas`; se algum indicar perda, diga isso antes do número". É o mesmo princípio de [ensinar a IA a dizer "não sei"](https://precisian.io/blog/pt-BR/posts/ensinar-a-ia-a-dizer-nao-sei/): a incerteza precisa estar no texto da resposta, não escondida no JSON.

**2. Escolha a identidade de relatório pelo uso.** O Google diz que a opção "não afeta a coleta nem o processamento" e que dá para alternar a qualquer momento sem impacto permanente ([Google](https://support.google.com/analytics/answer/10976610)). Para quem vai usar o assistente para conferir número, a identidade **observada** tira a modelagem da interface e da API ao mesmo tempo. O custo é ver menos usuários, porque quem negou consentimento deixa de ser estimado.

**3. Reduza a chance de limiar e de `(other)`.** Período mais longo revela dado retido por limiar ([Google](https://support.google.com/analytics/answer/9383630)). Menos dimensões por relatório diminui `(other)`. Evitar idade, gênero e interesse poupa a cota de 120 requisições por hora com dimensão potencialmente sujeita a limiar ([Google](https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/PropertyQuota)).

E uma regra de leitura: com a identidade combinada ativa, trate número de usuário e de conversão vindo do MCP como tendência, não como contagem para fechamento.

## Quando isso não tem conserto?

Em quatro casos, e é bom saber quais antes de prometer um número para a diretoria.

**Receita que não passou pelo GA4 não existe para esse servidor.** A venda no Mercado Livre, o pedido fechado pelo WhatsApp e pago por Pix com link, o cancelamento por antifraude lançado no ERP e a devolução da semana seguinte não geram evento no GA4. O MCP lê só a propriedade; não há ferramenta nem parâmetro que traga essas linhas. O caso do WhatsApp está em [atribuição no WhatsApp](https://precisian.io/blog/pt-BR/posts/atribuicao-whatsapp-dark-funnel/).

**A parte modelada não é separável na resposta.** A Data API não tem campo que diga quanto do número é estimativa. Dá para trocar a identidade e comparar, mas a troca vale para a propriedade inteira, inclusive para quem estiver olhando a interface naquele momento.

**Linha retida por limiar não volta pela API.** O limiar é do sistema e não se ajusta. O que dá para fazer é mudar a pergunta.

**Amostragem em propriedade padrão.** Sem `reportTasks` no servidor, não há como pedir relatório não amostrado por ele.

Um exemplo com números redondos, sintético, de uma loja em VTEX que também vende no Mercado Livre e no WhatsApp, num mês:

| Leitura | Receita | O MCP do GA4 enxerga? |
|---|---|---|
| GA4, evento `purchase` da loja própria | R$ 400.000 | sim |
| Pedidos da loja própria cancelados depois do evento | − R$ 24.000 | não |
| Vendas no Mercado Livre | R$ 150.000 | não |
| Pedidos fechados no WhatsApp | R$ 60.000 | não |
| Receita que o caixa reconhece | R$ 586.000 | não |

Neste exemplo inventado, o assistente responde R$ 400.000 com a mesma segurança com que responderia R$ 586.000. Os números são ilustrativos; o tamanho da diferença na sua operação só aparece medindo.

O MCP do GA4 também não é a resposta errada para todo mundo. Se a sua venda acontece toda no site e a pergunta é sobre tráfego, funil e comportamento, ele resolve bem, e você não precisa de uma plataforma de dados para isso. A Precisian entra quando a pergunta é "quanto vendemos e de onde veio": GA4, VTEX, marketplace e mídia num data lake isolado por cliente, na infraestrutura da Precisian, com a definição de receita escrita uma vez numa camada semântica e entregue ao assistente que você já usa, por MCP, API ou BI. A comparação com o servidor do Google Ads está em [MCP do Google Ads](https://precisian.io/blog/pt-BR/posts/mcp-do-google-ads/), e o que acontece quando os três servidores entram no mesmo chat, em [Google Ads, Meta e GA4 no mesmo Claude](https://precisian.io/blog/pt-BR/posts/google-ads-meta-e-ga4-no-mesmo-claude/).

## O que este artigo não cobre?

Não é tutorial de instalação; o passo a passo está no [README](https://github.com/googleanalytics/google-analytics-mcp) e muda a cada versão. Não compara servidores MCP de terceiros para GA4. Não mede quanto do seu número é modelado: o Google não publica esse percentual por propriedade, e qualquer valor que apareça em material de fornecedor é estimativa sem método declarado. E não detalha a `run_conversions_report`, que roda na Data API v1alpha, sujeita a mudança sem aviso.

---

Se o assistente ligado ao GA4 responde "vendas" e o número não fecha com a VTEX, o primeiro passo é medir a diferença entre a receita do GA4 e o pedido faturado, mês a mês, com marketplace e WhatsApp na conta. [Agende uma conversa sobre o seu caso](https://calendar.notion.so/meet/rodrigomartucci/precisian-io) — sem compromisso de contrato, mas sem promessa de resposta em 30 minutos também.
