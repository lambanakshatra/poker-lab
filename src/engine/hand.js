import { createBettingRound, act } from "./betting-round.js";
import { assertUniqueCards, compareHands } from "./cards.js";
import { settleSidePots } from "./pots.js";

const makeDeck = () => {
  const ranks = "23456789TJQKA", suits = "shdc";
  return [...ranks].flatMap(r => [...suits].map(s => r + s));
};
const validChips = n => Number.isSafeInteger(n) && n >= 0;
const clockwise = (players, startIndex, predicate) => {
  const out = [];
  for (let step = 1; step <= players.length; step++) {
    const p = players[(startIndex + step) % players.length];
    if (predicate(p)) out.push(p.id);
  }
  return out;
};
const nextActive = (hand, fromIndex) => {
  for (let step=1;step<=hand.players.length;step++) {
    const p=hand.players[(fromIndex+step)%hand.players.length];
    if (!p.folded && !p.allIn && p.stack>0) return p.id;
  }
  return null;
};
const post = (p, amount) => {
  const paid=Math.min(p.stack,amount);
  p.stack-=paid; p.streetContribution+=paid; p.committed+=paid;
  if (p.stack===0) p.allIn=true;
  return paid;
};

/** Return a unique unmatched top contribution before awarding or settling the pot. */
export function returnUncalledExcess(hand) {
  const ranked=[...hand.players].sort((a,b)=>b.committed-a.committed);
  if(ranked.length<2 || ranked[0].committed===ranked[1].committed) return null;
  const player=ranked[0];
  const amount=player.committed-ranked[1].committed;
  player.committed-=amount;
  player.stack+=amount;
  player.streetContribution=Math.max(0,player.streetContribution-amount);
  hand.pot-=amount;
  hand.history.push({type:"uncalled_bet_returned",playerId:player.id,amount,pot:hand.pot});
  return {playerId:player.id,amount};
}

export function startHand({ players, buttonId, smallBlind, bigBlind, deck = makeDeck() }) {
  if (!Array.isArray(players) || players.length<2 || players.length>9) throw new Error("A table needs 2–9 players");
  if (!validChips(smallBlind) || !validChips(bigBlind) || smallBlind<1 || bigBlind<smallBlind) throw new Error("Invalid blind amounts");
  const ids=new Set();
  const table=players.map(p=>{
    if(!p.id || ids.has(p.id) || !validChips(p.stack) || p.stack===0) throw new Error("Players need unique IDs and positive integer stacks");
    ids.add(p.id);
    return {id:p.id,stack:p.stack,folded:false,allIn:false,holeCards:[],streetContribution:0,committed:0};
  });
  const buttonIndex=table.findIndex(p=>p.id===buttonId);
  if(buttonIndex<0) throw new Error("buttonId must identify a seated player");
  if(!Array.isArray(deck) || deck.length<5+2*table.length) throw new Error("Deck is too short");
  assertUniqueCards(deck);
  const deckCopy=[...deck];
  const draw=()=>deckCopy.shift();
  const headsUp=table.length===2;
  const dealOrder=headsUp
    ? [buttonId,...clockwise(table,buttonIndex,()=>true).filter(id=>id!==buttonId)]
    : clockwise(table,buttonIndex,()=>true);
  for(let round=0;round<2;round++) {
    for(const id of dealOrder) table.find(p=>p.id===id).holeCards.push(draw());
  }
  const sbIndex=headsUp?buttonIndex:(buttonIndex+1)%table.length;
  const bbIndex=(sbIndex+1)%table.length;
  const sb=table[sbIndex], bb=table[bbIndex];
  const blindPaid={small:post(sb,smallBlind),big:post(bb,bigBlind)};
  const firstIndex=headsUp?buttonIndex:(bbIndex+1)%table.length;
  const firstToAct=nextActive({players:table},(firstIndex-1+table.length)%table.length);
  const currentBet=Math.max(sb.streetContribution,bb.streetContribution);
  const hand={
    players:table,buttonId,buttonIndex,smallBlind,bigBlind,blindPaid,
    board:[],deck:deckCopy,street:"preflop",pot:table.reduce((n,p)=>n+p.committed,0),
    status:"in_progress",round:null,history:[],result:null
  };
  hand.round=createBettingRound({
    players:table.map(p=>({id:p.id,stack:p.stack,streetContribution:p.streetContribution,folded:p.folded,allIn:p.allIn})),
    firstToAct,currentBet,minRaise:bigBlind,street:"preflop"
  });
  hand.history.push({type:"hand_started",street:"preflop",buttonId,blindPaid});
  return hand;
}

export function applyHandAction(hand, playerId, action, raiseTo=null) {
  if(hand.status!=="in_progress" || !hand.round) throw new Error("Hand is not accepting actions");
  const result=act(hand.round,playerId,action,raiseTo);
  const player=hand.players.find(p=>p.id===playerId);
  const roundPlayer=result.state.players.find(p=>p.id===playerId);
  const paid=roundPlayer.streetContribution-player.streetContribution;
  player.stack=roundPlayer.stack;
  player.streetContribution=roundPlayer.streetContribution;
  player.committed+=paid;
  player.folded=roundPlayer.folded;
  player.allIn=roundPlayer.allIn;
  hand.pot=hand.players.reduce((n,p)=>n+p.committed,0);
  hand.round=result.state;
  hand.history.push({type:"action",street:hand.street,playerId,action,raiseTo,paid,pot:hand.pot});
  if(hand.players.filter(p=>!p.folded).length===1) {
    returnUncalledExcess(hand);
    const winner=hand.players.find(p=>!p.folded);
    winner.stack+=hand.pot;
    hand.result={winnerIds:[winner.id],payouts:{[winner.id]:hand.pot},reason:"everyone_folded"};
    hand.pot=0;
    hand.status="complete";
  }
  return {hand,roundComplete:hand.round.complete};
}

export function advanceStreet(hand) {
  if(hand.status!=="in_progress" || !hand.round?.complete) throw new Error("The current betting round must be complete");
  const order=["preflop","flop","turn","river"];
  const index=order.indexOf(hand.street);
  if(index<0) throw new Error("Unknown street");
  if(index===3) {
    hand.street="showdown";
    hand.history.push({type:"showdown_ready",board:[...hand.board]});
    return hand;
  }

  const noFurtherBetting=hand.players.filter(p=>!p.folded && !p.allIn && p.stack>0).length<=1;
  const dealNextStreet=()=>{
    const nextStreet=order[order.indexOf(hand.street)+1];
    const count=nextStreet==="flop"?3:1;
    for(let i=0;i<count;i++) {
      const card=hand.deck.shift();
      if(!card) throw new Error("Deck exhausted before showdown");
      hand.board.push(card);
    }
    assertUniqueCards([...hand.board,...hand.players.flatMap(p=>p.holeCards)]);
    hand.street=nextStreet;
    hand.history.push({type:"street_dealt",street:nextStreet,board:[...hand.board]});
  };

  if(noFurtherBetting) {
    while(hand.street!=="river") dealNextStreet();
    hand.street="showdown";
    hand.history.push({type:"showdown_ready",board:[...hand.board],reason:"no_further_betting"});
    return hand;
  }

  dealNextStreet();
  for(const p of hand.players) p.streetContribution=0;
  const button=hand.players[hand.buttonIndex];
  const firstToAct=hand.players.length===2 && !button.folded && !button.allIn && button.stack>0
    ? button.id
    : nextActive(hand,hand.buttonIndex);
  if(!firstToAct) {
    hand.round={complete:true,pending:[],currentPlayer:null};
  } else {
    hand.round=createBettingRound({
      players:hand.players.map(p=>({id:p.id,stack:p.stack,streetContribution:0,folded:p.folded,allIn:p.allIn})),
      firstToAct,currentBet:0,minRaise:hand.bigBlind,street:hand.street
    });
  }
  return hand;
}

export function settleShowdown(hand) {
  if(hand.status!=="in_progress" || hand.street!=="showdown") throw new Error("Hand is not ready for showdown");
  returnUncalledExcess(hand);
  const contenders=hand.players.filter(p=>!p.folded);
  if(contenders.length===1) {
    const winner=contenders[0]; winner.stack+=hand.pot;
    hand.result={winnerIds:[winner.id],payouts:{[winner.id]:hand.pot},reason:"everyone_folded"};
  } else {
    if(hand.board.length!==5) throw new Error("Showdown requires a five-card board");
    const hands=Object.fromEntries(contenders.map(p=>[p.id,[...p.holeCards,...hand.board]]));
    const settlements=settleSidePots(hand.players.map(p=>({id:p.id,committed:p.committed,folded:p.folded})),
      (a,b)=>compareHands(hands[a],hands[b]),hand.players.map(p=>p.id));
    const payouts={};
    for(const pot of settlements) for(const [id,amount] of Object.entries(pot.payouts)) payouts[id]=(payouts[id]??0)+amount;
    for(const [id,amount] of Object.entries(payouts)) hand.players.find(p=>p.id===id).stack+=amount;
    hand.result={settlements,payouts,winnerIds:[...new Set(settlements.flatMap(p=>p.winners))],reason:"showdown"};
  }
  hand.pot=0;
  hand.status="complete";
  hand.history.push({type:"hand_settled",result:hand.result});
  return hand.result;
}
