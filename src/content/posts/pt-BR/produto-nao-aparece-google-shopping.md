---
title: "Por que seu produto não aparece no Google Shopping"
description: "No Brasil o preço tem que incluir imposto; nos EUA, excluir. Seguir tutorial americano dispara reprovação preventiva."
slug: "produto-nao-aparece-google-shopping"
lang: "pt-BR"
translationKey: "product-not-showing-google-shopping"
publishedAt: 2026-11-07
tags: ["google-shopping", "feed-de-produto", "divergencia-de-dados"]
draft: false
llmSummary: "No Brasil o preco enviado ao Merchant Center deve INCLUIR imposto, o inverso da regra dos EUA. Divergencia entre feed e pagina dispara reprovacao preventiva, que reprova por suspeita. GTIN nao e obrigatorio; brand e."
citations: ["https://support.google.com/merchants/answer/6324371", "https://support.google.com/merchants/answer/2948694", "https://support.google.com/merchants/answer/12488713", "https://support.google.com/merchants/answer/12159029", "https://support.google.com/merchants/answer/6150127", "https://support.google.com/merchants/answer/13585221", "https://support.google.com/merchants/answer/16989427"]
about: ["https://pt.wikipedia.org/wiki/Google_Shopping", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 9
---

A regra brasileira de preço é o **inverso** da americana, e cada revisão perdida custa de 3 a 5 dias úteis ([Google](https://support.google.com/merchants/answer/12488713)). A maior parte do material em português sobre o assunto é traduzida de lá. O Google manda informar o preço *"incluindo qualquer imposto sobre valor agregado"* numa lista de países que inclui o Brasil, e manda *"não incluir nenhum imposto"* ao segmentar Estados Unidos ou Canadá ([Google](https://support.google.com/merchants/answer/6324371)). Quem segue o tutorial errado cria uma divergência entre o feed e o próprio checkout, que é exatamente o gatilho da reprovação em bloco.

Antes de mexer em qualquer coisa, descubra em qual dos estados você está. Eles não são o mesmo problema.

## O produto está reprovado, limitado ou só em análise?

São cinco estados distintos, e três deles não são erro.

| Estado no painel | O que significa |
|---|---|
| **Processando** | atualização em andamento, *"pode levar até 15 minutos"* |
| **Em análise** | revisão, *"de 3 a 5 dias úteis"* para anúncios do Shopping |
| **Aprovado** | aparecendo normalmente |
| **Limitado** | *"aparece no Google, mas só em algumas situações"* |
| **Não aprovado** | *"não pode ser exibido no Google"* |

Fonte: [Google](https://support.google.com/merchants/answer/12488713).

A confusão mais cara é entre **Limitado** e **Não aprovado**. O primeiro está no ar, servindo pior. O segundo não está no ar. Tratar os dois com a mesma urgência desperdiça o tempo que deveria ir para o segundo.

Há também dois estados silenciosos que ninguém procura. Produtos entram na coluna "Precisa de atualização" *"30 dias após a última atualização"*, e itens ocultos *"serão arquivados automaticamente após 14 dias"* ([Google](https://support.google.com/merchants/answer/12488713)). Feed que parou de rodar não gera erro: envelhece.

## O problema é do item ou da conta?

Eixo diferente, e é o que decide se você conserta uma linha ou o negócio inteiro.

A documentação separa em duas frases: *"problemas no nível do produto afetam apenas produtos individuais, não sua conta inteira"*, enquanto *"problemas no nível da conta afetam todos os seus produtos"* ([Google](https://support.google.com/merchants/answer/2948694)).

E dentro de cada eixo há uma gradação que importa. Produtos com **aviso** *"continuam aparecendo no Google, mas a performance pode ser limitada"*. Produtos **reprovados** *"param de aparecer"*. E, no nível da conta, se os problemas não forem resolvidos dentro do prazo, *"sua conta será suspensa e seus produtos serão desativados"*.

Cruzando os dois eixos você tem quatro situações reais, e só uma delas é emergência: reprovação no nível da conta.

## Por que produtos que estavam bem ontem reprovaram em bloco?

Quase sempre por um mecanismo que quase nenhum material em português menciona.

O Google chama de **reprovação preventiva de itens**, e documenta assim: ela *"ocorre se o preço ou a disponibilidade dos seus produtos não corresponderem entre os dados do produto e as páginas de destino"*. E completa: *"quando ela está em vigor, pecamos pelo excesso de cautela e reprovamos produtos que provavelmente violam nossos requisitos"* ([Google](https://support.google.com/merchants/answer/2948694)).

Leia a segunda frase de novo. O Google não reprova só o que conferiu: reprova o que **suspeita**, por associação, depois de detectar divergência. É por isso que o sintoma é sempre o mesmo, e sempre desconcertante: nada mudou no feed, e centenas de SKUs caíram de uma vez.

O caminho de volta também está documentado: *"é necessária uma revisão para resolver esses problemas"*. Não passa sozinho.

## Como o Google detecta a divergência de preço?

Rastreando a sua página, e há uma armadilha técnica no meio.

A documentação é literal: *"o Googlebot rastreia rotineiramente as páginas de destino do seu site e compara o atributo de preço na sua fonte de dados com os preços na página de destino ou na marcação de dados estruturados"*. E então a parte que derruba loja moderna: *"o Googlebot rastreia os dados presentes no HTML retornado pelo seu servidor. Se os dados no seu site forem passados dinamicamente com JavaScript depois que a página carrega, isso vai gerar um erro"* ([Google](https://support.google.com/merchants/answer/12159029)).

Ou seja: preço que só aparece depois que o script roda não existe para o Google. A página parece certa para você e errada para quem rastreia.

Na disponibilidade a checagem é ainda mais ampla, comparando *"página de destino, página de checkout, dados estruturados e sua fonte de dados"* ([Google](https://support.google.com/merchants/answer/9773127)). A perna do checkout é a que pega a loja cuja página diz "em estoque" e cujo carrinho recusa o SKU.

E há um detalhe de automação que inverte a hierarquia que a maioria assume. Quando as automações estão ligadas, o Google usa o dado da página para corrigir o feed, com exemplo próprio: se o envio mais recente traz um produto a US$ 4 e a página lista US$ 3, *"vamos atualizar o produto para US$ 3"* ([Google](https://support.google.com/merchants/answer/12157888)). **Quem ganha a disputa é a página, não o feed.**

## GTIN é obrigatório?

Não, e essa é a informação desatualizada mais repetida em português.

A especificação marca `gtin` como **"depende"**, com a orientação de que é *"recomendado para todos os produtos com um GTIN atribuído pelo fabricante"*, e um aviso que vale ouro: *"forneça um GTIN apenas se tiver certeza de que está correto. Na dúvida, não forneça um GTIN"* ([Google](https://support.google.com/merchants/answer/6324461)).

O atributo realmente obrigatório para produto novo é **`brand`**, exigido *"para cada produto com uma marca ou fabricante claramente associado"* ([Google](https://support.google.com/merchants/answer/6324351)). O `mpn` só entra quando não há GTIN do fabricante.

Os obrigatórios de base são `id`, `title`, `description`, `link`, `image_link`, `availability` e `price` ([Google](https://support.google.com/merchants/answer/7052112)). Repare que existem agora `structured_title` e `structured_description` como alternativas: lista de "sete atributos obrigatórios" copiada de post antigo já está defasada.

No Brasil há duas exigências a mais que não aparecem em material traduzido: configurar frete é obrigatório, o país está explicitamente na lista, e a política de devolução entra como requisito de elegibilidade ([Google](https://support.google.com/merchants/answer/13889434)).

## Quanto tempo leva, afinal?

Depende da página do Google que você abrir, e isso não é ironia.

| O que | Prazo documentado |
|---|---|
| Processar atualização de feed | até 15 minutos |
| Revisão de produto | de 3 a 5 dias úteis |
| Pedido de revisão | até 7 dias úteis |
| Pedido de revisão (outra página) | de 3 a 7 dias úteis |
| Produto aprovado entra no ar | em até 24 horas |
| Revisão do site após corrigir preço | até 12 horas |
| Nova checagem de disponibilidade | de 24 a 48 horas |

Fontes: [status de produto](https://support.google.com/merchants/answer/12488713), [pedido de revisão](https://support.google.com/merchants/answer/13585221), [avisos e suspensões](https://support.google.com/merchants/answer/13693195) e [preço divergente](https://support.google.com/merchants/answer/12159029).

Três páginas vivas do Google dão três prazos diferentes para revisão. Nenhuma está errada; elas só não conversam. Quem promete um número exato não conferiu as outras duas.

## E se a conta for suspensa por Deturpação?

Aí o jogo muda, e o nome em português importa para você achar no painel.

A política chama-se **Deturpação**, não uma tradução literal de "misrepresentation". O texto de aplicação é o mais severo do conjunto: violações *"são consideradas graves"*, e se forem identificadas, *"suas Contas do Google serão suspensas imediatamente sem aviso prévio, e você não poderá mais promover produtos no Google Shopping"* ([Google](https://support.google.com/merchants/answer/6150127)).

As quatro subcategorias são práticas comerciais inaceitáveis, ofertas enganosas ou não realistas, omissão de informações relevantes e ofertas indisponíveis.

O processo de recurso tem regras que convém saber **antes** de usar a primeira tentativa: você tem *"apenas uma chance de discordar do problema"*; se não for resolvido na segunda tentativa, *"um período de espera de uma semana pode começar"*; o botão de revisão fica desabilitado nesse período; e o suporte *"não pode ignorar nem encurtar"* a espera, que *"pode aumentar a cada revisão malsucedida"* ([Google](https://support.google.com/merchants/answer/13585221)).

A leitura prática é dura: recurso é recurso limitado. Conserte de verdade antes de pedir revisão, porque pedir e falhar custa tempo de forma crescente.

## Por que isso não é só problema de feed?

Porque a divergência que o Google detecta costuma ser a mesma que já existia nos seus relatórios.

Preço no feed, preço na página e preço no checkout são três lugares onde o mesmo número devia ser igual e frequentemente não é, pela mesma razão que [plataforma e analytics não batem](https://precisian.io/blog/pt-BR/posts/vtex-ga4-nao-batem/): cada sistema calcula sobre uma definição própria, com ou sem imposto, com ou sem frete, em momentos diferentes do pedido.

O Merchant Center só é o primeiro lugar onde isso vira consequência visível, porque é o único que reprova. O relatório interno não reprova nada: ele apresenta o número divergente com a mesma naturalidade de sempre, e alguém concilia na mão todo mês.

Vale a inversão de leitura, então. Reprovação por preço divergente não é um problema de integração com o Google. É um sintoma de que a definição de preço não está escrita num lugar único que todos os sistemas leiam, que é a [mesma falha que separa marketing de financeiro](https://precisian.io/blog/pt-BR/posts/mesma-definicao-de-receita/). Consertar o feed resolve a reprovação desta semana. Escrever a definição resolve a categoria.

## O que muda em 2027?

Uma regra de imagem que já está gerando aviso, mas ainda não reprova.

A atualização da especificação estabelece o mínimo de 500 por 500 pixels, com avisos desde abril de 2026, e a **reprovação só começa a valer em 31 de janeiro de 2027** ([Google](https://support.google.com/merchants/answer/16989427)).

Isso significa que quem escreve hoje que "imagem abaixo de 500 por 500 é reprovada" está errado, e quem ignora o aviso vai ser reprovado no ano que vem. O intervalo entre as duas datas é o tempo que você tem.

A mesma atualização acrescenta atributos novos, entre eles horário de corte de processamento, valor mínimo de pedido e link de vídeo.

## O que este artigo não cobre?

Não diz qual é a causa mais comum de reprovação. O Google não publica ranking de frequência e não encontrei nenhum de fonte primária. Toda lista de "principais causas" que circula está ordenada por opinião de quem a escreveu.

Não dá tolerância de divergência de preço. Procurei especificamente por um limite percentual na documentação de preço divergente e ele não existe ali. Quem afirma que existe uma margem percentual tolerada está inventando um número que o Google não publicou.

Não afirma que "Pendente" e "Em análise" são o mesmo estado. Os dois termos aparecem em páginas diferentes e não encontrei documento que os concilie. Parecem deriva de terminologia, e trato como tal.

E não traz data de atualização das páginas citadas. Nenhuma delas expõe data visível de publicação. Tudo aqui está datado por **quando eu li**, em setembro de 2026, que é a única afirmação honesta possível sobre a atualidade dessas fontes.

Se o seu feed reprova em bloco sem ninguém ter mexido nele, [vale uma conversa sobre o seu caso](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).
