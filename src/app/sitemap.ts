import { MetadataRoute } from "next";
import { caseStudies } from "@/data/portfolio";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://anilkhanna.dev";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/resume`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      priority: 0.8,
    },
    ...caseStudies.map((cs) => ({
      url: `${baseUrl}/case-study/${cs.slug}`,
      lastModified: new Date(),
      priority: 0.7 as const,
    })),
  ];
}
