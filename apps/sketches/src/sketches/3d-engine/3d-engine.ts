import P5 from 'p5';
import { Camera } from './classes/camera';
import { Scene } from './classes/scene';
import { Renderer } from './classes/renderer';
import { Vector } from './classes/vector';
import { Matrix } from './classes/matrix';
import { Cube } from './classes/meshes/cube';

export const ThreeDEngine = (p5: P5) => {
  let scene: Scene;
  let renderer: Renderer;
  let camera: Camera;

  p5.setup = () => {
    p5.frameRate(60);
    const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight);
    scene = new Scene(p5);
    renderer = new Renderer(canvas.elt as HTMLCanvasElement);

    // Create a camera
    camera = new Camera(
      p5,
      new Vector(0, 0, 10),
      new Vector(0, 0, 0),
      new Vector(0, 1, 0),
      45,
      p5.width / p5.height,
      0.1,
      100,
    );
    scene.setCamera(camera);

    // Create multiple cubes and add them to the scene
    const cube1 = new Cube(2, [255, 0, 0]);
    const cube2 = new Cube(1.5, [0, 255, 0]);
    const cube3 = new Cube(1, [0, 0, 255]);

    cube1.transform(new Matrix().setTranslation(0, 0, 0));
    cube2.transform(new Matrix().setTranslation(3, 0, 0));
    cube3.transform(new Matrix().setTranslation(-3, 0, 0));

    scene.addMesh(cube1);
    scene.addMesh(cube2);
    scene.addMesh(cube3);

    // create a ring of cubes around the camera
    const numCubes = 25;
    const radius = 20;
    for (let i = 0; i < numCubes; i++) {
      const angle = (i / numCubes) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const cube = new Cube(0.5, [255, 255, 255]);
      cube.transform(new Matrix().setTranslation(x, 0, z));
      scene.addMesh(cube);
    }
  };

  p5.draw = () => {
    // Update the scene
    const deltaTime = p5.deltaTime / 1000; // Convert milliseconds to seconds
    scene.update(deltaTime);
    // handleKeyboardInput(deltaTime);

    // Render the scene
    scene.render(renderer);
  };

  p5.mouseDragged = () => {
    const sensitivity = 0.001; // Adjust the sensitivity as desired
    const deltaX = p5.mouseX - p5.pmouseX;
    const deltaY = p5.mouseY - p5.pmouseY;

    if (!camera) return;

    camera.rotateAroundAxis(new Vector(0, 1, 0), deltaX * sensitivity);
    camera.rotateAroundAxis(camera.getRightVector(), -deltaY * sensitivity);
  };

  const handleKeyboardInput = (deltaTime: number) => {
    // Move the camera based on keyboard input
    const moveSpeed = 10; // Adjust the movement speed as desired
    if (p5.keyIsDown(87)) {
      // W key
      camera.moveForward(moveSpeed * deltaTime);
    }
    if (p5.keyIsDown(83)) {
      // S key
      camera.moveBackward(moveSpeed * deltaTime);
    }
    if (p5.keyIsDown(65)) {
      // A key
      camera.moveLeft(moveSpeed * deltaTime);
    }
    if (p5.keyIsDown(68)) {
      // D key
      camera.moveRight(moveSpeed * deltaTime);
    }
    if (p5.keyIsDown(32)) {
      // Space key
      camera.moveUp(moveSpeed * deltaTime);
    }
    if (p5.keyIsDown(16)) {
      // Shift key
      camera.moveDown(moveSpeed * deltaTime);
    }
  };
};
