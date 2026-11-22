// Ember Sigil Duel — pure game rules: no DOM here, so playtests can drive it headless.
import { CARD_DEFS, MAX_ENERGY, MAX_LIFE, HAND_SIZE, cardDef, deckList } from './config.js';
import { makeRng, shuffle } from './random.js';

export function makeFighter() {
  return { life: MAX_LIFE, shield: 0, energy: 3, maxEnergy: 3, hand: [], deck: [], discard: [] };
}

export function createGame(seed) {
  const rng = makeRng(seed);
  const game = {
    seed, rng, turn: 1, phase: 'title', // title | play | foe | won | lost
    you: makeFighter(), foe: makeFighter(),
    lastSuit: null, combo: 0, log: [], lastPlay: '', intent: null, muted: false,
    played: [], // display-only record of this turn's played cards: { who: 'you'|'foe', id }
  };
  game.you.deck = shuffle(deckList(), rng);
  game.foe.deck = shuffle(deckList(), rng);
  drawUpTo(game.you, HAND_SIZE);
  drawUpTo(game.foe, HAND_SIZE);
  return game;
}

export function drawUpTo(fighter, n) {
  while (fighter.hand.length < n) {
    if (fighter.deck.length === 0) {
      if (fighter.discard.length === 0) return;
      fighter.deck = shuffle(fighter.discard, Math.random);
      fighter.discard = [];
    }
    fighter.hand.push(fighter.deck.pop());
  }
}

export function comboBonus(game, def) {
  // Playing a second card of the same suit in one turn: +2 to its effect.
  return game.lastSuit === def.suit ? 2 : 0;
}

export function dealDamage(target, amount) {
  let left = amount;
  if (target.shield > 0) {
    const blocked = Math.min(target.shield, left);
    target.shield -= blocked; left -= blocked;
  }
  target.life = Math.max(0, target.life - left);
  return left;
}

export function applyCard(game, who, cardId) {
  const fighter = who === 'you' ? game.you : game.foe;
  const target = who === 'you' ? game.foe : game.you;
  const idx = fighter.hand.indexOf(cardId);
  if (idx === -1) return { ok: false, why: 'not in hand' };
  const def = cardDef(cardId);
  if (fighter.energy < def.cost) return { ok: false, why: 'not enough energy' };
  const bonus = comboBonus(game, def);
  const value = def.value + bonus;
  fighter.energy -= def.cost;
  fighter.hand.splice(idx, 1);
  fighter.discard.push(cardId);
  let text = '';
  if (def.kind === 'strike') { const dealt = dealDamage(target, value); text = `${def.name} hits for ${dealt}`; }
  if (def.kind === 'spark') { const dealt = dealDamage(target, value); drawUpTo(fighter, fighter.hand.length + 1); text = `${def.name} hits for ${dealt} and draws a card`; }
  if (def.kind === 'mend') { fighter.life = Math.min(MAX_LIFE, fighter.life + value); text = `${def.name} heals ${value}`; }
  if (def.kind === 'guard') { fighter.shield += value; text = `${def.name} raises ${value} shield`; }
  if (bonus > 0) { game.combo += 1; text += ' — COMBO +2!'; } else { game.combo = 0; }
  game.lastSuit = def.suit;
  game.lastPlay = text;
  game.log.push(text);
  game.played.push({ who, id: cardId }); // display only; the row renders this turn's cards
  if (game.log.length > 3) game.log.shift();
  if (target.life <= 0) game.phase = who === 'you' ? 'won' : 'lost';
  return { ok: true, text, bonus };
}

export function startTurn(game) {
  game.turn += 1;
  game.you.maxEnergy = Math.min(MAX_ENERGY, game.you.maxEnergy + 1);
  game.you.energy = game.you.maxEnergy;
  game.lastSuit = null; game.combo = 0; game.played = [];
  drawUpTo(game.you, HAND_SIZE);
  game.phase = 'play';
}

export function endPlayerTurn(game) {
  if (game.phase !== 'play') return;
  game.phase = 'foe';
}

export function foeTurn(game) {
  // The Warden draws, spends energy on its best affordable cards, then yields.
  game.foe.maxEnergy = Math.min(MAX_ENERGY, game.foe.maxEnergy + 1);
  game.foe.energy = game.foe.maxEnergy;
  drawUpTo(game.foe, HAND_SIZE);
  game.lastSuit = null; game.combo = 0;
  let played = 0;
  while (played < 2 && game.phase === 'foe') {
    const affordable = game.foe.hand.filter((id) => cardDef(id).cost <= game.foe.energy);
    if (affordable.length === 0) break;
    // Prefer a strike when the player is low, a heal when it is low, else the biggest card.
    const scored = affordable.map((id) => {
      const d = cardDef(id);
      let s = d.value;
      if (d.kind === 'strike' && game.you.life <= 10) s += 4;
      if (d.kind === 'mend' && game.foe.life <= 12) s += 5;
      if (d.kind === 'guard' && game.intent && game.intent.kind === 'strike') s += 1;
      return { id, s };
    }).sort((a, b) => b.s - a.s);
    const res = applyCard(game, 'foe', scored[0].id);
    if (!res.ok) break;
    played += 1;
  }
  if (game.phase === 'foe') startTurn(game);
}

export function planIntent(game) {
  // Readable tell, set at the start of the player's turn: what the Warden will favour.
  const foe = game.foe;
  if (foe.life <= 10) return { kind: 'mend', label: 'Warden plans: HEAL — strike now, before it recovers!' };
  if (game.you.life <= 8) return { kind: 'strike', label: 'Warden plans: BIG STRIKE — raise shield or finish it first!' };
  if (foe.hand.some((id) => cardDef(id).kind === 'strike' && cardDef(id).value >= 6)) {
    return { kind: 'strike', label: 'Warden plans: STRIKE — a Stone shield blunts it.' };
  }
  return { kind: 'mixed', label: 'Warden plans: a mixed hand — watch its suits.' };
}

export function cardCounts(hand) {
  const counts = {};
  for (const id of hand) counts[id] = (counts[id] || 0) + 1;
  return counts;
}

export { CARD_DEFS };
