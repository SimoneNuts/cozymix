// Runs after `next build`. Marks the static export for GitHub Pages and records
// the base path it was built for, so `npm run preview` and the browser tests
// serve it at the same address it will have online.
import { existsSync, writeFileSync } from "node:fs";

if (!existsSync("out/index.html")) {
  console.error("postbuild: out/index.html is missing. Did `next build` export the site?");
  process.exit(1);
}
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
// GitHub Pages must not run Jekyll, which would hide the _next/ folder.
writeFileSync("out/.nojekyll", "");
writeFileSync("out/.base-path", base);
console.log(`postbuild: static site ready in out/ (base path "${base || "/"}")`);
