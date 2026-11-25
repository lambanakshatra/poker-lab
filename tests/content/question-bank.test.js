import test from "node:test";
import assert from "node:assert/strict";
import { BANK_TARGET_PER_CATEGORY, categories, questions } from "../../src/question-bank.js";
import { questionBatch02 } from "../../src/question-bank-batch-02.js";
import { questionBatch03 } from "../../src/question-bank-batch-03.js";
import { questionBatch04 } from "../../src/question-bank-batch-04.js";
const allQuestions = [...questions, ...questionBatch02, ...questionBatch03, ...questionBatch04];

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
  assert.equal(new Set(allQuestions.map(q => q.id)).size, allQuestions.length, "Question IDs must be unique across every batch");
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
