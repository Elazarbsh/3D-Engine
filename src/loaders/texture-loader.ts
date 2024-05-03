import { Texture } from "../texture.js";

export class TextureLoader{

    public static async loadTextureFromImagePath(imgPath : string){
        const textureData = await this.load(imgPath);
        return new Texture(textureData);
    }

    public static async loadTextureFromImageFile(file: File): Promise<Texture> {
        const textureData = await this.loadFromFileObject(file);
        return new Texture(textureData);
    }
    
    private static async loadFromFileObject(file: File): Promise<ImageData> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target && event.target.result) {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = this.createCanvas(img.width, img.height);
                        const ctx = this.getContext(canvas);
                        ctx.drawImage(img, 0, 0);
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        resolve(imageData);
                    };
                    img.src = event.target.result as string;
                } else {
                    reject(new Error("Failed to load image file."));
                }
            };
            reader.onerror = (event) => {
                reject(new Error("Error reading the image file."));
            };
            reader.readAsDataURL(file);
        });
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