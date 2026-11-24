---
title: "MCP do WhatsApp: o oficial e o risco dos não oficiais"
description: "O MCP oficial da Meta para o WhatsApp, em beta desde 15/09/2026, tem 18 ferramentas de configuração e envio. Nenhuma lê o histórico de conversa."
slug: "mcp-do-whatsapp"
lang: "pt-BR"
translationKey: "whatsapp-mcp-server"
publishedAt: 2026-11-23
tags: ["mcp", "whatsapp", "lgpd", "dados-para-ia", "governanca", "privacidade", "seguranca-de-dados"]
draft: false
llmSummary: "O MCP oficial da Meta para o WhatsApp é o WhatsApp Business Tools MCP (mcp.facebook.com/whatsapp_business_tools), em beta desde 15/09/2026. Suas 18 ferramentas configuram conta, número, template e webhook e enviam mensagem; nenhuma lê histórico de conversa (doc da Meta, lida em 23/11/2026)."
citations: ["https://developers.facebook.com/blog/post/2026/09/15/whatsapp-business-messaging-mcp-ai-agent/", "https://developers.facebook.com/documentation/mcp/whatsapp-business-tools-mcp", "https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/overview", "https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages", "https://developers.facebook.com/documentation/business-messaging/whatsapp/data-privacy-and-security", "https://www.whatsapp.com/legal/terms-of-service?lang=pt_BR", "https://www.facebook.com/legal/Meta-Terms-for-WhatsApp-Business-Platform", "https://github.com/lharries/whatsapp-mcp", "https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/", "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://pt.wikipedia.org/wiki/WhatsApp", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 10
cta: demo
---
Existe um MCP oficial do WhatsApp, e ele não lê conversa. A Meta anunciou o WhatsApp Business Tools MCP em 15/09/2026 ([blog da Meta for Developers](https://developers.facebook.com/blog/post/2026/09/15/whatsapp-business-messaging-mcp-ai-agent/)), e a documentação, atualizada em 29/10/2026, lista 18 ferramentas para configurar conta, número, template e webhook e para enviar mensagem ([Meta for Developers](https://developers.facebook.com/documentation/mcp/whatsapp-business-tools-mcp), lida em 23/11/2026). Os servidores que leem o histórico de chat são projetos de comunidade, não da Meta.

> **WhatsApp Business Tools MCP**: servidor Model Context Protocol hospedado pela Meta em `https://mcp.facebook.com/whatsapp_business_tools`, autenticado por OAuth com a conta de desenvolvedor da Meta, que deixa um agente de IA administrar a integração com a Cloud API da WhatsApp Business Platform. Status declarado: beta, com interface e ferramentas sujeitas a mudança.

## O que o MCP oficial do WhatsApp faz, ferramenta por ferramenta?

Todas as ferramentas têm o prefixo `whatsapp_biz_` e agem "como você, nos apps e empresas que você administra" (tradução minha), nas palavras da [documentação](https://developers.facebook.com/documentation/mcp/whatsapp-business-tools-mcp) lida em 23/11/2026:

<table>
<thead><tr><th>Grupo</th><th>Ferramentas</th><th>O que fazem</th></tr></thead>
<tbody>
<tr><td>Descoberta</td><td><code>whatsapp_biz_businesses</code>, <code>whatsapp_biz_accounts</code>, <code>whatsapp_biz_phone_numbers</code></td><td>Listam empresas, contas do WhatsApp e números, com status</td></tr>
<tr><td>Número</td><td><code>whatsapp_biz_add_phone_number</code>, <code>whatsapp_biz_send_verification_code</code>, <code>whatsapp_biz_verify_phone_number</code>, <code>whatsapp_biz_register_phone_number</code></td><td>Adicionam, verificam por código e registram o número para enviar e receber</td></tr>
<tr><td>Template</td><td><code>whatsapp_biz_list_templates</code>, <code>whatsapp_biz_get_template</code>, <code>whatsapp_biz_create_template</code>, <code>whatsapp_biz_update_template</code>, <code>whatsapp_biz_delete_template</code></td><td>Listam, criam, editam e apagam modelos de mensagem</td></tr>
<tr><td>Envio</td><td><code>whatsapp_biz_send_message</code></td><td>Envia texto livre (só dentro da janela de atendimento ao cliente) ou template aprovado, e confirma o destino antes</td></tr>
<tr><td>Webhook</td><td><code>whatsapp_biz_configure_webhooks</code>, <code>whatsapp_biz_subscribe_webhook</code></td><td>Configuram a URL de callback e assinam os campos de evento</td></tr>
<tr><td>Conta</td><td><code>whatsapp_biz_configure_payments</code>, <code>whatsapp_biz_verify_business</code>, <code>whatsapp_biz_system_user_token</code></td><td>Pagamento, verificação da empresa e link para gerar token de usuário do sistema</td></tr>
</tbody>
</table>

Os escopos pedidos no consentimento são três: `business_management`, `whatsapp_business_management` e `whatsapp_business_messaging`. Os clientes suportados são Claude Code, Claude Desktop, ChatGPT, Codex CLI e o app do Codex. O anúncio diz que o servidor foi feito "para fluxos de desenvolvimento e teste, não para envio em produção em escala" (tradução minha), e a doc avisa que a liberação é gradual e pode não ter chegado à sua conta.

## Por que o MCP oficial não responde o que o cliente reclamou?

Alguém do comercial lê "MCP do WhatsApp", conecta o servidor oficial no Claude e pergunta o que os clientes mais reclamaram na semana. O agente lista empresas, números e templates, e não responde, porque nenhuma ferramenta devolve mensagem recebida.

O passo seguinte costuma ser o GitHub. Ali aparecem servidores que fazem exatamente o que a pessoa queria: leem as conversas, buscam contatos e mandam mensagem a partir do celular dela. O mais citado, o [`lharries/whatsapp-mcp`](https://github.com/lharries/whatsapp-mcp), descreve no README que se conecta "à sua conta pessoal do WhatsApp" pela API multidispositivo do WhatsApp Web, usando a biblioteca `whatsmeow`, depois de ler um QR code. As mensagens ficam num banco SQLite local e vão ao LLM quando o agente chama as ferramentas.

Na loja que vende por WhatsApp, esse celular tem conversa de cliente com CPF, endereço, comprovante de Pix e foto de produto com defeito. A troca do servidor oficial pelo não oficial muda de quem é a conta, por onde passa a mensagem e quem responde pelo dado.

## Por que o MCP oficial não lê conversa?

Porque a Cloud API entrega cada mensagem ao servidor do negócio e não mantém um histórico consultável. Segundo a [visão geral de webhooks](https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/overview), atualizada em 04/11/2026, mensagem recebida chega ao servidor da empresa pelo webhook `messages`. Se o endpoint não responde 200, a Meta tenta de novo "por até 7 dias".

Do lado da Meta, a página de [privacidade e segurança de dados](https://developers.facebook.com/documentation/business-messaging/whatsapp/data-privacy-and-security), atualizada em 16/06/2026, diz que as mensagens têm "período máximo de retenção de 30 dias" para funções como retransmissão, e que a Meta age como operadora do dado em nome do negócio. Quem quer o histórico precisa gravá-lo no próprio servidor no momento em que o webhook chega.

O MCP oficial administra esse encanamento: número, template, webhook. O histórico, se existir, mora no sistema que o negócio montou para receber o webhook: a plataforma de atendimento, o CRM ou um banco próprio.

Os servidores de comunidade contornam isso por outro caminho. Em vez da API de negócio, usam a conta do aplicativo, que guarda o histórico no aparelho. Por isso leem conversa antiga, e por isso o enquadramento contratual muda.

## O que os termos do WhatsApp dizem sobre automação?

Cito o texto oficial e não avalio projeto nenhum. Se um uso específico cabe nos termos, isso é entre quem usa e o WhatsApp.

Os [Termos de Serviço do WhatsApp](https://www.whatsapp.com/legal/terms-of-service?lang=pt_BR), com data de vigência de 04/01/2021 (lidos em 23/11/2026), dizem em "Uso lícito e aceitável" que o usuário não usará os Serviços "de forma a envolver o uso não pessoal dos nossos Serviços, a menos que esteja autorizado por nós". Em "Prejuízo ao WhatsApp ou a nossos usuários", vedam acessar ou usar os Serviços "por meios automatizados ou quaisquer outros" de "maneira não permitida ou autorizada", e citam entre os exemplos "coletar informações de ou sobre nossos usuários de maneira não autorizada".

Do lado do negócio, os [Meta Terms for WhatsApp Business Platform](https://www.facebook.com/legal/Meta-Terms-for-WhatsApp-Business-Platform), com última alteração em 23/09/2026, têm duas cláusulas que importam para agente de IA (tradução minha):

- **4.1(b):** é vedado compartilhar o dado obtido pela plataforma, "inclusive formas anônimas, agregadas ou derivadas", com terceiros, exceto com um provedor de solução nos termos do contrato.
- **4.7:** quando a empresa contrata um provedor de IA como provedor de solução, não pode deixar o dado da plataforma ser usado para "criar, desenvolver, treinar ou melhorar" modelos de IA. A exceção é o ajuste fino de um modelo de uso exclusivo da empresa.

O README do `lharries/whatsapp-mcp` traz um aviso do próprio autor: o servidor está sujeito à ["lethal trifecta"](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/) e uma injeção de prompt "pode levar à exfiltração de dados privados" (tradução minha). O mesmo risco vale para qualquer agente que lê mensagem de desconhecido e tem ferramenta de envio.

## O que um agente nunca deveria ler?

O texto da mensagem e o que identifica quem a mandou. A [referência do webhook `messages`](https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/messages), atualizada em 04/11/2026, mostra os campos que chegam a cada mensagem recebida:

<table>
<thead><tr><th>Campo do webhook</th><th>O que é</th><th>Pela LGPD</th><th>O agente precisa?</th></tr></thead>
<tbody>
<tr><td><code>text.body</code> (e mídias)</td><td>O conteúdo da mensagem</td><td>Dado pessoal; pode conter dado sensível</td><td>Não. Precisa da classificação (dúvida, troca, reclamação)</td></tr>
<tr><td><code>contacts.profile.name</code></td><td>Nome do perfil</td><td>Dado pessoal</td><td>Não</td></tr>
<tr><td><code>contacts.wa_id</code>, <code>messages.from</code></td><td>Número de telefone</td><td>Dado pessoal</td><td>Não. Uma chave pseudonimizada serve</td></tr>
<tr><td><code>contacts.user_id</code></td><td>ID do usuário por empresa (BSUID)</td><td>Dado pessoal, porque identifica</td><td>Só como chave de junção, fora do contexto do agente</td></tr>
<tr><td><code>messages.timestamp</code>, <code>type</code></td><td>Hora e tipo</td><td>Sozinhos, não identificam</td><td>Sim</td></tr>
</tbody>
</table>

A [LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm) define dado pessoal como "informação relacionada a pessoa natural identificada ou identificável" (art. 5º, I) e lista saúde, religião e origem racial entre os dados sensíveis (art. 5º, II), coisa que cliente conta no WhatsApp sem ninguém pedir. O princípio da necessidade (art. 6º, III) limita o tratamento "ao mínimo necessário". Uma pergunta como "quantas reclamações de troca tivemos em outubro" se responde com uma contagem, e mandar o texto das conversas ao modelo para chegar nela é tratamento acima do necessário.

Quando o modelo roda fora do Brasil, entra a transferência internacional, assunto de [LGPD e IA: onde o dado do seu cliente pode viver](https://precisian.io/blog/pt-BR/posts/lgpd-ia-dados-de-cliente/).

## Como diagnosticar o que está conectado?

Quatro checagens, todas no cliente de IA ou no terminal.

1. **Liste as ferramentas.** No Claude Code, `/mcp` mostra servidores e ferramentas. Ferramenta de WhatsApp sem o prefixo `whatsapp_biz_` não veio do servidor oficial.
2. **Confira o endereço.** O oficial é remoto, em `https://mcp.facebook.com/whatsapp_business_tools`. Servidor que roda por `command` local, com `uv`, `node` ou `go`, é outro.
3. **Lembre como foi o login.** O oficial usa OAuth com a conta de desenvolvedor da Meta. QR code lido pelo celular quer dizer que o servidor pareou como aparelho da sua conta do aplicativo.
4. **Ache o arquivo.** Servidor que lê histórico guarda mensagem em algum lugar. Se é um `.db` no notebook de alguém, conversa de cliente está fora de qualquer controle de acesso da empresa.

## Como dar conversa de WhatsApp a um agente sem expor o cliente?

Separe as duas necessidades, porque cada uma tem o caminho certo.

**Para configurar e testar, use o MCP oficial.** Criar template, registrar número e apontar webhook são as tarefas para as quais ele foi feito, com o escopo da sua conta de desenvolvedor e com confirmação antes de enviar.

**Para analisar conversa, grave o webhook e entregue ao agente o derivado, não a mensagem.** O desenho mínimo tem três passos:

1. O endpoint do webhook grava cada evento numa base da empresa, com o número trocado por uma chave pseudonimizada e o texto guardado à parte, com acesso restrito.
2. Um processo classifica a conversa (motivo, produto, se virou venda) e grava só a classificação. Se a conversa veio de anúncio, o objeto `referral` traz o [`ctwa_clid`](https://precisian.io/blog/pt-BR/posts/ctwa-clid/), que liga a conversa ao clique.
3. O agente consulta contagens e taxas definidas uma vez: "conversa", "conversa que virou pedido", "reclamação". A regra fica escrita numa [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/), versionada, e vale igual para toda pergunta.

Atribuir venda fechada no WhatsApp ao anúncio tem limites próprios, descritos em [atribuição no WhatsApp](https://precisian.io/blog/pt-BR/posts/atribuicao-whatsapp-dark-funnel/). E antes de dar a qualquer servidor uma ferramenta de envio, passe pelas perguntas de [segurança de servidor MCP](https://precisian.io/blog/pt-BR/posts/seguranca-de-servidor-mcp/).

## Quando isso não tem conserto?

**Conversa que nunca passou por webhook não volta pela API.** Se a loja atende pelo aplicativo WhatsApp Business no celular, sem a Cloud API, não há evento para gravar. A Meta documenta um webhook `history` para sincronizar o histórico do aplicativo, restrito a empresas integradas por um provedor de solução ([webhooks](https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/overview)). Fora disso, o passado fica no aparelho.

**O MCP oficial não vai ler conversa por configuração.** Não há escopo nem parâmetro para isso no desenho documentado em 23/11/2026, e o status é beta. Se a Meta mudar, a documentação é o lugar para conferir.

**O provedor de IA contratado não pode treinar modelo com o dado da conversa.** Pela cláusula 4.7 dos termos da plataforma, quando a empresa contrata um provedor de IA como provedor de solução, o dado não pode criar, treinar ou melhorar modelos, salvo o ajuste fino de um modelo de uso exclusivo da empresa. A vedação de repassar o dado a terceiros, "inclusive formas anônimas, agregadas ou derivadas" (tradução minha), está na 4.1(b).

**Quando a Precisian não é a resposta.** Se o que você precisa é configurar número e template, o MCP da Meta resolve, e uma plataforma de dados não acrescenta nada. Se a operação é pequena e a pergunta é qualitativa ("o que as pessoas estão pedindo"), ler as conversas com o consentimento e o cuidado devidos é mais honesto do que montar pipeline. A Precisian não tem conector pronto declarado para o WhatsApp. O papel dela começa quando a métrica de conversa precisa cruzar com pedido, ERP e mídia: lake isolado por cliente na infraestrutura da Precisian, definição escrita na camada semântica e acesso pelo MCP da Precisian, na IA que o seu time já usa.

## O que este artigo não cobre?

**Não é orientação jurídica.** É a leitura dos textos oficiais, com data. Uso concreto de conversa de cliente com IA pede o encarregado de dados da empresa.

**Não avalia plataformas comerciais de atendimento** que oferecem MCP próprio sobre a Cloud API, nem o servidor de documentação da Meta. Não li a documentação delas para este texto.

**Não ensina a montar o endpoint do webhook.** A referência da Meta cobre o formato de cada tipo de mensagem.

Registro de método: as páginas da [Meta for Developers](https://developers.facebook.com/documentation/mcp/whatsapp-business-tools-mcp) foram lidas em 23/11/2026 por um leitor que renderiza o HTML, e as datas de atualização são as que cada página exibe.

---

Se o seu time quer perguntar à IA o que acontece no WhatsApp da loja, o primeiro passo é decidir que métrica responde a pergunta antes de decidir que servidor lê a conversa. [Veja um MCP governado respondendo](https://precisian.io/demonstracao?utm_source=blog&utm_medium=cta&utm_campaign=mcp-do-whatsapp&utm_content=texto) sobre um lake isolado, sem compromisso de contrato.
