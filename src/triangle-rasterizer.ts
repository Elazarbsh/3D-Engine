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

    public rasterizeTriangleViaCanvasApi(canvas: HTMLCanvasElement | OffscreenCanvas, tri: Tri, material: Material, drawMeshEnabled: boolean) {
        const ctx = canvas.getContext("2d");

        if (ctx === null)
            throw new Error("an error occured while drawing");

        ctx.imageSmoothingEnabled = false;

        let v1 = tri.v1;
        let v2 = tri.v2;
        let v3 = tri.v3;

        let xc = (v1.x + v2.x + v3.x) / 3;
        let yc = (v1.y + v2.y + v3.y) / 3;

        // Calculate the distance between centroid and each vertex
        let dist1 = Math.sqrt((xc - v1.x) ** 2 + (yc - v1.y) ** 2);
        let dist2 = Math.sqrt((xc - v2.x) ** 2 + (yc - v2.y) ** 2);
        let dist3 = Math.sqrt((xc - v3.x) ** 2 + (yc - v3.y) ** 2);

        // Inflate each vertex by 0.5 pixels
        let inflationFactor = 0.5 / Math.max(dist1, dist2, dist3);
        let x1 = xc + (v1.x - xc) * (1 + inflationFactor);
        let x2 = xc + (v2.x - xc) * (1 + inflationFactor);
        let x3 = xc + (v3.x - xc) * (1 + inflationFactor);
        let y1 = yc + (v1.y - yc) * (1 + inflationFactor);
        let y2 = yc + (v2.y - yc) * (1 + inflationFactor);
        let y3 = yc + (v3.y - yc) * (1 + inflationFactor);

        if (material.wireframe == true) {
            ctx.strokeStyle = `rgb(${material.wireframeColor.red}, ${material.wireframeColor.green}, ${material.wireframeColor.blue})`;
            ctx.lineWidth = material.wireframeWidth;
        }

        const fillIntensity = tri.surfaceLightIntensity;
        ctx.fillStyle = `rgb(${material.color.red * fillIntensity}, ${material.color.green * fillIntensity}, ${material.color.blue * fillIntensity})`;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.closePath();

        if (material.wireframe) {
            ctx.stroke();
        }
        if(drawMeshEnabled){
            ctx.fill();
        }
    }

    public rasterizeTriangle(canvas: HTMLCanvasElement | OffscreenCanvas, tri: Tri, material: Material, drawMeshEnabled: boolean, textureMappingEnabled: boolean) {
        if (drawMeshEnabled) {
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const { v1, v2, v3, texel1, texel2, texel3 } = tri;

            const materialColor = material.color;
            const texture = material.texture;

            // Calculate the bounding box of the triangle
            const minX = Math.floor(Math.min(v1.x, v2.x, v3.x));
            const maxX = Math.ceil(Math.max(v1.x, v2.x, v3.x));
            const minY = Math.floor(Math.min(v1.y, v2.y, v3.y));
            const maxY = Math.ceil(Math.max(v1.y, v2.y, v3.y));

            // Loop through each pixel in the bounding box
            for (let y = minY; y <= maxY; y++) {
                for (let x = minX; x <= maxX; x++) {
                    // Calculate barycentric coordinates
                    const denominator = (v2.y - v3.y) * (v1.x - v3.x) + (v3.x - v2.x) * (v1.y - v3.y);
                    const lambda1 = ((v2.y - v3.y) * (x - v3.x) + (v3.x - v2.x) * (y - v3.y)) / denominator;
                    const lambda2 = ((v3.y - v1.y) * (x - v3.x) + (v1.x - v3.x) * (y - v3.y)) / denominator;
                    const lambda3 = 1 - lambda1 - lambda2;

                    // Check if the pixel is inside the triangle
                    if (lambda1 >= 0 && lambda2 >= 0 && lambda3 >= 0) {
                        // Interpolate the texture coordinates
                        if (textureMappingEnabled && texture != null) {
                            const u = lambda1 * texel1.u + lambda2 * texel2.u + lambda3 * texel3.u;
                            const v = lambda1 * texel1.v + lambda2 * texel2.v + lambda3 * texel3.v;

                            // Sample the color from the texture
                            const color = texture.sampleColorAtNormalizedCoordinates(u, v);
                            const red: number = color.red * (materialColor.red / 255) * tri.surfaceLightIntensity;
                            const green: number = color.green * (materialColor.green / 255) * tri.surfaceLightIntensity;
                            const blue: number = color.blue * (materialColor.blue / 255) * tri.surfaceLightIntensity;

                            this.drawPixel(canvas, x, y, new RGBA(red, green, blue), color.alpha);
                        } else {
                            const red: number = (materialColor.red) * tri.surfaceLightIntensity;
                            const green: number = (materialColor.green) * tri.surfaceLightIntensity;
                            const blue: number = (materialColor.blue) * tri.surfaceLightIntensity;
                            this.drawPixel(canvas, x, y, new RGBA(red, green, blue), materialColor.alpha);
                        }
                    }
                }
            }
        }
        if (material.wireframe) {
            this.drawWireframe(canvas, tri, material);
        }
    }

    public drawWireframe(canvas: HTMLCanvasElement | OffscreenCanvas, tri: Tri, material: Material) {
        let wireframeColor = material.wireframeColor;
        const { v1, v2, v3 } = tri;

        this.drawLine(canvas, v1.x, v1.y, v2.x, v2.y, wireframeColor);
        this.drawLine(canvas, v2.x, v2.y, v3.x, v3.y, wireframeColor);
        this.drawLine(canvas, v3.x, v3.y, v1.x, v1.y, wireframeColor);
    }

    private drawLine(canvas: HTMLCanvasElement | OffscreenCanvas, x0: number, y0: number, x1: number, y1: number, color: RGBA) {
        let x: number = x1 - x0;
        let y: number = y1 - y0;
        const max: number = Math.max(Math.abs(x), Math.abs(y));
        x /= max;
        y /= max;
        for (let n = 0; n < max; ++n) {
            this.drawPixel(canvas, x0, y0, color, color.alpha); // Ensure the endpoint is drawn
            x0 += x;
            y0 += y;
        }
    }

    private drawPixel(canvas: HTMLCanvasElement | OffscreenCanvas, x: number, y: number, color: RGBA, alpha: number) {
        var roundedX = Math.round(x);
        var roundedY = Math.round(y);
        var index = 4 * (canvas.width * roundedY + roundedX);
        this._imageData.data[index + 0] = color.red;
        this._imageData.data[index + 1] = color.green;
        this._imageData.data[index + 2] = color.blue;
        this._imageData.data[index + 3] = alpha;
    }

    public textureTrianglePerspectiveCorrect(canvas: HTMLCanvasElement | OffscreenCanvas, tri: Tri, tex: Texture, materialColor: RGBA) {
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

    // public textureTriangleAffine(canvas: HTMLCanvasElement, tri: Tri, tex: Texture, materialColor: RGBA) {
    //     let x1: number = tri.v1.x;
    //     let x2: number = tri.v2.x;
    //     let x3: number = tri.v3.x;

    //     let y1: number = tri.v1.y;
    //     let y2: number = tri.v2.y;
    //     let y3: number = tri.v3.y;

    //     let u1: number = tri.texel1.u;
    //     let u2: number = tri.texel2.u;
    //     let u3: number = tri.texel3.u;

    //     let v1: number = tri.texel1.v;
    //     let v2: number = tri.texel2.v;
    //     let v3: number = tri.texel3.v;

    //     if (y2 < y1) {
    //         [y1, y2] = [y2, y1];
    //         [x1, x2] = [x2, x1];
    //         [u1, u2] = [u2, u1];
    //         [v1, v2] = [v2, v1];
    //     }

    //     if (y3 < y1) {
    //         [y1, y3] = [y3, y1];
    //         [x1, x3] = [x3, x1];
    //         [u1, u3] = [u3, u1];
    //         [v1, v3] = [v3, v1];
    //     }

    //     if (y3 < y2) {
    //         [y2, y3] = [y3, y2];
    //         [x2, x3] = [x3, x2];
    //         [u2, u3] = [u3, u2];
    //         [v2, v3] = [v3, v2];
    //     }

    //     let dy1 = y2 - y1;
    //     let dx1 = x2 - x1;
    //     let dv1 = v2 - v1;
    //     let du1 = u2 - u1;

    //     let dy2 = y3 - y1;
    //     let dx2 = x3 - x1;
    //     let dv2 = v3 - v1;
    //     let du2 = u3 - u1;

    //     let tex_u, tex_v;

    //     let dax_step = 0, dbx_step = 0,
    //         du1_step = 0, dv1_step = 0,
    //         du2_step = 0, dv2_step = 0;

    //     if (dy1) dax_step = dx1 / Math.abs(dy1);
    //     if (dy2) dbx_step = dx2 / Math.abs(dy2);

    //     if (dy1) du1_step = du1 / Math.abs(dy1);
    //     if (dy1) dv1_step = dv1 / Math.abs(dy1);

    //     if (dy2) du2_step = du2 / Math.abs(dy2);
    //     if (dy2) dv2_step = dv2 / Math.abs(dy2);

    //     if (dy1) {
    //         for (let i = y1; i <= y2; i++) {
    //             let ax = x1 + (i - y1) * dax_step;
    //             let bx = x1 + (i - y1) * dbx_step;

    //             let tex_su = u1 + (i - y1) * du1_step;
    //             let tex_sv = v1 + (i - y1) * dv1_step;

    //             let tex_eu = u1 + (i - y1) * du2_step;
    //             let tex_ev = v1 + (i - y1) * dv2_step;

    //             if (ax > bx) {
    //                 [ax, bx] = [bx, ax];
    //                 [tex_su, tex_eu] = [tex_eu, tex_su];
    //                 [tex_sv, tex_ev] = [tex_ev, tex_sv];
    //             }

    //             tex_u = tex_su;
    //             tex_v = tex_sv;

    //             const tstep = 1.0 / (bx - ax);
    //             let t = 0.0;

    //             for (let j = ax; j <= bx; j++) {
    //                 tex_u = (1.0 - t) * tex_su + t * tex_eu;
    //                 tex_v = (1.0 - t) * tex_sv + t * tex_ev;

    //                 const color = tex.sampleColorAtNormalizedCoordinates(tex_u, tex_v);
    //                 const red: number = color.red * (materialColor.red / 255) * tri.surfaceLightIntensity;
    //                 const green: number = color.green * (materialColor.green / 255) * tri.surfaceLightIntensity;
    //                 const blue: number = color.blue * (materialColor.blue / 255) * tri.surfaceLightIntensity;
    //                 this.drawPixel(canvas, j, i, new RGBA(red, green, blue), color.alpha);

    //                 t += tstep;
    //             }
    //         }
    //     }

    //     dy1 = y3 - y2;
    //     dx1 = x3 - x2;
    //     dv1 = v3 - v2;
    //     du1 = u3 - u2;

    //     if (dy1) dax_step = dx1 / Math.abs(dy1);
    //     if (dy2) dbx_step = dx2 / Math.abs(dy2);

    //     du1_step = 0, dv1_step = 0;
    //     if (dy1) du1_step = du1 / Math.abs(dy1);
    //     if (dy1) dv1_step = dv1 / Math.abs(dy1);

    //     if (dy1) {
    //         for (let i = y2; i <= y3; i++) {
    //             let ax = x2 + (i - y2) * dax_step;
    //             let bx = x1 + (i - y1) * dbx_step;

    //             let tex_su = u2 + (i - y2) * du1_step;
    //             let tex_sv = v2 + (i - y2) * dv1_step;

    //             let tex_eu = u1 + (i - y1) * du2_step;
    //             let tex_ev = v1 + (i - y1) * dv2_step;

    //             if (ax > bx) {
    //                 [ax, bx] = [bx, ax];
    //                 [tex_su, tex_eu] = [tex_eu, tex_su];
    //                 [tex_sv, tex_ev] = [tex_ev, tex_sv];
    //             }

    //             tex_u = tex_su;
    //             tex_v = tex_sv;

    //             const tstep = 1.0 / (bx - ax);
    //             let t = 0.0;

    //             for (let j = ax; j <= bx; j++) {
    //                 tex_u = (1.0 - t) * tex_su + t * tex_eu;
    //                 tex_v = (1.0 - t) * tex_sv + t * tex_ev;

    //                 const color = tex.sampleColorAtNormalizedCoordinates(tex_u, tex_v);
    //                 const red: number = color.red * (materialColor.red / 255) * tri.surfaceLightIntensity;
    //                 const green: number = color.green * (materialColor.green / 255) * tri.surfaceLightIntensity;
    //                 const blue: number = color.blue * (materialColor.blue / 255) * tri.surfaceLightIntensity;

    //                 this.drawPixel(canvas, j, i, new RGBA(red, green, blue), color.alpha);

    //                 t += tstep;
    //             }
    //         }
    //     }
    // }



    // public rasterizeTriangle(canvas: HTMLCanvasElement, tri: Tri, materialColor: RGBA) {
    //     let x1: number = tri.v1.x;
    //     let x2: number = tri.v2.x;
    //     let x3: number = tri.v3.x;

    //     let y1: number = tri.v1.y;
    //     let y2: number = tri.v2.y;
    //     let y3: number = tri.v3.y;

    //     let w1: number = tri.v1.w;
    //     let w2: number = tri.v2.w;
    //     let w3: number = tri.v3.w;

    //     if (y2 < y1) {
    //         [y1, y2] = [y2, y1];
    //         [x1, x2] = [x2, x1];
    //         [w1, w2] = [w2, w1];
    //     }

    //     if (y3 < y1) {
    //         [y1, y3] = [y3, y1];
    //         [x1, x3] = [x3, x1];
    //         [w1, w3] = [w3, w1];
    //     }

    //     if (y3 < y2) {
    //         [y2, y3] = [y3, y2];
    //         [x2, x3] = [x3, x2];
    //         [w2, w3] = [w3, w2];
    //     }

    //     let dy1 = y2 - y1;
    //     let dx1 = x2 - x1;
    //     let dw1 = w2 - w1;

    //     let dy2 = y3 - y1;
    //     let dx2 = x3 - x1;
    //     let dw2 = w3 - w1;

    //     let tex_w;

    //     let dax_step = 0, dbx_step = 0,
    //         dw1_step = 0, dw2_step = 0;

    //     if (dy1) dax_step = dx1 / Math.abs(dy1);
    //     if (dy2) dbx_step = dx2 / Math.abs(dy2);

    //     if (dy1) dw1_step = dw1 / Math.abs(dy1);

    //     if (dy2) dw2_step = dw2 / Math.abs(dy2);

    //     if (dy1) {
    //         for (let i = y1; i <= y2; i++) {
    //             let ax = x1 + (i - y1) * dax_step;
    //             let bx = x1 + (i - y1) * dbx_step;

    //             let tex_sw = w1 + (i - y1) * dw1_step;
    //             let tex_ew = w1 + (i - y1) * dw2_step;

    //             if (ax > bx) {
    //                 [ax, bx] = [bx, ax];
    //                 [tex_sw, tex_ew] = [tex_ew, tex_sw];
    //             }

    //             tex_w = tex_sw;

    //             const tstep = 1.0 / (bx - ax);
    //             let t = 0.0;

    //             for (let j = ax; j < bx; j++) {
    //                 tex_w = (1.0 - t) * tex_sw + t * tex_ew;
    //                 var index = Math.floor(i * canvas.width + j);

    //                 if (tex_w > this._depthBuffer[index]) {
    //                     const red: number = (materialColor.red) * tri.surfaceLightIntensity;
    //                     const green: number = (materialColor.green) * tri.surfaceLightIntensity;
    //                     const blue: number = (materialColor.blue) * tri.surfaceLightIntensity;

    //                     this.drawPixel(canvas, j, i, new RGBA(red, green, blue), materialColor.alpha);
    //                     this._depthBuffer[i * canvas.width + j] = tex_w;
    //                 }
    //                 t += tstep;
    //             }
    //         }
    //     }

    //     dy1 = y3 - y2;
    //     dx1 = x3 - x2;
    //     dw1 = w3 - w2;

    //     if (dy1) dax_step = dx1 / Math.abs(dy1);
    //     if (dy2) dbx_step = dx2 / Math.abs(dy2);

    //     if (dy1) dw1_step = dw1 / Math.abs(dy1);

    //     if (dy1) {
    //         for (let i = y2; i <= y3; i++) {
    //             let ax = x2 + (i - y2) * dax_step;
    //             let bx = x1 + (i - y1) * dbx_step;

    //             let tex_sw = w2 + (i - y2) * dw1_step;

    //             let tex_ew = w1 + (i - y1) * dw2_step;

    //             if (ax > bx) {
    //                 [ax, bx] = [bx, ax];
    //                 [tex_sw, tex_ew] = [tex_ew, tex_sw];
    //             }

    //             tex_w = tex_sw;

    //             const tstep = 1.0 / (bx - ax);
    //             let t = 0.0;

    //             for (let j = ax; j < bx; j++) {
    //                 tex_w = (1.0 - t) * tex_sw + t * tex_ew;

    //                 const red: number = (materialColor.red) * tri.surfaceLightIntensity;
    //                 const green: number = (materialColor.green) * tri.surfaceLightIntensity;
    //                 const blue: number = (materialColor.blue) * tri.surfaceLightIntensity;

    //                 var index = Math.floor(i * canvas.width + j);

    //                 if (tex_w > this._depthBuffer[index]) {
    //                     this.drawPixel(canvas, j, i, new RGBA(red, green, blue), materialColor.alpha);
    //                     this._depthBuffer[i * canvas.width + j] = tex_w;
    //                 }
    //                 t += tstep;
    //             }
    //         }
    //     }
    // }

}