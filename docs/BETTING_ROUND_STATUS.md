# Betting-round state machine — initial implementation

File: `src/engine/betting-round.js`

## Included
- Explicit current player and pending-action list.
- Fold, check, call, raise-to, and all-in actions.
- Stack and street-contribution updates.
- Full-raise increment tracking.
- Per-player last-acted bet tracking for cumulative short all-in reopening.
- Removal of folded and all-in players from action eligibility.

## Important scope
This is a first isolated street-level state machine. It does not yet implement the complete hand lifecycle, blind posting, preflop seat-order derivation, side-pot settlement integration, runouts, showdown, or persistent hand history. It must be integrated with the table engine only after tests and edge-case review.

## Known follow-up cases
- Heads-up blind and button action order.
- Opening bet versus raise semantics.
- Minimum raise when a prior bet is itself a short all-in.
- Multiple short raises with players who have not acted yet.
- Uncalled excess bet return.
- All players but one folded.
- All remaining players all-in.
- A player who is all-in but has chips in earlier contribution layers.
- Pot-limit is out of scope; this is no-limit only.

## Validation
Node's built-in test runner is configured in package.json. Run `npm test` with Node.js 20+ after checking out the development branch. Automated tests in this repository have not been executed in this environment yet; do not claim they passed until run.