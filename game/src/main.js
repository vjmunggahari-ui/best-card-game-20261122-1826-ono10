// Ember Sigil Duel — bootstrap: build the game, bind input, honour ?shot= for screenshots.
import { createGame } from './state.js';
import { bindInput } from './input.js';
import { render, showOverlay, confettiBurst } from './render.js';
import { seedFromQuery, setupShot } from './shots.js';

const { shot, seed } = seedFromQuery();
const game = createGame(seed);
let handlers;
const refresh = () => { window.__game = game; };
handlers = bindInput(game, refresh);
window.__game = game;

if (shot) {
  const reached = setupShot(game, shot);
  render(game, handlers);
  if (reached === 'won') { showOverlay('won', game); confettiBurst(); }
  else if (reached === 'lost') { showOverlay('lost', game); }
  else if (reached === 'play') { showOverlay(null, game); }
  else { showOverlay('title', game); }
} else {
  game.intent = null;
  render(game, handlers);
  showOverlay('title', game);
}
refresh();
