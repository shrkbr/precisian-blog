---
title: "MCP da Meta Ads: o conector oficial, as permissões e o número que ele devolve"
description: "O MCP oficial da Meta Ads saiu em beta aberto em 29/04/2026 e expõe 91 ferramentas. A conversão que ele devolve é a atribuída pela própria Meta."
slug: "mcp-da-meta-ads"
lang: "pt-BR"
translationKey: "meta-ads-mcp"
publishedAt: 2026-10-14
tags: ["mcp", "governanca", "atribuicao", "roas", "seguranca", "ai-data-access"]
draft: false
llmSummary: "A Meta lançou em 29/04/2026, em beta aberto, um servidor MCP oficial hospedado em mcp.facebook.com/ads. Em 14/10/2026 a documentação lista 91 ferramentas, 36 delas de escrita. A conversão devolvida segue a janela de atribuição da Meta, e as regras de bloqueio ficam no Meta Business Suite."
citations: ["https://www.facebook.com/business/news/meta-ads-ai-connectors", "https://developers.facebook.com/documentation/ads-commerce/ads-ai-connectors/ads-mcp-server/ads-mcp-server-overview", "https://developers.facebook.com/documentation/ads-commerce/ads-ai-connectors/ads-mcp-server/ads-mcp-server-get-started", "https://developers.facebook.com/documentation/ads-commerce/ads-ai-connectors/ads-mcp-server/ads-mcp-server-tools-ad-creation-and-management", "https://developers.facebook.com/documentation/ads-commerce/ads-ai-connectors/ads-mcp-server/ads-mcp-server-tools-comprehensive-reporting", "https://www.facebook.com/business/help/1456422242197840", "https://developers.facebook.com/docs/marketing-api/reference/ads-action-stats/", "https://www.facebook.com/business/news/click-attribution", "https://developers.facebook.com/blog/post/2026/04/29/introducing-ads-cli"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

O MCP da Meta Ads é o servidor oficial que liga um agente de IA à conta de anúncios da Meta. Foi lançado em beta aberto em 29 de abril de 2026 ([Meta](https://www.facebook.com/business/news/meta-ads-ai-connectors)), fica hospedado em `https://mcp.facebook.com/ads` e, na documentação que conferi em 14/10/2026, expõe 91 ferramentas. Ele lê e escreve, e a conversão que devolve é a que a Meta atribuiu a si mesma.

> **MCP da Meta Ads**: servidor Model Context Protocol mantido e hospedado pela Meta, parte dos "ads AI connectors", que expõe ao agente de IA ferramentas de relatório, criação e edição de campanha, catálogo, sinais, testes e histórico de alterações, autenticado pelo login da Meta e sujeito às permissões concedidas.

## Como o MCP oficial da Meta funciona na prática?

Você adiciona a URL `https://mcp.facebook.com/ads` como conector no cliente de IA, faz login com a conta da Meta e aprova as permissões. A Central de Ajuda lista quatro clientes suportados em 14/10/2026: ChatGPT, Claude, Claude Code e Perplexity ([Meta, Central de Ajuda](https://www.facebook.com/business/help/1456422242197840)). Não é preciso ter app de desenvolvedor. Quem quiser usar o próprio app adiciona o caso de uso "Create & manage ads with ads MCP server" ([Meta for Developers](https://developers.facebook.com/documentation/ads-commerce/ads-ai-connectors/ads-mcp-server/ads-mcp-server-get-started)).

Junto com o servidor saiu o Ads CLI, uma ferramenta de linha de comando para quem automatiza por script. Ele autentica com token de usuário de sistema, não com o login da pessoa, e cria tudo pausado por padrão ([Meta for Developers, 29/04/2026](https://developers.facebook.com/blog/post/2026/04/29/introducing-ads-cli)).

Contei as ferramentas nas sete páginas de categoria da documentação para desenvolvedores, em 14/10/2026 ([visão geral](https://developers.facebook.com/documentation/ads-commerce/ads-ai-connectors/ads-mcp-server/ads-mcp-server-overview)):

| Categoria | Ferramentas listadas | Exemplo de escrita |
|---|---|---|
| Relatório | 7 | nenhuma; é só leitura |
| Criação e gestão de anúncios | 28 | `ads_activate_entity` |
| Catálogo | 34 | `ads_catalog_delete_product` |
| Sinais e datasets | 13 | `ads_pixel_event_delete` |
| Ajuda e diagnóstico | 2 | nenhuma |
| Teste A/B e estudo de lift | 7 | `ads_experiment_lift_create_test` |
| Histórico de alterações | 1 | nenhuma |

`ads_get_ad_entities` aparece em duas categorias, por isso a soma é 92 e o total único é 91. Dessas, 36 têm no nome criar, atualizar, apagar, ativar, impulsionar ou conectar. A cobertura de terceiros na semana do lançamento falava em 29 ferramentas ([mcp.directory](https://mcp.directory/blog/meta-ads-cli-mcp)). O servidor cresceu, e vai continuar mudando: o número vale para a data em que foi contado.

## Que número de conversão o MCP da Meta devolve?

O da Meta, calculado pelas regras da Meta. A ferramenta principal de relatório, `ads_get_ad_entities`, devolve gasto, impressões, CTR, CPC, CPM e conversões, com filtro, quebra e intervalo de datas ([Meta for Developers](https://developers.facebook.com/documentation/ads-commerce/ads-ai-connectors/ads-mcp-server/ads-mcp-server-tools-comprehensive-reporting)). Conversão, ali, é a ação que a Meta atribuiu a um anúncio dentro de uma janela.

A referência da API de Marketing mostra o tamanho dessa escolha. Cada ação pode vir em campos separados por janela: `1d_click`, `7d_click`, `28d_view`, mais um campo `dda`, descrito como janela "powered by data driven model", e um `incrementality`, de atribuição incremental ([Meta, Ads Action Stats](https://developers.facebook.com/docs/marketing-api/reference/ads-action-stats/)). A mesma página avisa que a métrica some quando se tenta agregar configurações de atribuição diferentes. Quando o agente responde "a campanha X converteu 412 vezes", ele escolheu uma dessas janelas, ou herdou a padrão, e raramente diz qual.

A própria definição de clique mudou este ano. Em março de 2026 a Meta passou a contar na atribuição por clique só cliques em link, onde antes entravam curtida, compartilhamento e salvamento, e justificou com a inconsistência entre o Gerenciador de Anúncios e as ferramentas de terceiros ([Meta, março de 2026](https://www.facebook.com/business/news/click-attribution)). Uma série histórica puxada pelo MCP atravessa esse corte sem marcação.

Nada disso é defeito do servidor, que entrega com fidelidade o que a Meta mede. O problema aparece quando o mesmo agente também lê o Google Ads e soma as duas respostas: cada plataforma desconta só o que ela mesma contou, e o total passa do que o ERP faturou.

## Quais permissões o MCP da Meta pede?

Pelo caminho de token de usuário, a documentação manda conceder sete permissões de uma vez: `ads_mcp_management`, `ads_read`, `ads_management`, `catalog_management`, `business_management`, `pages_show_list` e `instagram_basic` ([Meta for Developers](https://developers.facebook.com/documentation/ads-commerce/ads-ai-connectors/ads-mcp-server/ads-mcp-server-get-started)). `ads_management` é a permissão de escrita da API de Marketing. O roteiro oficial não traz uma configuração só de leitura.

O que a Meta documenta como freio são três camadas:

1. **Criação pausada.** As ferramentas de escrita criam campanha, conjunto e anúncio pausados, e o cliente de IA pede confirmação antes de ativar. `ads_activate_entity` é descrita como a que "começa a gastar orçamento" ([Meta for Developers](https://developers.facebook.com/documentation/ads-commerce/ads-ai-connectors/ads-mcp-server/ads-mcp-server-tools-ad-creation-and-management)).
2. **Autorização no agente.** A Central de Ajuda diz que toda ação em seu nome exige autorização pelo agente de IA ([Meta, Central de Ajuda](https://www.facebook.com/business/help/1456422242197840)).
3. **Regras do servidor.** Desde a atualização de 16/07/2026, quem tem controle total do portfólio empresarial define, por conta de anúncio, o que o agente pode fazer ([Meta](https://www.facebook.com/business/news/meta-ads-ai-connectors)). O caminho é Configurações do Meta Business Suite, Integrações, Ads MCP server. Dá para bloquear criação de campanha, bloquear qualquer edição de orçamento ou impor um teto: no exemplo da própria Meta, com teto de US$ 1.000, pedido acima disso é negado ([Meta, Central de Ajuda](https://www.facebook.com/business/help/1456422242197840)).

*Cobertura de terceiros descreve três níveis de permissão no consentimento: leitura; leitura e escrita; leitura, escrita e financeiro ([mcp.directory](https://mcp.directory/blog/meta-ads-cli-mcp)). Não encontrei esses três níveis, nem a expressão "financeiro", na documentação nem na Central de Ajuda da Meta em 14/10/2026. Trate como não confirmado.*

## MCP oficial da Meta, Ads CLI ou acesso por camada semântica?

| Critério | MCP da Meta Ads | Ads CLI da Meta | Camada semântica sobre data lake |
|---|---|---|---|
| Quem hospeda | Meta | Sua máquina ou pipeline | Quem opera o lake |
| Autenticação | Login da pessoa (OAuth) | Token de usuário de sistema | Credencial do lake, separada da conta de mídia |
| Escreve na conta de anúncios | Sim, com confirmação e regras | Sim, pausado por padrão | Não |
| Conversão que devolve | A atribuída pela Meta | A atribuída pela Meta | A definida pelo negócio, conciliada com o ERP |
| Vê venda de marketplace e de WhatsApp sem anúncio | Não | Não | Se a fonte estiver ingerida |

As duas primeiras colunas resolvem acesso. A terceira resolve definição. São problemas diferentes, e a mesma operação costuma precisar das duas coisas.

## O que o MCP da Meta Ads não é?

**Não é fonte de receita.** Ele não lê o ERP, a VTEX, o Mercado Livre nem o pedido fechado no WhatsApp e pago no Pix. Pergunte "quanto o Meta vendeu" e a resposta é a conversão atribuída, que pode ser maior ou menor que a venda faturada.

**Não é um conector só de leitura.** Escrita é a premissa do produto. A ferramenta de relatório e a que ativa gasto moram no mesmo servidor, sob o mesmo login.

**Não é servidor de comunidade.** Servidores de terceiros existem desde antes do oficial; o [repositório da Pipeboard](https://github.com/pipeboard-co/meta-ads-mcp), por exemplo, foi criado em abril de 2025. Este é o mantido pela Meta, no domínio dela.

**Não é árbitro entre plataformas.** Ele responde pela Meta. Comparar Meta com Google pedindo a cada servidor a sua conversão reproduz dentro do chat a mesma soma que não fecha no relatório.

## Por que dar escrita a um agente é decisão de governança?

Porque o agente lê texto que outras pessoas escrevem. Nome de campanha, texto de anúncio e nome de catálogo entram no contexto dele como dado. A Meta não documenta tamanho máximo para nome de campanha, e nenhuma plataforma documenta validação de conteúdo nesses campos, como mostrei em [injeção de prompt em dado de marketing](https://precisian.io/blog/pt-BR/posts/injecao-de-prompt-em-dado-de-marketing/). Texto com instrução embutida mais um token com `ads_management` é o cenário completo.

Por isso a pergunta útil passa a ser quem na empresa decide o teto de orçamento que um agente pode definir, e se essa decisão está escrita. Na prática:

- Bloqueie **Edit or set budget** até ter um caso de uso que justifique liberar. Se liberar, com teto.
- Em operação com agência ou parceiro, configure as regras dos dois lados. A Central de Ajuda diz que a regra do parceiro vale só para os funcionários do parceiro ([Meta, Central de Ajuda](https://www.facebook.com/business/help/1456422242197840)).
- Separe o agente que analisa do agente que executa. Quem só precisa perguntar não precisa de `ads_management`.
- Guarde o que o agente leu antes de agir. O histórico de alterações da Meta registra o que mudou; não registra o que o agente consultou para decidir. É a lacuna de [trilha de auditoria de resposta de IA](https://precisian.io/blog/pt-BR/posts/trilha-de-auditoria-de-resposta-de-ia/).

## Quando isso passa a importar na sua operação?

No dia em que alguém do time liga o conector e pergunta qual canal tem o melhor ROAS. Um exemplo com números redondos, sintéticos, no mecanismo descrito no [post sobre a soma do ROAS](https://precisian.io/blog/pt-BR/posts/roas-soma-maior-que-faturamento/): no mês, a Meta atribui R$ 180 mil em compras aos anúncios dela, o Google Ads atribui R$ 150 mil, e o ERP fechou R$ 260 mil em vendas online, das quais parte veio de busca orgânica e de recompra. Os R$ 330 mil somados passam do faturado em R$ 70 mil antes de qualquer receita orgânica entrar na conta. O agente, lendo os dois MCPs, não tem como saber disso: cada servidor responde com fidelidade ao próprio modelo.

O segundo gatilho é a escrita. Se o conector foi ligado por alguém com permissão de anunciante e as regras do servidor ainda estão no padrão, o limite do que o agente pode fazer é o limite daquela pessoa.

A resposta para o primeiro gatilho não está no MCP da Meta. Está numa [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/) que define receita uma vez, concilia com o ERP e serve essa definição ao agente, que continua livre para usar o MCP da Meta para o que ele faz bem: operar a conta.

## O que este artigo não cobre

Não ensina a configurar o conector passo a passo: a [página de primeiros passos da Meta](https://developers.facebook.com/documentation/ads-commerce/ads-ai-connectors/ads-mcp-server/ads-mcp-server-get-started) faz isso.

Não afirma qual é a janela de atribuição padrão da sua conta. Ela é configurada por conjunto de anúncios, e as páginas de ajuda da Meta sobre o padrão atual não devolveram conteúdo legível na pesquisa.

Não confirma disponibilidade no Brasil. A Central de Ajuda avisa que nem todo anunciante tem acesso a todas as ferramentas, e o lançamento foi em beta.

---

Se o agente da sua equipe já soma a conversão da Meta com a do Google e chama isso de receita, o primeiro passo é medir a distância entre essa soma e o que o ERP faturou no mesmo mês. [Agende uma conversa sobre o seu caso](https://calendar.notion.so/meet/rodrigomartucci/precisian-io), sem compromisso de contrato, mas sem promessa de resposta em 30 minutos também.
