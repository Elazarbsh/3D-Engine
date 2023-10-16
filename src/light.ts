import { Tri } from "./tri.js";
import { Vec3 } from "./vec3.js";

export class Light{
    private _direction: Vec3;
    private _on: boolean;


    constructor(direction : Vec3, on : boolean = true){
        this._direction = direction;
        this._on = on;
    }

    public calculateLightIntensity(tri : Tri) : number{
        const normal = tri.getSurfaceNormal();
        const oppositeLightDirection = Vec3.getOppositeVector(this.direction);
        const dotProduct = Vec3.dotProduct(normal, Vec3.normalize(oppositeLightDirection));
        const intensity = Math.max(dotProduct, 0);
        return intensity;
    }
    public get on(): boolean {
        return this._on;
    }
    public set on(value: boolean) {
        this._on = value;
    }
    public get direction(): Vec3 {
        return this._direction;
    }
    public set direction(value: Vec3) {
        this._direction = value;
    }

} 