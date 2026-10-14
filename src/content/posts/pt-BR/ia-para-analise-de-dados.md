---
title: "IA para análise de dados de marketing: onde o ChatGPT acerta e onde ele inventa"
description: "IA para análise de dados funciona para explorar uma planilha e falha para decidir com ela: o modelo calcula certo sobre uma definição que ele mesmo escolheu."
slug: "ia-para-analise-de-dados"
lang: "pt-BR"
translationKey: "ai-data-analysis"
publishedAt: 2026-10-14
tags: ["dados-para-ia", "alucinacao-de-metrica", "camada-semantica", "roas", "ga4", "divergencia-de-dados"]
draft: false
llmSummary: "O ChatGPT analisa planilhas de até cerca de 50 MB rodando Python, e o Claude, arquivos de até 30 MB (OpenAI e Anthropic, out/2026). A conta sai certa; a definição de receita ou ROAS não vem no arquivo, e o modelo escolhe uma. Serve para explorar, não para decidir."
citations: ["https://help.openai.com/en/articles/8437071-data-analysis-with-chatgpt", "https://help.openai.com/en/articles/8555545-uploading-files-and-audio-to-chatgpt", "https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude", "https://support.claude.com/en/articles/8241126-upload-files-to-claude", "https://support.claude.com/en/articles/10366421-how-does-claude-handle-mathematical-equations-and-calculations", "https://support.google.com/analytics/answer/13331684", "https://support.google.com/analytics/answer/10596866"]
about: ["https://en.wikipedia.org/wiki/Data_analysis", "https://en.wikipedia.org/wiki/Large_language_model", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 10
---

Usar IA para análise de dados de marketing funciona para explorar e falha para decidir. O ChatGPT lê planilhas de até cerca de 50 MB e escreve e roda Python num notebook Jupyter para fazer as contas ([OpenAI](https://help.openai.com/en/articles/8555545-uploading-files-and-audio-to-chatgpt), consultado em 14/10/2026); o Claude faz o mesmo com arquivos de até 30 MB ([Anthropic](https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude)). A aritmética sai certa. O que não vem junto com o CSV é a definição de receita, de ROAS ou de cliente novo, e sem ela o modelo escolhe uma sozinho.

> **A regra de triagem**: se a resposta depende de uma definição de negócio que não está escrita no arquivo, a IA não vai inventar o número. Vai inventar a definição, e calcular o número certo em cima dela.

## Qual é o sintoma, e por que ele é tão fácil de não ver?

O sintoma é um fluxo que você provavelmente já rodou. Você exporta o relatório de aquisição do GA4, sobe no ChatGPT ou no Claude e pede "o ROAS por canal do último trimestre". Em menos de um minuto volta uma tabela limpa, com gráfico e uma recomendação de onde cortar verba.

A tabela convence porque tem forma de análise. Ninguém pergunta de qual coluna saiu a receita.

O problema aparece depois. O financeiro fecha o trimestre com a receita do ERP ou da VTEX, e a soma por canal que a IA devolveu não bate com ela. Ou alguém repete a pergunta numa conversa nova, com o mesmo arquivo, e o ROAS do Google Ads muda. Ou o diretor pergunta "esse ROAS considera o que foi vendido no Mercado Livre?" e ninguém sabe.

Três sinais denunciam o problema:

- **O total não fecha com a fonte da verdade.** A soma dos canais na tabela da IA difere da receita que o financeiro reconhece.
- **A mesma pergunta dá números diferentes em sessões diferentes.** O modelo desempatou de um jeito na primeira vez e de outro na segunda.
- **Ninguém consegue dizer qual definição foi usada.** Se você não sabe responder "receita bruta ou líquida, por data de pedido ou de pagamento?", a IA também não sabia. Ela escolheu.

## Por que a conta está certa e a resposta está errada?

Porque a ferramenta faz exatamente o que promete. A OpenAI descreve o recurso como um ambiente que "escreve e roda código Python" sobre os arquivos da sessão ([OpenAI](https://help.openai.com/en/articles/8437071-data-analysis-with-chatgpt)). O código opera sobre as colunas que encontra. Se a planilha tem uma coluna chamada "Receita", o código soma essa coluna, corretamente. O erro está antes do código, em quatro lugares.

**1. O export já carrega a definição de quem o gerou.** A receita que sai do GA4 é a receita segundo o GA4: atribuída por um modelo que, na documentação do próprio Google, exclui visitas diretas do crédito, a menos que o caminho inteiro seja direto ([Google](https://support.google.com/analytics/answer/10596866)). A IA não sabe disso, a menos que você diga. Ela trata a coluna como receita e divide pelo investimento. O resultado é o [ROAS](https://precisian.io/blog/pt-BR/posts/o-que-e-roas/) segundo o GA4, apresentado como ROAS.

**2. O arquivo pode estar incompleto sem avisar.** Quando a tabela excede o limite de linhas, o GA4 agrupa os valores menos frequentes numa linha "(other)" ([Google](https://support.google.com/analytics/answer/13331684)). Num export com campanha, origem e mídia cruzadas, parte das campanhas pequenas some ali dentro. A IA soma o que está no arquivo. E a própria OpenAI avisa que um arquivo pode subir com sucesso e ainda ser grande ou complexo demais para análise completa ([OpenAI](https://help.openai.com/en/articles/8437071-data-analysis-with-chatgpt)).

**3. O modelo escolhe o método.** Está na documentação, sem rodeio: o ChatGPT pode escolher um método de análise ou um tipo de gráfico que não corresponde à sua intenção na primeira tentativa ([OpenAI](https://help.openai.com/en/articles/8437071-data-analysis-with-chatgpt)). Em pergunta de marketing, "método" inclui decisões como filtrar ou não pedidos cancelados, somar frete ou não, contar a venda no dia do pedido ou no dia do Pix compensado.

**4. Cruzar fontes é onde a falha fica silenciosa.** O ambiente de Python do ChatGPT não faz requisição externa nem chamada de API ([OpenAI](https://help.openai.com/en/articles/8437071-data-analysis-with-chatgpt)), então o custo do Meta Ads precisa subir num segundo arquivo. Para juntar os dois, o modelo casa linhas por nome de canal. "facebook / cpc" no GA4 e "Meta" na planilha de mídia não casam sozinhos, e a junção que falha não dá erro: devolve menos linhas. O mesmo vale para venda de loja própria e de marketplace, que chegam com identificadores diferentes e somam duas vezes se ninguém escreveu a [regra de deduplicação](https://precisian.io/blog/pt-BR/posts/deduplicar-venda-site-marketplace/).

Nenhum dos quatro é falha de modelo, e trocar o ChatGPT pelo Claude não resolve nenhum. É o mecanismo que chamamos de [alucinação de métrica](https://precisian.io/blog/pt-BR/posts/alucinacao-de-metrica/): a resposta numericamente correta sobre uma definição que a empresa nunca escreveu.

Um exemplo com números redondos, sintético e declarado como tal, mostra o tamanho do estrago:

| Canal | Receita no export do GA4 | Investimento | ROAS que a IA devolve |
|---|---|---|---|
| Google Ads | R$ 400 mil | R$ 80 mil | 5,0 |
| Meta Ads | R$ 150 mil | R$ 60 mil | 2,5 |
| Direto e orgânico | R$ 250 mil | R$ 0 | n/a |
| **Total** | **R$ 800 mil** | **R$ 140 mil** | |

Se o ERP reconhece menos que isso no mesmo trimestre, por cancelamento, devolução ou boleto não pago, cada ROAS da tabela está inflado na mesma proporção, e a recomendação de "dobrar o Google" foi feita sobre receita que não entrou. A IA não errou nenhuma divisão.

## Quais tarefas são seguras para entregar à IA, e quais não?

A linha que separa as duas é uma pergunta: **a resposta depende de uma definição de negócio?** Se não depende, a IA faz bem e rápido. Se depende, ela vai precisar adivinhar.

<table>
<thead><tr><th>Tarefa</th><th>Segura?</th><th>Por quê</th></tr></thead>
<tbody>
<tr><td>Achar padrão e sazonalidade numa série</td><td>Sim</td><td>A forma da curva não muda com a definição de receita</td></tr>
<tr><td>Apontar anomalia (pico, queda, dia zerado)</td><td>Sim</td><td>É ponto de partida para investigar, não conclusão</td></tr>
<tr><td>Limpar e padronizar (UTM, nome de campanha, datas)</td><td>Sim, revisando</td><td>Tarefa mecânica; o resultado é verificável linha a linha</td></tr>
<tr><td>Rascunhar hipótese ("a queda coincide com a troca de criativo")</td><td>Sim</td><td>Hipótese pede teste; ninguém decide verba com ela</td></tr>
<tr><td>Escrever a fórmula, a query ou o script para você revisar</td><td>Sim</td><td>O código fica legível e auditável</td></tr>
<tr><td>Receita do mês</td><td>Não</td><td>Bruta, líquida, faturada ou atribuída: o arquivo não diz qual</td></tr>
<tr><td>ROAS ou CAC por canal</td><td>Não</td><td>Depende de quem leva o crédito pela venda e de qual receita entra</td></tr>
<tr><td>LTV ou recompra</td><td>Não</td><td>Depende do que conta como cliente e de cruzar loja própria com marketplace</td></tr>
<tr><td>Comparar duas fontes (GA4 contra VTEX, Meta contra GA4)</td><td>Não</td><td>Cada fonte tem sua definição; a junção falha em silêncio</td></tr>
<tr><td>"Qual canal devo cortar?"</td><td>Não</td><td>É decisão sobre as quatro linhas acima ao mesmo tempo</td></tr>
</tbody>
</table>

Análise de marketing tem duas camadas: a aritmética, que o Python resolve, e a semântica, que ninguém colocou no arquivo. A própria Anthropic recomenda conferir cálculos complexos ou críticos com software especializado ou à mão ([Anthropic](https://support.claude.com/en/articles/10366421-how-does-claude-handle-mathematical-equations-and-calculations)); em marketing, a verificação que importa é a da definição.

## Como diagnosticar se uma análise já está contaminada?

Seis verificações, todas possíveis na mesma conversa em que a análise foi feita. A documentação da OpenAI já pede a primeira: revisar o código, as saídas e as premissas antes de confiar no resultado ([OpenAI](https://help.openai.com/en/articles/8437071-data-analysis-with-chatgpt)).

<table>
<thead><tr><th>Verificação</th><th>Como fazer</th><th>Sinal de problema</th></tr></thead>
<tbody>
<tr><td>Abrir o código</td><td>Peça "mostre o código que gerou esta tabela"</td><td>Filtro, junção ou coluna que você não pediu</td></tr>
<tr><td>Perguntar a definição</td><td>"Qual coluna você usou como receita, e o que ela inclui?"</td><td>A resposta descreve a regra em prosa em vez de citar uma definição sua</td></tr>
<tr><td>Repetir em sessão nova</td><td>Mesmo arquivo, mesma pergunta, conversa limpa</td><td>Números diferentes: o desempate não é estável</td></tr>
<tr><td>Fechar o total antes de quebrar</td><td>Compare a soma da tabela com a receita do ERP ou da VTEX no mesmo período</td><td>Diferença sem explicação nomeada</td></tr>
<tr><td>Contar a junção</td><td>"Quantas linhas de cada arquivo ficaram sem par?"</td><td>Canal ou campanha que sumiu depois do cruzamento</td></tr>
<tr><td>Procurar o "(other)"</td><td>Busque a linha no export antes de subir</td><td>Parte da receita está numa linha sem canal</td></tr>
</tbody>
</table>

Se for fazer uma só, faça a quarta: quebrar por canal um total que não fecha com o financeiro produz uma distribuição precisa de um número errado.

## Como corrigir sem abandonar a IA?

Em três níveis, do mais barato ao que resolve de vez.

**Nível 1: escreva a definição na pergunta.** "Receita = valor dos pedidos aprovados, sem frete, por data de pagamento, excluindo cancelados." Isso desfaz o desempate silencioso para aquela conversa. Junto, autorize a resposta "não sei", para que a falta de definição vire recusa em vez de palpite; o mecanismo está em [como fazer a IA admitir que não sabe](https://precisian.io/blog/pt-BR/posts/ensinar-a-ia-a-dizer-nao-sei/).

**Nível 2: suba um arquivo de definições junto com os dados.** Um documento curto com cada métrica, a fórmula, a fonte e o que fica de fora. Num projeto do ChatGPT ou do Claude, ele fica disponível para todas as conversas. A definição deixa de depender de memória, mas continua frágil: o arquivo envelhece, cada pessoa tem a sua cópia, e ninguém audita qual versão respondeu.

**Nível 3: tire a definição do arquivo e ponha no dado.** A IA para de receber planilha e passa a consultar métricas já definidas, versionadas e auditáveis, por um servidor MCP ou por API. Quando a pergunta chega, "receita" já tem uma regra só, e a mesma regra vale para o financeiro, para o BI e para o agente. É o que separa um [text-to-SQL que erra com SQL válido](https://precisian.io/blog/pt-BR/posts/text-to-sql-dado-de-marketing/) de um que responde sobre definição.

Nós erramos aqui antes de entender isso. Na Precisian, passamos seis meses tentando plugar agente em dado não modelado, e ele inventava coisa. O relato completo está no post sobre [alucinação de métrica](https://precisian.io/blog/pt-BR/posts/alucinacao-de-metrica/). O que levo dele para esta triagem é simples: a parte exploratória nunca foi o problema. O problema sempre foi pedir decisão a um modelo que não tinha onde ler o que nossos números significavam.

É esse o trabalho que a Precisian faz: um data lake isolado por cliente, com camada semântica versionada por cima, acessível pela IA que o seu time já usa via MCP, API ou BI. A IA continua sendo a sua. A gente entrega o dado pronto para ser perguntado.

## Quando isso não tem conserto?

Em quatro situações, e em nenhuma delas trocar de ferramenta ajuda.

**Quando o dado não existe.** Venda fechada no WhatsApp sem registro de origem, loja física sem CPF no cupom, pedido de marketplace sem identificador do cliente. A IA pode estimar, e a estimativa vai sair com a mesma confiança de um número medido. A correção começa na coleta.

**Quando a empresa nunca decidiu a definição.** Se marketing e financeiro usam receitas diferentes e ninguém arbitrou, nenhuma camada técnica escolhe por eles. Escrever a definição é decisão de negócio, com dono. A IA só deixa a falta dela mais rápida de perceber.

**Quando a pergunta é causal.** "Por que as vendas caíram em setembro?" não se responde com uma planilha, por mais bem modelada que ela seja. A IA vai devolver uma correlação narrada como causa. Use a resposta como hipótese e teste antes de agir.

**Quando a operação é pequena demais para precisar disso.** Uma loja com um canal pago, uma fonte de venda e uma pessoa que confere o número toda semana não precisa de camada semântica. O nível 1 desta lista, com a conferência humana que ela já faz, resolve. A Precisian é a resposta errada para esse caso, e dizer isso economiza a conversa dos dois lados.

## O que este artigo não cobre?

Não compara a acurácia do ChatGPT com a do Claude em análise de dados. Não encontrei fonte primária com método declarado que faça essa comparação em dado de marketing, e qualquer número sobre isso envelhece a cada versão de modelo.

Os limites de arquivo citados são os publicados pela [OpenAI](https://help.openai.com/en/articles/8555545-uploading-files-and-audio-to-chatgpt) e pela [Anthropic](https://support.claude.com/en/articles/8241126-upload-files-to-claude) em 14/10/2026. Eles mudam por plano, por modelo ou por configuração do workspace.

E não trata da questão de privacidade de subir base de cliente num chat de IA, que tem implicação de LGPD própria. Esse ponto está em [LGPD e IA com dados de cliente](https://precisian.io/blog/pt-BR/posts/lgpd-ia-dados-de-cliente/).

---

Se a sua equipe já tomou decisão de verba com um ROAS que saiu de um export do GA4 numa conversa de IA, o primeiro passo é medir quanto a receita daquele export diverge da receita que o financeiro fechou no mesmo período. [Agende uma conversa sobre o seu caso](https://calendar.notion.so/meet/rodrigomartucci/precisian-io), sem compromisso de contrato, mas sem promessa de resposta em 30 minutos também.
