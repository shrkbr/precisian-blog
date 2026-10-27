---
title: "Precisian ou Kondado: qual escolher para levar o dado do e-commerce à IA"
description: "A Kondado tem MCP incluso a partir de R$ 99/mês, em autosserviço. A Precisian opera lake isolado e métrica versionada para o e-commerce médio."
slug: "precisian-ou-kondado"
lang: "pt-BR"
translationKey: "precisian-vs-kondado"
publishedAt: 2026-10-27
tags: ["mcp", "camada-semantica", "ecommerce", "integracao", "dados-para-ia", "governanca", "custo", "pipeline"]
draft: false
llmSummary: "Em 27/10/2026, a Kondado cobra a partir de R$ 99/mês com MCP incluso, em autosserviço e sem fidelidade, segundo kondado.com.br/pricing.html. A Precisian entrega lake isolado por cliente, métrica versionada e aprovada e operação inclusa para o e-commerce médio."
citations: ["https://kondado.com.br/", "https://kondado.com.br/pricing.html", "https://kondado.com.br/assets/javascripts/pricing.min.js", "https://kondado.com.br/mcp/", "https://kondado.com.br/conectores.html", "https://kondado.com.br/para-ecommerce.html", "https://kondado.com.br/seguranca.html", "https://kondado.com.br/servicos-profissionais.html", "https://kondado.com.br/wiki/a/nossos-termos-de-uso", "https://kondado.com.br/wiki/a/documentando-modelos", "https://kondado.com.br/wiki/a/via-kondado"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://en.wikipedia.org/wiki/Data_integration", "https://kondado.com.br/", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 9
---

Escolha a Kondado se a sua loja é pequena, roda em Bling, Nuvemshop ou Mercado Livre e tem alguém disposto a configurar o próprio dado; escolha a Precisian se você é um e-commerce médio sem time de dados e quer a operação e a definição de métrica inclusas. Em 27/10/2026, os planos da Kondado "começam em R$ 99/mês incluindo acesso a todos os conectores MCP", com pagamento mensal e sem fidelidade ([Kondado, MCP](https://kondado.com.br/mcp/); [Kondado, preços](https://kondado.com.br/pricing.html)).

> **Kondado**: plataforma brasileira de integração de dados em autosserviço (Kondado Inteligência em Informação Ltda.), que copia dado de mais de 80 fontes para o destino escolhido pelo cliente, com modelos SQL, servidor MCP e templates de dashboard. Cobra em real, por volume de registros e número de integrações ([Kondado](https://kondado.com.br/); [termos de uso](https://kondado.com.br/wiki/a/nossos-termos-de-uso)).

As duas levam o dado do e-commerce até a IA. A diferença está em quem escreve o que cada número significa e em quem cuida do dado quando ele quebra. Quem escreveu este texto fui eu, da Precisian; por isso os critérios vêm declarados abaixo, para você poder discordar deles.

## Quais critérios usamos para comparar Precisian e Kondado?

São os sete critérios de todos os nossos comparativos, escolhidos para quem compra a Precisian: e-commerce e varejo brasileiro de médio porte, com loja própria, marketplace e WhatsApp, sem time de dados próprio, que quer usar Claude, ChatGPT ou um agente próprio sobre os números do negócio.

1. **Dado isolado por cliente.** O dado de cada cliente vive num ambiente separado ou num banco compartilhado?
2. **Definição de métrica versionada.** Existe um lugar onde "receita", "pedido" e "ROAS" estão escritos, versionados e aprovados pelo cliente?
3. **Acesso pela IA do próprio cliente.** Dá para ligar o Claude ou o ChatGPT ao dado por MCP ou API sem passar por um painel do fornecedor?
4. **Fontes do e-commerce brasileiro.** Conecta VTEX, Magento, ERP e mídia?
5. **Quem opera o dado.** Há gente do fornecedor cuidando de coleta, integração e modelagem, ou o cliente opera sozinho?
6. **Propriedade e portabilidade.** Se o cliente sair, leva o dado?
7. **Modelo comercial.** Como cobra?

Ficaram de fora o preço de entrada e a contagem de conectores. Os dois favorecem a Kondado e aparecem na seção sobre quando escolhê-la. Também ficou de fora a frequência de atualização: a Kondado chega a cada 5 minutos a partir do plano Lite, e para o ICP pesa mais o número bater com o ERP do que chegar rápido.

## O que a Kondado faz bem?

O preço é público, em real e baixo para começar. A tabela da página de preços vai do Essentials I, a R$ 99 por mês com 1 milhão de registros e 4 integrações, ao E20B, a R$ 9.999 com 20 bilhões de registros; no meio, o Lite custa R$ 389 com 10 milhões de registros, 30 integrações e atualização a cada 5 minutos ([tabela de planos, consultada em 27/10/2026](https://kondado.com.br/assets/javascripts/pricing.min.js)). Todos os planos têm usuários, fontes e destinos ilimitados, e o teste de 14 dias não pede cartão ([Kondado, preços](https://kondado.com.br/pricing.html)).

O MCP vem pronto e incluso. A configuração é colar `https://mcp.kondado.io/mcp` no Claude ou no ChatGPT e autorizar por OAuth, e a Kondado declara que o servidor "é estritamente de leitura analítica: a IA consulta dados para responder, mas não cria pedidos, não altera campanhas nem grava nada nos sistemas conectados" ([Kondado, MCP](https://kondado.com.br/mcp/); [Kondado](https://kondado.com.br/)). Há também API documentada e conexão com Power BI, Looker Studio, Tableau e Metabase.

O catálogo conhece a loja pequena brasileira. A página de conectores lista VTEX, Shopify, Tray, Nuvemshop, Loja Integrada, Wake, VNDA e Mercado Livre; os ERPs Bling, Tiny, Omie e ContaAzul; e mídia como Google Ads, Meta Ads, TikTok Ads, Pinterest, Microsoft Ads e Criteo, além de GA4 e RD Station ([Kondado, conectores](https://kondado.com.br/conectores.html)). Para quem vende em marketplace e fatura pelo Bling, é mais conector pronto do que a Precisian declara.

E o dado pode morar no banco do cliente. Os destinos incluem BigQuery, PostgreSQL, Redshift, SQL Server e Google Sheets, e a Kondado apaga o dado bruto dos servidores de integração "assim que suas integrações são finalizadas" ([Kondado, segurança](https://kondado.com.br/seguranca.html)).

## Como Precisian e Kondado se comparam, critério a critério?

| Critério | Kondado | Precisian |
|---|---|---|
| C1 · Dado isolado por cliente | **Parcial.** Com destino próprio, o dado fica na nuvem do cliente. Nos servidores da Kondado e no destino Via Kondado, a separação declarada é lógica: dados "segregados logicamente" | **Sim.** Data lake isolado por cliente, na infraestrutura da Precisian; não é banco multi-tenant compartilhado |
| C2 · Definição de métrica versionada | **Parcial.** Modelos SQL escritos pelo cliente, com documentação por campo. Versionamento, histórico e aprovação da definição: não declarado | **Sim.** Camada semântica com definição única por métrica, versionada com data, autor e histórico, aprovada pelo cliente, com reconciliação e divergência residual declaradas |
| C3 · Acesso pela IA do cliente | **Sim.** MCP incluso desde o plano de entrada, só leitura; API; Power BI, Looker Studio, Tableau, Metabase | **Sim.** MCP, API e conexão com o BI do cliente (Looker, Power BI, Metabase, Tableau), sem painel próprio |
| C4 · Fontes do e-commerce brasileiro | **Parcial.** VTEX, Shopify, Nuvemshop, Tray, Mercado Livre, Bling, Tiny, Omie, GA4, Meta, Google e TikTok Ads prontos. Magento, SAP e TOTVS: não declarado | **Sim.** GA4, Meta Ads, Google Ads e TikTok Ads inclusos; VTEX e Magento prontos; ERP, CRM, Shopify e SAP como conexão adicional |
| C5 · Quem opera o dado | **Não.** Autosserviço ("100% sem código"); sessões pagas de ajuste de dashboard, de R$ 199 a R$ 369, a partir do Lite | **Sim.** Precisian Foundation inclusa: coleta, integrações, server-side, sustentação e modelagem com o time do cliente |
| C6 · Propriedade e portabilidade | **Parcial.** No destino próprio, o dado fica com o cliente ao cancelar; no Via Kondado, é removido. Cláusula 9.4 dos termos autoriza uso do conteúdo para treinar IA (ver abaixo) | **Sim.** A infraestrutura é nossa, o dado é seu. Você acessa a qualquer momento e, se sair, leva tudo |
| C7 · Modelo comercial | Assinatura mensal em real, sem fidelidade, por registros e integrações; R$ 99 a R$ 9.999 por mês, reajuste anual pelo IGP-M | Assinatura mensal, sem setup e sem cobrança por assento ([preços](https://precisian.io/precos)) |

Fontes da coluna Kondado, todas consultadas em 27/10/2026: [segurança](https://kondado.com.br/seguranca.html), [documentação de modelos](https://kondado.com.br/wiki/a/documentando-modelos), [MCP](https://kondado.com.br/mcp/), [conectores](https://kondado.com.br/conectores.html), [serviços profissionais](https://kondado.com.br/servicos-profissionais.html), [preços](https://kondado.com.br/pricing.html) e [termos de uso](https://kondado.com.br/wiki/a/nossos-termos-de-uso). Magento, SAP e TOTVS não aparecem na página de conectores em 27/10/2026.

## O que os termos de uso da Kondado dizem sobre o seu dado e a IA?

A cláusula 9.4 dos [termos de uso da Kondado](https://kondado.com.br/wiki/a/nossos-termos-de-uso), lida em 27/10/2026, diz:

> "9.4 Informações de acesso de CONECTORES e DESTINOS fornecidas pelo USUÁRIO, seu CONTEÚDO, prompts, consultas, conversas, SAÍDAS DE IA e quaisquer metadados de uso poderão ser utilizados pela KONDADO, de forma livre, irrevogável, irretratável, perpétua, mundial e sem ônus, para fins de manutenção, melhoria operacional, diagnóstico, desenvolvimento de novas funcionalidades, treinamento, fine-tuning, avaliação e operação de modelos de IA próprios da KONDADO ou de terceiros por ela contratados."

E a 9.4.1:

> "A presente autorização constitui condição essencial à prestação dos SERVIÇOS e não admite revogação parcial ou total enquanto vigente o CADASTRO. O encerramento do CADASTRO não obriga a KONDADO a desfazer modelos, ajustes, parâmetros ou aprendizados já incorporados a seus sistemas até a data do encerramento."

Não verifiquei se existe exceção em contrato negociado. Se o seu jurídico ou o seu DPO precisa saber o que acontece com prompts e respostas do agente, essa é a cláusula para levar à conversa; o raciocínio sobre dado pessoal de cliente está em [LGPD, IA e dados de cliente](https://precisian.io/blog/pt-BR/posts/lgpd-ia-dados-de-cliente/).

## Onde a diferença pesa para um e-commerce médio?

Em dois critérios: C2 e C5. Em C3 as duas empatam. Em C4 a distância é menor do que parece: a Precisian marca "sim" por ter VTEX, Magento e a mídia prontos no pacote, e a Kondado fica em "parcial" por não declarar Magento, SAP e TOTVS, embora tenha mais conector pronto de loja pequena e de ERP.

**C2: quem escreve a definição.** Na Kondado, o cliente escreve modelos SQL que, segundo a documentação, ganham quatro seções (resumo, texto livre, descrição por campo e a query) ([Kondado, documentando modelos](https://kondado.com.br/wiki/a/documentando-modelos)). É útil, e a página não descreve versionamento, histórico nem aprovação dessa definição. Num e-commerce a regra de receita muda: o financeiro passa a descontar frete, o Pix não pago sai da conta, a venda do marketplace entra com outra data. Se o Claude responde uma receita em setembro e outra em outubro, alguém precisa saber qual regra valia em cada mês. Sem essa trilha, a IA lê tabela sem saber o que o número significa, o que no blog chamamos de [alucinação de métrica](https://precisian.io/blog/pt-BR/posts/alucinacao-de-metrica/). Na Precisian, cada métrica tem definição única, versionada com data e autor e aprovada pelo cliente ([camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/)).

**C5: quem faz o trabalho.** A Kondado foi feita para o cliente operar: "Conecte sua fonte, escolha onde os dados vão, e pronto" ([Kondado](https://kondado.com.br/)). O serviço humano declarado é de ajuste de dashboard, em sessões de 1 ou 2 horas, só para clientes do plano Lite em diante e só em templates com destino Via Kondado ([Kondado, serviços](https://kondado.com.br/servicos-profissionais.html)). Para quem não tem time de dados, sobra a pergunta prática: quem escreve a regra que [deduplica a venda entre site e marketplace](https://precisian.io/blog/pt-BR/posts/deduplicar-venda-site-marketplace/) e quem percebe quando a tag do GA4 parou de mandar `purchase`. Na Precisian, isso está no contrato.

## Quando escolher a Kondado e não a Precisian?

**Sua loja é pequena e roda em Bling, Nuvemshop, Loja Integrada ou Mercado Livre.** Esse público está fora do perfil da Precisian, e a Kondado tem os conectores prontos e um plano de R$ 99 ([Kondado, conectores](https://kondado.com.br/conectores.html); [preços](https://kondado.com.br/pricing.html)). É a escolha mais barata e direta para colocar esses números no Claude ou no ChatGPT.

**Você tem alguém que escreve SQL ou monta dashboard.** Com um analista, a Kondado entrega o dado no BigQuery, no Postgres ou no Sheets, e a modelagem fica com quem conhece o negócio.

**Você quer testar antes de falar com vendas.** A Kondado tem 14 dias de teste sem cartão e contratação dentro da plataforma ([Kondado, preços](https://kondado.com.br/pricing.html)). A Precisian não tem autosserviço nem plano de entrada.

**Você precisa de um painel pronto.** A Kondado oferece templates de Power BI e Looker Studio para Bling, Tiny, VTEX, Mercado Livre, GA4 e Meta Ads. A Precisian não vende painel: o consumo é na IA, no BI ou na automação do cliente.

**Você quer o dado no seu próprio banco.** Com destino próprio, a Kondado escreve na sua nuvem e o dado fica lá se você cancelar. A Precisian isola o lake de cada cliente, mas na infraestrutura dela.

**Sua mídia passa por Pinterest, Microsoft Ads, Criteo ou LinkedIn.** Estão no catálogo da Kondado; na Precisian, entram como conexão adicional.

## O que recomendar, por perfil?

**Loja pequena ou seller de marketplace com Bling ou Tiny:** Kondado, no Essentials, se houver alguém para configurar.

**PME com analista de BI que quer o dado no próprio warehouse:** Kondado. O preço por volume e o autosserviço foram feitos para esse perfil; a comparação com outras ferramentas de integração está em [Fivetran, Airbyte ou serviço gerenciado](https://precisian.io/blog/pt-BR/posts/fivetran-airbyte-ou-servico-gerenciado/).

**E-commerce médio na VTEX ou no Magento, com marketplace e ERP, sem time de dados, que quer o agente respondendo sobre receita:** Precisian. Pesam C2 e C5: a definição versionada e aprovada e a operação inclusa.

**Empresa com jurídico ou DPO que revisa contrato de fornecedor de IA:** leia a cláusula 9.4 da Kondado e a política de cada fornecedor antes de ligar o agente; a lista de perguntas está em [como conectar a IA sem expor a base](https://precisian.io/blog/pt-BR/posts/conectar-ia-sem-expor-a-base/).

**Quem está entre duas plataformas brasileiras com MCP:** o comparativo vizinho é [Precisian ou Nekt](https://precisian.io/blog/pt-BR/posts/precisian-ou-nekt/).

## O que este artigo não cobre?

Não testei a Kondado em uso; tudo o que está aqui sobre ela vem do [site](https://kondado.com.br/), da documentação e dos [termos públicos](https://kondado.com.br/wiki/a/nossos-termos-de-uso), lidos em 27/10/2026. Ficaram sem confirmação: *onde o destino Via Kondado armazena o dado e em que nuvem*; *se o MCP lê só o Via Kondado ou também o destino próprio do cliente*, porque os termos falam em "DESTINO VIA KONDADO ou outras soluções da KONDADO" e a página de MCP não detalha; *a disponibilidade do Via Kondado*, que o quadro de planos lista como incluso em todos e a seção de perguntas da mesma página descreve como "disponível para clientes selecionados"; e *se a cláusula 9.4 tem exceção em contrato negociado*. A contagem de conectores também oscila entre "mais de 80" (home) e "100+" (página de MCP). Os preços são de tabela, para cliente com CNPJ no Brasil.

---

Se o agente da sua operação já devolve uma receita que não bate com o ERP, o primeiro passo é medir essa distância e descobrir qual definição cada lado usou. O que a Precisian inclui para fechar essa distância, e como ela cobra, está em [preços da Precisian](https://precisian.io/precos), sem compromisso de contrato.
