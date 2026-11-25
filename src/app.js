import { mountArena } from "./arena.js";
import { mountBoardPractice } from "./board-practice.js";

const pageCopy = {
  coaching: ["30-Session Coaching", "A structured path from preflop fundamentals to advanced hand reviews.", "The curriculum is planned. Interactive lessons will be connected after the poker engine validation is complete."],
  puzzles: ["Question Bank", "Build skill through thousands of structured poker decisions.", "The question bank is now active with an initial set of reviewed practice questions across 15 categories."],
  arena: ["Practice Arena", "Play realistic No-Limit Hold’em hands.", "The table interface will be connected to the validated hand engine before live practice is enabled."],
  reviews: ["Hand Reviews", "Understand the decisions behind every street.", "Hand replay, action history and coaching feedback are being integrated."],
  performance: ["My Performance", "Measure decision quality, not just results.", "Performance tracking will be enabled once hands and coaching feedback are saved to your account."],
  opponents: ["Opponent Lab", "Learn to adapt to different player types.", "Opponent profiles and adaptive practice agents are in development."],
  playbook: ["My Playbook", "Build a personal strategy reference.", "Your notes and strategy library will be added to the connected training workspace."]
};

const contentRoot = document.querySelector("#page-content");
const crumb = document.querySelector("#page-crumb");
const homeMarkup = contentRoot?.innerHTML ?? "";

function renderPage(page) {
  if (!contentRoot || !crumb) return;
  document.querySelectorAll("[data-page]").forEach(link => {
    link.classList.toggle("active", link.dataset.page === page);
  });

  if (page === "puzzles") {
    crumb.textContent = "QUESTION BANK";
    mountBoardPractice(contentRoot, () => navigate("home"));
    return;
  }

  if (page === "arena") {
    crumb.textContent = "PRACTICE ARENA";
    mountArena(contentRoot);
    return;
  }

  if (page === "home" || !pageCopy[page]) {
    contentRoot.innerHTML = homeMarkup;
    crumb.textContent = "HOME";
    document.querySelectorAll("[data-page]").forEach(link => {
      link.classList.toggle("active", link.dataset.page === "home");
    });
    return;
  }

  const [title, intro, status] = pageCopy[page];
  crumb.textContent = title.toUpperCase();
  contentRoot.innerHTML = `<div class="module-page">
    <a class="back-link" href="#home" data-go="home">← BACK TO HOME</a>
    <p class="eyebrow">POKER LAB MODULE</p>
    <h1>${title}</h1>
    <p class="muted">${intro}</p>
    <div class="module-panel">
      <div class="card-kicker green-kicker">INTEGRATION STATUS</div>
      <h3>Module setup in progress</h3>
      <p>${status}</p>
      <p>This module will live inside this same Poker Lab application. No separate website or account is required.</p>
    </div>
  </div>`;
}

function navigate(page) {
  const next = pageCopy[page] ? page : "home";
  if (location.hash !== `#${next}`) history.pushState({ page: next }, "", `#${next}`);
  renderPage(next);
}

document.addEventListener("click", event => {
  const target = event.target.closest("[data-go], [data-page]");
  if (!target) return;
  event.preventDefault();
  navigate(target.dataset.go || target.dataset.page);
});

window.addEventListener("popstate", () => {
  renderPage(location.hash.slice(1) || "home");
});

renderPage(location.hash.slice(1) || "home");
