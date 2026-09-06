import React, { useRef, useEffect } from "react";
import {
  FileText,
  Trash2,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Navigation,
} from "lucide-react";
import { useBotsStore } from "../store/botsStore";

export const LogsView: React.FC = () => {
  const {
    logs,
    logFilter,
    setLogFilter,
    logSearch,
    setLogSearch,
    clearLogs,
  } = useBotsStore();

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    if (logFilter !== "all" && log.level !== logFilter) {
      return false;
    }
    if (
      logSearch.trim() &&
      !log.message.toLowerCase().includes(logSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const exportLogs = () => {
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`)
      .join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `robloxbot_logs_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const levelStyles = {
    info: { bg: "bg-blue-500/10", text: "text-blue-500", label: "INFO" },
    vision: { bg: "bg-purple-500/10", text: "text-purple-500", label: "VISION" },
    movement: { bg: "bg-emerald-500/10", text: "text-emerald-500", label: "MOVE" },
    warning: { bg: "bg-amber-500/10", text: "text-amber-500", label: "WARN" },
    error: { bg: "bg-rose-500/10", text: "text-rose-500", label: "ERROR" },
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-in h-full">
      {/* Console Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "Todos" },
            { id: "info", label: "Info" },
            { id: "vision", label: "Vision" },
            { id: "movement", label: "Movement" },
            { id: "warning", label: "Warning" },
            { id: "error", label: "Error" },
          ].map((f) => {
            const isActive = logFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setLogFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-theme-primary text-white shadow-soft"
                    : "bg-theme-surface-card hover:bg-theme-border/60 text-theme-text-muted hover:text-theme-text border border-theme-border/40"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted"
            />
            <input
              type="text"
              placeholder="Buscar logs..."
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-theme-surface-card border border-theme-border/60 text-xs text-theme-text placeholder-theme-text-muted focus:outline-none focus:border-theme-primary w-40 sm:w-52"
            />
          </div>

          <button
            onClick={clearLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-surface-card hover:bg-rose-500/15 hover:text-rose-500 text-xs font-bold text-theme-text-muted border border-theme-border/60 transition-colors"
            title="Limpar logs"
          >
            <Trash2 size={13} />
            <span className="hidden sm:inline">Limpar</span>
          </button>

          <button
            onClick={exportLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-theme-surface-card hover:bg-theme-border text-xs font-bold text-theme-text border border-theme-border/60 transition-colors"
            title="Exportar logs em arquivo de texto"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-[420px] max-h-[600px] overflow-y-auto rounded-3xl bg-[#0e1117] text-gray-200 p-5 font-mono text-xs leading-relaxed border border-theme-border/80 shadow-inner flex flex-col gap-1.5 select-text"
      >
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 my-auto">
            <FileText size={32} className="opacity-40 mb-2" />
            <span>Nenhum log correspondente aos filtros.</span>
          </div>
        ) : (
          filteredLogs.map((item) => {
            const style = levelStyles[item.level] || levelStyles.info;
            return (
              <div
                key={item.id}
                className="flex items-start gap-2.5 py-0.5 hover:bg-white/[0.03] px-2 rounded-lg transition-colors group"
              >
                <span className="text-gray-500 select-none text-[11px] whitespace-nowrap">
                  {item.timestamp}
                </span>

                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${style.bg} ${style.text} whitespace-nowrap`}
                >
                  {style.label}
                </span>

                <span className="text-gray-200 group-hover:text-white break-all">
                  {item.message}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
