# TokenGuard Frontends

This repo is now split into two separate web frontends based on the workflow spec:

Current layout:

- `website` - marketing/acquisition website flow
- `dashboard` - product dashboard flow (still web-based for now)

## Why the split

Per the product workflow:

1. Website drives awareness and download.
2. Dashboard is the product experience.
3. Desktop executable comes later (pivot path to Tauri/Electron).

Both apps are intentionally web frontends today to speed up iteration before desktop packaging.

## Run the website frontend

```bash
cd website
npm install
npm run dev
```

## Run the dashboard frontend

```bash
cd dashboard
npm install
npm run dev
```

## Build checks

Both apps currently build successfully with:

```bash
npm run build
```
