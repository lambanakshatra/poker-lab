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

Initial training defaults:
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

## Current implementation status

This repository is the source-of-truth scaffold. The latest Cloudflare Pages engine preview exists separately and its original source has not yet been recovered into this repository. Do not treat this README as evidence that all listed modules are already implemented or validated.

### Known preview

- Cloudflare Pages project: `poker-lab-engine`
- Preview: https://dba740ee.poker-lab-engine.pages.dev
- This preview is not the original production project.

## Planned repository structure

```text
poker-lab/
├── README.md
├── docs/
│   ├── PRODUCT_SPEC.md
│   ├── ENGINE_RULES.md
│   └── VALIDATION_PLAN.md
├── src/
│   ├── app/
│   ├── engine/
│   ├── coaching/
│   ├── puzzles/
│   ├── reviews/
│   └── analytics/
└── tests/
    └── engine/
```

The source tree will be populated as recoverable implementation code is added and tested.