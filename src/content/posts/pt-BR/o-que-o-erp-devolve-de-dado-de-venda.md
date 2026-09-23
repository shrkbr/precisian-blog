---
title: "O que o ERP devolve de dado de venda (e o que não devolve)"
description: "O pedido do Omie não devolve CPF nem CNPJ, e no Olist o campo chamado origem não é o marketplace, é PDV."
slug: "o-que-o-erp-devolve-de-dado-de-venda"
lang: "pt-BR"
translationKey: "what-erp-returns-sales-data"
publishedAt: 2026-11-21
tags: ["erp", "integracao", "divergencia-de-dados"]
draft: false
llmSummary: "Os ERPs divergem no basico: o pedido do Omie nao devolve CPF nem CNPJ, so um codigo interno, e no Olist o campo origemPedido significa PDV, nao marketplace. A chave da NF-e nunca vem no pedido, e pedido cancelado volta pelo mesmo endpoint."
citations: ["https://api-docs.erp.olist.com/api-reference/pedidos/obter-pedido", "https://api-docs.erp.olist.com/api-reference/notas/obter-nota-fiscal", "https://app.omie.com.br/api/v1/produtos/pedido/", "https://developer.bling.com.br/limites", "https://dfe-portal.svrs.rs.gov.br/Schemas/PRNFE/leiauteNFe_v4.00.xsd", "https://ajuda.omie.com.br/pt-BR/articles/8112984-limites-de-consumo-da-api-do-omie"]
about: ["https://pt.wikipedia.org/wiki/Nota_fiscal_eletr%C3%B4nica", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 9
---

Os ERPs não concordam nem na pergunta mais básica, e 2 dos 3 que tentei ler respondem "quem comprou" de formas incompatíveis. O pedido do Omie devolve o cliente só por `codigo_cliente`, um inteiro interno, **sem CPF nem CNPJ** ([Omie](https://app.omie.com.br/api/v1/produtos/pedido/)). O do Olist devolve `cpfCnpj`, mas marcado como anulável na própria especificação ([Olist](https://api-docs.erp.olist.com/api-reference/pedidos/obter-pedido)). Quem monta a integração assumindo que "o ERP devolve o documento do cliente" descobre a diferença em produção.

Verificado em 23 de setembro de 2026, lendo a especificação de máquina e não a página de documentação, por um motivo que fica claro abaixo.

> **Regra geral que não existe.** Não há um formato de pedido comum entre ERPs. Há três desenhos diferentes com nomes parecidos, e o parecido é onde mora o erro.

## O campo "origem" é o marketplace?

No Olist, não. E essa é a armadilha mais cara da integração.

O pedido tem um campo chamado `origemPedido`, e a especificação o descreve assim: *"Origem do pedido (0 = Pedido de Venda, 1 = PDV)"* ([Olist](https://api-docs.erp.olist.com/api-reference/pedidos/obter-pedido)). É a diferença entre venda registrada no sistema e venda no ponto de venda físico. Não tem nada a ver com canal.

O canal de verdade mora em outro lugar, dentro do objeto `ecommerce`: `id`, `nome`, `numeroPedidoEcommerce`, `numeroPedidoCanalVenda` e `canalVenda`.

Quem faz o mapeamento casando nome de campo, e "origem" é o candidato óbvio, importa PDV como se fosse canal. O relatório sai com duas categorias e ninguém desconfia, porque os números somam.

No Omie o campo homônimo significa outra coisa ainda. `origem_pedido` é documentado com *"Default: API - Importado via API. MLV - Mercado Livre"*, ou seja, um código curto que inclui marketplace. Registro que a lista completa de códigos **não está documentada** na página que li: aparecem só o padrão e um exemplo.

Dois ERPs, um nome de campo, dois significados incompatíveis.

## Quem comprou, afinal?

Depende do ERP, e a resposta do Omie surpreende.

| | Identificação do cliente no pedido |
|---|---|
| **Olist** | `cpfCnpj`, `email`, `nome` no objeto `cliente`, todos anuláveis |
| **Omie** | só `codigo_cliente` e `codigo_cliente_integracao` |
| **Bling** | não verificado, ver o fim do artigo |

No Olist o objeto de cliente traz `nome`, `codigo`, `fantasia`, `tipoPessoa`, `cpfCnpj`, `inscricaoEstadual`, `rg`, `telefone`, `celular` e `email`. O `tipoPessoa` tem enumeração própria: `J - Juridica`, `F - Fisica`, `E - Estrangeiro`, `X - Estrangeiro No Brasil`.

Importante: a especificação marca `cpfCnpj` e `email` como anuláveis e **não afirma** que venham sempre preenchidos. Taxa de preenchimento é coisa que se mede na sua conta, não se assume pela documentação.

No Omie, a consequência é de arquitetura: **não dá para deduplicar cliente nem cruzar com CRM a partir do pedido**. É obrigatório um segundo chamado ao cadastro. Quem dimensionou a extração sem contar essa volta descobre tarde.

## A chave da nota vem no pedido?

Não, em nenhum dos dois que consegui ler.

O pedido do Olist carrega apenas `idNotaFiscal`, um inteiro interno. A chave de acesso exige um segundo chamado, ao recurso de nota, cujo objeto traz `situacao`, `tipo`, `numero`, `serie`, `chaveAcesso`, `dataEmissao`, `cliente`, `valor`, `valorProdutos`, `valorFrete` e o rastreamento ([Olist](https://api-docs.erp.olist.com/api-reference/notas/obter-nota-fiscal)).

No Bling, a estrutura confirma o mesmo desenho por outro caminho: existe um endpoint separado para **gerar** a NF-e a partir do pedido, o que significa que a nota é um objeto distinto, não um campo.

A conta de extração, então, é pior do que parece. No Olist, para ter item de pedido e chave de nota você precisa de uma chamada de listagem, mais uma de detalhe por pedido, mais uma de nota por pedido. A listagem devolve um objeto reduzido: traz `dataCriacao` em vez de `data`, `valor` como texto, e **omite** `dataFaturamento`, `itens`, `pagamento` e `idNotaFiscal`.

## O pedido cancelado vem junto?

Vem, e pelo mesmo endereço.

A enumeração de `situacao` no Olist é: `8 - Dados Incompletos`, `0 - Aberta`, `3 - Aprovada`, `4 - Preparando Envio`, `1 - Faturada`, `7 - Pronto Envio`, `5 - Enviada`, `6 - Entregue`, `2 - Cancelada`, `9 - Nao Entregue`.

`2 - Cancelada` está na mesma lista que `6 - Entregue`, e a listagem aceita `situacao` como filtro com a mesma enumeração. Ou seja: se você não excluir explicitamente, cancelado entra como venda. É [a mesma família de erro do marketplace](https://precisian.io/blog/pt-BR/posts/deduplicar-venda-site-marketplace/), e ela infla receita em silêncio, porque o número continua plausível.

Sobre datas, há três distintas no Olist, com uma armadilha de tipo: `data` do pedido e `dataEntrega` vêm como data pura, enquanto `dataEnvio` vem com **hora junto**. Todas são texto, nenhuma é declarada com formato de data. Quem faz conversão genérica quebra numa e não na outra.

E há uma ausência que vale registrar: nas parcelas de pagamento existem `dias`, `data`, `valor` e `observacoes`, mas **não há campo documentado de "pagamento recebido"**. Tratar a data da parcela como data de caixa é suposição, não leitura.

## O que a NF-e carrega que o pedido não carrega?

Duas informações de canal que o ERP frequentemente não devolve, e que o fisco obriga.

O esquema oficial da NF-e define `indPres` como *"Indicador de presença do comprador no estabelecimento comercial no momento da oepração"*, com valores entre os quais `2-Não presencial, internet`. E define `indIntermed` assim: *"Indicador de intermediador/marketplace / 0=Operação sem intermediador (em site ou plataforma própria) / 1=Operação em site ou plataforma de terceiros (intermediadores/marketplace)"* ([SEFAZ, esquema NF-e 4.00](https://dfe-portal.svrs.rs.gov.br/Schemas/PRNFE/leiauteNFe_v4.00.xsd)).

O erro de digitação em "oepração" está no esquema oficial. Reproduzo como está.

O mesmo documento traz `dhEmi`, *"Data e Hora de emissão do Documento Fiscal"*, e, no destinatário, `CNPJ`, `CPF` e `idEstrangeiro`.

A conclusão é útil e pouco explorada: onde o pedido do ERP deixa o documento do cliente anulável ou ausente, **a nota fiscal não tem essa liberdade**. Para separar venda própria de venda por marketplace, e para ter uma data com valor legal, o documento fiscal é uma fonte melhor do que o objeto de pedido. Não substitui o ERP, mas responde perguntas que o ERP deixa em aberto.

## Por que isso vira divergência de relatório?

Porque cada uma dessas diferenças vira uma definição implícita, e ninguém a escreve.

Se o cancelado entra, sua receita é uma definição. Se a data usada é a do pedido em vez da do faturamento, é outra. Se o canal veio de um campo que significa PDV, é uma terceira. Nenhuma delas foi decidida numa reunião: todas foram decididas por quem escreveu o mapeamento, provavelmente com pressa, provavelmente casando nome de campo.

Meses depois, quando o número do ERP não bate com o do financeiro, a investigação começa procurando erro e não encontra nenhum. Não há erro. Há três escolhas de recorte tomadas em silêncio, que é [exatamente o motivo de marketing e financeiro nunca fecharem o mesmo número](https://precisian.io/blog/pt-BR/posts/mesma-definicao-de-receita/).

O antídoto é barato e chato: para cada campo que você importa, escreva de onde veio e o que ele significa no ERP de origem, com a citação da documentação ao lado. Um arquivo de mapeamento com trinta linhas comentadas resolve mais discussão futura do que qualquer painel, porque transforma "o número está errado" em "o número usa este recorte, que decidimos assim".

## O que limita a extração noturna?

Limites publicados, e eles diferem bastante.

O Bling publica *"3 requisições por segundo"* e *"120.000 requisições por dia"*, além de bloqueios por erro e uma restrição que muda planejamento: *"GET com filtros por período com intervalo superior a um ano retornarão o status code 400"* ([Bling](https://developer.bling.com.br/limites)). Ou seja, **carga histórica maior que um ano precisa ser fatiada**.

O Omie publica *"960 requisições por minuto por Endereço IP"* e *"240 requisições por minuto por Endereço IP + App Key + Método"*, com quatro chamadas simultâneas, cem registros por página, e sem parâmetro de data a resposta cobre os *"últimos 30 dias"* ([Omie](https://ajuda.omie.com.br/pt-BR/articles/8112984-limites-de-consumo-da-api-do-omie)).

O Olist expõe limite por cabeçalho de resposta e afirma que *"O limite de requisições é por conta, não por aplicativo"*, o que importa quando há mais de uma integração ativa na mesma conta.

Vale um elogio ao desenho do Omie: a listagem aceita `filtrar_apenas_alteracao`, filtros de hora além de data, e `data_cancelamento_de` com `data_cancelamento_ate`. Esse último permite puxar só os pedidos cancelados desde ontem, que é exatamente o que falta para conciliar sem reprocessar tudo.

## O que este artigo não cobre?

**Não traz a lista de campos do Bling.** A página de referência dele é renderizada no navegador e devolve quase nenhum texto para leitura automatizada; o arquivo de especificação existe, responde, e é grande demais para ser lido por inteiro nas tentativas que fiz. Os limites acima vêm de uma página que renderiza no servidor. Campo de pedido do Bling, não.

**Não cita TOTVS nem Linx.** Os portais de desenvolvedor da TOTVS responderam com exigência de pagamento e a página da Linx respondeu como inexistente. Sem leitura, sem afirmação.

**Não decompõe a composição da chave de acesso.** Essa tabela circula bastante e eu só a obtive por resumo automático de um PDF que não consegui abrir. Estrutura de chave fiscal se publica com o manual aberto na frente.

**Não afirma que esses são os ERPs mais usados do e-commerce brasileiro.** Não encontrei fonte com metodologia para participação de mercado, e essa frase costuma ser repetida sem nenhuma.

E um registro de método que se repete nesta série: na primeira passagem, um extrator automático devolveu o nome de campo `cnpjPagamento`. A especificação crua diz `cnpjPagamentoInstituicao`. O mesmo extrator apresentou `origemPedido` sem descrição, o que convidava a lê-lo como canal de venda. Os dois teriam virado afirmação errada com aparência de precisão. Por isso tudo aqui foi lido em especificação de máquina, não em página de documentação.

Se a sua integração de ERP foi montada casando nome de campo, [vale uma conversa sobre o seu caso](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).
