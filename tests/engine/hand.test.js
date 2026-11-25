import test from "node:test";
import assert from "node:assert/strict";
import { startHand, applyHandAction, advanceStreet, settleShowdown, returnUncalledExcess } from "../../src/engine/hand.js";

const orderedDeck=["As","Kd","Qh","Jc","Ts","9d","8h","7c","6s","5d","4h","3c","2s","Ah","Ad","Ac","Kh","Kc","Ks","Qd","Qc","Qs","Jh","Jd","Js","Th","Td","Tc","9h","9c","9s","8d","8c","8s","7h","7d","7s","6h","6d","6c","5h","5c","5s","4d","4c","4s","3h","3d","3s","2h","2d","2c"];

test("posts blinds and deals two hole cards per player",()=>{
 const h=startHand({players:[{id:"A",stack:100},{id:"B",stack:100},{id:"C",stack:100}],buttonId:"A",smallBlind:5,bigBlind:10,deck:orderedDeck});
 assert.equal(h.players.find(p=>p.id==="B").streetContribution,5);
 assert.equal(h.players.find(p=>p.id==="C").streetContribution,10);
 assert.equal(h.round.currentPlayer,"A");
 assert.equal(h.players.every(p=>p.holeCards.length===2),true);
});

test("heads-up button posts small blind and acts first preflop",()=>{
 const h=startHand({players:[{id:"A",stack:100},{id:"B",stack:100}],buttonId:"A",smallBlind:5,bigBlind:10,deck:orderedDeck});
 assert.equal(h.players.find(p=>p.id==="A").streetContribution,5);
 assert.equal(h.players.find(p=>p.id==="B").streetContribution,10);
 assert.equal(h.round.currentPlayer,"A");
});

test("folds award the pot immediately",()=>{
 let h=startHand({players:[{id:"A",stack:100},{id:"B",stack:100}],buttonId:"A",smallBlind:5,bigBlind:10,deck:orderedDeck});
 ({hand:h}=applyHandAction(h,"A","fold"));
 assert.equal(h.status,"complete");
 assert.equal(h.players.find(p=>p.id==="B").stack,105);
});

test("complete checks deal flop, turn and river in order",()=>{
 let h=startHand({players:[{id:"A",stack:100},{id:"B",stack:100}],buttonId:"A",smallBlind:5,bigBlind:10,deck:orderedDeck});
 ({hand:h}=applyHandAction(h,"A","call"));
 ({hand:h}=applyHandAction(h,"B","check"));
 h=advanceStreet(h); assert.equal(h.street,"flop"); assert.equal(h.board.length,3);
 ({hand:h}=applyHandAction(h,"B","check"));
 ({hand:h}=applyHandAction(h,"A","check"));
 h=advanceStreet(h); assert.equal(h.street,"turn"); assert.equal(h.board.length,4);
 ({hand:h}=applyHandAction(h,"B","check"));
 ({hand:h}=applyHandAction(h,"A","check"));
 h=advanceStreet(h); assert.equal(h.street,"river"); assert.equal(h.board.length,5);
 ({hand:h}=applyHandAction(h,"B","check"));
 ({hand:h}=applyHandAction(h,"A","check"));
 h=advanceStreet(h); assert.equal(h.street,"showdown");
});

test("showdown settles a completed board and conserves chips",()=>{
 let h=startHand({players:[{id:"A",stack:100},{id:"B",stack:100}],buttonId:"A",smallBlind:5,bigBlind:10,deck:orderedDeck});
 ({hand:h}=applyHandAction(h,"A","call")); ({hand:h}=applyHandAction(h,"B","check"));
 h=advanceStreet(h);
 for(let street=0;street<3;street++){
  ({hand:h}=applyHandAction(h,"A","check")); ({hand:h}=applyHandAction(h,"B","check"));
  h=advanceStreet(h);
 }
 const totalBefore=h.players.reduce((n,p)=>n+p.stack,0)+h.pot;
 settleShowdown(h);
 assert.equal(h.status,"complete");
 assert.equal(h.players.reduce((n,p)=>n+p.stack,0),totalBefore);
});

test("heads-up button acts first on the flop",()=>{
 let h=startHand({players:[{id:"A",stack:100},{id:"B",stack:100}],buttonId:"A",smallBlind:5,bigBlind:10,deck:orderedDeck});
 ({hand:h}=applyHandAction(h,"A","call")); ({hand:h}=applyHandAction(h,"B","check"));
 h=advanceStreet(h);
 assert.equal(h.round.currentPlayer,"A");
});

test("multiway all-in automatically runs out the board to showdown",()=>{
 let h=startHand({players:[{id:"A",stack:20},{id:"B",stack:25},{id:"C",stack:20}],buttonId:"A",smallBlind:5,bigBlind:10,deck:orderedDeck});
 ({hand:h}=applyHandAction(h,"A","all-in"));
 ({hand:h}=applyHandAction(h,"B","call"));
 ({hand:h}=applyHandAction(h,"C","call"));
 assert.equal(h.round.complete,true);
 h=advanceStreet(h);
 assert.equal(h.street,"showdown");
 assert.equal(h.board.length,5);
 const total=h.players.reduce((n,p)=>n+p.stack,0)+h.pot;
 settleShowdown(h);
 assert.equal(h.players.reduce((n,p)=>n+p.stack,0),total);
});

test("uncalled excess is returned and excluded from the pot",()=>{
 const h={pot:300,players:[
  {id:"A",stack:0,committed:150,streetContribution:50,folded:false},
  {id:"B",stack:0,committed:100,streetContribution:40,folded:false},
  {id:"C",stack:0,committed:50,streetContribution:10,folded:true}
 ],history:[]};
 const result=returnUncalledExcess(h);
 assert.deepEqual(result,{playerId:"A",amount:50});
 assert.equal(h.players[0].stack,50);
 assert.equal(h.players[0].committed,100);
 assert.equal(h.pot,250);
});
test("a folded bettor can receive their unmatched excess back",()=>{
 const h={pot:250,players:[
  {id:"A",stack:0,committed:150,streetContribution:50,folded:true},
  {id:"B",stack:0,committed:100,streetContribution:40,folded:false}
 ],history:[]};
 const result=returnUncalledExcess(h);
 assert.deepEqual(result,{playerId:"A",amount:50});
 assert.equal(h.players[0].stack,50);
 assert.equal(h.pot,200);
});

test("short big blind is posted as an all-in without inventing chips",()=>{
 const h=startHand({players:[{id:"A",stack:100},{id:"B",stack:6},{id:"C",stack:100}],buttonId:"A",smallBlind:5,bigBlind:10,deck:orderedDeck});
 assert.equal(h.players.find(p=>p.id==="B").streetContribution,6);
 assert.equal(h.players.find(p=>p.id==="B").stack,0);
 assert.equal(h.players.find(p=>p.id==="B").allIn,true);
 assert.equal(h.pot,16);
 assert.equal(h.round.currentPlayer,"C");
});
test("all-fold award preserves total chips",()=>{
 let h=startHand({players:[{id:"A",stack:100},{id:"B",stack:100},{id:"C",stack:100}],buttonId:"A",smallBlind:5,bigBlind:10,deck:orderedDeck});
 const total=h.players.reduce((n,p)=>n+p.stack,0)+h.pot;
 ({hand:h}=applyHandAction(h,"C","fold"));
 ({hand:h}=applyHandAction(h,"A","fold"));
 assert.equal(h.status,"complete");
 assert.equal(h.players.reduce((n,p)=>n+p.stack,0),total);
});
