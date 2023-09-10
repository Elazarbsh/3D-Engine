import { RenderMode } from "../enums/render-mode.js";
import { Camera } from "./camera.js";
import { Mat4x4 } from "./mat4x4.js";
import { Model } from "./mesh.js";
import { Plane } from "./plane.js";
import { RGB } from "./rgb.js";
import { Scene } from "./scene.js";
import { Tri } from "./tri.js";
import { TriangleClipper } from "./triangle-clipper.js";
import { Vec3 } from "./vec3.js";

export class Renderer {

    private _screenWidth: number;
    private _screenHeight: number;
    private _renderMode: RenderMode;
    private _canvas: HTMLCanvasElement;
    private _wireFramesColor: RGB;

    constructor(screenWidth: number, screenHeight: number, renderMode: RenderMode = RenderMode.FILL, canvas: HTMLCanvasElement) {
        this._screenWidth = screenWidth;
        this._screenHeight = screenHeight;
        this._renderMode = renderMode;
        this._canvas = canvas;
        this._wireFramesColor = new RGB(255, 255, 255);
    }

    public renderMesh(mesh: Model, scene: Scene, cam: Camera, mode: RenderMode) {

        const translationMatrix: Mat4x4 = Mat4x4.getTranslationMatrix(mesh.translation);
        const cameraMatrix: Mat4x4 = cam.cameraMatrix();
        const projectionMatrix: Mat4x4 = Mat4x4.getProjectionMatrix(90, 1, 0.1, 100);
        const rotationMatrixY: Mat4x4 = Mat4x4.getYaxisRotationMatrix(mesh.rotation.y);
        const rotationMatrixX: Mat4x4 = Mat4x4.getXaxisRotationMatrix(mesh.rotation.x);
        const rotationMatrixZ: Mat4x4 = Mat4x4.getZaxisRotationMatrix(mesh.rotation.z);

        let trisToRaster: Tri[] = [];

        for (const tri of mesh.tris) {
            const roationYX = Mat4x4.multiply(rotationMatrixX, rotationMatrixY);
            const rotationYXZ = Mat4x4.multiply(rotationMatrixZ, roationYX);
            const rotatedTri = Tri.matrixMul(tri, rotationYXZ);
            const translatedTri = Tri.matrixMul(rotatedTri, translationMatrix)
            const camViewTri: Tri = Tri.matrixMul(translatedTri, cameraMatrix);

            if (cam.isVisibleTri(camViewTri)) {
                const clipPlane: Plane = new Plane(new Vec3(0, 0, 1), new Vec3(0, 0, 10));
                const clipedTris: Tri[] = TriangleClipper.clipAgainstPlane(clipPlane, camViewTri);

                for (const tri in clipedTris) {
                    // calcualte light intensity
                    const lightIntensity = mode == RenderMode.WIREFRAMES ? 0 : scene.light.calculateLightIntensity(rotatedTri);

                    // to camera space
                    const projectedTri: Tri = Tri.matrixMul(camViewTri, projectionMatrix);

                    // depth normalization
                    const normalizedDepthTri = Tri.normalizeDepth(projectedTri);

                    // to screen space
                    const screenTri = Tri.toScreenSpace(normalizedDepthTri, this.screenWidth, this.screenHeight);
                    screenTri.surfaceLightIntensity = lightIntensity;
                    trisToRaster.push(screenTri);
                }
            }
        }

        trisToRaster.sort(this.sortTriangles);
        trisToRaster = this.clip(trisToRaster);
        this.draw(trisToRaster, mesh.color);
    }

    private sortTriangles(t1: Tri, t2: Tri): number {
        const z1 = (t1.v1.z + t1.v2.z + t1.v3.z) / 3.0;
        const z2 = (t2.v1.z + t2.v2.z + t2.v3.z) / 3.0;
        return z2 - z1;
    }

    public render(scene: Scene, camera: Camera) {
        for (const model of scene.models) {
            this.renderMesh(model, scene, camera, this.renderMode);
        }
    }

    private clip(trisToRaster: Tri[]) : Tri[]{
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

    private draw(trisToRaster: Tri[], rgb: RGB) {
        let triCount = 0;
        for (const tri of trisToRaster) {
            this.drawTriangle(tri, rgb);
            triCount++;
        }
        console.log(`drawn triangles count : ${triCount}`);
    }

    private drawTriangle(tri: Tri, rgb: RGB) {
        const ctx = this.canvas.getContext("2d");

        if (ctx === null)
            throw new Error("an error occured while drawing");

        if (this.renderMode == RenderMode.WIREFRAMES || this.renderMode == RenderMode.WIREFRAMESFILL) {
            const strokeRed = this.wireFramesColor.red;
            const strokeGreen = this.wireFramesColor.green;
            const strokeBlue = this.wireFramesColor.blue;
            ctx.strokeStyle = `rgb(${strokeRed}, ${strokeGreen}, ${strokeBlue})`;
            ctx.lineWidth = 2;
        }

        if (this.renderMode == RenderMode.FILL || this.renderMode == RenderMode.WIREFRAMESFILL) {
            const fillRed = rgb.red * tri.surfaceLightIntensity;
            const fillGreen = rgb.green * tri.surfaceLightIntensity;
            const fillBlue = rgb.blue * tri.surfaceLightIntensity;
            ctx.fillStyle = `rgb(${fillRed}, ${fillGreen}, ${fillBlue})`;
        }

        ctx.beginPath();
        ctx.moveTo(tri.v1.x, tri.v1.y);
        ctx.lineTo(tri.v2.x, tri.v2.y);
        ctx.lineTo(tri.v3.x, tri.v3.y);
        ctx.closePath();

        if ((this.renderMode == RenderMode.WIREFRAMES || this.renderMode == RenderMode.WIREFRAMESFILL)) {
            ctx.stroke();
        }

        if (this.renderMode == RenderMode.FILL || this.renderMode == RenderMode.WIREFRAMESFILL) {
            ctx.fill();
        }
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
    public get renderMode(): RenderMode {
        return this._renderMode;
    }
    public set renderMode(value: RenderMode) {
        this._renderMode = value;
    }
    public get wireFramesColor(): RGB {
        return this._wireFramesColor;
    }
    public set wireFramesColor(value: RGB) {
        this._wireFramesColor = value;
    }
}