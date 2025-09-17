import { Engine } from "./engine"

export function render(ctx: CanvasRenderingContext2D, engine: Engine) {
    ctx.clearRect(0, 0, engine.width, engine.height);
    ctx.fillStyle = "rgb(207, 0, 0)"
    ctx.font = "14px monospace";
    let idCounter = 0;
    let leading = ""
    for (const t of engine.tracks) {
        ctx.fillStyle = "rgb(0,255,0)";
        if(idCounter < 10) {
            leading = "00" + idCounter.toString();
        }
        else if (idCounter < 100) {
            leading = "0" + idCounter.toString();
        }
        else {
            leading = idCounter.toString()
        }
        ctx.fillText(leading + " ", t.x, t.y);
        ctx.fillStyle = "rgb(255, 50, 0)"; // color for first letter
        ctx.fillText(t.text[0], t.x + ctx.measureText(leading).width + 20, t.y)
        ctx.fillStyle = "rgb(125, 0, 0)"
        ctx.fillText(t.text.slice(1), t.x + ctx.measureText(leading).width + ctx.measureText(t.text[0]).width + 20, t.y)
        if(idCounter != engine.tracks.length - 1) {
            ctx.beginPath();
            ctx.moveTo(0, t.y + 7)
            ctx.lineTo(engine.width, t.y + 7);
            ctx.stroke();
        }
        idCounter++;
    }
    ctx.beginPath();
    ctx.moveTo(40,0);
    ctx.lineTo(40, engine.height);
    ctx.stroke();
}