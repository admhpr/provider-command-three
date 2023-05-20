import * as THREE from "three";

interface Command {
  execute(scene: THREE.Scene): void;
  undo(scene: THREE.Scene): void;
  redo(scene: THREE.Scene): void;
}

class AddCubeCommand implements Command {
  private cube: THREE.Mesh | null = null;
  private position: THREE.Vector3 | null = null;

  constructor({ position }: { position: THREE.Vector3 }) {
    this.position = position;
  }

  async execute(scene: THREE.Scene): Promise<void> {
    await this.setup(scene);
    this.update();
  }
  async setup(scene: THREE.Scene) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.cube = new THREE.Mesh(geometry, material);
    this.cube.position.copy(this.position!);
    this.cube.rotation.x = 0;
    this.cube.rotation.y = 0;
    this.cube.rotation.z = 0;
    scene.add(this.cube!);
  }
  update(): void {
    const rotationSpeed = 0.01;
    const updateRotation = () => {
      this.cube!.rotation.x += rotationSpeed;
      this.cube!.rotation.y += rotationSpeed;
      this.cube!.rotation.z += rotationSpeed;
     requestAnimationFrame(updateRotation);
    };
    updateRotation();
  }
  undo(scene: THREE.Scene): void {
    if (this.cube) {
      scene.remove(this.cube);
      this.cube = null;
    }
  }

  redo(scene: THREE.Scene): void {
    if (this.cube) {
      scene.add(this.cube);
    }
  }
}

class CommandInvoker {
  private commandStack: Command[] = [];
  private undoStack: Command[] = [];

  executeCommand(command: Command, scene: THREE.Scene): void {
    command.execute(scene);
    this.commandStack.push(command);
    this.undoStack = [];
  }

  undo(scene: THREE.Scene): void {
    const lastCommand = this.commandStack.pop();
    if (lastCommand) {
      lastCommand.undo(scene);
      this.undoStack.push(lastCommand);
    }
  }

  redo(scene: THREE.Scene): void {
    const lastUndoneCommand = this.undoStack.pop();
    if (lastUndoneCommand) {
      lastUndoneCommand.redo(scene);
      this.commandStack.push(lastUndoneCommand);
    }
  }
}
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const commandInvoker = new CommandInvoker();

const addCubeCommand = new AddCubeCommand({
  position: new THREE.Vector3(0, 0, -5),
});
commandInvoker.executeCommand(addCubeCommand, scene);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
