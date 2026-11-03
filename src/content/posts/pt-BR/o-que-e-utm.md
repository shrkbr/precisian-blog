---
title: "O que é UTM e como padronizar para o número bater"
description: "UTM são parâmetros na URL que dizem ao GA4 de onde veio a visita. O GA4 diferencia maiúsculas: facebook e Facebook viram duas origens no relatório."
slug: "o-que-e-utm"
lang: "pt-BR"
translationKey: "utm"
publishedAt: 2026-11-03
tags: ["ga4", "tracking", "atribuicao", "governanca", "divergencia-de-dados"]
draft: false
llmSummary: "UTM são parâmetros de URL (utm_source, utm_medium, utm_campaign e mais seis) que o GA4 lê para atribuir a visita. Segundo a Ajuda do Google Analytics (consultada em 03/11/2026), os valores diferenciam maiúsculas: utm_source=google e utm_source=Google são origens diferentes."
citations: ["https://support.google.com/analytics/answer/10917952", "https://support.google.com/analytics/answer/9756891", "https://support.google.com/analytics/answer/10723328", "https://support.google.com/google-ads/answer/3095550", "https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema", "https://support.google.com/analytics/answer/7029846"]
about: ["https://pt.wikipedia.org/wiki/Par%C3%A2metros_UTM", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 10
---

UTM são parâmetros que você acrescenta ao fim de um link (`?utm_source=...&utm_medium=...&utm_campaign=...`) para dizer ao Google Analytics de onde veio a visita. O número não bate porque o GA4 compara texto exato: a [Ajuda do Google Analytics](https://support.google.com/analytics/answer/10917952) diz que `utm_source=google` e `utm_source=Google` são valores diferentes. Sem convenção escrita, cada pessoa grafa a mesma origem de um jeito, e a campanha se espalha em várias linhas do relatório.

> **UTM** (Urchin Tracking Module): conjunto de parâmetros de URL que o Google Analytics lê na chegada da visita para preencher origem, mídia, campanha e conteúdo. O GA4 documenta nove: `utm_id`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_source_platform`, `utm_term`, `utm_content`, `utm_creative_format` e `utm_marketing_tactic` ([Ajuda do Google Analytics](https://support.google.com/analytics/answer/10917952), consultada em 03/11/2026).

O Google Analytics 4 lê nove parâmetros UTM e compara cada valor como texto exato, com diferença entre maiúscula e minúscula, segundo a [Ajuda do Google Analytics](https://support.google.com/analytics/answer/10917952) consultada em 3 de novembro de 2026. Tudo o que vem a seguir foi conferido na documentação do Google nessa data. Onde a documentação não diz, eu aviso.

## Quais parâmetros UTM o GA4 lê, e o que faz com cada um?

Nove, e dois deles o GA4 recebe sem mostrar na interface. A tabela resume a [página de URL builders do GA4](https://support.google.com/analytics/answer/10917952) e a [referência da API de dados](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema), as duas lidas em 03/11/2026.

| Parâmetro | O que o Google diz que é | Exemplo do próprio Google | Dimensão na API de dados |
|---|---|---|---|
| `utm_source` | Quem indicou a visita | google, newsletter4, billboard | `sessionManualSource` |
| `utm_medium` | O meio de marketing | cpc, banner, email | `sessionManualMedium` |
| `utm_campaign` | Produto, slogan ou código promocional | spring_sale | `sessionCampaignName` |
| `utm_id` | ID da campanha, o mesmo usado na importação de dados de campanha | (sem exemplo) | `sessionCampaignId` |
| `utm_term` | Palavra-chave paga | (sem exemplo) | `sessionManualTerm` |
| `utm_content` | Diferencia criativos, por exemplo dois links no mesmo e-mail | (sem exemplo) | `sessionManualAdContent` |
| `utm_source_platform` | A plataforma que direciona o tráfego, como uma plataforma de compra de mídia | Search Ads 360, Display & Video 360 | `sessionSourcePlatform` |
| `utm_creative_format` | Tipo de criativo | display, native, video, search | `sessionManualCreativeFormat` |
| `utm_marketing_tactic` | Critério de segmentação | remarketing, prospecting | `sessionManualMarketingTactic` |

Três regras da mesma página mudam o desenho da convenção:

1. **Três são obrigatórios na prática.** "When you add parameters to a URL, you should always use `utm_source`, `utm_medium`, and `utm_campaign`." Se faltar um, o relatório mostra `(not set)`.
2. **Dois parâmetros não aparecem nos relatórios.** Sobre `utm_creative_format` e `utm_marketing_tactic`, a Ajuda diz que eles "isn't currently reported in Google Analytics properties". A referência da API lista as duas dimensões e o [esquema da exportação para o BigQuery](https://support.google.com/analytics/answer/7029846) guarda os campos `manual_creative_format` e `manual_marketing_tactic`. Se você quer usá-los, planeje lê-los pelo BigQuery.
3. **A URL da página perde os UTMs.** As dimensões "Landing page + query string" e "Page path + query string" omitem os parâmetros, que ficam só em "Page location".

## Qual é o sintoma de UTM sem padrão?

Você abre Aquisição de tráfego, filtra a campanha da Black Friday e vê a mesma ação em cinco linhas. Um exemplo sintético, com números redondos inventados para ilustrar:

| Origem / mídia no GA4 | Sessões | Quem criou o link |
|---|---|---|
| `facebook / paid_social` | 4.000 | Agência de mídia |
| `Facebook / paid_social` | 1.200 | Freelancer de criativo |
| `fb / cpc` | 800 | Link antigo copiado de outra campanha |
| `instagram / Pago` | 600 | Time de social |
| `meta-ads / pago` | 400 | Planilha de outro analista |

As cinco linhas são uma única compra de mídia, e a maior delas fica com pouco mais da metade do total. Quem olha só a linha de cima subestima a campanha. Quem soma tudo à mão não tem como saber se juntou demais, porque `fb / cpc` pode ser outra campanha com link reaproveitado.

O sintoma chega também por outra porta: o canal "Unassigned" cresce sem que ninguém tenha lançado nada novo, ou o tráfego pago aparece como orgânico.

## Por que isso acontece, mecanicamente?

Por quatro regras documentadas do GA4, todas ativas por padrão.

**O valor é comparado como texto exato.** A Ajuda é literal: "Parameter values are case sensitive, e.g. `utm_source=google` is different from `utm_source=Google`." Na seção de boas práticas, o mesmo documento dá outro par: "SpringSale and Spring_Sale are considered distinct." O GA4 não normaliza maiúscula, hífen nem sublinhado na origem, na mídia ou na campanha.

**O canal tem regra própria, e ela não diferencia maiúsculas.** A [página de agrupamento padrão de canais](https://support.google.com/analytics/answer/9756891) diz que "Channel definitions aren't case sensitive and can't be edited." Por isso a linha `Facebook` e a linha `facebook` podem cair no mesmo canal e ainda assim ficarem separadas no relatório de origem. O total por canal parece certo; o detalhe por campanha, não.

**A mídia decide se é pago ou orgânico.** Para tráfego marcado à mão, o GA4 só classifica como Paid Social quando a origem está na lista de redes sociais **e** a mídia casa com a expressão `^(.*cp.*|ppc|retargeting|paid.*)$`. Pela regra documentada, `utm_medium=pago` não casa. Com origem `facebook`, a visita cai na regra de Organic Social, que exige só a origem social. A mídia em português joga o pago no orgânico.

**E-mail também tem lista fechada.** O canal Email exige origem ou mídia igual a `email`, `e-mail`, `e_mail` ou `e mail`. Um disparo marcado com `utm_medium=newsletter` e `utm_source=rdstation` não entra em Email por nenhuma das duas condições. Se nenhuma outra regra pegar, vira Unassigned, que o Google define como o valor usado "when there are no other channel rules that match the event data".

Há uma quinta regra, que só vale para o Google Ads. Com auto-tagging ligado, o `gclid` vence. A [Ajuda do GA4 sobre auto-tagging](https://support.google.com/analytics/answer/10723328) diz que, usando os dois, "the source, medium, and other traffic-classification dimensions use the auto-tagged values", e o [Google Ads](https://support.google.com/google-ads/answer/3095550) acrescenta que no GA4 não há opção para inverter isso. Só `utm_content` e `utm_term` sobrevivem, nas dimensões de conteúdo e termo manuais. O post sobre [gclid](https://precisian.io/blog/pt-BR/posts/gclid/) detalha onde esse identificador se perde.

## Qual a diferença entre UTM e gclid?

O UTM é escrito por uma pessoa; o `gclid` é gerado pelo Google Ads. Essa diferença decide quem erra.

O UTM carrega texto legível (origem, mídia, campanha) que alguém digitou ou que uma plataforma preencheu por parâmetro dinâmico. Funciona em qualquer canal: e-mail, Meta, TikTok, influenciador, QR code na embalagem, link no WhatsApp. Por ser texto livre, herda todos os erros de digitação de quem o criou.

O `gclid` é um identificador opaco, um por clique, que o Google Ads acrescenta sozinho quando o auto-tagging está ligado. Ninguém digita, então ninguém erra a grafia. Em troca, ele só existe para o Google Ads e só vira campanha legível quando o GA4 está vinculado à conta de anúncios.

Na prática, as duas coisas convivem. O Google Ads fica com o `gclid`, como a [Ajuda do GA4](https://support.google.com/analytics/answer/10723328) recomenda, e todo o resto usa UTM. A convenção de grafia vale para o resto, que costuma ser a maior parte dos links de uma operação brasileira: Meta, e-mail, WhatsApp, afiliado e influenciador.

## Como diagnosticar isso na sua operação?

Em três verificações, da mais rápida à mais completa.

| Verificação | Onde olhar | O que indica divergência |
|---|---|---|
| Grafias duplicadas | Exploração livre do GA4, dimensão "Session manual source", últimos 90 dias | Mesma origem com maiúscula, abreviação ou hífen diferente |
| Pago caindo fora do pago | Aquisição de tráfego, "Session default channel group" × "Session manual medium" | Mídia de campanha paga em Organic Social, Unassigned ou Referral |
| Campanhas sem UTM completo | Mesma exploração, filtro "Session campaign" = `(not set)` com mídia preenchida | Link criado sem `utm_campaign` |

Se você exporta o GA4 para o BigQuery, a primeira verificação vira uma consulta. Ela agrupa por versão em minúsculas e mostra só as origens com mais de uma grafia:

```sql
SELECT
  LOWER(collected_traffic_source.manual_source) AS origem_normalizada,
  ARRAY_AGG(DISTINCT collected_traffic_source.manual_source) AS grafias,
  COUNT(*) AS eventos
FROM `seu-projeto.analytics_123456789.events_*`
WHERE _TABLE_SUFFIX BETWEEN '20261001' AND '20261031'
  AND collected_traffic_source.manual_source IS NOT NULL
GROUP BY 1
HAVING COUNT(DISTINCT collected_traffic_source.manual_source) > 1
ORDER BY eventos DESC;
```

Os nomes de campo vêm do [esquema da exportação](https://support.google.com/analytics/answer/7029846). Repita trocando `manual_source` por `manual_medium` e `manual_campaign_name`. A consulta pega maiúscula; não pega `fb` contra `facebook`. Para isso, só uma tabela de apelidos escrita por alguém.

## Como corrigir?

Com uma convenção curta, escrita num lugar só, e com links gerados a partir dela.

**A convenção mínima.** Cinco regras bastam para a maioria das operações de e-commerce:

| Regra | Exemplo certo | Exemplo que quebra |
|---|---|---|
| Tudo em minúsculas | `facebook` | `Facebook` |
| Uma grafia por plataforma, com lista fechada | `facebook`, `instagram`, `google`, `tiktok`, `rdstation` | `fb`, `meta-ads`, `insta` misturados |
| Mídia em inglês, nos termos que o GA4 reconhece | `paid_social`, `cpc`, `email`, `referral` | `pago`, `newsletter`, `social pago` |
| Campanha igual ao nome na plataforma | o mesmo texto do Gerenciador | nome reescrito à mão |
| Sublinhado como único separador | `black_friday_2026` | `black-friday 2026` |

A lista de origens pode seguir o que o próprio Google sugere. Na tabela de boas práticas, ele recomenda uma origem distinta por subplataforma ("use fb for Facebook and insta for Instagram") e minúsculas como padrão. Qualquer das duas grafias serve, desde que só uma circule.

**Parâmetro dinâmico onde der.** A Ajuda recomenda deixar a plataforma preencher o valor, citando `utm_campaign={{campaign.name}}` e `{{site_source_name}}` como exemplos. O nome da campanha sai do Gerenciador, sem digitação.

**Um gerador, não um campo livre.** O [Campaign URL Builder](https://ga-dev-tools.google/campaign-url-builder/) do Google monta o link, mas aceita qualquer texto. Uma planilha com listas suspensas, alimentada pela convenção, impede a grafia nova na origem.

**A convenção mora no dicionário de dados.** A lista de origens e mídias aceitas é uma definição de negócio como qualquer outra: tem dono, data e versão. O lugar natural é o mesmo [dicionário de dados de marketing](https://precisian.io/blog/pt-BR/posts/dicionario-de-dados-de-marketing/) que define receita e ROAS. Na Precisian, essa tabela vira regra na camada semântica: a origem `Facebook` digitada pela agência é mapeada para `facebook` antes de qualquer consulta, e o mapeamento fica versionado no lake isolado do cliente, na nossa infraestrutura. O mecanismo é o mesmo da [receita que marketing e financeiro definem diferente](https://precisian.io/blog/pt-BR/posts/mesma-definicao-de-receita/), em escala menor: duas áreas grafam a mesma coisa de dois jeitos, e o relatório soma separado.

## Quando isso não tem conserto?

Em três situações.

**O histórico no GA4 não se reescreve.** A convenção vale do dia em que entra em diante. As linhas antigas continuam separadas na interface do GA4. Dá para juntá-las fora dele, no BigQuery ou na camada semântica, mas não dentro do relatório padrão.

**O canal padrão não se edita.** O Google diz que o agrupamento padrão "can't be edited". Se uma mídia antiga caiu em Unassigned, ela fica lá nos relatórios do agrupamento padrão. O caminho é um agrupamento de canais personalizado, que corrige a leitura e não muda o dado coletado.

**O UTM não vence o auto-tagging.** No Google Ads com `gclid`, os seus UTMs de origem, mídia e campanha são ignorados para classificação. Padronizar ali não muda nada; a origem certa depende de o `gclid` chegar.

E um caso em que a Precisian não é a resposta: se a operação tem um único time criando links e menos de dez campanhas por mês, a planilha com lista suspensa resolve. Camada semântica para normalizar UTM só se paga quando há várias agências, vários times e uma IA ou um BI lendo o mesmo número.

## O que este artigo não cobre?

Não confirma em que canal cai `utm_source=whatsapp`. A regra de Organic Social depende da lista de redes sociais do Google, publicada numa planilha que não conferi. _Não confirmado._

Não trata de UTM em app Android, que usa outro construtor (o Play Campaign URL Builder, segundo a mesma Ajuda).

Não detalha a importação de dados de custo pelo `utm_id`, que tem documentação própria.

Se a sua campanha aparece em cinco linhas e ninguém sabe qual é a certa, o primeiro passo é medir quantas grafias diferentes cada origem e cada mídia têm hoje. [Veja como a Precisian organiza essa normalização na prática](https://precisian.io/demonstracao), sem compromisso de contrato, mas sem promessa de resposta em 30 minutos também.
