import React from "react";
import { StudioSectionHeader } from "../components/StudioSectionHeader";
import { useWindowsStore } from "../store/windowsStore";
import { Sparkles, Check, RotateCcw } from "lucide-react";

interface PresetItem {
  id: string;
  name: string;
  category: string;
  description: string;
  badge: string;
  accent: string;
  gradient: string;
  previewUrl: string;
  applyAction: () => void;
}

export const QuickCustomizeView: React.FC = () => {
  const {
    applyPreset,
    undoLastChange,
    showNotification,
  } = useWindowsStore();

  const presets: PresetItem[] = [
    {
      id: "cute_pink",
      name: "Cute Pink Dream 💕",
      category: "Especial Esposa",
      description: "Tema suave, acentos em rosa carinhoso, papéis de parede florais e cursores delicados.",
      badge: "Favorito da Esposa",
      accent: "#ec4899",
      gradient: "from-pink-500/20 via-rose-400/10 to-transparent",
      previewUrl: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=500&auto=format&fit=crop&q=80",
      applyAction: () => {
        applyPreset("cute_pink", "Cute Pink Dream 💕");
      },
    },
    {
      id: "win11_fluent",
      name: "Windows 11 Fluent Clean",
      category: "Moderno",
      description: "Design moderno com Mica, cantos arredondados sutis e barra centralizada.",
      badge: "Padrão Oficial",
      accent: "#3b82f6",
      gradient: "from-blue-500/20 via-sky-400/10 to-transparent",
      previewUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80",
      applyAction: () => {
        applyPreset("win11_fluent", "Windows 11 Fluent Clean");
      },
    },
    {
      id: "win10_classic",
      name: "Windows 10 Nostalgia",
      category: "Produtividade",
      description: "Barra de tarefas alinhada à esquerda, bordas retas e acento azul profundo.",
      badge: "Produtividade",
      accent: "#0284c7",
      gradient: "from-cyan-500/20 via-blue-400/10 to-transparent",
      previewUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80",
      applyAction: () => {
        applyPreset("win10_classic", "Windows 10 Nostalgia");
      },
    },
    {
      id: "win7_aero",
      name: "Windows 7 Aero Glass",
      category: "Retro & Vidro",
      description: "Efeitos translúcidos inspirados no Aero Glass com paleta celeste clássica.",
      badge: "Aero Glass",
      accent: "#0ea5e9",
      gradient: "from-teal-500/20 via-sky-400/10 to-transparent",
      previewUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=500&auto=format&fit=crop&q=80",
      applyAction: () => {
        applyPreset("win7_aero", "Windows 7 Aero Glass");
      },
    },
    {
      id: "retro_xp",
      name: "Windows XP Bliss Luna",
      category: "Lendário",
      description: "A clássica atmosfera do Windows XP com colinas verdes e sons nostálgicos.",
      badge: "Nostalgia Pura",
      accent: "#16a34a",
      gradient: "from-emerald-500/20 via-green-400/10 to-transparent",
      previewUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&auto=format&fit=crop&q=80",
      applyAction: () => {
        applyPreset("win10_classic", "Windows XP Bliss Luna");
      },
    },
    {
      id: "cyberpunk_neon",
      name: "Cyberpunk 2077 Neon",
      category: "Gaming",
      description: "Tema com alto contraste, tons amarelos e ciano elétrico para noites de jogatina.",
      badge: "Gamer High FPS",
      accent: "#eab308",
      gradient: "from-yellow-500/20 via-amber-400/10 to-transparent",
      previewUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=80",
      applyAction: () => {
        applyPreset("cyberpunk_neon", "Cyberpunk 2077 Neon");
      },
    },
  ];

  return (
    <div>
      <StudioSectionHeader
        title="Quick Customize (Estilos Rápidos)"
        subtitle="Transforme todo o visual do Windows em 1 clique mantendo sempre a opção de desfazer!"
        icon="✨"
        category="quick"
        compatibility="SUPPORTED"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {presets.map((preset) => (
          <div
            key={preset.id}
            className="group relative flex flex-col justify-between bg-theme-surface border border-theme-border/60 hover:border-pink-500/50 rounded-2xl overflow-hidden p-4.5 transition-all duration-300 hover:shadow-soft hover:-translate-y-0.5"
          >
            {/* Imagem de Preview */}
            <div className="relative w-full h-36 rounded-xl overflow-hidden bg-slate-900/40 border border-theme-border/40 mb-3.5">
              <img
                src={preset.previewUrl}
                alt={preset.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2.5 left-2.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-900/80 text-pink-300 border border-pink-500/30 backdrop-blur-md">
                  {preset.badge}
                </span>
              </div>
              <div
                className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full border border-white/60 shadow-sm"
                style={{ backgroundColor: preset.accent }}
                title={`Cor de destaque: ${preset.accent}`}
              />
            </div>

            {/* Informações */}
            <div>
              <div className="text-[10px] font-bold text-theme-text-muted uppercase tracking-wider mb-1">
                {preset.category}
              </div>
              <h3 className="text-sm font-bold text-theme-text group-hover:text-pink-500 transition-colors">
                {preset.name}
              </h3>
              <p className="text-xs text-theme-text-muted mt-1 leading-relaxed">
                {preset.description}
              </p>
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-theme-border/40">
              <button
                onClick={preset.applyAction}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-95 shadow-soft active:scale-95 transition-all"
              >
                <Sparkles size={14} />
                <span>Aplicar Estilo</span>
              </button>

              <button
                onClick={() => undoLastChange()}
                className="p-2 rounded-xl text-theme-text-muted hover:text-pink-500 bg-theme-surface-card hover:bg-theme-border/50 border border-theme-border transition-colors active:scale-95"
                title="Desfazer este preset se aplicado"
              >
                <RotateCcw size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
