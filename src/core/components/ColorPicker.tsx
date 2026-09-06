import React, { useState } from "react";
import { Check, Palette, Sparkles } from "lucide-react";
import { OPEN_COLORS_CATALOG, ColorProvider } from "../providers/colorProvider";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onChange,
  label = "Cor",
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("Doces & Mimos");
  const [hexInput, setHexInput] = useState(color);

  const currentColorItem = ColorProvider.findByHex(color);

  const handleHexChange = (val: string) => {
    setHexInput(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      onChange(val);
    }
  };

  const categories = ColorProvider.getCategories();
  const categoryColors = OPEN_COLORS_CATALOG.filter((c) => c.category === selectedCategory);

  return (
    <div className="flex flex-col gap-2.5">
      {label && (
        <div className="flex items-center justify-between text-xs text-theme-text-muted">
          <span className="font-medium text-theme-text">{label}</span>
          <div className="flex items-center gap-2">
            {currentColorItem && (
              <span className="text-[11px] font-bold text-theme-primary flex items-center gap-1">
                {currentColorItem.emoji} {currentColorItem.name}
              </span>
            )}
            <span
              className="w-4 h-4 rounded-full border border-black/20 shadow-sm"
              style={{ backgroundColor: color }}
            />
            <span className="font-mono uppercase text-[11px] font-semibold text-theme-text">
              {color}
            </span>
          </div>
        </div>
      )}

      {/* Primary Row: Native Picker Trigger + Hex Input */}
      <div className="flex items-center gap-2">
        <label className="relative cursor-pointer flex-shrink-0 group">
          <input
            type="color"
            value={color.startsWith("#") && color.length === 7 ? color : "#ec4899"}
            onChange={(e) => {
              onChange(e.target.value);
              setHexInput(e.target.value);
            }}
            className="sr-only"
          />
          <div
            className="w-9 h-9 rounded-xl border border-theme-border/80 shadow-soft flex items-center justify-center transition-transform group-hover:scale-105"
            style={{ backgroundColor: color }}
          >
            <Palette size={15} className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
          </div>
        </label>

        <input
          type="text"
          value={hexInput}
          onChange={(e) => handleHexChange(e.target.value)}
          placeholder="#FFFFFF"
          className="flex-1 h-9 px-3 text-xs font-mono uppercase bg-theme-surface-card border border-theme-border rounded-xl text-theme-text focus:outline-none focus:border-theme-primary transition-colors"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 overflow-x-auto py-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`text-[11px] px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? "bg-theme-primary text-white font-bold shadow-xs"
                : "bg-theme-surface-card text-theme-text-muted hover:text-theme-text"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Palette Swatches with Tooltips */}
      <div className="grid grid-cols-6 gap-1.5 pt-0.5">
        {categoryColors.map((swatch) => (
          <button
            key={swatch.hex}
            type="button"
            onClick={() => {
              onChange(swatch.hex);
              setHexInput(swatch.hex);
            }}
            title={`${swatch.emoji} ${swatch.name} (${swatch.hex})`}
            className="h-8 rounded-lg border border-black/10 shadow-xs flex items-center justify-center transition-all hover:scale-110 active:scale-95 relative group"
            style={{ backgroundColor: swatch.hex }}
          >
            {color.toLowerCase() === swatch.hex.toLowerCase() && (
              <Check
                size={14}
                className={
                  swatch.hex === "#ffffff" || swatch.hex === "#fef08a" || swatch.hex === "#ffccd5"
                    ? "text-gray-900"
                    : "text-white"
                }
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
