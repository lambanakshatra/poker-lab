# Poker Lab Validation Plan

## Deployment reference
Current engine preview: https://dba740ee.poker-lab-engine.pages.dev

The source for that preview has not yet been recovered into this repository. The 10 reference checks reported during development were isolated harness checks, not tests of the deployed application code.

## Gate 1 — source recovery
- Recover the actual engine/UI source from its original build artifacts or reconstruct it from inspected deployed behaviour.
- Commit source to this repository.
- Record the exact deployment and source commit relationship.
- Do not overwrite the original production Pages project.

## Gate 2 — engine unit tests
- Hand evaluator against known hands.
- Best-five-of-seven selection.
- Side-pot construction with two, three, and four all-in players.
- Folded contributions and winner eligibility.
- Split pots, odd chips, and tie ordering.
- Betting round order and action-pending behaviour.
- Full raise and short all-in reopening rules.

## Gate 3 — integration tests
- Run complete hands for 6- and 8-handed tables.
- Check all-in runouts and side-pot settlement.
- Verify chips are conserved from hand start through payout.
- Verify no duplicate cards.
- Verify session and hand history persistence.

## Gate 4 — user experience
- Re-integrate the 30-session curriculum.
- Build the approved home dashboard without removing the practice engine.
- Validate each navigation section and all primary calls to action.
- Check desktop and mobile layouts.

## Gate 5 — data/security
- Confirm Poker Lab data remains isolated from Poker Night Manager.
- Verify authenticated-user RLS with two real sessions.
- Do not ship service-role credentials in the browser.

## Gate 6 — release
- Test in the separate preview project first.
- Verify the new release end-to-end.
- Only then consider changing any canonical production deployment.