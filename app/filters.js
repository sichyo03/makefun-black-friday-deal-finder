// Filtering and sorting for the board. Pure functions over the deal list: the board view keeps
// one state object, every control edits it, and `apply` turns it into the visible deals.

import { percentOff, saved, verdict } from "./verdict.js";

export const PRICE_BANDS = [
  { id: "all", label: "Any price", test: () => true },
  { id: "u25", label: "Under $25", test: (d) => d.price < 25 },
  { id: "25-100", label: "$25–$100", test: (d) => d.price >= 25 && d.price <= 100 },
  { id: "100-500", label: "$100–$500", test: (d) => d.price > 100 && d.price <= 500 },
  { id: "o500", label: "Over $500", test: (d) => d.price > 500 },
];

export const DISCOUNT_BANDS = [
  { id: "all", label: "Any discount", test: () => true },
  { id: "d25", label: "25%+ off", test: (d) => percentOff(d) >= 25 },
  { id: "d40", label: "40%+ off", test: (d) => percentOff(d) >= 40 },
  { id: "d50", label: "50%+ off", test: (d) => percentOff(d) >= 50 },
  { id: "d65", label: "65%+ off", test: (d) => percentOff(d) >= 65 },
];

export const SORTS = [
  { id: "verdict", label: "Best verdict first" },
  { id: "discount", label: "Biggest discount" },
  { id: "saved", label: "Biggest $ saving" },
  { id: "price", label: "Lowest price" },
  { id: "ending", label: "Ending soonest" },
];

export const freshState = () => ({
  q: "",
  category: "all",
  store: "all",
  price: "all",
  discount: "all",
  band: "all",
  sort: "verdict",
});

const BAND_RANK = { "Real deal": 0, "Good price": 1, "Routine sale": 2, "Thin discount": 3 };

function matches(deal, state) {
  if (state.category !== "all" && deal.category !== state.category) return false;
  if (state.store !== "all" && deal.store !== state.store) return false;
  if (state.band !== "all" && verdict(deal).band !== state.band) return false;
  const priceBand = PRICE_BANDS.find((b) => b.id === state.price) ?? PRICE_BANDS[0];
  if (!priceBand.test(deal)) return false;
  const discountBand = DISCOUNT_BANDS.find((b) => b.id === state.discount) ?? DISCOUNT_BANDS[0];
  if (!discountBand.test(deal)) return false;
  const q = state.q.trim().toLowerCase();
  if (q !== "") {
    const haystack = `${deal.title} ${deal.store} ${deal.category}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}

function compare(a, b, sort) {
  switch (sort) {
    case "discount":
      return percentOff(b) - percentOff(a) || a.price - b.price;
    case "saved":
      return saved(b) - saved(a) || percentOff(b) - percentOff(a);
    case "price":
      return a.price - b.price || percentOff(b) - percentOff(a);
    case "ending": {
      const ea = a.ends ?? "9999-12-31";
      const eb = b.ends ?? "9999-12-31";
      return ea < eb ? -1 : ea > eb ? 1 : percentOff(b) - percentOff(a);
    }
    default: {
      const va = verdict(a);
      const vb = verdict(b);
      return BAND_RANK[va.band] - BAND_RANK[vb.band] || vb.gap - va.gap || percentOff(b) - percentOff(a);
    }
  }
}

export function apply(deals, state) {
  return deals.filter((d) => matches(d, state)).sort((a, b) => compare(a, b, state.sort));
}

// True when the shopper has narrowed the board (search or any filter; sort alone does not
// count). The board hides its Top 5 hero then — the hero is for browsing, not for searching.
export function isFiltered(state) {
  return (
    state.q.trim() !== "" ||
    state.category !== "all" ||
    state.store !== "all" ||
    state.price !== "all" ||
    state.discount !== "all" ||
    state.band !== "all"
  );
}

export function counts(deals) {
  const stores = new Set(deals.map((d) => d.store));
  const categories = new Set(deals.map((d) => d.category));
  const realDeals = deals.filter((d) => verdict(d).band === "Real deal").length;
  const crossStore = deals.filter((d) => (d.alts ?? []).length > 0).length;
  return { total: deals.length, stores: stores.size, categories: categories.size, realDeals, crossStore };
}

export function topDeals(deals, n) {
  // The hero row favours doorbusters a shopper would queue for: real deals at $50 or more,
  // deepest verdict gap first, then the biggest money saving.
  return deals
    .filter((d) => d.price >= 50)
    .sort((a, b) => {
      const va = verdict(a);
      const vb = verdict(b);
      return BAND_RANK[va.band] - BAND_RANK[vb.band] || vb.gap - va.gap || saved(b) - saved(a);
    })
    .slice(0, n);
}
