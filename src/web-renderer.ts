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
    private _canvas: HTMLCanvasElement | OffscreenCanvas;
    private _rasterizer: TriangleRasterizer;
    private _depthBuffer: number[];
    private _imageData: ImageData;
    private _canvasCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
    private _backgroundColor: RGBA;
    private _enableNonCameraFacingTrisRendering: boolean = false;
    private _enablePerspectiveCorrectTextureMapping: boolean = false;
    private _enableRasterizationViaCanvasApi: boolean = true;
    private _enableTextureMapping: boolean = true;

    constructor(canvas: HTMLCanvasElement | OffscreenCanvas) {
        this._screenWidth = canvas.width;
        this._screenHeight = canvas.height;
        this._canvas = canvas;
        this._canvasCtx = canvas.getContext('2d');

        if (this._canvasCtx == null)
            throw new Error("null ctx");

        this._imageData = this._canvasCtx.createImageData(canvas.width, canvas.height);
        this._depthBuffer = new Array(canvas.width * canvas.height).fill(0);
        this._rasterizer = new TriangleRasterizer(this._imageData, this._depthBuffer);
        this._backgroundColor = new RGBA(0, 0, 0);
    }

    public render(scene: Scene, camera: Camera): void {
        for (const model of scene.models) {
            this.renderMesh(model, scene, camera);
        }
    }

    private renderMesh(mesh: Model, scene: Scene, cam: Camera): void {
        const translationMatrix: Mat4x4 = Mat4x4.getTranslationMatrix(mesh.translation);
        const cameraMatrix: Mat4x4 = cam.cameraMatrix();
        const projectionMatrix: Mat4x4 = Mat4x4.getProjectionMatrix(90, this._screenHeight / this._screenWidth, 0.1, 100);
        const rotationMatrix = Mat4x4.multiply(
            Mat4x4.getZaxisRotationMatrix(mesh.rotation.z),
            Mat4x4.multiply(Mat4x4.getYaxisRotationMatrix(mesh.rotation.y), Mat4x4.getXaxisRotationMatrix(mesh.rotation.x)));

        let trisToRaster: Tri[] = [];

        for (const tri of mesh.tris) {
            const rotatedTri = Tri.matrixMul(tri, rotationMatrix);
            const translatedTri = Tri.matrixMul(rotatedTri, translationMatrix)
            const camViewTri: Tri = Tri.matrixMul(translatedTri, cameraMatrix);


            if (cam.isVisibleTri(camViewTri) || this._enableNonCameraFacingTrisRendering) {
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
                    const screenTri = Tri.toScreenSpace(normalizedDepthTri, this._screenWidth, this._screenHeight);

                    // prepare texels projection
                    if (this._enablePerspectiveCorrectTextureMapping && mesh.material.texture != null) {
                        screenTri.texel1 = Texel.div(screenTri.texel1, projectedTri.v1.w);
                        screenTri.texel2 = Texel.div(screenTri.texel2, projectedTri.v2.w);
                        screenTri.texel3 = Texel.div(screenTri.texel3, projectedTri.v3.w);
                    }

                    trisToRaster.push(screenTri);
                }
            }
        }

        const clippedTris = this.clipScreenSpace(trisToRaster);

        if (!this._enableTextureMapping && this._enableRasterizationViaCanvasApi) {
            this.rasterizeViaCanvasApi(clippedTris.sort(this.sortTriangles), mesh.material);
        } else {
            this.rasterize(clippedTris.sort(this.sortTriangles), mesh.material);
        }
    }

    private sortTriangles(t1: Tri, t2: Tri): number {
        const z1 = (t1.v1.z + t1.v2.z + t1.v3.z) / 3.0;
        const z2 = (t2.v1.z + t2.v2.z + t2.v3.z) / 3.0;
        return z2 - z1;
    }

    private clipScreenSpace(trisToRaster: Tri[]): Tri[] {
        const topScreenPlane = new Plane(new Vec3(0, 1, 0), new Vec3(0, 0, 0));
        const bottomScreenPlane = new Plane(new Vec3(0, -1, 0), new Vec3(0, this._screenHeight, 0)); // top
        const leftScreenPlane = new Plane(new Vec3(1, 0, 0), new Vec3(0, 0, 0));
        const rightScreenPlane = new Plane(new Vec3(-1, 0, 0), new Vec3(this._screenWidth, 0, 0)); // left

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

    private clearImageData(imageData: ImageData): void {
        const dataSize = imageData.width * imageData.height * 4;
        for (let i = 0; i < dataSize; i += 4) {
            imageData.data[i] = this.backgroundColor.red;
            imageData.data[i + 1] = this.backgroundColor.green;
            imageData.data[i + 2] = this.backgroundColor.blue;
            imageData.data[i + 3] = this._backgroundColor.alpha;
        }
        this.clearDepthBuffer();
    }

    private rasterize(trisToRaster: Tri[], material: Material) {
        this.clearImageData(this._imageData);
        for (const tri of trisToRaster) {
            this._rasterizer.rasterizeTriangle(this.canvas, tri, material, this._enableTextureMapping);
        }
        this.swapBuffer();
    }

    private rasterizeViaCanvasApi(trisToRaster: Tri[], material: Material) {
        this.clearScreen();
        for (const tri of trisToRaster) {
            this._rasterizer.rasterizeTriangleViaCanvasApi(this.canvas, tri, material);
        }
    }

    private clearScreen(): void {
        this.clearImageData(this._imageData);
        this.swapBuffer();
    }

    private swapBuffer(): void {
        this._canvasCtx!.putImageData(this._imageData, 0, 0);
    }

    private clearDepthBuffer(): void {
        this._depthBuffer.fill(0);
    }

    public get canvas(): HTMLCanvasElement | OffscreenCanvas {
        return this._canvas;
    }
    public set canvas(value: HTMLCanvasElement | OffscreenCanvas) {
        this._canvas = value;
        this._screenWidth = value.width;
        this._screenHeight = value.height;
        this._canvasCtx = value.getContext('2d');
        this._imageData = this._canvasCtx!.createImageData(this.canvas.width, this.canvas.height);
        this._depthBuffer = new Array(this._canvas.width * this._canvas.height).fill(0);
        this._rasterizer = new TriangleRasterizer(this._imageData, this._depthBuffer);
    }
    public get backgroundColor(): RGBA {
        return this._backgroundColor;
    }
    public set backgroundColor(value: RGBA) {
        this._backgroundColor = value;
    }
    public get enableNonCameraFacingTrisRendering(): boolean {
        return this._enableNonCameraFacingTrisRendering;
    }
    public set enableNonCameraFacingTrisRendering(value: boolean) {
        this._enableNonCameraFacingTrisRendering = value;
    }
    public get enablePerspectiveCorrectTextureMapping(): boolean {
        return this._enablePerspectiveCorrectTextureMapping;
    }
    public set enablePerspectiveCorrectTextureMapping(value: boolean) {
        this._enablePerspectiveCorrectTextureMapping = value;
    }
    public get enableRasterizationViaCanvasApi(): boolean {
        return this._enableRasterizationViaCanvasApi;
    }
    public set enableRasterizationViaCanvasApi(value: boolean) {
        this._enableRasterizationViaCanvasApi = value;
    }
    public get enableTextureMapping(): boolean {
        return this._enableTextureMapping;
    }
    public set enableTextureMapping(value: boolean) {
        this._enableTextureMapping = value;
    }
}