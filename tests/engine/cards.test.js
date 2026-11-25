import test from "node:test";
import assert from "node:assert/strict";
import { evaluateBest, compareHands, assertUniqueCards } from "../../src/engine/cards.js";

test("royal flush beats four of a kind", () => {
  assert.equal(compareHands(["As","Ks","Qs","Js","Ts","2d","3c"], ["Ah","Ad","Ac","As","Kd","2c","3d"]), 1);
});
test("wheel straight is five-high", () => {
  assert.deepEqual(evaluateBest(["As","2d","3c","4h","5s","Kd","Qd"]), [4,5]);
});
test("full house ranks trips before pair", () => {
  assert.equal(compareHands(["Kh","Kd","Kc","2s","2d","9c","8h"], ["Qh","Qd","Qc","As","Ad","9d","8s"]), 1);
});
test("flush uses best five cards", () => {
  assert.deepEqual(evaluateBest(["As","Js","9s","6s","3s","2s","Kh"]), [5,14,11,9,6,3]);
});
test("two-pair kicker breaks tie", () => {
  assert.equal(compareHands(["Ah","Ad","Ks","Kd","Qc","2s","3d"], ["As","Ac","Kh","Kc","Jd","2h","3c"]), 1);
});
test("best five of seven is selected", () => {
  assert.deepEqual(evaluateBest(["As","Ad","Ac","Ah","Ks","Kd","2c"]), [7,14,13]);
});
test("duplicate cards are rejected", () => {
  assert.throws(() => assertUniqueCards(["As","As","Kd","Qc","Jh"]), /Duplicate/);
});