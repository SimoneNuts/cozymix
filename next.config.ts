import type { NextConfig } from "next";

// "/cozymix" for https://<user>.github.io/cozymix/, empty at the root of a domain.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
if (basePath && !/^\/[\w.-]+(\/[\w.-]+)*$/.test(basePath)) {
  throw new Error(`NEXT_PUBLIC_BASE_PATH must look like "/cozymix", got "${basePath}"`);
}

const nextConfig: NextConfig = {
  // A fully static site in out/: no server needed, ready for GitHub Pages.
  output: "export",
  basePath: basePath || undefined,
};

export default nextConfig;
