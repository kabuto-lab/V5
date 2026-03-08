# ViRU5 V4 - Quick Start Guide

## 🚀 Running the Application

### Option 1: Use Batch Script (Windows)

**Quick Test (Install + Run):**
```bash
quick_test.bat
```
This will:
1. Install all dependencies (root, client, server)
2. Start both servers
3. Open browser automatically

**Run Development Mode:**
```bash
run_dev.bat
```
This starts the development servers (assumes dependencies are installed).

---

### Option 2: Manual Commands

**1. Install Dependencies:**
```bash
# Root
npm install

# Client
cd client
npm install

# Server
cd server
npm install
```

**2. Run Development Servers:**

Open two terminal windows:

**Terminal 1 - Server:**
```bash
cd server
npm run dev
```
Server runs on: http://localhost:2567

**Terminal 2 - Client:**
```bash
cd client
npm run dev
```
Client runs on: http://localhost:3000

**3. Open Browser:**
Navigate to: http://localhost:3000

---

## 🎮 Testing Features

### 1. Lobby System
- Click "Create Room" → Copy room ID
- Open second browser tab
- Enter room ID → Click "Join"

### 2. Mouse Followers
- Move mouse in both tabs
- See both cursors (red for Player 1, blue for Player 2)
- Real-time synchronization with trail effects

### 3. Draggable Orb
- Click and drag the center orb
- Both players see the orb movement

### 4. Chat System
- Open left sidebar (click button)
- Type message and press Enter
- Messages appear with timestamps

### 5. Virus Parameters
- Open right sidebar (click button)
- Adjust 12 parameters (12 points budget)
- Click "Randomize" for random distribution
- Click "READY" when configured

---

## 🛠 Troubleshooting

### Port Already in Use
**Error:** `EADDRINUSE: address already in use`

**Solution:**
```bash
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Kill process on port 2567
netstat -ano | findstr :2567
taskkill /PID <PID> /F
```

### Dependencies Not Installing
**Error:** `npm ERR! code ENOENT`

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rmdir /s /q node_modules
rmdir /s /q client\node_modules
rmdir /s /q server\node_modules

# Reinstall
npm install
```

### Can't Connect to Server
**Error:** `Cannot connect to server`

**Solution:**
1. Make sure server is running (check server console)
2. Verify server URL in client NetworkManager.ts
3. Check firewall settings
4. Try `http://127.0.0.1:3000` instead of localhost

---

## 📊 Expected Console Output

**Server Console:**
```
[ViRU5 Server] Listening on port 2567
[ViRU5 Server] WebSocket: ws://localhost:2567
[ViRU5 Server] Health: http://localhost:2567/health
[BattleRoom] Created: ABCD1234 | Lab: false
[BattleRoom] Player1 joined as Team 1
[BattleRoom] Player2 joined as Team 2
```

**Client Console:**
```
[MainApp] main.ts loaded
[MainApp] Constructor started...
[MainApp] Creating GameEngine...
[MainApp] GameEngine initialized!
[MouseFollowerManager] Created
[MouseFollowerManager] Network listeners setup complete
```

---

## 🎯 What to Test

- [ ] Create room successfully
- [ ] Join room with second player
- [ ] See both mouse cursors moving in real-time
- [ ] Drag center orb (both players see movement)
- [ ] Send chat messages
- [ ] Configure virus parameters (12 points validation)
- [ ] Click READY button
- [ ] See player count update

---

## 📝 Notes

- **Node.js Version:** Requires v16 or higher
- **Browser:** Chrome/Firefox recommended (WebGL support)
- **Development Mode:** Hot reload enabled (changes auto-refresh)
- **Production Build:** Run `npm run build` for production

---

**For more info, see:** `README.md`, `WORKING_FEATURES_INTEGRATION.md`
