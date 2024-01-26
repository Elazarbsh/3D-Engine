import { Camera } from "./camera.js";
import { Mat4x4 } from "./mat4x4.js";
import { Material } from "./material.js";
import { Model } from "./model.js";
import { Plane } from "./plane.js";
import { RGBA } from "./rgba.js";
import { Scene } from "./scene.js";
import { Texel } from "./texel.js";
import { Texture } from "./texture.js";
import { Tri } from "./tri.js";
import { TriangleClipper } from "./triangle-clipper.js";
import { TriangleRasterizer } from "./triangle-rasterizer.js";
import { Vec3 } from "./vec3.js";

export class Renderer {

    private _screenWidth: number;
    private _screenHeight: number;
    private _canvas: HTMLCanvasElement;
    private _rasterizer: TriangleRasterizer;
    private _depthBuffer: number[];
    private _imageData: ImageData;
    private _canvasCtx: CanvasRenderingContext2D | null;
    private _backgroundColor: RGBA;


    constructor(canvas: HTMLCanvasElement) {
        this._screenWidth = canvas.width;
        this._screenHeight = canvas.height;
        this._canvas = canvas;
        this._canvasCtx = canvas.getContext('2d');

        if (this._canvasCtx == null)
            throw new Error("null ctx");

        this._imageData = this._canvasCtx.createImageData(canvas.width, canvas.height);
        this._depthBuffer = new Array(canvas.width * canvas.height).fill(0);
        this._rasterizer = new TriangleRasterizer(this._imageData, this._depthBuffer);
        this._backgroundColor = new RGBA(0,0,0);
    }

    public render(scene: Scene, camera: Camera) : void{
        for (const model of scene.models) {
            this.renderMesh(model, scene, camera);
        }
    }

    private renderMesh(mesh: Model, scene: Scene, cam: Camera) : void{
        const translationMatrix: Mat4x4 = Mat4x4.getTranslationMatrix(mesh.translation);
        const cameraMatrix: Mat4x4 = cam.cameraMatrix();
        const projectionMatrix: Mat4x4 = Mat4x4.getProjectionMatrix(90, this.screenHeight / this.screenWidth, 0.1, 100);
        const rotationMatrix = Mat4x4.multiply(
            Mat4x4.getZaxisRotationMatrix(mesh.rotation.z), 
            Mat4x4.multiply(Mat4x4.getYaxisRotationMatrix(mesh.rotation.y), Mat4x4.getXaxisRotationMatrix(mesh.rotation.x)));

        let trisToRaster: Tri[] = [];

        for (const tri of mesh.tris) {
            const rotatedTri = Tri.matrixMul(tri, rotationMatrix);
            const translatedTri = Tri.matrixMul(rotatedTri, translationMatrix)
            const camViewTri: Tri = Tri.matrixMul(translatedTri, cameraMatrix);

            if (cam.isVisibleTri(camViewTri)) {
                const clipedTris: Tri[] = TriangleClipper.clipAgainstPlane(
                    new Plane(new Vec3(0, 0, 0.001), new Vec3(0, 0, 0.001)),
                    camViewTri
                );

                for (const tri of clipedTris) {

                    // calcualte light intensity
                    tri.surfaceLightIntensity = scene.light.isEnabled ? scene.light.calculateLightIntensity(rotatedTri) : 1;

                    // to camera space
                    const projectedTri: Tri = Tri.matrixMul(tri, projectionMatrix);

                    // depth normalization
                    const normalizedDepthTri = Tri.normalizeDepth(projectedTri);

                    // to screen space
                    const screenTri = Tri.toScreenSpace(normalizedDepthTri, this.screenWidth, this.screenHeight);

                    // prepare texels projection
                    screenTri.texel1 = Texel.div(screenTri.texel1, projectedTri.v1.w);
                    screenTri.texel2 = Texel.div(screenTri.texel2, projectedTri.v2.w);
                    screenTri.texel3 = Texel.div(screenTri.texel3, projectedTri.v3.w);

                    trisToRaster.push(screenTri);
                }
            }
        }

        const clippedTris = this.clipScreenSpace(trisToRaster);

        if (mesh.material.texture === null) {
            this.draw(clippedTris.sort(this.sortTriangles), mesh.material);
        } else {
            this.texturize(clippedTris.sort(this.sortTriangles), mesh.material.color, mesh.material.texture);
        }
    }

    private sortTriangles(t1: Tri, t2: Tri): number {
        const z1 = (t1.v1.z + t1.v2.z + t1.v3.z) / 3.0;
        const z2 = (t2.v1.z + t2.v2.z + t2.v3.z) / 3.0;
        return z2 - z1;
    }

    private clipScreenSpace(trisToRaster: Tri[]): Tri[] {
        const topScreenPlane = new Plane(new Vec3(0, 1, 0), new Vec3(0, 0, 0));
        const bottomScreenPlane = new Plane(new Vec3(0, -1, 0), new Vec3(0, this.screenHeight, 0)); // top
        const leftScreenPlane = new Plane(new Vec3(1, 0, 0), new Vec3(0, 0, 0));
        const rightScreenPlane = new Plane(new Vec3(-1, 0, 0), new Vec3(this.screenWidth, 0, 0)); // left

        const res = [];

        for (const tri of trisToRaster) {
            let newTris = 1;
            const triList: Tri[] = [tri];
            for (const plane of [topScreenPlane, bottomScreenPlane, leftScreenPlane, rightScreenPlane]) {
                let trisToAdd: Tri[] = [];
                while (newTris > 0) {
                    const triToClip = triList.shift();

                    if (triToClip === undefined) {
                        throw Error("cant clip undefined triangle");
                    }
                    newTris--;
                    trisToAdd = TriangleClipper.clipAgainstPlane(plane, triToClip);
                    triList.push(...trisToAdd);
                }
                newTris = triList.length;
            }
            res.push(...triList);
        }
        return res;
    }

    private clearImageData(imageData: ImageData) : void{
        const dataSize = imageData.width * imageData.height * 4;
        for (let i = 0; i < dataSize; i += 4) {
            imageData.data[i] = this.backgroundColor.red;
            imageData.data[i + 1] = this.backgroundColor.green;
            imageData.data[i + 2] = this.backgroundColor.blue;
            imageData.data[i + 3] = this._backgroundColor.alpha;
        }
        this.clearDepthBuffer();
    }

    private texturize(trisToRaster: Tri[], color : RGBA ,texture: Texture) {
        this.clearImageData(this._imageData);
        for (const tri of trisToRaster) {
            this._rasterizer.textureTriangle(this.canvas, tri,texture, color);
        }
        this.swapBuffer();
    }

    private draw(trisToRaster: Tri[], material : Material) {
        this.clearScreen();
        for (const tri of trisToRaster) {
            this._rasterizer.fillTriangle(this.canvas, tri, material);
        }
    }

    private clearScreen() : void{
        this.clearImageData(this._imageData);
        this.swapBuffer();
    }

    private swapBuffer() : void {
        this._canvasCtx!.putImageData(this._imageData, 0, 0);
    }

    private clearDepthBuffer() : void{
        this._depthBuffer.fill(0);
    }

    public get canvas(): HTMLCanvasElement {
        return this._canvas;
    }
    public set canvas(value: HTMLCanvasElement) {
        this._canvas = value;
    }
    public get screenWidth(): number {
        return this._screenWidth;
    }
    public set screenWidth(value: number) {
        this._screenWidth = value;
    }
    public get screenHeight(): number {
        return this._screenHeight;
    }
    public set screenHeight(value: number) {
        this._screenHeight = value;
    }
    public get backgroundColor(): RGBA {
        return this._backgroundColor;
    }
    public set backgroundColor(value: RGBA) {
        this._backgroundColor = value;
    }
}