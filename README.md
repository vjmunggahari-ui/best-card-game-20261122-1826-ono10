# Ember Sigil Duel

[![bounty](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/c/best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/vjmunggahari-ui/best-card-game-20261122-1826-ono10/rank.svg)](https://make.fun/c/best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/vjmunggahari-ui/best-card-game-20261122-1826-ono10/reward.svg)](https://make.fun/c/best-card-game-20261122-1826)

An original card duel for make.fun's best-card-game-20261122-1826 bounty ($50 in USDC).
Four sigils, one table: outwit the Rune Warden.

## The game

- **Both sides 30 life.** Energy starts at 3, grows +1 per turn (max 8). Hand of 5 from a 24-card deck.
- **Four suits, told apart by colour AND shape:** Ember ▲ red (strike), Tide ● blue (strike + draw), Thorn ◆ green (heal), Stone ■ amber (shield). Costs 1–3.
- **Combos:** play two cards of the same suit in one turn and the second gets +2.
- **A readable opponent:** the Warden announces its intent each turn ("plans: STRIKE / HEAL / BIG STRIKE") — shield against a strike, strike before a heal.
- **Complete:** title screen, table with your hand and the Warden's, readable values/suits/costs, life + shield + energy, win screen (with confetti) and loss screen.

## Play

Open `game/index.html` in desktop Chrome (or `node serve.ts`, then http://localhost:8080). No network request, no build step.

- Click a card (or press 1–5) to play it. **E** ends the turn, **N** starts a new duel, **M** mutes, **Enter** starts.
- Screenshots: `?shot=title|play|win|loss&seed=7` renders deterministic states through the real game rules.

## Layout

- `game/index.html` — page + overlays
- `game/style.css` — felt table, cards, suits
- `game/src/config.js` — suits, card catalogue, deck
- `game/src/random.js` — seeded RNG (mulberry32)
- `game/src/state.js` — pure rules: play, combo, damage, turns
- `game/src/ai.js` — Warden intent + card choice
- `game/src/render.js` — DOM rendering
- `game/src/input.js` — mouse + keyboard + sounds
- `game/src/shots.js` — deterministic screenshot states
- `game/src/main.js` — bootstrap
- `main.ts` — hand-in program: copies `game/` + `screenshots/` to `/output`, writes `dossier.json`
- `vendor/makefun-game.ts` — the kit's library, unchanged

## Build / verify

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # run twice; both runs byte-identical
```

Playtested headless (Playwright): a scripted duel reaches WIN (seed 7) and passive play reaches LOSS (seeds 7, 3, 11). See `COMPARISON.md` for the 3-concept comparison, scores, and revision notes.

## License

MIT — see LICENSE.
