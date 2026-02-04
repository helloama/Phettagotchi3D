# Claude Context - Notblox/Phettagotchi3D

## Current Task: Fix VRM Animation

The VRM character is stuck in T-pose. Animations exist and have worked before.

### Animation Files (ALREADY IN REPO - USE THESE)
```
front/public/assets/animations/
  - idle.glb
  - walk.glb
  - run.glb
  - jump.glb
  - fall.glb
```

### Key Files
- `front/game/LoadManager.ts` - Loads VRM models and retargets animations
- `front/game/ecs/system/AnimationSystem.ts` - Plays animations, calls `vrm.humanoid.update()`
- `front/game/ecs/system/ServerMeshSystem.ts` - Sets up AnimationComponent with vrm.scene as root
- `front/game/ecs/component/AnimationComponent.ts` - Stores mixer, vrm, skeleton

### VRM Animation Key Points
1. VRM has "normalized bones" (proxy) and "raw bones" (actual)
2. Animation tracks must target normalized bone node names
3. After `mixer.update()`, must call `vrm.humanoid.update()` to propagate transforms
4. AnimationMixer must target `vrm.scene` where normalized bones live

### Bone Mapping
The animations use Mixamo naming (mixamorigHips, mixamorigSpine, etc.)
LoadManager has comprehensive mapping from Mixamo -> VRM bone names

### Current Status
- Animations load from individual GLB files
- Retargeting attempts to map Mixamo bones to VRM normalized bones
- Character shows partial movement (head, legs) but not full animation

### Debug Logs to Check
- `[RetargetDebug]` - Shows source tracks and bone mapping
- `[AnimDebug]` - Shows normalized bones in VRM scene
- `AnimationSystem:` - Shows state changes and animation playback

## Project Structure
```
Notblox/
  front/          - Next.js frontend with Three.js
  back/           - Game server
  shared/         - Shared types/components
```

## Don't Do
- Don't reference non-existent animation files
- Don't overcomplicate - the individual GLB files have worked before
- Don't search online when the solution is in the existing codebase
