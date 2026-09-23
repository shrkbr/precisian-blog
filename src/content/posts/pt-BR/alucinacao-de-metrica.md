---
title: "Alucinação de métrica: por que a IA dá um número diferente do seu dashboard"
description: "Alucinação de métrica é a IA calculando certo sobre uma definição que a empresa nunca escreveu. Dar a definição ao modelo levou a acurácia de 45,5% a 67,7%."
slug: "alucinacao-de-metrica"
lang: "pt-BR"
translationKey: "metric-hallucination"
publishedAt: 2026-09-17
tags: ["alucinacao-de-metrica", "camada-semantica", "dados-para-ia"]
draft: false
llmSummary: "Alucinação de métrica é a resposta numericamente correta e semanticamente errada que um agente de IA produz ao inferir uma definição de negócio que o esquema não codifica. Em teste de abril de 2026 com três modelos, fornecer as definições elevou a acurácia de 45,5–50,5% para 67,7–68,7%."
citations: ["https://arxiv.org/abs/2604.25149", "https://arxiv.org/abs/2411.07763", "https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027", "https://cube.dev/use-cases/llm-and-ai-semantic-layer"]
about: ["https://en.wikipedia.org/wiki/Hallucination_(artificial_intelligence)", "https://en.wikipedia.org/wiki/Semantic_layer", "https://precisian.io/datalake/"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
---

Alucinação de métrica é o erro em que um agente de IA devolve um número aritmeticamente correto sobre uma definição de negócio que a empresa nunca escreveu em lugar nenhum. O modelo não inventou o dado: ele adivinhou a regra. Num teste pareado de abril de 2026 com três modelos de fronteira, fornecer as definições de negócio como contexto elevou a acurácia das respostas de 45,5–50,5% para 67,7–68,7% ([Rumiantsau e Fokeev, 2026](https://arxiv.org/abs/2604.25149)).

> **Alucinação de métrica**: resposta numericamente correta e semanticamente errada, produzida quando o modelo precisa inferir uma definição de negócio que o esquema do banco não codifica.

## O que é alucinação de métrica?

O termo foi cunhado em inglês, como *metric hallucination*, pela [Cube](https://cube.dev/use-cases/llm-and-ai-semantic-layer), que vende camada semântica. Em português ele ainda não tem dono, e a ausência da palavra é parte do problema: sem nome, o erro é diagnosticado como "a IA errou", que leva a trocar de modelo em vez de arrumar o dado.

Você pergunta "qual foi a receita de agosto?". Existem quatro campos que poderiam responder isso: o bruto do e-commerce, o líquido depois de cancelamento, o que o ERP reconhece como faturado e o que a plataforma de mídia atribui. A pergunta não diz qual. O esquema do banco também não. O agente escolhe um, calcula corretamente e responde com um número.

O número está certo. A resposta está errada.

## Por que isso é diferente de alucinação de modelo?

Alucinação de modelo é o caso conhecido: o sistema afirma um fato que não existe, como um cliente que nunca comprou ou uma fonte que nunca foi publicada. É falha de geração, e melhora com modelo melhor.

Alucinação de métrica não melhora com modelo melhor, porque o modelo não errou nada. A informação que faltava nunca esteve disponível para ele.

| | Alucinação de modelo | Alucinação de métrica |
|---|---|---|
| O que o sistema faz | Inventa um fato | Escolhe uma definição entre várias plausíveis |
| A aritmética | Errada ou fabricada | Correta |
| Onde está a falha | No modelo | No dado, que não codifica a regra de negócio |
| Como se detecta | Conferindo se o fato existe | Conferindo qual definição foi usada, o que quase ninguém faz |
| O que corrige | Modelo melhor, *grounding*, verificação | Definição escrita, versionada e legível pela máquina |

As duas falhas pedem investimentos opostos. Tratar a segunda como se fosse a primeira é trocar de fornecedor de IA para resolver um problema de modelagem de dados, e o número continua errado depois da troca.

## O que acontece quando o agente encontra dois campos chamados "receita"?

Ele desempata sozinho, em silêncio, e não registra que desempatou.

O [Spider 2.0](https://arxiv.org/abs/2411.07763), publicado em novembro de 2024, montou um benchmark com 632 problemas de consulta extraídos de uso corporativo real, em bases que frequentemente passam de 1.000 colunas. O mesmo modelo que resolve 91,2% das tarefas do benchmark acadêmico anterior resolve 21,3% quando o esquema é de empresa de verdade.

A diferença entre 91,2% e 21,3% vem do esquema, não do modelo: é o mesmo modelo nos dois casos. Quanto mais a base cresce, mais decisões de significado ficam implícitas, e mais o agente precisa adivinhar para responder qualquer coisa.

Na prática, os pontos de desempate silencioso que mais aparecem são quatro, e no varejo brasileiro cada um tem um agravante local.

**Qual campo de data manda.** Pedido, pagamento ou faturamento. Com Pix, pedido e pagamento colapsam no mesmo instante e a diferença some, até entrar um boleto e voltar. O agente que aprendeu a tratar os dois como sinônimos passa a errar só na parte da base que tem boleto, e erro intermitente é o mais difícil de achar.

**O que entra e o que sai da conta.** Frete, imposto, desconto, cancelamento, devolução. Não existe resposta certa universal; existe a resposta que o financeiro da sua empresa usa. Se ela não está escrita, o agente escolhe a que o nome do campo sugere.

**Qual recorte conta como "cliente novo".** Primeira compra na marca, primeira compra no canal, ou primeira compra no período analisado. As três aparecem no mesmo relatório em empresas diferentes, e às vezes no mesmo relatório da mesma empresa.

**A mesma venda em duas fontes.** Loja própria e marketplace devolvem o mesmo pedido com identificadores diferentes. Sem regra de deduplicação escrita, o agente soma, e a receita do mês nasce inflada com aritmética impecável.

## Por que a resposta errada soa mais confiante que a certa?

Porque o agente não tem onde registrar a dúvida. Um analista humano pergunta "receita bruta ou líquida?" antes de responder. O agente resolve a ambiguidade internamente e entrega o resultado no mesmo tom de qualquer outro.

Os autores do teste de abril colocam as duas falhas na mesma origem: resposta incorreta e alucinação confiante nascem de o modelo ser forçado a inferir a semântica de negócio que o esquema não codifica ([Rumiantsau e Fokeev, 2026](https://arxiv.org/abs/2604.25149)). O experimento deles é deliberadamente modesto: um documento de 4 KB descrevendo medidas, convenções e regras de desambiguação. Esse texto moveu a acurácia em 17 a 23 pontos percentuais, sem trocar de modelo e sem ferramenta nova.

Enquanto uma pessoa faz a pergunta e confere o resultado contra o que conhece do negócio, o erro é pego. Quando a mesma pergunta entra numa automação que roda toda segunda-feira, ninguém confere, e a definição errada vira série histórica.

A previsão do Gartner de junho de 2025 é que mais de 40% dos projetos de IA agêntica sejam cancelados até o fim de 2027, por custo, valor incerto e controle de risco insuficiente ([Gartner, 2025](https://www.gartner.com/en/newsroom/press-releases/2025-06-25-gartner-predicts-over-40-percent-of-agentic-ai-projects-will-be-canceled-by-end-of-2027)). Valor incerto é o que acontece quando ninguém consegue afirmar se a resposta do agente está certa.

## Como saber se isso já está acontecendo na sua operação?

Três verificações, em ordem de esforço. Nenhuma exige ferramenta nova, e as três produzem o mesmo entregável: uma lista das definições que hoje só existem na cabeça de alguém. Essa lista é o ponto de partida da correção, e costuma ser mais curta do que se teme.

**Faça a mesma pergunta duas vezes, em sessões separadas.** Se os números divergirem, o agente está desempatando na hora, e o desempate não é estável.

**Peça a definição junto com o número.** "Qual foi a receita de agosto e qual regra você usou?" Se a resposta descrever a regra em prosa em vez de citar uma definição registrada, ela foi construída no momento.

**Dê a mesma pergunta ao agente e a uma pessoa que conhece o negócio, sem que uma veja a resposta da outra.** A distância entre as duas é o tamanho do que está implícito.

Nós passamos seis meses tentando plugar agente em dado não modelado antes de aceitar esse diagnóstico. O agente puxava de qualquer lugar, porque não havia mapeamento de indicador nem auditoria do dado, então ele não sabia de onde puxar. A conclusão que tiramos foi que o problema nunca foi de IA: era de dado. A correção é escrever as definições num lugar versionado e auditável, e fazer o agente consultar dali. É isso que o [Precisian Lake](https://precisian.io/datalake/) entrega: camada semântica versionada sobre um data lake isolado por cliente, acessível por API aberta e por servidor MCP, para que o consumo aconteça na IA que o time já usa. O que está incluso e a faixa de entrada estão em [preços](https://precisian.io/precos).

## O que este artigo não cobre?

Não cobre implementação em ferramenta específica, nem comparação entre fornecedores de camada semântica. Também não trata de alucinação de modelo, que é outro problema com outra correção.

E há um limite honesto no dado citado: o teste de abril mede acurácia com e sem contexto semântico. Ele não publica uma taxa isolada de alucinação por modelo, então este artigo não afirma nenhuma. Quem precisar desse recorte vai ter que medir na própria operação.

Se dois relatórios da sua empresa divergem e ninguém sabe qual está certo, o primeiro passo é inventariar quais definições estão implícitas, antes de escolher qualquer agente. [Agende uma conversa sobre o seu caso](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).
