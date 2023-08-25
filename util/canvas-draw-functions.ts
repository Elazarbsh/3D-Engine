import { RenderMode } from "../enums/render-mode.js";
import { Tri } from "../src/tri.js";

export function drawTriangle(triangle: Tri, intensity: number, mode: RenderMode): void {

    const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");

    if (ctx === null)
        throw new Error("an error occured while drawing");

    if (mode == RenderMode.WIREFRAMES || mode == RenderMode.WIREFRAMESFILL) {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
    }

    if (mode == RenderMode.FILL || mode == RenderMode.WIREFRAMESFILL) {
        const fillRed = 255 * intensity;
        const fillGreen = 255 * intensity;
        const fillBlue = 255 * intensity;
        ctx.fillStyle = `rgb(${fillRed}, ${fillGreen}, ${fillBlue})`;
    }

    ctx.beginPath();
    ctx.moveTo(triangle.v1.x, triangle.v1.y);
    ctx.lineTo(triangle.v2.x, triangle.v2.y);
    ctx.lineTo(triangle.v3.x, triangle.v3.y);
    ctx.closePath();

    if ((mode == RenderMode.WIREFRAMES || mode == RenderMode.WIREFRAMESFILL)) {
        ctx.stroke();
    }

    if (mode == RenderMode.FILL || mode == RenderMode.WIREFRAMESFILL) {
        ctx.fill();
    }
}

export function clearScreen() {
    const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    const ctx = canvas!.getContext("2d");

    ctx!.fillStyle = 'black';
    ctx!.fillRect(0, 0, canvas.width, canvas.height);
}