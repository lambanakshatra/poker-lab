import { handScenarios } from "./hand-scenarios.js";

const progressKey = "poker-lab-scenario-progress-v1";
function readProgress(){try{return JSON.parse(localStorage.getItem(progressKey)||"{}")}catch{return {}}}

export function mountScenarioLab(root){
  let progress=readProgress();
  let scenarioIndex=0;
  let stepIndex=0;
  let choice=null;
  let submitted=false;
  const scenario=()=>handScenarios[scenarioIndex];
  const step=()=>scenario().steps[stepIndex];
  function render(){
    const h=scenario(),s=step(),saved=progress[h.id]||{};
    const completed=Object.keys(saved).filter(k=>saved[k].complete).length;
    root.innerHTML=`
      <div class="scenario-wrap">
        <div class="bank-header">
          <div><a class="back-link" href="#puzzles" data-go="puzzles">← BACK TO QUESTION BANK</a><p class="eyebrow">CONNECTED HAND PRACTICE</p><h1>Street-by-Street Lab</h1><p class="muted">Make one decision at a time. The next street unlocks after you submit.</p></div>
          <div class="bank-total"><strong>${handScenarios.length}</strong><span>curated hand scenarios</span><small>Preflop → flop → turn → river</small></div>
        </div>
        <div class="scenario-layout">
          <aside class="scenario-list">
            <div class="bank-section-title">SCENARIOS <span>${handScenarios.length}</span></div>
            ${handScenarios.map((x,i)=>`<button class="bank-category ${i===scenarioIndex?"active":""}" data-scenario="${i}"><span>${x.title}</span><small>${Object.keys(progress[x.id]||{}).filter(k=>progress[x.id][k].complete).length}/${x.steps.length} decisions</small></button>`).join("")}
          </aside>
          <section class="scenario-main">
            <div class="bank-category-heading"><div><p class="eyebrow">${h.level.toUpperCase()} · ${h.id.toUpperCase()}</p><h2>${h.title}</h2><p class="muted">${h.setup}</p><p class="muted">Opponent: ${h.villain}</p></div><div class="bank-progress"><strong>${completed}/${h.steps.length}</strong><small>decisions completed</small></div></div>
            <div class="scenario-streets">${h.steps.map((x,i)=>`<button class="scenario-street ${i===stepIndex?"active":""} ${saved[i]?.complete?"done":""}" ${i>completed?"disabled":""} data-step="${i}"><span>${i+1}</span><small>${x.street}</small></button>`).join("")}</div>
            <article class="question-card">
              <div class="question-meta"><span>DECISION ${stepIndex+1} OF ${h.steps.length}</span><span class="difficulty ${h.level.toLowerCase()}">${h.level}</span><span>${s.street.toUpperCase()}</span></div>
              <div class="scenario-state"><div><small>BOARD</small><strong>${s.board}</strong></div><div><small>POT AT DECISION</small><strong>${s.pot} chips</strong></div></div>
              <h3>${s.prompt}</h3>
              <div class="question-options">${s.options.map((o,i)=>`<button class="question-option ${choice===i?"selected":""} ${submitted&&i===s.answer?"correct":""} ${submitted&&choice===i&&i!==s.answer?"incorrect":""}" data-choice="${i}" ${submitted?"disabled":""}><span class="option-letter">${String.fromCharCode(65+i)}</span><span>${o}</span><span class="option-mark">${submitted&&i===s.answer?"✓":submitted&&choice===i?"×":""}</span></button>`).join("")}</div>
              ${submitted?`<div class="solution-panel ${choice===s.answer?"solution-correct":"solution-review"}"><div class="solution-title">${choice===s.answer?"Sound decision":"Review the baseline"}</div><p><strong>Baseline:</strong> ${s.why}</p><p><strong>Exploitative adjustment:</strong> ${s.exploit}</p></div><div class="question-footer"><span class="muted">A result does not determine whether the decision was correct.</span><button class="primary-button" data-next>${stepIndex===h.steps.length-1?"Finish scenario":"Next street →"}</button></div>`:`<div class="question-footer"><span class="muted">Submit your decision to unlock the next street.</span><button class="primary-button" data-submit ${choice===null?"disabled":""}>Lock decision</button></div>`}
            </article>
          </section>
        </div>
      </div>`;
    root.querySelectorAll("[data-scenario]").forEach(b=>b.addEventListener("click",()=>{scenarioIndex=Number(b.dataset.scenario);stepIndex=0;choice=null;submitted=false;render()}));
    root.querySelectorAll("[data-step]").forEach(b=>b.addEventListener("click",()=>{const n=Number(b.dataset.step);if(n<=completed){stepIndex=n;choice=null;submitted=Boolean(saved[n]?.complete);if(submitted)choice=saved[n].choice;render()}}));
    root.querySelectorAll("[data-choice]").forEach(b=>b.addEventListener("click",()=>{if(!submitted){choice=Number(b.dataset.choice);render()}}));
    root.querySelector("[data-submit]")?.addEventListener("click",()=>{if(choice===null||submitted)return;submitted=true;progress[h.id]||={};progress[h.id][stepIndex]={complete:true,choice,correct:choice===s.answer,at:new Date().toISOString()};try{localStorage.setItem(progressKey,JSON.stringify(progress))}catch{}render()});
    root.querySelector("[data-next]")?.addEventListener("click",()=>{if(stepIndex<h.steps.length-1)stepIndex++;else{stepIndex=0;scenarioIndex=(scenarioIndex+1)%handScenarios.length}choice=null;submitted=Boolean((progress[scenario().id]||{})[stepIndex]?.complete);if(submitted)choice=progress[scenario().id][stepIndex].choice;render()});
  }
  render();
}
