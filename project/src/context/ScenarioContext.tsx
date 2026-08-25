import { createContext, useContext, useState, type ReactNode } from "react";
import { DEFAULT_SCENARIO, type ScenarioParams } from "@/lib/simulation";

interface ScenarioContextValue {
  scenario: ScenarioParams;
  setScenario: (s: ScenarioParams) => void;
}

const ScenarioContext = createContext<ScenarioContextValue | null>(null);

export function ScenarioProvider({ children }: { children: ReactNode }) {
  const [scenario, setScenario] = useState<ScenarioParams>(DEFAULT_SCENARIO);
  return (
    <ScenarioContext.Provider value={{ scenario, setScenario }}>
      {children}
    </ScenarioContext.Provider>
  );
}

export function useScenario(): ScenarioContextValue {
  const ctx = useContext(ScenarioContext);
  if (!ctx) throw new Error("useScenario must be used within ScenarioProvider");
  return ctx;
}
