"use client";

import React, { createContext, useContext, useState } from "react";

export type CollapsibleType = "offcanvas" | "icon" | "none";
export type VariantType = "sidebar" | "floating" | "inset";

interface LayoutContextType {
  collapsible: CollapsibleType;
  variant: VariantType;
  setCollapsible: (collapsible: CollapsibleType) => void;
  setVariant: (variant: VariantType) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({
  children,
  defaultCollapsible = "icon",
  defaultVariant = "sidebar",
}: {
  children: React.ReactNode;
  defaultCollapsible?: CollapsibleType;
  defaultVariant?: VariantType;
}) {
  const [collapsible, setCollapsible] = useState<CollapsibleType>(defaultCollapsible);
  const [variant, setVariant] = useState<VariantType>(defaultVariant);

  return (
    <LayoutContext.Provider value={{ collapsible, variant, setCollapsible, setVariant }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    // Provide safe default values so components using useLayout() run smoothly anywhere
    return {
      collapsible: "icon" as CollapsibleType,
      variant: "sidebar" as VariantType,
      setCollapsible: () => {},
      setVariant: () => {},
    };
  }
  return context;
}
