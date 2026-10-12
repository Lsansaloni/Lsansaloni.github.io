import {
  type Move,
  MOVES,
  MOVE_DEFS,
  WINS_NEEDED,
  resolveRound,
  matchState,
} from './game';
import { type AIDifficulty, DIFFICULTY_LABELS, chooseAIAction } from './ai';

interface UIRefs {
  scoreYou: HTMLElement;
  scoreAi: HTMLElement;
  log: HTMLElement;
  result: HTMLElement;
  actions: HTMLElement;
  meta: HTMLElement;
  restart: HTMLButtonElement;
  difficultyButtons: HTMLButtonElement[];
}

let playerWins = 0;
let aiWins = 0;
let round = 0;
let difficulty: AIDifficulty = 'patterned';
let playerHistory: Move[] = [];
let gameOver = false;
let ui: UIRefs;

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function moveTooltip(move: Move): string {
  return MOVE_DEFS[move].beats
    .map((b) => {
      const verb = b.verb.charAt(0).toUpperCase() + b.verb.slice(1);
      return `${verb} ${MOVE_DEFS[b.move].label}.`;
    })
    .join(' ');
}

function renderScore(node: HTMLElement, wins: number): void {
  node.replaceChildren();
  for (let i = 0; i < WINS_NEEDED; i++) {
    node.append(el('span', i < wins ? 'pip on' : 'pip', '●'));
  }
  node.append(el('span', 'count', `${wins} / ${WINS_NEEDED}`));
}

function render(): void {
  renderScore(ui.scoreYou, playerWins);
  renderScore(ui.scoreAi, aiWins);
  const d = DIFFICULTY_LABELS[difficulty];
  ui.meta.textContent = gameOver
    ? `Match over · ${d.name}: ${d.hint}`
    : `Round ${round + 1} · First to ${WINS_NEEDED} · ${d.name}: ${d.hint}`;
}

function setButtons(enabled: boolean): void {
  for (const button of ui.actions.querySelectorAll<HTMLButtonElement>('button[data-move]')) {
    button.disabled = !enabled;
  }
}

function play(move: Move): void {
  if (gameOver) return;
  const aiMove = chooseAIAction(difficulty, playerHistory);
  const result = resolveRound(move, aiMove);

  playerHistory.push(move);
  round += 1;
  if (result.outcome === 'win') playerWins += 1;
  else if (result.outcome === 'lose') aiWins += 1;

  const line = el('div', '', result.text);
  if (result.outcome === 'win') line.style.color = 'var(--accent)';
  else if (result.outcome === 'lose') line.style.color = 'var(--danger)';
  ui.log.prepend(line);
  while (ui.log.children.length > 4) ui.log.lastElementChild!.remove();

  const state = matchState(playerWins, aiWins);
  if (state !== 'playing') {
    gameOver = true;
    ui.result.className = `result ${state === 'won' ? 'win' : 'lose'}`;
    ui.result.textContent = state === 'won' ? 'WINNER — YOU' : 'WINNER — RIVAL';
    setButtons(false);
    ui.restart.hidden = false;
    render();
    return;
  }

  render();
  setButtons(true);
}

function restart(): void {
  playerWins = 0;
  aiWins = 0;
  round = 0;
  playerHistory = [];
  gameOver = false;
  ui.log.replaceChildren();
  ui.result.textContent = '';
  ui.result.className = 'result';
  ui.restart.hidden = true;
  render();
  setButtons(true);
}

function buildScoreCard(name: string): { card: HTMLElement; score: HTMLElement } {
  const card = el('div', 'fighter');
  card.append(el('h2', '', name));
  const score = el('div', 'score');
  card.append(score);
  return { card, score };
}

function init(): void {
  const root = document.getElementById('app')!;

  root.append(el('h1', '', 'Rock Paper Magic'));
  const meta = el('p', 'meta', '');
  root.append(meta);

  const fighters = el('div', 'fighters');
  const you = buildScoreCard('You');
  const rival = buildScoreCard('Rival');
  fighters.append(you.card, rival.card);
  root.append(fighters);

  const result = el('p', 'result', '');
  const log = el('div', 'log');
  root.append(result, log);

  const actions = el('div', 'actions');
  for (const move of MOVES) {
    const button = el('button', 'primary');
    button.dataset.move = move;
    button.textContent = MOVE_DEFS[move].label;
    button.title = moveTooltip(move);
    button.addEventListener('click', () => play(move));
    actions.append(button);
  }
  root.append(actions);

  root.append(el('p', 'meta', 'Rival AI:'));
  const difficultyRow = el('div', 'actions');
  const difficultyButtons: HTMLButtonElement[] = [];
  for (const key of ['random', 'patterned', 'adaptive'] as AIDifficulty[]) {
    const button = el('button');
    button.textContent = DIFFICULTY_LABELS[key].name;
    if (key === difficulty) button.classList.add('primary');
    button.addEventListener('click', () => {
      difficulty = key;
      for (const b of difficultyButtons) b.classList.remove('primary');
      button.classList.add('primary');
      render();
    });
    difficultyButtons.push(button);
    difficultyRow.append(button);
  }
  root.append(difficultyRow);

  const restartBtn = el('button');
  restartBtn.textContent = 'New match';
  restartBtn.hidden = true;
  restartBtn.addEventListener('click', () => {
    restart();
  });
  root.append(restartBtn);

  ui = {
    scoreYou: you.score,
    scoreAi: rival.score,
    log,
    result,
    actions,
    meta,
    restart: restartBtn,
    difficultyButtons,
  };

  render();
  setButtons(true);
}

document.addEventListener('DOMContentLoaded', init);

export {};
