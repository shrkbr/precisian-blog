---
title: "O que é lakehouse (e quando o e-commerce precisa de um)"
description: "Lakehouse é um data lake com uma camada de transação por cima: tabelas versionadas sobre arquivos abertos, consultáveis por SQL e por Python."
slug: "o-que-e-lakehouse"
lang: "pt-BR"
translationKey: "o-que-e-lakehouse"
publishedAt: 2026-11-16
tags: ["data-lake", "data-warehouse", "ecommerce", "pipeline", "camada-semantica"]
draft: false
llmSummary: "Lakehouse é o sistema de dados que põe transação ACID, versionamento e auditoria sobre arquivos abertos de um data lake (Armbrust et al., CIDR 2021). Formatos como Delta Lake e Apache Iceberg fazem isso com um log de commits; o time travel do Databricks vale por 7 dias por padrão."
citations: ["https://www.cidrdb.org/cidr2021/papers/cidr2021_paper17.pdf", "https://docs.databricks.com/aws/en/lakehouse/", "https://learn.microsoft.com/en-us/fabric/data-engineering/lakehouse-overview", "https://iceberg.apache.org/spec/", "https://github.com/delta-io/delta/blob/master/PROTOCOL.md", "https://docs.databricks.com/aws/en/delta/history", "https://cloud.google.com/discover/what-is-a-data-lakehouse", "https://hudi.apache.org/docs/overview", "https://aws.amazon.com/what-is/data-lakehouse/"]
about: ["https://en.wikipedia.org/wiki/Data_lakehouse", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
cta: newsletter
---
Lakehouse é um data lake com uma camada de transação por cima: os arquivos continuam abertos e baratos, e um registro de metadados transforma cada pasta numa tabela com versão, esquema e commit atômico. O termo foi definido por Armbrust, Ghodsi, Xin e Zaharia no CIDR de janeiro de 2021 como um sistema que oferece "transações ACID, versionamento de dados, auditoria, indexação, cache e otimização de consulta" sobre armazenamento de baixo custo ([paper](https://www.cidrdb.org/cidr2021/papers/cidr2021_paper17.pdf)).

> **Lakehouse**: "um sistema de gestão de dados baseado em armazenamento de baixo custo e acesso direto que também oferece recursos de gestão e desempenho de um SGBD analítico tradicional, como transações ACID, versionamento de dados, auditoria, indexação, cache e otimização de consulta" ([Armbrust et al., CIDR 2021](https://www.cidrdb.org/cidr2021/papers/cidr2021_paper17.pdf), tradução livre).

As páginas citadas aqui foram conferidas em 16 de novembro de 2026. Todas estão em inglês; as traduções são livres. Os quatro autores do paper trabalhavam na Databricks, que vende lakehouse: a definição é a primária, e as previsões de mercado do mesmo texto são a opinião de quem vende.

## Por que o lakehouse apareceu?

Porque a arquitetura comum em 2021 copiava o mesmo dado duas vezes. O paper descreve o modelo de duas camadas, "dominante na indústria" segundo os autores: o dado entra primeiro num lake, por ETL, e depois é carregado de novo num warehouse. Cada etapa, escrevem eles, "arrisca falhar ou introduzir bugs", e o cliente paga o armazenamento em dobro ([CIDR 2021](https://www.cidrdb.org/cidr2021/papers/cidr2021_paper17.pdf)).

Num e-commerce, o sintoma aparece assim: a tabela de pedidos do warehouse foi carregada ontem à noite, a cópia bruta no lake recebeu as alterações de status de hoje, e as duas já não somam o mesmo número. O lakehouse propõe ficar com uma cópia só: os arquivos do lake, com garantias de banco de dados por cima.

## Como um lakehouse funciona na prática?

O mecanismo é um formato de tabela aberto. Os três mais citados são Delta Lake, Apache Iceberg e Apache Hudi, e os três fazem a mesma coisa com desenhos diferentes: registram, num arquivo de metadados, quais arquivos de dados compõem a tabela em cada versão.

**No Delta Lake**, o registro é uma pasta chamada `_delta_log`, com um arquivo JSON por commit, numerados em sequência (`00000000000000000042.json`, `...43.json`). A [especificação do protocolo](https://github.com/delta-io/delta/blob/master/PROTOCOL.md) diz que a tabela tem "uma única história serial de versões atômicas", nomeadas por inteiros contíguos e crescentes.

**No Apache Iceberg**, o estado da tabela vive em arquivos de metadados, e "toda mudança de estado cria um novo arquivo de metadados e substitui o antigo com uma troca atômica" ([Iceberg Table Spec](https://iceberg.apache.org/spec/)). Cada versão é um *snapshot*. Quem lê usa o snapshot em vigor no momento da leitura e não é afetado por quem escreve ao mesmo tempo; a spec chama isso de isolamento serializável.

**O Apache Hudi** se apresenta como o projeto que "foi pioneiro no conceito de data lakes transacionais, hoje mais conhecido como arquitetura lakehouse" ([Hudi](https://hudi.apache.org/docs/overview)). A prioridade declarada dele é a ingestão contínua.

O resto da plataforma se organiza em volta desse registro. A Databricks descreve o próprio lakehouse como Apache Spark mais duas peças: Delta Lake, "camada de armazenamento otimizada com transações ACID e imposição de esquema", e Unity Catalog, para governança ([Databricks](https://docs.databricks.com/aws/en/lakehouse/)). No Microsoft Fabric, o lakehouse guarda tabelas Delta no OneLake e gera sozinho um *SQL analytics endpoint*, só de leitura, para consulta em T-SQL ([Microsoft Learn](https://learn.microsoft.com/en-us/fabric/data-engineering/lakehouse-overview)). O Google Cloud oferece o mesmo padrão com Apache Iceberg e BigLake ([Google Cloud](https://cloud.google.com/discover/what-is-a-data-lakehouse)).

## O que o e-commerce ganha com tabela versionada?

Três coisas, e a terceira tem prazo curto.

**Escrita sem leitura pela metade.** Quando a carga noturna atualiza os pedidos do dia, quem consulta durante a carga vê a versão anterior inteira ou a nova inteira, nunca a mistura. A spec do Iceberg diz que as escritas "nunca ficam parcialmente visíveis" ([Iceberg](https://iceberg.apache.org/spec/)).

**Esquema que avisa.** A Databricks descreve o *schema enforcement* do Delta Lake como o recurso que confere "dado ausente ou inesperado" quando o arquivo bruto vira tabela ([Databricks](https://docs.databricks.com/aws/en/lakehouse/)). Quando uma API de plataforma muda o tipo de um campo, a carga acusa a diferença em vez de gravar coluna vazia em silêncio.

**Voltar no tempo, por pouco tempo.** O *time travel* consulta a tabela como ela estava numa versão anterior. Mas o padrão é curto: no Databricks, o histórico da tabela fica 30 dias (`logRetentionDuration`) e os arquivos que saíram da versão atual são apagados pelo `VACUUM` depois de 7 dias (`deletedFileRetentionDuration`). Desde o Databricks Runtime 18.0, a consulta a uma versão mais velha que os 7 dias de `deletedFileRetentionDuration` é bloqueada. A própria documentação avisa: "não use o histórico da tabela como solução de backup de longo prazo para arquivamento" ([Databricks, atualizada em 06/11/2026](https://docs.databricks.com/aws/en/delta/history)).

O histórico que a VTEX e o Mercado Livre apagam da API precisa de cópia própria e política de retenção escrita, e o time travel não faz esse papel. A conta de quanto tempo cada fonte guarda está em [o que é data lake](https://precisian.io/blog/pt-BR/posts/o-que-e-data-lake/) e em [quanto tempo guardar dado de marketing](https://precisian.io/blog/pt-BR/posts/quanto-tempo-guardar-dado-de-marketing/).

## Lakehouse, data lake e data warehouse: qual a diferença?

A diferença está em quem garante a consistência da tabela. No lake, ninguém garante. No warehouse, o banco garante, em geral num formato próprio que só o motor dele lê; a [Databricks](https://docs.databricks.com/aws/en/lakehouse/) registra que muitos warehouses dependem de formato proprietário. No lakehouse, o formato aberto garante, e qualquer motor compatível lê.

| Critério | Data lake | Lakehouse | Data warehouse |
|---|---|---|---|
| Onde o dado fica | Arquivos em armazenamento de objeto | Os mesmos arquivos, mais um log de metadados | Armazenamento gerenciado pelo banco |
| Formato | Aberto (Parquet, JSON, CSV) | Aberto (Parquet + Delta, Iceberg ou Hudi) | Em geral proprietário |
| Transação e commit atômico | Não | Sim, por tabela | Sim |
| Versão anterior consultável | Só se alguém copiou | Sim, dentro da retenção configurada | Depende do produto |
| Quem lê | Qualquer motor que entenda o arquivo | Spark, SQL e Python sobre a mesma cópia | O motor do próprio warehouse |
| Define o que é receita | Não | Não | Não |

A garantia de transação vale por tabela. No Microsoft Fabric, o lakehouse não tem transação entre várias tabelas, e o warehouse tem ([Microsoft Learn](https://learn.microsoft.com/en-us/fabric/data-engineering/lakehouse-overview)). Num e-commerce, a tabela de pedidos e a de itens do pedido são duas tabelas. Uma carga que falha entre as duas deixa o pedido atualizado e o item antigo, e a garantia por tabela não cobre esse intervalo.

A comparação por pergunta de negócio (ROAS, coorte, marketplace) e a ordem em que um e-commerce precisa de cada peça estão em [data lake, data warehouse ou lakehouse](https://precisian.io/blog/pt-BR/posts/data-lake-ou-data-warehouse/). Os verbetes de cada um estão em [o que é data lake](https://precisian.io/blog/pt-BR/posts/o-que-e-data-lake/) e [o que é data warehouse](https://precisian.io/blog/pt-BR/posts/o-que-e-data-warehouse/).

## Lakehouse é o mesmo que arquitetura medalhão?

Não, mas os dois aparecem juntos. Lakehouse é o tipo de sistema; medalhão é a forma de organizar as tabelas dentro dele, em bronze (bruto), prata (validado) e ouro (pronto para o negócio). A Databricks escreve que o lakehouse "costuma usar" esse padrão, e não que depende dele ([Databricks](https://docs.databricks.com/aws/en/lakehouse/)). O detalhe de cada camada está em [arquitetura medalhão](https://precisian.io/blog/pt-BR/posts/arquitetura-medalhao/).

## O que lakehouse **não** é?

**Não é produto.** É um padrão. Databricks, Microsoft, Google e AWS vendem implementações (a da AWS fica no [Amazon SageMaker](https://aws.amazon.com/what-is/data-lakehouse/)), e o mesmo formato Iceberg roda em mais de uma delas.

**Não dispensa a modelagem.** O paper admite que, com um lakehouse, as empresas "ainda têm de fazer o trabalho duro de escrever a lógica de ETL/ELT para criar conjuntos de dados curados", só que com menos etapas ([CIDR 2021](https://www.cidrdb.org/cidr2021/papers/cidr2021_paper17.pdf)). Alguém continua decidindo que o pedido do Mercado Livre e o da loja são o mesmo cliente.

**Não é arquivo morto.** O time travel cobre dias, e não anos, no padrão da Databricks.

**Não é definição de métrica.** A tabela de pedidos versionada soma `valor_total` com a mesma fluência com ou sem frete, com ou sem o Pix que nunca foi pago. O formato garante que a tabela é consistente; ele não sabe qual regra de receita a diretoria aprovou. Essa regra fica na [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/). Sem ela, um agente de IA que lê o lakehouse escolhe o filtro sozinho, o que chamamos de [alucinação de métrica](https://precisian.io/blog/pt-BR/posts/alucinacao-de-metrica/).

## Quando o e-commerce precisa de um lakehouse?

Quando o problema que ele resolve já está acontecendo. Na prática, quando pelo menos uma destas três situações aparece:

1. **O time mantém uma cópia no lake e outra no warehouse, e elas já discordam.** É o problema que o paper descreve. Uma cópia só, com commit atômico, elimina a divergência entre as duas.
2. **Duas ferramentas diferentes precisam ler o mesmo dado.** O analista consulta em SQL, o cientista de dados treina previsão de demanda em Python. Com formato aberto, os dois leem os mesmos arquivos sem exportação no meio.
3. **A carga roda enquanto alguém consulta.** Relatório de Black Friday atualizado de hora em hora, com a diretoria olhando no mesmo intervalo. Sem commit atômico, a consulta pode pegar metade da carga.

Um exemplo com números redondos, sintético: uma operação com loja VTEX, Mercado Livre e duas plataformas de mídia exporta pedidos para um lake toda noite e, de lá, para um warehouse onde o BI consulta. Numa terça, a segunda carga falha no meio. O lake tem 10.000 pedidos do dia; o warehouse, 6.000. O relatório da manhã mostra 40% menos venda, e a primeira hora do dia vai para descobrir qual número está certo. Num lakehouse, a carga que falhou não vira versão nova, e a tabela continua na versão de ontem, inteira.

E quando não precisa: com uma loja, uma plataforma de mídia e perguntas que cabem no relatório nativo, montar lakehouse é custo de engenharia sem dor correspondente. Quanto custa montar a infraestrutura por conta própria, com tabela de preço oficial, está em [construir ou contratar um data lake](https://precisian.io/blog/pt-BR/posts/construir-ou-contratar-data-lake/).

## Onde a Precisian entra?

A entrega da Precisian é um data lake isolado por cliente, na infraestrutura da Precisian, com o histórico completo do contrato, conectores mantidos e a camada semântica por cima. O formato das tabelas por dentro é decisão de engenharia nossa e não muda o que importa a quem consulta: a definição de receita é uma, versionada e aprovada pelo cliente, e é lida pela IA, pela API ou pelo BI que o time já usa. A infraestrutura é nossa, o dado é seu. Você acessa a qualquer momento e, se sair, leva tudo.

## O que este artigo não cobre?

Não compara Delta Lake, Iceberg e Hudi em desempenho; os números que circulam vêm de fornecedores de um dos lados. Não traz preço de plataforma. Não traz número de adoção de lakehouse no Brasil, porque não encontrei pesquisa com metodologia aberta. E os prazos de time travel citados são o padrão da Databricks na data da consulta: cada plataforma tem o seu, e todos são configuráveis.

---

Se a sua operação já tem uma cópia de pedidos no lake e outra no warehouse, o primeiro passo é comparar as duas no mesmo dia e contar quantos pedidos divergem, e em qual status. O que mudou, o que quebrou e o que a pesquisa da Precisian mediu chega a cada quinze dias, às quintas, na [newsletter da Precisian](https://precisian.io/newsletter?utm_source=blog&utm_medium=cta&utm_campaign=o-que-e-lakehouse&utm_content=texto).
