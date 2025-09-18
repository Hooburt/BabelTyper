import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import TrackCanvas from "./track_canvas";
import ShopMenu from "./shop";
import { GameProvider, useGame } from "./GameContext";
import "./app.css";
import { FlagDisplay } from "./FlagDisplay";

const GlobalKeyListener = ({ onKey }: { onKey: (key: string) => void }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        console.log("Tabby");
      }
      onKey(e.key);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onKey]);

  return null;
};

const TextArt = ({ text }: { text: string }) => {
  return <pre className="text-art">{text}</pre>;
};

export type KeyEvent = { key: string; target: number; time: number };

function App(): React.JSX.Element {
  const { engineRef, score, trackSelect, rangeNum, incrementNum } = useGame();
  const [lastKey, setLastKey] = useState<KeyEvent | null>(null);
  const [curTarget, setCurTarget] = useState(0);
  const logo =
    "                                ___                           \r\n_-_ _,,         ,,          ,, -   ---___-                    \r\n   -/  )    _   ||          ||    (' ||                       \r\n  ~||_<    < \\, ||/|,  _-_  ||   ((  ||    '\\\\/\\\\ -_-_   _-_  \r\n   || \\\\   /-|| || || || \\\\ ||  ((   ||     || ;' || \\\\ || \\\\ \r\n   ,/--|| (( || || |' ||/   ||   (( //      ||/   || || ||/   \r\n  _--_-'   \\/\\\\ \\\\/   \\\\,/  \\\\     -____-   |/    ||-'  \\\\,/  \r\n (                                         (      |/          \r\n                                            -_-   '           ";

  const handleKey = (key: KeyEvent) => {
    setLastKey(key);
    engineRef.current?.addInput(key);
  };

  return (
    <div>
      <GlobalKeyListener
        onKey={(key) => {
          if (key === "Tab") {
            setCurTarget((t) => (t === 0 ? 1 : 0));
            return;
          }
          handleKey({ key, target: curTarget, time: Date.now() });
        }}
      />
      <div>
        <TextArt text={logo} />
      </div>
      <div>
        <p>Key: {lastKey?.key}</p>
        <p>Score: {score}</p>
      </div>

      <div className="row">
        <TrackCanvas
          width={800}
          height={15}
          className={
            curTarget === 0 ? "game-canvas selected" : "game-canvas notselected"
          }
        />

        <FlagDisplay />

        <ShopMenu
          trackSelectNum={trackSelect}
          rangeNum={rangeNum}
          incrNum={incrementNum}
          className={
            curTarget === 1 ? "shop-div selected" : "shop-div notselected"
          }
        />
      </div>
    </div>
  );
}

const root = document.getElementById("root");
if (root) {
  ReactDOM.createRoot(root).render(
    <GameProvider>
      <App />
    </GameProvider>
  );
}
