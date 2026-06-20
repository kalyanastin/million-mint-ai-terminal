import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/about", "/roadmap", "/token", "/whitepaper", "/founder"];
  return routes.map((route) => ({
    url: `https://millionmint.space${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1.0 : 0.8,
  }));
}

