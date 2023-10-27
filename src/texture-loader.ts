import { Texture } from "./texture.js";

export class TextureLoader{

    public static async loadTextureFromImage(imgPath : string){
        const textureData = await this.load(imgPath);
        return new Texture(textureData);
    }

    private static async load(imgPath: string): Promise<ImageData> {
        const image = await this.loadImage(imgPath);
        const canvas = this.createCanvas(image.width, image.height);
        const ctx = this.getContext(canvas);

        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        return imageData;
    }

    private static async loadImage(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = url;
        });
    }

    private static getContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Unable to get 2D context");
        return ctx;
    }

    private static createCanvas(width: number, height: number): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }
    
}