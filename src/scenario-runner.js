const scenarios = [
  {
    id:"btn-aqo",
    title:"Button pressure: AQ offsuit",
    level:"Beginner",
    setup:"Six-max 5/10 cash · 100 BB effective · no reads",
    summary:"Follow A♠ Q♦ from the button through a dry flop, a turn check and a river value decision.",
    steps:[
      {street:"PREFLOP",pot:"15",board:"—",hand:"A♠ Q♦",prompt:"Action folds to you on the button. What is the best baseline?",options:["Open-raise to a normal late-position size","Limp behind","Fold to avoid variance"],answer:0,explain:"Open-raise. AQo is comfortably strong enough to open from the button. A raise takes initiative and can win the blinds; limping sacrifices that advantage."},
      {street:"FLOP",pot:"55",board:"Q♣ 8♦ 3♠",hand:"A♠ Q♦",prompt:"You open to 25, the big blind calls 15 more and the small blind folds. Pot is 55. BB checks. What is a sound plan with top pair/top kicker?",options:["Bet small for value and protection","Check because top pair must pot-control","Overbet all-in"],answer:0,explain:"A small-to-medium bet can get called by weaker queens, 8x, pocket pairs and backdoor holdings while denying equity. Checking some frequency is reasonable, but betting is a strong baseline here."},
      {street:"TURN",pot:"105",board:"Q♣ 8♦ 3♠ 2♥",hand:"A♠ Q♦",prompt:"You bet 25 into 55 and BB calls. Turn pot is 105 (55 + 25 + 25). BB checks. Which approach is best?",options:["Reassess and often continue for value with a controlled size","Automatically shove because you have top pair","Always check; a call means BB has a queen"],answer:0,explain:"The pot is 105. A second value/protection bet can be reasonable against 8x, weaker queens and sticky pairs. Choose a size that worse hands can call; do not assume the flop call identifies one exact hand."},
      {street:"RIVER",pot:"195",board:"Q♣ 8♦ 3♠ 2♥ 7♣",hand:"A♠ Q♦",prompt:"You bet 45 on the turn and BB calls. River pot is 195. BB checks. Against a typical recreational range that reaches river with worse queens and 8x, what is a reasonable choice?",options:["Consider a thin value bet, sized so worse hands can call","Check every time because the river is a blank","Bluff all-in to fold out better queens"],answer:0,explain:"A blank river does not automatically end value betting. If worse pairs call often enough, a modest value bet can earn more than checking. Against a tight opponent whose range is mostly stronger queens, checking back becomes more attractive. This is opponent-dependent, not a mandatory bet."}
    ]
  },
  {
    id:"bb-76s",
    title:"Big blind defence: 7♠ 6♠",
    level:"Intermediate",
    setup:"Six-max 5/10 cash · 150 BB effective · cutoff opens",
    summary:"Defend a suited connector, navigate a connected flop and decide whether to continue on a turn that changes equity.",
    steps:[
      {street:"PREFLOP",pot:"35",board:"—",hand:"7♠ 6♠",prompt:"Cutoff opens to 25. Small blind folds. You are in the big blind. What should drive your decision?",options:["Call can be reasonable at this price with a playable suited connector","3-bet every suited connector","Fold all hands below a pair"],answer:0,explain:"You are closing the action and have already posted 10. 76s has playability and can realise equity in position? No: you will be out of position postflop, so price, opener range, rake and sizing matter. A call can be reasonable, but it is not automatic."},
      {street:"FLOP",pot:"55",board:"8♠ 5♦ 2♠",hand:"7♠ 6♠",prompt:"You call; heads-up pot is 55. You flop an open-ended straight draw plus a flush draw. Cutoff bets 20. What is the baseline?",options:["Continue, usually by calling or selectively raising","Fold because you have no made hand","Shove without considering sizing"],answer:0,explain:"You have a strong combination draw with substantial improvement potential. Calling keeps bluffs and weaker bets in; raising may be viable against a range that can fold, but should be chosen with a plan and stack depth."},
      {street:"TURN",pot:"95",board:"8♠ 5♦ 2♠ K♥",hand:"7♠ 6♠",prompt:"You call 20; pot is 95. Turn K♥. Cutoff bets 55. What should you evaluate?",options:["Your draw equity, price, implied odds and whether the K improves the raiser's range","Call automatically because you have many outs","Fold automatically because a king arrived"],answer:0,explain:"You must call 55 to contest a final pot of 205 (95 + 55 + 55), so the direct break-even equity is about 26.8%. Count only clean outs and consider implied odds, redraws, rake and how often the opponent barrels this card. The king may favour the cutoff's range, but does not settle the decision alone."},
      {street:"RIVER",pot:"205",board:"8♠ 5♦ 2♠ K♥ 9♣",hand:"7♠ 6♠",prompt:"You call the turn. River 9♣ misses your draw; cutoff checks. What is the disciplined default?",options:["Check back; your hand has little showdown value but no clear reason to bluff every miss","Bet pot because missed draws must bluff","Bet small regardless of opponent range"],answer:0,explain:"A missed draw is not automatically a bluff. Check back if your hand can occasionally beat other missed draws or if the opponent's checking range contains traps and bluff-catchers. Bluff only when the runout, range interaction, blockers and sizing create credible fold equity."}
    ]
  }
];

export function mountScenarioRunner(root, onBack) {
  let scenarioIndex = 0;
  let stepIndex = 0;
  let choice = null;
  let revealed = false;
  let completed = {};
  const scenario = () => scenarios[scenarioIndex];
  const step = () => scenario().steps[stepIndex];
  const render = () => {
    const s = scenario(), q = step();
    const done = completed[s.id] || 0;
    root.innerHTML = `
      <div class="scenario-wrap">
        <div class="scenario-head"><div><button class="back-link scenario-back" data-back>← BACK TO QUESTION BANK</button><p class="eyebrow">CONNECTED STREET-BY-STREET TRAINING</p><h1>Hand Simulations</h1><p class="muted">Make each decision before the next street is revealed. The solution explains the baseline and the opponent-dependent adjustment.</p></div><span class="practice-tag">SCRIPTED SCENARIO · NOT A SOLVER</span></div>
        <div class="scenario-picker">${scenarios.map((item,i)=>`<button class="scenario-pick ${i===scenarioIndex?"active":""}" data-scenario="${i}"><span>${item.level}</span><strong>${item.title}</strong><small>${completed[item.id]===item.steps.length?"Completed":(completed[item.id]||0)+" / 4 decisions viewed"}</small></button>`).join("")}</div>
        <section class="scenario-panel">
          <div class="scenario-info"><div><p class="eyebrow">TABLE CONDITIONS</p><h2>${s.title}</h2><p class="muted">${s.setup}</p><p class="scenario-summary">${s.summary}</p></div><div class="scenario-progress"><strong>${stepIndex+1}<span> / 4</span></strong><small>STREET DECISION</small></div></div>
          <div class="scenario-track">${s.steps.map((item,i)=>`<div class="scenario-track-step ${i<stepIndex?"passed":i===stepIndex?"current":""}"><span>${i+1}</span><small>${item.street}</small></div>`).join("")}</div>
          <div class="scenario-table">
            <div class="scenario-table-top"><span>HAND SNAPSHOT</span><span>5 / 10 · CASH</span></div>
            <div class="scenario-snapshot"><div><small>YOUR HAND</small><strong>${q.hand}</strong></div><div><small>POT</small><strong>${q.pot} <i>chips</i></strong></div><div><small>BOARD</small><strong>${q.board}</strong></div></div>
          </div>
          <div class="scenario-question"><div class="question-meta"><span>${q.street} DECISION</span><span class="difficulty ${s.level.toLowerCase()}">${s.level}</span></div><h3>${q.prompt}</h3>
            <div class="question-options">${q.options.map((o,i)=>`<button class="question-option ${choice===i?"selected":""} ${revealed&&i===q.answer?"correct":""} ${revealed&&choice===i&&i!==q.answer?"incorrect":""}" data-choice="${i}" ${revealed?"disabled":""}><span class="option-letter">${String.fromCharCode(65+i)}</span><span>${o}</span><span class="option-mark">${revealed&&i===q.answer?"✓":revealed&&choice===i?"×":""}</span></button>`).join("")}</div>
            ${revealed?`<div class="solution-panel ${choice===q.answer?"solution-correct":"solution-review"}"><div class="solution-title">${choice===q.answer?"Sound baseline":"Review the decision"}</div><p>${q.explain}</p></div><div class="scenario-actions"><span class="muted">Next street unlocks after reviewing this explanation.</span><button class="primary-button" data-next>${stepIndex===3?"Choose another scenario":"Continue to "+s.steps[stepIndex+1].street} →</button></div>`:`<div class="scenario-actions"><span class="muted">Choose your action before revealing the next street.</span><button class="primary-button" data-reveal ${choice===null?"disabled":""}>Submit decision</button></div>`}
          </div>
        </section>
      </div>`;
    root.querySelector("[data-back]")?.addEventListener("click",onBack);
    root.querySelectorAll("[data-scenario]").forEach(b=>b.addEventListener("click",()=>{scenarioIndex=Number(b.dataset.scenario);stepIndex=0;choice=null;revealed=false;render();}));
    root.querySelectorAll("[data-choice]").forEach(b=>b.addEventListener("click",()=>{if(revealed)return;choice=Number(b.dataset.choice);render();}));
    root.querySelector("[data-reveal]")?.addEventListener("click",()=>{if(choice===null)return;revealed=true;completed[s.id]=Math.max(completed[s.id]||0,stepIndex+1);render();});
    root.querySelector("[data-next]")?.addEventListener("click",()=>{if(stepIndex===3){scenarioIndex=(scenarioIndex+1)%scenarios.length;stepIndex=0;}else stepIndex++;choice=null;revealed=false;render();});
  };
  render();
}
