"use client";

import {
  AppearanceToggle,
  type LedgerAppearance,
} from "@johnshandux/ledger-design-system/appearance-toggle";
import { useEffect, useState } from "react";

export type ThemePreference = "system" | "light" | "dark";
export const INITIAL_THEME_PREFERENCE: ThemePreference = "system";

type SystemAppearanceMedia = {
  matches: boolean;
  addEventListener: (type: "change", listener: () => void) => void;
  removeEventListener: (type: "change", listener: () => void) => void;
};

export function resolveAppearance(
  preference: ThemePreference,
  systemAppearance: LedgerAppearance,
): LedgerAppearance {
  return preference === "system" ? systemAppearance : preference;
}

export function applyThemePreference(preference: ThemePreference) {
  if (preference === "system") {
    delete document.documentElement.dataset.theme;
  } else {
    document.documentElement.dataset.theme = preference;
  }
}

export function observeSystemAppearance(
  media: SystemAppearanceMedia,
  onChange: (appearance: LedgerAppearance) => void,
) {
  const update = () => onChange(media.matches ? "dark" : "light");
  update();
  media.addEventListener("change", update);
  return () => media.removeEventListener("change", update);
}

export function ThemeControl() {
  const [preference, setPreference] = useState<ThemePreference>(INITIAL_THEME_PREFERENCE);
  const [systemAppearance, setSystemAppearance] = useState<LedgerAppearance>("light");

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    return observeSystemAppearance(media, setSystemAppearance);
  }, []);

  useEffect(() => applyThemePreference(preference), [preference]);

  return (
    <AppearanceToggle
      className="theme-control"
      appearance={resolveAppearance(preference, systemAppearance)}
      onAppearanceChange={setPreference}
    />
  );
}
