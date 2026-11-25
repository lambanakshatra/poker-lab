/**
 * Build contribution layers. Folded players contribute chips but cannot win.
 * Each returned layer includes the amount and eligible player IDs.
 */
export function buildSidePots(players) {
  if (!Array.isArray(players) || players.length === 0) return [];
  for (const p of players) {
    if (!p.id || !Number.isSafeInteger(p.committed) || p.committed < 0) {
      throw new Error("Each player needs an id and a non-negative integer committed amount");
    }
  }
  const levels = [...new Set(players.map(p => p.committed).filter(n => n > 0))].sort((a,b)=>a-b);
  let previous = 0;
  const pots = [];
  for (const level of levels) {
    const contributors = players.filter(p => p.committed >= level);
    const amount = (level - previous) * contributors.length;
    const eligible = contributors.filter(p => !p.folded).map(p => p.id);
    if (amount > 0) pots.push({ amount, eligible });
    previous = level;
  }
  return pots;
}

/** Split a pot among winners. Odd chips are awarded in supplied seat order. */
export function splitPot(amount, winnerIds, seatOrder = winnerIds) {
  if (!Number.isSafeInteger(amount) || amount < 0 || winnerIds.length === 0) {
    throw new Error("A non-negative integer amount and at least one winner are required");
  }
  const winners = [...new Set(winnerIds)].sort((a,b)=>seatOrder.indexOf(a)-seatOrder.indexOf(b));
  const each = Math.floor(amount / winners.length);
  let remainder = amount % winners.length;
  return Object.fromEntries(winners.map(id => [id, each + (remainder-- > 0 ? 1 : 0)]));
}

export function settleSidePots(players, compareHands, seatOrder = players.map(p => p.id)) {
  const pots = buildSidePots(players);
  return pots.map((pot, index) => {
    if (pot.eligible.length === 0) throw new Error(`Pot ${index} has no eligible winner`);
    let best = pot.eligible[0];
    for (const id of pot.eligible.slice(1)) if (compareHands(id, best) > 0) best = id;
    const winners = pot.eligible.filter(id => compareHands(id, best) === 0);
    return { ...pot, winners, payouts: splitPot(pot.amount, winners, seatOrder) };
  });
}