import React, {
  createContext,
  useContext,
  useRef,
  useEffect,
  useState,
} from "react";
import { Engine, Upgrade } from "./engine";

export type GameContextValue = {
  engineRef: React.RefObject<Engine | null>;
  score: number;
  upgrades: Upgrade[];
  trackSelect: number;
  rangeNum: number;
  incrementNum: number;
};

const GameContext = createContext<GameContextValue | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const engineRef = useRef<Engine>(
    new Engine(window.innerWidth, window.innerHeight, 20)
  );

  // UI States
  const [score, setScore] = useState(1000);
  const [upgrades, setUpgrades] = useState<Upgrade[]>([]);
  const [trackSelect, setTrackSelect] = useState(0);
  const [rangeNum, setRangeNum] = useState(0);
  const [incrementNum, setIncrementNum] = useState(1);

  useEffect(() => {
    const engine = engineRef.current;
    engine.onScoreChange = setScore;
    engine.onUpgradeChange = setUpgrades;
    engine.onTrackSelectChange = setTrackSelect;
    engine.onRangeNumChange = setRangeNum;
    engine.onIncrementNumChange = setIncrementNum;
    setUpgrades(engine.getUpgradeList());
  }, []);

  return (
    <GameContext.Provider
      value={{
        engineRef,
        score,
        upgrades,
        trackSelect,
        rangeNum,
        incrementNum,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside <GameProvider>");
  return ctx;
};
