import { RenderMode } from "../enums/render-mode.js";
import { Camera } from "./camera.js";
import { Mat4x4 } from "./mat4x4.js";
import { Model } from "./mesh.js";
import { Plane } from "./plane.js";
import { RGB } from "./rgb.js";
import { Scene } from "./scene.js";
import { Tri } from "./tri.js";
import { TriangleClipper } from "./triangle-clipper.js";
import { TriangleRasterizer } from "./triangle-rasterizer.js";
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

            const originalUV1 = tri.uv1;
            const originalUV2 = tri.uv2;
            const originalUV3 = tri.uv3;


            if (cam.isVisibleTri(camViewTri)) {
                const clipPlane: Plane = new Plane(new Vec3(0, 0, 0.001), new Vec3(0, 0, 0.001));

                camViewTri.uv1 = originalUV1;
                camViewTri.uv2 = originalUV2;
                camViewTri.uv3 = originalUV3;

                const clipedTris: Tri[] = TriangleClipper.clipAgainstPlane(clipPlane, camViewTri);

                for (const tri of clipedTris) {

                    const clippedUV1 = tri.uv1;
                    const clippedUV2 = tri.uv2;
                    const clippedUV3 = tri.uv3;
                    // calcualte light intensity
                    const lightIntensity = mode == RenderMode.WIREFRAMES ? 0 : scene.light.calculateLightIntensity(rotatedTri);

                    // to camera space
                    const projectedTri: Tri = Tri.matrixMul(tri, projectionMatrix);                    

                    // depth normalization
                    const normalizedDepthTri = Tri.normalizeDepth(projectedTri);

                    // to screen space
                    const screenTri = Tri.toScreenSpace(normalizedDepthTri, this.screenWidth, this.screenHeight);

                    // console.log(`copying uv coordinates: (${originalUV1.x},${originalUV1.y}),  (${originalUV2.x},${originalUV2.y}) , (${originalUV3.x}, ${originalUV3.y} )`);

                    screenTri.uv1 = clippedUV1;
                    screenTri.uv2 = clippedUV2;
                    screenTri.uv3 = clippedUV3;

                    //console.log(`the Xs are : ${screenTri.uv1.x}, ${screenTri.uv2.x}, ${screenTri.uv3.x}`);
                    //console.log(`the Ys are : ${screenTri.uv1.y}, ${screenTri.uv2.y}, ${screenTri.uv3.y}`);

                    // prepare texels projection
                    screenTri.uv1.x = screenTri.uv1.x / projectedTri.v1.w;
                    screenTri.uv2.x = screenTri.uv2.x / projectedTri.v2.w;
                    screenTri.uv3.x = screenTri.uv3.x / projectedTri.v3.w;

                    screenTri.uv1.y = screenTri.uv1.y / projectedTri.v1.w;
                    screenTri.uv2.y = screenTri.uv2.y / projectedTri.v2.w;
                    screenTri.uv3.y = screenTri.uv3.y / projectedTri.v3.w;

                    screenTri.uv1.w = 1 / projectedTri.v1.w;
                    screenTri.uv2.w = 1 / projectedTri.v2.w;
                    screenTri.uv3.w = 1 / projectedTri.v3.w;

                    screenTri.surfaceLightIntensity = lightIntensity;


                    // console.log(`the Ws are : ${projectedTri.v1.w}, ${projectedTri.v2.w}, ${projectedTri.v3.w}`);
                    // console.log(`the divided Ws are : ${screenTri.uv1.w}, ${screenTri.uv2.w}, ${screenTri.uv3.w}`);
                    // console.log(`the Xs are : ${screenTri.uv1.x}, ${screenTri.uv2.x}, ${screenTri.uv3.x}`);
                    // console.log(`the Ys are : ${screenTri.uv1.y}, ${screenTri.uv2.y}, ${screenTri.uv3.y}`);



                    trisToRaster.push(screenTri);
                }
            }
        }

        trisToRaster.sort(this.sortTriangles);
        trisToRaster = this.clip(trisToRaster);
        // this.draw(trisToRaster, mesh.color);
        if(mesh.texture == null){
            this.draw(trisToRaster, mesh.color);
        }else{
            this.texturize(trisToRaster, mesh.texture)
        }
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
        // console.log(`drawn triangles count : ${triCount}`);
    }

    private rasterize(trisToRaster: Tri[], rgb: RGB){
        const rasterizer = new TriangleRasterizer(this.canvas);
        let triCount = 0;
        for (const tri of trisToRaster) {
            // rasterizer.rasterizeTriangle(tri);
            rasterizer.rasterizeTriangle2(tri.v1.x, tri.v1.y, tri.v2.x, tri.v2.y, tri.v3.x, tri.v3.y,);
            triCount++;
        }
        // console.log(`drawn triangles count : ${triCount}`);
    }

    private texturize(trisToRaster: Tri[], texture: ImageData){
        const rasterizer = new TriangleRasterizer(this.canvas);
        let triCount = 0;
        //console.log("TRI TO TEXTURE: " + trisToRaster.length)
        for (const tri of trisToRaster) {
            // console.log("ROUND: " + triCount);
            // console.log(`calling texturize with uv w values: (${tri.uv1.w}, ${tri.uv2.w}, ${tri.uv3.w}`);
            // console.log(`calling texturize with uv x values: (${tri.uv1.x}, ${tri.uv2.x}, ${tri.uv3.x}`);
            // console.log(`calling texturize with uv y values: (${tri.uv1.y}, ${tri.uv2.y}, ${tri.uv3.y}`);

            // rasterizer.rasterizeTriangle(tri);

            rasterizer.textureTriangle(
                tri.v1.x, tri.v1.y, tri.uv1.x, tri.uv1.y, tri.uv1.w,
                tri.v2.x, tri.v2.y, tri.uv2.x, tri.uv2.y, tri.uv2.w,
                tri.v3.x, tri.v3.y, tri.uv3.x, tri.uv3.y, tri.uv3.w,
                texture
                );
            triCount++;
        }
        // console.log(`drawn triangles count : ${triCount}`);
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