import { Plane } from "./plane.js";
import { Tri } from "./tri.js";
import { Vec3 } from "./vec3.js";

export class TriangleClipper{

    static clipAgainstPlane(plane: Plane, tri: Tri): Tri[] {
        // Make sure plane normal is indeed normal
        const planeNormal = Vec3.normalize(plane.normal);

        // Create two temporary storage arrays to classify points either side of plane
        // If distance sign is positive, point lies on "inside" of plane
        const classifiedPoints = this.classifyPoints(plane, tri);
        const insidePoints: Vec3[] = classifiedPoints.insidePoints;
        const outsidePoints: Vec3[] = classifiedPoints.outsidePoints;
        // Now classify triangle points, and break the input triangle into
        // smaller output triangles if required. There are four possible outcomes...

        if (insidePoints.length === 0) {
            // All points lie on the outside of plane, so clip whole triangle
            // It ceases to exist
            return [];
        }

        if (insidePoints.length === 3) {
            // All points lie on the inside of plane, so do nothing
            // and allow the triangle to simply pass through
            return [tri];
        }

        if (insidePoints.length === 1 && outsidePoints.length === 2) {
            // Triangle should be clipped. As two points lie outside
            // the plane, the triangle simply becomes a smaller triangle

            // The inside point is valid, so keep that...
            
            let v1 = insidePoints[0];
            // but the two new points are at the locations where the 
            // original sides of the triangle (lines) intersect

                        // but the two new points are at the locations where the 
            // original sides of the triangle (lines) intersect with the plane
            let v2 = Plane.linePlaneIntersect(plane, insidePoints[0], outsidePoints[0]);
            let v3 = Plane.linePlaneIntersect(plane, insidePoints[0], outsidePoints[1]);

            const newTri = new Tri(v1, v2, v3);
            return [newTri]; // Return the newly formed single triangle
        }

        if (insidePoints.length === 2 && outsidePoints.length === 1) {
            // Triangle should be clipped. As two points lie inside the plane,
            // the clipped triangle becomes a "quad". Fortunately, we can
            // represent a quad with two new triangles

            // The first triangle consists of the two inside points and a new
            // point determined by the location where one side of the triangle
            // intersects with the plane
            let newTri1v1 = insidePoints[0];
            let newTri1v2 = insidePoints[1];
            let newTri1v3 = Plane.linePlaneIntersect(plane, insidePoints[0], outsidePoints[0]);
            const newTri1 = new Tri(newTri1v1, newTri1v2, newTri1v3);

            // The second triangle is composed of one of the inside points, a
            // new point determined by the intersection of the other side of the 
            // triangle and the plane, and the newly created point above
            let newTri2v1 = insidePoints[1];
            let newTri2v2 = newTri1.v3;
            let newTri2v3 = Plane.linePlaneIntersect(plane, insidePoints[1], outsidePoints[0]);
            const newTri2 = new Tri(newTri2v1, newTri2v2, newTri2v3);

            return [newTri1, newTri2];
        }

        return [];
    }

    private static classifyPoints(plane: Plane, tri: Tri): { insidePoints: Vec3[], outsidePoints: Vec3[] } {
        const planeNormal = Vec3.normalize(plane.normal);
        const insidePoints: Vec3[] = [];
        const outsidePoints: Vec3[] = [];
    
        for (const point of [tri.v1, tri.v2, tri.v3]) {
            const dist = Plane.distFromPlane(plane, point);
            if (dist >= 0) {
                insidePoints.push(point);
            } else {
                outsidePoints.push(point);
            }
        }
    
        return { insidePoints, outsidePoints };
    }
}