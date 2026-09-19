import { MetadataRoute } from "next";
import { PRIMARY_SERVICES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const staticRoutes = [
    "",
    "/about",
    "/services",
    "/dentists",
    "/dentists/dr-silver",
    "/request-appointment",
    "/contact",
    "/faq",
    "/blog",
    "/privacy",
    "/terms",
    "/cancellation",
    "/cookies",
    "/emergency",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  const serviceRoutes = PRIMARY_SERVICES.map((s) => ({
    url: `${baseUrl}/services/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  let blogRoutes: any[] = [];
  try {
    const posts = await prisma.blogPost.findMany({ select: { slug: true, updatedAt: true } });
    blogRoutes = posts.map((p) => ({
      url: `${baseUrl}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch {
    // fallback
  }

  return [...staticRoutes, ...serviceRoutes, ...blogRoutes];
}
