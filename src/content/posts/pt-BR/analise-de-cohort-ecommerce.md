---
title: "Análise de cohort no e-commerce: como montar sem o cadastro te enganar"
description: "Cohort agrupa clientes pelo mês da 1ª compra e mede quantos voltam. Cliente duplicado, 1ª compra cancelada e fuso em UTC trocam a safra."
slug: "analise-de-cohort-ecommerce"
lang: "pt-BR"
translationKey: "analise-de-cohort-ecommerce"
publishedAt: 2026-11-23
tags: ["ecommerce", "divergencia-de-dados", "camada-semantica", "ga4", "marketplace"]
draft: false
llmSummary: "Análise de cohort agrupa clientes pelo mês da primeira compra e mede a recompra nos meses seguintes. O cohort do GA4 não serve para isso: a Data API só aceita firstSessionDate e a exploração define coorte pelo dispositivo (Google, lido em 23/11/2026)."
citations: ["https://support.google.com/analytics/answer/9670133", "https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/CohortSpec", "https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/report-types/default-reports/customers-reports", "https://github.com/vtex/openapi-schemas", "https://developers.vtex.com/docs/api-reference/orders-api#get-/api/oms/pvt/orders", "https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/timestamp_functions", "https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/date_functions", "https://help.vtex.com/pt/docs/tutorials/conversation-tracker", "https://developers.mercadolivre.com.br/pt_br/gerenciamento-de-vendas"]
about: ["https://en.wikipedia.org/wiki/Cohort_analysis", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
cta: regua
---
Análise de cohort no e-commerce agrupa os clientes pelo mês da primeira compra (a safra) e mede quantos de cada safra voltam a comprar no 1º, 2º, 3º mês seguinte. O relatório de coorte do GA4 não faz essa conta: a Data API do Google aceita uma única dimensão de entrada, `firstSessionDate`, a data da primeira sessão ([Google, `CohortSpec`](https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/CohortSpec), lido em 23/11/2026). Cohort de recompra sai da base de pedidos, e três defeitos de cadastro trocam o cliente de safra.

> **Análise de cohort (coorte)**: tabela em que cada linha é um grupo de clientes que fez a primeira compra válida no mesmo período, e cada coluna é o número de meses desde essa compra. A célula mostra quantos clientes da safra compraram de novo naquele mês. Só tem significado com três regras escritas: o que identifica um cliente, que pedido conta como primeira compra e em que fuso o mês começa.

## Como se lê uma tabela de cohort?

Um exemplo **sintético**, com números redondos, só para mostrar a forma. Nenhum número abaixo vem de cliente real.

| Safra (mês da 1ª compra) | Clientes novos | Mês 1 | Mês 2 | Mês 3 |
|---|---|---|---|---|
| Janeiro | 1.000 | 10,0% | 7,0% | 6,0% |
| Fevereiro | 800 | 9,5% | 6,5% | n/d |
| Março | 900 | 11,0% | n/d | n/d |

Cada linha anda para a direita no tempo. A safra de janeiro teve 1.000 clientes novos; 10% deles compraram de novo em fevereiro (mês 1), 7% em março (mês 2). Ler na vertical compara safras na mesma idade: a de março recompra mais no mês 1 que a de janeiro. Na prática, a tabela diz se o cliente que você adquiriu neste trimestre volta mais ou menos que o do trimestre passado.

A tabela acima conta clientes **ativos** em cada mês, o que o GA4 chama de cálculo **padrão**: *"Cada célula inclui todos os usuários da coorte que atendem aos critérios de retorno do período individual"* ([Google Analytics](https://support.google.com/analytics/answer/9670133), lido em 23/11/2026). Há outras duas leituras, contínua e cumulativa, e elas dão números diferentes para a mesma base. Diga qual está usando no título da tabela.

Cohort e RFM respondem perguntas diferentes. RFM dá uma nota a cada cliente numa data, e está em [análise RFM no e-commerce](https://precisian.io/blog/pt-BR/posts/analise-rfm-ecommerce/). Cohort acompanha um grupo que entrou junto. Somar margem por safra e dividir pelo custo de aquisição é LTV/CAC, assunto de [LTV/CAC no e-commerce](https://precisian.io/blog/pt-BR/posts/ltv-cac-ecommerce/). Este texto fica no passo anterior aos dois: montar a safra certa.

## Qual é o sintoma de um cohort que engana?

A recompra do mês 1 cai de uma safra para a outra sem nenhuma mudança de operação. Ou a safra de janeiro tem mais "clientes novos" do que o ERP tem CPFs com primeira nota em janeiro. Ou o time de CRM monta a tabela no GA4, o financeiro monta na base de pedidos, e a recompra de um é o dobro da do outro.

Nos três casos a fórmula está certa. O que mudou foi quem entrou em cada safra.

## Por que o cohort do GA4 não é o cohort de cliente?

Porque o GA4 conta navegador, não comprador. A exploração de coorte aceita "Qualquer transação" como critério de entrada, mas a mesma página avisa: *"As coortes são definidas somente com base nos dados do dispositivo do usuário"*, e o User-ID não entra na definição ([Google Analytics](https://support.google.com/analytics/answer/9670133), lido em 23/11/2026). A cliente que comprou no notebook em janeiro e voltou pelo celular em março aparece como duas pessoas: uma que nunca voltou e uma nova.

Pela API é mais restrito. O objeto `Cohort` da Data API diz que o campo `dimension` é *"Required and only supports `firstSessionDate`"* ([Google, `CohortSpec`](https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/CohortSpec)). A safra que sai dali é a da primeira visita, não a da primeira compra.

| Aspecto | Cohort do GA4 | Cohort da base de pedidos |
|---|---|---|
| Quem é o cliente | Dispositivo (cookie ou ID do app) | Chave escolhida: CPF, `userProfileId`, e-mail normalizado |
| Entrada na safra | Primeira sessão (API) ou primeira transação no dispositivo (exploração) | Primeira compra **válida** do cliente |
| Pedido cancelado | Conta, se o evento `purchase` disparou | Sai, se o filtro de status existe |
| Marketplace e loja física | Não existem | Entram, se houver chave que ligue |
| Limite de exibição | No máximo 60 coortes na exploração ([Google](https://support.google.com/analytics/answer/9670133)) | O que a base guardar |

A Shopify, por exemplo, monta o relatório pela base de pedidos: *"customers are grouped into cohorts based on the date that they placed their first order"* ([Shopify Help Center](https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/report-types/default-reports/customers-reports), lido em 23/11/2026). A mesma página não diz como trata pedido cancelado nem como reconhece o mesmo cliente entre pedidos.

## Que defeitos de cadastro trocam o cliente de safra?

Três, e dois deles erram em sentidos opostos.

**1. Cliente duplicado: a recompra vira aquisição.** Se a mesma pessoa aparece com duas chaves, a segunda compra não conta como retorno da safra dela. Conta como cliente novo na safra seguinte. A recompra cai e a aquisição sobe, os dois errados ao mesmo tempo. Na VTEX, o Conversation Tracker mascara o e-mail do comprador por padrão, com um endereço do tipo `...@ct.vtex.com.br` *"válido até o fim do fluxo do pedido"* ([VTEX](https://help.vtex.com/pt/docs/tutorials/conversation-tracker), lido em 23/11/2026). Quem usa esse e-mail como chave tem um cliente por pedido. O próprio pedido traz `clientProfileData.document` e `clientProfileData.userProfileId`, descrito como *"Customer user profile ID"* ([`vtex/openapi-schemas`](https://github.com/vtex/openapi-schemas)). No marketplace a chave falta de vez, como mostrei em [deduplicar venda entre site e marketplace](https://precisian.io/blog/pt-BR/posts/deduplicar-venda-site-marketplace/).

**2. Primeira compra cancelada: a recompra é inventada.** A cliente gera um Pix em janeiro, não paga, o pedido é cancelado, e ela compra de verdade em fevereiro. Sem filtro de status, ela entra na safra de janeiro e a compra de fevereiro vira "retorno no mês 1". A VTEX lista `canceled` entre os valores de status do pedido ([`vtex/openapi-schemas`](https://github.com/vtex/openapi-schemas)), mas o filtro precisa existir na consulta. E pedido faturado que volta não muda para `canceled`: vira nota de devolução do tipo `Input`, como detalhei em [API da VTEX: pedido, faturamento e cancelamento](https://precisian.io/blog/pt-BR/posts/api-da-vtex-dados-de-pedido/). Por que o Pix deixa pedido criado sem pagamento está em [o Pix quebra o evento de compra do GA4](https://precisian.io/blog/pt-BR/posts/pix-quebra-o-purchase-do-ga4/).

**3. Fuso: o mês começa na hora errada.** A VTEX grava `creationDate` com offset ISO 8601, e a documentação do filtro `f_creationDate` dá como exemplo de um mês `creationDate:[2022-01-01T02:00:00.000Z TO 2022-02-01T01:59:59.999Z]` ([VTEX, Orders API](https://developers.vtex.com/docs/api-reference/orders-api#get-/api/oms/pvt/orders)): no exemplo da documentação o mês começa às 02:00 UTC; a meia-noite de Brasília (UTC-3) corresponde a 03:00 UTC. No BigQuery, `TIMESTAMP_TRUNC` sem fuso declarado usa *"the default time zone, UTC"* ([BigQuery](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/timestamp_functions), lido em 23/11/2026). O pedido das 22h30 de 31 de janeiro, no horário de Brasília, já é 1º de fevereiro em UTC e entra na safra errada. Num mês comum, isso move poucas horas de pedido. Em 2026, a Cyber Monday cai em 30 de novembro, último dia do mês, e os pedidos da noite dela vão para a safra de dezembro.

## Como montar o cohort a partir da base de pedidos?

Em SQL, no BigQuery, com as três regras explícitas. A tabela `pedidos` aqui é ilustrativa: uma linha por pedido, com a chave de cliente já resolvida.

```sql
WITH validos AS (
  SELECT
    cliente_id,                                  -- regra 1: chave já unificada (CPF ou userProfileId)
    DATE(criado_em, 'America/Sao_Paulo') AS dia  -- regra 3: fuso da loja, não UTC
  FROM pedidos
  WHERE status = 'invoiced'                      -- regra 2: só pedido faturado
    AND NOT tem_nota_de_devolucao                -- e não devolvido depois
),
safra AS (
  SELECT cliente_id, DATE_TRUNC(MIN(dia), MONTH) AS mes_safra
  FROM validos
  GROUP BY cliente_id
)
SELECT
  s.mes_safra,
  DATE_DIFF(DATE_TRUNC(v.dia, MONTH), s.mes_safra, MONTH) AS mes_n,
  COUNT(DISTINCT v.cliente_id) AS clientes_ativos
FROM safra s
JOIN validos v USING (cliente_id)
GROUP BY 1, 2
ORDER BY 1, 2;
```

`DATE(timestamp, time_zone)` converte o instante para a data no fuso informado ([BigQuery, funções de data](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/date_functions)). A linha com `mes_n = 0` é o tamanho da safra; a taxa de recompra de cada célula é `clientes_ativos` dividido por ela. Quem compra duas vezes no mesmo mês da safra aparece só no mês 0; se o seu negócio considera isso recompra, escreva a regra.

## Como diagnosticar o seu cohort?

Quatro conferências, todas rodáveis na base de pedidos:

| Verificação | Como rodar | O que indica problema |
|---|---|---|
| Chave de cliente | `COUNT(DISTINCT email)` contra `COUNT(DISTINCT document)` por safra | E-mails distintos acima de documentos: a recompra está virando aquisição |
| Primeira compra inválida | Percentual de clientes cuja primeira compra tem status `canceled` | Qualquer valor acima de zero, se o filtro de status não existe |
| Fuso | Recalcular a safra com `DATE(criado_em)` e com `DATE(criado_em, 'America/Sao_Paulo')` | Clientes que mudam de safra entre as duas versões |
| Safra contra o ERP | Clientes novos por mês contra CPFs com primeira nota de saída no mês | Diferença que não se explica por marketplace ou loja física |

Se a primeira linha acusa diferença, corrija a chave antes de olhar qualquer outra coisa. É o defeito que mais desloca a tabela, porque age em toda recompra, não só nas bordas do mês.

## Como corrigir?

**Escreva as três regras antes da primeira consulta.** Qual chave identifica o cliente e em que ordem de prioridade (documento, `userProfileId`, e-mail normalizado). Qual status torna uma compra válida, e o que fazer com a devolução depois da nota. Em que fuso o mês começa. É o mesmo trabalho de [ter uma só definição de receita](https://precisian.io/blog/pt-BR/posts/mesma-definicao-de-receita/), aplicado ao cliente.

**Recalcule a safra quando o cadastro muda.** Se duas chaves forem unificadas depois, o cliente pode mudar de safra para trás. Uma tabela de cohort gravada como foto mensal guarda o erro de cada mês. A tabela calculada a partir dos pedidos, com a regra atual, corrige o passado inteiro de uma vez.

**Compare safras na mesma idade.** A safra de outubro tem um mês de vida; a de janeiro tem dez. Comparar a recompra acumulada das duas mede idade, não qualidade. Compare a coluna "mês 1" com a coluna "mês 1".

**Leia a safra de evento à parte.** A safra de novembro carrega a Black Friday e pode trazer outro perfil de comprador. Mantenha a linha na tabela e compare a recompra dela com a das safras vizinhas antes de usá-la na tendência do ano.

Na Precisian, os pedidos da loja e do ERP ficam num data lake isolado por cliente, na infraestrutura da Precisian, e as três regras ficam registradas na camada semântica. Quem consulta a safra pelo MCP, pela API ou pelo BI do cliente recebe a mesma regra de cliente, de pedido válido e de fuso.

## Quando o cohort **não** tem conserto?

**Quando a recompra acontece onde não há chave.** A cliente que voltou pela Amazon ou pelo Mercado Livre chega sem documento que ligue o pedido ao histórico da loja. A safra dela parece não recomprar, e nenhuma API informa quantos clientes estão nessa situação.

**Quando a fonte já apagou o começo da safra.** Os pedidos do Mercado Livre ficam salvos por até 12 meses ([Mercado Livre](https://developers.mercadolivre.com.br/pt_br/gerenciamento-de-vendas)) e a listagem de pedidos da VTEX devolve os últimos dois anos ([VTEX](https://developers.vtex.com/docs/api-reference/orders-api#get-/api/oms/pvt/orders)). Sem cópia própria, um cliente cuja primeira compra saiu dessa janela reaparece como novo, e as safras antigas ficam incompletas para sempre.

**Quando a categoria não recompra no horizonte da tabela.** Colchão, eletrodoméstico e móvel voltam em anos. Numa tabela de 12 colunas mensais, quase toda célula fica perto de zero, e cohort trimestral ou anual diz mais.

**Quando o uso do CPF não tem base legal.** Unificar canais pelo documento é tratamento de dado pessoal. A finalidade precisa estar declarada antes da junção, como discuti em [LGPD e IA sobre dado de cliente](https://precisian.io/blog/pt-BR/posts/lgpd-ia-dados-de-cliente/).

## O que este artigo não cobre?

Não traz taxa média de recompra do e-commerce brasileiro por mês de safra. Procurei estudo com amostra e metodologia publicadas e não encontrei; os percentuais da primeira tabela são sintéticos e só mostram a forma da leitura.

Não trata cohort por canal de aquisição (a safra de quem chegou por Google contra a de quem chegou por Meta), que depende de atribuição e tem os problemas próprios dela. E não cobre modelos preditivos de recompra, que só funcionam sobre uma base de pedidos com as três regras acima resolvidas.

Se a recompra da sua tabela de cohort muda de uma safra para outra sem mudança na operação, o primeiro passo é contar, por safra, quantos e-mails distintos existem para cada documento. [Veja a pergunta deste post respondida sobre um lake de verdade](https://precisian.io/demonstracao?utm_source=blog&utm_medium=cta&utm_campaign=analise-de-cohort-ecommerce&utm_content=texto), sem compromisso de contrato.
