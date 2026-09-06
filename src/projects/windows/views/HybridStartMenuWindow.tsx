import React from "react";
import { HybridStartMenuPreview } from "../components/HybridStartMenuPreview";

export const HybridStartMenuWindow: React.FC = () => {
  return (
    <div className="w-screen h-screen flex items-end justify-start p-2 bg-transparent select-none">
      <HybridStartMenuPreview />
    </div>
  );
};
