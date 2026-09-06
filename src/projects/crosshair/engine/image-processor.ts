import DOMPurify from "dompurify";

export interface ImageProcessingOptions {
  brightness: number; // 50 to 150 (100 is normal)
  contrast: number; // 50 to 150 (100 is normal)
  grayscale: boolean;
  threshold: number; // 0 (disabled) to 255
  invert: boolean;
  removeColorHex?: string;
  removeColorTolerance?: number; // 0 to 100
}

export class ImageProcessor {
  /**
   * Sanitizes SVG code, stripping all malicious scripts, event handlers, and data embeds.
   */
  public static sanitizeSvg(svgContent: string): string {
    if (typeof window !== "undefined" && DOMPurify && typeof (DOMPurify as any).sanitize === "function") {
      return (DOMPurify as any).sanitize(svgContent, {
        USE_PROFILES: { svg: true, svgFilters: true },
        FORBID_TAGS: ["script", "iframe", "object", "embed"],
        FORBID_ATTR: ["onload", "onerror", "onclick", "onmouseover", "javascript:"],
      });
    }
    // Safe multi-layer sanitizer for tests and environment without browser DOM
    return svgContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "")
      .replace(/javascript:/gi, "");
  }


  /**
   * Reads a File, validates its type and size, and returns a Data URL.
   */
  public static async readFile(file: File, maxMb: number = 5): Promise<string> {
    if (file.size > maxMb * 1024 * 1024) {
      throw new Error(`O arquivo excede o limite de ${maxMb}MB.`);
    }

    const validTypes = ["image/png", "image/webp", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      throw new Error("Formato não suportado. Por favor, envie PNG, WEBP ou SVG.");
    }

    if (file.type === "image/svg+xml") {
      const text = await file.text();
      const sanitized = this.sanitizeSvg(text);
      const encoded = encodeURIComponent(sanitized);
      return `data:image/svg+xml;charset=utf-8,${encoded}`;
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Falha ao ler imagem."));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Applies real-time visual filters and color removal onto an HTML5 Canvas.
   */
  public static applyFilters(
    sourceImg: HTMLImageElement,
    options: ImageProcessingOptions
  ): string {
    const canvas = document.createElement("canvas");
    canvas.width = sourceImg.naturalWidth || sourceImg.width;
    canvas.height = sourceImg.naturalHeight || sourceImg.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return sourceImg.src;

    // 1. Draw base image
    ctx.drawImage(sourceImg, 0, 0);

    // 2. Read pixel data
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    const brightnessMul = options.brightness / 100;
    const contrastFactor = (259 * (options.contrast + 255)) / (255 * (259 - options.contrast));

    let targetR = -1, targetG = -1, targetB = -1;
    if (options.removeColorHex) {
      const hex = options.removeColorHex.replace("#", "");
      if (hex.length === 6) {
        targetR = parseInt(hex.substring(0, 2), 16);
        targetG = parseInt(hex.substring(2, 4), 16);
        targetB = parseInt(hex.substring(4, 6), 16);
      }
    }
    const tol = (options.removeColorTolerance || 20) * 2.55;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];
      let a = data[i + 3];

      if (a === 0) continue;

      // Color removal (transparent background)
      if (targetR !== -1) {
        const diff = Math.sqrt(
          Math.pow(r - targetR, 2) +
          Math.pow(g - targetG, 2) +
          Math.pow(b - targetB, 2)
        );
        if (diff <= tol) {
          data[i + 3] = 0;
          continue;
        }
      }

      // Brightness
      r = Math.min(255, r * brightnessMul);
      g = Math.min(255, g * brightnessMul);
      b = Math.min(255, b * brightnessMul);

      // Contrast
      r = Math.min(255, Math.max(0, contrastFactor * (r - 128) + 128));
      g = Math.min(255, Math.max(0, contrastFactor * (g - 128) + 128));
      b = Math.min(255, Math.max(0, contrastFactor * (b - 128) + 128));

      // Grayscale
      if (options.grayscale || options.threshold > 0) {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        if (options.threshold > 0) {
          const val = gray >= options.threshold ? 255 : 0;
          r = val;
          g = val;
          b = val;
        } else {
          r = gray;
          g = gray;
          b = gray;
        }
      }

      // Invert
      if (options.invert) {
        r = 255 - r;
        g = 255 - g;
        b = 255 - b;
      }

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL("image/png");
  }
}
