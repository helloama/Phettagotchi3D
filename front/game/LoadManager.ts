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

// Animation file paths for VRM models
const VRM_ANIMATIONS = {
  Idle: '/assets/animations/idle.glb',
  Walk: '/assets/animations/walk.glb',
  Run: '/assets/animations/run.glb',
  Jump: '/assets/animations/jump.glb',
  Fall: '/assets/animations/fall.glb',
}

// Mixamo bone name to VRM humanoid bone name mapping
const mixamoVRMRigMap: Record<string, VRMHumanBoneName> = {
  mixamorigHips: 'hips',
  mixamorigSpine: 'spine',
  mixamorigSpine1: 'chest',
  mixamorigSpine2: 'upperChest',
  mixamorigNeck: 'neck',
  mixamorigHead: 'head',
  mixamorigLeftShoulder: 'leftShoulder',
  mixamorigLeftArm: 'leftUpperArm',
  mixamorigLeftForeArm: 'leftLowerArm',
  mixamorigLeftHand: 'leftHand',
  mixamorigLeftHandThumb1: 'leftThumbMetacarpal',
  mixamorigLeftHandThumb2: 'leftThumbProximal',
  mixamorigLeftHandThumb3: 'leftThumbDistal',
  mixamorigLeftHandIndex1: 'leftIndexProximal',
  mixamorigLeftHandIndex2: 'leftIndexIntermediate',
  mixamorigLeftHandIndex3: 'leftIndexDistal',
  mixamorigLeftHandMiddle1: 'leftMiddleProximal',
  mixamorigLeftHandMiddle2: 'leftMiddleIntermediate',
  mixamorigLeftHandMiddle3: 'leftMiddleDistal',
  mixamorigLeftHandRing1: 'leftRingProximal',
  mixamorigLeftHandRing2: 'leftRingIntermediate',
  mixamorigLeftHandRing3: 'leftRingDistal',
  mixamorigLeftHandPinky1: 'leftLittleProximal',
  mixamorigLeftHandPinky2: 'leftLittleIntermediate',
  mixamorigLeftHandPinky3: 'leftLittleDistal',
  mixamorigRightShoulder: 'rightShoulder',
  mixamorigRightArm: 'rightUpperArm',
  mixamorigRightForeArm: 'rightLowerArm',
  mixamorigRightHand: 'rightHand',
  mixamorigRightHandThumb1: 'rightThumbMetacarpal',
  mixamorigRightHandThumb2: 'rightThumbProximal',
  mixamorigRightHandThumb3: 'rightThumbDistal',
  mixamorigRightHandIndex1: 'rightIndexProximal',
  mixamorigRightHandIndex2: 'rightIndexIntermediate',
  mixamorigRightHandIndex3: 'rightIndexDistal',
  mixamorigRightHandMiddle1: 'rightMiddleProximal',
  mixamorigRightHandMiddle2: 'rightMiddleIntermediate',
  mixamorigRightHandMiddle3: 'rightMiddleDistal',
  mixamorigRightHandRing1: 'rightRingProximal',
  mixamorigRightHandRing2: 'rightRingIntermediate',
  mixamorigRightHandRing3: 'rightRingDistal',
  mixamorigRightHandPinky1: 'rightLittleProximal',
  mixamorigRightHandPinky2: 'rightLittleIntermediate',
  mixamorigRightHandPinky3: 'rightLittleDistal',
  mixamorigLeftUpLeg: 'leftUpperLeg',
  mixamorigLeftLeg: 'leftLowerLeg',
  mixamorigLeftFoot: 'leftFoot',
  mixamorigLeftToeBase: 'leftToes',
  mixamorigRightUpLeg: 'rightUpperLeg',
  mixamorigRightLeg: 'rightLowerLeg',
  mixamorigRightFoot: 'rightFoot',
  mixamorigRightToeBase: 'rightToes',
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

  /**
   * Retarget a Mixamo animation to VRM using the hyperscape approach
   * Key insight: We must get the normalized bone node name and use that for tracks
   */
  private retargetMixamoClipToVRM(
    gltf: any,
    vrm: VRM
  ): THREE.AnimationClip | null {
    if (!gltf.animations || gltf.animations.length === 0) {
      return null
    }

    const clip = gltf.animations[0].clone()

    // Filter tracks - keep only quaternions and root position
    clip.tracks = clip.tracks.filter((track: THREE.KeyframeTrack) => {
      if (track instanceof THREE.VectorKeyframeTrack) {
        const [name, type] = track.name.split('.')
        if (type !== 'position') return false
        if (name === 'mixamorigHips') return true
        return false
      }
      return true
    })

    // Get rest rotations for retargeting (from pixiv/three-vrm PR #1032)
    clip.tracks.forEach((track: THREE.KeyframeTrack) => {
      const trackSplitted = track.name.split('.')
      const mixamoRigName = trackSplitted[0]
      const mixamoRigNode = gltf.scene.getObjectByName(mixamoRigName)

      if (!mixamoRigNode || !mixamoRigNode.parent) {
        return
      }

      mixamoRigNode.getWorldQuaternion(restRotationInverse).invert()
      mixamoRigNode.parent.getWorldQuaternion(parentRestWorldRotation)

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

    clip.optimize()

    // Retarget tracks to VRM skeleton using normalized bone names
    const retargetedTracks: THREE.KeyframeTrack[] = []

    clip.tracks.forEach((track: THREE.KeyframeTrack) => {
      const trackSplitted = track.name.split('.')
      const ogBoneName = trackSplitted[0]
      const vrmBoneName = mixamoVRMRigMap[ogBoneName]

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

    console.log(`Retargeted clip has ${retargetedTracks.length} tracks`)
    if (retargetedTracks.length > 0) {
      console.log(`First track targets: ${retargetedTracks[0].name}`)
    }

    return new THREE.AnimationClip(clip.name, clip.duration, retargetedTracks)
  }

  private async loadVRMAnimations(vrm: VRM): Promise<THREE.AnimationClip[]> {
    const animations: THREE.AnimationClip[] = []

    for (const [name, path] of Object.entries(VRM_ANIMATIONS)) {
      const gltf = await this.loadAnimationGLTF(name, path)
      if (gltf && gltf.userData.vrmAnimations) {
        // Use VRM animation conversion for .vrma files
        const vrmAnimation = gltf.userData.vrmAnimations[0]
        if (vrmAnimation) {
          const clip = createVRMAnimationClip(vrmAnimation, vrm)
          clip.name = name
          animations.push(clip)
          console.log(`Converted VRM animation: ${name}`)
        }
      } else if (gltf) {
        // Retarget Mixamo animation to VRM using hyperscape approach
        const retargetedClip = this.retargetMixamoClipToVRM(gltf, vrm)
        if (retargetedClip) {
          retargetedClip.name = name
          animations.push(retargetedClip)
          console.log(`Retargeted Mixamo animation to VRM: ${name}`)
        }
      }
    }

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
