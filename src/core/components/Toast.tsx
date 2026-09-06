import React from "react";
import { create } from "zustand";
import { Heart, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

import { soundManager } from "../audio/soundManager";

interface ToastMessage {
  id: string;
  text: string;
  type?: "love" | "sparkle" | "success" | "info" | "warning";
}

interface ToastStore {
  toasts: ToastMessage[];
  addToast: (text: string, type?: ToastMessage["type"]) => void;
  removeToast: (id: string) => void;
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (text, type = "love") => {
    const id = `${Date.now()}-${Math.random()}`;
    if (type === "love") {
      soundManager.playLove();
    } else if (type === "sparkle") {
      soundManager.playSparkle();
    } else {
      soundManager.playPop();
    }

    set((state) => ({ toasts: [...state.toasts, { id, text, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3200);
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((toast) => {
        let icon = <Heart size={16} className="text-pink-500 fill-pink-400" />;
        if (toast.type === "sparkle") {
          icon = <Sparkles size={16} className="text-amber-400 fill-amber-300" />;
        } else if (toast.type === "success") {
          icon = <CheckCircle2 size={16} className="text-emerald-500" />;
        } else if (toast.type === "warning") {
          icon = <AlertCircle size={16} className="text-rose-500" />;
        }

        return (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 bg-theme-surface border border-theme-border rounded-cute shadow-float animate-slide-up cursor-pointer hover:scale-102 transition-transform"
          >
            <span className="flex-shrink-0">{icon}</span>
            <span className="text-sm font-medium text-theme-text">{toast.text}</span>
          </div>
        );
      })}
    </div>
  );
};
