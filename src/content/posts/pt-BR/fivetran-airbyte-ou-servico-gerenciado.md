---
title: "Fivetran, Airbyte ou serviço gerenciado: o custo que não está na tabela de preço"
description: "Fivetran cobra por linha ativa e Airbyte por crédito, mas em 14/10/2026 nenhuma das duas tinha conector de VTEX ou Nuvemshop no catálogo oficial."
slug: "fivetran-airbyte-ou-servico-gerenciado"
lang: "pt-BR"
translationKey: "elt-tool-choice"
publishedAt: 2026-10-14
tags: ["build-vs-buy", "integracao", "pipeline", "custo", "ecommerce", "data-lake"]
draft: false
llmSummary: "Em 14/10/2026, nem o catálogo oficial da Fivetran nem o registro de conectores do Airbyte Cloud tinha conector de VTEX ou Nuvemshop; do Mercado Livre, o Airbyte lista só o Mercado Ads, mantido pela comunidade. A Fivetran cobra por MAR e o Airbyte Cloud parte de US$ 20/mês."
citations: ["https://fivetran.com/docs/core-concepts/usage-based-pricing", "https://fivetran.com/docs/core-concepts/usage-based-pricing/pricing-updates/2026-pricing-updates", "https://www.fivetran.com/pricing", "https://fivetran.com/docs/connectors", "https://fivetran.com/docs/connector-sdk", "https://www.fivetran.com/press/fivetran-dbt-labs-complete-merger-to-create-the-data-infrastructure-for-trusted-ai-agents", "https://airbyte.com/pricing", "https://docs.airbyte.com/integrations/connector-support-levels", "https://connectors.airbyte.com/files/registries/v0/cloud_registry.json", "https://docs.airbyte.com/integrations/sources/mercado-ads", "https://github.com/airbytehq/airbyte-platform/blob/main/LICENSE"]
about: ["https://en.wikipedia.org/wiki/Extract%2C_load%2C_transform", "https://precisian.io/precos"]
author: "Gabriel Sorato"
readingTimeMinutes: 7
---

Para um e-commerce brasileiro, a escolha entre Fivetran e Airbyte costuma ser decidida antes da tabela de preço: em 14/10/2026, nem o [catálogo oficial da Fivetran](https://fivetran.com/docs/connectors) nem o [registro de conectores do Airbyte Cloud](https://connectors.airbyte.com/files/registries/v0/cloud_registry.json) tinha conector de VTEX ou Nuvemshop. Onde não há conector pronto, alguém escreve e mantém um. Esse alguém é o custo maior, e ele não aparece em nenhuma das duas páginas de preço.

> **Ferramenta de ELT**: software que extrai dado das fontes (plataformas de mídia, loja, ERP), carrega num destino (data lake ou data warehouse) e deixa a transformação para depois do carregamento.

Esta peça decide **ferramenta**. Se a dúvida ainda é de arquitetura, montar com peças ou contratar o conjunto, ela foi tratada em [construir ou contratar um data lake](https://precisian.io/blog/pt-BR/posts/construir-ou-contratar-data-lake/), e não repito aqui a conta de armazenamento e consulta.

## Quais critérios decidem a escolha da ferramenta?

Cinco, nesta ordem. Discorde de qualquer um antes de ler a tabela.

1. **Cobertura das suas fontes, e quem mantém cada conector.** Ter o nome na lista é diferente de ter alguém responsável quando a API da fonte muda.
2. **Unidade de cobrança e previsibilidade.** Linha ativa, crédito ou capacidade. O que importa é conseguir estimar a fatura de daqui a doze meses.
3. **Quem conserta quando quebra.** Conector parado, carga parcial, schema que mudou na origem.
4. **Quem modela.** A ferramenta de ELT entrega tabela crua. Receita líquida, pedido válido e canal são definições que alguém precisa escrever.
5. **O que acontece se você sair.** Para onde vão o dado, o histórico e a lógica de transformação.

Ficou de fora, de propósito: velocidade de sincronização (para dado de marketing, uma hora costuma bastar) e preço do warehouse, que é outra decisão e está no [comparativo de data lake e data warehouse](https://precisian.io/blog/pt-BR/posts/data-lake-ou-data-warehouse/).

## Como a Fivetran cobra em 2026?

Por **MAR** (*monthly active rows*), que a própria Fivetran define como "the number of distinct rows synced from the source system to your destination system in a given calendar month", contadas por chave primária distinta, uma vez por mês ([Fivetran](https://fivetran.com/docs/core-concepts/usage-based-pricing), consultado em 14/10/2026).

Duas mudanças de 2026 entram na conta ([Fivetran, atualizações de preço de 2026](https://fivetran.com/docs/core-concepts/usage-based-pricing/pricing-updates/2026-pricing-updates)):

- **Cobrança mínima por conexão:** toda conexão padrão com 1 a 1 milhão de MAR no mês paga uma base de US$ 5 no plano Standard, desde 1º/01/2026 no pré-pago mensal e na renovação para contrato anual. Um e-commerce com 12 conexões pequenas começa em US$ 60 por mês antes de qualquer linha.
- **Inserção, atualização e exclusão contam como MAR pago**, cada linha uma vez por mês, também desde 1º/01/2026.

O plano Free cobre 500 mil MAR por mês ([Fivetran, pricing](https://www.fivetran.com/pricing)). A tarifa por MAR acima disso continua sem número publicado: a página diz que o custo é o uso multiplicado por uma taxa que depende de volume e plano, e não traz a taxa. Esse é o mesmo problema de previsibilidade que [o post de build vs buy](https://precisian.io/blog/pt-BR/posts/construir-ou-contratar-data-lake/) já mediu do lado da arquitetura.

Desde **1º/06/2026**, a Fivetran é também a dona do dbt: a [fusão com a dbt Labs foi concluída](https://www.fivetran.com/press/fivetran-dbt-labs-complete-merger-to-create-the-data-infrastructure-for-trusted-ai-agents), e o mesmo fornecedor passa a vender a extração e a ferramenta de modelagem mais usada depois dela. O release mantém o dbt Core como open source. A camada de contexto para agentes que eles lançaram depois foi comparada com o MCP em [Agents Schema ou MCP](https://precisian.io/blog/pt-BR/posts/agents-schema-ou-mcp/).

## E o Airbyte, na nuvem ou instalado por você?

São dois produtos com custo de natureza diferente ([Airbyte, pricing](https://airbyte.com/pricing), consultado em 14/10/2026):

- **Standard (nuvem):** a partir de US$ 20/mês com 5 créditos inclusos; crédito extra a US$ 5.
- **Plus:** pacotes de créditos a partir de US$ 189/mês por 40 créditos, com sincronização a cada 15 minutos ([Airbyte](https://airbyte.com/pricing)).
- **Pro e Enterprise Flex:** preço por capacidade, medida em *Data Workers*, sob consulta.
- **Core:** a versão para instalar na sua infraestrutura. A página não lista preço.

A licença muda o sentido de "open source" aqui. O código da plataforma do Airbyte é publicado sob a [Elastic License 2.0](https://github.com/airbytehq/airbyte-platform/blob/main/LICENSE), que autoriza o uso sem royalties e proíbe oferecer o software a terceiros como serviço gerenciado. Para uma loja usando internamente, isso não pesa. O que pesa é que o Core não tem fatura, e o custo dele vira servidor, atualização e plantão.

## As ferramentas cobrem VTEX, Mercado Livre e Nuvemshop?

Não. Conferi em 14/10/2026 no [catálogo da Fivetran](https://fivetran.com/docs/connectors) e no [registro do Airbyte Cloud](https://connectors.airbyte.com/files/registries/v0/cloud_registry.json):

| Fonte | Fivetran (catálogo oficial) | Airbyte Cloud (registro oficial) |
|---|---|---|
| VTEX | não consta | não consta |
| Nuvemshop | não consta | não consta |
| Mercado Livre (vendas) | não consta | não consta |
| Mercado Livre (Mercado Ads) | não consta | consta, nível Marketplace, versão 0.0.47 |
| Shopify | consta | consta, mantido pelo Airbyte |


A lista também não diz quem mantém cada conector. No registro do Airbyte Cloud, **67 de 573 conectores de origem** são mantidos pelo próprio Airbyte; os outros 506 são de nível Marketplace, que a documentação descreve como "not maintained by Airbyte", fora dos SLAs de suporte, e sujeitos a "backward-incompatible, breaking changes with no notice" ([Airbyte](https://docs.airbyte.com/integrations/connector-support-levels)).

O conector do Mercado Ads foi publicado em 26/05/2025 por um membro da comunidade, via Connector Builder, e a versão de 07/10/2026 corrigiu a persistência do token de atualização do Mercado Livre, que é de uso único ([Airbyte](https://docs.airbyte.com/integrations/sources/mercado-ads)). Até essa correção, uma conexão podia perder a autenticação depois da primeira renovação.

Do lado da Fivetran, a saída para fonte ausente é o Connector SDK, em Python, e a documentação é explícita: "Fivetran manages the platform; you own the connector code" ([Fivetran](https://fivetran.com/docs/connector-sdk)). A cobrança continua por MAR.

## Onde está o custo maior?

Na pessoa que modela, monitora e conserta. As duas ferramentas resolvem o transporte. Nenhuma das duas escreve o que é receita líquida, nem percebe sozinha que a carga de ontem chegou pela metade.

Um exemplo com números redondos, sintético: uma operação com VTEX, Mercado Livre, GA4, Google Ads e Meta. Três fontes têm conector mantido pelo fornecedor; duas exigem código próprio. Se cada conector próprio consumir quatro horas por mês de manutenção, se a modelagem de receita e canal consumir mais vinte e o monitoramento de carga outras oito, são 36 horas por mês de alguém que entende de dado. A fatura da ferramenta é a parte pequena dessa conta.

O monitoramento é o item que mais se subestima, porque a falha comum é a carga parcial que parece um dia fraco e não gera erro nenhum. Escrevi sobre os modos documentados disso em [como saber se o pipeline de dados quebrou](https://precisian.io/blog/pt-BR/posts/como-saber-se-o-pipeline-de-dados-quebrou/).

## Como as opções se comparam, critério a critério?

| Critério | Fivetran | Airbyte Cloud | Airbyte Core (instalado) | Serviço gerenciado |
|---|---|---|---|---|
| Unidade de cobrança | MAR + base de US$ 5 por conexão | crédito ou capacidade | sem licença; custo de infra e pessoa | mensalidade de serviço |
| Previsibilidade | baixa: tarifa por MAR não publicada | média: preço de crédito publicado | alta na infra, baixa na pessoa | alta, se o contrato fixa o escopo |
| VTEX, Nuvemshop, Mercado Livre | código seu, via SDK | código seu ou da comunidade | código seu ou da comunidade | depende do fornecedor: pergunte quais mantém |
| Quem conserta | Fivetran nos conectores dela; você no SDK | Airbyte em 67 conectores; comunidade ou você no resto | você | o fornecedor, se estiver no contrato |
| Quem modela | você (dbt, agora da mesma empresa) | você | você | depende: confira se entra camada semântica |
| Se você sair | dado no seu destino; lógica no seu dbt | dado no seu destino | tudo seu | confira portabilidade do dado e das definições |

Preços de [Fivetran](https://www.fivetran.com/pricing) e [Airbyte](https://airbyte.com/pricing) conferidos em 14/10/2026.

"Serviço gerenciado" é uma categoria, não um fornecedor. A pergunta que separa um bom de um ruim é a mesma da coluna: quem mantém o conector de VTEX quando a API muda numa sexta-feira de Black Friday.

## Quando **não** escolher a Precisian?

A Precisian é um serviço gerenciado: ingestão, data lake isolado por cliente na nossa infraestrutura, camada semântica e acesso por MCP, API ou BI. Ela é a escolha errada em dois casos que vejo com frequência.

**Quando você já tem engenheiro de dados dedicado e warehouse pago.** Se o time já opera BigQuery ou Snowflake, já tem dbt e alguém com tempo reservado para manter conector, o ganho de terceirizar é pequeno. Fivetran ou Airbyte encaixam no que existe, e trocar de plataforma custaria mais que o problema.

**Quando todas as suas fontes têm conector mantido pelo fornecedor.** Uma loja em Shopify com Google Ads, Meta e GA4 encontra os quatro mantidos pelo Airbyte. Se alguém do time escreve as definições de métrica, a ferramenta resolve.

## O que recomendar, por perfil?

**Fontes globais, sem engenheiro de dados:** Airbyte Cloud no plano de entrada. O preço é publicado e você consegue estimar a fatura sozinho.

**Time de dados maduro, já no ecossistema dbt:** Fivetran faz sentido, agora com extração e modelagem sob o mesmo contrato. Peça a tabela de consumo por escrito antes de assinar, porque a tarifa por MAR não está publicada.

**Engenheiro disponível e orçamento curto:** Airbyte Core, contando o plantão como custo real.

**VTEX, Mercado Livre ou Nuvemshop no centro da operação, sem time de dados:** um serviço gerenciado que mantenha esses conectores e entregue a modelagem. Pergunte por escrito quais fontes ele mantém e quem escreve as definições de métrica.

## O que este artigo não cobre?

Não compara Stitch, Hevo, Matillion nem a biblioteca dlt. Não traz a tarifa por MAR da Fivetran, porque ela não está publicada. Não traz salário de engenheiro de dados no Brasil, pelo motivo explicado no [post de build vs buy](https://precisian.io/blog/pt-BR/posts/construir-ou-contratar-data-lake/). E não discute arquitetura de armazenamento.

---

Se a sua dúvida é quanto custa ter VTEX, Mercado Livre e mídia modelados sem montar um time para isso, o primeiro passo é listar quais conectores você precisaria manter. O que entra na mensalidade da Precisian está em [preços](https://precisian.io/precos), sem compromisso de contrato, mas sem promessa de resposta em 30 minutos também.
