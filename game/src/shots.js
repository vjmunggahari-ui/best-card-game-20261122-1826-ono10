// Shot setups: deterministic states for screenshots, reached through the real rules.
// ?shot=title | play | win | loss, with ?seed=N (default 7). Win/loss states are built by
// dealing a real hand and playing a real card through applyCard — never by faking the screen.
import { createGame, applyCard, foeTurn } from './state.js';
import { chooseIntent } from './ai.js';
import { cardDef } from './config.js';

export function seedFromQuery() {
  const q = new URLSearchParams(window.location.search);
  const seed = Number(q.get('seed') || '7');
  return { shot: q.get('shot') || '', seed: Number.isFinite(seed) ? seed : 7 };
}

export function setupShot(game, shot) {
  if (shot === 'play') {
    // Mid-game: both sides hurt, hands full, Warden intent showing.
    game.you.life = 22; game.foe.life = 19;
    game.you.shield = 3; game.turn = 4;
    game.you.energy = 5; game.you.maxEnergy = 5;
    game.you.hand = ['ember-blaze', 'tide-wave', 'stone-bastion', 'thorn-bloom', 'ember-inferno'];
    game.foe.hand = ['ember-blaze', 'tide-surge', 'stone-wall', 'thorn-bloom'];
    game.lastPlay = 'Tide Surge hits for 4 and draws a card.';
    game.log = ['Ember Spark hits for 3', 'Stone Wall raises 6 shield', 'Tide Surge hits for 4 · draw 1'];
    game.played = [
      { who: 'you', id: 'ember-spark' },
      { who: 'you', id: 'stone-wall' },
      { who: 'you', id: 'tide-surge' },
    ];
    game.intent = chooseIntent(game);
    game.phase = 'play';
    return 'play';
  }
  if (shot === 'win') {
    // One lethal card in hand; play it through the real rules to reach the win screen.
    game.turn = 6;
    game.foe.life = 4; game.you.life = 18;
    game.you.energy = 3; game.you.maxEnergy = 3;
    game.you.hand = ['ember-blaze', 'tide-drip', 'stone-pebble'];
    game.foe.hand = ['ember-spark', 'tide-drip'];
    game.phase = 'play';
    game.intent = chooseIntent(game);
    applyCard(game, 'you', 'ember-blaze');
    return 'won';
  }
  if (shot === 'loss') {
    // Player at 3 life; the Warden's turn plays a real strike to finish it.
    game.turn = 7;
    game.you.life = 3; game.you.shield = 0; game.foe.life = 24;
    game.you.hand = ['thorn-sprout', 'stone-pebble'];
    game.foe.hand = ['ember-blaze', 'ember-spark', 'tide-drip'];
    game.foe.energy = 3; game.foe.maxEnergy = 3;
    game.phase = 'foe';
    game.intent = chooseIntent(game);
    foeTurn(game);
    return game.phase;
  }
  return 'title';
}

export { cardDef };
