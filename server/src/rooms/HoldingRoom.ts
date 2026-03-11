import { Room, Client } from 'colyseus';
import { RoomState, PlayerSchema, DraggableObjectSchema } from './schema';

export class HoldingRoom extends Room<RoomState> {
  private holdTimeout: NodeJS.Timeout | null = null;

  /**
   * Calculate total points spent on virus parameters
   */
  private calculateTotalPoints(params: Map<string, number>): number {
    if (!params) return 0;
    let sum = 0;
    params.forEach(value => {
      sum += value;
    });
    return sum;
  }

  onCreate(options: any) {
    this.setState(new RoomState());
    this.state.roomId = options.roomId || this.roomId;
    this.state.maxPlayers = 2;

    // Handle incoming messages using the modern messages object
    this.onMessage('updatePosition', (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        // Validate position updates to prevent cheating
        if (
          typeof data.x === 'number' &&
          typeof data.y === 'number' &&
          data.x >= 0 &&
          data.x <= 10000 && // Reasonable bounds
          data.y >= 0 &&
          data.y <= 10000
        ) {
          player.x = data.x;
          player.y = data.y;
        }
      }
    });

    this.onMessage('setPlayerName', (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player && typeof data.name === 'string' && data.name.length <= 20) {
        player.name = data.name;
        // Broadcast name update to all clients
        this.broadcast('playerNameUpdated', {
          playerId: client.sessionId,
          name: data.name
        });
      }
    });

    this.onMessage('requestHoldHands', (client, data) => {
      const requestingPlayer = this.state.players.get(client.sessionId);
      const targetPlayer = this.state.players.get(data.targetPlayerId);

      if (!requestingPlayer || !targetPlayer) return;

      // Check if both players are in the same room
      if (this.state.players.has(client.sessionId) && this.state.players.has(data.targetPlayerId)) {
        // Start holding hands
        requestingPlayer.isHoldingHands = true;
        requestingPlayer.holdingHandsWith = data.targetPlayerId;
        targetPlayer.isHoldingHands = true;
        targetPlayer.holdingHandsWith = client.sessionId;

        // Broadcast to all clients that these players are now holding hands
        this.broadcast('holdHands', {
          player1Id: client.sessionId,
          player2Id: data.targetPlayerId
        });
      }
    });

    this.onMessage('releaseHands', (client) => {
      const releasingPlayer = this.state.players.get(client.sessionId);
      if (!releasingPlayer || !releasingPlayer.isHoldingHands) return;

      const otherPlayerId = releasingPlayer.holdingHandsWith;
      const otherPlayer = this.state.players.get(otherPlayerId);

      // Release hold for both players
      releasingPlayer.isHoldingHands = false;
      releasingPlayer.holdingHandsWith = '';

      if (otherPlayer) {
        otherPlayer.isHoldingHands = false;
        otherPlayer.holdingHandsWith = '';
      }

      // Broadcast to all clients that the hold has been released
      this.broadcast('releaseHands', {
        player1Id: client.sessionId,
        player2Id: otherPlayerId
      });
    });

    // Handle draggable object messages (new simplified API)
    this.onMessage('startDragObject', (client, data) => {
      // Check if object already being dragged
      const existingObj = this.state.objects.get(data.objectId);
      if (existingObj && existingObj.isBeingDragged) {
        // Already being dragged by someone else
        return;
      }

      // Create or update the draggable object
      let obj = existingObj;
      if (!obj) {
        obj = new DraggableObjectSchema();
        obj.id = data.objectId;
        obj.x = data.startX || 400;
        obj.y = data.startY || 300;
        obj.radius = 50;
        obj.color = 0x00ffff;
        obj.isBeingDragged = false;
        obj.draggedBy = '';
        obj.isFollower = false;
        this.state.objects.set(obj.id, obj);
      }

      obj.isBeingDragged = true;
      obj.draggedBy = client.sessionId;

      // Broadcast to all clients that an object is being dragged
      this.broadcast('objectDragStarted', {
        objectId: data.objectId,
        playerId: client.sessionId
      });
    });

    this.onMessage('updateObjectPosition', (client, data) => {
      const obj = this.state.objects.get(data.objectId);
      if (obj && obj.isBeingDragged && obj.draggedBy === client.sessionId) {
        // Validate position updates to prevent cheating
        if (
          typeof data.x === 'number' &&
          typeof data.y === 'number'
        ) {
          obj.x = data.x;
          obj.y = data.y;

          // Broadcast the position update to all clients
          this.broadcast('objectPositionUpdated', {
            objectId: data.objectId,
            x: data.x,
            y: data.y
          });
        }
      }
    });

    this.onMessage('stopDragObject', (client, data) => {
      const obj = this.state.objects.get(data.objectId);
      if (obj && obj.draggedBy === client.sessionId) {
        obj.isBeingDragged = false;
        obj.draggedBy = '';

        // Broadcast to all clients that dragging has stopped
        this.broadcast('objectDragStopped', {
          objectId: data.objectId,
          playerId: client.sessionId
        });
      }
    });

    // Handle hover state changes (sync hover across all clients)
    this.onMessage('updateObjectHover', (client, data) => {
      const obj = this.state.objects.get(data.objectId);
      if (obj && typeof data.isHovered === 'boolean') {
        // Update server state
        obj.isHovered = data.isHovered;
        obj.hoveredBy = data.isHovered ? client.sessionId : '';

        // Broadcast to ALL clients (including sender) with player info
        this.broadcast('objectHoverChanged', {
          objectId: data.objectId,
          isHovered: data.isHovered,
          hoveredBy: obj.hoveredBy
        });
      }
    });

    // Handle chat window drag
    this.onMessage('startDragChat', (client, data) => {
      // Just broadcast that chat drag started (no exclusive lock needed)
      this.broadcast('chatDragStarted', {
        objectId: data.objectId
      });
    });

    this.onMessage('updateChatPosition', (client, data) => {
      if (
        typeof data.x === 'number' &&
        typeof data.y === 'number'
      ) {
        // Broadcast new chat position to all clients
        this.broadcast('chatPositionUpdated', {
          x: data.x,
          y: data.y
        });
      }
    });

    // Handle draggable object messages (legacy API - kept for backwards compatibility)
    this.onMessage('startDraggingObject', (client, data) => {
      const obj = this.state.objects.get(data.objectId);
      if (obj) {
        obj.isBeingDragged = true;
        obj.draggedBy = client.sessionId;
        
        // Broadcast to all clients that an object is being dragged
        this.broadcast('objectDragStarted', {
          objectId: data.objectId,
          playerId: client.sessionId
        });
      }
    });

    this.onMessage('updateObjectPosition', (client, data) => {
      const obj = this.state.objects.get(data.objectId);
      if (obj && obj.isBeingDragged && obj.draggedBy === client.sessionId) {
        // Validate position updates to prevent cheating
        if (
          typeof data.x === 'number' &&
          typeof data.y === 'number' &&
          data.x >= 0 &&
          data.x <= 10000 && // Reasonable bounds
          data.y >= 0 &&
          data.y <= 10000
        ) {
          obj.x = data.x;
          obj.y = data.y;
          
          // Broadcast the position update to all clients
          this.broadcast('objectPositionUpdated', {
            objectId: data.objectId,
            x: data.x,
            y: data.y
          });
        }
      }
    });

    this.onMessage('stopDraggingObject', (client, data) => {
      const obj = this.state.objects.get(data.objectId);
      if (obj && obj.draggedBy === client.sessionId) {
        obj.isBeingDragged = false;
        obj.draggedBy = '';

        // Broadcast to all clients that dragging has stopped
        this.broadcast('objectDragStopped', {
          objectId: data.objectId,
          playerId: client.sessionId
        });
      }
    });

    // Handle chat messages
    this.onMessage('chatMessage', (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player && typeof data.message === 'string' && data.message.trim().length > 0) {
        // Limit message length
        const message = data.message.trim().substring(0, 200);
        
        // Broadcast the chat message to all players in the room
        this.broadcast('chatMessage', {
          playerId: client.sessionId,
          playerName: player.name,
          message: message,
          timestamp: Date.now()
        });
      }
    });

    // Handle ball creation
    this.onMessage('createBall', (client, data) => {
      // Validate the data
      if (
        typeof data.id === 'string' &&
        typeof data.x === 'number' &&
        typeof data.y === 'number' &&
        typeof data.radius === 'number' &&
        typeof data.color === 'number'
      ) {
        // Create a new ball object
        const ball = new DraggableObjectSchema();
        ball.id = data.id;
        ball.x = data.x;
        ball.y = data.y;
        ball.radius = data.radius;
        ball.color = data.color;
        ball.isBeingDragged = false;
        ball.draggedBy = '';
        ball.isFollower = false;

        // Add the ball to the room state
        this.state.objects.set(ball.id, ball);

        // Broadcast to all clients that a new ball has been created
        this.broadcast('ballCreated', {
          id: ball.id,
          x: ball.x,
          y: ball.y,
          radius: ball.radius,
          color: ball.color
        });
      }
    });

    // Handle follower creation
    this.onMessage('createFollower', (client, data) => {
      // Validate the data
      if (
        typeof data.id === 'string' &&
        typeof data.x === 'number' &&
        typeof data.y === 'number' &&
        typeof data.radius === 'number' &&
        typeof data.color === 'number' &&
        typeof data.owner === 'string'
      ) {
        // Create a new follower object
        const follower = new DraggableObjectSchema();
        follower.id = data.id;
        follower.x = data.x;
        follower.y = data.y;
        follower.radius = data.radius;
        follower.color = data.color;
        follower.isBeingDragged = false;
        follower.draggedBy = '';
        follower.isFollower = true;
        follower.owner = data.owner;
        follower.targetX = data.x; // Initially same as position
        follower.targetY = data.y;

        // Add the follower to the room state
        this.state.objects.set(follower.id, follower);

        // Broadcast to all clients that a new follower has been created
        this.broadcast('followerCreated', {
          id: follower.id,
          x: follower.x,
          y: follower.y,
          radius: follower.radius,
          color: follower.color,
          owner: follower.owner
        });
      }
    });

    // Handle follower target updates
    this.onMessage('updateFollowerTarget', (client, data) => {
      const follower = this.state.objects.get(data.id);
      if (follower && follower.isFollower && follower.owner === client.sessionId) {
        // Validate the data
        if (
          typeof data.id === 'string' &&
          typeof data.x === 'number' &&
          typeof data.y === 'number'
        ) {
          // Update the follower's target position
          follower.targetX = data.x;
          follower.targetY = data.y;

          // Broadcast to all clients that a follower's target has been updated
          this.broadcast('followerTargetUpdated', {
            id: data.id,
            x: data.x,
            y: data.y
          });
        }
      }
    });


    // Handle virus parameter updates
    this.onMessage('updateVirusParams', (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player && data.params) {
        // Validate and update virus parameters
        // In a real implementation, you would validate the parameters here
        
        // Broadcast the updated parameters to all players in the room
        this.broadcast('virusParamsUpdated', {
          playerId: client.sessionId,
          params: data.params
        });
      }
    });

    // Handle ready status toggling
    this.onMessage('toggleReady', (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player && typeof data.isReady === 'boolean') {
        // Update player's ready status
        player.isReady = data.isReady;

        // Broadcast the ready status to all players in the room
        this.broadcast('playerReadyStatus', {
          playerId: client.sessionId,
          isReady: data.isReady
        });

        // Check if all players are ready to start the virus battle
        const allPlayersReady = Array.from(this.state.players.values()).every((p: PlayerSchema) => p.isReady);
        if (allPlayersReady && this.state.players.size === 2) {
          // Start the virus battle simulation
          this.startVirusBattle();
        }
      }
    });

    // Handle battle start from client (when START button clicked)
    this.onMessage('startBattleNow', (client) => {
      console.log(`Client ${client.sessionId} requested immediate battle start`);
      // Start battle immediately for all clients
      if (this.state.vGridActive && !this.state.vGrid.some((cell: number) => cell !== 0)) {
        // vGrid is still empty, start simulation now
        this.startBattleSimulation();
      }
    });

    // Handle virus parameter updates
    this.onMessage('updateVirusParams', (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player && data.params) {
        // === CRITICAL FIX: Properly update Colyseus Map ===
        player.virusParams.clear();
        Object.entries(data.params).forEach(([key, value]) => {
          player.virusParams.set(key, Number(value));  // ensure number
        });

        console.log(`[SERVER] ✅ Player ${client.sessionId.slice(0,8)} updated params. Total points: ${this.calculateTotalPoints(player.virusParams)}/12`);

        this.broadcast('virusParamsUpdated', {
          playerId: client.sessionId,
          params: data.params
        });

        // Check if this player maxed out
        const totalPoints = this.calculateTotalPoints(player.virusParams);
        if (totalPoints === 12) {
          player.isReady = true;
          this.broadcast('playerReadyStatus', {
            playerId: client.sessionId,
            isReady: true
          });

          // Check ALL players
          const allPlayersMaxed = Array.from(this.state.players.values()).every((p: PlayerSchema) => {
            return this.calculateTotalPoints(p.virusParams);
          });

          console.log(`[SERVER] All players maxed? ${allPlayersMaxed} (players: ${this.state.players.size})`);

          if (allPlayersMaxed && this.state.players.size === 2) {
            console.log(`[SERVER] 🔥 BOTH PLAYERS READY — STARTING BATTLE IN 1 SECOND`);
            setTimeout(() => {
              this.startVirusBattle();
            }, 1000);
          }
        }
      }
    });

    // Handle cursor updates
    this.onMessage('updateCursor', (client, data) => {
      const player = this.state.players.get(client.sessionId);
      if (player && typeof data.x === 'number' && typeof data.y === 'number') {
        player.cursorX = data.x;
        player.cursorY = data.y;

        // Broadcast cursor update to other players
        this.broadcast('cursorUpdate', {
          playerId: client.sessionId,
          x: data.x,
          y: data.y
        }, { except: client });
      }
    });

    // Handle follower updates (new simplified cursor system)
    this.onMessage('followerUpdate', (client, data) => {
      if (typeof data.x === 'number' && typeof data.y === 'number') {
        // Broadcast follower position to other players only
        this.broadcast('followerUpdate', {
          playerId: client.sessionId,
          x: data.x,
          y: data.y
        }, { except: client });
      }
    });

    // Handle mouse follower updates (MFL system - broadcasts to ALL including sender)
    this.onMessage('mflUpdate', (client, data) => {
      if (typeof data.x === 'number' && typeof data.y === 'number' && typeof data.isCreator === 'boolean') {
        // Get player to verify isCreator status
        const player = this.state.players.get(client.sessionId);
        if (player) {
          // Use the virusColor from client, or determine by isCreator
          let broadcastColor = data.virusColor;
          if (broadcastColor === undefined || broadcastColor === null) {
            broadcastColor = data.isCreator ? 0xff0066 : 0x00ffff;
          }
          
          console.log('[MFL] Received update from', client.sessionId.substring(0, 4), 
                      'isCreator:', data.isCreator, 
                      'color:', data.virusColor, 
                      'broadcasting:', broadcastColor.toString(16));
          
          // Broadcast to ALL players (including sender) so everyone sees both followers
          this.broadcast('mflUpdate', {
            playerId: client.sessionId,
            isCreator: data.isCreator,
            x: data.x,
            y: data.y,
            virusColor: broadcastColor
          });
        }
      }
    });
  }

  onActivate() {
    // Set up automatic room cleanup when empty
    this.setSimulationInterval((deltaTime) => {
      if (this.clients.length === 0) {
        if (this.holdTimeout) clearTimeout(this.holdTimeout);
        this.holdTimeout = setTimeout(() => {
          if (this.clients.length === 0) {
            this.disconnect();
          }
        }, 5 * 60 * 1000); // 5 minutes
      } else {
        if (this.holdTimeout) {
          clearTimeout(this.holdTimeout);
          this.holdTimeout = null;
        }
      }
    });
  }

  private startVirusBattle(): void {
    console.log('Starting virus battle!');

    // Grid size configuration (matches client's GridConfig.ts)
    const GRID_WIDTH = HoldingRoom.GRID_WIDTH;
    const GRID_HEIGHT = HoldingRoom.GRID_HEIGHT;
    const GRID_TOTAL = HoldingRoom.GRID_TOTAL; // 2560 cells

    // Initialize the virus battle state
    // Set up the vGrid (64x40 = 2560 cells)
    this.state.vGrid = new Array(GRID_TOTAL).fill(0); // 0 = EMPTY
    this.state.vGridActive = true;

    // Get player parameters for the simulation
    const players = Array.from(this.state.players.values());
    if (players.length >= 2) {
      // Place viruses based on team number
      for (const player of players) {
        if ((player as PlayerSchema).team === 1) {
          // Team 1 (RED) - TOP-LEFT
          const topLeftX = 2;
          const topLeftY = 2;
          const topLeftIndex = topLeftY * GRID_WIDTH + topLeftX;
          if (topLeftIndex < this.state.vGrid.length) {
            this.state.vGrid[topLeftIndex] = 1; // 1 = VIRUS_A (RED)
          }
        } else if ((player as PlayerSchema).team === 2) {
          // Team 2 (BLUE) - BOTTOM-RIGHT
          const bottomRightX = GRID_WIDTH - 3;
          const bottomRightY = GRID_HEIGHT - 3;
          const bottomRightIndex = bottomRightY * GRID_WIDTH + bottomRightX;
          if (bottomRightIndex < this.state.vGrid.length) {
            this.state.vGrid[bottomRightIndex] = 2; // 2 = VIRUS_B (BLUE)
          }
        }
      }
    }

    // Отправляем сигнал клиентам для запуска обратного отсчёта
    this.broadcast('startCountdown', {
      message: 'Start countdown!',
      vGrid: this.state.vGrid,
      width: GRID_WIDTH,
      height: GRID_HEIGHT
    });

    // Битва начнётся автоматически через 4 секунды (3-2-1-СТАРТ)
    // Если игроки не нажмут кнопку раньше
    setTimeout(() => {
      // Проверяем, не началась ли битва уже
      if (this.state.vGridActive && this.clients.length > 0) {
        this.startBattleSimulation();
        console.log('Battle started automatically after timeout');
      }
    }, 4000);
  }

  private startBattleSimulation(): void {
    // This implements the tick-based virus spread simulation on the server
    // MULTIPLAYER: 4x faster than Single Player (125ms vs 500ms = 8 ticks/sec)
    const MP_TICK_RATE_MS = 125;
    
    console.log(`[BATTLE] Starting battle simulation with ${MP_TICK_RATE_MS}ms ticks (4x speed)`);

    let tickCount = 0;
    const battleInterval = setInterval(() => {
      // Update virus positions based on parameters
      this.updateVirusSpread();

      // Check win conditions
      if (this.checkWinConditions()) {
        clearInterval(battleInterval);
        this.endVirusBattle();
      }

      tickCount++;

      // Stop after 1000 ticks or if battle is no longer active
      if (tickCount > 1000 || !this.state.vGridActive) {
        clearInterval(battleInterval);
        this.endVirusBattle();
      }
    }, MP_TICK_RATE_MS); // 125ms per tick (8 ticks/second) - 4x faster than SP

    // Store interval reference to allow cleanup
    (this as any).battleInterval = battleInterval;
  }

  // Grid dimensions for multiplayer battles (must match client - 64x40 = 2560 cells)
  private static readonly GRID_WIDTH = 64;
  private static readonly GRID_HEIGHT = 40;
  private static readonly GRID_TOTAL = HoldingRoom.GRID_WIDTH * HoldingRoom.GRID_HEIGHT;

  /**
   * Get virus params for a player by team (1 or 2)
   */
  private getPlayerParams(team: number): Record<string, number> | null {
    const players = Array.from(this.state.players.values()) as PlayerSchema[];
    const player = players.find((p: PlayerSchema) => p.team === team);
    if (!player) return null;

    const params: Record<string, number> = {};
    player.virusParams.forEach((value: number, key: string) => {
      params[key] = value;
    });
    return params;
  }

  /**
   * Calculate surround pressure for a cell
   */
  private calculateSurroundPressure(
    grid: number[],
    x: number,
    y: number,
    virusType: number,
    width: number,
    height: number
  ): { enemyCount: number; allyCount: number; pressureLevel: number } {
    let enemyCount = 0;
    let allyCount = 0;

    const neighbors = [
      { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
      { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
      { dx: -1, dy: -1 }, { dx: 1, dy: -1 },
      { dx: -1, dy: 1 }, { dx: 1, dy: 1 }
    ];

    for (const neighbor of neighbors) {
      const nx = x + neighbor.dx;
      const ny = y + neighbor.dy;
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nIdx = ny * width + nx;
        const neighborCell = grid[nIdx];
        if (neighborCell === virusType) allyCount++;
        else if (neighborCell !== 0) enemyCount++;
      }
    }

    return {
      enemyCount,
      allyCount,
      pressureLevel: enemyCount / 8
    };
  }

  /**
   * Attack cell with full parameter mechanics
   */
  private attackCell(
    grid: number[],
    idx: number,
    attackerType: number,
    defenderType: number,
    attackerParams: any
  ): boolean {
    // Get defender params
    const defenderParams = this.getPlayerParams(defenderType);
    if (!defenderParams) return false;

    // === ATTACK POWER ===
    const aggressionPower = (attackerParams.aggression || 0) * 1.0;
    const virulencePower = (attackerParams.virulence || 0) * 0.5;
    const lethalityPower = (attackerParams.lethality || 0) * 0.75;
    const baseAttackPower = aggressionPower + virulencePower + lethalityPower;

    // === DEFENSE POWER ===
    const defensePower = (defenderParams.defense || 0) * 1.0 + (defenderParams.resilience || 0) * 0.5;

    // === CAPTURE CHANCE ===
    const attackDiff = baseAttackPower - defensePower;
    let captureChance = 0.4 + (attackDiff * 0.02); // 40% base + 2% per diff

    // === VIRULENCE ARMOR PENETRATION ===
    const armorPenetration = (attackerParams.virulence || 0) / 40; // 0-30%
    const effectiveDefense = defensePower * (1 - armorPenetration);
    captureChance = 0.4 + ((baseAttackPower - effectiveDefense) * 0.02);

    // === LETHALITY BONUS VS HIGH DEFENSE ===
    if ((defenderParams.defense || 0) > 6) {
      const highDefenseBonus = ((defenderParams.defense || 0) - 6) * (attackerParams.lethality || 0) * 0.01;
      captureChance += highDefenseBonus;
    }

    // === STEALTH COUNTER ===
    const stealthDefense = (defenderParams.stealth || 0) * 0.02; // Stealth reduces capture chance
    captureChance -= stealthDefense;

    // Clamp chance
    captureChance = Math.max(0.05, Math.min(0.95, captureChance));

    if (Math.random() < captureChance) {
      grid[idx] = attackerType;
      return true;
    }
    return false;
  }

  /**
   * Attempt infestation (mutation-based conversion)
   * FIXED: Unified formula matches Single Player exactly
   */
  private attemptInfestation(
    grid: number[],
    idx: number,
    attackerType: number,
    defenderType: number,
    attackerParams: any,
    defenderParams: any,
    surroundPressure: number
  ): boolean {
    // === BASE INFESTATION CHANCE (20% fixed) ===
    let infestationChance = 0.20;

    // === ATTACKER BONUSES ===
    // Mutation: +4% per point (max +48%)
    infestationChance += (attackerParams.mutation || 0) * 0.04;
    
    // Contagiousness: +2% per point (max +24%)
    infestationChance += (attackerParams.contagiousness || 0) * 0.02;
    
    // Stealth: +3% per point (max +36%) - helps attacker penetrate
    infestationChance += (attackerParams.stealth || 0) * 0.03;
    
    // Virulence: +1.5% per point (max +18%)
    infestationChance += (attackerParams.virulence || 0) * 0.015;
    
    // Surround Pressure: +20% max (pressure is 0-1, so *0.2)
    infestationChance += surroundPressure * 0.20;

    // === DEFENDER RESISTANCES ===
    // Intellect: -3% per point (max -36%)
    const intellectResist = (defenderParams.intellect || 0) * 0.03;
    infestationChance -= intellectResist;
    
    // Defense: -2% per point, reduced by stealth penetration
    const stealthPenetration = (attackerParams.stealth || 0) / 12; // 0-100% penetration
    const defenseEffective = (defenderParams.defense || 0) * (1 - stealthPenetration);
    const defenseResist = defenseEffective * 0.02;
    infestationChance -= defenseResist;
    
    // Resilience: -1.5% per point (max -18%)
    const resilienceResist = (defenderParams.resilience || 0) * 0.015;
    infestationChance -= resilienceResist;

    // === CLAMP TO VALID RANGE (2% - 95%) ===
    infestationChance = Math.max(0.02, Math.min(0.95, infestationChance));

    if (Math.random() < infestationChance) {
      grid[idx] = attackerType;
      return true;
    }
    return false;
  }

  /**
   * Spread virus with full parameter mechanics
   */
  private spreadVirus(
    grid: number[],
    x: number,
    y: number,
    virusType: number,
    width: number,
    height: number
  ): void {
    // Get params for this virus
    const params = this.getPlayerParams(virusType);
    if (!params) return;

    // === BASE SPREAD CHANCE ===
    const baseSpreadChance = ((params.speed || 0) + (params.reproduction || 0)) / 20;

    // === AGGRESSION BONUS ===
    const aggressionBonus = (params.aggression || 0) * 0.025;

    // === VIRULENCE BONUS (extra attempts) ===
    const virulenceBonus = Math.floor((params.virulence || 0) / 4);

    // === CONTAGIOUSNESS (spread attempts) ===
    const spreadAttempts = 1 + Math.floor((params.contagiousness || 0) / 5);
    const totalAttempts = spreadAttempts + virulenceBonus;

    // === DIRECTION LOGIC - FIXED: Always 8 directions (matches Single Player) ===
    const neighbors = [
      { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
      { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
      { dx: -1, dy: -1 }, { dx: 1, dy: -1 },
      { dx: -1, dy: 1 }, { dx: 1, dy: 1 }
    ];

    for (let attempt = 0; attempt < totalAttempts; attempt++) {
      const neighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
      const nx = x + neighbor.dx;
      const ny = y + neighbor.dy;

      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;

      const nIdx = ny * width + nx;
      const neighborCell = grid[nIdx];

      // === EMPTY CELL - SPREAD ===
      if (neighborCell === 0) {
        if (Math.random() < baseSpreadChance) {
          grid[nIdx] = virusType;
        }
      }
      // === ENEMY CELL - ATTACK ===
      else if (neighborCell !== virusType) {
        const attackChance = baseSpreadChance + aggressionBonus;
        if (Math.random() < attackChance) {
          // Calculate surround pressure for infestation
          const surround = this.calculateSurroundPressure(grid, nx, ny, neighborCell, width, height);

          // Get enemy params
          const enemyParams = this.getPlayerParams(neighborCell);

          // Try infestation if Mutation >= 4
          if ((params.mutation || 0) >= 4 && enemyParams && Math.random() < 0.5) {
            const infested = this.attemptInfestation(
              grid, nIdx, virusType, neighborCell, params, enemyParams, surround.pressureLevel
            );
            if (!infested) {
              this.attackCell(grid, nIdx, virusType, neighborCell, params);
            }
          } else {
            this.attackCell(grid, nIdx, virusType, neighborCell, params);
          }
        }
      }
    }

    // === HANDLE SURROUNDED CELLS ===
    const surround = this.calculateSurroundPressure(grid, x, y, virusType, width, height);
    if (surround.pressureLevel > 0.5) {
      // High pressure - cell reacts

      // High Intellect = spread to allies (call for help)
      if ((params.intellect || 0) >= 8) {
        const allyNeighbors = [
          { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
          { dx: 0, dy: -1 }, { dx: 0, dy: 1 }
        ];
        const attempts = 1 + Math.floor((params.intellect || 0) / 4);
        for (let i = 0; i < attempts; i++) {
          const n = allyNeighbors[Math.floor(Math.random() * allyNeighbors.length)];
          const nx = x + n.dx, ny = y + n.dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nIdx = ny * width + nx;
            if (grid[nIdx] === 0) {
              const spreadChance = ((params.intellect || 0) + (params.mobility || 0)) / 24;
              if (Math.random() < spreadChance) grid[nIdx] = virusType;
            }
          }
        }
      }

      // High Mutation = desperate conversion before death
      if ((params.mutation || 0) >= 8 && surround.enemyCount > 0) {
        const allNeighbors = [
          { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
          { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
          { dx: -1, dy: -1 }, { dx: 1, dy: -1 },
          { dx: -1, dy: 1 }, { dx: 1, dy: 1 }
        ];
        const enemies: any[] = [];
        for (const n of allNeighbors) {
          const nx = x + n.dx, ny = y + n.dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nIdx = ny * width + nx;
            if (grid[nIdx] !== 0 && grid[nIdx] !== virusType) {
              enemies.push({ idx: nIdx, type: grid[nIdx] });
            }
          }
        }
        if (enemies.length > 0) {
          const target = enemies[Math.floor(Math.random() * enemies.length)];
          const desperateChance = ((params.mutation || 0) / 12) * 0.6;
          if (Math.random() < desperateChance) grid[target.idx] = virusType;
        }
      }
    }
  }

  private updateVirusSpread(): void {
    console.log('[BATTLE] Running virus spread tick with FULL parameter mechanics');

    const GRID_WIDTH = HoldingRoom.GRID_WIDTH;
    const GRID_HEIGHT = HoldingRoom.GRID_HEIGHT;

    // Create a copy to avoid race conditions
    const newGrid = [...this.state.vGrid];
    let spreadCount = 0;
    let combatCount = 0;

    // Process each cell
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const idx = y * GRID_WIDTH + x;
        const cell = this.state.vGrid[idx];

        if (cell !== 0) {
          // Spread this virus using full parameter mechanics
          const beforeCell = newGrid[idx];
          this.spreadVirus(newGrid, x, y, cell, GRID_WIDTH, GRID_HEIGHT);
          const afterCell = newGrid[idx];

          if (beforeCell !== afterCell) spreadCount++;
        }
      }
    }

    // Count combat events (cells that changed owner)
    for (let i = 0; i < this.state.vGrid.length; i++) {
      if (this.state.vGrid[i] !== 0 && newGrid[i] !== this.state.vGrid[i]) {
        combatCount++;
      }
    }

    // Update state
    this.state.vGrid = newGrid;

    console.log(`[BATTLE] Spread: ${spreadCount}, Combat: ${combatCount}`);

    // Broadcast to clients
    this.broadcast('virusTick', {
      tick: Date.now(),
      vGrid: this.state.vGrid,
      width: GRID_WIDTH,
      height: GRID_HEIGHT
    });
  }

  private checkWinConditions(): boolean {
    // Check if one virus has taken over 90% of OCCUPIED cells
    const totalCells = this.state.vGrid.length;
    let virusACount = 0;
    let virusBCount = 0;

    for (const cell of this.state.vGrid) {
      if (cell === 1) virusACount++;
      else if (cell === 2) virusBCount++;
    }

    const occupiedCells = virusACount + virusBCount;

    // Early game - not enough cells yet
    if (occupiedCells < 10) return false;

    // Calculate percentage of OCCUPIED cells (not total grid)
    const virusAPercent = (virusACount / occupiedCells) * 100;
    const virusBPercent = (virusBCount / occupiedCells) * 100;

    // Win condition: one virus controls 90% or more of occupied cells
    if (virusAPercent >= 90) {
      console.log(`Virus A wins with ${virusAPercent.toFixed(2)}% (${virusACount}/${occupiedCells} occupied)`);
      return true;
    }

    if (virusBPercent >= 90) {
      console.log(`Virus B wins with ${virusBPercent.toFixed(2)}% (${virusBCount}/${occupiedCells} occupied)`);
      return true;
    }

    // Alternative win: one virus is completely eliminated
    if (virusACount === 0 && virusBCount > 0) {
      console.log(`Virus B wins by elimination (${virusBCount} cells remaining)`);
      return true;
    }

    if (virusBCount === 0 && virusACount > 0) {
      console.log(`Virus A wins by elimination (${virusACount} cells remaining)`);
      return true;
    }

    return false;
  }

  private endVirusBattle(): void {
    console.log('Virus battle ended!');

    // Determine winner
    const totalCells = this.state.vGrid.length;
    let virusACount = 0;
    let virusBCount = 0;

    for (const cell of this.state.vGrid) {
      if (cell === 1) virusACount++;
      else if (cell === 2) virusBCount++;
    }

    let winner = 'Draw';
    if (virusACount > virusBCount) {
      winner = 'Player A';
    } else if (virusBCount > virusACount) {
      winner = 'Player B';
    }

    // Broadcast the end of the battle
    this.broadcast('virusBattleEnded', {
      message: `Virus battle has ended! Winner: ${winner}`,
      winner: winner,
      virusACount: virusACount,
      virusBCount: virusBCount,
      timestamp: Date.now()
    });

    // Clean up the battle state
    this.state.vGridActive = false;
    this.state.vGrid = [];

    // Clear the battle interval if it exists
    if ((this as any).battleInterval) {
      clearInterval((this as any).battleInterval);
      delete (this as any).battleInterval;
    }
  }

  onJoin(client: Client, options: any) {
    // Check if room is full
    if (this.clients.length > this.state.maxPlayers) {
      client.leave(4000); // Custom close code for "room full"
      return;
    }

    // Create a new player
    const player = new PlayerSchema();
    player.id = client.sessionId;
    player.name = `Player${client.sessionId.substring(0, 4)}`;
    player.x = Math.random() * 400 + 100; // Random starting position
    player.y = Math.random() * 300 + 100;
    player.color = this.generateRandomColor(); // Assign a random color
    player.isRoomCreator = this.state.players.size === 0; // First player is the room creator
    
    // Assign team: Player 1 (room creator) = Team 1 (Red), Player 2 = Team 2 (Blue)
    player.team = this.state.players.size === 0 ? 1 : 2;

    // Initialize virus parameters to default values
    const paramNames = [
      'aggression', 'mutation', 'speed', 'defense',
      'reproduction', 'stealth', 'virulence', 'resilience',
      'mobility', 'intellect', 'contagiousness', 'lethality'
    ];

    paramNames.forEach(param => {
      player.virusParams.set(param, 0);
    });

    // Add player to state
    this.state.players.set(client.sessionId, player);

    console.log(`${client.sessionId} joined room ${this.roomId} as Team ${player.team}`);
  }

  onLeave(client: Client, consented: boolean) {
    // Remove player from state
    this.state.players.delete(client.sessionId);
    
    // If player was holding hands, release the hold
    this.releaseHoldsForPlayer(client.sessionId);
    
    console.log(`${client.sessionId} left room ${this.roomId}`);
  }

  onDispose() {
    console.log(`Disposing room ${this.roomId}`);
    if (this.holdTimeout) clearTimeout(this.holdTimeout);
  }

  private generateRandomColor(): number {
    // Generate a random bright color (avoiding too dark colors)
    const r = Math.floor(Math.random() * 128) + 127; // 127-255
    const g = Math.floor(Math.random() * 128) + 127;
    const b = Math.floor(Math.random() * 128) + 127;
    return (r << 16) + (g << 8) + b;
  }

  private releaseHoldsForPlayer(playerId: string) {
    const player = this.state.players.get(playerId);
    if (player && player.isHoldingHands) {
      const otherPlayerId = player.holdingHandsWith;
      const otherPlayer = this.state.players.get(otherPlayerId);
      
      // Release hold for both players
      player.isHoldingHands = false;
      player.holdingHandsWith = '';
      
      if (otherPlayer) {
        otherPlayer.isHoldingHands = false;
        otherPlayer.holdingHandsWith = '';
        
        // Broadcast to all clients that the hold has been released
        this.broadcast('releaseHands', {
          player1Id: playerId,
          player2Id: otherPlayerId
        });
      }
    }
  }
}