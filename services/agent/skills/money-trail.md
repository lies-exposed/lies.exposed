---
name: money-trail
description: Follow the money — list transactions to/from an actor or group, trace funding chains across hops, total by currency, flag conflicts of interest
triggers: [money, funding, funded, funder, paid, payment, donation, donor, grant, financed, sponsor, follow the money, who pays, lobbying, transactions]
---

# Money Trail

## 1. Resolve the subject

`actor list --fullName=...` or `group list --query=...` → UUID. Several matches → ask which one.

## 2. Direct transactions (platform)

```
liexp_cli("event list --actors=<uuid> --type=Transaction --end=100")   # or --groups=<uuid>
```
For each: date, from (type + id), to (type + id), total, currency, links. Split into **incoming** and **outgoing**.

## 3. Follow hops

For the top counterparties (by amount or by relevance to the question), repeat step 2 on them — up to 2 hops unless the user asks for more. Look for:
- the same funder behind several recipients
- money going back to the origin (circular flows)
- funders that also appear as subjects/authors of events about the recipient (studies, reports, regulatory decisions) — possible conflict of interest

## 4. Web gaps (optional, when asked or platform data is thin)

Search registries and disclosures (grant databases, annual reports, lobbying registers, SEC/EDGAR, company registries). Report web-only flows separately with URLs.

## 5. Output

- Totals in / out **per currency** (never sum different currencies)
- Table: date | from → to | amount | source (event UUID or URL)
- Chains found (A → B → C) and conflict-of-interest flags, stated as facts with sources, not accusations
- Offer to record missing transactions via `event-create` (type Transaction) — platform agents only.
