
export class RGBA{
    private _red;
    private _green;
    private _blue;
    private _alpha;

    constructor(red : number = 255, green : number = 255, blue : number = 255, alpha : number = 255)
    {
        this._red = red;
        this._green = green;
        this._blue = blue;
        this._alpha = alpha;
    }

    public get red() {
        return this._red;
    }
    public set red(value) {
        this._red = value;
    }
    public get green() {
        return this._green;
    }
    public set green(value) {
        this._green = value;
    }
    public get blue() {
        return this._blue;
    }
    public set blue(value) {
        this._blue = value;
    }
    public get alpha() {
        return this._alpha;
    }
    public set alpha(value) {
        this._alpha = value;
    }
    
}