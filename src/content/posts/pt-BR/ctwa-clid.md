---
title: "ctwa_clid: o que é e como guardar o ID do clique no anúncio de WhatsApp"
description: "O ctwa_clid é o ID do clique no anúncio de WhatsApp. Chega uma vez, no webhook, e só vale para atribuir a venda se for guardado junto com o pedido."
slug: "ctwa-clid"
lang: "pt-BR"
translationKey: "ctwa-clid"
publishedAt: 2026-10-23
tags: ["whatsapp", "atribuicao", "tracking", "integracao"]
draft: false
llmSummary: "O ctwa_clid é o ID do clique num anúncio Click to WhatsApp. Segundo a Meta, chega no objeto referral do webhook de mensagens (campo criado em 27/09/2023), deve ser guardado com a conversa e devolvido pela Conversions API for Business Messaging. A Meta não publica prazo de validade para ele."
citations: ["https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages/text", "https://developers.facebook.com/docs/marketing-api/conversions-api/business-messaging", "https://developers.facebook.com/docs/whatsapp/business-platform/changelog", "https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/automatic-events-api", "https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/fbp-and-fbc", "https://support.google.com/google-ads/answer/9744275"]
about: ["https://en.wikipedia.org/wiki/WhatsApp", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
---

O `ctwa_clid` é o identificador do clique num anúncio Click to WhatsApp. A Meta o entrega dentro do objeto `referral` do webhook de mensagens da WhatsApp Business Platform, campo que entrou na Cloud API em 27 de setembro de 2023 ([changelog da Meta](https://developers.facebook.com/docs/whatsapp/business-platform/changelog)). A empresa precisa guardá-lo junto com a conversa e devolvê-lo pela Conversions API quando a venda acontece. Se ninguém o grava, a venda chega ao financeiro sem origem.

> **ctwa_clid** (Click-to-WhatsApp Click ID): identificador pessoal, único por clique, que a Meta expõe à empresa quando a conversa começa num anúncio que leva ao WhatsApp, e que deve voltar para a Meta na chamada da Conversions API ([Meta for Developers](https://developers.facebook.com/docs/marketing-api/conversions-api/business-messaging), consultada em 23/10/2026).

Escrevi este verbete porque o `ctwa_clid` aparece pouco na documentação em português e quase sempre em material de fornecedor de chatbot. Tudo o que vem a seguir foi conferido na documentação da Meta para desenvolvedores em 23 de outubro de 2026. Onde a documentação não diz, o texto avisa.

## Onde o ctwa_clid chega?

No webhook `messages`, dentro do objeto `referral`. A referência de mensagens de texto da Meta descreve esse objeto com a anotação "only included if message sent via a Click to WhatsApp ad" ([Meta for Developers](https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages/text)). Ou seja: conversa orgânica, vinda de link na bio, QR code ou indicação, não traz `referral` nem `ctwa_clid`.

O formato, como a referência mostra:

```json
"referral": {
  "source_url": "<AD_URL>",
  "source_id": "<AD_ID>",
  "source_type": "ad",
  "body": "<AD_PRIMARY_TEXT>",
  "headline": "<AD_HEADLINE>",
  "media_type": "<AD_MEDIA_TYPE>",
  "ctwa_clid": "<AD_CLICK_ID>",
  "welcome_message": { "text": "<AD_GREETING_TEXT>" }
}
```

Três detalhes da documentação mudam o desenho da captura:

**Anúncio no Status do WhatsApp não manda o campo.** Em 20 de outubro de 2025, o [changelog](https://developers.facebook.com/docs/whatsapp/business-platform/changelog) anunciou que o ID do clique deixaria de vir nos webhooks de mensagem de texto originados de anúncio no Status. A referência confirma: "the `ctwa_clid` property is omitted entirely for messages originating from an ad in WhatsApp Status". O `referral` chega; o `ctwa_clid`, não.

**É Cloud API.** A [documentação da Conversions API for Business Messaging](https://developers.facebook.com/docs/marketing-api/conversions-api/business-messaging) diz que o `ctwa_clid` só existe no webhook da API On-Premises a partir da versão 2.45.1 e que a última versão suportada desse cliente expirava em 23 de outubro de 2025. Na prática, quem ainda não está na Cloud API não tem de onde capturar.

**O `source_id` é o anúncio, não a campanha.** Ele vem no mesmo objeto, mas resolver anúncio para campanha é um segundo passo, contra a Marketing API. O post sobre [atribuição no WhatsApp](https://precisian.io/blog/pt-BR/posts/atribuicao-whatsapp-dark-funnel/) detalha por que essa resolução precisa ser feita na hora.

## Quanto tempo o ctwa_clid vale?

A Meta não publica prazo de validade para o `ctwa_clid`. Procurei nas três páginas que tratam dele (a referência do webhook, a da Conversions API e o changelog) e nenhuma dá um número.

O prazo que circula, sete dias, é de outro mecanismo. A página da [Conversions API for Business Messaging](https://developers.facebook.com/docs/marketing-api/conversions-api/business-messaging) diz que o caminho alternativo, por dado do cliente com hash (e-mail, telefone, nome), "attributes an event to an ad interaction from the past seven days", e que conversão informada depois disso é aceita, mas não atribuída. Sobre o `ctwa_clid`, a mesma página diz o contrário: ele "matches more reliably than hashed customer information and is not subject to the limits below".

Sem prazo publicado, também não há garantia de que um clique antigo ainda funcione. A mesma documentação descreve o fluxo esperado como tempo real ("during an advertiser's campaign period, events happen in real time"). A leitura prudente é mandar o evento quando a venda acontece, não acumular para um lote mensal.

## Como mandar o ctwa_clid de volta pela Conversions API?

Com um `POST` no endpoint de eventos do dataset, como evento de mensageria. A [documentação](https://developers.facebook.com/docs/marketing-api/conversions-api/business-messaging) mostra o formato para WhatsApp:

```json
{
  "event_name": "Purchase",
  "event_time": "<UNIX_TIMESTAMP>",
  "action_source": "business_messaging",
  "messaging_channel": "whatsapp",
  "user_data": {
    "whatsapp_business_account_id": "<WABA_ID>",
    "ctwa_clid": "<CTWA_CLID>"
  },
  "custom_data": { "currency": "BRL", "value": "<VALOR>" }
}
```

Quatro regras da mesma página:

1. **O `ctwa_clid` vai em texto, como chegou.** O exemplo da Meta o envia sem hash. O hash SHA-256 é exigido só para os campos de dado do cliente.
2. **Só entra evento que aconteceu na conversa.** "Messaging events should only represent customer interactions that occur in the messaging thread." Se a pessoa clicou num link e comprou no site, a Meta manda usar a Conversions API para web.
3. **A Meta não deduplica por você.** "Meta does not assist with deduplicating events for Conversions API for Business Messaging." A deduplicação acontece antes do envio, do seu lado.
4. **Há uma lista fechada de eventos.** Entre eles `Purchase`, `LeadSubmitted`, `InitiateCheckout`, `AddToCart`, `OrderCreated` e `OrderShipped`.

A Meta oferece também um atalho, a [Automatic Events API](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/automatic-events-api), em que a própria Meta lê a conversa com "regex and natural language processing", infere `Purchase` ou `LeadSubmitted` e devolve o evento já com o `ctwa_clid`. Ela não está disponível na União Europeia, no Reino Unido e no Japão, e a Meta não publica a acurácia do classificador.

## Qual a diferença entre ctwa_clid, gclid e fbclid?

Os três identificam um clique em anúncio. O que muda é por onde chegam, e isso decide quem consegue guardá-los.

| | `ctwa_clid` | `fbclid` | `gclid` |
|---|---|---|---|
| Plataforma | Meta, anúncio que abre conversa no WhatsApp | Meta, anúncio que leva ao site | Google Ads |
| Por onde chega | Webhook do servidor, no objeto `referral` | Parâmetro na URL do site | Parâmetro na URL do site |
| Quem guarda por padrão | Ninguém: o seu servidor precisa gravar | O Pixel, no cookie `_fbc` | A tag do Google Ads, com auto-tagging |
| Para onde volta | Conversions API for Business Messaging | Conversions API para web (campo `fbc`) | Conversão do site ou importação offline |
| Prazo publicado | Nenhum | Cookie recomendado de 90 dias | Fora do escopo deste artigo |

Fontes da tabela: [webhook de mensagens](https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages/text), [fbp e fbc](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/fbp-and-fbc) e [GCLID no Google Ads](https://support.google.com/google-ads/answer/9744275), consultadas em 23/10/2026.

O `fbclid` e o `gclid` passam pelo navegador, e uma tag instalada os grava sem ninguém pensar no assunto. O `ctwa_clid` passa pelo seu servidor, uma vez, e não existe tag que o grave por você.

## O que o ctwa_clid não é?

Não é o identificador da pessoa. Quem identifica o contato é o `wa_id`, que chega no mesmo webhook e serve para as mensagens seguintes. O `ctwa_clid` identifica **um clique**: a mesma pessoa clicando em dois anúncios gera dois.

Não é o ID do anúncio. Esse é o `source_id`.

Não é UTM. Não carrega campanha, conjunto nem criativo legível; para chegar à campanha é preciso resolver o `source_id`.

Não é atribuição. É a chave que permite à Meta atribuir. A conta de quanto vendeu cada anúncio continua sendo feita pela Meta, no modelo dela, e comparar esse número com o do seu analytics é comparar dois modelos.

## Por que o ctwa_clid some se ninguém o guardar com o pedido?

Porque a venda pelo WhatsApp quase nunca nasce no mesmo sistema da conversa. No Brasil, o caminho comum é o vendedor fechar na conversa, mandar um Pix ou um link de pagamento e digitar o pedido na VTEX, no ERP ou numa planilha. A conversa tem o `ctwa_clid`; o pedido, não.

Quando chega a hora de mandar o `Purchase` para a Meta, alguém precisa responder: qual clique gerou este pedido? Se o identificador ficou só no log do webhook, ou dentro da ferramenta de atendimento sem ligação com o número do pedido, a resposta não existe. O evento sai sem `ctwa_clid` (e cai no caminho de hash, com os limites de sete dias e de país) ou não sai.

A correção está na modelagem do dado, e são três passos:

- **Gravar o `referral` inteiro** no instante em que o webhook chega, junto com o `wa_id` e o horário.
- **Criar o campo no pedido.** O registro de venda precisa de uma coluna para o `ctwa_clid` da conversa que o originou, preenchida pelo sistema ou colada pelo vendedor.
- **Definir a regra.** Se a mesma pessoa clicou em dois anúncios antes de comprar, qual `ctwa_clid` vai no evento? A documentação não decide isso por você, e a regra precisa estar escrita antes da primeira venda.

É o mesmo padrão do [marketplace como buraco negro de dado](https://precisian.io/blog/pt-BR/posts/marketplace-buraco-negro-de-dados/) e do [Pix que quebra o purchase do GA4](https://precisian.io/blog/pt-BR/posts/pix-quebra-o-purchase-do-ga4/): a origem existe por um instante, em outro sistema, e some se nada a persistir. Na Precisian, esse dado fica num lake isolado por cliente, na nossa infraestrutura, e a regra de qual clique leva a venda vira definição versionada na camada semântica, em vez de lógica escondida numa automação.

## O que este artigo não cobre?

Não diz quanto tempo o `ctwa_clid` vale, porque a Meta não publica.

Não confirma se o `referral` vem só na primeira mensagem depois do clique. Fornecedores afirmam que sim; a referência do webhook não diz. O teste custa uma hora: um anúncio barato e três mensagens seguidas.

Não trata de Messenger nem de Instagram Direct, que usam outros identificadores na mesma Conversions API (`page_scoped_user_id` e `ig_sid`).

Não descreve o que acontece para quem atende só pelo aplicativo WhatsApp Business no celular. A documentação que li trata do webhook da plataforma.

Se a sua operação vende pelo WhatsApp e não consegue dizer qual anúncio gerou cada pedido, o primeiro passo é verificar onde o `ctwa_clid` está sendo gravado e se ele chega ao registro da venda. [Agende uma conversa sobre o seu caso](https://calendar.notion.so/meet/rodrigomartucci/precisian-io) — sem compromisso de contrato, mas sem promessa de resposta em 30 minutos também.
