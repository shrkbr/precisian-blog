---
title: "Análise RFM no e-commerce: como calcular (e por que o resultado muda conforme a fonte)"
description: "RFM pontua cliente por recência, frequência e valor. A conta é simples; quem é o cliente, que pedido conta e qual valor entra mudam o quintil."
slug: "analise-rfm-ecommerce"
lang: "pt-BR"
translationKey: "analise-rfm-ecommerce"
publishedAt: 2026-11-16
tags: ["ecommerce", "divergencia-de-dados", "camada-semantica", "marketplace"]
draft: false
llmSummary: "Análise RFM pontua cada cliente por recência, frequência e valor. No estudo de Fader, Hardie e Lee (2005), 12.054 de 23.570 clientes não recompraram em 78 semanas, o que impede quintil de frequência; e a VTEX mascara o e-mail do pedido por padrão."
citations: ["https://www.brucehardie.com/papers/rfm_clv_2005-02-16.pdf", "https://shopify.dev/docs/api/admin-graphql/latest/enums/CustomerRfmGroup", "https://shopify.dev/changelog/customer-rfm-group-now-available-in-graphql-admin-api", "https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/numbering_functions", "https://pandas.pydata.org/docs/reference/api/pandas.qcut.html", "https://help.vtex.com/pt/docs/tutorials/conversation-tracker", "https://github.com/vtex/openapi-schemas", "https://support.google.com/analytics/answer/9670133", "https://developer-docs.amazon/sp-api/reference/getorders", "https://developers.mercadolivre.com.br/pt_br/faturamento-billing-info"]
about: ["https://en.wikipedia.org/wiki/RFM_(market_research)", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
cta: regua
---
Análise RFM dá a cada cliente uma nota de recência (quando comprou pela última vez), frequência (quantas vezes comprou) e valor monetário (quanto gastou), e agrupa a base pelas três notas. A conta é simples; o cadastro, não. No estudo de Fader, Hardie e Lee sobre a base da CDNOW, 12.054 dos 23.570 clientes de uma safra não fizeram nenhuma recompra em 78 semanas ([Fader, Hardie e Lee, *Journal of Marketing Research*, 2005](https://www.brucehardie.com/papers/rfm_clv_2005-02-16.pdf)). Com metade da base empatada em frequência, o quintil que sai depende de como a ferramenta desempata.

> **Análise RFM**: segmentação de clientes por três medidas do histórico de compra, calculadas numa data de referência: dias desde a última compra (R), número de compras no período (F) e valor gasto (M). Só tem significado com três escolhas declaradas: o que identifica um cliente, que pedido conta e qual valor entra.

## Qual é o sintoma de um RFM que não se sustenta?

O time de CRM roda a segmentação em outubro e de novo em novembro, sobre quase a mesma base, e um terço dos "campeões" mudou de grupo. Ou a ferramenta de e-mail conta muito mais clientes ativos do que o ERP conta CPFs com pedido faturado. Ou o cliente que compra todo mês no Mercado Livre aparece como "perdido" porque a última compra no site foi em março.

A fórmula de RFM cabe numa linha de SQL. O que muda o resultado são três decisões tomadas antes dela, e quase nunca estão escritas.

## Como se calcula a análise RFM, passo a passo?

1. **Escolha a data de referência** e a janela de histórico (por exemplo, os últimos dois anos até hoje).
2. **Para cada cliente, calcule três números**: R = dias entre a última compra e a data de referência; F = número de pedidos na janela; M = valor gasto na janela.
3. **Transforme cada número em nota**, normalmente de um a cinco, por quintil (cada nota com um quinto da base) ou por faixa fixa.
4. **Combine as notas em grupos** com nome: campeões, fiéis, em risco, perdidos.

O passo 3 tem variação desde a literatura. Fader, Hardie e Lee ordenam a lista e codificam por **tercil**, de 1 a 3, e definem M como *"valor médio por transação"*, não como gasto total ([Fader, Hardie e Lee, 2005](https://www.brucehardie.com/papers/rfm_clv_2005-02-16.pdf)). Muita ferramenta usa gasto total. As duas definições ordenam os mesmos clientes de forma diferente: quem compra uma vez um item caro ganha M alto na primeira e médio na segunda.

A Shopify calcula um grupo RFM pronto. Desde a versão `2025-04` da GraphQL Admin API, o campo `rfmGroup` devolve um dos 11 valores do enum `CustomerRfmGroup`, de `CHAMPIONS` a `PROSPECTS` ([Shopify, changelog de 01/04/2025](https://shopify.dev/changelog/customer-rfm-group-now-available-in-graphql-admin-api)). A documentação do enum, lida em 16/11/2026, descreve cada grupo em palavras e não publica a fórmula. Duas descrições são idênticas: `ACTIVE` e `NEEDS_ATTENTION` aparecem as duas como *"Customers with recent purchases, some orders, and moderate spend"* ([Shopify](https://shopify.dev/docs/api/admin-graphql/latest/enums/CustomerRfmGroup)). Quem compara o grupo da Shopify com o da própria planilha compara duas regras, e só uma delas está à vista.

## Por que o mesmo cliente muda de quintil conforme a fonte?

Por três mecanismos, nesta ordem de estrago.

**1. O identificador de cliente.** RFM agrupa pedidos por cliente. Se a chave falha, uma pessoa vira várias, e cada fragmento tem F baixo e R ruim. Na VTEX, o Conversation Tracker cria um alias para o e-mail do comprador, e a máscara **Complexa**, que vem por padrão em todas as lojas, gera um endereço não legível do tipo `ff2e6348a53a4d449af92be2a1011328@ct.vtex.com.br`, *"válido até o fim do fluxo do pedido"* ([VTEX](https://help.vtex.com/pt/docs/tutorials/conversation-tracker), lido em 16/11/2026). Quem conta cliente pelo e-mail que sai do pedido pode contar um cliente por pedido. O mesmo documento do pedido traz `clientProfileData.document` e `clientProfileData.userProfileId`, descrito como *"Customer user profile ID"* na especificação da Orders API ([`vtex/openapi-schemas`](https://github.com/vtex/openapi-schemas)). Essas são as chaves que agrupam.

No marketplace a chave falta de vez. A Amazon devolve o e-mail do comprador anonimizado ([Amazon SP-API](https://developer-docs.amazon/sp-api/reference/getorders)). O Mercado Livre identifica o comprador por `buyer.id`, um número interno, e o documento fiscal em `buyer.billing_info` pode vir nulo enquanto está em processamento ([Mercado Livre](https://developers.mercadolivre.com.br/pt_br/faturamento-billing-info)). O detalhe por canal está em [deduplicar venda entre site e marketplace](https://precisian.io/blog/pt-BR/posts/deduplicar-venda-site-marketplace/).

**2. O pedido que conta.** Pedido cancelado, pedido devolvido depois da nota e pedido de teste entram ou não em F e em M conforme o filtro. Na VTEX, devolução de pedido faturado não vira status `canceled`: vira uma segunda nota, do tipo `Input`, e quem filtra só por status mantém a venda devolvida no histórico, como descrevi em [API da VTEX: pedido, faturamento e cancelamento](https://precisian.io/blog/pt-BR/posts/api-da-vtex-dados-de-pedido/).

**3. O valor que entra.** Com ou sem frete, bruto ou líquido de desconto e devolução, captado ou faturado. É a mesma briga do [ticket médio](https://precisian.io/blog/pt-BR/posts/ticket-medio-ecommerce/), multiplicada por cliente.

## Como o empate em frequência quebra o quintil?

No varejo, a maior parte da base compra uma vez só. Na safra da CDNOW, 51% dos clientes (12.054 de 23.570) não recompraram em 78 semanas ([Fader, Hardie e Lee, 2005](https://www.brucehardie.com/papers/rfm_clv_2005-02-16.pdf)). Se mais de 40% da sua base tem F = 1, não existe corte de quintil que separe essas pessoas: o valor 1 ocupa sozinho as faixas de 20% e de 40%.

Cada ferramenta resolve o empate de um jeito, e nenhum é neutro:

- **`NTILE(5)` no BigQuery** distribui as linhas *"com base na ordenação das linhas"*, e o tamanho dos grupos *"pode diferir em no máximo 1"* ([BigQuery](https://docs.cloud.google.com/bigquery/docs/reference/standard-sql/numbering_functions), lido em 16/11/2026). Como o tamanho é o critério, dois clientes com F = 1 caem em notas diferentes, e qual cai onde depende da ordem em que as linhas chegaram.
- **`pandas.qcut`** dispara `ValueError` quando as bordas do quantil se repetem, a não ser que se passe `duplicates='drop'`, que apaga as bordas repetidas ([pandas](https://pandas.pydata.org/docs/reference/api/pandas.qcut.html)). A escala de cinco notas sai com menos notas, sem aviso no resultado.

O primeiro caso explica o "um terço dos campeões mudou de grupo" do início sem que nenhum cliente tenha comprado nada, porque basta a consulta trazer as linhas em outra ordem.

## Como fica a conta num exemplo?

Um exemplo **sintético**, com números redondos, de uma cliente que comprou quatro vezes neste ano. A data de referência do cálculo é a de publicação deste post. Nenhum número abaixo vem de cliente real.

| Compra | Data | Canal | Valor | Observação |
|---|---|---|---|---|
| 1 | 10/01 | Site | R$ 200 | Faturada |
| 2 | 15/04 | Mercado Livre | R$ 150 | Documento fiscal disponível |
| 3 | 20/08 | Site | R$ 300 | Devolvida depois da nota |
| 4 | 05/11 | Loja física | R$ 250 | CPF na nota |
| Referência | 16/11 | | | Data do cálculo |

| Regra usada | R (dias) | F | M (total) |
|---|---|---|---|
| Só site, por e-mail, valor bruto, devolução mantida | 88 | 2 | R$ 500 |
| Só site, devolução excluída | 310 | 1 | R$ 200 |
| Todos os canais por CPF, devolução excluída | 11 | 3 | R$ 600 |

A mesma pessoa é "cliente em risco" na segunda linha e "campeã" na terceira. A primeira linha, que é o padrão de muita integração, a coloca no meio, com uma compra que ela devolveu. Se o e-mail do site vier mascarado por pedido, nem a primeira linha acontece: as duas compras viram duas clientes com F = 1.

## Como diagnosticar o seu RFM?

Quatro conferências, todas rodáveis na base de pedidos:

| Verificação | Como rodar | O que indica problema |
|---|---|---|
| Chave de cliente | `COUNT(DISTINCT email)` contra `COUNT(DISTINCT document)` e `COUNT(DISTINCT userProfileId)` | E-mails distintos muito acima de documentos distintos |
| E-mail mascarado | Percentual de e-mails terminados em `@ct.vtex.com.br` | Qualquer valor acima de zero, se o e-mail é a chave |
| Empate em F | Percentual de clientes com F = 1 na janela | Acima de 40%, o quintil de F não tem como separar |
| Estabilidade | Rodar a segmentação duas vezes sobre os mesmos dados, com ordem de linha diferente | Cliente que muda de nota sem ter comprado |

Na quarta, se o grupo de alguém muda sem compra nova, o problema está no desempate.

## Como corrigir?

**Escreva as três decisões antes da fórmula.** Qual chave identifica o cliente (documento, `userProfileId`, e-mail normalizado), em que ordem de prioridade. Que pedido conta (faturado, menos devolução). Qual valor entra (líquido, com ou sem frete). É o mesmo trabalho de [ter uma só definição de receita](https://precisian.io/blog/pt-BR/posts/mesma-definicao-de-receita/), aplicado ao cliente.

**Troque quintil por faixa fixa em F.** Para frequência, faixa fixa (1, 2, 3, 4 a 5, 6 ou mais compras) é estável entre rodadas e legível pelo time. Para R e M, quintil funciona melhor, porque quase não há empate em dias e em reais. Se mantiver quintil, desempate por uma chave determinística, como o identificador do cliente.

**Use o tercil quando a base é pequena.** Com poucos milhares de clientes recorrentes, cinco notas por eixo dão 125 células, a maioria quase vazia. Fader, Hardie e Lee trabalharam com três notas por eixo e uma célula separada para quem nunca recomprou.

**Separe RFM de análise de coorte.** RFM descreve cada cliente numa data. A análise de coorte acompanha um grupo que entrou junto. O GA4 define coorte como *"um grupo de usuários que compartilham uma característica comum"* e aceita "Qualquer transação" como critério de entrada ([Google Analytics](https://support.google.com/analytics/answer/9670133), lido em 16/11/2026), mas o usuário do GA4 é o navegador ou o login, não o CPF do pedido faturado. Para recompra de verdade, a coorte sai da base de pedidos, como no cálculo de [LTV/CAC no e-commerce](https://precisian.io/blog/pt-BR/posts/ltv-cac-ecommerce/).

Na Precisian, os pedidos da loja e do ERP ficam num data lake isolado por cliente, na infraestrutura da Precisian, e as três decisões acima ficam registradas na camada semântica. O analista, o BI e o agente de IA do cliente leem a mesma regra pelo MCP, pela API ou pelo BI, e o RFM sai igual para os três.

## Quando o RFM **não** tem conserto?

**Quando a recompra acontece onde não há chave.** O cliente que volta pela Amazon chega com e-mail anonimizado. Sem documento fiscal, não há como ligar o pedido ao histórico da loja. O RFM da loja própria subestima esse cliente, e o tamanho do erro é justamente o número que nenhuma API devolve.

**Quando a loja física não pede CPF.** A compra existe no PDV e não existe para o cliente. Nenhuma regra recupera a chave que não foi coletada.

**Quando a categoria não tem frequência.** Colchão, eletrodoméstico e móvel recompram em anos. Numa janela de 24 meses, quase toda a base tem F = 1, e o RFM vira só R e M. Nesse caso, uma ordenação por recência e valor diz o mesmo com menos ruído.

**Quando o uso do CPF não tem finalidade declarada.** Cruzar canais pelo CPF é tratamento de dado pessoal, e a base legal precisa existir antes da junção, como discuti em [LGPD e IA sobre dado de cliente](https://precisian.io/blog/pt-BR/posts/lgpd-ia-dados-de-cliente/).

## O que este artigo não cobre?

Não traz percentual médio de clientes de compra única no e-commerce brasileiro. Procurei estudo com amostra e metodologia publicadas e não encontrei. O número de 51% acima vem de uma base americana de música de 1997 ([Fader, Hardie e Lee, 2005](https://www.brucehardie.com/papers/rfm_clv_2005-02-16.pdf)) e ilustra o mecanismo; não é referência de mercado.

Não descreve a fórmula interna do grupo RFM da Shopify, que a documentação da API não publica. E não trata de modelos preditivos de valor do cliente, como o Pareto/NBD do próprio estudo da CDNOW, que dependem de uma base de pedidos limpa, que é o assunto deste texto.

Se a sua segmentação RFM muda de uma rodada para a outra sem que ninguém tenha comprado nada, o primeiro passo é contar quantos e-mails distintos existem para cada documento na sua base de pedidos. [Veja a pergunta deste post respondida sobre um lake de verdade](https://precisian.io/demonstracao?utm_source=blog&utm_medium=cta&utm_campaign=analise-rfm-ecommerce&utm_content=texto), sem compromisso de contrato.
