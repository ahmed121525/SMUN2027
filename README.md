# SMUN 2027

The React/Vite website for Sangam Model United Nations 2027.

## Development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Environment

Set `VITE_REGISTRATION_FORM_URL` to the public Google Forms URL before enabling the homepage registration action.

## Project structure

- `src/app/` — application shell, routes and page composition
- `src/components/effects/` — WebGL, cursor and motion effects
- `src/components/ui/` — buttons and interface components
- `src/data/` — conference and delegate data
- `src/styles/` — global design system and page styling
- `public/images/people/` — secretariat portraits
- `public/images/committees/` — committee emblems
- `public/images/branding/` — logos and favicon
- `public/assets/` — static visual assets
- `public/fonts/` — local font files
- `legacy/2026-static/` — retained 2026 static-site source archive

## Notes

This repository contains the reorganised React/Vite application migrated from the `Final-Take-1` branch of `SMUN-2026`. A few oversized legacy source images exceeded the GitHub connector's binary transfer limit; the active site uses lightweight branded SVG stand-ins for those specific image slots. See `ASSET-MIGRATION.md` for the exact list.
