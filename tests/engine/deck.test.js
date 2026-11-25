import test from "node:test";
import assert from "node:assert/strict";
import { createOrderedDeck, createShuffledDeck, assertStandardDeck } from "../../src/engine/deck.js";

test("ordered deck contains every standard card exactly once", () => {
  const deck = createOrderedDeck();
  assert.equal(deck.length, 52);
  assert.equal(new Set(deck).size, 52);
  assert.doesNotThrow(() => assertStandardDeck(deck));
});

test("shuffled deck is a complete standard 52-card permutation", () => {
  const deck = createShuffledDeck();
  assert.equal(deck.length, 52);
  assert.equal(new Set(deck).size, 52);
  assert.deepEqual([...deck].sort(), [...createOrderedDeck()].sort());
});

test("deck validation rejects partial, oversized, duplicate and invalid decks", () => {
  const deck = createOrderedDeck();
  assert.throws(() => assertStandardDeck(deck.slice(1)), /exactly 52/);
  assert.throws(() => assertStandardDeck([...deck, "As"]), /exactly 52/);
  assert.throws(() => assertStandardDeck(["As", ...deck.slice(1, 52)]), /exactly once/);
  assert.throws(() => assertStandardDeck(["Xx", ...deck.slice(1)]), /exactly once/);
});
