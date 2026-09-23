---
title: "Marketing e financeiro nunca fecham o mesmo número de receita"
description: "Os dois números estão certos. A norma contábil reconhece receita na transferência de controle; o marketing mede no checkout."
slug: "mesma-definicao-de-receita"
lang: "pt-BR"
translationKey: "same-revenue-definition"
publishedAt: 2026-10-24
tags: ["camada-semantica", "divergencia-de-dados", "governanca"]
draft: false
llmSummary: "Marketing e financeiro divergem na receita porque a norma contabil reconhece receita quando o cliente obtem o controle do bem, nao quando paga. Sao eventos em datas diferentes. Contrato de dados protege forma, nao significado: nao existe NOT NULL para semantica."
citations: ["https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/", "https://www.cpc.org.br/CPC/Documentos-Emitidos/Pronunciamentos/Pronunciamento?Id=105", "https://docs.getdbt.com/reference/resource-properties/constraints"]
about: ["https://pt.wikipedia.org/wiki/Receita_(contabilidade)", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 9
---

O marketing fecha o mês com um número de receita, o financeiro fecha com outro, e a reunião vira uma caça ao erro que não existe. Os dois estão certos. O financeiro segue uma norma de cinco etapas em vigor desde 2018 que diz quando a receita pode ser reconhecida ([IFRS Foundation](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/)). O marketing mede no checkout. São eventos diferentes, em datas diferentes, por motivos legítimos dos dois lados.

A tentativa de "alinhar os times" falha porque trata como descuido o que é diferença de definição. Ninguém vai convencer o contador a reconhecer receita mais cedo.

## O que a norma contábil manda o financeiro fazer?

Reconhecer a receita quando o cliente obtém o controle do produto, não quando paga.

O texto é direto: a entidade *"reconhece receita quando uma obrigação de desempenho é satisfeita pela transferência de um bem ou serviço prometido ao cliente (que é quando o cliente obtém o controle desse bem ou serviço)"*, num valor que reflete *"a contraprestação à qual a entidade espera ter direito"* ([IFRS Foundation](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/)). No Brasil, o pronunciamento de mesmo objeto é o [CPC 47, Receita de Contrato com Cliente](https://www.cpc.org.br/CPC/Documentos-Emitidos/Pronunciamentos/Pronunciamento?Id=105).

Para um e-commerce, a consequência é concreta: em boa parte das operações o controle transfere na **entrega**, não no pagamento. O pedido de 28 de setembro que chega no dia 3 de outubro é receita de outubro para o financeiro e é setembro para o marketing.

Não há erro a corrigir aí. Há dois relógios.

## Quantas definições de receita existem na sua empresa?

Mais do que você imagina, e todas defensáveis.

| Definição | Quem usa | Quando conta |
|---|---|---|
| Valor do pedido no checkout | mídia, analytics | no evento de compra |
| Pedido menos cancelamento | operação | dias depois |
| Pedido menos devolução | comercial | semanas depois |
| Com ou sem frete | varia por time | no mesmo instante |
| Com ou sem imposto | financeiro vs marketing | no mesmo instante |
| Receita reconhecida | contabilidade | na transferência de controle |

Seis leituras do mesmo mês. Nenhuma inventada. Cada uma responde a uma pergunta diferente, e cada uma vira "receita" quando alguém exporta uma planilha sem rótulo.

O problema não é a existência das seis. É o fato de a palavra ser a mesma nas seis.

## E a receita de marketplace, entra onde?

Numa sétima linha, com relógio próprio.

Quando a venda acontece num marketplace, o pedido tem um valor bruto que o comprador pagou e um repasse líquido de comissão que chega à sua conta, em data que não é a do pedido. O relatório de marketing costuma ver o valor cheio. O extrato financeiro vê o repasse. A diferença é a comissão, e ela não é erro de ninguém: é o modelo do canal.

Some a isso o fato de que boa parte desses canais [não devolve origem de tráfego nenhuma](https://precisian.io/blog/pt-BR/posts/marketplace-buraco-negro-de-dados/), e você tem uma fatia da receita que nem por definição nem por atribuição conversa com o resto do relatório.

O tratamento prático é o mesmo do resto do artigo, com um cuidado a mais: marketplace precisa de campo próprio desde o começo. Quem empurra venda de marketplace para dentro da mesma coluna de "receita" da loja própria perde a capacidade de explicar a diferença depois, e essa explicação é exatamente o que vão pedir.

## Por que mais relatório não resolve?

Porque a divergência não está no dado. Está no nome.

Um número sem definição anexada é um número que o próximo leitor vai reinterpretar. Quando o marketing manda "receita: R$ 1,4 milhão" e o financeiro responde "aqui deu 1,26", os dois exportaram corretamente de sistemas corretos. O que faltou viajar junto foi a frase que diz **o que foi contado**.

É a mesma falha estrutural que faz [plataforma e analytics nunca baterem](https://precisian.io/blog/pt-BR/posts/vtex-ga4-nao-batem/) e que faz [a soma do ROAS passar do faturamento](https://precisian.io/blog/pt-BR/posts/roas-soma-maior-que-faturamento/). Em todos os casos, dois sistemas medem coisas parecidas com regras diferentes e ninguém escreveu as regras num lugar que os dois leiam.

## O contrato de dados não garante isso?

Não, e essa é a confusão mais comum de quem começou a organizar dados.

[Um contrato de dados](https://precisian.io/blog/pt-BR/posts/contrato-de-dados/) protege forma: nome de coluna, tipo, obrigatoriedade. Isso é real e vale a pena. Mas nenhuma restrição de banco impede que a coluna `receita` signifique bruta numa tabela e líquida na outra. As duas passam em qualquer validação. As duas são `numeric`. As duas estão certas pelo contrato.

E as garantias são mais fracas do que se imagina. Em Snowflake, BigQuery e Redshift, uma chave primária declarada num contrato existe *"apenas para fins de metadado"*, e o modelo é construído mesmo violando a restrição ([dbt](https://docs.getdbt.com/reference/resource-properties/constraints)). Se nem a unicidade da chave o banco cobra, o significado da coluna ele com certeza não cobra.

Significado não é tipo de dado. Não existe `NOT NULL` para semântica.

## Então como fechar a diferença?

Conciliando, não unificando. A tentativa de fazer os dois times usarem um número só é a abordagem que falha.

**Escolha um número oficial por pergunta, não um número oficial.** "Quanto vendemos" e "quanto podemos reconhecer" são perguntas distintas com respostas distintas. Forçar as duas no mesmo campo destrói informação.

**Escreva a definição junto com o número, sempre.** Todo relatório carrega o recorte: receita bruta de pedidos pagos, sem frete, sem imposto, por data de pedido. A frase é mais importante que o valor, porque o valor sem ela não é auditável.

**Meça a diferença em vez de escondê-la.** Uma ponte mensal entre o número do marketing e o do financeiro, com as linhas que explicam o caminho (cancelamento, devolução, frete, imposto, defasagem de entrega) transforma uma discussão recorrente num relatório de quatro linhas. Se a ponte não fecha, aí sim existe erro, e você sabe onde procurar.

**Registre quem decide.** Definição sem dono volta a divergir em três meses, porque a próxima pessoa que precisar de um número vai criar o dela.

## Onde essa definição deveria morar?

Num lugar único que tanto a consulta humana quanto o agente de IA leiam antes de calcular.

Essa é a função de uma [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/): a regra de negócio deixa de ser um acordo verbal entre pessoas e vira uma definição versionada que o sistema aplica. Quem pergunta "receita" recebe a receita definida, não a interpretação de quem escreveu a consulta naquele dia.

A urgência disso mudou de patamar com IA no meio. Uma pessoa que recebe um número estranho desconfia, pergunta, confere com o colega. Um agente responde com a coluna que encontrar, com a mesma confiança de sempre, e [a resposta errada sai formatada igual à certa](https://precisian.io/blog/pt-BR/posts/alucinacao-de-metrica/). Quando o consumidor do dado não sabe duvidar, a definição precisa estar no sistema, não no bom senso de quem lê.

## Por onde começar na segunda-feira?

Por uma tabela, não por um projeto.

Pegue a métrica que mais gera discussão, quase sempre receita, e escreva as definições que já existem hoje. Não as que deveriam existir: as que estão em uso, cada uma com o time que a usa e o sistema de onde sai. Costuma dar entre quatro e sete linhas, e a própria lista já é o diagnóstico.

Depois escolha os nomes. `receita_bruta_pedido`, `receita_liquida_reconhecida`. Nomes diferentes para coisas diferentes, mesmo que fique feio. Feio e inequívoco ganha de elegante e ambíguo toda vez que alguém precisa defender um número numa reunião.

Só então automatize. Automatizar antes de nomear apenas distribui a ambiguidade mais rápido.

Um teste barato diz se você já chegou lá: peça a duas pessoas de times diferentes o número de receita do mês passado, sem avisar por quê, e compare. Se vierem iguais, a definição está viva em algum lugar. Se vierem diferentes, você acabou de medir o custo do problema sem gastar nada, e tem o exemplo concreto que faltava para abrir a conversa com quem decide.

## Qual dos dois erros custa mais caro?

Usar o número do marketing para decidir dinheiro.

A receita medida no checkout é ótima para otimizar campanha: ela chega rápido, é granular e o viés dela é constante ao longo do mês. O problema aparece quando esse mesmo número vira base de comissão, de meta ou de projeção de caixa. Aí ele está sendo usado para uma pergunta que não responde, porque ainda não passou por cancelamento, devolução nem transferência de controle.

O inverso também acontece, e é mais silencioso: usar o número contábil para avaliar campanha. Ele chega tarde demais para corrigir mídia, e a defasagem de entrega faz o mês de uma campanha aparecer no mês seguinte, o que leva gente competente a desligar exatamente o que estava funcionando.

Cada número serve a uma decisão. O erro não é ter dois. É usar um deles fora do lugar, e isso acontece porque os dois se chamam "receita" na planilha.

## O que este artigo não cobre?

Não dá orientação contábil. O reconhecimento de receita depende do contrato, da modalidade de entrega e da estrutura da operação, e quem responde isso é o contador da empresa, com a norma na mão. O que está aqui é a consequência para o dado, não a regra fiscal.

Também não traz estatística de quantas empresas convivem com definições divergentes. Não encontrei levantamento com metodologia declarada sobre isso, e um número inventado sobre um artigo que fala de números inventados seria uma ironia cara demais.

E não recomenda ferramenta. O problema é de definição e de dono antes de ser de tecnologia, e nenhuma compra resolve a parte que é acordo entre pessoas.

Se a sua reunião de fechamento ainda começa com a conferência de qual número está certo, [vale uma conversa sobre o seu caso](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).
