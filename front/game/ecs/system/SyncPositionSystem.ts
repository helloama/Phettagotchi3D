import * as THREE from 'three'
import { Entity } from '@shared/entity/Entity'
import { MeshComponent } from '../component/MeshComponent'
import { PositionComponent } from '@shared/component/PositionComponent'
import { VehicleComponent } from '@shared/component/VehicleComponent'
import { SingleSizeComponent } from '@shared/component/SingleSizeComponent'
import { SerializedEntityType } from '@shared/network/server/serialized'

export class SyncPositionSystem {
  update(entities: Entity[], interpolationFactor: number) {
    for (const entity of entities) {
      const meshComponent = entity.getComponent(MeshComponent)
      const positionComponent = entity.getComponent(PositionComponent)
      const vehicleComponent = entity.getComponent(VehicleComponent)

      if (meshComponent && positionComponent) {
        // For players, offset Y position down so feet touch the ground
        // The physics capsule is centered at the position, but the VRM model
        // has its origin at the feet, so we need to offset by half the capsule height
        // Capsule total height = 2 * (size/3) + 2 * (size/6) = size
        // Capsule is centered, so offset down by half the total height
        let yOffset = 0
        if (entity.type === SerializedEntityType.PLAYER) {
          const sizeComponent = entity.getComponent(SingleSizeComponent)
          if (sizeComponent) {
            // Physics capsule center is at positionComponent.y
            // VRM mesh origin is at feet, so offset down by half capsule height
            yOffset = -sizeComponent.size * 0.5
          }
        }

        const targetPosition = new THREE.Vector3(
          positionComponent.x,
          positionComponent.y + yOffset,
          positionComponent.z
        )
        // Smooth vehicle more than other entities
        meshComponent.mesh.position.lerp(
          targetPosition,
          vehicleComponent ? 0.1 : interpolationFactor
        )
      }
    }
  }
}
