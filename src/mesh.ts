import { Mat4x4 } from "./mat4x4.js";
import { RGB } from "./rgb.js";
import { Tri } from "./tri.js";
import { Vec2 } from "./vec2.js";
import { Vec3 } from "./vec3.js";

export class Model {
  private _tris: Tri[];
  private _rotation: Vec3;
  private _translation: Vec3;
  private _color: RGB;
  private _texture: ImageData | null = null;

  constructor(tris: Tri[], rotation: Vec3 = new Vec3(0, 0, 0), translation: Vec3 = new Vec3(0, 0, 0), rgb: RGB = new RGB(), texture: ImageData | null = null) {
    this._tris = tris;
    this._rotation = rotation;
    this._translation = translation;
    this._color = rgb;
    this._texture = texture;
  }

  public static async loadFromObjectFile(fileName: string, hasTexture: boolean): Promise<Model> {
    const res = await fetch(fileName);
    const data = await res.text();

    const lines = data.split('\n');
    const vertices: Vec3[] = [];
    const texels: Vec2[] = [];
    const tris: Tri[] = [];

    for (const line of lines) {
      const params = line.split(' ');
      if (params[0] === 'v') {
        //console.log(line);
        vertices.push(new Vec3(+params[1], +params[2], +params[3]));
      }
      if (params[0] === 'vt') {
        //console.log(line);
        texels.push(new Vec2(+params[1] , +params[2]));
      }
      if (hasTexture === false) {
        if (params[0] === 'f') {
          const v1index = params[1].split('/');
          const v2index = params[2].split('/');
          const v3index = params[3].split('/');
          tris.push(new Tri(vertices[+v1index[0] - 1], vertices[+v2index[0] - 1], vertices[+v3index[0] - 1]));
        }
      } else {
        if (params[0] === 'f') {
          const v1index = params[1].split('/');
          const v2index = params[2].split('/');
          const v3index = params[3].split('/');
          // const t1index = params[1].split('/');
          // const t2index = params[2].split('/');
          // const t3index = params[3].split('/');

          const tri = new Tri(
            vertices[+v1index[0] - 1],
            vertices[+v2index[0] - 1],
            vertices[+v3index[0] - 1],
            // new Vec2(1/8,1/8),
            // new Vec2(5/8,1/8),
            // new Vec2(1/8,5/8)
            texels[+v1index[1] - 1],
            texels[+v2index[1] - 1],
            texels[+v3index[1] - 1]
          );

          // tri.uv1.y = 1 - tri.uv1.y;
          // tri.uv2.y = 1 - tri.uv2.y;
          // tri.uv3.y = 1 - tri.uv3.y;

          // tri.uv1.y = Math.abs(tri.uv1.y);
          // tri.uv2.y = Math.abs(tri.uv2.y);
          // tri.uv3.y = Math.abs(tri.uv3.y);

          // if(tri.uv1.y < 0){
          //   tri.uv1.y = 1 + tri.uv1.y;
          // }

          // if(tri.uv2.y < 0){
          //   tri.uv2.y = 1 + tri.uv2.y;
          // }

          // if(tri.uv3.y < 0){
          //   tri.uv3.y = 1 + tri.uv3.y;
          // }


          // tri.uv1.y = this.normalizeBetweenZeroAndOne(tri.uv1.y);
          // tri.uv2.y = this.normalizeBetweenZeroAndOne(tri.uv2.y);
          // tri.uv3.y = this.normalizeBetweenZeroAndOne(tri.uv3.y);
          
          // tri.uv1.y = 0;
          // tri.uv2.y = 1;
          // tri.uv3.y = 0;

          // tri.uv1.x = 0;
          // tri.uv2.x = 0;
          // tri.uv3.x = 1;
          // tri.uv1.y = 1 - tri.uv1.y;
          // tri.uv2.y = 1 - tri.uv2.y;
          // tri.uv3.y = 1 - tri.uv3.y;

          // tri.uv1.y = this.normalizeBetweenZeroAndOne(tri.uv1.y);
          // tri.uv2.y = this.normalizeBetweenZeroAndOne(tri.uv2.y);
          // tri.uv3.y = this.normalizeBetweenZeroAndOne(tri.uv3.y);

          // tri.uv1.y = 1 + tri.uv1.y;
          // tri.uv2.y = 1 + tri.uv2.y;
          // tri.uv3.y = 1 + tri.uv3.y;

          tris.push(tri);

          //console.log(`normalized = ${this.normalizeBetweenZeroAndOne(-1.72435)}`);

          // console.log(`PUSHED Tri (${tri.v1.x}, ${tri.v1.y}, ${tri.v1.z}), (${tri.v2.x}, ${tri.v2.y} , ${tri.v2.z}), (${tri.v3.x}, ${tri.v3.y} , ${tri.v3.z})`);
          // console.log(`PUSHED Tri with uvs (${tri.uv1.x}, ${tri.uv1.y}), (${tri.uv2.x}, ${tri.uv2.y}), (${tri.uv3.x}, ${tri.uv3.y})`);
        }
      }
    }
    return new Model(tris);
  }

  public static normalizeBetweenZeroAndOne(num: number): number {
    if (num < 0) {
        return 1 - (-num % 1);
    } else {
        return num % 1;
    }
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
  public get texture(): ImageData | null {
    return this._texture;
  }
  public set texture(value: ImageData | null) {
    this._texture = value;
  }
}