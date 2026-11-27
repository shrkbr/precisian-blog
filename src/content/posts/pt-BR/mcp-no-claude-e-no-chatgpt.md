---
title: "MCP no Claude e no ChatGPT: como conectar os dados da empresa (e o que não conectar)"
description: "No Claude, MCP entra como conector personalizado em todo plano. No ChatGPT, com escrita, só no Business e no Enterprise. O difícil é escolher o servidor."
slug: "mcp-no-claude-e-no-chatgpt"
lang: "pt-BR"
translationKey: "mcp-no-claude-e-no-chatgpt"
publishedAt: 2026-11-16
tags: ["mcp", "dados-para-ia", "governanca", "seguranca", "camada-semantica", "alucinacao-de-metrica"]
draft: false
llmSummary: "Em 16/11/2026, a Anthropic libera conector MCP personalizado em todos os planos do Claude (um só no Free); a OpenAI libera MCP completo, com escrita, só no ChatGPT Business e Enterprise/Edu, e o Pro conecta com leitura. A spec do MCP trata anotação de ferramenta como não confiável."
citations: ["https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp", "https://support.claude.com/en/articles/10949351-getting-started-with-local-mcp-servers-on-claude-desktop", "https://code.claude.com/docs/en/mcp", "https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt", "https://modelcontextprotocol.io/specification/2025-11-25/server/tools", "https://docs.cloud.google.com/bigquery/docs/reference/mcp"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://en.wikipedia.org/wiki/Claude_(language_model)", "https://en.wikipedia.org/wiki/ChatGPT", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
cta: demo
---
No Claude, um servidor MCP entra como conector personalizado em todos os planos (Free, Pro, Max, Ultra, Team e Enterprise), com limite de um conector no Free, segundo a [Central de Ajuda da Anthropic](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp) consultada em 16/11/2026. No ChatGPT, a conexão completa a servidor MCP próprio, com escrita, existe só nos planos Business e Enterprise/Edu, na web; o Pro conecta com leitura ([OpenAI](https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt)). Ligar leva minutos. A decisão que importa é qual servidor plugar.

> **Servidores MCP num cliente de IA** são serviços que implementam o Model Context Protocol e oferecem ferramentas ao Claude ou ao ChatGPT. O cliente lista essas ferramentas, o modelo decide qual chamar e com que parâmetros, e o resultado volta para a conversa. O que cada ferramenta faz, e com que permissão, é definido por quem escreveu o servidor.

## Onde se adiciona um servidor MCP no Claude?

Em três lugares, e cada um tem uma regra de rede diferente.

**No claude.ai e no Claude Desktop, como conector personalizado.** Nos planos individuais, o caminho documentado é **Customize > Connectors**, "+ Add", "Add custom connector": você dá um nome, cola a URL do servidor remoto e escolhe a autenticação ("Sign in now", "Sign in when needed" ou "No sign in"). Nos planos Team e Enterprise, só Owners e Primary Owners adicionam o conector em **Organization settings > Connectors**; depois disso, cada pessoa conecta com a própria conta ([Anthropic](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp)).

O conector remoto é chamado a partir da nuvem da Anthropic, não do seu computador. A mesma página avisa que o servidor precisa estar acessível pela internet pública, na porta 443, e que servidor atrás de VPN ou de firewall corporativo não conecta, mesmo que abra no seu navegador. A saída documentada é liberar no firewall as faixas de IP da Anthropic.

**No Claude Desktop, como servidor local.** O servidor roda na sua máquina, instalado como extensão de desktop (arquivo `.mcpb`) ou configurado no `claude_desktop_config.json` ([Anthropic](https://support.claude.com/en/articles/10949351-getting-started-with-local-mcp-servers-on-claude-desktop)). Esse usa a sua rede, mas não aparece no claude.ai.

**No Claude Code, por linha de comando.** O comando documentado para servidor remoto é `claude mcp add --transport http <nome> <url>`, e a configuração compartilhada com o time vai num `.mcp.json` na raiz do projeto, com `--scope project` ([Claude Code Docs](https://code.claude.com/docs/en/mcp)).

## Onde se adiciona um servidor MCP no ChatGPT?

Em **Plugins**, no botão de mais, "Add custom MCP server". Você informa nome, a URL HTTPS pública do servidor (ou um Secure MCP Tunnel), a autenticação, e marca "I understand and want to continue" no aviso de risco. Segundo a OpenAI, nesse fluxo não é mais preciso ligar o modo desenvolvedor antes ([OpenAI](https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt)).

A diferença entre os planos está em quem pode fazer isso. A tabela resume a documentação das duas empresas, lida em 16/11/2026:

| Plano | Conectar servidor MCP próprio | Escrita pelo servidor | Quem adiciona |
|---|---|---|---|
| Claude Free | Sim, um conector | Conforme o servidor | A própria pessoa |
| Claude Pro, Max, Ultra | Sim | Conforme o servidor | A própria pessoa |
| Claude Team e Enterprise | Sim | Conforme o servidor | Owner adiciona; cada pessoa conecta |
| ChatGPT Pro | Sim, com leitura e busca | Não | A própria pessoa |
| ChatGPT Business | Sim | Sim, com confirmação | Só admins e owners criam e publicam |
| ChatGPT Enterprise/Edu | Sim | Sim, com controle por ação | Admins e quem recebe a permissão "Create plugins with MCPs" por RBAC |

Fontes: [Anthropic](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp) e [OpenAI](https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt). A página da OpenAI não menciona o plano Plus.

Três regras do ChatGPT pesam na operação. Conexão a servidor MCP próprio é só na web; no celular, não. O ChatGPT não conecta direto a servidor local, e indica o Secure MCP Tunnel para servidor em rede privada. E depois que o admin aprova um servidor, o workspace usa uma "frozen snapshot" das ferramentas: mudança feita depois pelo desenvolvedor só vale quando o admin revisa e publica de novo, e ferramenta alterada de forma incompatível passa a dar erro sem aviso ao admin. Quando a empresa quer concentrar autenticação, registro e limite de chamadas de vários servidores num ponto só, o assunto é [gateway MCP](https://precisian.io/blog/pt-BR/posts/gateway-mcp/).

## Por que a mesma pergunta devolve receitas diferentes?

Porque o servidor que você plugou entrega tabela, e o modelo escreve a definição de receita a cada conversa.

O caso mais comum hoje é ligar o data warehouse. O servidor MCP remoto do BigQuery, por exemplo, expõe `execute_sql_readonly` e `execute_sql` ([Google Cloud](https://docs.cloud.google.com/bigquery/docs/reference/mcp), lido em 16/11/2026). Com SQL livre, o agente lê o esquema, decide que coluna é receita, decide se tira cancelado, frete e desconto, e responde com a segurança de quem conferiu.

Um exemplo com números redondos, sintético, para mostrar a forma do problema. A pergunta é sempre "quanto vendemos em outubro?", em três conversas novas:

| Conversa | O que o agente somou | Resposta |
|---|---|---|
| 1 | Valor total do pedido, com frete, todos os status | R$ 1.240.000 |
| 2 | Valor total do pedido, sem cancelados | R$ 1.130.000 |
| 3 | Valor dos itens, sem frete e sem cancelados | R$ 1.020.000 |

As três consultas estão certas como SQL. A diferença entre a primeira e a terceira é de R$ 220 mil, e nenhuma resposta diz qual régua usou se você não perguntar. É o que chamamos de [alucinação de métrica](https://precisian.io/blog/pt-BR/posts/alucinacao-de-metrica/): o número é calculado sobre dado real, e a definição foi inventada na hora.

## O que o cliente de IA faz com as ferramentas do servidor?

Ele lista, o modelo escolhe, o cliente executa. Não há etapa em que alguém confere se "receita" significa a mesma coisa que significou ontem.

A especificação do protocolo descreve as ferramentas com nome, descrição, `inputSchema` e, opcionalmente, `annotations` ([Model Context Protocol, spec 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/server/tools)). Uma dessas anotações é `readOnlyHint`, que indica que a ferramenta não modifica o ambiente. A mesma spec manda o cliente tratar anotações como não confiáveis, a menos que venham de servidor confiável, e recomenda que sempre haja uma pessoa com poder de negar a chamada. Quem garante o "só leitura" é o autor do servidor; o protocolo não verifica.

Quando você liga vários servidores, o cliente junta as ferramentas de todos num registro só. O protocolo não reconcilia o significado dos números que cada um devolve, e é por isso que [ligar Google Ads, Meta e GA4 no mesmo Claude](https://precisian.io/blog/pt-BR/posts/google-ads-meta-e-ga4-no-mesmo-claude/) produz uma soma de ROAS maior que o faturamento. A diferença entre o MCP e uma API comum, e quem decide a chamada em cada um, está em [o que é MCP](https://precisian.io/blog/pt-BR/posts/o-que-e-mcp/).

## Como avaliar um servidor antes de plugar?

Abra a lista de ferramentas antes de abrir a conversa. As duas empresas mostram as ferramentas descobertas na hora de conectar, e é ali que a avaliação acontece.

| Verificação | Onde olhar | Sinal de alerta |
|---|---|---|
| Que tipo de ferramenta o servidor expõe | Lista de ferramentas na tela de conexão | SQL livre ou "consultar tabela" sem métrica nomeada |
| Quem é a credencial | Tela de autenticação | Chave de API compartilhada: no Claude Team e Enterprise, todo mundo que usa o conector entra com o acesso daquela chave ([Anthropic](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp)) |
| Se o servidor escreve | Nome e descrição de cada ferramenta | Criar, atualizar, apagar, ativar. Não confie só em `readOnlyHint` |
| Se há dado pessoal | Esquema das tabelas que a ferramenta alcança | E-mail, CPF, telefone e endereço acessíveis a qualquer pergunta |
| Se a resposta é estável | Mesma pergunta em três conversas novas | Números diferentes para a mesma pergunta |
| Quem mantém o servidor | Domínio da URL e repositório | Servidor de comunidade, sem dono identificável |

O último teste da tabela custa três perguntas. Se três conversas novas devolvem três receitas, o servidor não está pronto para ninguém da diretoria perguntar nada a ele.

## O que não conectar?

Cinco casos em que eu não ligaria o servidor, ou ligaria só com a configuração mudada:

1. **Banco de produção com credencial de escrita.** O agente lê texto que outras pessoas escreveram, e um campo com instrução embutida vira [injeção de prompt](https://precisian.io/blog/pt-BR/posts/injecao-de-prompt-em-dado-de-marketing/). Crie um usuário só de leitura, em réplica.
2. **Conta de mídia conectada pelo login de quem aprova orçamento.** O limite do agente passa a ser o limite daquela pessoa. O escopo do token é a superfície de risco, como mostrei em [segurança de servidor MCP](https://precisian.io/blog/pt-BR/posts/seguranca-de-servidor-mcp/).
3. **Tabela com dado pessoal de cliente sem necessidade de negócio.** Para a pergunta "qual coorte recompra mais", o agente não precisa do CPF. O caminho está em [agente de IA e dado pessoal do cliente](https://precisian.io/blog/pt-BR/posts/agente-de-ia-e-dado-pessoal-do-cliente/).
4. **Servidor que ninguém da empresa revisou.** A Anthropic avisa que conector personalizado liga o Claude a serviços que ela não verificou, e a OpenAI põe a responsabilidade de verificar o servidor em quem publica.
5. **Tabela crua respondendo pergunta de diretoria.** Esse é o caso do exemplo de outubro. Serve para análise exploratória por quem sabe ler SQL; não serve para "quanto vendemos".

## Qual servidor plugar, então?

Um que exponha métricas já definidas, não tabelas. A ferramenta certa para a pergunta "quanto vendemos" chama "receita líquida faturada", tem a definição versionada, e devolve o mesmo número nas três conversas porque nenhuma delas escreveu a conta.

Essa definição mora numa [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/): a regra de receita, de cancelamento, de frete e de canal escrita uma vez, auditável, e servida ao agente pelo MCP. O modelo continua livre para cruzar, filtrar e explicar. O que ele deixa de fazer é decidir o que a empresa chama de venda.

É o trabalho que a Precisian faz. O dado de mídia, analytics, plataforma de e-commerce e ERP entra num data lake isolado por cliente, na infraestrutura da Precisian, com a camada semântica por cima e o acesso pelo MCP da Precisian, pela API ou pelo BI. A Precisian entrega o dado pronto para ser perguntado, e quem pergunta é o Claude ou o ChatGPT que o cliente já usa. Os servidores oficiais de cada plataforma continuam úteis para o que fazem bem: operar a conta de onde vieram.

## Quando isso não tem conserto?

Em quatro situações, e vale saber antes de prometer à diretoria.

**Plano sem escrita.** No ChatGPT Pro, o servidor próprio conecta só com leitura e busca, pela [documentação da OpenAI](https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt) lida em 16/11/2026. Se o caso de uso exige que o agente crie ou altere algo, o plano tem que ser Business ou Enterprise/Edu.

**Servidor que não pode sair da rede privada.** O conector remoto do Claude parte da nuvem da Anthropic, então servidor interno exige liberar as faixas de IP dela no firewall; se a política de segurança não permite, sobra o servidor local no Claude Desktop, que não chega ao claude.ai. No ChatGPT, a saída é o Secure MCP Tunnel.

**Pergunta que a camada semântica ainda não define.** Métrica nova precisa ser escrita antes de ser servida. Enquanto não está, a resposta honesta do agente é "não está definida", e isso frustra quem esperava resposta para tudo.

**Dado que nenhum sistema registrou.** Venda fechada no WhatsApp sem pedido lançado, ou desconto dado no balcão, não aparece em servidor nenhum.

E há o caso em que a Precisian é a escolha errada: se o que o time quer é operar uma ferramenta pelo chat (abrir tarefa, responder ticket, criar campanha pausada), o conector oficial daquela ferramenta resolve, e uma camada semântica não acrescenta nada. Se a ação passa por um workflow, o n8n deixa o Claude ou o ChatGPT rodar esse workflow como ferramenta, como mostra [MCP do n8n](https://precisian.io/blog/pt-BR/posts/mcp-do-n8n/).

## O que este artigo não cobre

Não ensina a construir um servidor MCP: a documentação da [Anthropic](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp) e da [OpenAI](https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt) aponta para os guias de desenvolvedor.

Não afirma preço de plano nem disponibilidade de cada recurso no Brasil. A OpenAI responde "No" à pergunta sobre restrição geográfica na página citada; a Anthropic não trata do assunto nela. Os nomes de menu mudam com frequência, e conferi os textos em 16/11/2026.

Não compara a qualidade dos modelos. A diferença discutida aqui está no servidor, que vale igual para os dois clientes.

---

Se o time já pergunta ao Claude ou ao ChatGPT quanto a loja vendeu, o primeiro passo é repetir a mesma pergunta em três conversas novas e anotar se o número muda. [Veja um MCP governado respondendo](https://precisian.io/demonstracao?utm_source=blog&utm_medium=cta&utm_campaign=mcp-no-claude-e-no-chatgpt&utm_content=texto) sobre um lake isolado, sem compromisso de contrato.
