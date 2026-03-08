# ViRU5 - DEPLOYMENT GUIDE
## Free Hosting Options (Server + Client)

---

## OPTION 1: Render.com (RECOMMENDED)

### Pros
- Free tier: Web services + PostgreSQL
- Custom domains
- Automatic deploys from GitHub
- No sleep (web services stay active)

### Setup

1. **Push code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/viru5.git
   git push -u origin main
   ```

2. **Create Web Service (server)**
   - Go to render.com → New → Web Service
   - Connect GitHub repository
   - Build command: `cd server && npm install && npm run build`
   - Start command: `cd server && npm start`
   - Environment variable: `PORT=10000`

3. **Create Static Site (client)**
   - New → Static Site
   - Build command: `cd client && npm install && npm run build`
   - Publish directory: `client/dist`

4. **Update client `.env`**:
   ```
   VITE_SERVER_URL=wss://your-server.onrender.com
   ```

### Costs
- **Free tier**: 750 hours/month (enough for 1 server)
- **Paid**: $7/month for additional services

---

## OPTION 2: Railway.app

### Pros
- $5/month free credit (generous)
- Excellent for WebSockets
- Easy environment variables

### Setup

1. **Connect GitHub repo**
   - railway.app → New Project → Deploy from GitHub

2. **Add 2 services**:
   - **Server**: Dockerfile or Nixpacks
     ```dockerfile
     FROM node:18-alpine
     WORKDIR /app
     COPY server/package*.json ./
     RUN npm install
     COPY server/src ./src
     COPY server/tsconfig.json ./
     RUN npm run build
     CMD ["npm", "start"]
     ```
   - **Client**: Static site
     - Build: `cd client && npm run build`
     - Output: `client/dist`

3. **Railway handles SSL automatically**

### Costs
- **Free trial**: $5 credit
- **Hobby**: $5/month after trial

---

## OPTION 3: Fly.io

### Pros
- 3 shared-cpu-1x 256mb VMs free
- Global edge locations
- Built-in PostgreSQL

### Setup

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   fly auth login
   ```

2. **Deploy server**
   ```bash
   cd server
   fly launch --name viru5-server
   fly deploy
   ```

3. **Deploy client**
   ```bash
   cd client
   fly launch --name viru5-client
   fly deploy
   ```

### Costs
- **Free allowance**: 3 VMs (256MB each)
- **Paid**: ~$2/month per VM

---

## OPTION 4: Vercel + Colyseus Cloud

### Pros
- Vercel: Unlimited free tier for static sites
- Colyseus Cloud: Managed game servers
- Best performance

### Setup

1. **Vercel (Client)**
   ```bash
   npm i -g vercel
   cd client
   vercel --prod
   ```

2. **Colyseus Cloud (Server)**
   - Go to colyseus.io/cloud
   - Create account
   - Deploy server code
   - Get WebSocket URL

3. **Update client `.env`**:
   ```
   VITE_SERVER_URL=wss://your-app.colyseus.cloud
   ```

### Costs
- **Vercel**: Free
- **Colyseus Cloud**: $9/month (after free trial)

---

## ENVIRONMENT VARIABLES

### Server
```bash
PORT=10000
NODE_ENV=production
CORS_ORIGIN=https://your-client-domain.com
```

### Client
```bash
VITE_SERVER_URL=wss://your-server.com
VITE_ENV=production
```

---

## PRE-DEPLOYMENT CHECKLIST

- [ ] Test locally with `npm run dev`
- [ ] Build both client and server (`npm run build`)
- [ ] Update CORS origins in server
- [ ] Set up environment variables
- [ ] Test WebSocket connection
- [ ] Enable HTTPS (automatic on most platforms)
- [ ] Set up monitoring (optional)
- [ ] Configure auto-deploy from GitHub

---

## TROUBLESHOOTING

### "Cannot connect to server"
- Check CORS settings
- Verify WebSocket port is open
- Ensure HTTPS on client, WSS on server

### "Build failed"
- Check Node.js version (16+)
- Clear node_modules and reinstall
- Verify all dependencies in package.json

### "High latency"
- Choose server region closest to players
- Enable compression in Express
- Reduce tick rate if needed

---

## MONITORING

### Recommended Tools
- **Uptime Robot**: Free uptime monitoring
- **Sentry**: Error tracking (free tier)
- **LogRocket**: Session replay (free tier)

### Key Metrics
- WebSocket connections
- Average tick latency
- Build/deploy success rate
- Player retention

---

## SCALING

### When to Scale
- >100 concurrent players
- >1 second tick latency
- Frequent server crashes

### Scaling Options
1. **Vertical**: Upgrade server RAM/CPU
2. **Horizontal**: Add more server instances
3. **Sharding**: Split players across rooms

---

**Last Updated**: 2026-03-03
**Version**: 4.0
