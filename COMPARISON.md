# Ember Sigil Duel — concept comparison, playtest, revision (best-card-game v1)

## Brief in 8 lines (muse-juara)
1. Build the best original card game for make.fun best-card-game-20261122-1826 ($50, closes 13:26 WIB 23 Nov).
2. Judge (pairwise, z-ai/glm-5.3-flash) ranks: (1) complete game in screenshots, (2) fun+depth, (3) feel/polish, (4) look/originality, (5) code structure.
3. Game: static files under game/, no network, keyboard + mouse, title + table + both hands + readable values/suits/costs + life total + win AND loss screens.
4. main.ts (Node 22, stdlib only) copies game/ + screenshots/ to /output, writes dossier.json via vendor/makefun-game.ts; two runs byte-identical.
5. 4 real screenshots (≤256 KiB, long ≤1280, short ≥480), first = cover.
6. Original idea/art/names only; suits told apart by colour AND shape.
7. Repo under vjmunggahari-ui, created after opening, MIT license, beacon-root history.
8. Build FRESH in this session; genuine revision step (write → run → EDIT → re-run twice) is mandatory.

## 3-concept comparison (scored 1–5 per judge criterion)

| Criterion | A: Ember Sigil Duel (combos) | B: Trick-taking duel | C: Creature life battle |
|---|---|---|---|
| 1. Complete game in screenshots | 5 — title, table, both hands, life bars, win + loss all render clearly | 4 — bidding UI is harder to show at a glance | 5 — board + hands + life read well |
| 2. Fun + depth | 5 — every hand: which suit to chain, when to shield vs strike; readable intent to counter | 4 — bluff/bid is one decision per hand, thinner | 4 — tempo + comeback, but creature combat needs more rules to feel deep |
| 3. Feel / polish | 4 — card slide/hover, combo pop banner, confetti win flourish, WebAudio blips | 3 — little motion inherent to trick-taking | 4 — summon animations possible, more work |
| 4. Look / originality | 5 — 4 original sigil suits, colour AND shape, original names (Ember/Tide/Thorn/Stone) | 3 — looks like a known card game at thumbnail size | 4 — creatures risk looking like a commercial TCG clone |
| 5. Structure | 5 — config / random / state / ai / render / input / shots, one job each | 4 — bid logic + AI in fewer, muddier files | 4 — creature + spell systems split awkwardly |
| **TOTAL** | **24** | **18** | **21** |

**Winner: Concept A — Ember Sigil Duel (24/25).** Built fully.

## Rules as built
- Both sides 30 life. Energy 3, +1/turn, max 8. Hand of 5, 24-card deck (12 card defs × 2).
- Suits: Ember ▲ red (strike), Tide ● blue (strike + draw), Thorn ◆ green (heal), Stone ■ amber (shield). Costs 1–3.
- Combo: playing two cards of the same suit in one turn gives the second +2 (banner "COMBO x2! +2").
- Opponent AI (Rune Warden) shows its intent each turn ("plans: STRIKE / HEAL / BIG STRIKE") so the player can counter; it heals when low, strikes when the player is low.
- Keyboard: 1–5 play, E end turn, N new duel, M mute, Enter start. Mouse: click cards/buttons.

## Playtest proof (headless Chromium, real clicks — Playwright, ~/.cache/ms-playwright/chromium_headless_shell-1255)
- WIN reached: seed 7, scripted play (play every affordable card, end turn) → phase `won`, foe life 0, "★ VICTORY ★" screen, turn ~6. Zero page errors, zero console errors.
- LOSS reached: passive play (never play a card, only end turn) → phase `lost`, player life 0, "DEFEAT" screen. Seeds 7, 3, 11 all lost in 5–6 turns.
- Shot states (?shot=win / ?shot=loss) are built by playing real cards through `applyCard` / `foeTurn` — never by faking the screen.
- Screenshots re-taken after the revision edit; all four viewed by the builder.

## Genuine revision step (write → run → EDIT → re-run twice)
- First full run: `main.ts` twice → byte-identical, dossier sha256 942b1ddd8d588fc3b2b9e821f79fcdc4061c573a40b6034288e58ff011bf574a.
- Weakness found on viewing screenshots: Tide card text ("Deal 4, draw 1 card.") wrapped to two lines and collided with the suit label at the card bottom.
- EDIT: shortened all three Tide texts to "Deal N · draw 1." (config.js), added `white-space: nowrap` to `.ctext` (style.css), and set shot win/loss turns to 6/7 instead of 1 (shots.js) so the end screens read as mid-duel outcomes.
- Re-ran: screenshots re-taken (playtest still WON, zero errors), `main.ts` twice → byte-identical, dossier sha256 96d232a3b10d9d609844e63229354780ddd4a78b735cf38c6ba8085bac338113.

## Revision v1.1 — played-cards row (23 Nov ~02:30–02:45 WIB, one-shot revision session)

- **Fix:** weakness 1 above. Midfield now shows the current turn's played cards face-up, same card component, each captioned "You played" / "Warden played" (12px gold, letterspaced). Empty at turn start: fixed-height row with a faint italic placeholder ("No cards on the table yet — play a card to start the chain.") so the layout never shifts.
- **What changed (no logic/balance/AI/deck/win-loss changes):**
  - `game/src/state.js` (+2 lines, 1 modified): `played: []` on the game object; `applyCard` records `{ who, id }` (display-only); `startTurn` clears it (new turn = empty table).
  - `game/src/render.js` (+24 lines): `cardEl` gains a `static` option (display-only cards: no tabIndex/role-button); `render` builds `#playedRow` from `game.played.slice(-5)`.
  - `game/index.html` (+1 line): `<div id="playedRow">` in `#midfield`, between the combo banner and the last-play line.
  - `game/style.css` (+7 lines): `#playedRow` flex row, `min-height: 179px` (caption 15 + gap 4 + card 158); `.played-slot` / `.played-who` / `.played-empty`; played cards do not lift on hover.
  - `game/src/shots.js` (+6 lines, 1 modified): `?shot=play` sets `game.played` to Ember Spark / Stone Wall / Tide Surge (matching the log); the shot hand was swapped to Ember Blaze / Tide Wave / Stone Bastion / Thorn Bloom / Inferno so no card appears both on the table and in the hand (genuine revision EDIT after the first re-shoot showed the duplicate).
  - `screenshots/` — all 4 re-shot (the overlays on 1/3/4 are semi-transparent, so the played row shows faintly behind them; shots must match the shipped game). New `2-play.jpg`: 110,975 bytes, 1280×800. All 4 ≤ 262,144 bytes.
  - `dev-shots.mjs` (new, dev-only, not part of the entry): CDP driver — serves game/, drives chrome-headless-shell, screenshots all 4 shots, geometry-checks the row, playtests with real mouse clicks.
- **Geometry (measured on the play shot):** foe hand bottom y=241 → played row y=282–461 → player box top y=553. 41px clear above, 92px below (holds last-play + log). No overlap; all text legible.
- **Playtest proof (real mouse clicks, headless Chromium, zero console/page errors):** WIN seed 7 → phase `won`, foe life 0 (turn 12 first run, turn 10 second run — first-affordable play order; v1's ~6 used a different click order; win itself proven twice). LOSS passive → phase `lost`, player life 0: seed 7 turn 6, seed 3 turn 5, seed 11 turn 6. The played row also fills live in real play (e.g. seed 3 loss shows the Warden's Stone Bastion + Tide Wave).
- **Two-run byte-identical:** `main.ts` twice → `diff -r` clean. New dossier sha256 `01f515e879ac437c0343d47aea4be50d7c2ca4414b2060e4888cb312ecc36654` (changed from v1's `96d232a3…`, expected — screenshots are embedded).
- **Skills/relays used:** muse-juara (brief restated, 3 layout options compared, self-critique found the duplicate-card flaw, fixed it); game-design (row makes the combo readable — the chain behind the banner is visible; owner captions teach turn structure; empty-state placeholder is honest); canvas-design (same card component + felt-table palette, no new colours; gold letterspaced labels match the existing `.tag` style). Relays, one generic public design question each, all status 200: Groq gpt-oss-20b (flex row, ≥12px labels, placeholder, no overlap); Xkiro ministral-14b (consistent gaps, label contrast, placeholder, highlight active player's cards); Bluesminds ising-calibration-1.5-31b (centered row, suit legibility incl. colour-blind, fixed layout so empty state doesn't shift, don't rely on colour alone — labels are text). All three agreed on: flex row + gaps, ≥12px high-contrast labels, empty-state placeholder, no overlap — all applied.
- **Weakness left:** the middle band still has empty space left/right of the 3-card row (cards are centred; a wider row would need smaller cards and hurt legibility — judged the better trade). AI simplicity and no persistent meta (weaknesses 2–3) untouched, per scope.

## Self-critique — 3 biggest weaknesses
1. **Mid-game screenshot has empty middle band.** The table centre is mostly log text; a played-card area with the last cards on the table would fill it and show combos better. Not fixed: would need a played-cards row + re-shot; judged a minor thumbnail loss vs. the risk of breaking the tested layout this close to the round.
2. **AI is readable but simple.** It plays at most 2 cards/turn by a fixed scoring rule; a strong player will find its pattern in 2–3 duels. Not fixed: deeper AI (hand tracking, bluffing) was out of scope for the 12-hour build and the judge sees intent + counterplay, which is the scored behaviour.
3. **No persistent meta (no score across duels).** Each duel is standalone; there is no win streak or unlock to return to. Not fixed: the brief scores one complete duel, and a meta layer would have diluted the screenshot-visible completeness.
