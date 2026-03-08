# ViRU5 - Virus Battle Simulation

**Version:** 4.0  
**Date:** 2026-03-03  
**Genre:** Real-Time Multiplayer Strategy

[📖 Master Prompt](./MASTER_PROMPT.md) | [⚙️ Game Mechanics](./GAME_MECHANICS.md) | [✨ VFX Spec](./VFX_SPEC.md) | [🚀 Deployment](./DEPLOYMENT_GUIDE.md)

---

## 🎮 Overview

**ViRU5** is a competitive 2-player (or 4-virus sandbox) virus battle game where players configure genetic parameters and watch autonomous viruses fight for dominance.

### Key Features

- **🧬 10 Virus Parameters** - Aggression, Defense, Mutation, Stealth, and more
- **⚔️ Real-Time Battles** - 2 ticks/second, ~30-120 second matches
- **🔬 Laboratory Mode** - Configure 4 viruses, test synergies
- **🌐 Online Multiplayer** - Client-server with Colyseus
- **🎨 Retro-Futuristic UI** - CRT effects, neon colors, scanlines

---

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Run development mode (client + server)
npm run dev

# Open browser: http://localhost:3000
```

### Build for Production

```bash
# Build both client and server
npm run build

# Start production server
npm start
```

---

## 🎯 How to Play

### Standard Mode (2 Players)

1. **Create Room** - Player 1 clicks "Create Room", copies ID
2. **Join Room** - Player 2 enters ID, clicks "Join"
3. **Configure Virus** - Distribute 12 points across 10 parameters
4. **Ready Up** - Both players click READY
5. **Battle!** - 3-2-1 countdown → viruses fight automatically
6. **Victory** - First to control 96% of cells wins

### Laboratory Mode (4 Viruses)

1. **Select Lab Mode** - Choose "Laboratory" on main screen
2. **Configure All 4** - Set parameters for each virus independently
3. **Start Simulation** - Click "INITIATE SIMULATION"
4. **Watch & Learn** - Observe which build dominates

---

## 🧬 Virus Parameters

### Offensive (Combat)
- **⚔️ Aggression** - Attack power & combat priority
- **☣️ Virulence** - Infection speed & conversion rate

### Defensive (Survival)
- **🛡️ Defense** - Damage reduction & shield strength
- **💪 Resilience** - HP regeneration & recovery

### Mobility (Spread)
- **⚡ Propagation** - Spread range & speed
- **🚶 Mobility** - Emergency jump range (diagonal at ≥5)

### Special (Advanced)
- **🧬 Mutation** - Infestation chance & adaptation
- **👻 Stealth** - Shield piercing & detection avoid

### Utility (Support)
- **🦠 Replication** - Resource efficiency & spawn rate
- **🔗 Synergy** - Adjacency bonuses & combo effects

**Point Budget:** 12 points total, max 10 per stat

---

## 🏆 Victory Conditions

1. **Domination (96%)** - Control ≥96% of occupied cells
2. **Elimination** - Destroy all enemy cells
3. **Timeout** - Most cells at tick 1000 (~8 min)

---

## 🛠 Tech Stack

### Client
- TypeScript 5.0+
- PixiJS v8.16+ (WebGL rendering)
- Vite 5.0+ (build tool)
- Colyseus.js 0.15.28+ (network client)

### Server
- Node.js 16+
- TypeScript 5.0+
- Colyseus 0.15+ (multiplayer framework)
- Express 4.18+ (HTTP server)

### Deployment
- Render.com (recommended free tier)
- Railway.app ($5 credit)
- Fly.io (3 free VMs)

---

## 📁 Project Structure

```
V4/
├── 📄 package.json              # Root workspace
├── 📄 README.md                 # This file
├── 📄 MASTER_PROMPT.md          # Implementation guide
├── 📄 GAME_MECHANICS.md         # Detailed mechanics
├── 📄 VFX_SPEC.md               # Visual effects
├── 📄 DEPLOYMENT_GUIDE.md       # Hosting setup
│
├── 📂 client/
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   ├── 📄 vite.config.ts
│   ├── 📄 index.html            # Main UI
│   └── 📂 src/
│       ├── 📄 main.ts           # Entry point
│       ├── 📂 core/
│       │   ├── GameEngine.ts    # PixiJS init
│       │   └── NetworkManager.ts # Colyseus client
│       └── 📂 features/
│           ├── battle/
│           │   ├── BattleRenderer.ts
│           │   └── VirusParamManager.ts
│           └── lab/
│               └── LaboratoryManager.ts
│
└── 📂 server/
    ├── 📄 package.json
    ├── 📄 tsconfig.json
    ├── 📄 index.ts              # Server entry
    └── 📂 rooms/
        ├── schema.ts            # State schemas
        └── BattleRoom.ts        # Game logic
```

---

## 🎮 Game Mechanics Summary

### Battle Flow
1. **Setup Phase** - Configure virus parameters
2. **Countdown** - 3-2-1-BATTLE! (4 seconds)
3. **Battle Phase** - Automatic spread & combat (500ms/tick)
4. **Endgame** - Victory screen with stats

### Tick Structure (500ms)
1. **Spread Phase** - Viruses expand to adjacent cells
2. **Combat Phase** - Adjacent enemies fight
3. **Infestation Phase** - Mutation-based conversion
4. **Regeneration Phase** - HP recovery

### Grid System
- **Size**: 64 × 40 = 2,560 cells
- **Start**: Player 1 (top), Player 2 (bottom)
- **Lab Mode**: 4 corners

---

## 🐛 Troubleshooting

### "Cannot connect to server"
- Ensure server is running on port 2567
- Check firewall settings
- Verify CORS configuration

### "Black screen / no canvas"
- Check browser console for errors
- Ensure WebGL is enabled
- Try Chrome/Firefox (latest versions)

### "Battle doesn't start"
- Both players must click READY
- Verify 12 points distributed
- Check network connection

---

## 📚 Documentation

- **[MASTER_PROMPT.md](./MASTER_PROMPT.md)** - Complete implementation guide
- **[GAME_MECHANICS.md](./GAME_MECHANICS.md)** - Detailed formulas & mechanics
- **[VFX_SPEC.md](./VFX_SPEC.md)** - Visual effects specification
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Hosting instructions

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🔗 Repository

**GitHub:** https://github.com/kabuto-lab/ViRU5.git

---

## 📞 Support

- Open an issue on GitHub
- Check documentation files
- Review troubleshooting section

---

**Enjoy the battle! 🦠⚔️**

*Last Updated: 2026-03-03*
