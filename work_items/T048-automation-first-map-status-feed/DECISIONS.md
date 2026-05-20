# T048 — Decisions

## D1 — Routes

- `/tracker/` — primary automation-first hub
- `/updates/` — full feed
- `/countries/` — status list (jurisdiction profiles remain at `/jurisdictions/`)

## D2 — Map

CSS/SVG region skeleton only; no D3/TopoJSON (GPL-safe, zero new deps).

## D3 — Data

Manual seed YAML only; `automation_method: manual_seed`; all evidence gates `false`.

## D4 — T049 recommendation

Source adapter pipeline → populate `regulatory_update` from watchers (not manual seed).
