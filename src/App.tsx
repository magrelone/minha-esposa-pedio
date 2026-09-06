import React, { useState, useEffect, Suspense } from "react";
import { AppLayout } from "./core/layout/AppLayout";
import { HomeView } from "./core/views/HomeView";
import { ProjectsView } from "./core/views/ProjectsView";
import { SettingsView } from "./core/views/SettingsView";
import { AboutView } from "./core/views/AboutView";
import { AssetHubView } from "./core/views/AssetHubView";
import { ProfileView } from "./core/views/ProfileView";
import { CrosshairApp } from "./projects/crosshair/CrosshairApp";
import { BotsApp } from "./projects/bots/BotsApp";
import { AutoClickApp } from "./projects/autoclick/AutoClickApp";
import { OverlayApp } from "./overlay/OverlayApp";
import { useCrosshairStore } from "./projects/crosshair/store/crosshairStore";
import { invoke } from "@tauri-apps/api/core";
import { listen, emit } from "@tauri-apps/api/event";

export const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.hash ? window.location.hash.replace("#", "") : "/";
  });

  const {
    activeCrosshair,
    isOverlayActive,
    setOverlayActive,
    selectedMonitorIndex,
    overlayOffsetX,
    overlayOffsetY,
  } = useCrosshairStore();


  // Listen to browser hash changes
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash.replace("#", "") || "/");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Synchronize Overlay state and active crosshair with native Tauri backend
  useEffect(() => {
    const syncNativeOverlay = async () => {
      try {
        await invoke("set_overlay_state", {
          config: {
            visible: isOverlayActive,
            monitor_index: selectedMonitorIndex,
            offset_x: overlayOffsetX,
            offset_y: overlayOffsetY,
            size: 500,
          },
        });

        // Broadcast active crosshair directly to overlay window
        await emit("crosshair-data-updated", activeCrosshair);
        await emit("overlay-offsets-updated", {
          x: overlayOffsetX,
          y: overlayOffsetY,
        });
      } catch (e) {
        // Silently catch when running purely in web browser dev
      }
    };
    syncNativeOverlay();
  }, [isOverlayActive, activeCrosshair, selectedMonitorIndex, overlayOffsetX, overlayOffsetY]);


  // Listen to native tray toggle events
  useEffect(() => {
    let unlisten: (() => void) | undefined;
    listen<boolean>("overlay-state-changed", (event) => {
      setOverlayActive(event.payload);
    }).then((fn) => {
      unlisten = fn;
    }).catch(() => {});

    return () => {
      if (unlisten) unlisten();
    };
  }, [setOverlayActive]);

  // Window-level keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const savedOverlayKey = (localStorage.getItem("pmm_hotkey_overlay") || "F10").toUpperCase();
      const savedAppKey = (localStorage.getItem("pmm_hotkey_app") || "Control+H").toUpperCase();

      const keyUpper = e.key.toUpperCase();

      // Check Overlay Hotkey
      const isOverlayKeyMatch =
        keyUpper === savedOverlayKey ||
        (savedOverlayKey === "CONTROL+ALT+X" && e.ctrlKey && e.altKey && e.key.toLowerCase() === "x") ||
        (savedOverlayKey.startsWith("F") && keyUpper === savedOverlayKey) ||
        e.key === "F10";

      if (isOverlayKeyMatch) {
        e.preventDefault();
        setOverlayActive(!isOverlayActive);
        return;
      }

      // Check App Hotkey
      const isAppKeyMatch =
        (savedAppKey === "CONTROL+H" && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "h") ||
        (savedAppKey === "CONTROL+ALT+C" && e.ctrlKey && e.altKey && e.key.toLowerCase() === "c");

      if (isAppKeyMatch) {
        e.preventDefault();
        invoke("hide_main_window").catch(() => {});
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOverlayActive, setOverlayActive]);



  // If this window is the dedicated overlay window, render only the overlay canvas
  if (currentRoute === "/overlay") {
    return <OverlayApp />;
  }

  const navigate = (route: string) => {
    window.location.hash = route;
    setCurrentRoute(route);
  };

  const renderContent = () => {
    if (currentRoute === "/hub") {
      return <AssetHubView onNavigateToStudio={() => navigate("/projects/crosshair")} />;
    }
    if (currentRoute === "/profile") {
      return <ProfileView />;
    }
    if (currentRoute === "/projects/crosshair") {
      return (
        <Suspense fallback={<div className="p-8 text-center text-sm text-theme-text-muted">Carregando Crosshair Studio... ✨</div>}>
          <CrosshairApp />
        </Suspense>
      );
    }
    if (currentRoute === "/bots" || currentRoute.startsWith("/bots/")) {
      return (
        <Suspense fallback={<div className="p-8 text-center text-sm text-theme-text-muted">Carregando Central de Bots... 🧸</div>}>
          <BotsApp />
        </Suspense>
      );
    }
    if (currentRoute === "/autoclick" || currentRoute === "/projects/autoclick") {
      return (
        <Suspense fallback={<div className="p-8 text-center text-sm text-theme-text-muted">Carregando Auto Click... 🖱️</div>}>
          <AutoClickApp />
        </Suspense>
      );
    }
    if (currentRoute === "/projects") {
      return <ProjectsView onSelectProject={(slug) => navigate(`/projects/${slug}`)} />;
    }
    if (currentRoute === "/settings") {
      return <SettingsView />;
    }
    if (currentRoute === "/about") {
      return <AboutView />;
    }
    return (
      <HomeView
        onNavigateToProject={(slug) => navigate(`/projects/${slug}`)}
        onNavigateToTab={(tab) => navigate(`/${tab}`)}
      />
    );
  };

  return (
    <AppLayout currentRoute={currentRoute} onNavigate={navigate}>
      {renderContent()}
    </AppLayout>
  );
};

export default App;
