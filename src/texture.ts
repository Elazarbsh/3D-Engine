
export class Texture{

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
}