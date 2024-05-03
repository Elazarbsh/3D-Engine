import { Model } from "./model.js";
import { Tri } from "./tri.js";
import { Texel } from "./texel.js";
import { Vec3 } from "./vec3.js";

export class Geometry {

    public static readonly CUBE: Model = new Model([
        // SOUTH
        new Tri(
            new Vec3(-0.5, -0.5, -0.5),
            new Vec3(-0.5, 0.5, -0.5),
            new Vec3(0.5, 0.5, -0.5),
    
            new Texel(0, 1),
            new Texel(0, 0),
            new Texel(1, 0),
        ),
        new Tri(
            new Vec3(-0.5, -0.5, -0.5),
            new Vec3(0.5, 0.5, -0.5),
            new Vec3(0.5, -0.5, -0.5),
    
            new Texel(0, 1),
            new Texel(1, 0),
            new Texel(1, 1),
        ),
    
        // EAST
        new Tri(
            new Vec3(0.5, -0.5, -0.5),
            new Vec3(0.5, 0.5, -0.5),
            new Vec3(0.5, 0.5, 0.5),
    
            new Texel(0, 1),
            new Texel(0, 0),
            new Texel(1, 0),
        ),
        new Tri(
            new Vec3(0.5, -0.5, -0.5),
            new Vec3(0.5, 0.5, 0.5),
            new Vec3(0.5, -0.5, 0.5),
    
            new Texel(0, 1),
            new Texel(1, 0),
            new Texel(1, 1),
        ),
    
        // NORTH
        new Tri(
            new Vec3(0.5, -0.5, 0.5),
            new Vec3(0.5, 0.5, 0.5),
            new Vec3(-0.5, 0.5, 0.5),
    
            new Texel(0, 1),
            new Texel(0, 0),
            new Texel(1, 0),
        ),
        new Tri(
            new Vec3(0.5, -0.5, 0.5),
            new Vec3(-0.5, 0.5, 0.5),
            new Vec3(-0.5, -0.5, 0.5),
    
            new Texel(0, 1),
            new Texel(1, 0),
            new Texel(1, 1),
        ),
    
        // WEST
        new Tri(
            new Vec3(-0.5, -0.5, 0.5),
            new Vec3(-0.5, 0.5, 0.5),
            new Vec3(-0.5, 0.5, -0.5),
    
            new Texel(0, 1),
            new Texel(0, 0),
            new Texel(1, 0),
        ),
        new Tri(
            new Vec3(-0.5, -0.5, 0.5),
            new Vec3(-0.5, 0.5, -0.5),
            new Vec3(-0.5, -0.5, -0.5),
    
            new Texel(0, 1),
            new Texel(1, 0),
            new Texel(1, 1),
        ),
    
        // TOP
        new Tri(
            new Vec3(-0.5, 0.5, -0.5),
            new Vec3(-0.5, 0.5, 0.5),
            new Vec3(0.5, 0.5, 0.5),
    
            new Texel(0, 1),
            new Texel(0, 0),
            new Texel(1, 0),
        ),
        new Tri(
            new Vec3(-0.5, 0.5, -0.5),
            new Vec3(0.5, 0.5, 0.5),
            new Vec3(0.5, 0.5, -0.5),
    
            new Texel(0, 1),
            new Texel(1, 0),
            new Texel(1, 1),
        ),
    
        // BOTTOM
        new Tri(
            new Vec3(0.5, -0.5, 0.5),
            new Vec3(-0.5, -0.5, 0.5),
            new Vec3(-0.5, -0.5, -0.5),
    
            new Texel(0, 1),
            new Texel(0, 0),
            new Texel(1, 0),
        ),
        new Tri(
            new Vec3(0.5, -0.5, 0.5),
            new Vec3(-0.5, -0.5, -0.5),
            new Vec3(0.5, -0.5, -0.5),
    
            new Texel(0, 1),
            new Texel(1, 0),
            new Texel(1, 1),
        )
    ]);

    public static sphere(segments: number): Model {
        const vertices: Vec3[] = [];
        const texels: Texel[] = [];
        const tris: Tri[] = [];

        for (let lat = 0; lat <= segments; lat++) {
            const theta = (lat * Math.PI) / segments;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let long = 0; long <= segments; long++) {
                const phi = (long * 2 * Math.PI) / segments;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                const x = cosPhi * sinTheta;
                const y = cosTheta;
                const z = sinPhi * sinTheta;

                vertices.push(new Vec3(x, y, z));
                texels.push(new Texel(1 - (long / segments), 1 - (lat / segments)));
            }
        }

        for (let lat = 0; lat < segments; lat++) {
            for (let long = 0; long < segments; long++) {
                const first = (lat * (segments + 1)) + long;
                const second = first + segments + 1;

                tris.push(new Tri(
                    vertices[first],
                    vertices[second],
                    vertices[first + 1],
                    texels[first],
                    texels[second],
                    texels[first + 1]
                ));

                tris.push(new Tri(
                    vertices[first + 1],
                    vertices[second],
                    vertices[second + 1],
                    texels[first + 1],
                    texels[second],
                    texels[second + 1]
                ));
            }
        }

        return new Model(tris);
    }
}