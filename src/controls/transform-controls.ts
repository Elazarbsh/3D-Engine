import { Camera } from "../camera.js";
import { Model } from "../model.js";
import { Vec3 } from "../vec3.js";
import { CameraConsts } from "../consts/camera-consts.js";


export class TransformControls {

    private _model: Model;
    private _cam: Camera;
    private _canvas: HTMLCanvasElement | OffscreenCanvas;

    private isDragging = false;
    private rotationSpeed = 0.01;
    private previousMouseX = 0;
    private previousMouseY = 0;
    private deltaRotationX = 0;
    private deltaRotationY = 0;
    private dampingFactor = 0.2; // Adjust damping factor for smoother rotation

    constructor(model: Model, cam: Camera, canvas: HTMLCanvasElement | OffscreenCanvas) {
        this._model = model;
        this._cam = cam;
        this._canvas = canvas;
        this.enableControls();
    }

    public enableControls() {
        this.canvas.addEventListener('mousedown', this.handleMouseDown as EventListener);
        this.canvas.addEventListener('mouseup', this.handleMouseUp as EventListener);
        this.canvas.addEventListener('mousemove', this.handleMouseMove as EventListener);
        this.canvas.addEventListener('wheel', this.handleMouseWheel as EventListener);
    }

    public disableControls() {
        this.canvas.removeEventListener('mousedown', this.handleMouseDown as EventListener);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp as EventListener);
        this.canvas.removeEventListener('mousemove', this.handleMouseMove as EventListener);
        this.canvas.removeEventListener('wheel', this.handleMouseWheel as EventListener);
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
    public get canvas(): HTMLCanvasElement | OffscreenCanvas {
        return this._canvas;
    }
    public set canvas(value: HTMLCanvasElement | OffscreenCanvas) {
        this._canvas = value;
    }
}