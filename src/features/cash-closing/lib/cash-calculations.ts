export function calculateExpectedCash(openingCash: number, cashSales: number, cashExpenses: number) {
  return openingCash + cashSales - cashExpenses;
}

export function calculateCashDifference(actualCash: number, expectedCash: number) {
  return actualCash - expectedCash;
}
