---
title: "O que alimentar um MCP server com dados de e-commerce"
description: "A espec define a ferramenta como controlada pelo modelo. O que você expõe é a fronteira de segurança: exponha perguntas, não tabelas."
slug: "o-que-alimentar-um-mcp-server-ecommerce"
lang: "pt-BR"
translationKey: "mcp-ecommerce-data"
publishedAt: 2026-11-17
tags: ["mcp", "camada-semantica", "governanca"]
draft: false
llmSummary: "Num MCP server de e-commerce, exponha ferramentas com esquema de entrada fechado sobre um recorte modelado, nao acesso a tabela. A espec define a ferramenta como controlada pelo modelo e manda tratar anotacoes de ferramenta como nao confiaveis."
citations: ["https://modelcontextprotocol.io/specification/2026-07-28/server/tools", "https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization", "https://www.postgresql.org/docs/current/ddl-rowsecurity.html"]
about: ["https://pt.wikipedia.org/wiki/Com%C3%A9rcio_eletr%C3%B4nico", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

A especificação define a ferramenta como **controlada pelo modelo**: *"o modelo de linguagem pode descobrir e invocar ferramentas automaticamente com base no entendimento contextual e nos prompts do usuário"* ([spec MCP, revisão 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)). Isso muda a pergunta de projeto. O que você expõe não é uma conveniência: **é a fronteira de segurança**, porque quem escolhe o que chamar não é você.

A resposta curta para o que alimentar, então, é: perguntas, não tabelas.

> **Exponha ferramentas, não acesso.** Uma ferramenta `consultar_receita_por_canal` com esquema de entrada fechado é auditável. Uma ferramenta `executar_sql` sobre produção é acesso irrestrito com nome de ferramenta.

## Por que expor tabelas é o erro de projeto?

Porque devolve ao modelo uma decisão que deveria ter sido tomada antes.

Uma ferramenta que aceita SQL arbitrário sobre a base inteira transfere três responsabilidades de uma vez: escolher a tabela, escrever a regra de negócio e interpretar o resultado. As três eram suas. A primeira vira risco de acesso, a segunda vira divergência de número e a terceira vira [resposta errada formatada igual à certa](https://precisian.io/blog/pt-BR/posts/alucinacao-de-metrica/).

A espec é explícita sobre o que o servidor precisa garantir: servidores **devem** *"validar todas as entradas das ferramentas"*, *"implementar controles de acesso adequados"*, *"limitar a taxa de invocações"* e *"higienizar as saídas"*. Nenhuma dessas obrigações é cumprível quando a entrada é uma consulta livre.

E há a obrigação que fecha o caso: clientes **devem** *"considerar as anotações de ferramenta como não confiáveis, a menos que venham de servidores confiáveis"*. Ou seja, a descrição que você escreve não é uma garantia de comportamento para ninguém. Só o que a ferramenta **faz** é garantia.

## O que colocar, então, num e-commerce?

Um recorte modelado, com as perguntas que o negócio realmente faz.

| Ferramenta | Entrada fechada | Por que assim |
|---|---|---|
| `receita_por_periodo` | data inicial, data final, recorte | a definição de receita vive no servidor, não no prompt |
| `pedidos_por_canal` | período, canal, status | status explícito evita contar cancelado como venda |
| `produtos_mais_vendidos` | período, limite | limite fechado protege custo de consulta |
| `estoque_atual` | SKU ou categoria | leitura pontual, sem varredura |
| `comparar_periodos` | dois períodos, métrica | a comparação certa sai pronta, não montada |

Cinco ferramentas respondem a maior parte do que se pergunta na prática, e nenhuma delas precisa de acesso a tabela nenhuma. O que elas precisam é de uma definição de receita, de pedido e de canal que já tenha sido decidida, que é o trabalho de uma [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/).

Repare no ganho colateral: a lista acima também é a lista de tudo que o agente **pode** fazer. Auditoria de escopo vira leitura de cinco linhas.

## Qual dado NÃO deveria passar por ali?

O que o agente não precisa ver para responder a pergunta que você expôs.

A tentação é alimentar o servidor com a base inteira "para o caso de precisar". O efeito prático é que tudo que está no contexto pode sair dele, e a saída não precisa ser um vazamento deliberado: basta o agente citar no meio de uma resposta um dado que aquele usuário não deveria ler.

Três categorias merecem ficar de fora por padrão, e voltar só com justificativa:

**Dado pessoal identificável de cliente.** Nome, documento, endereço e telefone quase nunca são necessários para responder pergunta de negócio. Receita por canal não precisa saber quem comprou.

**Credencial e segredo de integração.** Token de marketplace, chave de gateway e senha de banco às vezes moram em tabela de configuração dentro do mesmo esquema. Uma ferramenta ampla os alcança sem querer.

**Dado de custo e margem, quando o consumidor é externo.** Se o servidor atende também a uma agência ou a um parceiro, margem por produto é exatamente o tipo de campo que ninguém pretendia compartilhar e que ninguém lembrou de excluir.

A regra que sobrevive: o recorte entregue ao servidor deveria ser montado por inclusão, listando o que entra, e não por exclusão, listando o que sai. Lista de exclusão sempre esquece a coluna nova.

## Como o esquema de saída ajuda?

Ele transforma "confio que o modelo entendeu" em "o cliente valida".

A espec permite declarar um esquema de saída, e quando ele existe, servidores **devem** *"fornecer resultados estruturados que estejam em conformidade com esse esquema"*, e clientes **devem** validá-los. O resultado estruturado viaja num campo próprio, separado do texto.

Na prática isso significa que `receita` volta como número com unidade declarada, não como frase. A diferença aparece quando o agente encadeia: número validado ele soma corretamente; frase ele interpreta, e interpretar é onde o erro entra.

Vale também aproveitar o canal de erro para ensinar. A espec separa erro de protocolo de erro de execução, e recomenda que clientes entreguem o segundo ao modelo *"para permitir autocorreção"*, com exemplo de mensagem que diz exatamente o que estava errado na entrada. Uma ferramenta que responde "período inválido: a data final é anterior à inicial" gera uma segunda tentativa correta. Uma que responde "erro" gera uma invenção.

## O que a espec obriga e quase ninguém faz?

Duas coisas, e as duas são baratas.

**Humano no circuito.** O texto é direto: *"para confiança, segurança e proteção, **deve** sempre haver um humano no circuito com a capacidade de negar invocações de ferramenta"*, e aplicações **devem** *"apresentar prompts de confirmação ao usuário para operações"*.

**Mostrar a entrada antes de chamar.** Clientes **devem** *"mostrar as entradas da ferramenta ao usuário antes de chamar o servidor, para evitar exfiltração de dado maliciosa ou acidental"*.

As duas existem pelo mesmo motivo: o modelo decide o que chamar, e conteúdo que ele lê pode conter instrução. Num e-commerce, o conteúdo que terceiros escrevem é abundante: nome de campanha, descrição de produto, ticket de suporte, avaliação de cliente.

## E a autenticação, o protocolo resolve?

Não obriga, e essa é a parte que mais surpreende quem chega agora.

O texto afirma que *"a autorização é OPCIONAL para implementações de MCP"* ([spec MCP](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization)). Quando você opta por ela, aí sim as exigências apertam: validar que o token foi emitido para aquele servidor, **nunca** repassar o token recebido do cliente, e declarar escopo mínimo, com o antipadrão nomeado, *"usar escopos curinga ou abrangentes"*.

Abaixo disso, no banco, vale a regra que já existia antes da IA: papel dedicado, somente leitura, que não é dono das tabelas e não tem atributo de contorno, porque *"superusuários e papéis com o atributo `BYPASSRLS` sempre contornam o sistema de segurança de linha"* ([PostgreSQL](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)).

Se a ferramenta expõe só perguntas, esse cuidado vira redundância barata. Se ela expõe SQL, ele é a única coisa entre o agente e a base.

## Como começar sem projeto grande?

Com uma ferramenta só, e a que gera mais pergunta repetida.

Escolha a consulta que alguém pede toda semana, geralmente receita por período com um recorte. Escreva a definição, feche o esquema de entrada, declare o esquema de saída e exponha isso. Uma ferramenta bem feita entrega mais valor do que dez ferramentas genéricas, porque a genérica devolve ao usuário o trabalho de saber o que pedir.

Duas conveniências de nomenclatura evitam dor depois. Nomes de ferramenta devem ficar *"entre 1 e 128 caracteres"* ([spec MCP](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)) e usar um conjunto restrito de caracteres. E se você agrega servidores, a espec avisa que colisão de nome acontece, com o exemplo de *"dois servidores cada um expondo uma ferramenta `search`"*, recomendando prefixar com identificador do servidor.

Por fim, evite carregar parâmetro sensível onde ele fica visível. A espec alerta que desenvolvedores **não devem** marcar *"parâmetros sensíveis (senhas, chaves de API, tokens, dados pessoais)"* para espelhamento em cabeçalho HTTP, porque esses valores ficam visíveis a intermediários de rede.

## O que este artigo não cobre?

Não recomenda implementação de servidor MCP. O campo se move mais rápido do que qualquer comparação publicada permanece correta, e uma lista de nomes envelheceria antes de ser útil.

Não traz número de adoção de MCP em e-commerce. Não encontrei levantamento com metodologia declarada, e o assunto é novo o suficiente para que qualquer porcentagem publicada hoje venha de amostra de conveniência.

Não descreve estado de sessão do protocolo, porque ele não existe: a própria espec afirma que *"o MCP não tem sessão em nível de protocolo"* e trata continuidade como um identificador explícito devolvido por uma ferramenta, o que é orientação não normativa dela.

E não trata da camada jurídica de dado pessoal, que incide sobre tudo isso e merece o próprio texto.

Se o seu plano é conectar um agente ao banco e ver no que dá, [vale uma conversa antes](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).
