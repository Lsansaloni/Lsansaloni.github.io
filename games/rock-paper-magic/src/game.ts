// Pure combat logic — no DOM, no timers. The damage matrix is the design
// document: edit these numbers and the whole game rebalances.
//
// Model: both sides commit simultaneously. Each action independently
// produces an effect against the other's action:
//   - basics follow the strike > feint > guard > strike triangle
//   - spells are flat damage, ignoring the triangle (cost mana)

export type BasicAction = 'strike' | 'feint' | 'guard';
export type SpellAction = 'fireball' | 'drain';
export type Action = BasicAction | SpellAction;

export const BASIC_ACTIONS: BasicAction[] = ['strike', 'feint', 'guard'];
export const ALL_ACTIONS: Action[] = ['strike', 'feint', 'guard', 'fireball', 'drain'];

export interface ActionDef {
  label: string;
  manaCost: number;
  description: string;
}

export const ACTION_DEFS: Record<Action, ActionDef> = {
  strike: { label: 'Strike', manaCost: 0, description: 'Beats Feint. 12 dmg.' },
  feint: { label: 'Feint', manaCost: 0, description: 'Beats Guard. 10 dmg.' },
  guard: { label: 'Guard', manaCost: 0, description: 'Beats Strike. 8 dmg.' },
  fireball: { label: 'Fireball', manaCost: 3, description: 'Flat 15 dmg. Ignores the triangle.' },
  drain: { label: 'Drain', manaCost: 2, description: '7 dmg, 7 self-heal.' },
};

export const FIREBALL_DMG = 15;
export const DRAIN_DMG = 7;
export const DRAIN_HEAL = 7;

export const MANA_MAX = 5;
export const MANA_START = 2;
export const MANA_REGEN = 1;
export const HP_MAX = 100;
export const ROUND_CAP = 10;

export interface Fighter {
  hp: number;
  mana: number;
}

export function makeFighter(): Fighter {
  return { hp: HP_MAX, mana: MANA_START };
}

/** Damage dealt by `attacker`'s action against `defender`'s action. */
const BASIC_MATRIX: Record<BasicAction, Record<BasicAction, number>> = {
  strike: { strike: 0, feint: 12, guard: 0 },
  feint: { strike: 0, feint: 0, guard: 10 },
  guard: { strike: 8, feint: 0, guard: 0 },
};

function effectDamage(attacker: Action, defender: Action): number {
  if (attacker === 'fireball') return FIREBALL_DMG;
  if (attacker === 'drain') return DRAIN_DMG;
  // basic vs a spell: the caster's action has no triangle slot — whiff.
  if (defender === 'fireball' || defender === 'drain') return 0;
  return BASIC_MATRIX[attacker][defender];
}

export interface ExchangeResult {
  damageToAI: number;
  damageToPlayer: number;
  healAI: number;
  healPlayer: number;
  eventText: string;
}

export function canPlay(action: Action, fighter: Fighter): boolean {
  return fighter.mana >= ACTION_DEFS[action].manaCost;
}

export function affordableActions(fighter: Fighter): Action[] {
  return ALL_ACTIONS.filter((a) => canPlay(a, fighter));
}

export function resolveExchange(playerAction: Action, aiAction: Action): ExchangeResult {
  const damageToAI = effectDamage(playerAction, aiAction);
  const damageToPlayer = effectDamage(aiAction, playerAction);
  const healPlayer = playerAction === 'drain' ? DRAIN_HEAL : 0;
  const healAI = aiAction === 'drain' ? DRAIN_HEAL : 0;

  return {
    damageToAI,
    damageToPlayer,
    healAI,
    healPlayer,
    eventText: describe(playerAction, aiAction, damageToAI, damageToPlayer),
  };
}

function describe(p: Action, a: Action, dmgToAI: number, dmgToPlayer: number): string {
  const label = (x: Action) => ACTION_DEFS[x].label;
  if (dmgToAI > 0 && dmgToPlayer > 0) return `${label(p)} vs ${label(a)} — both connect!`;
  if (dmgToAI > 0) return `${label(p)} beats ${label(a)} — ${dmgToAI} dmg.`;
  if (dmgToPlayer > 0) return `${label(a)} beats ${label(p)} — ${dmgToPlayer} dmg.`;
  return `${label(p)} vs ${label(a)} — nothing lands.`;
}

export function regenMana(fighter: Fighter): Fighter {
  return { ...fighter, mana: Math.min(MANA_MAX, fighter.mana + MANA_REGEN) };
}

export function spendMana(fighter: Fighter, action: Action): Fighter {
  return { ...fighter, mana: fighter.mana - ACTION_DEFS[action].manaCost };
}

export function applyDamage(fighter: Fighter, damage: number): Fighter {
  return { ...fighter, hp: Math.max(0, fighter.hp - damage) };
}

export function applyHeal(fighter: Fighter, heal: number): Fighter {
  return { ...fighter, hp: Math.min(HP_MAX, fighter.hp + heal) };
}

export type MatchState = 'playing' | 'won' | 'lost' | 'draw';

export function matchOutcome(player: Fighter, ai: Fighter, round: number): MatchState {
  if (player.hp <= 0 && ai.hp <= 0) return 'draw';
  if (ai.hp <= 0) return 'won';
  if (player.hp <= 0) return 'lost';
  if (round >= ROUND_CAP) {
    if (player.hp > ai.hp) return 'won';
    if (ai.hp > player.hp) return 'lost';
    return 'draw';
  }
  return 'playing';
}
