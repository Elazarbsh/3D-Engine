import { Mat4x4 } from "./mat4x4.js";
import { Texel } from "./texel.js";
import { Vec3 } from "./vec3.js";

export class Tri {
    private _v1: Vec3;
    private _v2: Vec3;
    private _v3: Vec3;

    private _texel1: Texel;
    private _texel2: Texel;
    private _texel3: Texel;

    private _surfaceLightIntensity: number = 255;

    constructor(v1: Vec3, v2: Vec3, v3: Vec3, texel1?: Texel, texel2?: Texel, texel3?: Texel) {
        this._v1 = v1;
        this._v2 = v2;
        this._v3 = v3;
        this._texel1 = texel1 ?? new Texel(0, 0);
        this._texel2 = texel2 ?? new Texel(0, 0);
        this._texel3 = texel3 ?? new Texel(0, 0);
    }

    public getSurfaceNormal(): Vec3 {
        let line1 = Vec3.sub(this.v2, this.v1);
        let line2 = Vec3.sub(this.v3, this.v1);
        let normal = Vec3.crossProduct(line1, line2);
        return Vec3.normalize(normal);
    }

    public static matrixMul(tri: Tri, mat: Mat4x4) : Tri{
        const v1 = Vec3.matrixMul(tri.v1, mat);
        const v2 = Vec3.matrixMul(tri.v2, mat);
        const v3 = Vec3.matrixMul(tri.v3, mat);
        const transformedTri = new Tri(v1, v2, v3, tri.texel1.copy(), tri.texel2.copy(), tri.texel3.copy());
        transformedTri.surfaceLightIntensity = tri.surfaceLightIntensity;
        return transformedTri;        
    }

    public static normalizeDepth(tri: Tri) : Tri{
        const v1: Vec3 = Vec3.div(tri.v1, tri.v1.w);
        const v2: Vec3 = Vec3.div(tri.v2, tri.v2.w);
        const v3: Vec3 = Vec3.div(tri.v3, tri.v3.w);
        const normalizedTri = new Tri(v1, v2, v3, tri.texel1.copy(), tri.texel2.copy(), tri.texel3.copy());
        normalizedTri.surfaceLightIntensity = tri.surfaceLightIntensity;
        return normalizedTri;
    }

    public static toScreenSpace(tri: Tri, screenWidth: number, screenHeight: number) : Tri {
        const v1 = new Vec3((1 + tri.v1.x) * screenWidth * 0.5, (-1 + tri.v1.y) * (-screenHeight * 0.5), tri.v1.z);
        const v2 = new Vec3((1 + tri.v2.x) * screenWidth * 0.5, (-1 + tri.v2.y) * (-screenHeight * 0.5), tri.v2.z);
        const v3 = new Vec3((1 + tri.v3.x) * screenWidth * 0.5, (-1 + tri.v3.y) * (-screenHeight * 0.5), tri.v3.z);
        const screenTri = new Tri(v1, v2, v3, tri.texel1.copy(), tri.texel2.copy(), tri.texel3.copy());
        screenTri.surfaceLightIntensity = tri.surfaceLightIntensity;
        return screenTri;    
    }

    public static transform(tri : Tri, rotationMatrix : Mat4x4, translationMatrix : Mat4x4, cameraMatrix : Mat4x4){
        return Tri.matrixMul(tri, Mat4x4.multiply(rotationMatrix, Mat4x4.multiply(translationMatrix, cameraMatrix)));
    }

    public copy() {
        const newTriv1 = this.v1.copy();
        const newTriv2 = this.v2.copy();
        const newTriv3 = this.v3.copy();
        const texel1 = this.texel1.copy();
        const texel2 = this.texel2.copy();
        const texel3 = this.texel3.copy();
        const triCopy = new Tri(newTriv1, newTriv2, newTriv3, texel1, texel2, texel3);
        triCopy.surfaceLightIntensity = this.surfaceLightIntensity;
        return triCopy;
    }

    public get surfaceLightIntensity(): number {
        return this._surfaceLightIntensity;
    }
    public set surfaceLightIntensity(value: number) {
        this._surfaceLightIntensity = value;
    }
    public get v1(): Vec3 {
        return this._v1;
    }
    public set v1(value: Vec3) {
        this._v1 = value;
    }
    public get v2(): Vec3 {
        return this._v2;
    }
    public set v2(value: Vec3) {
        this._v2 = value;
    }
    public get v3(): Vec3 {
        return this._v3;
    }
    public set v3(value: Vec3) {
        this._v3 = value;
    }
    public get texel1(): Texel {
        return this._texel1;
    }
    public set texel1(value: Texel) {
        this._texel1 = value;
    }
    public get texel2(): Texel {
        return this._texel2;
    }
    public set texel2(value: Texel) {
        this._texel2 = value;
    }
    public get texel3(): Texel {
        return this._texel3;
    }
    public set texel3(value: Texel) {
        this._texel3 = value;
    }
}