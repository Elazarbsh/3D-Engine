import { Vec3 } from "./vec3.js";

export class Plane{

    private _normal: Vec3;
    private _point: Vec3;

    constructor(normal : Vec3, point : Vec3){
        this._normal = normal;
        this._point = point;
    }
    

    static linePlaneIntersect(plane : Plane, lineStart: Vec3, lineEnd: Vec3): Vec3 {
        const planeNormal = Vec3.normalize(plane.normal);
        const planeDistance = -Vec3.dotProduct(planeNormal, plane.point);
        const startDistance = Vec3.dotProduct(lineStart, planeNormal);
        const endDistance = Vec3.dotProduct(lineEnd, planeNormal);
        const t = (-planeDistance - startDistance) / (endDistance - startDistance);
        const lineStartToEnd = Vec3.sub(lineEnd, lineStart);
        const lineToIntersect = Vec3.mul(lineStartToEnd, t);
        return Vec3.add(lineStart, lineToIntersect);
    }

    static distFromPlane(plane: Plane, vec: Vec3): number {
        const n = Vec3.normalize(vec);
        return (plane.normal.x * vec.x + plane.normal.y * vec.y + plane.normal.z * vec.z - Vec3.dotProduct(plane.normal, plane.point));
    }

    public get normal(): Vec3 {
        return this._normal;
    }
    public set normal(value: Vec3) {
        this._normal = value;
    }
    public get point(): Vec3 {
        return this._point;
    }
    public set point(value: Vec3) {
        this._point = value;
    }
}