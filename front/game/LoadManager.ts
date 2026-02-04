import * as THREE from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js'
import { VRMLoaderPlugin, VRM, VRMHumanBoneName } from '@pixiv/three-vrm'
import { createVRMAnimationClip, VRMAnimationLoaderPlugin } from '@pixiv/three-vrm-animation'

// Extended mesh type that can hold VRM data
export interface VRMMesh extends THREE.Mesh {
  vrm?: VRM
}

// Result type for glTFLoad that includes VRM if present
export interface LoadResult {
  mesh: THREE.Mesh
  vrm: VRM | null
  animations: THREE.AnimationClip[]
}

// Combined animation file from hyperfy (contains all animations)
const HUMAN_BASE_ANIMATIONS_PATH = '/assets/animations/human-base-animations.glb'

// Map game states to animation names in the GLB file
const ANIMATION_STATE_MAP: Record<string, string> = {
  Idle: 'Idle_Loop',
  Walk: 'Walk_Loop',
  Run: 'Sprint_Loop',
  Jump: 'Jump_Loop',
  Fall: 'Jump_Loop',
}

// Blender DEF-* bone name to VRM humanoid bone name mapping
const blenderVRMRigMap: Record<string, VRMHumanBoneName> = {
  'DEF-hips': 'hips',
  'DEF-spine.001': 'spine',
  'DEF-spine.002': 'chest',
  'DEF-spine.003': 'upperChest',
  'DEF-neck': 'neck',
  'DEF-head': 'head',
  'DEF-shoulder.L': 'leftShoulder',
  'DEF-upper_arm.L': 'leftUpperArm',
  'DEF-forearm.L': 'leftLowerArm',
  'DEF-hand.L': 'leftHand',
  'DEF-thumb.01.L': 'leftThumbMetacarpal',
  'DEF-thumb.02.L': 'leftThumbProximal',
  'DEF-thumb.03.L': 'leftThumbDistal',
  'DEF-f_index.01.L': 'leftIndexProximal',
  'DEF-f_index.02.L': 'leftIndexIntermediate',
  'DEF-f_index.03.L': 'leftIndexDistal',
  'DEF-f_middle.01.L': 'leftMiddleProximal',
  'DEF-f_middle.02.L': 'leftMiddleIntermediate',
  'DEF-f_middle.03.L': 'leftMiddleDistal',
  'DEF-f_ring.01.L': 'leftRingProximal',
  'DEF-f_ring.02.L': 'leftRingIntermediate',
  'DEF-f_ring.03.L': 'leftRingDistal',
  'DEF-f_pinky.01.L': 'leftLittleProximal',
  'DEF-f_pinky.02.L': 'leftLittleIntermediate',
  'DEF-f_pinky.03.L': 'leftLittleDistal',
  'DEF-shoulder.R': 'rightShoulder',
  'DEF-upper_arm.R': 'rightUpperArm',
  'DEF-forearm.R': 'rightLowerArm',
  'DEF-hand.R': 'rightHand',
  'DEF-thumb.01.R': 'rightThumbMetacarpal',
  'DEF-thumb.02.R': 'rightThumbProximal',
  'DEF-thumb.03.R': 'rightThumbDistal',
  'DEF-f_index.01.R': 'rightIndexProximal',
  'DEF-f_index.02.R': 'rightIndexIntermediate',
  'DEF-f_index.03.R': 'rightIndexDistal',
  'DEF-f_middle.01.R': 'rightMiddleProximal',
  'DEF-f_middle.02.R': 'rightMiddleIntermediate',
  'DEF-f_middle.03.R': 'rightMiddleDistal',
  'DEF-f_ring.01.R': 'rightRingProximal',
  'DEF-f_ring.02.R': 'rightRingIntermediate',
  'DEF-f_ring.03.R': 'rightRingDistal',
  'DEF-f_pinky.01.R': 'rightLittleProximal',
  'DEF-f_pinky.02.R': 'rightLittleIntermediate',
  'DEF-f_pinky.03.R': 'rightLittleDistal',
  'DEF-thigh.L': 'leftUpperLeg',
  'DEF-shin.L': 'leftLowerLeg',
  'DEF-foot.L': 'leftFoot',
  'DEF-toe.L': 'leftToes',
  'DEF-thigh.R': 'rightUpperLeg',
  'DEF-shin.R': 'rightLowerLeg',
  'DEF-foot.R': 'rightFoot',
  'DEF-toe.R': 'rightToes',
}

// Reusable quaternion objects for retargeting
const q1 = new THREE.Quaternion()
const restRotationInverse = new THREE.Quaternion()
const parentRestWorldRotation = new THREE.Quaternion()

export class LoadManager {
  private static instance: LoadManager
  private cache = new Map<string, THREE.Mesh>()
  private rawAnimationCache = new Map<string, any>()
  dracoLoader = new DRACOLoader()
  gltfLoader = new GLTFLoader()
  animLoader = new GLTFLoader()

  private constructor() {
    this.dracoLoader.setDecoderPath('/draco/')
    this.gltfLoader.setDRACOLoader(this.dracoLoader)
    this.gltfLoader.register((parser) => new VRMLoaderPlugin(parser))

    this.animLoader.setDRACOLoader(this.dracoLoader)
    this.animLoader.register((parser) => new VRMAnimationLoaderPlugin(parser))
  }

  static getInstance(): LoadManager {
    if (!LoadManager.instance) {
      LoadManager.instance = new LoadManager()
    }
    return LoadManager.instance
  }

  private baseAnimationsGLTF: any = null

  private async loadBaseAnimationsGLTF(): Promise<any | null> {
    if (this.baseAnimationsGLTF) {
      return this.baseAnimationsGLTF
    }

    return new Promise((resolve) => {
      this.animLoader.load(
        HUMAN_BASE_ANIMATIONS_PATH,
        (gltf) => {
          if (gltf.animations && gltf.animations.length > 0) {
            this.baseAnimationsGLTF = gltf
            console.log(`Loaded base animations GLB with ${gltf.animations.length} animations`)
            gltf.animations.forEach((clip: THREE.AnimationClip) => {
              console.log(`  - ${clip.name} (${clip.duration.toFixed(2)}s)`)
            })
            resolve(gltf)
          } else {
            console.warn('No animations found in human-base-animations.glb')
            resolve(null)
          }
        },
        undefined,
        (error) => {
          console.error('Failed to load base animations:', error)
          resolve(null)
        }
      )
    })
  }

  /**
   * Retarget a Blender animation clip to VRM using the hyperfy-style bone mapping
   * Key insight: We must get the normalized bone node name and use that for tracks
   */
  private retargetBlenderClipToVRM(
    clip: THREE.AnimationClip,
    gltf: any,
    vrm: VRM
  ): THREE.AnimationClip | null {
    const clonedClip = clip.clone()

    // Filter tracks - keep only quaternions and root position
    clonedClip.tracks = clonedClip.tracks.filter((track: THREE.KeyframeTrack) => {
      if (track instanceof THREE.VectorKeyframeTrack) {
        const [name, type] = track.name.split('.')
        if (type !== 'position') return false
        if (name === 'DEF-hips' || name === 'root') return true
        return false
      }
      return true
    })

    // Get rest rotations for retargeting
    clonedClip.tracks.forEach((track: THREE.KeyframeTrack) => {
      const trackSplitted = track.name.split('.')
      const blenderBoneName = trackSplitted[0]
      const blenderBoneNode = gltf.scene.getObjectByName(blenderBoneName)

      if (!blenderBoneNode || !blenderBoneNode.parent) {
        return
      }

      blenderBoneNode.getWorldQuaternion(restRotationInverse).invert()
      blenderBoneNode.parent.getWorldQuaternion(parentRestWorldRotation)

      if (track instanceof THREE.QuaternionKeyframeTrack) {
        for (let i = 0; i < track.values.length; i += 4) {
          const flatQuaternion = track.values.slice(i, i + 4)
          q1.fromArray(flatQuaternion)
          q1.premultiply(parentRestWorldRotation).multiply(restRotationInverse)
          q1.toArray(flatQuaternion)
          flatQuaternion.forEach((v, index) => {
            track.values[index + i] = v
          })
        }
      }
    })

    clonedClip.optimize()

    // Retarget tracks to VRM skeleton using normalized bone names
    const retargetedTracks: THREE.KeyframeTrack[] = []

    clonedClip.tracks.forEach((track: THREE.KeyframeTrack) => {
      const trackSplitted = track.name.split('.')
      const blenderBoneName = trackSplitted[0]
      const vrmBoneName = blenderVRMRigMap[blenderBoneName]

      if (!vrmBoneName) return

      // Get the normalized bone node from the VRM humanoid
      const normalizedNode = vrm.humanoid?.getNormalizedBoneNode(vrmBoneName)
      if (!normalizedNode) return

      const vrmNodeName = normalizedNode.name
      const propertyName = trackSplitted[1]

      if (track instanceof THREE.QuaternionKeyframeTrack) {
        retargetedTracks.push(
          new THREE.QuaternionKeyframeTrack(
            `${vrmNodeName}.${propertyName}`,
            track.times,
            track.values
          )
        )
      }
      // Skip position tracks to prevent root motion issues
    })

    if (retargetedTracks.length > 0) {
      console.log(`Retargeted ${clip.name}: ${retargetedTracks.length} tracks`)
      return new THREE.AnimationClip(clip.name, clonedClip.duration, retargetedTracks)
    }

    return null
  }

  private async loadVRMAnimations(vrm: VRM): Promise<THREE.AnimationClip[]> {
    const animations: THREE.AnimationClip[] = []
    const gltf = await this.loadBaseAnimationsGLTF()

    if (!gltf) {
      console.error('Failed to load base animations GLB')
      return animations
    }

    // Map game states to animation clips from the GLB
    for (const [gameState, animName] of Object.entries(ANIMATION_STATE_MAP)) {
      const sourceClip = gltf.animations.find((clip: THREE.AnimationClip) => clip.name === animName)
      if (!sourceClip) {
        console.warn(`Animation ${animName} not found in base animations GLB`)
        continue
      }

      const retargetedClip = this.retargetBlenderClipToVRM(sourceClip, gltf, vrm)
      if (retargetedClip) {
        retargetedClip.name = gameState
        animations.push(retargetedClip)
        console.log(`Retargeted ${animName} -> ${gameState}`)
      }
    }

    console.log(`Loaded ${animations.length} retargeted animations for VRM`)
    return animations
  }

  /**
   * Load a glTF/VRM model and return both the mesh and VRM instance
   * For VRM models, animations are retargeted to normalized bones
   */
  static async glTFLoadWithVRM(path: string): Promise<LoadResult> {
    const instance = LoadManager.getInstance()
    const isVRM = path.toLowerCase().endsWith('.vrm')

    // For VRM models, always load fresh to get a unique VRM instance
    // This is necessary because VRM humanoid can't be easily cloned
    if (isVRM) {
      return new Promise((resolve, reject) => {
        instance.gltfLoader.load(
          path,
          async (gltf) => {
            const vrm = (gltf.userData as { vrm?: VRM }).vrm

            if (vrm) {
              console.log('VRM model loaded:', vrm)

              // VRM 1.0+ models face +Z, rotate to face -Z (game forward)
              vrm.scene.rotation.y = Math.PI

              // Load and retarget animations for this VRM instance
              const animations = await instance.loadVRMAnimations(vrm)
              console.log(`Loaded ${animations.length} animations for VRM`)

              // Create wrapper mesh
              const mesh: VRMMesh = new THREE.Mesh()
              mesh.add(vrm.scene)
              mesh.animations = animations
              mesh.vrm = vrm

              resolve({
                mesh,
                vrm,
                animations
              })
            } else {
              reject(new Error('VRM not found in loaded file'))
            }
          },
          undefined,
          (error) => {
            console.error('Failed to load VRM:', error)
            reject(error)
          }
        )
      })
    }

    // For non-VRM models, use caching
    if (instance.cache.has(path)) {
      const cachedMesh = instance.cache.get(path)!
      const clonedMesh = instance.cloneMesh(cachedMesh)
      return {
        mesh: clonedMesh,
        vrm: null,
        animations: clonedMesh.animations
      }
    }

    return new Promise((resolve, reject) => {
      instance.gltfLoader.load(
        path,
        (gltf) => {
          const mesh = instance.extractMesh(gltf)
          if (mesh) {
            instance.cache.set(path, mesh)
            const clonedMesh = instance.cloneMesh(mesh)
            resolve({
              mesh: clonedMesh,
              vrm: null,
              animations: clonedMesh.animations
            })
          } else {
            reject(new Error('No mesh found in GLTF model'))
          }
        },
        undefined,
        (error) => {
          console.error('Failed to load GLTF:', error)
          reject(error)
        }
      )
    })
  }

  /**
   * Legacy method - kept for backward compatibility
   * Use glTFLoadWithVRM for VRM models to get VRM instance
   */
  static async glTFLoad(path: string): Promise<THREE.Mesh> {
    const result = await LoadManager.glTFLoadWithVRM(path)
    return result.mesh
  }

  private cloneMesh(mesh: THREE.Mesh): THREE.Mesh {
    const clonedMesh = SkeletonUtils.clone(mesh)
    clonedMesh.animations = mesh.animations.map(clip => clip.clone())
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
    const mesh: THREE.Mesh = new THREE.Mesh()
    mesh.add(gltf.scene)
    mesh.animations = gltf.animations
    return mesh
  }
}
