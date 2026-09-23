---
title: "Black Friday: o que quebra no seu dado antes de quebrar o seu site"
description: "O export do GA4 para o BigQuery tem teto de 1 milhão de eventos por dia, pausa em silêncio e não reprocessa os dias perdidos."
slug: "black-friday-o-que-quebra-no-dado"
lang: "pt-BR"
translationKey: "black-friday-data-readiness"
publishedAt: 2026-10-13
tags: ["black-friday", "ga4", "ecommerce"]
draft: false
llmSummary: "O export diário do GA4 para o BigQuery tem teto de 1 milhão de eventos em propriedade padrão; estourando, o export é pausado e os dias anteriores não são reprocessados. O Google documenta que o frescor do dado piora em propriedade grande e declara que isso não é SLA."
citations: ["https://support.google.com/analytics/answer/9823238", "https://support.google.com/analytics/answer/11198161", "https://developers.google.com/google-ads/api/docs/best-practices/rate-limits", "https://developers.facebook.com/docs/graph-api/overview/rate-limiting/", "https://shopify.dev/docs/api/storefront", "https://developers.vtex.com/docs/api-reference/catalog-api"]
about: ["https://pt.wikipedia.org/wiki/Black_Friday", "https://precisian.io/datalake/"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

O limite que mais estraga Black Friday não derruba nada: o export do GA4 para o BigQuery tem teto de **1 milhão de eventos por dia** em propriedade padrão e, se você estourar de forma consistente, a documentação do Google diz que "o export diário será pausado e os dias anteriores não serão reprocessados" ([Google](https://support.google.com/analytics/answer/9823238)). O site fica de pé, o relatório abre, e o dado do dia mais importante do ano simplesmente não existe depois.

> **Falha silenciosa**: limite cujo estouro não gera erro visível para quem opera, produzindo ausência de dado em vez de alerta.

## O que falha em silêncio?

Três coisas, e nenhuma aparece no monitoramento convencional.

**O export para o BigQuery.** O teto de 1 milhão de eventos por dia é fácil de estourar num pico, e a punição é não-retroativa. Quem só olha a interface do GA4 não percebe, porque a interface continua mostrando dado. A saída documentada é o export por streaming, que não tem limite de eventos. E vale a pergunta anterior: se o dado do pico precisa repousar em algum lugar para ser reconciliado depois, [esse lugar existe na sua operação](https://precisian.io/datalake/)?

**A amostragem.** Acima de **10 milhões de eventos por consulta** numa propriedade padrão, o relatório passa a ser estimado ([Google](https://support.google.com/analytics/answer/13331292)). O número continua aparecendo; ele só deixa de ser exato, sem que nada na tela diga isso com clareza.

**A cardinalidade.** Uma dimensão com mais de **500 valores únicos por dia** é considerada de alta cardinalidade, e o limite geral é de 50.000 valores ([Google](https://support.google.com/analytics/answer/12226705)). Quando a tabela estoura, o excedente vai para uma linha chamada `(other)`. Em Black Friday, dimensões que passam o ano inteiro comportadas, como nome de campanha ou variante de produto, estouram num dia. Vale lembrar que nome de campanha é campo escrito por gente de fora e [sem validação de conteúdo documentada](https://precisian.io/blog/en/posts/prompt-injection-marketing-data/), o que é outro problema do mesmo campo.

## Por que o frescor piora exatamente quando você mais precisa?

Porque a degradação é proporcional ao volume, e o Google documenta isso.

Os tempos publicados são de 2 a 6 horas para dado intradiário em propriedade padrão, 12 horas para o processamento diário normal e **mais de 24 horas para volume grande** ([Google](https://support.google.com/analytics/answer/11198161)).

A frase que vale colar no canal do time está na mesma página: *"This is not a guarantee, nor an SLA or an SLO. Data is sometimes delayed beyond these processing times, particularly for large properties, complex data, or during uncommon processing slowdowns."*

Ou seja: o próprio fornecedor avisa por escrito que o atraso aumenta em propriedade grande e em processamento atípico. Black Friday é as duas coisas ao mesmo tempo. Quem prometeu à diretoria um painel atualizado de hora em hora prometeu algo que o fornecedor não promete.

## Por que o teto da API encolhe no pico?

Porque em pelo menos um caso ele não é um número, e sim uma função da carga.

A documentação da Google Ads API é explícita: o limite de requisições por segundo opera por token bucket e **"o limite exato varia conforme a carga do servidor"**, devolvendo `RESOURCE_TEMPORARILY_EXHAUSTED` ([Google](https://developers.google.com/google-ads/api/docs/best-practices/rate-limits)). Há tetos fixos publicados por dia, como 15.000 operações em acesso básico, mas o teto instantâneo é elástico para baixo.

A consequência é desagradável e pouco discutida: **o teto é menor exatamente no dia em que todo mundo puxa mais.** Não há como dimensionar isso com antecedência; só dá para limitar concorrência, agrupar operações e implementar fila com recuo.

Os limites das outras plataformas são fixos, e vale conhecê-los antes:

| Plataforma | Limite documentado |
|---|---|
| Shopify REST Admin | 2 req/s no plano padrão, 20 no Plus |
| Shopify GraphQL Admin | 100 pontos/s restaurados no padrão, 1.000 no Plus |
| VTEX Catalog API | 45.000 req/min por conta, 15.000 por endpoint |
| Meta Ads Insights | `600 + 400 × anúncios ativos − 0,001 × erros` por hora |

Fontes: [Shopify REST](https://shopify.dev/docs/api/admin-rest/usage/rate-limits), [Shopify GraphQL](https://shopify.dev/docs/apps/build/apis/graphql-admin/rate-limits), [VTEX](https://developers.vtex.com/docs/api-reference/catalog-api) e [Meta](https://developers.facebook.com/docs/graph-api/overview/rate-limiting/).

Olhe com atenção a fórmula da Meta. Ela **subtrai os seus próprios erros** do seu teto. Um script que erra em laço durante o pico reduz a própria cota: o retry ingênuo não só falha, ele piora a capacidade de tentar de novo.

## Quais falhas passam batido no monitoramento?

Duas, e as duas por motivo de formato de resposta.

**O checkout estrangulado da Shopify devolve 200.** A documentação da Storefront API informa que a criação de checkout tem limite por minuto e retorna `200 Throttled`, não 429, recomendando fila com recuo exponencial ([Shopify](https://shopify.dev/docs/api/storefront)). Qualquer alerta configurado sobre status HTTP maior ou igual a 400 fica cego para checkout sendo limitado no minuto mais caro do ano.

**O export pausado não avisa.** Já descrito acima, e vale repetir porque é a única falha desta lista cujo prejuízo é permanente. Rate limit se recupera; dia de export perdido não volta.

## O que checar agora, antes de novembro?

Cinco verificações, todas fazíveis em uma tarde, todas com o número vindo da documentação.

**Compare seu volume diário de eventos com o [teto de 1 milhão](https://support.google.com/analytics/answer/9823238).** Se em um dia normal você está em 300 mil, um pico de três a quatro vezes encosta no limite. Ligar o streaming export antes é mais barato que descobrir depois.

**Liste as dimensões custom com mais de [500 valores únicos por dia](https://support.google.com/analytics/answer/12226705).** Essas vão para `(other)` no pico, com certeza. Reduzir cardinalidade em novembro é possível; em 28 de novembro, não.

**Confira o seu nível de acesso na Meta.** A diferença entre acesso padrão e avançado muda a fórmula de cota em ordens de grandeza. Descobrir isso na véspera não deixa tempo para solicitar elevação.

**Verifique a janela de congelamento da sua plataforma.** A VTEX publica anualmente um freeze de homologação de conector de pagamento antes da Black Friday. No ciclo de 2025, o prazo para abrir solicitação foi 21 de outubro e o de concluir, 13 de novembro, com retomada em 2 de dezembro ([VTEX](https://developers.vtex.com/updates/release-notes/2025-09-29-payment-connector-homologation-freeze-in-preparation-for-black-friday-2025)). O anúncio do ciclo seguinte costuma sair no fim de setembro; **não encontrei o de 2026 publicado até o momento desta redação**, então vale acompanhar o feed de release notes em vez de assumir datas.

**Se você usa Shopify e tem catálogo grande**, note o limite documentado: a partir de 500 mil variantes, no máximo 10 mil novas variantes por dia, em qualquer API ([Shopify](https://shopify.dev/docs/api/usage/limits)). Isso morde em carga de preparação de campanha, não na venda.

## Por que isso só aparece depois?

Porque todos os limites desta lista têm a mesma assinatura: degradam a qualidade sem interromper o serviço.

Uma falha que derruba o site é descoberta em minutos, porque alguém liga. Uma falha que amostra um relatório, joga uma dimensão para `(other)` ou pausa um export não tem quem ligue. O número continua aparecendo, com a mesma cara de sempre, e a diferença só se revela quando alguém compara duas fontes — geralmente em dezembro, no fechamento, quando a correção já não é possível.

Isso cria um padrão previsível de calendário. Em novembro o time olha disponibilidade, tempo de resposta e taxa de erro, que são as métricas de site. Em dezembro alguém pergunta por que o número da plataforma não bate com o do analytics, e a investigação começa do zero, sem saber que a resposta foi determinada por um teto documentado em setembro.

A inversão barata é tratar limite de dado como item de checklist de pico, no mesmo lugar onde já estão capacidade de servidor e teste de carga. São cinco verificações, custam uma tarde, e a janela em que elas ainda resolvem alguma coisa fecha em novembro.

Um detalhe de sequência que costuma passar: as correções têm prazos diferentes. Ligar streaming export é imediato. Reduzir cardinalidade exige mudar como a tag preenche o campo, o que passa por desenvolvimento. Pedir elevação de acesso na Meta depende de aprovação de terceiro, com prazo que você não controla. Quem descobre as três juntas em novembro consegue fazer uma.

## Quanto vende a Black Friday brasileira?

Não vou dizer, e o motivo é mais útil que o número.

Tentei rastrear as cifras que circulam. As de faturamento vêm de um fornecedor de dados que não publica documento metodológico auditável, e os próprios números aparecem contraditórios na imprensa: uma projeção de crescimento é citada de forma intercambiável com o resultado realizado, que foi menor. Não há como saber qual está sendo repetido em cada matéria.

O dado de Pix é mais sólido, com uma ressalva importante. O volume diário recorde da Black Friday circula amplamente atribuído ao Banco Central, mas o **portal de dados abertos do BCB publica a estatística de Pix em granularidade mensal** ([BCB](https://dadosabertos.bcb.gov.br/dataset/pix)). O número diário existe como declaração do Banco Central à imprensa, não como dado reproduzível a partir da base aberta. Quem citar, deveria escrever "segundo nota do Banco Central", não "segundo dados do Banco Central".

A distinção parece preciosismo e não é: ela separa um número que você pode conferir de um que você precisa acreditar.

## O que este artigo não cobre?

Não cobre infraestrutura de site, que é outra disciplina, e não cobre estratégia de oferta.

Deixei de fora um limite muito citado de linhas em explorações do GA4, porque não o encontrei em documentação do Google — apenas em material secundário. Deixei de fora o conteúdo da cartilha de Black Friday da VTEX, que fica atrás de login e não pude verificar. E deixei de fora limites de outras APIs da VTEX além do Catalog, porque só esse tem número publicado, e extrapolar de um endpoint para os outros seria invenção.

Se a sua operação triplica em novembro, a verificação de maior retorno é comparar o volume diário de eventos com o teto do export. [Agende uma conversa sobre o seu caso](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).
