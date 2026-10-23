---
title: "Existe MCP para VTEX, Shopify e Nuvemshop? O que cada um responde sobre venda"
description: "A VTEX tem dois MCPs oficiais e nenhum lê pedido. A Nuvemshop tem um que lê venda. Os da Shopify servem a quem compra. Nenhum responde margem por canal."
slug: "mcp-de-plataforma-de-ecommerce"
lang: "pt-BR"
translationKey: "commerce-platform-mcp"
publishedAt: 2026-10-14
tags: ["mcp", "ecommerce", "dados-para-ia", "divergencia-de-dados", "seguranca", "camada-semantica"]
draft: false
llmSummary: "Em 14/10/2026, os dois MCPs oficiais da VTEX (Developer MCP e CX Platform MCP) não leem pedido; o Admin MCP da Nuvemshop lê venda da própria loja; os MCPs da Shopify agem por quem compra. Nenhum cruza venda com custo de mídia por canal."
citations: ["https://developers.vtex.com/docs/guides/vtex-developer-mcp", "https://developers.vtex.com/docs/guides/vtex-ai-developer-toolkit-overview", "https://www.vtex.com/en-us/products/whats-new/cx-platform-mcp-analytics-access/", "https://developers.vtex.com/docs/guides/connect-the-vtex-cx-platform-mcp", "https://developers.vtex.com/docs/api-reference/orders-api#get-/api/oms/pvt/orders", "https://github.com/vtex/openapi-schemas", "https://atendimento.nuvemshop.com.br/conectores-de-ia/como-gerenciar-sua-loja-nuvemshop-com-ferramentas-de-ia-sem-entrar-no-administrador", "https://atendimento.nuvemshop.com.br/conectores-de-ia/como-conectar-sua-loja-nuvemshop-a-ferramentas-de-ia-compativeis-com-o-padrao-mcp", "https://atendimento.nuvemshop.com.br/conectores-de-ia/como-conectar-sua-loja-nuvemshop-ao-claude", "https://shopify.dev/docs/agents", "https://shopify.dev/docs/apps/build/customer-accounts-mcp", "https://shopify.dev/docs/apps/build/ai-toolkit"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://pt.wikipedia.org/wiki/Com%C3%A9rcio_eletr%C3%B4nico", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 9
---

Existe, mas quase nenhum responde a pergunta que o lojista faz. Na documentação oficial consultada em 14/10/2026, a VTEX publica dois servidores MCP, um de documentação ([VTEX Developer MCP](https://developers.vtex.com/docs/guides/vtex-developer-mcp)) e um de atendimento ([CX Platform MCP](https://developers.vtex.com/docs/guides/connect-the-vtex-cx-platform-mcp)), e nenhum dos dois lê pedido. A Nuvemshop tem um que lê venda. Os da Shopify trabalham para quem compra. Nenhum dos três cruza venda com custo de mídia por canal.

> **MCP de plataforma de e-commerce**: servidor que implementa o Model Context Protocol sobre a API de uma plataforma de loja e entrega a um assistente de IA ferramentas para consultar ou alterar dados dela. O que ele responde depende de duas escolhas do fabricante: para quem o servidor foi feito e quais objetos ele expõe.

## Qual é o sintoma de quem procura "MCP VTEX"?

Você quer abrir o Claude ou o ChatGPT e perguntar "quanto o Google trouxe de margem em setembro, descontando devolução?". Procura o MCP da sua plataforma, instala o primeiro que aparece, e a resposta chega com uma de três caras.

A primeira: o assistente explica o endpoint de pedidos em vez de mostrar os pedidos, porque o servidor que você instalou lê documentação. A segunda: ele devolve um faturamento que bate com o painel da loja e não bate com o ERP, nem com o que o Google Ads diz ter vendido. A terceira: ele pede um token de aplicação com papel de administrador, e alguém do time aceita sem ler quais permissões estão sendo dadas.

As três têm a mesma origem. O servidor responde pela plataforma dele, dentro do recorte para o qual ele foi construído, e a pergunta de margem por canal mora fora desse recorte.

## O que cada MCP oficial responde, de fato?

A tabela abaixo resume o que cada fabricante documenta. Onde a página oficial não diz, a célula diz que não diz.

| Plataforma | Servidor oficial | Para quem | Lê pedido ou venda? | Cruza com mídia ou margem por canal? |
|---|---|---|---|---|
| VTEX | Developer MCP (`@vtex/developer-mcp`) | Desenvolvedor no editor de código | Não. Busca documentação e especificação de endpoint | Não |
| VTEX | CX Platform MCP | Time de atendimento | Não documenta. Expõe analytics de conversas de suporte | Não |
| Nuvemshop | Admin MCP | Lojista | Sim, lista vendas e resume por período | A página não lista ferramenta para isso |
| Shopify | Catalog, Cart, Checkout e Order MCP | Agente que compra em nome do consumidor | Só o pedido daquele comprador | Não |
| Shopify | Customer Accounts MCP | Consumidor logado | Só os pedidos do próprio cliente | Não |
| Shopify | Dev MCP | Desenvolvedor | Não. Documentação e esquema de API | Não |

Fontes: [VTEX AI Developer Toolkit](https://developers.vtex.com/docs/guides/vtex-ai-developer-toolkit-overview), [VTEX CX Platform MCP](https://www.vtex.com/en-us/products/whats-new/cx-platform-mcp-analytics-access/), [Nuvemshop](https://atendimento.nuvemshop.com.br/conectores-de-ia/como-gerenciar-sua-loja-nuvemshop-com-ferramentas-de-ia-sem-entrar-no-administrador), [Shopify Agents](https://shopify.dev/docs/agents), [Shopify Customer Accounts MCP](https://shopify.dev/docs/apps/build/customer-accounts-mcp) e [Shopify AI Toolkit](https://shopify.dev/docs/apps/build/ai-toolkit), todas consultadas em 14/10/2026.

**VTEX.** O Developer MCP expõe quatro ferramentas, `search_documentation`, `fetch_document`, `search_endpoints` e `get_endpoint_details`, roda local e não pede chave de API ([VTEX](https://developers.vtex.com/docs/guides/vtex-ai-developer-toolkit-overview)). Ele ajuda a escrever a integração; não consulta a loja. O CX Platform MCP, lançado em abril de 2026, conecta dados do *Conversational Dashboard* e do *Live Desk Dashboard* a ferramentas como ChatGPT, Claude e Cursor ([VTEX](https://www.vtex.com/en-us/products/whats-new/cx-platform-mcp-analytics-access/)). A página de configuração fala em analytics de suporte e interações com clientes, e não menciona pedido nem venda ([VTEX](https://developers.vtex.com/docs/guides/connect-the-vtex-cx-platform-mcp)).

**Nuvemshop.** O Admin MCP, em `https://admin-mcp.nuvemshop.com.br`, autentica por OAuth e funciona com Claude Desktop, ChatGPT, Cursor e outros clientes de MCP remoto ([Nuvemshop](https://atendimento.nuvemshop.com.br/conectores-de-ia/como-conectar-sua-loja-nuvemshop-a-ferramentas-de-ia-compativeis-com-o-padrao-mcp)). É o único dos três feito para o lojista operar a loja. A central de ajuda dá como exemplo a pergunta *"Quantas vendas eu tive nesta semana e quanto somaram em faturamento?"*, e lista também criar, editar e excluir produto, cupom e categoria ([Nuvemshop](https://atendimento.nuvemshop.com.br/conectores-de-ia/como-gerenciar-sua-loja-nuvemshop-com-ferramentas-de-ia-sem-entrar-no-administrador)). A mesma página diz que ele *"não acessa outras lojas"*.

**Shopify.** Os servidores de comércio agêntico existem para *"agir em nome de compradores"* ([Shopify](https://shopify.dev/docs/agents)). O Customer Accounts MCP atende o cliente logado que quer ver o status do próprio pedido ([Shopify](https://shopify.dev/docs/apps/build/customer-accounts-mcp)). O lado em inglês deste artigo detalha a Shopify; aqui ela entra como comparação.

## Por que até o MCP que lê venda não responde margem por canal?

Porque ele responde com a definição da plataforma, sobre os objetos que a plataforma tem.

O faturamento que a Nuvemshop soma é o dos pedidos registrados naquela loja. Venda feita no Mercado Livre, no WhatsApp com link de pagamento avulso ou na loja física fica fora, a não ser que entre como pedido na plataforma. Custo de mídia não está lá: o que o Google Ads cobrou mora no Google Ads, e o [MCP do Google Ads](https://precisian.io/blog/pt-BR/posts/mcp-do-google-ads/) devolve a conversão que o Google registrou, datada pelo clique. Pedir ao assistente "margem por canal" com os dois servidores ligados faz o modelo juntar dois números com datas, janelas e definições diferentes, e ele não avisa que fez isso.

Há também a pergunta de qual receita. Pedido criado, pago, faturado ou entregue, com ou sem frete, antes ou depois da devolução: cada plataforma escolhe uma. Quando o mesmo pedido é medido pelo GA4, a conta muda de novo, que é o assunto de [por que VTEX e GA4 não batem](https://precisian.io/blog/pt-BR/posts/vtex-ga4-nao-batem/). O MCP herda essa divergência e a entrega mais rápido, num formato que parece resposta pronta.

## E quando a sua plataforma não tem MCP que leia pedido?

É o caso da VTEX hoje. Sobram duas saídas, e as duas têm custo que não aparece no README.

**Servidor de comunidade.** Existem servidores MCP de terceiros para VTEX e para Nuvemshop no GitHub e em diretórios de MCP. Nenhum é publicado pela plataforma. Para ler pedido, eles pedem `appKey` e `appToken` da VTEX, e o modelo passa a decidir sozinho quais ferramentas chamar. Se o servidor também expõe escrita (cancelar pedido, mudar preço), um texto com instrução embutida num nome de produto ou numa observação de pedido vira risco concreto, que é o cenário de [injeção de prompt em dado de marketing](https://precisian.io/blog/pt-BR/posts/injecao-de-prompt-em-dado-de-marketing/).

**Ligar o agente direto na API de pedidos.** O endpoint *List orders* da VTEX tem limites escritos na própria especificação ([VTEX Orders API](https://developers.vtex.com/docs/api-reference/orders-api#get-/api/oms/pvt/orders)):

| O que a especificação diz | O que isso faz com a resposta do agente |
|---|---|
| Recupera no máximo 30 páginas, de até 100 pedidos cada | Uma pergunta sobre um mês com mais de 3.000 pedidos recebe uma amostra, não o total |
| Não devolve a propriedade `items` desde 3 de outubro de 2018 | Margem por produto exige uma chamada por pedido |
| Só acessa pedidos criados nos últimos dois anos | Comparação com dois anos atrás falha em silêncio |
| Devolve só pedidos já indexados, o que leva cerca de quatro minutos | O número de hoje muda se você perguntar de novo |
| *"Não deve ser usado para integrações"*; a VTEX indica o Feed ou o hook de pedidos | O caminho que o agente usa é o que o fabricante desaconselha |
| `totalValue` vem em centavos | Um modelo que esquece a conversão erra por cem vezes |

Fonte: especificação OpenAPI pública da [Orders API da VTEX](https://github.com/vtex/openapi-schemas), consultada em 14/10/2026.

O endpoint foi desenhado para uma tela de listagem de pedidos e cumpre bem esse papel. O problema aparece quando um modelo o usa como se fosse um banco de dados.

## Como diagnosticar o que o seu assistente está lendo?

Cinco verificações, em ordem, antes de confiar em qualquer número.

1. **Liste as ferramentas.** Peça ao cliente MCP a lista de ferramentas do servidor (`tools/list`). Se nenhuma devolve pedido, ele lê documentação.
2. **Confira quem publicou.** Servidor oficial tem a URL e o pacote documentados no portal do fabricante. Qualquer outro é de terceiro, mesmo quando o nome é igual ao da plataforma.
3. **Leia as permissões da chave.** Na VTEX, o *List orders* pede o recurso **List Orders** ou **Orders Full Access** no License Manager. A própria especificação avisa que papel predefinido costuma conceder vários recursos de uma vez e recomenda papel customizado ([VTEX](https://developers.vtex.com/docs/api-reference/orders-api#get-/api/oms/pvt/orders)).
4. **Faça uma pergunta cuja resposta você já sabe.** Escolha um mês fechado e compare o total do assistente com o relatório da plataforma e com o ERP. Diferença com a plataforma é bug de ferramenta; diferença com o ERP é definição.
5. **Pergunte o que ele somou.** Peça o filtro de status, a data usada e se o valor inclui frete. Se ele não sabe dizer, a resposta não é auditável.

## Como corrigir?

Pela ordem do que custa menos.

**Use cada MCP oficial para o que ele foi feito.** O Developer MCP da VTEX acelera quem escreve integração. O Admin MCP da Nuvemshop responde bem "quanto vendi nesta semana na loja", com a definição da Nuvemshop. Isso já é útil se ninguém usar o número como fechamento.

**Dê só leitura.** Na Nuvemshop, a central de ajuda permite marcar cada ação como "Permitir sempre", "Pedir aprovação" ou "Recusar", e o padrão já pede aprovação antes de alterar ou excluir ([Nuvemshop](https://atendimento.nuvemshop.com.br/conectores-de-ia/como-gerenciar-sua-loja-nuvemshop-com-ferramentas-de-ia-sem-entrar-no-administrador)). Para quem usa o assistente para análise, recusar toda escrita é o ajuste certo. Na VTEX, crie uma chave com papel customizado só com o recurso de leitura de pedidos.

**Tire a regra de negócio do modelo.** Margem por canal precisa de venda, custo de mídia, devolução e custo de produto na mesma base, com uma definição de receita escrita. Exponha essa resposta como ferramenta fechada, e não a tabela crua: é o argumento de [o que alimentar um MCP server de e-commerce](https://precisian.io/blog/pt-BR/posts/o-que-alimentar-um-mcp-server-ecommerce/). A definição em si mora numa [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/), que o analista e o agente leem antes de calcular.

## Quando isso não tem conserto?

Em três situações, e nenhuma melhora com um MCP melhor.

**Quando o dado não está em nenhuma plataforma.** Venda fechada no WhatsApp sem pedido registrado, desconto negociado fora do sistema, devolução tratada pelo SAC numa planilha. Nenhum servidor lê o que ninguém gravou.

**Quando a empresa não decidiu o que é receita.** Se marketing e financeiro usam definições diferentes, o agente vai escolher uma delas, e quem perguntou não vai saber qual. Isso se resolve com decisão, antes de ferramenta.

**Quando a operação é pequena e roda numa plataforma só.** Uma loja Nuvemshop sem marketplace e com um canal de mídia pode viver bem com o Admin MCP e uma conferência mensal contra o extrato. Nesse cenário, montar um data lake com camada semântica, que é o que a Precisian faz, custa mais do que a pergunta vale. A conta muda quando entram o segundo canal de venda, o terceiro de mídia e a primeira discussão sobre qual número vai para o board.

## O que este artigo não cobre?

Não avalia servidores MCP de comunidade um a um, porque eles mudam toda semana e nenhum tem a garantia do fabricante. Não cobre Magento, Tray, Loja Integrada nem WooCommerce. E não afirma nada sobre roadmap: se a VTEX publicar um MCP oficial de pedidos depois da data de consulta indicada no topo, a tabela acima fica velha e este texto será atualizado.

---

Se o seu assistente responde faturamento e você não sabe dizer qual status, qual data e se tem frete, o primeiro passo é medir a diferença entre esse número e o do ERP num mês fechado. [Veja como isso funciona na prática](https://precisian.io/demonstracao): sem compromisso de contrato, mas sem promessa de resposta em 30 minutos também.
