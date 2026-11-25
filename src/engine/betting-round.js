/**
 * Deterministic no-limit betting-round state machine.
 * Amounts are integer chips. This module models one street, not dealing/showdown.
 */
const active = p => !p.folded && !p.allIn && p.stack > 0;
const find = (state, id) => {
  const p = state.players.find(x => x.id === id);
  if (!p) throw new Error("Unknown player");
  return p;
};
const nextSeat = (state, fromId, predicate) => {
  const start = state.players.findIndex(p => p.id === fromId);
  for (let step = 1; step <= state.players.length; step++) {
    const p = state.players[(start + step) % state.players.length];
    if (predicate(p)) return p.id;
  }
  return null;
};
const amount = n => Number.isSafeInteger(n) && n >= 0;

export function createBettingRound({ players, firstToAct, street = "preflop", currentBet = 0, minRaise = 10 }) {
  if (!Array.isArray(players) || players.length < 2) throw new Error("At least two players are required");
  if (!amount(currentBet) || !Number.isSafeInteger(minRaise) || minRaise < 1) throw new Error("Invalid bet or raise amount");
  const ids = new Set();
  const normalized = players.map(p => {
    if (!p.id || ids.has(p.id) || !amount(p.stack) || !amount(p.streetContribution ?? 0)) throw new Error("Invalid or duplicate player");
    ids.add(p.id);
    return {
      id: p.id, stack: p.stack, streetContribution: p.streetContribution ?? 0,
      folded: !!p.folded, allIn: !!p.allIn || p.stack === 0,
      actedAtBet: null, acted: false
    };
  });
  if (!ids.has(firstToAct)) throw new Error("firstToAct must be a player");
  const pending = normalized.filter(p => active(p) && p.id !== firstToAct).map(p=>p.id);
  const state = { street, players: normalized, currentBet, minRaise, pending: [], currentPlayer: null, complete: false, lastFullRaise: minRaise };
  const starter = find(state, firstToAct);
  if (active(starter)) state.pending = [firstToAct, ...pending];
  else state.pending = pending;
  state.currentPlayer = state.pending[0] ?? null;
  state.complete = state.pending.length === 0;
  return state;
}

export function legalActions(state, playerId = state.currentPlayer) {
  if (state.complete || playerId !== state.currentPlayer) return [];
  const p = find(state, playerId);
  if (!active(p)) return [];
  const toCall = Math.max(0, state.currentBet - p.streetContribution);
  const actions = ["fold"];
  if (toCall === 0) actions.push("check");
  else actions.push("call");
  const others = state.players.filter(q => q.id !== p.id && !q.folded);
  const canRaise = others.some(q => !q.allIn && q.stack > 0) &&
    (p.actedAtBet === null || state.currentBet - p.actedAtBet >= state.lastFullRaise);
  if (canRaise && p.stack > toCall) actions.push("raise");
  if (p.stack > 0) actions.push("all-in");
  return actions;
}

function advance(state, fromId) {
  const next = nextSeat(state, fromId, p => state.pending.includes(p.id) && active(p));
  state.currentPlayer = next;
  if (!next) {
    state.pending = [];
    state.complete = true;
  }
  return state;
}

export function act(state, playerId, action, raiseTo = null) {
  if (state.complete || playerId !== state.currentPlayer) throw new Error("Action out of turn or round complete");
  const p = find(state, playerId);
  const legal = legalActions(state, playerId);
  if (!legal.includes(action)) throw new Error("Illegal action");
  const oldBet = state.currentBet;
  const toCall = Math.max(0, oldBet - p.streetContribution);
  let paid = 0;
  if (action === "fold") p.folded = true;
  if (action === "check") {}
  if (action === "call") {
    paid = Math.min(p.stack, toCall);
    p.stack -= paid; p.streetContribution += paid;
    if (p.stack === 0) p.allIn = true;
  }
  if (action === "bet" || action === "raise") {
    if (!Number.isSafeInteger(raiseTo) || raiseTo <= oldBet || raiseTo <= p.streetContribution) throw new Error("raiseTo must be a total street contribution above current bet");
    const desired = raiseTo - p.streetContribution;
    paid = Math.min(p.stack, desired);
    p.stack -= paid; p.streetContribution += paid;
    if (p.stack === 0) p.allIn = true;
    const newBet = p.streetContribution;
    const raiseSize = newBet - oldBet;
    if (raiseSize >= state.lastFullRaise) state.lastFullRaise = raiseSize;
    state.currentBet = Math.max(oldBet, newBet);
  }
  if (action === "all-in") {
    paid = p.stack;
    p.stack = 0; p.streetContribution += paid; p.allIn = true;
    const newBet = p.streetContribution;
    if (newBet > oldBet) {
      const raiseSize = newBet - oldBet;
      if (raiseSize >= state.lastFullRaise) state.lastFullRaise = raiseSize;
      state.currentBet = newBet;
    }
  }
  p.acted = true;
  p.actedAtBet = state.currentBet;
  state.pending = state.pending.filter(id => id !== playerId);

  const remaining = state.players.filter(q => !q.folded);
  if (remaining.length <= 1 || remaining.filter(active).length <= 1 &&
      remaining.every(q => q.allIn || q.folded || q.streetContribution === state.currentBet)) {
    state.pending = []; state.complete = true; state.currentPlayer = null;
    return { state, paid, roundComplete: true };
  }

  const aggressive = state.currentBet > oldBet;
  if (aggressive) {
    state.pending = state.players
      .filter(q => q.id !== playerId && active(q) && q.streetContribution < state.currentBet)
      .map(q => q.id);
    // Players who have not acted still retain their turn even when already matched.
    for (const q of state.players) {
      if (q.id !== playerId && active(q) && !q.acted && !state.pending.includes(q.id)) state.pending.push(q.id);
    }
  }
  advance(state, playerId);
  return { state, paid, roundComplete: state.complete };
}
