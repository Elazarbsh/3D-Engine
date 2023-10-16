import { RGBA } from "./rgba.js";

export class Texture{

    private _textureData: ImageData;

    constructor(textureData : ImageData){
        this._textureData = textureData;
    }

    public static async loadTextureFromImage(imgPath : string){
        const textureData = await Texture.load(imgPath);
        return new Texture(textureData);
    }

    public sampleColorAtUV(u: number, v: number): RGBA{
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

    public static async load(imgPath: string): Promise<ImageData> {
        // Assuming you have an Image element called 'image' that has been loaded
        const image = await this.loadImage(imgPath);
    
        // Create a canvas element to use for image processing
        
        // const canvas = document.createElement('canvas');

        const canvas : HTMLCanvasElement = document.getElementById('testCanvas') as HTMLCanvasElement;
        // if(canvas == null)
        //     throw new Error("canvas is null");
        const ctx = canvas.getContext('2d');
    
        // Set the canvas dimensions to match the image dimensions
        canvas.width = image.width;
        canvas.height = image.height;
    
        // Draw the image onto the canvas
        ctx!.drawImage(image, 0, 0);
    
        // Get the image data
        const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
    
        return imageData;
    }

    private static async loadImage(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = url;
        });
    }

    public get textureData(): ImageData {
        return this._textureData;
    }
    public set textureData(value: ImageData) {
        this._textureData = value;
    }
}