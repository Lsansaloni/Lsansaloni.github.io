import { type Move, MOVES } from './game';

export type AIDifficulty = 'random' | 'patterned' | 'adaptive';

/** The move that beats X — one of its two counters. */
const BEATS_BY: Record<Move, Move> = {
  rock: 'paper',
  paper: 'scissors',
  scissors: 'spock',
  lizard: 'rock',
  spock: 'paper',
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function chooseAIAction(difficulty: AIDifficulty, playerHistory: Move[]): Move {
  if (difficulty === 'random') return pick(MOVES);

  if (difficulty === 'patterned') {
    // Mimic: always beats whatever you played last round. Learnable by design.
    const last = playerHistory.at(-1);
    return last ? BEATS_BY[last] : pick(MOVES);
  }

  // adaptive (Hunter): counters your most frequent recent move, 20% noise
  if (Math.random() < 0.2) return pick(MOVES);

  const recent = playerHistory.slice(-6);
  if (recent.length === 0) return pick(MOVES);

  const counts = new Map<Move, number>();
  for (const move of recent) counts.set(move, (counts.get(move) ?? 0) + 1);
  let mostFrequent = recent[0];
  let best = 0;
  for (const [move, count] of counts) {
    if (count > best) {
      best = count;
      mostFrequent = move;
    }
  }
  return BEATS_BY[mostFrequent];
}

export const DIFFICULTY_LABELS: Record<AIDifficulty, { name: string; hint: string }> = {
  random: { name: 'Drifter', hint: 'No pattern. Pure noise.' },
  patterned: { name: 'Mimic', hint: 'Beats your last throw. Never repeat.' },
  adaptive: { name: 'Hunter', hint: 'Counts your habits. Randomize.' },
};
