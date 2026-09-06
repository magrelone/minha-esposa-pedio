import { describe, it, expect } from "vitest";
import { EmojiProvider } from "../src/core/providers/emojiProvider";
import { IconifyProvider } from "../src/core/providers/iconifyProvider";
import { ColorProvider } from "../src/core/providers/colorProvider";
import { getDiceBearAvatarUrl } from "../src/core/providers/dicebearProvider";

describe("Unified Asset Hub & Providers", () => {
  describe("EmojiProvider", () => {
    it("should convert unicode emoji to codepoint hex correctly", () => {
      // Heart ❤️ (u+2764)
      const hex = EmojiProvider.toCodePoints("❤️");
      expect(hex).toContain("2764");
    });

    it("should generate valid SVG URLs for Twemoji, Noto, and OpenMoji", () => {
      const twemojiUrl = EmojiProvider.getSvgUrl("❤️", "twemoji");
      const notoUrl = EmojiProvider.getSvgUrl("❤️", "noto");
      const openmojiUrl = EmojiProvider.getSvgUrl("❤️", "openmoji");

      expect(twemojiUrl).toContain("cdn.jsdelivr.net");
      expect(twemojiUrl).toContain(".svg");

      expect(notoUrl).toContain("noto-emoji");
      expect(notoUrl).toContain(".svg");

      expect(openmojiUrl).toContain("openmoji");
      expect(openmojiUrl).toContain(".svg");

      const systemUrl = EmojiProvider.getSvgUrl("❤️", "system");
      expect(systemUrl).toBeNull();
    });
  });

  describe("IconifyProvider", () => {
    it("should provide reliable offline fallback icons for search terms", () => {
      const results = IconifyProvider.getOfflineFallback("heart");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].icon).toContain("heart");
      expect(results[0].svgUrl).toContain(".svg");
    });
  });

  describe("ColorProvider", () => {
    it("should find cute color details by hex code", () => {
      const pink = ColorProvider.findByHex("#ff69b4");
      expect(pink).toBeDefined();
      expect(pink?.name).toBe("Hot Pink");
      expect(pink?.emoji).toBe("💗");
    });

    it("should return all curated categories", () => {
      const categories = ColorProvider.getCategories();
      expect(categories).toContain("Doces & Mimos");
      expect(categories).toContain("Florais & Pastel");
    });
  });

  describe("DiceBearProvider", () => {
    it("should generate deterministic SVG avatar URLs with seed and background", () => {
      const url = getDiceBearAvatarUrl("lorelei", "Princesa", "ffd5dc,ffdfba");
      expect(url).toContain("https://api.dicebear.com/9.x/lorelei/svg");
      expect(url).toContain("seed=Princesa");
      expect(url).toContain("backgroundColor=ffd5dc%2Cffdfba");
    });
  });
});
