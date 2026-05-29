// lib/settlement.ts
// Calculates the minimum number of transfers to settle a poker session.
// Uses a greedy algorithm: match the biggest debtor with the biggest creditor.
//
// Usage:
//   const transfers = calculateSettlement(players)
//   // returns e.g. [{ from: "Alice", to: "Bob", amount: 4000 }]

export interface PlayerResult {
  userId: string
  name: string
  netResult: number // positive = profit, negative = loss (in cents)
}

export interface Transfer {
  fromId: string
  fromName: string
  toId: string
  toName: string
  amount: number // in cents
}

export function calculateSettlement(players: PlayerResult[]): Transfer[] {
  const transfers: Transfer[] = []

  // Split players into two buckets
  const debtors = players
    .filter((p) => p.netResult < 0)
    .map((p) => ({ ...p, balance: Math.abs(p.netResult) }))
    .sort((a, b) => b.balance - a.balance) // biggest debt first

  const creditors = players
    .filter((p) => p.netResult > 0)
    .map((p) => ({ ...p, balance: p.netResult }))
    .sort((a, b) => b.balance - a.balance) // biggest credit first

  let i = 0 // debtor pointer
  let j = 0 // creditor pointer

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]
    const creditor = creditors[j]

    // Transfer the smaller of the two balances
    const amount = Math.min(debtor.balance, creditor.balance)

    transfers.push({
      fromId: debtor.userId,
      fromName: debtor.name,
      toId: creditor.userId,
      toName: creditor.name,
      amount,
    })

    debtor.balance -= amount
    creditor.balance -= amount

    // Move pointer if balance is cleared
    if (debtor.balance === 0) i++
    if (creditor.balance === 0) j++
  }

  return transfers
}

// Helper: format cents as a readable currency string
// e.g. 4000 → "$40.00"
export function formatAmount(cents: number, currency = "SGD"): string {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency,
  }).format(cents / 100)
}

// Helper: summarise results for display
// Returns a sorted leaderboard with formatted net results
export function buildLeaderboard(players: PlayerResult[]) {
  return [...players]
    .sort((a, b) => b.netResult - a.netResult)
    .map((p) => ({
      ...p,
      formatted: formatAmount(p.netResult),
      label: p.netResult > 0 ? "profit" : p.netResult < 0 ? "loss" : "even",
    }))
}