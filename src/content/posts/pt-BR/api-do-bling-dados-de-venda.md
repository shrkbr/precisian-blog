---
title: "API do Bling: o que dá para tirar de pedido e nota fiscal"
description: "A API v3 do Bling lista pedidos sem itens, taxas nem nota: isso exige GET /pedidos/vendas/{id}. E sem filtro, a busca de NF-e omite as canceladas."
slug: "api-do-bling-dados-de-venda"
lang: "pt-BR"
translationKey: "api-do-bling-dados-de-venda"
publishedAt: 2026-11-11
tags: ["erp", "integracao", "divergencia-de-dados", "ecommerce"]
draft: false
llmSummary: "Segundo a especificação OpenAPI da API v3 do Bling (lida em 11/11/2026), GET /pedidos/vendas devolve o pedido sem itens, taxas de marketplace nem nota; isso exige GET /pedidos/vendas/{idPedidoVenda}. O limite é de 3 requisições por segundo e 120.000 por dia, por conta."
citations: ["https://developer.bling.com.br/referencia", "https://developer.bling.com.br/limites", "https://developer.bling.com.br/boas-praticas", "https://developer.bling.com.br/aplicativos", "https://developer.bling.com.br/webhooks", "https://developer.bling.com.br/changelogs", "https://developer.bling.com.br/mcp-server"]
about: ["https://pt.wikipedia.org/wiki/Planejamento_de_recursos_empresariais", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 10
cta: regua
---
A API v3 do Bling devolve o pedido de venda em duas profundidades: a listagem `GET /pedidos/vendas` traz número, data, total, cliente e situação, mas não traz itens, frete, taxas de marketplace nem o ID da nota. Esses dados exigem uma chamada por pedido, em `GET /pedidos/vendas/{idPedidoVenda}`. O limite publicado é de 3 requisições por segundo e 120.000 por dia, contado para a conta inteira ([referência da API](https://developer.bling.com.br/referencia) e [limites](https://developer.bling.com.br/limites), lidos em 11 de novembro de 2026).

Em outubro escrevi que [não tinha conseguido ler os campos de pedido do Bling](https://precisian.io/blog/pt-BR/posts/o-que-o-erp-devolve-de-dado-de-venda/): a página de referência renderiza no navegador. Desta vez li a especificação OpenAPI que a própria página carrega (título "Bling API", versão `3.0`, servidor `https://api.bling.com.br/Api/v3`). Todo nome de campo abaixo está escrito como aparece nela.

> **No Bling, comissão de marketplace, custo de frete, imposto destacado e nota fiscal moram no detalhe do pedido ou em outro recurso.** Quem soma só a listagem mede faturamento bruto.

## Qual é o sintoma?

A receita que a integração calcula a partir do Bling fica acima do que o financeiro fecha, e a diferença não cabe na comissão que alguém tem de cabeça. Ou o número de notas emitidas no mês não bate com o de pedidos faturados, e os dois parecem certos.

Os dois sintomas costumam ter a mesma origem: a carga leu a listagem e a tratou como o pedido inteiro, ou leu notas sem saber que a busca padrão esconde parte delas.

## O que a listagem de pedidos devolve?

Pouco. Segundo o esquema de resposta de `GET /pedidos/vendas`, cada pedido da lista traz:

<table>
<thead><tr><th>Campo</th><th>O que é</th></tr></thead>
<tbody>
<tr><td><code>id</code>, <code>numero</code>, <code>numeroLoja</code></td><td>ID interno, número no Bling e número do pedido na loja de origem</td></tr>
<tr><td><code>data</code>, <code>dataSaida</code>, <code>dataPrevista</code></td><td>Três datas, todas como texto</td></tr>
<tr><td><code>totalProdutos</code>, <code>total</code></td><td>Soma dos produtos e total do pedido</td></tr>
<tr><td><code>contato.id</code>, <code>contato.nome</code>, <code>contato.tipoPessoa</code>, <code>contato.numeroDocumento</code></td><td>Cliente, com CPF ou CNPJ ("CNPJ ou CPF", diz a descrição)</td></tr>
<tr><td><code>situacao.id</code>, <code>situacao.valor</code></td><td>Situação do pedido, sem lista de valores na especificação</td></tr>
<tr><td><code>loja.id</code>, <code>loja.unidadeNegocio.id</code></td><td>Loja e filial</td></tr>
</tbody>
</table>

Ficam de fora da listagem `itens`, `parcelas`, `transporte`, `desconto`, `outrasDespesas`, `tributacao`, `notaFiscal`, `intermediador` e `taxas`. Um ponto a favor do Bling em relação ao que descrevi no Omie: o documento do cliente vem no próprio pedido, no campo `contato.numeroDocumento`.

Os filtros da listagem são os que importam para a carga incremental: `idsSituacoes[]`, `dataInicial` e `dataFinal`, `dataAlteracaoInicial` e `dataAlteracaoFinal` (que aceitam hora desde a versão 310 do [changelog](https://developer.bling.com.br/changelogs)), `idLoja`, `numerosLojas[]` e `idUnidadeNegocio`.

## O que só aparece no detalhe do pedido?

Tudo o que separa faturamento de margem. O esquema de `GET /pedidos/vendas/{idPedidoVenda}` acrescenta:

<table>
<thead><tr><th>Campo</th><th>O que a especificação diz</th><th>O que isso muda no número</th></tr></thead>
<tbody>
<tr><td><code>itens[].valor</code></td><td>"Valor unitário do item"</td><td>Preço praticado por item</td></tr>
<tr><td><code>itens[].desconto</code></td><td>"Valor percentual"</td><td>Desconto do item é porcentagem, não reais</td></tr>
<tr><td><code>desconto.valor</code>, <code>desconto.unidade</code></td><td><code>REAL</code> ou <code>PERCENTUAL</code></td><td>Desconto do pedido pode vir nas duas unidades</td></tr>
<tr><td><code>transporte.frete</code></td><td>frete do pedido</td><td>Frete cobrado, que não é o custo do frete</td></tr>
<tr><td><code>taxas.taxaComissao</code></td><td>"Taxa de comissão perante ao total da venda"</td><td>Comissão do marketplace</td></tr>
<tr><td><code>taxas.custoFrete</code></td><td>"Valor de custo do frete"</td><td>Frete que o vendedor pagou</td></tr>
<tr><td><code>tributacao.totalICMS</code>, <code>tributacao.totalIPI</code></td><td>totais de imposto</td><td>Só ICMS e IPI aparecem aqui</td></tr>
<tr><td><code>intermediador.cnpj</code>, <code>intermediador.nomeUsuario</code></td><td>intermediador da venda</td><td>Marketplace que intermediou</td></tr>
<tr><td><code>notaFiscal.id</code></td><td>ID da nota</td><td>A chave de acesso exige outra chamada</td></tr>
<tr><td><code>parcelas[].formaPagamento.id</code>, <code>parcelas[].caut</code></td><td>"código de autorização da operação financeira"</td><td>Liga a parcela à transação do adquirente</td></tr>
</tbody>
</table>

Os três campos de `taxas` (`taxaComissao`, `custoFrete` e `valorBase`) entraram na versão 291 do [changelog](https://developer.bling.com.br/changelogs), descritos como "taxas de marketplace". Eles também existem no `POST` e no `PUT` de pedidos, ou seja, são gravados por quem cria o pedido. A especificação não diz que o Bling os calcula. Se a integração com o marketplace não preenche, o campo fica vazio, e a sua margem passa a ter comissão zero.

Há também um `itens[].comissao`, com `base`, `aliquota` e `valor`, sem descrição na especificação. Não o trate como comissão de marketplace sem conferir na sua conta: a comissão de marketplace documentada é a de `taxas`.

## O pedido cancelado vem junto?

Vem, e o código de "cancelado" não é fixo. A situação do pedido chega como `situacao.id` e `situacao.valor`, e a especificação não publica a lista de valores. As situações são configuráveis: `GET /situacoes/modulos/{idModuloSistema}` devolve, para o módulo de vendas da sua conta, cada situação com `id`, `nome` e `idHerdado` ("ID da situação de referência"). Uma conta pode ter situações próprias herdadas de "Cancelado".

Na prática, o filtro que exclui cancelados precisa ser montado lendo esse endpoint na conta do cliente, não copiado de outra integração.

## O que a API de notas fiscais devolve?

A nota tem dois recursos, `/nfe` e `/nfce` (nota de consumidor), e a busca de NF-e tem uma regra que pega quem compara com o pedido. Na descrição do filtro `situacao` de `GET /nfe`: *"Caso este parâmetro não seja informado, as notas canceladas não serão incluídas na consulta."* É o comportamento oposto ao do pedido. Uma carga sem filtro de situação traz o pedido cancelado e não traz a nota cancelada dele.

A lista de situações da NF-e é fechada: `1` Pendente, `2` Cancelada, `3` Aguardando recibo, `4` Rejeitada, `5` Autorizada, `6` Emitida DANFE, `7` Registrada, `8` Aguardando protocolo, `9` Denegada, `10` Consulta situação, `11` Bloqueada.

O detalhe, [`GET /nfe/{idNotaFiscal}`](https://developer.bling.com.br/referencia), traz `chaveAcesso`, `valorNota`, `valorFrete`, `finalidade` (onde `4` é Devolução), `numeroPedidoLoja` e, por item, `cfop`, `classificacaoFiscal` (NCM) e `impostos.icms.valor`. O objeto `intermediador` entrou no detalhe da nota na versão 344, e só aparece "quando o indicador de intermediador estiver ativo na nota fiscal". O XML completo sai por `GET /nfe/documento/{chaveAcesso}`, com o parâmetro obrigatório `formato` (`pdf` ou `xml`), desde a versão 341.

Uma inconsistência para registrar: em `/contas/receber`, o campo `origem.situacao` descreve as situações da nota com outra numeração, em que `3` é Cancelada e `6` é Autorizada. Na própria especificação, a mesma situação de nota tem dois códigos conforme o recurso em que aparece. Quem cruza recebível com nota pelo número da situação cruza errado.

## E o dinheiro, onde fica?

Em contas a receber. `GET /contas/receber` aceita `tipoFiltroData` (`E` emissão, `V` vencimento, `R` recebimento), e cada conta traz `situacao`, `valor`, `saldo`, `formaPagamento` e `origem` (a venda ou nota que gerou a conta). A taxa do meio de pagamento está no cadastro da forma de pagamento, `GET /formas-pagamentos/{idFormaPagamento}`, em `taxas.aliquota`, `taxas.valor` e `taxas.prazo` ("Prazo em dias que o dinheiro é retido"). É a taxa cadastrada, não a cobrada transação a transação.

## O que limita a extração?

Os [limites](https://developer.bling.com.br/limites) valem para a conta, "não específicas por endpoints": 3 requisições por segundo e 120.000 por dia. Há bloqueio de IP por 10 minutos com 300 erros em 10 segundos ou 600 requisições em 10 segundos, e por 60 minutos com 20 chamadas a `/oauth/token` em 60 segundos. Filtro por período maior que um ano responde `400`. A paginação usa `pagina` e `limite`, com 100 registros por página por padrão ([boas práticas](https://developer.bling.com.br/boas-praticas)).

A conta de chamadas, num exemplo com números redondos, sintético: uma loja com 30.000 pedidos no mês precisa de 300 páginas de listagem, 30.000 detalhes de pedido e 30.000 detalhes de nota. São cerca de 60.300 chamadas, metade da cota diária, e umas 5 horas e meia a 3 por segundo. Como o limite é da conta, essa carga disputa a cota com o hub de marketplace e com qualquer outra integração ligada ao mesmo Bling.

O token também tem relógio. Na [doc de aplicativos](https://developer.bling.com.br/aplicativos), o exemplo de resposta traz `expires_in` de `21600` segundos (6 horas) para o `access_token`, e o `refresh_token` expira em 30 dias.

## Webhook resolve a carga incremental?

Ajuda, com três cuidados que a [doc de webhooks](https://developer.bling.com.br/webhooks) escreve. Os recursos de venda são `order`, `invoice` e `consumer_invoice`, com as ações `created`, `updated` e `deleted`. "Não há garantia da entrega dos eventos na ordem em que foram gerados." A entrega conta como feita com resposta `2xx` em até 5 segundos, e as retentativas duram no máximo 3 dias. E "alterar a situação de um recurso para excluído gera um evento de `updated`", não de `deleted`. O webhook serve para avisar que algo mudou; a conciliação do mês continua sendo uma leitura por `dataAlteracaoInicial`.

## Como diagnosticar na sua integração?

Rode num mês fechado:

<table>
<thead><tr><th>Verificação</th><th>Onde olhar</th><th>O que indica problema</th></tr></thead>
<tbody>
<tr><td>Comissão preenchida</td><td><code>taxas.taxaComissao</code> nos pedidos com <code>intermediador.cnpj</code></td><td>Pedido de marketplace com comissão vazia</td></tr>
<tr><td>Situações da conta</td><td><code>/situacoes/modulos/{id}</code> do módulo de vendas</td><td>Situação própria herdada de cancelado fora do filtro</td></tr>
<tr><td>Notas canceladas</td><td><code>GET /nfe</code> com e sem <code>situacao=2</code></td><td>Diferença entre pedidos cancelados e notas canceladas</td></tr>
<tr><td>Devolução</td><td><code>finalidade=4</code> no detalhe da nota</td><td>Devolução que a receita não descontou</td></tr>
<tr><td>Frete</td><td><code>transporte.frete</code> contra <code>taxas.custoFrete</code></td><td>Frete cobrado lido como custo, ou custo zerado</td></tr>
<tr><td>Limite excedido</td><td>log da carga: a resposta de limite excedido informa o período (segundo ou dia) e o limite da conta</td><td>Carga competindo com outra integração</td></tr>
</tbody>
</table>

## Como corrigir?

Primeiro a definição, depois a query. "Venda do Bling" pode ser `total` dos pedidos não cancelados, ou isso menos `taxas.taxaComissao`, menos `taxas.custoFrete`, menos as notas de devolução. São números diferentes e todos defensáveis; o erro é não ter escolhido um. Escrita e versionada, essa escolha é o que chamamos de [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/), e o detalhe das parcelas está em [como calcular margem de contribuição por pedido](https://precisian.io/blog/pt-BR/posts/margem-de-contribuicao-ecommerce/).

Na extração:

1. **Puxe por `dataAlteracaoInicial` e `dataAlteracaoFinal`**, com sobreposição de janela, para pegar o pedido que mudou de situação depois da carga.
2. **Busque o detalhe só do que mudou.** É o que cabe na cota.
3. **Leia as notas com `situacao` explícito**, incluindo a `2`.
4. **Fatie a carga histórica em janelas de até um ano**, ou leva `400`.
5. **Renove o token antes das 6 horas** e trate o `refresh_token`, que expira em 30 dias ([aplicativos](https://developer.bling.com.br/aplicativos)).

## E o MCP do Bling?

O Bling publica um [servidor MCP hospedado](https://developer.bling.com.br/mcp-server) em `https://mcp.bling.com.br/mcp`, com autorização OAuth pela conta. Segundo a página, ele permite consultar pedidos, notas, contatos, estoque e contas, e também "criar e atualizar cadastros, pedidos de venda, pedidos de compra e realizar lançamentos de estoque", respeitando as permissões do usuário no painel. Serve bem para a pergunta operacional do dia. Para a margem do mês, o agente encontra os mesmos campos descritos acima, com as mesmas lacunas, e a mesma ausência de definição de receita.

## Quando isso não tem conserto?

**Origem da venda.** O pedido traz `loja.id` e `intermediador`, mas nenhum campo de campanha, UTM ou clique. A API do Bling diz em qual canal a venda caiu, não de onde o comprador veio. É o mesmo desenho que descrevi em [marketplace como buraco negro de dados](https://precisian.io/blog/pt-BR/posts/marketplace-buraco-negro-de-dados/).

**Taxa que ninguém gravou.** Se o hub não preencheu `taxas`, o Bling não tem a comissão, e o dado precisa vir da API do próprio marketplace (no Mercado Livre, o `sale_fee` do [`/orders`](https://precisian.io/blog/pt-BR/posts/api-do-mercado-livre-dados-de-venda/)).

**Taxa efetiva do adquirente.** O Bling guarda a taxa cadastrada na forma de pagamento. A cobrada de fato está no extrato do adquirente.

Quando a Precisian não é a resposta: se o Bling é a única fonte e o fechamento do mês já bate com o financeiro, uma plataforma de dados é custo sem problema para resolver. O problema aparece quando o Bling precisa conversar com o site, os marketplaces e a mídia. Conectamos qualquer fonte que tenha API aberta.

## O que este artigo não cobre?

**Não cobre a API v2**, nem os endpoints de NFS-e, estoque e compras. **Não traz o tamanho máximo de página**: a [especificação](https://developer.bling.com.br/referencia) declara o mínimo de `limite` e o padrão de 100, não o máximo.

Registro de método: a página de referência do Bling monta a documentação no navegador a partir de um arquivo OpenAPI. Li esse arquivo, carregado pela própria página em 11 de novembro de 2026, e as páginas de limites, boas práticas, aplicativos, webhooks e MCP, que renderizam no servidor. As versões citadas (291, 310, 341, 344) são as do changelog oficial.

Se a receita que sai do Bling não fecha com o financeiro, o primeiro passo é medir a diferença entre o `total` da listagem e o que sobra depois de comissão, custo de frete e notas de devolução. [Veja a pergunta deste post respondida sobre um lake de verdade](https://precisian.io/demonstracao?utm_source=blog&utm_medium=cta&utm_campaign=api-do-bling-dados-de-venda&utm_content=texto), sem compromisso de contrato.
