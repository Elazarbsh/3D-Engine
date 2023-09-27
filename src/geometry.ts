import { Model } from "./mesh.js";
import { Tri } from "./tri.js";
import { Vec2 } from "./vec2.js";
import { Vec3 } from "./vec3.js";

export class Geometry{

    public static cube() : Model{
        return new Model([
            // SOUTH
            new Tri(
                new Vec3(0.0, 0.0, 0.0),
                new Vec3(0.0, 1.0, 0.0),
                new Vec3(1.0, 1.0, 0.0),
                
                new Vec2(0,1),
                new Vec2(0,0),
                new Vec2(1,0),
            ),
            new Tri(
                new Vec3(0.0, 0.0, 0.0),
                new Vec3(1.0, 1.0, 0.0),
                new Vec3(1.0, 0.0, 0.0),

                new Vec2(0,1),
                new Vec2(1,0),
                new Vec2(1,1),
            ),
        
            // EAST
            new Tri(
                new Vec3(1.0, 0.0, 0.0),
                new Vec3(1.0, 1.0, 0.0),
                new Vec3(1.0, 1.0, 1.0),

                new Vec2(0,1),
                new Vec2(0,0),
                new Vec2(1,0),
            ),
            new Tri(
                new Vec3(1.0, 0.0, 0.0),
                new Vec3(1.0, 1.0, 1.0),
                new Vec3(1.0, 0.0, 1.0),

                new Vec2(0,1),
                new Vec2(1,0),
                new Vec2(1,1),
            ),
        
            // NORTH
            new Tri(
                new Vec3(1.0, 0.0, 1.0),
                new Vec3(1.0, 1.0, 1.0),
                new Vec3(0.0, 1.0, 1.0),

                new Vec2(0,1),
                new Vec2(0,0),
                new Vec2(1,0),
            ),
            new Tri(
                new Vec3(1.0, 0.0, 1.0),
                new Vec3(0.0, 1.0, 1.0),
                new Vec3(0.0, 0.0, 1.0),

                new Vec2(0,1),
                new Vec2(1,0),
                new Vec2(1,1),
            ),
        
            // WEST
            new Tri(
                new Vec3(0.0, 0.0, 1.0),
                new Vec3(0.0, 1.0, 1.0),
                new Vec3(0.0, 1.0, 0.0),

                new Vec2(0,1),
                new Vec2(0,0),
                new Vec2(1,0),
            ),
            new Tri(
                new Vec3(0.0, 0.0, 1.0),
                new Vec3(0.0, 1.0, 0.0),
                new Vec3(0.0, 0.0, 0.0),

                new Vec2(0,1),
                new Vec2(1,0),
                new Vec2(1,1),
            ),
        
            // TOP
            new Tri(
                new Vec3(0.0, 1.0, 0.0),
                new Vec3(0.0, 1.0, 1.0),
                new Vec3(1.0, 1.0, 1.0),

                new Vec2(0,1),
                new Vec2(0,0),
                new Vec2(1,0),
            ),
            new Tri(
                new Vec3(0.0, 1.0, 0.0),
                new Vec3(1.0, 1.0, 1.0),
                new Vec3(1.0, 1.0, 0.0),

                new Vec2(0,1),
                new Vec2(1,0),
                new Vec2(1,1),
            ),
        
            // BOTTOM
            new Tri(
                new Vec3(1.0, 0.0, 1.0),
                new Vec3(0.0, 0.0, 1.0),
                new Vec3(0.0, 0.0, 0.0),

                new Vec2(0,1),
                new Vec2(0,0),
                new Vec2(1,0),
            ),
            new Tri(
                new Vec3(1.0, 0.0, 1.0),
                new Vec3(0.0, 0.0, 0.0),
                new Vec3(1.0, 0.0, 0.0),

                new Vec2(0,1),
                new Vec2(1,0),
                new Vec2(1,1),
            )
        ]);
    }
}