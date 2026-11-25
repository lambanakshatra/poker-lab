# Poker Lab

A personal Texas Hold'em training lab focused on realistic decision practice, structured coaching, hand review, and performance improvement.

## Product direction

One unified application with a dark premium interface, neon-green primary accent, and purposeful blue/red highlights.

### Core modules

- **Home** — learning progress, next lesson, daily puzzle, skill profile, and shortcuts.
- **30-Session Coaching** — structured progression from fundamentals to advanced play. Coaching sessions begin after core engine validation and integration.
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
2. Keep preview deployments separate from production; production remains disabled during development.
3. Keep Poker Lab isolated from Poker Night Manager.
4. Never present heuristic opponent actions as solver output.
5. Never claim equity, EV, or win-rate figures unless actually computed.
6. Do not judge a decision solely by whether the hand won or lost.
7. Validate hand rankings, betting-round action order, short all-in raise reopening, side pots, and split-pot payouts with automated tests.

## Current implementation status

- Core card evaluation, secure shuffled deck, betting-round state machine, hand lifecycle, side-pot construction, and settlement modules are implemented.
- Engine regression suite currently passes in GitHub Actions.
- The unified responsive dashboard shell is in development on `app/unified-poker-lab-v2`.
- Training modules, persistence, and full browser-level validation remain in progress. The shell's module placeholders should not be mistaken for completed features.

## Preview workflow

Cloudflare Pages preview deployments are enabled for branches. Production deployments are explicitly disabled while the unified application is being built and verified. Preview builds use the existing `poker-lab` Pages project; they do not replace the production deployment.

## Project layout

```text
poker-lab/
├── index.html
├── styles.css
├── package.json
├── src/
│   ├── app.js
│   └── engine/
└── tests/
```

Run the current test suite with `npm test` on Node.js 20 or newer.
