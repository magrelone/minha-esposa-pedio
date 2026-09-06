import React, { useState } from "react";
import {
  Wand2,
  Check,
  ChevronRight,
  ChevronLeft,
  Bot,
  Sparkles,
  AlertCircle,
  FolderCheck,
  Play,
} from "lucide-react";
import { useBotsStore } from "../store/botsStore";

export const BotCreatorWizard: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [game, setGame] = useState("Roblox");
  const [botName, setBotName] = useState("");
  const [targetObject, setTargetObject] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [hasModel, setHasModel] = useState<boolean | null>(null);
  const [actions, setActions] = useState<string[]>(["MOVE_FORWARD", "JUMP"]);
  const [createdPath, setCreatedPath] = useState<string | null>(null);

  const { discoveredModels, addLog } = useBotsStore();

  const handleCreateScaffold = () => {
    const slug = botName.toLowerCase().replace(/\s+/g, "_");
    setCreatedPath(`bots/${game.toLowerCase()}/${slug}`);
    addLog("info", `Scaffold gerado com sucesso: bots/${game.toLowerCase()}/${slug} ✨`);
    setStep(5);
  };

  return (
    <div className="flex flex-col gap-6 p-6 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft max-w-2xl mx-auto animate-fade-in">
      {/* Wizard Header */}
      <div className="flex items-center justify-between border-b border-theme-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-pink-500/15 text-pink-500 flex items-center justify-center text-xl shadow-inner">
            <Wand2 size={20} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-base font-black text-theme-text">
              Assistente de Criação de Bot
            </h2>
            <span className="text-xs text-theme-text-muted">
              Crie a estrutura completa do seu bot em 5 etapas simples
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${
                step === s
                  ? "bg-theme-primary text-white"
                  : step > s
                  ? "bg-emerald-500 text-white"
                  : "bg-theme-surface-card text-theme-text-muted border border-theme-border/60"
              }`}
            >
              {step > s ? <Check size={12} /> : s}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Game & Bot Name */}
      {step === 1 && (
        <div className="flex flex-col gap-4 text-xs">
          <h3 className="text-sm font-extrabold text-theme-text">
            Etapa 1: Qual o Jogo e Nome do Bot?
          </h3>
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-theme-text">Jogo / Plataforma:</label>
            <input
              type="text"
              value={game}
              onChange={(e) => setGame(e.target.value)}
              placeholder="Ex.: Roblox, Minecraft, CS2..."
              className="px-3.5 py-2.5 rounded-2xl bg-theme-surface-card border border-theme-border/60 text-theme-text focus:outline-none focus:border-theme-primary text-xs"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-theme-text">Nome do Bot:</label>
            <input
              type="text"
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              placeholder="Ex.: Teddy Collector, Auto Woodcutter..."
              className="px-3.5 py-2.5 rounded-2xl bg-theme-surface-card border border-theme-border/60 text-theme-text focus:outline-none focus:border-theme-primary text-xs"
            />
          </div>
        </div>
      )}

      {/* Step 2: What to detect */}
      {step === 2 && (
        <div className="flex flex-col gap-4 text-xs">
          <h3 className="text-sm font-extrabold text-theme-text">
            Etapa 2: O que o bot deverá encontrar na tela?
          </h3>
          <div className="flex flex-col gap-1.5">
            <label className="font-bold text-theme-text">Objeto / Classe Alvo:</label>
            <input
              type="text"
              value={targetObject}
              onChange={(e) => setTargetObject(e.target.value)}
              placeholder="Ex.: coin, teddy, tree, enemy..."
              className="px-3.5 py-2.5 rounded-2xl bg-theme-surface-card border border-theme-border/60 text-theme-text focus:outline-none focus:border-theme-primary text-xs font-mono"
            />
          </div>
          <p className="text-xs text-theme-text-muted leading-relaxed">
            Esta será a classe detectada pela rede neural convolucional para direcionar o movimento do bot.
          </p>
        </div>
      )}

      {/* Step 3: Model existence */}
      {step === 3 && (
        <div className="flex flex-col gap-4 text-xs">
          <h3 className="text-sm font-extrabold text-theme-text">
            Etapa 3: Já existe modelo treinado para '{targetObject || "o objeto"}'?
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setHasModel(true)}
              className={`p-4 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                hasModel === true
                  ? "bg-pink-500/10 border-pink-500 shadow-sm"
                  : "bg-theme-surface-card border-theme-border/60"
              }`}
            >
              <span className="font-bold text-theme-text">Sim, já tenho o modelo</span>
              <span className="text-[11px] text-theme-text-muted">
                Selecionar arquivo .pt do Model Registry
              </span>
            </button>

            <button
              onClick={() => setHasModel(false)}
              className={`p-4 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                hasModel === false
                  ? "bg-pink-500/10 border-pink-500 shadow-sm"
                  : "bg-theme-surface-card border-theme-border/60"
              }`}
            >
              <span className="font-bold text-theme-text">Não, preciso treinar</span>
              <span className="text-[11px] text-theme-text-muted">
                Preparar dataset e modelo (MODEL_REQUIRED)
              </span>
            </button>
          </div>

          {hasModel === true && (
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="font-bold text-theme-text">Escolha o modelo:</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="px-3.5 py-2.5 rounded-2xl bg-theme-surface-card border border-theme-border/60 text-theme-text text-xs font-mono"
              >
                <option value="">Selecione um modelo...</option>
                {discoveredModels.map((m) => (
                  <option key={m.id} value={m.filename}>
                    {m.filename} ({m.classes.join(", ")})
                  </option>
                ))}
              </select>
            </div>
          )}

          {hasModel === false && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
              <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1 text-[11px] text-amber-600 dark:text-amber-300">
                <span className="font-bold">Aviso da Arquitetura:</span>
                <span>
                  O bot será gerado com o status <code>MODEL_REQUIRED</code>. Você poderá coletar imagens e treiná-lo na aba Treinamento.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Actions selection */}
      {step === 4 && (
        <div className="flex flex-col gap-4 text-xs">
          <h3 className="text-sm font-extrabold text-theme-text">
            Etapa 4: Quais ações o bot deverá executar?
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "MOVE_FORWARD", label: "Avançar (W)" },
              { id: "MOVE_BACKWARD", label: "Recuar (S)" },
              { id: "MOVE_LEFT", label: "Esquerda (A)" },
              { id: "MOVE_RIGHT", label: "Direita (D)" },
              { id: "JUMP", label: "Pular (Space)" },
              { id: "EXPLORE", label: "Exploração Aleatória" },
            ].map((act) => {
              const isSelected = actions.includes(act.id);
              return (
                <button
                  key={act.id}
                  onClick={() => {
                    if (isSelected) setActions(actions.filter((a) => a !== act.id));
                    else setActions([...actions, act.id]);
                  }}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                    isSelected
                      ? "bg-theme-primary text-white border-theme-primary shadow-soft"
                      : "bg-theme-surface-card border-theme-border/60 text-theme-text-muted hover:text-theme-text"
                  }`}
                >
                  <span>{act.label}</span>
                  {isSelected && <Check size={14} />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 5: Finished */}
      {step === 5 && (
        <div className="flex flex-col items-center justify-center text-center gap-4 py-4 text-xs">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-3xl shadow-soft">
            <FolderCheck size={32} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-black text-theme-text">
              Bot Gerado com Sucesso! ✨
            </h3>
            <span className="font-mono text-theme-primary">{createdPath}</span>
          </div>
          <p className="text-xs text-theme-text-muted max-w-md">
            O manifesto <code>bot.json</code>, a estratégia <code>strategy.py</code> e o executor <code>main.py</code> foram criados em conformidade com o Bot SDK.
          </p>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="flex items-center justify-between border-t border-theme-border/60 pt-4">
        {step > 1 && step < 5 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-theme-text-muted hover:bg-theme-surface-card"
          >
            <ChevronLeft size={14} /> Voltar
          </button>
        ) : (
          <div />
        )}

        {step < 4 && (
          <button
            disabled={step === 1 && (!game.trim() || !botName.trim())}
            onClick={() => setStep(step + 1)}
            className="flex items-center gap-1 px-5 py-2.5 rounded-2xl bg-theme-primary hover:bg-theme-primary/90 text-xs font-bold text-white shadow-soft disabled:opacity-50"
          >
            Próximo <ChevronRight size={14} />
          </button>
        )}

        {step === 4 && (
          <button
            onClick={handleCreateScaffold}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-xs font-black text-white shadow-soft"
          >
            <Sparkles size={14} /> Criar Bot Scaffold
          </button>
        )}

        {step === 5 && (
          <button
            onClick={onComplete}
            className="px-6 py-2.5 rounded-2xl bg-theme-primary text-xs font-bold text-white shadow-soft"
          >
            Concluir & Fechar
          </button>
        )}
      </div>
    </div>
  );
};
