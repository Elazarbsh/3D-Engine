import { Vec3 } from "./src/vec3.js";
import { Model } from "./src/model.js";
import { Camera } from "./src/camera.js";
import { Light } from "./src/light.js";
import { Renderer } from "./src/web-renderer.js";
import { Scene } from "./src/scene.js";
import { BrowserFreeCameraControls } from "./src/browser-free-camera-controls.js";
import { BrowserMouseControls } from "./src/browser-mouse-controls.js";
import { RGBA } from "./src/rgba.js";
import { Geometry } from "./src/geometry.js";
import { Texture } from "./src/texture.js";
import { Material } from "./src/material.js";
import { TextureLoader } from "./src/texture-loader.js";
import { ModelLoader } from "./src/model-loader.js";

(async () => {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;

  const renderer: Renderer = new Renderer(canvas);

  const cam: Camera = new Camera();
  cam.position = new Vec3(0, 0, -10);

  const light: Light = new Light();
  light.direction = new Vec3(0, 0, 1);

  const scene: Scene = new Scene(light);

  const texture = await TextureLoader.loadTextureFromImage("texture.png");

  const material = new Material();
  material.color = new RGBA(255, 255, 255);
  material.wireframe = true;
  material.wireframeWidth = 2;
  material.texture = texture;

  const mesh: Model = await ModelLoader.loadFromObjectFile('model.obj');
  mesh.material = material;
  mesh.translation = new Vec3(0, 0, 0);

  scene.addModel(mesh);

  const mouseControls : BrowserMouseControls = new BrowserMouseControls(mesh, cam, canvas);

  function animate(timeElapsed: number) {
    renderer.render(scene, cam);
  }

  const intervalInMilliseconds = 30;
  let start = new Date();
  let end = new Date();
  let timeElapsed = 0;

  const intervalId = setInterval(() => {
    timeElapsed = ((end.getTime() - start.getTime()) / 1000);
    animate(timeElapsed);
    end = new Date();
  },
    intervalInMilliseconds);
})();
