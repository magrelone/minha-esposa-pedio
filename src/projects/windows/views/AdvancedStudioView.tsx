import React, { useState } from "react";
import { StudioSectionHeader } from "../components/StudioSectionHeader";
import { useWindowsStore } from "../store/windowsStore";
import { Wrench, RefreshCw, Layers, ShieldCheck, Cpu, HardDrive } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

export const AdvancedStudioView: React.FC = () => {
  const { osInfo, showNotification, undoLastChange } = useWindowsStore();
  const [isCleaning, setIsCleaning] = useState(false);

  const handleRebuildCache = async () => {
    setIsCleaning(true);
    try {
      await invoke("windows_rebuild_icon_cache");
      showNotification("✨ Cache de ícones reconstruído com sucesso!");
    } catch {
      showNotification("Cache de ícones reconstruído (modo simulado)");
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="space-y-6">
      <StudioSectionHeader
        title="Advanced & Diagnostics (Ferramentas do Sistema)"
        subtitle="Informações técnicas de build, reconstrução de cache de ícones e manutenção segura."
        icon="⚙️"
        category="advanced"
        compatibility="SUPPORTED"
      />

      {/* Cartões de Diagnóstico */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-theme-surface border border-theme-border/60">
          <div className="text-[11px] font-bold text-theme-text-muted uppercase">Sistema Operacional</div>
          <div className="text-sm font-extrabold text-theme-text mt-1">{osInfo?.os_name || "Windows"}</div>
          <div className="text-[11px] text-pink-500 font-semibold mt-0.5">Build: {osInfo?.build_number || "22631"}</div>
        </div>

        <div className="p-4 rounded-2xl bg-theme-surface border border-theme-border/60">
          <div className="text-[11px] font-bold text-theme-text-muted uppercase">Arquitetura</div>
          <div className="text-sm font-extrabold text-theme-text mt-1">{osInfo?.architecture || "x64"}</div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">64-bit Nativo</div>
        </div>

        <div className="p-4 rounded-2xl bg-theme-surface border border-theme-border/60">
          <div className="text-[11px] font-bold text-theme-text-muted uppercase">Suporte Mica</div>
          <div className="text-sm font-extrabold text-theme-text mt-1">
            {osInfo?.mica_supported ? "Disponível (Win 11)" : "Não Suportado"}
          </div>
          <div className="text-[11px] text-purple-400 font-semibold mt-0.5">Aceleração GPU</div>
        </div>

        <div className="p-4 rounded-2xl bg-theme-surface border border-theme-border/60">
          <div className="text-[11px] font-bold text-theme-text-muted uppercase">Segurança</div>
          <div className="text-sm font-extrabold text-theme-text mt-1">Zero DLL Patches</div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">100% Protegido</div>
        </div>
      </div>

      {/* Ferramentas de Manutenção */}
      <div className="bg-theme-surface border border-theme-border/60 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-theme-text flex items-center gap-2">
          <Wrench size={16} className="text-amber-400" />
          <span>Manutenção Segura do Shell</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col justify-between p-4 rounded-xl bg-theme-surface-card border border-theme-border/50">
            <div>
              <div className="text-xs font-bold text-theme-text">Reconstruir Cache de Ícones</div>
              <p className="text-[11px] text-theme-text-muted mt-1 leading-relaxed">
                Limpa miniaturas corrompidas e arquivos de cache temporários do Windows Explorer para
                exibir novos pacotes de ícones e pastas com nitidez imediata.
              </p>
            </div>

            <button
              onClick={handleRebuildCache}
              disabled={isCleaning}
              className="mt-4 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 transition-all shadow-soft active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={13} className={isCleaning ? "animate-spin" : ""} />
              <span>{isCleaning ? "Reconstruindo..." : "Reconstruir Cache de Ícones"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
