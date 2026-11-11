---
title: "O que é ETL (e qual a diferença para ELT)"
description: "ETL extrai, transforma e só então carrega o dado. No ELT, o dado chega cru ao destino e a transformação acontece lá dentro. A ordem decide onde mora a regra."
slug: "o-que-e-etl"
lang: "pt-BR"
translationKey: "etl-vs-elt"
publishedAt: 2026-11-11
tags: ["pipeline", "integracao", "data-lake", "data-warehouse", "camada-semantica", "ecommerce"]
draft: false
llmSummary: "ETL (extract, transform, load) transforma o dado num motor separado antes de carregar no destino; no ELT a transformação acontece dentro do destino, segundo o Azure Architecture Center da Microsoft. Em dado de marketing, a diferença decide se dá para recalcular o histórico quando uma regra muda."
citations: ["https://learn.microsoft.com/en-us/azure/architecture/data-guide/relational-data/etl", "https://aws.amazon.com/compare/the-difference-between-etl-and-elt/", "https://cloud.google.com/learn/what-is-etl", "https://aws.amazon.com/what-is/zero-etl/", "https://support.google.com/google-ads/answer/9549009", "https://developers.facebook.com/blog/post/2025/10/16/ads-insights-api-metric-availability-updates/", "https://developers.mercadolivre.com.br/pt_br/gerenciamento-de-vendas", "https://docs.getdbt.com/docs/introduction"]
about: ["https://en.wikipedia.org/wiki/Extract%2C_transform%2C_load", "https://en.wikipedia.org/wiki/Extract%2C_load%2C_transform", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
cta: newsletter
---
ETL (*extract, transform, load*) é o processo que extrai dado de várias fontes, aplica as regras de negócio num motor de transformação separado e só depois carrega o resultado no destino, segundo o [Azure Architecture Center da Microsoft](https://learn.microsoft.com/en-us/azure/architecture/data-guide/relational-data/etl) (página revisada em 15/09/2025). No ELT, a ordem muda: o dado chega cru ao destino e a transformação roda lá dentro. A ordem decide onde a regra de negócio fica guardada.

> **ETL (extrair, transformar, carregar)**: processo de integração que consolida dado de fontes diferentes num repositório único, modificando o dado conforme regras de negócio antes da carga. **ELT (extrair, carregar, transformar)**: o mesmo trabalho, com a transformação executada pelo próprio sistema de destino depois da carga.

Toda documentação citada aqui foi lida no dia da publicação. Microsoft, AWS e Google Cloud escrevem em inglês; as traduções são livres.

## Como o ETL funciona, etapa por etapa?

**Extrair** é ler o dado na fonte: a API da VTEX, o relatório do Google Ads, a planilha do financeiro, o banco do ERP. Cada fonte entrega num formato e num ritmo próprios.

**Transformar** é mudar o dado conforme as regras de negócio. A Microsoft lista o que costuma entrar nessa etapa: filtrar, ordenar, agregar, cruzar tabelas, limpar, deduplicar e validar ([Microsoft Learn](https://learn.microsoft.com/en-us/azure/architecture/data-guide/relational-data/etl)). No ETL clássico, isso acontece em tabelas de *staging*, numa área intermediária, antes de o dado tocar o destino.

**Carregar** é gravar o resultado no destino, normalmente um data warehouse, onde relatório e consulta vão ler.

As três etapas não precisam esperar umas pelas outras. A mesma página da Microsoft diz que elas "frequentemente rodam em paralelo": enquanto um lote é extraído, o anterior já está sendo transformado.

O nome é antigo. A AWS registra que o ETL existe "desde os anos 1970" e ganhou força com os data warehouses ([AWS](https://aws.amazon.com/compare/the-difference-between-etl-and-elt/)). O ELT veio com a nuvem, quando guardar dado cru em volume ficou barato.

## Qual a diferença entre ETL e ELT?

Para a Microsoft, o ELT "difere do ETL apenas no lugar onde a transformação acontece" ([Microsoft Learn](https://learn.microsoft.com/en-us/azure/architecture/data-guide/relational-data/etl)). Para o Google Cloud, a diferença está no momento: o ETL transforma antes de carregar; o ELT carrega o dado "em formato bruto" e transforma depois ([Google Cloud](https://cloud.google.com/learn/what-is-etl)). As duas descrições batem. Na prática, no ELT a cópia crua continua existindo depois da carga.

| Critério | ETL | ELT |
|---|---|---|
| Onde a transformação roda | Num motor separado, antes da carga | Dentro do destino (warehouse ou lakehouse), depois da carga |
| O que chega ao destino | Só o dado já transformado | O dado cru, mais as tabelas transformadas |
| Mudou a regra de negócio | Precisa extrair de novo da fonte, se a fonte ainda tiver o dado | Roda a transformação de novo sobre o cru guardado |
| Quando a Microsoft recomenda | Transformação pesada que o destino não aguenta; *staging* auditado exigido por regulação | Destino com computação elástica; necessidade de guardar o cru para análise futura |
| Ferramenta típica, segundo a documentação | SQL Server Integration Services, Data Factory | Warehouse na nuvem com SQL; o dbt se descreve como a ferramenta que "transforma o dado cru do warehouse" ([dbt](https://docs.getdbt.com/docs/introduction)) |

Critérios de recomendação: [Microsoft Learn](https://learn.microsoft.com/en-us/azure/architecture/data-guide/relational-data/etl). A AWS vai além e chama o ELT de "a escolha padrão para analytics moderno" ([AWS](https://aws.amazon.com/compare/the-difference-between-etl-and-elt/)).

Na prática, quase toda ferramenta que o mercado chama de "ETL" para dado de marketing hoje extrai e carrega, e deixa a transformação para você no destino. É ELT com nome de ETL. No [ranking de ferramentas de ETL para dados de marketing](https://precisian.io/blog/pt-BR/posts/ferramentas-de-etl-para-dados-de-marketing/), conferido em 26/10/2026, a modelagem ficava com o cliente nas dez ferramentas avaliadas além da Precisian.

## Por que a ordem importa em dado de marketing?

Porque o dado de marketing muda depois de chegar, e a regra de negócio também.

**O passado das plataformas é reescrito.** O Google Ads informa, na própria Ajuda, que a coluna padrão de conversões atribui a conversão "à data do clique" ([Ajuda do Google Ads](https://support.google.com/google-ads/answer/9549009)). Um clique da semana passada que vira venda nesta semana aumenta o número da semana passada. Um ETL que transformou e carregou o resultado na segunda-feira guarda um número que a plataforma já corrigiu.

**A fonte muda o que entrega.** Em 12 de janeiro de 2026, a API de Insights da Meta deixou de devolver as janelas de atribuição `7d_view` e `28d_view` no parâmetro `action_attribution_windows` ([Meta for Developers](https://developers.facebook.com/blog/post/2025/10/16/ads-insights-api-metric-availability-updates/), anúncio de 16/10/2025). Um pipeline que só guardava o número já transformado não tem como saber qual regime produziu cada linha.

**A fonte apaga.** No Mercado Livre, a documentação de vendas diz que "atualmente são salvas orders criadas até 12 meses" e que, na busca como vendedor, as ordens canceladas são filtradas ([Mercado Livre Developers](https://developers.mercadolivre.com.br/pt_br/gerenciamento-de-vendas)). Se a transformação jogou fora um campo, e o pedido já saiu da janela, não há o que extrair de novo.

Com ETL, cada um desses casos exige voltar à fonte. Com ELT e a cópia crua guardada, a correção é rodar a transformação outra vez. É o argumento técnico do [data lake](https://precisian.io/blog/pt-BR/posts/o-que-e-data-lake/): guardar o que a fonte apaga antes que ela apague.

## Onde mora a regra de negócio, no ETL e no ELT?

Em código, nos dois casos, e a escolha entre ETL e ELT não muda isso.

As transformações que pesam em dado de marketing são decisões:

- **O que é receita.** Com ou sem frete, antes ou depois do cancelamento, bruta ou líquida da comissão. O pedido do Mercado Livre traz o `total_amount` e, por item, o `sale_fee`, que a documentação define como "comissão de vendas" ([Mercado Livre Developers](https://developers.mercadolivre.com.br/pt_br/gerenciamento-de-vendas)). Subtrair ou não o `sale_fee` é uma decisão, e duas pessoas decidem diferente.
- **O que é um pedido.** Pedido dividido em duas entregas, troca que gera pedido novo, Pix que expirou sem pagamento e virou pedido novo.
- **Em que moeda e em que fuso.** Relatório de mídia no fuso da conta, pedido no fuso da loja, venda internacional convertida pela cotação de qual dia.

Um exemplo com números redondos, inventado para ilustrar: uma loja vende R$ 100 mil no mês, com R$ 8 mil de frete cobrado e R$ 5 mil em pedidos cancelados depois. Marketing lê R$ 100 mil, operações lê R$ 95 mil, financeiro lê R$ 87 mil. Nenhum dos três errou a conta; cada um escreveu uma regra diferente na sua própria transformação. O post sobre [por que marketing e financeiro nunca fecham o mesmo número](https://precisian.io/blog/pt-BR/posts/mesma-definicao-de-receita/) trata dessa briga em detalhe.

No ETL, essa regra fica no código do pipeline. No ELT, fica num SQL dentro do warehouse. Nos dois casos, se ninguém versionar a regra, a pergunta "por que o número de março mudou?" não tem resposta. Na minha opinião, o debate ETL contra ELT decide onde guardar o cru, e a regra de receita precisa de um lugar próprio, com versão, autor e data. Esse lugar é a [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/).

## O que ETL não é?

**Não é uma ferramenta.** ETL é um padrão de processo. Ferramentas de integração implementam parte dele, e a maioria implementa só o E e o L.

**Não é ETL reverso.** A Microsoft define o ETL reverso como o caminho inverso: levar dado já modelado do warehouse para sistemas operacionais, como CRM e automação de marketing ([Microsoft Learn](https://learn.microsoft.com/en-us/azure/architecture/data-guide/relational-data/etl)).

**Não é zero-ETL.** A AWS usa o nome para integrações que movem dado de um serviço dela a outro "sem a necessidade de criar pipelines de ETL" ([AWS](https://aws.amazon.com/what-is/zero-etl/)). O dado ainda se move; quem constrói o caminho é o fornecedor.

**Não é streaming.** ETL e ELT rodam em lotes agendados; o processamento em fluxo trata cada evento quando ele chega, diz a mesma página da Microsoft.

**Não é a definição da métrica.** O pipeline executa a regra. Quem decide a regra é o negócio, e ela precisa sobreviver a uma troca de ferramenta. O [contrato de dados](https://precisian.io/blog/pt-BR/posts/contrato-de-dados/) cobre a forma do dado; a camada semântica cobre o significado.

## Quando a escolha entre ETL e ELT passa a importar na operação?

Quando três coisas acontecem ao mesmo tempo:

1. **Mais de uma fonte fala de receita.** Loja, marketplace e ERP, cada um com o seu número. Qualquer comparação entre eles depende de uma regra escrita.
2. **Alguém precisa de comparação ano contra ano.** Se a fonte guarda 12 meses, como o Mercado Livre declara ([Mercado Livre Developers](https://developers.mercadolivre.com.br/pt_br/gerenciamento-de-vendas)), o histórico de dois anos atrás só existe se alguém guardou o cru.
3. **A regra vai mudar.** Ela sempre muda: frete que sai da receita, status de pedido que passa a contar como cancelado, janela de atribuição que a plataforma aposenta.

Nesse cenário, a combinação que se sustenta é guardar o cru e escrever a regra uma vez, num lugar versionado. A comparação entre [data lake, data warehouse e lakehouse](https://precisian.io/blog/pt-BR/posts/data-lake-ou-data-warehouse/) ajuda a escolher onde guardar. Na Precisian, a entrega vai do dado bruto até a camada semântica: o lake fica isolado por cliente, na nossa infraestrutura, guarda o histórico inteiro do contrato, e cada métrica tem definição única e versionada, aprovada pelo cliente. O cliente consome pela IA dele, pelo BI dele ou por API.

## O que este artigo não cobre?

Não compara ferramentas de ETL. Isso está no [ranking de ferramentas de ETL para dados de marketing](https://precisian.io/blog/pt-BR/posts/ferramentas-de-etl-para-dados-de-marketing/).

Não explica a organização do cru em camadas bronze, prata e ouro. Esse é o assunto do post sobre [arquitetura medalhão](https://precisian.io/blog/pt-BR/posts/arquitetura-medalhao/).

Não trata de processamento em tempo real nem de ETL reverso além da definição.

Se cada área da sua operação abre o mesmo pedido e chega num faturamento diferente, a pergunta que resolve é onde está escrita a regra que cada transformação aplica. O que mudou, o que quebrou e o que a pesquisa da Precisian mediu chega a cada quinze dias, às quintas, na [newsletter da Precisian](https://precisian.io/newsletter?utm_source=blog&utm_medium=cta&utm_campaign=o-que-e-etl&utm_content=texto).
