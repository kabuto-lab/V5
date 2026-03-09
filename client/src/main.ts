import { GameEngine } from './core/GameEngine';
import { NetworkManager } from './core/NetworkManager';
import { InputManager } from './core/InputManager';
import { UIController } from './ui/UIController';
import { ChatManager } from './chat/ChatManager';
import { MouseFollowerManager } from './features/mouse-follower/MouseFollowerManager';
import { BattleManager } from './features/battle/BattleManager';
import { BattleRenderer } from './features/battle/BattleRenderer';
import { VirusTubeManager } from './features/battle/VirusTubeManager';
import { GRID_WIDTH, GRID_HEIGHT, getStartingPositions } from './features/battle/GridConfig';
import * as PIXI from 'pixi.js';

class MainApp {
  private gameEngine!: GameEngine;
  private networkManager!: NetworkManager;
  private inputManager!: InputManager;
  private uiController!: UIController;
  private chatManager!: ChatManager;
  private mouseFollower!: MouseFollowerManager;
  private virusTubeManager!: VirusTubeManager;
  private battleManager!: BattleManager;
  private battleRenderer: BattleRenderer | null = null;  // Инициализируется позже

  // Sandbox mode
  private sandboxApp: PIXI.Application | null = null;
  private gridData: number[] | null = null;  // Store current grid for victory podium
  private isInSandbox: boolean = false;

  // Метод для обновления прогресса битвы
  private updateBattleProgress!: (grid: number[]) => void;

  constructor() {
    try {
      this.gameEngine = new GameEngine();
      this.networkManager = new NetworkManager();
      this.inputManager = new InputManager();
      this.uiController = new UIController();

      this.chatManager = new ChatManager();
      // Initialize in sandbox mode by default (will switch for multiplayer)
      this.virusTubeManager = new VirusTubeManager('sandbox', 'red');
      this.battleManager = new BattleManager();

      this.setupInteractions();

      this.gameEngine.init('canvasContainer').then(() => {
        this.mouseFollower = new MouseFollowerManager(this.gameEngine.app!.stage, this.networkManager);

        // Sandbox mode - use pink color by default
        this.mouseFollower.onRoomJoined(true, 'sandbox-player', 0xff0066);

        this.inputManager.onMouseMove = (x, y) => {
          this.mouseFollower.updateLocalPosition(x, y, 0xff0066);
        };

        this.gameEngine.start();

        window.addEventListener('resize', () => {
          if (this.gameEngine.app) {
            this.gameEngine.app.renderer.resize(window.innerWidth, window.innerHeight);
          }
          if (this.battleRenderer) {
            this.battleRenderer.onResize();
          }
        });
      }).catch((error) => {
        console.error('[MainApp] GameEngine init ERROR:', error);
      });
    } catch (error) {
      console.error('[MainApp] Constructor ERROR:', error);
    }
  }

  private setupInteractions(): void {
    this.virusTubeManager.setOnParamsChange((params) => {
      this.networkManager.sendParameterUpdate(params);
    });

    this.battleManager.setOnGridUpdate((grid) => {
      if (this.battleRenderer) {
        this.battleRenderer.updateGrid(grid);
      }
    });

    this.battleManager.setOnStateChange((state) => {
      if (state.type === 'running') {
        if (this.battleRenderer) {
          this.battleRenderer.show();
        }
      } else if (state.type === 'ended') {
        const winnerText = state.winner === 'A' ? 'КРАСНЫЙ (Игрок 1)' : state.winner === 'B' ? 'СИНИЙ (Игрок 2)' : 'НИЧЬЯ';
        alert(`Битва окончена!\nПобедитель: ${winnerText}`);
        if (this.battleRenderer) {
          this.battleRenderer.hide();
        }
      }
    });

    this.uiController.onEnterSandbox = () => {
      this.enterSandboxMode();
      // Show sandbox controls, hide room controls
      const sandboxControls = document.getElementById('sandboxControls');
      const roomControls = document.getElementById('roomControls');
      if (sandboxControls) sandboxControls.style.display = 'block';
      if (roomControls) roomControls.style.display = 'none';
    };

    this.uiController.onLeaveSandbox = () => {
      this.leaveSandboxMode();
      // Hide both control panels
      const sandboxControls = document.getElementById('sandboxControls');
      const roomControls = document.getElementById('roomControls');
      if (sandboxControls) sandboxControls.style.display = 'none';
      if (roomControls) roomControls.style.display = 'none';
    };

    const readyBtn = document.getElementById('readyBtn');
    if (readyBtn) {
      readyBtn.addEventListener('click', () => {
        const playerParams = this.virusTubeManager.getParamsAsVirusParams();
        const isPlayer1 = this.uiController.getCurrentView() === 'room';

        if (isPlayer1) {
          this.battleManager.setParamsA(playerParams);
        } else {
          this.battleManager.setParamsB(playerParams);
        }

        this.networkManager.sendToggleReady(true);
      });
    }

    // Update ready button state based on points remaining
    const pointsRemainingEl = document.getElementById('points-remaining');
    if (pointsRemainingEl) {
      // Create a MutationObserver to watch for points changes
      const observer = new MutationObserver(() => {
        const text = pointsRemainingEl.textContent?.trim() || '12';

        // Check if text contains READY marker
        const isReady = text.includes('ГОТОВ') || text.includes('READY') || text.includes('✅');

        // Extract number from text (handle "✅ ГОТОВ (12/12)" format)
        let remaining = 12;
        const match = text.match(/\((\d+)\/12\)/);
        if (match) {
          remaining = parseInt(match[1], 10);
        } else {
          remaining = parseInt(text, 10);
        }

        // Handle NaN case
        if (isNaN(remaining)) {
          console.warn('[MainApp] Points remaining is NaN:', text);
          remaining = 12;
        }

        const pointsSpent = 12 - remaining;
        const readyBtns = document.querySelectorAll('#readyBtn');

        readyBtns.forEach(btn => {
          const readyBtn = btn as HTMLButtonElement;
          if (remaining === 0 || isReady) {
            readyBtn.disabled = false;
            readyBtn.textContent = '👍 ГОТОВ (12/12)';
            readyBtn.style.opacity = '1';
          } else {
            readyBtn.disabled = true;
            readyBtn.textContent = `👍 ГОТОВ (${pointsSpent}/12)`;
            readyBtn.style.opacity = '0.5';
          }
        });
      });

      observer.observe(pointsRemainingEl, {
        characterData: true,
        subtree: true,
        childList: true
      });
    }

    // RANDOMIZE ALL button (sandbox only)
    const randomizeAllBtn = document.getElementById('randomizeAllBtn');
    if (randomizeAllBtn) {
      randomizeAllBtn.addEventListener('click', () => {
        if (this.isInSandbox) {
          this.virusTubeManager.randomizeAll();
          this.updateDebugPanel('🎲 Randomized all 4 viruses!');
        } else {
          this.updateDebugPanel('⚠️ Randomize only available in Sandbox mode');
        }
      });
    }

    const leaveRoomBtn = document.getElementById('leaveRoomBtn');
    if (leaveRoomBtn) {
      leaveRoomBtn.addEventListener('click', () => {
        this.networkManager.leaveCurrentRoom();
        this.uiController.setView('lobby');
        this.mouseFollower.destroy();
        this.chatManager.destroy();
      });
    }

    // BattleManager callbacks
    this.battleManager.setOnStateChange((state) => {
      if (state.type === 'running') {
        if (this.battleRenderer) {
          this.battleRenderer.show();
        } else {
          console.error('[MainApp] battleRenderer is NULL when state=running!');
        }
      } else if (state.type === 'ended') {
        // Определяем победителя по цвету вируса
        const winnerText = state.winner === 'A'
          ? 'КРАСНЫЙ (Игрок 1)'
          : state.winner === 'B'
            ? 'СИНИЙ (Игрок 2)'
            : 'Ничья';
        const percent = state.winner !== 'draw'
          ? ((state.winner === 'A' ? state.virusACount : state.virusBCount) /
             (state.virusACount + state.virusBCount) * 100).toFixed(1)
          : '0';
        alert(`Битва окончена!\nПобедитель: ${winnerText}\nТерритория: ${percent}%`);
        if (this.battleRenderer) {
          this.battleRenderer.hide();
        }
      }
    });

    this.battleManager.setOnGridUpdate((grid) => {
      if (this.battleRenderer) {
        this.battleRenderer.updateGrid(grid);
      }

      // Обновляем прогресс битвы в верхней панели
      this.updateBattleProgress(grid);
    });

    // Обратный отсчёт
    this.battleManager.setOnCountdown((count) => {
      const overlay = document.getElementById('countdownOverlay');
      const countdownText = document.getElementById('countdownText');

      if (!overlay || !countdownText) return;

      if (count > 0) {
        // Показываем цифру
        overlay.style.display = 'flex';
        countdownText.textContent = count.toString();
        
        // Автоматически закрываем все боковые панели
        this.uiController.closeLeftSidebar();
        this.uiController.closeRightSidebar();
      } else if (count === 0) {
        // Показываем "БИТВА!" и запускаем битву автоматически
        countdownText.textContent = 'БИТВА!';
        countdownText.style.color = '#ff00ff';

        // Отправляем серверу сигнал начать битву
        this.networkManager.sendToRoom('startBattleNow', {});

        // Запускаем битву локально
        const gridData = this.battleManager.getGridData();
        if (gridData) {
          this.battleManager.startBattle(gridData.grid, gridData.width, gridData.height);
        }

        // Скрываем overlay через 1.5 секунды
        setTimeout(() => {
          overlay.style.display = 'none';
          countdownText.style.color = '#00ffff';
        }, 1500);
      }
    });

    // Network listeners для битвы
    this.networkManager.onVirusBattleStarted = (data) => {
      // Создаём BattleRenderer с правильными размерами
      if (!this.battleRenderer && this.gameEngine.app) {
        this.battleRenderer = new BattleRenderer(this.gameEngine.app.stage);
      }

      // Инициализируем сетку
      if (this.battleRenderer) {
        this.battleRenderer.initGrid(data.width, data.height);
        this.battleRenderer.show();  // ← FIX: Show the battle renderer

        // Wire up grid update callback for multiplayer using setter
        this.battleManager.setOnGridUpdate((grid: number[]) => {
          if (this.battleRenderer) {
            this.battleRenderer.updateGrid(grid);
          }
        });

        // Устанавливаем параметры вирусов для визуализации защиты
        const paramsA = this.virusTubeManager.getParamsAsVirusParams();
        const paramsB = { defense: 0 };  // Will be updated from network

        this.battleRenderer.setVirusParams(
          { defense: paramsA.defense },
          { defense: paramsB.defense }
        );

        // Подписываем BattleRenderer на ticker для анимации
        this.gameEngine.addTickerUpdate((delta) => {
          this.battleRenderer!.update(delta);
        });
      }

      // Запускаем обратный отсчёт
      this.battleManager.startCountdownAndBattle(data.vGrid, data.width, data.height);
    };

    this.networkManager.onVirusTick = (tick, data) => {
      // ← FIX: Pass width/height to BattleManager
      this.battleManager.onBattleTick({ vGrid: data.vGrid, tick, width: data.width, height: data.height });

      // Update infestation visualization
      if (this.battleRenderer) {
        const infestations = this.battleManager.getInfestations();
        this.battleRenderer.setInfestationData(infestations);
      }
    };

    this.networkManager.onVirusBattleEnded = (data) => {
      this.battleManager.onBattleEnded({
        winner: data.winner === 'Player A' ? 'A' : data.winner === 'Player B' ? 'B' : 'draw',
        virusACount: data.virusACount,
        virusBCount: data.virusBCount
      });
      
      // Hide battle renderer when battle ends
      if (this.battleRenderer) {
        this.battleRenderer.hide();
      }
    };

    this.networkManager.onStartCountdown = (data) => {
      // Создаём BattleRenderer если ещё не создан
      if (!this.battleRenderer && this.gameEngine.app) {
        this.battleRenderer = new BattleRenderer(this.gameEngine.app.stage);
      }

      // Инициализируем сетку
      if (this.battleRenderer) {
        this.battleRenderer.initGrid(data.width, data.height);
        this.battleRenderer.show();  // ← FIX: Show the battle renderer

        // Wire up grid update callback for multiplayer using setter
        this.battleManager.setOnGridUpdate((grid: number[]) => {
          if (this.battleRenderer) {
            this.battleRenderer.updateGrid(grid);
          }
        });

        // Подписываем BattleRenderer на ticker для анимации
        this.gameEngine.addTickerUpdate((delta) => {
          this.battleRenderer!.update(delta);
        });
      }

      // Запускаем обратный отсчёт
      this.battleManager.startCountdownAndBattle(data.vGrid, data.width, data.height);
    };

    // Инициализация метода обновления прогресса
    this.updateBattleProgress = (grid: number[]) => {
      let countA = 0;
      let countB = 0;

      for (const cell of grid) {
        if (cell === 1) countA++;
        else if (cell === 2) countB++;
      }

      const total = countA + countB;
      const percentA = total > 0 ? (countA / total) * 100 : 0;
      const percentB = total > 0 ? (countB / total) * 100 : 0;

      const progressEl = document.getElementById('battleProgress');
      if (progressEl) {
        // Обновляем градиент: красный слева, синий справа
        const redEnd = percentA;
        const blueStart = 100 - percentB;
        
        progressEl.style.background = `linear-gradient(90deg, 
          rgba(255, 0, 0, 0.4) 0%, 
          rgba(255, 0, 0, 0.4) ${redEnd}%, 
          rgba(0, 0, 0, 0.5) ${redEnd}%, 
          rgba(0, 0, 0, 0.5) ${blueStart}%, 
          rgba(0, 0, 255, 0.4) ${blueStart}%, 
          rgba(0, 0, 255, 0.4) 100%)`;
      }
    };

    this.uiController.onCreateRoom = async () => {
      try {
        const roomId = await this.networkManager.createRoom();

        // Ждём следующего тика, чтобы DOM был готов
        await new Promise(resolve => setTimeout(resolve, 0));

        this.uiController.setView('room');

        // Show room controls, hide sandbox controls
        const sandboxControls = document.getElementById('sandboxControls');
        const roomControls = document.getElementById('roomControls');
        if (sandboxControls) sandboxControls.style.display = 'none';
        if (roomControls) roomControls.style.display = 'block';

        // Switch VirusTubeManager to multiplayer mode (Player 1 = RED)
        this.virusTubeManager = new VirusTubeManager('multiplayer', 'red');
        this.virusTubeManager.setOnParamsChange((params) => {
          this.networkManager.sendParameterUpdate(params);
        });

        // Очистить старый mouse follower (из sandbox) и создать новый для мультиплеера
        if (this.mouseFollower) {
          this.mouseFollower.destroy();
        }
        this.mouseFollower = new MouseFollowerManager(this.gameEngine.app!.stage, this.networkManager);

        // Wire up mouse input for multiplayer
        this.inputManager.onMouseMove = (x, y) => {
          this.mouseFollower.updateLocalPosition(x, y, 0xff0066);
        };

        // Показываем ID комнаты сразу
        this.uiController.showCreatedRoomId(roomId);

        const room = this.networkManager.getCurrentRoom();
        if (room) {
          this.chatManager.attachToRoom(room);
          // Show chat container in multiplayer
          const chatContainer = document.getElementById('chat-container');
          if (chatContainer) chatContainer.style.display = 'block';
          
          // Устанавливаем network listeners для mouse follower
          this.mouseFollower.setupNetworkListeners();
          // Устанавливаем mouse follower для создателя (цвет = розовый вирус)
          const virusColor = 0xff0066; // Player 1 color (PINK)
          this.mouseFollower.onRoomJoined(true, this.networkManager.getSessionId()!, virusColor);

          // Подписываемся на изменение количества игроков
          this.networkManager.onRoomStateChange = (count, max) => {
            this.uiController.updatePlayerCount(count, max);
          };
          // Обновляем счётчик при создании комнаты
          this.uiController.updatePlayerCount(this.networkManager.getPlayerCount(), 2);
        }
        // Set player 1 name with PINK color
        this.uiController.setPlayerName('Player 1');
        const player1NameEl = document.getElementById('player1Name');
        if (player1NameEl) player1NameEl.style.color = '#ff0066';
        
        // Setup speed buttons
        this.setupSpeedButtons();
      } catch (error) {
        console.error('[MainApp] ERROR in onCreateRoom:', error);
        alert('Create room ERROR: ' + error);
      }
    };

    this.uiController.onJoinRoom = async (roomId) => {
      try {
        await this.networkManager.joinRoom(roomId);

        // Ждём следующего тика, чтобы DOM был готов
        await new Promise(resolve => setTimeout(resolve, 0));

        this.uiController.setView('room');

        // Show room controls, hide sandbox controls
        const sandboxControls = document.getElementById('sandboxControls');
        const roomControls = document.getElementById('roomControls');
        if (sandboxControls) sandboxControls.style.display = 'none';
        if (roomControls) roomControls.style.display = 'block';

        // Switch VirusTubeManager to multiplayer mode (Player 2 = BLUE)
        this.virusTubeManager = new VirusTubeManager('multiplayer', 'blue');
        this.virusTubeManager.setOnParamsChange((params) => {
          this.networkManager.sendParameterUpdate(params);
        });

        // Очистить старый mouse follower (из sandbox) и создать новый для мультиплеера
        if (this.mouseFollower) {
          this.mouseFollower.destroy();
        }
        this.mouseFollower = new MouseFollowerManager(this.gameEngine.app!.stage, this.networkManager);

        // Wire up mouse input for multiplayer
        this.inputManager.onMouseMove = (x, y) => {
          this.mouseFollower.updateLocalPosition(x, y, 0x00ffff);
        };

        // Показываем ID комнаты сразу
        this.uiController.showCreatedRoomId(roomId);

        const room = this.networkManager.getCurrentRoom();
        if (room) {
          this.chatManager.attachToRoom(room);
          // Show chat container in multiplayer
          const chatContainer = document.getElementById('chat-container');
          if (chatContainer) chatContainer.style.display = 'block';
          
          // Устанавливаем network listeners для mouse follower
          this.mouseFollower.setupNetworkListeners();
          // Устанавливаем mouse follower для присоединившегося (цвет = циан/голубой вирус)
          const virusColor = 0x00ffff; // Player 2 color (CYAN)
          this.mouseFollower.onRoomJoined(false, this.networkManager.getSessionId()!, virusColor);

          // Подписываемся на изменение количества игроков
          this.networkManager.onRoomStateChange = (count, max) => {
            this.uiController.updatePlayerCount(count, max);
          };
          // Обновляем счётчик при присоединении
          this.uiController.updatePlayerCount(this.networkManager.getPlayerCount(), 2);
        }
        // Set player 2 name with CYAN color
        this.uiController.setPlayerName('Player 2');
        const player2NameEl = document.getElementById('player2Name');
        if (player2NameEl) player2NameEl.style.color = '#00ffff';
        
        // Setup speed buttons
        this.setupSpeedButtons();
      } catch (error) {
        console.error('[MainApp] ERROR in onJoinRoom:', error);
        alert('Join room ERROR: ' + error);
      }
    };
  }

  /**
   * Setup speed control buttons
   */
  private setupSpeedButtons(): void {
    const speedButtons = document.querySelectorAll('.speed-btn');
    speedButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event bubbling
        const speed = parseInt((btn as HTMLElement).dataset.speed || '1');
        this.setBattleSpeed(speed);

        // Update button styles using class instead of inline styles
        speedButtons.forEach(b => {
          b.classList.remove('active');
          b.style.background = '';
          b.style.color = '';
        });
        btn.classList.add('active');

        this.updateDebugPanel(`Speed: ${speed}x`);
      });
    });
  }

  /**
   * Check if current player is Player 1 (creator)
   */
  private isPlayer1(): boolean {
    const room = this.networkManager.getCurrentRoom();
    if (!room) return false;
    const player = room.state.players.get(this.networkManager.getSessionId()!);
    return player?.isRoomCreator ?? false;
  }

  /**
   * Set battle speed multiplier
   */
  private setBattleSpeed(speed: number): void {
    const intervalMs = 500 / speed;
    if (this.battleManager) {
      this.battleManager.setSpreadInterval(intervalMs);
    }
  }

  /**
   * Enter sandbox mode - empty canvas for testing
   */
  private async enterSandboxMode(): Promise<void> {
    this.isInSandbox = true;

    // Re-create VirusTubeManager for sandbox mode (4 viruses)
    this.virusTubeManager = new VirusTubeManager('sandbox', 'red');

    // Update debug panel
    this.updateDebugPanel('Entering sandbox mode...');

    // Create sandbox PixiJS application
    const container = document.getElementById('sandboxCanvasContainer');
    if (!container) {
      console.error('[MainApp] Sandbox container not found!');
      this.updateDebugPanel('ERROR: Sandbox container not found!');
      return;
    }

    // Clear container
    container.innerHTML = '';
    this.updateDebugPanel('Container cleared, creating Pixi app...');

    // Create new application
    this.sandboxApp = new PIXI.Application();
    await this.sandboxApp.init({
      backgroundColor: 0x1a1a1a,
      width: window.innerWidth,
      height: window.innerHeight,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio, 2),
    });

    container.appendChild(this.sandboxApp.canvas);
    this.updateDebugPanel(`Pixi app created (${window.innerWidth}x${window.innerHeight})`);

    // Start the sandbox app ticker
    this.sandboxApp.ticker.start();
    this.updateDebugPanel('Pixi ticker started');

    // Создать BattleRenderer ПОСЛЕ создания Pixi app
    this.battleRenderer = new BattleRenderer(this.sandboxApp.stage);
    this.updateDebugPanel('BattleRenderer created');

    // Подписать BattleRenderer на ticker для анимации
    this.sandboxApp.ticker.add(() => {
      if (this.battleRenderer) {
        this.battleRenderer.update(1);
      }
    });

    // DON'T create debug grid - BattleRenderer handles visualization
    // this.createBattleGrid(32, 20);
    
    this.updateDebugPanel('Ready for battle');

    // Setup sandbox menu buttons
    this.setupSandboxMenuButtons();
    this.updateDebugPanel('Menu buttons setup complete');

    // Check if START BATTLE button exists
    const startBattleBtn = document.getElementById('startBattleBtn');
    if (startBattleBtn) {
      this.updateDebugPanel('✅ START BATTLE button FOUND!');
    } else {
      this.updateDebugPanel('❌ START BATTLE button NOT FOUND!');
      console.error('[MainApp] START BATTLE button does NOT exist!');
    }
  }

  /**
   * Update debug panel with message
   */
  private updateDebugPanel(message: string): void {
    const debugContent = document.getElementById('debugContent');
    if (debugContent) {
      const timestamp = new Date().toLocaleTimeString();
      const newLine = `[${timestamp}] ${message}<br>`;
      debugContent.innerHTML = newLine + debugContent.innerHTML;
      
      // Keep only last 20 lines
      const lines = debugContent.innerHTML.split('<br>');
      if (lines.length > 20) {
        debugContent.innerHTML = lines.slice(0, 20).join('<br>');
      }
    }
  }
  
  /**
   * Setup sandbox menu button handlers
   */
  private setupSandboxMenuButtons(): void {
    console.log('[MainApp] Setting up sandbox menu buttons...');
    
    // Left menu button - controls sidebar
    const sandboxLeftMenuBtn = document.getElementById('sandboxLeftMenuBtn');
    const leftSidebar = document.getElementById('leftSidebar');

    console.log('[MainApp] sandboxLeftMenuBtn:', sandboxLeftMenuBtn);
    console.log('[MainApp] leftSidebar:', leftSidebar);

    if (sandboxLeftMenuBtn && leftSidebar) {
      // Set initial position and ensure visibility
      const sidebarEl = leftSidebar as HTMLElement;
      sidebarEl.style.left = '-33%';
      sidebarEl.style.transition = 'left 0.3s ease';
      sidebarEl.style.display = 'flex'; // Ensure it's visible
      sidebarEl.style.zIndex = '1000'; // Ensure it's on top
      
      sandboxLeftMenuBtn.addEventListener('click', () => {
        console.log('[MainApp] Left menu clicked! Toggling sidebar...');
        const isActive = leftSidebar.classList.toggle('active');
        console.log('[MainApp] Active:', isActive);
        
        // Force position with inline styles
        if (isActive) {
          sidebarEl.style.left = '0';
          console.log('[MainApp] Sidebar should be visible now!');
        } else {
          sidebarEl.style.left = '-33%';
        }
      });
    } else {
      console.error('[MainApp] Missing elements:', { sandboxLeftMenuBtn, leftSidebar });
    }

    // Right menu button - virus params sidebar
    const sandboxMenuBtn = document.getElementById('sandboxMenuBtn');
    const rightSidebar = document.getElementById('sidebar');

    if (sandboxMenuBtn && rightSidebar) {
      sandboxMenuBtn.addEventListener('click', () => {
        rightSidebar.classList.toggle('active');
      });
    } else {
      console.error('[MainApp] Missing elements:', { sandboxMenuBtn, rightSidebar });
    }

    // Back to lobby button
    const backToLobbyBtn = document.getElementById('backToLobbyBtn');
    if (backToLobbyBtn) {
      backToLobbyBtn.addEventListener('click', () => {
        this.leaveSandboxMode();
        this.uiController.setView('lobby');
      });
    }

    // START BATTLE button handler (in right sidebar)
    const startBattleBtn = document.getElementById('startBattleBtn');
    if (startBattleBtn) {
      startBattleBtn.addEventListener('click', () => {
        this.updateDebugPanel('START BATTLE clicked!');

        // Get current virus params from ALL 4 tubes
        const allParams = this.virusTubeManager.getAllVirusParams();

        // Use grid size from config
        const width = GRID_WIDTH;
        const height = GRID_HEIGHT;
        const vGrid = new Array(width * height).fill(0);

        // Get starting positions from config
        const starts = getStartingPositions(width, height);

        // Place 4 viruses in CORNERS (single cell each)
        vGrid[starts.virus1.y * width + starts.virus1.x] = 1;  // Value 1
        vGrid[starts.virus2.y * width + starts.virus2.x] = 2;  // Value 2
        vGrid[starts.virus3.y * width + starts.virus3.x] = 3;  // Value 3
        vGrid[starts.virus4.y * width + starts.virus4.x] = 4;  // Value 4

        this.updateDebugPanel(`Grid: ${width}x${height} | 4 Viruses`);

        // Set params for all 4 viruses
        this.battleManager.setParamsForVirus(1, allParams[0] || {});
        this.battleManager.setParamsForVirus(2, allParams[1] || {});
        this.battleManager.setParamsForVirus(3, allParams[2] || {});
        this.battleManager.setParamsForVirus(4, allParams[3] || {});

        // Инициализировать сетку в BattleRenderer ПЕРЕД запуском битвы
        if (this.battleRenderer) {
          this.battleRenderer.initGrid(width, height);

          // Set virus params for defense visualization
          this.battleRenderer.setVirusParams4Player(
            { defense: allParams[0]?.defense || 0 },
            { defense: allParams[1]?.defense || 0 },
            { defense: allParams[2]?.defense || 0 },
            { defense: allParams[3]?.defense || 0 }
          );

          // SHOW the battle renderer
          this.battleRenderer.show();

          this.updateDebugPanel(`Battle: 4 viruses | ${width}x${height} grid`);
        }

        // Setup grid update callback for sandbox mode
        let tickCount = 0;
        let lastCounts = { pink: 0, cyan: 0, purple: 0, orange: 0 };

        // Clear any existing callbacks
        this.battleManager.clearCallbacks();

        this.battleManager.setOnGridUpdate((grid) => {
          tickCount++;
          const counts = {
            pink: grid.filter(c => c === 1).length,
            cyan: grid.filter(c => c === 2).length,
            purple: grid.filter(c => c === 3).length,
            orange: grid.filter(c => c === 4).length
          };
          lastCounts = counts;

          const total = counts.pink + counts.cyan + counts.purple + counts.orange;

          if (tickCount <= 5 || tickCount % 10 === 0) {
            this.updateDebugPanel(`#${tickCount} P:${counts.pink} C:${counts.cyan} P:${counts.purple} O:${counts.orange}`);
          }

          if (this.battleRenderer) {
            this.gridData = grid;
            this.battleRenderer.updateGrid4Player(grid);
          } else {
            console.warn('[MainApp] battleRenderer is NULL!');
          }
        });
        
        // Setup battle state callback for sandbox mode
        this.battleManager.setOnStateChange((state) => {
          if (state.type === 'ended') {
            const colors = ['', 'PINK', 'CYAN', 'PURPLE', 'ORANGE'];
            // Find winner from last known counts
            const countsArr = [0, lastCounts.pink, lastCounts.cyan, lastCounts.purple, lastCounts.orange];
            const winnerIdx = countsArr.indexOf(Math.max(...countsArr));
            const winnerName = colors[winnerIdx] || 'UNKNOWN';
            const total = lastCounts.pink + lastCounts.cyan + lastCounts.purple + lastCounts.orange;
            const percent = total > 0 ? (lastCounts[winnerIdx === 1 ? 'pink' : winnerIdx === 2 ? 'cyan' : winnerIdx === 3 ? 'purple' : 'orange'] / total * 100).toFixed(1) : '0';

            this.updateDebugPanel(`🏆 GAME OVER! Winner: ${winnerName} (${percent}%)`);

            // Show victory podium
            if (this.battleRenderer && this.gridData) {
              (this.battleRenderer as any).showVictoryPodium(this.gridData);
            }
          }
        });

        // Start battle with initial grid
        this.battleManager.startBattle4Player(vGrid, width, height);

        this.updateDebugPanel('🦠 BATTLE STARTED! 4 viruses spreading...');

        // === WAVE TIMING: Hook into Pixi ticker ===
        if (this.sandboxApp) {
          this.sandboxApp.ticker.add(() => {
            const deltaMs = this.sandboxApp!.ticker.deltaMS;
            if (this.battleManager && this.battleManager.isWaveTimingEnabled()) {
              this.battleManager.updateDynamicTiming(deltaMs);
            }
          });
          console.log('[MainApp] Wave timing hooked to Pixi ticker');
        }
      });
    } else {
      console.error('[MainApp] START BATTLE button not found for handler setup!');
    }

    // DEBUG PANEL DRAGGING
    this.setupDebugPanelDrag();

    // Set battle speed to 3x by default (166ms per tick)
    if (this.battleManager) {
      this.battleManager.setSpreadInterval(500 / 3); // ~166ms = 3x speed
    }
  }

  /**
   * Setup debug panel dragging
   */
  private setupDebugPanelDrag(): void {
    const dragHandle = document.getElementById('debugPanelDrag');
    const debugPanel = document.getElementById('debugPanel');
    
    if (!dragHandle || !debugPanel) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startBottom = 0;

    dragHandle.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      
      const rect = debugPanel.getBoundingClientRect();
      startLeft = rect.left;
      startBottom = window.innerHeight - rect.bottom;
      
      dragHandle.style.cursor = 'grabbing';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      debugPanel.style.left = `${startLeft + dx}px`;
      debugPanel.style.bottom = `${startBottom - dy}px`;
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        dragHandle.style.cursor = 'move';
      }
    });
  }

  /**
   * Create battle grid in sandbox
   */
  private createBattleGrid(width: number, height: number): void {
    if (!this.sandboxApp) return;

    // Calculate cell size to fill EXACTLY 100% of screen (no gaps) - MATCH BattleRenderer
    const cellWidth = Math.ceil(window.innerWidth / width);
    const cellHeight = Math.ceil(window.innerHeight / height);
    const cellSize = Math.max(cellWidth, cellHeight); // Use larger dimension to ensure full coverage

    const gridGraphics = new PIXI.Graphics();

    // Position grid at EXACT top-left corner (0, 0)
    const offsetX = 0;
    const offsetY = 0;

    const actualGridWidth = width * cellSize;
    const actualGridHeight = height * cellSize;

    // Begin the stroke style once for better performance
    gridGraphics.setStrokeStyle({ width: 1, color: 0xff0000, alpha: 1 });
    
    // Draw all cells
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cellX = offsetX + x * cellSize;
        const cellY = offsetY + y * cellSize;

        // Draw rect and stroke it
        gridGraphics.rect(cellX, cellY, cellSize, cellSize);
      }
    }
    
    // Apply the stroke to all paths at once
    gridGraphics.stroke();

    this.sandboxApp.stage.addChild(gridGraphics);
    
    // Add attempt counter text at top center
    const attemptText = new PIXI.Text('ATTEMPT #3 - Grid: 64x40 | Cell: ' + cellSize + 'px | Total: ' + actualGridWidth + 'x' + actualGridHeight + 'px', {
      fontFamily: 'Courier New',
      fontSize: 16,
      fill: 0x00ff00,
      stroke: { color: 0x000000, width: 2 },
    });
    attemptText.anchor.set(0.5, 0);
    attemptText.x = window.innerWidth / 2;
    attemptText.y = 10;
    attemptText.zIndex = 1000;
    this.sandboxApp.stage.addChild(attemptText);
    
    this.sandboxApp.stage.sortableChildren = true;
    gridGraphics.zIndex = 100;
  }

  /**
   * Leave sandbox mode - cleanup and return to lobby
   */
  private leaveSandboxMode(): void {
    this.isInSandbox = false;

    // Destroy sandbox application
    if (this.sandboxApp) {
      this.sandboxApp.ticker.stop();
      this.sandboxApp.destroy(true);
      this.sandboxApp = null;
    }

    // Clear sandbox container
    const container = document.getElementById('sandboxCanvasContainer');
    if (container) {
      container.innerHTML = '';
    }
  }
}

// Запуск приложения при загрузке страницы

// Обновляем бейдж с версией
function updateVersionBadge() {
  const badge = document.getElementById('versionBadge');
  if (badge) {
    // In dev mode, just show dev version
    badge.textContent = 'v11-dev';
  }
}

window.addEventListener('load', () => {
  // Обновляем версию сразу
  updateVersionBadge();

  new MainApp();
});