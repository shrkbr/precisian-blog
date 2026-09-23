---
title: "Deduplicar venda entre site e marketplace: não há chave comum"
description: "Os canais não devolvem chave comum, e documentam a remoção. A Amazon anonimiza o e-mail; o Magalu não devolve e-mail nenhum."
slug: "deduplicar-venda-site-marketplace"
lang: "pt-BR"
translationKey: "dedupe-orders-marketplace"
publishedAt: 2026-10-29
tags: ["marketplace", "divergencia-de-dados", "lgpd"]
draft: false
llmSummary: "Nao ha chave comum de comprador entre loja propria e marketplace: a Amazon documenta o e-mail como anonimizado e o Magalu nao devolve campo de e-mail. Origem de trafego nunca vem no pedido. Quantos pedidos e respondivel; quantos clientes distintos, nao."
citations: ["https://developer-docs.amazon/sp-api/reference/getorders", "https://developer-docs.amazon/sp-api/reference/getorderitems", "https://developer-docs.amazon/sp-api/docs/access-orders-pii", "https://api.integracommerce.com.br/Documentation/Orders", "https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-publicacaooriginal-156212-pl.html"]
about: ["https://pt.wikipedia.org/wiki/Marketplace", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

Você vende o mesmo produto no site e em três marketplaces e quer saber quantos clientes distintos comprou. A resposta honesta é que os canais não devolvem chave comum, e dois deles documentam isso por escrito. A Amazon descreve o campo como *"o endereço de e-mail anonimizado do comprador"* ([Amazon](https://developer-docs.amazon/sp-api/reference/getorders)). O Magalu não devolve campo de e-mail nenhum, e devolve CPF ([Integra Commerce](https://api.integracommerce.com.br/Documentation/Orders)). A Lei 13.709/2018 classifica CPF como dado pessoal ([Lei Geral de Proteção de Dados](https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-publicacaooriginal-156212-pl.html)), o que muda o que você pode fazer com a única chave que sobrou.

Não é falha de integração. É o desenho do canal.

> **O problema não é técnico.** Deduplicar exige uma chave que identifique a mesma pessoa nos dois lados. Os marketplaces removem justamente essa chave, por política, e documentam a remoção.

## Que identificador cada canal devolve de verdade?

Depende do canal, e a variação é maior do que qualquer ferramenta de integração admite.

**Amazon.** O e-mail existe, mas vem anonimizado, e o acesso é restrito. A tabela de redação de dados pessoais mostra que, para pedidos fora dos Estados Unidos, Japão e Singapura, o e-mail do comprador só aparece num caso: envio direto ao consumidor pelo próprio vendedor, com o papel de acesso restrito habilitado e o pedido em status específico ([Amazon](https://developer-docs.amazon/sp-api/docs/access-orders-pii)). Para a maior parte dos vendedores brasileiros, portanto, não aparece.

Existe um campo genérico de identificador fiscal, descrito apenas como *"o identificador fiscal do comprador"*, sem menção a CPF ([Amazon](https://developer-docs.amazon/sp-api/reference/getorders)). E existe um campo só do Brasil, `BuyerCounty`, documentado com a nota *"este atributo está disponível apenas no marketplace do Brasil"*.

**Magalu.** O bloco do cliente traz `CustomerPfCpf`, descrito como *"CPF do Consumidor"*, junto de nome, CNPJ, razão social e data de nascimento. E não traz campo de e-mail em lugar nenhum da estrutura ([Integra Commerce](https://api.integracommerce.com.br/Documentation/Orders)).

**Mercado Livre e Shopee.** Não vou nomear campos dos dois. A documentação do Mercado Livre é renderizada no navegador: a página devolve pouco menos de duzentos caracteres de texto para leitura automatizada, e o que devolve é o seletor de país. A da Shopee recusa o acesso. Não li nenhuma das duas, então não afirmo o que elas entregam. Quem publicar lista de campo desses dois sem abrir no navegador está copiando de outro blog.

Essa ausência, aliás, é parte do retrato: o canal que mais importa para o vendedor brasileiro é o que menos se deixa ler por máquina.

## E a origem da venda, vem no pedido?

Nunca. E é aqui que a maior parte das pessoas se engana com um campo.

A Amazon devolve `SalesChannel`, definido como *"o canal de vendas do primeiro item do pedido"*, e `MarketplaceId`, *"o identificador do marketplace onde o pedido foi feito"* ([Amazon](https://developer-docs.amazon/sp-api/reference/getorders)). Nenhum dos dois é origem de tráfego: os dois nomeiam o marketplace. Repare também no *"primeiro item"*, que é uma armadilha própria em pedido com vários itens.

O dado de tráfego existe, mas separado e agregado. O relatório de vendas e tráfego entrega por dia, semana ou mês, e por produto ([Amazon](https://developer-docs.amazon/sp-api/docs/report-type-values-analytics)). Não há como juntá-lo a um pedido específico.

O Magalu tem a mesma forma: `MarketplaceName` e `StoreName` dizem onde, não por quê.

A conclusão prática é dura e vale escrever no relatório: **atribuição de marketplace não se reconstrói a partir do pedido.** Ela é modelada ou não existe. É a mesma fronteira que faz [o marketplace ser um buraco negro de dados](https://precisian.io/blog/pt-BR/posts/marketplace-buraco-negro-de-dados/).

## Se não há chave, dá para casar por valor e horário?

Dá, e quebra em três lugares que a própria documentação descreve.

**Quebra no valor, por causa do status.** Quando um pedido da Amazon está em `Pending`, a consulta de itens *"não devolve informação sobre preço, impostos, frete, status de presente ou promoções"* ([Amazon](https://developer-docs.amazon/sp-api/reference/getorderitems)). Um cruzamento por valor descarta ou erra esses pedidos em silêncio, e silêncio é o pior modo de falha.

**Quebra na janela, por causa da redatação.** O filtro por última atualização seleciona pedidos alterados após determinado momento, e a documentação define atualização como *"qualquer mudança no status do pedido, incluindo a criação de um novo pedido"* ([Amazon](https://developer-docs.amazon/sp-api/reference/getorders)). Quem puxa por data de criação perde cancelamento. Quem puxa por última atualização vê o mesmo pedido reentrar em janelas seguintes. Essa é a duplicidade documentada, e ela não vem de bug nenhum.

**Quebra no status, por causa do enum.** `Canceled` e `Unfulfillable` convivem na mesma lista de status que `Shipped` e `Unshipped`. Uma deduplicação que ignora status conta pedido cancelado como venda.

Some a isso o direito de arrependimento em compra a distância, que estende a janela de devolução para além de qualquer período razoável de fechamento, e a conciliação de um mês só estabiliza semanas depois.

## CPF serve como chave de cruzamento?

Tecnicamente sim, juridicamente com condições, e a diferença importa mais do que a parte técnica.

A LGPD define dado pessoal como *"informação relacionada a pessoa natural identificada ou identificável"*, o que inclui CPF. E impõe três princípios que incidem direto sobre o uso dele como chave: **finalidade**, *"realização do tratamento para propósitos legítimos, específicos, explícitos e informados ao titular"*; **adequação**, *"compatibilidade do tratamento com as finalidades informadas ao titular"*; e **necessidade**, *"limitação do tratamento ao mínimo necessário para a realização de suas finalidades"* ([LGPD](https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-publicacaooriginal-156212-pl.html)).

Há um ponto que costuma passar batido e que atinge exatamente esse caso. O artigo 12, §2º, prevê que *"poderão ser igualmente considerados como dados pessoais [...] aqueles utilizados para formação do perfil comportamental de determinada pessoa natural, se identificada"*.

Unir pedidos de canais diferentes para montar a visão de um cliente **é** formação de perfil comportamental. O fato de a tabela de origem parecer despersonalizada não tira o resultado do escopo.

E não existe orientação da ANPD específica sobre uso de CPF como chave de cruzamento entre bases. Procurei e não encontrei. Quem afirmar que a autoridade autorizou ou proibiu essa prática está preenchendo uma lacuna com opinião.

## Então o que dá para fazer?

Separar duas perguntas que costumam ser tratadas como uma.

**"Quantos pedidos tivemos"** é respondível com precisão. Exige disciplina de janela e de status, não identidade: puxar por data de criação para o número do período, tratar cancelamento e devolução como linhas próprias, e nunca reaproveitar um recorte por última atualização como se fosse contagem de vendas.

**"Quantos clientes distintos tivemos"** não é respondível com os dados que os canais entregam. Onde há CPF, dá para cruzar com base legal declarada e escopo definido. Onde não há, a resposta honesta é um intervalo, não um número.

A tentação é fechar essa lacuna com um identificador probabilístico, casando nome parecido com endereço parecido. Funciona o suficiente para parecer certo e erra o suficiente para contaminar decisão, e o erro não aparece, porque não há verdade contra a qual conferir.

**Registre o recorte junto do número, sempre.** Pedidos criados no período, excluindo cancelados, contando marketplace e loja própria separadamente. Sem essa frase, o número volta a divergir no mês seguinte, pelo mesmo motivo que [marketing e financeiro não fecham a mesma receita](https://precisian.io/blog/pt-BR/posts/mesma-definicao-de-receita/).

## O que guardar desde já?

O que o canal devolve hoje, cru, antes de qualquer transformação.

A maior parte das operações descobre esse problema tarde, quando alguém pede a série histórica e ela não existe porque o conector só guardou o resumo. O que salva é tedioso e barato: persistir a resposta original do pedido, com o identificador do canal, o status no momento da coleta e o instante da coleta.

Três campos resolvem a maior parte das discussões futuras. **O identificador nativo do pedido no canal**, que é a única chave realmente estável que existe. **O status**, guardado como série e não sobrescrito, porque foi a sobrescrita que apagou o cancelamento que você vai precisar explicar. E **a data de coleta**, separada da data do pedido, que é o que permite reconstruir o que você sabia num momento passado.

Isso não deduplica nada por si só. Mas transforma a pergunta "quantos clientes distintos" de impossível em custosa, que é uma melhora real. E impede o modo de falha mais comum aqui: descobrir que o dado necessário existiu por alguns dias na API e ninguém o guardou.

## O que este artigo não cobre?

Não traz percentual de pedido duplicado. Procurei pesquisa com metodologia declarada sobre taxa de duplicidade entre loja própria e marketplace e não encontrei nenhuma. O que existe é material de fornecedor de integração, que vende a correção.

Não nomeia campos do Mercado Livre nem da Shopee, pelo motivo declarado acima. É a lacuna mais relevante deste texto e prefiro deixá-la visível a preenchê-la por inferência.

Não cita o texto do Código de Defesa do Consumidor. O site do Planalto recusou a leitura automatizada nas tentativas que fiz, e artigo de lei se cita com a lei aberta na frente.

E não mistura versões de API. As citações da Amazon vêm da versão que li, e a palavra *anonimizado* está documentada nela. Uma versão mais nova existe, com nomes de campo e regras de acesso diferentes, e carregar o adjetivo de uma para a outra seria exatamente o tipo de erro que este artigo está evitando.

Se o seu relatório soma loja própria e marketplace numa linha só, [vale uma conversa sobre o seu caso](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).
