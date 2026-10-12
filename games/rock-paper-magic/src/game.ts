// Pure round logic — no DOM, no timers. The counter table is the design
// document: edit these rows and the whole game rebalances.
//
// Five-way rock-paper-scissors (RPSLS): every move beats exactly two others
// and loses to exactly two. Both sides commit simultaneously; the match is
// first to 3 round wins, ties replay.

export type Move = 'rock' | 'paper' | 'scissors' | 'lizard' | 'spock';

export const MOVES: Move[] = ['rock', 'paper', 'scissors', 'lizard', 'spock'];

export interface Beats {
  move: Move;
  verb: string;
}

export interface MoveDef {
  label: string;
  beats: Beats[];
}

export const MOVE_DEFS: Record<Move, MoveDef> = {
  rock: {
    label: 'Rock',
    beats: [
      { move: 'scissors', verb: 'crushes' },
      { move: 'lizard', verb: 'crushes' },
    ],
  },
  paper: {
    label: 'Paper',
    beats: [
      { move: 'rock', verb: 'covers' },
      { move: 'spock', verb: 'disproves' },
    ],
  },
  scissors: {
    label: 'Scissors',
    beats: [
      { move: 'paper', verb: 'cuts' },
      { move: 'lizard', verb: 'decapitates' },
    ],
  },
  lizard: {
    label: 'Lizard',
    beats: [
      { move: 'paper', verb: 'eats' },
      { move: 'spock', verb: 'poisons' },
    ],
  },
  spock: {
    label: 'Spock',
    beats: [
      { move: 'scissors', verb: 'smashes' },
      { move: 'rock', verb: 'vaporizes' },
    ],
  },
};

export const WINS_NEEDED = 3;
export const MATCH_ROUNDS = WINS_NEEDED * 2 - 1;

export type RoundOutcome = 'win' | 'lose' | 'tie';

export interface RoundResult {
  outcome: RoundOutcome;
  text: string;
}

function phrase(winner: Move, loser: Move): string {
  const hit = MOVE_DEFS[winner].beats.find((b) => b.move === loser)!;
  return `${MOVE_DEFS[winner].label} ${hit.verb} ${MOVE_DEFS[loser].label}`;
}

export function resolveRound(player: Move, ai: Move): RoundResult {
  if (player === ai) {
    return {
      outcome: 'tie',
      text: `Tie — both played ${MOVE_DEFS[player].label}.`,
    };
  }
  if (MOVE_DEFS[player].beats.some((b) => b.move === ai)) {
    return {
      outcome: 'win',
      text: `${phrase(player, ai)} — you take the round.`,
    };
  }
  return {
    outcome: 'lose',
    text: `${phrase(ai, player)} — rival takes the round.`,
  };
}

export type MatchState = 'playing' | 'won' | 'lost';

export function matchState(playerWins: number, aiWins: number): MatchState {
  if (playerWins >= WINS_NEEDED) return 'won';
  if (aiWins >= WINS_NEEDED) return 'lost';
  return 'playing';
}
