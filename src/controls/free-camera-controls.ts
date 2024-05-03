import { Camera } from "../camera.js";
import { Vec3 } from "../vec3.js";
import { CameraConsts } from "../consts/camera-consts.js";

export class FreeCameraControls {

    private _cam: Camera;
    private _movingSpeed: number;
    private _rotationSpeed: number;
    private _deltaRotationX: number = 0;
    private _deltaRotationY: number = 0;
    private _deltaX: number = 0;
    private _deltaY: number = 0;
    private _dampingFactor: number = 0.1;
    private _isMouseDown: boolean = false;
    private _previousMouseX: number = 0;
    private _previousMouseY: number = 0;
    private _mouseRotationSpeed: number = 0.001;

    constructor(cam: Camera, movingSpeed: number = CameraConsts.DEFAULT_CAMERA_MOVEMENT_SPEED, rotationSpeed: number = CameraConsts.DEFAULT_CAMERA_ROTATION_SPEED) {
        this._cam = cam;
        this._movingSpeed = movingSpeed;
        this._rotationSpeed = rotationSpeed;
        this.enableControls();
    }

    private handleKeyDown = (event: KeyboardEvent): void => {
        switch (event.key) {
            // pan
            case "ArrowUp": this.cam.position = Vec3.add(this.cam.position, Vec3.mul(this.cam.up, this.movingSpeed)); break;
            case "ArrowDown": this.cam.position = Vec3.sub(this.cam.position, Vec3.mul(this.cam.up, this.movingSpeed)); break;
            case "ArrowLeft": this.cam.position = Vec3.sub(this.cam.position, Vec3.mul(this.cam.right, this.movingSpeed)); break;
            case "ArrowRight": this.cam.position = Vec3.add(this.cam.position, Vec3.mul(this.cam.right, this.movingSpeed)); break;

            //zoom in / out
            case "q": this.cam.position = Vec3.sub(this.cam.position, Vec3.mul(this.cam.forward, this.movingSpeed)); break;
            case "e": this.cam.position = Vec3.add(this.cam.position, Vec3.mul(this.cam.forward, this.movingSpeed)); break;

            // rotate
            case "w": this.cam.pitch(-this.rotationSpeed); break;
            case "s": this.cam.pitch(this.rotationSpeed); break;
            case "a": this.cam.yaw(-this.rotationSpeed); break;
            case "d": this.cam.yaw(this.rotationSpeed); break;

            default: break;
        }
    }

    private handleMouseMove = (event: MouseEvent): void => {
        if (!this._isMouseDown)
            return;

        const deltaX = event.clientX - this._previousMouseX;
        const deltaY = event.clientY - this._previousMouseY;

        this._deltaRotationX += deltaX * this._mouseRotationSpeed;
        this._deltaRotationY += deltaY * this._mouseRotationSpeed;

        this._previousMouseX = event.clientX;
        this._previousMouseY = event.clientY;
    }

    private handleMouseDown = (event: MouseEvent): void => {
        this._isMouseDown = true;
        this._previousMouseX = event.clientX;
        this._previousMouseY = event.clientY;
    }

    private handleMouseUp = (event: MouseEvent): void => {
        this._isMouseDown = false;
    }

    public update = () => {
        // Apply damping to rotation deltas
        this._deltaRotationX *= 1 - this._dampingFactor;
        this._deltaRotationY *= 1 - this._dampingFactor;

        // Apply damping to movement deltas
        this._deltaX *= 1 - this._dampingFactor;
        this._deltaY *= 1 - this._dampingFactor;

        // Update camera rotation
        this._cam.pitch(this._deltaRotationY);
        this._cam.yaw(this._deltaRotationX);

        // Update camera position
        const rightMovement = Vec3.mul(this._cam.right, this._deltaX);
        const upMovement = Vec3.mul(this._cam.up, this._deltaY);
        this._cam.position = Vec3.add(this._cam.position, Vec3.add(rightMovement, upMovement));
    }

    public enableControls(): void {
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mousedown', this.handleMouseDown);
        document.addEventListener('mouseup', this.handleMouseUp);
    }

    public disableControls(): void {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mousedown', this.handleMouseDown);
        document.removeEventListener('mouseup', this.handleMouseUp);
    }

    public setLookAroundOnly(isLookAroundOnly : boolean) {
        if(isLookAroundOnly){
            this.disableControls();
            document.addEventListener('mousemove', this.handleMouseMove);
            document.addEventListener('mousedown', this.handleMouseDown);
            document.addEventListener('mouseup', this.handleMouseUp);
        }else{
            this.enableControls()
        }
    }

    public get cam(): Camera {
        return this._cam;
    }
    public set cam(value: Camera) {
        this._cam = value;
    }
    public get movingSpeed() {
        return this._movingSpeed;
    }
    public set movingSpeed(value) {
        this._movingSpeed = value;
    }
    public get rotationSpeed() {
        return this._rotationSpeed;
    }
    public set rotationSpeed(value) {
        this._rotationSpeed = value;
    }
}