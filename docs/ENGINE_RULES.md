# Poker Engine Rules and Acceptance Criteria

## Scope
No-Limit Texas Hold'em, 6–8 handed cash-game table, 5/10 default blinds, variable buy-ins, and effective stacks typically 100–200 BB.

## Engine requirements
- Use a shuffled 52-card deck with no duplicate cards.
- Deal two hole cards to each active player.
- Progress through preflop, flop, turn, river, and showdown.
- Enforce turn order and action eligibility.
- Support fold, check, call, bet, raise, and all-in.
- Track each player's street contribution and total hand contribution separately.
- Correctly handle players who are folded, all-in, or still required to act.
- Determine winners using the best five-card poker hand out of seven available cards.
- Distribute main and side pots only among eligible non-folded players.
- Split tied pots correctly, including deterministic odd-chip handling.

## Betting rules
- A full raise is at least the current minimum raise increment.
- A short all-in raise does not by itself reopen action for a player who has already acted.
- Multiple short all-in raises may cumulatively reach the minimum raise increment; when the rules permit, this reopens action for players who have already acted.
- Players who have not yet acted retain their action.
- After a raise, every other eligible player who must respond should be marked pending.
- Do not let folded or all-in players take further actions.

## Validation cases
- Royal flush versus four of a kind.
- Wheel straight (A-2-3-4-5).
- Flush best-five selection and kicker ordering.
- Full-house ranking.
- Two pair and kicker comparisons.
- 7-card combinations with multiple candidate five-card hands.
- Main pot plus one or more side pots at unequal contribution levels.
- Folded contributions remain in the pot but folded player is ineligible to win.
- Multiway side-pot eligibility.
- Split pots and odd chips.
- Full raise reopens action.
- Single short raise does not reopen action.
- Cumulative short raises to a full increment reopen action where appropriate.
- Heads-up and multiway action order.
- Round completion when all remaining players are all-in or have matched the wager.

## Integrity
Opponent behaviour is heuristic unless backed by a separately integrated and validated solver or statistical model. Do not market it as GTO. Never invent equity percentages.