import { RGB } from "./rgb.js";
import { Tri } from "./tri.js";
import { Vec3 } from "./vec3.js";

export class TriangleRasterizer{
    
    private _canvas: HTMLCanvasElement;
    private _imageData : ImageData
    private _context : CanvasRenderingContext2D | null;

    constructor(canvas : HTMLCanvasElement){
        this._canvas = canvas;
        this._context = this.canvas.getContext('2d');
        if(this._context == null)
            throw new Error("null ctx");
        this._imageData = this._context.createImageData(canvas.width, canvas.height);

        this.blackenBackground();
    }

    public rasterizeTriangle(tri : Tri){
        const minX = Math.min(tri.v1.x, tri.v2.x, tri.v3.x);
        const minY = Math.min(tri.v1.y, tri.v2.y, tri.v3.y);
        const maxX = Math.max(tri.v1.x, tri.v2.x, tri.v3.x);
        const maxY = Math.max(tri.v1.y, tri.v2.y, tri.v3.y);
    
        // Iterate over bounding box
        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                const p = new Vec3(x, y, 0);
                if (Tri.isPointInTriangle(p, tri.v1, tri.v2, tri.v3)) {
                    this.drawPixel(p.x, p.y, new RGB(0,255,0));
                }
            }
        }
    }



    public drawPixel(x : number, y : number, color : RGB) {
        this._context!.fillStyle = `rgb(${color.red}, ${color.green}, ${color.blue})`;
        this._context!.fillRect(x, y, 1, 1);
    }

    public setPixel(imageData : ImageData, x : number, y : number, color : RGB, alpha : number) {
        imageData.data[0] = color.red;
        imageData.data[1] = color.green;
        imageData.data[2] = color.blue;
        imageData.data[3] = alpha;
        this._context!.putImageData( imageData, x, y ); 
    }

    public drawPixel2(x : number, y : number, color : RGB, alpha : number) {
        var roundedX = Math.round(x);
        var roundedY = Math.round(y);
        var index = 4 * (this.canvas.width * roundedY + roundedX);
        this._imageData.data[index + 0] = color.red;
        this._imageData.data[index + 1] = color.green;
        this._imageData.data[index + 2] = color.blue;
        this._imageData.data[index + 3] = alpha;
    }

    public blackenBackground(){
        for (let i = 0; i < this._imageData.data.length; i += 4) {
            this._imageData.data[i] = 0;     // Red channel
            this._imageData.data[i + 1] = 0; // Green channel
            this._imageData.data[i + 2] = 0; // Blue channel
            this._imageData.data[i + 3] = 255; // Alpha channel (255 is fully opaque)
        }
        this._context!.putImageData(this._imageData, 0, 0);
    }

    public swapBuffer() {
        this._context!.putImageData(this._imageData, 0, 0);
    }

    public get canvas(): HTMLCanvasElement {
        return this._canvas;
    }
    public set canvas(value: HTMLCanvasElement) {
        this._canvas = value;
    }

    public rasterizeTriangle2(
        x1: number, y1: number,
        x2: number, y2: number,
        x3: number, y3: number
    ) {
        if (y2 < y1) {
            [y1, y2] = [y2, y1];
            [x1, x2] = [x2, x1];
        }
    
        if (y3 < y1) {
            [y1, y3] = [y3, y1];
            [x1, x3] = [x3, x1];
        }
    
        if (y3 < y2) {
            [y2, y3] = [y3, y2];
            [x2, x3] = [x3, x2];
        }
    
        let dy1 = y2 - y1;
        let dx1 = x2 - x1;
    
        let dy2 = y3 - y1;
        let dx2 = x3 - x1;
        
        let dax_step = 0, dbx_step = 0,
            du1_step = 0, dv1_step = 0;
    
        if (dy1) dax_step = dx1 / Math.abs(dy1);
        if (dy2) dbx_step = dx2 / Math.abs(dy2);
    
        if (dy1) {
            for (let i = y1; i <= y2; i++) {
                let ax = x1 + (i - y1) * dax_step;
                let bx = x1 + (i - y1) * dbx_step;
    
                if (ax > bx) {
                    [ax, bx] = [bx, ax];
                }
  
                const tstep = 1.0 / (bx - ax);
                let t = 0.0;
    
                for (let j = ax; j < bx; j++) {
                    // Assuming you have Draw and pDepthBuffer functions
                    // Draw(j, i, tex.SampleGlyph(tex_u / tex_w, tex_v / tex_w), tex.SampleColour(tex_u / tex_w, tex_v / tex_w));
                    // pDepthBuffer[i * ScreenWidth() + j] = tex_w;
                    //this.drawPixel(j,i,new RGB(255,255,255));
                    this.drawPixel2(j, i, new RGB(0, 200, 200), 255);

                    t += tstep;
                }
            }
        }
    
        dy1 = y3 - y2;
        dx1 = x3 - x2;

        if (dy1) dax_step = dx1 / Math.abs(dy1);
        if (dy2) dbx_step = dx2 / Math.abs(dy2);
    
        du1_step = 0, dv1_step = 0;
    
        if (dy1) {
            for (let i = y2; i <= y3; i++) {
                let ax = x2 + (i - y2) * dax_step;
                let bx = x1 + (i - y1) * dbx_step;
    
                if (ax > bx) {
                    [ax, bx] = [bx, ax];
                }
    
                const tstep = 1.0 / (bx - ax);
                let t = 0.0;
    
                for (let j = ax; j < bx; j++) {
    
                    // Assuming you have Draw and pDepthBuffer functions
                    // Draw(j, i, tex.SampleGlyph(tex_u / tex_w, tex_v / tex_w), tex.SampleColour(tex_u / tex_w, tex_v / tex_w));
                    // pDepthBuffer[i * ScreenWidth() + j] = tex_w;
                    //this.drawPixel(j,i,new RGB(255,255,255));
                    this.drawPixel2(j, i, new RGB(0, 200, 200), 255);
                    t += tstep;
                }
            }
        }
        this.swapBuffer();
    }


    ///////////////////

    public sampleColor(imageData: ImageData, u: number, v: number): Uint8ClampedArray {
        const x = Math.floor(u * (imageData.width - 1));
        const y = Math.floor((1-v) * (imageData.height - 1));

        // console.log(`getting color at uv = (${x}, ${y})`);
    
        const index = (y * imageData.width + x) * 4;
        
        return new Uint8ClampedArray([
            imageData.data[index],
            imageData.data[index + 1],
            imageData.data[index + 2],
            imageData.data[index + 3]
        ]);
    }

    public textureTriangle(
        x1: number, y1: number, u1: number, v1: number, w1: number,
        x2: number, y2: number, u2: number, v2: number, w2: number,
        x3: number, y3: number, u3: number, v3: number, w3: number,
        tex: ImageData
    ) {
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

    
                    // Assuming you have Draw and pDepthBuffer functions
                    // Draw(j, i, tex.SampleGlyph(tex_u / tex_w, tex_v / tex_w), tex.SampleColour(tex_u / tex_w, tex_v / tex_w));
                    // pDepthBuffer[i * ScreenWidth() + j] = tex_w;
                    const sampledColor = this.sampleColor(tex, tex_u / tex_w, tex_v / tex_w);
                    const red = sampledColor[0];
                    const green = sampledColor[1];
                    const blue = sampledColor[2];
                    const alpha = sampledColor[3];
                    //console.log(`drawing pixel: (${red}, ${green}, ${blue}, ${alpha}) at (${j}, ${i})`);
                    this.drawPixel2(j, i, new RGB(red, green, blue), alpha);
                    t += tstep;
                }
            }
        }
    
        // console.log("BOTTOM TRI");
        
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
 
                    // Assuming you have Draw and pDepthBuffer functions
                    // Draw(j, i, tex.SampleGlyph(tex_u / tex_w, tex_v / tex_w), tex.SampleColour(tex_u / tex_w, tex_v / tex_w));
                    // pDepthBuffer[i * ScreenWidth() + j] = tex_w;
                    const sampledColor = this.sampleColor(tex, tex_u / tex_w, tex_v / tex_w);
                    const red = sampledColor[0];
                    const green = sampledColor[1];
                    const blue = sampledColor[2];
                    const alpha = sampledColor[3];
                    //console.log(`drawing pixel: (${red}, ${green}, ${blue}, ${alpha}) at (${j}, ${i})`);
                    this.drawPixel2(j, i, new RGB(red, green, blue), alpha);
                    t += tstep;
                }
            }
        }
        this.swapBuffer();
    }


////////////////////////////////////////////////////////////


    public gptTextureTriangle(
        x1: number, y1: number, u1: number, v1: number, w1: number,
        x2: number, y2: number, u2: number, v2: number, w2: number,
        x3: number, y3: number, u3: number, v3: number, w3: number,
        tex: ImageData
    ) {
        const minY = Math.min(y1, y2, y3);
        const maxY = Math.max(y1, y2, y3);
        const minX = Math.min(x1, x2, x3);
        const maxX = Math.max(x1, x2, x3);
    
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const b1 = this.sign(x2, y2, x3, y3, x, y) < 0.0;
                const b2 = this.sign(x3, y3, x1, y1, x, y) < 0.0;
                const b3 = this.sign(x1, y1, x2, y2, x, y) < 0.0;
    
                if ((b1 === b2) && (b2 === b3)) {
                    const w1s = this.sign(x2, y2, x3, y3, x, y);
                    const w2s = this.sign(x3, y3, x1, y1, x, y);
                    const w3s = this.sign(x1, y1, x2, y2, x, y);
    
                    const totalW = w1 * w1s + w2 * w2s + w3 * w3s;
    
                    const ws1 = w1 * w1s / totalW;
                    const ws2 = w2 * w2s / totalW;
                    const ws3 = w3 * w3s / totalW;
    
                    const u = (u1 * ws1 + u2 * ws2 + u3 * ws3) / totalW;
                    const v = (v1 * ws1 + v2 * ws2 + v3 * ws3) / totalW;
    
                    const texel = this.sampleTexture(tex, u, v);
                    this.drawPixel2(x, y, new RGB(texel.r, texel.g, texel.b), texel.a);
                }
            }
        }
        this.swapBuffer();
    }
    
    public sign(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): number {
        return (x1 - x3) * (y2 - y3) - (x2 - x3) * (y1 - y3);
    }
    
    public sampleTexture(tex: ImageData, u: number, v: number): {r:number, g:number,b:number,a:number,} {
        const x = Math.floor(u * (tex.width - 1));
        const y = Math.floor(v * (tex.height - 1));
        const index = (y * tex.width + x) * 4;
        return {
            r: tex.data[index],
            g: tex.data[index + 1],
            b: tex.data[index + 2],
            a: tex.data[index + 3]
        };
    }
    
    

}