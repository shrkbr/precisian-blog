---
title: "Quanto tempo guardar dado de marketing (o GA4 já decidiu)"
description: "No GA4 padrão são 2 ou 14 meses, e propriedade grande fica em 2. O relatório agregado sobrevive; a exploração, não."
slug: "quanto-tempo-guardar-dado-de-marketing"
lang: "pt-BR"
translationKey: "marketing-data-retention"
publishedAt: 2026-11-05
tags: ["governanca", "lgpd", "divergencia-de-dados"]
draft: false
llmSummary: "No GA4 padrao a retencao de dado de usuario e de evento e de 2 ou 14 meses; 26, 38 e 50 meses so no 360. Propriedades grandes ficam limitadas a 2 meses. A configuracao nao afeta relatorios agregados padrao, mas afeta exploracoes e funis."
citations: ["https://support.google.com/analytics/answer/7667196", "https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-publicacaooriginal-156212-pl.html", "https://docs.getdbt.com/reference/resource-properties/freshness"]
about: ["https://pt.wikipedia.org/wiki/Reten%C3%A7%C3%A3o_de_dados", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 9
---

A pergunta chega como política de governança e a resposta já está tomada por você. No GA4 padrão, dado de usuário e de evento pode ser retido por **2 ou 14 meses**, e só isso: as opções de 26, 38 e 50 meses são exclusivas do Analytics 360 ([Google](https://support.google.com/analytics/answer/7667196)). Passado o prazo, *"o dado é excluído automaticamente em base mensal"*.

São 2 ou 14 meses no plano padrão contra até 50 meses no Analytics 360, ou seja, a janela do plano pago é mais de três vezes maior que a do gratuito. O que torna isso perigoso, porém, não é o prazo em si. É o fato de o relatório continuar parecendo normal depois que o dado embaixo dele evaporou, sem erro, sem aviso e sem nenhuma marca visível de que a série ficou mais curta do que o eixo sugere.

> **Retenção não é arquivamento.** O prazo do GA4 governa o dado granular que alimenta exploração e funil. O relatório agregado continua respondendo, com o mesmo número de sempre, sobre um período cujo detalhe não existe mais.

## Qual é o prazo real, por tipo de dado?

Menor do que quase todo mundo supõe, e desigual entre os tipos.

| Tipo de dado | GA4 padrão | Analytics 360 |
|---|---|---|
| Dado de usuário | 2 ou 14 meses | 2 ou 14 meses |
| Dado de evento | 2 ou 14 meses | até 50 meses |
| Idade, gênero e interesse | 2 meses, sempre | 2 meses, sempre |
| Propriedade grande ou extragrande | 2 meses no nível de evento | conforme o plano |
| Relatório agregado padrão | não afetado | não afetado |

Fonte: [Google](https://support.google.com/analytics/answer/7667196).

Duas linhas dessa tabela derrubam suposição comum. A de idade, gênero e interesse é fixa: não existe configuração que a estenda. E a de propriedade grande significa que o teto de 14 meses, que o time acha que tem, pode não existir para o negócio dele.

## O que exatamente é apagado?

Só a parte que você usa quando precisa investigar.

A documentação separa as duas camadas com clareza: *"a configuração de retenção de dados não afeta relatórios agregados padrão (incluindo dimensões primárias e secundárias) na sua propriedade do Google Analytics, mesmo que você crie comparações nos relatórios"* ([Google](https://support.google.com/analytics/answer/7667196)). Mas afeta explorações e relatórios de funil.

Traduzindo para o dia a dia: o gráfico de sessões por mês continua lá, até anos atrás. A pergunta "quem eram essas pessoas, por onde entraram, o que fizeram antes de comprar" para de ser respondível assim que o prazo passa.

É o pior formato possível de perda, porque não gera erro. Gera uma exploração vazia, que a maioria das pessoas interpreta como filtro errado.

## Há limites que você não consegue configurar?

Dois, e os dois pegam exatamente quem mais tem dado.

Dados de idade, gênero e interesse têm retenção de dois meses sempre, independente do que você configurar. E propriedades grandes e extragrandes *"estão limitadas a 2 meses"* de retenção no nível de evento ([Google](https://support.google.com/analytics/answer/7667196)).

Leia essa segunda de novo. Quanto maior o e-commerce, menor a janela de dado granular que ele consegue manter na ferramenta. O negócio que mais precisaria de série histórica é o que menos pode guardá-la onde ela nasce.

Esse é o argumento inteiro para extrair dado para fora da ferramenta de analytics, e ele não é sobre sofisticação. É sobre o prazo acabar.

## Então quanto tempo você deveria guardar?

A pergunta certa não é quanto tempo, é para responder o quê.

Prazo sem pergunta vira ou desperdício ou arrependimento. Três horizontes cobrem quase tudo em e-commerce:

| Horizonte | Para quê | Consequência de não ter |
|---|---|---|
| **13 meses** | comparar com o mesmo mês do ano anterior | toda leitura de sazonalidade morre |
| **25 meses** | comparar duas Black Fridays completas | você não sabe se o ano foi bom ou se o mercado foi |
| **ciclo de vida do cliente** | recompra, valor ao longo do tempo, coorte | qualquer análise de retenção vira estimativa |

O terceiro é o que costuma estourar o prazo. Se o seu intervalo típico de recompra é de oito meses, uma janela de catorze meses mostra uma recompra por cliente e nenhuma coorte fechada.

E repare que **nenhum** desses três cabe em dois meses, que é o teto imposto às propriedades grandes.

## A LGPD não manda guardar menos?

Manda limitar, que não é a mesma coisa que apagar cedo.

A lei impõe o princípio da **necessidade**, definido como *"limitação do tratamento ao mínimo necessário para a realização de suas finalidades"*, e o da **finalidade**, *"realização do tratamento para propósitos legítimos, específicos, explícitos e informados ao titular"* ([LGPD](https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-publicacaooriginal-156212-pl.html)).

Isso não estabelece um prazo em meses. Estabelece que o prazo precisa ter justificativa ligada a uma finalidade declarada. "Guardamos tudo para sempre porque um dia pode ser útil" não passa nesse teste; "guardamos 25 meses de pedido para análise de sazonalidade e recompra, declarado na política" passa.

Há um ponto que costuma passar batido e que muda o desenho. O [artigo 12, §2º](https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-publicacaooriginal-156212-pl.html), prevê que *"poderão ser igualmente considerados como dados pessoais [...] aqueles utilizados para formação do perfil comportamental de determinada pessoa natural, se identificada"*.

Ou seja, a estratégia comum de "guardar tudo, mas sem identificador" só reduz o escopo se o resultado realmente não permitir remontar a pessoa. Uma tabela de comportamento que se junta ao pedido pelo número do pedido não é anônima, é pseudonimizada, e continua dentro.

A saída que resolve os dois lados é chata e funciona: guardar o **agregado** por muito tempo e o **granular identificável** por pouco. Receita diária por canal pode viver anos sem carregar dado pessoal. A trilha individual, não.

## Onde essa política deveria viver?

Num lugar que sobreviva à pessoa que a definiu, o que exclui a cabeça dela e a planilha dela.

Retenção é uma decisão que alguém toma uma vez e que ninguém revisita até doer. Por isso ela precisa de três coisas escritas: **qual finalidade justifica o prazo**, **quem é o dono da decisão**, e **quando ela será revista**. Sem a terceira, a política envelhece junto com o negócio: o prazo que fazia sentido quando o ciclo de recompra era de três meses continua lá quando ele vira dez.

Vale registrar junto o que foi descartado, e não só o que foi mantido. A pergunta que mais trava investigação futura não é "por que guardamos isso", é "onde está o resto". Uma linha dizendo que eventos de navegação não são retidos além de catorze meses economiza um dia de busca por um dado que nunca existiu.

E há um efeito de segunda ordem que aparece agora: quando o consumidor do dado passa a ser um agente de IA, a ausência silenciosa vira resposta errada com confiança. Uma pessoa que pede um recorte de dois anos e recebe quatorze meses percebe o corte no eixo do gráfico. Um agente calcula a média sobre o que encontrou e [responde com a mesma segurança de sempre](https://precisian.io/blog/pt-BR/posts/alucinacao-de-metrica/). A janela de retenção deixou de ser assunto de governança e virou insumo de resposta.

## Como saber se você já perdeu?

Com um teste de cinco minutos, hoje.

Abra uma exploração e peça um recorte granular de quatorze meses atrás. Não um relatório padrão: uma exploração, com dimensão de usuário. Se voltar vazia, o prazo já passou e você acabou de descobrir o limite real da sua série histórica.

Depois faça a mesma pergunta para a sua própria base. Se o dado foi extraído para um armazém, a pergunta vira outra: o extrator estava rodando naquele período? Ele guardou o evento cru ou só o resumo já agregado?

Essa segunda é a que costuma doer. É comum descobrir que o conector guardou desde sempre a métrica que alguém escolheu quando montou o conector, e descartou o resto, o que torna impossível responder qualquer pergunta que ninguém tinha pensado em fazer naquela época.

## O que guardar, na prática?

O evento cru, com o carimbo de quando foi coletado.

Essa é a regra que sobrevive a mudança de ferramenta, de time e de pergunta. Resumo você reconstrói a partir do evento; evento você não reconstrói a partir do resumo.

Três campos merecem disciplina especial. **O identificador nativo do evento**, para deduplicar reprocessamento. **O status no momento da coleta**, guardado como série e não sobrescrito, porque foi a sobrescrita que apagou o cancelamento que alguém vai pedir para explicar. E **a data da coleta**, separada da data do fato, que é o que permite reconstruir o que você sabia num momento passado.

Vale também vigiar se a captura parou. Ferramentas de transformação tratam isso como verificação de primeira classe: o dbt permite declarar um limiar de atualidade por fonte e falhar quando o dado mais recente passa da idade aceitável ([dbt](https://docs.getdbt.com/reference/resource-properties/freshness)). Sem esse alarme, pipeline parado é [indistinguível de semana fraca](https://precisian.io/blog/pt-BR/posts/vtex-ga4-nao-batem/) até alguém estranhar o número.

## O que este artigo não cobre?

Não diz qual é o prazo padrão do GA4 para propriedade nova. A página de documentação que li lista as opções disponíveis e não afirma qual vem marcada, e eu não vou declarar um padrão que a fonte não declara. Confira na sua própria propriedade, que leva menos tempo do que procurar a resposta.

Não trata de retenção em outras plataformas de anúncio. Cada uma tem regra própria e a comparação envelhece rápido; o padrão a procurar é o mesmo: o que o painel mostra agregado costuma viver mais do que o granular que o alimenta.

Não dá prazo legal. A LGPD fixa princípio, não número de meses, e quem transforma princípio em política de retenção para um negócio específico é o jurídico dele, não um artigo.

E não cita o texto de outros artigos da lei além dos citados. Só entra aqui o que li na fonte, aberta na frente.

Se a sua série histórica é mais curta do que você imagina, [vale uma conversa sobre o seu caso](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).
