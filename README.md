# Poker Lab

A personal Texas Hold'em training lab focused on realistic decision practice, structured coaching, hand review, and performance improvement.

## Product direction

The home dashboard follows the approved Poker Lab design reference: a dark premium interface, neon green primary accent, and purposeful blue/red highlights.

### Core modules

- **Home** — learning progress, next lesson, daily puzzle, skill profile, and shortcuts.
- **30-Session Coaching** — structured progression from fundamentals to advanced play. Coaching sessions begin after core engine validation is complete.
- **Daily Puzzles** — realistic poker decision scenarios with explanations.
- **Practice Arena** — multiway cash-game practice with configurable opponent profiles.
- **Hand Reviews** — review decisions street by street, separating decision quality from hand outcome.
- **My Performance** — track skill areas and recurring leaks.
- **Opponent Lab** — understand and exploit different opponent archetypes.
- **My Playbook** — personal strategy notes, ranges, and adjustments.

## Game profile

- No-Limit Texas Hold'em cash games
- Blinds: 5/10
- Typical effective stack: 100–200 BB
- Table size: 6–8 players
- Adaptive, aggressive style with explicit attention to value extraction, bluff selection, and river decisions

## Engineering principles

1. Preserve existing features when changing the UI.
2. Do not deploy to the original production project until the replacement has been verified.
3. Keep the Poker Lab application and data isolated from Poker Night Manager.
4. Never present heuristic opponent actions as solver output.
5. Never claim equity, EV, or win-rate figures unless actually computed.
6. Do not judge a decision solely by whether the hand won or lost.
7. Validate hand rankings, betting-round action order, short all-in raise reopening, side pots, and split-pot payouts with automated tests.

## Repository status

The repository now contains initial, independently written engine modules:
- Five-card hand ranking and best-five-of-seven evaluation.
- Duplicate-card validation.
- Contribution-layer side-pot construction.
- Side-pot eligibility and split-payout helpers.
- Node test-runner regression tests for those modules.

These modules are a new, reviewable foundation. They are **not yet recovered from or proven identical to the deployed Cloudflare preview**.

## Known preview

- Cloudflare Pages project: `poker-lab-engine`
- Preview: https://dba740ee.poker-lab-engine.pages.dev
- This preview is not the original production project.

## Project layout

```text
poker-lab/
├── README.md
├── package.json
├── docs/
│   ├── PRODUCT_SPEC.md
│   ├── ENGINE_RULES.md
│   └── VALIDATION_PLAN.md
├── src/engine/
│   ├── cards.js
│   └── pots.js
└── tests/engine/
    ├── cards.test.js
    └── pots.test.js
```

Run the current test suite with `npm test` on Node.js 20 or newer.

## Current limitations

The full browser application, betting-round state machine, opponent logic, dashboard, coaching pages, and persistence layer still need to be reconstructed and integrated. The original source for the current Pages preview is not exposed by the connected Pages deployment APIs. Do not treat the preview as source-backed or claim full application validation until the code is recovered or rebuilt and tested.