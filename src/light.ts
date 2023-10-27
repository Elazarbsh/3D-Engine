import { Tri } from "./tri.js";
import { Vec3 } from "./vec3.js";

export class Light{
    private _direction: Vec3;
    private _isEnabled: boolean;


    constructor(direction : Vec3, isEnabled : boolean = true){
        this._direction = direction;
        this._isEnabled = isEnabled;
    }

    public calculateLightIntensity(tri : Tri) : number{
        const normal = tri.getSurfaceNormal();
        const oppositeLightDirection = Vec3.getOppositeVector(this.direction);
        const dotProduct = Vec3.dotProduct(normal, Vec3.normalize(oppositeLightDirection));
        const intensity = Math.max(dotProduct, 0);
        return intensity;
    }
    public get isEnabled(): boolean {
        return this._isEnabled;
    }
    public set isEnabled(value: boolean) {
        this._isEnabled = value;
    }
    public get direction(): Vec3 {
        return this._direction;
    }
    public set direction(value: Vec3) {
        this._direction = value;
    }

} 