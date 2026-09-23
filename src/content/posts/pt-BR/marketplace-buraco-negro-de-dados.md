---
title: "Marketplace é um buraco negro de dados: 28 campos de tráfego, zero de origem"
description: "O schema oficial da Amazon devolve 28 campos de tráfego por produto e nenhum de origem. Atribuir venda de marketplace a canal é impossível por construção."
slug: "marketplace-buraco-negro-de-dados"
lang: "pt-BR"
translationKey: "marketplace-data-blackhole"
publishedAt: 2026-09-26
tags: ["marketplace", "divergencia-de-dados", "ecommerce"]
draft: false
llmSummary: "A API oficial da Amazon entrega ao vendedor 28 campos de volume por produto e nenhum campo de origem, referrer, canal ou campanha. Somado à janela de dois anos e ao limite de uma chamada por minuto em getOrders, a consolidação de marketplace precisa ser incremental e persistida pelo vendedor."
citations: ["https://raw.githubusercontent.com/amzn/selling-partner-api-models/main/schemas/data-kiosk/analytics_salesAndTraffic_2024_04_24.graphql", "https://developer-docs.amazon/sp-api/docs/orders-api-rate-limits", "https://developer-docs.amazon/sp-api/docs/access-orders-pii", "https://developer-docs.amazon/sp-api/docs/orders-api-v0-reference"]
about: ["https://en.wikipedia.org/wiki/Online_marketplace", "https://precisian.io/datalake/"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

No schema `salesAndTraffic` de 24 de abril de 2024, publicado pela Amazon, a API devolve ao vendedor 28 campos de tráfego por produto e nenhum campo de origem. O schema oficial do Data Kiosk lista sessões, sessões B2B, sessões de navegador, sessões de aplicativo, page views e percentual de buy box, e não tem referrer, canal, campanha, UTM nem termo de busca ([schema oficial da Amazon no GitHub](https://raw.githubusercontent.com/amzn/selling-partner-api-models/main/schemas/data-kiosk/analytics_salesAndTraffic_2024_04_24.graphql)). Você recebe o denominador da conversão e nunca a procedência. É a diferença entre saber quantas pessoas entraram na loja e não ter ideia de qual rua elas vieram.

> **Buraco negro de marketplace**: conjunto de vendas cuja origem não é recuperável por nenhuma API oficial do canal, tornando a atribuição impossível por construção, não por falta de configuração.

## O que exatamente a Amazon entrega?

Volume, com granularidade generosa. Procedência, nunca.

O tipo `ByAsinTraffic` do schema traz `sessions`, `sessionsB2B`, `browserSessions`, `mobileAppSessions`, `pageViews`, `browserPageViews`, `mobileAppPageViews`, `buyBoxPercentage` e `unitSessionPercentage`, com variantes B2B e percentuais. Os argumentos da consulta `salesAndTrafficByAsin` são apenas `aggregateBy`, `startDate`, `endDate` e `marketplaceIds`.

É importante não confundir duas coisas que se parecem. `browserSessions` contra `mobileAppSessions` é **superfície de acesso**, não origem: diz se a pessoa estava no navegador ou no app da Amazon, não de onde ela veio. Quem lê esse par como canal está inventando um dado que o schema não tem.

A consequência é aritmética, não opinativa: **não existe caminho oficial para dizer que uma venda de marketplace veio de uma campanha sua.** Nenhuma correção de tag, nenhum UTM, nenhum pixel alcança isso, porque a página do produto não é sua e o campo não existe na resposta.

## Por que a identidade do comprador também não vem?

Porque ela é tratada como dado restrito, e a restrição é geográfica.

A documentação de PII da Orders API é específica: campos como `buyer.buyerEmail`, `buyer.buyerName` e o endereço de entrega exigem uma role restrita aprovada, e e-mail e nome do comprador ficam disponíveis **apenas para merchants dos Estados Unidos** ([Amazon SP-API](https://developer-docs.amazon/sp-api/docs/access-orders-pii)). Sem a role, nenhum PII retorna.

Há ainda supressão ativa de campo. A mesma página documenta que o telefone do destinatário "may be suppressed even when the above conditions are met" quando já não é necessário para o fulfillment, um pedido FBM já entregue, por exemplo. O dado existiu, cumpriu sua função logística e foi retirado da resposta.

Para um vendedor brasileiro isso significa, na prática, que a identidade do comprador de marketplace não é um dado seu. É um dado do canal, emprestado enquanto a operação exige.

## Por que a janela e o limite de chamada forçam a arquitetura?

Porque eles decidem, sozinhos, que a consolidação precisa ser incremental e guardada por você.

Dois limites documentados fazem esse trabalho:

| Limite | Valor documentado | O que isso impõe |
|---|---|---|
| Janela histórica | "Orders more than two years old don't show in the API response" | O histórico além de dois anos só existe se você o tiver salvo antes |
| `getOrders` | 0,0167 requisições por segundo, burst de 20 | Cerca de **uma chamada por minuto** |
| `searchOrders` (v2026-01-01) | 0,0056 requisições por segundo | Cerca de **uma chamada a cada três minutos** |

As fontes são a [referência da Orders API](https://developer-docs.amazon/sp-api/docs/orders-api-v0-reference) e a [página de rate limits](https://developer-docs.amazon/sp-api/docs/orders-api-rate-limits). A Amazon é explícita sobre a postura esperada: "optimize call patterns rather than expecting limit increases".

Some os dois. Uma chamada por minuto significa que reconstruir um ano de pedidos do zero leva tempo de calendário, não de processamento. E a janela de dois anos significa que, se você nunca persistiu, o dado mais antigo já não é recuperável em lugar nenhum.

**Isso não é preferência de arquitetura, é imposição da API.** Quem consolida marketplace precisa de um repositório próprio que ingere incrementalmente e guarda para sempre, porque a fonte não guarda por você e não deixa você correr atrás depois.

## E o Mercado Livre e a Shopee?

Aqui a resposta honesta inclui o que não consegui verificar.

A documentação de desenvolvedor do **Mercado Livre** respondeu com erro de acesso proibido à verificação automatizada em todos os endereços que testei, incluindo as páginas de dados de faturamento e de acesso a dados de cliente. Existe material indexado sugerindo que o dado pessoal do comprador saiu da resposta de pedidos com o Mercado Envios 2 e que o acesso a dado de cliente é vinculado ao Mercado Shops com processo de certificação, mas como não consegui abrir as páginas, **não afirmo nenhuma das duas coisas aqui**. Quem precisar decidir com base nisso deve abrir a documentação logado.

A **Shopee** é um caso diferente e mais simples de descrever: não encontrei a documentação do Open Platform acessível publicamente sem conta de desenvolvedor, e as referências a limites de consulta que circulam vêm de SDKs mantidos pela comunidade, não de documentação oficial. Isso é, por si só, informação útil para quem planeja: **a integração da Shopee não pode ser dimensionada antes de ter conta.**

O padrão nos três é o mesmo, com graus diferentes de opacidade. O canal conhece a jornada inteira. O vendedor recebe o resultado.

## Por que o canal guarda esse dado?

Não por descuido de API. A origem da venda é o ativo do marketplace, e entregá-la ao vendedor esvaziaria a proposta dele.

Vale enxergar o desenho sem indignação, porque ele é coerente. O marketplace investe em demanda, traz o comprador e cobra comissão por isso. Se devolvesse a origem, o vendedor poderia comprar aquela demanda direto na fonte e deixar de pagar a intermediação. A opacidade não é bug: é o modelo de negócio funcionando exatamente como foi desenhado.

Isso muda como o vendedor deveria reagir. Não adianta esperar que o campo apareça numa versão futura da API, nem contratar fornecedor que prometa resolver. O caminho é aceitar que o marketplace é um canal de aquisição com custo conhecido e origem desconhecida, e tratá-lo como tal: medir o que ele entrega no agregado, comparar com o custo total, e decidir alocação com essa granularidade, que é menor do que a da loja própria, e vai continuar sendo.

A armadilha aqui é sutil. Times que exigem do marketplace a mesma granularidade da loja própria acabam preenchendo a lacuna com estimativa, e a estimativa vira número oficial em duas reuniões. É melhor um relatório que diz "marketplace: R$ X, origem não atribuível" do que um que reparte esse valor entre canais com uma régua inventada. O primeiro é uma limitação declarada; o segundo é uma ficção que alguém vai usar para cortar verba.

## Como consolidar mesmo assim?

Aceitando que a origem não vem e construindo a comparação sobre o que vem.

**Trate marketplace como canal, não como origem.** A pergunta respondível não é "qual campanha gerou esta venda na Amazon", é "quanto o marketplace produziu no período contra a loja própria, com que margem". A primeira não tem resposta; a segunda tem, e é a que decide alocação.

**Deduplique por identificador de origem.** O mesmo pedido chega com identificadores diferentes em sistemas diferentes. Sem regra de deduplicação escrita, o mês fecha inflado, com aritmética correta, como sempre.

**Persista desde já, mesmo sem usar.** O custo de guardar é baixo; o custo de descobrir daqui a dois anos que a janela fechou é o histórico inteiro.

**Escreva a definição de "receita de marketplace" antes de comparar.** Comissão, frete subsidiado e devolução entram ou saem? Se isso não estiver escrito, a comparação com a loja própria mede duas coisas diferentes, o mesmo problema que faz [GA4 e plataforma divergirem](https://precisian.io/blog/pt-BR/posts/vtex-ga4-nao-batem/), aplicado a outro par.

É por isso que a consolidação de marketplace mora na camada de dados e não na de analytics. Um [data lake isolado por cliente](https://precisian.io/datalake/) que ingere incrementalmente respeitando o rate limit, e guarda além da janela do canal, é a única arquitetura em que essas perguntas continuam respondíveis no terceiro ano.

## O que não dá para recuperar?

A origem da venda, no passado e no futuro.

Se o campo não existe na API, ele não existe em lugar nenhum acessível ao vendedor. Nenhum fornecedor de atribuição resolve isso, e desconfie de quem disser que resolve, a checagem é simples e leva um minuto: peça para mostrarem o campo no schema oficial.

O que dá para fazer é medir incrementalidade por outro caminho, comparando períodos com e sem investimento, o que é mais trabalhoso e menos preciso, mas é honesto. Trocar uma resposta impossível por uma aproximada e declarada é melhor do que aceitar um número inventado com aparência de precisão.

## O que este artigo não cobre?

Não traz a participação de marketplace no e-commerce brasileiro, e a ausência é deliberada. Tentei rastrear esse número até a fonte primária e não cheguei lá: o painel da associação do setor publica os gráficos como **imagem**, sem página de metodologia, e a matéria de balanço mais recente atribui os números a um fornecedor de software com setecentas lojas, não a pesquisa própria. O relatório setorial mais citado é pago e não publica metodologia na página aberta. Há ainda um estudo muito usado que mede **audiência estimada**, não receita, e é rotineiramente lido como se medisse vendas.

Esse último ponto merece registro, porque é o mesmo erro que este artigo descreve: confundir um proxy com o dado. Preferi não ter número a ter um que não sobrevive à conferência.

Também não cobre integração técnica passo a passo, nem a API do Mercado Livre em detalhe, pelo motivo declarado acima.

Se você vende em marketplace e loja própria e não consegue comparar os dois, o primeiro passo é escrever a definição de receita de cada canal. [Agende uma conversa sobre o seu caso](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).
