---
title: "CDP ou data lake: o que o e-commerce precisa primeiro"
description: "CDP mantém um registro unificado do cliente, acessível a outros sistemas, para ativar. Data lake guarda todas as fontes para análise. Qual vem primeiro?"
slug: "cdp-ou-data-lake"
lang: "pt-BR"
translationKey: "cdp-vs-lake"
publishedAt: 2026-10-14
tags: ["data-lake", "build-vs-buy", "ecommerce", "camada-semantica", "lgpd", "custo"]
draft: false
llmSummary: "O CDP Institute define CDP, na versão de 2026, como software que cria e mantém um registro unificado e persistente do cliente, acessível a outros sistemas. Data lake guarda o dado bruto de todas as fontes para análise. CDP serve para ativar; data lake, para entender."
citations: ["https://www.cdpinstitute.org/learning-center/what-is-a-cdp/", "https://www.twilio.com/docs/segment/unify", "https://www.twilio.com/docs/segment/engage/audiences/", "https://www.twilio.com/en-us/pricing/customer-data", "https://hightouch.com/docs/identity-resolution/overview", "https://hightouch.com/docs/syncs/schedule-sync-ui", "https://hightouch.com/pricing", "https://www.fivetran.com/press/fivetran-signs-agreement-to-acquire-census-delivering-the-first-end-to-end-data-movement-platform-for-the-ai-era", "https://www.rdstation.com/produtos/marketing/"]
about: ["https://en.wikipedia.org/wiki/Customer_data_platform", "https://en.wikipedia.org/wiki/Data_lake", "https://precisian.io/precos"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

CDP (customer data platform) é, pela definição de 2026 do CDP Institute, "software que cria e mantém um registro unificado e persistente do cliente, acessível a outros sistemas" (tradução livre, como as demais citações deste texto; [CDP Institute](https://www.cdpinstitute.org/learning-center/what-is-a-cdp/), consultado em 14/10/2026). Data lake guarda o dado bruto de todas as fontes para análise. CDP serve para **ativar** o cliente; data lake serve para **entender** a operação.

> **CDP (customer data platform)**: software que junta os dados de um mesmo cliente vindos de várias fontes num perfil único e persistente, e entrega esse perfil a outros sistemas, normalmente ferramentas de e-mail, mídia e atendimento.
> **Data lake**: repositório que recebe o dado como a fonte entrega, de todas as fontes, sem esquema imposto na escrita, para análise posterior.

O CDP Institute lista o que um produto precisa fazer para merecer o nome: ingerir dado de qualquer fonte, capturar o detalhe completo, construir perfis unificados e persistentes e disponibilizar esse dado a qualquer outro sistema ([CDP Institute](https://www.cdpinstitute.org/learning-center/what-is-a-cdp/)). O sujeito de tudo isso é o **cliente**. O sujeito de um data lake é a **operação**: pedido, gasto de mídia, devolução, frete, estoque. Essa diferença decide a compra.

## Quais critérios decidem entre CDP e data lake?

Declaro os critérios antes da comparação, para você poder discordar deles.

1. **Ativação × análise.** A pergunta que você precisa responder amanhã é "para quem eu mando esta mensagem agora?" ou "quanto essa campanha vendeu de verdade?".
2. **Resolução de identidade.** Precisa juntar o mesmo cliente que comprou no site, no app e no WhatsApp num perfil só, para agir sobre ele?
3. **Custo por perfil e por volume.** O Segment, CDP de referência, cobra pelos usuários acompanhados no mês; lake cobra por armazenamento, consulta e conectores.
4. **Quem opera.** Time de CRM e marketing, ou time de dados.
5. **Onde o dado vive.** Na infraestrutura do fornecedor de CDP, no seu warehouse, ou numa plataforma gerenciada isolada.

Deixo de fora, de propósito, a qualidade da interface de montagem de jornada. Importa, mas é critério de escolha **entre** CDPs, não entre CDP e lake.

## O que um CDP faz que um data lake não faz?

Ele mantém o perfil vivo e o empurra para fora.

A documentação do Segment, CDP da Twilio, descreve o Unify como regras de resolução de identidade que pegam eventos de vários dispositivos e canais e os juntam em "perfis completos no nível de usuário ou de conta", com identidades unificadas "em tempo real" ([Twilio Segment](https://www.twilio.com/docs/segment/unify), consultado em 14/10/2026). E as audiências do Engage são calculadas em tempo real por padrão: "por padrão, o Segment cria todas as audiências como computações em tempo real", atualizando traços e audiências conforme os eventos chegam ([Twilio Segment](https://www.twilio.com/docs/segment/engage/audiences/)).

Um data lake não faz esse trabalho. Ele guarda o evento "abandonou carrinho às 14h02"; ele não decide, às 14h03, mandar o e-mail. Para isso existe uma camada de ativação, que pode ser um CDP ou uma ferramenta de automação de marketing.

Ativação não exige CDP. A página oficial do RD Station Marketing descreve automação de jornadas por e-mail, WhatsApp e SMS, lead scoring e lead tracking, e não usa o termo CDP; o plano Basic começa em R$ 309 por mês e o Pro em R$ 1.121 por mês ([RD Station](https://www.rdstation.com/produtos/marketing/), consultado em 14/10/2026). Se a operação já tem essa camada, comprar um CDP por cima dela pode duplicar o perfil do cliente em dois lugares.

## O que um data lake faz que um CDP não faz?

Ele guarda o que não é cliente.

Gasto de mídia por campanha, custo de frete, comissão de marketplace, devolução, estoque, a exportação do GA4 e o pedido faturado do ERP. Nada disso pertence a um perfil de pessoa, e é justamente o que responde "quanto essa campanha vendeu de verdade". Um CDP é desenhado em volta do cliente; ele pode receber o pedido como evento, mas não é onde você reconcilia o ROAS da Meta com o faturamento do ERP.

Também guarda **histórico**. A comparação entre lake, warehouse e lakehouse, e a ordem em que um e-commerce precisa deles, está em [data lake ou data warehouse](https://precisian.io/blog/pt-BR/posts/data-lake-ou-data-warehouse/). O ponto aqui é mais estreito. Nem o lake nem o CDP definem o que é receita. Isso é trabalho da [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/), e é ela que impede que o CDP e o lake respondam números diferentes para a mesma pergunta.

## E o CDP composable, montado sobre o warehouse?

Ele fica no meio do caminho entre os dois.

No CDP composable, o perfil não mora no fornecedor de CDP: mora no seu warehouse, e uma ferramenta de **reverse ETL** lê dali e envia para as ferramentas de marketing. A Hightouch, fornecedora do modelo, documenta que a resolução de identidade determinística roda "diretamente no seu data warehouse" e grava tabelas de identidade resolvida e de *golden record* (um registro por pessoa) lá dentro ([Hightouch](https://hightouch.com/docs/identity-resolution/overview), consultado em 14/10/2026). A Census, outra fornecedora do modelo, teve a compra anunciada pela Fivetran em 1º de maio de 2025, descrita no comunicado como "líder em Reverse ETL, ativação de dados e analytics operacional" ([Fivetran](https://www.fivetran.com/press/fivetran-signs-agreement-to-acquire-census-delivering-the-first-end-to-end-data-movement-platform-for-the-ai-era)).

Duas consequências práticas. Primeiro, o composable **pressupõe** um warehouse modelado: sem ele, não há de onde ler. Segundo, a ativação é por sincronização agendada; a Hightouch documenta agendamento por intervalo, cron ou gatilho de orquestrador, com um minuto como menor intervalo de cron ([Hightouch](https://hightouch.com/docs/syncs/schedule-sync-ui)). Para "mandar a lista de compradores recorrentes para a Meta toda manhã", resolve. Para "disparar o e-mail no minuto em que o carrinho foi abandonado", o evento em tempo real do CDP empacotado é outra categoria.

## Como as opções se comparam, critério a critério?

<table>
<thead>
<tr><th>Critério</th><th>CDP empacotado (ex.: Segment)</th><th>CDP composable (ex.: Hightouch)</th><th>Data lake gerenciado (Precisian)</th></tr>
</thead>
<tbody>
<tr><td>Serve para</td><td>Ativação: audiência, jornada, disparo</td><td>Ativação a partir do warehouse</td><td>Análise e consulta pela IA, BI ou automação do cliente</td></tr>
<tr><td>Resolução de identidade</td><td>No fornecedor, com perfis em tempo real</td><td>No seu warehouse</td><td>Cliente como entidade de análise na camada semântica; não serve perfil para disparo</td></tr>
<tr><td>Tempo de reação</td><td>Audiência em tempo real por padrão</td><td>Sincronização agendada (cron de até 1 minuto)</td><td>Não dispara nada</td></tr>
<tr><td>Dado que não é cliente (mídia, frete, devolução)</td><td>Fora do desenho</td><td>Depende do que está no warehouse</td><td>É o centro do desenho</td></tr>
<tr><td>Unidade de preço</td><td>Usuários acompanhados por mês (MTU), valor sob consulta</td><td>Por uso, sem limite de MTU; valor sob consulta</td><td>Publicado em precisian.io/precos</td></tr>
<tr><td>Quem opera</td><td>Time de CRM e marketing</td><td>Time de dados + marketing</td><td>Equipe da Precisian mantém; o time do cliente consulta</td></tr>
<tr><td>Onde o dado vive</td><td>Infraestrutura do fornecedor</td><td>Seu warehouse (com cópias de resultado de sincronização no fornecedor)</td><td>Lake isolado por cliente, na infraestrutura da Precisian</td></tr>
</tbody>
</table>

Fontes da tabela: o Segment cobra pelos usuários acompanhados no mês sem publicar a tarifa, com os dois planos em "fale com vendas" ([Twilio](https://www.twilio.com/en-us/pricing/customer-data), consultado em 14/10/2026). A Hightouch declara preço "por uso", "sem limite de MTU", com os planos pagos em "agende uma demo" ([Hightouch](https://hightouch.com/pricing), consultado em 14/10/2026). Os dois lados de CDP documentam o modelo e não publicam a tarifa, o mesmo padrão que aparece em [construir ou contratar um data lake](https://precisian.io/blog/pt-BR/posts/construir-ou-contratar-data-lake/).

Perfil unificado de cliente é dado pessoal, e um CDP empacotado o mantém na infraestrutura do fornecedor. Antes de assinar, pergunte em que país esse perfil fica e quem responde como operador; o raciocínio está em [LGPD e IA: onde o dado do seu cliente pode viver](https://precisian.io/blog/pt-BR/posts/lgpd-ia-dados-de-cliente/).

## Quando **não** escolher a Precisian?

Quando o que você precisa é ativação em tempo real.

Se a dor é jornada disparada por evento (carrinho abandonado, boas-vindas, recompra no dia certo), e-mail ou WhatsApp que sai no minuto do comportamento, ou audiência de anúncio atualizada conforme o cliente navega, você precisa de um CDP ou de uma ferramenta de automação de marketing. **A Precisian não ativa campanha.** Ela não monta jornada, não dispara mensagem e não envia audiência para a Meta. A entrega termina na camada semântica; quem age é a IA, o BI ou a automação do próprio cliente.

Também não é a escolha certa quando a operação tem uma fonte só e a automação de marketing já cobre o que se precisa saber. Lake para uma loja com uma plataforma e um meio de pagamento é resolver dor que não existe.

## O que recomendar, por perfil?

**Loja com uma plataforma, CRM de e-mail e pouca mídia:** nem CDP nem lake. A automação de marketing que você já tem é a camada de ativação, e o relatório nativo basta até doer.

**Operação cuja dor é reação ao comportamento do cliente:** CDP empacotado, ou a automação de marketing que já está na casa se ela cobrir os eventos que importam. O critério decisivo é o tempo de reação.

**Operação com time de dados e warehouse já modelado:** CDP composable faz sentido, porque reaproveita o que existe e mantém o perfil perto do resto do dado.

**Operação com várias fontes, várias plataformas de mídia e a pergunta "quanto vendeu de verdade" sem resposta:** o problema é de análise, não de ativação. Comece pelo lake com camada semântica; CDP sem número confiável por trás só dispara mais rápido em cima de uma conta que não fecha.

**Operação que precisa das duas coisas:** CDP e lake convivem. O RD Station, por exemplo, é uma das fontes que a Precisian ingere; a automação continua disparando, e o lake guarda o que ela fez junto com mídia, pedido e devolução.

## O que este artigo não cobre?

Não traz preço de CDP empacotado nem composable: nem a [Twilio](https://www.twilio.com/en-us/pricing/customer-data) nem a [Hightouch](https://hightouch.com/pricing) publicam a tarifa nas páginas oficiais consultadas para este texto, e não reproduzo cifra que não consegui abrir na fonte. Também não compara CDPs entre si (Salesforce, Adobe, Bloomreach e outros), nem discute resolução de identidade probabilística, que a própria Hightouch documenta com parte do processamento fora do warehouse.

---

Se a pergunta na sua operação é "quanto essa campanha vendeu de verdade", e não "para quem eu mando a próxima mensagem", o primeiro passo é medir a distância entre o que as plataformas declaram e o que o ERP faturou. O que a Precisian inclui para fazer essa conta, e como cobra, está em [preços](https://precisian.io/precos).
