import { Camera } from "./camera.js";
import { Model } from "./model.js";
import { Vec3 } from "./vec3.js";
import { CameraConsts } from "./consts/camera-consts.js";


export class BrowserMouseControls {

    private _model: Model;
    private _cam: Camera;
    private _canvas: HTMLCanvasElement;

    private isDragging = false;
    private rotationSpeed = 0.01;
    private previousMouseX = 0;
    private previousMouseY = 0;

    constructor(model: Model, cam: Camera, canvas: HTMLCanvasElement) {
        this._model = model;
        this._cam = cam;
        this._canvas = canvas;
        this.turnOnMouseControls();
    }

    public turnOnMouseControls() {

        this.canvas.addEventListener('mousedown', this.handleMouseDown);

        this.canvas.addEventListener('mouseup', this.handleMouseUp);

        this.canvas.addEventListener('mousemove', this.handleMouseMove);

        this.canvas.addEventListener('wheel', this.handleMouseWheel);

    }

    public turnOffMouseControls() {

        this.canvas.removeEventListener('mousedown', this.handleMouseDown);

        this.canvas.removeEventListener('mouseup', this.handleMouseUp);

        this.canvas.removeEventListener('mousemove', this.handleMouseMove);

        this.canvas.removeEventListener('wheel', this.handleMouseWheel);

    }

    private handleMouseDown = (event: MouseEvent): void => {
        this.isDragging = true;
    }

    private handleMouseUp = (event: MouseEvent): void => {
        this.isDragging = false;
    }

    private handleMouseMove = (event: MouseEvent): void => {
        if (!this.isDragging)
            return;

        const deltaX = event.clientX - this.previousMouseX;
        const deltaY = event.clientY - this.previousMouseY;

        this.model.rotation.y += deltaX * this.rotationSpeed;
        this.model.rotation.x += deltaY * this.rotationSpeed;

        this.previousMouseX = event.clientX;
        this.previousMouseY = event.clientY;

    }

    private handleMouseWheel = (event: WheelEvent): void => {
        const delta = event.deltaY;
        if (delta > 0)
            this.cam.position = Vec3.sub(this.cam.position, Vec3.mul(this.cam.forward, CameraConsts.DEFAULT_CAMERA_ZOOM_SPEED));
        else
            this.cam.position = Vec3.add(this.cam.position, Vec3.mul(this.cam.forward, CameraConsts.DEFAULT_CAMERA_ZOOM_SPEED));
    }

    public get cam(): Camera {
        return this._cam;
    }
    public set cam(value: Camera) {
        this._cam = value;
    }

    public get model(): Model {
        return this._model;
    }
    public set model(value: Model) {
        this._model = value;
    }
    public get canvas(): HTMLCanvasElement {
        return this._canvas;
    }
    public set canvas(value: HTMLCanvasElement) {
        this._canvas = value;
    }

}