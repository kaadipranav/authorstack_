import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AuthorStack",
    short_name: "AuthorStack",
    description:
      "The all-in-one dashboard for indie authors. Track sales, analyze revenue, and grow your book business.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF9F6",
    theme_color: "#722F37",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
