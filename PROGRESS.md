# Development Progress Log

## 2024-02-03: VRM Animation System Fixed

### Problem
VRM character was stuck in T-pose. Animations existed but weren't playing correctly on the VRM model.

### Root Cause
Animation retargeting from Mixamo-rigged GLB files to VRM normalized bones required specific quaternion math that wasn't being applied correctly.

### Solution Journey

1. **Initial State**: Character in T-pose, no animation playing

2. **First Attempts** (Failed):
   - Tried loading combined animation file `human-base-animations.glb` - 404 error
   - File was gitignored (*.glb in .gitignore)

3. **Fix #1: .gitignore**
   - Updated `.gitignore` to allow GLB files in public/assets:
   ```
   *.glb
   !public/assets/**/*.glb
   ```

4. **Fix #2: Use Individual Animation Files**
   - Changed from single combined file to individual files:
   - `idle.glb`, `walk.glb`, `run.glb`, `jump.glb`, `fall.glb`
   - These files were already in the repo and had worked before

5. **Fix #3: Animation Retargeting** (Multiple iterations):
   - **Problem**: Arms pointing up, character floating
   - **Research**: Found pixiv/three-vrm `loadMixamoAnimation.js` reference implementation
   - **Key insight**: Quaternion math must be `parentRestWorld * trackRotation * restWorldInverse`

   ```typescript
   mixamoRigNode.getWorldQuaternion(restRotationInverse).invert()
   mixamoRigNode.parent.getWorldQuaternion(parentRestWorldRotation)

   _quatA.premultiply(parentRestWorldRotation).multiply(restRotationInverse)
   ```

6. **Fix #4: Hips Height Scaling**
   - Position tracks needed scaling by ratio of VRM hips height to motion hips height
   - `hipsPositionScale = vrmHipsY / motionHipsHeight`

7. **Fix #5: VRM Version Handling**
   - VRM 0.x requires negating x/z quaternion components
   - VRM 1.x does not

### Final Working Code Location
- `front/game/LoadManager.ts` - `retargetBlenderClipToVRM()` method

### Key Learnings

1. **VRM has two bone systems**:
   - Normalized bones (proxy, identity rotation in T-pose)
   - Raw bones (actual skeleton)

2. **AnimationMixer must target vrm.scene**, not the mesh

3. **Must call `vrm.humanoid.update()`** after `mixer.update()` to propagate normalized bone transforms to raw bones

4. **Retargeting removes source rest pose and applies to target**:
   - Get source bone's world quaternion, invert it
   - Get source parent's world quaternion
   - For each keyframe: `parent * animated * inverseRest`

### Files Modified
- `front/.gitignore` - Allow GLB in public/assets
- `front/game/LoadManager.ts` - Animation loading and retargeting
- `front/game/ecs/system/AnimationSystem.ts` - Added humanoid.update() call
- `front/game/ecs/system/ServerMeshSystem.ts` - Use vrm.scene as animation root

---

## Future Tasks
- [ ] Add more animation states
- [ ] Improve animation blending/transitions
- [ ] Add facial expressions/blend shapes
- [ ] Optimize animation loading (lazy load?)
