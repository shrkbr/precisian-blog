---
title: "Consent Mode: por que o GA4 e o BigQuery nunca vão bater, por desenho"
description: "O Google exclui explicitamente o export para BigQuery do dado modelado. Interface e warehouse medem coisas diferentes, por desenho."
slug: "consent-mode-dado-modelado"
lang: "pt-BR"
translationKey: "consent-mode-modeled-data"
publishedAt: 2026-10-15
tags: ["consent-mode", "ga4", "divergencia-de-dados"]
draft: false
llmSummary: "A modelagem comportamental do GA4 existe só na interface: o Google lista o export para BigQuery entre os recursos que não suportam dado modelado. A elegibilidade exige mil eventos diários com consentimento negado por 7 dias e mil usuários diários consentidos em 7 dos 28 dias anteriores."
citations: ["https://support.google.com/analytics/answer/11161109", "https://support.google.com/analytics/answer/12856703", "https://support.google.com/google-ads/answer/10548233", "https://developers.google.com/tag-platform/security/concepts/consent-mode", "https://support.google.com/analytics/answer/14275483"]
about: ["https://en.wikipedia.org/wiki/Google_Analytics", "https://precisian.io/datalake/"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

O relatório do GA4 e o export para o BigQuery não batem, e não é erro de configuração: a documentação do Google lista explicitamente "Data export, for example, BigQuery export" entre os recursos que **não suportam dado comportamental modelado** ([Google](https://support.google.com/analytics/answer/11161109)). A interface mostra estimativa; o warehouse recebe evento observado. Reconciliar os dois é perseguir uma diferença que foi construída de propósito.

> **Modelagem comportamental**: estimativa que o Google produz para usuários que negaram consentimento, usando o comportamento dos que consentiram, e que existe apenas na interface do Analytics.

## Onde o dado modelado aparece, e onde não aparece?

A lista de exclusões é a parte que quase ninguém lê, e é onde mora o problema.

Segundo a documentação do Google, não usam dado modelado: audiências, explorações de usuário, de coorte e de tempo de vida, segmentos com sequência, relatórios de retenção, métricas preditivas e **exportação de dados, incluindo o export para o BigQuery**.

Some isso ao fato de que, para ver dado modelado nos relatórios, é preciso escolher a identidade de relatório **combinada** ("Blended"), e você tem duas superfícies com regras diferentes olhando para o mesmo período.

O efeito prático é uma divergência estrutural e permanente. Quanto maior a fatia de tráfego sem consentimento, maior a diferença, e nenhuma correção de tag a diminui, porque não há nada quebrado para corrigir.

## Quais são os requisitos exatos da modelagem?

Três, e eles são mais altos do que a maioria das operações brasileiras imagina.

O Google exige que o Consent Mode esteja ativo em todas as páginas do site ou telas do aplicativo, **pelo menos 1.000 eventos por dia com `analytics_storage='denied'` por no mínimo 7 dias**, e **pelo menos 1.000 usuários diários enviando eventos com consentimento concedido em 7 dos 28 dias anteriores** ([Google](https://support.google.com/analytics/answer/11161109)).

E há uma ressalva que muda o planejamento: atender os três critérios **não garante** elegibilidade. A mesma página informa que o modelo aplica critérios adicionais, incluindo a razão entre usuários novos e recorrentes.

A consequência é binária e pouco discutida. Abaixo do limiar, não existe estimativa: o dado dos usuários que negaram consentimento simplesmente não aparece. Não é modelado com menos precisão, é ausente. Propriedade pequena com banner de consentimento perde a fatia inteira, sem aviso na tela.

## Como descobrir quanto do meu dado é modelado?

O Google não publica esse número, e verifiquei isso por três caminhos.

A documentação de qualidade de dado descreve os estados do ícone como não amostrado, com limiar aplicado ou amostrado, e mostra **percentual para amostragem**, do tipo "este relatório é baseado em 8,88% dos dados disponíveis". **Modelagem não aparece nessa página** ([Google](https://support.google.com/analytics/answer/12856703)). A documentação da modelagem diz apenas para usar o ícone para ver *quando* há dado modelado integrado. Quando, não quanto.

Há uma tela que parece responder e não responde: em configurações de consentimento, o GA4 mostra o percentual do tráfego e das conversões vindos do Espaço Econômico Europeu ([Google](https://support.google.com/analytics/answer/14275483)). Isso é fatia de tráfego europeu, **não** fatia de dado modelado. São números diferentes, e confundi-los produz uma conclusão errada com aparência de precisão.

A única aproximação metodologicamente honesta é a que decorre da exclusão citada na abertura: **compare a mesma métrica, no mesmo período, entre a interface e o BigQuery.** Como o export não contém dado modelado, a diferença é uma estimativa da modelagem mais os demais efeitos de processamento. É inferência sua, não número do Google, e deve ser reportada como tal.

## A modelagem do Google Ads é a mesma?

Não. É outro modelo, com outro limiar, e tratá-los como um só produz conclusão errada.

A documentação do Google Ads exige implementação correta do Consent Mode ou do framework TCF v2.0, e um limiar de **700 cliques em anúncios ao longo de 7 dias, por país e agrupamento de domínio** ([Google](https://support.google.com/google-ads/answer/10548233)).

A mesma página traz uma afirmação que vale para qualquer discussão sobre consentimento: usuários que consentem são tipicamente **2 a 5 vezes mais propensos a converter** que os que não consentem. E admite, em texto próprio, que algumas conversões que de fato ocorreram podem não ser contabilizadas.

Isso significa que a fatia sem consentimento não é uma amostra aleatória do seu público. Ela é sistematicamente diferente, e qualquer extrapolação ingênua a partir dos consentidos superestima.

Há ainda um efeito de composição que agrava tudo isso. Como a fatia sem consentimento converte menos, ela não é uma amostra menor do mesmo público: é um público diferente. Extrapolar o comportamento dos consentidos para os que recusaram infla a estimativa de conversão exatamente na parte que você não observa, e infla de forma consistente, não aleatória. Um erro aleatório se dilui em série longa; um viés sistemático, não.

## Básico ou avançado muda alguma coisa?

Muda o que é enviado enquanto o consentimento está negado, e por isso muda a qualidade da estimativa.

No modo básico, as tags do Google não carregam até o usuário interagir com o banner, e **nada é transmitido antes disso**. No avançado, as tags carregam imediatamente e, com consentimento negado, enviam medições sem cookies, pings de estado de consentimento e de eventos ([Google](https://developers.google.com/tag-platform/security/concepts/consent-mode)).

A documentação é direta sobre a consequência: o modo avançado oferece modelagem melhor, porque produz um modelo específico do anunciante.

Há uma escolha de risco embutida aí que costuma ser feita por quem instala, não por quem responde por ela. Enviar ping sem cookie com consentimento negado é uma decisão que o jurídico deveria conhecer, especialmente à luz do [que a LGPD exige de registro e base legal](https://precisian.io/blog/pt-BR/posts/lgpd-ia-dados-de-cliente/).

## Por que isso passa despercebido por tanto tempo?

Porque os dois números são plausíveis, e nenhum deles está errado.

Uma divergência grosseira chama atenção: se a interface mostra o dobro do warehouse, alguém investiga no mesmo dia. Uma divergência de alguns pontos percentuais atravessa trimestres, porque cada área justifica a sua com razões convincentes. O time de marketing confia na interface, que é onde ele trabalha. O time de dados confia no export, que é onde ele consegue auditar. Os dois estão certos sobre a própria fonte e nenhum está olhando para a exclusão documentada que explica o resto.

O momento em que isso costuma estourar é previsível. Alguém monta um relatório que puxa do warehouse e apresenta ao lado de um painel que puxa da interface, na mesma reunião. A partir daí a discussão deixa de ser sobre o resultado e passa a ser sobre qual número é verdadeiro, e como os dois são, a conversa não termina.

A saída não é técnica, é de acordo. Alguém precisa decidir qual fonte responde qual pergunta, escrever isso, e fazer os dois relatórios declararem de onde vieram. É trabalho de meia hora que nunca é feito porque não tem dono.

## O que fazer com essa divergência?

Parar de tentar fechá-la e começar a nomeá-la.

**Escolha uma fonte como oficial, por tipo de decisão.** Interface para leitura de tendência com público amplo; BigQuery para qualquer número que vá para o financeiro ou para um contrato. Os dois são válidos, medem coisas diferentes, e a escolha precisa estar escrita.

**Meça a diferença uma vez por trimestre** e registre. Se ela cresce, é sinal de que a taxa de recusa de consentimento subiu, que é informação de negócio, não defeito técnico.

**Não use dado modelado em nada que precise ser auditado.** O próprio Google já exclui modelagem de audiências e do export; estender essa regra a fechamento e a relatório contratual é coerente com o desenho.

E, no nível de arquitetura, a decisão anterior a todas: o número que sustenta decisão deveria repousar num lugar onde a definição é escrita e o dado é observado, não estimado. É o argumento de sempre, e aqui ele tem uma forma específica, a [camada semântica sobre um lake próprio](https://precisian.io/datalake/) trabalha com o evento que chegou, e a estimativa fica onde ela é útil, que é na leitura de tendência.

## O que este artigo não cobre?

Não cobre implementação de banner de consentimento nem escolha de CMP, e não dá orientação jurídica sobre base legal.

Um limite de sourcing que vale declarar: as páginas de ajuda do Google usadas aqui **não exibem data de publicação**, o que é uma característica do próprio suporte, não um descuido de leitura. Apenas a documentação para desenvolvedores exibe data de atualização. Em tema que muda rápido, isso significa que toda citação aqui vale para o que essas páginas diziam quando foram lidas, no fim de setembro deste ano.

Também deixei de fora a data comumente citada como prazo de exigência do Consent Mode v2 na Europa. Procurei em página primária e datada do Google e não encontrei, a página do Tag Manager estabelece a exigência e **não traz data alguma**. O prazo circula amplamente; não consegui ancorá-lo, e por isso não o reproduzo.

Vale uma nota de calendário: essa divergência tende a crescer, não a encolher. Cada ajuste de banner que melhora a conformidade aumenta a taxa de recusa, e cada ponto de recusa aumenta a fatia estimada na interface sem mudar nada no warehouse. Quem tratou isso como ruído em 2024 vai encontrar um número maior em 2027, pelo funcionamento normal do sistema.

Se o seu GA4 e o seu BigQuery divergem, o primeiro passo não é investigar a tag. É verificar se você está comparando estimativa com observação. [Agende uma conversa sobre o seu caso](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).
