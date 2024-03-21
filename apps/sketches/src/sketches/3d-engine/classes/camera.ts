import { Vector } from './vector';
import { Matrix } from './matrix';

export class Camera {
  private position: Vector;
  private velocity: Vector;
  private target: Vector;
  private up: Vector;
  private fov: number;
  private aspectRatio: number;
  private near: number;
  private far: number;
  private viewMatrix: Matrix;
  private projectionMatrix: Matrix;

  constructor(
    position: Vector,
    target: Vector,
    up: Vector,
    fov: number,
    aspectRatio: number,
    near: number,
    far: number,
  ) {
    this.position = position;
    this.velocity = new Vector(0, 0, 0);
    this.target = target;
    this.up = up;
    this.fov = fov;
    this.aspectRatio = aspectRatio;
    this.near = near;
    this.far = far;
    this.viewMatrix = new Matrix();
    this.projectionMatrix = new Matrix();
    this.updateViewMatrix();
    this.updateProjectionMatrix();
  }

  getPosition(): Vector {
    return this.position;
  }

  setPosition(position: Vector): void {
    this.position = position;
    this.updateViewMatrix();
  }

  getVelocity(): Vector {
    return this.velocity;
  }

  setVelocity(velocity: Vector): void {
    this.velocity = velocity;
  }

  getTarget(): Vector {
    return this.target;
  }

  setTarget(target: Vector): void {
    this.target = target;
    this.updateViewMatrix();
  }

  getUp(): Vector {
    return this.up;
  }

  setUp(up: Vector): void {
    this.up = up;
    this.updateViewMatrix();
  }

  getFOV(): number {
    return this.fov;
  }

  setFOV(fov: number): void {
    this.fov = fov;
    this.updateProjectionMatrix();
  }

  getAspectRatio(): number {
    return this.aspectRatio;
  }

  setAspectRatio(aspectRatio: number): void {
    this.aspectRatio = aspectRatio;
    this.updateProjectionMatrix();
  }

  getNear(): number {
    return this.near;
  }

  setNear(near: number): void {
    this.near = near;
    this.updateProjectionMatrix();
  }

  getFar(): number {
    return this.far;
  }

  setFar(far: number): void {
    this.far = far;
    this.updateProjectionMatrix();
  }

  getViewMatrix(): Matrix {
    return this.viewMatrix;
  }

  getProjectionMatrix(): Matrix {
    return this.projectionMatrix;
  }

  updateViewMatrix(): void {
    const zAxis = this.position.subtract(this.target).normalize();
    const xAxis = this.up.cross(zAxis).normalize();
    const yAxis = zAxis.cross(xAxis);

    const translation = new Matrix();
    translation.set(0, 3, -this.position.x);
    translation.set(1, 3, -this.position.y);
    translation.set(2, 3, -this.position.z);

    const rotation = new Matrix();
    rotation.set(0, 0, xAxis.x);
    rotation.set(0, 1, xAxis.y);
    rotation.set(0, 2, xAxis.z);
    rotation.set(1, 0, yAxis.x);
    rotation.set(1, 1, yAxis.y);
    rotation.set(1, 2, yAxis.z);
    rotation.set(2, 0, zAxis.x);
    rotation.set(2, 1, zAxis.y);
    rotation.set(2, 2, zAxis.z);

    this.viewMatrix = rotation.multiply(translation);
  }

  updateProjectionMatrix(): void {
    const tanHalfFOV = Math.tan(this.fov / 2);
    const zRange = this.far - this.near;

    const projection = new Matrix();
    projection.set(0, 0, 1 / (tanHalfFOV * this.aspectRatio));
    projection.set(1, 1, 1 / tanHalfFOV);
    projection.set(2, 2, -(this.far + this.near) / zRange);
    projection.set(2, 3, (-2 * this.far * this.near) / zRange);
    projection.set(3, 2, -1);
    projection.set(3, 3, 0);

    this.projectionMatrix = projection;
  }

  moveForward(distance: number): void {
    // Move in the direction of the target, but ignore the y-axis
    const direction = this.target.subtract(this.position).normalize();
    direction.y = 0;
    this.position = this.position.add(direction.scale(distance));
    this.target = this.target.add(direction.scale(distance));
    this.updateViewMatrix();
  }

  moveBackward(distance: number): void {
    this.moveForward(-distance);
  }

  moveLeft(distance: number): void {
    // Move in the direction of the target's right vector
    const direction = this.target.subtract(this.position).normalize();
    const right = direction.cross(this.up).normalize();
    this.position = this.position.subtract(right.scale(distance));
    this.target = this.target.subtract(right.scale(distance));
    this.updateViewMatrix();
  }

  moveRight(distance: number): void {
    this.moveLeft(-distance);
  }

  moveUp(distance: number): void {
    // Move in the direction of the up vector only
    this.position = this.position.add(this.up.scale(distance));
    this.target = this.target.add(this.up.scale(distance));
    this.updateViewMatrix();
  }

  moveDown(distance: number): void {
    // Move in the direction of the up vector only
    this.position = this.position.add(this.up.scale(-distance));
    this.target = this.target.add(this.up.scale(-distance));
    // prevent the camera from going below the ground
    if (this.position.y < 0) {
      const diff = 0 - this.position.y;
      this.position = this.position.add(this.up.scale(diff));
      this.target = this.target.add(this.up.scale(diff));
    }
    this.updateViewMatrix();
  }

  rotateX(angle: number): void {
    const direction = this.target.subtract(this.position);
    const rotation = new Matrix();
    rotation.setRotationX(angle);
    const newDirection = rotation.multiplyVector(direction);
    this.target = this.position.add(newDirection);
    this.updateViewMatrix();
  }

  rotateY(angle: number): void {
    const direction = this.target.subtract(this.position);
    const rotation = new Matrix();
    rotation.setRotationY(angle);
    const newDirection = rotation.multiplyVector(direction);
    this.target = this.position.add(newDirection);
    this.updateViewMatrix();
  }

  rotateAroundAxis(axis: Vector, angle: number): void {
    const direction = this.target.subtract(this.position);
    const rotation = new Matrix();
    rotation.setRotationAroundAxis(axis, angle);
    const newDirection = rotation.multiplyVector(direction);
    this.target = this.position.add(newDirection);
    this.updateViewMatrix();
  }

  getRightVector(): Vector {
    const direction = this.target.subtract(this.position).normalize();
    return this.up.cross(direction).normalize();
  }
}
