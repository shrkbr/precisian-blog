---
title: "Precisian ou Solomon: qual escolher para o dado do seu e-commerce"
description: "A Solomon vende atribuição, painel e IA em autosserviço; a Precisian opera o dado até a camada semântica. Como escolher pelos 7 critérios."
slug: "precisian-ou-solomon"
lang: "pt-BR"
translationKey: "precisian-vs-solomon"
publishedAt: 2026-10-27
tags: ["ecommerce", "atribuicao", "camada-semantica", "mcp", "dados-para-ia", "governanca"]
draft: false
llmSummary: "Em 26/10/2026, a Solomon (solomon.com.br) declara atribuição com 6 modelos, painel de e-commerce, IA própria e conector MCP, em autosserviço, com 31 integrações. A Precisian não vende atribuição nem painel: opera coleta, lake isolado e camada semântica versionada, lidos pela IA do cliente."
citations: ["https://www.solomon.com.br/", "https://www.solomon.com.br/comecar", "https://www.solomon.com.br/integracoes", "https://www.solomon.com.br/tracking", "https://www.solomon.com.br/dashboards", "https://www.solomon.com.br/solomon-agents", "https://www.solomon.com.br/touchpoint", "https://www.solomon.com.br/politica-de-privacidade", "https://www.solomon.com.br/plano-de-governanca-de-dados", "https://www.solomon.com.br/termos-de-uso-admin", "https://www.nuvemshop.com.br/loja-aplicativos-nuvem/solomon"]
about: ["https://www.solomon.com.br/", "https://en.wikipedia.org/wiki/Semantic_layer", "https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

Escolha a Solomon se a pergunta é "de qual campanha veio esta venda" e você quer a resposta num painel pronto, contratado sozinho, em minutos. Escolha a Precisian se a pergunta é "qual foi a receita", feita pela IA da diretoria sobre loja, marketplace e ERP, e ninguém no time tem tempo de escrever e manter a definição. Em 26/10/2026, a [Solomon](https://www.solomon.com.br/) declara 6 modelos de atribuição, mais de 400 marcas atendidas e configuração "em menos de 5 minutos". São produtos para perguntas diferentes.

> **Solomon**: plataforma brasileira (SOLOMON BRASIL LTDA, São José dos Campos, SP) de atribuição, analytics e IA para e-commerce, com pixel próprio, dashboards, agentes de IA e conector MCP para Claude e ChatGPT, vendida em autosserviço ([solomon.com.br](https://www.solomon.com.br/), consultado em 26/10/2026). Não confundir com a Solomono, agência web, nem com projetos de cripto de nome parecido.

## O que cada uma faz?

A **Solomon** se define como "sistema operacional que cresce seu ecommerce" e promete "atribuição, analytics e IA sobre a fonte da verdade do seu e-commerce" ([Solomon](https://www.solomon.com.br/)). A oferta tem sete peças declaradas: Tracking (atribuição de venda a canal, campanha e anúncio), Touchpoint (envio de vendas aprovadas às plataformas de mídia), Pixel Solomon, Dashboards, Web Analytics, Influenciadores (links e cupons) e Solomon AI, com chat, agentes e um conector MCP. O público, nas palavras dela: "e-commerces, times de marketing e performance e agências que gerenciam mídia" ([Solomon, /comecar](https://www.solomon.com.br/comecar)).

A **Precisian** é uma plataforma de dados gerenciados. Ela coleta, integra e guarda o dado num lake isolado por cliente, modela com o seu time a [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/) (o lugar onde "receita", "pedido" e "ROAS" ficam escritos, versionados e aprovados) e entrega o acesso por MCP, API e BI. Para aí. Ela não tem painel, não faz atribuição como produto e não opera mídia. Quem lê o dado é a IA que você já usa, ou o seu BI.

Comparar as duas pela atribuição seria injusto com as duas. A Solomon é um produto de atribuição. A Precisian não vende atribuição. O que interessa é o que acontece quando a sua IA pergunta pelo número.

## Quais critérios importam nessa escolha?

Declaro os critérios antes da tabela para que você possa discordar deles. Foram escolhidos para um leitor específico: e-commerce ou varejo de médio porte, com loja própria, marketplace e WhatsApp, sem time de dados, que quer usar IA sobre os números do negócio e não confia nos números que tem.

1. **C1 · Dado isolado por cliente.** O dado de cada cliente vive em ambiente separado ou num banco compartilhado?
2. **C2 · Definição de métrica versionada.** Existe um lugar onde a métrica está escrita, com versão, histórico e aprovação do cliente?
3. **C3 · Acesso pela IA do próprio cliente.** O Claude, o ChatGPT ou o agente da empresa chega ao dado sem passar pelo painel do fornecedor?
4. **C4 · Fontes do e-commerce brasileiro.** VTEX, Magento, ERP e mídia.
5. **C5 · Quem opera o dado.** Gente do fornecedor cuida da coleta e da modelagem, ou o cliente opera sozinho?
6. **C6 · Propriedade e portabilidade.** Se sair, você leva o dado?
7. **C7 · Modelo comercial.** Como cobra.

Ficaram de fora, de propósito, qualidade do modelo de atribuição, número de agentes de IA e tempo de ativação. Nos três a Solomon tem produto e a Precisian não compete. Se algum deles é o seu critério principal, a resposta já está no primeiro parágrafo.

## Como Precisian e Solomon se comparam, critério a critério?

Cada célula é o que o fornecedor declara em fonte própria, lida em 26/10/2026 no [site da Solomon](https://www.solomon.com.br/) e listada logo abaixo da tabela. "Não declarado" quer dizer que a página não diz, não que a função não existe.

| Critério | Solomon | Precisian |
|---|---|---|
| C1 · Dado isolado por cliente | Parcial: "Segregação Lógica (Single-Tenant)" e processamento "em endpoints isolados" para o treino de IA; banco ou ambiente físico separado não declarado | Sim: lake isolado por cliente, na infraestrutura da Precisian |
| C2 · Métrica versionada | Parcial: "KPI's Layer" de "indicadores auditados" e habilidades que guardam "o jeito de calcular margem"; versão, histórico e aprovação não declarados | Sim: camada semântica com definição única, versionada (data, autor, histórico) e aprovada pelo cliente |
| C3 · Acesso pela IA do cliente | Sim: conector MCP para Claude e ChatGPT; API de leitura para BI não documentada | Sim: MCP, API e conexão com o BI do cliente, inclusos |
| C4 · Fontes do e-commerce BR | Sim: 31 integrações, entre elas VTEX, Magento, Bling, Meta, Google Ads e TikTok Ads; GA4 não listado | Sim: GA4, Meta Ads, Google Ads e TikTok Ads inclusos; VTEX e Magento prontos; ERP e outras fontes por API aberta |
| C5 · Quem opera o dado | Não declarado: autosserviço ("sem desenvolvedor") com suporte em horário comercial | Sim: coleta, integrações, server-side, sustentação e modelagem inclusas (Precisian Foundation) |
| C6 · Propriedade e portabilidade | Parcial: cliente é controlador; exportação do histórico da loja não descrita; exclusão "normalmente, após 90 dias da rescisão" | Sim: "A infraestrutura é nossa, o dado é seu. Você acessa a qualquer momento e, se sair, leva tudo." |
| C7 · Modelo comercial | Assinatura mensal em três planos por faixa de faturamento; preço não publicado | Assinatura mensal, sem setup, sem cobrança por assento; condições em /precos |

Fontes da coluna Solomon: [plano de governança](https://www.solomon.com.br/plano-de-governanca-de-dados) (C1, C6), [página inicial](https://www.solomon.com.br/) e [Solomon AI](https://www.solomon.com.br/solomon-agents) (C2), [política de privacidade, §13](https://www.solomon.com.br/politica-de-privacidade) (C3), [integrações](https://www.solomon.com.br/integracoes) (C4), [/comecar](https://www.solomon.com.br/comecar) e [termos do administrador](https://www.solomon.com.br/termos-de-uso-admin) (C5), [app na loja da Nuvemshop](https://www.nuvemshop.com.br/loja-aplicativos-nuvem/solomon) (C7). O endereço do MCP, `mcp.solomon.com.br/mcp`, respondia HTTP 401 sem login em 27/10/2026, o que confirma que ele existe e exige conta.

## Onde a Solomon é mais forte?

Em seis pontos ela entrega o que a Precisian não entrega.

**Ativação.** A Solomon diz que os dados aparecem "em cerca de 15 minutos", conectando loja, checkout e mídia por integração oficial, "sem desenvolvedor e sem mexer no código" ([Solomon](https://www.solomon.com.br/comecar)). A Precisian é contrato com implantação feita por gente.

**Atribuição como produto.** Pixel próprio, 6 modelos de atribuição e vendas aprovadas sem duplicadas, canceladas ou pendentes ([Solomon, Tracking](https://www.solomon.com.br/tracking)). O Touchpoint devolve às mídias só a venda aprovada, para que o Pix e o boleto não pagos não ensinem o algoritmo errado ([Solomon, Touchpoint](https://www.solomon.com.br/touchpoint)). É o mesmo problema que descrevi em [Pix quebra o purchase do GA4](https://precisian.io/blog/pt-BR/posts/pix-quebra-o-purchase-do-ga4/), resolvido do lado da mídia.

**Painel pronto.** O Dashboard Ecommerce traz metas, funil, comparação de canais, lucro, região e método de pagamento ([Solomon, Dashboards](https://www.solomon.com.br/dashboards)). A Precisian não tem front.

**Cobertura de plataforma de loja e checkout.** Nuvemshop, Tray, Magazord, Wake, Linx, Yampi, CartPanda e outras 24 estão na [lista de integrações](https://www.solomon.com.br/integracoes). Para essas plataformas, a Solomon chega pronta onde a Precisian precisaria de conexão adicional.

**IA com execução.** Chat, agendamentos, agentes em kanban, artefatos e análise de criativo, além do MCP ([Solomon AI](https://www.solomon.com.br/solomon-agents)).

**Influenciadores e benchmark.** Links e cupons por influenciador e o Solomon Pulse, benchmark trimestral público ([Solomon](https://www.solomon.com.br/)).

## Onde a diferença pesa para quem usa IA sobre o número?

A diferença aparece quando a pergunta sai da mídia e chega ao financeiro. Um exemplo com números redondos, sintético: a loja na VTEX faturou R$ 1 milhão em setembro pelo ERP; o painel de atribuição mostra R$ 950 mil em vendas aprovadas atribuídas; o Mercado Livre vendeu mais R$ 200 mil fora da loja. O diretor pergunta ao Claude "qual foi a receita de setembro?". Os três números estão certos, cada um na sua definição. O modelo devolve o que estiver mais à mão. Esse erro se chama [alucinação de métrica](https://precisian.io/blog/pt-BR/posts/alucinacao-de-metrica/) e acontece quando a conta está certa sobre uma definição que ninguém escreveu.

A Solomon tem dois lugares para regra: a "KPI's Layer" e as habilidades da Solomon AI, que guardam "o jeito de calcular margem" ([Solomon](https://www.solomon.com.br/solomon-agents)). O que ela não declara é quem escreve essa regra, com que versão e com aprovação de quem. Em autosserviço, essa tarefa fica com o cliente. A Precisian põe esse trabalho no contrato: a definição de receita é modelada com o seu time, versionada com data e autor, e é ela que o MCP serve. Por que isso decide a resposta da IA está em [a mesma definição de receita](https://precisian.io/blog/pt-BR/posts/mesma-definicao-de-receita/).

O segundo ponto é isolamento. A Solomon declara segregação lógica e proíbe treinar a IA de um cliente com o dado de outro ([plano de governança](https://www.solomon.com.br/plano-de-governanca-de-dados)), o que é bom. Ambiente separado por cliente não aparece no texto. Para quem liga um agente ao dado, a diferença entre as duas coisas está em [isolamento por cliente no MCP](https://precisian.io/blog/pt-BR/posts/isolamento-por-cliente-mcp/).

O terceiro é a saída. Os termos da Solomon proíbem "fazer o download de conteúdos da plataforma para criar bancos de dados ou serviços que possam concorrer" com ela ([termos do administrador, cl. 18](https://www.solomon.com.br/termos-de-uso-admin)), e a exportação do histórico ao sair não está descrita. Vale perguntar por escrito, antes de assinar, o que sai com você no fim do contrato.

## Quando escolher a Solomon e não a Precisian?

**Loja pequena ou média em Nuvemshop, Tray, Shopify, Yampi ou Loja Integrada.** A Solomon conecta essas plataformas prontas e cobra por faixa de faturamento ([Nuvemshop](https://www.nuvemshop.com.br/loja-aplicativos-nuvem/solomon)). Esse público está fora do perfil da Precisian.

**Dropshipping e infoproduto.** A Solomon aceita esses modelos no próprio formulário de demonstração ([Solomon](https://www.solomon.com.br/comecar)). Os dois estão fora do perfil da Precisian.

**Time de performance cuja pergunta é "qual anúncio vendeu".** Atribuição por anúncio, influenciador e cupom, com envio de venda aprovada à Meta e ao Google, é o produto dela. A Precisian não vende atribuição.

**Quem quer painel pronto e IA embutida, contratando sozinho, hoje.** A Precisian não tem painel nem autosserviço, e não tem plano de entrada para testar sem conversa.

**Agência que gerencia mídia de várias lojas.** A Solomon tem [programa de parceiros](https://www.solomon.com.br/partners) com comissão recorrente.

## O que recomendar, por perfil?

**Loja até o médio porte, um canal de venda, decisão de mídia no dia a dia:** Solomon. Painel, atribuição e IA no mesmo lugar, sem projeto.

**Médio porte com loja própria, marketplace e ERP, diretoria perguntando à IA sobre receita e margem:** Precisian. O que falta aqui é definição escrita e mantida antes de ferramenta, e é isso que o contrato cobre.

**Operação que já usa a Solomon e quer ligar a IA ao dado de negócio inteiro:** as duas convivem. A Solomon responde pela mídia; a camada semântica responde pela receita que o financeiro reconhece. Antes de juntar, defina qual delas é a fonte de cada métrica, ou o agente vai somar as duas. Como pensar o acesso da IA versus o painel está em [MCP server ou BI](https://precisian.io/blog/pt-BR/posts/mcp-server-vs-bi/).

**Grupo com várias marcas:** o critério que domina é C1. Pergunte a cada fornecedor, por escrito, onde o dado de cada marca fica fisicamente.

## O que este artigo não cobre?

Não avalia a qualidade dos modelos de atribuição da Solomon nem a precisão do pixel dela; não testei o produto. Não traz preço: a Solomon não publica valores em reais no site nem na loja da Nuvemshop (consultados em 26/10/2026), e números que aparecem no painel de exemplo do programa de parceiros são ilustrativos. Não confirma conector direto de marketplace nem de GA4, que não constam da página de integrações. E não compara a Solomon a outras plataformas brasileiras; isso fica para o ranking de [plataformas de dados para e-commerce](https://precisian.io/blog/pt-BR/posts/plataformas-de-dados-para-ecommerce-brasil/).

---

Se a receita que a sua IA devolve não bate com a do ERP, o primeiro passo é medir a distância entre as duas e descobrir que definição cada uma usou. O que a plataforma inclui para fechar essa distância, e como ela é cobrada, está em [preços da Precisian](https://precisian.io/precos), sem compromisso de contrato.
