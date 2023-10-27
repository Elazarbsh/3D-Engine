import { Material } from "./material.js";
import { RGBA } from "./rgba.js";
import { Texture } from "./texture.js";
import { Tri } from "./tri.js";

export class TriangleRasterizer {

    private _depthBuffer: number[];
    private _imageData: ImageData

    constructor(imageData: ImageData, depthBuffer: number[]) {
        this._imageData = imageData;
        this._depthBuffer = depthBuffer;
    }

    private drawPixel(canvas : HTMLCanvasElement,x: number, y: number, color: RGBA, alpha: number) {
        var roundedX = Math.round(x);
        var roundedY = Math.round(y);
        var index = 4 * (canvas.width * roundedY + roundedX);
        this._imageData.data[index + 0] = color.red;
        this._imageData.data[index + 1] = color.green;
        this._imageData.data[index + 2] = color.blue;
        this._imageData.data[index + 3] = alpha;
    }

    public fillTriangle(canvas : HTMLCanvasElement, tri : Tri, material : Material) {
        const ctx = canvas.getContext("2d");

        if (ctx === null)
            throw new Error("an error occured while drawing");

        if (material.wireframe == true) {
            ctx.strokeStyle = `rgb(${material.wireframeColor.red}, ${material.wireframeColor.green}, ${material.wireframeColor.blue})`;
            ctx.lineWidth = material.wireframeWidth;
        }

        const fillIntensity = tri.surfaceLightIntensity;
        ctx.fillStyle = `rgb(${material.color.red * fillIntensity}, ${material.color.green * fillIntensity}, ${material.color.blue * fillIntensity})`;

        ctx.beginPath();
        ctx.moveTo(tri.v1.x, tri.v1.y);
        ctx.lineTo(tri.v2.x, tri.v2.y);
        ctx.lineTo(tri.v3.x, tri.v3.y);
        ctx.closePath();
        if (material.wireframe) {
            ctx.stroke();
        }
        ctx.fill();
    }

    public textureTriangle(canvas : HTMLCanvasElement, tri: Tri, tex: Texture, materialColor: RGBA) {
        let x1: number = tri.v1.x;
        let x2: number = tri.v2.x;
        let x3: number = tri.v3.x;

        let y1: number = tri.v1.y;
        let y2: number = tri.v2.y;
        let y3: number = tri.v3.y;

        let u1: number = tri.texel1.u;
        let u2: number = tri.texel2.u;
        let u3: number = tri.texel3.u;

        let v1: number = tri.texel1.v;
        let v2: number = tri.texel2.v;
        let v3: number = tri.texel3.v;

        let w1: number = tri.texel1.w;
        let w2: number = tri.texel2.w;
        let w3: number = tri.texel3.w;

        if (y2 < y1) {
            [y1, y2] = [y2, y1];
            [x1, x2] = [x2, x1];
            [u1, u2] = [u2, u1];
            [v1, v2] = [v2, v1];
            [w1, w2] = [w2, w1];
        }

        if (y3 < y1) {
            [y1, y3] = [y3, y1];
            [x1, x3] = [x3, x1];
            [u1, u3] = [u3, u1];
            [v1, v3] = [v3, v1];
            [w1, w3] = [w3, w1];
        }

        if (y3 < y2) {
            [y2, y3] = [y3, y2];
            [x2, x3] = [x3, x2];
            [u2, u3] = [u3, u2];
            [v2, v3] = [v3, v2];
            [w2, w3] = [w3, w2];
        }

        let dy1 = y2 - y1;
        let dx1 = x2 - x1;
        let dv1 = v2 - v1;
        let du1 = u2 - u1;
        let dw1 = w2 - w1;

        let dy2 = y3 - y1;
        let dx2 = x3 - x1;
        let dv2 = v3 - v1;
        let du2 = u3 - u1;
        let dw2 = w3 - w1;

        let tex_u, tex_v, tex_w;

        let dax_step = 0, dbx_step = 0,
            du1_step = 0, dv1_step = 0,
            du2_step = 0, dv2_step = 0,
            dw1_step = 0, dw2_step = 0;

        if (dy1) dax_step = dx1 / Math.abs(dy1);
        if (dy2) dbx_step = dx2 / Math.abs(dy2);

        if (dy1) du1_step = du1 / Math.abs(dy1);
        if (dy1) dv1_step = dv1 / Math.abs(dy1);
        if (dy1) dw1_step = dw1 / Math.abs(dy1);

        if (dy2) du2_step = du2 / Math.abs(dy2);
        if (dy2) dv2_step = dv2 / Math.abs(dy2);
        if (dy2) dw2_step = dw2 / Math.abs(dy2);

        if (dy1) {
            for (let i = y1; i <= y2; i++) {
                let ax = x1 + (i - y1) * dax_step;
                let bx = x1 + (i - y1) * dbx_step;

                let tex_su = u1 + (i - y1) * du1_step;
                let tex_sv = v1 + (i - y1) * dv1_step;
                let tex_sw = w1 + (i - y1) * dw1_step;

                let tex_eu = u1 + (i - y1) * du2_step;
                let tex_ev = v1 + (i - y1) * dv2_step;
                let tex_ew = w1 + (i - y1) * dw2_step;

                if (ax > bx) {
                    [ax, bx] = [bx, ax];
                    [tex_su, tex_eu] = [tex_eu, tex_su];
                    [tex_sv, tex_ev] = [tex_ev, tex_sv];
                    [tex_sw, tex_ew] = [tex_ew, tex_sw];
                }

                tex_u = tex_su;
                tex_v = tex_sv;
                tex_w = tex_sw;

                const tstep = 1.0 / (bx - ax);
                let t = 0.0;

                for (let j = ax; j < bx; j++) {
                    tex_u = (1.0 - t) * tex_su + t * tex_eu;
                    tex_v = (1.0 - t) * tex_sv + t * tex_ev;
                    tex_w = (1.0 - t) * tex_sw + t * tex_ew;
                    var index = Math.floor(i * canvas.width + j);

                    if (tex_w > this._depthBuffer[index]) {
                        const color = tex.sampleColorAtNormalizedCoordinates(tex_u / tex_w, tex_v / tex_w);
                        const red: number = color.red * (materialColor.red / 255) * tri.surfaceLightIntensity;
                        const green: number = color.green * (materialColor.green / 255) * tri.surfaceLightIntensity;
                        const blue: number = color.blue * (materialColor.blue / 255) * tri.surfaceLightIntensity;

                        this.drawPixel(canvas, j, i, new RGBA(red, green, blue), color.alpha);
                        this._depthBuffer[i * canvas.width + j] = tex_w;
                    }
                    t += tstep;
                }
            }
        }

        dy1 = y3 - y2;
        dx1 = x3 - x2;
        dv1 = v3 - v2;
        du1 = u3 - u2;
        dw1 = w3 - w2;

        if (dy1) dax_step = dx1 / Math.abs(dy1);
        if (dy2) dbx_step = dx2 / Math.abs(dy2);

        du1_step = 0, dv1_step = 0;
        if (dy1) du1_step = du1 / Math.abs(dy1);
        if (dy1) dv1_step = dv1 / Math.abs(dy1);
        if (dy1) dw1_step = dw1 / Math.abs(dy1);

        if (dy1) {
            for (let i = y2; i <= y3; i++) {
                let ax = x2 + (i - y2) * dax_step;
                let bx = x1 + (i - y1) * dbx_step;

                let tex_su = u2 + (i - y2) * du1_step;
                let tex_sv = v2 + (i - y2) * dv1_step;
                let tex_sw = w2 + (i - y2) * dw1_step;

                let tex_eu = u1 + (i - y1) * du2_step;
                let tex_ev = v1 + (i - y1) * dv2_step;
                let tex_ew = w1 + (i - y1) * dw2_step;

                if (ax > bx) {
                    [ax, bx] = [bx, ax];
                    [tex_su, tex_eu] = [tex_eu, tex_su];
                    [tex_sv, tex_ev] = [tex_ev, tex_sv];
                    [tex_sw, tex_ew] = [tex_ew, tex_sw];
                }

                tex_u = tex_su;
                tex_v = tex_sv;
                tex_w = tex_sw;

                const tstep = 1.0 / (bx - ax);
                let t = 0.0;

                for (let j = ax; j < bx; j++) {
                    tex_u = (1.0 - t) * tex_su + t * tex_eu;
                    tex_v = (1.0 - t) * tex_sv + t * tex_ev;
                    tex_w = (1.0 - t) * tex_sw + t * tex_ew;

                    const color = tex.sampleColorAtNormalizedCoordinates(tex_u / tex_w, tex_v / tex_w);
                    const red: number = color.red * (materialColor.red / 255) * tri.surfaceLightIntensity;
                    const green: number = color.green * (materialColor.green / 255) * tri.surfaceLightIntensity;
                    const blue: number = color.blue * (materialColor.blue / 255) * tri.surfaceLightIntensity;

                    var index = Math.floor(i * canvas.width + j);

                    if (tex_w > this._depthBuffer[index]) {
                        this.drawPixel(canvas, j, i, new RGBA(red, green, blue), color.alpha);
                        this._depthBuffer[i * canvas.width + j] = tex_w;
                    }
                    t += tstep;
                }
            }
        }
    }
}