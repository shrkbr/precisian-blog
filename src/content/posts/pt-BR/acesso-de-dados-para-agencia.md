---
title: "Dar acesso de dados para a agência sem entregar tudo"
description: "O GA4 tem 5 papéis e 2 restrições de dado, entre elas uma que esconde receita. O padrão de mercado é conceder Administrador."
slug: "acesso-de-dados-para-agencia"
lang: "pt-BR"
translationKey: "agency-data-access"
publishedAt: 2026-11-10
tags: ["governanca", "seguranca", "agencia"]
draft: false
llmSummary: "O GA4 oferece cinco papeis e duas restricoes de dado (sem metricas de custo, sem metricas de receita), e papeis do nivel de conta sao herdados por todas as propriedades. A maior parte do trabalho de agencia cabe em Leitor ou Analista, nunca em Administrador."
citations: ["https://support.google.com/analytics/answer/9305587", "https://support.google.com/google-ads/answer/9978556", "https://www.postgresql.org/docs/current/ddl-rowsecurity.html", "https://code.claude.com/docs/en/security"]
about: ["https://pt.wikipedia.org/wiki/Controle_de_acesso", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 9
---

O GA4 oferece 5 papéis e 2 restrições de dado que quase ninguém usa, entre elas uma que esconde métrica de receita e outra que esconde métrica de custo ([Google](https://support.google.com/analytics/answer/9305587)). O padrão de mercado, mesmo assim, é conceder Administrador e seguir a vida.

O problema não é a agência. É que "dar acesso" virou uma decisão binária num sistema que nunca foi binário.

> **Administrador no GA4** tem *"controle total do Analytics"* e pode *"gerenciar usuários (adicionar/excluir usuários, atribuir qualquer papel ou restrição de dado)"*. Quem recebe esse papel pode conceder acesso a terceiros sem passar por você.

## O que cada nível concede de fato?

Mais gradação do que a conversa de contrato costuma supor.

| Papel no GA4 | O que pode |
|---|---|
| **Administrador** | controle total, inclusive gerenciar usuários |
| **Editor** | *"controle total das configurações no nível da propriedade"*, sem gerenciar usuários |
| **Marketing** | criar e editar públicos, eventos e eventos-chave; editar modelo de atribuição |
| **Analista** | compartilhar explorações; criar, editar e excluir explorações |
| **Leitor** | ver configurações e dados, e criar explorações próprias |

Fonte: [Google](https://support.google.com/analytics/answer/9305587).

Repare onde a maior parte do trabalho de agência realmente cabe: **Analista** ou **Leitor**. Ler dado, montar exploração e entregar leitura não exige Editor, e nunca exige Administrador.

No Google Ads a escala é parecida. "Somente leitura" permite *"visualizar campanhas e usar ferramentas de planejamento"* e *"editar e executar relatórios de desempenho de campanha"*. Já Administrador *"pode conceder acesso à conta, alterar níveis de acesso e cancelar convites de outros usuários"* e *"adicionar ou remover vinculações de produto"* ([Google](https://support.google.com/google-ads/answer/9978556)).

Quem opera mídia precisa de Padrão para editar campanha. Quem apenas relata não precisa de nada além de somente leitura, e essa distinção costuma não ser feita porque ninguém pergunta qual das duas coisas a pessoa faz.

## As restrições de dado resolvem o resto?

Resolvem uma parte que quase ninguém sabe que existe.

O GA4 tem duas restrições aplicáveis por usuário: **sem métricas de custo**, *"não pode ver métricas relacionadas a custo"*, e **sem métricas de receita**, *"não pode ver métricas relacionadas a receita"* ([Google](https://support.google.com/analytics/answer/9305587)).

A segunda é a que interessa a quem tem margem sensível. Dá para liberar comportamento de navegação, funil e origem de tráfego sem liberar faturamento. É a diferença entre "a agência vê o que precisa" e "a agência vê quanto você fatura".

Não resolve tudo: quem tem acesso ao Google Ads vinculado vê custo de qualquer forma, e quem exporta o dado bruto contorna a restrição da interface. Mas é um controle gratuito, já disponível, que a maioria nunca abriu.

## Por que conceder no nível errado entrega tudo?

Por herança, e essa é a falha mais silenciosa da lista.

A documentação afirma que *"papéis do nível superior são herdados por padrão (por exemplo, conta > propriedade)"* ([Google](https://support.google.com/analytics/answer/9305587)).

Conceder Leitor na **conta** dá Leitor em **todas as propriedades** dela, inclusive as que você esqueceu que existem, inclusive a do site institucional, inclusive a de teste com dado de cliente real dentro. Conceder no nível da propriedade dá acesso àquela propriedade e só.

A regra prática cabe numa linha: **conceda sempre no nível mais baixo que resolve a tarefa.** Se a agência cuida de uma marca, ela não precisa de acesso na conta que contém as outras.

## E quando a agência precisa do banco, não do painel?

Aí o controle muda de lugar e fica mais fácil de errar.

O erro clássico é criar um usuário de banco "para a agência" reaproveitando um papel que já existia, geralmente o dono das tabelas. A documentação do PostgreSQL explica por que isso anula a proteção: políticas de linha restringem o que cada usuário vê, mas *"superusuários e papéis com o atributo `BYPASSRLS` sempre contornam o sistema de segurança de linha"*, e o dono da tabela também contorna, a menos que alguém escreva `ALTER TABLE ... FORCE ROW LEVEL SECURITY` ([PostgreSQL](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)).

O desenho correto é chato e curto: papel dedicado, somente leitura, que não é dono de nada, sem atributo de contorno, com política de linha aplicada e `FORCE` ligado. Sem política, o comportamento padrão é negar tudo, que é o lado seguro do erro.

Vale um detalhe de arquitetura que economiza discussão: o recorte deveria vir pronto. Entregar uma visão já filtrada, com as colunas que interessam, é diferente de entregar a base e confiar que ninguém vai olhar o que não deve. A primeira é uma decisão sua; a segunda é uma promessa da outra parte.

## Quem deveria auditar o resultado?

Não quem o produziu, e essa é uma razão de acesso, não de desconfiança.

A distinção prática é simples: quem executa a campanha precisa de permissão de **edição** na ferramenta de mídia, e quem confere o resultado precisa de **leitura** sobre o dado, incluindo o que a ferramenta de mídia não mostra. São dois acessos diferentes, com níveis diferentes, e juntá-los num só convite é o que produz a situação em que a única leitura disponível do resultado é a de quem tem interesse nele.

Isso não exige trocar de fornecedor nem montar time interno. Exige que o dado bruto, pedido, receita reconhecida e custo por canal, exista num lugar que você controla, e que o acesso a ele seja concedido separadamente do acesso operacional. A partir daí, qualquer leitura é conferível contra a mesma base.

O sintoma de que isso não existe é conhecido: o relatório mensal chega com números que ninguém consegue reproduzir, e a conversa termina em quem acredita em quem. Enquanto a origem do número for a ferramenta de quem operou, a resposta honesta sobre quanto a mídia produziu vai continuar sendo uma questão de confiança, não de conferência.

## O que acontece quando o contrato acaba?

Quase sempre nada, e esse é o problema real.

Acesso é concedido numa reunião e revogado em nenhuma. A lista de usuários de uma conta de e-commerce com alguns anos costuma conter ex-agências, ex-funcionários, ex-freelancers e pelo menos um e-mail que ninguém identifica.

Três hábitos resolvem quase tudo, e nenhum deles custa dinheiro:

**Revise a lista de usuários trimestralmente.** Abra o painel, leia os e-mails em voz alta e pergunte quem é cada um. O desconforto dessa leitura é o indicador.

**Trate o desligamento como parte do encerramento.** A mesma lista de verificação que devolve arquivo e senha deve remover acesso, no mesmo dia. Contrato encerrado com acesso vivo é um risco que ninguém está monitorando, justamente porque ninguém lembra dele.

**Conceda a pessoas, nunca a caixas compartilhadas.** Acesso dado a um e-mail coletivo da agência sobrevive à saída de quem o usava, e a trilha de auditoria perde a capacidade de dizer quem fez o quê. Se o log aponta para um endereço que quatro pessoas leem, a investigação futura termina ali.

## E se a agência colocar uma IA no meio?

A pergunta deixou de ser hipotética, e ela muda a conta.

Quando a agência conecta um assistente aos dados a que tem acesso, o alcance daquele acesso deixa de ser o que uma pessoa consegue ler manualmente e passa a ser o que um sistema consegue percorrer em minutos. O nível concedido continua o mesmo; a consequência dele, não.

Some a isso que o fornecedor do modelo não audita o servidor a que ele se conecta. A Anthropic declara sobre o próprio diretório que revisa conectores contra critérios de listagem *"but does not security-audit or manage any MCP server"*, e recomenda *"escrever seus próprios servidores MCP ou usar servidores de fornecedores em que você confia"* ([Anthropic](https://code.claude.com/docs/en/security)). A confiança é sua, e o acesso que você concedeu é o limite dela.

A pergunta a fazer no contrato deixou de ser "quem da sua equipe vai acessar" e passou a ser "**o que você vai conectar a esse acesso**". As duas respostas mudam o risco, e só a primeira costuma estar escrita. Vale ler também [o que contém um agente conectado a dado de produção](https://precisian.io/blog/pt-BR/posts/conectar-ia-sem-expor-a-base/) antes de decidir o nível.

## Por onde começar hoje?

Por um inventário de trinta minutos, não por uma política.

Liste quem tem acesso a quê, em cada ferramenta, com o nível. Só isso já costuma revelar dois ou três acessos que ninguém defenderia em voz alta. Depois reduza o que dá para reduzir sem quebrar a operação, que quase sempre é mais do que parece: a maior parte do trabalho de relatório vive confortavelmente em somente leitura.

E escreva o que ficou, com o motivo. Uma linha por acesso, dizendo para que serve. Sem isso, a próxima revisão vai começar do zero, porque ninguém lembra por que o acesso foi dado, e na dúvida ninguém remove. É a mesma lógica que faz [definição sem dono divergir de novo](https://precisian.io/blog/pt-BR/posts/mesma-definicao-de-receita/) alguns meses depois.

## O que este artigo não cobre?

Não descreve os níveis de acesso do Meta. A página de ajuda recusou leitura automatizada nas tentativas que fiz, e não vou descrever de memória um painel que muda de nome com frequência.

Não trata de cláusula contratual. O que um contrato de prestação de serviço deve prever sobre dado é assunto do jurídico da empresa, e um artigo que finge dar essa resposta presta um desserviço.

Não afirma que os papéis do Google Ads têm definições narrativas. A página que li apresenta as permissões numa tabela de marcações, não em descrições fechadas por nível, e as frases citadas aqui são permissões específicas, não definições oficiais de cada papel.

E não trata de acesso a dado pessoal sob a ótica de operador e controlador, que é uma camada jurídica inteira em cima desta, e merece o próprio texto.

Se você não sabe de cabeça quem tem Administrador nas suas contas, [vale uma conversa sobre o seu caso](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).
