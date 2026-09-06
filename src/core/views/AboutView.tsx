import React from "react";
import { Card } from "@/core/components/Card";
import { Heart, ShieldCheck, ExternalLink, Code } from "lucide-react";

export const AboutView: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto py-2">
      <div>
        <h2 className="text-2xl font-bold text-theme-text">Sobre & Créditos</h2>
        <p className="text-xs text-theme-text-muted mt-1">
          História do projeto, licenças e tecnologias utilizadas.
        </p>
      </div>

      {/* Dedicação Especial */}
      <Card className="bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-transparent border-theme-primary/30 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-500 flex items-center justify-center text-2xl flex-shrink-0">
            💕
          </div>
          <div className="flex flex-col gap-1.5">
            <h3 className="text-lg font-bold text-theme-text">Para minha esposa querida</h3>
            <p className="text-xs leading-relaxed text-theme-text-muted">
              Este programa foi criado especialmente para você, com muito carinho e paciência, para que cada pequeno utilitário ou ferramenta que você precisar no seu dia a dia e nos seus jogos favoritos esteja sempre à sua disposição, rápido, fofinho e sem complicações.
            </p>
            <span className="text-xs font-semibold text-theme-primary mt-1">
              "Feito com todo o amor do mundo." ✨
            </span>
          </div>
        </div>
      </Card>

      {/* Licenças e Créditos Open Source */}
      <Card className="flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-theme-border/60 pb-3">
          <ShieldCheck size={18} className="text-emerald-500" />
          <h3 className="text-base font-bold text-theme-text">Licenças & Atribuições</h3>
        </div>

        <div className="flex flex-col gap-3 divide-y divide-theme-border/40 text-xs">
          <div className="pt-2 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-theme-text">Tauri Desktop Framework</span>
              <span className="px-2 py-0.5 rounded bg-theme-surface-card border border-theme-border text-[10px] font-mono">
                MIT / Apache 2.0
              </span>
            </div>
            <span className="text-theme-text-muted">
              Runtime nativo leve, seguro e performático em Rust para Windows.
            </span>
          </div>

          <div className="pt-3 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-theme-text">Lucide Icons</span>
              <span className="px-2 py-0.5 rounded bg-theme-surface-card border border-theme-border text-[10px] font-mono">
                ISC License
              </span>
            </div>
            <span className="text-theme-text-muted">
              Ícones vetoriais modernos e minimalistas para interface e miras.
            </span>
          </div>

          <div className="pt-3 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-theme-text">Twemoji & Unicode Emojis</span>
              <span className="px-2 py-0.5 rounded bg-theme-surface-card border border-theme-border text-[10px] font-mono">
                CC-BY 4.0
              </span>
            </div>
            <span className="text-theme-text-muted">
              Emojis vetoriais elegantes e suporte a emojis nativos do sistema operacional.
            </span>
          </div>

          <div className="pt-3 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-theme-text">DOMPurify</span>
              <span className="px-2 py-0.5 rounded bg-theme-surface-card border border-theme-border text-[10px] font-mono">
                Apache 2.0 / MPL 2.0
              </span>
            </div>
            <span className="text-theme-text-muted">
              Sanitizador estrito contra injeção de scripts e vetores XSS em uploads SVG.
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
