---
title: "MCP do RD Station: o que a IA consegue ler do CRM e do Marketing"
description: "O MCP do RD Station tem um servidor por produto. A receita que o agente lê no CRM é a negociação marcada como ganha, não a venda faturada."
slug: "mcp-do-rd-station"
lang: "pt-BR"
translationKey: "mcp-do-rd-station"
publishedAt: 2026-11-16
tags: ["mcp", "governanca", "lgpd", "dados-para-ia", "divergencia-de-dados", "camada-semantica", "integracao", "ecommerce"]
draft: false
llmSummary: "A RD Station oferece um servidor MCP por produto (Marketing, CRM e Conversas), com OAuth, gerado no Catálogo MCP. No CRM, a receita que o agente lê é o total_price das negociações com status won, não a venda faturada no ERP. Documentação conferida em 16/11/2026."
citations: ["https://www.rdstation.com/inteligencia-artificial/mcp/", "https://mcp.rdstationmentor.com/", "https://developers.rdstation.com/reference/mcp", "https://developers.rdstation.com/reference/crm-v2-get-deal", "https://developers.rdstation.com/reference/crm-v2-list-deals", "https://developers.rdstation.com/reference/get_platform-analytics-funnel", "https://developers.rdstation.com/reference/evento-marcacao-oportunidade-ganha", "https://developers.rdstation.com/reference/evento-de-pedido-pago", "https://developers.rdstation.com/reference/get_platform-contacts-identifier-value-1", "https://developers.rdstation.com/reference/bases-legais-rdstation-marketing", "https://developers.rdstation.com/reference/crm-v2-legal-bases", "https://www.rdstation.com/blog/vendas/mcp-crm-vendas/"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 9
cta: demo
---
O MCP do RD Station é um conjunto de três servidores: a RD Station oferece um conector MCP para cada produto (RD Marketing, RD Vendas, que é o CRM, e RD Atendimento, que é o Conversas), gerado no [Catálogo MCP da RD Station](https://mcp.rdstationmentor.com/) e autenticado por OAuth com o login do usuário. O catálogo, conferido em 16/11/2026, diz que "cada produto do RD Station tem um servidor MCP próprio". No CRM, a receita que o agente lê é o valor das negociações marcadas como ganhas, que não é a venda faturada no ERP.

> **MCP do RD Station**: conjunto de servidores Model Context Protocol mantidos pela RD Station, um por produto, que expõem a um cliente de IA (Claude, ChatGPT, Cursor e outros) os contatos, campanhas, negociações, tarefas e atendimentos da conta, pelas APIs oficiais e dentro das permissões do usuário que gerou a conexão.

## Quais servidores MCP a RD Station oferece?

São quatro, e só três são da conta. A página do produto lista as capacidades por área ([RD Station, MCP](https://www.rdstation.com/inteligencia-artificial/mcp/)), e o catálogo detalha os "recursos principais" e o plano exigido de cada conector ([Catálogo MCP](https://mcp.rdstationmentor.com/)). O quarto é um servidor de documentação para desenvolvedores, hospedado em `https://developers.rdstation.com/mcp` ([RD Station Developers](https://developers.rdstation.com/reference/mcp)).

| Servidor | Plano exigido | Recursos declarados pela RD | Escreve na conta? |
|---|---|---|---|
| RD Marketing | Pro e Advanced | leitura de perfis de leads, estatísticas de landing pages, métricas de campanhas de e-mail, análise de funil de vendas | não detalhado por conector; a página do produto cita cadastrar contatos e acionar automações |
| RD Vendas (CRM) | Basic, Pro e Advanced | leitura e edição de oportunidades, gestão de tarefas, consulta de contatos, análise de follow-ups e motivos de perda | sim: mover negociações, criar e atualizar tarefas, com confirmação |
| RD Atendimento (Conversas) | Basic, Pro e Advanced | resumo de conversas ativas, tempo médio de resposta, atribuição de atendentes | não declarado |
| Documentação (developers.rdstation.com/mcp) | não se aplica | busca na documentação e execução de chamadas à API | sim, com o token que você passar |

A RD não publica, fora da conta, o nome das ferramentas de cada conector de produto: o catálogo descreve recursos, não ferramentas. O servidor de documentação é aberto, e a um pedido `tools/list` feito em 16/11/2026 ([endpoint documentado](https://developers.rdstation.com/reference/mcp)) ele devolveu seis ferramentas: `list-specs`, `list-endpoints`, `search-endpoints`, `get-endpoint`, `get-server-variables` e `execute-request`. As cinco primeiras vêm marcadas como só leitura. A `execute-request`, que executa uma chamada à API, vem com `destructiveHint: true`.

O catálogo traz mais três regras. O conector é "isento de outras cobranças por parte da RD Station"; o consumo de tokens é cobrado pela IA conectada, segundo a página do produto. O link de conexão "é exclusivo de cada usuário", então o agente enxerga o que aquela pessoa enxerga. E toda alteração de dado "exige sua confirmação explícita na própria interface de chat".

*As duas páginas oficiais divergem sobre o Gemini em 16/11/2026: a [do produto](https://www.rdstation.com/inteligencia-artificial/mcp/) anuncia "conexão nativa com o Google Gemini", e o FAQ do [catálogo](https://mcp.rdstationmentor.com/) diz que "o Gemini padrão ainda não suporta MCP de forma nativa para integrações externas". Trate o suporte ao Gemini como não confirmado até a RD alinhar as duas.*

## Qual é o sintoma?

O diretor comercial conecta o RD Vendas ao Claude e pergunta "quanto vendemos em outubro". O agente responde rápido, com um número redondo e uma lista de negociações. O financeiro fecha o mês com outro número, menor, e ninguém sabe dizer qual dos dois está errado.

A própria RD sugere perguntas desse tipo. O post que apresenta o MCP do CRM traz como exemplo de prompt: "estime a projeção de fechamento deste mês" com base em "valores em negociação e histórico de conversão" ([RD Station, 23/06/2026](https://www.rdstation.com/blog/vendas/mcp-crm-vendas/)). Para forecast, a fonte serve. O problema começa quando a mesma resposta vira o número de receita da reunião de resultado.

No e-commerce o sintoma tem uma segunda forma: o time de CRM pergunta ao conector do RD Marketing quantas vendas a régua de e-mail gerou, e o número não conversa nem com o GA4 nem com o pedido da VTEX.

## Por que a receita do CRM não é a venda faturada?

Porque o CRM registra a negociação, e a negociação termina quando alguém muda o status dela. A referência da API v2 do RD Station CRM descreve a negociação com estes campos ([RD Station Developers, Obter negociação](https://developers.rdstation.com/reference/crm-v2-get-deal)):

- `status`, com quatro valores possíveis: `won`, `lost`, `ongoing` e `paused`;
- `total_price`, "Valor total da negociação", somente leitura, ao lado de `one_time_price` (valor único) e `recurrence_price` (valor recorrente);
- `closed_at`, "Data de fechamento da negociação".

Nenhum desses campos fala de nota fiscal, pagamento, cancelamento posterior ou devolução. Quando o agente soma o `total_price` das negociações `won` com `closed_at` em outubro, ele entrega o valor que o time comercial combinou e marcou como ganho no mês. Um pedido cancelado depois continua `won`. Um pedido faturado em novembro conta em outubro.

O vínculo com o ERP só existe se alguém o criar. A própria documentação de listagem usa um campo personalizado como exemplo de filtro, `erp_id:123`, na sintaxe `@<custom_field_slug>` ([RD Station Developers, Listar negociações](https://developers.rdstation.com/reference/crm-v2-list-deals)). Se a sua conta não tem esse campo, ou se ele é preenchido à mão, o agente não tem como cruzar a negociação com o pedido.

**No RD Marketing a venda é outra coisa.** O endpoint `GET /platform/analytics/funnel` devolve, por dia, semana ou mês, `visitors_count` ("Total de visitantes (usuários - GA)"), `contacts_count`, `qualified_contacts_count`, `opportunities_count` e `sales_count`, descrito só como "Total de vendas". A mesma página avisa que a API está "disponível somente para plano Advanced" e retorna dados a partir de junho de 2022 ([RD Station Developers, Funil de Vendas](https://developers.rdstation.com/reference/get_platform-analytics-funnel)). A forma documentada de marcar um contato como venda pela API é o evento de oportunidade ganha, com `event_type` igual a `SALE`, `funnel_name` aceitando só `default` e o campo `value` opcional ([RD Station Developers](https://developers.rdstation.com/reference/evento-marcacao-oportunidade-ganha)). Venda, ali, é contato marcado.

Para pedido de loja, o RD Marketing aceita eventos de e-commerce, como `ECOMMERCE_ORDER_PAID`. O evento exige `email` ou `phone` no payload; sem os dois, "o evento é recusado e não chega ao RD Station Marketing" ([RD Station Developers, Pedido Pago](https://developers.rdstation.com/reference/evento-de-pedido-pago)). Pedido cujo comprador não chega identificado fica de fora da base que o agente consulta.

São três réguas, e nenhuma é a do financeiro. O mecanismo é o mesmo de [marketing e financeiro nunca fecharem o mesmo número de receita](https://precisian.io/blog/pt-BR/posts/mesma-definicao-de-receita/): cada sistema conta num momento diferente da vida do pedido.

## Como diagnosticar antes de confiar na resposta?

Peça ao agente, na própria conversa, que diga qual conector e qual campo ele somou. Depois confira as cinco linhas abaixo.

| Verificação | Onde olhar | O que indica problema |
|---|---|---|
| Qual campo virou "receita" | Resposta do agente: `total_price`? `sales_count`? `value`? | Agente não sabe dizer, ou mistura campos de produtos diferentes |
| Negociação ganha × faturado | Soma de `total_price` com `status` `won` e `closed_at` no mês, contra o faturamento líquido do ERP no mesmo mês | Diferença que muda de sinal ou de tamanho a cada mês |
| Vínculo com o pedido | Campo personalizado de ID de pedido ou de ERP na negociação, e a taxa de preenchimento dele | Campo inexistente, ou preenchido em menos da metade das negociações ganhas |
| Pedidos que entraram no Marketing | Eventos de pedido pago recebidos no mês contra pedidos pagos no ERP | Pedido sem e-mail nem telefone não aparece; a diferença é o pedido recusado |
| Quem gerou a conexão | Usuário dono do link no Catálogo MCP | Conexão gerada por administrador: o agente enxerga a base inteira |

Um exemplo com números redondos, sintéticos, sobre os campos da [negociação na API v2](https://developers.rdstation.com/reference/crm-v2-get-deal), para mostrar a ordem de grandeza do problema. Em outubro, o CRM fecha 120 negociações `won` que somam R$ 900 mil de `total_price`. O ERP fatura R$ 780 mil dessas mesmas negociações: R$ 70 mil foram cancelados depois de marcados como ganhos e R$ 50 mil só foram faturados em novembro. O agente responde R$ 900 mil, e está certo sobre o CRM, mas o número não é receita.

## O que o agente vê de dado pessoal, e o que a LGPD tem a ver com isso?

O agente vê o contato inteiro, se a ferramenta devolver o contato inteiro. A consulta de contato do RD Marketing devolve, entre outros, `name`, `email`, `personal_phone`, `mobile_phone`, `birthdate`, `city` e `legal_bases` ([RD Station Developers, Consultar contato](https://developers.rdstation.com/reference/get_platform-contacts-identifier-value-1)). Cruzar Marketing com CRM, que a RD apresenta como um dos usos do MCP, exige uma chave comum entre bases separadas, e o identificador que um lead e um contato do CRM costumam ter em comum é o e-mail ou o telefone.

A página do produto diz que "os dados são enviados quando necessários para responder à solicitação" e que "o tratamento dessas informações também segue as políticas do provedor de IA escolhido" ([RD Station, MCP](https://www.rdstation.com/inteligencia-artificial/mcp/)). Na prática, o dado pessoal sai da RD e entra no contexto de um modelo, que pode rodar fora do Brasil.

A base legal que a RD registra não cobre esse caminho por si. No RD Marketing, o campo `legal_bases` aceita uma única categoria, `communications`, e serve para "contato e envio de comunicação", que a documentação descreve como e-mails e WhatsApp ([RD Station Developers, Bases legais](https://developers.rdstation.com/reference/bases-legais-rdstation-marketing)). O CRM aceita também `data_processing` ([RD Station Developers, CRM](https://developers.rdstation.com/reference/crm-v2-legal-bases)). Saber se o envio do registro a um LLM estrangeiro está coberto é pergunta para o jurídico, e os caminhos estão em [LGPD e IA](https://precisian.io/blog/pt-BR/posts/lgpd-ia-dados-de-cliente/). Para a maior parte das perguntas de análise, o agente nem precisa do nome do cliente, como mostra [contexto do cliente sem dado pessoal](https://precisian.io/blog/pt-BR/posts/agente-de-ia-e-dado-pessoal-do-cliente/).

## Como corrigir?

Separe as perguntas pelo que cada fonte sabe responder.

1. **Pipeline, follow-up, motivo de perda, tarefa atrasada:** o conector do RD Vendas responde bem, porque a pergunta é sobre o CRM. Use.
2. **Quanto vendemos:** não pergunte ao CRM. A receita precisa vir de onde pedido, nota, cancelamento e repasse já foram conciliados, com uma definição escrita.
3. **Ligue a negociação ao pedido.** Crie o campo personalizado com o ID do pedido ou do ERP e faça a integração preenchê-lo. Sem essa chave, nenhuma conciliação por negociação é possível depois.
4. **Escrita só para quem opera.** O conector escreve, com confirmação no chat. Quem só analisa não precisa da conexão gerada por um administrador. O raciocínio de escopo é o mesmo de [segurança de servidor MCP](https://precisian.io/blog/pt-BR/posts/seguranca-de-servidor-mcp/).
5. **Pseudonimize o que vai para análise.** Coorte, segmento e LTV saem de um identificador, sem nome nem telefone no contexto.

O passo 2 é onde entra uma [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/): receita definida uma vez, conciliada com o ERP e servida ao agente pelo mesmo protocolo. Na Precisian, essa camada fica sobre um data lake isolado por cliente, na infraestrutura da Precisian, e a IA que o cliente já usa pergunta a ela pelo MCP da Precisian. O conector da RD continua no mesmo chat, para o que ele faz bem: operar o funil. Como adicionar mais de um servidor no Claude e no ChatGPT está em [MCP no Claude e no ChatGPT](https://precisian.io/blog/pt-BR/posts/mcp-no-claude-e-no-chatgpt/).

## Quando isso não tem conserto?

**Quando a negociação nunca foi ligada ao pedido.** Sem ID comum, a conciliação de meses passados só existe no agregado. Dá para dizer quanto o CRM e o ERP divergiram no mês, não qual negociação explica a diferença.

**Quando o plano não dá acesso.** O conector do RD Marketing exige plano Pro ou Advanced, e o endpoint de funil, Advanced. Em plano abaixo do exigido, o agente não tem essa fonte, e nenhuma configuração muda isso.

**Quando o pedido não tem comprador identificado.** O evento sem e-mail nem telefone é recusado na entrada. O que não entrou não pode ser recuperado pelo MCP depois.

**Quando a Precisian não é a resposta.** Se a sua operação vende por proposta, o CRM é o único registro da venda e não há ERP faturando à parte, o `total_price` das negociações ganhas é a melhor fonte que existe, e o conector da RD basta. O mesmo vale para quem só quer o MCP para gestão comercial: forecast, cadência e motivo de perda não precisam de lake.

## O que este artigo não cobre

Não ensina a gerar a conexão passo a passo: o [Catálogo MCP da RD Station](https://mcp.rdstationmentor.com/) faz isso.

Não lista as ferramentas dos conectores de produto, porque a RD não as publica fora da conta. A lista que mostrei é a do servidor de documentação.

Não é orientação jurídica sobre transferência internacional de dado pessoal.

Não cobre servidores MCP de terceiros para o RD Station, que existem e têm escopo, autenticação e cobrança próprios.

---

Se o agente do seu time já responde "quanto vendemos" lendo o CRM, o primeiro passo é medir, mês a mês, a distância entre as negociações ganhas e o que o ERP faturou. [Veja um MCP governado respondendo](https://precisian.io/demonstracao?utm_source=blog&utm_medium=cta&utm_campaign=mcp-do-rd-station&utm_content=texto) sobre um lake isolado, sem compromisso de contrato.
