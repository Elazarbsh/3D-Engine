import { Camera } from "./camera.js";
import { Vec3 } from "./vec3.js";
import { CameraConsts } from "./consts/camera-consts.js";

export class BrowserFreeCameraControls {

    private _cam: Camera;
    private _movingSpeed : number;
    private _rotationSpeed : number;

    constructor(cam: Camera, movingSpeed : number = CameraConsts.DEFAULT_CAMERA_MOVEMENT_SPEED, rotationSpeed : number = CameraConsts.DEFAULT_CAMERA_ROTATION_SPEED) {
        this._cam = cam;
        this._movingSpeed = movingSpeed;
        this._rotationSpeed = rotationSpeed;
        this.turnOnControls();
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

    public turnOnControls(): void {
        document.addEventListener("keydown", this.handleKeyDown);
    }
    public turnOffControls(): void {
        document.removeEventListener("keydown", this.handleKeyDown);
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