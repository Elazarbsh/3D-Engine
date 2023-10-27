import { RGBA } from "./rgba.js";

export class Texture{

    private _textureData: ImageData;

    constructor(textureData : ImageData){
        this._textureData = textureData;
    }

    public sampleColorAtNormalizedCoordinates(u: number, v: number): RGBA{
        const x = Math.floor(u * (this.textureData.width - 1));
        const y = Math.floor((1 - v) * (this.textureData.height - 1));
        return this.sampleColorAt(x, y);
    }

    public sampleColorAt(x: number, y: number): RGBA {
        const index = (y * this.textureData.width + x) * 4;
        return new RGBA(
            this.textureData.data[index],
            this.textureData.data[index + 1],
            this.textureData.data[index + 2],
            this.textureData.data[index + 3]
            );
    }

    public get textureData(): ImageData {
        return this._textureData;
    }
    public set textureData(value: ImageData) {
        this._textureData = value;
    }
}