# Virus Configuration Fix

## Issue
Originally, the virus configuration panel showed 4 virus tabs (Virus 1-4) in **all modes**, but:
- **Normal Room Mode**: Each player should configure only **ONE** virus
- **Sandbox Mode**: Configure **4 viruses** independently

## Solution

### 1. VirusTubeManager Updated

**Before:**
```typescript
constructor() {
  this.params = [
    new Map(), // Virus 1
    new Map(), // Virus 2
    new Map(), // Virus 3
    new Map(), // Virus 4
  ];
}
```

**After:**
```typescript
constructor(sandboxMode: boolean = false) {
  this.isSandboxMode = sandboxMode;
  this.params = sandboxMode 
    ? [new Map(), new Map(), new Map(), new Map()] // 4 viruses
    : [new Map()]; // 1 virus
}
```

### 2. main.ts Updated

**Room Mode (Normal):**
```typescript
this.virusTubeManager = new VirusTubeManager(false); // 1 virus
```

**Sandbox Mode:**
```typescript
// Re-create for sandbox mode when entering
this.virusTubeManager = new VirusTubeManager(true); // 4 viruses
```

### 3. Stub Files Created

Created stub implementations to fix import errors:
- `BattleManager.ts` - Battle mechanics stub (TBD from mechanics.txt)
- `BattleRenderer.ts` - Battle renderer stub (TBD from mechanics.txt)

## Behavior Now

### Normal Room Mode (Online Multiplayer)
1. Player 1 creates room → Sees **1 virus config** (12 parameters, 12 points)
2. Player 2 joins room → Sees **1 virus config** (12 parameters, 12 points)
3. Both players configure their virus
4. Both click READY → Battle starts (when implemented)

### Sandbox Mode (Local Testing)
1. Enter sandbox → Sees **4 virus tabs** (Virus 1-4)
2. Configure each virus independently (12 points each)
3. Test battles locally

## Files Changed

- `client/src/features/battle/VirusTubeManager.ts` - Added sandboxMode parameter
- `client/src/main.ts` - Create correct mode based on context
- `client/src/features/battle/BattleManager.ts` - Stub created
- `client/src/features/battle/BattleRenderer.ts` - Stub created

## Testing

1. **Normal Room:**
   - Create room
   - Verify only 1 virus config visible (no tabs)
   - Configure 12 parameters
   - Click READY

2. **Sandbox Mode:**
   - Enter sandbox
   - Verify 4 virus tabs visible
   - Configure each virus independently
   - Test battle (when implemented)

## Status
✅ Fixed - Pushed to GitHub
📅 Date: 2026-03-03
