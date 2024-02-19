import P5 from 'p5';

export type Vehicle = {
  state: 'entering' | 'default' | 'exiting';
  alpha: number;
  pos: P5.Vector;
  home: P5.Vector | null;
  target: P5.Vector | null;
  vel: P5.Vector;
  acc: P5.Vector;
  radius: number;
  maxspeed: number;
  maxforce: number;
};

export const createVehicle = (p5: P5, x: number, y: number): Vehicle => {
  return {
    state: 'entering',
    alpha: 0,
    pos: p5.createVector(p5.random(p5.width), p5.random(p5.height)),
    target: p5.createVector(x, y),
    home: p5.createVector(x, y),
    vel: p5.createVector(),
    acc: p5.createVector(),
    radius: 2,
    maxspeed: 10,
    maxforce: 1,
  };
};

export const tick = (p5: P5, vehicle: Vehicle) => {
  if (vehicle.target !== null && vehicle.state !== 'exiting') {
    const arrive = arriveForce(vehicle, vehicle.target, p5);
    arrive.mult(1);
    applyForce(vehicle, arrive);
  }

  const mouse = p5.createVector(p5.mouseX, p5.mouseY);
  if (!p5.mouseIsPressed) {
    const flee = fleeForce(vehicle, mouse);
    flee.mult(10);
    applyForce(vehicle, flee);
  }
};

export const applyForce = (vehicle: Vehicle, force: P5.Vector) => {
  vehicle.acc.add(force);
};

export const update = (vehicle: Vehicle) => {
  vehicle.pos.add(vehicle.vel);
  vehicle.vel.add(vehicle.acc);
  vehicle.acc.mult(0);
};

export const arriveForce = (vehicle: Vehicle, target: P5.Vector, p5: P5) => {
  const desired = P5.Vector.sub(target, vehicle.pos);
  const d = desired.mag();
  let speed = vehicle.maxspeed;
  if (d < 100) {
    speed = p5.map(d, 0, 100, 0, vehicle.maxspeed);
  }
  desired.setMag(speed);
  const steer = P5.Vector.sub(desired, vehicle.vel);
  steer.limit(vehicle.maxforce);
  return steer;
};

export const fleeForce = (vehicle: Vehicle, target: P5.Vector) => {
  const desired = P5.Vector.sub(target, vehicle.pos);
  const d = desired.mag();
  if (d < 50) {
    desired.setMag(vehicle.maxspeed);
    desired.mult(-1);
    const steer = P5.Vector.sub(desired, vehicle.vel);
    steer.limit(vehicle.maxforce);
    return steer;
  } else {
    return vehicle.vel.copy().mult(0);
  }
};

export const show = (p5: P5, vehicle: Vehicle) => {
  if (vehicle.state === 'entering') {
    // fade in
    vehicle.alpha += 0.05;
  }
  if (vehicle.state === 'exiting') {
    // fade out
    vehicle.alpha -= 0.05;
  }
  vehicle.alpha = p5.constrain(vehicle.alpha, 0, 1);
  p5.stroke(255, 255, 255, 255 * vehicle.alpha);
  p5.strokeWeight(vehicle.radius);
  p5.point(vehicle.pos.x, vehicle.pos.y);
};
