/**
 * BattleRenderer — MINIMAL version
 * Only basic colored squares, NO VFX
 */

import * as PIXI from 'pixi.js';

export class BattleRenderer {
  public container: PIXI.Container;
  private cellSprites: PIXI.Sprite[] = [];
  private baseTexture: PIXI.Texture;
  private gridWidth: number = 64;
  private gridHeight: number = 40;
  private totalCells: number = 2560;
  private currentGrid: number[] | null = null;

  // === VFX: Color transition system ===
  private cellColorTransitions: Map<number, {current: number, target: number, progress: number}> = new Map();
  private readonly COLOR_TRANSITION_SPEED = 0.05; // 200ms transition (1/20 frames)

  // === VFX: Tentacle system for battle fronts ===
  private tentaclePool: PIXI.Graphics[] = [];
  private activeTentacles: Array<{
    tentacle: PIXI.Graphics;
    fromCell: number;
    toCell: number;
    progress: number;
    growthSpeed: number;
    color: number;
    visible: boolean;
  }> = [];
  private boundaryCells: Set<number> = new Set();  // Cells adjacent to enemies

  // === VFX: Dominance aura ===
  private dominanceAura: PIXI.Graphics | null = null;
  private currentLeader: number = 0;

  // === VFX: Combat sparks ===
  private sparkPool: PIXI.Graphics[] = [];
  private activeSparks: Array<{
    spark: PIXI.Graphics;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: number;
  }> = [];

  private readonly COLORS = {
    empty: 0x1a1a1a,
    virus1: 0xff0066,    // HOT PINK - warm, high saturation
    virus2: 0x00ffff,    // CYAN - bright cool color
    virus3: 0xcc00ff,    // PURPLE - distinct from cyan, warm
    virus4: 0xffaa00,    // ORANGE - warm, contrasts with cool colors
  };

  constructor(stage: PIXI.Container) {
    this.container = new PIXI.Container();
    this.container.zIndex = 1000;
    this.container.alpha = 0;
    this.container.visible = false;
    this.baseTexture = PIXI.Texture.WHITE;
    stage.addChild(this.container);

    // Initialize tentacle pool (200 tentacles for battle fronts)
    for (let i = 0; i < 200; i++) {
      const tentacle = new PIXI.Graphics();
      tentacle.visible = false;
      this.container.addChild(tentacle);
      this.tentaclePool.push(tentacle);
    }

    // Initialize spark pool (100 sparks for combat)
    for (let i = 0; i < 100; i++) {
      const spark = new PIXI.Graphics();
      spark.visible = false;
      this.container.addChild(spark);
      this.sparkPool.push(spark);
    }

    // Create dominance aura overlay
    this.dominanceAura = new PIXI.Graphics();
    this.dominanceAura.zIndex = 50;
    this.container.addChild(this.dominanceAura);
  }

  initGrid(width: number, height: number): void {
    this.gridWidth = width;
    this.gridHeight = height;
    this.totalCells = width * height;

    // Clear old sprites
    this.cellSprites.forEach(sprite => {
      this.container.removeChild(sprite);
      sprite.destroy();
    });
    this.cellSprites = [];

    // Calculate cell size to fill EXACTLY 100% of screen (no gaps)
    const cellWidth = Math.ceil(window.innerWidth / width);
    const cellHeight = Math.ceil(window.innerHeight / height);
    const stepX = cellWidth;
    const stepY = cellHeight;

    // Create simple square sprites that fill screen completely
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const sprite = new PIXI.Sprite(this.baseTexture);
        sprite.width = cellWidth;
        sprite.height = cellHeight;
        sprite.x = x * stepX;
        sprite.y = y * stepY;
        sprite.tint = 0x1a1a1a;
        this.container.addChild(sprite);
        this.cellSprites.push(sprite);
      }
    }

    // Position at (0,0) since cells already fill screen
    this.container.position.x = 0;
    this.container.position.y = 0;
  }

  show(): void {
    this.container.alpha = 1;
    this.container.visible = true;
  }

  hide(): void {
    this.container.alpha = 0;
    this.container.visible = false;
  }

  updateGrid4Player(grid: number[]): void {
    if (grid.length !== this.totalCells) return;

    // Increment call count
    BattleRenderer.callCount++;

    // Check for cell changes and start color transitions
    for (let i = 0; i < this.totalCells; i++) {
      const prevValue = this.currentGrid ? this.currentGrid[i] : 0;
      const newValue = grid[i];

      // Cell changed - start color transition
      if (prevValue !== newValue) {
        const targetColor = this.getVirusColor(newValue);
        const currentTransition = this.cellColorTransitions.get(i);
        
        // Start new transition
        this.cellColorTransitions.set(i, {
          current: currentTransition?.target || this.getVirusColor(prevValue),
          target: targetColor,
          progress: 0
        });

        // Spawn combat sparks for captures
        if (prevValue !== 0) {
          const color1 = this.getVirusColor(prevValue);
          const color2 = this.getVirusColor(newValue);
          this.spawnCombatSparks(i, color1, color2);
        }
      }
    }

    this.currentGrid = [...grid];

    // Update all cell colors with interpolation
    for (let i = 0; i < this.totalCells; i++) {
      const sprite = this.cellSprites[i];
      if (!sprite) continue;

      // Update color transition
      const transition = this.cellColorTransitions.get(i);
      if (transition) {
        // Interpolate color
        transition.progress += this.COLOR_TRANSITION_SPEED;
        
        if (transition.progress >= 1) {
          // Transition complete
          sprite.tint = transition.target;
          this.cellColorTransitions.delete(i);
        } else {
          // Interpolating
          sprite.tint = this.interpolateColor(transition.current, transition.target, transition.progress);
        }
      }
    }

    // Update boundary cells and spawn tentacles
    this.updateBoundaryCells(grid);
    this.updateTentacles();

    // Update dominance aura (every 10 ticks)
    if (BattleRenderer.callCount % 10 === 0) {
      this.updateDominanceAura(grid);
    }

    // Update combat sparks
    this.updateSparks();
  }

  // Track call count for periodic updates
  private static callCount = 0;

  /**
   * Detect boundary cells (adjacent to enemies) and spawn tentacles
   */
  private updateBoundaryCells(grid: number[]): void {
    this.boundaryCells.clear();

    for (let i = 0; i < this.totalCells; i++) {
      const cellValue = grid[i];
      if (cellValue === 0) continue;

      const x = i % this.gridWidth;
      const y = Math.floor(i / this.gridHeight);

      // Check 4 cardinal directions for enemies
      const neighbors = [
        { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
        { dx: 0, dy: -1 }, { dx: 0, dy: 1 }
      ];

      for (const neighbor of neighbors) {
        const nx = x + neighbor.dx;
        const ny = y + neighbor.dy;

        if (nx >= 0 && nx < this.gridWidth && ny >= 0 && ny < this.gridHeight) {
          const nIdx = ny * this.gridWidth + nx;
          const neighborValue = grid[nIdx];

          // Enemy found - spawn tentacle!
          if (neighborValue !== 0 && neighborValue !== cellValue) {
            this.boundaryCells.add(i);
            this.spawnTentacle(i, nIdx, cellValue);
          }
        }
      }
    }
  }

  /**
   * Spawn a tentacle from one cell toward another
   */
  private spawnTentacle(fromCell: number, toCell: number, color: number): void {
    // Don't spawn if tentacle already exists between these cells
    const exists = this.activeTentacles.some(t => 
      t.fromCell === fromCell && t.toCell === toCell && t.visible
    );
    if (exists) return;

    // Get tentacle from pool
    const tentacle = this.tentaclePool.find(t => !t.visible);
    if (!tentacle) return;

    const fromX = (fromCell % this.gridWidth) * this.cellSprites[0]?.width;
    const fromY = Math.floor(fromCell / this.gridWidth) * this.cellSprites[0]?.height;
    const toX = (toCell % this.gridWidth) * this.cellSprites[0]?.width;
    const toY = Math.floor(toCell / this.gridWidth) * this.cellSprites[0]?.height;

    // Calculate direction and distance
    const dx = toX - fromX;
    const dy = toY - fromY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    // Draw tentacle (curved bezier-like shape)
    tentacle.clear();
    tentacle.lineStyle(2, color, 0.8);
    tentacle.moveTo(0, 0);
    
    // Control point for curve (offset perpendicular to direction)
    const curveOffset = 10;
    const midX = distance / 2;
    const midY = curveOffset * Math.sin(angle);
    
    // Quadratic curve to target
    tentacle.quadraticCurveTo(midX, midY, distance, 0);
    
    tentacle.x = fromX + this.cellSprites[0]?.width! / 2;
    tentacle.y = fromY + this.cellSprites[0]?.height! / 2;
    tentacle.rotation = angle;
    tentacle.visible = true;
    tentacle.scale.set(0.1);  // Start small

    this.activeTentacles.push({
      tentacle,
      fromCell,
      toCell,
      progress: 0,
      growthSpeed: 0.03 + Math.random() * 0.02,  // Variable speed
      color,
      visible: true
    });
  }

  /**
   * Update and animate all active tentacles
   */
  private updateTentacles(): void {
    for (let i = this.activeTentacles.length - 1; i >= 0; i--) {
      const tent = this.activeTentacles[i];
      
      // Grow tentacle
      tent.progress += tent.growthSpeed;
      
      // Pulse effect
      const pulse = 1 + Math.sin(Date.now() * 0.01 + tent.fromCell) * 0.2;
      
      if (tent.progress >= 1) {
        // Fully grown - start retracting
        tent.progress -= 0.02;
        
        if (tent.progress <= 0) {
          // Retract complete - remove tentacle
          tent.tentacle.clear();
          tent.tentacle.visible = false;
          this.activeTentacles.splice(i, 1);
          continue;
        }
      }

      // Apply scale and alpha based on progress
      const scale = tent.progress < 1 ? tent.progress : (2 - tent.progress);
      tent.tentacle.scale.set(scale * pulse);
      tent.tentacle.alpha = Math.max(0.3, scale);
    }
  }

  /**
   * Update dominance aura (glow for leading virus)
   */
  updateDominanceAura(grid: number[]): void {
    // Count cells per virus
    const counts = [0, 0, 0, 0, 0];
    for (const cellValue of grid) {
      if (cellValue >= 1 && cellValue <= 4) counts[cellValue]++;
    }

    // Find leader
    let leader = 0;
    let maxCount = 0;
    for (let i = 1; i <= 4; i++) {
      if (counts[i] > maxCount) {
        maxCount = counts[i];
        leader = i;
      }
    }

    // Only update if leader changed
    if (leader === this.currentLeader || leader === 0) return;
    this.currentLeader = leader;

    // Draw STRONG aura around leader's cells
    this.dominanceAura!.clear();
    const color = this.getVirusColor(leader);
    const intensity = Math.min(1.0, (maxCount / this.totalCells) * 1.2);  // BRIGHTER

    for (let i = 0; i < this.totalCells; i++) {
      if (grid[i] === leader) {
        const x = (i % this.gridWidth) * this.cellSprites[0]?.width!;
        const y = Math.floor(i / this.gridWidth) * this.cellSprites[0]?.height!;
        const size = this.cellSprites[0]?.width! || 30;

        // Draw THICKER outer glow
        this.dominanceAura!.lineStyle(4, color, intensity);  // THICKER line
        this.dominanceAura!.drawRect(x - 4, y - 4, size + 8, size + 8);  // LARGER glow
      }
    }
  }

  /**
   * Spawn combat sparks when cells fight
   */
  spawnCombatSparks(cellIndex: number, color1: number, color2: number): void {
    const x = (cellIndex % this.gridWidth) * this.cellSprites[0]?.width! + this.cellSprites[0]?.width! / 2;
    const y = Math.floor(cellIndex / this.gridWidth) * this.cellSprites[0]?.height! + this.cellSprites[0]?.height! / 2;

    // Spawn MORE sparks (8-12)
    const sparkCount = 8 + Math.floor(Math.random() * 5);
    for (let i = 0; i < sparkCount; i++) {
      const spark = this.sparkPool.find(s => !s.visible);
      if (!spark) continue;

      const angle = (Math.PI * 2 * i) / sparkCount + Math.random() * 0.5;
      const speed = 4 + Math.random() * 4;  // FASTER
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      // Alternate colors
      const color = i % 2 === 0 ? color1 : color2;

      spark.clear();
      spark.beginFill(color, 1.0);
      spark.drawCircle(0, 0, 5);  // BIGGER sparks
      spark.endFill();

      spark.x = x;
      spark.y = y;
      spark.visible = true;

      this.activeSparks.push({
        spark,
        x,
        y,
        vx,
        vy,
        life: 1.0,
        color
      });
    }
  }

  /**
   * Update and animate all active sparks
   */
  updateSparks(): void {
    for (let i = this.activeSparks.length - 1; i >= 0; i--) {
      const sparkData = this.activeSparks[i];

      // Move spark
      sparkData.x += sparkData.vx;
      sparkData.y += sparkData.vy;
      sparkData.vy += 0.2;  // STRONGER gravity

      // Fade out SLOWER
      sparkData.life -= 0.02;

      sparkData.spark.x = sparkData.x;
      sparkData.spark.y = sparkData.y;
      sparkData.spark.alpha = sparkData.life;
      sparkData.spark.scale.set(sparkData.life * 1.5);  // BIGGER

      // Remove when dead
      if (sparkData.life <= 0) {
        sparkData.spark.clear();
        sparkData.spark.visible = false;
        this.activeSparks.splice(i, 1);
      }
    }
  }

  /**
   * Show victory podium with top 3 viruses
   */
  showVictoryPodium(grid: number[]): void {
    // Count cells per virus
    const counts = [0, 0, 0, 0, 0];
    for (const cellValue of grid) {
      if (cellValue >= 1 && cellValue <= 4) counts[cellValue]++;
    }

    // Rank viruses
    const rankings = [1, 2, 3, 4].sort((a, b) => counts[b] - counts[a]);
    const total = counts.reduce((a, b) => a + b, 0);

    // Create podium container
    const podiumContainer = new PIXI.Container();
    podiumContainer.zIndex = 10000;
    this.container.addChild(podiumContainer);

    const colors = [0xff0066, 0x00ffff, 0xcc00ff, 0xffaa00];
    const names = ['PINK', 'CYAN', 'PURPLE', 'ORANGE'];

    // Podium positions (1st, 2nd, 3rd) - LARGER
    const positions = [
      { x: window.innerWidth / 2, y: window.innerHeight - 200, height: 180, rank: 0 },  // 1st - TALLER
      { x: window.innerWidth / 2 - 200, y: window.innerHeight - 100, height: 80, rank: 1 },  // 2nd
      { x: window.innerWidth / 2 + 200, y: window.innerHeight - 100, height: 80, rank: 2 },  // 3rd
    ];

    // Draw podiums
    for (let i = 0; i < 3; i++) {
      const pos = positions[i];
      const virusIdx = rankings[pos.rank];
      const color = colors[virusIdx - 1];
      const percent = total > 0 ? ((counts[virusIdx] / total) * 100).toFixed(1) : '0';

      // Podium block - BRIGHTER
      const podium = new PIXI.Graphics();
      podium.beginFill(color, 1.0);  // FULL opacity
      podium.lineStyle(5, 0xffffff, 1.0);  // THICKER border
      podium.drawRect(-80, 0, 160, -pos.height);  // WIDER
      podium.endFill();
      podium.x = pos.x;
      podium.y = pos.y;
      podiumContainer.addChild(podium);

      // Rank number - LARGER
      const rankText = new PIXI.Text(`#${pos.rank + 1}`, {
        fontFamily: 'Courier New',
        fontSize: 48,  // BIGGER
        fill: 0xffffff,
        stroke: { color: 0x000000, width: 6 }
      });
      rankText.anchor.set(0.5);
      rankText.x = pos.x;
      rankText.y = pos.y - pos.height - 80;
      podiumContainer.addChild(rankText);

      // Virus name - LARGER
      const nameText = new PIXI.Text(names[virusIdx - 1], {
        fontFamily: 'Courier New',
        fontSize: 28,  // BIGGER
        fill: color,
        stroke: { color: 0xffffff, width: 4 }
      });
      nameText.anchor.set(0.5);
      nameText.x = pos.x;
      nameText.y = pos.y - pos.height - 35;
      podiumContainer.addChild(nameText);

      // Percentage - LARGER
      const percentText = new PIXI.Text(`${percent}%`, {
        fontFamily: 'Courier New',
        fontSize: 36,  // BIGGER
        fill: 0xffffff,
        stroke: { color: 0x000000, width: 6 }
      });
      percentText.anchor.set(0.5);
      percentText.x = pos.x;
      percentText.y = pos.y - pos.height - 130;
      podiumContainer.addChild(percentText);
    }

    // Victory title - BIGGER
    const titleText = new PIXI.Text('🏆 VICTORY 🏆', {
      fontFamily: 'Courier New',
      fontSize: 72,  // MUCH BIGGER
      fill: 0xffff00,
      stroke: { color: 0x000000, width: 8 }
    });
    titleText.anchor.set(0.5);
    titleText.x = window.innerWidth / 2;
    titleText.y = 80;
    podiumContainer.addChild(titleText);

    // Animate podiums rising - FASTER
    const initialY = window.innerHeight + 300;
    podiumContainer.y = initialY;

    const animate = () => {
      podiumContainer.y += (0 - podiumContainer.y) * 0.15;  // FASTER animation
      if (Math.abs(podiumContainer.y) > 1) {
        requestAnimationFrame(animate);
      }
    };
    animate();

    // Remove after 8 seconds (LONGER)
    setTimeout(() => {
      podiumContainer.destroy({ children: true });
    }, 8000);
  }

  /**
   * Interpolate between two colors
   */
  private interpolateColor(color1: number, color2: number, factor: number): number {
    factor = Math.max(0, Math.min(1, factor));
    
    const r1 = (color1 >> 16) & 0xff;
    const g1 = (color1 >> 8) & 0xff;
    const b1 = color1 & 0xff;
    
    const r2 = (color2 >> 16) & 0xff;
    const g2 = (color2 >> 8) & 0xff;
    const b2 = color2 & 0xff;
    
    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);
    
    return (r << 16) | (g << 8) | b;
  }

  // Stub methods for compatibility
  onResize(): void {}
  updateGrid(grid: number[]): void { this.updateGrid4Player(grid); }
  setVirusParams(_a: any, _b: any): void {}
  setVirusParams4Player(_a: any, _b: any, _c: any, _d: any): void {}
  setInfestationData(_map: any): void {}
  update(_delta: number): void {}

  private getVirusColor(value: number): number {
    switch (value) {
      case 0: return 0x1a1a1a;
      case 1: return 0xff0066;  // HOT PINK
      case 2: return 0x00ffff;  // CYAN
      case 3: return 0xcc00ff;  // PURPLE
      case 4: return 0xffaa00;  // ORANGE
      default: return 0xffffff;
    }
  }

  destroy(): void {
    this.cellSprites.forEach(sprite => {
      this.container.removeChild(sprite);
      sprite.destroy();
    });
    this.cellSprites = [];
    this.container.destroy();
  }
}
