# DoorBuster Board — Black Friday deal finder

[![make.fun · black-friday-deal-finder-01](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/sichyo03/makefun-black-friday-deal-finder/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/sichyo03/makefun-black-friday-deal-finder/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)

Entry for the make.fun bounty **Build the best real Black Friday deal finder**
(`black-friday-deal-finder-01`). Referral: `p3gwn12d`.

A static board of real Black Friday 2026 deals, read and checked on Friday 27 November 2026.
Every deal shows the product, store, sale price, usual price, computed discount, when the
price was checked, where it was read, and a verdict — **Real deal / Good price / Routine sale /
Thin discount** — from a stated rule: the discount is compared with the typical Black Friday
cut for its category, plus any lowest-ever evidence its source states. Deals priced at two or
more stores show the other stores' prices; store-wide promo codes are listed too.

## Run it

- Preview the site: `node serve.ts`, then open http://localhost:8080 (the site also works by
  opening `app/index.html` — it loads nothing over the network).
- Build the submission: `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`

## Layout

- `app/data.js` — the deals (baked in; each with store link, prices, check time, source)
- `app/verdict.js` — the "really a deal" rule and the category-typical discount table
- `app/filters.js` — search, filters, sorts, counts
- `app/views.js` — board, cards, deal pages
- `app/main.js` — hash routing and filter state
- `app/style.css` — midnight-sale theme, phone layout included
- `screenshots/` — the board, a filtered view, a deal page, and the phone view
- `main.ts` — copies `app/` + `screenshots/` out and writes `dossier.json`
- `vendor/makefun-frontend.ts` — the make.fun library, unmodified
