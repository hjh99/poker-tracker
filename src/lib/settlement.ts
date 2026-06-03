export interface PlayerBalance {
  name: string;
  netResultCents: number; // Positive for winners, negative for losers
}

export interface Transaction {
  from: string;
  to: string;
  amountCents: number;
}

/**
 * Calculates the minimum number of transactions needed to settle a poker session.
 * Uses a greedy matching algorithm matching largest creditors with largest debtors.
 */
export function calculateSettlement(players: PlayerBalance[]): Transaction[] {
  // 1. Separate players into debtors (lost money) and creditors (won money)
  const debtors = players
    .filter((p) => p.netResultCents < 0)
    .map((p) => ({ name: p.name, amount: Math.abs(p.netResultCents) }))
    .sort((a, b) => b.amount - a.amount); // Sort descending to handle big amounts first

  const creditors = players
    .filter((p) => p.netResultCents > 0)
    .map((p) => ({ name: p.name, amount: p.netResultCents }))
    .sort((a, b) => b.amount - a.amount);

  const transactions: Transaction[] = [];

  let dIdx = 0;
  let cIdx = 0;

  // 2. Greedy loop matching debts
  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    // Skip if negligible remaining balance (handling potential 1-cent edge cases)
    if (debtor.amount === 0) {
      dIdx++;
      continue;
    }
    if (creditor.amount === 0) {
      cIdx++;
      continue;
    }

    // Determine the transfer amount (the smaller of the two balances)
    const settlementAmount = Math.min(debtor.amount, creditor.amount);

    transactions.push({
      from: debtor.name,
      to: creditor.name,
      amountCents: settlementAmount,
    });

    // Deduct the settled amount from both records
    debtor.amount -= settlementAmount;
    creditor.amount -= settlementAmount;

    // Advance indexes if balances hit absolute zero
    if (debtor.amount === 0) dIdx++;
    if (creditor.amount === 0) cIdx++;
  }

  return transactions;
}