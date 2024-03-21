import { Camera } from './camera';
import { Mesh } from './mesh';
import { Renderer } from './renderer';
import { Vector } from './vector';

export class Scene {
  private meshes: Mesh[];
  private camera: Camera;

  constructor() {
    this.meshes = [];
    this.camera = new Camera(
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
    // give the camera gravity physics
    const position = this.camera.getPosition();
    const velocity = this.camera.getVelocity();
    const gravity = new Vector(0, -9.8, 0);
    const newVelocity = velocity.add(gravity.scale(deltaTime));
    const newPosition = position.add(newVelocity.scale(deltaTime));
    if (newPosition.y < 0) {
      newPosition.y = 0;
      newVelocity.y = 0;
    }
    const target = this.camera.getTarget();
    const newTarget = target.add(newPosition.subtract(position));
    this.camera.setTarget(newTarget);
    this.camera.setPosition(newPosition);
    this.camera.setVelocity(newVelocity);
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
