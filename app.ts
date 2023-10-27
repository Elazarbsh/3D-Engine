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
  const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;

  let renderer: Renderer = new Renderer(canvas);
  let cam: Camera = new Camera(new Vec3(0, 0, -10), new Vec3(0, 1, 0), new Vec3(0, 0, 1), new Vec3(1, 0, 0));
  let light: Light = new Light(new Vec3(0, 0, 1));
  light.isEnabled = true;
  let scene: Scene = new Scene(light);
  let camControls : BrowserFreeCameraControls = new BrowserFreeCameraControls(cam);

  const texture = await TextureLoader.loadTextureFromImage("truck.png");

  const material = new Material();
  material.color = new RGBA(255, 255, 255);
  material.wireframe = true;
  material.wireframeWidth = 2;
  //material.wireframeColor = new RGBA(200, 15, 80);
  material.texture = texture;

  const mesh: Model = await ModelLoader.loadFromObjectFile('truck.obj');
  
  mesh.material = material;

  //const mesh : Model = Geometry.cube();
  scene.addModel(mesh);

  mesh.translation = new Vec3(0, 0, 0);

  let mouseControls : BrowserMouseControls = new BrowserMouseControls(mesh, cam, canvas);

  function animate(timeElapsed: number) {
    renderer.render(scene, cam);
  }

  console.log(texture.textureData);

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




