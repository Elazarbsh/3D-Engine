import { it, expect, describe, beforeEach } from "vitest";

import { Mat4x4 } from "../src/mat4x4";
import { Vec3 } from "../src/vec3";
import { Triangle } from "../src/tri"

describe('Triangle', () => {
    it('should translate the triangle', () => {
    const v1 = new Vec3(1, 2, 3);
    const v2 = new Vec3(4, 5, 6);
    const v3 = new Vec3(7, 8, 9);
    const triangle = new Triangle(v1, v2, v3);

    const translationVector = new Vec3(10, 10, 10);
    triangle.translateTri(translationVector);

    expect(triangle.v1).toEqual(new Vec3(11, 12, 13));
    expect(triangle.v2).toEqual(new Vec3(14, 15, 16));
    expect(triangle.v3).toEqual(new Vec3(17, 18, 19));
  });

  describe("Triangle", () => {
    it("should rotate the triangle", () => {
      const v1 = new Vec3(1, 0, 0);
      const v2 = new Vec3(0, 1, 0);
      const v3 = new Vec3(0, 0, 1);
      const triangle = new Triangle(v1, v2, v3);
  
      const angleRad = Math.PI / 2;
      triangle.rotateTri(angleRad);
  
      // Since we are rotating the triangle 90 degrees around the Y-axis,
      // the new vertices should be (0, 0, 1), (0, 1, 0), and (-1, 0, 0).
      expect(triangle.v1).toEqual(new Vec3(0, 0, 1));
      expect(triangle.v2).toEqual(new Vec3(0, 1, 0));
      expect(triangle.v3).toEqual(new Vec3(-1, 0, 0));
    });
  
    it("should multiply the triangle by a matrix", () => {
      const v1 = new Vec3(1, 2, 3);
      const v2 = new Vec3(4, 5, 6);
      const v3 = new Vec3(7, 8, 9);
      const triangle = new Triangle(v1, v2, v3);
  
      const matrix = new Mat4x4([
        [1, 0, 0, 1],
        [0, 1, 0, 2],
        [0, 0, 1, 3],
        [1, 1, 1, 1],
      ]);
      triangle.multiplyMatrix(matrix);
  
      // The vertices of the triangle after multiplication by the matrix
      // will remain the same since the matrix is an identity matrix.
      expect(triangle.v1).toEqual(new Vec3(1,2,3,15));
      expect(triangle.v2).toEqual(v2);
      expect(triangle.v3).toEqual(v3);
    });
  });
});