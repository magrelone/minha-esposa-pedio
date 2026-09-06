import React, { useState } from "react";
import {
  Save,
  Download,
  Upload,
  Copy,
  Trash2,
  Sparkles,
  CheckCircle2,
  FolderOpen,
  Clock,
  MousePointer,
  Heart,
} from "lucide-react";
import { useAutoClickStore, AUTOCLICK_PRESETS } from "../store/autoclickStore";
import { AutoClickProfile } from "../types";

export const ProfilesView: React.FC = () => {
  const {
    profiles,
    activeProfileId,
    saveCurrentAsProfile,
    loadProfile,
    deleteProfile,
    duplicateProfile,
    applyPreset,
  } = useAutoClickStore();

  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileDesc, setNewProfileDesc] = useState("");
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;
    saveCurrentAsProfile(newProfileName.trim(), newProfileDesc.trim());
    setNewProfileName("");
    setNewProfileDesc("");
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const handleExport = (profile: AutoClickProfile) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${profile.name.toLowerCase().replace(/\s+/g, "_")}.autoclick`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (parsed.schemaVersion && parsed.clickMode) {
          loadProfile(parsed);
          saveCurrentAsProfile(parsed.name || "Perfil Importado", "Importado de arquivo .autoclick");
        }
      } catch (err) {
        console.error("Erro ao importar perfil:", err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center text-2xl shadow-soft">
            <FolderOpen size={24} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-black text-theme-text">Perfis & Predefinições Rápidas</h2>
            <span className="text-xs text-theme-text-muted">
              Salve suas configurações favoritas ou escolha um dos nossos presets prontos
            </span>
          </div>
        </div>

        <label className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-theme-surface-card hover:bg-theme-border/60 text-xs font-bold text-theme-text border border-theme-border/60 cursor-pointer shadow-soft transition-all">
          <Upload size={14} />
          <span>Importar .autoclick</span>
          <input type="file" accept=".autoclick,.json" onChange={handleImport} className="hidden" />
        </label>
      </div>

      {/* Presets Grid */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-black text-theme-text uppercase">Predefinições Oficiais (Presets)</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {AUTOCLICK_PRESETS.map((preset, idx) => (
            <div
              key={idx}
              className="p-4 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft flex flex-col justify-between gap-3 hover:border-pink-300/60 transition-all"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-theme-text">{preset.name}</span>
                  <span className="text-[10px] font-mono font-bold text-pink-500 bg-pink-500/10 px-2 py-0.5 rounded-lg">
                    {preset.cps} CPS
                  </span>
                </div>
                <span className="text-[11px] text-theme-text-muted">{preset.description}</span>
              </div>

              <button
                onClick={() => applyPreset(preset)}
                className="w-full py-2 rounded-xl bg-theme-surface-card hover:bg-theme-primary hover:text-white text-xs font-bold text-theme-text border border-theme-border/50 transition-all"
              >
                Aplicar Preset
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Save New Profile Form */}
      <form
        onSubmit={handleSave}
        className="p-6 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft flex flex-col gap-4"
      >
        <span className="text-xs font-black text-theme-text uppercase">Salvar Configuração Atual como Perfil</span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Nome do perfil (ex: Mineração Roblox)"
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
            className="p-2.5 rounded-xl bg-theme-surface-card border border-theme-border/60 text-xs text-theme-text focus:outline-none focus:border-pink-500"
            required
          />

          <input
            type="text"
            placeholder="Descrição opcional"
            value={newProfileDesc}
            onChange={(e) => setNewProfileDesc(e.target.value)}
            className="p-2.5 rounded-xl bg-theme-surface-card border border-theme-border/60 text-xs text-theme-text focus:outline-none focus:border-pink-500"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          {savedToast ? (
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5 animate-fade-in">
              <CheckCircle2 size={15} /> Perfil salvo com sucesso! 💕
            </span>
          ) : (
            <span className="text-[11px] text-theme-text-muted">
              Armazenado em banco de dados SQLite local no seu computador
            </span>
          )}

          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl bg-theme-primary hover:bg-theme-primary/90 text-xs font-bold text-white shadow-soft transition-all flex items-center gap-1.5"
          >
            <Save size={14} />
            <span>Salvar Perfil</span>
          </button>
        </div>
      </form>

      {/* User Saved Profiles */}
      {profiles.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="text-xs font-black text-theme-text uppercase">Meus Perfis Salvos ({profiles.length})</span>
          <div className="grid grid-cols-1 gap-3">
            {profiles.map((p) => {
              const isActive = p.id === activeProfileId;
              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-3xl bg-theme-surface border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isActive ? "border-pink-500 shadow-soft ring-2 ring-pink-400/20" : "border-theme-border/60"
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-theme-text">{p.name}</span>
                      {isActive && (
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-pink-500 text-white">
                          Ativo
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-theme-text-muted">{p.description || "Perfil personalizado"}</span>
                    <span className="text-[10px] font-mono text-pink-500 font-bold mt-0.5">
                      {p.cps} CPS • {p.mouseButton} • {p.repeatMode}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => loadProfile(p)}
                      className="px-3 py-1.5 rounded-xl bg-theme-primary hover:bg-theme-primary/90 text-xs font-bold text-white shadow-soft"
                    >
                      Carregar
                    </button>

                    <button
                      onClick={() => duplicateProfile(p.id)}
                      className="p-2 rounded-xl hover:bg-theme-surface-card text-theme-text-muted"
                      title="Duplicar"
                    >
                      <Copy size={14} />
                    </button>

                    <button
                      onClick={() => handleExport(p)}
                      className="p-2 rounded-xl hover:bg-theme-surface-card text-theme-text-muted"
                      title="Exportar .autoclick"
                    >
                      <Download size={14} />
                    </button>

                    <button
                      onClick={() => deleteProfile(p.id)}
                      className="p-2 rounded-xl hover:bg-red-500/10 text-red-500"
                      title="Excluir"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
