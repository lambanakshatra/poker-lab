import test from "node:test";
import assert from "node:assert/strict";
import { createBettingRound, legalActions, act } from "../../src/engine/betting-round.js";

test("players act in seat order and round completes after matched action", () => {
  let s = createBettingRound({players:[
    {id:"A",stack:500},{id:"B",stack:500},{id:"C",stack:500}
  ],firstToAct:"A",currentBet:0,minRaise:10});
  assert.equal(s.currentPlayer,"A");
  ({state:s}=act(s,"A","check"));
  assert.equal(s.currentPlayer,"B");
  ({state:s}=act(s,"B","check"));
  assert.equal(s.currentPlayer,"C");
  ({state:s}=act(s,"C","check"));
  assert.equal(s.complete,true);
});

test("full raise reopens action for players who already acted", () => {
  let s=createBettingRound({players:[
    {id:"A",stack:500,streetContribution:100},
    {id:"B",stack:500,streetContribution:100},
    {id:"C",stack:500,streetContribution:100}
  ],firstToAct:"A",currentBet:100,minRaise:40});
  ({state:s}=act(s,"A","call"));
  ({state:s}=act(s,"B","raise",140));
  assert.equal(s.currentPlayer,"C");
  ({state:s}=act(s,"C","call"));
  assert.ok(legalActions(s,"A").includes("raise"));
});

test("single short all-in raise does not reopen action", () => {
  let s=createBettingRound({players:[
    {id:"A",stack:500,streetContribution:100},
    {id:"B",stack:30,streetContribution:100},
    {id:"C",stack:500,streetContribution:100}
  ],firstToAct:"A",currentBet:100,minRaise:40});
  ({state:s}=act(s,"A","call"));
  ({state:s}=act(s,"B","all-in"));
  assert.equal(s.currentPlayer,"C");
  ({state:s}=act(s,"C","call"));
  assert.equal(legalActions(s,"A").includes("raise"),false);
});

test("cumulative short all-ins reaching a full raise reopen action", () => {
  let s=createBettingRound({players:[
    {id:"A",stack:500,streetContribution:100},
    {id:"B",stack:30,streetContribution:100},
    {id:"C",stack:40,streetContribution:100},
    {id:"D",stack:500,streetContribution:100}
  ],firstToAct:"A",currentBet:100,minRaise:40});
  ({state:s}=act(s,"A","call"));
  ({state:s}=act(s,"B","all-in"));
  ({state:s}=act(s,"C","all-in"));
  assert.equal(s.currentPlayer,"D");
  ({state:s}=act(s,"D","call"));
  assert.ok(legalActions(s,"A").includes("raise"));
});

test("folded players are removed from pending action", () => {
  let s=createBettingRound({players:[
    {id:"A",stack:100},{id:"B",stack:100},{id:"C",stack:100}
  ],firstToAct:"A"});
  ({state:s}=act(s,"A","fold"));
  assert.equal(s.currentPlayer,"B");
  assert.ok(!s.pending.includes("A"));
});
