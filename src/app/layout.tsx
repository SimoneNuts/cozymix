import type { Metadata, Viewport } from "next";
import { asset } from "@/lib/base";
import "@/styles/tokens.css";
import "@/styles/base.css";
import "@/styles/app.css";

export const metadata: Metadata = {
  title: "CozyMix",
  description:
    "Mix rain, fire, a café, a night train and gentle noise into your own calm. Works offline, keeps everything on your device.",
  applicationName: "CozyMix",
  appleWebApp: { capable: true, title: "CozyMix", statusBarStyle: "black-translucent" },
  icons: {
    icon: [{ url: asset("/icons/icon-192.png"), sizes: "192x192", type: "image/png" }],
    apple: asset("/icons/apple-touch.png"),
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#14111f" },
    { media: "(prefers-color-scheme: light)", color: "#f7f1e8" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
