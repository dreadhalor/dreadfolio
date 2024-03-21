import { Vector } from './vector';
import { Matrix } from './matrix';
import P5 from 'p5';

export class Camera {
  private position: Vector;
  private velocity: Vector;
  private acceleration: Vector;
  private mass: number;
  private damping: number;
  private target: Vector;
  private up: Vector;
  private fov: number;
  private aspectRatio: number;
  private near: number;
  private far: number;
  private viewMatrix: Matrix;
  private projectionMatrix: Matrix;
  private p5: P5;
  private isJumping: boolean;

  constructor(
    p5: P5,
    position: Vector,
    target: Vector,
    up: Vector,
    fov: number,
    aspectRatio: number,
    near: number,
    far: number,
    mass: number = 1,
    damping: number = 1,
  ) {
    this.p5 = p5;
    this.position = position;
    this.velocity = new Vector(0, 0, 0);
    this.acceleration = new Vector(0, 0, 0);
    this.mass = mass;
    this.damping = damping;
    this.target = target;
    this.up = up;
    this.fov = fov;
    this.aspectRatio = aspectRatio;
    this.near = near;
    this.far = far;
    this.viewMatrix = new Matrix();
    this.projectionMatrix = new Matrix();
    this.isJumping = false;
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

  getMass(): number {
    return this.mass;
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

  moveForward(force: number): void {
    // Move in the direction of the target, but ignore the y-axis
    const direction = this.target.subtract(this.position).normalize();
    direction.y = 0;
    this.applyForce(direction.scale(force));
  }

  moveBackward(force: number): void {
    this.moveForward(-force);
  }

  moveLeft(force: number): void {
    // Move in the direction of the target's right vector
    const direction = this.target.subtract(this.position).normalize();
    const right = direction.cross(this.up).normalize();
    this.applyForce(right.scale(-force));
  }

  moveRight(force: number): void {
    this.moveLeft(-force);
  }

  moveUp(force: number): void {
    this.applyForce(this.up.scale(force));
  }
  jump() {
    const jumpHeight = 2; // Desired jump height in units
    const jumpDuration = 0.8; // Desired jump duration in seconds

    // Calculate the initial jump velocity based on the desired jump height and duration
    const jumpVelocity = (2 * jumpHeight) / jumpDuration;

    this.acceleration.y = 0;
    this.velocity.y = jumpVelocity;
    this.isJumping = true;
  }

  moveDown(force: number): void {
    // // Move in the direction of the up vector only
    this.applyForce(this.up.scale(-force));
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

  applyForce(force: Vector): void {
    const acceleration = force.scale(1 / this.mass);
    this.acceleration = this.acceleration.add(acceleration);
  }

  update(deltaTime: number): void {
    const groundFriction = 0.9;
    const airFriction = 0.92;
    const moveForce = 30;

    if (this.p5.keyIsDown(87)) {
      // W key
      this.moveForward(moveForce);
    }
    if (this.p5.keyIsDown(83)) {
      // S key
      this.moveBackward(moveForce);
    }
    if (this.p5.keyIsDown(65)) {
      // A key
      this.moveLeft(moveForce);
    }
    if (this.p5.keyIsDown(68)) {
      // D key
      this.moveRight(moveForce);
    }
    if (this.p5.keyIsDown(32) && !this.isJumping && this.position.y === 0) {
      // Space key
      this.jump();
    }
    if (this.p5.keyIsDown(16)) {
      // Shift key
      this.moveDown(moveForce);
    }

    this.velocity = this.velocity.add(this.acceleration.scale(deltaTime));
    this.position = this.position.add(this.velocity.scale(deltaTime));
    this.target = this.target.add(this.velocity.scale(deltaTime));
    if (this.position.y < 0) {
      const diff = 0 - this.position.y;
      this.position.y = 0;
      this.target.y += diff;
      this.isJumping = false;
    }

    this.velocity = this.velocity.scale(this.damping);
    // apply friction if the camera is on the ground
    if (this.position.y === 0) {
      this.velocity.x *= groundFriction;
      this.velocity.z *= groundFriction;
      this.velocity.y = 0;
      this.acceleration.y = 0;
    } else {
      this.velocity.x *= airFriction;
      this.velocity.z *= airFriction;
    }
    this.acceleration = new Vector(0, 0, 0);

    this.updateViewMatrix();
  }
}
