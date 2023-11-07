import { Plane } from "./plane.js";
import { Tri } from "./tri.js";
import { Texel } from "./texel.js";
import { Vec3 } from "./vec3.js";

export class TriangleClipper{

    public static clipAgainstPlane(plane: Plane, tri: Tri): Tri[] {
        // Create two temporary storage arrays to classify points either side of plane
        // If distance sign is positive, point lies on "inside" of plane
        const classifiedPoints = this.classifyPoints(plane, tri);
        const insidePoints: Vec3[] = classifiedPoints.insidePoints;
        const outsidePoints: Vec3[] = classifiedPoints.outsidePoints;

        const texelsInsidePoints: Texel[] = classifiedPoints.texelsInsidePoints;
        const texelsOutsidePoints: Texel[] = classifiedPoints.texelsOutsidePoints;
        // Now classify triangle points, and break the input triangle into
        // smaller output triangles if required. There are four possible outcomes...

        if (insidePoints.length === 0)
            // All points lie on the outside of plane, so clip whole triangle
            // It ceases to exist
            return [];
        

        if (insidePoints.length === 3)
            // All points lie on the inside of plane, so do nothing
            // and allow the triangle to simply pass through
            //return [tri];
            return [tri.copy()];
        

        if (insidePoints.length === 1 && outsidePoints.length === 2)
            return this.handleOneInsidePoint(tri, plane, insidePoints, outsidePoints, texelsInsidePoints, texelsOutsidePoints);
        

        if (insidePoints.length === 2 && outsidePoints.length === 1)
            return this.handleTwoInsidePoints(tri, plane, insidePoints, outsidePoints, texelsInsidePoints, texelsOutsidePoints);

        return [];
    }

    private static handleOneInsidePoint(tri : Tri, plane : Plane, insidePoints : Vec3[], outsidePoints : Vec3[] ,texelsInsidePoints : Texel[], texelsOutsidePoints : Texel[]){
            // Triangle should be clipped. As two points lie outside
            // the plane, the triangle simply becomes a smaller triangle
            // The inside point is valid, so keep that...
            
            let v1 = insidePoints[0];
            let texel1 = texelsInsidePoints[0];
            // but the two new points are at the locations where the 
            // original sides of the triangle (lines) intersect

            // but the two new points are at the locations where the 
            // original sides of the triangle (lines) intersect with the plane
            let v2 = Plane.linePlaneIntersect(plane, insidePoints[0], outsidePoints[0]);
            let t: number = Plane.getNormalizedIntersectionDistance(plane, insidePoints[0], outsidePoints[0]);
            let texel2 = this.interpolateTexel(plane, texelsInsidePoints[0], texelsOutsidePoints[0], t);

            let v3 = Plane.linePlaneIntersect(plane, insidePoints[0], outsidePoints[1]);
            t = Plane.getNormalizedIntersectionDistance(plane, insidePoints[0], outsidePoints[1]);
            let texel3 = this.interpolateTexel(plane, texelsInsidePoints[0], texelsOutsidePoints[1], t);

            const newTri = new Tri(v1, v2, v3, texel1, texel2, texel3);
            newTri.surfaceLightIntensity = tri.surfaceLightIntensity;
            return [newTri]; // Return the newly formed single triangle
    }

    private static handleTwoInsidePoints(tri : Tri, plane : Plane, insidePoints : Vec3[], outsidePoints : Vec3[] ,texelsInsidePoints : Texel[], texelsOutsidePoints : Texel[]){
            // Triangle should be clipped. As two points lie inside the plane,
            // the clipped triangle becomes a "quad". Fortunately, we can
            // represent a quad with two new triangles

            // The first triangle consists of the two inside points and a new
            // point determined by the location where one side of the triangle
            // intersects with the plane
            let newTri1v3 = Plane.linePlaneIntersect(plane, insidePoints[0], outsidePoints[0]);
            let t: number = Plane.getNormalizedIntersectionDistance(plane, insidePoints[0], outsidePoints[0]);
            let newTri1uv3 = this.interpolateTexel(plane, texelsInsidePoints[0], texelsOutsidePoints[0], t);
            const newTri1 = new Tri(insidePoints[0], insidePoints[1], newTri1v3, texelsInsidePoints[0], texelsInsidePoints[1], newTri1uv3);

            // The second triangle is composed of one of the inside points, a
            // new point determined by the intersection of the other side of the 
            // triangle and the plane, and the newly created point above
            let newTri2v3 = Plane.linePlaneIntersect(plane, insidePoints[1], outsidePoints[0]);
            t = Plane.getNormalizedIntersectionDistance(plane, insidePoints[1], outsidePoints[0]);
            let newTri2uv3 = this.interpolateTexel(plane, texelsInsidePoints[1], texelsOutsidePoints[0], t);
            const newTri2 = new Tri(insidePoints[1], newTri1v3.copy(), newTri2v3, texelsInsidePoints[1], newTri1.texel3.copy(), newTri2uv3);
            newTri1.surfaceLightIntensity = tri.surfaceLightIntensity;
            newTri2.surfaceLightIntensity = tri.surfaceLightIntensity;
            return [newTri1, newTri2];
    }

    private static interpolateTexel(plane: Plane, texelInside: Texel, texelOutside: Texel, t : number): Texel {
        const texel = new Texel();
        texel.u = t * (texelOutside.u - texelInside.u) + texelInside.u;
        texel.v = t * (texelOutside.v - texelInside.v) + texelInside.v;
        texel.w = t * (texelOutside.w - texelInside.w) + texelInside.w;
        return texel;
    }

    private static classifyPoints(plane: Plane, tri: Tri): { insidePoints: Vec3[], outsidePoints: Vec3[],  texelsInsidePoints: Texel[], texelsOutsidePoints: Texel[]} {
        const insidePoints: Vec3[] = [];
        const outsidePoints: Vec3[] = [];
        const texelsInsidePoints: Texel[] = [];
        const texelsOutsidePoints: Texel[] = [];
    
        const points = [tri.v1, tri.v2, tri.v3];
        const texels = [tri.texel1, tri.texel2, tri.texel3];
    
        for (let i = 0; i < 3; i++) {
            const point = points[i].copy();
            const texel = texels[i].copy();
    
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