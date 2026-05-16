# Iron Core

A mecha trainer career game. Tournament management, exploration, and faction politics.

## Setup

```bash
npm install
npm run dev
```

Open the URL Vite prints.

## Deploy

This repo deploys to GitHub Pages automatically on every push to `main` via `.github/workflows/deploy.yml`.

Live URL: https://fortisross14-pixel.github.io/iron-core/

## Architecture

The codebase is structured so that **visual redesign does not require rewriting game logic**. Three rules:

1. **Game logic lives in `src/game/`** — pure functions. No React. No styling. No DOM.
2. **Data tables live in `src/data/`** — typed records (models, factions, locations, story beats). Swap a model file, the rest of the game adapts.
3. **Visuals live in `src/screens/` + `src/components/` + `src/styles/theme.ts`** — to reskin the game, edit `theme.ts` (one file) for global tone, or rewrite individual screens. State and game logic are not touched.

### Directories

```
src/
  data/          One file per data category. All exported as typed const maps.
    factions.ts
    types.ts
    models.ts
    attacks.ts
    weapons.ts
    armors.ts
    disks.ts
    items.ts
    materials.ts
    locations.ts
    tournaments.ts
    story.ts
    names.ts
    ranks.ts
  game/          Pure game logic. No React imports.
    stats.ts       compute final stats from bot + equipment + mentors
    combat.ts      damage formula, status logic, AI choice
    progression.ts levels, ranks, retirement
    economy.ts     buy/sell pricing
    factions.ts    faction alignment math
  state/         Single useReducer-backed store. Serializable.
    types.ts
    initialState.ts
    reducer.ts
    actions.ts
    GameStore.tsx  React context wrapper + useGame() hook
  screens/       One file per screen. Each reads from useGame() and dispatches actions.
    IntroScreen.tsx
    StarterScreen.tsx
    NamingScreen.tsx
    FactionScreen.tsx
    HomeTownScreen.tsx     city map (list of buildings)
    LocationScreen.tsx     a single building
    JunkyardScreen.tsx     grinder
    CombatScreen.tsx
    PostFightScreen.tsx
    StableScreen.tsx
    AssignItemScreen.tsx   pick category → pick item → confirm
    MarketScreen.tsx
    CrewScreen.tsx
    TournamentsScreen.tsx
    BattleSetupScreen.tsx
  components/    Theme-able primitives. Style via theme tokens, not hardcoded.
    Shell.tsx
    Button.tsx
    Card.tsx
    Bar.tsx
    PartyBotMini.tsx
    StatBlock.tsx
    SectionHeader.tsx
    Toast.tsx
  styles/
    theme.ts       single source of truth for colors, fonts, spacing
    globals.css    reset and font imports
  hooks/
    useToast.ts
  main.tsx
  App.tsx          screen router (reads state.scene, renders the right screen)
```

### Adding/changing things

- **Add a new mecha:** edit `src/data/models.ts`. It shows up in the bestiary automatically.
- **Add a new location:** edit `src/data/locations.ts`. Then add a `screens/MyNewLocationScreen.tsx` and register it in `App.tsx`'s router.
- **Add a story beat:** edit `src/data/story.ts`. Story is a list of triggers + dialogues + state changes.
- **Reskin everything:** edit `src/styles/theme.ts`. Components read from the theme; no hardcoded colors in screens.
- **Change combat math:** edit `src/game/combat.ts`. UI does not need to change.
