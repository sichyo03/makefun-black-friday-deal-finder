// The "really a deal" verdict: a stated rule, applied the same way to every deal.
//
// Black Friday discounts are not equal across the store. A 20% cut on a laptop can be a real
// event while 40% off a fashion list price is just Tuesday. So each deal's discount is compared
// with the typical Black Friday discount for its category (the table below), and with any
// price-history evidence its source states ("all-time low", "lowest price ever", "best price
// seen", "lowest since launch", "first big discount").
//
//   Real deal      discount beats the category-typical cut by 15+ points, or the source states
//                  a lowest-ever / all-time-low price
//   Good price     discount beats the category-typical cut
//   Routine sale   discount is within 10 points under the category-typical cut
//   Thin discount  anything shallower
//
// Where a source says the "usual" price is a maker list or comparison value, the deal card
// shows that note next to the price so the discount can be read with that in mind.

export const TYPICAL = {
  "TVs & home theater": 30,
  "Audio": 35,
  "Computers": 20,
  "Phones & tablets": 15,
  "Wearables": 20,
  "Gaming": 30,
  "Smart home": 35,
  "Kitchen": 30,
  "Home & appliances": 30,
  "Toys & games": 40,
  "Fashion & beauty": 50,
};

const LOWEST_EVER = /all-time low|lowest price ever|lowest price this year|best-ever price|best price seen|record low|lowest price since launch|first (major|big) discount/i;

export const percentOff = (deal) => Math.round((1 - deal.price / deal.was) * 100);
export const saved = (deal) => Math.round((deal.was - deal.price) * 100) / 100;

export function verdict(deal) {
  const off = percentOff(deal);
  const typical = TYPICAL[deal.category] ?? 30;
  const gap = off - typical;
  const lowest = LOWEST_EVER.test(deal.note ?? "");
  let band;
  if (lowest || gap >= 15) band = "Real deal";
  else if (gap >= 0) band = "Good price";
  else if (gap >= -10) band = "Routine sale";
  else band = "Thin discount";
  const why = lowest
    ? `Price-history evidence states a lowest-ever price. Discount ${off}% vs typical −${typical}% for ${deal.category}.`
    : `Discount ${off}% vs typical −${typical}% for ${deal.category} (${gap >= 0 ? "+" : ""}${gap} pts).`;
  return { band, off, typical, gap, lowest, why };
}

export const BAND_ORDER = ["Real deal", "Good price", "Routine sale", "Thin discount"];
