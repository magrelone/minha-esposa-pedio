import React, { useState, useEffect, useRef } from "react";
import {
  Radar,
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Play,
  Pause,
  MapPin,
  Sparkles,
  Shield,
  Eye,
  Crosshair,
  Download,
  Info,
  Maximize2,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Save,
} from "lucide-react";
import { useBotsStore } from "../store/botsStore";

export interface NavMeshStreet {
  id: string;
  name: string;
  type: "plaza" | "avenue" | "street" | "bridge" | "alley" | "courtyard" | "hall" | "corridor" | "terrace";
  walkable: true;
  surface: string;
  bounds: { x: number; y: number; w: number; h: number };
  description: string;
}

export interface NavMeshObstacle {
  id: string;
  name: string;
  type: "building" | "wall" | "water" | "natural_barrier" | "stalls" | "furniture";
  walkable: false;
  height_meters: number;
  bounds: { x: number; y: number; w: number; h: number };
  description: string;
}

export interface MapWaypoint {
  id: string;
  name: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  type: "patrol" | "spawn" | "danger" | "rest";
  label?: string;
  description: string;
  connected_to?: string[];
}

export interface SavedMap {
  id: string;
  title: string;
  game: string;
  category: string;
  dimensions: string;
  totalWaypoints: number;
  itemSpawns: number;
  themeColor: string;
  bounds: { width: number; height: number };
  walkableStreets: NavMeshStreet[];
  obstaclesAndWalls: NavMeshObstacle[];
  waypoints: MapWaypoint[];
}

export const PRESET_MAPS: SavedMap[] = [
  {
    id: "hanami-district",
    title: "Distrito de Hanami — Circuito Sagrado",
    game: "Roblox — Distrito de Hanami",
    category: "Mapeamento AFK & Espíritos",
    dimensions: "320m x 320m",
    totalWaypoints: 6,
    itemSpawns: 4,
    themeColor: "#ec4899", // pink
    bounds: { width: 800, height: 800 },
    walkableStreets: [
      {
        id: "street-main-plaza",
        name: "Alameda Principal das Cerejeiras",
        type: "plaza",
        walkable: true,
        surface: "Calçamento de Pedra",
        bounds: { x: 42, y: 42, w: 16, h: 16 },
        description: "Largo central com pavimento de lajotas de pedra e cerejeiras floridas.",
      },
      {
        id: "street-bamboo-corridor",
        name: "Avenida dos Bambuzais & Linha Férrea",
        type: "avenue",
        walkable: true,
        surface: "Cascalho com Trilhos",
        bounds: { x: 58, y: 34, w: 26, h: 14 },
        description: "Corredor leste ladeado por lanternas de pedra onde surgem os Ursos Brancos.",
      },
      {
        id: "bridge-sacred",
        name: "Ponte Tradicional Japonesa de Madeira",
        type: "bridge",
        walkable: true,
        surface: "Pranchas de Madeira",
        bounds: { x: 70, y: 62, w: 12, h: 18 },
        description: "Estrutura arqueada de madeira vermelha sobre o córrego sagrado.",
      },
      {
        id: "street-shrine-path",
        name: "Pátio de Entrada do Templo Secreto",
        type: "courtyard",
        walkable: true,
        surface: "Lajotas de Pedra Escura",
        bounds: { x: 36, y: 72, w: 24, h: 14 },
        description: "Alameda de lajotas escuras sob o portal Torii propícia para spawn dos Ursos Pretos.",
      },
      {
        id: "street-teahouse-alley",
        name: "Beco das Casas de Chá Tradicionais",
        type: "alley",
        walkable: true,
        surface: "Paralelepípedo",
        bounds: { x: 18, y: 56, w: 16, h: 22 },
        description: "Viela estreita margeando as varandas de madeira das vilas de chá.",
      },
      {
        id: "street-north-connect",
        name: "Travessa Noroeste de Retorno",
        type: "street",
        walkable: true,
        surface: "Calçamento de Pedra",
        bounds: { x: 24, y: 32, w: 20, h: 12 },
        description: "Via de conexão fechando o circuito de patrulha de volta à praça central.",
      },
    ],
    obstaclesAndWalls: [
      {
        id: "wall-teahouse-complex",
        name: "Complexo das Casas de Chá (Construção)",
        type: "building",
        walkable: false,
        height_meters: 4.5,
        bounds: { x: 6, y: 52, w: 14, h: 32 },
        description: "Edificações de madeira com telhado tradicional japonês (colisão física total).",
      },
      {
        id: "wall-shrine-boundary",
        name: "Muralha de Pedra do Templo Sagrado",
        type: "wall",
        walkable: false,
        height_meters: 3.0,
        bounds: { x: 30, y: 88, w: 40, h: 8 },
        description: "Muro perimetral maciço delimitando o fundo do vilarejo.",
      },
      {
        id: "water-sacred-stream",
        name: "Córrego d'Água Profundo (Sem Voo)",
        type: "water",
        walkable: false,
        height_meters: 0.8,
        bounds: { x: 66, y: 82, w: 28, h: 10 },
        description: "Margem d'água inacessível sem passar pela ponte tradicional.",
      },
      {
        id: "wall-bamboo-dense-forest",
        name: "Floresta Densa de Bambu (Barreira Natural)",
        type: "natural_barrier",
        walkable: false,
        height_meters: 8.0,
        bounds: { x: 86, y: 16, w: 12, h: 42 },
        description: "Mata fechada com densidade intransponível para avatares.",
      },
      {
        id: "wall-market-stalls",
        name: "Bancas do Mercado Tradicional de Hanami",
        type: "stalls",
        walkable: false,
        height_meters: 2.2,
        bounds: { x: 34, y: 14, w: 28, h: 8 },
        description: "Quiosques com esteiras e toldos decorados de cerejeiras.",
      },
    ],
    waypoints: [
      { id: "wp-1", name: "Praça Central de Hanami", x: 50, y: 50, type: "patrol", label: "WP-01", description: "Início da rota e alameda principal de cerejeiras.", connected_to: ["wp-2", "wp-6"] },
      { id: "wp-2", name: "Trilha dos Bambus & Trilhos", x: 72, y: 40, type: "patrol", label: "WP-02", description: "Linha férrea com forte spawn de Ursos Brancos.", connected_to: ["wp-1", "wp-3"] },
      { id: "wp-3", name: "Ponte Tradicional Japonesa", x: 75, y: 70, type: "patrol", label: "WP-03", description: "Travessia de água em direção ao templo sagrado.", connected_to: ["wp-2", "wp-4"] },
      { id: "wp-4", name: "Jardim do Templo Secreto", x: 45, y: 78, type: "patrol", label: "WP-04", description: "Área sombreada onde surgem os Ursos Pretos.", connected_to: ["wp-3", "wp-5"] },
      { id: "wp-5", name: "Casas de Chá de Hanami", x: 25, y: 65, type: "patrol", label: "WP-05", description: "Retorno contornando as vilas e lanternas de pedra.", connected_to: ["wp-4", "wp-6"] },
      { id: "wp-6", name: "Retorno à Alameda", x: 30, y: 38, type: "patrol", label: "WP-06", description: "Fechamento do circuito de patrulha contínua.", connected_to: ["wp-5", "wp-1"] },
      // Spawns
      { id: "sp-1", name: "Spawn Urso Branco (Sakura)", x: 68, y: 45, type: "spawn", label: "🌸 Branco", description: "Ponto de alta frequência de espíritos brancos na alameda." },
      { id: "sp-2", name: "Spawn Urso Branco (Sakura)", x: 80, y: 65, type: "spawn", label: "🌸 Branco", description: "Perto da cerejeira ancestral da ponte japonesa." },
      { id: "sp-3", name: "Spawn Urso Preto (Kuro)", x: 40, y: 82, type: "spawn", label: "🐾 Preto", description: "Área de penumbra sob o portal torii do templo." },
      { id: "sp-4", name: "Spawn Urso Preto (Kuro)", x: 22, y: 70, type: "spawn", label: "🐾 Preto", description: "Beco lateral sombreado da casa de chá tradicional." },
    ],
  },
  {
    id: "mm2-mansion",
    title: "MM2 — Mansão Clássica",
    game: "Roblox — Murder Mystery 2",
    category: "Coleta de Moedas & Evasão",
    dimensions: "240m x 240m",
    totalWaypoints: 5,
    itemSpawns: 3,
    themeColor: "#eab308", // gold
    bounds: { width: 600, height: 600 },
    walkableStreets: [
      {
        id: "corridor-main-hall",
        name: "Salão Nobre & Lustre Central",
        type: "hall",
        walkable: true,
        surface: "Mármore com Tapete",
        bounds: { x: 38, y: 38, w: 24, h: 24 },
        description: "Salão com tapete vermelho e escadaria dupla para o piso superior.",
      },
      {
        id: "corridor-library-pass",
        name: "Corredor Leste da Biblioteca",
        type: "corridor",
        walkable: true,
        surface: "Parquet de Madeira",
        bounds: { x: 18, y: 28, w: 20, h: 16 },
        description: "Passagem ladeada por estantes altas com esconderijo de moedas.",
      },
      {
        id: "corridor-kitchen-pass",
        name: "Corredor Sul da Cozinha",
        type: "corridor",
        walkable: true,
        surface: "Lajotas Pretas e Brancas",
        bounds: { x: 24, y: 64, w: 18, h: 18 },
        description: "Piso xadrez com acesso à despensa e porta dos fundos.",
      },
      {
        id: "corridor-garden-terrace",
        name: "Terraço do Jardim Traseiro",
        type: "terrace",
        walkable: true,
        surface: "Lajes de Pedra",
        bounds: { x: 64, y: 64, w: 24, h: 20 },
        description: "Área aberta externa com baixo risco de emboscada.",
      },
    ],
    obstaclesAndWalls: [
      {
        id: "wall-mansion-perimeter",
        name: "Paredes Externas da Mansão",
        type: "wall",
        walkable: false,
        height_meters: 5.0,
        bounds: { x: 8, y: 8, w: 84, h: 4 },
        description: "Muralha de pedra e alvenaria intransponível.",
      },
      {
        id: "wall-library-divider",
        name: "Estantes Maciças de Livros (Colisão)",
        type: "furniture",
        walkable: false,
        height_meters: 3.2,
        bounds: { x: 14, y: 14, w: 18, h: 12 },
        description: "Mobiliário pesado bloqueando passagem direta.",
      },
      {
        id: "wall-kitchen-counters",
        name: "Bancadas e Fogão Industrial",
        type: "furniture",
        walkable: false,
        height_meters: 1.2,
        bounds: { x: 14, y: 80, w: 14, h: 12 },
        description: "Ilha de cozinha que força contorno pelo corredor.",
      },
    ],
    waypoints: [
      { id: "mm-1", name: "Lobby & Salão Principal", x: 50, y: 50, type: "patrol", label: "Salão", description: "Área central com lustre e escadaria dupla." },
      { id: "mm-2", name: "Biblioteca Secreta", x: 25, y: 35, type: "patrol", label: "Biblio", description: "Estantes e esconderijo de moedas douradas." },
      { id: "mm-3", name: "Porão Escuro", x: 75, y: 25, type: "danger", label: "Porão", description: "Área de perigo com rota de fuga rápida." },
      { id: "mm-4", name: "Jardim dos Fundos", x: 80, y: 75, type: "patrol", label: "Jardim", description: "Caminho externo com baixa densidade de jogadores." },
      { id: "mm-5", name: "Cozinha & Despensa", x: 30, y: 75, type: "patrol", label: "Cozinha", description: "Passagem estreita com moedas frequentes." },
      { id: "coin-1", name: "Spawn Moeda Dourada", x: 48, y: 52, type: "spawn", label: "🪙 100%", description: "Ponto no tapete central do salão." },
      { id: "coin-2", name: "Spawn Moeda Dourada", x: 28, y: 38, type: "spawn", label: "🪙 90%", description: "Atrás da poltrona da biblioteca." },
      { id: "coin-3", name: "Spawn Moeda Dourada", x: 78, y: 70, type: "spawn", label: "🪙 85%", description: "Chafariz do jardim exterior." },
    ],
  },
];

type InspectableElement =
  | { kind: "street"; data: NavMeshStreet }
  | { kind: "obstacle"; data: NavMeshObstacle }
  | { kind: "waypoint"; data: MapWaypoint };

export const HolographicMapView: React.FC = () => {
  const { activeBotId } = useBotsStore();
  const [selectedMapId, setSelectedMapId] = useState<string>(
    activeBotId === "roblox-mm2-coin-collector" ? "mm2-mansion" : "hanami-district"
  );
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Layer toggles
  const [showStreets, setShowStreets] = useState(true);
  const [showObstacles, setShowObstacles] = useState(true);
  const [showWaypoints, setShowWaypoints] = useState(true);
  const [showSpawns, setShowSpawns] = useState(true);
  const [showPath, setShowPath] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showRadarSweep, setShowRadarSweep] = useState(true);

  // Selected element for inspection (street, wall or waypoint)
  const [selectedElement, setSelectedElement] = useState<InspectableElement | null>(null);

  // Toast message
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  // Bot simulation marker on the holographic map
  const [botPos, setBotPos] = useState<{ x: number; y: number; angle: number }>({ x: 50, y: 50, angle: 45 });
  const [isSimulating, setIsSimulating] = useState(true);

  const activeMap = PRESET_MAPS.find((m) => m.id === selectedMapId) || PRESET_MAPS[0];

  // Animate bot position walking through waypoints
  useEffect(() => {
    if (!isSimulating) return;
    const patrolWps = activeMap.waypoints.filter((w) => w.type === "patrol");
    if (patrolWps.length === 0) return;

    let step = 0;
    const interval = setInterval(() => {
      step = (step + 1) % patrolWps.length;
      const target = patrolWps[step];
      setBotPos((prev) => {
        const dx = target.x - prev.x;
        const dy = target.y - prev.y;
        const angle = Math.round((Math.atan2(dy, dx) * 180) / Math.PI) + 90;
        return { x: target.x, y: target.y, angle };
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [isSimulating, activeMap]);

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
  };

  const handleMouseUp = () => setIsPanning(false);

  // Export and download active NavMesh JSON
  const handleExportNavMesh = () => {
    const navmeshData = {
      map_id: activeMap.id,
      map_name: activeMap.title,
      game: activeMap.game,
      version: "2.0-navmesh",
      coordinate_system: "2d_normalized_percentage",
      dimensions: {
        width_meters: parseInt(activeMap.dimensions.split("x")[0]) || 320,
        height_meters: parseInt(activeMap.dimensions.split("x")[1]) || 320,
      },
      walkable_streets: activeMap.walkableStreets,
      obstacles_and_walls: activeMap.obstaclesAndWalls,
      patrol_nodes: activeMap.waypoints.filter((w) => w.type === "patrol"),
      spirit_spawns: activeMap.waypoints.filter((w) => w.type === "spawn"),
    };

    const jsonStr = JSON.stringify(navmeshData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeMap.id}_navmesh.json`;
    link.click();
    URL.revokeObjectURL(url);

    setSavedFeedback(`NavMesh salvo e exportado com sucesso (${activeMap.id}_navmesh.json)! 🌸`);
    setTimeout(() => setSavedFeedback(null), 4000);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in select-none">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center text-xl shadow-inner">
            <Radar size={22} className="animate-spin" style={{ animationDuration: "8s" }} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-theme-text">Cartografia & Mapeamento 2D Holográfico</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 font-extrabold tracking-wider uppercase border border-cyan-500/30">
                NavMesh Ativo
              </span>
            </div>
            <span className="text-xs text-theme-text-muted">
              Malha tática persistente de ruas andáveis, paredes e zonas de spawn de espíritos
            </span>
          </div>
        </div>

        {/* Map Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {PRESET_MAPS.map((map) => (
            <button
              key={map.id}
              onClick={() => {
                setSelectedMapId(map.id);
                setSelectedElement(null);
                setPan({ x: 0, y: 0 });
                setZoom(1);
              }}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all ${
                selectedMapId === map.id
                  ? "bg-cyan-500/15 text-cyan-400 border-cyan-500 shadow-soft ring-1 ring-cyan-500/30"
                  : "bg-theme-surface-card text-theme-text-muted border-theme-border hover:text-theme-text"
              }`}
            >
              {map.title.split("—")[0].trim()}
            </button>
          ))}

          <button
            onClick={handleExportNavMesh}
            className="px-3.5 py-2 rounded-2xl text-xs font-bold bg-cyan-500 text-black hover:bg-cyan-400 transition-all flex items-center gap-1.5 shadow-soft"
            title="Exportar NavMesh em formato JSON para disco"
          >
            <Download size={14} />
            <span>Salvar NavMesh (.json)</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {savedFeedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in shadow-soft">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{savedFeedback}</span>
        </div>
      )}

      {/* Main Hologram Viewport & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Holographic Radar Canvas (Col 1 to 3) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden bg-[#030712] border-2 border-cyan-500/40 shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing group"
          >
            {/* Holographic Grid Background */}
            {showGrid && (
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ffff08_1px,transparent_1px),linear-gradient(to_bottom,#00ffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
            )}

            {/* Radar Circular Sweep Scanner Effect */}
            {showRadarSweep && (
              <div className="absolute w-[80%] aspect-square rounded-full border border-cyan-500/15 pointer-events-none flex items-center justify-center animate-pulse">
                <div className="w-[66%] aspect-square rounded-full border border-cyan-500/20" />
                <div className="w-[33%] aspect-square rounded-full border border-cyan-500/25" />
                {/* Rotating Beam */}
                <div
                  className="absolute inset-0 rounded-full border-r border-cyan-400/40 pointer-events-none animate-spin"
                  style={{
                    animationDuration: "4s",
                    background: "conic-gradient(from 0deg at 50% 50%, rgba(6, 182, 212, 0.15) 0deg, transparent 60deg, transparent 360deg)",
                  }}
                />
              </div>
            )}

            {/* Coordinate Crosshairs & Compass Readout */}
            <div className="absolute top-4 left-4 flex flex-col gap-1 text-[11px] font-mono text-cyan-400/90 pointer-events-none bg-black/60 p-2.5 rounded-xl border border-cyan-500/30 backdrop-blur-md">
              <div className="flex items-center gap-2 font-black text-cyan-300">
                <Compass size={13} className="text-cyan-400" />
                <span>RADAR TÁTICO HOLOGRÁFICO</span>
              </div>
              <div>X: {(botPos.x * 3.2).toFixed(1)}m | Y: {(botPos.y * 3.2).toFixed(1)}m</div>
              <div>RUMO: {botPos.angle}° | MAPA: {activeMap.dimensions}</div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>NAVMESH: {activeMap.walkableStreets.length} RUAS | {activeMap.obstaclesAndWalls.length} PAREDES</span>
              </div>
            </div>

            {/* Zoom & View Controls Overlay */}
            <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/60 p-1.5 rounded-2xl border border-cyan-500/30 backdrop-blur-md z-20">
              <button
                onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
                className="p-1.5 rounded-xl hover:bg-cyan-500/20 text-cyan-400 transition-colors"
                title="Aumentar Zoom"
              >
                <ZoomIn size={16} />
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
                className="p-1.5 rounded-xl hover:bg-cyan-500/20 text-cyan-400 transition-colors"
                title="Diminuir Zoom"
              >
                <ZoomOut size={16} />
              </button>
              <button
                onClick={() => {
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                }}
                className="p-1.5 rounded-xl hover:bg-cyan-500/20 text-cyan-400 transition-colors"
                title="Resetar Posição"
              >
                <RotateCcw size={15} />
              </button>
            </div>

            {/* Transformed Hologram Container */}
            <div
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transition: isPanning ? "none" : "transform 0.3s ease-out",
              }}
              className="relative w-full h-full max-w-xl max-h-[85%] aspect-square flex items-center justify-center pointer-events-auto"
            >
              {/* Outer Map Holographic Boundary */}
              <div className="absolute inset-4 rounded-3xl border-2 border-dashed border-cyan-500/30 bg-cyan-950/10 backdrop-blur-[2px] shadow-[0_0_50px_rgba(6,182,212,0.15)]" />

              {/* 1. CAMADA DE RUAS & NAVMESH ANDÁVEL */}
              {showStreets && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                  <defs>
                    <pattern id="streetHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                      <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(6, 182, 212, 0.2)" strokeWidth="1.5" />
                    </pattern>
                  </defs>
                  {activeMap.walkableStreets.map((st) => {
                    const isSelected = selectedElement?.kind === "street" && selectedElement.data.id === st.id;
                    return (
                      <g key={st.id} className="pointer-events-auto cursor-pointer" onClick={(e) => {
                        e.stopPropagation();
                        setSelectedElement({ kind: "street", data: st });
                      }}>
                        <rect
                          x={`${st.bounds.x}%`}
                          y={`${st.bounds.y}%`}
                          width={`${st.bounds.w}%`}
                          height={`${st.bounds.h}%`}
                          rx="8"
                          fill="rgba(6, 182, 212, 0.14)"
                          stroke={isSelected ? "#00ffff" : "rgba(6, 182, 212, 0.6)"}
                          strokeWidth={isSelected ? "2.5" : "1.5"}
                          strokeDasharray="4 2"
                          className="transition-all hover:fill-cyan-500/25"
                        />
                        <rect
                          x={`${st.bounds.x}%`}
                          y={`${st.bounds.y}%`}
                          width={`${st.bounds.w}%`}
                          height={`${st.bounds.h}%`}
                          rx="8"
                          fill="url(#streetHatch)"
                        />
                        <text
                          x={`${st.bounds.x + st.bounds.w / 2}%`}
                          y={`${st.bounds.y + st.bounds.h / 2}%`}
                          fill="rgba(6, 182, 212, 0.9)"
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="pointer-events-none select-none"
                        >
                          {st.name.split(" ")[0]}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              )}

              {/* 2. CAMADA DE PAREDES & CONSTRUÇÕES (OBSTÁCULOS DE COLISÃO) */}
              {showObstacles && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
                  <defs>
                    <pattern id="wallHazardHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                      <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(244, 63, 94, 0.4)" strokeWidth="2" />
                    </pattern>
                  </defs>
                  {activeMap.obstaclesAndWalls.map((obs) => {
                    const isSelected = selectedElement?.kind === "obstacle" && selectedElement.data.id === obs.id;
                    return (
                      <g key={obs.id} className="pointer-events-auto cursor-pointer" onClick={(e) => {
                        e.stopPropagation();
                        setSelectedElement({ kind: "obstacle", data: obs });
                      }}>
                        <rect
                          x={`${obs.bounds.x}%`}
                          y={`${obs.bounds.y}%`}
                          width={`${obs.bounds.w}%`}
                          height={`${obs.bounds.h}%`}
                          rx="6"
                          fill="rgba(244, 63, 94, 0.18)"
                          stroke={isSelected ? "#ff0055" : "rgba(244, 63, 94, 0.7)"}
                          strokeWidth={isSelected ? "2.5" : "1.5"}
                          className="transition-all hover:fill-rose-500/30"
                        />
                        <rect
                          x={`${obs.bounds.x}%`}
                          y={`${obs.bounds.y}%`}
                          width={`${obs.bounds.w}%`}
                          height={`${obs.bounds.h}%`}
                          rx="6"
                          fill="url(#wallHazardHatch)"
                        />
                        <text
                          x={`${obs.bounds.x + obs.bounds.w / 2}%`}
                          y={`${obs.bounds.y + obs.bounds.h / 2}%`}
                          fill="rgba(255, 100, 130, 0.9)"
                          fontSize="8"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="pointer-events-none select-none"
                        >
                          🧱 {obs.height_meters}m
                        </text>
                      </g>
                    );
                  })}
                </svg>
              )}

              {/* 3. CAMADA DE TRAÇADO DE LASER ENTRE WAYPOINTS */}
              {showPath && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-15 overflow-visible">
                  <defs>
                    <linearGradient id="holoPathGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#ec4899" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                  <polyline
                    points={activeMap.waypoints
                      .filter((w) => w.type === "patrol")
                      .map((w) => `${w.x * 5.6},${w.y * 5.6}`)
                      .join(" ")}
                    fill="none"
                    stroke="url(#holoPathGrad)"
                    strokeWidth="2.5"
                    strokeDasharray="6,4"
                    className="drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse"
                  />
                </svg>
              )}

              {/* 4. WAYPOINTS & PONTOS DE SPAWN */}
              {showWaypoints &&
                activeMap.waypoints.map((wp) => {
                  const isSelected = selectedElement?.kind === "waypoint" && selectedElement.data.id === wp.id;
                  const isSpawn = wp.type === "spawn";
                  const isDanger = wp.type === "danger";

                  if (isSpawn && !showSpawns) return null;

                  return (
                    <div
                      key={wp.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedElement({ kind: "waypoint", data: wp });
                      }}
                      style={{
                        left: `${wp.x}%`,
                        top: `${wp.y}%`,
                      }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group/node transition-all hover:scale-125 ${
                        isSelected ? "scale-125 z-30" : ""
                      }`}
                    >
                      {/* Node Glowing Badge */}
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono text-[10px] font-black shadow-lg transition-all ${
                          isSpawn
                            ? "bg-pink-500/90 text-white border-2 border-pink-300 shadow-pink-500/50"
                            : isDanger
                            ? "bg-rose-600/90 text-white border-2 border-rose-300 shadow-rose-600/50"
                            : "bg-cyan-500/90 text-black border-2 border-cyan-200 shadow-cyan-500/50"
                        } ${isSelected ? "ring-4 ring-white" : ""}`}
                      >
                        {isSpawn ? "🌸" : isDanger ? "⚠️" : wp.label || "WP"}
                      </div>

                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/node:flex flex-col items-center pointer-events-none z-40">
                        <div className="bg-black/90 text-white text-[10px] font-bold px-2 py-1 rounded-lg border border-cyan-500/40 shadow-xl whitespace-nowrap">
                          {wp.name}
                        </div>
                      </div>
                    </div>
                  );
                })}

              {/* 5. LIVE BOT MARKER (AVATAR NA MALHA DE NAVEGAÇÃO) */}
              <div
                style={{
                  left: `${botPos.x}%`,
                  top: `${botPos.y}%`,
                  transform: `translate(-50%, -50%) rotate(${botPos.angle}deg)`,
                  transition: "left 2.5s cubic-bezier(0.4, 0, 0.2, 1), top 2.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s ease",
                }}
                className="absolute z-30 pointer-events-none"
              >
                <div className="relative flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-400/20 border border-emerald-400 animate-ping absolute" />
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,1)] border-2 border-white text-xs">
                    ▲
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Status Ticker */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-cyan-300/80 bg-black/60 px-4 py-2 rounded-2xl border border-cyan-500/30 backdrop-blur-md pointer-events-none">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>MALHA ATIVA: {activeMap.title}</span>
              </span>
              <span className="text-gray-400">
                {isSimulating ? "● PATRULHANDO RUAS ANDÁVEIS" : "⏸ PATRULHA PAUSADA"}
              </span>
            </div>
          </div>
        </div>

        {/* Tactical Control & Terreno / NavMesh Inspector (Col 4) */}
        <div className="flex flex-col gap-4">
          {/* Layer Toggles Card */}
          <div className="p-5 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft flex flex-col gap-3">
            <h3 className="text-xs font-black text-theme-text flex items-center gap-2 uppercase tracking-wider">
              <Layers size={15} className="text-cyan-500" />
              Camadas do NavMesh
            </h3>

            <div className="flex flex-col gap-2">
              <label className="flex items-center justify-between p-2.5 rounded-2xl bg-theme-surface-card border border-theme-border/40 text-xs cursor-pointer hover:border-cyan-500/40 transition-colors">
                <span className="text-theme-text font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm" />
                  Ruas & Vias Andáveis
                </span>
                <input
                  type="checkbox"
                  checked={showStreets}
                  onChange={(e) => setShowStreets(e.target.checked)}
                  className="accent-cyan-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-2xl bg-theme-surface-card border border-theme-border/40 text-xs cursor-pointer hover:border-rose-500/40 transition-colors">
                <span className="text-theme-text font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shadow-sm" />
                  Paredes & Construções
                </span>
                <input
                  type="checkbox"
                  checked={showObstacles}
                  onChange={(e) => setShowObstacles(e.target.checked)}
                  className="accent-rose-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-2xl bg-theme-surface-card border border-theme-border/40 text-xs cursor-pointer hover:border-cyan-500/40 transition-colors">
                <span className="text-theme-text font-bold">Waypoints da Rota</span>
                <input
                  type="checkbox"
                  checked={showWaypoints}
                  onChange={(e) => setShowWaypoints(e.target.checked)}
                  className="accent-cyan-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-2xl bg-theme-surface-card border border-theme-border/40 text-xs cursor-pointer hover:border-cyan-500/40 transition-colors">
                <span className="text-theme-text font-bold">Traçado de Laser (Path)</span>
                <input
                  type="checkbox"
                  checked={showPath}
                  onChange={(e) => setShowPath(e.target.checked)}
                  className="accent-cyan-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-2xl bg-theme-surface-card border border-theme-border/40 text-xs cursor-pointer hover:border-pink-500/40 transition-colors">
                <span className="text-theme-text font-bold">Spawns de Ursos / Itens</span>
                <input
                  type="checkbox"
                  checked={showSpawns}
                  onChange={(e) => setShowSpawns(e.target.checked)}
                  className="accent-pink-500 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-2xl bg-theme-surface-card border border-theme-border/40 text-xs cursor-pointer hover:border-cyan-500/40 transition-colors">
                <span className="text-theme-text font-bold">Grade & Scanner</span>
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => {
                    setShowGrid(e.target.checked);
                    setShowRadarSweep(e.target.checked);
                  }}
                  className="accent-cyan-500 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => setIsSimulating(!isSimulating)}
              className={`w-full py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                isSimulating
                  ? "bg-amber-500/15 text-amber-500 border-amber-500/40 hover:bg-amber-500/25"
                  : "bg-cyan-500/15 text-cyan-500 border-cyan-500/40 hover:bg-cyan-500/25"
              }`}
            >
              {isSimulating ? <Pause size={14} /> : <Play size={14} />}
              <span>{isSimulating ? "Pausar Navegação" : "Reproduzir Rota Andável"}</span>
            </button>
          </div>

          {/* NavMesh & Terreno Inspector Card */}
          <div className="p-5 rounded-3xl bg-theme-surface border border-theme-border/60 shadow-soft flex flex-col gap-3 flex-1">
            <h3 className="text-xs font-black text-theme-text flex items-center gap-2 uppercase tracking-wider">
              <MapPin size={15} className="text-pink-500" />
              Inspetor de Terreno
            </h3>

            {selectedElement ? (
              <div className="flex flex-col gap-3 p-3.5 rounded-2xl bg-theme-surface-card border border-theme-border/60 text-xs">
                {selectedElement.kind === "street" && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-cyan-400">{selectedElement.data.name}</span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                        ANDÁVEL
                      </span>
                    </div>
                    <p className="text-theme-text-muted leading-relaxed">{selectedElement.data.description}</p>
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-theme-border/40 font-mono text-[11px] text-gray-400">
                      <div className="flex justify-between">
                        <span>Superfície:</span>
                        <span className="text-cyan-300 font-bold">{selectedElement.data.surface}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dimensões:</span>
                        <span className="text-cyan-300">
                          {selectedElement.data.bounds.w * 3.2}m x {selectedElement.data.bounds.h * 3.2}m
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Permissão de Passagem:</span>
                        <span className="text-emerald-400 font-bold">100% Livre</span>
                      </div>
                    </div>
                  </>
                )}

                {selectedElement.kind === "obstacle" && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-rose-400">{selectedElement.data.name}</span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-400 font-bold border border-rose-500/30">
                        PAREDE / COLISÃO
                      </span>
                    </div>
                    <p className="text-theme-text-muted leading-relaxed">{selectedElement.data.description}</p>
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-theme-border/40 font-mono text-[11px] text-gray-400">
                      <div className="flex justify-between">
                        <span>Altura do Obstáculo:</span>
                        <span className="text-rose-400 font-bold">{selectedElement.data.height_meters}m</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Área Bloqueada:</span>
                        <span className="text-rose-400">
                          {selectedElement.data.bounds.w * 3.2}m x {selectedElement.data.bounds.h * 3.2}m
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status de Colisão:</span>
                        <span className="text-rose-500 font-black">BLOQUEIO FÍSICO</span>
                      </div>
                    </div>
                  </>
                )}

                {selectedElement.kind === "waypoint" && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-theme-text">{selectedElement.data.name}</span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-400 font-bold">
                        {selectedElement.data.type.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-theme-text-muted leading-relaxed">{selectedElement.data.description}</p>
                    <div className="flex items-center justify-between font-mono text-[11px] pt-2 border-t border-theme-border/40 text-gray-400">
                      <span>Coordenadas:</span>
                      <span className="text-cyan-400 font-bold">
                        ({selectedElement.data.x}%, {selectedElement.data.y}%)
                      </span>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center text-theme-text-muted text-xs gap-2 rounded-2xl border border-dashed border-theme-border/60">
                <Crosshair size={24} className="text-cyan-500/40 animate-pulse" />
                <span>Clique em qualquer rua, parede ou waypoint no radar para inspecionar.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
