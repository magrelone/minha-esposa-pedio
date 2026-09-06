import React from "react";
import { Undo2, RotateCcw, ShieldCheck, AlertTriangle } from "lucide-react";
import { CompatibilityLevel, CustomizationCategory } from "../types";
import { useWindowsStore } from "../store/windowsStore";

interface StudioSectionHeaderProps {
  title: string;
  subtitle: string;
  icon: string;
  category: CustomizationCategory;
  compatibility?: CompatibilityLevel;
  onCustomUndo?: () => void;
}

export const StudioSectionHeader: React.FC<StudioSectionHeaderProps> = ({
  title,
  subtitle,
  icon,
  category,
  compatibility = "SUPPORTED",
  onCustomUndo,
}) => {
  const { revertCategoryToDefault, undoLastChange } = useWindowsStore();

  const handleUndo = () => {
    if (onCustomUndo) {
      onCustomUndo();
    } else {
      undoLastChange();
    }
  };

  const handleResetToDefault = () => {
    revertCategoryToDefault(category);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-theme-surface/70 border border-theme-border/60 rounded-2xl backdrop-blur-md shadow-sm mb-6">
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center text-2xl flex-shrink-0 shadow-soft">
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-theme-text">{title}</h2>
            {compatibility === "SUPPORTED" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                <ShieldCheck size={12} /> NATIVO & SEGURO
              </span>
            )}
            {compatibility === "EXPERIMENTAL" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                <AlertTriangle size={12} /> EXPERIMENTAL
              </span>
            )}
          </div>
          <p className="text-xs text-theme-text-muted mt-0.5">{subtitle}</p>
        </div>
      </div>

      {/* Ações de Desfazer e Restaurar Padrões */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleUndo}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-theme-text bg-theme-surface-card hover:bg-theme-border/50 border border-theme-border transition-all shadow-sm active:scale-95"
          title="Desfazer a última ação realizada"
        >
          <Undo2 size={14} className="text-pink-500" />
          <span>Desfazer</span>
        </button>

        <button
          onClick={handleResetToDefault}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-theme-text-muted hover:text-theme-text bg-theme-surface hover:bg-rose-500/10 border border-theme-border/80 transition-all active:scale-95"
          title="Restaurar valores padrão do Windows para esta categoria"
        >
          <RotateCcw size={13} />
          <span>Restaurar Padrão</span>
        </button>
      </div>
    </div>
  );
};
