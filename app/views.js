// HTML for the board and the deal pages. Every value from the data is escaped before it lands
// in markup. Prices are formatted here; discounts and verdicts come from verdict.js.

import { percentOff, saved, verdict, TYPICAL } from "./verdict.js";
import { DISCOUNT_BANDS, PRICE_BANDS, SORTS } from "./filters.js";

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
export const usd = (n) => `$${n.toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;
export const dayTime = (iso) =>
  new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC";
export const dayOnly = (iso) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", { dateStyle: "medium", timeZone: "UTC" });

const BAND_CLASS = {
  "Real deal": "v-real",
  "Good price": "v-good",
  "Routine sale": "v-routine",
  "Thin discount": "v-thin",
};

function badge(deal) {
  const v = verdict(deal);
  return `<span class="badge ${BAND_CLASS[v.band]}">${v.band}</span>`;
}

function altsLine(deal) {
  if (!deal.alts?.length) return "";
  const parts = deal.alts.map((a) => `${esc(a.store)} ${usd(a.price)}`).join(" · ");
  return `<p class="alts">Also at ${parts}</p>`;
}

export function card(deal) {
  const v = verdict(deal);
  return `<article class="card">
  <div class="card-top">${badge(deal)}<span class="off">−${v.off}%</span></div>
  <h3><a href="#/deal/${encodeURIComponent(deal.id)}">${esc(deal.title)}</a></h3>
  <p class="store">${esc(deal.store)} · ${esc(deal.category)}</p>
  <p class="price">${usd(deal.price)} <s>${usd(deal.was)}</s> <span class="save">save ${usd(saved(deal))}</span></p>
  ${altsLine(deal)}
  <p class="meta">Checked ${dayTime(deal.checked)}<br>Read in ${esc(deal.source)}</p>
  ${deal.cond ? `<p class="cond">${esc(deal.cond)}</p>` : ""}
  ${deal.ends ? `<p class="ends">Ends ${dayOnly(deal.ends)}</p>` : ""}
  <p class="go"><a href="${esc(deal.url)}" rel="noopener" target="_blank">See it at ${esc(deal.store)} →</a></p>
</article>`;
}

function heroCard(deal, rank) {
  const v = verdict(deal);
  return `<article class="hero-card">
  <span class="rank">#${rank}</span>
  ${badge(deal)}
  <h3><a href="#/deal/${encodeURIComponent(deal.id)}">${esc(deal.title)}</a></h3>
  <p class="price">${usd(deal.price)} <s>${usd(deal.was)}</s> <span class="off">−${v.off}%</span></p>
  <p class="store">${esc(deal.store)} · save ${usd(saved(deal))}</p>
</article>`;
}

function chipRow(label, name, options, active) {
  const chips = options
    .map(
      (o) =>
        `<button type="button" class="chip${o.id === active ? " on" : ""}" data-filter="${name}" data-value="${esc(o.id)}">${esc(o.label)}</button>`,
    )
    .join("");
  return `<div class="frow"><span class="flabel">${label}</span><div class="chips">${chips}</div></div>`;
}

function selectRow(label, name, options, active) {
  const opts = options
    .map((o) => `<option value="${esc(o.id)}"${o.id === active ? " selected" : ""}>${esc(o.label)}</option>`)
    .join("");
  return `<label class="fsel"><span class="flabel">${label}</span><select data-filter="${name}">${opts}</select></label>`;
}

export function board({ deals, shown, state, tally, top, codes }) {
  const categories = ["all", ...new Set(deals.map((d) => d.category))].map((c) => ({
    id: c,
    label: c === "all" ? "All categories" : c,
  }));
  const stores = ["all", ...new Set(deals.map((d) => d.store))].sort((a, b) =>
    a === "all" ? -1 : b === "all" ? 1 : a.localeCompare(b),
  ).map((s) => ({ id: s, label: s === "all" ? "All stores" : s }));
  const bands = ["all", "Real deal", "Good price", "Routine sale", "Thin discount"].map((b) => ({
    id: b,
    label: b === "all" ? "Any verdict" : b,
  }));

  return `<section class="masthead">
  <h1>DoorBuster Board</h1>
  <p class="tagline">Real Black Friday deals, read and checked today — with a verdict on whether each one is really a deal.</p>
  <p class="tally"><strong>${tally.total} deals</strong> · <strong>${tally.stores} stores</strong> · <strong>${tally.categories} categories</strong> · <strong>${tally.realDeals} rated “Real deal”</strong> · <strong>${tally.crossStore} priced at 2+ stores</strong></p>
  <p class="checked-note">Every price checked Fri 27 Nov 2026 (UTC), read in the source named on its card. Discounts are computed from the two prices, never typed in.</p>
</section>

<section class="hero">
  <h2>Top 5 real deals</h2>
  <div class="hero-grid">${top.map((d, i) => heroCard(d, i + 1)).join("")}</div>
</section>

<section class="filters" aria-label="Filter deals">
  <div class="frow search-row">
    <label class="search"><span class="flabel">Search</span>
      <input type="search" data-filter="q" placeholder="Product, store or category…" value="${esc(state.q)}">
    </label>
    ${selectRow("Sort", "sort", SORTS, state.sort)}
  </div>
  ${chipRow("Category", "category", categories, state.category)}
  <div class="frow selects">
    ${selectRow("Store", "store", stores, state.store)}
    ${selectRow("Price", "price", PRICE_BANDS, state.price)}
    ${selectRow("Discount", "discount", DISCOUNT_BANDS, state.discount)}
    ${selectRow("Verdict", "band", bands, state.band)}
  </div>
  <p class="result-count" id="result-count">Showing ${shown.length} of ${deals.length} deals</p>
</section>

<section class="grid" id="grid">${shown.map(card).join("") || `<p class="none">No deal matches those filters. <button type="button" class="chip" data-filter="reset" data-value="all">Clear filters</button></p>`}</section>

<section class="codes">
  <h2>Store-wide codes</h2>
  <ul>${codes.map((c) => `<li><strong>${esc(c.store)}</strong> — ${esc(c.offer)} with code <code>${esc(c.code)}</code> <span class="meta">(read in ${esc(c.source)})</span></li>`).join("")}</ul>
</section>

<section class="rule">
  <h2>How the verdict works</h2>
  <p>Each deal's discount is compared with the typical Black Friday cut for its category
  (${Object.entries(TYPICAL).map(([c, t]) => `${c} −${t}%`).join(", ")}).
  <strong>Real deal</strong>: beats the typical cut by 15+ points, or the source states a lowest-ever price.
  <strong>Good price</strong>: beats the typical cut. <strong>Routine sale</strong>: within 10 points under it.
  <strong>Thin discount</strong>: shallower than that. Where a source says the “usual” price is a maker
  list or comparison value, the card says so — read the discount with that in mind. Open any deal to see its maths.</p>
</section>`;
}

export function dealPage(deal) {
  const v = verdict(deal);
  const alts = (deal.alts ?? [])
    .map(
      (a) => `<tr><td>${esc(a.store)}</td><td>${usd(a.price)}</td><td><a href="${esc(a.url)}" rel="noopener" target="_blank">See it →</a></td></tr>`,
    )
    .join("");
  return `<p><a href="#/">← All deals</a></p>
<h1>${esc(deal.title)}</h1>
<p class="price big">${usd(deal.price)} <s>${usd(deal.was)}</s> <span class="off">−${v.off}%</span> ${badge(deal)}</p>
<dl class="facts">
  <dt>Store</dt><dd>${esc(deal.store)}</dd>
  <dt>Category</dt><dd>${esc(deal.category)}</dd>
  <dt>You save</dt><dd>${usd(saved(deal))} off the usual price</dd>
  <dt>Verdict maths</dt><dd>${esc(v.why)}</dd>
  ${deal.note ? `<dt>Price history</dt><dd>${esc(deal.note)}</dd>` : ""}
  ${deal.cond ? `<dt>Condition</dt><dd>${esc(deal.cond)}</dd>` : ""}
  ${deal.ends ? `<dt>Sale ends</dt><dd>${dayOnly(deal.ends)}</dd>` : ""}
  <dt>Price checked</dt><dd>${dayTime(deal.checked)}</dd>
  <dt>Read in</dt><dd>${esc(deal.source)}</dd>
</dl>
${alts ? `<h2>Same product, other stores</h2><table class="alts-table"><thead><tr><th>Store</th><th>Price</th><th></th></tr></thead><tbody><tr><td>${esc(deal.store)} (this deal)</td><td>${usd(deal.price)}</td><td><a href="${esc(deal.url)}" rel="noopener" target="_blank">See it →</a></td></tr>${alts}</tbody></table>` : ""}
<p class="go big"><a href="${esc(deal.url)}" rel="noopener" target="_blank">See it at ${esc(deal.store)} →</a></p>
<p class="meta">Prices move fast on Black Friday — the store page has the final word. This board shows the price as read at the check time above.</p>`;
}

export function missingPage() {
  return `<h1>Not found</h1><p>There is no deal at this address. <a href="#/">See all deals</a>.</p>`;
}
