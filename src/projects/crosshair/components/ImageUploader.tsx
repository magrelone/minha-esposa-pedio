import React, { useState } from "react";
import { useCrosshairStore } from "../store/crosshairStore";
import { ImageLayer } from "../types";
import { ImageProcessor } from "../engine/image-processor";
import { Button } from "@/core/components/Button";
import { Slider } from "@/core/components/Slider";
import { Toggle } from "@/core/components/Toggle";
import { ColorPicker } from "@/core/components/ColorPicker";
import { Upload, Sparkles, Image as ImageIcon, AlertCircle } from "lucide-react";

export const ImageUploader: React.FC = () => {
  const { addLayer } = useCrosshairStore();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [grayscale, setGrayscale] = useState(false);
  const [threshold, setThreshold] = useState(0);
  const [invert, setInvert] = useState(false);
  const [removeBgColor, setRemoveBgColor] = useState("#ffffff");
  const [enableRemoveBg, setEnableRemoveBg] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    try {
      const dataUrl = await ImageProcessor.readFile(file, 5);
      setImageSrc(dataUrl);
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao carregar imagem.");
    }
  };

  const handleAddToCrosshair = () => {
    if (!imageSrc) return;

    const layer: ImageLayer = {
      id: `img-${Date.now()}`,
      name: "Imagem Customizada",
      type: "image",
      src: imageSrc,
      width: 24,
      height: 24,
      brightness,
      contrast,
      grayscale,
      threshold,
      invert,
      removeBgColor: enableRemoveBg ? removeBgColor : undefined,
      visible: true,
      locked: false,
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      color: "#ffffff",
      outline: false,
      outlineColor: "#000000",
      glow: false,
      glowColor: "#ec4899",
    };

    addLayer(layer);
  };

  return (
    <div className="flex flex-col gap-6 p-1">
      {/* Upload Zone */}
      <label className="border-2 border-dashed border-theme-border/80 hover:border-theme-primary rounded-cute p-6 flex flex-col items-center justify-center gap-3 cursor-pointer bg-theme-surface-card hover:bg-theme-surface transition-all group">
        <input
          type="file"
          accept="image/png,image/webp,image/svg+xml"
          onChange={handleFileChange}
          className="sr-only"
        />
        <div className="w-12 h-12 rounded-full bg-theme-primary/10 text-theme-primary flex items-center justify-center group-hover:scale-110 transition-transform">
          <Upload size={22} />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-theme-text">
            Clique para enviar imagem da mira
          </p>
          <p className="text-xs text-theme-text-muted mt-0.5">
            Formatos suportados: PNG, WEBP ou SVG (até 5MB)
          </p>
        </div>
      </label>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle size={15} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Image Preview & Adjustments */}
      {imageSrc && (
        <div className="flex flex-col gap-4 bg-theme-surface-card p-4 rounded-cute border border-theme-border/60">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-theme-text flex items-center gap-1.5">
              <ImageIcon size={14} className="text-theme-primary" />
              Preview da Imagem
            </h4>
            <span className="text-[11px] text-theme-text-muted">
              SVG higienizado com DOMPurify
            </span>
          </div>

          <div className="w-full h-32 flex items-center justify-center bg-black/5 rounded-xl overflow-hidden border border-theme-border/40">
            <img
              src={imageSrc}
              alt="Uploaded crosshair preview"
              className="max-h-24 max-w-24 object-contain"
              style={{
                filter: `brightness(${brightness}%) contrast(${contrast}%) ${
                  grayscale ? "grayscale(100%)" : ""
                } ${invert ? "invert(100%)" : ""}`,
              }}
            />
          </div>

          {/* Controls */}
          <Slider
            label="Brilho"
            value={brightness}
            min={50}
            max={150}
            step={5}
            unit="%"
            onChange={setBrightness}
          />
          <Slider
            label="Contraste"
            value={contrast}
            min={50}
            max={150}
            step={5}
            unit="%"
            onChange={setContrast}
          />
          <Toggle
            label="Preto & Branco (Grayscale)"
            checked={grayscale}
            onChange={setGrayscale}
          />
          <Toggle
            label="Inverter Cores"
            checked={invert}
            onChange={setInvert}
          />

          <Toggle
            label="Remover Cor de Fundo"
            checked={enableRemoveBg}
            onChange={setEnableRemoveBg}
          />
          {enableRemoveBg && (
            <ColorPicker
              label="Cor de Fundo a Eliminar"
              color={removeBgColor}
              onChange={setRemoveBgColor}
            />
          )}

          <Button
            onClick={handleAddToCrosshair}
            variant="primary"
            icon={<Sparkles size={16} />}
            className="w-full mt-2"
          >
            Usar como Mira / Camada ✨
          </Button>
        </div>
      )}
    </div>
  );
};
