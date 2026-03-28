import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/app/", "/sign-in/", "/sign-up/"],
      },
    ],
    sitemap: "https://hustletracker.tvrapp.app/sitemap.xml",
  };
}
