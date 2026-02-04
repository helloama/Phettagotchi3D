# Claude Context - Notblox/Phettagotchi3D

## Development Workflow

Follow this numbered prompt cycle. User will invoke by number (1-0).

| # | Name | Purpose |
|---|------|---------|
| 1 | Plan & Research | Analyze problem, clarify goals, identify constraints, outline architecture. Deliverable: written plan. Ask clarifying questions. |
| 2 | Implement Plan | Execute plan step-by-step. Real code only - NO stubs, placeholders, TODOs. Handle errors/edge cases. Stop if blockers arise. |
| 3 | Keep Going | Continue through all remaining tasks until complete. Don't stop to ask permission. Full implementation, no shortcuts. |
| 4 | Code Quality Pass | Refactor for: Compact (no dead code), Concise (idiomatic), Clean (consistent), Capable (handles edge cases). |
| 5 | Thorough Testing | Expand test coverage beyond happy path. Boundary conditions, error handling, integration points, async behavior. NO MOCKS - real code only. |
| 6 | LARP Assessment | Critically evaluate if code is real or performative. Check for: stubbed functions, hardcoded values, mocked tests, swallowed errors, fake async. Fix all issues found. |
| 7 | Clean Up Slop | Remove AI cruft: unnecessary abstractions, verbose comments, defensive code for impossible conditions, over-generic solutions, filler words. |
| 8 | Production Readiness | Final checklist: tests pass, error handling, no hardcoded secrets, performance acceptable, dependencies pinned, rollback path, monitoring. |
| 9 | Review Last Task | Audit: Does it work? Solve the problem? Anything skipped? Assumptions to document? What could break? Honest assessment, then fix. |
| 0 | Fix All Remaining | List every open issue, prioritize by impact, fix each completely, verify with execution, re-run tests. Zero issues remain. |

**Common sequences:**
- Easy: `1 2 3 6 0`
- Standard: `1 2 3 4 5 6 7 8 9 0`
- Hard: `1 2 3 6 0 1 2 3 4 5 6 7 8 9 0`

**Rules:**
- Never stub code or use TODOs
- No try/catch or fallbacks unless necessary
- No mocks in tests - integration tests against real code
- Always implement complete, production-ready code

---

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
  front/           - Next.js frontend (Vercel)
    game/          - Game client code
      ecs/         - Entity Component System
    public/        - Static assets
      assets/animations/ - Animation GLB files
      gameData.json      - Game definitions (ports, slugs)
  back/            - Game server (DigitalOcean)
    src/scripts/   - Game logic scripts
    ecosystem.config.js - PM2 multi-server config
  shared/          - Shared types/components
```

## Multi-Server Architecture

| Game | Slug | Port | Script | World Map |
|------|------|------|--------|-----------|
| Test | test | 8001 | defaultScript.js | FlatMap.glb |
| Obby | obby | 8002 | parkourScript.js | Obby.glb |
| Football | football | 8003 | footballScript.js | Stadium.glb |
| Pet Sim | pet-simulator | 8004 | petSimulatorScript.js | PetSim.glb |

### How It Works
1. **Frontend** (`gameData.json`): Defines games with `websocketPort`
2. **WebsocketManager**: Connects to `wss://api.phetta.lol/game{port}` in production
3. **Nginx**: Routes `/game8001` → `localhost:8001`, etc.
4. **PM2**: Runs 4 separate processes via `ecosystem.config.js`
5. **Game Script**: `GAME_SCRIPT` env var tells each server which script to load

### Deployment Commands
```bash
# On DigitalOcean server
cd /path/to/Notblox/back
npm run build
pm2 start ecosystem.config.js
pm2 save

# View logs
pm2 logs notblox-test
pm2 logs notblox-obby
pm2 logs notblox-football
pm2 logs notblox-petsim
```

### Environment Variables
**Frontend (Vercel)**:
- `NEXT_PUBLIC_SERVER_URL=wss://api.phetta.lol`

**Backend (PM2 ecosystem.config.js)**:
- `GAME_PORT` - Which port to listen on
- `GAME_SCRIPT` - Which script to load
- `FRONTEND_URL` - CORS origin validation

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
