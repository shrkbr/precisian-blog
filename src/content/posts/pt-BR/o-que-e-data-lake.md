---
title: "O que é data lake (e quando um e-commerce precisa de um)"
description: "Data lake guarda o dado no formato em que a fonte entrega e aplica o esquema só na leitura. No e-commerce, ele guarda o histórico que as APIs apagam."
slug: "o-que-e-data-lake"
lang: "pt-BR"
translationKey: "o-que-e-data-lake"
publishedAt: 2026-11-03
tags: ["data-lake", "ecommerce", "marketplace", "data-warehouse", "camada-semantica"]
draft: false
llmSummary: "Data lake é um repositório que guarda dado no formato nativo e aplica o esquema só na leitura (schema-on-read, Microsoft Learn). Num e-commerce, guarda o que a fonte apaga: a API de pedidos da VTEX devolve só os últimos 2 anos, e o Mercado Livre guarda pedidos por até 12 meses."
citations: ["https://learn.microsoft.com/en-us/azure/architecture/data-guide/scenarios/data-lake", "https://aws.amazon.com/what-is/data-lake/", "https://cloud.google.com/learn/what-is-a-data-lake", "https://developers.vtex.com/docs/api-reference/orders-api#get-/api/oms/pvt/orders", "https://developers.vtex.com/docs/guides/orders-feed", "https://developers.mercadolivre.com.br/pt_br/gerenciamento-de-vendas", "https://support.google.com/analytics/answer/7667196", "https://support.google.com/google-ads/answer/15188209", "https://developers.facebook.com/blog/post/2025/10/16/ads-insights-api-metric-availability-updates/"]
about: ["https://en.wikipedia.org/wiki/Data_lake", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
---

Data lake é um repositório que guarda o dado no formato em que a fonte o entregou e só aplica estrutura na hora da leitura, abordagem que a Microsoft chama de *schema-on-read* ([Microsoft Learn](https://learn.microsoft.com/en-us/azure/architecture/data-guide/scenarios/data-lake), revisão de 16/04/2026). Num e-commerce, a função prática é guardar o histórico que as fontes apagam: a API de pedidos da VTEX só devolve pedidos criados nos últimos dois anos ([VTEX](https://developers.vtex.com/docs/api-reference/orders-api#get-/api/oms/pvt/orders)).

> **Data lake**: repositório central que recebe dado estruturado, semiestruturado e não estruturado, de várias fontes, sem esquema imposto na escrita. A transformação acontece quando alguém consulta, e o dado original continua guardado como chegou.

Todas as citações de documentação deste texto foram conferidas no dia da publicação. As de AWS, Google Cloud e Microsoft estão em inglês no original; as traduções são livres.

## O que AWS, Google Cloud e Microsoft dizem que é um data lake?

As três dizem quase a mesma coisa, com palavras diferentes.

| Fonte | Definição (trecho original) | Onde põe a ênfase |
|---|---|---|
| [AWS](https://aws.amazon.com/what-is/data-lake/) | "a centralized repository that allows you to store all your structured and unstructured data at any scale" | Guardar "as-is", sem estruturar antes |
| [Google Cloud](https://cloud.google.com/learn/what-is-a-data-lake) | "a centralized, scalable, and secure repository designed to store, process, and analyze large amounts of structured, semistructured, and unstructured data in its native format" | Ingerir "without the constraints of pre-defined schemas" |
| [Microsoft](https://learn.microsoft.com/en-us/azure/architecture/data-guide/scenarios/data-lake) | "a storage repository that holds large volumes of data in its native, raw format" | *Schema-on-read* contra o *schema-on-write* do warehouse |

Nas três, ninguém decide a forma do dado na entrada. A AWS escreve que "the structure of the data or schema is not defined when data is captured"; a Microsoft, que o lake guarda tudo "in their original, untransformed state" e transforma "only when the data is needed".

AWS e Microsoft também fazem o mesmo aviso, com a mesma expressão, *data swamp* (pântano de dados), para o lake sem catálogo: a AWS diz que o dado então "cannot be found, or trusted"; a Microsoft, que fica "present but inaccessible or misunderstood". As duas páginas que vendem o serviço registram o modo de falha dele.

## Como um data lake funciona na prática, num e-commerce?

Pense nas fontes de uma operação média brasileira: a loja na VTEX, o Mercado Livre, Meta Ads, Google Ads e o GA4. Cada uma devolve um formato diferente. O pedido da VTEX vem num JSON aninhado; o relatório de mídia, em linhas por campanha e dia; o evento do GA4, com parâmetros repetidos dentro de cada evento.

O lake recebe tudo isso como veio, separado por fonte e por data de coleta. A Microsoft descreve a organização mais comum em três camadas, a chamada arquitetura medalhão ([Microsoft Learn](https://learn.microsoft.com/en-us/azure/architecture/data-guide/scenarios/data-lake)):

- **Bruta (bronze):** o dado como chegou, com transformação mínima.
- **Limpa (prata):** validado e padronizado: moeda, fuso, nome de canal.
- **Curada (ouro):** tabelas prontas para o negócio, que alimentam relatório e consulta.

A camada bruta parece desperdício e é a mais valiosa. Quando a regra muda (o frete sai da receita, um status de pedido passa a contar como cancelado), dá para recalcular o ano inteiro a partir dela. Sem a cópia bruta, o histórico fica preso à regra antiga.

Na VTEX, a ingestão precisa de desenho. A própria VTEX diz que o endpoint `GET /api/oms/pvt/orders` "should not be used for integrations", que ele lista no máximo 30 páginas de até 100 pedidos (`per_page`), devolve só pedidos já indexados, o que leva cerca de quatro minutos, e desde 3 de outubro de 2018 não traz a propriedade `items` ([VTEX](https://developers.vtex.com/docs/api-reference/orders-api#get-/api/oms/pvt/orders)). Para integração, a VTEX indica o Feed ou o Hook de pedidos. E o feed recém-configurado só contém pedidos alterados depois da configuração ([VTEX, Orders Feed](https://developers.vtex.com/docs/guides/orders-feed)). O passado não entra sozinho: alguém precisa buscá-lo pedido a pedido enquanto ele ainda existe na fonte.

## Quanto tempo cada fonte de um e-commerce guarda o próprio dado?

Cada uma tem sua regra, e nenhuma guarda para sempre.

| Fonte | O que a documentação oficial diz | Fonte |
|---|---|---|
| VTEX, listagem de pedidos | Só pedidos criados nos últimos 2 anos | [VTEX](https://developers.vtex.com/docs/api-reference/orders-api#get-/api/oms/pvt/orders) |
| Mercado Livre, `/orders/search` | Pedidos salvos por até 12 meses; na busca como vendedor, os cancelados são filtrados | [Mercado Livre](https://developers.mercadolivre.com.br/pt_br/gerenciamento-de-vendas) |
| GA4 padrão, explorações | Evento e usuário retidos por 2 ou 14 meses; 26, 38 e 50 meses só no Analytics 360 | [Google](https://support.google.com/analytics/answer/7667196) |
| Google Ads, dado diário e semanal | Disponível por 37 meses desde 1º/06/2026; mensal, trimestral e anual por 11 anos | [Google](https://support.google.com/google-ads/answer/15188209) |
| Meta Ads Insights API | Totais por até 37 meses; breakdowns afetados, contagens únicas e corte por hora em 13 meses; frequência em 6, desde 12/01/2026 | [Meta](https://developers.facebook.com/blog/post/2025/10/16/ads-insights-api-metric-availability-updates/) |

A frase do Mercado Livre é literal: *"Lembre-se que atualmente são salvas orders criadas até 12 meses, e se realizar uma busca como vendedor, serão filtradas ordens canceladas."* Na prática, os pedidos de marketplace da Black Friday de 2024 já não estão na API hoje. E a comparação de cancelamento entre canais precisa de uma cópia feita antes, porque a busca padrão do vendedor nem devolve o cancelado.

O Google Ads diz o mesmo de outro jeito: depois do prazo, o dado "will not be accessible via the Google Ads interface or APIs". Quando a janela anda, a série do seu relatório passa a começar mais tarde, e nenhuma dessas fontes avisa. A parte do GA4 está detalhada em [quanto tempo guardar dado de marketing](https://precisian.io/blog/pt-BR/posts/quanto-tempo-guardar-dado-de-marketing/).

## Data lake é a mesma coisa que data warehouse?

Não. A diferença é o momento em que alguém decide a forma do dado, e isso muda o que cada um responde bem.

| Critério | Data lake | Data warehouse | Relatório nativo da plataforma |
|---|---|---|---|
| Forma do dado | Como a fonte entregou | Modelado em tabelas antes da carga | O que a plataforma escolheu mostrar |
| Quando o esquema é aplicado | Na leitura | Na escrita | Não se aplica |
| Histórico | O que você copiou, pelo tempo que decidir | O que foi carregado e modelado | A janela de retenção da plataforma |
| Reprocessar quando a regra muda | Sim, a partir do bruto | Só se o bruto também foi guardado | Não |
| Consulta rápida de negócio | Só na camada curada | Sim | Sim, dentro da própria plataforma |
| Junta fontes diferentes | Guarda todas; a junção é trabalho de modelagem | Sim, se alguém modelou | Não |

As duas primeiras colunas seguem a comparação da [Microsoft](https://learn.microsoft.com/en-us/azure/architecture/data-guide/scenarios/data-lake), que também registra que o lake costuma ser a origem do warehouse. A terceira coluna é a que a maioria dos e-commerces usa hoje sem chamar de arquitetura.

O comparativo completo, com lakehouse e a ordem em que um e-commerce precisa de cada peça, está em [data lake ou data warehouse](https://precisian.io/blog/pt-BR/posts/data-lake-ou-data-warehouse/).

## O que um data lake não é?

**Não é uma definição de métrica.** O lake guarda a coluna `valor_pedido` e soma o que estiver dentro. Se a receita inclui frete, se o Pix pendente conta, se o pedido cancelado no dia seguinte sai do mês: nada disso está no lake. Essas regras ficam na [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/). Sem ela, um agente de IA lendo o lake responde com fluência sobre uma regra que ninguém aprovou, o que chamamos de [alucinação de métrica](https://precisian.io/blog/pt-BR/posts/alucinacao-de-metrica/).

**Não é um CDP.** O CDP mantém um perfil unificado do cliente para ativar campanha; o lake guarda a operação inteira (mídia, frete, devolução) para análise. A diferença está em [CDP ou data lake](https://precisian.io/blog/pt-BR/posts/cdp-ou-data-lake/).

**Não é um dashboard.** Lake não mostra nada. O consumo acontece no BI, na planilha, na automação ou na IA de quem consulta.

**Não é um balde de arquivos.** Sem catálogo, dono e regra de acesso, vira o *data swamp* que AWS e Microsoft descrevem.

## Quando um e-commerce precisa de um data lake?

Em três situações, e basta uma delas.

**Quando a pergunta precisa de mais histórico do que a fonte guarda.** Comparar duas Black Fridays, medir recompra com ciclo de oito meses, fechar coorte de um ano. Com o [Mercado Livre](https://developers.mercadolivre.com.br/pt_br/gerenciamento-de-vendas) em 12 meses e a listagem da [VTEX](https://developers.vtex.com/docs/api-reference/orders-api#get-/api/oms/pvt/orders) em 2 anos, qualquer pergunta de sazonalidade que cruze os dois canais já depende de cópia própria.

**Quando a segunda fonte fala do mesmo número.** Loja própria e marketplace vendendo o mesmo produto, Meta e Google declarando a mesma venda. A reconciliação precisa das duas versões cruas lado a lado, e o relatório nativo de cada plataforma só mostra a dela.

**Quando a IA vai ler o dado.** Agente consultando API de plataforma ao vivo herda a janela de retenção dela e não avisa que a série encolheu.

Um exemplo sintético, com datas reais: em novembro de 2026, uma operação com VTEX, Mercado Livre, Meta e Google Ads quer comparar as Black Fridays de 2024 e 2025 antes de planejar a deste ano. Pela [listagem da VTEX](https://developers.vtex.com/docs/api-reference/orders-api#get-/api/oms/pvt/orders), ela ainda tem os dois anos, porque 2024 está dentro da janela de dois anos. Pelo [Mercado Livre](https://developers.mercadolivre.com.br/pt_br/gerenciamento-de-vendas), tem só 2025, e sem os cancelados na busca de vendedor. Metade da comparação de marketplace já não existe na fonte. Em dezembro, a Black Friday de 2024 sai também da listagem da VTEX.

E quando ainda não precisa: com uma loja, uma plataforma de mídia e perguntas que cabem no último ano, o relatório nativo resolve. Lake para fonte única é custo sem dor correspondente.

## Montar ou contratar?

As duas opções existem, e o custo de montar é calculável com tabela oficial; os números estão em [construir ou contratar um data lake](https://precisian.io/blog/pt-BR/posts/construir-ou-contratar-data-lake/).

É nesse ponto que a Precisian entra. A entrega é um data lake isolado por cliente, na infraestrutura da Precisian. Ele guarda o histórico completo do contrato, além da janela de cada plataforma, com conectores mantidos (entre eles o da VTEX) e a camada semântica por cima. Para as demais plataformas, a regra é uma: conectamos qualquer fonte que tenha API aberta. O acesso é pela API, pelo servidor MCP ou pelo BI que o seu time já usa. A infraestrutura é nossa, o dado é seu. Você acessa a qualquer momento e, se sair, leva tudo.

## O que este artigo não cobre?

Não compara serviços de armazenamento nem formatos de tabela (Parquet, Iceberg, Delta). Não traz preço: o artigo de build vs buy usa a tabela oficial da AWS para isso.

A tabela de retenção reflete a documentação de cada plataforma na data de publicação. As regras mudam: a do [Google Ads](https://support.google.com/google-ads/answer/15188209) começou a valer em junho de 2026, a da [Meta](https://developers.facebook.com/blog/post/2025/10/16/ads-insights-api-metric-availability-updates/) em janeiro. Antes de decidir a sua política, confira a página de cada fonte na data.

E o Mercado Livre não declara, na [página consultada](https://developers.mercadolivre.com.br/pt_br/gerenciamento-de-vendas), se o limite de 12 meses vale também para o painel do vendedor ou só para a API. Tratei como limite da API.

---

Se a sua operação vende em loja própria e marketplace, o primeiro passo é medir quantos meses de pedido cada fonte ainda guarda hoje e quantos a sua análise precisa. [Veja como o lake da Precisian organiza isso na prática](https://precisian.io/demonstracao), sem compromisso de contrato, mas sem promessa de resposta em 30 minutos também.
