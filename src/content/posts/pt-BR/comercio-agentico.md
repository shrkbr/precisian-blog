---
title: "Comércio agêntico: o que o e-commerce precisa ter no dado antes de um agente de IA comprar na loja"
description: "O agente compra pelo que o feed e a API dizem. Preço, estoque e status do pedido precisam ser a mesma verdade, e a venda precisa chegar marcada."
slug: "comercio-agentico"
lang: "pt-BR"
translationKey: "agentic-commerce-data"
publishedAt: 2026-11-16
tags: ["ecommerce", "dados-para-ia", "mcp", "atribuicao", "integracao", "camada-semantica"]
draft: false
llmSummary: "Três protocolos de comércio agêntico têm spec pública: ACP (OpenAI e Stripe, 29/09/2025), UCP (Google, 11/01/2026) e AP2 (Google, 16/09/2025). Em 16/11/2026, nenhum publica disponibilidade no Brasil; o feed padrão da OpenAI mira os EUA."
citations: ["https://github.com/agentic-commerce-protocol/agentic-commerce-protocol", "https://stripe.com/newsroom/news/stripe-openai-instant-checkout", "https://openai.com/index/powering-product-discovery-in-chatgpt/", "https://developers.openai.com/commerce/specs/file-upload/products", "https://developers.openai.com/commerce/guides/submit-product-feeds", "https://developers.googleblog.com/en/under-the-hood-universal-commerce-protocol-ucp/", "https://ucp.dev/specification/overview/", "https://ucp.dev/latest/specification/shopping/order/", "https://developers.google.com/merchant/ucp/faq", "https://support.google.com/merchants/answer/16992327", "https://ap2-protocol.org/", "https://cloud.google.com/blog/products/ai-machine-learning/announcing-agents-to-payments-ap2-protocol"]
about: ["https://en.wikipedia.org/wiki/Agentic_commerce", "https://pt.wikipedia.org/wiki/Com%C3%A9rcio_eletr%C3%B4nico", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
cta: demo
---
Comércio agêntico é a compra feita por um agente de IA em nome do cliente, e ele já tem três protocolos com especificação pública: o Agentic Commerce Protocol, da OpenAI com a Stripe, lançado em 29/09/2025 ([Stripe](https://stripe.com/newsroom/news/stripe-openai-instant-checkout)); o Universal Commerce Protocol, do Google, de 11/01/2026 ([Google](https://developers.googleblog.com/en/under-the-hood-universal-commerce-protocol-ucp/)); e o AP2, de pagamento. O agente compra pelo que o feed e a API dizem. Se preço, estoque e status do pedido divergem entre canais, ele vende o que você não tem.

Em 16/11/2026, nenhum dos três fabricantes publica disponibilidade para lojas no Brasil. Até um deles chegar, o trabalho possível é no dado: preço, estoque, status do pedido e origem da venda.

> **Comércio agêntico** é a venda em que um agente de IA descobre o produto, monta o carrinho e conclui o pagamento conversando com a loja por uma API ou um servidor MCP, sem que o comprador navegue pelo site. A loja continua sendo a vendedora responsável pelo pedido.

## O que são os protocolos, e o que cada um especifica?

São contratos de API. Nenhum deles é uma loja nova; todos assumem que você continua dono do checkout, do estoque e do pedido.

| Protocolo | Quem mantém | Data | O que especifica | Estado em 16/11/2026 |
|---|---|---|---|---|
| **ACP** (Agentic Commerce Protocol) | OpenAI e Stripe | 29/09/2025; última versão estável `2026-04-17` | Checkout (`POST /checkout_sessions`, `/complete`, `/cancel`), pagamento delegado, feed, pedido | `beta`, licença Apache 2.0 |
| **UCP** (Universal Commerce Protocol) | Google, com Shopify, Etsy, Wayfair, Target e Walmart | 11/01/2026; spec atual `2026-08-25` | Perfil em `/.well-known/ucp`, `dev.ucp.shopping.checkout`, `dev.ucp.shopping.order`, transporte REST, MCP ou A2A | Integração no Merchant Center em liberação gradual nos EUA |
| **AP2** (Agent Payments Protocol) | Google, doado à FIDO Alliance | 16/09/2025; versão `v0.2` | Mandatos assinados: `Checkout Mandate` e `Payment Mandate` | Apache 2.0, padronização na FIDO |

Fontes, lidas em 16/11/2026: [repositório do ACP](https://github.com/agentic-commerce-protocol/agentic-commerce-protocol), [visão geral da spec do UCP](https://ucp.dev/specification/overview/), [Merchant Center](https://support.google.com/merchants/answer/16992327) e [site do AP2](https://ap2-protocol.org/).

Em 24/03/2026, a OpenAI escreveu que *"a versão inicial do Instant Checkout não ofereceu o nível de flexibilidade a que aspiramos"* e passou a deixar o lojista usar o próprio checkout, concentrando o esforço em descoberta de produto ([OpenAI](https://openai.com/index/powering-product-discovery-in-chatgpt/)). O protocolo continua; o que o ChatGPT faz com ele hoje é sobretudo ler catálogo.

## O que o agente lê do seu catálogo?

Lê o feed, e só ele. O esquema de feed da OpenAI exige nove campos por item: `item_id`, `title`, `description`, `url`, `brand`, `seller_name`, `image_url`, `availability` e `price`, mais `target_countries` e `store_country` ([OpenAI, esquema de feed](https://developers.openai.com/commerce/specs/file-upload/products), lido em 16/11/2026).

No mesmo esquema, o campo `availability` aceita `in_stock`, `out_of_stock`, `pre_order`, `backorder` ou `unknown`, e valor ausente rejeita a linha. E o `price` é texto em unidade maior com a moeda: `79.99 USD`.

A mesma documentação avisa que *"o feed não atualiza um carrinho nem confirma uma compra"* e que o site ou o plugin da loja *"ainda confere a oferta atual quando o cliente age"* ([OpenAI, envio de feed](https://developers.openai.com/commerce/guides/submit-product-feeds)). Na prática, o agente forma a recomendação com o feed e descobre a verdade no checkout. Quando os dois discordam, o cliente vê um preço na conversa e outro na hora de pagar.

## Qual é o sintoma quando o dado não está pronto?

Três, e você já conhece todos de outro canal.

**Produto recomendado que não existe mais.** O feed diz `in_stock`, o ERP zerou o estoque há duas horas. O UCP põe a responsabilidade por escrito: a loja, como vendedora responsável, faz a checagem de estoque em tempo real e devolve o código `out_of_stock` se o item acabar durante o checkout ([Google, FAQ do UCP](https://developers.google.com/merchant/ucp/faq)). O agente mostra a mensagem de erro. A venda morre na conversa, sem abandono de carrinho para você medir.

**Preço que muda entre a conversa e o pagamento.** No Brasil isso tem uma causa a mais, que é tributária: o Google Shopping exige preço com imposto no Brasil e sem imposto nos EUA, e quem segue tutorial americano erra o feed ([por que o produto não aparece no Google Shopping](https://precisian.io/blog/pt-BR/posts/produto-nao-aparece-google-shopping/)). Um feed que alimenta mais de um agente carrega o mesmo risco multiplicado.

**Venda que aparece no ERP sem origem.** O pedido existe, o faturamento existe, e nenhum relatório diz que veio de um agente. É o mesmo buraco que o [marketplace já cria](https://precisian.io/blog/pt-BR/posts/marketplace-buraco-negro-de-dados/), com um canal novo dentro dele.

## Por que isso acontece, mecanicamente?

Porque o mesmo pedido passa a existir em quatro representações, e cada protocolo escolheu uma.

O feed da OpenAI escreve preço como texto em unidade maior (`79.99 USD`). O checkout do ACP escreve preço como inteiro em unidade menor: *"100 centavos para US$ 1,00"* ([ACP, OpenAPI de checkout `2026-04-17`](https://github.com/agentic-commerce-protocol/agentic-commerce-protocol/blob/main/spec/2026-04-17/openapi/openapi.agentic_checkout.yaml)). O pedido do UCP também usa unidade menor da ISO 4217 ([UCP, capacidade de pedido](https://ucp.dev/latest/specification/shopping/order/)). O ERP guarda o valor do jeito dele, com frete, desconto e imposto em campos que nenhum dos três protocolos conhece.

O status do pedido diverge do mesmo modo. O ACP define `created`, `confirmed`, `manual_review`, `processing`, `shipped`, `completed` e `canceled`, e manda a loja avisar a plataforma por webhook com os eventos `order_create` e `order_update` ([ACP, webhooks](https://github.com/agentic-commerce-protocol/agentic-commerce-protocol/blob/main/spec/2026-04-17/openapi/openapi.agentic_checkout_webhook.yaml)). Reembolso, crédito, devolução e disputa vão em `adjustments[]`. O UCP exige que a loja envie o pedido completo a cada evento, nunca só a diferença, para a `webhook_url` da plataforma ([UCP](https://ucp.dev/latest/specification/shopping/order/)). Nenhum dos dois conhece os status do seu ERP. Alguém precisa escrever a tabela de-para, e ela precisa ser a mesma em todos os canais.

A origem é o terceiro ponto, e o mais fácil de perder. O ACP tem o campo `affiliate_attribution`, e a spec diz que essa atribuição *"é guardada junto com o pedido resultante, mas não é devolvida na resposta"* ([ACP](https://github.com/agentic-commerce-protocol/agentic-commerce-protocol/blob/main/spec/2026-04-17/openapi/openapi.agentic_checkout.yaml)). O UCP identifica as chamadas de checkout pelo cabeçalho `UCP-Agent`, e o próprio Google avisa que o cabeçalho pode ser falsificado e não serve para autenticar ([FAQ do UCP](https://developers.google.com/merchant/ucp/faq)). Os dois sinais chegam no servidor da loja. Se o sistema de pedido não grava esse sinal num campo, a venda entra no ERP como qualquer outra.

## Como diagnosticar isso na sua operação?

Com uma amostra de SKUs e quatro comparações. Não precisa de protocolo ligado para rodar.

| Verificação | Onde olhar | O que indica problema |
|---|---|---|
| Preço do feed × preço do checkout × preço faturado | Arquivo do feed, carrinho no site, nota fiscal do mesmo SKU | Qualquer diferença que não seja frete declarado |
| Disponibilidade do feed × estoque disponível para venda | Campo de disponibilidade do feed, saldo do ERP no mesmo horário | Item `in_stock` com saldo zero, ou o contrário |
| Status do pedido no ERP × vocabulário do protocolo | Lista de status do ERP contra os sete status do ACP | Status do ERP sem correspondente, ou dois status do ERP caindo no mesmo |
| Origem do pedido | Registro do pedido no ERP ou no lake | Nenhum campo capaz de guardar "canal = agente" e o identificador da plataforma |
| Unidade de valor | Integração que grava o pedido | Valor em centavos lido como reais, ou o inverso |

A quarta linha é a que decide se o canal vai existir nos seus números. Em geral, quem vende em marketplace já descobriu que [não existe chave comum entre site e canal](https://precisian.io/blog/pt-BR/posts/deduplicar-venda-site-marketplace/). No agente, ao menos o sinal chega na sua API.

## Como corrigir?

Escrevendo as definições antes do primeiro pedido.

**Uma definição de preço vigente.** Qual campo do ERP é o preço do feed, com imposto ou sem, com qual promoção, convertido para qual formato. Uma regra, aplicada a todo feed que sai da loja.

**Uma definição de estoque vendável.** Saldo físico menos reservado, menos o que está prometido em marketplace, atualizado com a frequência em que você envia o feed. A OpenAI recebe snapshots completos por upload, URL ou SFTP ([OpenAI](https://developers.openai.com/commerce/guides/submit-product-feeds)); se o seu snapshot sai uma vez por dia, o seu estoque no agente tem até um dia de atraso.

**Uma tabela de status.** O de-para entre o status do ERP e os sete do ACP (e o equivalente do UCP), versionado, com dono.

**Um campo de origem no pedido.** "Canal = agente", qual plataforma, qual protocolo, gravado no momento da criação do pedido a partir do `affiliate_attribution` ou do `UCP-Agent`. Sem esse campo, nenhuma análise posterior separa a venda do agente da venda do site.

Na minha leitura, essas quatro definições são o trabalho de uma [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/): regras escritas onde o analista e a IA leem antes de calcular. É o que a Precisian entrega. Cada cliente tem um lake isolado na infraestrutura da Precisian, a camada semântica guarda essas definições, e a IA, o BI ou a automação do cliente consulta por MCP, API ou conexão direta. O mesmo raciocínio de expor perguntas em vez de tabelas aparece nos [servidores MCP das plataformas de e-commerce](https://precisian.io/blog/pt-BR/posts/mcp-de-plataforma-de-ecommerce/), que hoje respondem pouco sobre venda.

## Quando isso não tem conserto?

Em quatro situações, e duas delas não dependem de você.

**Quando o protocolo não chega ao Brasil.** O feed padrão da OpenAI *"atualmente mira os EUA"*, e o formato compartilhado representa só `US`, `CA` e `MX` ([OpenAI](https://developers.openai.com/commerce/specs/file-upload/products)). O Merchant Center libera o UCP nos EUA, com Austrália e Canadá *"no ano que vem"* ([Google](https://support.google.com/merchants/answer/16992327)). O lançamento do ACP com a Stripe falava só de compradores e lojas nos EUA ([Stripe](https://stripe.com/newsroom/news/stripe-openai-instant-checkout)). Não encontrei, em fonte primária de nenhum dos três, data para o Brasil.

**Quando o pagamento é Pix.** A documentação que li descreve pagamento por token de cartão: o Shared Payment Token da Stripe no ACP e o Google Pay no UCP, que no fluxo do Google aceita só `PAN_ONLY` ([FAQ do UCP](https://developers.google.com/merchant/ucp/faq)). O anúncio do AP2 fala em *"transferências bancárias em tempo real"* de forma genérica ([Google Cloud](https://cloud.google.com/blog/products/ai-machine-learning/announcing-agents-to-payments-ap2-protocol)). Não encontrei Pix citado nominalmente em nenhuma das três specs.

**Quando o agente compra navegando, e não pela API.** A OpenAI documenta o uso do navegador do ChatGPT no site da loja, com o checkout normal ([OpenAI](https://developers.openai.com/commerce/guides/submit-product-feeds)). Nesse caminho não existe `affiliate_attribution`. Se nada no pedido marca a origem, a venda é indistinguível de uma sessão comum, e nenhuma camada a jusante recupera o que não foi gravado.

**Quando a venda acontece no marketplace.** Se o agente compra o seu produto dentro de um marketplace, a origem fica com o marketplace. O lake recebe o pedido sem o canal.

E há o caso em que a Precisian não é a resposta: se você não vende para os EUA e não tem previsão de protocolo no Brasil, o trabalho certo agora é higiene de catálogo e de estoque, que o seu time de e-commerce faz sem plataforma de dados.

## O que este artigo não cobre?

Não explica como implementar o checkout do ACP ou do UCP; para isso, a fonte é a spec, linkada acima. Não compara taxas, porque as da OpenAI mudaram com o fim do Instant Checkout e eu não achei tabela vigente publicada. Não cobre a camada de identidade (`dev.ucp.common.identity_linking`) nem a autenticação de bots.

Também não faz previsão de volume. Os números de mercado que circulam sobre comércio agêntico vêm, quase todos, de consultorias e de quem vende a integração, e nenhum que encontrei publica a metodologia.

Se a sua loja quer estar pronta quando um desses protocolos chegar ao Brasil, o primeiro passo é conferir se o preço do feed, o do checkout e o da nota são o mesmo número para cem SKUs. [Veja um MCP governado respondendo](https://precisian.io/demonstracao?utm_source=blog&utm_medium=cta&utm_campaign=comercio-agentico&utm_content=texto) sobre um lake isolado, sem compromisso de contrato.
