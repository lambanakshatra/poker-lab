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
        const previousStreet = hand.street;
        advanceStreet(hand);
        if (hand.street !== "showdown") actionHistory.push({street:hand.street.toUpperCase(),text:`${hand.street.toUpperCase()} dealt · ${hand.board.map(cardLabel).join(" ")}`});
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
      if (!actionHistory.some(item => item.text === lastResult)) actionHistory.push({street:"RESULT",text:lastResult});
      syncStacks();
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
    const reveal = hand.result?.reason === "showdown";
    const mePlayer = me();
    const holeCards = (mePlayer?.holeCards || []).map(c => {
      const label = cardLabel(c), red = c[1] === "h" || c[1] === "d";
      return `<span class="arena-playing-card ${red ? "red" : ""}"><b>${label.slice(0,-1)}</b><i>${label.slice(-1)}</i></span>`;
    }).join("");
    const community = hand.board.map(c => {
      const label = cardLabel(c), red = c[1] === "h" || c[1] === "d";
      return `<span class="arena-playing-card community-card ${red ? "red" : ""}"><b>${label.slice(0,-1)}</b><i>${label.slice(-1)}</i></span>`;
    }).join("");
    const seats = hand.players.map((p, i) => {
      const profile = profiles.find(x => x.id === p.id);
      const isYou = p.id === "you";
      const winner = hand.result?.winnerIds?.includes(p.id);
      const isTurn = current() === p.id && hand.status === "in_progress";
      const position = positionNames[(i - buttonIndex + profiles.length) % profiles.length];
      const cards = reveal || isYou ? p.holeCards.map(cardLabel).map(label => {
        const red = label.endsWith("♥") || label.endsWith("♦");
        return `<span class="mini-card ${red ? "red" : ""}">${label}</span>`;
      }).join("") : '<span class="mini-card facedown">◆</span><span class="mini-card facedown">◆</span>';
      return `<div class="arena-player player-${i} ${isYou ? "hero-seat" : ""} ${isTurn ? "is-turn" : ""} ${p.folded ? "is-folded" : ""} ${winner ? "is-winner" : ""}">
        <div class="player-avatar ${typeColor(profile.type)}" aria-label="${profile.name} avatar"></div>
        <div class="player-details"><div class="player-name">${profile.name}<span class="player-position">${position}</span></div><div class="player-stack">${fmt(p.stack)}</div><div class="player-type ${typeColor(profile.type)}">${profile.type}</div></div>
        <div class="player-cards">${cards}</div>
        <span class="player-turn">${p.folded ? "FOLDED" : p.allIn ? "ALL-IN" : isTurn ? "ACTING" : winner ? "WINNER" : " "}</span>
      </div>`;
    }).join("");
    const minTarget = hand.round ? hand.round.currentBet + hand.round.lastFullRaise : 10;
    const maxTarget = meRound() ? meRound().streetContribution + meRound().stack : 2000;
    const raiseAction = actions.includes("raise") ? "raise" : actions.includes("bet") ? "bet" : null;
    const actionButtons = ["fold","check","call","bet","raise","all-in"].filter(a => actions.includes(a)).map(a => {
      const label = a === "all-in" ? "All-In" : a === "call" ? `Call ${fmt(toCall())}` : a === "raise" ? "Raise" : a[0].toUpperCase()+a.slice(1);
      const symbol = a === "fold" ? "×" : a === "call" ? "↪" : a === "all-in" ? "▤" : a === "raise" || a === "bet" ? "↑" : "✓";
      return `<button class="arena-action ${a === "fold" ? "fold-action" : a === "call" ? "call-action" : a === "all-in" ? "allin-action" : "primary-action"}" data-arena-action="${a}"><span>${symbol}</span>${label}</button>`;
    }).join("");
    const currentPosition = positionNames[(0 - buttonIndex + profiles.length) % profiles.length];
    const callPrice = toCall() ? (toCall()/(pot+toCall())*100) : 0;
    const context = userTurn
      ? `You're in the ${currentPosition === "SB" ? "small blind" : currentPosition === "BB" ? "big blind" : currentPosition} with ${hand.street === "preflop" ? "a hand to play preflop" : "a decision on this board"}. Consider the action, pot odds and opponent tendencies.`
      : hand.status === "complete" ? (lastResult || "Hand complete. Review the action history.") : notice;
    root.innerHTML = `
      <div class="arena-wrap arena-redesign">
        <div class="arena-head">
          <div><a class="back-link" href="#home" data-go="home">← BACK TO HOME</a><p class="eyebrow">LIVE PRACTICE TABLE</p><h1>Practice Arena</h1><p class="muted">6-Max No-Limit Hold’em&nbsp; · &nbsp;Blinds 5 / 10&nbsp; · &nbsp;200 BB Effective Stacks</p></div>
          <div class="arena-head-actions"><span class="practice-tag">♧ GAME MODE</span><button class="secondary-button" id="arena-new-hand">New hand ↻</button></div>
        </div>
        <div class="arena-redesign-grid">
          <section class="arena-main-column">
            <div class="arena-table-panel redesigned-table-panel">
              <div class="table-meta"><span>HAND #${handNo}</span><span>${hand.street.toUpperCase()}</span><span>BUTTON · ${profiles[buttonIndex].name}</span></div>
              <div class="arena-oval-table">
                <div class="oval-pot"><small>CURRENT POT</small><strong>${fmt(pot)}</strong></div>
                <div class="oval-community-label">COMMUNITY CARDS</div>
                <div class="oval-community">${community || '<span class="empty-board-card">♠</span><span class="empty-board-card">♠</span><span class="empty-board-card">♠</span><span class="empty-board-card">♠</span><span class="empty-board-card">♠</span>'}</div>
                <div class="oval-board-count">${hand.board.length} / 5 COMMUNITY CARDS</div>
                ${seats}
              </div>
              <div class="arena-notice"><span class="live-dot"></span><span>${notice}</span></div>
              <div class="arena-history"><div class="history-heading"><span>HAND HISTORY</span><span>${actionHistory.length} actions</span></div><div class="history-list">${actionHistory.slice(-12).map(item => `<div class="history-item"><small>${item.street}</small><span>${item.text}</span></div>`).join("") || '<span class="muted">Actions will appear here.</span>'}</div></div>
            </div>
            <div class="arena-controls redesigned-controls">
              <div class="controls-heading"><div><p class="eyebrow">YOUR DECISION</p><h3>${userTurn ? "Your Decision?" : hand.status === "complete" ? "Hand complete" : "Waiting for action"}</h3><p class="muted">${userTurn ? "Choose the best action for this situation." : "Opponent actions are simulated practice heuristics."}</p></div><span class="decision-clock">${userTurn ? "●" : "Ⅱ"}</span></div>
              ${userTurn ? `
                ${raiseAction ? `<label class="raise-control">Raise to (total street contribution)<input id="arena-raise-to" type="number" min="${minTarget}" max="${maxTarget}" step="1" value="${Math.min(maxTarget, Math.max(minTarget, hand.round.currentBet + hand.round.lastFullRaise))}"><small>Minimum ${fmt(minTarget)} · Maximum ${fmt(maxTarget)}</small></label>` : ""}
                <div class="arena-action-row">${actionButtons}</div>
              ` : hand.status === "complete" ? `<div class="result-banner">${lastResult || "Hand settled."}</div><button class="primary-button" id="arena-next-hand">Deal next hand →</button>` : `<div class="waiting-banner">${notice}</div>`}
            </div>
          </section>
          <aside class="arena-redesign-sidebar">
            <div class="arena-side-card hand-summary-card"><div class="sidebar-card-heading"><h3>Hand #${handNo}</h3><span class="hand-live-label">${hand.status === "complete" ? "COMPLETE" : "LIVE"}</span></div>
              <div class="your-hand-line"><b>Your Hand</b><div class="your-hole-cards">${holeCards}</div></div>
              <div class="summary-line"><span>Position</span><b>${currentPosition}</b></div><div class="summary-line"><span>Stage</span><b>${hand.street[0].toUpperCase()+hand.street.slice(1)}</b></div><div class="summary-line"><span>Pot</span><b>${fmt(pot)}</b></div><div class="summary-line"><span>Effective Stack</span><b>${fmt(Math.min(...hand.players.filter(p=>!p.folded&&p.id!=="you").map(p=>p.stack),mePlayer?.stack??0))}</b></div>
            </div>
            <div class="arena-side-card"><div class="sidebar-card-heading"><h3>▥ &nbsp;Hand Analysis</h3></div><div class="analysis-copy"><span>Decision context</span><b>${hand.street === "preflop" ? "Preflop range and position" : "Board texture and ranges"}</b></div><div class="analysis-copy"><span>Equity required to call</span><b>${toCall() ? callPrice.toFixed(1)+"%" : "No call facing you"}</b></div><p class="analysis-note">${toCall() ? "Call "+fmt(toCall())+" to contest "+fmt(pot+toCall())+". This is the break-even equity before rake." : "No call price is currently facing you. Assess position, ranges and the action sequence."} No solver equity is being invented.</p></div>
            <div class="arena-side-card key-context-card"><div class="sidebar-card-heading"><h3>ⓘ &nbsp;Key Context</h3></div><p>${context}</p></div>
            <div class="arena-side-card opponents-card"><div class="sidebar-card-heading"><h3>At this table</h3></div>${profiles.slice(1).map(p=>`<div class="opponent-line"><span class="opponent-dot ${typeColor(p.type)==="red"?"red-dot":typeColor(p.type)==="blue"?"blue-dot":typeColor(p.type)==="green"?"green-dot":"neutral-dot"}"></span><div><b>${p.name}</b><small>${p.type}</small></div></div>`).join("")}</div>
          </aside>
        </div>
      </div>`;
    root.querySelectorAll("[data-arena-action]").forEach(button => button.addEventListener("click", () => doAction(button.dataset.arenaAction)));
    root.querySelector("#arena-new-hand")?.addEventListener("click", () => { handNo++; buttonIndex = (buttonIndex + 1) % profiles.length; newHand(); });
    root.querySelector("#arena-next-hand")?.addEventListener("click", () => { handNo++; buttonIndex = (buttonIndex + 1) % profiles.length; newHand(); });
  }

  newHand();
}
