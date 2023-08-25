import { Mat4x4 } from "./mat4x4.js";

export class Vec3 {
    private _x: number;
    private _y: number;
    private _z: number;
    private _w: number;

    constructor(x: number, y: number, z: number, w: number = 1) {
        this._x = x;
        this._y = y;
        this._z = z;
        this._w = w;
    }

    public static fromArray(arr: number[]): Vec3 {
        if (arr.length != 3)
            throw new Error(`Cannot create vec3 for array of length ${arr.length}`);

        return new Vec3(arr[0], arr[1], arr[2]);
    }

    public static matrixMul(vec: Vec3, mat: Mat4x4): Vec3 {
        const x = vec.x * mat.get(0, 0) + vec.y * mat.get(1, 0) + vec.z * mat.get(2, 0) + vec.w * mat.get(3, 0);
        const y = vec.x * mat.get(0, 1) + vec.y * mat.get(1, 1) + vec.z * mat.get(2, 1) + vec.w * mat.get(3, 1);
        const z = vec.x * mat.get(0, 2) + vec.y * mat.get(1, 2) + vec.z * mat.get(2, 2) + vec.w * mat.get(3, 2);
        const w = vec.x * mat.get(0, 3) + vec.y * mat.get(1, 3) + vec.z * mat.get(2, 3) + vec.w * mat.get(3, 3);
        return new Vec3(x, y, z, w);
    }

    public static add(vec1: Vec3, vec2: Vec3): Vec3 {
        return new Vec3(vec1.x + vec2.x, vec1.y + vec2.y, vec1.z + vec2.z);
    }

    public static sub(vec1: Vec3, vec2: Vec3): Vec3 {
        return new Vec3(vec1.x - vec2.x, vec1.y - vec2.y, vec1.z - vec2.z);
    }

    public static mul(vec: Vec3, k: number): Vec3 {
        return new Vec3(vec.x * k, vec.y * k, vec.z * k);
    }

    public static div(vec: Vec3, k: number): Vec3 {
        return new Vec3(vec.x / k, vec.y / k, vec.z / k);
    }

    public static dotProduct(v1: Vec3, v2: Vec3): number {
        return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    }

    public static getLength(vec: Vec3): number {
        return Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
    }

    public static normalize(vec: Vec3): Vec3 {
        const length = Vec3.getLength(vec);
        return new Vec3(vec.x / length, vec.y / length, vec.z / length);
    }

    public static crossProduct(vec1: Vec3, vec2: Vec3): Vec3 {
        let x = vec1.y * vec2.z - vec1.z * vec2.y;
        let y = vec1.z * vec2.x - vec1.x * vec2.z;
        let z = vec1.x * vec2.y - vec1.y * vec2.x;
        return new Vec3(x, y, z);
    }

    public static getOppositeVector(vec: Vec3): Vec3 {
        return new Vec3(-vec.x, -vec.y, -vec.z);
    }

    public get x(): number {
        return this._x;
    }
    public set x(value: number) {
        this._x = value;
    }
    public get y(): number {
        return this._y;
    }
    public set y(value: number) {
        this._y = value;
    }
    public get z(): number {
        return this._z;
    }
    public set z(value: number) {
        this._z = value;
    }
    public get w(): number {
        return this._w;
    }
    public set w(value: number) {
        this._w = value;
    }
}