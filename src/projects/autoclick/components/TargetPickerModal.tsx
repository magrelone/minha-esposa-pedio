import React, { useEffect, useState } from "react";
import { Crosshair, X, Check } from "lucide-react";
import { useAutoClickStore } from "../store/autoclickStore";
import { InputService } from "@/core/services/automation/InputService";

export const TargetPickerModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  targetPointId?: string | null;
}> = ({ isOpen, onClose, targetPointId }) => {
  const { setFixedPosition, updatePoint } = useAutoClickStore();
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 500, y: 400 });

  useEffect(() => {
    if (!isOpen) return;

    const handleMouseMove = (e: MouseEvent) => {
      setCoords({ x: e.screenX, y: e.screenY });
    };

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const finalX = e.screenX;
      const finalY = e.screenY;

      if (targetPointId) {
        updatePoint(targetPointId, { x: finalX, y: finalY });
      } else {
        setFixedPosition(finalX, finalY);
      }

      onClose();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick, true);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick, true);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, targetPointId, onClose, setFixedPosition, updatePoint]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-crosshair select-none animate-fade-in">
      {/* Centered Guide Pill */}
      <div className="p-4 rounded-3xl bg-theme-surface/90 border border-theme-border/80 shadow-2xl flex items-center gap-3 pointer-events-none">
        <div className="w-10 h-10 rounded-2xl bg-pink-500 text-white flex items-center justify-center shadow-soft animate-pulse">
          <Crosshair size={22} />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-black text-theme-text">Clique em qualquer lugar da tela</span>
          <span className="text-[11px] font-mono text-pink-500 font-bold">
            Posição atual: X={coords.x}, Y={coords.y}
          </span>
          <span className="text-[10px] text-theme-text-muted mt-0.5">Pressione ESC para cancelar</span>
        </div>
      </div>
    </div>
  );
};
