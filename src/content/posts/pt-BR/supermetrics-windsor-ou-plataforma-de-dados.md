---
title: "Supermetrics, Windsor.ai ou plataforma de dados: quando o conector basta"
description: "Supermetrics e Windsor.ai levam o dado à planilha e à IA a partir de US$ 19/mês. Nenhum deles decide o que receita significa na sua empresa."
slug: "supermetrics-windsor-ou-plataforma-de-dados"
lang: "pt-BR"
translationKey: "connector-vs-platform"
publishedAt: 2026-10-14
updatedAt: 2026-10-27
tags: ["mcp", "camada-semantica", "alucinacao-de-metrica", "integracao", "pipeline", "custo", "dados-para-ia"]
draft: false
llmSummary: "Em 14/10/2026, Windsor.ai (a partir de US$ 19/mês) e Supermetrics (US$ 39/mês) oferecem MCP ou conexão com Claude, segundo as páginas oficiais. Funnel e Improvado também têm MCP. O conector move o dado; a definição de métrica que um agente de IA precisa continua por escrever."
citations: ["https://supermetrics.com/pricing", "https://docs.supermetrics.com/docs/supermetrics-mcp-server", "https://windsor.ai/pricing/", "https://windsor.ai/documentation/windsor-mcp/how-to-integrate-data-into-claude/", "https://funnel.io/pricing", "https://help.funnel.io/en/articles/15014203-quick-start-guide-using-funnel-mcp", "https://improvado.io/pricing", "https://improvado.io/docs-section-topic/improvado-mcp", "https://arxiv.org/abs/2604.25149", "https://support.google.com/google-ads/answer/3123169", "https://developers.facebook.com/docs/marketing-api/reference/ad-account/insights"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://en.wikipedia.org/wiki/Semantic_layer", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
---

O conector basta quando quem lê o número é uma pessoa diante de uma planilha, e deixa de bastar quando quem lê é um agente de IA. Em 14/10/2026, o Windsor.ai cobra a partir de US$ 19 por mês no plano anual ([Windsor.ai](https://windsor.ai/pricing/)) e o Supermetrics a partir de US$ 39 ([Supermetrics](https://supermetrics.com/pricing)), e os dois já entregam o dado ao Claude e ao ChatGPT. O conector move o dado. Escrever o que "receita" significa na sua empresa fica fora do trabalho dele, e é dessa lacuna que nasce a alucinação de métrica.

> **Conector de dados de marketing**: ferramenta que extrai métricas das APIs de plataformas (Google Ads, Meta, GA4, TikTok) e as entrega num destino, como planilha, Looker Studio, data warehouse ou, desde 2026, um assistente de IA via MCP. Ele copia a definição de cada plataforma; não cria uma definição da empresa.

## Quais critérios importam nessa escolha?

Declaro os critérios antes da tabela para que você possa discordar deles. São sete:

1. **Destino do dado.** Para onde ele vai: planilha, ferramenta de BI, warehouse, IA.
2. **Quem define a métrica.** A plataforma de origem, um administrador seu dentro da ferramenta, ou um processo com responsável e versão.
3. **Histórico e retenção.** Quanto tempo de dado fica guardado e onde.
4. **Isolamento.** O que a documentação pública diz sobre separação do seu dado.
5. **Acesso por IA (MCP).** Se existe, em que plano, e se o agente só lê ou também altera campanha.
6. **Quem opera.** Quem conserta quando um conector quebra ou uma API muda.
7. **Modelo de cobrança.** Preço público, cotação ou consumo.

Ficaram de fora, de propósito, a contagem de conectores e os modelos prontos de relatório. Os quatro fornecedores cobrem as fontes de mídia mais comuns, e número de conector não diz nada sobre a pergunta deste artigo: se a resposta que o agente dá é a mesma que o financeiro daria.

## O que cada ferramenta faz bem?

**Supermetrics** é o caminho mais curto entre a conta de anúncio e a planilha. Os planos Starter e Growth custam US$ 39 e US$ 159 por mês no anual (US$ 49 e US$ 199 no mensal) e incluem um destino central à escolha, entre eles Google Sheets, Looker Studio, Excel, Power BI, Claude e ChatGPT ([Supermetrics, consultado em 14/10/2026](https://supermetrics.com/pricing)). Warehouse, API e transformação de dados aparecem só no Enterprise, sob cotação. O servidor MCP é um produto à parte, para quem tem acesso à API, e pode criar ou alterar campanhas, que nascem pausadas ([documentação de 27/08/2026](https://docs.supermetrics.com/docs/supermetrics-mcp-server)).

**Windsor.ai** é o mais barato da lista e o mais generoso em destino: todos os planos levam o dado a Looker Studio, Sheets, BigQuery e Snowflake, com até 10 anos de histórico e acesso ao Windsor MCP ([Windsor.ai, consultado em 14/10/2026](https://windsor.ai/pricing/)). O conector para o Claude lê e escreve nas contas conectadas: pausa campanha e realoca orçamento ([Windsor.ai](https://windsor.ai/documentation/windsor-mcp/how-to-integrate-data-into-claude/)).

**Funnel** é o único dos quatro cuja página de preço põe a regra de negócio no plano de entrada. O Starter parte de US$ 300 por mês, cobrado no anual, e inclui "Semantics: apply your business logic" e MCP; BigQuery e S3 entram a partir do Business, de US$ 600 ([Funnel, consultado em 14/10/2026](https://funnel.io/pricing)). O MCP é só de leitura, está em todos os planos e tem uma ferramenta, `get_workspace_context`, que devolve as convenções e regras de negócio escritas pelo administrador ([Funnel, 02/09/2026](https://help.funnel.io/en/articles/15014203-quick-start-guide-using-funnel-mcp)).

**Improvado** é o que mais se aproxima de plataforma. A documentação de 06/10/2026 descreve 46 mil métricas harmonizadas, 84 ferramentas no MCP e acesso de leitura e escrita ([Improvado](https://improvado.io/docs-section-topic/improvado-mcp)). Há um plano só de MCP a US$ 100 por mês; Advanced e Enterprise saem sob consulta e incluem créditos de serviço profissional ([Improvado, consultado em 14/10/2026](https://improvado.io/pricing)).

## Como as opções se comparam, critério a critério?

| Critério | Supermetrics | Windsor.ai | Funnel | Improvado | Plataforma de dados gerenciada |
|---|---|---|---|---|---|
| Destino do dado | 1 destino central no Starter/Growth; warehouse só no Enterprise | Todos os destinos em todos os planos, inclusive BigQuery e Snowflake | 13 destinos no Starter; BigQuery e S3 a partir do Business | Warehouse, BI e IA | Lake isolado por cliente; consumo pela IA, API ou BI do cliente |
| Quem define a métrica | A plataforma de origem; métrica customizada no Enterprise | A plataforma de origem | Administrador do workspace (Semantics) | Modelo de dados harmonizado + regras do seu time | Definição escrita com o seu time, versionada e aprovada por ele |
| Histórico | Supermetrics Storage só no Enterprise | Até 10 anos | Armazenamento incluso; prazo não declarado na página de preços | Em warehouse que você controla; teto de linhas/ano por plano | Histórico completo durante o contrato |
| Isolamento | Residência de dado e controle de região no Enterprise | Não declarado na página de preços | Papéis, permissões e log de auditoria no Enterprise | Não declarado na página de preços; SOC 2 Type II em todos os planos | Lake isolado por cliente, na infra do fornecedor |
| MCP | Exige acesso à API; cria e altera campanha | Todos os planos; lê e escreve | Todos os planos; só leitura | Todos os planos; lê e escreve | Consulta ao dado já modelado |
| Quem opera | Você | Você | Você; suporte com SLA no Enterprise | Você, com serviço profissional nos planos pagos sob consulta | O fornecedor, com analista dedicado |
| Cobrança | US$ 39 a 159/mês (anual); Enterprise sob cotação; créditos de IA medidos | US$ 19 a 499/mês (anual); Enterprise sob cotação | A partir de US$ 300/mês (anual); Enterprise com vendas | MCP Only US$ 100/mês; Starter a partir de US$ 20 mil/ano e Growth a partir de US$ 50 mil/ano; Enterprise sob consulta (página atualizada, conferida em 26/10/2026) | Mensal, sem setup e sem cobrança por assento |

Fontes da tabela, todas consultadas em 14/10/2026: páginas oficiais de preço de [Supermetrics](https://supermetrics.com/pricing), [Windsor.ai](https://windsor.ai/pricing/), [Funnel](https://funnel.io/pricing) e [Improvado](https://improvado.io/pricing), e a documentação de MCP de cada um, citada na seção anterior. A coluna da direita descreve a categoria; o caso da Precisian está em [preços](https://precisian.io/precos).

## Por que o conector basta para o Looker Studio e não para o agente?

Porque no Looker Studio existe um humano entre o número e a decisão. Quem monta o relatório sabe que a coluna "conversões" do Google Ads conta a compra até 30 dias depois do clique ([Google Ads](https://support.google.com/google-ads/answer/3123169)) e que a da Meta conta 7 dias depois do clique ou 1 depois da visualização ([Meta](https://developers.facebook.com/docs/marketing-api/reference/ad-account/insights)), e não soma as duas. O agente não sabe. Ele recebe as duas colunas pelo mesmo MCP e soma, como mostrei em [Google Ads, Meta e GA4 no mesmo Claude](https://precisian.io/blog/pt-BR/posts/google-ads-meta-e-ga4-no-mesmo-claude/).

Um exemplo com números redondos, sintético: a loja na VTEX faturou R$ 1 milhão em setembro, segundo o ERP. O GA4 registrou R$ 1,1 milhão em `purchase`, porque contou pedidos de Pix que [nunca foram pagos](https://precisian.io/blog/pt-BR/posts/pix-quebra-o-purchase-do-ga4/). O Mercado Livre vendeu outros R$ 200 mil que nenhuma plataforma de mídia enxerga. Pergunte ao Claude, pelo conector, "qual foi a receita de setembro?", e ele responde com a fonte que estiver mais à mão. A conta estará certa e o número, errado.

Esse erro se chama [alucinação de métrica](https://precisian.io/blog/pt-BR/posts/alucinacao-de-metrica/) e acontece quando o modelo calcula direito sobre uma definição que ninguém escreveu. Num teste pareado de abril de 2026, dar as definições de negócio ao modelo elevou a acurácia das respostas de 45,5–50,5% para 67,7–68,7% ([Rumiantsau e Fokeev, 2026](https://arxiv.org/abs/2604.25149)). O conector não piora esse número. Ele só não o melhora, porque não carrega definição nenhuma.

Funnel e Improvado reconhecem o problema e oferecem um lugar para a regra. A pergunta que sobra é quem escreve, quem aprova e quem atualiza quando o financeiro muda o que conta como venda. Se a resposta é "um analista de mídia, quando sobrar tempo", o lugar existe e fica vazio. O que vai dentro de uma definição útil, campo a campo, está em [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/).

Três dos quatro MCPs da tabela também alteram campanha. Com permissão de escrita sobre dado sem definição, o agente que lê errado também age errado: pausa a campanha que, pela conta do ERP, vendia. Antes de ativar, vale entender o que um [MCP de plataforma enxerga](https://precisian.io/blog/pt-BR/posts/mcp-do-google-ads/) e o que não enxerga.

## Quando **não** escolher a Precisian?

**Time pequeno que só quer o relatório semanal no Sheets ou no Looker Studio.** Se a pergunta é "quanto gastei e quantos cliques tive por campanha", e quem lê é uma pessoa que conhece as plataformas, o conector resolve. O Windsor.ai Basic custa US$ 19 por mês no anual e o Supermetrics Starter, US$ 39 ([Windsor.ai](https://windsor.ai/pricing/); [Supermetrics](https://supermetrics.com/pricing)). Nenhuma plataforma gerenciada compete com isso, e nem deveria tentar.

**Operação de uma fonte só.** Uma loja que vende só pelo site e anuncia só no Google não tem reconciliação a fazer. O relatório nativo basta.

**Time de dados que já tem warehouse e definições escritas.** Aí o que falta é ingestão, e Funnel ou Improvado resolvem com mais controle na mão do seu time. A comparação de custo dos dois lados está em [construir ou contratar um data lake](https://precisian.io/blog/pt-BR/posts/construir-ou-contratar-data-lake/).

**Quem procura painel pronto.** A Precisian não vende dashboard. A entrega termina na camada semântica, e o consumo acontece na IA, no BI ou na automação do cliente.

## O que recomendar, por perfil?

**Relatório semanal, uma pessoa lendo:** Windsor.ai ou Supermetrics no plano de entrada. Escolha pelo destino que você já usa.

**Time de mídia que quer perguntar no Claude sobre mídia, só mídia:** conector com MCP serve. Comece em só leitura (o Funnel já vem assim) e só libere escrita depois de saber o que o agente faz com ela.

**Agente respondendo à diretoria sobre receita, com VTEX, marketplace e ERP no meio:** você precisa de definição escrita antes de precisar de conector. Com time de dados para escrever e manter as regras, Funnel ou Improvado dão o lugar. Sem esse time, a escolha é uma plataforma gerenciada, em que a modelagem da camada semântica é feita com o seu time e faz parte do contrato.

**Grupo com várias marcas ou agência no meio:** o critério que domina é isolamento. Pergunte a cada fornecedor, por escrito, como o dado de uma marca fica separado do da outra.

## O que este artigo não cobre?

Não compara qualidade de conector fonte a fonte; isso depende das suas contas e muda a cada versão de API. Não traz preço de Enterprise de nenhum dos quatro, porque nenhum publica. Não testei latência nem limite de taxa dos MCPs. E o preço do Windsor.ai é renderizado por JavaScript na [página oficial](https://windsor.ai/pricing/); conferi os valores na página renderizada e no FAQ da mesma página em 14/10/2026, mas eles mudam sem aviso, então confira antes de assinar.

---

Se o agente da sua operação já devolve uma receita que não bate com o ERP, o primeiro passo é medir a distância entre os dois e descobrir qual definição cada um usou. O que uma plataforma de dados gerenciada inclui para fechar essa distância, e a faixa de entrada, estão em [preços da Precisian](https://precisian.io/precos), sem compromisso de contrato.
