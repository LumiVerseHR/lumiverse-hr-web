// A price as schema.org sees it: a floor unless it's fixed, never VAT-inclusive.
export type Price = { from: number; per: string; then?: number; fullTime?: number; fixed?: boolean };

export function priceSpecification(price: Price) {
  const base = { "@type": "UnitPriceSpecification", priceCurrency: "EUR", valueAddedTaxIncluded: false };
  const amount = price.per === "once" || price.fixed ? { price: price.from } : { minPrice: price.from };
  const unit = price.per === "month" ? { unitCode: "MON" } : price.per === "day" ? { unitCode: "DAY" } : {};
  const first = { ...base, ...amount, ...unit };
  if (price.fullTime) return [{ ...first, name: "Part-time" }, { ...base, minPrice: price.fullTime, unitCode: "MON", name: "Full-time" }];
  if (!price.then) return first;
  return [first, { ...base, ...(price.fixed ? { price: price.then } : { minPrice: price.then }), unitCode: "MON" }];
}
