---
title: "Agência ou consultoria com um agente de IA para vários clientes: como não misturar os dados"
description: "O vazamento mais provável entre clientes não é ataque: é contexto que sobra na conversa, cache sem chave de cliente e uma credencial que alcança todos."
slug: "agente-de-ia-para-varios-clientes"
lang: "pt-BR"
translationKey: "multi-client-agent"
publishedAt: 2026-10-23
tags: ["agencia", "seguranca-de-dados", "mcp", "dados-para-ia", "lgpd"]
draft: false
llmSummary: "Quem roda um agente de IA para vários clientes vaza dado por três caminhos operacionais: contexto que sobra na conversa, cache sem o cliente na chave e credencial única. Em 2023, um bug no redis-py mostrou dados de pagamento de 1,2% dos assinantes do ChatGPT Plus a outros usuários (OpenAI)."
citations: ["https://openai.com/index/march-20-chatgpt-outage/", "https://developers.google.com/google-ads/api/docs/oauth/access-model", "https://github.com/googleads/google-ads-mcp", "https://genai.owasp.org/llmrisk/llm082025-vector-and-embedding-weaknesses/", "https://platform.claude.com/docs/en/build-with-claude/prompt-caching", "https://claude.com/blog/memory", "https://modelcontextprotocol.io/specification/2025-11-25/basic/security_best_practices", "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm"]
about: ["https://pt.wikipedia.org/wiki/Multilocat%C3%A1rio", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

Uma agência que usa o mesmo agente de IA para vários clientes mistura dados por três caminhos operacionais, e nenhum deles exige atacante: o contexto de um cliente que sobra na conversa do outro, um cache que guarda resposta sem o cliente na chave, e uma credencial única que alcança todas as contas. Em março de 2023, um cache compartilhado expôs dados de pagamento de 1,2% dos assinantes do ChatGPT Plus a outros usuários ([OpenAI](https://openai.com/index/march-20-chatgpt-outage/)).

A arquitetura de dados isolada por cliente resolve uma parte, e eu já escrevi sobre ela em [isolar dados por cliente num servidor MCP](https://precisian.io/blog/pt-BR/posts/isolamento-por-cliente-mcp/). Este texto trata do resto: a operação de quem atende dez marcas com um agente só.

> **Agente multicliente**: um agente de IA, com as mesmas ferramentas, memória e credenciais, que trabalha para mais de um cliente. O isolamento entre eles depende de cada um desses três componentes, não só de onde o dado mora.

## Como o problema aparece no dia a dia de uma agência?

Quase nunca como incidente. Aparece como um detalhe estranho numa resposta.

O analista pede ao assistente o resumo de mídia da loja de cosméticos e recebe um parágrafo que cita "a campanha de Dia dos Pais", que é da loja de ferramentas atendida na mesma manhã. Ou o agente sugere uma faixa de CPA "com base no histórico", e o histórico é de outro cliente. Ou o relatório automático de segunda-feira sai com o logo certo e um número que ninguém reconhece.

Ninguém chama isso de vazamento, porque nada saiu da agência. Mas o dado de um controlador entrou no trabalho feito para outro, e se o cliente for concorrente do primeiro, a agência entregou inteligência comercial de um para o outro sem perceber.

O alerta deve disparar com qualquer resposta que mencione algo ausente dos dados daquele cliente. Se o agente "lembrou" de um fato, a pergunta certa é de onde.

## Por que isso acontece, mecanicamente?

Porque o agente carrega estado, e cada pedaço de estado tem uma fronteira própria. Se a fronteira for a agência e não o cliente, os clientes se misturam dentro dela.

**Contexto e memória.** A janela de contexto de uma conversa contém tudo o que foi lido nela. Trocar de cliente no meio da mesma conversa significa que os dados do primeiro continuam lá, disponíveis para o modelo usar ao responder sobre o segundo. A memória persistente estende isso entre conversas. A Anthropic, por exemplo, cria *"uma memória separada para cada projeto"* no Claude ([Anthropic, 11/09/2025](https://claude.com/blog/memory)), o que só ajuda se a agência criar um projeto por cliente. Um projeto chamado "Clientes" junta tudo na mesma memória.

**Cache e estado compartilhado.** O incidente da OpenAI é o exemplo mais bem documentado: um bug na biblioteca redis-py fez o cache devolver a um usuário dados que pertenciam a outro, incluindo títulos de conversas alheias, numa janela de nove horas em 20/03/2023 ([OpenAI](https://openai.com/index/march-20-chatgpt-outage/)). Nenhuma agência roda a escala da OpenAI, mas muitas rodam um cache próprio entre o agente e as APIs, para não pagar a mesma consulta duas vezes. Se a chave do cache for a pergunta ("receita da semana passada") e não a dupla cliente e pergunta, o segundo cliente recebe a resposta do primeiro.

O mesmo vale para busca vetorial. A OWASP lista como risco, na edição 2025 do Top 10 para aplicações com LLM, o vazamento entre contextos *"em ambientes multilocatário em que várias classes de usuários ou aplicações compartilham o mesmo banco vetorial"*, e recomenda particionamento lógico e de acesso dos conjuntos de dados ([OWASP LLM08:2025](https://genai.owasp.org/llmrisk/llm082025-vector-and-embedding-weaknesses/)). A pasta de briefings de todos os clientes indexada num único índice é exatamente esse caso.

**Credencial única.** É o caminho mais comum nas agências de mídia brasileiras. No Google Ads, a documentação afirma que o usuário de uma conta de administrador ganha acesso às contas de anunciante *"porque a conta de administrador tem acesso a todas as contas vinculadas abaixo dela"* ([Google Ads API](https://developers.google.com/google-ads/api/docs/oauth/access-model)). O servidor MCP oficial do Google Ads aceita a conta de administrador como padrão e permite informar o `login_customer_id` **a cada chamada de ferramenta** ([googleads/google-ads-mcp](https://github.com/googleads/google-ads-mcp)).

Junte as duas coisas: um agente conectado com o token da MCC da agência alcança todos os clientes, e qual cliente ele consulta depende de um parâmetro que o modelo preenche a partir da conversa. Se a conversa tiver dois clientes, o modelo pode preencher o errado. Nenhuma peça dessa cadeia tem defeito; cada uma funciona como foi desenhada.

## Como diagnosticar isso na sua operação?

Com uma auditoria de uma tarde, sem ferramenta nova. A tabela abaixo lista as verificações em ordem de probabilidade.

| Verificação | Onde olhar | O que indica mistura |
|---|---|---|
| Conversas com mais de um cliente | histórico do assistente dos analistas | qualquer conversa que cite duas marcas |
| Projetos ou espaços por cliente | configuração do assistente | um projeto genérico para "clientes" ou nenhum |
| Credencial do conector | configuração de cada servidor MCP | token de MCC, Business Manager ou usuário administrador |
| Escolha da conta | parâmetros das ferramentas | ID de cliente como argumento livre da chamada |
| Chave do cache | código da integração | chave sem identificador do cliente |
| Índice vetorial | base de documentos do agente | um índice só para todos os clientes |
| Log | registro de chamadas | log que não diz qual cliente foi consultado |

Duas verificações merecem teste ativo, não só leitura de configuração.

**Teste de travessia.** Abra uma conversa nova do cliente A e peça um número do cliente B pelo nome. Se o agente responder com dado, a fronteira não existe na credencial. Se recusar por instrução do prompt, a fronteira existe só no prompt, o que dá no mesmo diante de uma instrução contrária.

**Teste de memória.** Em uma conversa do cliente A, pergunte "o que você sabe sobre os meus outros clientes?". A resposta mostra o que a memória carrega além daquele projeto.

## Como corrigir?

Em ordem de quanto cada correção reduz o alcance do erro.

**1. Uma credencial por cliente.** Em vez do token da MCC, um usuário ou conta de serviço com acesso só à conta daquele cliente, no nível mais baixo que resolve a tarefa. O raciocínio é o mesmo de [dar acesso de dados para a agência sem entregar tudo](https://precisian.io/blog/pt-BR/posts/acesso-de-dados-para-agencia/), aplicado na direção contrária: agora é a agência que restringe o próprio agente. Com uma credencial por cliente, o modelo pode errar o parâmetro à vontade; a API devolve erro de permissão, não dado alheio.

**2. Uma instância de conector por cliente.** Configurar o servidor MCP uma vez por cliente, cada uma com a credencial dele, e carregar no projeto do cliente só a instância dele. O agente do cliente A não enxerga a ferramenta do cliente B, então não tem como chamá-la. Os cuidados com escopo e somente leitura estão em [segurança de servidor MCP](https://precisian.io/blog/pt-BR/posts/seguranca-de-servidor-mcp/).

**3. Um projeto por cliente, e uma conversa por tarefa.** Trocar de cliente é abrir conversa nova no projeto certo. Parece burocracia até o dia em que um relatório sai com o número do vizinho.

**4. O cliente na chave de tudo o que guarda estado.** Cache, fila, índice vetorial e log levam o identificador do cliente na chave, vindo da credencial e não da pergunta. A especificação do MCP recomenda o mesmo para sessões: combinar o ID da sessão com o do usuário autorizado, num formato como `<user_id>:<session_id>` ([MCP, revisão 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/basic/security_best_practices)).

**5. Log que responde "quem leu o quê de qual cliente".** Sem ele, a agência não consegue provar a um cliente que o dado dele não entrou no trabalho de outro. Como montar essa trilha está em [trilha de auditoria de resposta de IA](https://precisian.io/blog/pt-BR/posts/trilha-de-auditoria-de-resposta-de-ia/).

No Brasil, há um motivo jurídico para levar isso a sério além do comercial. A LGPD determina que o operador *"deverá realizar o tratamento segundo as instruções fornecidas pelo controlador"* (art. 39) e que os agentes de tratamento adotem medidas de segurança contra *"qualquer forma de tratamento inadequado ou ilícito"* (art. 46) ([Lei 13.709/2018](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)). A agência é operadora de cada cliente separadamente, e nenhum deles instruiu que seu dado alimentasse o trabalho do outro. Como isso se aplica ao seu contrato é pergunta para o seu jurídico, não para este texto.

## Quando isso **não** tem conserto?

Em quatro situações, e vale saber quais são antes de prometer isolamento a um cliente.

**Quando o isolamento do fornecedor do modelo para na sua organização.** A Anthropic isola o cache de prompt entre organizações e, na API do Claude, também por *workspace*; no Bedrock e no Google Cloud, só por organização ([Anthropic](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)). Do ponto de vista do fornecedor, todos os seus clientes são você. Separar workspace por cliente é possível na API, mas a garantia do fornecedor é contra outras empresas, não entre os clientes da mesma agência.

**Quando o próprio analista é o canal.** A pessoa que atende o cliente A de manhã e o B à tarde leva contexto na cabeça e no texto que cola no prompt. Nenhuma configuração impede alguém de colar a planilha errada. Dá para reduzir com projetos separados e revisão, não para zerar.

**Quando os dados de todos os clientes estão na mesma base com o mesmo papel de acesso.** Aí o problema é de arquitetura, e as correções acima apenas escondem que existe uma chave mestra. É o caso descrito em [isolamento por cliente](https://precisian.io/blog/pt-BR/posts/isolamento-por-cliente-mcp/).

**Quando a plataforma de mídia não oferece acesso por conta com granularidade suficiente.** Algumas operações exigem o acesso de administrador para tarefas específicas. Nesses casos, separar o agente de leitura (credencial restrita) do trabalho operacional (credencial ampla, sem agente) é a saída possível.

É nesse terceiro ponto que a Precisian entra, e só nele. A Precisian mantém um data lake isolado por cliente, na infraestrutura da Precisian, com a camada semântica por cima e acesso por MCP, API e BI. Um consultor que atende cinco clientes conecta o agente a cinco lakes separados, então a fronteira entre clientes existe antes de o agente fazer qualquer pergunta. O que a Precisian **não** resolve: a conversa, a memória e o cache do agente do consultor, que rodam na IA dele. A disciplina das seções anteriores continua sendo dele.

## O que este artigo não cobre?

Não traz estatística de vazamento entre clientes em agências. Não encontrei fonte primária que meça isso, e o incidente citado é de um fornecedor de modelo, não de uma agência.

Não descreve os níveis de acesso do Meta Business Manager. As páginas de ajuda dele não devolveram conteúdo legível nas tentativas que fiz, e não vou descrever de memória.

Não compara assistentes de IA quanto a memória e projetos. Citei o recurso que consegui ler na fonte do fabricante; os outros mudam com frequência.

E não substitui o contrato. O que o acordo com cada cliente deve dizer sobre uso de IA é decisão do jurídico da agência.

---

Se o seu agente roda com o token da MCC e você não sabe qual cliente ele consultou ontem, o primeiro passo é medir quantas credenciais e quantos projetos ele realmente usa. [Vale uma conversa sobre o seu caso](https://calendar.notion.so/meet/rodrigomartucci/precisian-io), sem compromisso de contrato, mas sem promessa de resposta em 30 minutos também.
