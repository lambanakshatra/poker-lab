import test from "node:test";
import assert from "node:assert/strict";
import { BANK_TARGET_PER_CATEGORY, categories, questions } from "../../src/question-bank.js";
import { questionBatch02 } from "../../src/question-bank-batch-02.js";
import { questionBatch03 } from "../../src/question-bank-batch-03.js";
const allQuestions = [...questions, ...questionBatch02, ...questionBatch03];

test("question bank defines all 15 planned categories", () => {
  assert.equal(categories.length, 15);
  assert.equal(new Set(categories.map(c => c.id)).size, categories.length);
});

test("every category has an initial published practice item", () => {
  for (const category of categories) {
    assert.ok(allQuestions.some(q => q.categoryId === category.id), `Missing questions for ${category.id}`);
  }
});

test("question IDs are unique and answers point to valid options", () => {
  assert.equal(new Set(questions.map(q => q.id)).size, questions.length);
  for (const q of allQuestions) {
    assert.ok(q.prompt && q.context && q.explanation, `Incomplete question ${q.id}`);
    assert.ok(Array.isArray(q.options) && q.options.length >= 2, `Missing options ${q.id}`);
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < q.options.length, `Invalid answer ${q.id}`);
    assert.ok(categories.some(c => c.id === q.categoryId), `Unknown category ${q.categoryId}`);
  }
});

test("question bank target is 1,000 items per category", () => {
  assert.equal(BANK_TARGET_PER_CATEGORY, 1000);
});

import { handScenarios } from "../../src/hand-scenarios.js";

test("street-by-street scenarios contain four ordered decisions", () => {
  assert.ok(handScenarios.length >= 3);
  for (const hand of handScenarios) {
    assert.equal(hand.steps.length, 4, `Expected four streets in ${hand.id}`);
    assert.ok(hand.title && hand.setup && hand.villain);
    for (const [index, step] of hand.steps.entries()) {
      assert.ok(step.street && step.prompt && step.why && step.exploit, `Incomplete step ${hand.id}:${index}`);
      assert.ok(Array.isArray(step.options) && step.options.length >= 2);
      assert.ok(Number.isInteger(step.answer) && step.answer >= 0 && step.answer < step.options.length);
    }
  }
});

test("scenario IDs are unique", () => {
  assert.equal(new Set(handScenarios.map(hand => hand.id)).size, handScenarios.length);
});
