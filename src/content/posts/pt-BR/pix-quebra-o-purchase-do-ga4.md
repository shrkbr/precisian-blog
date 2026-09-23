---
title: "O Pix quebra o evento de compra do GA4, e o problema não é lentidão"
description: "O Pix liquida em até 40 segundos, mas a cobrança pode viver 30 dias. O GA4 só aceita retroagir evento em 72 horas."
slug: "pix-quebra-o-purchase-do-ga4"
lang: "pt-BR"
translationKey: "pix-breaks-ga4-purchase"
publishedAt: 2026-10-08
tags: ["pix", "ga4", "divergencia-de-dados"]
draft: false
llmSummary: "O GA4 dispara o evento de compra no carregamento da página de confirmação, não na confirmação do pagamento. Uma cobrança Pix pode ser configurada para até 30 dias, enquanto o Measurement Protocol do GA4 só aceita retroagir evento em 72 horas. Dois limites documentados que não conversam."
citations: ["https://bacen.github.io/pix-api/", "https://developers.google.com/analytics/devguides/collection/ga4/set-up-ecommerce", "https://developers.google.com/analytics/devguides/collection/protocol/ga4/sending-events", "https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/payment-integration/pix", "https://help.vtex.com/pt/docs/tutorials/compreenda-o-valor-da-receita-aprovada", "https://docs.stripe.com/payments/pix/accept-a-payment.md"]
about: ["https://pt.wikipedia.org/wiki/Pix", "https://precisian.io/datalake/"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

O Pix liquida em no máximo 40 segundos, limite que o Banco Central impõe no [Manual de Tempos do Pix](https://www.bcb.gov.br/estabilidadefinanceira/pix), e transações que passam dele são rejeitadas. O que quebra a receita do GA4 não é a liquidação: é a **cobrança**, que nasce ativa e pode ficar assim por horas ou dias antes de alguém pagar. O GA4 dispara o evento de compra no carregamento da página de confirmação, não na chegada do dinheiro.

> **Cobrança Pix (`cob`)**: objeto criado antes do pagamento, que nasce com status `ATIVA` e só vira `CONCLUIDA` quando a liquidação acontece. A notificação ao lojista é assíncrona, por webhook.

## O Pix é rápido. Então por que o número fica errado?

Porque velocidade de liquidação e momento de pagamento são coisas diferentes, e só a primeira é rápida.

O [Manual de Tempos do Pix](https://www.bcb.gov.br/estabilidadefinanceira/pix), versão 7.0, estabelece que o limite máximo para uma ordem enviada ao canal primário do SPI é de **40 segundos**, e que "transações que não forem liquidadas dentro desse limite de tempo serão rejeitadas". Os acordos de nível de serviço são ainda mais apertados em etapas específicas: a autorização pelo PSP do recebedor tem alvo de 1,4 segundo na mediana e 2,3 segundos no percentil 95.

Nada disso ajuda, porque o relógio que importa começa antes. A especificação oficial da API Pix define o campo `calendario.expiracao` como "tempo de expiração da cobrança, representado em segundos a partir da data de criação", com **valor padrão de 3600**, uma hora ([Banco Central](https://bacen.github.io/pix-api/)). Durante essa hora, o QR Code existe, o pedido existe, e o dinheiro não.

E a confirmação chega por webhook, sobre o qual a mesma especificação diz: "cada PSP estabelece seu próprio SLA para execução do callback". Não há garantia de latência definida pelo Banco Central nessa etapa.

## Quanto tempo a receita fica indefinida?

Depende de quem processa o seu pagamento, e a variação é enorme.

| Origem | Expiração da cobrança |
|---|---|
| Especificação do Banco Central | **3.600 s** (1 hora), padrão |
| Stripe | padrão **4 horas**; configurável de 10 s a **3 dias** |
| Mercado Pago | padrão **24 horas**; configurável de 30 minutos a **30 dias** |
| Nuvem Pago | de 15 minutos a **48 horas** |

Fontes: [Banco Central](https://bacen.github.io/pix-api/), [Stripe](https://docs.stripe.com/payments/pix/accept-a-payment.md), [Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/payment-integration/pix) e [Nuvemshop](https://atendimento.nuvemshop.com.br/pt_BR/formas-de-pagamento-e-parcelamento/qual-o-prazo-de-vencimento-do-boleto-e-pix-no-nuvem-pago).

Não existe "o padrão do Pix". Existe o padrão do seu provedor, e quase ninguém sabe qual é o dele. Essa janela é a largura da sua incerteza de receita, e ela foi configurada uma vez, provavelmente por outra pessoa.

## O que o GA4 documenta sobre pedido não pago?

Nada. E verifiquei isso em três páginas oficiais antes de afirmar.

A orientação do Google é colocar o evento de compra "na página do seu site onde alguém faz uma compra. Por exemplo, você poderia adicionar o evento na página de confirmação que aparece quando alguém faz uma compra", disparando "quando a página carrega" ([Google](https://developers.google.com/analytics/devguides/collection/ga4/set-up-ecommerce)).

O modelo documentado é: **página de confirmação igual a compra**. O gatilho é o carregamento da página, não o dinheiro.

Em nenhuma das páginas oficiais de e-commerce do GA4 há orientação sobre pedido pendente, pagamento não confirmado, confirmação assíncrona ou pedido cancelado antes do pagamento. Não é que a recomendação seja ruim, é que a situação não está prevista. O modelo foi desenhado para cartão, onde autorização e confirmação praticamente coincidem.

## Por que 72 horas é um teto absoluto?

Porque é o limite documentado para registrar um evento com data retroativa, e ele fecha o argumento.

A documentação do Measurement Protocol é explícita: "events and user properties can be backdated up to 72 hours". Com a validação padrão, o protocolo aceita o evento mas **sobrescreve o timestamp para 72 horas atrás**; com validação estrita, rejeita ([Google](https://developers.google.com/analytics/devguides/collection/protocol/ga4/sending-events)).

Agora junte com a tabela acima. O Mercado Pago permite configurar uma cobrança Pix válida por até **30 dias**. O GA4 aceita retroagir **72 horas**.

Qualquer Pix pago depois de três dias é, por construção da ferramenta, impossível de registrar no GA4 no momento correto. Não é falha de implementação nem de fornecedor: são dois limites documentados que não conversam. E quem envia o evento assim mesmo não recebe erro, recebe o evento carimbado com a data errada.

## Como a plataforma resolve, e o analytics não?

Rodando dois relógios em vez de um.

A VTEX documenta a diferença de forma direta: para cartão, o pedido é aprovado "quando a adquirente valida o saldo e os dados do cartão"; para Pix e boleto, "a marcação ocorre somente após a confirmação de pagamento" ([VTEX](https://help.vtex.com/pt/docs/tutorials/compreenda-o-valor-da-receita-aprovada)).

A plataforma sabe que existem dois regimes e trata cada um no seu tempo. O GA4 tem um gatilho só, e ele é o carregamento de uma página.

A Nuvemshop registra o outro lado do mesmo problema, no atendimento: quando o status não muda, "quer dizer que o pagamento ainda não foi confirmado", e sobre a notificação do intermediário, "isso nem sempre acontece em tempo real" ([Nuvemshop](https://atendimento.nuvemshop.com.br/pt_BR/status-dos-pedidos/o-status-da-minha-venda-nao-mudou-por-que)).

O resultado prático é o que todo diretor de e-commerce brasileiro já viu: o GA4 fecha o mês mais alto que a plataforma, e a diferença some quando alguém separa por meio de pagamento.

## Como saber se isso está acontecendo com você?

Três verificações, e a primeira responde quase tudo.

**Separe a receita por meio de pagamento, nos dois sistemas.** Compare cartão contra cartão e Pix contra Pix, na mesma janela. Se o cartão bate razoavelmente e o Pix diverge muito, você achou a causa sem precisar investigar mais nada. É o teste de maior retorno e leva o tempo de montar dois relatórios.

**Olhe o fechamento de mês por dia.** O descasamento se concentra na virada: pedidos gerados nos últimos dias do mês e pagos no mês seguinte aparecem em meses diferentes em cada sistema. Se a divergência é maior nos últimos dias do mês do que no meio, é temporal, não de coleta.

**Conte pedidos, não só valor.** Valor divergente pode ser definição de receita, frete, imposto, desconto. Contagem de pedidos divergente é mais específica: significa que os dois sistemas discordam sobre quais vendas existem, que é exatamente o sintoma de cobrança contada antes do pagamento.

Se as três apontarem para o Pix, a correção é de gatilho e não de tag: o evento precisa sair do navegador e passar a sair da confirmação.

## E o pedido que expira sem ser pago?

Esse é o lado que quase ninguém mede, e é o mais desconfortável.

Quando a cobrança expira, o dinheiro nunca entrou. Mas o evento de compra já foi disparado no carregamento da página de confirmação, horas ou dias antes. Do ponto de vista do GA4, aquela venda aconteceu.

A plataforma sabe que não aconteceu, porque o pedido nunca chegou a aprovado. O analytics não sabe, porque ninguém o avisou, e não existe, no modelo documentado, um evento de "a compra que eu registrei não se concretizou". Há o evento de reembolso, mas reembolso é outra coisa: pressupõe que o dinheiro entrou e voltou.

O resultado é uma inflação silenciosa e estrutural, proporcional à fatia de Pix da operação e à taxa de expiração, que, como veremos, ninguém publica.

## Como corrigir na sua operação?

Quatro movimentos, do mais barato ao mais estrutural.

**Descubra a sua janela de expiração.** É um campo de configuração no seu provedor. Saber se ela é de uma hora ou de trinta dias muda completamente o tamanho do problema, e a resposta leva cinco minutos.

**Pare de disparar compra no carregamento da página de confirmação para Pix.** Para cartão o padrão funciona. Para Pix, a página de confirmação aparece antes do pagamento, que é exatamente o descasamento.

**Dispare a partir do webhook de confirmação**, não do navegador. O evento deixa de ser client-side e passa a acompanhar o dinheiro, respeitando o teto de 72 horas, que agora você conhece.

**Reconcilie o que passar do teto na camada de dados.** Pix pago no quinto dia não tem conserto no GA4. Ele tem conserto no lugar onde o pedido e o pagamento repousam juntos, que é o mesmo trabalho que resolve [a divergência entre GA4 e plataforma](https://precisian.io/blog/pt-BR/posts/vtex-ga4-nao-batem/), um [lake isolado](https://precisian.io/datalake/) onde a definição de receita é escrita uma vez e lida por todos.

Nada disso é exclusividade de quem vende mal. Operações grandes e bem instrumentadas convivem com o mesmo descasamento, porque ele nasce de uma decisão de desenho tomada antes do Pix existir: o evento de compra marca a chegada numa página, e por quinze anos isso foi um bom proxy do dinheiro. Deixou de ser em 2020, no Brasil, e a documentação ainda não acompanhou.

## O que este artigo não cobre?

Não traz a taxa de Pix gerado e nunca pago, e não é por falta de procura.

O Banco Central publica chaves, usuários, transações por município, transações por finalidade e estatísticas de fraude. **Não publica cobranças geradas contra cobranças pagas, nem taxa de expiração.** Os provedores também não publicam agregado. Toda porcentagem que circula sobre abandono de Pix vem de fornecedor com interesse na resposta.

Vale registrar o que isso significa: nem o Banco Central sabe quantos Pix gerados nunca são pagos, e é exatamente esse conjunto que está dentro do seu relatório de receita do GA4, contado como venda.

Também não trago o recorte de Pix por finalidade de compra. O campo existe na base aberta do Banco Central, confirmei o schema, e as consultas à entidade devolveram erro de servidor em todas as variações que tentei. O dado existe e está publicado; eu não consegui extraí-lo, e prefiro dizer isso a estimar.

Se o seu GA4 fecha o mês acima da plataforma, separe por meio de pagamento antes de investigar qualquer outra coisa. [Agende uma conversa sobre o seu caso](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).
