import { MetadataRoute } from "next";
import { caseStudies } from "@/data/portfolio";
import { getAllPosts } from "@/lib/blog";

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
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      priority: 0.7,
    },
    ...caseStudies.map((cs) => ({
      url: `${baseUrl}/case-study/${cs.slug}`,
      lastModified: new Date(),
      priority: 0.7 as const,
    })),
    ...getAllPosts().map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(),
      priority: 0.6 as const,
    })),
  ];
}
