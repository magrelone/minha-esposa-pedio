import React, { useState } from "react";
import {
  Search,
  Power,
  ChevronRight,
  Sparkles,
  Check,
} from "lucide-react";
import { useWindowsStore } from "../store/windowsStore";
import {
  AppBrandIcon,
  EdgeIcon,
  VSCodeIcon,
  RobloxIcon,
  DiscordIcon,
  WhatsAppIcon,
  NotepadIcon,
  SnippingToolIcon,
  CalculatorIcon,
  ExplorerIcon,
  SettingsIcon,
  MicrosoftStoreIcon,
  OutlookIcon,
  XboxIcon,
  PaintIcon,
  LinkedInIcon,
  ClockIcon,
  ControlPanelIcon,
  ThisPCIcon,
  DocumentsFolderIcon,
  PicturesFolderIcon,
  MusicFolderIcon,
  DownloadsFolderIcon,
} from "./OfficialAppIcons";

interface HybridStartMenuPreviewProps {
  onApplyStyle?: () => void;
}

export const HybridStartMenuPreview: React.FC<HybridStartMenuPreviewProps> = ({ onApplyStyle }) => {
  const { osInfo, appearance, showNotification } = useWindowsStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [powerMenuOpen, setPowerMenuOpen] = useState(false);

  const rawUserName = osInfo?.display_name || osInfo?.username || "Usuário";
  const userInitials = (
    rawUserName
      .split(/[\s._-]+/)
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("") || "U"
  ).toUpperCase();

  // Lista fiel aos aplicativos oficiais do sistema e do usuário (sem emojis!)
  const pinnedApps = [
    { name: "Pedi para meu marido 💕", icon: <AppBrandIcon size={26} />, desc: "Central de Automação & Customização" },
    { name: "Microsoft Edge", icon: <EdgeIcon size={26} />, desc: "Navegador de Internet" },
    { name: "Visual Studio Code", icon: <VSCodeIcon size={26} />, desc: "Editor de Código" },
    { name: "Roblox Player", icon: <RobloxIcon size={26} />, desc: "Jogos & Experiências" },
    { name: "Discord", icon: <DiscordIcon size={26} />, desc: "Comunicação em Equipe" },
    { name: "WhatsApp", icon: <WhatsAppIcon size={26} />, desc: "Mensagens & Chamadas" },
    { name: "Bloco de Notas", icon: <NotepadIcon size={26} />, desc: "Anotações Rápidas" },
    { name: "Ferramenta de Captura", icon: <SnippingToolIcon size={26} />, desc: "Screenshots e Gravação" },
    { name: "Explorador de Arquivos", icon: <ExplorerIcon size={26} />, desc: "Pastas e Documentos" },
    { name: "Microsoft Store", icon: <MicrosoftStoreIcon size={26} />, desc: "Loja de Aplicativos" },
    { name: "Xbox", icon: <XboxIcon size={26} />, desc: "Jogos e Comunidade" },
    { name: "Paint", icon: <PaintIcon size={26} />, desc: "Edição e Desenho" },
    { name: "Calculadora", icon: <CalculatorIcon size={26} />, desc: "Utilitário de Cálculo" },
    { name: "Outlook", icon: <OutlookIcon size={26} />, desc: "Emails e Calendário" },
    { name: "LinkedIn", icon: <LinkedInIcon size={26} />, desc: "Rede Profissional" },
    { name: "Relógio", icon: <ClockIcon size={26} />, desc: "Alarmes e Temporizador" },
  ];

  const filteredApps = pinnedApps.filter((a) =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-3xl overflow-hidden border border-white/20 shadow-2xl backdrop-blur-2xl bg-slate-900/90 text-white transition-all duration-300 select-none">
      {/* Barra de Pesquisa no Topo (Windows 11 Fluent) */}
      <div className="p-4 border-b border-white/10 bg-white/5">
        <div className="relative flex items-center">
          <Search size={16} className="absolute left-3.5 text-white/50" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar aplicativos, configurações e documentos..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-white placeholder-white/50 focus:outline-hidden focus:border-pink-400 focus:bg-white/15 transition-all"
          />
        </div>
      </div>

      {/* Corpo com DUAS COLUNAS (A Essência Produtiva do Windows 7) */}
      <div className="grid grid-cols-12 min-h-[380px]">
        {/* Coluna Esquerda (7 Colunas): Aplicativos Fixados e Recentes */}
        <div className="col-span-7 p-3.5 border-r border-white/10 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider">
                Aplicativos Fixados
              </span>
              <span className="text-[10px] text-pink-400 font-semibold cursor-pointer hover:underline">
                Mais Usados
              </span>
            </div>

            <div className="space-y-1 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredApps.map((app) => (
                <button
                  key={app.name}
                  onClick={() => showNotification(`Iniciando ${app.name}... ✨`)}
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 active:scale-[0.98] transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    {app.icon}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-semibold text-white truncate group-hover:text-pink-300 transition-colors">
                      {app.name}
                    </div>
                    <div className="text-[10px] text-white/50 truncate">{app.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Botão Todos os Programas (Nostalgia Win 7) */}
          <div className="pt-2 border-t border-white/10 px-1">
            <button
              onClick={() => showNotification("Exibindo todos os programas em lista hierárquica!")}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-white/10 text-xs font-semibold text-white/80 hover:text-white transition-colors"
            >
              <span>📂 Todos os Programas</span>
              <ChevronRight size={14} className="text-white/40" />
            </button>
          </div>
        </div>

        {/* Coluna Direita (5 Colunas): Atalhos de Sistema do Windows 7 Aero */}
        <div className="col-span-5 p-3.5 bg-white/[0.03] flex flex-col justify-between space-y-1">
          <div className="space-y-1">
            {/* Usuário */}
            <button
              onClick={() => showNotification(`Abrindo pasta pessoal de ${rawUserName}`)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-xs font-bold text-white transition-all text-left"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-black shadow-xs">
                {userInitials[0] || "U"}
              </div>
              <span className="truncate">{rawUserName}</span>
            </button>

            <div className="my-1.5 border-t border-white/10" />

            {/* Atalhos Clássicos com Ícones Oficiais do Windows */}
            <button
              onClick={() => showNotification("Abrindo pasta Documentos")}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-xs font-medium text-white/90 hover:text-white transition-all text-left"
            >
              <DocumentsFolderIcon size={18} />
              <span>Documentos</span>
            </button>

            <button
              onClick={() => showNotification("Abrindo pasta Imagens")}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-xs font-medium text-white/90 hover:text-white transition-all text-left"
            >
              <PicturesFolderIcon size={18} />
              <span>Imagens</span>
            </button>

            <button
              onClick={() => showNotification("Abrindo pasta Músicas")}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-xs font-medium text-white/90 hover:text-white transition-all text-left"
            >
              <MusicFolderIcon size={18} />
              <span>Músicas</span>
            </button>

            <button
              onClick={() => showNotification("Abrindo pasta Downloads")}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-xs font-medium text-white/90 hover:text-white transition-all text-left"
            >
              <DownloadsFolderIcon size={18} />
              <span>Downloads</span>
            </button>

            <div className="my-1.5 border-t border-white/10" />

            <button
              onClick={() => showNotification("Abrindo Este Computador")}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-xs font-medium text-white/90 hover:text-white transition-all text-left"
            >
              <ThisPCIcon size={18} />
              <span>Este Computador</span>
            </button>

            <button
              onClick={() => showNotification("Abrindo Painel de Controle Clássico")}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-xs font-medium text-white/90 hover:text-white transition-all text-left"
            >
              <ControlPanelIcon size={18} />
              <span>Painel de Controle</span>
            </button>

            <button
              onClick={() => showNotification("Abrindo Configurações do Windows")}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-xs font-medium text-white/90 hover:text-white transition-all text-left"
            >
              <SettingsIcon size={18} />
              <span>Configurações</span>
            </button>
          </div>
        </div>
      </div>

      {/* Rodapé Moderno com Avatar e Opções de Energia */}
      <div className="p-3 px-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full ring-2 ring-pink-500 overflow-hidden bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white">
            <span className="text-xs font-black">{userInitials}</span>
          </div>
          <div>
            <div className="text-xs font-bold text-white">{rawUserName}</div>
            <div className="text-[10px] text-pink-300 font-semibold">Conta do Usuário • {osInfo?.os_name || "Windows"}</div>
          </div>
        </div>

        {/* Botão de Energia Seguro */}
        <div className="relative">
          <button
            onClick={() => setPowerMenuOpen(!powerMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold active:scale-95 transition-all"
            title="Opções de Energia"
          >
            <Power size={13} />
            <span>Energia</span>
          </button>

          {powerMenuOpen && (
            <div className="absolute right-0 bottom-full mb-2 w-36 rounded-xl bg-slate-900 border border-white/20 shadow-xl p-1.5 space-y-1 z-30 animate-in fade-in zoom-in-95">
              <button
                onClick={() => {
                  setPowerMenuOpen(false);
                  showNotification("Suspender computador");
                }}
                className="w-full text-left px-2.5 py-1 rounded-lg text-xs hover:bg-white/10 text-white"
              >
                💤 Suspender
              </button>
              <button
                onClick={() => {
                  setPowerMenuOpen(false);
                  showNotification("Reiniciar computador");
                }}
                className="w-full text-left px-2.5 py-1 rounded-lg text-xs hover:bg-white/10 text-white"
              >
                🔄 Reiniciar
              </button>
              <button
                onClick={() => {
                  setPowerMenuOpen(false);
                  showNotification("Desligar computador");
                }}
                className="w-full text-left px-2.5 py-1 rounded-lg text-xs hover:bg-rose-500/20 text-rose-400 font-bold"
              >
                ⚡ Desligar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
