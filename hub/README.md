# EXIM Search — hub

A single static landing page ("EXIM Search") that links out to the three
independent tools in this repository:

- **Cargo Loading Planner** (`3dcargo-claude-cargo-loading-planner-gdm4j7/`)
- **Company Finder** (`nums/`)
- **ТН ВЭД Search** (`tnved-claude-trusting-cori-em9uws/`)

Each tool keeps its own back link to this hub in its header ("← EXIM
Search"), so navigation is two-way.

There is no build step and no framework — `index.html` + `config.js`, served
as static files. This is deliberate: the hub has nothing to do with any one
project's release cycle, so it can be deployed and updated independently of
all three.

## Configuring the links

Edit `config.js`:

```js
window.EXIM_LINKS = {
  cargo: "http://localhost:3001",
  nums: "http://localhost:3002",
  tnved: "http://localhost:3003",
};
```

Point each entry at wherever that project is actually reachable — a
subdomain in production (`https://cargo.exim.example.com`), a path behind a
reverse proxy, or a `host:port` for local testing.

`config.js` is loaded as a separate `<script>` tag on purpose: in Docker you
can bind-mount your own copy over it (`-v ./config.js:/usr/share/nginx/html/config.js:ro`)
to change the links without rebuilding the hub image.

## Running locally

```bash
cd hub
python3 -m http.server 8080   # or: docker build -t exim-hub . && docker run -p 8080:80 exim-hub
```

Open `http://localhost:8080`.

The default `config.js` assumes each project is running on the ports used
in the "run everything locally" section of the root README.

## Pointing each project's "back" link at this hub

Each project reads the hub's URL from a build-time/runtime setting so the
back link works wherever the hub actually lives:

| Project | Setting | Where |
|---|---|---|
| Cargo Loading Planner | `NEXT_PUBLIC_HUB_URL` | frontend build arg / env |
| Company Finder (nums) | `window.EXIM_HUB_URL` | `nums/frontend/hub-config.js` |
| ТН ВЭД Search | `VITE_HUB_URL` | frontend build arg / env |

All default to something reasonable for local testing; see the root README
for the full picture.
