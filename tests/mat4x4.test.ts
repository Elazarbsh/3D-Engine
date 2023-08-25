import { it, expect, describe, beforeEach } from "vitest";
import { Mat4x4 } from "../src/mat4x4";
import { Vec3 } from "../src/vec3";

describe("Mat4x4", () => {
    describe("get and set", () => {
        it("should get and set matrix values correctly", () => {
            const matrix = new Mat4x4();
            matrix.set(0, 0, 1);
            matrix.set(1, 1, 2);
            matrix.set(2, 2, 3);
            matrix.set(3, 3, 4);

            expect(matrix.get(0, 0)).toBe(1);
            expect(matrix.get(1, 1)).toBe(2);
            expect(matrix.get(2, 2)).toBe(3);
            expect(matrix.get(3, 3)).toBe(4);
        });
    });

    describe("multiply", () => {
        it("should return the multiplication of two matrices", () => {
            const matrix1 = new Mat4x4([
                [1, 2, 3, 4],
                [5, 6, 7, 8],
                [9, 10, 11, 12],
                [13, 14, 15, 16]
            ]);
            const matrix2 = new Mat4x4([
                [1, 2, 3, 4],
                [5, 6, 7, 8],
                [9, 10, 11, 12],
                [13, 14, 15, 16]
            ]);
            const result = matrix1.multiply(matrix2);

            const expected = new Mat4x4([
                [90, 100, 110, 120],
                [202, 228, 254, 280],
                [314, 356, 398, 440],
                [426, 484, 542, 600]
            ]);

            expect(result.isEqual(expected)).toBe(true);
        });
    });

    describe("isEqual", () => {
        it("should return true for equal matrices", () => {
            const matrix1 = new Mat4x4([
                [1, 2, 3, 4],
                [5, 6, 7, 8],
                [9, 10, 11, 12],
                [13, 14, 15, 16]
            ]);
            const matrix2 = new Mat4x4([
                [1, 2, 3, 4],
                [5, 6, 7, 8],
                [9, 10, 11, 12],
                [13, 14, 15, 16]
            ]);

            expect(matrix1.isEqual(matrix2)).toBe(true);
        });

        it("should return false for different matrices", () => {
            const matrix1 = new Mat4x4([
                [1, 2, 3, 4],
                [5, 6, 7, 8],
                [9, 10, 11, 12],
                [13, 14, 15, 16]
            ]);
            const matrix2 = new Mat4x4([
                [1, 2, 3, 4],
                [5, 6, 7, 8],
                [9, 10, 11, 12],
                [13, 14, 15, 15] // Different value here
            ]);

            expect(matrix1.isEqual(matrix2)).toBe(false);
        });
    });

    describe("getXaxisRotationMatrix", () => {
        it("should return the X-axis rotation matrix", () => {
            const angleRad = Math.PI / 2;
            const result = Mat4x4.getXaxisRotationMatrix(angleRad);

            expect(result.get(0, 0)).toBe(1);
            expect(result.get(0, 1)).toBe(0);
            expect(result.get(0, 2)).toBe(0);
            expect(result.get(0, 3)).toBe(0);

            expect(result.get(1, 0)).toBe(0);
            expect(result.get(1, 1)).toBeCloseTo(Math.cos(angleRad));
            expect(result.get(1, 2)).toBeCloseTo(Math.sin(angleRad));
            expect(result.get(1, 3)).toBe(0);

            expect(result.get(2, 0)).toBe(0);
            expect(result.get(2, 1)).toBeCloseTo(-Math.sin(angleRad));
            expect(result.get(2, 2)).toBeCloseTo(Math.cos(angleRad));
            expect(result.get(2, 3)).toBe(0);

            expect(result.get(3, 0)).toBe(0);
            expect(result.get(3, 1)).toBe(0);
            expect(result.get(3, 2)).toBe(0);
            expect(result.get(3, 3)).toBe(1);
        });
    });

    describe("getYaxisRotationMatrix", () => {
        it("should return the Y-axis rotation matrix", () => {
            const angleRad = Math.PI / 2;
            const result = Mat4x4.getYaxisRotationMatrix(angleRad);

            expect(result.get(0, 0)).toBeCloseTo(Math.cos(angleRad));
            expect(result.get(0, 1)).toBe(0);
            expect(result.get(0, 2)).toBeCloseTo(-Math.sin(angleRad));
            expect(result.get(0, 3)).toBe(0);

            expect(result.get(1, 0)).toBe(0);
            expect(result.get(1, 1)).toBe(1);
            expect(result.get(1, 2)).toBe(0);
            expect(result.get(1, 3)).toBe(0);

            expect(result.get(2, 0)).toBeCloseTo(Math.sin(angleRad));
            expect(result.get(2, 1)).toBe(0);
            expect(result.get(2, 2)).toBeCloseTo(Math.cos(angleRad));
            expect(result.get(2, 3)).toBe(0);

            expect(result.get(3, 0)).toBe(0);
            expect(result.get(3, 1)).toBe(0);
            expect(result.get(3, 2)).toBe(0);
            expect(result.get(3, 3)).toBe(1);
        });
    });

    describe("getZaxisRotationMatrix", () => {
        it("should return the Z-axis rotation matrix", () => {
            const angleRad = Math.PI / 2;
            const result = Mat4x4.getZaxisRotationMatrix(angleRad);

            expect(result.get(0, 0)).toBeCloseTo(Math.cos(angleRad));
            expect(result.get(0, 1)).toBeCloseTo(Math.sin(angleRad));
            expect(result.get(0, 2)).toBe(0);
            expect(result.get(0, 3)).toBe(0);

            expect(result.get(1, 0)).toBeCloseTo(-Math.sin(angleRad));
            expect(result.get(1, 1)).toBeCloseTo(Math.cos(angleRad));
            expect(result.get(1, 2)).toBe(0);
            expect(result.get(1, 3)).toBe(0);

            expect(result.get(2, 0)).toBe(0);
            expect(result.get(2, 1)).toBe(0);
            expect(result.get(2, 2)).toBe(1);
            expect(result.get(2, 3)).toBe(0);

            expect(result.get(3, 0)).toBe(0);
            expect(result.get(3, 1)).toBe(0);
            expect(result.get(3, 2)).toBe(0);
            expect(result.get(3, 3)).toBe(1);
        });
    });

    describe("getTranslationMatrix", () => {
        it("should return the translation matrix", () => {
            const pos = new Vec3(2, 3, 4);
            const result = Mat4x4.getTranslationMatrix(pos);

            expect(result.get(0, 0)).toBe(1);
            expect(result.get(0, 1)).toBe(0);
            expect(result.get(0, 2)).toBe(0);
            expect(result.get(0, 3)).toBe(0);

            expect(result.get(1, 0)).toBe(0);
            expect(result.get(1, 1)).toBe(1);
            expect(result.get(1, 2)).toBe(0);
            expect(result.get(1, 3)).toBe(0);

            expect(result.get(2, 0)).toBe(0);
            expect(result.get(2, 1)).toBe(0);
            expect(result.get(2, 2)).toBe(1);
            expect(result.get(2, 3)).toBe(0);

            expect(result.get(3, 0)).toBe(pos.x);
            expect(result.get(3, 1)).toBe(pos.y);
            expect(result.get(3, 2)).toBe(pos.z);
            expect(result.get(3, 3)).toBe(1);
        });
    });

    describe("getProjectionMatrix", () => {
        it("should return the projection matrix", () => {
            const fovDegrees = 60;
            const aspectRatio = 16 / 9;
            const near = 0.1;
            const far = 100;
            const result = Mat4x4.getProjectionMatrix(fovDegrees, aspectRatio, near, far);

            const fovRad = 1 / Math.tan(fovDegrees * 0.5 / 180 * Math.PI);

            expect(result.get(0, 0)).toBeCloseTo(aspectRatio * fovRad);
            expect(result.get(0, 1)).toBe(0);
            expect(result.get(0, 2)).toBe(0);
            expect(result.get(0, 3)).toBe(0);

            expect(result.get(1, 0)).toBe(0);
            expect(result.get(1, 1)).toBeCloseTo(fovRad);
            expect(result.get(1, 2)).toBe(0);
            expect(result.get(1, 3)).toBe(0);

            expect(result.get(2, 0)).toBe(0);
            expect(result.get(2, 1)).toBe(0);
            expect(result.get(2, 2)).toBeCloseTo(far / (far - near));
            expect(result.get(2, 3)).toBe(0);

            expect(result.get(3, 0)).toBe(0);
            expect(result.get(3, 1)).toBe(0);
            expect(result.get(3, 2)).toBeCloseTo((-far * near) / (far - near));
            expect(result.get(3, 3)).toBe(1);
        });
    });
});