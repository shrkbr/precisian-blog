---
title: "Ligar Google Ads, Meta e GA4 no mesmo Claude reproduz a soma de ROAS que passa do faturamento"
description: "Google Ads conta 30 dias após o clique, a Meta 7 dias após o clique e 1 após a visualização. Com os três MCPs, o agente soma o mesmo pedido duas vezes."
slug: "google-ads-meta-e-ga4-no-mesmo-claude"
lang: "pt-BR"
translationKey: "three-platform-mcps"
publishedAt: 2026-10-14
tags: ["mcp", "roas", "atribuicao", "camada-semantica", "dados-para-ia", "divergencia-de-dados", "ga4", "alucinacao-de-metrica"]
draft: false
llmSummary: "Um agente com os MCPs de Google Ads, Meta e GA4 recebe três atribuições que se sobrepõem: o Google Ads conta compras até 30 dias após o clique e a Meta até 7 dias após o clique ou 1 após a visualização (documentação oficial, 2026). Nenhum MCP desconta o outro."
citations: ["https://support.google.com/google-ads/answer/3123169", "https://support.google.com/google-ads/answer/6259715", "https://developers.facebook.com/docs/marketing-api/reference/ad-account/insights", "https://support.google.com/analytics/answer/10596866", "https://support.google.com/analytics/answer/10597962", "https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema", "https://github.com/googleanalytics/google-analytics-mcp", "https://modelcontextprotocol.io/docs/learn/architecture"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://pt.wikipedia.org/wiki/Retorno_sobre_investimento", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 9
---

Ligar os MCPs de Google Ads, Meta e GA4 no mesmo Claude dá ao agente três réguas que se sobrepõem. A janela padrão do Google Ads conta uma compra até 30 dias depois do clique ([Google Ads](https://support.google.com/google-ads/answer/3123169)); a da Meta, até 7 dias depois do clique ou 1 dia depois da visualização ([Meta](https://developers.facebook.com/docs/marketing-api/reference/ad-account/insights)). O mesmo pedido cabe nas duas, e o agente soma.

Cada MCP é fiel à própria plataforma, e é exatamente por isso que a soma passa do faturamento. Nenhum servidor está com defeito. Falta o lugar onde a empresa escreveu, uma vez, o que conta como venda de mídia.

> **Três MCPs, três verdades**: quando um assistente de IA consulta Google Ads, Meta e GA4 por servidores MCP separados, cada servidor devolve a conversão calculada pelas regras da própria plataforma. Os números são corretos individualmente e incompatíveis entre si, porque cada plataforma reivindica o pedido inteiro.

## Como o problema aparece no chat?

Você conecta os três servidores no Claude Desktop, faz a pergunta que todo diretor de e-commerce quer fazer numa segunda-feira ("quanto a mídia vendeu na semana passada?") e recebe uma resposta limpa, com tabela, total e ROAS por canal. A resposta parece auditada. Ela tem o mesmo tom de quando o agente diz quanto você gastou, que é um número que ele sabe de verdade.

O total de mídia fica perto do faturamento da loja, ou acima dele. Sobra pouco ou nada para orgânico, e-mail, WhatsApp, tráfego direto e CRM, canais que você sabe que vendem. O agente não estranha, porque nada na arquitetura pede que ele estranhe.

A própria documentação do protocolo descreve o que acontece por baixo: o aplicativo *"busca as ferramentas disponíveis de todos os servidores MCP conectados e as combina num registro único"* que o modelo enxerga ([Model Context Protocol](https://modelcontextprotocol.io/docs/learn/architecture)). E avisa que o MCP *"não dita como os aplicativos de IA usam LLMs ou gerenciam o contexto fornecido"*. O protocolo junta as ferramentas. Reconciliar o significado dos números fica fora do escopo dele, por desenho.

## Por que os três MCPs reivindicam o mesmo pedido?

Porque cada plataforma atribui dentro de casa e nenhuma desconta o que a outra já contou. A explicação completa, com as fontes das três plataformas, está em [por que a soma do ROAS passa do seu faturamento](https://precisian.io/blog/pt-BR/posts/roas-soma-maior-que-faturamento/). Aqui interessa o que muda quando a soma passa a ser feita por um agente.

Siga um pedido de R$ 400 numa loja em VTEX. A cliente clica num anúncio de busca no dia 1, clica num anúncio da Meta no dia 9 e compra no dia 10, pagando com Pix.

| Fonte, via MCP | Regra que ela aplica | Quanto reivindica |
|---|---|---|
| Google Ads | Clique dentro da janela padrão de 30 dias; modelo baseado em dados, que divide crédito só entre interações com anúncios do Google | R$ 400 |
| Meta | Clique dentro da janela padrão de 7 dias | R$ 400 |
| GA4 | Modelo configurado na propriedade; em último clique pago e orgânico, o crédito inteiro vai para o último canal clicado | R$ 400 para a Meta, R$ 0 para o Google |
| ERP | Pedido faturado, sem atribuição | R$ 400, uma vez |

Fontes: [janelas do Google Ads](https://support.google.com/google-ads/answer/3123169), [modelos de atribuição do Google Ads](https://support.google.com/google-ads/answer/6259715), [janelas da Meta na API de Insights](https://developers.facebook.com/docs/marketing-api/reference/ad-account/insights), [modelos do GA4](https://support.google.com/analytics/answer/10596866).

Somando os dois MCPs de mídia, o agente chega a R$ 800 de venda atribuída para R$ 400 de pedido. Nenhuma das fontes errou pelas próprias regras.

Quatro mecanismos produzem a sobreposição, e cada um tem documentação primária:

**As janelas não coincidem.** O Google Ads usa 30 dias por clique e 1 dia por visualização como padrão, ajustáveis ([Google Ads](https://support.google.com/google-ads/answer/3123169)). Na API de Insights da Meta, o valor `default` do parâmetro `action_attribution_windows` equivale a `["7d_click","1d_view"]` ([Meta](https://developers.facebook.com/docs/marketing-api/reference/ad-account/insights)). A visualização de 1 dia é o caso mais traiçoeiro: a cliente viu um anúncio no Instagram sem clicar, buscou a marca no Google no dia seguinte e comprou. A Meta conta, o Google conta, e o GA4 nunca viu a impressão.

**O modelo do Google Ads só enxerga o Google.** O modelo baseado em dados *"é o modelo de atribuição padrão para a maioria das ações de conversão"* ([Google Ads](https://support.google.com/google-ads/answer/6259715)), e reparte o crédito entre cliques em anúncios do próprio Google. Para o Google Ads, a Meta não existe no caminho.

**O GA4 deduplica, mas pela régua dele.** Entre as três fontes, só o GA4 distribui um pedido entre canais concorrentes, e o crédito somado não passa de um pedido. Só que ele *"exclui visitas diretas de receber crédito de atribuição"* salvo quando o caminho é todo direto ([GA4](https://support.google.com/analytics/answer/10596866)), perde a compra que não volta do pagamento (o [problema do Pix](https://precisian.io/blog/pt-BR/posts/pix-quebra-o-purchase-do-ga4/)) e não vê impressão da Meta. O GA4 entra na conta como uma quarta opinião.

**Até o GA4 muda de régua conforme o relatório.** Nos relatórios do Analytics, o padrão de canais que recebem crédito é pago e orgânico; nos relatórios do Google Ads, o padrão é só canais pagos do Google ([GA4](https://support.google.com/analytics/answer/10597962)). Se a sua conversão do Google Ads é importada do GA4, ela já chega com uma régua diferente da que o MCP do GA4 devolve.

O [MCP do Google Ads](https://precisian.io/blog/pt-BR/posts/mcp-do-google-ads/) mostra o primeiro lado dessa conta: ele lê fielmente o que a conta registrou, datado pelo clique. O que vale para ele vale para os outros dois: o [MCP da Meta Ads](https://precisian.io/blog/pt-BR/posts/mcp-da-meta-ads/) devolve a conversão que a Meta atribuiu a si mesma, e o [MCP do Google Analytics](https://precisian.io/blog/pt-BR/posts/mcp-do-google-analytics/) acrescenta a camada de dado modelado que o GA4 já carrega.

## Como diagnosticar na sua conta?

Com um exercício que cabe numa tarde. A mesma semana, a mesma pergunta feita a cada fonte, e o ERP como juiz.

**1. Escolha uma semana fechada há mais de 30 dias.** O Google Ads reporta pela data do clique e continua recebendo conversões até o fim da janela ([Google Ads](https://support.google.com/google-ads/answer/3123169)). Semana recente ainda está mudando.

**2. Pergunte ao MCP do Google Ads pedindo a regra junto.** Peça o valor de conversão pelas duas datas: `metrics.conversions_value` (data do clique) e `metrics.conversions_value_by_conversion_date` (data da conversão). Peça também quais ações de conversão entraram e se alguma é importada do GA4.

**3. Pergunte ao MCP da Meta exigindo a janela por escrito.** Na API de Insights, a janela sai de `action_attribution_windows` e a data do relatório sai de `action_report_time`, que aceita a data da impressão ou a da conversão ([Meta](https://developers.facebook.com/docs/marketing-api/reference/ad-account/insights)). Se o agente não souber dizer qual janela usou, anote isso: a resposta é inauditável.

**4. Pergunte ao MCP do GA4 por pedido, não por total.** O servidor oficial é experimental, usa a Data API e expõe `run_report` ([repositório](https://github.com/googleanalytics/google-analytics-mcp)). Peça `purchaseRevenue` com as dimensões `transactionId` e `defaultChannelGroup`, que é o canal do evento-chave segundo o modelo da propriedade ([esquema da Data API](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema)).

**5. Tire do ERP os pedidos faturados da mesma semana**, pela data do pedido, sem cancelados e sem boleto vencido.

**6. Preencha a tabela.** Um exemplo com números redondos, sintético, para mostrar a forma da conta:

| Fonte | Resposta a "quanto a mídia vendeu?" | Regra |
|---|---|---|
| MCP do Google Ads | R$ 62.000 | Data do clique, janela de 30 dias, modelo só do Google |
| MCP da Meta | R$ 54.000 | 7 dias após o clique ou 1 após a visualização |
| Soma que o agente apresenta | R$ 116.000 | Nenhuma: é aritmética sobre réguas diferentes |
| MCP do GA4, canais pagos | R$ 50.000 | Modelo da propriedade, só o que o navegador registrou |
| MCP do GA4, total da loja | R$ 112.000 | Inclui orgânico, direto, e-mail, CRM |
| ERP, faturado da semana | R$ 130.000 | Pedido faturado, sem canal |

Neste exemplo inventado, o agente diz que a mídia vendeu 89% de tudo que a loja faturou, e o GA4 diz que a mídia vendeu 38%. Os R$ 66.000 entre as duas leituras são sobreposição, visualização sem clique, diferença de janela e conversão modelada, misturados. É a [soma de ROAS que passa do faturamento](https://precisian.io/blog/pt-BR/posts/roas-soma-maior-que-faturamento/), agora calculada dentro do chat.

**7. Leia o resultado contra o juiz.** Duas verificações dispensam qualquer modelo:

| Verificação | Conta | O que prova |
|---|---|---|
| Soma das plataformas contra o ERP | R$ 116.000 ÷ R$ 130.000 | Acima de 100%, a dupla contagem é certa. Perto disso, sobra receita implausível para os canais sem mídia |
| Pedidos do GA4 contra pedidos do ERP | `transactionId` casado com o número do pedido | A cobertura do GA4: o que ele nunca viu não entra em atribuição nenhuma |

Não existe limiar publicado de "sobreposição aceitável", e eu não vou inventar um. O que existe é aritmética. A soma das plataformas não pode passar do que o caixa recebeu.

## Como corrigir?

Escolher um MCP vencedor não resolve. Cada um continua sendo a melhor fonte para o que mede dentro de casa: gasto, lance, termo de busca, criativo. O conserto é tirar do agente a decisão sobre o que "venda de mídia" significa.

**Separe ROAS declarado de receita de mídia.** ROAS declarado é um número por plataforma, útil para otimizar dentro dela, e nunca somável. Receita de mídia é um número da empresa, calculado sobre o pedido faturado, com uma regra escolhida e escrita. A diferença está detalhada em [o que é ROAS e quando ele mente](https://precisian.io/blog/pt-BR/posts/o-que-e-roas/).

**Escreva a definição onde o agente lê antes de calcular.** Instrução no prompt resolve uma conversa e some na próxima. A definição de "receita de mídia", com fonte, janela, data e tratamento de cancelamento, precisa morar numa [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/) versionada, que o agente consulta em vez de improvisar.

**Junte por pedido, não por total.** A ponte entre mídia e caixa é o número do pedido: o `transactionId` do GA4, o pedido da VTEX, a devolução lançada no ERP. Somar totais de fontes diferentes produz um número que nenhuma fonte reconhece.

**Exija a régua na resposta.** Enquanto a definição não existe, a regra mínima é o agente declarar janela, data e modelo de cada número. Resposta sem régua não vai para reunião de orçamento.

É o trabalho que a Precisian faz: o dado de cada plataforma e do ERP num data lake isolado por cliente, na infraestrutura da Precisian, com a definição de métrica na camada semântica, entregue ao assistente que você já usa por MCP, API ou BI. O problema não é conectar a IA aos dados. É que os dados, do jeito que estão, fazem a IA responder com confiança um número errado.

## Quando isso não tem conserto?

Em três situações, e convém saber antes de prometer um número ao financeiro.

**Visualização sem clique não se reconcilia.** A conversão por visualização da Meta acontece dentro da Meta. Nenhum dado seu liga aquela impressão ao pedido, então a única forma de saber se ela causou a venda é experimento com grupo de controle. Camada semântica decide como a empresa conta; ela não descobre o que a plataforma não entrega.

**Venda fora do seu site não tem caminho.** Pedido no Mercado Livre, venda fechada no WhatsApp ou na loja física não passa pelo GA4 e não volta para as plataformas. Dá para declarar a regra ("receita de marketplace fica fora da receita de mídia"), mas não dá para atribuir o que nenhum sistema registrou.

**Atribuição não é incremento.** Mesmo com uma definição única e sem dupla contagem, a resposta continua sendo "quanto a mídia levou de crédito", não "quanto a mídia causou". Para a segunda pergunta, só teste de desligamento ou de lift.

E há o caso em que a Precisian é a escolha errada: se você anuncia só no Google, vende só no próprio site e o GA4 bate com o ERP dentro de uma diferença que você entende, o MCP do Google Ads mais uma conferência mensal contra o ERP resolve. A sobreposição descrita aqui precisa de pelo menos duas plataformas reivindicando o mesmo pedido.

## O que este artigo não cobre?

Não ensina a instalar nenhum dos três servidores, porque o passo a passo muda a cada versão. Não descreve as ferramentas nem as permissões do MCP da Meta: os números da Meta citados aqui vêm da documentação da API de Insights, que é a porta documentada de relatório de anúncios, e não de material sobre o servidor MCP.

Não afirma qual é o modelo de atribuição padrão de uma propriedade nova do GA4. A página de ajuda do Google que lista os modelos não diz qual é o padrão, e eu não encontrei fonte primária que diga. Confira o seu em Administrador, Configurações de atribuição.

E não diz quanto é a sobreposição na sua operação. Os números da tabela do exercício são sintéticos. O tamanho real depende do seu mix de canal e só aparece medindo.

---

Se o agente com Google Ads, Meta e GA4 conectados diz que a mídia vendeu quase tudo que a loja faturou, o primeiro passo é rodar a semana contra o ERP e medir a sobreposição. [Vale uma conversa sobre o seu caso](https://calendar.notion.so/meet/rodrigomartucci/precisian-io) — sem compromisso de contrato, mas sem promessa de resposta em 30 minutos também.
