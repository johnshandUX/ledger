"use client";

import {
  AppearanceToggle,
  type LedgerAppearance,
} from "@johnshandux/ledger-design-system/appearance-toggle";
import { useEffect, useState } from "react";

type ThemePreference = "system" | "light" | "dark";
const INITIAL_THEME_PREFERENCE: ThemePreference = "system";

function resolveAppearance(
  preference: ThemePreference,
  systemAppearance: LedgerAppearance,
): LedgerAppearance {
  return preference === "system" ? systemAppearance : preference;
}

export function ThemeControl() {
  const [preference, setPreference] = useState<ThemePreference>(INITIAL_THEME_PREFERENCE);
  const [systemAppearance, setSystemAppearance] = useState<LedgerAppearance>("light");

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemAppearance = () => setSystemAppearance(media.matches ? "dark" : "light");

    updateSystemAppearance();
    media.addEventListener("change", updateSystemAppearance);
    return () => media.removeEventListener("change", updateSystemAppearance);
  }, []);

  useEffect(() => {
    if (preference === "system") {
      delete document.documentElement.dataset.theme;
    } else {
      document.documentElement.dataset.theme = preference;
    }
  }, [preference]);

  return (
    <AppearanceToggle
      className="theme-control"
      appearance={resolveAppearance(preference, systemAppearance)}
      onAppearanceChange={setPreference}
    />
  );
}
