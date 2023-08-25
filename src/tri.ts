import { Mat4x4 } from "./mat4x4.js";
import { Vec3 } from "./vec3.js";

export class Tri{
    private _v1: Vec3;
    private _v2: Vec3;
    private _v3: Vec3;
    private _surfaceLightIntensity: number = 255;

    constructor(v1: Vec3, v2: Vec3, v3: Vec3){
        this._v1 = v1; 
        this._v2 = v2;
        this._v3 = v3;
    }

    public getSurfaceNormal() {
        let line1 = Vec3.sub(this.v2, this.v1);
        let line2 = Vec3.sub(this.v3, this.v1);
        let normal = Vec3.crossProduct(line1, line2);
        return Vec3.normalize(normal);
    }

    public static matrixMul(tri : Tri, mat : Mat4x4){
        const v1 = Vec3.matrixMul(tri.v1, mat);
        const v2 = Vec3.matrixMul(tri.v2, mat);
        const v3 = Vec3.matrixMul(tri.v3, mat);
        return new Tri(v1, v2, v3);
    }

    public static normalizeDepth(tri : Tri){
        const v1 : Vec3 = Vec3.div(tri.v1, tri.v1.w);
        const v2 : Vec3 = Vec3.div(tri.v2, tri.v2.w);
        const v3 : Vec3 = Vec3.div(tri.v3, tri.v3.w);
        return new Tri(v1, v2, v3);
    }

    public static toScreenSpace(tri : Tri, screenWidth : number, screenHeight : number){
        const v1 = new Vec3((1 + tri.v1.x) * screenWidth * 0.5, (-1 + tri.v1.y) * (-screenHeight * 0.5), tri.v1.z);
        const v2 = new Vec3((1 + tri.v2.x) * screenWidth * 0.5, (-1 + tri.v2.y) * (-screenHeight * 0.5), tri.v2.z);
        const v3 = new Vec3((1 + tri.v3.x) * screenWidth * 0.5, (-1 + tri.v3.y) * (-screenHeight * 0.5), tri.v3.z); 
        return new Tri(v1, v2, v3);
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
}