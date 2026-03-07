export const formatHnlCurrency = new Intl.NumberFormat("es-HN", {
  style: "currency",
  currency: "HNL",
  minimumFractionDigits: 2,
});

export function formatPrice(value) {
  return formatHnlCurrency.format(Number(value || 0));
}
