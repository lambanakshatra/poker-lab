import { randomInt } from "node:crypto";

const RANKS = "23456789TJQKA";
const SUITS = "shdc";
const STANDARD_CARDS = new Set([...RANKS].flatMap(rank => [...SUITS].map(suit => rank + suit)));

/** Return a fresh canonical 52-card deck in deterministic rank/suit order. */
export function createOrderedDeck() {
  return [...STANDARD_CARDS];
}

/**
 * Cryptographically shuffle a fresh 52-card deck with Fisher–Yates.
 * randomInt uses rejection sampling, avoiding modulo bias.
 */
export function createShuffledDeck() {
  const deck = createOrderedDeck();
  for (let i = deck.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

/** Reject partial, oversized, duplicate, or non-standard injected decks. */
export function assertStandardDeck(deck) {
  if (!Array.isArray(deck) || deck.length !== 52) {
    throw new Error("A deck must contain exactly 52 standard cards");
  }
  const seen = new Set(deck);
  if (seen.size !== 52 || [...seen].some(card => !STANDARD_CARDS.has(card))) {
    throw new Error("A deck must contain each standard card exactly once");
  }
  return deck;
}
