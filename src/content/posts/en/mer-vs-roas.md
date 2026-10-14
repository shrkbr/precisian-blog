---
title: "MER vs ROAS: measuring ad efficiency on revenue you actually booked"
description: "MER divides total booked revenue by total marketing spend; ROAS divides platform-attributed revenue by one platform's spend. Formulas and limits."
slug: "mer-vs-roas"
lang: "en"
translationKey: "roas-definition"
publishedAt: 2026-10-14
tags: ["roas", "attribution", "ecommerce", "semantic-layer"]
draft: false
llmSummary: "Marketing efficiency ratio (MER) is total revenue booked in a period divided by total marketing spend. ROAS divides revenue an ad platform attributes to itself by spend on that platform; Google Ads documents $5 in sales on $1 of spend as 500% ROAS. MER has no official definition."
citations: ["https://support.google.com/google-ads/answer/6268637?hl=en", "https://support.google.com/google-ads/answer/6270625?hl=en", "https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema", "https://developers.facebook.com/documentation/ads-commerce/marketing-api/ad-rules/guides/roas-ad-rules", "https://advertising.amazon.com/library/guides/acos-advertising-cost-of-sales", "https://support.google.com/google-ads/answer/14102986"]
about: ["https://en.wikipedia.org/wiki/Return_on_investment", "https://precisian.io/en"]
author: "Gabriel Sorato"
readingTimeMinutes: 6
---

Marketing efficiency ratio (MER) is the total revenue a business booked in a period divided by its total marketing spend in that period. ROAS divides only the revenue an ad platform attributes to itself by the spend on that platform; Google's own target ROAS example is "$5 USD in sales ÷ $1 USD in ad spend x 100% = 500%" ([Google Ads Help](https://support.google.com/google-ads/answer/6268637?hl=en)). In a round-number example, $400,000 booked on $50,000 of total spend is an MER of 8.

> **Marketing efficiency ratio (MER)**: total revenue recorded by the business's system of record for a period, divided by total marketing spend for the same period, with no attribution step. Also called *blended ROAS*.

## What is MER, and who defines it?

Nobody, officially.

ROAS has documented definitions from the platforms that report it. MER does not. No ad platform and no accounting standard defines it, and I could not find a recognized author of the term. It is a market metric, and every company that uses it sets its own rules.

That flexibility is the reason to write the rules down before the first report. Four choices change the number:

1. **Which revenue.** Gross sales, net of discounts, or net of refunds. On Shopify those are different lines of the same sales report.
2. **Which channels.** Your own store only, or your store plus Amazon. If Amazon sales are in the numerator, Amazon ad spend belongs in the denominator.
3. **Which spend.** Media only, or media plus agency fees, creative production, affiliate commissions and influencer product.
4. **Which date.** Order date or the date revenue was recognized. Finance closes on the second, which is its own [revenue definition problem](https://precisian.io/blog/en/posts/marketing-finance-revenue-definition/).

Two brands each reporting "MER of 5" can be running very different businesses. MER is comparable month over month inside one company, and almost never across companies.

## How is MER different from ROAS and ROI?

The numerator, the denominator, and what each one leaves out.

| Metric | Formula | Where the numerator comes from | What it ignores | Use it to |
|---|---|---|---|---|
| **ROAS** | attributed revenue ÷ ad spend on that platform | The platform that claimed the sale, under its own attribution rules | Margin, COGS, shipping, returns; sales that would have happened anyway; other platforms claiming the same order | Optimize campaigns, audiences and bids inside one platform |
| **MER** | total booked revenue ÷ total marketing spend | Your system of record: Shopify, the ERP, the finance close | Which channel drove the sale; organic and repeat purchases are mixed in | Track whether the whole marketing budget is getting more or less efficient |
| **ROI** | (profit generated − investment) ÷ investment | Revenue converted to profit using product margin | Little, if margin is right; it inherits whatever errors its revenue input has | Answer the CFO's question: does the spend pay for itself |
| **ACOS** (Amazon) | ad spend ÷ ad revenue × 100 | Amazon's attribution of sales to ads | Same blind spots as ROAS, expressed as a cost share | Manage Amazon campaigns; it is ROAS turned upside down |

Amazon states the ACOS relationship plainly: "ACOS = (ad spend ÷ ad revenue) x 100," and ROAS "is the inverse of Amazon ACOS" ([Amazon Ads](https://advertising.amazon.com/library/guides/acos-advertising-cost-of-sales)). A 20% ACOS and a 5x ROAS describe the same campaign.

## Where does each platform's ROAS numerator come from?

From the platform's own rules, which is why the same month produces different ROAS in Google Ads, Meta and GA4.

**Google Ads.** The "Conv. value / cost" column "is calculated by dividing your total conversion value by the total cost of all ad interactions" ([Google Ads Help](https://support.google.com/google-ads/answer/6270625?hl=en)). The same page says the column "estimates your return on investment." The arithmetic does not subtract product cost or the spend itself, so it is ROAS under an ROI label.

**Meta.** Purchase value comes from Pixel and app purchase events, and the ad rules documentation notes that "if the attribution window includes both click and view windows, the computed ROAS is the sum of the values" ([Meta for Developers](https://developers.facebook.com/documentation/ads-commerce/marketing-api/ad-rules/guides/roas-ad-rules)). A view with no click can land in the numerator.

**GA4.** In the reporting API, "Return On Ad Spend (ROAS) is total revenue divided by advertiser ad cost," where total revenue is purchase, subscription and ad revenue minus refunds ([Google Analytics Data API](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema)). A fourth numerator, under a different credit model.

None of these is wrong by its own rules. The trouble starts when they get added together, which is a separate failure with its own mechanics: [why reported ROAS exceeds actual revenue](https://precisian.io/blog/en/posts/roas-exceeds-actual-revenue/).

## How do MER, ROAS and ROI come out on the same month?

A synthetic month for a Shopify brand that also sells on Amazon, with round numbers chosen to show the arithmetic:

| Line | Calculation (synthetic) | Result |
|---|---|---|
| Google Ads spend | given | $20,000 |
| Meta spend | given | $25,000 |
| Amazon Ads spend | given | $5,000 |
| Total marketing spend | 20,000 + 25,000 + 5,000 | $50,000 |
| Google Ads ROAS | $100,000 claimed ÷ $20,000 | **5.0** |
| Meta ROAS | $125,000 claimed ÷ $25,000 | **5.0** |
| Amazon ROAS | $20,000 claimed ÷ $5,000 | **4.0** (ACOS 25%) |
| Sum of platform claims | 100,000 + 125,000 + 20,000 | $245,000 |
| Booked revenue, Shopify + Amazon | from the system of record | $400,000 |
| MER | 400,000 ÷ 50,000 | **8.0** |
| Contribution margin | 400,000 × 30% | $120,000 |
| ROI on marketing | (120,000 − 50,000) ÷ 50,000 | **140%** |

In this example the platforms claim less than the business booked, because organic search, email and repeat customers are part of the booked total. In many real accounts the platform claims add up to more than booked revenue, for reasons covered in [the overlap post](https://precisian.io/blog/en/posts/roas-exceeds-actual-revenue/). Both shapes are possible, and MER is the number that does not move with either one.

## How do you calculate MER step by step?

Five steps, and only the last one is arithmetic.

1. **Fix the period** and use the same one for revenue and spend. A calendar month is the usual choice because finance closes on it.
2. **Pull revenue from the system of record**, not from any ad platform: the Shopify sales report, the Amazon Seller Central payments report, or the ERP if both feed into it.
3. **Apply the revenue rule you wrote down**: gross or net, with or without refunds, order date or recognition date.
4. **Sum every marketing cost your rule includes**, from every platform invoice plus the fees your definition covers.
5. **Divide revenue by spend.** Keep the rule next to the number, so next quarter's MER is calculated the same way.

## What does MER hide?

Three things, and they are the reasons not to run the business on MER alone.

**Channel.** MER cannot tell you that Meta prospecting stopped working while email carried the month. It is a portfolio number.

**Base demand.** A brand with strong repeat purchase or a seasonal peak will see MER rise with no change in media. Black Friday flatters MER, and a price increase flatters it too.

**Incrementality.** MER moves when spend moves, but it does not tell you what the last dollar bought. Google keeps a separate metric for that, "incremental conversion value / incremental cost = iROAS" ([Google Ads Help](https://support.google.com/google-ads/answer/14102986)), measured against a holdout. Neither ROAS nor MER is that number.

## Is blended ROAS the same as MER?

Usually, yes. Most teams use the two names for the same ratio. Some reserve "blended ROAS" for total revenue over **paid media** spend only, and "MER" for total revenue over **all** marketing spend, including agency fees and content. Since neither term has an official definition, the only safe answer is the one written in your own metric definition.

## When should you use MER, ROAS or ROI?

Each number governs a different decision, and the costly mistake is using one in place of another.

- **ROAS** inside a platform: which campaign, which audience, which bid. The attribution bias is roughly constant within one platform, so internal comparisons hold.
- **MER** for the monthly read: booked revenue over total spend, with no attribution argument. It cannot be inflated by any single vendor.
- **ROI** for the conversation with finance, and to set the break-even ROAS per category, which is one divided by contribution margin.

All three need a written definition before they exist: which revenue, which date, which spend. When that rule lives in someone's spreadsheet, Monday's report and Tuesday's AI agent produce different MERs. When it lives in a [semantic layer](https://precisian.io/blog/en/posts/what-goes-into-a-semantic-layer/), every system reads the same formula before it calculates. The [Shopify and GA4 revenue gap](https://precisian.io/blog/en/posts/shopify-ga4-revenue-mismatch/) is a good place to see what happens when it doesn't.

## What this article doesn't cover

What a good MER is for your category. No primary source publishes a benchmark, the numbers that circulate come from vendors who sell the fix, and the answer depends on your margin and your repeat-purchase rate. It also does not compare attribution models or explain how to run a holdout test. All figures in the worked example are synthetic. The Brazilian version of this piece, focused on how to calculate ROAS itself, is [O que é ROAS](https://precisian.io/blog/pt-BR/posts/o-que-e-roas/) (in Portuguese).

---

If your platform ROAS looks healthy and your MER is falling, the first step is to write down which revenue and which spend go into each ratio and measure the gap between them. [Book a conversation about your numbers](https://calendar.notion.so/meet/rodrigomartucci/precisian-io), no contract commitment.
