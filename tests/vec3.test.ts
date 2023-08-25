import { it, expect, describe, beforeEach } from "vitest";

import { Vec3 } from "../src/vec3";
import { Mat4x4 } from "../src/mat4x4";

describe("Vec3", () => {
  let vec: Vec3;

  beforeEach(() => {
    vec = new Vec3(2, 3, 4);
  });

  describe("add", () => {
    it("should add the components of the given vector", () => {
      const otherVec = new Vec3(1, 2, 3);
      vec.add(otherVec);
      expect(vec.x).toBe(3);
      expect(vec.y).toBe(5);
      expect(vec.z).toBe(7);
    });
  });

  describe("sub", () => {
    it("should subtract the components of the given vector", () => {
      const otherVec = new Vec3(1, 2, 3);
      vec.sub(otherVec);
      expect(vec.x).toBe(1);
      expect(vec.y).toBe(1);
      expect(vec.z).toBe(1);
    });
  });

  describe("mul", () => {
    it("should multiply the vector by the given scalar", () => {
      const scalar = 2;
      vec.mul(scalar);
      expect(vec.x).toBe(4);
      expect(vec.y).toBe(6);
      expect(vec.z).toBe(8);
    });
  });

  describe("div", () => {
    it("should divide the vector by the given scalar", () => {
      const scalar = 2;
      vec.div(scalar);
      expect(vec.x).toBe(1);
      expect(vec.y).toBe(1.5);
      expect(vec.z).toBe(2);
    });
  });

  describe("getLength", () => {
    it("should return the magnitude of the vector", () => {
      const length = vec.getLength();
      expect(length).toBeCloseTo(5.385, 3);
    });
  });

  describe("getNormalized", () => {
    it("should return a new vector with length 1", () => {
      const normalizedVec = vec.getNormalized();
      const length = normalizedVec.getLength();
      expect(length).toBeCloseTo(1);
    });
  });

  describe("multiplyByMatrix", () => {
    it("should return the result of multiplying the vector by the given matrix", () => {
      const matrix = new Mat4x4([
        [2, 0, 0, 0],
        [0, 2, 0, 0],
        [0, 0, 2, 0],
        [0, 0, 0, 2],
      ]);
      const result = vec.multiplyByMatrix(matrix);
      expect(result.x).toBe(4);
      expect(result.y).toBe(6);
      expect(result.z).toBe(8);
      expect(result.w).toBe(2);
    });
  });

  describe("dotProduct", () => {
    it("should return the dot product of two vectors", () => {
      const otherVec = new Vec3(1, 2, 3);
      const dotProduct = Vec3.dotProduct(vec, otherVec);
      expect(dotProduct).toBe(20);
    });
  });
});