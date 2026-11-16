---
title: "MCP do Mercado Livre: o que o servidor oficial responde (e o que fica de fora)"
description: "O MCP oficial do Mercado Livre tem duas ferramentas, as duas de busca na documentação. Pedido, venda e anúncio da sua conta não passam por ele."
slug: "mcp-do-mercado-livre"
lang: "pt-BR"
translationKey: "mcp-do-mercado-livre"
publishedAt: 2026-11-16
tags: ["mcp", "marketplace", "integracao", "dados-para-ia", "governanca", "ecommerce"]
draft: false
llmSummary: "O servidor MCP oficial do Mercado Livre (mcp.mercadolibre.com/devsite/v1/mcp) expõe duas ferramentas, search_documentation e get_documentation_page, ambas sobre a documentação para desenvolvedores, com escopo OAuth só de leitura. Não lê pedido, venda nem anúncio (documentação lida em 16/11/2026)."
citations: ["https://developers.mercadolivre.com.br/pt-br/server-mcp", "https://developers.mercadolibre.com.ar/en_us/mcp-server", "https://github.com/mercadolibre/mercadolibre-mcp-server", "https://mcp.mercadolibre.com/.well-known/oauth-protected-resource/devsite/v1/mcp", "https://mcp.mercadolibre.com/.well-known/oauth-authorization-server", "https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/resources/mcp-server/tools", "https://github.com/lumile/mercadolibre-mcp", "https://developers.mercadolivre.com.br/pt_br/gerenciamento-de-vendas", "https://developers.mercadolivre.com.br/pt_br/autenticacao-e-autorizacao", "https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://pt.wikipedia.org/wiki/Mercado_Livre", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 9
cta: demo
---
O MCP oficial do Mercado Livre responde sobre a documentação para desenvolvedores, não sobre a sua conta de vendedor. Na página oficial, criada em 16/06/2025 e atualizada em 10/09/2026, o servidor `https://mcp.mercadolibre.com/devsite/v1/mcp` expõe duas ferramentas, `search_documentation` e `get_documentation_page` ([Mercado Livre Developers](https://developers.mercadolivre.com.br/pt-br/server-mcp), lida em 16/11/2026). Nenhuma das duas lê pedido, venda, anúncio, frete ou reclamação.

> **MCP do Mercado Livre**: servidor Model Context Protocol mantido e hospedado pelo Mercado Livre, autenticado por OAuth 2.0 com a conta do Mercado Livre, que dá ao agente de IA busca e leitura da documentação técnica para desenvolvedores, com o objetivo declarado de ajudar a escrever código de integração.

## Qual é o sintoma?

Alguém do time de e-commerce lê "MCP oficial do Mercado Livre", liga o conector no Claude ou no Cursor, faz o login e pergunta quanto a loja vendeu no marketplace em outubro. O servidor conecta, o OAuth passa, as ferramentas aparecem, e a resposta não vem da conta.

O que o assistente faz em seguida depende do cliente de IA e do modelo. Pode explicar como chamar a API de pedidos, pode dizer que não tem acesso, pode tentar responder com o que acha que sabe. Em nenhum dos casos o número saiu do Mercado Livre, porque o servidor não tem ferramenta que leia a conta.

O segundo sintoma é mais silencioso: a pessoa conclui que "o MCP do Mercado Livre não funciona" e vai procurar um servidor de terceiro no GitHub, entregando a ele a credencial da aplicação.

## O que o servidor oficial expõe, ferramenta por ferramenta?

Duas ferramentas, conforme a [documentação em português](https://developers.mercadolivre.com.br/pt-br/server-mcp) e a [versão em inglês](https://developers.mercadolibre.com.ar/en_us/mcp-server), conferidas em 16/11/2026:

<table>
<thead><tr><th>Ferramenta</th><th>Parâmetros</th><th>O que a doc diz</th></tr></thead>
<tbody>
<tr><td><code>search_documentation</code></td><td><code>query</code> e <code>language</code> (obrigatórios); <code>siteId</code>, <code>limit</code>, <code>offset</code> (opcionais)</td><td>"Habilita a busca de termos específicos ou conceitos-chave em toda a documentação técnica para desenvolvedores do Mercado Livre"</td></tr>
<tr><td><code>get_documentation_page</code></td><td><code>path</code> e <code>language</code> (obrigatórios); <code>siteId</code> (opcional)</td><td>"Obtém o conteúdo completo de uma página específica da documentação"</td></tr>
</tbody>
</table>

O `language` aceita `en_us`, `es_ar` e `pt_br`; o `siteId` filtra por país, com `MLB` para o Brasil. A seção de casos de uso descreve dois: buscar na documentação pelo IDE e gerar código de integração. A própria página diz que as ferramentas "não são utilizadas diretamente pelo usuário ou desenvolvedor, mas pelo IDE Agêntico".

O escopo de acesso confirma o desenho. O servidor publica os metadados OAuth em [`/.well-known/oauth-protected-resource/devsite/v1/mcp`](https://mcp.mercadolibre.com/.well-known/oauth-protected-resource/devsite/v1/mcp), como manda a [especificação de autorização do MCP](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization), e lista dois escopos: `offline_access` e `urn:ml:vis:mcp:access/read-only` (consultado em 16/11/2026). O servidor de autorização em [`/.well-known/oauth-authorization-server`](https://mcp.mercadolibre.com/.well-known/oauth-authorization-server) declara só o segundo, com PKCE (`S256`) e registro dinâmico de cliente em `/oauth/register`.

## Por que o login com a conta não traz os dados da conta?

Porque autenticar e expor ferramenta são coisas separadas. O OAuth identifica quem conecta; o que o agente consegue fazer depende das ferramentas que o servidor publica. Este publica busca em documentação, e o único escopo além de `offline_access` é `urn:ml:vis:mcp:access/read-only`. A documentação do servidor não menciona nenhum recurso da API de vendas.

O dado de venda mora na API REST do Mercado Livre, com outro fluxo de autorização. A [documentação de autenticação](https://developers.mercadolivre.com.br/pt_br/autenticacao-e-autorizacao) descreve o token de aplicação com `expires_in: 21600` (6 horas) e um `refresh_token` de uso único. Pedido se lê em `GET /orders/$ORDER_ID` e se busca em `GET /orders/search` ([Orders](https://developers.mercadolivre.com.br/pt_br/gerenciamento-de-vendas)). O MCP oficial não encapsula nenhum desses recursos.

O Mercado Pago, empresa do mesmo grupo, tem servidor MCP próprio, com outro foco. A [página de ferramentas](https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/resources/mcp-server/tools) lista dez em 16/11/2026, todas voltadas à integração: busca na documentação, checklist e avaliação de qualidade, webhooks, usuário de teste, criação e listagem de aplicação. Uma delas, `get_credentials`, devolve Client ID, Client Secret, Access Token e Public Key de produção e de teste da aplicação. Nenhuma lista os pagamentos recebidos pela loja.

## O que fica de fora, na prática?

Quase tudo o que um gestor de marketplace pergunta. A tabela cruza algumas dessas perguntas com a fonte que responde:

<table>
<thead><tr><th>Pergunta ao assistente</th><th>MCP oficial do Mercado Livre</th><th>Onde a resposta está</th></tr></thead>
<tbody>
<tr><td>"Como busco pedidos por data de atualização?"</td><td>Responde, pela documentação</td><td>O próprio MCP</td></tr>
<tr><td>"Quanto vendi no Mercado Livre em outubro?"</td><td>Não responde</td><td><code>/orders/search</code>, mais devolução e cancelamento</td></tr>
<tr><td>"Qual foi a comissão do mês?"</td><td>Não responde</td><td><code>sale_fee</code> por item e relatórios de faturamento</td></tr>
<tr><td>"Quanto paguei de frete?"</td><td>Não responde</td><td><code>/shipments/$SHIPMENT_ID/costs</code></td></tr>
<tr><td>"Quais anúncios venderam mais?"</td><td>Não responde</td><td>API de itens e de pedidos</td></tr>
<tr><td>"O Mercado Livre canibalizou o site?"</td><td>Não responde</td><td>Nenhuma fonte sozinha; exige cruzar site, marketplace e ERP</td></tr>
</tbody>
</table>

O mapa campo por campo da API de pedidos, com as armadilhas de status e de pack, está em [API do Mercado Livre: o que ela devolve de dado de venda](https://precisian.io/blog/pt-BR/posts/api-do-mercado-livre-dados-de-venda/). A última linha da tabela é o problema de [deduplicar venda entre site e marketplace](https://precisian.io/blog/pt-BR/posts/deduplicar-venda-site-marketplace/), que nenhum servidor de plataforma resolve.

## Como diagnosticar o que você conectou?

Três checagens, todas com `curl` ou pelo próprio cliente de IA.

**1. Qual endereço está configurado.** A documentação manda usar exatamente `https://mcp.mercadolibre.com/devsite/v1/mcp`. Duas fontes oficiais mostram outro endereço: o botão de instalação no Cursor, na mesma página, carrega a configuração `https://mcp.mercadolibre.com/mcp`, e o [repositório oficial no GitHub](https://github.com/mercadolibre/mercadolibre-mcp-server), com um único commit de 01/10/2025, ensina `/mcp` com cabeçalho `Authorization: Bearer <ACCESS_TOKEN>`. Em 16/11/2026, uma chamada a `/mcp` devolveu `301` para a página da documentação. A seção de erros da doc lista URL mal configurada entre as causas de um cliente parado em "Loading Tools".

**2. O que o servidor pede.** Uma chamada sem token ao endereço certo devolve `401` com o cabeçalho `WWW-Authenticate` apontando para os metadados:

```bash
curl -s -i -X POST https://mcp.mercadolibre.com/devsite/v1/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' | head -12

curl -s https://mcp.mercadolibre.com/.well-known/oauth-protected-resource/devsite/v1/mcp
```

Se o escopo listado não for o de leitura, algo mudou no servidor, e vale reler a documentação antes de reautorizar.

**3. Quais ferramentas o cliente vê.** No Claude Code, `/mcp` lista os servidores e as ferramentas de cada um. Se aparecer qualquer ferramenta além de `search_documentation` e `get_documentation_page` com o nome do Mercado Livre, ela não veio do servidor oficial: veio de outro servidor que alguém instalou.

## Como corrigir?

Separe as duas necessidades, porque cada uma tem a ferramenta certa.

**Para escrever a integração, use o MCP oficial.** É o caso de uso que ele documenta: o agente busca o endpoint, lê a página inteira e escreve o extrator com o nome de campo que está na doc, não o que o modelo lembra. Para quem mantém integração própria, é um jeito de pegar campo renomeado ou descontinuado antes que a carga quebre.

**Para responder sobre vendas, o dado precisa ser extraído e definido antes.** O caminho é a API, com quatro cuidados que a própria documentação impõe: puxar por `order.date_last_updated` para pegar mudança de status, guardar o histórico porque os pedidos ficam salvos por até 12 meses ([Orders](https://developers.mercadolivre.com.br/pt_br/gerenciamento-de-vendas)), renovar o token antes das 6 horas ([autenticação](https://developers.mercadolivre.com.br/pt_br/autenticacao-e-autorizacao)) e tratar o status `confirmed` antigo, que no painel aparece como cancelado.

Depois de extraído, falta escrever o que "venda do Mercado Livre" significa: `total_amount` dos pedidos pagos, ou isso menos comissão, frete do vendedor, desconto bancado por você e devolução. Cada versão é defensável. O agente que lê a tabela crua escolhe uma a cada pergunta, e a resposta de segunda não bate com a de sexta. Uma definição versionada, servida sempre igual ao agente, é o que chamamos de [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/).

**Sobre servidores de terceiros.** Existem, e o mais conhecido é o [`lumile/mercadolibre-mcp`](https://github.com/lumile/mercadolibre-mcp), de licença MIT, com quatro ferramentas no README: `search_products` (marcada como descontinuada "due to changes in MercadoLibre's API policies"), `product_reviews`, `product_description` e `seller_reputation`. Pedido e faturamento não estão entre elas, e o servidor pede `CLIENT_ID` e `CLIENT_SECRET` da sua aplicação em variável de ambiente. Antes de entregar credencial a código de terceiro, passe pelas perguntas de [segurança de servidor MCP](https://precisian.io/blog/pt-BR/posts/seguranca-de-servidor-mcp/).

## Quando isso não tem conserto?

**O servidor oficial não vai devolver dado de venda por configuração.** Não há parâmetro, escopo ou plano que mude isso; é o desenho do produto em 16/11/2026. Se o Mercado Livre publicar ferramentas de conta no futuro, a página de documentação é o lugar para conferir.

**A origem da venda continua fora de alcance.** Entre os campos documentados do pedido não há anúncio, campanha nem clique. Um agente com acesso total à API ainda não sabe dizer qual mídia trouxe a venda, o mesmo limite descrito em [marketplace como buraco negro de dados](https://precisian.io/blog/pt-BR/posts/marketplace-buraco-negro-de-dados/).

**Histórico que ninguém salvou não volta.** Pedido com mais de 12 meses sai do alcance da API de pedidos.

**Quando a Precisian não é a resposta.** Se você vende só no Mercado Livre e o que precisa é de ajuda para programar a integração, o MCP oficial já faz isso, e uma plataforma de dados é custo sem problema para resolver. Ela passa a fazer sentido quando a pergunta cruza o Mercado Livre com o site, o ERP e a mídia: aí entram o lake isolado por cliente, a definição de receita escrita uma vez e o acesso pelo MCP da Precisian, na IA que o seu time já usa. Conectamos qualquer fonte que tenha API aberta.

## O que este artigo não cobre?

**Não cobre o uso do MCP do Mercado Pago para integrar checkout.** Citei a lista de ferramentas só para mostrar que ele também não é fonte de receita.

**Não avalia servidores comerciais de terceiros** que prometem ler a conta de vendedor. Não li a documentação deles para este texto.

**Não ensina a configurar o conector no Claude ou no ChatGPT.** Isso está em [MCP no Claude e no ChatGPT](https://precisian.io/blog/pt-BR/posts/mcp-no-claude-e-no-chatgpt/).

Registro de método: o portal developers.mercadolivre.com.br responde 403 a `curl` direto, então li a página por um leitor que renderiza o HTML; as datas de criação e de atualização (`date_created` e `last_update`) estão no próprio código da página. Os metadados OAuth e o `301` do endereço antigo foram consultados direto no servidor em 16/11/2026, sem autenticar.

---

Se o seu time já pergunta ao assistente quanto o Mercado Livre vendeu e recebe uma resposta, o primeiro passo é conferir de qual servidor ela veio e qual definição de venda ela usou. [Veja um MCP governado respondendo](https://precisian.io/demonstracao?utm_source=blog&utm_medium=cta&utm_campaign=mcp-do-mercado-livre&utm_content=texto) sobre um lake isolado, sem compromisso de contrato.
