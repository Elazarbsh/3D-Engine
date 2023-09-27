
export class Vec2{
    private _x: number;
    private _y: number;
    private _w: number;

    constructor(x: number, y: number, w: number = 1) {
        this._x = x;
        this._y = y;
        this._w = w;
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
    public get w(): number {
        return this._w;
    }
    public set w(value: number) {
        this._w = value;
    }
}