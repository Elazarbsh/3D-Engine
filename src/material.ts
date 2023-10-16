import { RGBA } from "./rgba.js";
import { Texture } from "./texture.js";

export class Material {
    private _texture: Texture | null;
    private _color: RGBA;
    private _wireframe: boolean;
    private _wireframeWidth: number;
    private _wireframeColor: RGBA;

    constructor(
        color: RGBA = new RGBA(),
        wireframe: boolean = false,
        wireframeWidth: number = 2,
        texture: Texture | null = null,
        wireframeColor: RGBA = new RGBA) {
        this._color = color;
        this._wireframe = wireframe;
        this._wireframeWidth = wireframeWidth;
        this._texture = texture;
        this._wireframeColor = wireframeColor;
    }

    public get texture(): Texture | null {
        return this._texture;
    }
    public set texture(value: Texture | null) {
        this._texture = value;
    }
    public get color(): RGBA {
        return this._color;
    }
    public set color(value: RGBA) {
        this._color = value;
    }
    public get wireframe(): boolean {
        return this._wireframe;
    }
    public set wireframe(value: boolean) {
        this._wireframe = value;
    }
    public get wireframeWidth(): number {
        return this._wireframeWidth;
    }
    public set wireframeWidth(value: number) {
        this._wireframeWidth = value;
    }
    public get wireframeColor(): RGBA {
        return this._wireframeColor;
    }
    public set wireframeColor(value: RGBA) {
        this._wireframeColor = value;
    }
}