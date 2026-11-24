---
title: "API do TOTVS: o que dá para tirar de venda e nota fiscal (Protheus)"
description: "Na API do TOTVS (Protheus), o pedido mora nas tabelas SC5 e SC6 e a nota na SF2. A API de Faturamento da TDN não traz endpoint de pedido de venda."
slug: "api-do-totvs-dados-de-venda"
lang: "pt-BR"
translationKey: "api-do-totvs-dados-de-venda"
publishedAt: 2026-11-23
tags: ["erp", "integracao", "divergencia-de-dados", "ecommerce"]
draft: false
llmSummary: "Segundo a TDN, lida em 23/11/2026, a API REST de Faturamento do Protheus (/api/fat/v1) documenta transportadora, cliente e SalesTaxes, sem endpoint de pedido de venda. O pedido fica nas tabelas SC5 e SC6, a nota na SF2, e a genericQuery omite campos sem permissão."
citations: ["https://tdn.totvs.com/pages/viewpage.action?pageId=894394585", "https://tdn.totvs.com/pages/viewpage.action?pageId=696684804", "https://tdn.totvs.com/pages/viewpage.action?pageId=505764846", "https://tdn.totvs.com/pages/viewpage.action?pageId=687146952", "https://tdn.totvs.com/pages/viewpage.action?pageId=190518726", "https://tdn.totvs.com/pages/viewpage.action?pageId=789976267", "https://tdn.totvs.com/pages/viewpage.action?pageId=465383509", "https://tdn.totvs.com/pages/viewpage.action?pageId=22479565", "https://tdn.totvs.com/pages/viewpage.action?pageId=6784155", "https://tdn.totvs.com/pages/viewpage.action?pageId=438281192", "https://tdn.totvs.com/pages/viewpage.action?pageId=1101127407"]
about: ["https://pt.wikipedia.org/wiki/TOTVS", "https://pt.wikipedia.org/wiki/Planejamento_de_recursos_empresariais", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 10
cta: regua
---
A "API do TOTVS" para venda, no Protheus, não é um endpoint único: é o servidor REST do próprio cliente, com APIs por módulo. A página de integração do Faturamento na TDN, atualizada em 05/12/2024 e lida em 23 de novembro de 2026, documenta `/api/fat/v1/carrier` e a API de clientes, sem endpoint de pedido de venda ([FAT0321](https://tdn.totvs.com/pages/viewpage.action?pageId=894394585)). O pedido mora nas tabelas `SC5` e `SC6`, e a nota de saída na `SF2`.

Li as páginas da TDN, o portal de documentação da TOTVS, em 23/11/2026. O portal de referência de APIs, api.totvs.com.br, respondeu com erro 503 nas tentativas que fiz nesse dia. Nome de tabela, campo e endpoint estão escritos como aparecem na TDN, com a data de modificação que cada página exibe.

> **No Protheus, a pergunta "o que a API devolve" tem duas respostas: o que a TOTVS documenta e o que a instalação do seu cliente publicou.** Para ler venda, quem decide é a segunda.

## Qual é o sintoma?

A integração com o Protheus devolve um total de vendas que o comercial não reconhece. Ou o número bate numa filial e falta nas outras. Ou um campo que existe na tela do ERP chega vazio na carga, sem erro nenhum.

Todos têm a mesma raiz que descrevi em [o que o ERP devolve de dado de venda](https://precisian.io/blog/pt-BR/posts/o-que-o-erp-devolve-de-dado-de-venda/): a carga confiou num formato que o ERP não promete. No Protheus, o problema é maior, porque o formato muda de cliente para cliente.

## Existe uma API do TOTVS para pedido de venda?

Para o módulo de Faturamento (SIGAFAT), a documentação pública lista pouco. A [FAT0321](https://tdn.totvs.com/pages/viewpage.action?pageId=894394585) descreve a estrutura do endereço: `<servidor>/api/fat/v1/carrier`, em que `api`, `fat` e `v1` são "Fixo, é definido pelo produto" e o `<servidor>` é "Alterável, depende de cada cliente". As APIs dessa página são de transportadora (tabela `SA4`) e de cliente (`SA1`, em `/api/crm/v1/customerVendor`).

O que a TDN documenta com dado de pedido está espalhado por módulo:

| API | Módulo | O que devolve, segundo a TDN |
|---|---|---|
| `/api/fat/v1/SalesTaxes/{SalesOrderId}` | Faturamento | "os Valores e Tributos de um Pedido de Venda já gravado" ([FAT0308](https://tdn.totvs.com/pages/viewpage.action?pageId=696684804), modificada em 18/08/2025) |
| `/retailSalesOrders` e `/retailSalesOrders/{internalId}/items` | Varejo (SIGALOJA) | Cabeçalho e itens do pedido, com "dados das tabelas SC5, SC6 e SC9" ([DVARLOJ1-3856](https://tdn.totvs.com/pages/viewpage.action?pageId=505764846), de 08/08/2019) |
| `/api/framework/v1/genericQuery` | Framework | Qualquer tabela, por alias, com filtro SQL ([GenericQuery](https://tdn.totvs.com/pages/viewpage.action?pageId=687146952), modificada em 10/10/2024) |
| `/fwmodel/<nome>` | Framework | O modelo MVC que o cliente publicar com `PUBLISH MODEL REST` ([FWRestModel](https://tdn.totvs.com/pages/viewpage.action?pageId=190518726), modificada em 28/09/2026) |

Há ainda endpoints de pedido em módulos de segmento, como `/api/agd/v1/rebate/outros/pedidos` no TOTVS Agro, que lê `SC5`, `SC6` e `SC7` e só fica disponível "quando o módulo SIGAAGD estiver ativo" ([TDN](https://tdn.totvs.com/pages/viewpage.action?pageId=1101127407), 25/08/2026). Serve para quem tem o módulo, não para o varejo.

A autenticação também é do servidor do cliente. O endpoint `/api/oauth2/v1/token` devolve um token de acesso que, segundo a [TDN](https://tdn.totvs.com/pages/viewpage.action?pageId=465383509) (modificada em 19/11/2026), expira em "uma hora", e um token de refresh que expira em "vinte e quatro horas". Carga noturna que guarda só o token de acesso recebe `401` na primeira execução depois de uma hora, como a mesma página descreve.

## Onde a venda mora nas tabelas?

A página da API de varejo é a fonte mais útil para mapear campo, porque publica a origem de cada tag do JSON. O cabeçalho do pedido vem da `SC5`:

| Campo | Descrição na TDN | O que isso significa para o número |
|---|---|---|
| `C5_NUM`, `C5_FILIAL` | Número e filial do pedido | O número só é único dentro da filial |
| `C5_EMISSAO` | Emissão | Data do pedido, não da nota |
| `C5_NOTA`, `C5_SERIE` | Número e série da nota fiscal | Ligação do pedido com o faturamento |
| `C5_PEDECOM` | Número do pedido e-commerce | Chave para casar com VTEX, Magento ou marketplace |
| `C5_STATUS` | Status do pedido no e-commerce (campo "Status Ecom" na MATA410) | Inclui `90-Cancelado` e `91-Devolvido` |
| `C5_FRETE`, `C5_DESPESA`, `C5_DESC1` | Frete, despesa acessória, desconto 1 | O desconto pode estar em mais de um campo |
| `C5_ORIGEM` | Origem do pedido | Sem lista de valores na página; não é origem de tráfego |

Os itens vêm da `SC6`, e dois campos de preço convivem: `C6_PRCVEN`, "Preco Unitario Liquido", e `C6_PRUNIT`, "Preco Unitario de Tabela". Somar o errado troca receita por preço de lista. A liberação fica na `SC9`, com `C9_QTDLIB` e os bloqueios `C9_BLEST` (estoque) e `C9_BLCRED` (crédito). Os valores de `C5_STATUS` estão na documentação da rotina [MATA410](https://tdn.totvs.com/pages/viewpage.action?pageId=789976267) (modificada em 30/09/2026), que lista de `00-Gerado` a `91-Devolvido`.

A nota de saída fica na `SF2`, que a própria página da MATA410 chama de "Arquivo de Cabeçalho de Notas Fiscais de Venda". A chave da NF-e está no campo `F2_CHVNFE`, citado numa [nota técnica de 2018](https://tdn.totvs.com/pages/viewpage.action?pageId=438281192) sobre o TOTVS Colaboração.

## Pedido incluído é venda?

Não, e a documentação da MATA410 é explícita: "Quando um pedido de venda é inserido no sistema, ele ainda não está pronto para ser faturado". O pedido passa por liberação de pedido, de crédito e de estoque, e só depois da "preparação do documento de saída" aparece como "Pedido de Venda encerrado".

Isso cria três números legítimos para o mesmo mês: pedidos incluídos (`SC5` por `C5_EMISSAO`), pedidos liberados (`SC9`) e notas emitidas (`SF2`). A mesma página diz que pedido com nota gerada não pode ser excluído "a menos que as notas fiscais correspondentes sejam canceladas", e que a eliminação de resíduo faz o pedido "constar como encerrado" sem ter sido faturado por inteiro.

Há um detalhe de gravação que afeta carga em tempo real. A MATA410 grava o cabeçalho na `SC5` e depois os itens na `SC6`, um por vez. Se um item não consegue o lock de outra tabela, "O item não é gravado na SC6" e os já gravados ficam: "o pedido fica parcialmente gravado". A TDN diz que o comportamento é intencional. Uma extração que lê o pedido nesse intervalo carrega um pedido incompleto como se fosse o inteiro.

## O que a genericQuery devolve e o que ela esconde?

A [GenericQuery](https://tdn.totvs.com/pages/viewpage.action?pageId=687146952) é o caminho mais direto para ler `SC5`, `SC6` e `SF2` sem desenvolvimento: `api/framework/v1/genericQuery?tables=SC5&fields=...&where=...`, com paginação (`hasNext`, `remainingRecords`). Exige a chave `SECURITY=1` no servidor REST. Quatro comportamentos documentados mudam o número:

1. **Filtro de filial ligado por padrão.** O parâmetro `FilialFilter` "Indica se deve ser feito o filtro da filial ([ALIAS]_FILIAL)", com valor padrão `true`. Uma carga que não trata isso pode trazer só parte das filiais.
2. **Registro apagado fica na tabela.** `DeletedFilter` filtra os "campos deletados de forma lógica (D_E_L_E_T_)", também `true` por padrão. Quem desliga o filtro, ou lê o banco direto, soma pedido apagado.
3. **Campo sem permissão some em silêncio.** "Caso o usuário que consuma a API não tenha acesso a algum campo, esses campos não são retornados", e a lista aparece em `protectedDataFields` ou `nivelFields`. A carga não dá erro: a coluna chega vazia. Se a instalação marca CPF e e-mail como dado protegido, são eles que somem; confira a lista na própria resposta.
4. **Join sem filtro explode.** Com mais de um alias e sem `FromQry`, a TDN alerta para "JOIN sem WHERE ou ON, gerando uma quantidade de registros muito gande" (sic).

## O que depende da customização de cada cliente?

Quase tudo o que importa para o relatório. A documentação dá três pistas de onde olhar.

**Campo criado pelo cliente.** No dicionário `SX3`, o atributo `X3_PROPRI` "Quando preenchido com U indica campo customizado" ([SX3](https://tdn.totvs.com/pages/viewpage.action?pageId=22479565), modificada em 07/07/2023). Quando a operação registra canal de venda, cupom ou marketplace num campo que o padrão não tem, ele é um desses, com nome e significado que só a equipe do cliente sabe. Nenhuma doc da TOTVS vai descrever esse campo.

**Regra executada na gravação.** Pontos de entrada como o [M410STTS](https://tdn.totvs.com/pages/viewpage.action?pageId=6784155), "Executado após todas as alterações no arquivo de pedidos terem sido feitas", permitem ao cliente alterar o pedido depois da gravação padrão. Dois clientes com o mesmo Protheus podem gravar o mesmo pedido de formas diferentes.

**Tamanho do campo.** A [FAT0308](https://tdn.totvs.com/pages/viewpage.action?pageId=696684804) avisa que campo de texto vem com o tamanho do dicionário, completado com espaços. O exemplo da própria página é "Campo B1_COD → Tamanho 30" com o código "WFRS-12", que volta com espaços à direita até completar o tamanho; o tamanho de cada campo é o do dicionário da sua instalação. Join com o SKU da loja virtual sem `trim` não casa nada.

E há a parte que não é dado: o endereço, a porta, as APIs publicadas com `PUBLISH MODEL REST` e as permissões do usuário de integração são decisões da instalação. Antes de estimar prazo, peça ao cliente a lista do que já está publicado.

## Como diagnosticar na sua integração?

Rode estas checagens num mês fechado, contra o relatório de faturamento do próprio Protheus:

| Verificação | Onde olhar | O que indica divergência |
|---|---|---|
| Filiais | contagem por `C5_FILIAL` | Filial faltando por `FilialFilter` |
| Pedido sem nota | `C5_NOTA` vazio no mês | Pedido incluído contado como venda |
| Cancelado e devolvido | `C5_STATUS` 90 e 91 | Receita bruta tratada como líquida |
| Preço | `C6_PRCVEN` × `C6_PRUNIT` | Soma pelo preço de tabela |
| Campos ocultos | `protectedDataFields`, `nivelFields` | Coluna vazia por permissão |
| Chave com a loja | `C5_PEDECOM` com e sem `trim` | Venda do site que não casa com o ERP |
| Campos do cliente | `X3_PROPRI = 'U'` em `SC5` e `SC6` | Regra de negócio fora da doc |

Se a loja também é carregada pela API da plataforma, o `C5_PEDECOM` é a ponte. Sem ele preenchido, a mesma venda entra duas vezes, o problema de [deduplicar venda entre site e marketplace](https://precisian.io/blog/pt-BR/posts/deduplicar-venda-site-marketplace/).

## Como corrigir?

Escreva a definição antes da query. "Venda do Protheus" pode ser pedido incluído, pedido liberado, nota emitida ou nota emitida menos devolução. Todas são defensáveis; o erro é cada relatório escolher uma sem dizer qual. Uma definição escrita, versionada e consultada sempre do mesmo jeito é o que chamamos de camada semântica, e é o motivo de [marketing e financeiro não fecharem o mesmo número](https://precisian.io/blog/pt-BR/posts/mesma-definicao-de-receita/).

Na extração, regras tiradas da própria TDN:

1. **Leia a nota para receita e o pedido para intenção.** `SF2` responde o que foi faturado; `SC5` e `SC6`, o que foi vendido. Não misture no mesmo número.
2. **Declare a filial.** Passe `FilialFilter` de forma explícita ou rode uma carga por filial, e confira a contagem.
3. **Peça um usuário de integração com nível de campo conhecido** e grave `protectedDataFields` e `nivelFields` de cada resposta. Coluna vazia sem esse registro é indistinguível de dado ausente.
4. **Faça `trim` em toda chave de texto** antes do join.
5. **Renove pelo refresh token** antes das 24 horas ([TDN](https://tdn.totvs.com/pages/viewpage.action?pageId=465383509)), ou a carga volta a depender de usuário e senha.
6. **Mapeie os campos `U`** com quem administra o Protheus, por escrito, com o significado de cada um.

Quem já passou pelo [Bling](https://precisian.io/blog/pt-BR/posts/api-do-bling-dados-de-venda/) ou pela [VTEX](https://precisian.io/blog/pt-BR/posts/api-da-vtex-dados-de-pedido/) vai reconhecer a regra 1. A diferença é que, lá, o formato é o mesmo para todos os lojistas.

## Quando isso não tem conserto?

**Origem da venda.** O `C5_ORIGEM` aparece na TDN só como "Origem do Pedido", sem lista de valores. Nenhum campo documentado na `SC5` liga o pedido a anúncio, clique ou campanha. Se o e-commerce não grava isso num campo customizado, o ERP não tem a informação.

**Campo customizado sem dono.** Se ninguém na operação sabe o que um campo `U` significa, a documentação não resolve. A resposta está no fonte do cliente ou na consultoria que o implantou.

**API de pedido pronta e padrão.** Até 23/11/2026, não encontrei na TDN uma API de Faturamento, além das listadas na [FAT0321](https://tdn.totvs.com/pages/viewpage.action?pageId=894394585), que devolva o pedido de venda completo para qualquer Protheus. A busca da TDN lista páginas com os títulos "Servidor MCP" e "DT Tool MCP - SalesOrderList.get", mas as duas respondem que "ainda não tem uma versão publicada disponível". Sem leitura, sem afirmação sobre o que fazem.

Quando a Precisian não é a resposta: se o Protheus é a única fonte e o relatório do próprio ERP já fecha com o financeiro, uma plataforma de dados é custo sem problema para resolver. A questão aparece quando o Protheus precisa conversar com a loja virtual, o marketplace e a mídia. A Precisian tem conector pronto para VTEX e Magento, não para TOTVS. Conectamos qualquer fonte que tenha API aberta.

## O que este artigo não cobre?

**Não cobre RM, Datasul nem Winthor**, que são outras linhas da TOTVS, com outras APIs. **Não cobre a mensagem padronizada do EAI** (`SalesOrder`, `Invoice`), que tem documentação própria de integração por mensagem. **Não traz o OpenAPI do api.totvs.com.br**, que respondeu 503 em 23/11/2026; quando ele responder, a lista de APIs da sua versão vale mais que este texto e que a [FAT0321](https://tdn.totvs.com/pages/viewpage.action?pageId=894394585).

Registro de método: as páginas foram lidas com `curl` na TDN. Uma página nova da API de varejo, "Documentação da API de consulta de pedidos de venda do varejo: RetailSalesOrders", aparece na busca com rótulos das versões 12.1.2610 e 12.1.2710, mas também sem versão publicada. Usei a de 2019.

Se o faturamento que a integração soma não fecha com o relatório do Protheus, comece contando, por filial, quantos pedidos do mês têm `C5_NOTA` vazio. [Veja a pergunta deste post respondida sobre um lake de verdade](https://precisian.io/demonstracao?utm_source=blog&utm_medium=cta&utm_campaign=api-do-totvs-dados-de-venda&utm_content=texto), sem compromisso de contrato.
