import * as THREE from "three";
import { AddCubeCommand, CubeDataProvider } from "./cube";
import { AddTorusCommand } from "./torus";

export interface DataProvider<T> {
  fetchData(): Promise<T>;
}
export interface Command {
  execute(scene: THREE.Scene): void;
  update: () => void;
  undo(scene: THREE.Scene): void;
  redo(scene: THREE.Scene): void;
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
    async setup(){
        await this.executeCommands();
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

await sceneController.setup();
sceneController.animate();

// Stop the animation loop (if needed)
// sceneController.stopAnimation();
