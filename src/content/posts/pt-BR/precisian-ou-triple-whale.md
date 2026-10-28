---
title: "Precisian ou Triple Whale: qual escolher para e-commerce no Brasil"
description: "A Triple Whale é feita para marca Shopify que opera em inglês e paga em dólar. Para loja VTEX que quer a própria IA lendo o dado, a conta muda."
slug: "precisian-ou-triple-whale"
lang: "pt-BR"
translationKey: "precisian-vs-triple-whale"
publishedAt: 2026-10-27
tags: ["mcp", "camada-semantica", "atribuicao", "ecommerce", "dados-para-ia", "governanca", "custo"]
draft: false
llmSummary: "Em 27/10/2026, a Triple Whale cobra US$ 219/mês no plano Foundation, em dólar, segundo a Shopify App Store; o app é só em inglês e a VTEX não está entre as integrações nativas. Seu MCP é só leitura e vem nos planos pagos (help center da Triple Whale)."
citations: ["https://www.triplewhale.com/pricing", "https://apps.shopify.com/triplewhale-1", "https://www.triplewhale.com/our-integrations", "https://triplewhale.readme.io/reference/custom-sales-platform-setup-overview", "https://kb.triplewhale.com/en/articles/15656798-triple-whale-mcp", "https://kb.triplewhale.com/en/articles/16046642-understanding-triple-whale-plans-foundation-automate-and-enterprise", "https://www.triplewhale.com/pages/terms-of-service", "https://www.triplewhale.com/data-platform", "https://www.triplewhale.com/about", "https://kb.triplewhale.com/en/articles/9590400-which-currencies-are-supported-in-triple-whale", "https://kb.triplewhale.com/en/articles/15808805-understanding-how-triple-whale-counts-sessions-across-your-web-analytics-metrics", "https://trust.triplewhale.com/"]
about: ["https://www.triplewhale.com", "https://en.wikipedia.org/wiki/Semantic_layer", "https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

Para uma marca que vende em Shopify, opera em inglês e quer painel pronto com atribuição por pixel, a Triple Whale é a escolha natural. Para um e-commerce brasileiro em VTEX ou Magento, com marketplace e ERP no meio, a conta muda. Em 27/10/2026, a Shopify App Store lista o plano Foundation da Triple Whale a US$ 219 por mês, cobrado em dólar, e o app só em inglês ([Shopify App Store](https://apps.shopify.com/triplewhale-1)). A VTEX não aparece entre as integrações nativas ([Triple Whale](https://www.triplewhale.com/our-integrations)).

> **Triple Whale**: plataforma americana de analytics e atribuição para e-commerce, fundada em 2021, que se descreve como "the AI operating system for ecommerce" ([pricing](https://www.triplewhale.com/pricing); [about](https://www.triplewhale.com/about)). Junta pixel próprio, atribuição multi-touch, warehouse gerenciado, painéis, um agente de IA que age nas contas de anúncio (Moby) e um servidor MCP.

## Quais critérios usei para comparar?

Declaro os critérios antes da tabela para que você possa discordar deles. Eles foram escolhidos para um leitor específico: o e-commerce brasileiro de médio porte, com vários canais, sem time de dados próprio, que quer usar a IA que já tem (Claude, ChatGPT, Copilot) sobre os números do negócio. Se esse não é você, os pesos mudam, e a Triple Whale pode sair na frente.

1. **Dado isolado por cliente.** Ambiente separado ou banco compartilhado?
2. **Definição de métrica versionada.** Existe um lugar onde "receita" e "ROAS" estão escritos, versionados e aprovados por você?
3. **Acesso pela IA do próprio cliente.** Dá para ligar o seu Claude ou o seu agente ao dado, por MCP ou API, sem passar pelo painel do fornecedor?
4. **Fontes do e-commerce brasileiro.** VTEX, Magento, ERP e mídia (GA4, Meta, Google Ads, TikTok).
5. **Quem opera o dado.** Gente do fornecedor cuida da coleta e da modelagem, ou você opera sozinho?
6. **Propriedade e portabilidade.** Se sair, você leva o dado?
7. **Modelo comercial.** Como cobra.

Ficaram de fora a quantidade de painéis e de integrações. A Triple Whale ganharia nos dois, e nenhum responde se o número que a sua IA devolve é o mesmo que o financeiro aprovaria.

## O que a Triple Whale faz bem?

Muita coisa, e convém dizer antes da tabela. Ela declara mais de 60 mil marcas na base e afirma ter rastreado US$ 71 bilhões em receita em 365 dias ([about, consultado em 26/10/2026](https://www.triplewhale.com/about)). Tem pixel próprio, atribuição multi-touch, modelo de mix de marketing e testes de incrementalidade num produto só, o Compass, recomendado para quem fatura a partir de US$ 10 milhões por ano ([help center](https://kb.triplewhale.com/en/articles/16046642-understanding-triple-whale-plans-foundation-automate-and-enterprise)).

O autosserviço é real: "Most brands are up and running with Triple Whale in 15 minutes, with no engineer required", diz o FAQ da [página de preço](https://www.triplewhale.com/pricing). E não é só software. A mesma página oferece especialistas de implantação, onboarding e migração sob medida com atendimento dedicado no Enterprise, e um add-on de serviço, o Moby Concierge, descrito como "high-touch, custom builds". Há gente da Triple Whale disponível para quem contrata.

O agente Moby ajusta orçamento, pausa anúncio e lança campanha "within your approval settings and guardrails" ([pricing](https://www.triplewhale.com/pricing)). O MCP liga Claude, ChatGPT, Cursor e n8n ao dado da conta por OAuth2 ([help center, MCP](https://kb.triplewhale.com/en/articles/15656798-triple-whale-mcp)). E há um plano Free, sem mensalidade, com pixel, atribuição de primeiro e último clique, 12 meses de histórico e 10 usuários ([Shopify App Store](https://apps.shopify.com/triplewhale-1)).

## Como as duas se comparam, critério a critério?

| Critério | Triple Whale | Precisian |
|---|---|---|
| C1 · Dado isolado por cliente | **Não declarado.** O warehouse é descrito com "universal schema"; o Trust Center lista "Environment Segregation" sem texto público | **Sim.** Data lake isolado por cliente, na infraestrutura da Precisian |
| C2 · Métrica versionada | **Parcial.** Metric Builder e biblioteca de métricas; troca de definição de sessão em 06/07/2026 com a versão "Legacy" mantida. Aprovação e histórico por métrica: não declarados | **Sim.** Camada semântica com definição única, versionada (data, autor, histórico) e aprovada pelo cliente |
| C3 · IA do próprio cliente | **Sim.** MCP só leitura nos planos Foundation, Automate e Enterprise; API Data-Out com SQL | **Sim.** MCP, API e conexão direta ao BI do cliente, inclusos; sem painel próprio |
| C4 · Fontes do e-commerce BR | **Parcial.** Shopify, WooCommerce e BigCommerce nativos; Magento como "custom"; VTEX não listada; mídia ampla (Meta, Google Ads, TikTok, Amazon Ads) | **Sim.** GA4, Meta Ads, Google Ads e TikTok Ads inclusos; VTEX e Magento prontos; ERP como conexão adicional |
| C5 · Quem opera o dado | **Parcial.** Autosserviço, com especialistas de implantação, sucesso dedicado no Enterprise e serviço no add-on Moby Concierge; em loja custom, envio de pedidos e pixel ficam com o cliente | **Sim.** Precisian Foundation inclusa: coleta, server-side, sustentação, modelagem com o cliente, conexão da IA e treinamento |
| C6 · Propriedade e portabilidade | **Parcial.** Export por Data-Out API e Data Warehouse Sync (add-on); termos dão à empresa licença "perpetual, irrevocable" sobre o User Content | **Sim.** "A infraestrutura é nossa, o dado é seu. Você acessa a qualquer momento e, se sair, leva tudo." |
| C7 · Modelo comercial | Assinatura de 12 meses por GMV anual e pacote, em dólar; usuários ilimitados; entrada a US$ 219/mês (Foundation) e US$ 749/mês (Automate) | Assinatura mensal, sem setup e sem cobrança por assento |

Fontes da coluna Triple Whale, lidas em 26 e 27/10/2026: [pricing](https://www.triplewhale.com/pricing), [integrações](https://www.triplewhale.com/our-integrations), [Custom Sales Platform](https://triplewhale.readme.io/reference/custom-sales-platform-setup-overview), [MCP](https://kb.triplewhale.com/en/articles/15656798-triple-whale-mcp), [planos](https://kb.triplewhale.com/en/articles/16046642-understanding-triple-whale-plans-foundation-automate-and-enterprise), [sessões](https://kb.triplewhale.com/en/articles/15808805-understanding-how-triple-whale-counts-sessions-across-your-web-analytics-metrics), [Data Platform](https://www.triplewhale.com/data-platform), [Trust Center](https://trust.triplewhale.com/), [termos](https://www.triplewhale.com/pages/terms-of-service) e [Shopify App Store](https://apps.shopify.com/triplewhale-1).

## Quanto custa a Triple Whale?

A página oficial não mostra número. Ela diz que "all prices are based on a combination of your brand's annual GMV and the package you choose", que os planos pagos são assinaturas de 12 meses com usuários ilimitados, e manda agendar uma conversa ([pricing, consultado em 26/10/2026](https://www.triplewhale.com/pricing)). O preço de entrada publicado pela própria Triple Whale está na Shopify App Store: Foundation a US$ 219 por mês (ou US$ 2.190 por ano) e Automate a US$ 749 por mês (ou US$ 7.490 por ano), com "all charges billed in USD" ([Shopify App Store, consultado em 27/10/2026](https://apps.shopify.com/triplewhale-1)). O uso do Moby acima da cota mensal é comprado à parte ([planos](https://kb.triplewhale.com/en/articles/16046642-understanding-triple-whale-plans-foundation-automate-and-enterprise)).

_Tabela por faixa de GMV, não confirmada em fonte oficial: um snapshot de 26/07/2026 publicado pela Venon, concorrente da Triple Whale, vai de US$ 219/mês no Foundation (GMV anual abaixo de US$ 250 mil) a US$ 2.529/mês (US$ 15–20 milhões), e de US$ 749 a US$ 4.199/mês no Automate ([Venon](https://venon.io/blog/triple-whale-pricing)). Use só como ordem de grandeza e confirme com a Triple Whale._

Para a loja brasileira, some o câmbio. O help center diz que converte os valores para a moeda da loja pela cotação da OANDA, mas não lista as moedas suportadas, e o real não é citado ([help center](https://kb.triplewhale.com/en/articles/9590400-which-currencies-are-supported-in-triple-whale)).

## Por que a fonte brasileira pesa tanto nessa escolha?

Porque a métrica só fica certa se o pedido entra direito. Na Triple Whale, uma plataforma que não está na lista nativa entra como "Custom Sales Platform": você envia os pedidos pela API e instala o pixel ([documentação](https://triplewhale.readme.io/reference/custom-sales-platform-setup-overview)). Para uma loja VTEX, isso quer dizer que alguém do seu lado escreve e mantém essa integração. Se o envio falha numa Black Friday, o painel continua bonito e o número fica errado.

Depois do pedido vem a definição. Um exemplo com números redondos, sintético: a loja na VTEX faturou R$ 1 milhão em setembro pelo ERP, o GA4 registrou R$ 1,1 milhão porque contou [Pix que nunca foi pago](https://precisian.io/blog/pt-BR/posts/pix-quebra-o-purchase-do-ga4/), e o Mercado Livre vendeu R$ 200 mil que nenhuma plataforma de mídia enxerga. Qual desses é "a receita"? Pergunte ao seu Claude pelo MCP, sem essa definição escrita, e ele responde com a fonte mais à mão. Isso tem nome, [alucinação de métrica](https://precisian.io/blog/pt-BR/posts/alucinacao-de-metrica/), e o que vai numa definição que resolve está em [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/).

A Triple Whale também tem definição: o MCP dela usa "TW's real metric definitions and attribution logic" ([help center, MCP](https://kb.triplewhale.com/en/articles/15656798-triple-whale-mcp)). A diferença está em quem é o dono dela. Lá, a régua é da plataforma, igual para todas as marcas, o que permite benchmark entre lojas. Na Precisian, a definição é escrita com o seu time, versionada e aprovada por você, e sai com você no fim do contrato.

## O que os termos de uso dizem sobre o seu dado?

Vale ler antes de assinar. Os termos públicos do site dizem, na seção 2.1, que o usuário concede à Triple Whale uma licença "royalty-free, sublicensable, transferable, perpetual, irrevocable, nonexclusive, worldwide license to use, reproduce, modify, publish [...] and make derivative works of all such User Content" ([termos de uso, consultados em 27/10/2026](https://www.triplewhale.com/pages/terms-of-service)). A mesma seção diz que a empresa cria derivados "by aggregating data from multiple Users", inclusive para "training machine learning algorithms", e que usa "commercially reasonable efforts" para que esses derivados não identifiquem o usuário.

Duas ressalvas, para ser justo. O "User Content" é definido como o que você compartilha no site (dado de custo, de gasto, de frete, perguntas). E clientes pagos podem ter contrato próprio, não publicado, com outra redação. Não encontrei nos termos públicos uma cláusula de devolução do dado ao fim do contrato. Pergunte por escrito.

Se o tema é isolamento entre clientes num mesmo fornecedor, o que perguntar está em [isolamento por cliente no MCP](https://precisian.io/blog/pt-BR/posts/isolamento-por-cliente-mcp/).

## Quando escolher a Triple Whale, e não a Precisian?

**Marca DTC em Shopify, WooCommerce ou BigCommerce que compra muita mídia paga.** A integração é nativa, o pixel instala em minutos e o painel sai pronto. A Precisian não tem painel, de propósito: a entrega termina na camada semântica.

**Quem quer atribuição, modelo de mix e incrementalidade como produto.** É o centro da Triple Whale. A Precisian não vende atribuição nem modelo de mídia.

**Quem quer um agente que mexe na conta de anúncio.** O Moby age dentro das regras que você define. A Precisian não ativa campanha.

**Loja pequena começando.** O plano Free resolve, e a Precisian não tem plano sem mensalidade nem autosserviço.

**Operação fora do Brasil, em inglês e em dólar.** A Precisian atende o Brasil.

## O que recomendar, por perfil?

**Loja Shopify, time de mídia lendo painel todo dia:** Triple Whale, começando pelo Free ou pelo Foundation.

**Marca acima de US$ 10 milhões por ano que quer medição de mídia completa:** Triple Whale Enterprise com Compass, que é onde a própria empresa o recomenda ([help center](https://kb.triplewhale.com/en/articles/16046642-understanding-triple-whale-plans-foundation-automate-and-enterprise)).

**E-commerce brasileiro em VTEX ou Magento, com marketplace e ERP, sem time de dados, que quer o próprio Claude ou ChatGPT respondendo sobre receita:** Precisian. O dado entra pelas fontes brasileiras, a definição de receita é sua e versionada, e a IA é a que você já usa.

**Grupo com várias marcas, ou agência no meio:** pese C1 e C6 acima de tudo. Peça por escrito a cada fornecedor como o dado de uma marca fica separado do da outra e o que você leva ao sair. Para outras opções da categoria, veja [ferramentas de analytics para e-commerce](https://precisian.io/blog/pt-BR/posts/ferramentas-de-analytics-para-ecommerce/).

## O que este artigo não cobre?

Não testei a Triple Whale numa conta real nem medi a precisão do pixel dela. Não comparo atribuição, porque a Precisian não vende atribuição. A tabela por GMV completa vem de um concorrente da Triple Whale e não foi confirmada. O isolamento do dado entre clientes, o contrato de cliente pago e os destinos exatos do Data Warehouse Sync não estão em páginas públicas; onde a tabela diz "não declarado", é isso, e não "não". Os preços em dólar mudam sem aviso: confira antes de assinar.

---

Se o número que a sua IA devolve sobre receita não bate com o ERP, o primeiro passo é medir essa distância e descobrir qual definição cada fonte usou. O que a Precisian inclui para fechar essa distância, e como ela cobra, está em [preços da Precisian](https://precisian.io/precos), sem compromisso de contrato.
