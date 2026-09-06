import React from "react";
import { StudioSectionHeader } from "../components/StudioSectionHeader";
import { useWindowsStore } from "../store/windowsStore";
import { Sun, Moon, Sparkles, Sliders, Check } from "lucide-react";

export const AppearanceView: React.FC = () => {
  const { appearance, updateAppearance, osInfo, undoLastChange } = useWindowsStore();

  const curatedAccents = [
    { name: "Rosa Amor 💕", color: "#ec4899" },
    { name: "Azul Fluent", color: "#0078d4" },
    { name: "Púrpura Místico", color: "#8b5cf6" },
    { name: "Esmeralda Viva", color: "#10b981" },
    { name: "Laranja Sol", color: "#f97316" },
    { name: "Rubi Real", color: "#ef4444" },
    { name: "Amarelo Neon", color: "#eab308" },
    { name: "Cinza Titânio", color: "#64748b" },
  ];

  return (
    <div className="space-y-6">
      <StudioSectionHeader
        title="Appearance Studio (Aparência do Windows)"
        subtitle="Ajuste temas claro/escuro, cores de destaque, efeitos Mica e Acrylic com reversão instantânea."
        icon="🎨"
        category="appearance"
        compatibility="SUPPORTED"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Painel: Modo de Cor */}
        <div className="bg-theme-surface border border-theme-border/60 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-theme-text flex items-center gap-2">
              <Sun size={16} className="text-amber-400" />
              <span>Modo do Sistema</span>
            </h3>
            <span className="text-[11px] font-semibold text-theme-text-muted">
              {appearance.mode.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => updateAppearance({ mode: "dark" }, "Modo Escuro Ativado")}
              className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border text-xs font-bold transition-all ${
                appearance.mode === "dark"
                  ? "bg-theme-primary text-white border-transparent shadow-soft"
                  : "bg-theme-surface-card border-theme-border text-theme-text hover:border-theme-primary/50"
              }`}
            >
              <Moon size={15} />
              <span>Modo Escuro</span>
            </button>

            <button
              onClick={() => updateAppearance({ mode: "light" }, "Modo Claro Ativado")}
              className={`flex items-center justify-center gap-2.5 p-3.5 rounded-xl border text-xs font-bold transition-all ${
                appearance.mode === "light"
                  ? "bg-theme-primary text-white border-transparent shadow-soft"
                  : "bg-theme-surface-card border-theme-border text-theme-text hover:border-theme-primary/50"
              }`}
            >
              <Sun size={15} />
              <span>Modo Claro</span>
            </button>
          </div>
        </div>

        {/* Painel: Cor de Destaque (Accent Color) */}
        <div className="bg-theme-surface border border-theme-border/60 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-theme-text flex items-center gap-2">
              <Sparkles size={16} className="text-pink-500" />
              <span>Cor de Destaque (Accent Color)</span>
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-theme-text-muted">
                {appearance.accentColor}
              </span>
              <div
                className="w-4 h-4 rounded-full border border-theme-border"
                style={{ backgroundColor: appearance.accentColor }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {curatedAccents.map((acc) => {
              const isSelected = appearance.accentColor.toLowerCase() === acc.color.toLowerCase();
              return (
                <button
                  key={acc.color}
                  onClick={() => updateAppearance({ accentColor: acc.color }, `Cor: ${acc.name}`)}
                  style={{ backgroundColor: acc.color }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform active:scale-95 ${
                    isSelected ? "ring-2 ring-white ring-offset-2 ring-offset-theme-surface scale-105" : "hover:opacity-90"
                  }`}
                  title={acc.name}
                >
                  {isSelected && <Check size={16} className="drop-shadow-md stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Painel: Efeitos Visuais & Transparência */}
      <div className="bg-theme-surface border border-theme-border/60 rounded-2xl p-5 shadow-sm space-y-5">
        <h3 className="text-sm font-bold text-theme-text flex items-center gap-2">
          <Sliders size={16} className="text-purple-400" />
          <span>Efeitos Visuais e Translúcidos</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Mica */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-theme-surface-card border border-theme-border/50">
            <div>
              <div className="text-xs font-bold text-theme-text">Material Mica</div>
              <div className="text-[11px] text-theme-text-muted">Efeito translúcido suave do Win 11</div>
            </div>
            <input
              type="checkbox"
              checked={appearance.useMica}
              onChange={(e) => updateAppearance({ useMica: e.target.checked }, "Mica Effect")}
              className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
            />
          </div>

          {/* Acrylic */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-theme-surface-card border border-theme-border/50">
            <div>
              <div className="text-xs font-bold text-theme-text">Acrylic Blur</div>
              <div className="text-[11px] text-theme-text-muted">Desfoque profundo com textura</div>
            </div>
            <input
              type="checkbox"
              checked={appearance.useAcrylic}
              onChange={(e) => updateAppearance({ useAcrylic: e.target.checked }, "Acrylic Effect")}
              className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
            />
          </div>

          {/* Cantos Arredondados */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-theme-surface-card border border-theme-border/50">
            <div>
              <div className="text-xs font-bold text-theme-text">Cantos Arredondados</div>
              <div className="text-[11px] text-theme-text-muted">Suavização estética de janelas</div>
            </div>
            <input
              type="checkbox"
              checked={appearance.roundedCorners}
              onChange={(e) => updateAppearance({ roundedCorners: e.target.checked }, "Cantos Arredondados")}
              className="w-4 h-4 accent-pink-500 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Botão de Desfazer dedicado desta tela */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => undoLastChange()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-pink-500 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 transition-all active:scale-95"
          >
            <span>↩️ Desfazer última alteração de aparência</span>
          </button>
        </div>
      </div>
    </div>
  );
};
