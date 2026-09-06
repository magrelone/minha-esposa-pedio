import React, { useState } from "react";
import {
  FolderArchive,
  Image as ImageIcon,
  Tag,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Plus,
  BarChart3,
  Search,
  Eye,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  Sparkles,
  Layers,
  CopyCheck,
} from "lucide-react";

interface BoundingBox {
  id: string;
  classId: number;
  className: string;
  x: number; // percentage 0..100
  y: number;
  w: number;
  h: number;
}

export const DatasetInspectorView: React.FC = () => {
  const [datasets, setDatasets] = useState([
    {
      id: "mm2-dataset",
      name: "MM2 Coins & Players Dataset",
      game: "Roblox — Murder Mystery 2",
      imageCount: 340,
      labelCount: 340,
      classes: ["coin", "person"],
      split: "70% Treino / 20% Val / 10% Teste",
      invalidBoxes: 0,
      status: "Válido & Balanceado",
      duplicates: 0,
      avgObjectsPerImg: 2.8,
      resolution: "640x640 px",
    },
    {
      id: "teddy-dataset",
      name: "Teddy Bear Search Dataset",
      game: "Roblox — Teddy Demo",
      imageCount: 150,
      labelCount: 150,
      classes: ["teddy"],
      split: "80% Treino / 10% Val / 10% Teste",
      invalidBoxes: 0,
      status: "Pronto para Treino",
      duplicates: 0,
      avgObjectsPerImg: 1.2,
      resolution: "640x640 px",
    },
  ]);

  // Annotation Preview / Tool Modal
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [selectedClass, setSelectedClass] = useState("coin");

  // Sample mock frames with bounding boxes
  const sampleFrames = [
    {
      id: "frame_001.jpg",
      boxes: [
        { id: "b1", classId: 0, className: "coin", x: 42, y: 38, w: 12, h: 14 },
        { id: "b2", classId: 0, className: "coin", x: 68, y: 55, w: 10, h: 12 },
      ] as BoundingBox[],
    },
    {
      id: "frame_002.jpg",
      boxes: [
        { id: "b3", classId: 1, className: "person", x: 30, y: 25, w: 18, h: 42 },
        { id: "b4", classId: 0, className: "coin", x: 75, y: 70, w: 9, h: 11 },
      ] as BoundingBox[],
    },
    {
      id: "frame_003.jpg",
      boxes: [
        { id: "b5", classId: 0, className: "coin", x: 50, y: 48, w: 11, h: 13 },
      ] as BoundingBox[],
    },
  ];

  const [currentBoxes, setCurrentBoxes] = useState<BoundingBox[]>(sampleFrames[0].boxes);

  // New Dataset Modal
  const [newDatasetOpen, setNewDatasetOpen] = useState(false);
  const [newForm, setNewForm] = useState({
    name: "",
    game: "Roblox",
    classes: "target_item",
    splitRatio: "70/20/10",
  });

  const handleNextFrame = () => {
    const nextIdx = (activeImageIndex + 1) % sampleFrames.length;
    setActiveImageIndex(nextIdx);
    setCurrentBoxes(sampleFrames[nextIdx].boxes);
  };

  const handlePrevFrame = () => {
    const prevIdx = (activeImageIndex - 1 + sampleFrames.length) % sampleFrames.length;
    setActiveImageIndex(prevIdx);
    setCurrentBoxes(sampleFrames[prevIdx].boxes);
  };

  const handleAddBox = () => {
    const newBox: BoundingBox = {
      id: `b_${Date.now()}`,
      classId: selectedClass === "coin" ? 0 : 1,
      className: selectedClass,
      x: 45,
      y: 45,
      w: 14,
      h: 16,
    };
    setCurrentBoxes([...currentBoxes, newBox]);
  };

  const handleDeleteBox = (id: string) => {
    setCurrentBoxes(currentBoxes.filter((b) => b.id !== id));
  };

  const handleCreateDataset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name.trim()) return;

    const classList = newForm.classes.split(",").map((s) => s.trim()).filter(Boolean);
    const created = {
      id: `ds-${Date.now()}`,
      name: newForm.name,
      game: newForm.game,
      imageCount: 45,
      labelCount: 45,
      classes: classList.length > 0 ? classList : ["target"],
      split: newForm.splitRatio === "70/20/10" ? "70% Treino / 20% Val / 10% Teste" : "80% Treino / 10% Val / 10% Teste",
      invalidBoxes: 0,
      status: "Criado com Sucesso ✨",
      duplicates: 0,
      avgObjectsPerImg: 1.5,
      resolution: "640x640 px",
    };

    setDatasets([created, ...datasets]);
    setNewDatasetOpen(false);
    setNewForm({ name: "", game: "Roblox", classes: "target_item", splitRatio: "70/20/10" });
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-5xl">
      {/* Header Bar */}
      <div className="p-6 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center text-2xl shadow-soft">
            <FolderArchive size={24} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-black text-theme-text flex items-center gap-2">
              Inspetor de Datasets & Anotações
            </h2>
            <span className="text-xs text-theme-text-muted">
              Valide anotações YOLO, detecte caixas inválidas, analise duplicatas e visualize labels
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 text-xs font-bold text-purple-600 dark:text-purple-400 border border-purple-500/30 shadow-sm transition-colors"
          >
            <Eye size={14} />
            <span>Editor de Anotações</span>
          </button>

          <button
            onClick={() => setNewDatasetOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-theme-primary hover:bg-theme-primary/90 text-xs font-bold text-white shadow-soft transition-colors"
          >
            <Plus size={14} />
            <span>Novo Dataset</span>
          </button>
        </div>
      </div>

      {/* Dataset Cards */}
      <div className="grid grid-cols-1 gap-5">
        {datasets.map((ds) => (
          <div
            key={ds.id}
            className="p-6 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft flex flex-col gap-5 hover:border-pink-300/40 transition-all"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex flex-col">
                <h3 className="text-base font-extrabold text-theme-text">{ds.name}</h3>
                <span className="text-xs text-theme-primary font-semibold">{ds.game}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 size={13} /> {ds.status}
                </span>

                <button
                  onClick={() => setPreviewOpen(true)}
                  className="px-3 py-1 rounded-xl bg-theme-surface-card hover:bg-theme-border/60 text-xs font-bold text-theme-text border border-theme-border/40 flex items-center gap-1"
                >
                  <Eye size={12} className="text-pink-500" />
                  <span>Inspecionar</span>
                </button>
              </div>
            </div>

            {/* Metrics 4-col */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-theme-surface-card border border-theme-border/40 flex flex-col">
                <span className="text-[10px] text-theme-text-muted font-bold uppercase">Imagens</span>
                <span className="text-lg font-black text-theme-text font-mono mt-0.5">{ds.imageCount}</span>
                <span className="text-[10px] text-theme-text-muted mt-0.5">{ds.resolution}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-theme-surface-card border border-theme-border/40 flex flex-col">
                <span className="text-[10px] text-theme-text-muted font-bold uppercase">Labels YOLO (.txt)</span>
                <span className="text-lg font-black text-theme-text font-mono mt-0.5">{ds.labelCount}</span>
                <span className="text-[10px] text-theme-text-muted mt-0.5">~{ds.avgObjectsPerImg} obj/img</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-theme-surface-card border border-theme-border/40 flex flex-col">
                <span className="text-[10px] text-theme-text-muted font-bold uppercase">Divisão de Splits</span>
                <span className="font-semibold text-theme-text text-[11px] mt-1 truncate">{ds.split}</span>
                <span className="text-[10px] text-emerald-500 font-bold mt-0.5">Seed reproduzível</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-theme-surface-card border border-theme-border/40 flex flex-col">
                <span className="text-[10px] text-theme-text-muted font-bold uppercase">Validação de Boxes</span>
                <span className="text-lg font-black text-emerald-500 font-mono mt-0.5">
                  {ds.invalidBoxes} erros
                </span>
                <span className="text-[10px] text-theme-text-muted mt-0.5">0 duplicatas (pHash)</span>
              </div>
            </div>

            {/* Footer with Classes */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-theme-border/40 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-theme-text-muted font-bold text-[11px]">Classes no Dataset:</span>
                <div className="flex flex-wrap gap-1.5">
                  {ds.classes.map((c, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-300 font-mono text-[11px] font-bold border border-pink-300/30"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <span className="text-[11px] text-theme-text-muted italic">
                Formato: <code className="font-mono bg-theme-surface-card px-1.5 py-0.5 rounded">class cx cy w h</code>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL 1: Annotation Preview & Tool */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
          <div className="relative w-full max-w-4xl rounded-3xl bg-theme-surface border border-theme-border/80 shadow-2xl p-6 flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-theme-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center">
                  <Eye size={18} />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-sm font-black text-theme-text flex items-center gap-2">
                    Editor & Visualizador de Bounding Boxes YOLO
                  </h3>
                  <span className="text-[11px] text-theme-text-muted">
                    Imagem: <code className="font-mono text-pink-500">{sampleFrames[activeImageIndex].id}</code> ({activeImageIndex + 1} de {sampleFrames.length})
                  </span>
                </div>
              </div>

              <button
                onClick={() => setPreviewOpen(false)}
                className="p-2 rounded-xl hover:bg-theme-surface-card text-theme-text-muted hover:text-theme-text"
              >
                <X size={16} />
              </button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-theme-surface-card p-3 rounded-2xl border border-theme-border/50">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevFrame}
                  className="px-3 py-1.5 rounded-xl bg-theme-surface hover:bg-theme-border/60 text-xs font-bold text-theme-text border border-theme-border/40 flex items-center gap-1"
                >
                  <ChevronLeft size={14} /> <span>Anterior</span>
                </button>
                <button
                  onClick={handleNextFrame}
                  className="px-3 py-1.5 rounded-xl bg-theme-surface hover:bg-theme-border/60 text-xs font-bold text-theme-text border border-theme-border/40 flex items-center gap-1"
                >
                  <span>Próxima</span> <ChevronRight size={14} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-theme-text-muted">Classe ativa:</span>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="px-3 py-1 rounded-xl bg-theme-surface border border-theme-border/60 text-xs font-mono font-bold text-theme-text focus:outline-none"
                >
                  <option value="coin">0: coin</option>
                  <option value="person">1: person</option>
                  <option value="teddy">2: teddy</option>
                </select>

                <button
                  onClick={handleAddBox}
                  className="px-3 py-1.5 rounded-xl bg-theme-primary hover:bg-theme-primary/90 text-xs font-bold text-white shadow-soft flex items-center gap-1"
                >
                  <Plus size={13} />
                  <span>Criar Box</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setZoom(Math.max(0.75, zoom - 0.25))}
                  className="p-1.5 rounded-xl hover:bg-theme-surface text-theme-text-muted hover:text-theme-text"
                  title="Diminuir Zoom"
                >
                  <ZoomOut size={15} />
                </button>
                <span className="text-xs font-mono font-bold text-theme-text">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom(Math.min(2.0, zoom + 0.25))}
                  className="p-1.5 rounded-xl hover:bg-theme-surface text-theme-text-muted hover:text-theme-text"
                  title="Aumentar Zoom"
                >
                  <ZoomIn size={15} />
                </button>
              </div>
            </div>

            {/* Simulated Game Viewport Canvas */}
            <div className="relative aspect-video w-full rounded-2xl bg-neutral-900 border border-theme-border/80 flex items-center justify-center overflow-hidden">
              <div
                style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
                className="relative w-full h-full bg-gradient-to-b from-neutral-800 to-neutral-950 flex items-center justify-center transition-transform"
              >
                {/* Simulated ground and sky */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-neutral-800/80 border-t border-white/5" />
                <div className="absolute text-neutral-600 font-mono text-[10px] bottom-3 right-3 select-none">
                  Simulação de Frame YOLO 640x640
                </div>

                {/* Render bounding boxes */}
                {currentBoxes.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      left: `${b.x}%`,
                      top: `${b.y}%`,
                      width: `${b.w}%`,
                      height: `${b.h}%`,
                    }}
                    className="absolute border-2 border-pink-400 bg-pink-500/20 rounded-md flex items-start justify-between p-1 group cursor-pointer"
                  >
                    <span className="text-[10px] font-bold bg-pink-500 text-white px-1.5 py-0.2 rounded font-mono shadow-sm">
                      {b.className}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBox(b.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded bg-red-600 text-white hover:bg-red-700 transition-opacity"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* YOLO Normalized Coordinates Table */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-theme-text uppercase">
                Anotações Salvas ({currentBoxes.length} objetos):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {currentBoxes.map((b, i) => {
                  const cx = ((b.x + b.w / 2) / 100).toFixed(4);
                  const cy = ((b.y + b.h / 2) / 100).toFixed(4);
                  const nw = (b.w / 100).toFixed(4);
                  const nh = (b.h / 100).toFixed(4);

                  return (
                    <div
                      key={b.id}
                      className="p-2.5 rounded-xl bg-theme-surface-card border border-theme-border/40 flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-pink-500">
                          {b.classId} ({b.className})
                        </span>
                        <span className="text-[10px] text-theme-text-muted">
                          {cx} {cy} {nw} {nh}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteBox(b.id)}
                        className="p-1 rounded text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-theme-border/60 pt-3">
              <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                <CheckCircle2 size={14} /> Todas as coordenadas validadas (0..1)
              </span>

              <button
                onClick={() => setPreviewOpen(false)}
                className="px-5 py-2 rounded-xl bg-theme-primary hover:bg-theme-primary/90 text-xs font-bold text-white shadow-soft"
              >
                Salvar Anotações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Criar Novo Dataset */}
      {newDatasetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
          <div className="relative w-full max-w-lg rounded-3xl bg-theme-surface border border-theme-border/80 shadow-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-theme-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-pink-500/15 text-pink-500 flex items-center justify-center">
                  <FolderArchive size={18} />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-sm font-black text-theme-text">Criar Novo Dataset</h3>
                  <span className="text-[11px] text-theme-text-muted">
                    Configure as classes e a divisão de treino/validação/teste
                  </span>
                </div>
              </div>

              <button
                onClick={() => setNewDatasetOpen(false)}
                className="p-2 rounded-xl hover:bg-theme-surface-card text-theme-text-muted hover:text-theme-text"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateDataset} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-theme-text">Nome do Dataset</label>
                <input
                  type="text"
                  placeholder="Ex: Ursinhos Gigantes Dataset"
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  className="px-3.5 py-2 rounded-xl bg-theme-surface-card border border-theme-border/60 text-xs text-theme-text focus:outline-none focus:border-pink-500"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-theme-text">Jogo / Experiência</label>
                <input
                  type="text"
                  placeholder="Ex: Roblox — Teddy Collector"
                  value={newForm.game}
                  onChange={(e) => setNewForm({ ...newForm, game: e.target.value })}
                  className="px-3.5 py-2 rounded-xl bg-theme-surface-card border border-theme-border/60 text-xs text-theme-text focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-theme-text">
                  Classes Separadas por Vírgula
                </label>
                <input
                  type="text"
                  placeholder="Ex: teddy, player, coin"
                  value={newForm.classes}
                  onChange={(e) => setNewForm({ ...newForm, classes: e.target.value })}
                  className="px-3.5 py-2 rounded-xl bg-theme-surface-card border border-theme-border/60 text-xs font-mono text-theme-text focus:outline-none focus:border-pink-500"
                />
                <span className="text-[10px] text-theme-text-muted">
                  A numeração das classes YOLO começará do índice 0.
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-theme-text">Divisão de Splits</label>
                <select
                  value={newForm.splitRatio}
                  onChange={(e) => setNewForm({ ...newForm, splitRatio: e.target.value })}
                  className="px-3.5 py-2 rounded-xl bg-theme-surface-card border border-theme-border/60 text-xs text-theme-text focus:outline-none"
                >
                  <option value="70/20/10">70% Treino / 20% Validação / 10% Teste (Padrão)</option>
                  <option value="80/10/10">80% Treino / 10% Validação / 10% Teste</option>
                </select>
              </div>

              <div className="p-4 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex flex-col gap-1 text-xs">
                <span className="font-extrabold text-pink-600 dark:text-pink-400 flex items-center gap-1.5">
                  <Sparkles size={14} /> Geração Automática
                </span>
                <span className="text-[11px] text-theme-text-muted">
                  O SDK criará automaticamente os diretórios <code>images/train</code>, <code>labels/train</code> e o arquivo <code>dataset.yaml</code>.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-theme-border/60">
                <button
                  type="button"
                  onClick={() => setNewDatasetOpen(false)}
                  className="px-4 py-2 rounded-xl bg-theme-surface-card hover:bg-theme-border text-xs font-bold text-theme-text"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-theme-primary hover:bg-theme-primary/90 text-xs font-bold text-white shadow-soft"
                >
                  Criar Dataset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
