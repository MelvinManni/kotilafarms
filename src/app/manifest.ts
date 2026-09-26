// Web app manifest: install Kotila Farm to the phone's home screen
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kotila Farm",
    short_name: "Kotila",
    description: "Daily records, sales and money for Kotila Farms",
    start_url: "/today",
    display: "standalone",
    orientation: "portrait",
    background_color: "#eef2ea",
    theme_color: "#2f6410",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
