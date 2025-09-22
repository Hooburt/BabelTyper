import { useRef, useEffect, useState } from "react";
import { useGame } from "./GameContext";
import { Engine } from "./engine";
import { render } from "./renderer";
import { KeyEvent } from "./app";

type Point = {
  x: number;
  y: number;
  text: string;
};

interface TrackCanvasProps {
  width: number;
  height: number;
  className: string;
}



const TrackCanvas = ({ width, height, className }: TrackCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { engineRef } = useGame();
  const [dirty, setDirty] = useState(false);
  const [scrollYPosition, setScrollYPosition] = useState(0);
  const [collapsed, setCollapsed] = useState(true);

  const handleCollapse = () => {
    collapsed ? setCollapsed(false) : setCollapsed(true);
    setDirty(true);
  }
  

  useEffect(() => {

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    
    const handleScroll = () => {
      setScrollYPosition(window.pageYOffset);
      setDirty(true);
    }
    window.addEventListener("scroll", handleScroll);

    let last = performance.now();
    let animationFrameId: number;

    const loop = (time: number) => {
      const delta = (time - last) / 16.67;
      const engine = engineRef.current;

      if (!engine) {
        animationFrameId = requestAnimationFrame(loop);
        return;
      }

      const padding = 3.5;
      const lastTrack = (engine.tracks.length <= 25 ? engine.tracks.length - 1 : 25)
      const collapseHeight =
        engine.tracks[lastTrack].y + padding * 2;
      const computedHeight =
        engine.tracks[engine.tracks.length - 1].y + padding * 2;

      if (computedHeight !== canvas.height && !collapsed) {
        canvas.height = computedHeight;
        engine.height = computedHeight;
        render(ctx, engine, scrollY, true);
      }
      else if (collapsed === true && canvas.height !== collapseHeight) {
        canvas.height = collapseHeight;
        engine.height = collapseHeight;
        render(ctx, engine, scrollY, true);
      }

      last = time;

      engine.update(delta);
      if (engine.dirty || dirty == true) {
        render(ctx, engine, scrollY);
        engine.dirty = false;
        setDirty(false);
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("scroll", handleScroll);
    }
  }, [width, height, engineRef, dirty]);

  return (
    <div>
            <button onClick={handleCollapse}>Toggle collapse</button>
      <div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={className}
      />
      </div>
    </div>
  );
};

export default TrackCanvas;
