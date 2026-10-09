# lumiverse.hr v3

The Next.js rewrite of the LumiVerse site (branch `feat/design-v3`). The legacy
static site at the repo root keeps serving production until cutover.

## Run

```bash
npm install
npm run dev            # http://localhost:3000
npm run build          # standalone server in .next/standalone
```

Docker: `docker build -t lumiverse-site .` then `docker run -p 3000:3000 lumiverse-site`.
`docker-compose.dev.yml` runs the dev server in a container. Production compose for
Dokploy: `../deploy/dokploy/docker-compose.v3.yml` (not wired yet).

If `npm ci` fails in Docker with "Missing: @emnapi/... from lock file", the
lockfile was written on macOS without Linux optional packages: delete
`node_modules` and `package-lock.json`, run `npm install`, commit the lockfile.

## Where things live

| Path | What |
|---|---|
| `src/app/[lang]/` | Every page; `en` is served at `/`, `hr` at `/hr` (see `src/proxy.ts`) |
| `src/i18n/dictionaries/{en,hr}.json` | UI and homepage copy |
| `content/cases/<slug>.json` | Case studies, `{ en, hr }`, shaped by `src/content/case-schema.ts` |
| `content/blog/en/*.md` | Blog posts (front matter + Markdown) |
| `src/content/packages.mjs` | Every package and price (pricing page, landing pages, contact form) |
| `src/content/work.ts` | Homepage flagships and work index |
| `src/components/stage/` | The real-time 3D hero (React Three Fiber) |
| `models-src/maquette.blend` | Blender source of `public/models/maquette.glb` |
| `public/` | Static files, including the deck, reel and brand guide served as-is |

## Contact form

The form posts to `/api/contact`, which `next.config.ts` rewrites to the existing
contact service (`../contact/server.mjs`). Set `CONTACT_API_URL` to reach it.
