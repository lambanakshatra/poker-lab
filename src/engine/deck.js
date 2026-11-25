const RANKS = "23456789TJQKA";
const SUITS = "shdc";
const STANDARD_CARDS = new Set([...RANKS].flatMap(rank => [...SUITS].map(suit => rank + suit)));

/** Return a fresh canonical 52-card deck in deterministic rank/suit order. */
export function createOrderedDeck() {
  return [...STANDARD_CARDS];
}

/** Generate an unbiased integer in [0, upperBound) using Web Crypto. */
function secureRandomInt(upperBound) {
  if (!Number.isSafeInteger(upperBound) || upperBound < 1) {
    throw new Error("Random upper bound must be a positive safe integer");
  }
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi || typeof cryptoApi.getRandomValues !== "function") {
    throw new Error("A cryptographically secure random source is required");
  }
  const range = 0x100000000;
  const limit = Math.floor(range / upperBound) * upperBound;
  const sample = new Uint32Array(1);
  let value;
  do {
    cryptoApi.getRandomValues(sample);
    value = sample[0];
  } while (value >= limit);
  return value % upperBound;
}

/**
 * Cryptographically shuffle a fresh 52-card deck with Fisher–Yates.
 * Web Crypto plus rejection sampling avoids modulo bias and works in browsers
 * and modern server runtimes that expose the Web Crypto API.
 */
export function createShuffledDeck() {
  const deck = createOrderedDeck();
  for (let i = deck.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
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
