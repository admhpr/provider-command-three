import * as THREE from "three";
import { Command } from "./index";

export class AddTorusCommand implements Command {
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