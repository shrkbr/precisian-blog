---
title: "Meta Andromeda: o que mudou nos anúncios e o papel do seu dado"
description: "O Meta Andromeda escolhe alguns milhares de anúncios entre dezenas de milhões. A entrega aprende com o evento casado que a sua loja manda à Meta."
slug: "meta-andromeda"
lang: "pt-BR"
translationKey: "meta-andromeda-signal-quality"
publishedAt: 2026-11-23
tags: ["atribuicao", "tracking", "divergencia-de-dados", "ecommerce", "roas"]
draft: false
llmSummary: "O Andromeda é o sistema de recuperação de anúncios da Meta: reduz dezenas de milhões de candidatos a alguns milhares (Meta Engineering, 02/12/2024). Só eventos casados entram na otimização de entrega, então compra duplicada ou com valor errado treina o sistema no alvo errado."
citations: ["https://engineering.fb.com/2024/12/02/production-engineering/meta-andromeda-advantage-automation-next-gen-personalized-ads-retrieval-engine/", "https://s21.q4cdn.com/399680738/files/doc_financials/2024/q4/META-Q4-2024-Earnings-Call-Transcript.pdf", "https://s21.q4cdn.com/399680738/files/doc_financials/2025/q2/META-Q2-2025-Earnings-Call-Transcript.pdf", "https://s21.q4cdn.com/399680738/files/doc_financials/2025/q3/META-Q3-2025-Earnings-Call-Transcript.pdf", "https://s21.q4cdn.com/399680738/files/doc_financials/2025/q4/META-Q4-2025-Earnings-Call-Transcript.pdf", "https://s21.q4cdn.com/399680738/files/doc_financials/2026/q2/META-Q2-2026-Earnings-Call-Transcript.pdf", "https://developers.facebook.com/docs/marketing-api/conversions-api/best-practices", "https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events/", "https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/custom-data", "https://developers.facebook.com/docs/marketing-api/conversions-api/dataset-quality-api"]
about: ["https://pt.wikipedia.org/wiki/Meta_Platforms", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
cta: regua
---
O Meta Andromeda é o sistema de aprendizado de máquina que faz a **recuperação** de anúncios na Meta: ele seleciona, entre dezenas de milhões de anúncios candidatos, os poucos milhares que seguem para o ranqueamento e o leilão ([Meta Engineering](https://engineering.fb.com/2024/12/02/production-engineering/meta-andromeda-advantage-automation-next-gen-personalized-ads-retrieval-engine/), publicado em 02/12/2024). O Andromeda mudou quem entra na disputa. O que a entrega da Meta usa para aprender continua sendo o evento de conversão que a sua loja manda.

> **Andromeda** é, nas palavras da Meta, *"o sistema proprietário de aprendizado de máquina da Meta projetado para a recuperação na recomendação de anúncios"*. A recuperação é *"o primeiro passo"* de um sistema de recomendação em vários estágios; depois dela, *"modelos de ranqueamento maiores e mais sofisticados preveem o valor para as pessoas e para o anunciante"* ([Meta Engineering, 02/12/2024](https://engineering.fb.com/2024/12/02/production-engineering/meta-andromeda-advantage-automation-next-gen-personalized-ads-retrieval-engine/)).

A Meta não opera a sua loja, e a Precisian não opera a sua mídia. O que este texto cobre é a parte que fica com você: o dado que entra.

## O que a Meta publicou sobre o Andromeda, e quando?

Tudo o que existe de primário sobre o Andromeda está em duas fontes: o [blog de engenharia da Meta](https://engineering.fb.com/2024/12/02/production-engineering/meta-andromeda-advantage-automation-next-gen-personalized-ads-retrieval-engine/) e as teleconferências de resultado trimestral publicadas no [site de investidores da Meta](https://investor.atmeta.com/). Li as seis fontes da tabela em 23/11/2026.

| Data | Fonte | O que a Meta disse |
|---|---|---|
| 02/12/2024 | [Blog de engenharia](https://engineering.fb.com/2024/12/02/production-engineering/meta-andromeda-advantage-automation-next-gen-personalized-ads-retrieval-engine/) | Recuperação reduz *"dezenas de milhões"* de candidatos a *"alguns milhares"*; +6% de recall no sistema de recuperação e +8% de qualidade de anúncio *"em segmentos selecionados"* |
| 29/01/2025 | [Teleconferência do 4º tri de 2024](https://s21.q4cdn.com/399680738/files/doc_financials/2024/q4/META-Q4-2024-Earnings-Call-Transcript.pdf) | Introduzido no 2º semestre de 2024, com a Nvidia; aumento de 10.000 vezes na complexidade dos modelos de recuperação |
| 30/07/2025 | [Teleconferência do 2º tri de 2025](https://s21.q4cdn.com/399680738/files/doc_financials/2025/q2/META-Q2-2025-Earnings-Call-Transcript.pdf) | Expandido para o Facebook Reels; *"quase 4%"* mais conversões no Feed móvel e no Reels do Facebook. O ranqueamento fica com outro modelo, o GEM |
| 29/10/2025 | [Teleconferência do 3º tri de 2025](https://s21.q4cdn.com/399680738/files/doc_financials/2025/q3/META-Q3-2025-Earnings-Call-Transcript.pdf) | Recuperação e ranqueamento inicial combinados num modelo só; +14% de qualidade de anúncio nas superfícies do Facebook |
| 28/01/2026 | [Teleconferência do 4º tri de 2025](https://s21.q4cdn.com/399680738/files/doc_financials/2025/q4/META-Q4-2025-Earnings-Call-Transcript.pdf) | Passa a rodar em chips Nvidia, AMD e MTIA; eficiência de computação *"quase triplicada"* |
| 29/07/2026 | [Teleconferência do 2º tri de 2026](https://s21.q4cdn.com/399680738/files/doc_financials/2026/q2/META-Q2-2026-Earnings-Call-Transcript.pdf) | *"Implantamos o primeiro modelo generativo no nosso sistema de recuperação de anúncios"* |

Todos os percentuais da tabela são da própria Meta, medidos por ela sobre o próprio sistema, sem metodologia publicada para quem está de fora. Servem para entender a direção, não para projetar resultado de conta.

## O que mudou em relação ao sistema anterior?

Mudou a capacidade de personalizar a etapa que vem antes do leilão. O blog de engenharia descreve o antes e o depois assim:

| Ponto | Antes do Andromeda | Com o Andromeda |
|---|---|---|
| Personalização na recuperação | *"limitada"* | rede neural profunda, com capacidade de modelo 10.000 vezes maior |
| Como os estágios se combinavam | *"estágios de modelo isolados e numerosas heurísticas baseadas em regras"* | índice hierárquico treinado junto com os modelos de recuperação |
| Hardware | componentes em CPU | NVIDIA Grace Hopper; segundo a teleconferência de 28/01/2026, também AMD e MTIA |
| Volume de anúncios | difícil de escalar | índice feito para *"escalar para um grande volume de criativos"* |

Fonte: [Meta Engineering, 02/12/2024](https://engineering.fb.com/2024/12/02/production-engineering/meta-andromeda-advantage-automation-next-gen-personalized-ads-retrieval-engine/) e [teleconferência de 28/01/2026](https://s21.q4cdn.com/399680738/files/doc_financials/2025/q4/META-Q4-2025-Earnings-Call-Transcript.pdf).

O motivo declarado é volume. O mesmo texto diz que o avanço do Advantage+ *"aumenta ainda mais o número de anúncios elegíveis"*, e a teleconferência de janeiro de 2025 liga o Andromeda ao momento em que *"os anunciantes usam nossas ferramentas de IA generativa para criar e testar mais anúncios"*.

Daí vem o conselho que domina o assunto: diversificar criativo. *Agências e consultores afirmam que o Andromeda agrupa anúncios muito parecidos e os trata como um só; não encontrei essa regra descrita em documentação da Meta, então registro como não confirmada.* O tema deste texto é o dado que entra.

## Qual é o sintoma que aparece na conta?

Quem opera a conta descreve como uma mudança sem causa aparente. O custo por compra muda sem que nada tenha sido mexido, o Gerenciador de Anúncios mostra compras que o ERP não confirma, e o ROAS da Meta somado ao do Google [passa do faturamento](https://precisian.io/blog/pt-BR/posts/roas-soma-maior-que-faturamento/).

Parte disso é o sistema mudando, e o anunciante não controla. Parte é o sinal que a loja manda, e esse ele controla. Os dois produzem o mesmo sintoma no painel, e a forma de separá-los é olhar o que saiu da loja, não o que a Meta devolveu.

## Por que o seu evento de compra pesa mais agora?

Porque o sistema de entrega da Meta aprende com o evento que você escolheu otimizar, e a Meta documenta que só o evento que ela consegue casar com uma pessoa entra nessa conta.

A frase está nas boas práticas da API de Conversões: *"Você só pode usar eventos casados para atribuição de anúncios e otimização de entrega"*, e *"maior qualidade de correspondência produz melhores resultados"* ([Meta, boas práticas da API de Conversões](https://developers.facebook.com/docs/marketing-api/conversions-api/best-practices), lida em 23/11/2026).

Há uma ressalva. A Meta não publica quais sinais o Andromeda usa como entrada. O blog de engenharia fala em reconstruir *"sinais latentes de interação entre usuário e anúncio"* e não detalha mais. O que é documentado é a regra acima, que vale para a entrega inteira, recuperação e ranqueamento juntos. Com um modelo que escolhe entre mais anúncios, com mais personalização, a qualidade do alvo que você dá a ele pesa mais.

Três defeitos do dado da loja treinam o sistema no alvo errado:

**Compra contada duas vezes.** Pixel e API de Conversões só viram a mesma compra quando o `eventID` do Pixel é igual ao `event_id` do servidor, o nome do evento é igual nos dois, e eles chegam *"em até 48 horas"* ([Meta, deduplicação](https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events/), lida em 23/11/2026). Fora disso, o sistema recebe duas compras de uma pessoa que comprou uma vez.

**Valor errado.** O parâmetro `value` é *"obrigatório para eventos de compra ou qualquer evento que use otimização de valor"*, e `currency` é *"obrigatório para eventos de compra"* ([Meta, parâmetros de dados personalizados](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/custom-data), lida em 23/11/2026). Um exemplo com números redondos, sintético: uma loja que manda o valor em centavos (15990 em vez de 159,90) diz à Meta que cada pedido vale cem vezes mais. Se a campanha otimiza por valor, ela vai atrás de quem parece comprar caro.

**Compra que não existiu.** Em muitas integrações, o Pixel dispara `Purchase` quando o pedido é criado. O Pix expira, o boleto não é pago, o antifraude barra. O ERP sabe disso; a Meta, não. Ela aprendeu com uma venda que nunca entrou no caixa.

O detalhe técnico de cada um está no [post sobre a API de Conversões da Meta](https://precisian.io/blog/pt-BR/posts/api-de-conversoes-da-meta/).

## Como diagnosticar o sinal que a sua loja manda?

Com cinco verificações, num dia fechado. As quatro primeiras saem da Dataset Quality API, o endpoint `dataset_quality` da Meta, que devolve a qualidade do conjunto de dados evento por evento ([Meta, Dataset Quality API](https://developers.facebook.com/docs/marketing-api/conversions-api/dataset-quality-api), lida em 23/11/2026).

| Verificação | Onde olhar | O que indica problema |
|---|---|---|
| Event Match Quality | campo `event_match_quality` | Nota de 0 a 10, hoje *"disponível apenas para eventos de site"*. Compare entre eventos e acompanhe a tendência |
| Cobertura de evento | campo `event_coverage` | Média de 7 dias dos eventos do Pixel cobertos pela API |
| Chave de deduplicação | campo `dedupe_key_feedback` | Eventos de navegador e de servidor sem `event_id` |
| Atraso | campo `event_delay` | Eventos com mais de 2 horas e mais de 24 horas de atraso nos últimos 7 dias |
| Compras e valor contra o ERP | eventos `Purchase` recebidos × pedidos aprovados; soma de `value` × receita do dia | A Meta recebendo mais compras ou mais valor do que a loja aprovou |

As quatro primeiras verificações saem de uma única requisição GET, no formato da documentação da Meta:

```
curl -X GET -G \
  -d 'fields=web{event_name,event_match_quality,event_coverage,dedupe_key_feedback,event_delay}' \
  -d 'dataset_id=<ID_DO_CONJUNTO_DE_DADOS>' \
  -d 'access_token=<TOKEN>' \
  https://graph.facebook.com/<VERSÃO>/dataset_quality
```

O app precisa de `ads_read` e de `ads_management` ou `business_management`, e o usuário precisa de pelo menos acesso parcial para usar o conjunto de dados ([Meta, Dataset Quality API](https://developers.facebook.com/docs/marketing-api/conversions-api/dataset-quality-api)). Para a quinta, tire do ERP os pedidos aprovados do mesmo dia, no mesmo fuso da conta de anúncios, e compare dois números: quantidade de pedidos e valor total. Deixe a conversão atribuída de fora; ela responde outra pergunta.

A quinta linha costuma ficar sem automação, e é ela que separa *"a Meta mudou"* de *"a loja manda errado"*. Se os pedidos e o valor batem com o ERP dentro de uma tolerância escrita, a variação no custo por compra é do sistema da Meta. Se não batem, a conta está treinando o Andromeda com um alvo que não é a sua venda.

## Como corrigir o sinal?

Na ordem em que o erro custa mais.

1. **Um `event_id` gerado uma vez, no servidor.** O número do pedido serve. A página de confirmação o entrega ao Pixel, e a API manda o mesmo valor.
2. **`value` e `currency` conferidos contra o pedido.** Valor em reais, com ponto decimal, com a mesma regra de frete e desconto que o seu financeiro usa. `currency` como `BRL`.
3. **Uma decisão escrita sobre o momento da compra.** Pedido criado, pagamento aprovado ou nota faturada. Qualquer uma serve, desde que Pixel, servidor e relatório usem a mesma, e que o evento caia dentro das 48 horas da deduplicação.
4. **Envio perto do tempo real.** A Meta recomenda mandar *"em tempo real ou em lotes próximos do tempo real"* ([boas práticas](https://developers.facebook.com/docs/marketing-api/conversions-api/best-practices)).
5. **Uma reconciliação diária contra o ERP**, com limiar. Um exemplo de regra, não um padrão de mercado: diferença de pedidos acima de 2% no dia vira incidente.

Se o caminho do evento passa por um contêiner server-side, vale ler [o que o GTM server-side não resolve sozinho](https://precisian.io/blog/pt-BR/posts/stape-gtm-server-side/): ele muda por onde o evento viaja, não o que o evento diz.

## Quando isso não tem conserto?

Em três situações, e nenhuma é de configuração.

**A venda que nunca passou pelo site.** Pedido no Mercado Livre, venda fechada no WhatsApp, loja física. O Andromeda só aprende com o que chega à Meta, e essas vendas só chegam se outro sistema as registrar e enviar. Sem isso, o sistema otimiza para o pedaço da receita que ele enxerga.

**O leilão é da Meta.** Recuperação, ranqueamento e leilão são caixas fechadas. Os ganhos de 4%, 8% e 14% da tabela acima foram medidos e publicados pela própria empresa que vende a mídia. Nenhum ajuste de dado do seu lado torna esse processo auditável.

**A Meta julgando a Meta.** O Gerenciador de Anúncios, a API e o [MCP oficial da Meta Ads](https://precisian.io/blog/pt-BR/posts/mcp-da-meta-ads/) devolvem a conversão atribuída pela Meta. Para saber se uma mudança no Andromeda mexeu na sua venda, a comparação tem que ser contra o ERP, num lugar que não pertença a quem vende o anúncio.

É nessa terceira parte que a Precisian entra: pedido do ERP, evento enviado à Meta e gasto de mídia no mesmo lake, isolado por cliente na infraestrutura da Precisian, com a definição de "pedido" e de "receita" escrita numa [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/) que o analista e a IA leem do mesmo lugar. A Precisian não opera mídia nem ativa campanha. E se o seu problema é só `event_id` desencontrado, a correção é um ajuste de desenvolvimento pontual; você não precisa de plataforma de dados para isso.

## O que este artigo não cobre?

Não traz recomendação de estrutura de campanha, de orçamento nem de quantidade de criativos. Isso é operação de mídia, e o que circula sobre o tema depois do Andromeda vem de agências, não da Meta.

Não estima quanto uma conta ganha ou perde com o Andromeda. A Meta não publica esse número por anunciante, e eu não projeto percentual de outra empresa sobre a sua.

Não trata de consentimento nem de LGPD. Mandar evento pelo servidor não muda a base legal de quem não consentiu.

E não descreve o funcionamento interno do GEM, o modelo de ranqueamento, além do que as teleconferências citadas dizem.

Se o custo por compra mudou e ninguém sabe se foi o Andromeda ou a loja, o primeiro passo é comparar, num dia fechado, as compras e o valor que a Meta recebeu com os pedidos aprovados no ERP. [Veja a pergunta deste post respondida sobre um lake de verdade](https://precisian.io/demonstracao?utm_source=blog&utm_medium=cta&utm_campaign=meta-andromeda&utm_content=texto), sem compromisso de contrato.
