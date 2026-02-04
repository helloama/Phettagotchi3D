# Claude Context - Notblox/Phettagotchi3D

## Project Overview
Multiplayer 3D game with VRM avatar support. Built with Next.js frontend, Three.js rendering, and custom ECS architecture.

## Animation System (WORKING)

### Animation Files (USE THESE - THEY WORK)
```
front/public/assets/animations/
  - idle.glb
  - walk.glb
  - run.glb
  - jump.glb
  - fall.glb
```

### Key Files
| File | Purpose |
|------|---------|
| `front/game/LoadManager.ts` | Loads VRM models, retargets animations to VRM skeleton |
| `front/game/ecs/system/AnimationSystem.ts` | Plays animations, calls `vrm.humanoid.update()` |
| `front/game/ecs/system/ServerMeshSystem.ts` | Sets up AnimationComponent with vrm.scene as root |
| `front/game/ecs/component/AnimationComponent.ts` | Stores mixer, vrm, skeleton references |

### VRM Animation - Critical Knowledge

1. **Normalized vs Raw Bones**: VRM has proxy "normalized" bones and actual "raw" bones
2. **Animation Target**: AnimationMixer MUST target `vrm.scene` where normalized bones live
3. **humanoid.update()**: MUST call `vrm.humanoid.update()` after `mixer.update()` to propagate transforms
4. **Retargeting Math**: `parentRestWorld * trackRotation * restWorldInverse`

### Working Retargeting Code (LoadManager.ts)
```typescript
// Get rest pose rotations from source animation
mixamoRigNode.getWorldQuaternion(restRotationInverse).invert()
mixamoRigNode.parent.getWorldQuaternion(parentRestWorldRotation)

// Transform each keyframe
_quatA.fromArray(track.values, i)
_quatA.premultiply(parentRestWorldRotation).multiply(restRotationInverse)
```

### Bone Mapping
The animations use Mixamo naming convention. Full mapping in `boneNameToVRMBone`:
- `mixamorigHips` → `hips`
- `mixamorigSpine` → `spine`
- etc.

## Project Structure
```
Notblox/
  front/           - Next.js frontend with Three.js
    game/          - Game client code
      ecs/         - Entity Component System
        component/ - Components (AnimationComponent, MeshComponent, etc.)
        system/    - Systems (AnimationSystem, ServerMeshSystem, etc.)
    public/assets/ - Static assets (animations, models)
  back/            - Game server
  shared/          - Shared types/components between front and back
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| T-pose stuck | Check AnimationMixer targets vrm.scene, not mesh |
| Arms pointing wrong | Quaternion math order: premultiply parent, multiply inverse |
| Floating character | Scale hips position by `vrmHipsHeight / motionHipsHeight` |
| 404 on assets | Check .gitignore allows files in public/assets |

## Don't Do
- Don't reference non-existent animation files
- Don't skip `vrm.humanoid.update()` after mixer update
- Don't target mesh instead of vrm.scene for AnimationMixer
- Don't forget VRM 0.x vs 1.x differences in quaternion handling
