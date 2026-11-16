---
title: "Split payment da reforma tributária: o que muda no dado de venda do e-commerce"
description: "A LC 214/2025 manda separar CBS e IBS na liquidação do pagamento. O valor creditado deixa de ser o valor da venda, e a conciliação ganha uma terceira chave."
slug: "split-payment-ecommerce"
lang: "pt-BR"
translationKey: "split-payment-ecommerce"
publishedAt: 2026-11-16
tags: ["ecommerce", "divergencia-de-dados", "integracao", "auditoria"]
draft: false
llmSummary: "O art. 31 da LC 214/2025 obriga o prestador de pagamento a segregar CBS e IBS na liquidação financeira. A Fase 1 oficial (Manual de Operações v1.0.1, set/2026) só vale para operações B2B opcionais e deixa cartões de fora; a venda ao consumidor ainda não tem data publicada."
citations: ["https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp214.htm", "https://www.planalto.gov.br/ccivil_03/leis/lcp/Lcp227.htm", "https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2026/junho/receita-federal-e-cgibs-publicaram-hoje-a-documentacao-tecnica-da-plataforma-publica-do-split-payment", "https://www.cgibs.gov.br/upload/arquivos/202609/24101007-split-payment-manual-de-operacoes-v1-0-1.pdf", "https://www.cgibs.gov.br/upload/arquivos/202609/24094106-ato-tecnico-conjunto-5-rfb-cgibs-assinado-assinado.pdf"]
about: ["https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp214.htm", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 9
cta: regua
---
No split payment, o prestador de pagamento separa a CBS e o IBS no momento em que liquida a transação e repassa esse valor ao governo antes de creditar o lojista. É o que manda o art. 31 da [Lei Complementar 214/2025](https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp214.htm). Para o dado de venda, o efeito é um só: o valor que entra na conta deixa de ser o valor do pedido menos a tarifa, e conciliar pedido com repasse passa a exigir a nota fiscal no meio.

O texto da lei, lido no Planalto em 16 de novembro de 2026, diz que os prestadores de pagamento *"deverão segregar e recolher ao Comitê Gestor do IBS e à RFB, no momento da liquidação financeira da transação (split payment), os valores do IBS e da CBS"* (art. 31, caput). A versão em vigor já traz as alterações da [Lei Complementar 227, de 13 de janeiro de 2026](https://www.planalto.gov.br/ccivil_03/leis/lcp/Lcp227.htm).

> **Aviso.** Este artigo não é orientação fiscal. Não diz quanto recolher, em que regime enquadrar a empresa nem quando a obrigação começa para ela. Descreve o que o texto legal e a documentação técnica oficial dizem sobre o fluxo do pagamento, e o que isso faz com a conciliação de dados. Para o resto, fale com quem assina a sua apuração.

## Já mudou alguma coisa na venda ao consumidor?

Ainda não, segundo a própria documentação oficial.

A Receita Federal e o Comitê Gestor do IBS publicaram em 3 de junho de 2026 a documentação técnica da Plataforma Pública do Split Payment ([Receita Federal](https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2026/junho/receita-federal-e-cgibs-publicaram-hoje-a-documentacao-tecnica-da-plataforma-publica-do-split-payment)). A versão vigente do [Manual de Operações](https://www.cgibs.gov.br/upload/arquivos/202609/24101007-split-payment-manual-de-operacoes-v1-0-1.pdf) é a 1.0.1, de setembro de 2026, aprovada pelo [Ato Técnico Conjunto nº 5, de 22 de setembro de 2026](https://www.cgibs.gov.br/upload/arquivos/202609/24094106-ato-tecnico-conjunto-5-rfb-cgibs-assinado-assinado.pdf). O manual chama o escopo atual de **Fase 1, B2B Opcional**.

| O que o Manual de Operações v1.0.1 define para a Fase 1 | Seção |
|---|---|
| Só operações entre pessoas jurídicas com CNPJ | 1.2 |
| Uso facultativo para quem origina a transação | 1.2 |
| Seis arranjos: boleto, Pix Dinâmico, Pix Automático, Pix Estático, TED e TEF | 1.2 e 2.2 |
| Fora do escopo: cartões de crédito, débito e pré-pago, vouchers, Pix iniciado por Open Finance | 1.2 |
| Modelo simplificado do art. 33 fora desta fase | 1.2 |
| "Experiência da Pessoa Física não é impactada" | 8.1 |

Fonte: [Manual de Operações do Split Payment, versão 1.0.1](https://www.cgibs.gov.br/upload/arquivos/202609/24101007-split-payment-manual-de-operacoes-v1-0-1.pdf), lido em 16/11/2026.

Para a venda a consumidor final, a lei dá a regra e não dá a data. O art. 35, § 1º, diz que o split *"deverá entrar em funcionamento de forma simultânea, nas operações com adquirentes que não são contribuintes do IBS e da CBS no regime regular"*, para os principais instrumentos de pagamento, definidos no § 3º como *"aqueles preponderantemente utilizados no setor de varejo"*. O § 2º entrega o calendário a um ato conjunto do Comitê Gestor e da Receita, que *"estabelecerá a implementação gradual"*. Não encontrei nas fontes oficiais data para essa etapa e não vou escrever uma.

Então, para o e-commerce que vende a pessoa física no cartão, o extrato de hoje não muda. Para quem vende a CNPJ por boleto ou Pix, o split já pode aparecer na Fase 1, se o originador da cobrança optar por ele.

## Qual é o sintoma quando o split chega ao seu extrato?

O repasse para de fechar com o pedido pela conta de sempre.

Hoje a conciliação de quem vende online tem duas pontas: o pedido na plataforma e o crédito do adquirente, do gateway ou do banco. A diferença entre elas é tarifa, parcelamento, antecipação e estorno, e todo time financeiro já tem a planilha que explica isso.

Com o split, aparece uma terceira subtração que não vem do contrato com o prestador de pagamento: o tributo segregado. E ela não é uma porcentagem fixa do pedido. O valor depende do que estava na nota, do que o governo devolveu como correção e de quanto do débito já tinha sido quitado por outro meio. O financeiro vê o crédito menor e não acha a regra na tabela de tarifas, porque a regra está no documento fiscal.

## Por que o valor creditado deixa de ser o valor da venda?

Porque a lei põe o tributo no caminho do dinheiro, e a documentação técnica define cinco valores de tributo diferentes para a mesma transação.

**O momento é a liquidação.** O art. 34, inciso I, da [LC 214/2025](https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp214.htm) fixa que a segregação e o recolhimento *"ocorrerão na data da liquidação financeira da transação de pagamento"*. O inciso II manda, no pagamento parcelado pelo fornecedor, segregar *"de forma proporcional, na liquidação financeira de todas as parcelas"*. E o inciso III fecha a porta da antecipação: *"a liquidação antecipada de recebíveis não altera a obrigação de segregação e de recolhimento"*. O manual detalha que a antecipação *"não caracteriza, por si só, Pagamento ou Liquidação Financeira"* (seção 6.1.1).

**O vínculo é a nota.** No procedimento padrão ([art. 32, § 1º](https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp214.htm)), quem origina a transação transmite ao prestador informações que permitam *"a vinculação das operações com a transação de pagamento"* e *"a identificação dos valores do IBS e da CBS incidentes sobre as operações"*. No manual, isso vira um campo chamado Documento Fiscal, preenchido com a **chave de acesso** da nota (Apêndice A). Cada transação aceita um único Documento Fiscal (seção 3.4.2).

**O valor pode mudar até a liquidação.** O [art. 32, § 3º](https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp214.htm) manda o prestador consultar o sistema do governo *"antes da disponibilização dos recursos ao fornecedor"*. O manual traduz isso em cinco categorias de valor:

| Categoria | Quem gera | Para que serve |
|---|---|---|
| CBS/IBS Informado | Quem origina a transação | Valor declarado na emissão da cobrança |
| CBS/IBS Corrigido | Receita e Comitê Gestor, via Plataforma Pública | Substitui o informado quando diverge da nota vinculada |
| CBS/IBS Em Aberto | Receita e Comitê Gestor, via Plataforma Pública | Teto do que ainda falta recolher daquela nota |
| CBS/IBS Segregado | Prestador do recebedor (ou a Núclea, no boleto) | Valor efetivamente separado e repassado ao governo |
| CBS/IBS Aplicado | Prestador do pagador | Valor exibido ao pagador como carga da transação |

Fonte: [Manual de Operações v1.0.1](https://www.cgibs.gov.br/upload/arquivos/202609/24101007-split-payment-manual-de-operacoes-v1-0-1.pdf), seção 2.3.

**A fórmula tem três termos e um truncamento.** Nos arranjos em que o recebedor emite a cobrança (boleto, Pix Dinâmico, Pix Automático), o valor segregado é `R = mín((Vp / Vt) × C ; C ; A)`, onde `Vp` é o valor pago, `Vt` o valor original, `C` o tributo corrigido ou informado e `A` o tributo em aberto (seção 5.2). O resultado é *"sempre arredondado para baixo"* no centavo: R$ 12,35954 vira R$ 12,35 (seção 5.3). Pagamento acima do original, por multa ou juros, não aumenta o tributo segregado (seção 5.1).

**O repasse ao governo é consolidado.** O prestador não repassa transação a transação. Faz um repasse por dia útil por arranjo, um para a CBS e outro para o IBS (seção 6.2). Quem quiser saber quanto de tributo saiu de um pedido específico precisa da linha da transação no arquivo de retorno, não do total do dia.

### Um exemplo com números redondos

Os valores abaixo são **sintéticos**, escolhidos para a conta fechar de cabeça. Não representam alíquota de nada.

Um lojista B2B emite um boleto com CBS e IBS informados e recebe um pagamento parcial. O governo não devolveu correção nem valor em aberto, então vale a fórmula da [seção 5.2 do manual](https://www.cgibs.gov.br/upload/arquivos/202609/24101007-split-payment-manual-de-operacoes-v1-0-1.pdf) só com os dois primeiros termos.

| Linha (valores sintéticos) | Conta | Valor |
|---|---|---|
| Valor original do boleto (`Vt`) | | R$ 1.000 |
| CBS informada / IBS informado (`C`) | | R$ 80 / R$ 120 |
| Valor pago (`Vp`) | | R$ 600 |
| CBS segregada | mín(0,6 × 80 ; 80) | R$ 48 |
| IBS segregado | mín(0,6 × 120 ; 120) | R$ 72 |
| Crédito ao lojista, antes da tarifa do banco | 600 − 48 − 72 | R$ 480 |

No relatório de vendas, o pedido continua valendo mil reais. No extrato entram quatrocentos e oitenta. A diferença tem três explicações diferentes (saldo em aberto, tributo, tarifa), e só uma delas está no contrato com o banco.

## Como diagnosticar se a sua base está pronta?

Rode estas cinco verificações. Nenhuma exige saber de tributo: são perguntas sobre onde o dado mora.

| Verificação | Onde olhar | O que indica problema |
|---|---|---|
| A chave de acesso da nota está gravada no registro do pedido? | Tabela de pedidos do ERP ou do lake | Nota só existe no emissor fiscal, sem chave no pedido |
| O arquivo de retorno do banco ou PSP tem colunas de CBS, IBS e Documento Fiscal? | Layout do arquivo de retorno ou da API de extrato | Só valor bruto, tarifa e líquido |
| A sua métrica de receita lê valor do pedido ou valor creditado? | Definição usada no relatório financeiro e no de marketing | Ninguém sabe dizer, ou cada área lê um |
| Pagamento parcial, parcelado e antecipado têm status próprio? | Tabela de transações | Tudo cai como "pago" com um valor só |
| Venda por plataforma de terceiros tem a perna de pagamento identificada? | Pedidos de marketplace | Repasse do marketplace chega somado, sem ligação com a nota |

O segundo item é o que mais costuma faltar. O manual exige que os arquivos de retorno para clientes PJ incluam *"os campos fiscais (CBS, IBS e Documento Fiscal) permitindo a conciliação contábil e fiscal"* (seção 8.1, princípio 4). Se o seu ERP lê o arquivo e descarta as colunas que não conhece, o dado chega e morre na carga.

O primeiro item quase sempre falta em operação que emite nota por um sistema e vende por outro. É o mesmo buraco que já aparece quando se tenta casar [o que o ERP devolve de dado de venda](https://precisian.io/blog/pt-BR/posts/o-que-o-erp-devolve-de-dado-de-venda/) com o pedido da loja.

## Como corrigir antes que o extrato mude?

Três mudanças de modelo, nenhuma de alíquota.

**Trocar a chave de conciliação.** Hoje a junção é pedido ↔ transação, por identificador do gateway ou do boleto. Com o split, a junção completa é pedido ↔ chave de acesso da nota ↔ transação. Gravar a chave de acesso no pedido no momento da emissão custa pouco agora e é caro de reconstruir depois.

**Separar as colunas do repasse.** Em vez de "valor bruto, tarifa, líquido", guardar valor original, valor pago, CBS e IBS segregados, tarifa do prestador e valor creditado, cada um na sua coluna e com a data da liquidação. Assim, um crédito menor tem causa rastreável linha a linha, e um pagamento parcial não se confunde com tributo.

**Escrever qual valor é "receita" em cada relatório.** O marketing mede venda no checkout; o financeiro reconhece receita por outra regra, e os dois [nunca fecham o mesmo número](https://precisian.io/blog/pt-BR/posts/mesma-definicao-de-receita/). O split acrescenta uma terceira leitura possível, o valor creditado, e quem calcula [margem de contribuição por pedido](https://precisian.io/blog/pt-BR/posts/margem-de-contribuicao-ecommerce/) vai precisar decidir se o imposto vem da nota ou do extrato. A decisão é do seu contador. O que não pode é cada relatório decidir sozinho.

Esse terceiro ponto é onde uma [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/) entra: a definição de receita, de repasse e de imposto por pedido fica escrita uma vez, versionada, e é a mesma para o analista, para o BI e para o agente de IA que consulta o lake. Na Precisian, esse lake é isolado por cliente e roda na infraestrutura da Precisian; o cliente acessa por MCP, API ou pelo BI dele.

## Quando isso não tem conserto pelo dado?

Em quatro situações. Melhor conhecê-las antes de prometer um relatório que fecha.

**Quando o pagamento está fora do escopo.** Cartão está fora da Fase 1 (seção 1.2 do manual). Enquanto o seu volume for cartão a consumidor, não há tributo segregado no extrato para conciliar, e o imposto da venda continua vindo só da nota.

**Quando a nota é agregadora.** O manual prevê um *DF Agregador*, um documento criado nos sistemas do governo que referencia várias notas numa só transação, pensado para pagamentos com vários fornecedores, como em plataformas digitais (seção 3.4.2). A transação ligada a ele usa o tributo informado, sem correção. Se o seu repasse vier por um agregador, a ligação com cada pedido depende de você ter a lista de notas que ele referencia.

**Quando a perna do split não é a sua.** O manual diz que os prestadores *"não possuem visibilidade, por meio do arranjo de pagamento, de que uma transação se refere a um contexto de Plataforma Digital"*, e que cabe a pagador, plataforma e lojistas *"acordarem entre si"* em qual perna o split será aplicado (seção 9.2). Quem vende em marketplace pode ter o tributo segregado num pagamento que nunca passa pela própria conta, o que soma mais uma camada ao [buraco de dados do marketplace](https://precisian.io/blog/pt-BR/posts/marketplace-buraco-negro-de-dados/).

**Quando a pergunta é fiscal.** Saber se o valor segregado quitou o débito, se o excedente vai voltar em até 3 dias úteis (art. 32, § 4º; art. 33, § 4º) ou se o adquirente tem direito a crédito (art. 33, § 7º) é apuração, não conciliação. Uma plataforma de dados mostra o que entrou e o que saiu, linha a linha. Não substitui quem responde pela apuração.

## O que este artigo não cobre?

Não cobre alíquota, regime de apuração, Simples Nacional, crédito de CBS e IBS nem o calendário de transição dos tributos. Também não cobre o procedimento simplificado do [art. 33 da LC 214/2025](https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp214.htm), em que o tributo segregado é um percentual que, nas palavras da lei, *"não guardará relação com o valor dos débitos do IBS e da CBS efetivamente incidentes sobre a operação"* (§ 2º, III), porque o manual da Fase 1 o deixa fora do escopo.

Três coisas ficaram de fora por falta de fonte oficial. A data em que o split passa a valer para venda a consumidor: a lei a delega a ato conjunto, e não achei esse ato. A notícia de que a primeira etapa para o varejo usaria Pix e boleto antes de cartão, que só encontrei em imprensa especializada. E o prazo, em dias, do repasse do tributo ao governo, que o manual remete ao Manual de Tempos (seção 6.2) e que não li.

Se o seu ERP ainda não grava a chave de acesso da nota no pedido, comece por ela, porque é a coluna que vai ligar o extrato à venda quando o split chegar ao varejo. [Veja a pergunta deste post respondida sobre um lake de verdade](https://precisian.io/demonstracao?utm_source=blog&utm_medium=cta&utm_campaign=split-payment-ecommerce&utm_content=texto), sem compromisso de contrato.
