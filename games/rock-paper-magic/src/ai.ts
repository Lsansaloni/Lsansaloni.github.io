import {
  type Action,
  type BasicAction,
  type Fighter,
  ACTION_DEFS,
  BASIC_ACTIONS,
  affordableActions,
} from './game';

export type AIDifficulty = 'random' | 'patterned' | 'adaptive';

const COUNTER: Record<BasicAction, BasicAction> = {
  // what beats X
  strike: 'guard',
  feint: 'strike',
  guard: 'feint',
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function chooseAIAction(
  difficulty: AIDifficulty,
  ai: Fighter,
  playerHistory: Action[]
): Action {
  const options = affordableActions(ai);
  const basics = options.filter((a) => BASIC_ACTIONS.includes(a as BasicAction));
  const spells = options.filter((a) => !BASIC_ACTIONS.includes(a as BasicAction));

  if (difficulty === 'random') return pick(options);

  if (difficulty === 'patterned') {
    // Rotates its basics; occasionally throws a spell. Learnable by design.
    if (spells.length > 0 && Math.random() < 0.25) return pick(spells);
    if (basics.length === 0) return pick(options);
    const last = playerHistory.at(-1);
    const idx = last && BASIC_ACTIONS.includes(last as BasicAction)
      ? (BASIC_ACTIONS.indexOf(last as BasicAction) + 1) % 3
      : Math.floor(Math.random() * 3);
    const wanted = BASIC_ACTIONS[idx];
    return basics.includes(wanted) ? wanted : pick(basics);
  }

  // adaptive: counters your most frequent recent basic, 20% noise
  if (Math.random() < 0.2) return pick(options);

  const recent = playerHistory.slice(-4).filter((a) => BASIC_ACTIONS.includes(a as BasicAction));
  if (recent.length === 0) return pick(basics.length > 0 ? basics : options);

  const counts = { strike: 0, feint: 0, guard: 0 } as Record<BasicAction, number>;
  for (const move of recent) counts[move as BasicAction] += 1;
  const mostFrequent = (Object.keys(counts) as BasicAction[]).reduce((a, b) =>
    counts[a] >= counts[b] ? a : b
  );
  const counter = COUNTER[mostFrequent];
  return basics.includes(counter) ? counter : pick(basics.length > 0 ? basics : options);
}

export const DIFFICULTY_LABELS: Record<AIDifficulty, { name: string; hint: string }> = {
  random: { name: 'Drifter', hint: 'No pattern. Pure noise.' },
  patterned: { name: 'Mimic', hint: 'Rotates. Watch two rounds.' },
  adaptive: { name: 'Hunter', hint: 'Reads your habits. Randomize.' },
};

export function aiSpellChance(difficulty: AIDifficulty): number {
  return difficulty === 'random' ? 0.3 : difficulty === 'patterned' ? 0.25 : 0.2;
}

export function actionCost(action: Action): number {
  return ACTION_DEFS[action].manaCost;
}
