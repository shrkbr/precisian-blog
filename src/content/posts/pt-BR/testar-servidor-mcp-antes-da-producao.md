---
title: "Como testar um servidor MCP antes de dar acesso ao dado de produção"
description: "O MCP Inspector prova que o servidor fala o protocolo, não que a resposta está certa. Roteiro com cópia anonimizada, gabarito, escopo e custo."
slug: "testar-servidor-mcp-antes-da-producao"
lang: "pt-BR"
translationKey: "mcp-testing"
publishedAt: 2026-11-03
tags: ["mcp", "seguranca", "dados-para-ia", "alucinacao-de-metrica", "custo", "governanca"]
draft: false
llmSummary: "O MCP Inspector (@modelcontextprotocol/inspector, v2.13.0, 28/10/2026) testa handshake, lista de ferramentas e chamada, com códigos de saída de 0 a 6. A própria doc diz que o teste de fumaça não é suíte de conformidade. Antes da produção: cópia anonimizada, gabarito, escopo e teto de custo."
citations: ["https://github.com/modelcontextprotocol/inspector", "https://modelcontextprotocol.io/docs/tools/inspector", "https://github.com/modelcontextprotocol/inspector/blob/main/docs/cli-smoke-testing.md", "https://modelcontextprotocol.io/docs/2026-07-28/tools/inspector/security", "https://www.npmjs.com/package/@modelcontextprotocol/inspector", "https://github.com/advisories/GHSA-7f8r-222p-6f5g", "https://modelcontextprotocol.io/specification/2026-07-28/server/tools", "https://www.postgresql.org/docs/current/ddl-rowsecurity.html", "https://docs.cloud.google.com/bigquery/docs/best-practices-costs", "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm", "https://supabase.com/blog/defense-in-depth-mcp"]
about: ["https://en.wikipedia.org/wiki/Model_Context_Protocol", "https://en.wikipedia.org/wiki/Smoke_testing_(software)", "https://precisian.io"]
author: "Gabriel Sorato"
readingTimeMinutes: 9
cta: demo
updatedAt: 2026-11-08
---
O MCP Inspector, a ferramenta oficial de teste do Model Context Protocol, prova que o servidor fala o protocolo: aperto de mão, lista de ferramentas, chamada e código de saída. Ele não prova que o número devolvido está certo. A documentação do próprio projeto, lida em 03/11/2026, chama o teste de fumaça de "deliberately not a conformance suite" ([modelcontextprotocol/inspector](https://github.com/modelcontextprotocol/inspector/blob/main/docs/cli-smoke-testing.md)). Antes de liberar o dado de produção faltam quatro passos: cópia anonimizada, perguntas de resposta conhecida, checagem de escopo e teto de custo.

> **MCP Inspector**: cliente de teste e depuração de servidores MCP, publicado como o pacote `@modelcontextprotocol/inspector` (versão `2.13.0`, de 28/10/2026, no [npm](https://www.npmjs.com/package/@modelcontextprotocol/inspector)). Tem interface web, linha de comando (`--cli`) e terminal (`--tui`), e conversa com o servidor sem nenhum modelo de linguagem no meio.

## Qual é o sintoma de um teste que passou e não provou nada?

O time sobe o servidor MCP em cima do banco de pedidos, roda o Inspector, vê as ferramentas listadas e uma chamada devolvendo JSON. Marca como testado. Duas semanas depois, três coisas aparecem:

- O agente responde "faturamento de outubro" com um número que inclui pedido cancelado e Pix que nunca compensou, e ninguém percebe porque o valor é plausível.
- Alguém descobre que a ferramenta `run_query` aceitava `UPDATE`, e o agente estava a uma instrução ambígua de usá-la.
- A fatura do warehouse sobe porque cada pergunta varre a tabela de eventos inteira.

Nenhum dos três seria pego pelo Inspector, e não por defeito dele. O teste verificou a camada que a ferramenta foi feita para verificar. As outras três camadas ficaram sem teste nenhum.

## O que o MCP Inspector testa, exatamente?

O contrato do protocolo, chamada por chamada. A [documentação oficial do Inspector](https://modelcontextprotocol.io/docs/tools/inspector), lida em 03/11/2026, pede Node 22.19.0 ou mais novo e roda direto pelo `npx`, sem instalação:

```bash
# interface web, com um servidor local por stdio
npx @modelcontextprotocol/inspector node path/to/server/index.js

# linha de comando: listar as ferramentas e sair
npx @modelcontextprotocol/inspector --cli node path/to/server/index.js --method tools/list
```

O guia de teste de fumaça do repositório resume o objetivo assim: conectar, "prove it speaks MCP", provar que as uma ou duas coisas das quais você depende continuam funcionando, e falhar o job quando não funcionarem ([cli-smoke-testing.md](https://github.com/modelcontextprotocol/inspector/blob/main/docs/cli-smoke-testing.md)). Para isso a CLI devolve um código de saída estável:

| Código | O que significa |
|---|---|
| `0` | sucesso |
| `1` | erro de uso ou inesperado |
| `3` | o servidor exige autenticação (401/403, OAuth) |
| `4` | servidor inalcançável |
| `5` | erro da ferramenta (`isError:true`) ou ferramenta inexistente |
| `6` | `--strict` achou problema grave de portabilidade de schema |

Fonte: [cli-smoke-testing.md, seção 5](https://github.com/modelcontextprotocol/inspector/blob/main/docs/cli-smoke-testing.md), lido em 03/11/2026.

Tudo nessa tabela é sobre forma. Se a ferramenta `receita_por_canal` devolve `{"valor": 184000}`, o Inspector confirma que o campo existe e que a chamada não deu erro. Se 184 mil é receita bruta, líquida, com frete ou sem cancelamento, isso não está no protocolo e não tem como estar.

Há um segundo limite. A anotação que diz "esta ferramenta só lê" (`readOnlyHint`) é declaração do servidor, e a especificação manda desconfiar dela: "clients MUST consider tool annotations to be untrusted unless they come from trusted servers" ([spec MCP, revisão 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)). O Inspector mostra a anotação. Não confere se ela é verdade.

E o próprio Inspector merece cuidado. Ele guarda token OAuth e variável `env:` de servidor stdio; sem chaveiro do sistema operacional, grava tudo em `~/.mcp-inspector/secrets.json`, "unencrypted unless you supply a key", e o servidor stdio que ele inicia roda com o seu usuário ([doc de segurança do Inspector](https://modelcontextprotocol.io/docs/2026-07-28/tools/inspector/security)). A linha antiga já teve falha registrada: versões anteriores à `0.14.1` tinham o proxy sem autenticação entre cliente e servidor ([GHSA-7f8r-222p-6f5g, junho de 2025](https://github.com/advisories/GHSA-7f8r-222p-6f5g)). Por isso o Inspector não deve apontar para produção com credencial de administrador.

## Que banco usar para testar o agente antes da produção?

Uma cópia com o mesmo schema, o mesmo volume aproximado e nenhum dado que identifique pessoa.

**Mesmo schema**, porque o erro que interessa achar mora nos nomes de coluna e nas tabelas parecidas: `pedidos` e `pedidos_faturados`, `valor` e `valor_liquido`. Uma base de brinquedo com três tabelas limpas não reproduz a confusão que o agente vai encontrar.

**Volume aproximado**, porque custo e tempo de resposta só aparecem com a tabela de eventos no tamanho real. Mil linhas não ensinam nada sobre a consulta que varre 400 GB.

**Sem dado pessoal**, porque a LGPD faz uma distinção que decide o ambiente. Pelo art. 12, dado anonimizado deixa de ser dado pessoal; pelo art. 13, §4º, o pseudonimizado continua sendo, porque existe uma chave que o religa à pessoa ([Lei 13.709/2018](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)). Hash de CPF sem chave secreta não anonimiza; o detalhe está em [como dar contexto ao agente sem expor o cliente](https://precisian.io/blog/pt-BR/posts/agente-de-ia-e-dado-pessoal-do-cliente/).

O fornecedor que viveu o incidente mais citado de MCP escreveu a regra sem rodeio: use MCP com dado que não seja de produção e "never connect AI agents directly to production data" ([Supabase, 16/09/2025](https://supabase.com/blog/defense-in-depth-mcp)). O contexto do caso está em [conectar IA sem expor a base](https://precisian.io/blog/pt-BR/posts/conectar-ia-sem-expor-a-base/).

Na cópia, o agente conecta com um papel próprio, só com `SELECT`, sem o atributo `BYPASSRLS` e sem ser dono das tabelas. O PostgreSQL documenta que superusuário, papel com `BYPASSRLS` e dono da tabela ignoram a política de linha, salvo `FORCE ROW LEVEL SECURITY` ([PostgreSQL](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)). Testar com o papel errado aprova uma configuração que a produção não vai ter.

Por último, isole o estado do próprio Inspector. O guia manda definir as duas variáveis, nesta ordem de precedência, para que o teste não leia nem renove o token real de alguém: `MCP_STORAGE_DIR` e `MCP_INSPECTOR_OAUTH_STATE_PATH` ([cli-smoke-testing.md, seção 6](https://github.com/modelcontextprotocol/inspector/blob/main/docs/cli-smoke-testing.md)).

## Como montar perguntas com resposta conhecida?

Escreva o gabarito antes de perguntar. Na cópia, alguém do time calcula em SQL, sem agente, a resposta de uma ou duas dezenas de perguntas que a operação faz toda semana. Depois as mesmas perguntas passam por duas rotas.

**Rota 1, a ferramenta sozinha, pelo Inspector.** A CLI chama a ferramenta sem modelo nenhum e devolve JSON, então dá para comparar com o gabarito em script:

```bash
npx @modelcontextprotocol/inspector --cli node build/index.js \
  --method tools/call --tool-name receita_por_canal \
  --tool-args-json '{"mes":"2026-10","canal":"organico"}' --format json \
  | jq -e '.result.structuredContent.receita_liquida == 184000'
```

O guia recomenda `--tool-args-json` em vez de `--tool-arg` para argumento tipado, porque `--tool-arg` converte texto só de dígitos em número, e um código de pedido vira inteiro no caminho ([cli-smoke-testing.md, seção 4](https://github.com/modelcontextprotocol/inspector/blob/main/docs/cli-smoke-testing.md)).

**Rota 2, o agente completo.** A mesma pergunta, em português, para o assistente que vai usar o servidor.

A comparação entre as rotas diz onde está o erro:

| Ferramenta (Inspector) | Agente | Onde está o problema |
|---|---|---|
| bate com o gabarito | bate | nenhum, para esta pergunta |
| bate | não bate | o modelo escolheu a ferramenta, o filtro ou a métrica errada |
| não bate | não bate | o servidor ou o dado embaixo dele |
| não bate | bate | coincidência; investigue a ferramenta mesmo assim |

A segunda linha é a [alucinação de métrica](https://precisian.io/blog/pt-BR/posts/alucinacao-de-metrica/): a ferramenta estava certa e o agente leu "faturamento" como bruto quando o financeiro fala de líquido. O conserto fica no lugar onde a definição de receita está escrita.

Inclua no gabarito duas perguntas sem resposta possível na base, como a margem de um canal sem custo cadastrado. O resultado esperado é o agente dizer que não sabe. Se ele inventa, o problema é outro, e está descrito em [como fazer a IA admitir que não sabe](https://precisian.io/blog/pt-BR/posts/ensinar-a-ia-a-dizer-nao-sei/).

Um exemplo com números redondos, sintético: num gabarito de 20 perguntas, 17 batem nas duas rotas, 2 batem na ferramenta e erram no agente, 1 erra nas duas. Os três grupos pedem consertos em lugares diferentes, e sem o gabarito todos pareceriam "o agente errou".

## Como checar escopo e custo antes de liberar?

Com asserções negativas, que o guia do Inspector trata como parte do teste: "A smoke test that only proves the happy path will not notice the day a tool starts answering questions it should refuse" ([cli-smoke-testing.md, seção 7](https://github.com/modelcontextprotocol/inspector/blob/main/docs/cli-smoke-testing.md)).

| Checagem | Como rodar | O que reprova |
|---|---|---|
| Lista fechada de ferramentas | `--method tools/list` + `jq` comparando com a lista aprovada, nos dois sentidos | ferramenta que ninguém aprovou, como escrita ou exclusão |
| Recusa continua recusa | chamada que deveria falhar (tabela fora do escopo, `DELETE`) exigindo código `5` | código `0`: o servidor aceitou |
| Autenticação existe | rodar sem token, em armazenamento isolado, exigindo código `3` | código `0`: a rota ficou pública |
| Teto de custo | `maximum_bytes_billed` no BigQuery para o papel do agente | consulta do gabarito que estoura o teto |
| Segredo no retorno | `grep` de padrões de chave na saída | qualquer ocorrência |

A lista aprovada da primeira linha sai da revisão de permissões descrita em [segurança de servidor MCP](https://precisian.io/blog/pt-BR/posts/seguranca-de-servidor-mcp/): só leitura, escopo mínimo e nenhuma ferramenta de escrita para agente que só deveria consultar.

A documentação traz duas ressalvas sobre como ler o resultado.

A primeira: `--stored-auth-only` não falha contra servidor que nunca pede autenticação, então "um teste verde não é evidência" de que a autenticação funciona. O guia manda provar o contrário de propósito: rodar sem token e exigir o código `3` ([cli-smoke-testing.md, seção 6](https://github.com/modelcontextprotocol/inspector/blob/main/docs/cli-smoke-testing.md)).

A segunda é de custo. No BigQuery, com `maximum_bytes_billed` definido, a leitura é estimada antes da execução e, se passar do limite, "the query fails without incurring a charge" ([Google Cloud, lido em 03/11/2026](https://docs.cloud.google.com/bigquery/docs/best-practices-costs)). A mesma página avisa que o *dry run* devolve sempre 0 byte quando a tabela tem segurança por linha. Quem estima custo do agente por *dry run* numa tabela com política de linha vai ler zero e aprovar. O teto que funciona é o que trava antes da execução; o resto está em [quanto custa deixar um agente consultando o warehouse](https://precisian.io/blog/pt-BR/posts/custo-de-consulta-de-agente-ia/).

Na CI, fixe a versão exata do Inspector. O guia avisa que `@2` não é fixação, porque o `npx` resolve qualquer 2.x mais nova e o mesmo commit roda contra outro Inspector no dia seguinte. E registre cada chamada da fase de teste: o [log de auditoria do agente](https://precisian.io/blog/pt-BR/posts/log-de-auditoria-de-agente-de-ia/) que você monta aqui é o mesmo que vai responder "o que ele leu" em produção.

## Quando o teste não resolve?

Em quatro situações, e vale saber antes de prometer segurança a alguém.

**Injeção indireta.** A cópia anonimizada não traz o nome de campanha ou a descrição de produto que um terceiro escreveu com uma instrução escondida. Dá para plantar um caso de teste, mas o vetor continua aberto em produção enquanto o agente ler texto que outra pessoa escreve ([injeção de prompt entra pelo nome da campanha](https://precisian.io/blog/pt-BR/posts/injecao-de-prompt-em-dado-de-marketing/)).

**Distribuição que a anonimização apaga.** Anonimizar bem embaralha justamente o que identifica: cidade pequena, cliente com 300 pedidos, CNPJ que compra em atacado. Se a pergunta do negócio depende desses casos, a cópia responde diferente da produção, e o gabarito passa sem provar nada.

**Pergunta que ninguém escreveu.** O gabarito cobre o que o time lembrou de perguntar. O agente vai receber o resto. Teste reduz a superfície desconhecida; não a zera.

**Definição que não existe.** Se a empresa não decidiu se receita é bruta ou líquida, o gabarito vai refletir a opinião de quem escreveu o SQL, e o teste passa ou falha conforme essa opinião. Nenhuma ferramenta de teste conserta isso. É trabalho de [camada semântica](https://precisian.io/blog/pt-BR/posts/camada-semantica/), versionada e com dono.

E quando a Precisian não é a resposta: se o seu servidor MCP fica em cima de uma fonte só, com dicionário de métrica já escrito e um papel de leitura bem configurado, o Inspector mais o gabarito deste roteiro bastam. Plataforma gerenciada faz sentido quando são várias fontes, cada uma com a própria definição de receita, e ninguém tem tempo de manter a cópia, o gabarito e o teto de custo vivos. Mesmo aí, o agente continua sendo o seu: a Precisian entrega até a camada semântica, e quem pergunta é a IA que você já usa.

## O que este artigo não cobre

Não ensina a construir um servidor MCP nem compara implementações; o mercado muda mais rápido que qualquer lista. Não cobre a revisão de MCP Apps, que tem roteiro próprio no repositório do Inspector. Não trata de métodos de streaming e sessão, que a CLI recusa por desenho: uma invocação é uma requisição e uma resposta. E não avalia a qualidade do modelo de linguagem em si, só o caminho entre a pergunta e o dado.

---

Se o seu agente já respondeu um faturamento que ninguém conseguiu reproduzir em SQL, o primeiro passo é montar o gabarito e descobrir em qual das três camadas o número muda. [Veja um MCP governado respondendo](https://precisian.io/demonstracao?utm_source=blog&utm_medium=cta&utm_campaign=testar-servidor-mcp-antes-da-producao&utm_content=texto) sobre um lake isolado, sem compromisso de contrato.
