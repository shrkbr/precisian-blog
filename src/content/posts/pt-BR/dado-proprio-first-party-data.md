---
title: "O que é dado próprio (first-party data) e onde ele deve morar"
description: "Dado próprio é o que a empresa coleta direto da relação com o cliente. Conversão modelada e audiência da plataforma parecem, mas não são."
slug: "dado-proprio-first-party-data"
lang: "pt-BR"
translationKey: "first-party-data"
publishedAt: 2026-10-23
tags: ["tracking", "privacidade", "consentimento", "lgpd", "data-lake", "ecommerce"]
draft: false
llmSummary: "Dado próprio (first-party data) é a informação que a empresa coleta diretamente do cliente: pedido, cadastro, evento do site. A política de lista de clientes do Google só aceita dado coletado em contexto próprio. Conversão modelada do Google Ads é estimativa, não dado próprio."
citations: ["https://support.google.com/adspolicy/answer/6299717?hl=pt-BR", "https://support.google.com/google-ads/answer/10081327?hl=pt-BR", "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm", "https://support.google.com/analytics/answer/7667196", "https://webkit.org/tracking-prevention/", "https://webkit.org/blog/14301/private-browsing-2-0/"]
about: ["https://en.wikipedia.org/wiki/First-party_data", "https://pt.wikipedia.org/wiki/Lei_Geral_de_Prote%C3%A7%C3%A3o_de_Dados_Pessoais", "https://precisian.io/demonstracao"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
---

Dado próprio (first-party data) é a informação que a empresa coleta diretamente da relação com o próprio cliente: o pedido, o cadastro, o evento no site, a conversa de atendimento. O Google usa o mesmo critério na política de Segmentação por lista de clientes: só é possível enviar informações "coletadas em contexto próprio", ou seja, em sites, apps, lojas físicas ou situações em que o cliente compartilhou o dado diretamente com o anunciante ([Google](https://support.google.com/adspolicy/answer/6299717?hl=pt-BR), consultado em 23/10/2026).

> **Dado próprio (first-party data)**: informação sobre o cliente que a empresa registrou em primeira mão, numa interação direta com ele, e sobre a qual ela decide o uso, a retenção e o destino.

## Como saber se um dado é próprio de verdade?

A definição de dicionário para em "coletado por você". Na operação, ela não basta, porque muito dado passa pelas suas mãos sem ser seu. Três perguntas resolvem, e o dado só é próprio se passar nas três.

**Quem coletou, e numa relação com quem?** O pedido feito na sua loja VTEX nasce de uma relação direta entre o cliente e a sua empresa. A lista de "pessoas parecidas com seus compradores" nasce da relação entre essas pessoas e a plataforma de anúncio. A segunda pode ser útil, mas não é sua.

**O dado é observação ou estimativa?** Dado próprio registra um fato: o pedido 48213 foi pago por Pix às 14h02. Um número que a plataforma calcula para preencher o que ela não viu é outra coisa, mesmo quando aparece na mesma coluna.

**Quem decide o que acontece com ele?** A LGPD tem um nome para isso. Controlador é a pessoa "a quem competem as decisões referentes ao tratamento de dados pessoais"; operador é quem trata o dado "em nome do controlador" ([Lei 13.709/2018, art. 5º, VI e VII](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)). Se você não consegue decidir por quanto tempo o dado fica, quem acessa e para onde ele vai, ele está sob o controle de outra pessoa.

## O que parece dado próprio e não é?

A tabela separa o que é dado próprio do que só parece ser.

| Dado | É dado próprio? | Por quê |
|---|---|---|
| Pedido no ERP ou na plataforma de e-commerce | Sim | Fato registrado por você, na relação direta com o comprador |
| Cadastro do cliente (e-mail, CPF, endereço) | Sim | O cliente entregou a você, com base legal sua |
| Evento do site (visualização, carrinho, compra) | Sim na coleta, parcial na guarda | A cópia que fica no GA4 obedece à retenção do Google |
| Conversa de atendimento no WhatsApp | Sim, se for registrada | Se mora só no celular do vendedor, ninguém a consulta |
| Venda feita no marketplace | Parcial | O pedido chega até você; o comprador e a origem do clique ficam com a plataforma |
| Conversão modelada do Google Ads | Não | É estimativa da plataforma, não observação sua |
| Audiência semelhante (lookalike) da plataforma | Não | A lista é sua; o público derivado dela mora e opera dentro da plataforma |
| Dado de terceiro comprado ou alugado | Não | Coletado por outra empresa, numa relação que não é a sua |

**O evento do site.** Ele é coletado em contexto próprio, mas a cópia que o time consulta costuma ser a do GA4. Numa propriedade padrão, o dado em nível de evento fica guardado por "2 meses" ou "14 meses", e essa configuração afeta as explorações e os funis, não os relatórios agregados ([Google](https://support.google.com/analytics/answer/7667196), consultado em 23/10/2026). Quem quer comparar a Black Friday de dois anos atrás em nível de evento descobre que o dado era próprio na coleta e emprestado na guarda. O tema da retenção está em [quanto tempo guardar dado de marketing](https://precisian.io/blog/pt-BR/posts/quanto-tempo-guardar-dado-de-marketing/).

**A venda do marketplace.** O pedido é seu e entra no seu faturamento. A relação com o comprador, o canal de contato e a origem do clique pertencem à plataforma. A API da Amazon devolve 28 campos de tráfego por produto e nenhum de origem, como está em [marketplace é um buraco negro de dados](https://precisian.io/blog/pt-BR/posts/marketplace-buraco-negro-de-dados/).

## Por que a conversão modelada não é dado próprio?

Porque o próprio Google diz que ela é previsão. Segundo a documentação, "a modelagem de conversão usa dados que não identificam o usuário para quantificar as conversões", aplicada onde a plataforma sabe que não consegue observar a atribuição. A estimativa determina se uma interação com o anúncio levou à conversão, "e não se uma conversão realmente aconteceu" ([Google Ads](https://support.google.com/google-ads/answer/10081327?hl=pt-BR), consultado em 23/10/2026).

E, nas palavras do Google, "na coluna 'Conversões', o Google informa as conversões estimadas e observadas", juntas. O número parece um fato da sua operação e é, em parte, uma estimativa feita por quem vende a mídia.

A modelagem pode estar certa e, ainda assim, o número não serve como fonte de verdade da sua receita. O GA4 faz o mesmo com o consentimento negado, e é por isso que [a interface do GA4 e o export para o BigQuery nunca batem](https://precisian.io/blog/pt-BR/posts/consent-mode-dado-modelado/). O dado próprio é o pedido que existe no seu sistema independentemente do modelo de alguém.

## O que dado próprio não é?

**Não é tecnologia de coleta.** Server-side tagging muda de onde a requisição sai e quem grava o cookie. É uma decisão de coleta, discutida em [server-side tagging vale a pena?](https://precisian.io/blog/pt-BR/posts/server-side-tagging-vale-a-pena/). Coletar em primeira mão é condição necessária, mas não suficiente: dado coletado por você e guardado só na plataforma de outra empresa continua sob as regras dela.

**Não é sinônimo de dado guardado no seu servidor.** Propriedade é sobre quem decide, não sobre o endereço físico do disco. A LGPD admite que o operador trate o dado em nome do controlador. O que importa é você manter o poder de decidir e de levar o dado embora.

**Não é dado anônimo.** O pedido tem CPF, endereço e telefone. Ser seu não dispensa base legal: a LGPD lista, entre outras, o consentimento, a execução de contrato e o legítimo interesse ([art. 7º, I, V e IX](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)). E o titular mantém direitos sobre ele, inclusive a portabilidade (art. 18, V).

**Não é tendência de 2026.** A pressão para depender dele vem de perda de sinal estrutural, não de uma data.

## Por que a perda de sinal empurra tudo para o dado próprio?

Porque o sinal que a plataforma de mídia observa encolhe por várias causas ao mesmo tempo, e nenhuma depende de um anúncio futuro.

O cookie de terceiro continua ligado no Chrome, e o substituto planejado foi aposentado em outubro de 2025, como está em [o cookie de terceiro não acabou](https://precisian.io/blog/pt-BR/posts/cookie-de-terceiro-o-que-mudou/). A perda real vem de outros lugares:

- O Safari apaga cookies criados em JavaScript e todo armazenamento gravável por script "após 7 dias sem interação do usuário com o site" ([WebKit](https://webkit.org/tracking-prevention/)).
- Na navegação privada do Safari, parâmetros de URL usados para rastreamento por clique ou por usuário são removidos antes da navegação, enquanto parâmetros só de campanha passam ([WebKit, 16/07/2024](https://webkit.org/blog/14301/private-browsing-2-0/)).
- Quem recusa o consentimento vira estimativa na interface do GA4, não evento.

Cada um desses mecanismos tira um pedaço do que a plataforma vê. O pedido no seu sistema não perde nada: ele foi pago, faturado e entregue, com ou sem cookie. Na minha leitura, é esse o critério prático para quem decide verba de mídia: o pedido continua registrado mesmo quando o resto do sinal vira estimativa.

## Onde o dado próprio deve morar?

Fora da plataforma que o usa para vender mídia para você, sob uma retenção decidida por você, e junto do pedido.

**Fora da plataforma de mídia.** O Google Ads e a Meta precisam do seu dado para otimizar campanha, e faz sentido enviá-lo. Mas a cópia de referência não pode ser a que mora lá, porque lá ela é misturada a modelo e obedece à retenção e ao formato de quem a recebe.

**Com retenção decidida por você.** Se a sua comparação anual depende de uma configuração de 14 meses de outra empresa, o horizonte da sua análise não é seu.

**Junto do pedido.** O evento do site, a conversa de WhatsApp e o clique valem pouco soltos. Ligados ao pedido, viram resposta para "qual canal trouxe o cliente que voltou a comprar". É por isso que [o WhatsApp vira um funil escuro](https://precisian.io/blog/pt-BR/posts/atribuicao-whatsapp-dark-funnel/) quando a conversa não é guardada com o ID da venda.

Na prática, isso é um data lake com o histórico completo, e uma camada de definição em cima dele que diz o que conta como venda, cliente e receita. A diferença entre os tipos de armazenamento está em [data lake, data warehouse ou lakehouse](https://precisian.io/blog/pt-BR/posts/data-lake-ou-data-warehouse/).

A Precisian opera exatamente essa parte: um data lake isolado por cliente, na infraestrutura da Precisian, com a camada semântica em cima e acesso pela IA, pela API ou pelo BI que o seu time já usa. A infraestrutura é nossa, o dado é seu. Você acessa a qualquer momento e, se sair, leva tudo.

## Quando isso passa a importar na sua operação?

Três sinais concretos, e basta um.

**Duas plataformas reportam a mesma venda.** Se a soma das conversões declaradas passa do pedido faturado, você está decidindo verba com número que inclui estimativa de quem vende a mídia.

**A pergunta precisa de mais de 14 meses.** Sazonalidade, coorte de recompra e LTV por canal pedem histórico em nível de evento ou de pedido que a retenção de evento do GA4 padrão, de no máximo 14 meses, não guarda ([Google](https://support.google.com/analytics/answer/7667196)).

**Parte relevante da venda passa por marketplace ou WhatsApp.** Nos dois casos, a relação com o comprador fica em parte fora do seu sistema, e só o que você registrar ao lado do pedido continua seu.

## O que este artigo não cobre?

Não é orientação jurídica sobre base legal de tratamento, e não compara ferramentas de coleta ou de CDP. Também não detalha as regras de acesso a dado de comprador do Mercado Livre e da Shopee: a documentação de desenvolvedor dos dois não deu acesso estável à verificação, e por isso o artigo não afirma nada sobre elas.

---

Se a sua operação toma decisão de verba com a coluna de conversões da plataforma e não com o pedido faturado, o primeiro passo é medir a distância entre os dois. [Veja na prática como o dado próprio fica guardado e consultável](https://precisian.io/demonstracao) — sem compromisso de contrato, mas sem promessa de resposta em 30 minutos também.
