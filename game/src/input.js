// Input: mouse clicks on cards and buttons, keyboard 1–5 / E / N / Enter / M.
import { applyCard, endPlayerTurn, foeTurn, startTurn } from './state.js';
import { chooseIntent } from './ai.js';
import { render, showOverlay, confettiBurst } from './render.js';

let audio = null;
function blip(game, kind) {
  if (game.muted) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.frequency.value = kind === 'combo' ? 880 : kind === 'win' ? 660 : 440;
    gain.gain.value = 0.06;
    osc.connect(gain); gain.connect(audio.destination);
    osc.start(); osc.stop(audio.currentTime + 0.12);
  } catch { /* sound is decoration; silence is fine */ }
}

export function bindInput(game, refresh) {
  const handlers = {
    play(i) {
      if (game.phase !== 'play') return;
      const id = game.you.hand[i];
      if (!id) return;
      const res = applyCard(game, 'you', id);
      if (!res.ok) { game.lastPlay = `Cannot play that card: ${res.why}.`; render(game, handlers); return; }
      blip(game, res.bonus > 0 ? 'combo' : 'play');
      if (game.phase === 'won') { render(game, handlers); showOverlay('won', game); confettiBurst(); blip(game, 'win'); refresh(); return; }
      render(game, handlers); refresh();
    },
    endTurn() {
      if (game.phase !== 'play') return;
      endPlayerTurn(game);
      render(game, handlers);
      window.setTimeout(() => {
        foeTurn(game);
        if (game.phase === 'lost') { render(game, handlers); showOverlay('lost', game); refresh(); return; }
        game.intent = chooseIntent(game);
        render(game, handlers); refresh();
      }, 650);
    },
  };

  document.getElementById('endTurnBtn').addEventListener('click', handlers.endTurn);
  document.getElementById('newGameBtn').addEventListener('click', () => window.location.reload());
  document.getElementById('startBtn').addEventListener('click', () => {
    if (game.phase === 'title') {
      game.phase = 'play';
      game.intent = chooseIntent(game);
      showOverlay(null, game);
      render(game, handlers);
    } else {
      window.location.reload();
    }
  });
  document.getElementById('muteBtn').addEventListener('click', (e) => {
    game.muted = !game.muted;
    e.target.textContent = game.muted ? '♪ off' : '♪ on';
  });
  document.addEventListener('keydown', (e) => {
    if (e.key >= '1' && e.key <= '5') handlers.play(Number(e.key) - 1);
    else if (e.key === 'e' || e.key === 'E') handlers.endTurn();
    else if (e.key === 'n' || e.key === 'N') window.location.reload();
    else if (e.key === 'm' || e.key === 'M') document.getElementById('muteBtn').click();
    else if (e.key === 'Enter') document.getElementById('startBtn').click();
  });
  return handlers;
}

export { startTurn };
