---
title: "Data lake, data warehouse ou lakehouse: o que um e-commerce precisa (e em que ordem)"
description: "Data lake guarda o cru, data warehouse guarda o modelado, lakehouse tenta as duas coisas no mesmo arquivo. Nenhum dos três define o que é receita."
slug: "data-lake-ou-data-warehouse"
lang: "pt-BR"
translationKey: "lake-vs-warehouse"
publishedAt: 2026-10-14
tags: ["data-lake", "data-warehouse", "ecommerce", "ga4", "camada-semantica", "marketplace"]
draft: false
llmSummary: "Data lake guarda dado bruto em armazenamento barato; data warehouse guarda dado modelado para consulta; lakehouse, definido por Armbrust et al. no CIDR 2021, põe transação e versionamento sobre arquivos abertos. Para e-commerce, nenhum dos três define a métrica: isso é camada semântica."
citations: ["https://www.cidrdb.org/cidr2021/papers/cidr2021_paper17.pdf", "https://jamesdixon.wordpress.com/2010/10/14/pentaho-hadoop-and-data-lakes/", "https://iceberg.apache.org/docs/latest/", "https://support.google.com/analytics/answer/9358801", "https://support.google.com/analytics/answer/7029846", "https://support.google.com/analytics/answer/7667196", "https://aws.amazon.com/compare/the-difference-between-a-data-warehouse-data-lake-and-data-mart/", "https://docs.databricks.com/aws/en/lakehouse/"]
about: ["https://en.wikipedia.org/wiki/Data_lake", "https://en.wikipedia.org/wiki/Data_warehouse", "https://precisian.io/demonstracao"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

Data lake guarda o dado bruto, no formato em que ele chegou, em armazenamento barato. Data warehouse guarda o dado já modelado, pronto para consulta rápida. Lakehouse é a tentativa de fazer as duas coisas sobre os mesmos arquivos abertos, como definiram Armbrust, Ghodsi, Xin e Zaharia no CIDR de janeiro de 2021 ([paper](https://www.cidrdb.org/cidr2021/papers/cidr2021_paper17.pdf)). Para um e-commerce, a ordem é guardar cru primeiro e modelar depois. E nenhum dos três define o que é receita.

> **Data lake**: repositório que recebe o dado como a fonte entrega, sem esquema imposto na escrita; o esquema é aplicado na leitura.
> **Data warehouse**: repositório de dado já integrado e modelado em tabelas, com esquema imposto na escrita, otimizado para consulta analítica.
> **Lakehouse**: "um sistema de gestão de dados baseado em armazenamento de baixo custo e acesso direto que também oferece recursos de gestão e desempenho de um SGBD analítico, como transações ACID, versionamento de dados, auditoria, indexação, cache e otimização de consulta" ([Armbrust et al., CIDR 2021](https://www.cidrdb.org/cidr2021/papers/cidr2021_paper17.pdf)).

## Como cada um funciona, sem a definição de fornecedor?

A diferença entre os três está no momento em que alguém decide a forma do dado.

No **data lake**, ninguém decide na entrada. O JSON da API do Meta Ads, o CSV do Mercado Livre e a exportação do GA4 entram como vieram. O termo foi cunhado por James Dixon, então na Pentaho, num post de 14 de outubro de 2010: se o data mart é água engarrafada, "limpa, embalada e estruturada", o lake é o corpo d'água "em estado mais natural" ([Dixon, 2010](https://jamesdixon.wordpress.com/2010/10/14/pentaho-hadoop-and-data-lakes/)). O custo da flexibilidade aparece depois: cada consulta precisa interpretar o arquivo de novo.

No **data warehouse**, alguém decide antes. O pedido vira uma linha com colunas definidas, o gasto de mídia vira outra tabela, e as duas se juntam por data e canal. A consulta é rápida porque o trabalho de interpretação já foi feito, uma vez.

O **lakehouse** põe uma camada de metadados transacional sobre os arquivos do lake. O paper de 2021 descreve exatamente isso: arquivos abertos, como Parquet, mais uma camada que registra quais arquivos compõem a tabela em cada versão ([CIDR 2021](https://www.cidrdb.org/cidr2021/papers/cidr2021_paper17.pdf)). Na prática, essa camada é um formato de tabela aberto. O Apache Iceberg se descreve como "an open table format for huge analytic datasets", com commit atômico, isolamento serializável e *time travel*, que permite repetir uma consulta sobre o mesmo snapshot ([Iceberg](https://iceberg.apache.org/docs/latest/)).

O mesmo paper explica por que a terceira categoria apareceu: na arquitetura de duas camadas, o dado é carregado no lake e de novo no warehouse, e cada etapa "risks incurring failures or introducing bugs", além de pagar o armazenamento em dobro ([CIDR 2021](https://www.cidrdb.org/cidr2021/papers/cidr2021_paper17.pdf)). Os quatro autores são da Databricks, que vende lakehouse. A definição é a primária; a previsão de que o warehouse vai "definhar" é a opinião de quem vende a alternativa.

## Qual pergunta de e-commerce cada arquitetura responde bem?

As páginas de definição da [AWS](https://aws.amazon.com/compare/the-difference-between-a-data-warehouse-data-lake-and-data-mart/) e da [Databricks](https://docs.databricks.com/aws/en/lakehouse/) param antes daqui: nenhuma das duas fala de ROAS, coorte ou marketplace. Para quem opera loja, a comparação que serve é por pergunta da diretoria: qual cada arquitetura responde bem e qual responde mal.

| Pergunta do negócio | Data lake | Data warehouse | Lakehouse |
|---|---|---|---|
| ROAS por canal no mês | Mal: gasto de três plataformas em formatos diferentes, moeda e fuso por normalizar a cada consulta | Bem: gasto e pedido já modelados e unidos por data e canal | Bem, depois que as tabelas curadas existirem |
| LTV por coorte de 12 meses | Guarda o histórico, mas o ID de cliente não está unificado | Bem, se o histórico foi carregado e o cliente tem chave única | Bem, com histórico barato e tabela versionada |
| Pedido do marketplace somado ao da loja própria | Guarda os dois, sem chave comum entre eles | Responde se alguém modelou a deduplicação | Igual ao warehouse: a regra de deduplicação é trabalho humano |
| Evento cru do GA4, item a item | Bem: é o lugar natural do dado aninhado e volumoso | Responde, com custo de leitura por consulta | Bem |
| Reprocessar o ano quando a regra muda (ex.: frete sai da receita) | Bem: o cru está lá | Mal, se só o modelado foi guardado | Bem, com versão anterior consultável |
| Treinar previsão de demanda ou recomendação | Bem: acesso direto aos arquivos | Mal: o paper registra que TensorFlow, PyTorch e XGBoost não funcionam bem sobre warehouse | Bem |
| "Qual foi a receita líquida de setembro?" | Não responde | Responde o que a query disser | Responde o que a query disser |

Sobre a linha do marketplace: o pedido do Mercado Livre não passa pelo seu GA4 e não compartilha identificador com o pedido da VTEX. Escrevi sobre isso em [deduplicar venda entre site e marketplace](https://precisian.io/blog/pt-BR/posts/deduplicar-venda-site-marketplace/). Nenhuma arquitetura cria a chave que a fonte não manda.

## Por que o evento cru do GA4 bagunça a classificação?

Porque o dado mais "de lake" que um e-commerce tem cai, por padrão, dentro de um warehouse.

A exportação do GA4 vai direto para o BigQuery, numa tabela `events_YYYYMMDD` por dia. O dado é aninhado: `event_params` é um registro repetido para cada parâmetro do evento, e `items` se repete para cada item ([Google, esquema da exportação](https://support.google.com/analytics/answer/7029846)). O Google descreve o conteúdo como "only the raw event data that Google Analytics receives from the client", sem as adições que a interface aplica, e classifica a atribuição dessas exportações como "Last click observed, no modeling" ([Google, exportação para BigQuery](https://support.google.com/analytics/answer/9358801)).

Na mesma página está o teto: propriedades padrão exportam até 1 milhão de eventos por dia ([Google](https://support.google.com/analytics/answer/9358801)).

O produto é um warehouse e o uso é de lake. As três palavras descrevem padrões de uso, e o mesmo serviço pode cumprir dois deles. Para o seu time, vale perguntar duas coisas: existe uma cópia crua? Existe uma camada modelada?

Também explica por que o número do BigQuery não bate com a tela do GA4: são duas camadas diferentes do mesmo dado. O diagnóstico completo está em [VTEX e GA4 não batem](https://precisian.io/blog/pt-BR/posts/vtex-ga4-nao-batem/).

## Em que ordem um e-commerce precisa disso?

Na ordem em que o dado se perde.

**1. Guardar o cru, já.** O dado de evento do GA4 padrão pode ser retido por 2 ou 14 meses nas explorações; 26, 38 e 50 meses só existem no Analytics 360 ([Google](https://support.google.com/analytics/answer/7667196)). O que não foi copiado antes disso não volta. Lake é a resposta mais barata para "não perder", e por isso vem primeiro, mesmo sem nenhuma consulta pronta.

**2. Modelar o que a diretoria pergunta toda semana.** ROAS por canal, receita por origem, ticket médio. Isso é trabalho de warehouse: tabela limpa, chave definida, consulta rápida.

**3. Lakehouse quando os dois começarem a divergir.** Se o time mantém uma cópia no lake e outra no warehouse, e as duas já discordam, o formato de tabela aberto elimina uma das cópias. Antes disso, é otimização de um problema que a operação ainda não tem.

**4. Camada semântica antes do primeiro agente de IA.** Este passo não depende da arquitetura escolhida nos três anteriores.

Quanto custa montar cada peça por conta própria, com tabela de preço oficial, está em [construir ou contratar um data lake](https://precisian.io/blog/pt-BR/posts/construir-ou-contratar-data-lake/).

## O que nenhuma das três resolve?

A definição da métrica.

Lake, warehouse e lakehouse guardam linhas e executam consulta. Nenhum deles sabe se a receita do seu negócio inclui frete, se pedido cancelado no dia seguinte sai do mês, ou se o Pix pendente conta como venda. A coluna `valor_pedido` soma o que tiver dentro.

Por isso a última linha da tabela tem a mesma resposta nas três colunas. Mudar de arquitetura troca onde a query roda, mas não decide qual query é a certa. Quando a regra não está escrita num lugar só, ela está espalhada em planilhas, painéis e queries salvas, cada uma com sua versão. Para uma pessoa, isso vira reunião. Para um agente de IA, vira [alucinação de métrica](https://precisian.io/blog/pt-BR/posts/alucinacao-de-metrica/): resposta fluente sobre uma regra que ninguém aprovou.

O lugar onde essa regra fica escrita é a [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/). A relação dela com o warehouse, e por que as duas não competem, está em [camada semântica ou data warehouse](https://precisian.io/blog/pt-BR/posts/camada-semantica-ou-data-warehouse/).

## O que lakehouse **não** é?

Não é um produto. É um padrão de arquitetura, e há mais de uma forma de implementá-lo: Delta Lake, Apache Iceberg e Apache Hudi resolvem o mesmo problema com formatos diferentes.

Não é "lake sem modelagem". A camada de metadados dá transação e versão ao arquivo, mas a tabela curada continua precisando de alguém que decida as colunas.

Não é garantia de governança. O paper diz que a camada de metadados é um lugar natural para controle de acesso e auditoria ([CIDR 2021](https://www.cidrdb.org/cidr2021/papers/cidr2021_paper17.pdf)). Lugar natural não quer dizer que o controle existe; alguém precisa configurá-lo.

E não é substituto do warehouse em todo caso. O próprio paper admite que o acesso direto aos arquivos abre mão de parte da independência de dados que o banco tradicional oferece.

## Quando isso passa a importar na sua operação?

Quando a segunda fonte começa a falar do mesmo número.

Com uma loja, uma plataforma de mídia e um analista, o relatório nativo resolve. O limiar aparece com o marketplace somado à loja própria, com a segunda plataforma de mídia declarando a mesma venda, ou com o primeiro agente de IA lendo a base. A partir daí, cada mês sem cópia crua é histórico perdido e cada relatório construído sobre regra implícita é retrabalho futuro.

É nesse ponto que a Precisian entra. A entrega é um lake isolado por cliente, na infraestrutura da Precisian, com histórico completo e conectores mantidos, e termina na camada semântica, com acesso pela IA, pela API ou pelo BI que o seu time já usa. A infraestrutura é nossa, o dado é seu. Você acessa a qualquer momento e, se sair, leva tudo.

## O que este artigo não cobre?

Não compara fornecedores de warehouse nem de formato de tabela, e não traz preço. Para custo, o artigo de [build vs buy](https://precisian.io/blog/pt-BR/posts/construir-ou-contratar-data-lake/) usa a tabela oficial da AWS.

Não traz números de mercado sobre adoção de lakehouse. Os que circulam vêm de pesquisa de fornecedor sem metodologia aberta, e preferi não repetir nenhum.

E a tabela de perguntas reflete o padrão de uso mais comum de cada arquitetura. Um warehouse bem montado pode guardar cru, e um lake bem curado pode responder ROAS. O que a tabela mede é onde cada uma começa, não onde ela pode chegar com trabalho.

---

Se a receita de setembro tem um número diferente em cada relatório da empresa, a arquitetura não é o primeiro suspeito. O primeiro passo é medir quantas definições de receita existem hoje e em quais sistemas cada uma vive. [Veja como o lake da Precisian organiza isso](https://precisian.io/demonstracao), sem compromisso de contrato, mas sem promessa de resposta em 30 minutos também.
