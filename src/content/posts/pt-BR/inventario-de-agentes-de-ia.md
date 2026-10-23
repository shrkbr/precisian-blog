---
title: "Quais agentes de IA têm acesso aos seus dados? Como montar o inventário"
description: "Nenhum painel lista todos os agentes de IA ligados ao seu dado. O inventário de permissões tem sete colunas e uma revisão mensal e trimestral."
slug: "inventario-de-agentes-de-ia"
lang: "pt-BR"
translationKey: "agent-permissions"
publishedAt: 2026-10-23
tags: ["mcp", "governanca", "seguranca", "dados-para-ia", "auditoria", "seguranca-de-dados"]
draft: false
llmSummary: "Uma autorização OAuth do Google só expira sozinha após seis meses sem uso, e token de usuário do sistema da Meta pode nunca expirar. Por isso o inventário de agentes de IA lista agente, dono, servidor MCP, escopo, ferramentas de escrita, dado alcançável e data da última revisão."
citations: ["https://developers.google.com/identity/protocols/oauth2", "https://developers.facebook.com/docs/business-management-apis/system-users/install-apps-and-generate-tokens", "https://developers.facebook.com/docs/facebook-login/auth-vs-data", "https://developers.facebook.com/docs/graph-api/reference/debug_token/", "https://knowledge.workspace.google.com/admin/apps/control-which-apps-access-google-workspace-data", "https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/manage-application-permissions", "https://developers.google.com/google-ads/api/docs/change-event", "https://help.vtex.com/pt/docs/tutorials/chaves-de-api", "https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization", "https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices", "https://modelcontextprotocol.io/docs/develop/connect-local-servers", "https://genai.owasp.org/llmrisk/llm062025-excessive-agency/", "https://media.defense.gov/2026/Jun/02/2003943289/-1/-1/0/CSI_MCP_SECURITY.PDF"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://en.wikipedia.org/wiki/Principle_of_least_privilege", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 9
---

Nenhum painel único mostra quais agentes de IA alcançam o seu dado, porque cada autorização fica registrada na plataforma que a concedeu. E elas duram: o Google só invalida sozinho um refresh token depois de 6 meses sem uso ([Google](https://developers.google.com/identity/protocols/oauth2)), e a Meta oferece token de usuário do sistema que nunca expira ([Meta for Developers](https://developers.facebook.com/docs/business-management-apis/system-users/install-apps-and-generate-tokens)). O inventário mínimo de permissões tem sete colunas: agente, dono, servidor MCP, escopo do token, ferramentas de escrita, dado alcançável e data da última revisão.

> **Inventário de agentes de IA** é a lista, mantida por uma pessoa com nome, de todo agente que consulta ou altera dado da empresa: por qual servidor MCP ele passa, com qual credencial, o que essa credencial permite e quando alguém conferiu isso pela última vez.

Este texto parte de um ponto já tratado em [segurança de servidor MCP](https://precisian.io/blog/pt-BR/posts/seguranca-de-servidor-mcp/): no Google Ads e na Meta, o risco mora no escopo do token, não no protocolo. Aqui o assunto é a lista e a rotina que mantém essa lista verdadeira.

## Qual é o sintoma?

Alguém pergunta "quais IAs estão ligadas às nossas contas?" e a resposta leva uma semana, vem de três pessoas diferentes e não bate entre elas.

O analista de mídia conectou o Claude ao Google Ads pelo [MCP do Google Ads](https://precisian.io/blog/pt-BR/posts/mcp-do-google-ads/). A agência ligou o agente dela à conta da Meta. O time de CRM testou um servidor de comunidade para a VTEX e nunca o desligou. Um estagiário que saiu em agosto autorizou o GA4 no notebook pessoal. Cada uma dessas ligações foi aprovada num clique, por uma pessoa, numa tela de consentimento que ninguém mais viu.

Três variações do mesmo sintoma aparecem com frequência:

- **A pergunta vem de fora do marketing.** Jurídico, segurança ou financeiro quer saber, por causa da LGPD ou de um questionário de cliente, quem tem acesso a dado pessoal de comprador. Ninguém sabe responder por escrito.
- **A pessoa saiu, o acesso ficou.** O login foi desativado, mas a credencial guardada num arquivo de configuração continua funcionando.
- **Um número mudou e ninguém mexeu.** Um orçamento, um público ou um nome de campanha aparece alterado, e o histórico mostra que a alteração veio pela API.

## Por que ninguém sabe quantos agentes já estão ligados?

Porque o acesso de um agente é a soma de quatro registros que vivem em lugares diferentes, e nenhum deles foi desenhado para ser lido junto.

**O consentimento é por pessoa, não por empresa.** Quando alguém autoriza um servidor MCP no Google, a concessão fica presa à conta Google dessa pessoa. A especificação do MCP piora a visibilidade em dois pontos: a autorização é *"OPCIONAL"*, e servidores que rodam localmente, pelo transporte STDIO, *"NÃO DEVERIAM"* seguir o fluxo OAuth e devem pegar credenciais do ambiente ([MCP, Authorization, versão 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization)). Na prática, uma chave de API colada num arquivo de configuração não passa por nenhuma tela de consentimento e não aparece em nenhum console de administrador.

**A credencial sobrevive ao motivo que a criou.** O Google lista quando um refresh token para de funcionar: acesso revogado pelo usuário, seis meses sem uso, troca de senha quando há escopo do Gmail, entre outros ([Google](https://developers.google.com/identity/protocols/oauth2)). Um agente que roda toda segunda-feira nunca chega aos seis meses. Na Meta, o token de usuário comum, renovado pelos SDKs da Meta, dura cerca de 60 dias a partir do último uso e o acesso ao dado expira em 90 dias de inatividade ([Meta for Developers](https://developers.facebook.com/docs/facebook-login/auth-vs-data)), mas o token de usuário do sistema pode ser gerado como permanente ([Meta for Developers](https://developers.facebook.com/docs/business-management-apis/system-users/install-apps-and-generate-tokens)). Na VTEX, a página de chaves de API avisa que os tokens não expiram sozinhos depois do prazo configurado: o prazo só define quando a interface sugere renovar ([Ajuda VTEX](https://help.vtex.com/pt/docs/tutorials/chaves-de-api)).

**O escopo pedido costuma ser o maior disponível.** Quando o servidor não informa o escopo necessário, o cliente cai para pedir todos os que o servidor lista em `scopes_supported` (mesma especificação). O guia de boas práticas do protocolo dá nome ao efeito acumulado: *"cegueira à inflação de escopo"*, quando a falta de métrica torna normal o pedido amplo demais ([MCP, Security Best Practices](https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices)).

**A ferramenta de escrita entra junto com a de leitura.** A OWASP classifica isso como agência excessiva, com três causas: funcionalidade, permissão e autonomia além do necessário. O exemplo dela é uma extensão que só precisava ler e recebeu também permissão de alterar e apagar ([OWASP, LLM06:2025](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/)).

Somados, os quatro registros explicam o quadro comum, em que o acesso foi concedido por indivíduos, fica guardado onde o administrador não vê, não tem data de validade e é mais largo que o uso.

## Como diagnosticar o que já está ligado?

Pela ordem do que cobre mais com menos esforço. A tabela diz onde olhar; os passos depois dela tratam do que nenhum console mostra.

| Onde | Caminho | O que você descobre |
|---|---|---|
| Google Workspace | Admin: Segurança, Acesso e controle de dados, Controles de API, Apps acessados, Ver lista | Cada app que acessou dado da organização, número de usuários e serviços solicitados (escopos). Aparece de 24 a 48 horas depois da autorização |
| Microsoft Entra | Entra ID, Aplicativos empresariais, Todos os aplicativos, Permissões | Consentimento de administrador e de usuário por aplicativo |
| Conta Google sem Workspace | myaccount.google.com, conexões de terceiros | Os apps que aquela pessoa autorizou |
| Meta | Endpoint `debug_token` em cada token conhecido | `scopes`, `granular_scopes`, `expires_at`, `data_access_expires_at` |
| Meta, Business Suite | Configurações, Integrações, Ads MCP server | As regras que limitam o que agentes fazem por conta de anúncio |
| VTEX | Chaves de API, Chaves geradas e Chaves externas | Chaves ativas e os perfis de acesso de cada uma |
| Google Ads | Recurso `change_event` da API | O que mudou, quando, por qual usuário e por qual tipo de cliente |

Fontes: [Google Workspace](https://knowledge.workspace.google.com/admin/apps/control-which-apps-access-google-workspace-data) (página atualizada em 22/10/2026), [Microsoft Entra](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/manage-application-permissions), [Meta, debug_token](https://developers.facebook.com/docs/graph-api/reference/debug_token/), [Ajuda VTEX](https://help.vtex.com/pt/docs/tutorials/chaves-de-api), [Google Ads API, change_event](https://developers.google.com/google-ads/api/docs/change-event). As regras de agente da Meta estão detalhadas em [o MCP da Meta Ads](https://precisian.io/blog/pt-BR/posts/mcp-da-meta-ads/).

**Depois dos consoles, as máquinas.** Servidor local não aparece em lista nenhuma de administrador. No Claude Desktop, a configuração fica em `~/Library/Application Support/Claude/claude_desktop_config.json` no macOS e em `%APPDATA%\Claude\claude_desktop_config.json` no Windows, e a documentação do MCP lembra que o servidor *"roda com as permissões da sua conta de usuário"* ([MCP, servidores locais](https://modelcontextprotocol.io/docs/develop/connect-local-servers)). Peça a cada pessoa que usa agente que abra esse arquivo e liste as entradas de `mcpServers`, inclusive o bloco `env`, onde costumam estar as chaves.

**Depois das máquinas, as ferramentas.** Para cada servidor encontrado, guarde a resposta de `tools/list` e marque toda ferramenta com criar, atualizar, apagar, pausar ou ativar no nome. A anotação `readOnlyHint` não substitui essa leitura, pelo motivo explicado em [segurança de servidor MCP](https://precisian.io/blog/pt-BR/posts/seguranca-de-servidor-mcp/).

**Por último, o rastro.** No Google Ads, a consulta abaixo devolve as alterações recentes com o tipo de cliente que as fez. O recurso só guarda os últimos 30 dias e exige `LIMIT` de até 10.000 linhas ([Google Ads API](https://developers.google.com/google-ads/api/docs/change-event)).

```sql
SELECT change_event.change_date_time, change_event.user_email,
       change_event.client_type, change_event.change_resource_type,
       change_event.resource_change_operation
FROM change_event
WHERE change_event.change_date_time >= '2026-09-24'
  AND change_event.change_date_time <= '2026-10-23'
ORDER BY change_event.change_date_time DESC
LIMIT 1000
```

Alteração feita pela API com um e-mail que ninguém associa a um agente é a primeira linha do inventário que faltava.

## O que entra em cada linha do inventário?

Sete colunas. Menos do que isso e a lista não responde à pergunta que a motivou; mais do que isso e ninguém atualiza.

| Coluna | O que registrar | Por que importa |
|---|---|---|
| Agente | Nome e uso ("relatório semanal de mídia") | Agente sem uso declarado é o primeiro a revogar |
| Dono | Uma pessoa, com nome, ainda na empresa | Linha sem dono não tem quem responda pelo acesso |
| Servidor MCP | Qual, oficial ou de comunidade, local ou remoto, versão | Servidor remoto de terceiro guarda o token fora da sua infraestrutura |
| Credencial e escopo | Tipo, escopos, usuário por trás, data de expiração | É o limite real do que o agente consegue fazer |
| Ferramentas de escrita | Lista das que alteram dado ou gastam verba | Define o tamanho do estrago de uma instrução plantada |
| Dado alcançável | Contas, propriedades, lojas; se há dado pessoal | Responde à pergunta do jurídico e da LGPD |
| Última revisão | Data e quem revisou | Sem data, a lista vira foto de um dia |

Um exemplo fictício, só para mostrar o grau de detalhe esperado numa linha:

| Agente | Dono | Servidor MCP | Credencial e escopo | Escrita | Dado alcançável | Revisão |
|---|---|---|---|---|---|---|
| Relatório semanal de mídia | Ana, growth | google-ads-mcp oficial, local, Claude Desktop | OAuth `adwords`, usuário de nível Somente leitura | Nenhuma | 3 contas Google Ads, sem dado pessoal | 01/10/2026, Ana |

A planilha não precisa de ferramenta paga. Precisa de um dono para a planilha inteira, diferente dos donos de cada linha. Na minha opinião, o candidato natural é quem já responde pelo acesso de agência e pelos usuários das plataformas, como descrito em [acesso de dados para agência](https://precisian.io/blog/pt-BR/posts/acesso-de-dados-para-agencia/).

## Como corrigir e manter o inventário verdadeiro?

Com três ritmos de revisão, cada um amarrado a um relógio que a própria plataforma impõe.

**Mensal, para todo agente com ferramenta de escrita ou acesso a dado pessoal.** O motivo é a janela do `change_event`: o Google Ads guarda 30 dias ([Google Ads API](https://developers.google.com/google-ads/api/docs/change-event)). Se ninguém exporta o histórico todo mês, a pergunta "quem mudou esse orçamento em julho?" deixa de ter resposta. Na mesma rodada, rode `debug_token` nos tokens da Meta e confira `expires_at`.

**Trimestral, para a lista inteira.** Reconcilie a lista de apps acessados do Workspace (ou do Entra) com a planilha. Todo app que aparece no console e não está na planilha vira linha nova ou vira revogação. Toda linha cujo dono saiu da empresa é revogada na hora e recriada, se ainda for necessária, com outro dono.

**Por evento, sem esperar o calendário.** Saída de pessoa, troca de agência, servidor novo, versão nova de servidor que mudou o `tools/list`, pedido de escopo novo. Cada um desses eventos abre a linha correspondente.

Quatro regras tornam a revisão mais curta a cada ciclo:

1. **Um agente, uma credencial.** Credencial compartilhada entre agentes impede saber qual deles fez o quê. A especificação do MCP proíbe o servidor de repassar token emitido para outro destino e cita a perda de trilha de auditoria como um dos motivos ([MCP, Security Best Practices](https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices)).
2. **Agente que lê não recebe ferramenta de escrita.** A OWASP recomenda limitar extensões e permissões ao mínimo necessário ([OWASP, LLM06:2025](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/)). No Google Ads, isso significa autorizar com usuário de nível Somente leitura; na Meta, usar as regras do servidor.
3. **Token com prazo.** Na Meta, gere token de usuário do sistema com validade de 60 dias, que a própria Meta marca como recomendado ([Meta for Developers](https://developers.facebook.com/docs/business-management-apis/system-users/install-apps-and-generate-tokens)). A renovação vira o lembrete da revisão.
4. **Registro de cada chamada.** O inventário registra quem tem acesso, e o log registra o que cada agente fez com ele. A NSA recomenda registrar toda invocação com os parâmetros exatos e as identidades envolvidas ([NSA, CSI U/OO/6030316-26](https://media.defense.gov/2026/Jun/02/2003943289/-1/-1/0/CSI_MCP_SECURITY.PDF)). O que guardar está em [log de auditoria de agente de IA](https://precisian.io/blog/pt-BR/posts/log-de-auditoria-de-agente-de-ia/).

Há também um caminho estrutural para quem só precisa de análise. Na Precisian, a ingestão de Google Ads, Meta, GA4 e VTEX acontece num data lake isolado por cliente, na infraestrutura da Precisian, e o agente do cliente consulta por MCP as métricas definidas na camada semântica. O inventário passa a ter uma linha por agente, apontando para um servidor só leitura, em vez de uma credencial de plataforma por agente. O desenho completo está em [conectar a IA sem expor a base](https://precisian.io/blog/pt-BR/posts/conectar-ia-sem-expor-a-base/).

## Quando o inventário não resolve?

Em quatro situações, e vale reconhecê-las antes de tratar a planilha como garantia.

**Quando o agente precisa agir.** Se o objetivo é um agente que cria campanha, ajusta lance ou pausa anúncio, o inventário reduz o risco, mas o token continua com escrita. A Precisian também não resolve esse caso: ela não ativa campanha e não entrega token de plataforma ao agente.

**Quando a autorização foi feita com login de terceiro.** Se a agência autorizou o servidor com uma conta Google dela, a concessão está presa àquela conta e você não a revoga do seu lado. O que você controla é o usuário que a agência tem na sua conta de anúncio, e a revisão passa a depender dela.

**Quando revogar não impede o retorno.** A Microsoft avisa que revogar uma permissão concedida não impede o usuário de consentir de novo; para isso é preciso configurar quem pode consentir ([Microsoft Entra](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/manage-application-permissions)). No Workspace, o equivalente é marcar o app como bloqueado ou limitado no mesmo painel de controles de API ([Google Workspace](https://knowledge.workspace.google.com/admin/apps/control-which-apps-access-google-workspace-data)). Sem essa política, a revisão trimestral encontra os mesmos apps outra vez.

**Quando o servidor de comunidade é remoto.** Você consegue listar e revogar, mas não consegue saber o que ele fez com o token enquanto teve acesso. O registro dessas chamadas fica com quem hospeda.

## O que este artigo não cobre?

Não compara gateways nem plataformas comerciais de gestão de agentes, que mudam rápido demais para uma comparação durável. Não trata de identidade própria de agente (credenciais emitidas para o agente e não para a pessoa), assunto ainda em definição nas especificações. Não detalha o conteúdo do log de auditoria, tema do post sobre log de agente. E não traz percentual de empresas sem inventário: não encontrei pesquisa com metodologia publicada que meça isso no Brasil.

---

Se hoje ninguém consegue dizer quantos agentes alcançam as suas contas de mídia e a sua loja, o primeiro passo é preencher as sete colunas para os agentes que você já conhece e cruzar com a lista de apps acessados do seu Workspace. [Vale uma conversa sobre o seu caso](https://calendar.notion.so/meet/rodrigomartucci/precisian-io) — sem compromisso de contrato, mas sem promessa de resposta em 30 minutos também.
