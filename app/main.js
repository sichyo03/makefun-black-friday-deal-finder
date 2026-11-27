// DoorBuster Board — hash routing and filter state.
//
//   #/            the board (search, filters, sort)
//   #/deal/<id>   one deal, with its verdict maths and other stores' prices
//
// The board also accepts filter parameters in the hash (e.g. #/?cat=Gaming&disc=d50&sort=discount)
// so a view can be linked — and screenshotted — exactly as a shopper would set it up.
// window.__shotReady is false while a page renders and true once it is on screen, so a
// screenshot script knows when to capture.

import { deals, codes } from "./data.js";
import { apply, counts, freshState, topDeals } from "./filters.js";
import { board, dealPage, missingPage } from "./views.js";

const app = document.getElementById("app");
const tally = counts(deals);
const top = topDeals(deals, 5);
let state = freshState();

const PARAM_TO_STATE = { q: "q", cat: "category", store: "store", price: "price", disc: "discount", band: "band", sort: "sort" };

function stateFromHash(hash) {
  const next = freshState();
  const query = hash.split("?")[1];
  if (query) {
    for (const pair of query.split("&")) {
      const [key, value] = pair.split("=");
      const field = PARAM_TO_STATE[decodeURIComponent(key ?? "")];
      if (field && value !== undefined) next[field] = decodeURIComponent(value.replace(/\+/g, " "));
    }
  }
  return next;
}

function renderBoard() {
  const shown = apply(deals, state);
  app.innerHTML = board({ deals, shown, state, tally, top, codes });
  bindControls();
}

function bindControls() {
  const search = app.querySelector('input[data-filter="q"]');
  if (search) {
    search.addEventListener("input", () => {
      state.q = search.value;
      refreshGrid();
    });
  }
  for (const select of app.querySelectorAll("select[data-filter]")) {
    select.addEventListener("change", () => {
      state[select.dataset.filter] = select.value;
      renderBoard();
    });
  }
  for (const chip of app.querySelectorAll("button[data-filter]")) {
    chip.addEventListener("click", () => {
      if (chip.dataset.filter === "reset") state = freshState();
      else state[chip.dataset.filter] = chip.dataset.value;
      renderBoard();
    });
  }
}

// Typing in search only re-renders the grid, so the input keeps focus.
function refreshGrid() {
  const shown = apply(deals, state);
  const grid = document.getElementById("grid");
  const count = document.getElementById("result-count");
  if (grid && count) {
    const tmp = document.createElement("div");
    tmp.innerHTML = board({ deals, shown, state, tally, top, codes });
    grid.innerHTML = tmp.querySelector("#grid").innerHTML;
    count.textContent = `Showing ${shown.length} of ${deals.length} deals`;
  }
}

function render() {
  window.__shotReady = false;
  const match = location.hash.match(/^#\/deal\/([^/?]+)/);
  if (match) {
    const found = deals.find((d) => d.id === decodeURIComponent(match[1]));
    document.title = `${found ? found.title : "Not found"} | DoorBuster Board`;
    app.innerHTML = found ? dealPage(found) : missingPage();
  } else {
    document.title = "DoorBuster Board — Black Friday deals, checked today";
    state = stateFromHash(location.hash);
    renderBoard();
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener("hashchange", render);
render();
