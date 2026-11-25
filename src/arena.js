import { startHand, applyHandAction, advanceStreet, settleShowdown } from "./engine/hand.js";
import { legalActions } from "./engine/betting-round.js";

const SUIT = { s: "♠", h: "♥", d: "♦", c: "♣" };
const RANK = "23456789TJQKA";
const fmt = n => Number(n).toLocaleString("en-IN");
const cardLabel = c => c ? RANK[0] && (c[0] === "T" ? "10" : c[0]) + SUIT[c[1]] : "—";
const profiles = [
  { id:"you", name:"You", type:"YOU", stack:2000 },
  { id:"p2", name:"Maya", type:"TIGHT", stack:2000 },
  { id:"p3", name:"Arjun", type:"CALLING STATION", stack:1800 },
  { id:"p4", name:"Dev", type:"AGGRESSIVE", stack:2200 },
  { id:"p5", name:"Riya", type:"BALANCED", stack:2000 },
  { id:"p6", name:"Kabir", type:"LOOSE", stack:1600 }
];
const typeColor = type => type === "AGGRESSIVE" ? "red" : type === "TIGHT" ? "blue" : type === "YOU" ? "green" : "neutral";

export function mountArena(root) {
  let hand = null;
  let handNo = 1;
  let buttonIndex = 5;
  let lastResult = "";
  let notice = "Your first hand is ready. Choose an action when it is your turn.";
  const stacks = Object.fromEntries(profiles.map(p => [p.id, p.stack]));
  const actionHistory = [];
  const positionNames = ["BTN", "SB", "BB", "UTG", "HJ", "CO"];

  const newHand = () => {
    // Practice-table rebuys are explicit: busted seats return to their starting stack
    // only when a new hand is dealt, while all surviving stacks carry over.
    const rebought = [];
    for (const p of profiles) {
      if (stacks[p.id] <= 0) { stacks[p.id] = p.stack; rebought.push(p.name); }
    }
    const seats = profiles.map(p => ({ id:p.id, stack:stacks[p.id] }));
    hand = startHand({ players:seats, buttonId:profiles[buttonIndex].id, smallBlind:5, bigBlind:10 });
    actionHistory.length = 0;
    actionHistory.push({street:"PRE-FLOP", text:`Hand #${handNo} dealt · blinds 5/10`});
    lastResult = "";
    notice = rebought.length ? `New hand dealt. Practice rebuy: ${rebought.join(", ")}.` : "New hand dealt. Stacks carry over; opponent cards stay hidden until showdown.";
    runOpponents();
    syncStacks();
    render();
  };

  function syncStacks() {
    if (!hand) return;
    for (const p of hand.players) stacks[p.id] = p.stack;
  }

  function recordAction(id, action, target = null) {
    const name = profiles.find(p => p.id === id)?.name ?? id;
    const detail = action === "fold" ? "folds" : action === "check" ? "checks" :
      action === "call" ? "calls" : action === "all-in" ? "moves all-in" :
      action === "bet" || action === "raise" ? `${action}s to ${fmt(target)}` : action;
    actionHistory.push({street:hand.street.toUpperCase(), text:`${name} ${detail}`});
  }

  const current = () => hand?.round?.currentPlayer;
  const me = () => hand?.players.find(p => p.id === "you");
  const meRound = () => hand?.round?.players?.find(p => p.id === "you");
  const myActions = () => current() === "you" ? legalActions(hand.round, "you") : [];
  const toCall = () => Math.max(0, (hand?.round?.currentBet ?? 0) - (meRound()?.streetContribution ?? 0));

  function opponentAction(id) {
    const p = hand.players.find(x => x.id === id);
    const rp = hand.round.players.find(x => x.id === id);
    const actions = legalActions(hand.round, id);
    const call = Math.max(0, hand.round.currentBet - rp.streetContribution);
    const potOdds = call / Math.max(1, hand.pot + call);
    const profile = profiles.find(x => x.id === id)?.type;
    let action = "check";
    if (actions.includes("check")) {
      if (actions.includes("bet") && profile === "AGGRESSIVE" && Math.random() < 0.28) {
        action = "bet";
      } else if (actions.includes("bet") && profile === "LOOSE" && Math.random() < 0.12) {
        action = "bet";
      }
    } else if (actions.includes("call")) {
      const willingness = profile === "CALLING STATION" ? 0.72 : profile === "LOOSE" ? 0.52 : profile === "AGGRESSIVE" ? 0.34 : profile === "TIGHT" ? 0.22 : 0.38;
      if (potOdds < willingness) action = "call";
      else if (profile === "AGGRESSIVE" && actions.includes("raise") && Math.random() < 0.12) action = "raise";
      else action = "fold";
    } else action = actions.includes("all-in") ? "all-in" : "fold";

    let target = null;
    if (action === "bet") target = Math.min(rp.streetContribution + rp.stack, Math.max(hand.round.minRaise, hand.round.currentBet + hand.round.minRaise));
    if (action === "raise") target = Math.min(rp.streetContribution + rp.stack, hand.round.currentBet + hand.round.lastFullRaise);
    if ((action === "bet" || action === "raise") && target > rp.streetContribution + rp.stack) action = "call";
    applyHandAction(hand, id, action, target);
    recordAction(id, action, target);
    syncStacks();
    notice = `${profiles.find(x => x.id === id)?.name} ${action === "all-in" ? "moves all-in" : action + (target ? " to " + fmt(target) : "")}.`;
  }

  function progress() {
    let guard = 0;
    while (hand.status === "in_progress" && guard++ < 60) {
      if (hand.street === "showdown") {
        settleShowdown(hand);
        const winners = hand.result.winnerIds.map(id => profiles.find(p => p.id === id)?.name ?? id).join(", ");
        lastResult = `Hand complete · Winner: ${winners}`;
        actionHistory.push({street:"SHOWDOWN",text:lastResult});
        syncStacks();
        notice = lastResult;
        break;
      }
      if (hand.round.complete) {
        advanceStreet(hand);
        if (hand.street === "showdown") continue;
        notice = `${hand.street.toUpperCase()} dealt. Your decision is next when action reaches you.`;
        continue;
      }
      const id = current();
      if (!id || id === "you") break;
      opponentAction(id);
    }
    if (guard >= 60) notice = "Practice hand paused after an unexpected action loop. Start a new hand.";
  }

  function runOpponents() {
    progress();
    if (hand.status === "complete" && hand.result) {
      const winner = hand.result.winnerIds.map(id => profiles.find(p => p.id === id)?.name ?? id).join(", ");
      lastResult = `Hand complete · Winner: ${winner}`;
    }
  }

  function doAction(action) {
    if (current() !== "you" || !myActions().includes(action)) return;
    let target = null;
    if (action === "bet" || action === "raise") {
      const input = root.querySelector("#arena-raise-to");
      target = Number(input?.value);
      if (!Number.isSafeInteger(target)) {
        notice = "Enter a whole-chip total contribution for your bet or raise.";
        render();
        return;
      }
    }
    try {
      applyHandAction(hand, "you", action, target);
      recordAction("you", action, target);
      syncStacks();
      notice = action === "fold" ? "You folded." : action === "check" ? "You checked." : action === "call" ? "You called." : `You chose ${action}.`;
      progress();
    } catch (error) {
      notice = error.message;
    }
    render();
  }

  function render() {
    if (!hand) return;
    const userTurn = current() === "you" && hand.status === "in_progress";
    const actions = myActions();
    const pot = hand.pot;
    const board = hand.board.map(cardLabel).join("  ") || "Waiting for the flop";
    const players = hand.players.map((p, i) => {
      const profile = profiles.find(x => x.id === p.id);
      const isYou = p.id === "you";
      const winner = hand.result?.winnerIds?.includes(p.id);
      const isTurn = current() === p.id && hand.status === "in_progress";
      const reveal = hand.result?.reason === "showdown";
      const cards = reveal || isYou ? p.holeCards.map(cardLabel).join(" ") : "▰ ▰";
      const position = positionNames[(i - buttonIndex + profiles.length) % profiles.length];
      const positionTag = position === "SB" || position === "BB" || position === "BTN" ? position : "";
      return `<div class="arena-seat ${isYou ? "is-you" : ""} ${isTurn ? "is-turn" : ""} ${p.folded ? "is-folded" : ""} ${winner ? "is-winner" : ""}">
        <div class="seat-top"><strong>${profile.name}</strong><span class="seat-type ${typeColor(profile.type)}">${profile.type}</span></div>
        <div class="seat-position">${positionTag || position}</div>
        <div class="seat-cards">${cards}</div>
        <div class="seat-stack">Stack <b> ${fmt(p.stack)}</b></div>
        <div class="seat-state">${p.folded ? "FOLDED" : p.allIn ? "ALL-IN" : isTurn ? "ACTING" : winner ? "WINNER" : "IN HAND"}</div>
      </div>`;
    }).join("");
    const minTarget = hand.round ? hand.round.currentBet + hand.round.lastFullRaise : 10;
    const maxTarget = meRound() ? meRound().streetContribution + meRound().stack : 2000;
    const raiseAction = actions.includes("raise") ? "raise" : actions.includes("bet") ? "bet" : null;
    const actionButtons = ["fold","check","call","bet","raise","all-in"].filter(a => actions.includes(a)).map(a => {
      const label = a === "all-in" ? "All-in" : a[0].toUpperCase() + a.slice(1);
      return `<button class="arena-action ${a === "fold" ? "fold-action" : a === "all-in" ? "allin-action" : "primary-action"}" data-arena-action="${a}">${label}${a === "call" ? " " + fmt(toCall()) : ""}</button>`;
    }).join("");
    root.innerHTML = `
      <div class="arena-wrap">
        <div class="arena-head">
          <div><a class="back-link" href="#home" data-go="home">← BACK TO HOME</a><p class="eyebrow">LIVE PRACTICE TABLE</p><h1>Practice Arena</h1><p class="muted">Six-max No-Limit Hold’em · Blinds 5 / 10 · 200 BB effective stacks</p></div>
          <div class="arena-head-actions"><span class="practice-tag">PRACTICE MODE</span><button class="secondary-button" id="arena-new-hand">New hand ↻</button></div>
        </div>
        <div class="arena-layout">
          <section class="arena-table-panel">
            <div class="table-meta"><span>HAND #${handNo}</span><span>${hand.street.toUpperCase()}</span><span>BUTTON · ${profiles[buttonIndex].name}</span></div>
            <div class="poker-table">
              <div class="table-pot"><small>CURRENT POT</small><strong>${fmt(pot)}</strong></div>
              <div class="community-cards">${hand.board.length ? hand.board.map(c => `<span class="playing-card">${cardLabel(c)}</span>`).join("") : '<span class="board-placeholder">COMMUNITY CARDS</span>'}</div>
              <div class="table-board-label">${hand.board.length}/5 COMMUNITY CARDS</div>
            </div>
            <div class="arena-seats">${players}</div>
            <div class="arena-notice"><span class="live-dot"></span><span>${notice}</span></div>
            <div class="arena-history"><div class="history-heading"><span>HAND HISTORY</span><span>${actionHistory.length} actions</span></div><div class="history-list">${actionHistory.slice(-12).map(item => `<div class="history-item"><small>${item.street}</small><span>${item.text}</span></div>`).join("") || '<span class="muted">Actions will appear here.</span>'}</div></div>
            <div class="arena-controls">
              <div class="controls-heading"><div><p class="eyebrow">YOUR DECISION</p><h3>${userTurn ? "Action on you" : hand.status === "complete" ? "Hand complete" : "Waiting for action"}</h3></div><span class="muted">${userTurn ? "Choose your move" : "Opponent actions are simulated"}</span></div>
              ${userTurn ? `
                ${raiseAction ? `<label class="raise-control">Bet / raise to (total street contribution)<input id="arena-raise-to" type="number" min="${minTarget}" max="${maxTarget}" step="1" value="${Math.min(maxTarget, minTarget)}"><small>Minimum ${fmt(minTarget)} · Maximum ${fmt(maxTarget)}</small></label>` : ""}
                <div class="arena-action-row">${actionButtons}</div>
              ` : hand.status === "complete" ? `<div class="result-banner">${lastResult || "Hand settled."}</div><button class="primary-button" id="arena-next-hand">Deal next hand →</button>` : `<div class="waiting-banner">The practice opponents are thinking through the action.</div>`}
            </div>
          </section>
          <aside class="arena-side">
            <div class="arena-side-card"><p class="eyebrow">TABLE PROFILE</p><h3>Practice opponents</h3>
              <div class="opponent-line"><span class="opponent-dot red-dot"></span><div><b>Dev</b><small>Aggressive · pressure and raises</small></div></div>
              <div class="opponent-line"><span class="opponent-dot blue-dot"></span><div><b>Maya</b><small>Tight · selective participation</small></div></div>
              <div class="opponent-line"><span class="opponent-dot green-dot"></span><div><b>Arjun</b><small>Calling station · wider calls</small></div></div>
              <div class="opponent-line"><span class="opponent-dot neutral-dot"></span><div><b>Riya & Kabir</b><small>Balanced and loose profiles</small></div></div>
            </div>
            <div class="arena-side-card"><p class="eyebrow">HAND SNAPSHOT</p><div class="snapshot-row"><span>Your stack</span><b>${fmt(me()?.stack ?? 0)}</b></div><div class="snapshot-row"><span>To call</span><b>${fmt(toCall())}</b></div><div class="snapshot-row"><span>Current bet</span><b>${fmt(hand.round?.currentBet ?? 0)}</b></div><div class="snapshot-row"><span>Effective stack</span><b>${fmt(Math.min(...hand.players.filter(p => !p.folded && p.id !== "you").map(p => p.stack), me()?.stack ?? 0))}</b></div></div>
            <div class="arena-disclaimer">Opponent actions are rule-legal, curated practice heuristics. They are not solver outputs or adaptive AI yet.</div>
          </aside>
        </div>
      </div>`;
    root.querySelectorAll("[data-arena-action]").forEach(button => button.addEventListener("click", () => doAction(button.dataset.arenaAction)));
    root.querySelector("#arena-new-hand")?.addEventListener("click", () => { handNo++; buttonIndex = (buttonIndex + 1) % profiles.length; newHand(); });
    root.querySelector("#arena-next-hand")?.addEventListener("click", () => { handNo++; buttonIndex = (buttonIndex + 1) % profiles.length; newHand(); });
  }

  newHand();
}
