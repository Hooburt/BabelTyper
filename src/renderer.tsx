import { Engine } from "./engine";
import { useState, useEffect } from "react";

export const trackFontSize = 16;


export function render(ctx: CanvasRenderingContext2D, engine: Engine, scrollY: number, force?: boolean) {
  ctx.fillStyle = "rgb(207, 0, 0)";
  ctx.font = trackFontSize + "px monospace";
  let idCounter = 0;
  let leading = "";
  for (const t of engine.tracks) {
    if(force || (t.y <= scrollY + (window.innerHeight) && t.dirty)) {
      ctx.clearRect(0, t.y-15, engine.width, 25);
      // ctx.rect(0, t.y-15, engine.width, 25);
      // ctx.fill();
      ctx.fillStyle = "rgb(0,255,0)";
      leading = idCounter.toString().padStart(3, "0");
      ctx.fillText(leading + " ", t.x, t.y);
      ctx.fillStyle = "rgb(255, 50, 0)"; // color for first letter
      ctx.fillText(t.text[0], t.x + ctx.measureText(leading).width + 20, t.y);
      ctx.fillStyle = "rgb(125, 0, 0)";
      ctx.fillText(
        t.text.slice(1),
        t.x +
          ctx.measureText(leading).width +
          ctx.measureText(t.text[0]).width +
          20,
        t.y
      );
      if (idCounter != engine.tracks.length - 1) {
        ctx.beginPath();
        ctx.moveTo(0, t.y + 7);
        ctx.lineTo(engine.width, t.y + 7);
        ctx.stroke();
      }
      t.dirty = false;
    }
    idCounter++;
  }
  ctx.beginPath();
  ctx.moveTo(3 * trackFontSize, 0);
  ctx.lineTo(3 * trackFontSize, engine.height);
  ctx.stroke();
}
