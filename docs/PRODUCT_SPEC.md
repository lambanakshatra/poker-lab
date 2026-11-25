# Poker Lab Product Specification

## Experience
Use the approved dashboard reference as the home-screen design direction:
- Dark, premium poker-room visual language.
- Neon green is the primary action and progress color.
- Blue is reserved for puzzles and analytical/learning actions.
- Red is reserved for practice/game actions and meaningful risk or warning states.
- Color must communicate function, not be decorative noise.

## Navigation
1. Home
2. 30-Session Coaching
3. Daily Puzzles
4. Practice Arena
5. Hand Reviews
6. My Performance
7. Opponent Lab
8. My Playbook

## Home dashboard
- Welcome panel with continue-coaching and performance actions.
- Coaching card showing current session and completion.
- Daily puzzle card with a direct solve action.
- Practice arena card with realistic opponent profiles.
- Skill profile with separate preflop, postflop, value betting, bluffing, and exploitation measures.
- Next lesson recommendation.
- Header showing streak, level/XP, notifications, and profile.

Do not remove modules to make room for the dashboard. The dashboard is a navigation and progress overview, not a substitute for the underlying modules.

## Coaching programme
30 sessions:
- Days 1–4: Starting hands, position, and preflop fundamentals.
- Days 5–8: 3-betting, blind defence, and squeeze plays.
- Days 9–17: Flop, turn, river, pot odds, and SPR.
- Days 18–22: Opponent profiling and exploitative adjustments.
- Days 23–27: Bet sizing, multiway strategy, and bankroll discipline.
- Days 28–30: Hand reviews, leak identification, and personal game plan.

The programme must be integrated, but the user asked to start coaching after engine validation is complete.

## User profile and game defaults
- No-Limit Texas Hold'em cash game.
- 5/10 blinds.
- Typical effective stack: 100–200 BB.
- 6–8 players.
- Adaptive aggressive play style.
- Focus on value extraction, bluff selection, aggressive opponents, and river decisions.

## Coaching integrity
Every coached hand should distinguish:
1. Baseline strategy / GTO-style heuristic.
2. Exploitative adjustment against the stated opponent.
3. Action and rationale.
4. Pot odds and sizing where relevant.
5. Whether a claim is calculated, sourced, or a coaching heuristic.

Never infer decision quality from the result alone. Do not claim solver results, exact equity, EV, or win rates unless actually computed by a validated tool.