import { Camera } from "../camera.js";
import { Model } from "../model.js";
import { Vec3 } from "../vec3.js";
import { CameraConsts } from "../consts/camera-consts.js";


export class TransformControls {

    private _model: Model;
    private _cam: Camera;
    private _canvas: HTMLCanvasElement;

    private isDragging = false;
    private rotationSpeed = 0.01;
    private previousMouseX = 0;
    private previousMouseY = 0;
    private deltaRotationX = 0;
    private deltaRotationY = 0;
    private dampingFactor = 0.2; // Adjust damping factor for smoother rotation

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
        this.previousMouseX = event.clientX;
        this.previousMouseY = event.clientY;
    }

    private handleMouseUp = (event: MouseEvent): void => {
        this.isDragging = false;
    }

    private handleMouseMove = (event: MouseEvent): void => {
        if (!this.isDragging)
            return;

        const deltaX = event.clientX - this.previousMouseX;
        const deltaY = event.clientY - this.previousMouseY;

        // Accumulate delta rotation
        this.deltaRotationY += deltaX * this.rotationSpeed;
        this.deltaRotationX += deltaY * this.rotationSpeed;

        this.previousMouseX = event.clientX;
        this.previousMouseY = event.clientY;

    }

    public update() {
        // Apply damping to rotation speed
        this.deltaRotationX *= 1 - this.dampingFactor;
        this.deltaRotationY *= 1 - this.dampingFactor;

        // Apply accumulated rotation to model
        this.model.rotation.y += this.deltaRotationY;
        this.model.rotation.x += this.deltaRotationX;
    }

    private handleMouseWheel = (event: WheelEvent): void => {
        const delta = event.deltaY;
        const dampingFactor = 0.1; // Adjust damping factor as needed
        const minDistanceToObject = 1; // Adjust minimum distance as needed 
        let newPosition;

        if (delta > 0)
            newPosition = Vec3.sub(this.cam.position, Vec3.mul(this.cam.forward, CameraConsts.DEFAULT_CAMERA_ZOOM_SPEED * dampingFactor));
        else
            newPosition = Vec3.add(this.cam.position, Vec3.mul(this.cam.forward, CameraConsts.DEFAULT_CAMERA_ZOOM_SPEED * dampingFactor));

        const distanceToObject = Vec3.dist(newPosition, this.model.translation);

        // Check if the new distance is within the acceptable range
        if (distanceToObject >= minDistanceToObject) {
            // Update the camera position
            this.cam.position = newPosition;
        }
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