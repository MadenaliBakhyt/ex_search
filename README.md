# EXIM Search

A monorepo holding three independent export/import tools, tied together by
a small landing page ("hub") that links between them.

```
hub/                                        EXIM Search landing page (static)
3dcargo-claude-cargo-loading-planner-gdm4j7/  Cargo Loading Planner (3D bin packing)
nums/                                        Company Finder (website + phone lookup)
tnved-claude-trusting-cori-em9uws/            ТН ВЭД Search (customs/HS codes)
```

Each project is a complete, self-contained app (own frontend, own backend,
own Dockerfile/docker-compose, own README) — see the "Updating projects
separately" section below for why that matters and how to keep it true.

## The hub

`hub/` is a single static HTML page with three cards linking to the tools
above. Each tool, in turn, has a "← EXIM Search" link in its header pointing
back at the hub. See `hub/README.md` for how the links are configured.

Design is consistent red-on-white across the hub and all three tools
(`#E31E24` red accent, white cards, light-gray background) — the tools
already used this palette; the hub matches it and the tnved app's back link
uses the same red.

## Running everything locally, side by side

The three tools default to overlapping ports (`3000`/`8000`) because each is
normally deployed on its own. To run all four together locally:

```bash
# Cargo Loading Planner
cd 3dcargo-claude-cargo-loading-planner-gdm4j7
BACKEND_PORT=8001 FRONTEND_PORT=3001 NEXT_PUBLIC_HUB_URL=http://localhost:8080 \
  docker compose up --build -d

# ТН ВЭД Search — pointed at an existing PostgreSQL with the schema/data
# already loaded (see tnved-claude-trusting-cori-em9uws/README.md for the
# host-side Postgres config this needs). Add --profile local-db instead
# of DATABASE_URL if you want a fresh, empty bundled database.
cd ../tnved-claude-trusting-cori-em9uws
BACKEND_PORT=8003 FRONTEND_PORT=3003 VITE_HUB_URL=http://localhost:8080 \
  DATABASE_URL=postgresql+asyncpg://<user>:<password>@host.docker.internal:5432/<db> \
  docker compose up --build -d

# Company Finder (no compose file — plain uvicorn)
cd ../nums
uvicorn backend.main:app --port 3002

# Hub
cd ../hub
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## Updating projects separately

These are three unrelated codebases (different stacks: Next.js, Vite/React,
plain HTML+FastAPI) that happen to live in one repository and share a
landing page. Treat them as separate products:

- **Change one, ship one.** A change inside
  `3dcargo-claude-cargo-loading-planner-gdm4j7/` should never require
  touching `nums/` or `tnved-claude-trusting-cori-em9uws/`, and vice versa.
  The only shared surface is the hub link (`NEXT_PUBLIC_HUB_URL` /
  `VITE_HUB_URL` / `hub-config.js`) and the red color palette — everything
  else (routes, API contracts, dependencies, DB schema) is private to its
  own project.
- **Deploy independently.** Each project already builds its own Docker
  image and has its own `docker-compose.yml` (nums doesn't need one — it's
  a single `uvicorn` process). In production, run each as its own
  service/container with its own release pipeline, so redeploying the cargo
  planner never touches the tnved database or vice versa. Point them at
  separate subdomains (`cargo.`, `tnved.` — nums doesn't need a subdomain if
  it's small enough to live at the root of its own host) and set each
  project's hub-URL setting to wherever `hub/` is deployed.
- **If you use CI, scope it by path.** Configure your pipeline so a commit
  touching only `nums/` only runs `nums/`'s tests/build/deploy job (path
  filters on the three project directories plus `hub/`). This keeps builds
  fast and keeps one project's breakage from blocking another's release.
- **Version them independently if useful.** Nothing stops you from tagging
  releases per project (`cargo-v1.2.0`, `tnved-v1.0.4`, ...) if their update
  cadences diverge — there's no shared version number to keep in sync.
- **Keep the hub itself boring.** It's static HTML with no build step and no
  dependency on any of the three apps' code, so updating it (new tool, new
  copy, a redesign) never requires touching or redeploying the tools, and
  updating a tool never requires touching the hub — only its `config.js` /
  `hub-config.js` entries change, and only when a URL actually moves.
- **Database and env boundaries stay separate too.** Only tnved has a
  database; it isn't shared with the other two. Each project keeps its own
  `.env`/secrets — there's no reason for cargo or nums to ever see tnved's
  `DATABASE_URL`.

In short: the repo is a convenient place to keep them, not a reason to
couple them. The hub is the only thing that "knows about" all three, and
even it only knows their URLs.
