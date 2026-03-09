import * as PIXI from 'pixi.js';
import { NetworkManager } from '../../core/NetworkManager';

/**
 * Mouse Follower System - Simple Circle Version
 * Follows player's mouse with their virus color
 */

interface MouseFollowerData {
  playerId: string;
  label: 'mfl1' | 'mfl2';
  virusColor: number;
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
  graphics: PIXI.Graphics | null;
}

export class MouseFollowerManager {
  private followers: Map<string, MouseFollowerData> = new Map();
  private localPlayerId: string | null = null;
  private isCreator: boolean = false;
  private lastSendTime: number = 0;
  private readonly SEND_INTERVAL_MS: number = 33;

  constructor(
    private stage: PIXI.Container,
    private networkManager: NetworkManager
  ) {}

  /**
   * Setup network listeners
   */
  setupNetworkListeners() {
    this.networkManager.onMessage('mflUpdate', (data: {
      playerId: string;
      isCreator: boolean;
      x: number;
      y: number;
      virusColor?: number;
    }) => {
      this.updateRemoteFollower(data.playerId, data.isCreator, data.x, data.y, data.virusColor);
    });

    PIXI.Ticker.shared.add((ticker) => this.update(ticker.deltaTime));
  }

  /**
   * Call when room is joined/created
   */
  onRoomJoined(isCreator: boolean, localPlayerId: string, virusColor?: number) {
    this.localPlayerId = localPlayerId;
    this.isCreator = isCreator;

    const label = isCreator ? 'mfl1' : 'mfl2';
    const color = virusColor || (isCreator ? 0xff0066 : 0x00ffff);

    this.followers.set(localPlayerId, {
      playerId: localPlayerId,
      label,
      virusColor: color,
      targetX: window.innerWidth / 2,
      targetY: window.innerHeight / 2,
      currentX: window.innerWidth / 2,
      currentY: window.innerHeight / 2,
      graphics: null,
    });
  }

  /**
   * Update local mouse position
   */
  updateLocalPosition(x: number, y: number, virusColor?: number) {
    if (!this.localPlayerId) return;

    const follower = this.followers.get(this.localPlayerId);
    if (follower) {
      follower.targetX = x;
      follower.targetY = y;

      if (virusColor !== undefined) {
        follower.virusColor = virusColor;
      }

      const now = Date.now();
      if (now - this.lastSendTime > this.SEND_INTERVAL_MS) {
        this.networkManager.sendToRoom('mflUpdate', {
          isCreator: this.isCreator,
          x,
          y,
          virusColor: follower.virusColor
        });
        this.lastSendTime = now;
      }
    }
  }

  /**
   * Update remote follower from server
   */
  private updateRemoteFollower(
    playerId: string,
    isCreator: boolean,
    x: number,
    y: number,
    virusColor?: number
  ) {
    let follower = this.followers.get(playerId);

    if (!follower) {
      const label = isCreator ? 'mfl1' : 'mfl2';
      const color = virusColor || (isCreator ? 0xff0066 : 0x00ffff);

      follower = {
        playerId,
        label,
        virusColor: color,
        targetX: x,
        targetY: y,
        currentX: x,
        currentY: y,
        graphics: null,
      };

      this.followers.set(playerId, follower);
    }

    follower.targetX = x;
    follower.targetY = y;
    if (virusColor !== undefined) {
      follower.virusColor = virusColor;
    }
  }

  /**
   * Create visual representation
   */
  private createFollowerGraphics(follower: MouseFollowerData) {
    if (follower.graphics) return;

    const graphics = new PIXI.Graphics();
    graphics.zIndex = 1000;
    graphics.eventMode = 'none';
    
    this.stage.addChild(graphics);
    follower.graphics = graphics;
  }

  /**
   * Draw follower
   */
  private drawFollower(follower: MouseFollowerData) {
    if (!follower.graphics) return;

    const g = follower.graphics;
    g.clear();

    // Outer glow
    g.fill({ color: follower.virusColor, alpha: 0.3 });
    g.circle(0, 0, 20);

    // Main circle
    g.fill({ color: follower.virusColor, alpha: 0.8 });
    g.circle(0, 0, 12);

    // Center dot
    g.fill({ color: 0xffffff, alpha: 1 });
    g.circle(0, 0, 5);
  }

  /**
   * Update all followers
   */
  private update(delta: number) {
    const lerp = 0.2;

    this.followers.forEach((follower) => {
      if (!follower.graphics) {
        this.createFollowerGraphics(follower);
        return;
      }

      // Interpolate position
      follower.currentX += (follower.targetX - follower.currentX) * lerp * delta;
      follower.currentY += (follower.targetY - follower.currentY) * lerp * delta;

      // Update position
      follower.graphics.position.set(follower.currentX, follower.currentY);

      // Draw
      this.drawFollower(follower);
    });
  }

  /**
   * Clear all followers
   */
  destroy() {
    this.followers.forEach((follower) => {
      if (follower.graphics) {
        this.stage.removeChild(follower.graphics);
        follower.graphics.destroy();
      }
    });
    this.followers.clear();
  }
}
