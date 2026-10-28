---
title: "Precisian ou SMKTY Tracker: qual escolher para rastreamento server-side"
description: "O SMKTY Tracker envia conversão server-side a Meta e Google por R$ 0 a R$ 3.490/mês. A Precisian coleta com o Pixel e modela o dado para a IA da empresa."
slug: "precisian-ou-smkty-tracker"
lang: "pt-BR"
translationKey: "precisian-vs-smkty"
publishedAt: 2026-10-27
tags: ["tracking", "atribuicao", "camada-semantica", "mcp", "ecommerce", "agencia", "data-lake"]
draft: false
llmSummary: "Em 27/10/2026, o SMKTY Tracker se define como plataforma brasileira de atribuição server-side e cobra de R$ 0 a R$ 3.490/mês por cliques (smktytracker.com.br). A Precisian soma coleta server-side (Pixel) a um data lake isolado por cliente e camada semântica, consultados pela IA da empresa."
citations: ["https://www.smktytracker.com.br/", "https://www.smktytracker.com.br/integracoes", "https://www.smktytracker.com.br/e-commerce", "https://www.smktytracker.com.br/agencias", "https://www.smktytracker.com.br/roadmap", "https://app.smktytracker.com.br/dpa", "https://app.smktytracker.com.br/termos", "https://www.smkty.com.br/"]
about: ["https://en.wikipedia.org/wiki/Server-side_tracking", "https://en.wikipedia.org/wiki/Semantic_layer", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

Escolha o SMKTY Tracker se o problema é o sinal de conversão que chega à Meta e ao Google; escolha a Precisian se o problema é a empresa não ter um número de receita em que a própria IA possa confiar. Em 27/10/2026, o SMKTY Tracker se define como "a plataforma brasileira de atribuição server-side, inteligência de visitante e ativação nativa" e cobra de R$ 0 a R$ 3.490 por mês, por volume de cliques ([SMKTY Tracker](https://www.smktytracker.com.br/)). Os dois fazem coleta server-side. O que cada um faz com o dado depois da coleta é diferente.

> **Rastreamento server-side**: coleta em que o evento (compra, lead, carrinho) passa por um servidor antes de seguir para a plataforma de mídia ou para o banco de dados, em vez de depender só do pixel no navegador. Reduz a perda por bloqueador de anúncio e por restrição de cookie. Não define, sozinho, o que conta como venda.

## Quais critérios usamos nesta comparação?

Este comparativo foi escrito pela Precisian, que é uma das duas opções. Por isso os critérios vêm antes da tabela, para você poder discordar deles. São os sete que usamos em todos os comparativos do blog, pensados para um e-commerce brasileiro de médio porte, com vários canais e sem time de dados próprio:

1. **C1 · Dado isolado por cliente.** Ambiente separado ou banco compartilhado?
2. **C2 · Definição de métrica versionada.** Existe um lugar onde "receita" e "ROAS" estão escritos, com versão e aprovação do cliente?
3. **C3 · Acesso pela IA do próprio cliente.** Dá para ligar o Claude, o ChatGPT ou um agente ao dado por MCP ou API?
4. **C4 · Fontes do e-commerce brasileiro.** VTEX, Magento, ERP e mídia.
5. **C5 · Quem opera o dado.** Gente do fornecedor ou o cliente sozinho?
6. **C6 · Propriedade e portabilidade.** Se sair, o cliente leva o dado?
7. **C7 · Modelo comercial.** Como cobra.

Ficaram de fora, de propósito, a taxa de correspondência (*match rate*) enviada às plataformas e a qualidade de painel. A primeira é a especialidade do SMKTY e não encontrei medição independente publicada dela; a segunda não se aplica, porque a Precisian não tem painel.

## O que o SMKTY Tracker faz bem?

O SMKTY Tracker é um produto da SMKTY (Smart Marketing Equity), empresa com sede em São Paulo ([política de privacidade](https://app.smktytracker.com.br/privacidade)). Ele envia conversão server-side para a API de Conversões da Meta, para as conversões otimizadas do Google, para o Measurement Protocol do GA4 e para a Events API do TikTok, com deduplicação por `event_id` e nova tentativa automática ([integrações](https://www.smktytracker.com.br/integracoes)). O site declara instalação em "5 minutos via GTM" e taxa de correspondência de 85% a 95%, números do próprio fornecedor ([SMKTY Tracker](https://www.smktytracker.com.br/)).

Em cima da coleta, o SMKTY tem painel próprio: quatro modelos de atribuição multi-touch, funil de carrinho, analytics por SKU, visitantes ao vivo e lead score de 0 a 100 ([e-commerce](https://www.smktytracker.com.br/e-commerce)). Há ativação: sincroniza públicos com Meta, Google, TikTok, LinkedIn e Kwai.

O modelo é de autosserviço, com preço público em reais. Há plano Free de R$ 0, Starter de R$ 247, Growth de R$ 597, Agency de R$ 1.890 e Agency Scale de R$ 3.490 por mês; o Enterprise é sob consulta. Os planos pagos têm teste de 14 dias sem cartão, "sem fee de setup, sem amarração anual" ([preços, lidos em 27/10/2026](https://www.smktytracker.com.br/)). Segundo o próprio site, "em 90% dos casos, o cliente mesmo configura".

E foi feito para agência revender: multi-tenant white-label, domínio próprio por cliente via CNAME, cobrança por cliente e plano de mídia com aprovação do cliente ([agências](https://www.smktytracker.com.br/agencias)). O público declarado é "agências mid-market gerenciando 10 a 80 clientes ativos", lojas com GMV de R$ 2 milhões a R$ 50 milhões por ano e infoprodutores com mais de R$ 100 mil de investimento mensal em mídia ([SMKTY Tracker](https://www.smktytracker.com.br/)).

## O que a Precisian entrega nesse lugar?

A Precisian é uma plataforma de dados gerenciados, e a comparação justa com um rastreador junta três peças.

**Precisian Pixel**, o único add-on: coleta first-party server-side. Contorna bloqueio de cookie e de ad blocker, recupera evento perdido e devolve à empresa a mesma qualidade de dado que a plataforma de mídia tem, como [dado próprio](https://precisian.io/blog/pt-BR/posts/dado-proprio-first-party-data/). Ele fica antes da camada semântica: é fonte, não ferramenta de leitura.

**Precisian Lake**: um data lake isolado por cliente, na infraestrutura da Precisian, que junta o Pixel com GA4, Meta Ads, Google Ads e TikTok Ads (inclusos), com os conectores prontos de VTEX e Magento e com ERP, CRM ou outra fonte como conexão adicional. Conectamos qualquer fonte que tenha API aberta.

**Camada semântica**: o lugar onde "receita", "pedido" e "ROAS" ganham uma definição única, versionada e aprovada pelo cliente, com a reconciliação entre fontes declarada e a divergência residual medida. O que entra numa definição útil está em [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/).

O consumo acontece fora da Precisian: pelo MCP, pela API ou pelo BI do cliente (Looker, Power BI, Metabase, Tableau). A Precisian Foundation, inclusa, cobre GTM, GA4, server-side, APIs de conversão, consent e o monitoramento da coleta. Enquanto você é cliente, a saúde do seu tracking é responsabilidade nossa. Se uma tag quebrar, o problema é nosso antes de ser seu.

## Como os dois se comparam, critério a critério?

| Critério | SMKTY Tracker | Precisian (Pixel + Lake + camada semântica) |
|---|---|---|
| C1 · Dado isolado por cliente | **Parcial.** Isolamento lógico: Row Level Security por workspace, banco Supabase em São Paulo; ambiente separado por cliente não declarado | **Sim.** Data lake isolado por cliente, na infraestrutura da Precisian |
| C2 · Métrica versionada | **Não declarado.** O versionamento citado é de regras de evento | **Sim.** Definição única, versionada e aprovada pelo cliente |
| C3 · Acesso pela IA do cliente | **Parcial.** API REST a partir do plano Agency; MCP não mencionado nas páginas lidas | **Sim.** MCP, API e BI do cliente, inclusos |
| C4 · Fontes do e-commerce BR | **Parcial.** Shopify, VTEX, Tray, Loja Integrada; Meta, Google Ads, GA4, TikTok; Magento e ERP não citados | **Sim.** GA4, Meta, Google Ads e TikTok inclusos; VTEX e Magento prontos; ERP como conexão adicional |
| C5 · Quem opera o dado | **Não (autosserviço).** Onboarding dedicado a partir do Agency | **Sim.** Precisian Foundation inclusa: coleta, integrações, modelagem e enablement |
| C6 · Propriedade e portabilidade | **Sim, nos termos.** "Os dados coletados no contexto do seu workspace pertencem a você"; exportação em massa do histórico não descrita | **Sim.** A infraestrutura é nossa, o dado é seu. Você acessa a qualquer momento e, se sair, leva tudo |
| C7 · Modelo comercial | Assinatura mensal por cliques, de R$ 0 a R$ 3.490; Enterprise sob consulta | Assinatura mensal, sem setup, sem cobrança por assento; Pixel como add-on |

Fontes da coluna SMKTY, lidas em 26 e 27/10/2026: [site](https://www.smktytracker.com.br/), [integrações](https://www.smktytracker.com.br/integracoes), [e-commerce](https://www.smktytracker.com.br/e-commerce), [DPA](https://app.smktytracker.com.br/dpa) e [termos, cláusula 6](https://app.smktytracker.com.br/termos).

## Por que coleta server-side não responde sozinha qual foi a receita?

Porque coleta melhor aumenta o número de eventos, e a pergunta da diretoria é sobre definição. Um exemplo com números redondos, sintético: depois de ligar o server-side, a Meta passa a receber 1.000 compras num mês em vez de 700. O Google, com a própria janela, também conta parte dessas 1.000. O ERP registra 900 pedidos pagos, porque parte dos pedidos de Pix [nunca foi paga](https://precisian.io/blog/pt-BR/posts/pix-quebra-o-purchase-do-ga4/). A coleta melhorou e as três fontes continuam somando mais do que a loja faturou, o padrão descrito em [ROAS que soma mais que o faturamento](https://precisian.io/blog/pt-BR/posts/roas-soma-maior-que-faturamento/).

Para o algoritmo da plataforma, as 1.000 compras são um sinal melhor, e é isso que um rastreador server-side entrega. Para um agente de IA que responde "qual foi a receita de outubro?", três números sem uma definição escrita viram [alucinação de métrica](https://precisian.io/blog/pt-BR/posts/alucinacao-de-metrica/): a conta está certa e o número está errado. Na minha leitura, as duas coisas são necessárias e resolvem problemas diferentes, e a escolha depende de qual dos dois custa mais caro na sua operação hoje.

## Quem opera a mídia muda a escolha do rastreador?

Pode mudar. A SMKTY, dona do Tracker, também opera mídia para clientes: o site da empresa oferece "Gestão de Meta, Google e LinkedIn Ads" e "Programática SMKTY" ([SMKTY](https://www.smkty.com.br/)). A página do Tracker para agências diz que, com ele, a agência "cria switching cost — cliente com tracker próprio não troca de agência fácil" ([SMKTY Tracker](https://www.smktytracker.com.br/)).

A Precisian não opera mídia nem faz a leitura do resultado. Para quem acha que quem executa a campanha não deveria auditar o próprio resultado, esse é um critério. Para quem quer tracker e mídia no mesmo fornecedor, é uma vantagem do outro lado.

## Quando escolher o SMKTY Tracker e não a Precisian?

**Agência de performance que quer revender um tracker white-label.** O SMKTY tem multi-tenant, CNAME por cliente e cobrança por cliente. A Precisian não tem produto para revenda com a marca da agência.

**Infoprodutor ou loja pequena que quer melhorar o sinal de conversão para Meta e Google.** O SMKTY integra Hotmart, Kiwify, Eduzz e Ticto, tem plano de entrada a R$ 247 e roda em autosserviço ([SMKTY Tracker](https://www.smktytracker.com.br/)). Infoproduto e loja de baixo ticket estão fora do perfil que a Precisian atende.

**Quem quer painel pronto e ativação.** Atribuição multi-touch, visitantes ao vivo, sincronização de público e popups estão no SMKTY. A Precisian não tem dashboard, não ativa campanha e não faz atribuição como produto.

**Quem quer testar antes de falar com alguém.** O SMKTY tem plano Free e teste de 14 dias nos planos pagos ([SMKTY Tracker](https://www.smktytracker.com.br/)). A Precisian não tem plano de entrada sem contrato nem autosserviço.

## O que recomendar, por perfil?

**Loja de até alguns milhões de GMV, uma pessoa cuidando de mídia, sem pergunta de receita em aberto:** um rastreador server-side em autosserviço, como o SMKTY. O ganho está no sinal que o algoritmo recebe.

**Agência com 10 a 80 clientes:** o SMKTY foi desenhado para esse caso. Se a agência quer separar dado de cliente por ambiente, pergunte por escrito como o isolamento funciona além do RLS. O que muda quando há vários clientes no mesmo servidor está em [isolamento por cliente no MCP](https://precisian.io/blog/pt-BR/posts/isolamento-por-cliente-mcp/).

**E-commerce médio com VTEX ou Magento, marketplace e ERP, que quer perguntar ao Claude ou ao ChatGPT sobre receita e margem:** a coleta é só a primeira parte. Você precisa de dado isolado, definição versionada e alguém operando a coleta. Esse é o caso da Precisian.

**Quem já tem o SMKTY instalado e quer a camada de cima:** os dois não são excludentes. A pergunta é quem guarda o histórico e quem escreve a definição de receita que a IA vai ler.

## O que este artigo não cobre?

Não testei a taxa de correspondência do SMKTY nem a do Pixel; os 85% a 95% são declaração do fornecedor. A documentação técnica do SMKTY (docs.smktytracker.com.br) não respondeu na consulta, e a página de documentação do painel exige login. LTV preditivo, SDK mobile e RD Station nativo aparecem no [roadmap do SMKTY](https://www.smktytracker.com.br/roadmap), não em produção, e ficaram fora da tabela. Preços e planos foram lidos em 27/10/2026 e mudam sem aviso.

---

Se o Meta, o Google e o ERP da sua loja contam vendas diferentes para o mesmo mês, o primeiro passo é medir essa distância e descobrir qual definição cada um usa. O que a Precisian inclui para fechar essa conta, do Pixel à camada semântica, está em [preços da Precisian](https://precisian.io/precos), sem compromisso de contrato.
