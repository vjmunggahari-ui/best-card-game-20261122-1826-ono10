// Opponent brain: the Warden picks its intent (shown to the player) and its cards.
import { planIntent } from './state.js';
import { cardDef } from './config.js';

export function chooseIntent(game) {
  return planIntent(game);
}

export function describeIntent(intent) {
  return intent ? intent.label : 'Warden is thinking…';
}

// A hint for the player: which of their cards best answers the shown intent.
export function suggestedCard(game) {
  const intent = game.intent;
  if (!intent) return null;
  const hand = game.you.hand;
  if (intent.kind === 'strike') {
    const guard = hand.find((id) => cardDef(id).kind === 'guard');
    if (guard) return guard;
  }
  if (intent.kind === 'mend') {
    const big = hand.filter((id) => cardDef(id).kind === 'strike')
      .sort((a, b) => cardDef(b).value - cardDef(a).value)[0];
    if (big) return big;
  }
  return null;
}
