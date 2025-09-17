import {useRef, useEffect} from "react";
import { useGame } from "./GameContext"
import { Engine } from "./engine";
import { render } from "./renderer";
import { KeyEvent } from "./app";

type Point = {
    x: number;
    y: number;
    text: string;
}

interface TrackCanvasProps {
    width: number;
    height: number;
    className: string
}

let dirty = true

const TrackCanvas = ({ width, height, className }: TrackCanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement | null> (null);
    const { engineRef } = useGame();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if(!ctx) return;

        let last = performance.now()
        let animationFrameId: number;

        const loop = (time: number) => {
            const delta = (time - last) / 16.67;
            const engine = engineRef.current;
            
            
            if (!engine) {
                animationFrameId = requestAnimationFrame(loop);
                return;
            }    
            
            const padding = 3.5
            const computedHeight = engine.tracks[engine.tracks.length - 1].y + padding * 2

            if(computedHeight !== canvas.height) {
                canvas.height = computedHeight
                engine.height = computedHeight
                render(ctx, engine)
            }

            last = time;

            engine.update(delta)
            if(engine.dirty) {
                render(ctx, engine);
                engine.dirty = false;
            }

            animationFrameId = requestAnimationFrame(loop);
        };

        animationFrameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationFrameId)

    }, [width, height, engineRef]);


    return <div><canvas ref={canvasRef} width={width} height={height} className={className}/></div>;
}

export default TrackCanvas;