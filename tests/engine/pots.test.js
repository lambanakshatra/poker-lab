import test from "node:test";
import assert from "node:assert/strict";
import { buildSidePots, splitPot, settleSidePots } from "../../src/engine/pots.js";

test("unequal all-in contributions create main and side pots", () => {
  assert.deepEqual(buildSidePots([
    {id:"A",committed:100},{id:"B",committed:200},{id:"C",committed:200}
  ]), [
    {amount:300,eligible:["A","B","C"]},
    {amount:200,eligible:["B","C"]}
  ]);
});
test("three contribution levels exclude folded players from eligibility", () => {
  assert.deepEqual(buildSidePots([
    {id:"A",committed:50},{id:"B",committed:120},
    {id:"C",committed:200},{id:"D",committed:200,folded:true}
  ]), [
    {amount:200,eligible:["A","B","C"]},
    {amount:210,eligible:["B","C"]},
    {amount:160,eligible:["C"]}
  ]);
});
test("odd chip follows supplied seat order", () => {
  assert.deepEqual(splitPot(101, ["B","A"], ["A","B"]), {A:51,B:50});
});
test("side pot winners are selected only from eligible players", () => {
  const players = [{id:"A",committed:50},{id:"B",committed:120},{id:"C",committed:200},{id:"D",committed:200,folded:true}];
  const rank = {A:3,B:2,C:1,D:99};
  const settled = settleSidePots(players, (a,b)=>Math.sign(rank[a]-rank[b]));
  assert.deepEqual(settled.map(p=>p.winners), [["A"],["B"],["C"]]);
});
test("three-way all-in distributes main and side pots independently",()=>{
 const players=[{id:"A",committed:50},{id:"B",committed:100},{id:"C",committed:150}];
 const rank={A:2,B:3,C:1};
 const result=settleSidePots(players,(a,b)=>Math.sign(rank[a]-rank[b]),["A","B","C"]);
 assert.deepEqual(result.map(p=>p.amount),[150,100,50]);
 assert.deepEqual(result.map(p=>p.winners),[["B"],["B"],["C"]]);
 const paid=result.flatMap(p=>Object.values(p.payouts)).reduce((a,b)=>a+b,0);
 assert.equal(paid,300);
});
test("tied main pot splits and awards odd chip clockwise",()=>{
 const players=[{id:"A",committed:51},{id:"B",committed:51},{id:"C",committed:51}];
 const result=settleSidePots(players,()=>0,["B","C","A"]);
 assert.deepEqual(result[0].payouts,{B:52,C:51,A:51});
});
