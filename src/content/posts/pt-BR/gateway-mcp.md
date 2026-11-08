---
title: "Gateway MCP: o que é e quando a empresa precisa de um"
description: "O gateway MCP centraliza autenticação, log e limite de chamadas dos agentes. Ele não decide o que a métrica significa: isso fica na camada semântica."
slug: "gateway-mcp"
lang: "pt-BR"
translationKey: "mcp-gateway"
publishedAt: 2026-11-03
tags: ["mcp", "governanca", "seguranca", "dados-para-ia", "camada-semantica", "auditoria"]
draft: false
llmSummary: "Um gateway MCP é um proxy entre agentes e servidores MCP que centraliza autenticação, log e limite de chamadas. A especificação do MCP (revisão 2026-07-28) proíbe repassar token do cliente ao servidor de trás. O gateway não define métrica: duas fontes com definições diferentes continuam divergindo."
citations: ["https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization", "https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices", "https://docs.docker.com/ai/mcp-catalog-and-toolkit/mcp-gateway/", "https://docs.docker.com/reference/cli/docker/mcp/gateway/gateway_run/", "https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway.html", "https://learn.microsoft.com/en-us/azure/api-management/mcp-server-overview", "https://learn.microsoft.com/en-us/azure/api-management/secure-mcp-servers", "https://learn.microsoft.com/en-us/azure/api-management/rate-limit-by-key-policy", "https://learn.microsoft.com/en-us/azure/api-management/llm-token-limit-policy", "https://github.com/agentgateway/agentgateway", "https://docs.cloud.google.com/bigquery/docs/best-practices-costs", "https://modelcontextprotocol.io/specification/2026-07-28/server/utilities/logging", "https://developers.facebook.com/docs/business-management-apis/system-users/install-apps-and-generate-tokens"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://en.wikipedia.org/wiki/API_management", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
cta: newsletter
updatedAt: 2026-11-08
---
Um gateway MCP é um proxy que fica entre os agentes de IA e os servidores MCP da empresa e concentra num ponto só a autenticação, o registro das chamadas e o limite de uso. A especificação do MCP, na revisão 2026-07-28, determina que um servidor *"MUST NOT accept or transit any other tokens"* ([MCP, Autorização](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization), lida em 03/11/2026): o gateway tem que guardar credencial própria para cada servidor de trás. O que ele não resolve é a definição da métrica.

> **Gateway MCP:** ponto único de entrada que recebe as chamadas de ferramenta dos clientes MCP, valida quem está chamando, aplica política (escopo, limite, filtro de ferramenta), injeta a credencial do servidor de destino e registra a chamada. Ele governa o acesso. Não governa o significado do que volta.

## Qual é o sintoma que leva alguém a procurar um gateway?

Quase sempre o mesmo: os servidores MCP se multiplicaram mais rápido do que a governança.

O time de marketing ligou o MCP do Google Analytics no Claude. Alguém do financeiro ligou um servidor que lê o warehouse. A agência pediu acesso ao Meta Ads por MCP. Cada conexão tem a sua credencial, guardada na máquina de quem configurou, e nenhuma lista central diz quem acessa o quê. Quando alguém pergunta "quais agentes têm acesso ao dado de venda?", a resposta exige [montar um inventário de agentes](https://precisian.io/blog/pt-BR/posts/inventario-de-agentes-de-ia/) do zero, conversando com cada pessoa.

O segundo sintoma vem depois: o agente responde "receita de outubro" com um número, o financeiro tem outro, e ninguém sabe qual servidor o agente consultou. A primeira reação é achar que o gateway resolve isso também. Resolve metade.

## O que um gateway MCP faz, mecanicamente?

Ele termina a conexão do cliente e abre outra com o servidor de destino. Entre as duas, aplica regra.

A especificação do MCP define o servidor protegido como *"OAuth 2.1 resource server"* e exige que ele valide que o token foi *"issued specifically for them as the intended audience"* ([MCP, Autorização](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization)). O cliente, por sua vez, tem que mandar o parâmetro `resource` com a URI canônica do servidor em toda requisição de autorização e de token (RFC 8707). Para um gateway, isso tem uma consequência direta: o token que o agente apresenta vale para o gateway, e só para ele. Para falar com o servidor do Google Analytics ou do warehouse, o gateway usa outra credencial, dele.

O guia de segurança do MCP dá nome ao atalho proibido: *token passthrough*, o antipadrão em que o servidor aceita o token do cliente sem validar que foi emitido para ele e o repassa à API de trás. A mitigação é uma linha: *"MCP servers MUST NOT accept any tokens that were not explicitly issued for the MCP server"* ([MCP, Security Best Practices](https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices), lida em 03/11/2026). Entre os riscos listados está exatamente o que o gateway deveria resolver: com o token repassado, o servidor *"will be unable to identify or distinguish between MCP Clients"*, e o log de quem chamou perde valor.

O que os fornecedores declaram que o gateway deles faz (lido nas páginas oficiais em 03/11/2026, sem ordem de preferência):

| Produto | O que a documentação oficial declara |
|---|---|
| Docker MCP Gateway | Roda cada servidor MCP *"in isolated Docker containers with restricted privileges"*, injeta credenciais e tem *"built-in logging and call-tracing"*. O comando `docker mcp gateway run` traz `--log-calls` (padrão `true`), `--block-secrets` (padrão `true`), `--tools` e `--interceptor` ([Docker](https://docs.docker.com/ai/mcp-catalog-and-toolkit/mcp-gateway/), [referência da CLI](https://docs.docker.com/reference/cli/docker/mcp/gateway/gateway_run/)) |
| Amazon Bedrock AgentCore Gateway | Autenticação de entrada e de saída num serviço só, com *"Secure Credential Exchange"* e *"built-in observability and auditing"* ([AWS](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway.html)) |
| Azure API Management | Política de *"Rate limiting and quota enforcement"*, validação de JWT, filtro de IP e cache; suporta ferramentas MCP, mas *"doesn't support MCP resources or prompts"* ([Microsoft](https://learn.microsoft.com/en-us/azure/api-management/mcp-server-overview)) |
| agentgateway | Projeto da Linux Foundation, com *"fine-grained RBAC with CEL policy engine, rate limiting, TLS"* e telemetria por OpenTelemetry ([GitHub](https://github.com/agentgateway/agentgateway)) |

Os quatro convergem em três funções: quem entra, o que fica registrado, quanto se usa. Nenhum declara decidir o que uma métrica quer dizer.

## Quando a empresa precisa de um gateway MCP?

Conte o problema antes de comprar a solução. As cinco checagens abaixo cabem numa tarde.

| Verificação | Onde olhar | Sinal de que o gateway compensa |
|---|---|---|
| Quantos servidores MCP estão em uso | Arquivo de configuração de cada cliente MCP (Claude, Cursor, VS Code) e console de apps OAuth do Google Workspace | Mais de um servidor com dado de negócio, configurados por pessoas diferentes |
| Onde moram as credenciais | Variáveis de ambiente e arquivos de configuração nas máquinas | Token de API de plataforma salvo em máquina pessoal |
| Se dá para revogar o acesso de uma pessoa num lugar só | Processo de desligamento de funcionário | Revogar exige lembrar de cada servidor |
| Se existe registro de quem chamou qual ferramenta | Logs dos servidores MCP | Log por servidor, sem identidade de usuário, ou nenhum |
| Se algum servidor repassa o token do cliente | Código ou configuração do servidor; procure cabeçalho `Authorization` copiado da entrada para a saída | Qualquer ocorrência: é o *token passthrough* proibido pela especificação |

Faça a última checagem mesmo em produto comercial. A própria documentação do Azure API Management mostra as duas formas de chegar ao servidor de trás: copiar o cabeçalho `Authorization` de entrada com `set-header`, ou buscar a credencial no gerenciador de credenciais com `get-authorization-context` ([Microsoft, Secure access to MCP servers](https://learn.microsoft.com/en-us/azure/api-management/secure-mcp-servers)). Qual delas está configurada na sua instância é a pergunta que decide se o gateway cumpre a regra do MCP.

Se a contagem deu um servidor só, usado por uma pessoa, o gateway é infraestrutura a mais para manter. A política dá para aplicar no próprio servidor.

## Como montar o gateway sem criar um ponto cego novo?

Três decisões, nesta ordem.

**1. Identidade de ponta a ponta.** O agente se autentica no gateway como a pessoa (ou o serviço) que ele representa, e o gateway grava essa identidade em cada chamada. É isso que transforma o log em [log de auditoria de agente](https://precisian.io/blog/pt-BR/posts/log-de-auditoria-de-agente-de-ia/). A especificação descontinuou o recurso de logging do próprio protocolo na revisão 2026-07-28 ([MCP, Logging](https://modelcontextprotocol.io/specification/2026-07-28/server/utilities/logging)), então o registro é responsabilidade de quem executa, gateway ou servidor. No mínimo, cada linha leva a pessoa por trás do agente, o cliente MCP, o nome da ferramenta, os argumentos, o servidor de destino, o horário e o status do resultado. Sem os argumentos, você sabe que o agente pediu receita, mas não de quais datas nem de qual loja.

**2. Escopo por ferramenta, não por servidor.** O guia de segurança do MCP lista como erro comum *"Publishing all possible scopes in `scopes_supported`"* e recomenda começar com escopo mínimo de leitura, pedindo elevação quando a ferramenta privilegiada for chamada. No gateway, isso vira lista de ferramentas habilitadas por perfil (o `--tools` do Docker, a política por operação do Azure).

**3. Limite onde o custo nasce.** O `rate-limit-by-key` do Azure conta chamadas por janela de até 300 segundos ([Microsoft](https://learn.microsoft.com/en-us/azure/api-management/rate-limit-by-key-policy)), e o `llm-token-limit` conta tokens, mas *"currently counts prompt and completion tokens only"* ([Microsoft](https://learn.microsoft.com/en-us/azure/api-management/llm-token-limit-policy)). Nenhum dos dois enxerga quantos bytes uma consulta vai varrer no warehouse. Uma chamada de ferramenta pode ler meia dúzia de linhas ou a tabela inteira, e para o gateway as duas contam como uma. O teto de custo de consulta mora no banco: no BigQuery, o `maximum_bytes_billed` faz a consulta *"fails without incurring a charge"* quando a estimativa passa do limite ([BigQuery](https://docs.cloud.google.com/bigquery/docs/best-practices-costs)). O post sobre [custo de consulta de agente](https://precisian.io/blog/pt-BR/posts/custo-de-consulta-de-agente-ia/) detalha essa configuração por fornecedor.

Com as três decisões, o gateway resolve inventário, revogação, rastreabilidade e volume de chamadas.

## O que o gateway MCP não conserta?

A definição da métrica, que é de onde sai o número que vai para a reunião de diretoria.

> **Exemplo sintético, com números redondos.** O agente recebe a pergunta "qual foi a receita de outubro?". Pelo gateway, ele tem duas ferramentas autorizadas: a do servidor do Google Analytics e a do servidor do warehouse que lê o ERP. A primeira devolve R$ 1,0 milhão, que é receita de item sem frete. A segunda devolve R$ 1,15 milhão, que é faturamento com frete e antes dos cancelamentos.

O gateway autenticou as duas chamadas, gravou as duas no log e respeitou o limite. Funcionou como devia. E o agente escolheu uma das duas, ou somou, ou fez a média, sem que ninguém tenha decidido qual "receita" vale para essa pergunta.

O log vai mostrar com precisão qual ferramenta foi chamada. Não vai mostrar qual definição deveria ter sido usada, porque essa definição não existe em lugar nenhum. Esse é o mecanismo do que chamamos de alucinação de métrica: o modelo não inventa o número, ele escolhe entre números verdadeiros que medem coisas diferentes.

Quem resolve isso é a [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/): a definição única e versionada de "receita líquida", com fonte, filtro e regra de cancelamento escritos, exposta ao agente como a métrica que ele deve usar. O gateway decide quem pode perguntar. A camada semântica decide o que a resposta quer dizer. Um não substitui o outro, e ter os dois é o que deixa a resposta auditável de verdade: o log diz quem perguntou e quando, e a versão da definição diz o que o número significava naquele dia.

## Quando isso não tem conserto pelo gateway?

Quatro casos em que o gateway não é a ferramenta certa, ou não basta.

**Servidor local por stdio.** A especificação diz que implementações com transporte STDIO *"SHOULD NOT follow this specification, and instead retrieve credentials from the environment"*. Servidor MCP rodando na máquina do analista, lendo credencial do ambiente, não passa por gateway nenhum, a menos que a política da empresa proíba esse modo.

**Credencial de plataforma de longa duração.** Se o servidor de trás usa um token de longa duração, como o token de usuário do sistema da Meta, que pode ser gerado sem data de expiração ([Meta](https://developers.facebook.com/docs/business-management-apis/system-users/install-apps-and-generate-tokens)), o gateway protege a porta da frente, mas quem tem o token tem o dado por outro caminho. O inventário de credenciais continua necessário.

**Recurso que o gateway não suporta.** O Azure API Management, por exemplo, declara suporte a ferramentas, mas não a *resources* nem a *prompts* do MCP. Servidor que depende desses recursos fica de fora ou perde funcionalidade.

**Métrica sem dono.** Se a empresa não decidiu o que é receita, nenhuma camada de acesso decide por ela. O gateway só torna a divergência mais bem documentada.

A Precisian não vende gateway. O que ela entrega fica antes dele: o lake isolado por cliente, na infraestrutura da Precisian, e a camada semântica com as definições aprovadas pelo cliente, acessível pelo MCP, pela API ou pelo BI dele. Se o seu problema é só governar acesso a servidores MCP de ferramentas genéricas (Slack, Jira, GitHub), um gateway resolve e a Precisian não é a resposta.

## O que este artigo não cobre?

Não ranqueia gateways nem compara preço: o mercado muda rápido demais para uma comparação durável, e a tabela acima só reproduz o que cada fornecedor declara. Não trata de gateway de modelo (roteamento entre provedores de LLM), que alguns produtos acumulam na mesma peça. Não detalha a configuração de OAuth passo a passo. E não traz percentual de empresas com gateway em produção: não encontrei pesquisa com metodologia publicada que meça isso no Brasil.

---

Se o agente da sua operação responde "receita" com um número diferente do financeiro, o primeiro passo é medir quantas definições de receita estão expostas hoje às ferramentas dele. O que mudou, o que quebrou e o que a pesquisa da Precisian mediu chega a cada quinze dias, às quintas, na [newsletter da Precisian](https://precisian.io/newsletter?utm_source=blog&utm_medium=cta&utm_campaign=gateway-mcp&utm_content=texto).
