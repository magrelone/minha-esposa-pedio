import React, { useEffect, useState } from "react";
import { CrosshairItem } from "@/projects/crosshair/types";
import { PROCEDURAL_PRESETS } from "@/projects/crosshair/engine/procedural-presets";
import { VectorCrosshair } from "@/projects/crosshair/components/VectorCrosshair";
import { listen } from "@tauri-apps/api/event";

/**
 * Ultra-lightweight Crosshair Overlay.
 * 100% Transparent, zero CPU overhead, real-time sync with main window.
 */
export const OverlayApp: React.FC = () => {
  // Load initial active crosshair from localStorage or fallback to Cute Heart 💕
  const [crosshair, setCrosshair] = useState<CrosshairItem>(() => {
    try {
      const saved = localStorage.getItem("pmm_crosshair_active");
      if (saved) return JSON.parse(saved);
    } catch {}
    return PROCEDURAL_PRESETS[4]; // Default to Cute Heart 💕
  });

  const [offsetX, setOffsetX] = useState<number>(() => {
    return parseInt(localStorage.getItem("pmm_overlay_offset_x") || "0", 10);
  });

  const [offsetY, setOffsetY] = useState<number>(() => {
    return parseInt(localStorage.getItem("pmm_overlay_offset_y") || "0", 10);
  });

  // Ensure absolute transparency in WebView2
  useEffect(() => {
    document.documentElement.style.background = "transparent";
    document.documentElement.style.backgroundColor = "transparent";
    document.body.style.background = "transparent";
    document.body.style.backgroundColor = "transparent";
    document.body.classList.add("is-overlay");
    const root = document.getElementById("root");
    if (root) {
      root.style.background = "transparent";
      root.style.backgroundColor = "transparent";
    }
  }, []);

  // Listen to Tauri events from main window
  useEffect(() => {
    let unlistenCrosshair: (() => void) | undefined;
    let unlistenOffsets: (() => void) | undefined;

    listen<CrosshairItem>("crosshair-data-updated", (event) => {
      if (event.payload) {
        setCrosshair(event.payload);
      }
    }).then((fn) => {
      unlistenCrosshair = fn;
    }).catch(() => {});

    listen<{ x: number; y: number }>("overlay-offsets-updated", (event) => {
      if (event.payload) {
        setOffsetX(event.payload.x);
        setOffsetY(event.payload.y);
      }
    }).then((fn) => {
      unlistenOffsets = fn;
    }).catch(() => {});

    // Also listen to storage events across webview instances
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "pmm_crosshair_active" && e.newValue) {
        try {
          setCrosshair(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === "pmm_overlay_offset_x" && e.newValue) {
        setOffsetX(parseInt(e.newValue, 10));
      }
      if (e.key === "pmm_overlay_offset_y" && e.newValue) {
        setOffsetY(parseInt(e.newValue, 10));
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      if (unlistenCrosshair) unlistenCrosshair();
      if (unlistenOffsets) unlistenOffsets();
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 w-screen h-screen flex items-center justify-center pointer-events-none select-none overflow-hidden"
      style={{
        background: "transparent",
        backgroundColor: "transparent",
      }}
    >
      <div
        style={{
          background: "transparent",
        }}
        className="pointer-events-none"
      >
        <VectorCrosshair crosshair={crosshair} size={500} />
      </div>

    </div>
  );
};

export default OverlayApp;
