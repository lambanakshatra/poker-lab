# Poker Lab

Unified Texas Hold'em training application. Development preview branch: `app/unified-poker-lab-v2`.

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

## Current implementation status

- Core card evaluation, secure shuffled deck, betting-round state machine, hand lifecycle, side-pot construction, and settlement modules are implemented.
- Engine regression suite passes in GitHub Actions.
- Responsive dashboard shell is in development.
- Training modules, persistence, and browser-level validation remain in progress; module placeholders are not completed features.

## Deployment safety

Cloudflare Pages preview deployments are enabled for development branches. Production deployments remain explicitly disabled. Preview builds use the existing `poker-lab` Pages project and cannot replace the production deployment.

Run the test suite with `npm test` on Node.js 20 or newer.
