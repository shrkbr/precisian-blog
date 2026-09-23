---
title: "Como fazer a IA admitir que não sabe a resposta"
description: "Num comparativo que pune SQL errado, recusar todas as perguntas marca 50% e supera a maior parte dos sistemas em produção."
slug: "ensinar-a-ia-a-dizer-nao-sei"
lang: "pt-BR"
translationKey: "agent-abstention"
publishedAt: 2026-12-05
tags: ["camada-semantica", "confiabilidade", "mcp"]
draft: false
llmSummary: "Num comparativo que penaliza SQL errado, abster-se de todas as perguntas marca 50%, contra 29,8% a 54,5% dos melhores fluxos de texto-para-SQL. Abstencao baseada em ausencia de definicao e verificavel; baseada em confianca autodeclarada, nao."
citations: ["https://arxiv.org/abs/2403.15879", "https://arxiv.org/abs/2506.09038", "https://arxiv.org/abs/2509.04664", "https://arxiv.org/abs/2412.14737", "https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations"]
about: ["https://pt.wikipedia.org/wiki/Alucina%C3%A7%C3%A3o_(intelig%C3%AAncia_artificial)", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

Num comparativo que pune SQL errado, um sistema que se recusa a responder **todas** as perguntas marca 50%, e os melhores fluxos reais de texto-para-SQL marcam entre **29,8% e 54,5%**, dependendo de quão duramente o erro é cobrado ([TrustSQL](https://arxiv.org/abs/2403.15879)). A recusa universal, que é um sistema completamente inútil, bate a maioria deles.

Ou seja: não responder nada supera a maior parte dos sistemas em produção, assim que a resposta errada passa a custar alguma coisa. O problema inteiro cabe nesse número.

> **Abstenção**: o sistema recusar a resposta quando não tem base para acertar, em vez de produzir o melhor palpite.

## Por que o modelo chuta em vez de recuar?

Porque nada no caminho dele atribui custo ao chute.

Um modelo de linguagem produz a continuação mais provável. "Não sei" raramente é a continuação mais provável de uma pergunta bem formulada sobre dados que existem, mesmo quando a base para responder não está no contexto. O treinamento premia resposta útil; o silêncio não parece útil.

Some a isso o formato da saída. Uma resposta errada e uma certa saem com a mesma formatação, a mesma confiança e o mesmo tom. Quem lê não tem sinal para distinguir, e é [por isso que a alucinação de métrica é cara](https://precisian.io/blog/pt-BR/posts/alucinacao-de-metrica/): ela não se anuncia.

Num contexto de análise, a assimetria piora. Perguntas de negócio costumam ser ambíguas de um jeito que o modelo não percebe como ambiguidade. "Receita de agosto" tem pelo menos seis leituras defensáveis, e nenhuma delas gera erro de sintaxe.

## O que muda quando o erro tem preço?

Muda o ranking inteiro, e essa é a contribuição do comparativo.

O TrustSQL avalia sob penalidades crescentes para resposta errada. Sob a penalidade mais severa, a abstenção universal, que é um sistema inútil, ultrapassa quase tudo. Isso não significa que abster-se seja bom: significa que responder sem base é pior do que o placar habitual sugere, porque o placar habitual não cobra nada pelo erro.

A leitura prática para quem opera é incômoda: se o seu agente responde a toda pergunta que recebe, ele não está calibrado, está confiante. São coisas diferentes, e só uma delas é auditável.

E vale a inversão: a métrica que interessa não é "quantas perguntas ele responde". É **quantas ele responde certo, e quantas ele deixa de responder quando deveria**. O segundo número quase nunca é medido, porque não aparece em nenhum painel.

## Raciocínio resolve?

Ajuda em parte e introduz um problema próprio.

Trabalhos que mediram calibração em modelos de raciocínio encontram ganho em algumas tarefas e não em outras, e há um efeito documentado de o próprio raciocínio aumentar a confiança declarada sem aumentar a acurácia na mesma proporção ([arXiv 2506.09038](https://arxiv.org/abs/2506.09038)).

Traduzindo para o caso de análise: um modelo que "pensa mais" sobre uma pergunta ambígua tende a produzir uma justificativa mais convincente para a interpretação que escolheu, não a perceber que havia escolha. A cadeia de raciocínio é lida por humanos como evidência de rigor, e às vezes é evidência de elaboração.

Isso não é argumento contra raciocínio. É argumento contra tratar a explicação como verificação.

## Dá para perguntar ao modelo o quanto ele confia?

Dá, e o número que volta precisa ser tratado com cuidado.

Confiança autodeclarada é ela própria uma saída do modelo, sujeita aos mesmos vieses da resposta. A literatura de calibração mostra que a correlação entre confiança declarada e acerto varia bastante por tarefa e por modelo ([arXiv 2509.04664](https://arxiv.org/abs/2509.04664), [arXiv 2412.14737](https://arxiv.org/abs/2412.14737)), e que ela costuma ser melhor para ordenar respostas entre si do que para dizer em termos absolutos se aquela resposta está certa.

Uso defensável: usar a confiança para **priorizar revisão humana**, mandando as de menor confiança primeiro. Uso indefensável: usar a confiança como portão automático que libera a resposta sem revisão acima de um limiar.

A diferença é quem assume o risco. No primeiro caso, uma pessoa; no segundo, um número que o próprio sistema inventou sobre si mesmo.

## O que os fornecedores recomendam?

Coisas mais simples do que o mercado supõe, e que quase ninguém implementa.

A documentação da Anthropic sobre reduzir alucinação recomenda, entre outras práticas, dar permissão explícita ao modelo para dizer que não sabe, pedir citação direta do material de contexto antes da resposta, e verificar a resposta contra a fonte ([Anthropic](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations)).

A primeira parece trivial e não é. Sem instrução explícita, o modelo trata "não sei" como falha de desempenho. Com instrução explícita, a abstenção vira uma saída legítima entre as disponíveis.

A segunda é a mais subestimada num contexto de dados: exigir que a resposta cite a origem, a definição usada e o recorte. Resposta que não consegue citar é resposta que não consegue ser conferida, e num relatório isso equivale a não ter resposta.

## A camada semântica ajuda nisso?

Ajuda mais do que qualquer instrução de prompt, porque muda o que o modelo precisa adivinhar.

A maior parte das respostas erradas em análise não vem de o modelo errar SQL. Vem de ele escolher, sem avisar, uma entre várias interpretações possíveis da pergunta. Se "receita" tem uma definição única, aplicada pelo sistema antes do cálculo, essa escolha deixa de existir, e com ela desaparece a categoria de erro mais comum.

Mais importante: quando existe uma definição, existe também a possibilidade de **detectar que a pergunta não tem correspondência**. Um agente que consulta [uma camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/) pode descobrir que a métrica pedida não está definida, e isso é uma condição verificável, não uma sensação. Abstenção baseada em ausência de definição é confiável de um jeito que abstenção baseada em autoconfiança nunca será.

A mesma lógica vale para recorte de dado: se a ferramenta devolve a atualidade junto do valor, o agente pode recusar responder sobre uma semana que a tabela ainda não cobre. É recusa por fato, não por humildade simulada.

## Qual pergunta ele deveria recusar?

Quatro categorias, e nenhuma depende de o modelo se sentir inseguro.

**Métrica não definida.** O usuário pede "margem de contribuição" e não existe definição registrada. A recusa correta nomeia o que falta e sugere quem decide, em vez de inventar uma fórmula plausível.

**Recorte fora do dado disponível.** Pergunta sobre um período que a tabela não cobre, ou sobre um canal que nunca foi integrado. A ferramenta sabe disso e pode devolver o intervalo real em vez de calcular sobre o que encontrou.

**Pergunta ambígua entre definições existentes.** Quando "receita" pode ser duas coisas já definidas, a resposta certa não é escolher: é perguntar qual, ou devolver as duas rotuladas. Escolher em silêncio é o comportamento que produz a divergência que ninguém explica depois.

**Pergunta causal disfarçada de descritiva.** "Por que as vendas caíram" não é respondível com uma consulta, por mais bem modelada que a base esteja. Um agente que responde essa com uma correlação está produzindo narrativa, não análise, e o formato da saída não avisa.

Repare que as quatro são condições **verificáveis pelo sistema**, não estados mentais do modelo. É essa a diferença entre abstenção confiável e humildade simulada.

## O que dá para implementar esta semana?

Quatro coisas, em ordem de retorno.

**Autorize a abstenção explicitamente.** Uma frase na instrução do sistema dizendo que "não sei" e "essa métrica não está definida" são respostas aceitáveis e preferíveis ao palpite. Custa nada e muda o comportamento.

**Exija citação da definição usada.** Toda resposta numérica devolve junto qual definição aplicou, qual recorte de data e qual fonte. Resposta sem isso é rejeitada antes de chegar ao leitor.

**Faça a ferramenta falhar em vez de aproximar.** Se o agente pede uma métrica inexistente, a ferramenta deve devolver erro nomeando o que falta, e não a métrica mais parecida. Aproximação silenciosa é a origem de metade dos números errados.

**Registre a recusa como evento.** Toda vez que o agente se abstém, grave a pergunta e o motivo. Esse log vira, em poucas semanas, a lista priorizada do que falta definir na sua camada de dados, ordenada por demanda real em vez de por opinião.

**Meça a taxa de abstenção.** Se ela é zero, o sistema não está calibrado. Se ela é alta demais, a camada de definição está incompleta e o agente está certo em recusar. Nos dois casos o número é informação, e hoje quase ninguém o coleta.

## O que este artigo não cobre?

Não traz taxa de alucinação por modelo. Números desse tipo dependem de tarefa, de prompt e de dados, envelhecem em semanas, e os que circulam sem metodologia declarada vêm de quem vende a correção.

Não recomenda limiar de confiança. Qualquer número que eu sugerisse seria a configuração de outra pessoa, e o próprio ponto do artigo é que confiança autodeclarada não é boa como portão automático.

Cita os estudos de calibração pelo que eles medem, não como veredito geral. Calibração varia por tarefa e por modelo, e tratar um resultado como propriedade universal seria exatamente o tipo de generalização que este texto critica.

E não resolve o caso em que a resposta certa depende de dado que a empresa não coleta. Abstenção bem feita revela essa lacuna com clareza, o que já é um serviço: transforma "o sistema não respondeu" em "esse dado não existe na empresa", que é uma conversa com dono e prazo. Mas não a preenche, e nenhuma configuração de modelo vai preencher.
