// Ember Sigil Duel — card catalogue: four suits, told apart by colour AND shape.
// Suits: ember ▲ red, tide ● blue, thorn ◆ green, stone ■ amber.
export const SUITS = {
  ember: { name: 'Ember', glyph: '▲', colour: '#c0392b' },
  tide: { name: 'Tide', glyph: '●', colour: '#2471c8' },
  thorn: { name: 'Thorn', glyph: '◆', colour: '#1e8449' },
  stone: { name: 'Stone', glyph: '■', colour: '#b7791f' },
};

export const MAX_LIFE = 30;
export const MAX_ENERGY = 8;
export const HAND_SIZE = 5;

// kind: strike deals damage, guard gains shield, mend heals, spark deals a little and draws.
export const CARD_DEFS = [
  { id: 'ember-blaze', name: 'Ember Blaze', suit: 'ember', cost: 2, kind: 'strike', value: 6, text: 'Deal 6 damage.' },
  { id: 'ember-spark', name: 'Ember Spark', suit: 'ember', cost: 1, kind: 'strike', value: 3, text: 'Deal 3 damage.' },
  { id: 'ember-inferno', name: 'Inferno', suit: 'ember', cost: 3, kind: 'strike', value: 9, text: 'Deal 9 damage.' },
  { id: 'tide-surge', name: 'Tide Surge', suit: 'tide', cost: 2, kind: 'spark', value: 4, text: 'Deal 4 · draw 1.' },
  { id: 'tide-drip', name: 'Tide Drip', suit: 'tide', cost: 1, kind: 'spark', value: 2, text: 'Deal 2 · draw 1.' },
  { id: 'tide-wave', name: 'Tide Wave', suit: 'tide', cost: 3, kind: 'spark', value: 6, text: 'Deal 6 · draw 1.' },
  { id: 'thorn-bloom', name: 'Thorn Bloom', suit: 'thorn', cost: 2, kind: 'mend', value: 6, text: 'Heal 6 life.' },
  { id: 'thorn-sprout', name: 'Thorn Sprout', suit: 'thorn', cost: 1, kind: 'mend', value: 3, text: 'Heal 3 life.' },
  { id: 'thorn-grove', name: 'Thorn Grove', suit: 'thorn', cost: 3, kind: 'mend', value: 9, text: 'Heal 9 life.' },
  { id: 'stone-wall', name: 'Stone Wall', suit: 'stone', cost: 2, kind: 'guard', value: 6, text: 'Gain 6 shield.' },
  { id: 'stone-pebble', name: 'Stone Pebble', suit: 'stone', cost: 1, kind: 'guard', value: 3, text: 'Gain 3 shield.' },
  { id: 'stone-bastion', name: 'Stone Bastion', suit: 'stone', cost: 3, kind: 'guard', value: 9, text: 'Gain 9 shield.' },
];

export function deckList() {
  // Two copies of every card: a 24-card deck, shuffled per game.
  const deck = [];
  for (const def of CARD_DEFS) deck.push(def.id, def.id);
  return deck;
}

export function cardDef(id) {
  return CARD_DEFS.find((d) => d.id === id);
}
