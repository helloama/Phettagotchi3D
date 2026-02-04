import { Entity } from '@shared/entity/Entity'
import * as THREE from 'three'
import { MeshComponent } from '../component/MeshComponent'
import { EventSystem } from '@shared/system/EventSystem'
import { ComponentAddedEvent } from '@shared/component/events/ComponentAddedEvent'
import { ServerMeshComponent } from '@shared/component/ServerMeshComponent'
import { EntityManager } from '@shared/system/EntityManager'
import { LoadManager } from '@/game/LoadManager'
import { AnimationComponent } from '../component/AnimationComponent'
import { SerializedEntityType } from '@shared/network/server/serialized'

export class ServerMeshSystem {
  async update(entities: Entity[]): Promise<void> {
    const createEvents = EventSystem.getEventsWrapped(ComponentAddedEvent, ServerMeshComponent)
    const promises = createEvents.map((event: ComponentAddedEvent<ServerMeshComponent>) => {
      const entity = EntityManager.getEntityById(entities, event.entityId)

      if (!entity) {
        console.error('ServerMeshSystem: Entity not found')
        return Promise.resolve()
      }
      // Hack to load the world in parallel
      // Initial load is faster
      if (entity.type === SerializedEntityType.WORLD) {
        this.onServerMeshReceived(event, entity)
        return Promise.resolve()
      }
      return this.onServerMeshReceived(event, entity)
    })

    await Promise.all(promises)
  }

  async onServerMeshReceived(
    event: ComponentAddedEvent<ServerMeshComponent>,
    entity: Entity
  ): Promise<void> {
    const serverMeshComponent = event.component

    // Load the mesh with VRM support
    const loadResult = await LoadManager.glTFLoadWithVRM(serverMeshComponent.filePath)
    const meshComponent = new MeshComponent(entity.id, loadResult.mesh)

    entity.addComponent(meshComponent)

    if (loadResult.animations && loadResult.animations.length > 0) {
      // For VRM models, the AnimationMixer must target vrm.scene where normalized bones live
      // This is CRITICAL - animations target normalized bone names which are children of vrm.scene
      let animationRoot: THREE.Object3D

      if (loadResult.vrm) {
        // VRM model - use vrm.scene as animation root
        animationRoot = loadResult.vrm.scene
        console.log(`ServerMeshSystem: VRM entity ${entity.id} - AnimationMixer will target vrm.scene`)

        // DEBUG: Log what objects exist in vrm.scene for animation targeting
        const targetObjects: string[] = []
        animationRoot.traverse((obj) => {
          if (obj.name && obj.name.includes('Normalized')) {
            targetObjects.push(obj.name)
          }
        })
        console.log(`[AnimDebug] VRM scene has ${targetObjects.length} normalized bones:`, targetObjects.slice(0, 5))

        // DEBUG: Log first animation's track targets
        if (loadResult.animations.length > 0) {
          console.log(`[AnimDebug] First animation tracks:`, loadResult.animations[0].tracks.slice(0, 5).map(t => t.name))
        }
      } else {
        // Regular GLTF - use first child or mesh itself
        animationRoot = loadResult.mesh.children.length > 0 ? loadResult.mesh.children[0] : loadResult.mesh
      }

      console.log(`ServerMeshSystem: Adding AnimationComponent for entity ${entity.id} with ${loadResult.animations.length} animations`)
      console.log(`Animation names: ${loadResult.animations.map(a => a.name).join(', ')}`)

      // Pass the VRM instance to AnimationComponent for humanoid.update() calls
      entity.addComponent(
        new AnimationComponent(
          entity.id,
          animationRoot,
          loadResult.animations,
          loadResult.vrm
        )
      )
    } else {
      console.log(`ServerMeshSystem: No animations for entity ${entity.id}, type=${entity.type}`)
    }
  }
}
