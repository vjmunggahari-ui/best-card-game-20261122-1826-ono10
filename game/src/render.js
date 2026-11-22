// Rendering: DOM cards and bars, nothing drawn off-screen. Suits differ by colour AND shape.
import { SUITS, MAX_LIFE, MAX_ENERGY, cardDef } from './config.js';
import { describeIntent } from './ai.js';

const $ = (id) => document.getElementById(id);

export function cardEl(def, opts = {}) {
  const suit = SUITS[def.suit];
  const el = document.createElement('div');
  el.className = `card suit-${def.suit}${opts.disabled ? ' disabled' : ''}${opts.played ? ' played' : ''}`;
  if (!opts.static) { // played-row cards are display-only: not focusable, not buttons
    el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', `${def.name}, ${suit.name} suit, cost ${def.cost}, ${def.text}`);
  } else {
    el.setAttribute('aria-label', `${def.name}, ${suit.name} suit, played this turn`);
  }
  el.innerHTML = `<div class="cost">${def.cost}</div><div class="suit">${suit.glyph}</div>` +
    `<div class="cname">${def.name}</div><div class="cvalue">${def.value}</div>` +
    `<div class="ctext">${def.text}</div><div class="suitname">${suit.name}</div>`;
  return el;
}

export function backEl() {
  const el = document.createElement('div');
  el.className = 'card back';
  el.innerHTML = '<div class="suit">✦</div>';
  return el;
}

export function render(game, handlers) {
  $('youLifeFill').style.width = `${(game.you.life / MAX_LIFE) * 100}%`;
  $('youLifeText').textContent = `Life ${game.you.life} / ${MAX_LIFE}`;
  $('foeLifeFill').style.width = `${(game.foe.life / MAX_LIFE) * 100}%`;
  $('foeLifeText').textContent = `Life ${game.foe.life} / ${MAX_LIFE}`;
  $('youShield').textContent = game.you.shield > 0 ? `🛡 Shield ${game.you.shield}` : '';
  $('foeShield').textContent = game.foe.shield > 0 ? `🛡 Shield ${game.foe.shield}` : '';
  $('turnline').textContent = game.phase === 'play'
    ? `Turn ${game.turn} — your move`
    : game.phase === 'foe' ? `Turn ${game.turn} — the Warden acts…` : `Turn ${game.turn}`;
  $('foeIntent').textContent = describeIntent(game.intent);
  $('energyPips').innerHTML = Array.from({ length: MAX_ENERGY }, (_, i) =>
    `<span class="pip${i < game.you.energy ? '' : ' spent'}"></span>`).join('');
  $('energy').firstChild.textContent = `Energy ${game.you.energy}/${game.you.maxEnergy} `;
  $('lastPlay').textContent = game.lastPlay || 'Play a card — matching suits chain into combos.';
  $('log').textContent = game.log.join(' · ');
  const playedRow = $('playedRow');
  playedRow.innerHTML = '';
  const played = game.played.slice(-5);
  if (played.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'played-empty';
    empty.textContent = 'No cards on the table yet — play a card to start the chain.';
    playedRow.appendChild(empty);
  } else {
    played.forEach((p) => {
      const slot = document.createElement('div');
      slot.className = 'played-slot';
      const who = document.createElement('div');
      who.className = 'played-who';
      who.textContent = p.who === 'you' ? 'You played' : 'Warden played';
      slot.appendChild(who);
      slot.appendChild(cardEl(cardDef(p.id), { played: true, static: true }));
      playedRow.appendChild(slot);
    });
  }
  const banner = $('comboBanner');
  if (game.combo > 0) { banner.textContent = `COMBO x${game.combo + 1}! +2`; banner.classList.remove('hidden'); }
  else banner.classList.add('hidden');

  const foeHand = $('foeHand');
  foeHand.innerHTML = '';
  game.foe.hand.forEach(() => foeHand.appendChild(backEl()));

  const youHand = $('youHand');
  youHand.innerHTML = '';
  game.you.hand.forEach((id, i) => {
    const def = cardDef(id);
    const disabled = game.phase !== 'play' || def.cost > game.you.energy;
    const el = cardEl(def, { disabled });
    el.addEventListener('click', () => handlers.play(i));
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlers.play(i); } });
    youHand.appendChild(el);
  });
  $('status').textContent = `You ${game.you.life} life, Warden ${game.foe.life} life, turn ${game.turn}.`;
}

export function showOverlay(kind, game) {
  const overlay = $('overlay');
  const panel = $('panel');
  panel.classList.remove('win', 'lose');
  if (kind === 'title') {
    $('panelTitle').textContent = 'EMBER SIGIL DUEL';
    $('panelText').textContent = 'Four sigils. One table. Outwit the Rune Warden.';
    $('panelRules').style.display = '';
    $('startBtn').textContent = 'Begin the duel';
    overlay.classList.remove('hidden');
    return;
  }
  if (kind === 'won') {
    panel.classList.add('win');
    $('panelTitle').textContent = '★ VICTORY ★';
    $('panelText').textContent = `The Rune Warden falls on turn ${game.turn}. You keep ${game.you.life} life — the table is yours!`;
    $('panelRules').style.display = 'none';
    $('startBtn').textContent = 'Play again';
    overlay.classList.remove('hidden');
    return;
  }
  if (kind === 'lost') {
    panel.classList.add('lose');
    $('panelTitle').textContent = 'DEFEAT';
    $('panelText').textContent = `The Warden wins on turn ${game.turn}. Your sigils scatter — shuffle up and try again.`;
    $('panelRules').style.display = 'none';
    $('startBtn').textContent = 'Rematch';
    overlay.classList.remove('hidden');
    return;
  }
  overlay.classList.add('hidden');
}

export function confettiBurst() {
  const box = $('confetti');
  box.classList.remove('hidden');
  box.innerHTML = '';
  const colours = ['#ffd76a', '#e5484d', '#3e8ef7', '#43b581', '#fff'];
  for (let i = 0; i < 60; i += 1) {
    const piece = document.createElement('i');
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colours[i % colours.length];
    piece.style.animationDelay = `${Math.random() * 0.8}s`;
    box.appendChild(piece);
  }
  window.setTimeout(() => box.classList.add('hidden'), 3600);
}
