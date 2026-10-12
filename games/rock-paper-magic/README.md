# Rock Paper Magic

A combat resolver built on the rock-paper-scissors counter triangle — HP,
mana, spells, and an AI you can learn to read. A prototype on purpose: no
menus, no art, color + text + numbers.

## Run it

```bash
npm install
npm run dev
```

## The model

Both sides commit an action simultaneously each round. Each action produces
an effect against the other's action:

| You \ Rival | Strike | Feint | Guard | Fireball | Drain |
| --- | --- | --- | --- | --- | --- |
| **Strike** | 0 | 12 | 0 | 0 | 0 |
| **Feint** | 0 | 0 | 10 | 0 | 0 |
| **Guard** | 8 | 0 | 0 | 0 | 0 |
| **Fireball** | 15 | 15 | 15 | 15 | 15 |
| **Drain** | 7 | 7 | 7 | 7 | 7 |

- Basics are free and follow the triangle (`strike > feint > guard > strike`).
- Spells are flat, ignore the triangle, and cost mana (Fireball 3 → 15 dmg,
  Drain 2 → 7 dmg + 7 self-heal).
- Mana: starts at 2, +1 per round, max 5.
- First to 0 HP loses; 10-round cap, higher HP wins.

**The design bet:** pure RPS is luck with extra steps. Add a resource
(mana) with slow regen and asymmetric costs, and the same three counters
become a tempo game — spend now for guaranteed damage, or save and try to
read the rival. The three AI difficulties exist so the player has something
to *learn*: Drifter (noise), Mimic (rotation), Hunter (adapts to your
habits — randomize).

## Balance levers

All numbers live at the top of `src/game.ts` (`BASIC_MATRIX`,
`FIREBALL_DMG`, `DRAIN_*`, `MANA_*`). That table is the whole design doc —
edit it and the game rebalances.

## Scope notes

Deliberately out of scope: menus, art, sound, online play, best-of-N
series. This exists to answer one question in under a minute of play. If it
earns a Phase 3+, it graduates to its own repo.
