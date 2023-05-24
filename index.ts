import * as THREE from "three";

interface DataProvider<T> {
  fetchData(): Promise<T>;
}
interface Command {
  execute(scene: THREE.Scene): void;
  update: () => void;
  undo(scene: THREE.Scene): void;
  redo(scene: THREE.Scene): void;
}

interface CubeAttributes {
  position: [number, number, number];
  size: number;
  color: string;
}

class CubeDataProvider implements DataProvider<CubeAttributes> {
  async fetchData(): Promise<CubeAttributes> {
    // Simulating data retrieval delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    const cubeData: CubeAttributes = {
      position: [0, 0, -5],
      size: 2,
      color: 'blue'
    };
    return cubeData;
  }
}
class AddCubeCommand implements Command {
  private cube: THREE.Mesh | null = null;
  private cubeDataProvider: DataProvider<CubeAttributes>;

  constructor(cubeDataProvider: DataProvider<CubeAttributes>) {
    this.cubeDataProvider = cubeDataProvider;
  }

  async execute(scene: THREE.Scene): Promise<void> {
    await this.setup(scene);
  }
  async setup(scene: THREE.Scene) {
    const cubeData = await this.cubeDataProvider.fetchData();
    this.create(cubeData);
    scene.add(this.cube!);
    
  }
  create(cubeData: CubeAttributes){
    const { position: [x, y, z], size, color} = cubeData
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshBasicMaterial({ color });
    this.cube = new THREE.Mesh(geometry, material);
    this.cube.position.copy(new THREE.Vector3(x, y, z));
    this.cube.rotation.x = 0;
    this.cube.rotation.y = 0;
    this.cube.rotation.z = 0;
  }
  update(): void {
    const rotationSpeed = 0.01;
    const updateRotation = () => {
      if(this.cube){
        this.cube.rotation.x += rotationSpeed;
        this.cube.rotation.y += rotationSpeed;
        this.cube.rotation.z += rotationSpeed;
      }
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

class AddTorusCommand implements Command {
    private torus: THREE.Mesh | null = null;
    private position: THREE.Vector3 | null = null;
  
    constructor({ position }: { position: THREE.Vector3 }) {
      this.position = position;
    }
  
    async execute(scene: THREE.Scene): Promise<void> {
      await this.setup(scene);
    }
  
    async setup(scene: THREE.Scene) {
      const geometry = new THREE.TorusGeometry(0.6, 0.2, 16, 100);
      const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      this.torus = new THREE.Mesh(geometry, material);
      this.torus.position.copy(this.position!);
      this.torus.rotation.x = 0;
      this.torus.rotation.y = 0;
      this.torus.rotation.z = 0;
      scene.add(this.torus!);
    }
  
    update(): void {
      const rotationSpeed = 0.01;
      const updateRotation = () => {
        this.torus!.rotation.x += rotationSpeed;
        this.torus!.rotation.y += rotationSpeed;
        this.torus!.rotation.z += rotationSpeed;
      };
      updateRotation();
    }
  
    undo(scene: THREE.Scene): void {
      if (this.torus) {
        scene.remove(this.torus);
        this.torus = null;
      }
    }
  
    redo(scene: THREE.Scene): void {
      if (this.torus) {
        scene.add(this.torus);
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


class SceneController {
    private scene: THREE.Scene;
    private renderer: THREE.WebGLRenderer;
    private camera: THREE.PerspectiveCamera;
    private commands: Command[];
    private animationRequestId: number | null;
  
    constructor() {
      this.scene = new THREE.Scene();
      this.renderer = new THREE.WebGLRenderer();
      this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      this.commands = [];
      this.animationRequestId = null;
  
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      document.body.appendChild(this.renderer.domElement);
  
      this.setupCamera();
      this.setupCanvas();
    }
  
    private setupCamera() {
      this.camera.position.z = 5;
    }
  
    private setupCanvas() {
      window.addEventListener('resize', () => {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
      });
    }
  
    addCommand(command: Command) {
      this.commands.push(command);
    }
  
    async executeCommands(): Promise<void> {
        const executePromises = this.commands.map((command) => command.execute(this.scene));
        await Promise.all(executePromises);
    }
    
    clear() {
        this.renderer.clear();
    }
    setup(){
        this.executeCommands();
    }  
    animate() {
        this.animationRequestId = requestAnimationFrame(() => this.animate());
        this.clear();
        this.updateObjects();
        this.renderer.render(this.scene, this.camera);
    }
    stopAnimation() {
      if (this.animationRequestId) {
        cancelAnimationFrame(this.animationRequestId);
        this.animationRequestId = null;
      }
    }
    updateObjects() {
        for (const command of this.commands) {
          command.update();
        }
      }
  }
  
  const sceneController = new SceneController();

// Add commands to the scene controller
const addCubeCommand = new AddCubeCommand(new CubeDataProvider());
const addTorusCommand = new AddTorusCommand({ position: new THREE.Vector3(2, 0, -5) });

sceneController.addCommand(addCubeCommand);
sceneController.addCommand(addTorusCommand);

sceneController.setup();
sceneController.animate();

// Stop the animation loop (if needed)
// sceneController.stopAnimation();
