
export class Texel{
    private _u: number;
    private _v: number;
    private _w: number;

    constructor(u: number = 0 , v: number = 0, w: number = 1) {
        this._u = u;
        this._v = v;
        this._w = w;
    }

    public copy() : Texel {
        return new Texel(this.u, this.v, this.w);
    }

    public static div(texel: Texel, k: number): Texel {
        return new Texel(texel.u / k, texel.v / k, texel.w / k);
    }

    public get u(): number {
        return this._u;
    }
    public set u(value: number) {
        this._u = value;
    }
    public get v(): number {
        return this._v;
    }
    public set v(value: number) {
        this._v = value;
    }
    public get w(): number {
        return this._w;
    }
    public set w(value: number) {
        this._w = value;
    }
}