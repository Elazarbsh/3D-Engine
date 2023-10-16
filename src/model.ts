
import { Tri } from "./tri.js";
import { Texel } from "./texel.js";
import { Vec3 } from "./vec3.js";
import { Material } from "./material.js";

export class Model {
  private _tris: Tri[];
  private _rotation: Vec3;
  private _translation: Vec3;
  private _material: Material;

  constructor(tris: Tri[], material : Material = new Material(), rotation: Vec3 = new Vec3(0, 0, 0), translation: Vec3 = new Vec3(0, 0, 0), ) {
    this._tris = tris;
    this._rotation = rotation;
    this._translation = translation;
    this._material = material;
  }

  public static async loadModelFromObjectFile(fileName: string, hasTexture: boolean): Promise<Model> {
    const res = await fetch(fileName);
    const data = await res.text();

    const lines = data.split('\n');
    const vertices: Vec3[] = [];
    const texels: Texel[] = [];
    const tris: Tri[] = [];

    for (const line of lines) {
      const params = line.split(' ');
      if (params[0] === 'v') {
        vertices.push(new Vec3(+params[1], +params[2], +params[3]));
      }
      if (params[0] === 'vt') {
        texels.push(new Texel(+params[1] , +params[2]));
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

          const tri = new Tri(
            vertices[+v1index[0] - 1],
            vertices[+v2index[0] - 1],
            vertices[+v3index[0] - 1],
            texels[+v1index[1] - 1],
            texels[+v2index[1] - 1],
            texels[+v3index[1] - 1]
          );

          if(tri.texel1.v < 0){
            tri.texel1.v = this.normalizeBetweenZeroAndOne(tri.texel1.v);
          }

          if(tri.texel2.v < 0){
            tri.texel2.v = this.normalizeBetweenZeroAndOne(tri.texel2.v);
          }

          if(tri.texel3.v < 0){
            tri.texel3.v = this.normalizeBetweenZeroAndOne(tri.texel3.v);
          }

          tris.push(tri);
        }
      }
    }
    return new Model(tris);
  }

  private static normalizeBetweenZeroAndOne(num: number): number {
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
  public get material(): Material{
    return this._material;
  }
  public set material(value: Material) {
    this._material = value;
  }
}