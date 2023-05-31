import * as THREE from "three";
import { Command, DataProvider } from "./index";

interface CubeAttributes {
    position: [number, number, number];
    size: number;
    color: string;
  }
  
export class CubeDataProvider implements DataProvider<CubeAttributes> {
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
  
  export class AddCubeCommand implements Command {
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
  