export interface WallhavenItem {
  id: string;
  url: string; // URL da imagem em alta resolução (1080p, 2K, 4K)
  thumbnail: string; // URL da miniatura otimizada
  resolution: string;
  category: string;
  views: number;
  favorites: number;
}

export async function fetchWallhavenWallpapers(
  query: string = "anime",
  categoryFilter: "all" | "anime" | "manga" | "manhwa" | "cyberpunk" | "cute" = "all",
  sorting: "toplist" | "hot" | "views" | "random" = "toplist"
): Promise<WallhavenItem[]> {
  try {
    // Determina o termo de busca efetivo
    let effectiveQuery = query.trim();
    if (!effectiveQuery) {
      if (categoryFilter === "anime") effectiveQuery = "anime aesthetic";
      else if (categoryFilter === "manga") effectiveQuery = "manga monochrome";
      else if (categoryFilter === "manhwa") effectiveQuery = "solo leveling manhwa";
      else if (categoryFilter === "cyberpunk") effectiveQuery = "cyberpunk neon";
      else if (categoryFilter === "cute") effectiveQuery = "cute aesthetic";
      else effectiveQuery = "anime 4k";
    }

    // 100 = General, 010 = Anime, 001 = People
    let categories = "010"; // Padrão: Anime
    if (categoryFilter === "all") categories = "110";

    const url = `https://wallhaven.cc/api/v1/search?q=${encodeURIComponent(
      effectiveQuery
    )}&categories=${categories}&purity=100&sorting=${sorting}&page=1`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Wallhaven API status ${res.status}`);
    }

    const json = await res.json();
    if (!json.data || !Array.isArray(json.data)) {
      return [];
    }

    return json.data.map((item: any) => ({
      id: item.id,
      url: item.path,
      thumbnail: item.thumbs?.large || item.thumbs?.original || item.path,
      resolution: item.resolution || "4K UHD",
      category: item.category || "Anime",
      views: item.views || 0,
      favorites: item.favorites || 0,
    }));
  } catch (error) {
    console.warn("Falha ao buscar papéis de parede na API do Wallhaven:", error);
    return [];
  }
}
