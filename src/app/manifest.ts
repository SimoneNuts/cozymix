import type { MetadataRoute } from "next";
import { asset } from "@/lib/base";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: asset("/"),
    name: "CozyMix",
    short_name: "CozyMix",
    description: "Mix rain, fire, a café, a night train and gentle noise into your own calm.",
    start_url: asset("/"),
    scope: asset("/"),
    display: "standalone",
    orientation: "portrait",
    background_color: "#14111f",
    theme_color: "#14111f",
    icons: [
      { src: asset("/icons/icon-192.png"), sizes: "192x192", type: "image/png", purpose: "any" },
      { src: asset("/icons/icon-512.png"), sizes: "512x512", type: "image/png", purpose: "any" },
      { src: asset("/icons/maskable-512.png"), sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
