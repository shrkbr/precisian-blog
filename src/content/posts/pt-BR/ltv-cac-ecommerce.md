---
title: "LTV/CAC no e-commerce: como calcular quando parte da venda é marketplace"
description: "LTV/CAC divide a margem que o cliente deixa pelo custo de trazê-lo. Com marketplace, a loja perde a recompra e a plataforma barateia o CAC."
slug: "ltv-cac-ecommerce"
lang: "pt-BR"
translationKey: "ltv-cac"
publishedAt: 2026-10-14
tags: ["ltv-cac", "marketplace", "ecommerce", "roas", "divergencia-de-dados"]
draft: false
llmSummary: "LTV/CAC é a margem acumulada por cliente dividida pelo custo de adquiri-lo. Com marketplace, o LTV da loja perde quem recompra no Mercado Livre ou na Amazon, cujo e-mail a Amazon documenta como anonimizado, e o CAC por conversão de plataforma sai baixo demais."
citations: ["https://developer-docs.amazon/sp-api/reference/getorders", "https://developer-docs.amazon/sp-api/docs/report-type-values-analytics", "https://support.google.com/google-ads/answer/3123169", "https://developers.facebook.com/docs/marketing-api/reference/ads-action-stats/", "https://support.google.com/analytics/answer/9670133", "https://www.forentrepreneurs.com/saas-metrics-2/"]
about: ["https://en.wikipedia.org/wiki/Customer_lifetime_value", "https://precisian.io/demonstracao"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

LTV/CAC é a razão entre a margem que um cliente deixa ao longo do relacionamento (LTV) e o custo de adquiri-lo (CAC). Quando parte da venda acontece no marketplace, as duas pontas se distorcem. A Amazon documenta o e-mail do comprador como *"anonimizado"* ([Amazon SP-API](https://developer-docs.amazon/sp-api/reference/getorders)), então quem recompra lá some do LTV da loja. E o CAC calculado com conversões de plataforma herda janelas de atribuição de até 90 dias no Google Ads ([Google](https://support.google.com/google-ads/answer/3123169)), que contam o mesmo cliente mais de uma vez.

> **LTV/CAC**: margem de contribuição acumulada por cliente de uma safra, num horizonte declarado, dividida pelo custo total de aquisição dessa safra. Sem horizonte e sem margem, o número não tem significado.

## Como calcular o LTV no e-commerce?

LTV (*lifetime value*) é quanto um cliente deixa de margem ao longo do tempo. Existem duas formas de calcular, e só uma delas mede.

**A fórmula de manual.** Ticket médio × compras por ano × anos de vida do cliente × margem de contribuição. O problema é o terceiro fator: "anos de vida" é uma estimativa de churn, e no varejo não há cancelamento de assinatura para marcar o fim. O cliente para de comprar, e você só descobre meses depois.

**A conta por coorte.** Você pega todos os clientes que fizeram a primeira compra no mesmo mês (a safra), soma a margem que eles geraram mês a mês e divide pelo número de clientes da safra. O LTV de 12 meses da safra de janeiro é a margem acumulada até dezembro, por cliente. Não há estimativa de churn: o churn já está dentro do número observado.

Isso é análise de coorte. O Google Analytics define coorte como *"um grupo de usuários que compartilham uma característica comum"* e permite escolher o critério de entrada (primeira visita, primeira transação) e o de retorno ([Google Analytics](https://support.google.com/analytics/answer/9670133)). Para LTV, o critério de entrada certo é a primeira compra, e a fonte certa é o pedido faturado, não o evento do navegador.

Três decisões precisam estar escritas antes do primeiro cálculo:

- **Margem, não receita.** LTV em receita contra CAC em custo compara grandezas diferentes e infla a razão pelo inverso da margem.
- **Horizonte fixo.** LTV de um ano e LTV de três anos são métricas diferentes. Um número sem horizonte não se compara com nada.
- **O que é um cliente.** Conta, e-mail, CPF ou cartão produzem contagens diferentes das mesmas pessoas.

## Como calcular o CAC?

CAC (custo de aquisição de cliente) é o custo total de aquisição de um período dividido pelo número de clientes **novos** do mesmo período.

As duas metades têm armadilha.

**O numerador** inclui toda a mídia de aquisição, mas também o que a mídia não mostra: cupom de primeira compra, frete subsidiado para cliente novo, honorário de agência, ferramenta. Quem usa só o gasto em mídia calcula um CAC de mídia, que é uma métrica legítima com outro nome.

**O denominador** é o número de CPFs (ou contas) que compraram pela primeira vez, contado na sua base de pedidos. Não é a soma das conversões que o Google Ads, a Meta e o TikTok reportam. Trocar uma coisa pela outra produz o CAC baixo demais da próxima seção.

## O que a razão LTV/CAC mede, e o que ela não mede?

Ela responde: cada real gasto para trazer um cliente volta, em margem, quantas vezes dentro do horizonte escolhido?

| Métrica | Fórmula | De onde vem o dado | O que ignora |
|---|---|---|---|
| LTV/CAC | Margem acumulada por cliente ÷ custo de aquisição por cliente novo | Pedidos faturados + custo total de aquisição | O tempo até o retorno |
| ROAS | Receita atribuída ÷ gasto em mídia | Relatório de cada plataforma | Margem, recompra e sobreposição entre plataformas |
| Payback do CAC | Meses até a margem acumulada da safra igualar o CAC | Coorte de pedidos | O que acontece depois do payback |
| CAC de mídia | Gasto em mídia ÷ clientes novos | Plataformas + base de pedidos | Cupom, frete subsidiado, agência |

LTV/CAC não é ROAS de longo prazo. O ROAS olha receita de uma janela curta, atribuída pela própria plataforma que vendeu o anúncio. O LTV/CAC olha margem de um horizonte longo, medida na sua base. Por isso a [soma de ROAS das plataformas passa do faturamento](https://precisian.io/blog/pt-BR/posts/roas-soma-maior-que-faturamento/) e a razão LTV/CAC, calculada direito, não tem como passar.

## Qual é a razão LTV/CAC ideal?

A referência que circula é "três para um". Ela vem do SaaS. David Skok escreveu que *"os melhores negócios de SaaS têm uma razão LTV/CAC acima de 3, às vezes de 7 ou 8"* ([Skok, For Entrepreneurs](https://www.forentrepreneurs.com/saas-metrics-2/)). A página não traz data de publicação original, e o próprio texto chama esses números de diretrizes que podem ser quebradas.

O três não se transfere para o varejo sem ajuste, por dois motivos.

**Margem.** Software tem margem bruta alta e quase nenhum custo variável por cliente. No e-commerce, frete, comissão de meio de pagamento e devolução comem a margem de cada pedido. A mesma razão significa coisas diferentes quando a margem por pedido é alta ou estreita.

**Ciclo de recompra.** Cosmético e suplemento recompram em semanas; colchão e eletrodoméstico, em anos. A razão de 12 meses de uma marca de colchão vai ser baixa mesmo que o negócio seja ótimo, porque a segunda compra cai fora do horizonte.

O que decide é o **payback**: em quantos meses a margem acumulada da safra paga o CAC, comparado com quanto tempo o seu caixa aguenta financiar esse intervalo. Skok, no mesmo texto, trata a recuperação do CAC acima de 12 meses como sinal de rentabilidade fraca para SaaS ([Skok](https://www.forentrepreneurs.com/saas-metrics-2/)). Para o seu e-commerce, a meta sai da sua margem e do seu ciclo, não de um múltiplo emprestado.

## Por que o marketplace distorce o LTV?

Porque o cliente que você adquiriu na loja própria pode voltar a comprar no Mercado Livre, na Shopee ou na Amazon, e essa recompra não chega à sua base com uma chave que identifique a mesma pessoa.

A Amazon devolve o e-mail do comprador como *"o endereço de e-mail anonimizado do comprador"* e não traz campo de identificador de cliente no pedido ([Amazon SP-API](https://developer-docs.amazon/sp-api/reference/getorders)). Sem chave comum, não há como juntar o pedido do marketplace ao histórico do cliente da loja. Os detalhes por canal estão em [deduplicar venda entre site e marketplace](https://precisian.io/blog/pt-BR/posts/deduplicar-venda-site-marketplace/).

O que existe é dado agregado. A SP-API documenta um relatório de recompra (*Repeat Purchase*) com pedidos, clientes únicos e percentual de clientes recorrentes por produto, por semana, mês ou trimestre, para marcas inscritas no Brand Registry ([Amazon SP-API](https://developer-docs.amazon/sp-api/docs/report-type-values-analytics)). *Não confirmei a disponibilidade desse relatório na Amazon Brasil: a central de ajuda brasileira cita "Brand Analytics" entre os benefícios do Brand Registry, mas não lista os relatórios.* Mesmo onde existe, ele diz quantos recompraram, nunca quem.

Por isso o LTV calculado só com a loja própria **subestima** o cliente multicanal. O tamanho do erro depende de quanto da sua recompra migra para o marketplace, e esse é justamente o número que nenhuma API devolve, pelo motivo descrito em [marketplace é um buraco negro de dados](https://precisian.io/blog/pt-BR/posts/marketplace-buraco-negro-de-dados/).

## Por que o CAC calculado com dado de plataforma sai baixo demais?

Porque cada plataforma conta como conversão tudo o que aconteceu dentro da janela dela, e as janelas se sobrepõem.

O Google Ads aplica janela padrão de 30 dias após o clique para campanhas de pesquisa e display, configurável de 1 a 90 dias ([Google](https://support.google.com/google-ads/answer/3123169)). A Meta reporta conversões por janelas de 1, 7 e 28 dias após o clique e de 1 dia após a visualização, entre outras ([Meta Marketing API](https://developers.facebook.com/docs/marketing-api/reference/ads-action-stats/)). Um cliente que clicou no Google e viu um anúncio na Meta antes de comprar vira uma conversão em cada uma.

Além disso, conversão de plataforma não distingue cliente novo de recorrente por padrão. Quem já é cliente e volta pelo anúncio entra na conta. Gasto dividido pela soma das conversões das plataformas dá um denominador inflado, e o CAC sai menor do que o custo real de trazer um CPF novo.

Os dois erros apontam em direções opostas. LTV de loja própria puxa a razão para baixo; CAC de plataforma puxa para cima. A razão pode parecer saudável por acidente, e não há como saber qual dos dois erros está ganhando.

## Como fica a conta num exemplo?

Um exemplo **sintético**, com números redondos, de uma marca que vende na loja própria e no Mercado Livre. Nenhum número abaixo vem de cliente.

| Item | Valor sintético |
|---|---|
| Custo total de aquisição no trimestre | R$ 150.000 |
| Clientes novos na base de pedidos (CPF de primeira compra) | 1.000 |
| Conversões reportadas: Google Ads + Meta | 900 + 700 = 1.600 |
| Margem de 12 meses por cliente, só loja própria | R$ 300 |
| Margem de 12 meses por cliente, recompra no Mercado Livre incluída (não observável por cliente) | R$ 390 |

| Como a razão foi calculada | CAC | LTV | LTV/CAC |
|---|---|---|---|
| Conversões de plataforma + LTV da loja | R$ 93,75 | R$ 300 | 3,2 |
| Clientes novos da base + LTV da loja | R$ 150 | R$ 300 | 2,0 |
| Clientes novos da base + LTV com marketplace | R$ 150 | R$ 390 | 2,6 |

A primeira linha passa no "três para um" e é a mais errada das três. A segunda é a única que se calcula com dado próprio, e é conservadora. A terceira é a verdade do exemplo, e na vida real não se observa cliente a cliente: só dá para estimar com o agregado do marketplace, declarando a premissa.

A recompra no marketplace também chega com margem menor, porque paga comissão do canal. Somar a receita dela ao LTV como se fosse venda da loja reintroduz o erro pelo outro lado.

## O que LTV/CAC não é?

Não é uma métrica de canal. Calcular LTV/CAC "do Google" ou "da Meta" exige atribuir o cliente a um canal de origem, e a origem não vem no pedido de marketplace. LTV/CAC é uma métrica de safra.

Não é previsão. A conta por coorte descreve o que a safra já fez. Projetar o LTV de três anos de uma safra com quatro meses de vida é modelagem, e merece esse rótulo no relatório.

E não é um número único da empresa. Ele muda por categoria, por cupom de entrada e por canal de aquisição dentro da loja própria.

## Quando isso passa a importar na sua operação?

No momento em que o marketplace deixa de ser canal de escoamento e vira lugar onde o seu cliente recorrente compra. A partir daí, o LTV da loja própria descreve só uma parte do relacionamento.

Para testar, compare a curva de recompra da loja própria entre safras antes e depois de entrar no marketplace. Se a recompra caiu sem que a margem total da marca caísse, o cliente continua comprando, só que no marketplace. A correção começa por escrever, num lugar que o analista e a IA leiam antes de calcular, o que conta como cliente novo, qual margem entra e qual horizonte vale. É a mesma disciplina de [ter uma só definição de receita](https://precisian.io/blog/pt-BR/posts/mesma-definicao-de-receita/).

Na Precisian, pedidos da loja, pedidos de marketplace e gasto de mídia ficam no mesmo [data lake isolado por cliente](https://precisian.io/demonstracao), com essas definições registradas na camada semântica e acessíveis por MCP, API ou pelo BI do próprio cliente.

## O que este artigo não cobre?

Não traz LTV/CAC médio do e-commerce brasileiro. Procurei pesquisa com metodologia declarada e não encontrei; o que circula vem de fornecedor de software, sem amostra publicada.

Não descreve campos da API do Mercado Livre nem da Shopee. A documentação dos dois não se deixou ler por acesso automatizado, e o motivo está registrado em [deduplicar venda entre site e marketplace](https://precisian.io/blog/pt-BR/posts/deduplicar-venda-site-marketplace/).

E não trata de LTV preditivo com modelo estatístico. É assunto legítimo, mas depende de uma base de pedidos limpa, que é o que este texto descreve.

Se o seu LTV/CAC parece saudável e o caixa não confirma, o primeiro passo é recalcular o CAC com clientes novos da sua base de pedidos, e não com conversões de plataforma. [Veja como o data lake da Precisian junta pedido, marketplace e mídia](https://precisian.io/demonstracao), sem compromisso de contrato, mas sem promessa de resposta em 30 minutos também.
