import { Light } from "./light";
import { Model } from "./mesh";

export class Scene{

    private _models: Model[];
    private _light: Light;

    constructor(light : Light, models : Model[] = []){
        this._models = models;
        this._light = light;
    }

    public addModel(model : Model) : void{
        this.models.push(model);
    }

    public clearModels() : void{
        this.models = [];
    }

    public get models(): Model[] {
        return this._models;
    }
    public set models(value: Model[]) {
        this._models = value;
    }
    public get light(): Light {
        return this._light;
    }
    public set light(value: Light) {
        this._light = value;
    }
}