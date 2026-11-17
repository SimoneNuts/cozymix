// A tiny static server for the exported site in out/, mounted at the same base
// path it was built for (as GitHub Pages would serve it). No dependencies.
//   node scripts/serve.mjs [port]
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync, createReadStream } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve("out");
if (!existsSync(join(root, "index.html"))) {
  console.error("Nothing to serve: run `npm run build` first.");
  process.exit(1);
}
const base = existsSync(join(root, ".base-path"))
  ? readFileSync(join(root, ".base-path"), "utf8").trim()
  : "";
const port = Number(process.argv[2] ?? process.env.PORT ?? 3000);

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".txt": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
};

function fileFor(pathname) {
  const relative = normalize(decodeURIComponent(pathname)).replace(/^[/\\]+/, "");
  const target = resolve(root, relative);
  if (!target.startsWith(root)) return undefined;
  for (const candidate of [target, join(target, "index.html"), `${target}.html`]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return undefined;
}

createServer((request, response) => {
  const { pathname } = new URL(request.url ?? "/", "http://localhost");
  if (base && pathname === base) {
    response.writeHead(301, { Location: `${base}/` }).end();
    return;
  }
  const inside = !base || pathname.startsWith(`${base}/`);
  const file = inside ? fileFor(pathname.slice(base.length)) : undefined;
  if (!file) {
    response.writeHead(404, { "Content-Type": types[".html"] });
    createReadStream(join(root, "404.html")).pipe(response);
    return;
  }
  response.writeHead(200, {
    "Content-Type": types[extname(file)] ?? "application/octet-stream",
    "Cache-Control": "no-cache",
  });
  createReadStream(file).pipe(response);
}).listen(port, "127.0.0.1", () => {
  console.log(`CozyMix preview: http://127.0.0.1:${port}${base}/`);
});
