import { Mesh } from './mesh';
import { Matrix } from './matrix';
import { Vector } from './vector';
import { Scene } from './scene';
import { Camera } from './camera';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private viewMatrix: Matrix;
  private projectionMatrix: Matrix;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d')!;
    this.viewMatrix = new Matrix();
    this.projectionMatrix = new Matrix();
  }

  clear(): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  setViewMatrix(viewMatrix: Matrix): void {
    this.viewMatrix = viewMatrix;
  }

  setProjectionMatrix(projectionMatrix: Matrix): void {
    this.projectionMatrix = projectionMatrix;
  }

  render(scene: Scene, camera: Camera): void {
    const meshes = scene.getMeshes();

    // Calculate the view frustum planes
    const frustumPlanes = this.calculateFrustumPlanes(camera);

    // Render each mesh in the scene
    for (const mesh of meshes) {
      // Check if the mesh is within the view frustum
      if (this.isMeshInFrustum(mesh, frustumPlanes)) {
        // Perform rendering for the mesh
        this.renderMesh(mesh);
      }
    }
  }

  renderMesh(mesh: Mesh): void {
    const vertices = mesh.getVertices();
    const indices = mesh.getIndices();
    const color = mesh.getColor();
    const texture = mesh.getTexture(); // Transform vertices from model space to clip space
    const transformedVertices = vertices.map((vertex) => {
      const vector = new Vector(vertex[0]!, vertex[1]!, vertex[2]!);
      const transformedVector = this.projectionMatrix.multiplyVector(
        this.viewMatrix.multiplyVector(vector),
      );
      return [transformedVector.x, transformedVector.y, transformedVector.z];
    }); // Convert clip space coordinates to canvas space
    const canvasVertices = transformedVertices.map((vertex) => {
      const x = (vertex[0]! + 1) * (this.canvas.width / 2);
      const y = (1 - vertex[1]!) * (this.canvas.height / 2);
      return [x, y];
    }); // Render the mesh
    this.context.beginPath();
    for (let i = 0; i < indices.length; i += 3) {
      const i1 = indices[i];
      const i2 = indices[i + 1];
      const i3 = indices[i + 2];
      const v1 = canvasVertices[i1!]!;
      const v2 = canvasVertices[i2!]!;
      const v3 = canvasVertices[i3!]!;
      this.context.moveTo(v1[0]!, v1[1]!);
      this.context.lineTo(v2[0]!, v2[1]!);
      this.context.lineTo(v3[0]!, v3[1]!);
      this.context.lineTo(v1[0]!, v1[1]!);
    }
    if (texture) {
      // Render with texture (not implemented in this example)
      // You'll need to handle texture mapping and rendering
    } else {
      this.context.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
      this.context.fill();
    }
    this.context.strokeStyle = 'black';
    this.context.stroke();
  }

  private calculateFrustumPlanes(camera: Camera): Plane[] {
    const viewMatrix = camera.getViewMatrix();
    const projectionMatrix = camera.getProjectionMatrix();
    const viewProjectionMatrix = projectionMatrix.multiply(viewMatrix);

    const planes: Plane[] = [];

    // Extract the frustum planes from the view-projection matrix
    // Left plane
    planes.push(
      new Plane(
        viewProjectionMatrix.get(3, 0) + viewProjectionMatrix.get(0, 0),
        viewProjectionMatrix.get(3, 1) + viewProjectionMatrix.get(0, 1),
        viewProjectionMatrix.get(3, 2) + viewProjectionMatrix.get(0, 2),
        viewProjectionMatrix.get(3, 3) + viewProjectionMatrix.get(0, 3),
      ),
    );

    // Right plane
    planes.push(
      new Plane(
        viewProjectionMatrix.get(3, 0) - viewProjectionMatrix.get(0, 0),
        viewProjectionMatrix.get(3, 1) - viewProjectionMatrix.get(0, 1),
        viewProjectionMatrix.get(3, 2) - viewProjectionMatrix.get(0, 2),
        viewProjectionMatrix.get(3, 3) - viewProjectionMatrix.get(0, 3),
      ),
    );

    // Top plane
    planes.push(
      new Plane(
        viewProjectionMatrix.get(3, 0) - viewProjectionMatrix.get(1, 0),
        viewProjectionMatrix.get(3, 1) - viewProjectionMatrix.get(1, 1),
        viewProjectionMatrix.get(3, 2) - viewProjectionMatrix.get(1, 2),
        viewProjectionMatrix.get(3, 3) - viewProjectionMatrix.get(1, 3),
      ),
    );

    // Bottom plane
    planes.push(
      new Plane(
        viewProjectionMatrix.get(3, 0) + viewProjectionMatrix.get(1, 0),
        viewProjectionMatrix.get(3, 1) + viewProjectionMatrix.get(1, 1),
        viewProjectionMatrix.get(3, 2) + viewProjectionMatrix.get(1, 2),
        viewProjectionMatrix.get(3, 3) + viewProjectionMatrix.get(1, 3),
      ),
    );

    // Near plane
    planes.push(
      new Plane(
        viewProjectionMatrix.get(3, 0) + viewProjectionMatrix.get(2, 0),
        viewProjectionMatrix.get(3, 1) + viewProjectionMatrix.get(2, 1),
        viewProjectionMatrix.get(3, 2) + viewProjectionMatrix.get(2, 2),
        viewProjectionMatrix.get(3, 3) + viewProjectionMatrix.get(2, 3),
      ),
    );

    // Far plane
    planes.push(
      new Plane(
        viewProjectionMatrix.get(3, 0) - viewProjectionMatrix.get(2, 0),
        viewProjectionMatrix.get(3, 1) - viewProjectionMatrix.get(2, 1),
        viewProjectionMatrix.get(3, 2) - viewProjectionMatrix.get(2, 2),
        viewProjectionMatrix.get(3, 3) - viewProjectionMatrix.get(2, 3),
      ),
    );

    return planes;
  }

  private isMeshInFrustum(mesh: Mesh, frustumPlanes: Plane[]): boolean {
    const vertices = mesh.getVertices();

    // Check if any vertex of the mesh is inside the frustum
    for (const vertex of vertices) {
      const position = new Vector(vertex[0]!, vertex[1]!, vertex[2]!);

      let inside = true;
      for (const plane of frustumPlanes) {
        if (plane.distanceToPoint(position) < 0) {
          inside = false;
          break;
        }
      }

      if (inside) {
        return true;
      }
    }

    return false;
  }
}

class Plane {
  constructor(
    public a: number,
    public b: number,
    public c: number,
    public d: number,
  ) {}

  distanceToPoint(point: Vector): number {
    return this.a * point.x + this.b * point.y + this.c * point.z + this.d;
  }
}
