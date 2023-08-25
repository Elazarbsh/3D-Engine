import { Mat4x4 } from "./mat4x4.js";
import { Tri } from "./tri.js";
import { Vec3 } from "./vec3.js";

export class Camera {
    private _position: Vec3;
    private _up: Vec3;
    private _forward: Vec3;
    private _right: Vec3;
    private _anglePitch: number = 0;
    private _angleYaw: number = 0;

    constructor(
        position: Vec3 = new Vec3(0, 0, 0),
        up: Vec3 = new Vec3(0, 1, 0),
        forward: Vec3 = new Vec3(0, 0, 1),
        right: Vec3 = new Vec3(1, 0, 0)) {
        this._position = position;
        this._up = up;
        this._forward = forward;
        this._right = right;
    }

    public yaw(angle: number) {
        this.angleYaw += angle;
    }

    public pitch(angle: number) {
        this.anglePitch += angle;
    }

    private axiiIdentity() {
        this.forward = new Vec3(0, 0, 1);
        this.up = new Vec3(0, 1, 0);
        this.right = new Vec3(1, 0, 0);
    }

    private updateAxii() {
        this.axiiIdentity();
        const rotationMatX = Mat4x4.getXaxisRotationMatrix(this.anglePitch);
        const rotationMatY = Mat4x4.getYaxisRotationMatrix(this.angleYaw);
        const rotate = Mat4x4.multiply(rotationMatX, rotationMatY);
        this.forward = Vec3.matrixMul(this.forward, rotate);
        this.right = Vec3.matrixMul(this.right, rotate);
        this.up = Vec3.matrixMul(this.up, rotate);
    }

    public cameraMatrix(): Mat4x4 {
        this.updateAxii();
        const translationMat: Mat4x4 = Mat4x4.getTranslationMatrix(new Vec3(-this.position.x, -this.position.y, -this.position.z));
        const pointAtMatrix: Mat4x4 = Mat4x4.getPointAtMatrix(this.right, this.up, this.forward);
        return Mat4x4.multiply(translationMat, pointAtMatrix);
    }

    public isVisibleTri(tri: Tri): boolean {
        const surfaceNormal: Vec3 = tri.getSurfaceNormal();
        const camRay: Vec3 = Vec3.sub(tri.v1, this.forward);
        const isVisibile = Vec3.dotProduct(surfaceNormal, camRay) < 0;
        return isVisibile;
    }

    public get up(): Vec3 {
        return this._up;
    }
    public set up(value: Vec3) {
        this._up = value;
    }
    public get forward(): Vec3 {
        return this._forward;
    }
    public set forward(value: Vec3) {
        this._forward = value;
    }
    public get right(): Vec3 {
        return this._right;
    }
    public set right(value: Vec3) {
        this._right = value;
    }
    public get position(): Vec3 {
        return this._position;
    }
    public set position(value: Vec3) {
        this._position = value;
    }
    public get anglePitch(): number {
        return this._anglePitch;
    }
    public set anglePitch(value: number) {
        this._anglePitch = value;
    }
    public get angleYaw(): number {
        return this._angleYaw;
    }
    public set angleYaw(value: number) {
        this._angleYaw = value;
    }


}