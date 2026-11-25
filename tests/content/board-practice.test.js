import test from "node:test";
import assert from "node:assert/strict";
import { boardSpots } from "../../src/board-practice.js";
import { boardSpotsBatch02 } from "../../src/board-practice-batch-02.js";
import { categories, BANK_TARGET_PER_CATEGORY } from "../../src/question-bank.js";
const allSpots = [...boardSpots, ...boardSpotsBatch02];

test("board practice uses real hole cards and valid community boards", () => {
  assert.equal(BANK_TARGET_PER_CATEGORY, 200);
  assert.ok(allSpots.length >= 75);
  const ids = allSpots.map(s => s.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const spot of allSpots) {
    assert.equal(spot.hero.length, 2, spot.id);
    assert.ok(spot.board.length === 0 || spot.board.length === 3 || spot.board.length === 4 || spot.board.length === 5, spot.id);
    assert.ok(spot.question && spot.action && spot.why, spot.id);
    assert.ok(spot.options.length >= 2 && spot.answer >= 0 && spot.answer < spot.options.length, spot.id);
    assert.ok(Number.isFinite(spot.pot) && Number.isFinite(spot.stack), spot.id);
    const cards = [...spot.hero, ...spot.board];
    assert.equal(new Set(cards).size, cards.length, `Duplicate card in ${spot.id}`);
    assert.ok(cards.every(c => /^[AKQJT98765432][shdc]$/.test(c)), spot.id);
  }
});

test("board practice has balanced initial coverage in all 15 categories", () => {
  assert.equal(categories.length, 15);
  for (const category of categories) {
    assert.equal(allSpots.filter(s => s.categoryId === category.id).length, 5, `Expected five board spots in ${category.id}`);
  }
});
