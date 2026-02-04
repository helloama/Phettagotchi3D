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

// Comprehensive bone mapping supporting Blender DEF-*, Mixamo, and VRM standard names
// Based on hyperfy's createEmoteFactory.js normalizedBoneNames mapping
const boneNameToVRMBone: Record<string, VRMHumanBoneName> = {
  // === VRM Standard Names (identity mapping) ===
  'hips': 'hips',
  'spine': 'spine',
  'chest': 'chest',
  'upperChest': 'upperChest',
  'neck': 'neck',
  'head': 'head',
  'leftShoulder': 'leftShoulder',
  'leftUpperArm': 'leftUpperArm',
  'leftLowerArm': 'leftLowerArm',
  'leftHand': 'leftHand',
  'rightShoulder': 'rightShoulder',
  'rightUpperArm': 'rightUpperArm',
  'rightLowerArm': 'rightLowerArm',
  'rightHand': 'rightHand',
  'leftUpperLeg': 'leftUpperLeg',
  'leftLowerLeg': 'leftLowerLeg',
  'leftFoot': 'leftFoot',
  'leftToes': 'leftToes',
  'rightUpperLeg': 'rightUpperLeg',
  'rightLowerLeg': 'rightLowerLeg',
  'rightFoot': 'rightFoot',
  'rightToes': 'rightToes',

  // === Mixamo Rig Names (mixamorigXXX) ===
  'mixamorigHips': 'hips',
  'mixamorigSpine': 'spine',
  'mixamorigSpine1': 'chest',
  'mixamorigSpine2': 'upperChest',
  'mixamorigNeck': 'neck',
  'mixamorigHead': 'head',
  'mixamorigLeftShoulder': 'leftShoulder',
  'mixamorigLeftArm': 'leftUpperArm',
  'mixamorigLeftForeArm': 'leftLowerArm',
  'mixamorigLeftHand': 'leftHand',
  'mixamorigRightShoulder': 'rightShoulder',
  'mixamorigRightArm': 'rightUpperArm',
  'mixamorigRightForeArm': 'rightLowerArm',
  'mixamorigRightHand': 'rightHand',
  'mixamorigLeftUpLeg': 'leftUpperLeg',
  'mixamorigLeftLeg': 'leftLowerLeg',
  'mixamorigLeftFoot': 'leftFoot',
  'mixamorigLeftToeBase': 'leftToes',
  'mixamorigRightUpLeg': 'rightUpperLeg',
  'mixamorigRightLeg': 'rightLowerLeg',
  'mixamorigRightFoot': 'rightFoot',
  'mixamorigRightToeBase': 'rightToes',
  // Mixamo finger bones
  'mixamorigLeftHandThumb1': 'leftThumbMetacarpal',
  'mixamorigLeftHandThumb2': 'leftThumbProximal',
  'mixamorigLeftHandThumb3': 'leftThumbDistal',
  'mixamorigLeftHandIndex1': 'leftIndexProximal',
  'mixamorigLeftHandIndex2': 'leftIndexIntermediate',
  'mixamorigLeftHandIndex3': 'leftIndexDistal',
  'mixamorigLeftHandMiddle1': 'leftMiddleProximal',
  'mixamorigLeftHandMiddle2': 'leftMiddleIntermediate',
  'mixamorigLeftHandMiddle3': 'leftMiddleDistal',
  'mixamorigLeftHandRing1': 'leftRingProximal',
  'mixamorigLeftHandRing2': 'leftRingIntermediate',
  'mixamorigLeftHandRing3': 'leftRingDistal',
  'mixamorigLeftHandPinky1': 'leftLittleProximal',
  'mixamorigLeftHandPinky2': 'leftLittleIntermediate',
  'mixamorigLeftHandPinky3': 'leftLittleDistal',
  'mixamorigRightHandThumb1': 'rightThumbMetacarpal',
  'mixamorigRightHandThumb2': 'rightThumbProximal',
  'mixamorigRightHandThumb3': 'rightThumbDistal',
  'mixamorigRightHandIndex1': 'rightIndexProximal',
  'mixamorigRightHandIndex2': 'rightIndexIntermediate',
  'mixamorigRightHandIndex3': 'rightIndexDistal',
  'mixamorigRightHandMiddle1': 'rightMiddleProximal',
  'mixamorigRightHandMiddle2': 'rightMiddleIntermediate',
  'mixamorigRightHandMiddle3': 'rightMiddleDistal',
  'mixamorigRightHandRing1': 'rightRingProximal',
  'mixamorigRightHandRing2': 'rightRingIntermediate',
  'mixamorigRightHandRing3': 'rightRingDistal',
  'mixamorigRightHandPinky1': 'rightLittleProximal',
  'mixamorigRightHandPinky2': 'rightLittleIntermediate',
  'mixamorigRightHandPinky3': 'rightLittleDistal',

  // === Unity/Generic Humanoid Names ===
  'Hips': 'hips',
  'Spine': 'spine',
  'Chest': 'chest',
  'UpperChest': 'upperChest',
  'Neck': 'neck',
  'Head': 'head',
  'LeftShoulder': 'leftShoulder',
  'LeftUpperArm': 'leftUpperArm',
  'LeftLowerArm': 'leftLowerArm',
  'LeftHand': 'leftHand',
  'RightShoulder': 'rightShoulder',
  'RightUpperArm': 'rightUpperArm',
  'RightLowerArm': 'rightLowerArm',
  'RightHand': 'rightHand',
  'LeftUpperLeg': 'leftUpperLeg',
  'LeftLowerLeg': 'leftLowerLeg',
  'LeftFoot': 'leftFoot',
  'LeftToes': 'leftToes',
  'RightUpperLeg': 'rightUpperLeg',
  'RightLowerLeg': 'rightLowerLeg',
  'RightFoot': 'rightFoot',
  'RightToes': 'rightToes',

  // === Blender DEF-* Names ===
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

// Keep alias for backwards compatibility
const boneNameToVRMBone = boneNameToVRMBone

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
              console.log(`  - ${clip.name} (${clip.duration.toFixed(2)}s, ${clip.tracks.length} tracks)`)
            })
            // Log VRMA data if present
            if (gltf.userData?.vrmAnimations) {
              console.log(`[VRMAnimation] VRMA data present: ${gltf.userData.vrmAnimations.length} animations`)
            }
            // Log first animation track names for debugging
            if (gltf.animations[0]?.tracks?.length > 0) {
              console.log(`[Debug] First animation track names (first 5):`)
              gltf.animations[0].tracks.slice(0, 5).forEach((t: THREE.KeyframeTrack) => {
                console.log(`    ${t.name}`)
              })
            }
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

    // DEBUG: Log all track names from the source animation
    console.log(`[RetargetDebug] Source clip "${clip.name}" has ${clip.tracks.length} tracks:`)
    clip.tracks.slice(0, 10).forEach((track: THREE.KeyframeTrack) => {
      console.log(`  - ${track.name}`)
    })
    if (clip.tracks.length > 10) {
      console.log(`  ... and ${clip.tracks.length - 10} more`)
    }

    // DEBUG: Log all bones in the animation GLB
    const gltfBones: string[] = []
    gltf.scene.traverse((obj: THREE.Object3D) => {
      if (obj.type === 'Bone') gltfBones.push(obj.name)
    })
    console.log(`[RetargetDebug] Animation GLB bones:`, gltfBones.slice(0, 10))

    // DEBUG: Log VRM normalized bone names
    const vrmBones: string[] = []
    Object.keys(boneNameToVRMBone).forEach((blenderName) => {
      const vrmBoneName = boneNameToVRMBone[blenderName]
      const normalizedNode = vrm.humanoid?.getNormalizedBoneNode(vrmBoneName)
      if (normalizedNode) {
        vrmBones.push(`${blenderName} -> ${vrmBoneName} -> ${normalizedNode.name}`)
      }
    })
    console.log(`[RetargetDebug] VRM bone mapping (first 10):`, vrmBones.slice(0, 10))

    // Filter tracks - keep only quaternions and root position
    // Position tracks can cause issues with retargeting, so we skip most of them
    clonedClip.tracks = clonedClip.tracks.filter((track: THREE.KeyframeTrack) => {
      if (track instanceof THREE.VectorKeyframeTrack) {
        const [name, type] = track.name.split('.')
        if (type !== 'position') return false
        // Only keep position tracks for hips/root (various naming conventions)
        const isHips = name === 'DEF-hips' || name === 'root' || name === 'Root' ||
                       name === 'mixamorigHips' || name === 'Hips' || name === 'hips'
        return isHips
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
    const unmappedBones: string[] = []

    clonedClip.tracks.forEach((track: THREE.KeyframeTrack) => {
      const trackSplitted = track.name.split('.')
      const blenderBoneName = trackSplitted[0]
      const vrmBoneName = boneNameToVRMBone[blenderBoneName]

      if (!vrmBoneName) {
        unmappedBones.push(blenderBoneName)
        return
      }

      // Get the normalized bone node from the VRM humanoid
      const normalizedNode = vrm.humanoid?.getNormalizedBoneNode(vrmBoneName)
      if (!normalizedNode) {
        console.warn(`[RetargetDebug] VRM bone "${vrmBoneName}" has no normalized node`)
        return
      }

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

    if (unmappedBones.length > 0) {
      const unique = [...new Set(unmappedBones)]
      console.warn(`[RetargetDebug] Unmapped bones from source:`, unique)
    }

    if (retargetedTracks.length > 0) {
      console.log(`[RetargetDebug] Retargeted ${clip.name}: ${retargetedTracks.length} tracks`)
      console.log(`[RetargetDebug] Sample track targets:`, retargetedTracks.slice(0, 5).map(t => t.name))
      return new THREE.AnimationClip(clip.name, clonedClip.duration, retargetedTracks)
    }

    console.error(`[RetargetDebug] No tracks could be retargeted for ${clip.name}!`)
    return null
  }

  private async loadVRMAnimations(vrm: VRM): Promise<THREE.AnimationClip[]> {
    const animations: THREE.AnimationClip[] = []
    const gltf = await this.loadBaseAnimationsGLTF()

    if (!gltf) {
      console.error('Failed to load base animations GLB')
      return animations
    }

    // Check if this is a VRMA file (has vrmAnimations in userData)
    // VRMA files can be loaded directly without retargeting using createVRMAnimationClip
    if (gltf.userData?.vrmAnimations && gltf.userData.vrmAnimations.length > 0) {
      console.log(`[VRMAnimation] Found ${gltf.userData.vrmAnimations.length} VRM animations in VRMA format`)
      for (const vrmAnimation of gltf.userData.vrmAnimations) {
        try {
          const clip = createVRMAnimationClip(vrmAnimation, vrm)
          // Try to map the clip name to a game state
          for (const [gameState, animName] of Object.entries(ANIMATION_STATE_MAP)) {
            if (vrmAnimation.name === animName || clip.name === animName) {
              clip.name = gameState
              break
            }
          }
          animations.push(clip)
          console.log(`[VRMAnimation] Created clip: ${clip.name}`)
        } catch (e) {
          console.error(`[VRMAnimation] Failed to create clip from VRMA:`, e)
        }
      }
      if (animations.length > 0) {
        console.log(`Loaded ${animations.length} VRMA animations for VRM`)
        return animations
      }
    }

    // Fallback: Retarget standard GLB animations to VRM
    console.log(`[VRMAnimation] No VRMA data found, using retargeting from standard GLB`)

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
