---
title: "MCP do Google Ads: o que o servidor oficial responde e o que ele não enxerga"
description: "O MCP do Google Ads lê a conta por GAQL, só em leitura. Responde o que o Google registrou como conversão; não vê pedido faturado, marketplace nem devolução."
slug: "mcp-do-google-ads"
lang: "pt-BR"
translationKey: "google-ads-mcp"
publishedAt: 2026-10-14
tags: ["mcp", "roas", "atribuicao", "dados-para-ia", "divergencia-de-dados", "ecommerce"]
draft: false
llmSummary: "O servidor MCP do Google Ads (googleads/google-ads-mcp, v0.0.5 de 09/10/2026) é só leitura e expõe três ferramentas, entre elas search, que roda GAQL. Ele devolve a conversão que o Google Ads registrou, datada pelo clique, e não enxerga pedido faturado no ERP, venda de marketplace nem devolução."
citations: ["https://developers.google.com/google-ads/api/docs/developer-toolkit/mcp-server", "https://github.com/googleads/google-ads-mcp", "https://pypi.org/project/google-ads-mcp/", "https://developers.google.com/google-ads/api/fields/latest/metrics", "https://support.google.com/google-ads/answer/9549009", "https://support.google.com/google-ads/answer/3123169", "https://support.google.com/google-ads/answer/10632359", "https://developers.google.com/google-ads/api/docs/conversions/upload-adjustments"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://en.wikipedia.org/wiki/Google_Ads", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
---

O MCP do Google Ads é um servidor que deixa um assistente de IA consultar sua conta de anúncios em linguagem natural, só em leitura. Na documentação do Google atualizada em 14/10/2026, ele expõe três ferramentas, e a principal, `search`, executa consultas GAQL ([Google Ads API](https://developers.google.com/google-ads/api/docs/developer-toolkit/mcp-server)). Ele responde com precisão o que o Google Ads registrou como conversão. Quanto isso virou de pedido faturado, ele não tem como saber.

> **MCP do Google Ads**: servidor que implementa o Model Context Protocol sobre a Google Ads API e entrega a um modelo de linguagem os dados da conta (campanhas, gasto, conversões, orçamentos) por meio de consultas GAQL, sem permissão para alterar nada.

## Como o MCP do Google Ads funciona na prática?

Você pergunta ao Claude, ao ChatGPT ou ao Gemini algo como "quais campanhas gastaram mais nos últimos 7 dias". O modelo enxerga as ferramentas disponíveis, escolhe a `search`, monta a consulta, o servidor chama a Google Ads API e devolve as linhas para o contexto da conversa. O modelo então escreve a resposta.

As três ferramentas, na [página oficial](https://developers.google.com/google-ads/api/docs/developer-toolkit/mcp-server) e no [README do repositório](https://github.com/googleads/google-ads-mcp):

- `list_accessible_customers`: lista as contas que o usuário autenticado alcança.
- `search`: busca campos de um recurso (campanha, grupo de anúncios, palavra-chave) com filtros e ordenação. É GAQL por baixo.
- `get_resource_metadata`: diz quais campos cada recurso aceita, para o modelo não chutar nome de coluna.

A cobertura de terceiros costuma citar só as duas primeiras. A terceira existe, e é ela que reduz consulta errada.

Os detalhes técnicos que a documentação crava:

- **Só leitura.** Nas palavras do Google, a implementação "é estritamente somente leitura" e não altera lance, não pausa campanha, não cria ativo. No código, as três ferramentas levam a anotação `readOnlyHint` ([repositório](https://github.com/googleads/google-ads-mcp)). O próprio código avisa que o Google Ads não publica um escopo OAuth só de leitura. A credencial usa o escopo cheio `adwords`, e o que limita a escrita é o servidor não oferecer ferramenta de escrita.
- **Transporte:** `stdio` (o cliente sobe o processo na sua máquina) ou Streamable HTTP, inclusive hospedado no Cloud Run.
- **Autenticação:** OAuth 2.0 ou conta de serviço.
- **Token de desenvolvedor:** a página diz que o `GOOGLE_ADS_DEVELOPER_TOKEN` foi descontinuado em 09/09/2026 e que o nível de acesso passou a ficar associado ao projeto do Google Cloud ([Google Ads API](https://developers.google.com/google-ads/api/docs/developer-toolkit/mcp-server)). Tutorial que manda pedir token está desatualizado.

## O servidor é oficial do Google?

É publicado pelo Google, documentado pelo Google, e ainda tem cara de projeto em estágio inicial. Os fatos, conferidos em 14/10/2026:

- O código está na organização `googleads` do GitHub, sob licença Apache 2.0, e a versão corrente no [PyPI](https://pypi.org/project/google-ads-mcp/) é a 0.0.5, de 09/10/2026. O primeiro pacote, 0.0.1, saiu em 22/10/2025.
- A [página no developers.google.com](https://developers.google.com/google-ads/api/docs/developer-toolkit/mcp-server) descreve o servidor como parte do kit de desenvolvedor da Google Ads API, mas encaminha suporte para as *issues* do GitHub e para um canal no Discord da comunidade. Não há canal de suporte comercial.
- O README não traz a frase "not an officially supported Google product", que vários sites citam como se estivesse lá. Procurei no histórico inteiro do repositório e ela nunca esteve.

Na prática, é a implementação de referência do próprio Google, com numeração de versão 0.0.x. Trate como ferramenta de desenvolvedor, não como produto com SLA.

## O que ele responde e o que ele não enxerga?

A pergunta que decide se o MCP do Google Ads basta para a sua operação é esta: a resposta de que você precisa mora dentro do Google Ads ou fora dele?

| Pergunta ao assistente | O que volta | O que falta |
|---|---|---|
| "Quanto gastei por campanha em setembro?" | Custo por campanha, exato | Nada. Gasto é dado nativo do Google Ads |
| "Quais palavras-chave têm CPC mais alto?" | CPC, cliques, impressões, termos de busca | Nada relevante |
| "Quantas vendas a campanha de marca trouxe?" | `metrics.conversions` das ações marcadas como primárias | Quantas dessas viraram pedido faturado no ERP |
| "Qual o ROAS de setembro?" | Valor de conversão dividido pelo custo, na régua do Google | Receita líquida: cancelamento, boleto não pago, frete, imposto |
| "Quanto o Google Ads vendeu no Mercado Livre?" | Nada | A venda de marketplace inteira; o clique nasceu no Google, a compra fechou fora do seu site |
| "Quanto devolveram das vendas da Black Friday?" | Só o que alguém subiu como ajuste de conversão | Devolução e troca registradas no ERP ou na VTEX |
| "Qual canal trouxe mais receita no mês?" | A visão do Google sobre o Google | Meta, TikTok, e-mail, WhatsApp, loja física |
| "O cliente que veio do Google voltou a comprar?" | Nada útil | Histórico de cliente, recompra, LTV |

As três primeiras linhas mostram o servidor em seu melhor: gasto, lance e termo de busca são verdade da plataforma, e não existe fonte melhor para eles. A partir da quarta linha a pergunta é de negócio, e a resposta que volta continua sendo da plataforma. O modelo não avisa a troca. Ele escreve "o ROAS foi 6,2" com o mesmo tom que usou para o gasto.

## Por que a conversão do Google Ads não é um pedido faturado?

Quatro mecanismos, todos documentados pelo próprio Google.

**A data é a do clique.** Nas colunas padrão, o Google Ads sempre reportou a conversão na data em que o anúncio foi clicado. Um clique de 28 de setembro que vira compra em 3 de outubro aparece em setembro. As colunas "por horário da conversão" existem justamente para corrigir isso, e o Google sugere compará-las com os relatórios de venda da empresa ([Ajuda do Google Ads](https://support.google.com/google-ads/answer/9549009)). Na API, a diferença é entre `metrics.conversions` e `metrics.conversions_by_conversion_date` ([referência de métricas](https://developers.google.com/google-ads/api/fields/latest/metrics)). O assistente só usa a segunda se alguém pedir.

**A janela decide o que conta.** A janela de conversão por clique padrão é de 30 dias e pode ir de 1 a 90 ([Ajuda do Google Ads](https://support.google.com/google-ads/answer/3123169)). Compra fora da janela some; compra dentro da janela entra mesmo que o cliente tenha chegado por outros cinco caminhos depois.

**Conversão importada do GA4 traz a régua do GA4.** Quando a conversão vem de um evento-chave do GA4, o Google Ads respeita as configurações do Analytics, e propriedades que fazem o vínculo pela primeira vez dão crédito, por padrão, só aos canais pagos do Google ([Ajuda do Google Ads](https://support.google.com/google-ads/answer/10632359)). É uma régua configurada a favor do canal que está sendo medido.

**Devolução só existe se alguém contar.** A API aceita ajustes do tipo `RETRACTION` (retirar a conversão) e `RESTATEMENT` (corrigir o valor) ([Google Ads API](https://developers.google.com/google-ads/api/docs/conversions/upload-adjustments)). Se a sua operação não sobe esses ajustes a partir do ERP, a devolução não existe para o Google Ads, e portanto não existe para o MCP.

Nenhum desses mecanismos é defeito do servidor. Ele lê fielmente o que a conta contém. O problema é que a pergunta "quanto vendi" tem resposta em outro sistema.

## O que o MCP do Google Ads não é?

Não é uma fonte de receita. É uma fonte de mídia, e a melhor que existe para mídia do Google.

Também não é uma camada de definição. Ele não sabe o que a sua empresa chama de "venda", "receita" ou "ROAS". Se o financeiro calcula ROAS sobre receita líquida faturada e o assistente calcula sobre valor de conversão, os dois números saem corretos e incompatíveis, que é o caso clássico de [alucinação de métrica](https://precisian.io/blog/pt-BR/posts/alucinacao-de-metrica/): o número certo sobre a regra errada.

E não é um substituto de BI. A diferença entre as duas portas de acesso está em [o que é um servidor MCP e por que você precisaria de um já tendo BI](https://precisian.io/blog/pt-BR/posts/mcp-server-vs-bi/).

## Quando isso passa a importar na sua operação?

No dia em que alguém usar a resposta do assistente para mexer em orçamento. Um exemplo com números redondos, sintético, de uma loja em VTEX que também vende no Mercado Livre, olhando o mesmo mês:

| Leitura | Pedidos | Receita | De onde vem |
|---|---|---|---|
| Google Ads via MCP | 120 conversões | R$ 60.000 em valor de conversão | Conta de anúncios, data do clique, janela de 30 dias |
| ERP, pedidos faturados da loja própria com origem Google | 104 | R$ 50.000 | Exclui boleto vencido e cancelamento por antifraude |
| ERP, depois das devoluções | 98 | R$ 47.000 | Devolução lançada na data da devolução |
| Mercado Livre, clientes que pesquisaram a marca no Google | não atribuível | não atribuível | Nenhum dos dois sistemas liga o clique à venda |

Neste exemplo inventado, o ROAS que o assistente reporta fica 28% acima do que o caixa sustenta, e ninguém mentiu; são três réguas diferentes. Os números são ilustrativos; o tamanho do intervalo na sua operação só aparece medindo.

O problema cresce quando o mesmo assistente recebe também o MCP da Meta e o do GA4. Cada um responde com a verdade da própria plataforma, e somar as três reproduz dentro do chat a conta que já não fechava na planilha, descrita em [por que a soma do ROAS passa do seu faturamento](https://precisian.io/blog/pt-BR/posts/roas-soma-maior-que-faturamento/). O MCP resolve o acesso. A definição de venda continua sem dono.

Para fechar a conta, alguém precisa juntar a mídia com o pedido faturado, a devolução e o marketplace, e escrever uma vez qual é a regra. É o trabalho que a Precisian faz: o dado de cada fonte num data lake isolado por cliente, na infraestrutura da Precisian, com a definição de métrica numa camada semântica, entregue ao assistente que você já usa por MCP, API ou BI.

## O que este artigo não cobre?

Não é um tutorial de instalação; o passo a passo está no [README](https://github.com/googleads/google-ads-mcp) e muda a cada versão. Não compara servidores MCP de terceiros para Google Ads, que existem e alguns permitem escrita. E não tem data de lançamento: não encontrei anúncio do servidor no blog oficial de desenvolvedores do Google Ads, então a referência temporal aqui é a do pacote publicado.

---

Se o assistente conectado ao Google Ads diz um ROAS e o financeiro fecha outro, o primeiro passo é medir a distância entre a conversão da plataforma e o pedido faturado, mês a mês. [Veja como isso funciona na prática](https://precisian.io/demonstracao) — sem compromisso de contrato, mas sem promessa de resposta em 30 minutos também.
