import React from "react";

export interface ProjectDefinition {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  version: string;
  coverGradient: string;
  category: "Jogos" | "Produtividade" | "Organização" | "Utilidades" | "Mimos";
  createdAt: string;
  updatedAt: string;
  enabled: boolean;
  status: "active" | "in_development" | "planned";
  tags: string[];
  route: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
}
