# Dungeons & Degenerates (Web)

Humorous fantasy party card game — absurd **Scenario** cards, ridiculous **Action** responses, rotating **Judge**, anonymous reveals, and **Loot Tokens**.

Tone: Cards Against Humanity meets Jackbox with light RPG flavor.

## Play

```bash
cd web
npm install
npm run dev
```

Open the URL Vite prints (default http://localhost:5173).

## How to play

1. Each player gets a **Role** (Barbarian / Rogue / Bard) and **7 Action** cards.
2. A **Scenario** is revealed.
3. The **Judge** rotates each round and does not play. The other two submit face-down Actions.
4. Cards flip one at a time on **anonymous slots** — no names until someone wins.
5. The Judge picks the winning Action by content only.
6. Winner takes **1 Loot Token**. First to **5** wins the match.

Vs 2 local AI opponents (Sir Regrettable & Lady Chaos).

## Stack

Vite + React + TypeScript. Card art from the Godot prototype (`assets/cards`), resized for web under `public/cards/`.
