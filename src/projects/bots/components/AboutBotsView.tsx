import React from "react";
import {
  Heart,
  ExternalLink,
  Shield,
  FileCode,
  Sparkles,
  GitBranch,
  Info,
} from "lucide-react";

export const AboutBotsView: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center text-2xl shadow-soft">
            <Heart size={26} className="fill-white" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-black text-theme-text">
              Sobre a Central de Bots & Créditos
            </h2>
            <span className="text-xs text-theme-primary font-bold">
              Desenvolvido com carinho para minha esposa 💕
            </span>
          </div>
        </div>

        <div className="flex flex-col text-right text-xs">
          <span className="font-mono text-theme-text font-bold">
            Versão da Integração: 1.0.0
          </span>
          <span className="text-[11px] text-theme-text-muted">
            Arquitetura desacoplada e segura
          </span>
        </div>
      </div>

      {/* Upstream Project & Credits Card */}
      <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-theme-border/40 pb-3">
          <h3 className="text-sm font-black text-theme-text flex items-center gap-2">
            <GitBranch size={16} className="text-pink-500" />
            Projeto Original Integrado (Upstream)
          </h3>

          <a
            href="https://github.com/andrewwongwong/RobloxBot"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs font-bold text-theme-primary hover:underline"
          >
            <span>Ver no GitHub</span>
            <ExternalLink size={12} />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-theme-surface-card border border-theme-border/40 flex flex-col gap-1">
            <span className="text-[10px] text-theme-text-muted font-bold uppercase">
              Projeto Original
            </span>
            <span className="font-extrabold text-theme-text text-sm">
              RobloxBot
            </span>
            <span className="text-theme-text-muted">
              Bots that perform policy actions based on Roblox pixel video input.
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-theme-surface-card border border-theme-border/40 flex flex-col gap-1">
            <span className="text-[10px] text-theme-text-muted font-bold uppercase">
              Autor Original
            </span>
            <span className="font-extrabold text-theme-text text-sm">
              Andrew Wong (@andrewwongwong)
            </span>
            <span className="text-theme-text-muted">
              Implementação conceitual de visão e detecção de moedas para MM2.
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-theme-surface-card border border-theme-border/40 flex flex-col gap-1">
            <span className="text-[10px] text-theme-text-muted font-bold uppercase">
              Licença do Repositório
            </span>
            <span className="font-bold text-amber-500">
              Não declarada no upstream (Tratado como Integração Externa)
            </span>
            <span className="text-theme-text-muted">
              O código upstream fica estritamente isolado em vendor/ sem distribuição comercial indevida.
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-theme-surface-card border border-theme-border/40 flex flex-col gap-1">
            <span className="text-[10px] text-theme-text-muted font-bold uppercase">
              Segurança do Processo
            </span>
            <span className="font-bold text-emerald-500">
              100% Baseado em Visão e Teclado
            </span>
            <span className="text-theme-text-muted">
              Sem DLL injection, sem alteração de memória, sem exploits ou hacks no cliente Roblox.
            </span>
          </div>
        </div>
      </div>

      {/* Changes & Improvements Card */}
      <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft flex flex-col gap-3">
        <h3 className="text-sm font-black text-theme-text flex items-center gap-2">
          <FileCode size={16} className="text-purple-500" />
          Melhorias e Adaptações Realizadas
        </h3>

        <ul className="flex flex-col gap-2 text-xs text-theme-text-muted">
          <li className="flex items-start gap-2">
            <span className="text-theme-primary font-bold">•</span>
            <span>
              <strong>Comunicação Estruturada (IPC):</strong> Substituição de prints soltos no terminal por protocolo seguro de linhas JSON via stdin/stdout.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-theme-primary font-bold">•</span>
            <span>
              <strong>Compatibilidade com PyTorch 2.x+:</strong> Ajuste de carregamento de checkpoints YOLOv5 com suporte a CPU e GPUs modernas sem conflito de versão.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-theme-primary font-bold">•</span>
            <span>
              <strong>Driver de Input Nativo Seguro:</strong> Remoção da dependência estrita do AutoHotkey externo através de driver seguro com suporte a modo de simulação.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-theme-primary font-bold">•</span>
            <span>
              <strong>Preview e Telemetria em Tempo Real:</strong> Transmissão de frames codificados e bounding boxes para exibição gráfica na interface do Tauri.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
