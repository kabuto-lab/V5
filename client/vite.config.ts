import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'game-core': ['./src/core/GameEngine', './src/core/NetworkManager'],
          'battle-feature': ['./src/features/battle/BattleRenderer'],
          'lab-feature': ['./src/features/lab/LaboratoryManager'], // Lazy loaded
          'vendor-pixi': ['pixi.js'],
          'vendor-colyseus': ['colyseus.js']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['pixi.js', 'colyseus.js']
  },
  publicDir: 'public'
});
