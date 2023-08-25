import { Vec3 } from "./vec3.js";

export class Mat4x4 {

  private _matrix: number[][];

  constructor(matrix: number[][] = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]) {
    if (matrix.length !== 4 || matrix[0].length !== 4) {
      throw new Error('Invalid matrix dimensions. Expected 4x4.');
    }

    this._matrix = matrix;
  }

  public get(row: number, col: number): number {
    return this._matrix[row][col];
  }

  public set(row: number, col: number, val: number): number {
    return this._matrix[row][col] = val;
  }

  public static multiply(matA: Mat4x4, matB: Mat4x4): Mat4x4 {
    const result: Mat4x4 = new Mat4x4();

    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < 4; row++) {
        result.set(row, col,
          matA.get(row, 0) * matB.get(0, col) +
          matA.get(row, 1) * matB.get(1, col) +
          matA.get(row, 2) * matB.get(2, col) +
          matA.get(row, 3) * matB.get(3, col))
      }
    }

    return result;
  }

  public static isEqual(matA: Mat4x4, matB: Mat4x4): boolean {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (matA.get(row, col) !== matB.get(row, col)) {
          return false;
        }
      }
    }
    return true;
  }

  public static getXaxisRotationMatrix(angleRad: number): Mat4x4 {
    return new Mat4x4([
      [1, 0, 0, 0],
      [0, Math.cos(angleRad), Math.sin(angleRad), 0],
      [0, -Math.sin(angleRad), Math.cos(angleRad), 0],
      [0, 0, 0, 1]
    ]);
  }

  public static getYaxisRotationMatrix(angleRad: number): Mat4x4 {
    return new Mat4x4([
      [Math.cos(angleRad), 0, -Math.sin(angleRad), 0],
      [0, 1, 0, 0],
      [Math.sin(angleRad), 0, Math.cos(angleRad), 0],
      [0, 0, 0, 1]
    ]);
  }

  public static getZaxisRotationMatrix(angleRad: number): Mat4x4 {
    return new Mat4x4([
      [Math.cos(angleRad), Math.sin(angleRad), 0, 0],
      [-Math.sin(angleRad), Math.cos(angleRad), 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ]);
  }

  public static getTranslationMatrix(pos: Vec3): Mat4x4 {
    return new Mat4x4([
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [pos.x, pos.y, pos.z, 1]])
  }

  public static getProjectionMatrix(fovDegrees: number, aspectRatio: number, near: number, far: number): Mat4x4 {
    const fovRad: number = 1 / Math.tan(fovDegrees * 0.5 / 180 * Math.PI);
    return new Mat4x4([
      [aspectRatio * fovRad, 0.0, 0.0, 0.0],
      [0.0, fovRad, 0.0, 0.0],
      [0.0, 0.0, far / (far - near), 1],
      [0.0, 0.0, (-far * near) / (far - near), 0]
    ]);
  }

  public static getPointAtMatrix(right: Vec3, up: Vec3, forward: Vec3): Mat4x4 {
    return new Mat4x4([
      [right.x, up.x, forward.x, 0],
      [right.y, up.y, forward.y, 0],
      [right.z, up.z, forward.z, 0],
      [0, 0, 0, 1]
    ]);
  }

  public static getScalingMatrix() {

  }
}