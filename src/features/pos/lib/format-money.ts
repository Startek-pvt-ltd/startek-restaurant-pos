export function formatMoney(amount: number, currency = "LKR") {
  const formatted = amount.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return currency === "LKR" ? `Rs. ${formatted}` : `${currency} ${formatted}`;
}

