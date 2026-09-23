---
title: "Atribuição no WhatsApp: o que a API entrega e o que ela nunca vai entregar"
description: "O objeto referral entrega o identificador do anúncio, não da campanha. E o wa_id não conversa com nenhum identificador do lado web."
slug: "atribuicao-whatsapp-dark-funnel"
lang: "pt-BR"
translationKey: "whatsapp-dark-funnel"
publishedAt: 2026-10-01
tags: ["whatsapp", "atribuicao", "divergencia-de-dados"]
draft: false
llmSummary: "Na Click to WhatsApp, o objeto referral entrega onze campos, entre eles ctwa_clid e source_id — que é o ID do anúncio, não da campanha. A Meta não auxilia na deduplicação de eventos e não publica acurácia do classificador que infere vendas por regex e NLP nas conversas."
citations: ["https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages/text", "https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing", "https://developers.facebook.com/docs/marketing-api/conversions-api/business-messaging", "https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/automatic-events-api", "https://cetic.br/pt/tics/domicilios/2025/individuos/C5/"]
about: ["https://en.wikipedia.org/wiki/WhatsApp", "https://precisian.io/datalake/"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

Quando alguém clica num anúncio e cai na sua conversa de WhatsApp, a API entrega o identificador do **anúncio** — não da campanha, não do conjunto, não da UTM. Na referência de webhook publicada pela Meta e vigente em setembro de 2026, o objeto `referral` traz 11 campos, entre eles `source_id` e `ctwa_clid`, e só aparece "if message via a Click to WhatsApp ad" ([Meta for Developers](https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages/text)). Todo o resto da jornada é conversa, e conversa não tem campo.

> **Dark funnel**: parte do processo de compra que acontece fora de qualquer sistema que a empresa mede, produzindo receita cuja origem não é reconstruível com os dados disponíveis.

O canal importa demais para ficar sem medição. A TIC Domicílios 2025, do Cetic.br, mede que **92% dos usuários de internet no Brasil enviaram mensagens instantâneas** nos três meses anteriores à pesquisa, contra 81% em redes sociais e 59% em e-mail ([Cetic.br](https://cetic.br/pt/tics/domicilios/2025/individuos/C5/)). É a pesquisa oficial do país sobre uso de internet, com amostra estratificada e entrevista presencial.

## O que chega quando a conversa vem de um anúncio?

Mais do que a maioria imagina, e numa chave que quase nenhum BI fala.

Os 11 campos documentados pela [Meta](https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages/text) são `source_url`, `source_id`, `source_type`, `body`, `headline`, `media_type`, `image_url`, `video_url`, `thumbnail_url`, `ctwa_clid` e `welcome_message`. É bastante contexto do criativo.

Mas o `source_id` é o identificador do **anúncio**. Para saber a que campanha ele pertence, você precisa resolver esse ID contra a Marketing API, num segundo passo, e guardar a correspondência. Se ninguém fizer isso no momento em que a mensagem chega, a informação continua existindo e deixa de ser utilizável — porque daqui a seis meses aquele anúncio pode nem existir mais.

Vale um aviso de leitura da própria documentação: o campo `source_type` está descrito com um texto idêntico ao de `media_type` ("Click to WhatsApp ad media type"). Parece erro de cópia na doc da Meta. Na prática o campo carrega o tipo de origem, mas **a documentação não sustenta isso**, e este artigo não afirma o que a fonte não diz.

## Por que o identificador da pessoa quebra o join?

Porque não é um cookie nem um `client_id` de analytics. É o `wa_id`, que chega junto com o `profile.name` no payload do webhook.

Nenhum dos dois existe do lado web. O visitante que navegou no seu site tem um identificador de navegador; a pessoa que mandou mensagem tem um identificador de WhatsApp. São universos separados por construção, e nenhuma configuração de tag os une.

A consequência prática é que a jornada se parte em duas metades que nunca se encontram sozinhas: tudo antes do clique vive no analytics, tudo depois vive na conversa. Costurar as duas exige guardar o `ctwa_clid` no momento em que ele chega e carregá-lo adiante — até o pedido, até o CRM, até o lugar onde a venda é registrada. É trabalho de encanamento, feito uma vez, e sem ele não há atribuição possível depois.

## Quais são as duas janelas, e por que confundi-las custa caro?

Porque elas parecem uma só e são duas, com contadores independentes.

| Janela | Duração | O que permite |
|---|---|---|
| Atendimento (customer service) | **24 horas**, reinicia a cada mensagem do usuário | mensagem livre, sem template |
| Free Entry Point | **72 horas**, para conversa vinda de anúncio CTWA | isenção de cobrança, **não** liberdade de formato |

As duas estão documentadas na [página de preço da plataforma](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing), vigente desde 1º de julho de 2025, quando a cobrança passou a ser por mensagem.

O erro operacional clássico é ler a janela de 72 horas como permissão para conversar três dias. Não é. Fechada a janela de 24 horas, só sai template aprovado — mesmo com a Free Entry Point aberta. Times que montam fluxo de recuperação em cima dessa confusão descobrem o problema quando a mensagem não entrega, e costumam culpar a ferramenta.

Há um efeito colateral de categorização que pesa no custo: um template que mistura utilidade com marketing é classificado como **marketing**, e o ambíguo também ([Meta](https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/template-categorization)). A Meta recategoriza automaticamente, e o pedido de revisão só é aceito em até 60 dias da aprovação. Uma frase promocional dentro de um aviso de entrega muda a categoria — e a fatura.

## A Meta pode adivinhar a sua venda. Com que precisão?

Ela não diz, e essa é a parte que merece decisão consciente.

A Automatic Events API observa as conversas vindas de anúncio e infere eventos como `LeadSubmitted` e `Purchase`. O método está descrito na documentação: a Meta aplica "regex e processamento de linguagem natural" sobre a thread e devolve o evento, com identificador de mensagem, timestamp e `ctwa_clid` — e, no caso de compra, valor e moeda ([Meta for Developers](https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/automatic-events-api)).

É conveniente e resolve a parte mais chata do trabalho. Só que **a Meta não publica nenhuma métrica de acurácia** desse classificador. Não há taxa de acerto, não há taxa de falso positivo, não há descrição do que conta como compra.

Ativar isso é terceirizar a definição de "venda" para um classificador fechado, operado por quem também vende a mídia que a venda vai justificar. Pode ser uma decisão razoável para um negócio pequeno; é uma decisão ruim para tomar sem saber que foi tomada. O recurso ainda é opt-in e não está disponível para clientes na União Europeia, Reino Unido e Japão.

## Onde a medição quebra sem ninguém perceber?

Em três lugares, todos documentados pela própria Meta.

**Encurtador de link.** A documentação de medição de conversão é explícita: serviços que removem, sobrescrevem ou não repassam os parâmetros anexados pela Meta interferem na medição ([Meta](https://developers.facebook.com/documentation/business-messaging/whatsapp/marketing-messages/measure-conversion/)). O encurtador bonito que o time de mídia colocou no anúncio pode estar apagando a atribuição inteira.

**Dupla contagem.** A documentação da Conversions API for Business Messaging diz que a Meta **não auxilia na deduplicação** e que o anunciante deve deduplicar antes de enviar ([Meta](https://developers.facebook.com/docs/marketing-api/conversions-api/business-messaging)). Quem manda o mesmo evento pela CAPI e pelo pixel conta duas vezes, e o número infla sem erro aparente.

**Último toque Meta.** A conversão é atribuída ao último toque dentro do ecossistema da Meta antes do evento. Não é atribuição multicanal, e comparar esse número com o do seu analytics é comparar dois modelos, não dois dados.

E há um limite de plataforma que costuma surpreender: medição em app iOS não é suportada nesse fluxo hoje.

## Por que isso é diferente de um canal mal configurado?

Porque não há configuração que resolva, e confundir os dois desperdiça trimestres.

Um canal mal configurado tem conserto conhecido: falta tag, falta parâmetro, falta evento. Alguém corrige e o dado aparece retroativamente ou, no pior caso, dali em diante. O time sabe o que fazer e sabe quando terminou.

O WhatsApp é outra categoria. O dado de origem existe por um instante — o primeiro webhook — e depois a conversa segue sem carregar procedência nenhuma. Não é um campo vazio esperando configuração: é um campo que não existe nas mensagens seguintes, porque a conversa não é uma sessão de navegação e nunca teve a pretensão de ser.

Isso muda o tipo de solução. Em canal mal configurado você conserta a coleta. Aqui você constrói persistência: alguém precisa pegar o identificador no momento em que ele passa e guardá-lo num lugar que o pedido também alcance. Se esse pedaço não for construído, nenhuma ferramenta comprada depois recupera o histórico, porque o histórico nunca foi gravado.

É também por isso que a pergunta "qual ferramenta resolve atribuição de WhatsApp" costuma ter resposta decepcionante. Ferramenta nenhuma resolve sozinha: ela pode capturar bem a partir de hoje, e não pode inventar o que não foi guardado ontem.

## Como montar a captura mesmo assim?

Aceitando que o dado chega uma vez e não volta.

**Guarde o `ctwa_clid` no instante em que ele chega.** Ele é a única ponte entre o anúncio e a conversa. Se não for persistido no primeiro webhook, a ponte não existe.

**Resolva o `source_id` para campanha na hora.** Guardar só o ID do anúncio é guardar uma chave que envelhece.

**Carregue o identificador até o pedido.** O `ctwa_clid` precisa viajar do webhook até o registro da venda, seja no e-commerce, no ERP ou no CRM. É aqui que quase toda implementação para no meio.

**Escreva a regra de deduplicação antes de ligar a CAPI.** A Meta avisou que não faz isso por você.

**Meça o que dá para medir, e declare o resto.** Volume de conversa por anúncio é mensurável. Receita atribuída a canal, no sentido que o financeiro entende, exige a costura acima — e sem ela o honesto é reportar a lacuna, não estimá-la.

Esse encanamento é, por natureza, trabalho de camada de dados e não de analytics: o `ctwa_clid` precisa repousar num lugar que o pedido também alcance. É o mesmo padrão que faz [marketplace virar buraco negro](https://precisian.io/blog/pt-BR/posts/marketplace-buraco-negro-de-dados/) — a origem existe por um instante e some se ninguém a persistir. Um [lake isolado por cliente](https://precisian.io/datalake/) resolve a parte de guardar; a definição do que conta como venda continua sendo decisão sua.

## O que este artigo não cobre?

Não traz nenhuma porcentagem de vendas que acontecem por WhatsApp no Brasil, e a ausência é deliberada.

Procurei em fonte oficial e **esse indicador não existe**. A mesma TIC Domicílios citada acima mede uso de mensageria e mede compra pela internet, em indicadores separados — mas **nenhuma pesquisa oficial cruza os dois por canal de mensageria**. Os números que circulam sobre isso vêm de fornecedores de chatbot.

Três afirmações técnicas muito repetidas também ficaram de fora por não terem lastro na documentação: que o `ctwa_clid` chegaria apenas na primeira mensagem da conversa, que existiria um botão de atribuição no aplicativo capaz de suprimir o `referral`, e qualquer janela específica de atribuição para CTWA. Nenhuma das três está nos documentos que abri.

A primeira é a mais importante, porque é a premissa de qualquer arquitetura de captura — e é testável em uma hora, com um anúncio barato e três mensagens seguidas. Vale mais fazer o teste do que copiar a afirmação.

Se a sua operação vende por WhatsApp e não consegue dizer qual anúncio gerou a venda, o primeiro passo é verificar se alguém está guardando o `ctwa_clid`. [Agende uma conversa sobre o seu caso](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).
