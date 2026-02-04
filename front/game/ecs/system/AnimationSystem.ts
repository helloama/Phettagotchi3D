import { Entity } from '@shared/entity/Entity'
import { AnimationComponent } from '../component/AnimationComponent'
import { StateComponent } from '@shared/component/StateComponent'
import { MeshComponent } from '../component/MeshComponent'

export class AnimationSystem {
  update(dt: number, entities: Entity[]) {
    for (const entity of entities) {
      const animationComponent = entity.getComponent(AnimationComponent)
      const meshComponent = entity.getComponent(MeshComponent)
      const stateComponent = entity.getComponent(StateComponent)

      if (animationComponent && stateComponent && meshComponent) {
        const animations = animationComponent.animations

        const isNotPlaying = animationComponent.mixer.time === 0

        if (stateComponent.updated || isNotPlaying) {
          // Find the animation that corresponds to the current state
          const requestAnimationName = stateComponent.state

          // Debug: Log what's happening (only once per state change)
          if (stateComponent.updated) {
            console.log(`AnimationSystem: Entity ${entity.id} state changed to "${requestAnimationName}", has ${animations.length} animations`)
          }

          // Debug: Log available animations
          if (animations.length === 0) {
            console.warn(`No animations for entity ${entity.id}`)
          }

          let foundAnimation = false
          for (const clip of animations) {
            const action = animationComponent.mixer.clipAction(clip)
            if (clip.name !== requestAnimationName) {
              // Fade out all animations except the one corresponding to the current state
              action.fadeOut(0.2)
            } else {
              // Fade in and play the animation corresponding to the current state
              foundAnimation = true
              action.reset()
              action.fadeIn(0.1)
              action.play()
            }
          }

          if (!foundAnimation && animations.length > 0) {
            console.warn(`Animation "${requestAnimationName}" not found. Available: ${animations.map(a => a.name).join(', ')}`)
          }
        }

        // Update the animation mixer
        const deltaSeconds = dt / 1000
        animationComponent.mixer.update(deltaSeconds)

        // CRITICAL: Propagate normalized bone transforms to raw bones
        // This is the key insight from hyperscape's VRM animation system
        // Without this call, normalized bone changes never reach the visible skeleton
        if (animationComponent.vrm?.humanoid) {
          animationComponent.vrm.humanoid.update()
        }

        // Update skeleton matrices for skinning
        if (animationComponent.skeleton) {
          const bones = animationComponent.skeleton.bones
          for (let i = 0; i < bones.length; i++) {
            bones[i].updateMatrixWorld()
          }
          animationComponent.skeleton.update()
        }
      }
    }
  }
}
