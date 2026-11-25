const pageCopy = {
  coaching: ["30-Session Coaching", "A structured path from preflop fundamentals to advanced hand reviews.", "The curriculum is planned. Interactive lessons will be connected after the poker engine validation is complete."],
  puzzles: ["Daily Puzzles", "Practice one decision at a time.", "Puzzle scenarios and answer analysis are being prepared for the training workspace."],
  arena: ["Practice Arena", "Play realistic No-Limit Hold’em hands.", "The table interface will be connected to the validated hand engine before live practice is enabled."],
  reviews: ["Hand Reviews", "Understand the decisions behind every street.", "Hand replay, action history and coaching feedback are being integrated."],
  performance: ["My Performance", "Measure decision quality, not just results.", "Performance tracking will be enabled once hands and coaching feedback are saved to your account."],
  opponents: ["Opponent Lab", "Learn to adapt to different player types.", "Opponent profiles and adaptive practice agents are in development."],
  playbook: ["My Playbook", "Build a personal strategy reference.", "Your notes and strategy library will be added to the connected training workspace."]
};

function navigate(page) {
  const content = document.querySelector("#page-content");
  const crumb = document.querySelector("#page-crumb");
  if (!content || !crumb) return;
  document.querySelectorAll("[data-page]").forEach(link => link.classList.toggle("active", link.dataset.page === page));
  if (page === "home" || !pageCopy[page]) {
    location.hash = "home";
    crumb.textContent = "HOME";
    renderHome();
    return;
  }
  location.hash = page;
  const [title, intro, status] = pageCopy[page];
  crumb.textContent = title.toUpperCase();
  content.innerHTML = `<div class="module-page"><a class="back-link" href="#home" data-go="home">← BACK TO HOME</a><p class="eyebrow">POKER LAB MODULE</p><h1>${title}</h1><p class="muted">${intro}</p><div class="module-panel"><div class="card-kicker green-kicker">INTEGRATION STATUS</div><h3>Module setup in progress</h3><p>${status}</p><p>This module will live inside this same Poker Lab application. No separate website or account is required.</p></div></div>`;
}

function renderHome() {
  // Keep the initial dashboard markup intact by reloading the single app route.
  if (location.hash && location.hash !== "#home") location.hash = "home";
  window.location.reload();
}

document.addEventListener("click", event => {
  const target = event.target.closest("[data-go], [data-page]");
  if (!target) return;
  event.preventDefault();
  navigate(target.dataset.go || target.dataset.page);
});

const initial = location.hash.replace("#", "") || "home";
if (initial !== "home" && pageCopy[initial]) navigate(initial);
