import { Model } from "./model.js";
import { Texel } from "./texel.js";
import { Tri } from "./tri.js";
import { Vec3 } from "./vec3.js";

export class ModelLoader {

    public static async loadFromObjectFile(fileName: string): Promise<Model> {
        const data = await (await fetch(fileName)).text();
        const lines = data.split('\n');
        const vertices: Vec3[] = [];
        const texels: Texel[] = [];
        const tris: Tri[] = [];

        for (const line of lines) {
            const params = line.split(' ');
            
            if (params[0] === 'v') {
                vertices.push(new Vec3(+params[1], +params[2], +params[3]));
            }
            if (params[0] === 'vt') {
                texels.push(new Texel(+params[1], +params[2]));
            }
            if (params[0] === 'f') {
                const v1index = params[1]?.split('/') ?? [];
                const v2index = params[2]?.split('/') ?? [];
                const v3index = params[3]?.split('/') ?? [];

                const tri = new Tri(
                    vertices[+v1index[0] - 1], vertices[+v2index[0] - 1], vertices[+v3index[0] - 1],
                    texels[+v1index[1] - 1], texels[+v2index[1] - 1], texels[+v3index[1] - 1]
                );

                tri.texel1.v = this.normalizeBetweenZeroAndOne(tri.texel1.v);
                tri.texel2.v = this.normalizeBetweenZeroAndOne(tri.texel2.v);
                tri.texel3.v = this.normalizeBetweenZeroAndOne(tri.texel3.v);

                tris.push(tri);
            }
        }

        return new Model(tris);
    }

    private static normalizeBetweenZeroAndOne(num: number): number {
        return num < 0 ? 1 - (-num % 1) : num % 1;
    }
}