import React, { useState } from "react";
import { StudioSectionHeader } from "../components/StudioSectionHeader";
import { INITIAL_SEED_ASSETS } from "../services/licenseService";
import { Search, ShieldCheck, Scale, ExternalLink, Filter } from "lucide-react";

export const AssetLibraryView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [licenseFilter, setLicenseFilter] = useState<"all" | "commercial" | "cc0">("all");

  const filteredAssets = INITIAL_SEED_ASSETS.filter((asset) => {
    const matchesSearch =
      asset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (licenseFilter === "commercial") return asset.license.commercialUse;
    if (licenseFilter === "cc0") return asset.license.id === "lic_cc0";
    return true;
  });

  return (
    <div className="space-y-6">
      <StudioSectionHeader
        title="Asset Library & Licenciamento Legal"
        subtitle="Catálogo de recursos verificados com autor, hash SHA-256 e autorizações comerciais."
        icon="📦"
        category="assets"
        compatibility="SUPPORTED"
      />

      {/* Barra de Busca e Filtros */}
      <div className="flex flex-col sm:flex-row items-center gap-3 p-3.5 bg-theme-surface border border-theme-border/60 rounded-2xl">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por tags (ex: cute, pink, retro, windows11)..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-theme-surface-card border border-theme-border text-xs text-theme-text placeholder-theme-text-muted focus:outline-hidden focus:border-pink-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setLicenseFilter("all")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              licenseFilter === "all"
                ? "bg-pink-500 text-white shadow-soft"
                : "bg-theme-surface-card border border-theme-border text-theme-text"
            }`}
          >
            Todos
          </button>

          <button
            onClick={() => setLicenseFilter("commercial")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              licenseFilter === "commercial"
                ? "bg-pink-500 text-white shadow-soft"
                : "bg-theme-surface-card border border-theme-border text-theme-text"
            }`}
          >
            Uso Comercial
          </button>

          <button
            onClick={() => setLicenseFilter("cc0")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              licenseFilter === "cc0"
                ? "bg-pink-500 text-white shadow-soft"
                : "bg-theme-surface-card border border-theme-border text-theme-text"
            }`}
          >
            CC0 (Domínio Público)
          </button>
        </div>
      </div>

      {/* Grade de Assets com Auditoria de Licença */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="flex flex-col justify-between p-4.5 rounded-2xl bg-theme-surface border border-theme-border/60 hover:border-pink-500/40 transition-all shadow-sm"
          >
            <div>
              <div className="relative w-full h-36 rounded-xl overflow-hidden bg-slate-900 mb-3">
                <img src={asset.previewUrl} alt={asset.title} className="w-full h-full object-cover" />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white uppercase backdrop-blur-md">
                  {asset.type}
                </span>
              </div>

              <h4 className="text-xs font-bold text-theme-text">{asset.title}</h4>
              <div className="text-[11px] text-theme-text-muted mt-1">
                Autor: <strong className="text-theme-text">{asset.license.author}</strong>
              </div>

              {/* Detalhes de Licença */}
              <div className="mt-3 p-2.5 rounded-xl bg-theme-surface-card border border-theme-border/40 space-y-1.5 text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="text-theme-text-muted font-medium">Licença:</span>
                  <span className="font-bold text-pink-400">{asset.license.licenseName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-theme-text-muted font-medium">Uso Comercial:</span>
                  <span className={asset.license.commercialUse ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                    {asset.license.commercialUse ? "Sim (Permitido)" : "Não Comercial"}
                  </span>
                </div>
                <div className="truncate text-theme-text-muted font-mono text-[9px]">
                  Hash: {asset.sha256Hash.substring(0, 16)}...
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
