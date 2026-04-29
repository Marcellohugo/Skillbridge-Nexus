"use client";

import * as React from "react";

export type FontScale = "sm" | "md" | "lg" | "xl";
export type Motion = "normal" | "reduced";
export type Contrast = "normal" | "high";

export interface A11yPrefs {
  fontScale: FontScale;
  motion: Motion;
  contrast: Contrast;
  dyslexia: boolean;
  focusMode: boolean;
  simplifiedReading: boolean;
  textToSpeech: boolean;
  calmView: boolean;
}

const DEFAULT: A11yPrefs = {
  fontScale: "md",
  motion: "normal",
  contrast: "normal",
  dyslexia: false,
  focusMode: false,
  simplifiedReading: false,
  textToSpeech: false,
  calmView: false,
};

const STORAGE_KEY = "sbn.a11y";

interface A11yContextValue {
  prefs: A11yPrefs;
  update: (patch: Partial<A11yPrefs>) => void;
  reset: () => void;
}

const A11yContext = React.createContext<A11yContextValue | null>(null);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = React.useState<A11yPrefs>(DEFAULT);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPrefs({ ...DEFAULT, ...JSON.parse(raw) });
    } catch {}
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    const body = document.body;
    body.dataset.fontScale = prefs.fontScale;
    body.dataset.motion = prefs.motion === "reduced" ? "reduced" : "normal";
    body.dataset.contrast = prefs.contrast === "high" ? "high" : "normal";
    body.dataset.dyslexia = prefs.dyslexia ? "true" : "false";
    body.dataset.focusMode = prefs.focusMode ? "true" : "false";
    body.dataset.simplifiedReading = prefs.simplifiedReading ? "true" : "false";
    body.dataset.calmView = prefs.calmView ? "true" : "false";
    body.dataset.tts = prefs.textToSpeech ? "true" : "false";
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch {}
  }, [prefs, hydrated]);

  const update = React.useCallback((patch: Partial<A11yPrefs>) => {
    setPrefs((p) => ({ ...p, ...patch }));
  }, []);

  const reset = React.useCallback(() => setPrefs(DEFAULT), []);

  return (
    <A11yContext.Provider value={{ prefs, update, reset }}>
      {children}
    </A11yContext.Provider>
  );
}

export function useA11y() {
  const ctx = React.useContext(A11yContext);
  if (!ctx) throw new Error("useA11y must be used inside AccessibilityProvider");
  return ctx;
}
