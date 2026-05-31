import prisma from "@/lib/prisma";

export default async function sitemap() {
  const baseUrl = "https://primeproperty.id";

  // Get all property IDs
  const properties = await prisma.property.findMany({
    where: { deletedAt: null },
    select: { id: true, updatedAt: true },
  });

  const propertyEntries = properties.map((p) => ({
    url: `${baseUrl}/properti/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/properti`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tentang-kami`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/kontak`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...propertyEntries,
  ];
}
