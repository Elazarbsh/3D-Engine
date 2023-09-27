import { Vec3 } from "./src/vec3.js";
import { Model } from "./src/mesh.js";
import { clearScreen } from "./util/canvas-draw-functions.js";
import { Camera } from "./src/camera.js";
import { Light } from "./src/light.js";
import { Renderer } from "./src/web-renderer.js";
import { Scene } from "./src/scene.js";
import { RenderMode } from "./enums/render-mode.js";
import { BrowserFreeCameraControls } from "./src/browser-free-camera-controls.js";
import { BrowserMouseControls } from "./src/browser-mouse-controls.js";
import { RGB } from "./src/rgb.js";
import { Geometry } from "./src/geometry.js";
import { Texture } from "./src/texture.js";

(async () => {
  const screenWidth: number = 800;
  const screenHeight: number = 800;
  const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;

  let renderer: Renderer = new Renderer(screenWidth, screenHeight, RenderMode.WIREFRAMESFILL, canvas);
  let cam: Camera = new Camera(new Vec3(0, 0, -20), new Vec3(0, 1, 0), new Vec3(0, 0, 1), new Vec3(1, 0, 0));
  let light: Light = new Light(new Vec3(0, 0, 1));
  let scene: Scene = new Scene(light);
  let camControls : BrowserFreeCameraControls = new BrowserFreeCameraControls(cam);


  //const img = await Texture.load("penguin.jpg");
  const img = await Texture.load("grass.png");
  // const img = await Texture.load("kirby.png");



  const mesh: Model = await Model.loadFromObjectFile('grass.obj', true);
  //const mesh : Model = Geometry.cube();
  mesh.texture = img;

  scene.addModel(mesh);

  mesh.translation = new Vec3(0, 0, 0);

  let mouseControls : BrowserMouseControls = new BrowserMouseControls(mesh, cam, canvas);

  function animate(timeElapsed: number) {
    clearScreen();
    renderer.render(scene, cam);
  }

  console.log(img);

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




