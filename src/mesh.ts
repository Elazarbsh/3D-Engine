import { Mat4x4 } from "./mat4x4.js";
import { RGB } from "./rgb.js";
import { Tri } from "./tri.js";
import { Vec3 } from "./vec3.js";

export class Model{
    private _tris: Tri[];
    private _rotation: Vec3;
    private _translation: Vec3;
    private _color: RGB;

    constructor(tris : Tri[], rotation : Vec3 = new Vec3(0,0,0), translation : Vec3 = new Vec3(0,0,0), rgb : RGB = new RGB()){
        this._tris = tris;
        this._rotation = rotation;
        this._translation = translation;
        this._color = rgb;
    }

    public static async loadFromObjectFile(fileName: string): Promise<Model> {
        const res = await fetch(fileName);
        const data = await res.text();
      
        const lines = data.split('\n');
        const vertices: Vec3[] = [];
        const tris: Tri[] = [];
      
        for (const line of lines) {
          const params = line.split(' ');
          if (params[0] === 'v') {
            vertices.push(new Vec3(+params[1], +params[2], +params[3]));
          }
          if (params[0] === 'f') {
            const v1index = params[1].split('/');
            const v2index = params[2].split('/');
            const v3index = params[3].split('/');
            tris.push(new Tri(vertices[+v1index[0] - 1], vertices[+v2index[0] - 1], vertices[+v3index[0] - 1]));
          }
        }
        return new Model(tris);
      }

      public get tris(): Tri[] {
        return this._tris;
      }
      public set tris(value: Tri[]) {
        this._tris = value;
      }
      public get rotation(): Vec3 {
        return this._rotation;
      }
      public set rotation(value: Vec3) {
        this._rotation = value;
      }
      public get translation(): Vec3 {
        return this._translation;
      }
      public set translation(value: Vec3) {
        this._translation = value;
      }
      public get color(): RGB {
        return this._color;
      }
      public set color(value: RGB) {
        this._color = value;
      }
}