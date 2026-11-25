import { categories, questions, BANK_TARGET_PER_CATEGORY } from "./question-bank.js";
import { questionBatch02 } from "./question-bank-batch-02.js";
import { questionBatch03 } from "./question-bank-batch-03.js";
import { mountScenarioRunner } from "./scenario-runner.js";
const allQuestions = [...questions, ...questionBatch02, ...questionBatch03];

const progressKey = "poker-lab-question-progress-v1";

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(progressKey) || "{}"); }
  catch { return {}; }
}

export function mountQuestionBank(root) {
  let selectedCategory = "starting-hands";
  let questionIndex = 0;
  let selectedAnswer = null;
  let submitted = false;
  let mode = "all";
  let progress = loadProgress();

  const categoryQuestions = () => allQuestions.filter(q => q.categoryId === selectedCategory &&
    (mode === "all" || (mode === "review" && progress[selectedCategory]?.[q.id]?.correct === false)));
  const currentQuestion = () => categoryQuestions()[questionIndex % Math.max(1, categoryQuestions().length)];
  const stats = id => {
    const entries = progress[id] || {};
    const attempts = Object.values(entries);
    return {attempted:attempts.length,correct:attempts.filter(x => x.correct).length,wrong:attempts.filter(x => x.correct === false).length};
  };
  const save = () => {
    try { localStorage.setItem(progressKey, JSON.stringify(progress)); } catch {}
  };

  function render() {
    const category = categories.find(c => c.id === selectedCategory);
    const q = currentQuestion();
    const s = stats(selectedCategory);
    const published = categoryQuestions().length;
    root.innerHTML = `
      <div class="bank-wrap">
        <div class="bank-header">
          <div><a class="back-link" href="#home" data-go="home">← BACK TO HOME</a><p class="eyebrow">YOUR PRACTICE LIBRARY</p><h1>Question Bank</h1><p class="muted">Choose a topic, make a decision, then study the solution.</p></div>
          <div class="bank-header-actions"><button class="primary-button" data-open-scenarios>Run complete hand simulations →</button><div class="bank-total"><strong>${allQuestions.length.toLocaleString("en-IN")}</strong><span>published practice items</span><small>15 categories · target 1,000 each</small></div></div>
        </div>
        <div class="bank-layout">
          <aside class="bank-categories">
            <div class="bank-section-title">CATEGORIES <span>15</span></div>
            ${["Preflop","Postflop","Mathematics","Advanced","Simulations"].map(group=>`
              <div class="bank-group"><div class="bank-group-title">${group}</div>
              ${categories.filter(c=>c.group===group).map(c=>{
                const count=allQuestions.filter(q=>q.categoryId===c.id).length;
                return `<button class="bank-category ${c.id===selectedCategory?"active":""}" data-category="${c.id}"><span>${c.name}</span><small>${count.toLocaleString("en-IN")} / ${BANK_TARGET_PER_CATEGORY.toLocaleString("en-IN")}</small></button>`;
              }).join("")}</div>`).join("")}
          </aside>
          <section class="bank-main">
            <div class="bank-category-heading"><div><p class="eyebrow">${category.group.toUpperCase()}</p><h2>${category.name}</h2><p class="muted">${category.description}</p></div><div class="bank-progress"><strong>${s.correct}/${s.attempted}</strong><small>correct / attempted</small></div></div>
            <div class="bank-meter"><span style="width:${Math.min(100,published/BANK_TARGET_PER_CATEGORY*100)}%"></span></div>
            <div class="bank-count-row"><span>${published} ${mode==="review"?"questions to review":"published items"}</span><span>1,000 item target</span></div>
            <div class="bank-mode-switch">
              <button class="bank-mode ${mode==="all"?"active":""}" data-mode="all">All questions <span>${allQuestions.filter(q=>q.categoryId===selectedCategory).length}</span></button>
              <button class="bank-mode ${mode==="review"?"active":""}" data-mode="review">Review mistakes <span>${s.wrong}</span></button>
            </div>
            ${q ? `
              <article class="question-card">
                <div class="question-meta"><span>QUESTION ${String(questionIndex+1).padStart(3,"0")} / ${published}</span><span class="difficulty ${q.level.toLowerCase()}">${q.level}</span><span>${q.type.toUpperCase()}</span></div>
                <h3>${q.prompt}</h3>
                <div class="question-context">${q.context}</div>
                <div class="question-options">${q.options.map((option,i)=>`
                  <button class="question-option ${selectedAnswer===i?"selected":""} ${submitted&&i===q.answer?"correct":""} ${submitted&&selectedAnswer===i&&i!==q.answer?"incorrect":""}" data-answer="${i}" ${submitted?"disabled":""}>
                    <span class="option-letter">${String.fromCharCode(65+i)}</span><span>${option}</span><span class="option-mark">${submitted&&i===q.answer?"✓":submitted&&selectedAnswer===i?"×":""}</span>
                  </button>`).join("")}</div>
                ${submitted?`
                  <div class="solution-panel ${selectedAnswer===q.answer?"solution-correct":"solution-review"}">
                    <div class="solution-title">${selectedAnswer===q.answer?"Correct decision":"Review the baseline solution"}</div>
                    <p>${q.explanation}</p>
                    <div class="solution-tags">${(q.tags||[]).map(t=>`<span>${t}</span>`).join("")}</div>
                  </div>
                  <div class="question-footer"><span class="muted">Decision quality is separate from the result of a hand.</span><button class="primary-button" data-next>Next question →</button></div>
                `:`
                  <div class="question-footer"><span class="muted">Select one answer to submit.</span><button class="primary-button" data-submit ${selectedAnswer===null?"disabled":""}>Check answer</button></div>
                `}
              </article>
            `:`<div class="question-empty">No questions published in this category yet.</div>`}
            <div class="bank-note"><strong>Content standard</strong><span>Solutions are teaching baselines. Where poker strategy depends on ranges, opponents or sizing, the explanation says so instead of pretending there is one universal answer.</span></div>
          </section>
        </div>
      </div>`;
    root.querySelector("[data-open-scenarios]")?.addEventListener("click",()=>mountScenarioRunner(root,render));
    root.querySelectorAll("[data-category]").forEach(button=>button.addEventListener("click",()=>{
      selectedCategory=button.dataset.category;questionIndex=0;selectedAnswer=null;submitted=false;mode="all";render();
    }));
    root.querySelectorAll("[data-mode]").forEach(button=>button.addEventListener("click",()=>{
      mode=button.dataset.mode;questionIndex=0;selectedAnswer=null;submitted=false;render();
    }));
    root.querySelectorAll("[data-answer]").forEach(button=>button.addEventListener("click",()=>{
      if(submitted)return;selectedAnswer=Number(button.dataset.answer);render();
    }));
    root.querySelector("[data-submit]")?.addEventListener("click",()=>{
      if(selectedAnswer===null||submitted)return;
      submitted=true;
      const qNow=currentQuestion();
      progress[selectedCategory] ||= {};
      const previous = progress[selectedCategory][qNow.id];
      progress[selectedCategory][qNow.id]={correct:selectedAnswer===qNow.answer,answer:selectedAnswer,at:new Date().toISOString(),attempts:(previous?.attempts||0)+1};
      save();render();
    });
    root.querySelector("[data-next]")?.addEventListener("click",()=>{
      questionIndex=questionIndex+1;
      if(questionIndex>=categoryQuestions().length) questionIndex=0;
      selectedAnswer=null;submitted=false;render();
    });
  }
  render();
}
