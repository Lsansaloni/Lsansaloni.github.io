# Rock Paper Magic

Five-way rock-paper-scissors (RPSLS) — five moves, first to three rounds,
and an AI you can learn to read. A prototype on purpose: no menus, no art,
color + text + words.

## Run it

```bash
npm install
npm run dev
```

## The model

Both sides commit a move simultaneously each round. Every move beats exactly
two others and loses to exactly two:

| Move | Beats |
| --- | --- |
| **Rock** | Scissors (crushes), Lizard (crushes) |
| **Paper** | Rock (covers), Spock (disproves) |
| **Scissors** | Paper (cuts), Lizard (decapitates) |
| **Lizard** | Paper (eats), Spock (poisons) |
| **Spock** | Scissors (smashes), Rock (vaporizes) |

- Same move twice → tie: replay, no point.
- Win the round → one point. First to **3** points → `WINNER` (max 5 rounds).
- Three rival AIs you're supposed to *learn*: Drifter (noise), Mimic (beats
  your last throw — never repeat), Hunter (counters your habits — randomize).

**The design bet:** pure three-way RPS is luck with extra steps. Five moves
widen the read space, and a first-to-three match lets a good read compound
across rounds instead of evaporating in one throw. The throw is luck; the
match isn't.

## Balance levers

The counter table lives at the top of `src/game.ts` (`MOVE_DEFS`) — verbs,
matchups, everything. The AI dispositions live in `src/ai.ts`
(`BEATS_BY`, `DIFFICULTY_LABELS`). Edit either and the game rebalances.

## Scope notes

Deliberately out of scope: menus, art, sound, online play. This exists to
answer one question in under a minute of play. If it earns a Phase 3+, it
graduates to its own repo.
