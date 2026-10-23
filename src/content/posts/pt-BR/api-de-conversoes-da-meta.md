---
title: "API de Conversões da Meta: o que ela recupera e o que ela não conserta"
description: "A API de Conversões manda à Meta o evento que o seu servidor registrou. Sem event_id igual ao do Pixel em até 48 horas, a mesma compra conta duas vezes."
slug: "api-de-conversoes-da-meta"
lang: "pt-BR"
translationKey: "meta-capi"
publishedAt: 2026-10-23
tags: ["tracking", "atribuicao", "divergencia-de-dados", "ecommerce"]
draft: false
llmSummary: "A API de Conversões da Meta envia eventos do servidor sem passar pelo navegador. Segundo a documentação da Meta (consultada em 23/10/2026), Pixel e servidor só são deduplicados com event_id e event_name iguais em até 48 horas, e um lote com evento de mais de 7 dias é rejeitado inteiro."
citations: ["https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events/", "https://developers.facebook.com/docs/marketing-api/conversions-api", "https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/server-event", "https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters", "https://developers.facebook.com/docs/marketing-api/conversions-api/best-practices", "https://developers.facebook.com/docs/marketing-api/conversions-api/dataset-quality-api", "https://developers.facebook.com/docs/marketing-api/reference/ads-action-stats/"]
about: ["https://pt.wikipedia.org/wiki/Meta_Platforms", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 9
---

A API de Conversões da Meta envia à Meta o evento que o seu servidor registrou, sem depender do navegador do visitante. Com isso ela recupera parte do que o Pixel perde, e não faz mais que isso. A documentação da Meta para desenvolvedores (consultada em 23/10/2026) diz que um evento do Pixel e um do servidor só viram a mesma compra quando chegam com `event_id` e `event_name` iguais, em até 48 horas ([Meta](https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events/)). Fora dessa regra, a venda é contada duas vezes.

> **API de Conversões (CAPI)** é a conexão servidor a servidor pela qual o anunciante manda à Meta os eventos que o próprio sistema registrou. Segundo a Meta, esses eventos *"são vinculados a um ID de conjunto de dados e processados como eventos enviados pelo Pixel da Meta"* ([Meta](https://developers.facebook.com/docs/marketing-api/conversions-api)).

A API melhora o que entra na Meta. Não muda o que a Meta faz com isso depois.

## Como uma API de Conversões mal configurada aparece no relatório?

Em três formas, e a primeira costuma ser comemorada antes de ser investigada.

**As compras sobem na semana da implantação e o ERP não acompanha.** O Gerenciador de Anúncios passa a mostrar mais compras do que a loja aprovou. O mais provável é a deduplicação falhando, e o Pixel e o servidor contando o mesmo pedido.

**Nada muda.** A integração está ligada, o parceiro diz que está tudo certo, e o volume é o mesmo de antes. Em geral o servidor está mandando o mesmo evento que o Pixel já mandava, com pouco dado de cliente para a Meta casar com uma conta.

**A sincronização noturna falha de vez em quando, sem padrão aparente.** É a regra dos sete dias, explicada mais abaixo, e no Brasil ela tem nome: boleto pago tarde.

## O que a API de Conversões recupera, mecanicamente?

O evento que o navegador não entregou, desde que o seu servidor o tenha registrado.

O Pixel depende de um script rodar no navegador do visitante. Bloqueador, script que não carregou e aba fechada antes do disparo são perdas que acontecem antes de qualquer coisa chegar à Meta. O evento de servidor sai de outro lugar: do sistema que gravou o pedido. Se o pedido existe no seu banco, ele pode chegar à Meta mesmo que a página de confirmação nunca tenha carregado.

A Meta recomenda usar os dois juntos: *"Use a API de Conversões além do Pixel da Meta e compartilhe os mesmos eventos usando as duas ferramentas"* ([Meta, boas práticas](https://developers.facebook.com/docs/marketing-api/conversions-api/best-practices)). É essa redundância que cria o problema da contagem dupla, e é por isso que a deduplicação é o centro do assunto.

Quanto ela recupera, a Meta não diz em número fixo. A única medida oficial é uma métrica que a própria Meta calcula, a **Additional Conversions Reported (ACR)**, definida como a métrica que ajuda a entender *"quanto o seu negócio se beneficia de usar a API de Conversões junto com o Pixel da Meta"* ([Meta, Dataset Quality API](https://developers.facebook.com/docs/marketing-api/conversions-api/dataset-quality-api)). A mesma página traz, num exemplo de resposta, uma mediana de 30,1% para eventos PageView entre *"anunciantes semelhantes"*. É um exemplo de payload, não um benchmark, e eu não o uso como estimativa para nenhuma operação.

Para casar o evento com uma pessoa, o servidor manda dados de cliente. A documentação separa dois grupos ([Meta, parâmetros de cliente](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters)):

| Parâmetro | O que é | Hash |
|---|---|---|
| `em`, `ph`, `fn`, `ln`, `ct`, `st`, `zp`, `country` | E-mail, telefone, nome, cidade, estado, CEP, país | Obrigatório |
| `external_id` | Identificador seu, como ID de cliente | Recomendado |
| `client_ip_address`, `client_user_agent` | IP e navegador do visitante | Não aplicar |
| `fbc`, `fbp` | Cookies de clique e de navegador da Meta | Não aplicar |

Dois campos são exigidos em todo evento de site: o `client_user_agent` e o `event_source_url` ([Meta, evento de servidor](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/server-event)).

## Por que a mesma compra aparece duas vezes?

Porque a deduplicação tem três condições, e basta uma falhar.

A Meta decide se dois eventos são o mesmo *"com base no ID e no nome"*: o `eventID` do Pixel precisa ser igual ao `event_id` do servidor, e o nome do evento precisa ser igual nos dois. E os eventos *"só são deduplicados se forem recebidos em até 48 horas"* do primeiro com aquele ID ([Meta](https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events/)).

Os três jeitos mais comuns de quebrar isso:

1. **IDs gerados em lugares diferentes.** O Pixel inventa um número aleatório no navegador e o servidor manda o número do pedido. Os dois são únicos, e nunca são iguais.
2. **O evento chega fora das 48 horas.** O Pixel dispara `Purchase` quando o pedido é criado. O servidor dispara `Purchase` quando o pagamento é aprovado. Num boleto compensado três dias depois, os dois eventos ficam fora da janela e a Meta conta duas compras.
3. **Confiar no método alternativo.** A Meta aceita deduplicar por `fbp` ou `external_id`, mas esse método *"só funciona para deduplicar eventos enviados primeiro pelo navegador e depois pelo servidor"*, e não deduplica quando só existe uma fonte ([Meta](https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events/)).

A própria documentação do `event_id` indica o caminho: o campo é opcional, mas recomendado para deduplicação, e o número do pedido ou da transação é um bom identificador ([Meta, evento de servidor](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/server-event)).

## E a sincronização que falha sem motivo?

É a regra mais dura da API, e está na descrição do parâmetro `event_time`.

O `event_time` é o momento em que o evento aconteceu, em segundos Unix e no fuso GMT, e *"pode ser até 7 dias antes"* do envio. Se qualquer evento do lote passar disso, a Meta *"retorna um erro para a requisição inteira"* e não processa nenhum ([Meta, evento de servidor](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/server-event)).

Uma rotina que lê o ERP à noite e manda os pedidos aprovados naquele dia funciona até o dia em que um boleto emitido há oito dias é pago. Nesse dia o lote inteiro volta com erro, inclusive as compras de ontem. Se o `event_time` for a data de criação do pedido, o problema aparece. Se for a data de aprovação, não aparece, mas aí a compra no servidor fica longe da compra no Pixel e a deduplicação do item anterior quebra.

## Como diagnosticar a API de Conversões na sua operação?

Com cinco verificações. As quatro primeiras saem da Dataset Quality API da Meta, que devolve as métricas de qualidade do conjunto de dados, evento por evento.

| Verificação | Onde olhar | O que indica problema |
|---|---|---|
| Event Match Quality | `event_match_quality.composite_score` | Nota de 0 a 10, calculada em tempo real e só para eventos de site. A Meta não publica nota mínima: compare entre eventos e acompanhe a tendência |
| Cobertura de evento | `event_coverage` | Abaixo de 75%, o limiar que a Meta usa na própria resposta |
| Chave de deduplicação | `dedupe_key_feedback` | Percentual baixo de eventos de navegador e de servidor com `event_id` |
| Atraso | `event_delay` | Percentual de eventos com mais de 2 horas e mais de 24 horas de atraso |
| Compras contra pedidos | Eventos Purchase recebidos por dia contra pedidos aprovados no ERP | A Meta recebendo mais compras do que a loja aprovou |

Fonte das quatro primeiras linhas: [Meta, Dataset Quality API](https://developers.facebook.com/docs/marketing-api/conversions-api/dataset-quality-api). A cobertura de evento é a *"média de 7 dias do percentual de eventos do Pixel da Meta cobertos pela API de Conversões"* que compartilham chave de deduplicação com eventos do servidor.

A consulta é um GET simples, no formato da documentação:

```
curl -X GET -G \
  -d 'fields=web{event_name,event_match_quality,event_coverage,dedupe_key_feedback,event_delay}' \
  -d 'dataset_id=<ID_DO_CONJUNTO_DE_DADOS>' \
  -d 'access_token=<TOKEN>' \
  https://graph.facebook.com/<VERSÃO>/dataset_quality
```

O token precisa de `ads_read` e de `ads_management` ou `business_management`, e o usuário precisa de pelo menos acesso parcial para usar o conjunto de dados ([Meta](https://developers.facebook.com/docs/marketing-api/conversions-api/dataset-quality-api)).

Na quinta verificação, olhe o total de eventos recebidos, não as compras atribuídas. Um exemplo com números redondos, sintético: a loja aprovou 1.000 pedidos no mês, o Pixel registrou 800 e o servidor mandou os 1.000. Com deduplicação funcionando, a Meta fica com cerca de 1.000. Com `event_id` desencontrado, fica com até 1.800, e o ganho que parecia vir da integração é contagem dupla.

## Como corrigir?

Na ordem em que o problema aparece.

**Gere o `event_id` no servidor.** O número do pedido é o candidato natural. Escreva-o na página de confirmação para o Pixel usar o mesmo valor no `eventID`, e mande o mesmo valor na API.

**Decida em que momento a compra acontece.** Se o Pixel dispara na criação do pedido, o servidor deve mandar o `Purchase` do mesmo momento, dentro das 48 horas, e a aprovação do pagamento vira outra coisa. Quanto mais o pagamento demora para compensar, maior a chance de a confirmação cair fora dessa janela, e o boleto é o caso típico. A Meta não decide isso por você: é uma definição de negócio, e ela precisa ser a mesma no Pixel, no servidor e no relatório que compara os dois com o ERP.

**Normalize os dados de cliente antes do hash.** A documentação pede telefone com código do país e sem zeros à esquerda, e-mail em minúsculas e sem espaços, cidade em letras de `a` a `z`, sem espaço e sem pontuação, e país no código ISO de duas letras em minúsculas ([Meta, parâmetros de cliente](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters)). No Brasil isso quer dizer `5511987654321`, `saopaulo` e `br`. Não aplique hash em IP, navegador, `fbc` e `fbp`.

**Mande perto do tempo real e filtre o lote.** A Meta recomenda enviar *"em tempo real ou em lotes próximos do tempo real"* ([Meta, boas práticas](https://developers.facebook.com/docs/marketing-api/conversions-api/best-practices)). Se precisar de lote, tire dele qualquer evento com mais de sete dias antes de enviar, para um pedido antigo não derrubar os outros.

**Meta de cobertura: 75% ou mais**, que é o limiar da própria Meta. Abaixo disso, a deduplicação não tem chave suficiente para funcionar.

Se a CAPI roda por um container de server-side tagging, vale ler também [o que o server-side tagging não conserta](https://precisian.io/blog/pt-BR/posts/server-side-tagging-vale-a-pena/): o container muda o caminho do evento, não o consentimento nem o identificador que o navegador já apagou.

## Quando a API de Conversões não tem conserto?

Em três situações, e nenhuma delas é de configuração.

**A venda que o seu servidor não registrou.** A API manda o que existe no seu sistema. Venda no Mercado Livre acontece num domínio que não é seu, e [o marketplace não devolve origem](https://precisian.io/blog/pt-BR/posts/marketplace-buraco-negro-de-dados/). Venda fechada no WhatsApp só vira evento se alguém a registrar: a API até aceita os tipos `chat` e `business_messaging` em `action_source` ([Meta](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/server-event)), mas não cria o pedido que ninguém digitou. O limite do lado do WhatsApp está [neste outro texto](https://precisian.io/blog/pt-BR/posts/atribuicao-whatsapp-dark-funnel/).

**O juízo da Meta sobre a própria mídia.** A deduplicação da Meta acontece entre o Pixel e o servidor do mesmo anunciante. Ela não desconta a compra que o Google também reivindicou, e por isso [a soma do ROAS passa do faturamento](https://precisian.io/blog/pt-BR/posts/roas-soma-maior-que-faturamento/). A API de Conversões dá à Meta mais eventos para atribuir com as regras dela. A referência da API de insights lista, ao lado da janela padrão, uma janela chamada *"Atribuição incremental"* ([Meta](https://developers.facebook.com/docs/marketing-api/reference/ads-action-stats/)). Na minha leitura, a existência de uma janela incremental separada já diz que a padrão não é. E a ACR, que mede o ganho da integração, é calculada pela mesma empresa que vende a mídia.

**A mesma integração lendo o próprio resultado.** Quem pergunta à Meta quantas compras a Meta trouxe recebe a resposta da Meta. Isso vale pelo painel e vale pelo [MCP oficial da Meta Ads](https://precisian.io/blog/pt-BR/posts/mcp-da-meta-ads/), que devolve a conversão atribuída pela própria plataforma.

E um caso em que a Precisian não é a resposta: se o seu problema é só `event_id` desencontrado, a correção é um ajuste de desenvolvimento de uma tarde, e você não precisa de plataforma de dados para isso. O que pede mais que uma tarde é a comparação contínua com o ERP, porque ela depende de uma definição escrita de "pedido" (criado, aprovado, faturado) que o analista e a IA leiam do mesmo lugar. É o papel de uma [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/).

A perda de sinal que a CAPI ataca é estrutural e não depende do Chrome, onde o [cookie de terceiro continua ativo](https://precisian.io/blog/pt-BR/posts/cookie-de-terceiro-o-que-mudou/).

## O que este artigo não cobre?

Não trata de consentimento nem de LGPD. Mandar um evento pelo servidor não muda a base legal para tratar o dado de quem não consentiu, e isso é pergunta para o jurídico, não para a documentação da Meta.

Não cobre eventos de aplicativo, porque a Event Match Quality hoje só existe para eventos de site, nem integrações por parceiro ou gateway, que têm documentação própria.

E não diz quantas conversões a API vai recuperar na sua loja. A Meta não publica esse número fora do exemplo de payload citado acima, e o que circula vem de quem vende a implantação.

Se as compras do Gerenciador de Anúncios passaram dos pedidos aprovados depois que a API de Conversões entrou, o primeiro passo é medir quantos eventos chegam sem `event_id` igual nos dois lados. [Vale uma conversa sobre o seu caso](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).
