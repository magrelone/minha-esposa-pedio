import React from "react";
import {
  CrosshairItem,
  ClassicCrosshairLayer,
  GeometryLayer,
  EmojiLayer,
  IconLayer,
  ImageLayer,
  BaseLayer,
} from "../types";
import { EmojiProvider } from "@/core/providers/emojiProvider";

interface VectorCrosshairProps {
  crosshair: CrosshairItem;
  size?: number; // size of the SVG viewBox (e.g. 500)
  scale?: number;
}

const getEffectStyles = (layer: BaseLayer) => {
  const effect = layer.glowEffect || (layer.glow ? "neon" : "none");
  const glowColor = layer.glowColor || layer.color || "#ff69b4";
  const radius = layer.glowRadius || 8;
  const speed = layer.animationSpeed ? `${layer.animationSpeed}s` : undefined;

  const style: React.CSSProperties = {
    ["--glow-c" as any]: glowColor,
    ["--anim-speed" as any]: speed,
  };

  let className = "";

  switch (effect) {
    case "neon":
      style.filter = `drop-shadow(0 0 ${radius / 2}px ${glowColor}) drop-shadow(0 0 ${radius}px ${glowColor})`;
      break;
    case "soft-aura":
      style.filter = `drop-shadow(0 0 ${radius}px ${glowColor}) opacity(0.95)`;
      break;
    case "rgb-chroma":
      className = "anim-rgb-chroma";
      break;
    case "pulse-glow":
      className = "anim-pulse-glow";
      break;
    case "heartbeat":
      className = "anim-heartbeat";
      break;
    case "spin":
      className = "anim-spin";
      break;
    case "sparkle":
      className = "anim-sparkle";
      break;
    case "flame":
      className = "anim-flame";
      break;
    case "electric":
      className = "anim-electric";
      break;
    case "swing":
      className = "anim-swing";
      break;
    case "wave":
      className = "anim-wave";
      break;
    case "vaporwave":
      className = "anim-vaporwave";
      break;
    case "ghost":
      className = "anim-ghost";
      break;
    default:
      break;
  }

  return { style, className };

};

export const VectorCrosshair: React.FC<VectorCrosshairProps> = ({
  crosshair,
  size = 500,
  scale = 1,
}) => {
  const center = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="pointer-events-none select-none overflow-visible"
      style={{ background: "transparent" }}
    >
      <defs>
        {/* Glow filter for cute luminous emojis/shapes */}
        <filter id="cute-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="soft-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.6" />
        </filter>
      </defs>


      <g transform={`translate(${center}, ${center}) scale(${scale})`}>
        {crosshair.classicConfig && (() => {
          const fx = getEffectStyles(crosshair.classicConfig);
          return (
            <g style={fx.style} className={fx.className}>
              <ClassicCrosshairVector config={crosshair.classicConfig} />
            </g>
          );
        })()}
        {crosshair.layers && crosshair.layers.map((layer) => {
          if (!layer.visible) return null;
          const fx = getEffectStyles(layer);

          return (
            <g
              key={layer.id}
              transform={`translate(${layer.x}, ${layer.y}) rotate(${layer.rotation}) scale(${layer.scale})`}
              opacity={layer.opacity}
              style={fx.style}
              className={fx.className}
            >
              {layer.type === "classic" && (
                <ClassicCrosshairVector config={layer as ClassicCrosshairLayer} />
              )}
              {layer.type === "geometry" && (
                <GeometryVector layer={layer as GeometryLayer} />
              )}
              {layer.type === "emoji" && (
                <EmojiVector layer={layer as EmojiLayer} />
              )}
              {layer.type === "icon" && (
                <IconVector layer={layer as IconLayer} />
              )}
              {layer.type === "image" && (
                <ImageVector layer={layer as ImageLayer} />
              )}
            </g>
          );
        })}
      </g>

    </svg>

  );
};

const ClassicCrosshairVector: React.FC<{ config: ClassicCrosshairLayer }> = ({
  config,
}) => {
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
  } = config;

  const actualShowTop = tStyle ? false : showTop;
  const rx = rounded ? thickness / 2 : 0;
  const ds = dotSize || thickness;

  return (
    <g>
      {/* 1. Outlines */}
      {outline && outlineThickness > 0 && (
        <g fill={outlineColor || "#000000"}>
          {actualShowTop && (
            <rect
              x={-thickness / 2 - outlineThickness}
              y={-gap - size - outlineThickness}
              width={thickness + outlineThickness * 2}
              height={size + outlineThickness * 2}
              rx={rx}
            />
          )}
          {showBottom && (
            <rect
              x={-thickness / 2 - outlineThickness}
              y={gap - outlineThickness}
              width={thickness + outlineThickness * 2}
              height={size + outlineThickness * 2}
              rx={rx}
            />
          )}
          {showLeft && (
            <rect
              x={-gap - size - outlineThickness}
              y={-thickness / 2 - outlineThickness}
              width={size + outlineThickness * 2}
              height={thickness + outlineThickness * 2}
              rx={rx}
            />
          )}
          {showRight && (
            <rect
              x={gap - outlineThickness}
              y={-thickness / 2 - outlineThickness}
              width={size + outlineThickness * 2}
              height={thickness + outlineThickness * 2}
              rx={rx}
            />
          )}
          {dot && (
            <rect
              x={-ds / 2 - outlineThickness}
              y={-ds / 2 - outlineThickness}
              width={ds + outlineThickness * 2}
              height={ds + outlineThickness * 2}
              rx={rounded ? ds / 2 : 0}
            />
          )}
        </g>
      )}

      {/* 2. Main Lines */}
      <g fill={color}>
        {actualShowTop && (
          <rect
            x={-thickness / 2}
            y={-gap - size}
            width={thickness}
            height={size}
            rx={rx}
          />
        )}
        {showBottom && (
          <rect
            x={-thickness / 2}
            y={gap}
            width={thickness}
            height={size}
            rx={rx}
          />
        )}
        {showLeft && (
          <rect
            x={-gap - size}
            y={-thickness / 2}
            width={size}
            height={thickness}
            rx={rx}
          />
        )}
        {showRight && (
          <rect
            x={gap}
            y={-thickness / 2}
            width={size}
            height={thickness}
            rx={rx}
          />
        )}
        {dot && (
          <rect
            x={-ds / 2}
            y={-ds / 2}
            width={ds}
            height={ds}
            rx={rounded ? ds / 2 : 0}
          />
        )}
      </g>
    </g>
  );
};

const GeometryVector: React.FC<{ layer: GeometryLayer }> = ({ layer }) => {
  const { shape, size, thickness, hollow, color, outline, outlineThickness, outlineColor } = layer;

  const stroke = hollow ? color : "none";
  const fill = hollow ? "none" : color;

  const renderShapePath = (sColor: string, sWidth: number, fColor: string) => {
    switch (shape) {
      case "heart": {
        // Precise cute heart path
        const s = size / 16;
        const d = `M 0,${4 * s} C 0,0 ${-10 * s},${-6 * s} ${-10 * s},${3 * s} C ${-10 * s},${9 * s} 0,${13 * s} 0,${16 * s} C 0,${13 * s} ${10 * s},${9 * s} ${10 * s},${3 * s} C ${10 * s},${-6 * s} 0,0 0,${4 * s} Z`;
        return <path d={d} fill={fColor} stroke={sColor} strokeWidth={sWidth} />;
      }
      case "dot":
        return <circle cx={0} cy={0} r={size / 2} fill={fColor} stroke={sColor} strokeWidth={sWidth} />;
      case "circle":
      case "hollow-circle":
        return <circle cx={0} cy={0} r={size} fill={fColor} stroke={sColor} strokeWidth={sWidth} />;
      case "square":
      case "hollow-square":
        return (
          <rect
            x={-size / 2}
            y={-size / 2}
            width={size}
            height={size}
            fill={fColor}
            stroke={sColor}
            strokeWidth={sWidth}
          />
        );
      case "diamond":
        return (
          <polygon
            points={`0,${-size} ${size},0 0,${size} ${-size},0`}
            fill={fColor}
            stroke={sColor}
            strokeWidth={sWidth}
          />
        );
      case "star": {
        const spikes = 5;
        const outer = size;
        const inner = size / 2;
        let points = "";
        let rot = (Math.PI / 2) * 3;
        const step = Math.PI / spikes;

        for (let i = 0; i < spikes; i++) {
          points += `${Math.cos(rot) * outer},${Math.sin(rot) * outer} `;
          rot += step;
          points += `${Math.cos(rot) * inner},${Math.sin(rot) * inner} `;
          rot += step;
        }
        return <polygon points={points.trim()} fill={fColor} stroke={sColor} strokeWidth={sWidth} />;
      }
      case "cross":
      case "x": {
        const rot = shape === "x" ? 45 : 0;
        return (
          <g transform={`rotate(${rot})`}>
            <rect
              x={-thickness / 2}
              y={-size}
              width={thickness}
              height={size * 2}
              fill={fColor !== "none" ? fColor : sColor}
            />
            <rect
              x={-size}
              y={-thickness / 2}
              width={size * 2}
              height={thickness}
              fill={fColor !== "none" ? fColor : sColor}
            />
          </g>
        );
      }
      case "corner-brackets": {
        const cl = size / 2;
        const d = `
          M ${-size},${-size + cl} L ${-size},${-size} L ${-size + cl},${-size}
          M ${size - cl},${-size} L ${size},${-size} L ${size},${-size + cl}
          M ${-size},${size - cl} L ${-size},${size} L ${-size + cl},${size}
          M ${size - cl},${size} L ${size},${size} L ${size},${size - cl}
        `;
        return <path d={d} fill="none" stroke={sColor} strokeWidth={sWidth} />;
      }
      default:
        return <circle cx={0} cy={0} r={size} fill={fColor} stroke={sColor} strokeWidth={sWidth} />;
    }
  };

  return (
    <g>
      {outline && outlineThickness > 0 && (
        renderShapePath(
          outlineColor || "#000000",
          thickness + outlineThickness * 2,
          hollow ? "none" : outlineColor || "#000000"
        )
      )}
      {renderShapePath(color, thickness, fill)}
    </g>
  );
};

const EmojiVector: React.FC<{ layer: EmojiLayer }> = ({ layer }) => {
  const { emoji, fontSize, glow, glowColor, shadow } = layer;

  return (
    <g
      filter={glow ? "url(#cute-glow)" : shadow ? "url(#soft-shadow)" : undefined}
      style={{
        fontSize: `${fontSize * 1.5}px`,
        textAnchor: "middle",
        dominantBaseline: "central",
        fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif',
      }}
    >
      <text x={0} y={0}>
        {emoji}
      </text>
    </g>
  );
};

const IconVector: React.FC<{ layer: IconLayer }> = ({ layer }) => {
  // If icon is an Iconify icon with svgUrl available or fallback
  const prefix = layer.iconName?.split(":")[0] || "lucide";
  const name = layer.iconName?.split(":")[1] || "heart";
  const svgUrl = `https://api.iconify.design/${prefix}/${name}.svg?color=${encodeURIComponent(layer.color)}`;

  return (
    <image
      href={svgUrl}
      x={-layer.size}
      y={-layer.size}
      width={layer.size * 2}
      height={layer.size * 2}
      preserveAspectRatio="xMidYMid meet"
    />
  );
};

const ImageVector: React.FC<{ layer: ImageLayer }> = ({ layer }) => {
  const w = layer.width || 32;
  const h = layer.height || 32;

  return (
    <image
      href={layer.src}
      x={-w / 2}
      y={-h / 2}
      width={w}
      height={h}
      preserveAspectRatio="xMidYMid meet"
    />
  );
};
