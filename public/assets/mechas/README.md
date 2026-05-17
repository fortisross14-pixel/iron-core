# Mecha Image Assets

Drop image files here and they'll be picked up automatically by the
`MechaMini` and `MechaFull` components. No code changes needed.

## Naming convention

For each mecha you want to add art for, two files:

- `<modelId>_mini.jpeg` — small round portrait (used in combat HUD, rosters,
  collection list rows). Aspect ratio: 1:1 square. Recommended size: 256×256.
- `<modelId>_full.jpeg` — full trading-card art (used in profile detail,
  capture screen). Aspect ratio: 3:4 portrait. Recommended size: 480×640.

`<modelId>` is the stable ID used in /src/data/models.ts — e.g. `voltrunner`,
`hearthling`, `cinderboar`, `alpha_omega`.

## Examples

```
voltrunner_mini.jpeg
voltrunner_full.jpeg
hearthling_mini.jpeg
hearthling_full.jpeg
alpha_omega_mini.jpeg
alpha_omega_full.jpeg
```

## Fallback

If a file is missing, the component renders a styled placeholder
(type-colored letter on a dark background). Missing assets do NOT break the
game — they just look bare.

## Format

`.jpeg` is the standard extension expected by the components. If you have PNGs,
you can save them as JPEG or rename them — they'll still load.

## Full list of model IDs

See /src/data/models.ts. There are 99 total:
- 3 starters: hearthling, tideling, sprouting
- 12 fire, 12 water, 12 lightning, 12 ice, 12 earth, 12 bio, 12 steel, 12 mental
- 3 god-types: alpha_omega, ironmind, worldfire
