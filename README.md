# Poker Lab

Unified Texas Hold'em training application. Development preview: `app/unified-poker-lab-v2`.

The app is being built as one product with a dark premium interface, neon-green primary accent, and purposeful blue/red highlights.

## Modules

- Home dashboard
- 30-Session Coaching
- Daily Puzzles
- Practice Arena
- Hand Reviews
- My Performance
- Opponent Lab
- My Playbook

## Game profile

- No-Limit Texas Hold'em cash games
- Blinds: 5/10
- Typical effective stack: 100–200 BB
- Table size: 6–8 players
- Adaptive, aggressive style with attention to value extraction, bluff selection, and river decisions

## Engineering principles

1. Preserve existing features when changing the UI.
2. Preview deployments are separate from production; production deployment is disabled during development.
3. Keep Poker Lab isolated from Poker Night Manager.
4. Never present heuristic opponent actions as solver output.
5. Never claim equity, EV, or win-rate figures unless actually computed.
6. Do not judge a decision solely by whether the hand won or lost.
7. Validate hand rankings, betting-round action order, short all-in raise reopening, side pots, and split-pot payouts with automated tests.

## Current implementation status

- Core card evaluation, secure shuffled deck, betting-round state machine, hand lifecycle, side-pot construction, and settlement modules are implemented.
- Engine regression suite passes in GitHub Actions.
- The responsive dashboard shell is in development.
- Training modules, persistence, and full browser-level validation remain in progress. Module placeholders are not completed features.

## Preview workflow

Cloudflare Pages preview deployments are enabled for branches. Production deployments are explicitly disabled. Preview builds use the existing `poker-lab` Pages project and do not replace production.

Run the test suite with `npm test` on Node.js 20 or newer.
