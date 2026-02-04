import * as THREE from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js'
import { VRMLoaderPlugin, VRM } from '@pixiv/three-vrm'
import { createVRMAnimationClip, VRMAnimationLoaderPlugin } from '@pixiv/three-vrm-animation'

// Extended mesh type that can hold VRM data
interface VRMMesh extends THREE.Mesh {
  vrm?: VRM
}

// Animation file paths for VRM models
const VRM_ANIMATIONS = {
  Idle: '/assets/animations/idle.glb',
  Walk: '/assets/animations/walk.glb',
  Run: '/assets/animations/run.glb',
  Jump: '/assets/animations/jump.glb',
  Fall: '/assets/animations/fall.glb',
}

export class LoadManager {
  private static instance: LoadManager
  private cache = new Map<string, THREE.Mesh>()
  private vrmCache = new Map<string, VRM>()
  private animationCache = new Map<string, THREE.AnimationClip>()
  private rawAnimationCache = new Map<string, any>() // Store raw animation data for VRM conversion
  dracoLoader = new DRACOLoader()
  gltfLoader = new GLTFLoader()
  animLoader = new GLTFLoader() // Separate loader for animations with VRM animation plugin

  private constructor() {
    this.dracoLoader.setDecoderPath('/draco/')
    this.gltfLoader.setDRACOLoader(this.dracoLoader)
    // Register VRM loader plugin
    this.gltfLoader.register((parser) => new VRMLoaderPlugin(parser))

    // Animation loader with VRM animation plugin
    this.animLoader.setDRACOLoader(this.dracoLoader)
    this.animLoader.register((parser) => new VRMAnimationLoaderPlugin(parser))
  }

  static getInstance(): LoadManager {
    if (!LoadManager.instance) {
      LoadManager.instance = new LoadManager()
    }
    return LoadManager.instance
  }

  // Load a single animation file and return the raw GLTF for VRM conversion
  private async loadAnimationGLTF(name: string, path: string): Promise<any | null> {
    if (this.rawAnimationCache.has(name)) {
      return this.rawAnimationCache.get(name)
    }

    return new Promise((resolve) => {
      this.animLoader.load(
        path,
        (gltf) => {
          if (gltf.animations && gltf.animations.length > 0) {
            this.rawAnimationCache.set(name, gltf)
            console.log(`Loaded animation GLTF: ${name}`)
            resolve(gltf)
          } else {
            console.warn(`No animations found in ${path}`)
            resolve(null)
          }
        },
        undefined,
        (error) => {
          console.error(`Failed to load animation ${name}:`, error)
          resolve(null)
        }
      )
    })
  }

  // Load all VRM animations and convert them for a specific VRM
  private async loadVRMAnimations(vrm: VRM): Promise<THREE.AnimationClip[]> {
    const animations: THREE.AnimationClip[] = []

    for (const [name, path] of Object.entries(VRM_ANIMATIONS)) {
      const gltf = await this.loadAnimationGLTF(name, path)
      if (gltf && gltf.userData.vrmAnimations) {
        // Use VRM animation conversion
        const vrmAnimation = gltf.userData.vrmAnimations[0]
        if (vrmAnimation) {
          const clip = createVRMAnimationClip(vrmAnimation, vrm)
          clip.name = name
          animations.push(clip)
          console.log(`Converted VRM animation: ${name}`)
        }
      } else if (gltf && gltf.animations && gltf.animations.length > 0) {
        // Fallback: use raw animation (may not work well with VRM)
        const clip = gltf.animations[0].clone()
        clip.name = name
        animations.push(clip)
        console.log(`Using raw animation (fallback): ${name}`)
      }
    }

    return animations
  }

  static async glTFLoad(path: string): Promise<THREE.Mesh> {
    const instance = LoadManager.getInstance()
    const isVRM = path.toLowerCase().endsWith('.vrm')

    // Check if the mesh is already in the cache
    if (instance.cache.has(path)) {
      const cachedMesh = instance.cache.get(path)!
      const clonedMesh = instance.cloneMesh(cachedMesh)
      return clonedMesh
    }

    // Load the model
    return new Promise((resolve, reject) => {
      instance.gltfLoader.load(
        path,
        async (gltf) => {
          // Check if this is a VRM model
          const vrm = (gltf.userData as { vrm?: VRM }).vrm

          if (vrm && isVRM) {
            // VRM model loaded
            console.log('VRM model loaded:', vrm)

            // Rotate the VRM model to face forward (VRM models face +Z by default)
            vrm.scene.rotation.y = Math.PI

            // Load external animations for VRM, converted for this specific VRM
            const animations = await instance.loadVRMAnimations(vrm)
            console.log(`Loaded ${animations.length} animations for VRM`)

            // Create mesh wrapper for VRM with loaded animations
            const mesh = instance.extractVRMMesh(vrm, animations)
            if (mesh) {
              instance.cache.set(path, mesh)
              instance.vrmCache.set(path, vrm)
              const clonedMesh = instance.cloneMesh(mesh)
              resolve(clonedMesh)
            } else {
              reject(new Error('No mesh found in VRM model'))
            }
          } else {
            // Regular GLTF model
            const mesh = instance.extractMesh(gltf)
            if (mesh) {
              instance.cache.set(path, mesh)
              const clonedMesh = instance.cloneMesh(mesh)
              resolve(clonedMesh)
            } else {
              reject(new Error('No mesh found in the GLTF model'))
            }
          }
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        (error) => {
          console.error('An error happened', error)
          reject(error)
        }
      )
    })
  }

  // Get VRM instance for a loaded model (for advanced VRM features)
  static getVRM(path: string): VRM | undefined {
    const instance = LoadManager.getInstance()
    return instance.vrmCache.get(path)
  }

  private cloneMesh(mesh: THREE.Mesh): THREE.Mesh {
    const clonedMesh = SkeletonUtils.clone(mesh)
    clonedMesh.animations = mesh.animations.map(clip => clip.clone())
    // Clone materials to avoid sharing the same material instance
    clonedMesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = child.material
        if (Array.isArray(material)) {
          child.material = material.map((m) => m.clone())
        } else {
          child.material = material.clone()
        }
      }
    })
    return clonedMesh as THREE.Mesh
  }

  private extractMesh(gltf: any): THREE.Mesh | null {
    let mesh: THREE.Mesh = new THREE.Mesh()
    mesh.add(gltf.scene)
    mesh.animations = gltf.animations
    return mesh
  }

  private extractVRMMesh(vrm: VRM, animations: THREE.AnimationClip[]): THREE.Mesh | null {
    let mesh: VRMMesh = new THREE.Mesh()
    mesh.add(vrm.scene)
    mesh.animations = animations
    mesh.vrm = vrm
    return mesh
  }
}
