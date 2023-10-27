
import { Tri } from "./tri.js";
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