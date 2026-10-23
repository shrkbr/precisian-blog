---
title: "Como dar contexto do cliente a um agente de IA sem expor dado pessoal"
description: "Coorte, segmento e LTV saem de um identificador pseudonimizado. O agente quase nunca precisa de nome, CPF, e-mail ou telefone para responder."
slug: "agente-de-ia-e-dado-pessoal-do-cliente"
lang: "pt-BR"
translationKey: "agent-pii"
publishedAt: 2026-10-23
tags: ["lgpd", "dados-para-ia", "privacidade", "governanca", "seguranca-de-dados"]
draft: false
llmSummary: "Pela LGPD (art. 12 e 13, §4º), dado anonimizado deixa de ser dado pessoal e dado pseudonimizado continua sendo. Hash sem chave de CPF ou e-mail não pseudonimiza: a FTC afirma que esse hash é revertido por tentativa. Agente de IA responde coorte e LTV com ID pseudonimizado."
citations: ["https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm", "https://www.ftc.gov/policy/advocacy-research/tech-at-ftc/2024/07/no-hashing-still-doesnt-make-your-data-anonymous", "https://dataprivacylab.org/projects/identifiability/paper1.pdf", "https://pmc.ncbi.nlm.nih.gov/articles/PMC6650473/", "https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-spans.md", "https://genai.owasp.org/llmrisk/llm022025-sensitive-information-disclosure/", "https://www.correios.com.br/enviar/precisa-de-ajuda/tudo-sobre-cep", "https://www.gov.br/anpd/pt-br/acesso-a-informacao/participacao-social/outras-acoes/ts-01-2024-nota-tenica-6-de-abertura.pdf/@@display-file/file"]
about: ["https://pt.wikipedia.org/wiki/Pseudonimiza%C3%A7%C3%A3o", "https://pt.wikipedia.org/wiki/Lei_Geral_de_Prote%C3%A7%C3%A3o_de_Dados_Pessoais", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 8
---

Para responder pergunta de negócio, um agente de IA quase nunca precisa de nome, CPF, e-mail ou telefone. Coorte, segmento e LTV saem de um identificador pseudonimizado, e o dado que identifica a pessoa fica fora do contexto do modelo. A LGPD dá o vocabulário: pelo art. 12, dado anonimizado deixa de ser dado pessoal; pelo art. 13, §4º, o pseudonimizado continua sendo, porque existe uma chave que o religa à pessoa ([Lei 13.709/2018, Planalto](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)).

> **Pseudonimização**, na definição do art. 13, §4º, da LGPD, é *"o tratamento por meio do qual um dado perde a possibilidade de associação, direta ou indireta, a um indivíduo, senão pelo uso de informação adicional mantida separadamente pelo controlador em ambiente controlado e seguro"*.

Essa diferença decide a arquitetura. Quem pseudonimiza continua tratando dado pessoal e continua sob a lei inteira, mas tira do alcance do agente aquilo que ele não precisa ver. Quem acha que anonimizou e não anonimizou trata dado pessoal sem saber.

## Como o problema aparece na sua operação?

Raramente como incidente. Costuma aparecer em uma destas quatro situações.

O agente responde "quais foram os maiores clientes do trimestre" com nome, e-mail e WhatsApp de cada um, porque a tabela que ele consultou tinha essas colunas e ninguém disse que não.

O time de engenharia liga o rastreamento detalhado do agente para depurar uma resposta errada, e o trace passa a guardar o resultado inteiro de cada consulta, com CPF no meio, num serviço de observabilidade que tem outra política de retenção.

O jurídico pergunta quais colunas o agente alcança e ninguém sabe responder sem abrir o banco.

Alguém diz que "os dados estão anonimizados" e, na prática, o que existe é um hash de e-mail sem chave.

Nas quatro, o agente recebeu acesso à tabela inteira quando só precisava responder a uma pergunta.

## Por que o dado pessoal acaba dentro do contexto do agente?

Por cinco mecanismos, e nenhum deles exige ataque.

**Credencial ampla.** O caminho mais curto para ligar um agente ao dado é uma credencial de leitura no schema inteiro. Daí em diante, cada `SELECT *` traz as colunas pessoais junto, e o resultado da ferramenta volta inteiro para o contexto do modelo. A OWASP trata isso como risco próprio de aplicações com LLM e recomenda conceder acesso *"only to data that is necessary for the specific user or process"* ([OWASP LLM02:2025](https://genai.owasp.org/llmrisk/llm022025-sensitive-information-disclosure/)).

**Trace que guarda tudo.** As convenções semânticas de IA generativa do OpenTelemetry classificam o conteúdo das mensagens, os argumentos e o resultado das chamadas de ferramenta como atributos `Opt-In`, com o aviso de que *"may contain sensitive information"*, e afirmam que as instrumentações *"SHOULD NOT capture them by default"* ([OpenTelemetry GenAI, spans](https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-spans.md)). Com o padrão, nada é capturado; o vazamento vem de quem liga a captura para depurar e se esquece de desligar.

**Hash sem chave.** Aplicar SHA-256 no CPF parece pseudonimizar e não pseudonimiza. O CPF tem 9 dígitos de base e 2 verificadores, então há no máximo 1 bilhão de valores possíveis: calcular o hash de todos é tarefa de horas num computador comum (a conta é minha, não de fonte). A FTC, autoridade de consumo dos Estados Unidos, diz o mesmo sobre identificadores comuns: hash sobre eles *"can be reversed"*, e por isso os hashes *"aren't 'anonymous'"* ([FTC, julho de 2024](https://www.ftc.gov/policy/advocacy-research/tech-at-ftc/2024/07/no-hashing-still-doesnt-make-your-data-anonymous)).

**Atributo comum que identifica.** Tirar nome e CPF não basta quando sobram data de nascimento, sexo e CEP. Com o censo americano de 1990, Latanya Sweeney estimou que 87% da população dos EUA era provavelmente única só pela combinação de CEP de 5 dígitos, sexo e data de nascimento ([Sweeney, Carnegie Mellon, 2000](https://dataprivacylab.org/projects/identifiability/paper1.pdf)). Em 2019, um modelo publicado na *Nature Communications* estimou que 99,98% dos americanos seriam reidentificados em qualquer base com 15 atributos demográficos ([Rocher, Hendrickx e de Montjoye, 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6650473/)).

O CEP brasileiro é mais fino que o americano de 5 dígitos: os Correios descrevem os três algarismos depois do hífen como o sufixo que identifica individualmente localidades e logradouros ([Correios](https://www.correios.com.br/enviar/precisa-de-ajuda/tudo-sobre-cep)). Não achei estudo de reidentificação equivalente para o Brasil, então não cito número daqui, mas a combinação de atributos funciona do mesmo jeito.

**Perfil comportamental.** O art. 12, §2º, da LGPD diz que podem ser considerados dados pessoais aqueles *"utilizados para formação do perfil comportamental de determinada pessoa natural, se identificada"* ([Planalto](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)). Um histórico de compras ligado a um ID estável é exatamente isso. Pseudonimizar reduz a exposição, mas o tratamento continua sob a lei.

## Como diagnosticar o que o agente alcança hoje?

Cinco verificações, todas executáveis em uma tarde.

| Verificação | Onde olhar | Sinal de problema |
|---|---|---|
| Colunas pessoais visíveis ao papel do agente | Catálogo do banco (consulta abaixo) | Qualquer coluna de nome, CPF, e-mail, telefone, endereço ou nascimento com `SELECT` liberado |
| O que volta no resultado da ferramenta | Log do servidor MCP ou da API que o agente chama | Linha individual de cliente em resposta a pergunta agregada |
| Captura de conteúdo no trace | Configuração de instrumentação do agente | Captura de mensagens ou resultado de ferramenta ligada em produção |
| Como o ID foi gerado | Código do pipeline que cria o identificador | Hash sem segredo (SHA-256 puro, MD5) de CPF, e-mail ou telefone |
| Tamanho do menor grupo devolvido | Respostas de segmentação | Grupo com poucos clientes e atributos como CEP completo e data de nascimento |

Em Postgres, a primeira verificação é uma consulta. Rode com um usuário administrador, trocando `agente_ia` pelo papel que o agente usa:

```sql
SELECT table_schema, table_name, column_name
FROM information_schema.columns
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
  AND column_name ~* '(cpf|e_?mail|telefone|celular|whatsapp|nome|endereco|cep|nascimento)'
  AND has_column_privilege('agente_ia',
        format('%I.%I', table_schema, table_name), column_name, 'SELECT');
```

Se a consulta devolve alguma linha, o agente pode ler aquela coluna. Se o nome da coluna não segue padrão, a expressão regular não acha, e aí o diagnóstico é manual, tabela por tabela.

Para o hash, a prova é mais rápida ainda: pegue o CPF de alguém da equipe, com autorização dela, calcule o SHA-256 sem segredo e procure o resultado na base. Se achar, o ID é reversível por qualquer pessoa que tenha a base e um laço de repetição.

## Como corrigir sem tirar a utilidade do agente?

Quatro técnicas, cada uma com o que protege e o que deixa passar. Nenhuma basta sozinha.

| Técnica | O que protege | O que não protege |
|---|---|---|
| Pseudonimização com chave secreta | O agente e o trace veem um ID que não se reverte sem o segredo | Ligação entre bases que usam o mesmo ID; atributos que identificam por combinação |
| Agregação com piso mínimo de grupo | Respostas de segmento não descem ao indivíduo | Pergunta feita de propósito para isolar um cliente com filtros sucessivos |
| Colunas pessoais fora do alcance | O dado identificador nunca entra no contexto do modelo | Texto livre (comentário, conversa de SAC) que carrega nome e telefone dentro |
| Mascaramento em log e trace | O que o agente viu não fica guardado em outro serviço | O que o agente já viu e devolveu na resposta ao usuário |

**Pseudonimize com segredo, não com hash puro.** Gere o identificador com uma função de hash com chave (HMAC) ou com uma tabela de correspondência aleatória, e guarde a chave fora do alcance do agente e de quem consulta o lake. É o que o art. 13, §4º, descreve: informação adicional mantida separadamente, em ambiente controlado. Coorte por mês de primeira compra, recompra em 90 dias, LTV de 12 meses e canal de aquisição saem todos desse ID, sem uma única coluna pessoal.

**Exponha métrica, não tabela.** O agente não precisa de acesso à tabela `clientes`; precisa de "clientes ativos", "LTV por canal" e "taxa de recompra", já definidos. Quando a definição vive numa [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/), o controle de acesso é por entidade e por métrica, e a coluna pessoal simplesmente não existe para o papel do agente. O princípio da necessidade da LGPD (art. 6º, III) pede o *"mínimo necessário"* para a finalidade, e uma pergunta de LTV não precisa de CPF.

Um exemplo com números redondos, sintético: uma loja com 200 mil clientes quer comparar o LTV de 12 meses de quem pagou a primeira compra com Pix contra quem pagou no cartão. A resposta precisa de quatro campos por cliente: ID pseudonimizado, forma de pagamento do primeiro pedido, data e valor de cada pedido. Nome, CPF, e-mail, telefone e endereço ficam de fora, e a resposta sai igual.

**Defina um piso de grupo.** Toda resposta que agrega clientes suprime grupos abaixo de um tamanho mínimo, por exemplo dez ou vinte clientes. O número é uma escolha sua, declarada e escrita, não um padrão legal. E retire do alcance os atributos que reidentificam por combinação: faixa etária em vez de data de nascimento, cidade ou os 5 primeiros dígitos do CEP em vez do CEP completo.

**Deixe a captura de conteúdo desligada em produção.** É o padrão do OpenTelemetry; mantenha. Quando precisar depurar, capture num ambiente separado, com retenção curta, ou mascare os campos antes da exportação.

**Reidentifique fora do agente.** Quando a análise vira ação ("mande a oferta para esse segmento"), o agente devolve a lista de IDs pseudonimizados, e o sistema que guarda a chave, o CRM ou a ferramenta de disparo, resolve quem é quem. O dado pessoal só aparece onde a ação acontece.

## Quando isso não tem conserto?

Em quatro situações a técnica não resolve, e vale saber antes de prometer.

**Quando a tarefa é sobre a pessoa.** Um agente de atendimento que responde "onde está o meu pedido" precisa do pedido daquele cliente. Aqui o controle é outro: escopo por sessão, uma pessoa por conversa, sem acesso à base. É um problema da aplicação de atendimento, não do lake analítico, e a Precisian não é a resposta certa para ele.

**Quando o dado pessoal está dentro do texto.** Conversa de WhatsApp, avaliação de produto e chamado de SAC carregam nome, telefone e endereço no meio da frase. Mascaramento por padrão de texto pega CPF formatado e perde o resto. Se o agente precisa ler texto livre de cliente, trate esse texto como dado pessoal inteiro.

**Quando a base é pequena demais.** Uma operação B2B com poucas dezenas de compradores reidentifica qualquer segmento pelo contexto: "o cliente de Joinville que comprou em março" é uma pessoa. Agregação não protege abaixo de um certo volume, e às vezes a resposta honesta é não dar esse acesso ao agente.

**Quando a chave vaza.** Pseudonimização vale enquanto o segredo está separado. Se a chave do HMAC está no mesmo repositório que o pipeline, num arquivo de configuração que o agente lê, o ID volta a ser reversível.

## O que este artigo não cobre?

Não é parecer jurídico. Base legal, consentimento, direitos do titular e relatório de impacto são decisões do seu jurídico e do encarregado, e nada aqui substitui essa análise.

A transferência do dado para um LLM hospedado fora do país é outro assunto, tratado em [LGPD e IA: onde o dado do seu cliente pode viver](https://precisian.io/blog/pt-BR/posts/lgpd-ia-dados-de-cliente/). A autenticação do servidor MCP também, em [conectar IA sem expor a base](https://precisian.io/blog/pt-BR/posts/conectar-ia-sem-expor-a-base/). E quem decide qual agente acessa qual dado é uma pergunta de [governança de IA](https://precisian.io/blog/pt-BR/posts/governanca-de-ia-comeca-no-dado/).

Dois limites declarados. A ANPD levou à sociedade em 2024 um estudo preliminar de guia sobre anonimização e pseudonimização ([Nota Técnica nº 6/2024/CGN/ANPD](https://www.gov.br/anpd/pt-br/acesso-a-informacao/participacao-social/outras-acoes/ts-01-2024-nota-tenica-6-de-abertura.pdf/@@display-file/file)); não localizei versão final publicada, então nada aqui se apoia nele. E os estudos de reidentificação citados medem a população dos Estados Unidos, não a brasileira.

---

Se o seu agente de IA hoje lê a tabela de clientes inteira, o primeiro passo é medir quais colunas pessoais ele alcança e quais perguntas de fato precisam delas. [Vale uma conversa sobre o seu caso](https://calendar.notion.so/meet/rodrigomartucci/precisian-io).
