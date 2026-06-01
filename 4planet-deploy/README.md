# 4PLANET

A planetary operating system — built in Oslo, scaled for Earth.

**v1.3 · Master prototype** · 17 sub-world atmospheric systems · 4 worlds · planetary culture system.

Founded by Odin Oddekalv (P4NTHER collective). Carrying forward the legacy of Kurt Oddekalv.

## Stack

- React 18 + Vite
- Tailwind CSS 3
- Framer Motion
- Single-file architecture (`src/App.jsx`)

## Local development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## Production build

```bash
npm run build
npm run preview
```

Output in `dist/`.

## Deploy — Cloudflare Pages

1. Push this repo to GitHub
2. Cloudflare Dashboard → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
3. Pick the repo. Use:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version:** `20`
4. Deploy. Future pushes to `main` auto-deploy.

## Structure

```
src/
  App.jsx       — single-file v10 master component
  main.jsx      — React entry
  index.css     — Tailwind directives
index.html
tailwind.config.js
vite.config.js
postcss.config.js
package.json
```

## Versions

- **v1.3 (v10)** — current. 17 unique per-project sub-world atmospheres. Full project narratives (problem · why it matters · approach · facts). New master structure with magazine layer, partner co-branding, investor channel.
- v1.2 (v9), v1.1a (v8a), v1.0 (v7), v0.9 (v6), v0.8 (v5)... — preserved separately, not in this deploy.

---

© 4PLANET / P4NTHER collective · Oslo · in development
