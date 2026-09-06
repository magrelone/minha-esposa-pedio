import React from "react";
import {
  useProfileStore,
  DICEBEAR_STYLES,
  DiceBearStyle,
  getDiceBearAvatarUrl,
} from "../providers/dicebearProvider";
import { Card } from "@/core/components/Card";
import { Button } from "@/core/components/Button";
import { useToast } from "@/core/components/Toast";
import { Heart, Sparkles, RefreshCw, UserCheck, HeartHandshake } from "lucide-react";

export const ProfileView: React.FC = () => {
  const {
    wifeProfile,
    husbandProfile,
    updateWifeProfile,
    updateHusbandProfile,
  } = useProfileStore();

  const { addToast } = useToast();

  const wifeAvatarUrl = getDiceBearAvatarUrl(
    wifeProfile.avatarStyle,
    wifeProfile.seed,
    wifeProfile.bgColor
  );

  const husbandAvatarUrl = getDiceBearAvatarUrl(
    husbandProfile.avatarStyle,
    husbandProfile.seed,
    husbandProfile.bgColor
  );

  const handleRandomizeWifeSeed = () => {
    const seeds = ["Princesa", "Florzinha", "Amorzinho", "Estrelinha", "Bonequinha", "Rainha", "Docinho"];
    const random = seeds[Math.floor(Math.random() * seeds.length)] + Math.floor(Math.random() * 99);
    updateWifeProfile({ seed: random });
    addToast("Avatar atualizado com novo visual! ✨", "sparkle");
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto py-2">
      <div>
        <h2 className="text-2xl font-bold text-theme-text">Perfil & Avatares 💕</h2>
        <p className="text-xs text-theme-text-muted mt-1">
          Personalize seu avatar determinístico do DiceBear, seus apelidos carinhosos e preferências.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 1: PERFIL DA ESPOSA */}
        <Card className="flex flex-col gap-6 border-theme-primary/40 relative overflow-hidden bg-gradient-to-b from-pink-500/5 to-transparent">
          <div className="flex items-center justify-between border-b border-theme-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Heart size={18} className="text-pink-500 fill-pink-500" />
              <h3 className="text-base font-bold text-theme-text">Perfil da Esposa 💕</h3>
            </div>
            <span className="text-[11px] bg-pink-100 text-pink-700 font-bold px-2.5 py-0.5 rounded-full">
              Dona do App
            </span>
          </div>

          {/* Avatar Preview */}
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-2 border-theme-primary/60 shadow-float overflow-hidden bg-pink-50 flex items-center justify-center">
                <img
                  src={wifeAvatarUrl}
                  alt="Avatar da Esposa"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={handleRandomizeWifeSeed}
                className="absolute bottom-0 right-0 p-1.5 bg-theme-primary text-white rounded-full shadow-soft hover:scale-110 active:scale-95 transition-all"
                title="Sortear nova variação de avatar"
              >
                <RefreshCw size={13} />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-theme-primary">
                {wifeProfile.nickname}
              </span>
              <h4 className="text-lg font-extrabold text-theme-text">{wifeProfile.name}</h4>
              <p className="text-xs text-theme-text-muted italic">
                "{wifeProfile.specialNote}"
              </p>
            </div>
          </div>

          {/* Style Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-theme-text">
              Estilo de Ilustração do Avatar:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {DICEBEAR_STYLES.map((st) => (
                <button
                  key={st.id}
                  onClick={() => updateWifeProfile({ avatarStyle: st.id })}
                  className={`p-2 rounded-xl border text-xs flex flex-col items-center gap-1 transition-all ${
                    wifeProfile.avatarStyle === st.id
                      ? "border-theme-primary bg-theme-primary/10 text-theme-primary font-bold shadow-xs"
                      : "border-theme-border/60 bg-theme-surface-card text-theme-text-muted hover:text-theme-text"
                  }`}
                >
                  <span className="text-xl">{st.emoji}</span>
                  <span className="text-[11px]">{st.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Inputs */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-theme-text">Nome / Como te chamo:</label>
              <input
                type="text"
                value={wifeProfile.name}
                onChange={(e) => updateWifeProfile({ name: e.target.value })}
                className="h-9 px-3 text-xs bg-theme-surface-card border border-theme-border rounded-xl text-theme-text focus:outline-none focus:border-theme-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-theme-text">Apelido carinhoso:</label>
              <input
                type="text"
                value={wifeProfile.nickname}
                onChange={(e) => updateWifeProfile({ nickname: e.target.value })}
                className="h-9 px-3 text-xs bg-theme-surface-card border border-theme-border rounded-xl text-theme-text focus:outline-none focus:border-theme-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-theme-text">Seed de traços do rosto:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={wifeProfile.seed}
                  onChange={(e) => updateWifeProfile({ seed: e.target.value })}
                  className="flex-1 h-9 px-3 text-xs bg-theme-surface-card border border-theme-border rounded-xl text-theme-text focus:outline-none focus:border-theme-primary"
                />
                <Button size="sm" variant="secondary" onClick={handleRandomizeWifeSeed}>
                  Sortear
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* CARD 2: PERFIL DO MARIDO */}
        <Card className="flex flex-col gap-6 border-purple-300 relative overflow-hidden bg-gradient-to-b from-purple-500/5 to-transparent">
          <div className="flex items-center justify-between border-b border-theme-border/60 pb-3">
            <div className="flex items-center gap-2">
              <HeartHandshake size={18} className="text-purple-500" />
              <h3 className="text-base font-bold text-theme-text">Perfil do Marido 💖</h3>
            </div>

            <span className="text-[11px] bg-purple-100 text-purple-700 font-bold px-2.5 py-0.5 rounded-full">
              Seu Desenvolvedor Particular
            </span>
          </div>

          {/* Avatar Preview */}
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 rounded-full border-2 border-purple-400 shadow-float overflow-hidden bg-purple-50 flex items-center justify-center">
              <img
                src={husbandAvatarUrl}
                alt="Avatar do Marido"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
                {husbandProfile.nickname}
              </span>
              <h4 className="text-lg font-extrabold text-theme-text">{husbandProfile.name}</h4>
              <p className="text-xs text-theme-text-muted italic">
                "{husbandProfile.specialNote}"
              </p>
            </div>
          </div>

          {/* Inputs Marido */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-theme-text">Nome:</label>
              <input
                type="text"
                value={husbandProfile.name}
                onChange={(e) => updateHusbandProfile({ name: e.target.value })}
                className="h-9 px-3 text-xs bg-theme-surface-card border border-theme-border rounded-xl text-theme-text focus:outline-none focus:border-theme-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-theme-text">Recadinho especial:</label>
              <textarea
                rows={3}
                value={husbandProfile.specialNote}
                onChange={(e) => updateHusbandProfile({ specialNote: e.target.value })}
                className="p-3 text-xs bg-theme-surface-card border border-theme-border rounded-xl text-theme-text focus:outline-none focus:border-theme-primary resize-none"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-800 flex items-center gap-2 mt-auto">
            <Sparkles size={16} className="text-purple-600 flex-shrink-0" />
            <span>
              Qualquer novo projeto ou botão que você pedir será criado com o maior carinho do mundo!
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};
