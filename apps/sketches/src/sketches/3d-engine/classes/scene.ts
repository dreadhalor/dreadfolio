import { Camera } from './camera';
import { Mesh } from './mesh';
import { Renderer } from './renderer';
import { Vector } from './vector';
import P5 from 'p5';

export class Scene {
  private meshes: Mesh[];
  private camera: Camera;

  constructor(p5: P5) {
    this.meshes = [];
    this.camera = new Camera(
      p5,
      new Vector(0, 0, 0),
      new Vector(0, 0, -1),
      new Vector(0, 1, 0),
      45,
      1.0,
      0.1,
      100,
    );
  }

  addMesh(mesh: Mesh): void {
    this.meshes.push(mesh);
  }

  removeMesh(mesh: Mesh): void {
    const index = this.meshes.indexOf(mesh);
    if (index !== -1) {
      this.meshes.splice(index, 1);
    }
  }

  getMeshes(): Mesh[] {
    return this.meshes;
  }

  getCamera(): Camera {
    return this.camera;
  }

  setCamera(camera: Camera): void {
    this.camera = camera;
  }

  update(deltaTime: number): void {
    const gravity = new Vector(0, -9.8, 0);
    this.camera.applyForce(gravity);

    this.camera.update(deltaTime);
  }

  render(renderer: Renderer): void {
    // Render the scene using the provided renderer
    renderer.clear();

    // Set up the camera
    renderer.setViewMatrix(this.camera.getViewMatrix());
    renderer.setProjectionMatrix(this.camera.getProjectionMatrix());

    // Render each mesh in the scene
    renderer.render(this, this.camera);
  }
}
