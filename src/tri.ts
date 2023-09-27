import { Mat4x4 } from "./mat4x4.js";
import { Vec2 } from "./vec2.js";
import { Vec3 } from "./vec3.js";

export class Tri{
    private _v1: Vec3;
    private _v2: Vec3;
    private _v3: Vec3;

    private _uv1: Vec2;
    private _uv2: Vec2;
    private _uv3: Vec2; 
    
    private _surfaceLightIntensity: number = 255;



    constructor(v1: Vec3, v2: Vec3, v3: Vec3, uv1?: Vec2, uv2?: Vec2, uv3?: Vec2){
        this._v1 = v1;
        this._v2 = v2;
        this._v3 = v3;
        this._uv1 = uv1 ?? new Vec2(0,0);
        this._uv2 = uv2 ?? new Vec2(0,0);
        this._uv3 = uv3 ?? new Vec2(0,0);
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

    public static isPointInTriangle(p: Vec3, v1: Vec3, v2: Vec3, v3: Vec3): boolean {
        const b1 = ((p.y - v2.y) * (v1.x - v2.x) - (p.x - v2.x) * (v1.y - v2.y)) < 0.0;
        const b2 = ((p.y - v3.y) * (v2.x - v3.x) - (p.x - v3.x) * (v2.y - v3.y)) < 0.0;
        const b3 = ((p.y - v1.y) * (v3.x - v1.x) - (p.x - v1.x) * (v3.y - v1.y)) < 0.0;
    
        return ((b1 === b2) && (b2 === b3));
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

    public get uv1(): Vec2 {
        return this._uv1;
    }
    public set uv1(value: Vec2) {
        this._uv1 = value;
    }
    
    public get uv2(): Vec2 {
        return this._uv2;
    }
    public set uv2(value: Vec2) {
        this._uv2 = value;
    }

    public get uv3(): Vec2 {
        return this._uv3;
    }
    public set uv3(value: Vec2) {
        this._uv3 = value;
    }
}