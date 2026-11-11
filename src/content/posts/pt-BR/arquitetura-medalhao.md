---
title: "Arquitetura medalhão: o que são as camadas bronze, prata e ouro"
description: "Arquitetura medalhão organiza o dado em três camadas: bronze (bruto), prata (validado) e ouro (pronto para o negócio). A ouro não define a métrica."
slug: "arquitetura-medalhao"
lang: "pt-BR"
translationKey: "medallion-architecture"
publishedAt: 2026-11-11
tags: ["data-lake", "camada-semantica", "pipeline", "ecommerce", "data-warehouse"]
draft: false
llmSummary: "Arquitetura medalhão é um padrão de design que organiza o dado em camadas bronze (bruto), prata (validado) e ouro (enriquecido). A documentação da Databricks, atualizada em 29/10/2026, a chama de boa prática recomendada, mas não obrigatória, e admite várias camadas ouro por área."
citations: ["https://docs.databricks.com/aws/en/lakehouse/medallion", "https://learn.microsoft.com/en-us/fabric/onelake/onelake-medallion-lakehouse-architecture", "https://docs.databricks.com/aws/en/uc-semantics/metric-views", "https://learn.microsoft.com/en-us/azure/architecture/data-guide/scenarios/data-lake", "https://developers.vtex.com/docs/api-reference/orders-api#get-/api/oms/pvt/orders", "https://developers.mercadolivre.com.br/pt_br/gerenciamento-de-vendas"]
about: ["https://en.wikipedia.org/wiki/Data_lakehouse", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
cta: newsletter
---
Arquitetura medalhão é um padrão de design que organiza o dado de um lake em três camadas de qualidade crescente: bronze (bruto), prata (validado) e ouro (enriquecido para o negócio). A [documentação da Databricks](https://docs.databricks.com/aws/en/lakehouse/medallion), atualizada em 29 de outubro de 2026, chama o padrão de "boa prática recomendada, mas não um requisito" e admite que algumas empresas mantêm várias camadas ouro, uma por área.

> **Arquitetura medalhão** (*medallion architecture*, também chamada de *multi-hop*): padrão de design de dados em que cada camada recebe o dado da anterior e melhora sua estrutura e sua qualidade de forma incremental, do bronze ao ouro, sem apagar o original ([Databricks](https://docs.databricks.com/aws/en/lakehouse/medallion), lida em 11/11/2026).

As citações deste texto foram conferidas em 11 de novembro de 2026. As páginas da Databricks e da Microsoft estão em inglês; as traduções são livres. A Microsoft adotou o mesmo padrão no Fabric e a página dela remete à da Databricks ([Microsoft Learn](https://learn.microsoft.com/en-us/fabric/onelake/onelake-medallion-lakehouse-architecture), revisão de 12/02/2026).

## O que acontece em cada camada: bronze, prata e ouro?

A Databricks resume cada camada em uma linha: bronze é "ingestão de dado bruto", prata é "limpeza e validação", ouro é "modelagem dimensional e agregação". O detalhe de cada uma muda o que você consegue fazer depois.

| Camada | O que acontece (Databricks) | Quem usa (Databricks) | Exemplo num e-commerce brasileiro |
|---|---|---|---|
| **Bronze** | Ingestão bruta, validação mínima, histórico inteiro | Engenharia de dados, operação, auditoria | O JSON do pedido da VTEX e o relatório diário do Meta Ads exatamente como chegaram |
| **Prata** | Esquema, nulos, deduplicação, dado atrasado, conversão de tipo, junções | Engenharia, analistas, cientistas de dados | Uma linha por pedido, com data no mesmo fuso, status padronizado e o pedido do marketplace casado com o da loja |
| **Ouro** | Modelo dimensional, medidas, agregações por domínio | Analistas de negócio, BI, executivos | Venda diária por canal, custo de mídia por campanha, recompra por coorte |

**Bronze.** A Databricks diz que essa camada guarda o dado "nos formatos originais", cresce só por inclusão e serve para "reprocessamento e auditoria". Ela recomenda gravar a maioria dos campos como `string`, `VARIANT` ou `binary`, para que uma mudança de esquema na fonte não derrube a carga. Não é camada para analista consultar.

**Prata.** A documentação não recomenda escrever na prata direto da ingestão: uma mudança de esquema ou um registro corrompido na fonte quebraria a carga. A prata lê do bronze. A Databricks também pede "pelo menos uma representação validada e não agregada de cada registro", o que, no varejo, quer dizer uma linha por pedido antes de qualquer soma.

**Ouro.** É onde, nas palavras da documentação, se modela o dado "estabelecendo relações e definindo medidas". O exemplo da própria Databricks é uma *materialized view* chamada `weekly_bookings`, que soma `total_amount` como `total_revenue` por semana, imóvel e `status`.

## Como fica a arquitetura medalhão num e-commerce?

A Microsoft dá um exemplo de e-commerce no guia do Fabric. No bronze, a venda do site em JSON, o estoque em CSV e o CRM em exportação SQL. Na prata, "padronizar formatos de data", "converter toda moeda para dólar", "remover transações de teste" e "casar registros de cliente entre sistemas". No ouro, a tabela de vendas diárias, a de valor do cliente no tempo e a de previsão de estoque ([Microsoft Learn](https://learn.microsoft.com/en-us/fabric/onelake/onelake-medallion-lakehouse-architecture)).

Traduzindo para uma operação com loja VTEX, Mercado Livre, Meta Ads e Google Ads, o trabalho da prata é o que costuma dar mais briga:

- pedido do Mercado Livre e pedido da loja chegam com identificadores diferentes para o mesmo cliente;
- o Pix que ficou pendente e o boleto que venceu aparecem como pedido no bronze;
- cada plataforma de mídia declara a conversão na própria janela e no próprio fuso.

A ordem das camadas é a mesma discussão de [ETL e ELT](https://precisian.io/blog/pt-BR/posts/o-que-e-etl/): o medalhão é um desenho de ELT, em que o dado entra bruto e a transformação acontece dentro do lake, em etapas que se pode refazer.

## Por que a camada ouro não decide sozinha o que é receita?

Porque a ouro guarda tabelas, e a regra de negócio que gera o número costuma ficar espalhada nelas.

Volte ao exemplo da Databricks: `weekly_bookings` soma `total_amount` e mantém `status` como coluna. A tabela está correta. Mas quem consulta ainda precisa decidir se reserva cancelada entra na receita. Um analista filtra o cancelado; outro não filtra; o agente de IA que lê a tabela escolhe sozinho. São três números diferentes, e os três saem da camada ouro.

A própria documentação abre a porta para o problema: "alguns clientes criam várias camadas ouro para atender necessidades de negócio diferentes, como RH, finanças e TI". Com uma ouro de marketing e uma ouro de finanças, "receita" passa a ter duas definições, ambas certificadas pelo nome da camada. É o caso descrito em [mesma definição de receita](https://precisian.io/blog/pt-BR/posts/mesma-definicao-de-receita/).

A Databricks resolveu isso com um recurso separado, acima da ouro. As *metric views* do Unity Catalog existem, segundo a [documentação](https://docs.databricks.com/aws/en/uc-semantics/metric-views) (atualizada em 29/10/2026), porque "views comuns travam agregações e agrupamentos no momento da criação"; com a *metric view*, "você define a métrica uma vez" e qualquer consumidor agrupa como quiser. É o que chamamos de [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/): a definição versionada que todo sistema lê antes de calcular.

## Arquitetura medalhão é o mesmo que data lake, data warehouse ou camada semântica?

Não. São coisas de tipos diferentes, e é comum ver as quatro na mesma frase.

| | Arquitetura medalhão | Data lake | Data warehouse | Camada semântica |
|---|---|---|---|---|
| O que é | Padrão de organização em camadas | Repositório de dado bruto, esquema na leitura | Repositório estruturado, esquema na escrita | Definição versionada de métrica e entidade |
| O que guarda | Nada por si só; organiza o que está no lake | Tudo, no formato da fonte | Tabelas modeladas | Regras, não linhas |
| Responde "o que é receita?" | Não. Cada ouro pode ter a sua | Não | Só se a regra estiver escrita numa tabela | Sim, é a função dela |
| Onde aparece na prática | Bronze, prata e ouro dentro de um lake ou lakehouse | Armazenamento de objeto | Plataforma de warehouse | Arquivo de definição lido por BI, API e agente |

A Microsoft mostra que as fronteiras se misturam: um dos padrões que ela documenta põe bronze e prata em *lakehouse* e a ouro num *data warehouse* ([Microsoft Learn](https://learn.microsoft.com/en-us/fabric/onelake/onelake-medallion-lakehouse-architecture)). A diferença entre os repositórios está em [o que é data lake](https://precisian.io/blog/pt-BR/posts/o-que-e-data-lake/); a diferença entre warehouse e definição, em [camada semântica ou data warehouse](https://precisian.io/blog/pt-BR/posts/camada-semantica-ou-data-warehouse/).

## O que a arquitetura medalhão não é?

**Não é obrigatória.** A Databricks escreve que é recomendação, não requisito. Três camadas é convenção; há quem use duas, há quem crie ouro por área.

**Não é produto.** Ninguém compra "um medalhão". É a forma de nomear esquemas, tabelas e etapas de pipeline dentro de uma plataforma.

**Não é garantia de dado certo.** A prata valida formato, nulo e duplicidade. Ela não sabe que a sua operação considera venda só o pedido faturado.

**Não é camada de consumo.** A ouro alimenta BI, agente e automação, mas não diz a nenhum deles como ler a coluna. Sem essa regra escrita, a IA responde com fluência sobre um critério que ninguém aprovou, o que chamamos de [alucinação de métrica](https://precisian.io/blog/pt-BR/posts/alucinacao-de-metrica/).

## Quando vale organizar o dado em camadas?

Quando você precisa refazer um cálculo com o dado de origem e a fonte já não devolve esse dado. A API de pedidos da VTEX lista só pedidos criados nos últimos dois anos ([VTEX](https://developers.vtex.com/docs/api-reference/orders-api#get-/api/oms/pvt/orders)); o Mercado Livre guarda pedidos criados por até 12 meses ([Mercado Livre](https://developers.mercadolivre.com.br/pt_br/gerenciamento-de-vendas)). Se a regra de receita mudar em 2027, só um bronze guardado permite recalcular 2025 com a regra nova.

Um exemplo com números redondos, sintético: uma operação decide que cancelamento em até 7 dias deixa de contar como venda. Sem bronze, o histórico já agregado na ouro fica com a regra velha e a série quebra no mês da mudança. Com bronze, a prata é reprocessada e a série inteira passa a seguir uma regra só.

E quando não vale: uma loja, uma plataforma de mídia e perguntas que cabem nos relatórios nativos. Três camadas para uma fonte é custo de manutenção sem pergunta que o justifique.

## Onde a Precisian entra?

A entrega da Precisian é um data lake isolado por cliente, na infraestrutura da Precisian, com histórico completo do contrato e a camada semântica por cima. Como as camadas internas são organizadas não muda o que importa ao cliente: a definição de receita é uma, versionada e aprovada por ele, e é lida pela IA, pela API ou pelo BI do próprio cliente. A infraestrutura é nossa, o dado é seu. Você acessa a qualquer momento e, se sair, leva tudo.

## O que este artigo não cobre?

Não compara formatos de tabela (Delta, Iceberg, Parquet), frequência de ingestão nem custo de computação; a página da Databricks tem uma tabela própria sobre ingestão contínua e em lote. Não ensina a escrever *metric view*: a sintaxe está na [documentação](https://docs.databricks.com/aws/en/uc-semantics/metric-views). E não afirma quem cunhou o termo: a Databricks o documenta, e a Microsoft remete a ela, mas nenhuma das duas páginas data a origem.

---

Se a sua equipe tem uma camada ouro e ainda assim marketing e financeiro chegam a receitas diferentes, o primeiro passo é listar quantas tabelas ouro calculam receita e com qual filtro de status cada uma faz isso. O que mudou, o que quebrou e o que a pesquisa da Precisian mediu chega a cada quinze dias, às quintas, na [newsletter da Precisian](https://precisian.io/newsletter?utm_source=blog&utm_medium=cta&utm_campaign=arquitetura-medalhao&utm_content=texto).
