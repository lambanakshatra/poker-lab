const RANKS = "23456789TJQKA";
const SUITS = new Set(["s", "h", "d", "c"]);

export function parseCard(card) {
  if (typeof card !== "string" || card.length !== 2) throw new Error(`Invalid card: ${card}`);
  const rank = RANKS.indexOf(card[0].toUpperCase()) + 2;
  const suit = card[1].toLowerCase();
  if (rank < 2 || !SUITS.has(suit)) throw new Error(`Invalid card: ${card}`);
  return { rank, suit, code: card[0].toUpperCase() + suit };
}

export function assertUniqueCards(cards) {
  const parsed = cards.map(parseCard);
  const seen = new Set(parsed.map(c => c.code));
  if (seen.size !== parsed.length) throw new Error("Duplicate cards are not allowed");
  return parsed;
}

function straightHigh(values) {
  const unique = [...new Set(values)].sort((a, b) => b - a);
  if (unique.includes(14)) unique.push(1);
  for (let i = 0; i <= unique.length - 5; i++) {
    if (unique[i] - unique[i + 4] === 4) return unique[i];
  }
  return 0;
}

function compareTuple(a, b) {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const av = a[i] ?? 0, bv = b[i] ?? 0;
    if (av !== bv) return av > bv ? 1 : -1;
  }
  return 0;
}

export function evaluateFive(cards) {
  if (cards.length !== 5) throw new Error("evaluateFive requires exactly five cards");
  const parsed = assertUniqueCards(cards);
  const values = parsed.map(c => c.rank).sort((a, b) => b - a);
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  const groups = [...counts].map(([rank, count]) => ({ rank, count }))
    .sort((a, b) => b.count - a.count || b.rank - a.rank);
  const flush = parsed.every(c => c.suit === parsed[0].suit);
  const straight = straightHigh(values);

  if (flush && straight) return [8, straight];
  if (groups[0].count === 4) return [7, groups[0].rank, groups[1].rank];
  if (groups[0].count === 3 && groups[1].count === 2) return [6, groups[0].rank, groups[1].rank];
  if (flush) return [5, ...values];
  if (straight) return [4, straight];
  if (groups[0].count === 3) return [3, groups[0].rank, ...groups.slice(1).map(g => g.rank).sort((a,b)=>b-a)];
  if (groups[0].count === 2 && groups[1].count === 2) {
    const pairs = groups.filter(g => g.count === 2).map(g => g.rank).sort((a,b)=>b-a);
    return [2, ...pairs, groups.find(g => g.count === 1).rank];
  }
  if (groups[0].count === 2) return [1, groups[0].rank, ...groups.filter(g => g.count === 1).map(g=>g.rank).sort((a,b)=>b-a)];
  return [0, ...values];
}

export function evaluateBest(cards) {
  if (cards.length < 5 || cards.length > 7) throw new Error("Provide 5, 6, or 7 cards");
  assertUniqueCards(cards);
  let best = null;
  for (let a = 0; a < cards.length - 4; a++)
    for (let b = a + 1; b < cards.length - 3; b++)
      for (let c = b + 1; c < cards.length - 2; c++)
        for (let d = c + 1; d < cards.length - 1; d++)
          for (let e = d + 1; e < cards.length; e++) {
            const score = evaluateFive([cards[a], cards[b], cards[c], cards[d], cards[e]]);
            if (!best || compareTuple(score, best) > 0) best = score;
          }
  return best;
}

export function compareHands(cardsA, cardsB) {
  return compareTuple(evaluateBest(cardsA), evaluateBest(cardsB));
}