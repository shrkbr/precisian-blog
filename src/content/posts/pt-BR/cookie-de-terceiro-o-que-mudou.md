---
title: "O cookie de terceiro não acabou, e o substituto dele foi cancelado"
description: "O Google reverteu em abril de 2025 e, em outubro, aposentou Topics e Attribution Reporting. Não existe sucessor."
slug: "cookie-de-terceiro-o-que-mudou"
lang: "pt-BR"
translationKey: "third-party-cookie-state"
publishedAt: 2026-10-16
tags: ["cookies", "privacidade", "atribuicao"]
draft: false
llmSummary: "O Chrome mantém o cookie de terceiro ligado por padrão: em abril de 2025 o Google decidiu manter a abordagem atual e em outubro aposentou Topics, Protected Audience e Attribution Reporting. O Safari bloqueia por padrão desde março de 2020 e o Firefox particiona desde junho de 2022."
citations: ["https://privacysandbox.google.com/blog/privacy-sandbox-next-steps", "https://privacysandbox.google.com/blog/update-on-plans-for-privacy-sandbox-technologies", "https://www.gov.uk/government/news/cma-consults-on-releasing-google-from-privacy-sandbox-commitments", "https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/", "https://blog.mozilla.org/en/mozilla/firefox-rolls-out-total-cookie-protection-by-default-to-all-users-worldwide/", "https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-publica-mapa-de-temas-prioritarios-para-o-bienio-2026-2027-e-atualiza-agenda-regulatoria-2025-2026"]
about: ["https://en.wikipedia.org/wiki/HTTP_cookie", "https://precisian.io/datalake/"]
author: "Gabriel Sorato"
readingTimeMinutes: 6
---

O cookie de terceiro continua funcionando no Chrome, ligado por padrão. Em abril de 2025 o Google declarou que vai "manter nossa abordagem atual" e que **não** lançaria o aviso que perguntaria ao usuário ([Privacy Sandbox](https://privacysandbox.google.com/blog/privacy-sandbox-next-steps)). Em outubro de 2025 foi além e aposentou boa parte da tecnologia que substituiria o cookie. Quem planejou medição em cima do fim do cookie planejou para um evento que não aconteceu.

> **Cookie de terceiro**: arquivo gravado por um domínio diferente daquele que o usuário está visitando, historicamente a base do rastreamento entre sites.

## O que aconteceu, em ordem?

Quatro movimentos em dezoito meses, e o quarto é o que quase ninguém registrou.

**Abril de 2024**, adiamento. O Google informa que não completaria a depreciação no segundo semestre daquele ano, prevendo retomar "no início do ano que vem" ([Privacy Sandbox](https://privacysandbox.google.com/blog/update-on-the-plan-for-phase-out-of-third-party-cookies-on-chrome)).

**Julho de 2024**, mudança de plano. Em vez de depreciar, o Chrome passaria a oferecer "uma nova experiência que permite às pessoas fazer uma escolha informada" ([Privacy Sandbox](https://privacysandbox.google.com/blog/privacy-sandbox-update)).

**Abril de 2025**, reversão. Nem isso: a decisão foi manter a abordagem corrente e **não** lançar o aviso autônomo.

**Outubro de 2025**, o substituto morre. O Google anuncia a aposentadoria de um conjunto de tecnologias da Privacy Sandbox "após avaliar o retorno do ecossistema sobre o valor esperado e à luz dos baixos níveis de adoção", incluindo **Topics, Protected Audience, Attribution Reporting API, Private Aggregation, Related Website Sets e IP Protection** ([Privacy Sandbox](https://privacysandbox.google.com/blog/update-on-plans-for-privacy-sandbox-technologies)). Ficam de pé CHIPS, FedCM e Private State Tokens. A Privacy Sandbox no Android foi descontinuada.

Há confirmação independente de que a reversão é real, e ela vem de um regulador. No mesmo mês, a autoridade de concorrência do Reino Unido liberou o Google dos compromissos assumidos sobre a Privacy Sandbox, citando que a empresa "não planeja mais restringir cookies de terceiro no Chrome" ([CMA](https://www.gov.uk/government/news/cma-consults-on-releasing-google-from-privacy-sandbox-commitments)).

## Então não mudou nada?

Mudou muito, só que não no Chrome e não em 2025.

O bloqueio total de cookie de terceiro já existe, por padrão, desde **24 de março de 2020**, quando a Apple anunciou que "cookies para recursos entre sites agora estão bloqueados por padrão, de forma geral" no Safari ([WebKit](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)). A mesma publicação descreve o apagamento de todo armazenamento gravável por script após **sete dias** sem interação do usuário com o site.

O Firefox partiu o cookie por site com a Total Cookie Protection, ativada por padrão a partir de **junho de 2022**, confinando cada cookie ao site que o criou ([Mozilla](https://blog.mozilla.org/en/mozilla/firefox-rolls-out-total-cookie-protection-by-default-to-all-users-worldwide/)).

Ou seja: o apocalipse do cookie aconteceu há mais de seis anos, nos navegadores em que quase ninguém baseou a própria medição. **O Chrome é o retardatário, não a vanguarda.** Quem passou 2023 e 2024 preparando-se para uma data no Chrome estava se preparando para o evento errado, enquanto a perda de sinal real já acontecia em outro lugar.

## O que sobreviveu da Privacy Sandbox, e serve para quê?

Três tecnologias, e vale saber porque a confusão entre "a Sandbox acabou" e "a Sandbox mudou" gera decisão errada.

Ficaram de pé o CHIPS, que permite cookie de terceiro particionado por site que o incorpora; o FedCM, para login federado sem cookie de terceiro; e os Private State Tokens, voltados a sinal de confiança contra fraude.

Olhando o que ficou, aparece um padrão: sobreviveu o que resolve funcionalidade de site, e saiu o que resolvia publicidade. CHIPS mantém widget e chat embutido funcionando. FedCM mantém "entrar com" funcionando. Nenhum dos dois devolve segmentação ou medição entre sites.

Isso reorganiza a conversa sobre planejamento. Se o seu time acompanhava a Privacy Sandbox esperando a peça que substituiria o pixel de terceiro para atribuição, essa peça era a Attribution Reporting API, e ela está na lista de aposentadas. Não há substituto anunciado, e o motivo declarado pelo próprio Google foi baixa adoção, não falha técnica.

## Por que a narrativa do "fim do cookie" foi tão útil para tanta gente?

Porque ela transformava um problema difuso numa data.

Perda de sinal é gradual, distribuída entre navegadores, bloqueadores, recusa de consentimento e limites de sistema operacional. É difícil de vender e mais difícil ainda de priorizar. Uma data, ao contrário, cabe em apresentação: existe um prazo, existe um antes e um depois, e existe um produto a comprar antes que ele chegue.

A data não veio e o problema continuou crescendo pelos motivos de sempre. Esse é o custo da narrativa: times que trataram a perda de sinal como um projeto com prazo agora acham que o projeto foi cancelado, quando o que foi cancelado era só a data.

A formulação que sobrevive à conferência é outra: **a perda de sinal é estrutural e independe do Chrome.** Safari bloqueia desde 2020, Firefox particiona desde 2022, o consentimento remove uma fatia que [a modelagem do GA4 só estima na interface](https://precisian.io/blog/pt-BR/posts/consent-mode-dado-modelado/), e nada disso depende de um anúncio futuro.

## O que fazer com essa informação?

Três ajustes, e nenhum deles é comprar ferramenta.

**Pare de datar o problema.** Roadmap com marco de "fim do cookie" precisa ser reescrito, porque o marco não existe e a substituição que estava planejada também não.

**Meça a perda que você já tem, por navegador.** A diferença de comportamento entre Safari e Chrome na sua própria base é o tamanho real do seu problema hoje, e ela é observável sem fornecedor nenhum.

**Trate o dado próprio como resposta, não como tendência.** O que atravessa bloqueio de navegador é o que o seu sistema registra de primeira mão, ligado ao pedido. Isso é trabalho de coleta e de [onde o dado repousa](https://precisian.io/datalake/), não de tecnologia de rastreamento.

Vale notar o que a aposentadoria de outubro de 2025 significa para quem esperava substituto: não há um. Topics e Attribution Reporting eram as peças que ocupariam o lugar do cookie para segmentação e medição, e ambas saíram. Quem adiou decisão esperando o sucessor amadurecer esperou por algo que foi cancelado.

## E no Brasil?

O Brasil não tem legislação específica de consentimento para cookie equivalente à europeia. A ANPD trata o tema pelos princípios da LGPD e por um guia orientativo publicado em outubro de 2022, que é orientação e não norma.

O que mudou recentemente é o foco de fiscalização. O Mapa de Temas Prioritários para 2026-2027 lista quatro eixos, incluindo inteligência artificial e tecnologias emergentes, e menciona explicitamente **o monitoramento de uso secundário de dados pessoais para entrega de publicidade direcionada** ([ANPD](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-publica-mapa-de-temas-prioritarios-para-o-bienio-2026-2027-e-atualiza-agenda-regulatoria-2025-2026)).

A leitura defensável, então, é: hoje não é regulado como na Europa, e está explicitamente no radar de fiscalização do biênio. Quem se preparou para a regra do Chrome e não para a da ANPD preparou-se para a fonte errada de risco.

## O que este artigo não cobre?

Não cobre implementação de coleta própria nem comparação de fornecedores de rastreamento, e não dá orientação jurídica.

Dois limites de verificação, declarados. Encontrei referência a texto desatualizado sobre a depreciação em domínio do próprio Google, descrevendo um plano de aumento gradual que não se concretizou; não consegui fixar qual página ainda o carrega, e por isso não o cito nem como exemplo. E não fixei a data exata em que o Firefox atingiu a totalidade dos usuários de desktop, porque a implantação foi gradual e a própria comunicação da Mozilla varia entre "todos" e "mais usuários".

Se o seu planejamento de medição ainda tem um marco chamado "fim do cookie", ele está datado de um evento que não ocorreu. [Agende uma conversa sobre o seu caso](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).
