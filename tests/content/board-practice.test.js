import test from "node:test";
import assert from "node:assert/strict";
import { boardSpots } from "../../src/board-practice.js";

test("board practice uses real hole cards and valid community boards", () => {
  assert.ok(boardSpots.length >= 15);
  const ids = boardSpots.map(s => s.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const spot of boardSpots) {
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
