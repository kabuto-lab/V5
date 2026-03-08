# ViRU5 - MASTER AI CODER PROMPT
## Version: 4.0 | Date: 2026-03-03
## Project: Complete Multiplayer Virus Battle Game

⚠️ **CRITICAL:** Read this entire file before writing ANY code. This is a STEP-BY-STEP implementation guide.

---

## 🎯 PROJECT OVERVIEW

ViRU5 is a real-time multiplayer browser game featuring:
- **Mode A (Standard)**: 2-player competitive virus battles
- **Mode B (Laboratory)**: 4-virus sandbox (1 player controls all 4, local simulation)
- **Tech Stack**: TypeScript, PixiJS v8, Colyseus, Node.js
- **Deployment**: Optimized for free hosting (Render/Railway/Fly.io)

---

## 📋 IMPLEMENTATION ROADMAP

### PHASE 1: Foundation (Files 1-8)
**Goal**: Basic 2-player connection + mouse followers + draggable orb

### PHASE 2: Battle System (Files 9-16)
**Goal**: Working 2-player virus battle with 12 parameters

### PHASE 3: Laboratory Mode (Files 17-22)
**Goal**: 4-virus local simulation mode

### PHASE 4: Polish & Deploy (Files 23-30)
**Goal**: VFX, optimization, deployment

---

## 🔧 FILE IMPLEMENTATION ORDER

### CORE INFRASTRUCTURE (Create these FIRST)

1. **Root package.json** - Workspace configuration
2. **Server package.json** - Server dependencies
3. **Server tsconfig.json** - TypeScript config for server
4. **Client package.json** - Client dependencies
5. **Client tsconfig.json** - TypeScript config for client
6. **Client vite.config.ts** - Vite bundler config
7. **Server schema.ts** - Colyseus state schemas
8. **Server BattleRoom.ts** - Main game room logic
9. **Server index.ts** - Server entry point
10. **Client index.html** - Main HTML with UI
11. **Client main.ts** - Application entry point
12. **Client GameEngine.ts** - PixiJS initialization
13. **Client NetworkManager.ts** - Colyseus client wrapper
14. **Client BattleRenderer.ts** - Grid visualization
15. **Client VirusParamManager.ts** - Parameter UI
16. **Client LaboratoryManager.ts** - Lab mode UI

---

## 📊 VIRUS PARAMETER SYSTEM (Refactored)

### 10 Core Parameters (reduced from 12)

#### OFFENSIVE (Combat)
- **Aggression** ⚔️ - Attack power & combat priority
- **Virulence** ☣️ - Infection speed & cell conversion rate

#### DEFENSIVE (Survival)
- **Defense** 🛡️ - Damage reduction & shield strength
- **Resilience** 💪 - HP regeneration & recovery speed

#### MOBILITY (Spread)
- **Propagation** ⚡ - Spread range & speed (renamed from Speed)
- **Mobility** 🚶 - Emergency jump range

#### SPECIAL (Advanced)
- **Mutation** 🧬 - Infestation chance & adaptive resistance
- **Stealth** 👻 - Detection avoidance & shield piercing

#### UTILITY (Support)
- **Replication** 🦠 - Resource efficiency & spawn rate
- **Synergy** 🔗 - Adjacency bonuses & combo effects (NEW - replaces Intellect)

### Point Distribution Rules
- **Total Budget**: 12 points per virus
- **Minimum**: 0 in any stat
- **Maximum**: 10 in any single stat
- **Validation**: Must spend exactly 12 points

---

## 🎮 GAME MODES

### Standard Mode (2-Player Online)
- **Players**: 2 humans via network
- **Setup**: Each player configures 1 virus (12 points)
- **Grid**: 64x40 cells (2560 total)
- **Start**: Both players ready up → 3-2-1 countdown → Battle
- **Duration**: 30-120 seconds average

### Laboratory Mode (4-Virus Local)
- **Players**: 1 human configures 4 viruses
- **Setup**: Configure all 4 viruses independently (12 points each)
- **Purpose**: Testing synergies, AI behavior observation, sandbox
- **Grid**: Same 64x40, 4 corner starts
- **Unlock**: Available after purchase (implement full version first)

---

## 🏆 VICTORY CONDITIONS

1. **Domination (96% Rule)**: Control ≥96% of occupied cells → Instant Victory
2. **Elimination**: All enemy cells destroyed → Victory
3. **Timeout**: At tick 1000, player with most cells wins

---

## 🛠 TECH STACK

### Frontend
- TypeScript 5.0+
- PixiJS v8.16+
- Vite 5.0+
- Colyseus.js 0.15.28+

### Backend
- Node.js 16+
- TypeScript 5.0+
- Colyseus 0.15+
- Express 4.18+

### Deployment
- Render.com (recommended)
- Railway.app
- Fly.io

---

## 📁 PROJECT STRUCTURE

```
viru5-game/
├── package.json                 # Root workspace
├── MASTER_PROMPT.md             # This file
├── GAME_MECHANICS.md            # Detailed mechanics
├── VFX_SPEC.md                  # Visual effects spec
├── DEPLOYMENT_GUIDE.md          # Hosting instructions
│
├── client/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── main.ts
│       ├── core/
│       │   ├── GameEngine.ts
│       │   └── NetworkManager.ts
│       └── features/
│           ├── battle/
│           │   ├── BattleRenderer.ts
│           │   └── VirusParamManager.ts
│           └── lab/
│               └── LaboratoryManager.ts
│
└── server/
    ├── package.json
    ├── tsconfig.json
    ├── index.ts
    └── rooms/
        ├── schema.ts
        └── BattleRoom.ts
```

---

## 🚀 QUICK START

```bash
# Install dependencies
npm install

# Run development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 📝 IMPLEMENTATION NOTES

1. **Create files in order** - Each file builds on previous ones
2. **Test incrementally** - Verify each phase before moving to next
3. **Keep schemas in sync** - Client and server state must match
4. **Optimize for mobile** - Responsive design, touch controls
5. **Deploy early** - Test on Render free tier during development

---

## 🔗 RELATED FILES

- See `GAME_MECHANICS.md` for detailed formulas
- See `VFX_SPEC.md` for visual effects
- See `DEPLOYMENT_GUIDE.md` for hosting setup

---

**Version History:**
- v4.0: Refactored to 10 parameters, added Synergy system
- v3.0: Original 12-parameter system
- v2.0: Added Laboratory mode
- v1.0: Initial release
