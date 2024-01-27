
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

    public static fromHex(hex: string): RGBA {
        // Check if the hex string is a valid length and contains only valid characters
        const validHexRegex = /^#?[0-9a-fA-F]{6}$/;
        if (!validHexRegex.test(hex)) {
            throw new Error(`Invalid hex color string. string=${hex}`);
        }
    
        // Remove the optional leading #
        hex = hex.replace(/^#/, '');
    
        const bigint = parseInt(hex, 16);
    
        const red = (bigint >> 16) & 255;
        const green = (bigint >> 8) & 255;
        const blue = bigint & 255;
    
        return new RGBA(red, green, blue);
    }
    
      // Function to get the color as a hex string
    public toHex(): string {
        const redHex = this.toHexComponent(this.red);
        const greenHex = this.toHexComponent(this.green);
        const blueHex = this.toHexComponent(this.blue);
        return `#${redHex}${greenHex}${blueHex}`;
    }

    private toHexComponent(value : number) : string{
        const hex = value.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
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