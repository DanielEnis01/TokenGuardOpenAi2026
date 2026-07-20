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

## Run the dashboard

```bash
cd dashboard
# Run npm install the first time you use this PC.
npm install
npm run dev
```

## Run the website

```bash
cd website
# Run npm install the first time you use this PC.
npm install
npm run dev
```

## Run the daemon

```bash
cd daemon
# Run npm install the first time you use this PC.
npm install
npm run start
```

## Build checks

Both apps currently build successfully with:

```bash
npm run build
```
