import { Plane } from "./plane.js";
import { Tri } from "./tri.js";
import { Vec2 } from "./vec2.js";
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

        const texelsInsidePoints: Vec2[] = classifiedPoints.texelsInsidePoints;
        const texelsOutsidePoints: Vec2[] = classifiedPoints.texelsOutsidePoints;
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
            //return [tri];
            const uv1 = new Vec2(tri.uv1.x, tri.uv1.y, tri.uv1.w);
            const uv2 = new Vec2(tri.uv2.x, tri.uv2.y, tri.uv2.w);
            const uv3 = new Vec2(tri.uv3.x, tri.uv3.y, tri.uv3.w);
            const newTri = new Tri(tri.v1, tri.v2, tri.v3, uv1, uv2, uv3);
            newTri.surfaceLightIntensity = tri.surfaceLightIntensity;
            return [newTri];
        }

        if (insidePoints.length === 1 && outsidePoints.length === 2) {
            // Triangle should be clipped. As two points lie outside
            // the plane, the triangle simply becomes a smaller triangle

            // The inside point is valid, so keep that...
            
            let v1 = insidePoints[0];
            let uv1 = texelsInsidePoints[0];
            // but the two new points are at the locations where the 
            // original sides of the triangle (lines) intersect

                        // but the two new points are at the locations where the 
            // original sides of the triangle (lines) intersect with the plane
            let v2 = Plane.linePlaneIntersect(plane, insidePoints[0], outsidePoints[0]);
            let t: number = Plane.getNormalizedIntersectionDistance(plane, insidePoints[0], outsidePoints[0]);
            let uv2 = new Vec2(0,0);
            uv2.x = t * (texelsOutsidePoints[0].x - texelsInsidePoints[0].x) + texelsInsidePoints[0].x;
            uv2.y = t * (texelsOutsidePoints[0].y - texelsInsidePoints[0].y) + texelsInsidePoints[0].y;
            uv2.w = t * (texelsOutsidePoints[0].w - texelsInsidePoints[0].w) + texelsInsidePoints[0].w;


            let v3 = Plane.linePlaneIntersect(plane, insidePoints[0], outsidePoints[1]);
            t = Plane.getNormalizedIntersectionDistance(plane, insidePoints[0], outsidePoints[1]);
            let uv3 = new Vec2(0,0);
            uv3.x = t * (texelsOutsidePoints[1].x - texelsInsidePoints[0].x) + texelsInsidePoints[0].x;
            uv3.y = t * (texelsOutsidePoints[1].y - texelsInsidePoints[0].y) + texelsInsidePoints[0].y;
            uv3.w = t * (texelsOutsidePoints[1].w - texelsInsidePoints[0].w) + texelsInsidePoints[0].w;
            const newTri = new Tri(v1, v2, v3, uv1, uv2, uv3);
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
            let newTri1uv1 = texelsInsidePoints[0];
            let newTri1uv2 = texelsInsidePoints[1];

            let newTri1v3 = Plane.linePlaneIntersect(plane, insidePoints[0], outsidePoints[0]);
            let t: number = Plane.getNormalizedIntersectionDistance(plane, insidePoints[0], outsidePoints[0]);
            let newTri1uv3 = new Vec2(0,0);
            newTri1uv3.x = t * (texelsOutsidePoints[0].x - texelsInsidePoints[0].x) + texelsInsidePoints[0].x;
            newTri1uv3.y = t * (texelsOutsidePoints[0].y - texelsInsidePoints[0].y) + texelsInsidePoints[0].y;
            newTri1uv3.w = t * (texelsOutsidePoints[0].w - texelsInsidePoints[0].w) + texelsInsidePoints[0].w;

            const newTri1 = new Tri(newTri1v1, newTri1v2, newTri1v3, newTri1uv1, newTri1uv2, newTri1uv3);

            // The second triangle is composed of one of the inside points, a
            // new point determined by the intersection of the other side of the 
            // triangle and the plane, and the newly created point above
            let newTri2v1 = insidePoints[1];
            let newTri2uv1 = texelsInsidePoints[1];
            let newTri2v2 = newTri1.v3;
            let newTri2uv2 = newTri1.uv3;

            let newTri2v3 = Plane.linePlaneIntersect(plane, insidePoints[1], outsidePoints[0]);
            t = Plane.getNormalizedIntersectionDistance(plane, insidePoints[1], outsidePoints[0]);
            let newTri2uv3 = new Vec2(0,0);
            newTri2uv3.x = t * (texelsOutsidePoints[0].x - texelsInsidePoints[1].x) + texelsInsidePoints[1].x;
            newTri2uv3.y = t * (texelsOutsidePoints[0].y - texelsInsidePoints[1].y) + texelsInsidePoints[1].y;
            newTri2uv3.w = t * (texelsOutsidePoints[0].w - texelsInsidePoints[1].w) + texelsInsidePoints[1].w;

            const newTri2 = new Tri(newTri2v1, newTri2v2, newTri2v3, newTri2uv1, newTri2uv2, newTri2uv3);

            return [newTri1, newTri2];
        }

        return [];
    }

    private static classifyPoints(plane: Plane, tri: Tri): { insidePoints: Vec3[], outsidePoints: Vec3[],  texelsInsidePoints: Vec2[], texelsOutsidePoints: Vec2[]} {
        const planeNormal = Vec3.normalize(plane.normal);
        const insidePoints: Vec3[] = [];
        const outsidePoints: Vec3[] = [];
        const texelsInsidePoints: Vec2[] = [];
        const texelsOutsidePoints: Vec2[] = [];
    
        const points = [tri.v1, tri.v2, tri.v3];
        const texels = [tri.uv1, tri.uv2, tri.uv3];
    
        for (let i = 0; i < 3; i++) {
            const point = points[i];
            const texel = texels[i];
    
            const dist = Plane.distFromPlane(plane, point);
            if (dist >= 0) {
                insidePoints.push(point);
                texelsInsidePoints.push(texel);
            } else {
                outsidePoints.push(point);
                texelsOutsidePoints.push(texel);
            }
        }
    
        return { insidePoints, outsidePoints, texelsInsidePoints, texelsOutsidePoints };
    }
}