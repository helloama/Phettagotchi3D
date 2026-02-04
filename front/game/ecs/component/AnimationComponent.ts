import { Component } from '@shared/component/Component'
import * as THREE from 'three'
import { VRM } from '@pixiv/three-vrm'

export class AnimationComponent extends Component {
  mixer: THREE.AnimationMixer
  animationState: number = 0
  vrm: VRM | null = null
  skeleton: THREE.Skeleton | null = null

  constructor(
    public entityId: number,
    public animationRoot: THREE.Object3D,
    public animations: THREE.AnimationClip[],
    vrm?: VRM | null
  ) {
    super(entityId)
    this.mixer = new THREE.AnimationMixer(animationRoot)
    this.vrm = vrm || null

    // Extract skeleton from animation root for explicit updates
    animationRoot.traverse((child) => {
      if (child instanceof THREE.SkinnedMesh && child.skeleton && !this.skeleton) {
        this.skeleton = child.skeleton
      }
    })
  }
}
