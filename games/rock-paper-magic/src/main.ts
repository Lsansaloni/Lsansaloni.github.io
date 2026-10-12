import {
  type Action,
  type Fighter,
  ACTION_DEFS,
  ALL_ACTIONS,
  makeFighter,
  matchOutcome,
  regenMana,
  resolveExchange,
  spendMana,
  applyDamage,
  applyHeal,
  ROUND_CAP,
} from './game';
import { type AIDifficulty, DIFFICULTY_LABELS, chooseAIAction } from './ai';

interface UIRefs {
  playerHpBar: HTMLElement;
  playerHpText: HTMLElement;
  playerManaBar: HTMLElement;
  playerManaText: HTMLElement;
  aiHpBar: HTMLElement;
  aiHpText: HTMLElement;
  aiManaBar: HTMLElement;
  aiManaText: HTMLElement;
  log: HTMLElement;
  result: HTMLElement;
  actions: HTMLElement;
  meta: HTMLElement;
  restart: HTMLButtonElement;
  difficultyButtons: HTMLButtonElement[];
}

let player: Fighter = makeFighter();
let ai: Fighter = makeFighter();
let round = 0;
let difficulty: AIDifficulty = 'patterned';
let playerHistory: Action[] = [];
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

function setBar(node: HTMLElement, current: number, max: number): void {
  node.style.width = `${Math.round((current / max) * 100)}%`;
}

function renderFighter(
  isPlayer: boolean,
  fighter: Fighter,
  hpBar: HTMLElement,
  hpText: HTMLElement,
  manaBar: HTMLElement,
  manaText: HTMLElement
): void {
  setBar(hpBar, fighter.hp, 100);
  hpText.textContent = `${fighter.hp} / 100`;
  hpBar.parentElement!.classList.toggle('low', fighter.hp <= 30);
  setBar(manaBar, fighter.mana, 5);
  manaText.textContent = `${fighter.mana} / 5`;
  void isPlayer;
}

function render(): void {
  renderFighter(true, player, ui.playerHpBar, ui.playerHpText, ui.playerManaBar, ui.playerManaText);
  renderFighter(false, ai, ui.aiHpBar, ui.aiHpText, ui.aiManaBar, ui.aiManaText);
  const d = DIFFICULTY_LABELS[difficulty];
  ui.meta.textContent = `Round ${Math.min(round + 1, ROUND_CAP)} / ${ROUND_CAP} · ${d.name}: ${d.hint}`;
}

function setButtons(enabled: boolean): void {
  for (const button of ui.actions.querySelectorAll<HTMLButtonElement>('button[data-action]')) {
    const action = button.dataset.action as Action;
    button.disabled = !enabled || player.mana < ACTION_DEFS[action].manaCost;
  }
}

function play(action: Action): void {
  if (gameOver) return;
  const aiAction = chooseAIAction(difficulty, ai, playerHistory);
  const exchange = resolveExchange(action, aiAction);

  player = applyHeal(applyDamage(spendMana(player, action), exchange.damageToPlayer), exchange.healPlayer);
  ai = applyHeal(applyDamage(spendMana(ai, aiAction), exchange.damageToAI), exchange.healAI);

  playerHistory.push(action);
  round += 1;

  const line = el(
    'div',
    '',
    `${exchange.eventText} (you: ${ACTION_DEFS[action].label} · rival: ${ACTION_DEFS[aiAction].label})`
  );
  if (exchange.damageToPlayer > 0) line.style.color = 'var(--danger)';
  else if (exchange.damageToAI > 0) line.style.color = 'var(--accent)';
  ui.log.prepend(line);
  while (ui.log.children.length > 4) ui.log.lastElementChild!.remove();

  const outcome = matchOutcome(player, ai, round);
  if (outcome !== 'playing') {
    gameOver = true;
    ui.result.className = `result ${outcome}`;
    ui.result.textContent =
      outcome === 'won' ? 'You win the match.' : outcome === 'lost' ? 'The rival wins.' : 'Draw.';
    setButtons(false);
    ui.restart.hidden = false;
    return;
  }

  player = regenMana(player);
  ai = regenMana(ai);
  render();
  setButtons(true);
}

function restart(): void {
  player = makeFighter();
  ai = makeFighter();
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

function buildFighterCard(
  name: string,
  refs: Partial<UIRefs>,
  isPlayer: boolean
): HTMLElement {
  const card = el('div', 'fighter');
  card.append(el('h2', '', name));

  const hpLabel = el('div', 'bar-label');
  const hpText = el('span', '', '100 / 100');
  hpLabel.append(el('span', '', 'HP'), hpText);
  const hpBarWrap = el('div', 'bar hp');
  const hpBar = el('div');
  hpBarWrap.append(hpBar);
  card.append(hpLabel, hpBarWrap);

  const manaLabel = el('div', 'bar-label');
  const manaText = el('span', '', '2 / 5');
  manaLabel.append(el('span', '', 'Mana'), manaText);
  const manaBarWrap = el('div', 'bar mana');
  const manaBar = el('div');
  manaBarWrap.append(manaBar);
  card.append(manaLabel, manaBarWrap);

  if (isPlayer) {
    refs.playerHpBar = hpBar;
    refs.playerHpText = hpText;
    refs.playerManaBar = manaBar;
    refs.playerManaText = manaText;
  } else {
    refs.aiHpBar = hpBar;
    refs.aiHpText = hpText;
    refs.aiManaBar = manaBar;
    refs.aiManaText = manaText;
  }
  return card;
}

function init(): void {
  const root = document.getElementById('app')!;

  root.append(el('h1', '', 'Rock Paper Magic'));
  const meta = el('p', 'meta', '');
  root.append(meta);

  const fighters = el('div', 'fighters');
  const refs: Partial<UIRefs> = {};
  fighters.append(buildFighterCard('You', refs, true), buildFighterCard('Rival', refs, false));
  root.append(fighters);

  const result = el('p', 'result', '');
  const log = el('div', 'log');
  root.append(result, log);

  const actions = el('div', 'actions');
  for (const action of ALL_ACTIONS) {
    const def = ACTION_DEFS[action];
    const button = el('button', def.manaCost > 0 ? '' : 'primary');
    button.dataset.action = action;
    button.innerHTML = `${def.label}${def.manaCost > 0 ? `<span class="cost">${def.manaCost} mana</span>` : ''}`;
    button.title = def.description;
    button.addEventListener('click', () => play(action));
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
    ...(refs as UIRefs),
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
