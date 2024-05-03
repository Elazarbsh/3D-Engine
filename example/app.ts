import { Vec3 } from "../src/vec3.js";
import { Model } from "../src/model.js";
import { Camera } from "../src/camera.js";
import { Light } from "../src/light.js";
import { Renderer } from "../src/web-renderer.js";
import { Scene } from "../src/scene.js";
import { RGBA } from "../src/rgba.js";
import { Material } from "../src/material.js";
import { TextureLoader } from "../src/loaders/texture-loader.js";
import { ModelLoader } from "../src/loaders/model-loader.js";
import { Geometry } from "../src/geometry.js";
import { TransformControls } from "../src/controls/transform-controls.js";

(async () => {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const renderer: Renderer = new Renderer(canvas);

  const cam: Camera = new Camera();
  cam.position = new Vec3(0, 0, -5);

  const light: Light = new Light();
  light.direction = new Vec3(0, 0, 1);
  light.isEnabled = true;

  const scene: Scene = new Scene(light);
  renderer.backgroundColor = new RGBA(10, 200, 100);

  const material = new Material();
  material.color = new RGBA(200, 50, 200);
  material.wireframe = true;

  let mesh: Model = Geometry.sphere(25);
  mesh.material = material;
  mesh.translation = new Vec3(0, 0, 0);

  scene.addModel(mesh);
  let controls = new TransformControls(mesh, cam, canvas);

  renderer.render(scene, cam);

  function animate(timeElapsed: number) {
    controls.update();
    renderer.render(scene, cam);
  }

  const intervalInMilliseconds = 30;
  let start = new Date();
  let end = new Date();
  let timeElapsed = 0;

  setInterval(() => {
    timeElapsed = ((end.getTime() - start.getTime()) / 1000);
    animate(timeElapsed);
    end = new Date();
  },
    intervalInMilliseconds);

  const modelFileInput = document.getElementById('modelFileInput') as HTMLInputElement;
  const textureFileInput = document.getElementById('textureFileInput') as HTMLInputElement;

  modelFileInput.addEventListener('change', async (event) => {
    if (event.target instanceof HTMLInputElement && event.target.files) {
      const file = event.target.files[0];
      if (file) {
        try {
          mesh = await ModelLoader.loadFromObjectFileAsync(file);
          mesh.material = material;
          controls.model = mesh;
          scene.clearModels();
          scene.addModel(mesh);
        } catch (error) {
          console.error("Error parsing the file:", error);
        }
      }
    }
  });

  textureFileInput.addEventListener('change', async (event) => {
    if (event.target instanceof HTMLInputElement && event.target.files) {
      const file = event.target.files[0];
      if (file) {
        try {
          let texture = await TextureLoader.loadTextureFromImageFile(file);
          let mat = new Material();
          mat.texture = texture;
          mesh.material = mat;
        } catch (error) {
          console.error("Error parsing the file:", error);
        }
      }
    }
  });

})();
