import React from "react";
import { PROJECT_REGISTRY } from "../projects/registry";
import { Card } from "@/core/components/Card";
import { Button } from "@/core/components/Button";
import { Sparkles, Plus, ArrowRight, Heart } from "lucide-react";
import { useToast } from "@/core/components/Toast";

interface ProjectsViewProps {
  onSelectProject: (slug: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ onSelectProject }) => {
  const { addToast } = useToast();

  const handleNewProjectRequest = () => {
    addToast("Pode pedir pro seu marido que ele faz com carinho! 💕", "love");
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto py-2">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-theme-text">Projetos & Ferramentas</h2>
          <p className="text-xs text-theme-text-muted mt-1">
            Cada módulo é independente e feito para atender a uma necessidade sua.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus size={15} />}
          onClick={handleNewProjectRequest}
        >
          Pedir Novo Projeto 💕
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {PROJECT_REGISTRY.map((proj) => {
          const isActive = proj.status === "active";

          return (
            <Card
              key={proj.id}
              hoverable={isActive}
              onClick={() => isActive && onSelectProject(proj.slug)}
              className={`flex flex-col justify-between h-56 transition-all ${
                isActive ? "border-theme-primary/30" : "opacity-70 bg-theme-surface-card"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{proj.icon}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {isActive ? "Ativo & Pronto" : "Planejado"}
                  </span>
                </div>
                <h3 className="text-base font-bold text-theme-text">{proj.name}</h3>
                <p className="text-xs text-theme-text-muted mt-1.5 line-clamp-2">
                  {proj.description}
                </p>
              </div>

              <div className="pt-3 border-t border-theme-border/40 flex items-center justify-between text-xs">
                <span className="text-theme-text-muted">v{proj.version} • {proj.category}</span>
                {isActive && (
                  <span className="text-theme-primary font-bold flex items-center gap-1">
                    Abrir <ArrowRight size={13} />
                  </span>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
