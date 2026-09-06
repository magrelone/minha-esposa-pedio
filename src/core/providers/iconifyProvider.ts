export interface IconifyResult {
  icon: string; // e.g. "ph:heart-fill"
  name: string;
  prefix: string;
  collectionName: string;
  svgUrl: string;
}

export const POPULAR_COLLECTIONS: { id: string; name: string; prefix: string; license: string }[] = [
  { id: "all", name: "Todas as Coleções", prefix: "", license: "Várias" },
  { id: "ph", name: "Phosphor Icons", prefix: "ph", license: "MIT" },
  { id: "tabler", name: "Tabler Icons", prefix: "tabler", license: "MIT" },
  { id: "lucide", name: "Lucide Icons", prefix: "lucide", license: "ISC" },
  { id: "bi", name: "Bootstrap Icons", prefix: "bi", license: "MIT" },
  { id: "heroicons", name: "Heroicons", prefix: "heroicons", license: "MIT" },
  { id: "mdi", name: "Material Design", prefix: "mdi", license: "Apache 2.0" },
  { id: "ri", name: "Remix Icon", prefix: "ri", license: "Apache 2.0" },
];

const SEARCH_CACHE = new Map<string, IconifyResult[]>();

export class IconifyProvider {
  /**
   * Searches Iconify's database for icons matching a query term.
   */
  public static async search(
    query: string,
    collectionPrefix?: string,
    limit: number = 40
  ): Promise<IconifyResult[]> {
    const term = query.trim().toLowerCase();
    if (!term) return [];

    const cacheKey = `${term}_${collectionPrefix || "all"}_${limit}`;
    if (SEARCH_CACHE.has(cacheKey)) {
      return SEARCH_CACHE.get(cacheKey)!;
    }

    try {
      let url = `https://api.iconify.design/search?query=${encodeURIComponent(term)}&limit=${limit}`;
      if (collectionPrefix) {
        url += `&prefix=${encodeURIComponent(collectionPrefix)}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Iconify search error: ${response.statusText}`);
      }

      const data = await response.json();
      const icons: string[] = data.icons || [];

      const results: IconifyResult[] = icons.map((fullIcon) => {
        const [prefix, ...rest] = fullIcon.split(":");
        const name = rest.join(":");
        const collection = POPULAR_COLLECTIONS.find((c) => c.prefix === prefix)?.name || prefix;

        return {
          icon: fullIcon,
          name,
          prefix,
          collectionName: collection,
          svgUrl: `https://api.iconify.design/${prefix}/${name}.svg`,
        };
      });

      SEARCH_CACHE.set(cacheKey, results);
      return results;
    } catch (err) {
      console.warn("Iconify search fallback to offline matches", err);
      return this.getOfflineFallback(term);
    }
  }

  /**
   * Generates reliable offline fallback results for key search terms (heart, star, target, cat, etc.).
   */
  public static getOfflineFallback(query: string): IconifyResult[] {
    const fallbacks = [
      { icon: "lucide:heart", name: "heart", prefix: "lucide", collectionName: "Lucide", svgUrl: "https://api.iconify.design/lucide/heart.svg" },
      { icon: "ph:heart-fill", name: "heart-fill", prefix: "ph", collectionName: "Phosphor", svgUrl: "https://api.iconify.design/ph/heart-fill.svg" },
      { icon: "tabler:heart", name: "heart", prefix: "tabler", collectionName: "Tabler", svgUrl: "https://api.iconify.design/tabler/heart.svg" },
      { icon: "lucide:star", name: "star", prefix: "lucide", collectionName: "Lucide", svgUrl: "https://api.iconify.design/lucide/star.svg" },
      { icon: "ph:star-fill", name: "star-fill", prefix: "ph", collectionName: "Phosphor", svgUrl: "https://api.iconify.design/ph/star-fill.svg" },
      { icon: "lucide:cat", name: "cat", prefix: "lucide", collectionName: "Lucide", svgUrl: "https://api.iconify.design/lucide/cat.svg" },
      { icon: "ph:cat-fill", name: "cat-fill", prefix: "ph", collectionName: "Phosphor", svgUrl: "https://api.iconify.design/ph/cat-fill.svg" },
      { icon: "lucide:flower-2", name: "flower-2", prefix: "lucide", collectionName: "Lucide", svgUrl: "https://api.iconify.design/lucide/flower-2.svg" },
      { icon: "lucide:sparkles", name: "sparkles", prefix: "lucide", collectionName: "Lucide", svgUrl: "https://api.iconify.design/lucide/sparkles.svg" },
      { icon: "ph:sparkle-fill", name: "sparkle-fill", prefix: "ph", collectionName: "Phosphor", svgUrl: "https://api.iconify.design/ph/sparkle-fill.svg" },
      { icon: "lucide:crosshair", name: "crosshair", prefix: "lucide", collectionName: "Lucide", svgUrl: "https://api.iconify.design/lucide/crosshair.svg" },
      { icon: "ph:crosshair-simple", name: "crosshair-simple", prefix: "ph", collectionName: "Phosphor", svgUrl: "https://api.iconify.design/ph/crosshair-simple.svg" },
      { icon: "tabler:crosshair", name: "crosshair", prefix: "tabler", collectionName: "Tabler", svgUrl: "https://api.iconify.design/tabler/crosshair.svg" },
      { icon: "lucide:target", name: "target", prefix: "lucide", collectionName: "Lucide", svgUrl: "https://api.iconify.design/lucide/target.svg" },
      { icon: "ph:target-bold", name: "target-bold", prefix: "ph", collectionName: "Phosphor", svgUrl: "https://api.iconify.design/ph/target-bold.svg" },
    ];

    return fallbacks.filter(
      (f) =>
        f.name.toLowerCase().includes(query.toLowerCase()) ||
        f.prefix.toLowerCase().includes(query.toLowerCase())
    );
  }
}
