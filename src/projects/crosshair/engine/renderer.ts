import {
  CrosshairItem,
  CrosshairLayer,
  ClassicCrosshairLayer,
  GeometryLayer,
  EmojiLayer,
  IconLayer,
  ImageLayer,
} from "../types";

/**
 * High-performance 2D Canvas & SVG Crosshair Renderer.
 * Designed to consume virtually 0% CPU when rendered once or statically.
 */
export class CrosshairRenderer {
  /**
   * Renders the complete crosshair onto an HTML5 Canvas context.
   */
  public static renderToCanvas(
    ctx: CanvasRenderingContext2D,
    crosshair: CrosshairItem,
    width: number,
    height: number,
    scaleFactor: number = 1
  ): void {
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scaleFactor, scaleFactor);

    if (crosshair.type === "classic" && crosshair.classicConfig) {
      this.renderClassicLayer(ctx, crosshair.classicConfig);
    } else {
      for (const layer of crosshair.layers) {
        if (!layer.visible) continue;
        ctx.save();
        ctx.globalAlpha = layer.opacity;
        ctx.translate(layer.x, layer.y);
        if (layer.rotation !== 0) {
          ctx.rotate((layer.rotation * Math.PI) / 180);
        }
        if (layer.scale !== 1) {
          ctx.scale(layer.scale, layer.scale);
        }

        switch (layer.type) {
          case "classic":
            this.renderClassicLayer(ctx, layer as ClassicCrosshairLayer);
            break;
          case "geometry":
            this.renderGeometryLayer(ctx, layer as GeometryLayer);
            break;
          case "emoji":
            this.renderEmojiLayer(ctx, layer as EmojiLayer);
            break;
          case "icon":
            this.renderIconLayer(ctx, layer as IconLayer);
            break;
          case "image":
            this.renderImageLayer(ctx, layer as ImageLayer);
            break;
        }

        ctx.restore();
      }
    }

    ctx.restore();
  }

  private static renderClassicLayer(
    ctx: CanvasRenderingContext2D,
    cfg: ClassicCrosshairLayer
  ): void {
    const {
      size,
      thickness,
      gap,
      dot,
      dotSize,
      outline,
      outlineThickness,
      outlineColor,
      color,
      showTop,
      showBottom,
      showLeft,
      showRight,
      tStyle,
      rounded,
    } = cfg;

    const actualShowTop = tStyle ? false : showTop;

    // Helper to draw a single line
    const drawLine = (
      x: number,
      y: number,
      w: number,
      h: number,
      fillColor: string
    ) => {
      ctx.fillStyle = fillColor;
      if (rounded) {
        const radius = Math.min(w, h) / 2;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, radius);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, w, h);
      }
    };

    // 1. Draw Outline if enabled
    if (outline && outlineThickness > 0) {
      const ot = outlineThickness;
      const ot2 = ot * 2;

      // Top line outline
      if (actualShowTop) {
        drawLine(
          -thickness / 2 - ot,
          -gap - size - ot,
          thickness + ot2,
          size + ot2,
          outlineColor
        );
      }
      // Bottom line outline
      if (showBottom) {
        drawLine(
          -thickness / 2 - ot,
          gap - ot,
          thickness + ot2,
          size + ot2,
          outlineColor
        );
      }
      // Left line outline
      if (showLeft) {
        drawLine(
          -gap - size - ot,
          -thickness / 2 - ot,
          size + ot2,
          thickness + ot2,
          outlineColor
        );
      }
      // Right line outline
      if (showRight) {
        drawLine(
          gap - ot,
          -thickness / 2 - ot,
          size + ot2,
          thickness + ot2,
          outlineColor
        );
      }

      // Dot outline
      if (dot) {
        const ds = dotSize || thickness;
        drawLine(-ds / 2 - ot, -ds / 2 - ot, ds + ot2, ds + ot2, outlineColor);
      }
    }

    // 2. Draw Main Lines
    if (actualShowTop) {
      drawLine(-thickness / 2, -gap - size, thickness, size, color);
    }
    if (showBottom) {
      drawLine(-thickness / 2, gap, thickness, size, color);
    }
    if (showLeft) {
      drawLine(-gap - size, -thickness / 2, size, thickness, color);
    }
    if (showRight) {
      drawLine(gap, -thickness / 2, size, thickness, color);
    }

    // 3. Draw Main Dot
    if (dot) {
      const ds = dotSize || thickness;
      drawLine(-ds / 2, -ds / 2, ds, ds, color);
    }
  }

  private static renderGeometryLayer(
    ctx: CanvasRenderingContext2D,
    layer: GeometryLayer
  ): void {
    const { shape, size, thickness, hollow, color, outline, outlineThickness, outlineColor } = layer;

    const executeDraw = (strokeColor: string, sw: number, isFill: boolean) => {
      ctx.lineWidth = sw;
      ctx.strokeStyle = strokeColor;
      ctx.fillStyle = strokeColor;
      ctx.beginPath();

      switch (shape) {
        case "dot":
          ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
          ctx.fill();
          break;
        case "circle":
          ctx.arc(0, 0, size, 0, Math.PI * 2);
          ctx.fill();
          break;
        case "hollow-circle":
          ctx.arc(0, 0, size, 0, Math.PI * 2);
          ctx.stroke();
          break;
        case "square":
          ctx.fillRect(-size / 2, -size / 2, size, size);
          break;
        case "hollow-square":
          ctx.strokeRect(-size / 2, -size / 2, size, size);
          break;
        case "diamond":
          ctx.moveTo(0, -size);
          ctx.lineTo(size, 0);
          ctx.lineTo(0, size);
          ctx.lineTo(-size, 0);
          ctx.closePath();
          if (hollow) ctx.stroke();
          else ctx.fill();
          break;
        case "triangle":
          const h = (size * Math.sqrt(3)) / 2;
          ctx.moveTo(0, -h * (2 / 3));
          ctx.lineTo(size / 2, h / 3);
          ctx.lineTo(-size / 2, h / 3);
          ctx.closePath();
          if (hollow) ctx.stroke();
          else ctx.fill();
          break;
        case "cross":
        case "x":
          const rot = shape === "x" ? Math.PI / 4 : 0;
          ctx.save();
          ctx.rotate(rot);
          ctx.fillRect(-thickness / 2, -size, thickness, size * 2);
          ctx.fillRect(-size, -thickness / 2, size * 2, thickness);
          ctx.restore();
          break;
        case "star":
          this.drawStar(ctx, 0, 0, 5, size, size / 2);
          if (hollow) ctx.stroke();
          else ctx.fill();
          break;
        case "heart":
          this.drawHeart(ctx, 0, 0, size);
          if (hollow) ctx.stroke();
          else ctx.fill();
          break;
        case "brackets":
          // Left bracket [ and right bracket ]
          const bW = size / 3;
          ctx.strokeRect(-size, -size, bW, size * 2);
          ctx.strokeRect(size - bW, -size, bW, size * 2);
          break;
        case "corner-brackets":
          const cl = size / 2;
          // 4 corner brackets
          ctx.moveTo(-size, -size + cl);
          ctx.lineTo(-size, -size);
          ctx.lineTo(-size + cl, -size);

          ctx.moveTo(size - cl, -size);
          ctx.lineTo(size, -size);
          ctx.lineTo(size, -size + cl);

          ctx.moveTo(-size, size - cl);
          ctx.lineTo(-size, size);
          ctx.lineTo(-size + cl, size);

          ctx.moveTo(size - cl, size);
          ctx.lineTo(size, size);
          ctx.lineTo(size, size - cl);
          ctx.stroke();
          break;
        case "hexagon":
          this.drawPolygon(ctx, 0, 0, size, 6);
          if (hollow) ctx.stroke();
          else ctx.fill();
          break;
        case "octagon":
          this.drawPolygon(ctx, 0, 0, size, 8);
          if (hollow) ctx.stroke();
          else ctx.fill();
          break;
        default:
          ctx.arc(0, 0, size, 0, Math.PI * 2);
          ctx.fill();
      }
    };

    if (outline && outlineThickness > 0) {
      executeDraw(outlineColor, thickness + outlineThickness * 2, false);
    }
    executeDraw(color, thickness, !hollow);
  }

  private static drawHeart(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number
  ): void {
    const s = size / 16;
    ctx.moveTo(x, y + 4 * s);
    ctx.bezierCurveTo(x, y, x - 10 * s, y - 6 * s, x - 10 * s, y + 3 * s);
    ctx.bezierCurveTo(x - 10 * s, y + 9 * s, x, y + 13 * s, x, y + 16 * s);
    ctx.bezierCurveTo(x, y + 13 * s, x + 10 * s, y + 9 * s, x + 10 * s, y + 3 * s);
    ctx.bezierCurveTo(x + 10 * s, y - 6 * s, x, y, x, y + 4 * s);
    ctx.closePath();
  }

  private static drawStar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number
  ): void {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  }

  private static drawPolygon(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    sides: number
  ): void {
    const a = (Math.PI * 2) / sides;
    ctx.moveTo(x + radius, y);
    for (let i = 1; i < sides; i++) {
      ctx.lineTo(x + radius * Math.cos(a * i), y + radius * Math.sin(a * i));
    }
    ctx.closePath();
  }

  private static renderEmojiLayer(
    ctx: CanvasRenderingContext2D,
    layer: EmojiLayer
  ): void {
    ctx.font = `${layer.fontSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (layer.shadow) {
      ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
      ctx.shadowBlur = 6;
    }
    if (layer.glow) {
      ctx.shadowColor = layer.glowColor || layer.color;
      ctx.shadowBlur = 12;
    }

    ctx.fillText(layer.emoji, 0, 0);
    ctx.shadowBlur = 0;
  }

  private static renderIconLayer(
    ctx: CanvasRenderingContext2D,
    layer: IconLayer
  ): void {
    // Basic fallback or icon representation
    ctx.fillStyle = layer.color;
    ctx.strokeStyle = layer.color;
    ctx.lineWidth = layer.strokeWidth || 2;
    // Renders circular target indicator when icon is mounted via SVG
    ctx.beginPath();
    ctx.arc(0, 0, layer.size / 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  private static renderImageLayer(
    ctx: CanvasRenderingContext2D,
    layer: ImageLayer
  ): void {
    if (!layer.src) return;
    const img = new Image();
    img.src = layer.src;
    if (img.complete && img.naturalWidth > 0) {
      const w = layer.width || img.naturalWidth;
      const h = layer.height || img.naturalHeight;
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
    }
  }

  /**
   * Generates a transparent PNG data URL from crosshair configuration.
   */
  public static toPngDataUrl(crosshair: CrosshairItem, size: number = 256): string {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      this.renderToCanvas(ctx, crosshair, size, size);
    }
    return canvas.toDataURL("image/png");
  }
}
