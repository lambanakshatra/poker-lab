# Complete hand lifecycle — initial integration

## Included
- Table validation and deterministic deck injection.
- Button, small blind, big blind, heads-up blind order and preflop action order.
- Two-card hole dealing in round-robin order.
- Street-level action application and chip contribution tracking.
- Flop/turn/river dealing and postflop first-to-act order.
- Immediate award when all opponents fold.
- Showdown evaluation and contribution-layer payout integration.

## Scope and safeguards
- This is a deterministic engine core, not a solver.
- A supplied deck is validated for duplicates; the default deck is ordered and is intended for deterministic tests, not live random dealing.
- Production must provide a cryptographically shuffled deck or a trusted server-side deck service.
- Multiway all-in runout, side-pot settlement, uncalled excess return, short blind edge cases and odd-chip rules still need dedicated regression coverage.
- The engine does not calculate equity, EV, or opponent ranges.
- Do not connect this to production until CI is green and the edge-case suite is expanded.
