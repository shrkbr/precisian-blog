---
title: "VTEX e GA4 não batem: as três definições de receita que ninguém alinhou"
description: "GA4 exclui frete e imposto da receita; VTEX e Shopify incluem. Três definições diferentes, documentadas, produzem três números."
slug: "vtex-ga4-nao-batem"
lang: "pt-BR"
translationKey: "ecommerce-revenue-mismatch"
publishedAt: 2026-09-24
tags: ["divergencia-de-dados", "ga4", "ecommerce"]
draft: false
llmSummary: "A receita do GA4 não bate com a da plataforma porque as definições diferem por documentação: o GA4 exclui frete e imposto do item revenue, a Shopify soma imposto, frete, duties e fees, e a VTEX inclui frete e imposto e mantém pedido cancelado na receita aprovada. A Adobe afirma que bater é exceção."
citations: ["https://support.google.com/analytics/answer/12924131", "https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/report-types/default-reports/sales-report", "https://help.vtex.com/pt/docs/tutorials/compreenda-o-valor-da-receita-aprovada", "https://experienceleague.adobe.com/en/docs/commerce-knowledge-base/kb/troubleshooting/miscellaneous/diagnosing-google-ecommerce-revenue-discrepancies", "https://portal.febraban.org.br/noticia/4112/pt-br", "https://support.google.com/analytics/answer/11161109"]
about: ["https://en.wikipedia.org/wiki/Google_Analytics", "https://precisian.io/datalake/"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

A receita do GA4 não bate com a da sua plataforma de e-commerce porque as duas medem coisas diferentes, de propósito, e nenhuma das duas está errada. A Adobe responde à pergunta de forma direta na própria documentação: se os dois números deveriam ser iguais, "a resposta é 'não' em quase todos os casos" ([Adobe Commerce, atualizado em 28/08/2026](https://experienceleague.adobe.com/en/docs/commerce-knowledge-base/kb/troubleshooting/miscellaneous/diagnosing-google-ecommerce-revenue-discrepancies)).

> **Divergência de receita**: diferença entre o valor reportado pelo analytics e o reportado pelo sistema de origem, produzida por definições distintas de receita, momentos distintos de reconhecimento e perdas distintas de coleta.

## As três definições dizem "receita" e contam coisas diferentes

Esta é a parte que quase nenhum material cobre, e é de onde vem a maior parte da diferença. Não é bug, é documentação.

| Sistema | O que a doc diz que é receita | Frete | Imposto |
|---|---|---|---|
| **GA4** | "The total revenue from items only, excluding tax and shipping. Item revenue = price x quantity" | fora | fora |
| **Shopify** | "gross sales − discounts − sales reversals + taxes + duties + shipping charges + fees" | dentro | dentro |
| **VTEX** | "todo pedido financeiramente aprovado tem seu valor total considerado como receita, incluindo o frete e imposto" | dentro | dentro |

As fontes são as próprias plataformas: [GA4](https://support.google.com/analytics/answer/12924131), [Shopify](https://help.shopify.com/en/manual/reports-and-analytics/shopify-reports/report-types/default-reports/sales-report) e [VTEX](https://help.vtex.com/pt/docs/tutorials/compreenda-o-valor-da-receita-aprovada).

Numa operação com frete médio de 8% e imposto embutido, isso sozinho produz dois números que divergem estruturalmente, todo mês, para sempre. Nenhuma correção de tag resolve, porque não há nada quebrado.

Há um detalhe da VTEX que costuma passar despercebido e move bastante: pedidos **cancelados e rejeitados por antifraude continuam contando** como receita aprovada. Quem compara o painel da VTEX com o GA4 está comparando um número que inclui fraude barrada contra outro que nunca a viu.

## O que acontece entre o clique e o pedido reconhecido?

O GA4 mede intenção no checkout. A plataforma mede estado final. Entre os dois há uma fila de eventos que mudam o valor depois que o `purchase` já disparou.

Cancelamento, devolução e recusa de antifraude são mudanças de estado posteriores à coleta, a Adobe classifica exatamente assim, como "cancelled, refunded, or frauded orders, which is a state change that happens after" o rastreamento ([Adobe](https://experienceleague.adobe.com/en/docs/commerce-knowledge-base/kb/troubleshooting/miscellaneous/diagnosing-google-ecommerce-revenue-discrepancies)).

E há uma assimetria contraintuitiva no GA4: a métrica Transactions **inclui eventos de reembolso**, não apenas de compra ([GA4](https://support.google.com/analytics/answer/13428834)). Quem conta transações no GA4 e compara com pedidos na plataforma está somando duas categorias diferentes.

## Quanto o Pix e o boleto deslocam esse número?

Bastante, e essa parte não existe fora do Brasil.

A VTEX documenta a regra de forma explícita: "PIX e Boleto: a marcação ocorre somente após a confirmação de pagamento" ([VTEX](https://help.vtex.com/pt/docs/tutorials/compreenda-o-valor-da-receita-aprovada)). O `purchase` do GA4, porém, dispara no checkout. Para cartão os dois momentos quase coincidem. Para boleto, não.

Quanto é "não coincide"? A FEBRABAN publicou a medição no primeiro mês do novo prazo de cobrança: entre 18/03 e 18/04/2024 houve 376 milhões de transações via boleto, movimentando R$ 540 bilhões, dos quais R$ 260 bilhões foram repassados em D+0, **52% das operações liquidam no mesmo dia** ([FEBRABAN, 10/05/2024](https://portal.febraban.org.br/noticia/4112/pt-br)).

Lido ao contrário: mesmo depois da mudança de prazo, perto de metade do boleto só confirma no dia útil seguinte. Numa operação com fatia relevante de boleto, o fechamento do mês pelo GA4 e o fechamento pela plataforma nunca cobrem o mesmo conjunto de pedidos, porque a virada do mês corta a fila no meio.

## O que o próprio GA4 faz com o dado depois de coletar?

Mais do que a maioria dos times imagina, e cada etapa muda o número.

**Processamento.** "Data processing can take 24-48 hours. During that time, data in your reports may change" ([GA4](https://support.google.com/analytics/answer/11198161)). Conferir hoje o fechamento de ontem é conferir um número ainda em movimento.

**Eventos atrasados.** O export para BigQuery atualiza as tabelas diárias "for up to three days after the dates of the events" ([GA4](https://support.google.com/analytics/answer/7029846)). Três dias, não um.

**Amostragem.** Acima de 10 milhões de eventos por consulta numa propriedade padrão, o relatório passa a ser estimado ([GA4](https://support.google.com/analytics/answer/13331292)). E a contagem de sessões usa HLL++, com precisão de "±1,63% para contagem de sessão" num intervalo de confiança de 95% ([Google for Developers, abr/2023](https://developers.google.com/analytics/blog/2023/bigquery-vs-ui)).

**Modelagem de consentimento.** Aqui está a armadilha mais cara. A modelagem comportamental exige "at least 1,000 events per day with `analytics_storage='denied'` for at least 7 days" e mil usuários diários com consentimento concedido em 7 dos 28 dias anteriores ([GA4](https://support.google.com/analytics/answer/11161109)). Abaixo desse volume não há modelagem: o dado simplesmente não aparece. E acima dele, a mesma fonte do Google avisa que "none of the modeled data is available in the BigQuery event export", o número da interface e o número do BigQuery divergem por construção.

**Coleta perdida antes de tudo isso.** A VTEX lista as causas na própria FAQ: bloqueio de JavaScript, ad blockers, data layer mal configurado, página de confirmação que falha ou duplica, e aplicativos de pagamento que concluem a compra sem redirecionar para a confirmação ([VTEX](https://help.vtex.com/en/docs/tutorials/google-analytics-faq)). A Shopify é igualmente direta: "Google can only count visitors with JavaScript and cookies activated" ([Shopify](https://help.shopify.com/en/manual/reports-and-analytics/discrepancies)).

E o navegador colabora contra. O WebKit bloqueia cookies de terceiros por padrão desde março de 2020 e apaga o armazenamento gravável por script "after seven days of Safari use without user interaction on the site" ([WebKit, 24/03/2020](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)). Sete dias sem retorno e o visitante recorrente vira visitante novo.

## E por que a ORIGEM do pedido também diverge?

Porque a divergência de receita tem uma irmã que quase ninguém separa dela, e a causa é outra.

A VTEX mantém uma página só para essa pergunta e a resposta é de modelo, não de coleta: os dois sistemas usam **modelos de atribuição diferentes**, o GA usa Last Interaction por padrão, os cookies são distintos, e o conceito de sessão da VTEX "is not a replica" do conceito do GA, ainda que ambos expirem com trinta minutos de inatividade ([VTEX](https://help.vtex.com/en/faq/why-is-the-origin-of-the-orders-different-on-vtex-and-on-google-analytics--frequentlyAskedQuestions_5030)).

Isso importa na prática porque muda quem recebe o crédito. Um pedido que o GA4 atribui a busca paga pode aparecer como orgânico na VTEX, sem que nenhum dos dois esteja errado: eles estão respondendo perguntas diferentes sobre a mesma venda. Se o time de mídia otimiza pelo GA4 e o time comercial fecha o mês pela VTEX, os dois estão certos e vão discordar todo mês.

Separar as duas divergências é o primeiro movimento de qualquer reconciliação. Diferença de **valor** vem de definição, reconhecimento e coleta. Diferença de **origem** vem de modelo de atribuição e de sessão. Tratar as duas como um problema só é o que faz a investigação não terminar nunca.

## Como fica a aritmética da reconciliação?

O formato que funciona é uma cascata, do número do analytics até o da plataforma, com cada linha nomeada e assinada por quem decidiu.

Comece pelo valor do GA4 no período. Some frete e imposto, que ele exclui por definição. Some os pedidos que nunca passaram pelo site. Subtraia cancelamento, devolução e recusa de antifraude, se o seu lado da comparação os mantiver. Ajuste a janela para o reconhecimento de boleto e Pix. O que sobrar de diferença depois dessas cinco linhas é o que realmente merece investigação técnica, e costuma ser uma fração pequena do susto inicial.

A utilidade da cascata não é chegar a zero. É transformar "os números não batem" numa lista de cinco decisões que alguém pode arbitrar, em vez de um mistério que volta toda segunda-feira.

## Como diagnosticar na sua operação esta semana?

Quatro passos, em ordem de esforço. Nenhum exige ferramenta nova.

**Escreva as três definições antes de olhar qualquer número.** Frete, imposto, desconto, cancelamento, devolução, antifraude: dentro ou fora, em cada sistema. A maior parte da diferença costuma aparecer aqui, antes de qualquer investigação técnica.

**Separe por meio de pagamento.** Compare cartão contra cartão. Se a divergência do cartão for pequena e a do boleto for grande, o problema é momento de reconhecimento, não coleta.

**Compare a mesma janela com três dias de folga.** Fechar o mês no dia 1º mistura dado ainda em processamento com dado consolidado.

**Confira se você está acima do limiar de modelagem.** Se não estiver, a fatia sem consentimento não está sendo estimada, está ausente.

## Quando isso não tem conserto?

Quando o pedido nunca passou pelo site.

Televendas, representante, loja física e marketplace produzem receita que a plataforma conhece e o GA4 nunca viu, porque não houve navegador. Nenhuma correção de tag alcança esse pedido: ele não é um evento perdido, é um evento que nunca existiu. A única saída é reconciliar na camada de dados, não na de analytics.

O mesmo vale para a janela de atribuição. O GA4 usa 30 dias para eventos de aquisição e 90 dias para os demais, e mudar a janela "vale só daqui pra frente" ([GA4](https://support.google.com/analytics/answer/10597962)). Histórico não se recalcula.

Reconciliar isso significa trazer as fontes para um lugar onde as definições sejam escritas uma vez e lidas por todos os sistemas, que é o trabalho da [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/) sobre um [data lake isolado por cliente](https://precisian.io/datalake/). Sem isso, cada relatório reimplementa a regra e a diferença volta no mês seguinte.

## O que este artigo não cobre?

Não dá uma magnitude típica de divergência, e isso é deliberado. Procurei em Google, Adobe, Shopify e VTEX: **nenhuma publica um percentual esperado**, e a Adobe, que chega mais perto, recusa-se explicitamente a dar um. As faixas do tipo "de cinco a dez por cento é normal" que circulam vêm de material sem dado próprio. Este artigo não repete nenhuma.

Também não cobre implementação de server-side, nem o caso específico de marketplace, que tem uma causa própria: a plataforma do marketplace não devolve origem de venda em nenhum campo de API.

Se seus dois painéis divergem e ninguém sabe qual está certo, comece escrevendo as três definições de receita antes de abrir qualquer ferramenta. [Agende uma conversa sobre o seu caso](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).
