/**
 * VirusTubeManager - управляет интерактивными пробирками параметров вируса
 *
 * Функционал:
 * - 12 параметров вируса в сетке 3×4
 * - Максимум 12 очков на все параметры
 * - Клик по пробирке → +1 (если есть очки)
 * - Клик по emoji/названию/цифре → -1
 * - Анимация капли, всплеска, пузырьков
 * - Синхронизация с сервером через callback
 * - Поддержка 2 режимов: sandbox (4 вируса) и multiplayer (1 вирус)
 */

import { VirusParams } from './BioTypes';

export class VirusTubeManager {
  private params: Map<string, number>[]; // Array of 4 virus param maps
  private maxTotalPoints: number = 12;
  private maxPerParam: number = 10;
  private onParamsChangeCallback?: (params: { [key: string]: number }) => void;
  private currentVirusIndex: number = 0; // Currently selected virus tab (0-3)
  
  // === MODE SYSTEM ===
  private mode: 'sandbox' | 'multiplayer' = 'sandbox';
  private playerColor: 'red' | 'blue' = 'red'; // For multiplayer only

  // DOM элементы
  private paramCells: Map<string, HTMLElement>;
  private paramValues: Map<string, HTMLElement>;
  private paramLiquids: Map<string, HTMLElement>;
  private pointsRemainingElement: HTMLElement | null;
  private randomizeBtn: HTMLButtonElement | null;
  private quickTestBtn: HTMLButtonElement | null;
  private virusTabTitle: HTMLElement | null;
  private virusTabs: Element[]; // Changed from NodeListOf<Element> to Element[]
  private virusTabsContainer: HTMLElement | null = null; // Container for tabs

  // Цвета для каждого параметра (совпадают с CSS)
  private readonly paramColors: { [key: string]: string } = {
    aggression: '#ff0000',      // Red for ⚔️
    mutation: '#800080',        // Purple for 🧬
    speed: '#ffa500',           // Orange for ⚡
    defense: '#0000ff',         // Blue for 🛡️
    reproduction: '#008000',    // Green for 🦠
    stealth: '#808080',         // Gray for 👻
    virulence: '#800000',       // Maroon for ☣️
    resilience: '#ffc0cb',      // Pink for 💪
    mobility: '#8b4513',        // Brown for 🚶
    intellect: '#ffff00',       // Yellow for 🧠
    contagiousness: '#00ffff',  // Cyan for 🫁
    lethality: '#000000',       // Black for 💀
  };

  // Цвета для каждого вируса
  private readonly virusColors = ['#ff0000', '#0000ff', '#00ff00', '#ffff00'];

  /**
   * Constructor
   * @param mode - 'sandbox' (4 viruses) or 'multiplayer' (1 virus)
   * @param playerColor - 'red' (host) or 'blue' (joiner) for multiplayer
   */
  constructor(mode: 'sandbox' | 'multiplayer' = 'sandbox', playerColor: 'red' | 'blue' = 'red') {
    this.mode = mode;
    this.playerColor = playerColor;
    
    this.params = [
      new Map(), // Virus 1
      new Map(), // Virus 2
      new Map(), // Virus 3
      new Map(), // Virus 4
    ];

    this.paramCells = new Map();
    this.paramValues = new Map();
    this.paramLiquids = new Map();
    this.pointsRemainingElement = null;
    this.randomizeBtn = null;
    this.quickTestBtn = null;
    this.virusTabTitle = null;
    this.virusTabs = [];
    this.virusTabsContainer = null;

    // Инициализация параметров для всех 4 вирусов
    this.initializeAllParams();

    // Поиск DOM элементов
    this.findElements();

    // Установка обработчиков событий
    this.setupEventListeners();

    // Первоначальное обновление UI
    this.updateDisplay();
    
    // Apply mode-specific UI changes
    this.updateUIForMode();
  }

  /**
   * Инициализация всех 12 параметров нулями для всех 4 вирусов
   */
  private initializeAllParams(): void {
    const paramNames = [
      'aggression', 'mutation', 'speed',
      'defense', 'reproduction', 'stealth',
      'virulence', 'resilience', 'mobility',
      'intellect', 'contagiousness', 'lethality'
    ];

    for (let virusIdx = 0; virusIdx < 4; virusIdx++) {
      paramNames.forEach(name => {
        this.params[virusIdx].set(name, 0);
      });
    }
  }

  /**
   * Поиск всех DOM элементов пробирок
   */
  private findElements(): void {
    // Находим все .param-cell
    const cells = document.querySelectorAll('.param-cell');
    cells.forEach(cell => {
      const paramName = cell.getAttribute('data-param');
      if (paramName) {
        this.paramCells.set(paramName, cell as HTMLElement);

        // Находим value и liquid внутри ячейки
        const valueEl = cell.querySelector('.param-value');
        const liquidEl = cell.querySelector('.param-liquid');

        if (valueEl) {
          this.paramValues.set(paramName, valueEl as HTMLElement);
        }
        if (liquidEl) {
          this.paramLiquids.set(paramName, liquidEl as HTMLElement);
        }
      }
    });

    // Находим счётчик очков
    this.pointsRemainingElement = document.getElementById('points-remaining');

    // Находим заголовок таба
    this.virusTabTitle = document.getElementById('virusTabTitle');

    // Находим кнопки
    this.randomizeBtn = document.getElementById('randomizeBtn') as HTMLButtonElement;
    this.quickTestBtn = document.getElementById('quickTestBtn') as HTMLButtonElement;

    // Находим табы вирусов и их контейнер
    this.virusTabs = Array.from(document.querySelectorAll('.virus-tab'));
    this.virusTabsContainer = document.getElementById('virusTabs');
  }

  /**
   * Update UI based on game mode (sandbox vs multiplayer)
   */
  private updateUIForMode(): void {
    if (this.mode === 'multiplayer') {
      // Hide virus tabs container entirely
      if (this.virusTabsContainer) {
        this.virusTabsContainer.style.display = 'none';
      }
      
      // Hide individual tabs
      this.virusTabs.forEach(tab => {
        (tab as HTMLElement).style.display = 'none';
      });
      
      // Change header to show player's virus
      if (this.virusTabTitle) {
        const virusColor = this.playerColor === 'red' ? '🔴 КРАСНЫЙ' : '🔵 СИНИЙ';
        this.virusTabTitle.textContent = `ВАШ ВИРУС (${virusColor}) - 12 очков`;
      }

      // Set current virus based on player color
      this.currentVirusIndex = this.playerColor === 'red' ? 0 : 1;

      console.log(`[VirusTube] Multiplayer mode: Virus ${this.currentVirusIndex + 1} (${this.playerColor})`);
    } else {
      // Sandbox mode - show all tabs
      if (this.virusTabsContainer) {
        this.virusTabsContainer.style.display = 'flex';
      }

      this.virusTabs.forEach(tab => {
        (tab as HTMLElement).style.display = 'flex';
      });

      if (this.virusTabTitle) {
        this.virusTabTitle.textContent = 'Параметры Вируса 1 (12 очков)';
      }

      this.currentVirusIndex = 0;

      console.log('[VirusTube] Sandbox mode: 4 viruses');
    }
    
    this.updateDisplay();
  }

  /**
   * Установка обработчиков событий
   */
  private setupEventListeners(): void {
    // Обработчики для табов вирусов
    this.virusTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const virusIdx = parseInt(target.getAttribute('data-virus') || '0');
        this.switchVirusTab(virusIdx);
      });
    });

    // Обработчики для каждой пробирки - SIMPLE: emoji/name/number = +1, background = -1
    this.paramCells.forEach((cell, paramName) => {
      // Click on cell background = DECREASE (-1)
      cell.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log(`[VirusTube] Background click on ${paramName} -1`);
        this.removePoint(paramName);
      });

      // Click on emoji, name, or number = INCREASE (+1)
      const increaseElements = cell.querySelectorAll('.param-emoji, .param-name, .param-value');
      increaseElements.forEach(el => {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log(`[VirusTube] ${el.className} click on ${paramName} +1`);
          this.addPoint(paramName);
        });
      });
    });

    // Кнопка RANDOMIZE (один вирус)
    if (this.randomizeBtn) {
      this.randomizeBtn.addEventListener('click', () => {
        console.log('[VirusTube] Randomize button clicked for current virus');
        this.randomizeCurrentVirus();
      });
    }
    
    // Кнопка QUICK TEST (все вирусы)
    if (this.quickTestBtn) {
      this.quickTestBtn.addEventListener('click', () => {
        console.log('[VirusTube] Quick Test button clicked - randomizing all viruses');
        this.randomizeAllViruses();
      });
    }
  }
  
  /**
   * Переключиться на другой вирус
   */
  switchVirusTab(virusIdx: number): void {
    this.currentVirusIndex = virusIdx;
    
    // Обновляем активный класс на табах
    this.virusTabs.forEach((tab, idx) => {
      if (idx === virusIdx) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
    
    // Обновляем заголовок
    if (this.virusTabTitle) {
      this.virusTabTitle.textContent = `Параметры Вируса ${virusIdx + 1} (12 очков)`;
    }

    // Обновляем отображение
    this.updateDisplay();

    console.log(`[VirusTube] Switched to Virus ${virusIdx + 1}`);
  }
  
  /**
   * Рандомизировать текущий вирус
   */
  randomizeCurrentVirus(): void {
    const paramNames = Array.from(this.params[this.currentVirusIndex].keys());
    const newParams = new Map<string, number>();
    let pointsLeft = this.maxTotalPoints;
    
    // Перемешиваем параметры
    const shuffled = paramNames.sort(() => Math.random() - 0.5);
    
    // Распределяем очки случайно
    shuffled.forEach(name => {
      if (pointsLeft > 0) {
        const points = Math.floor(Math.random() * (pointsLeft + 1));
        newParams.set(name, Math.min(points, this.maxPerParam));
        pointsLeft -= newParams.get(name)!;
      } else {
        newParams.set(name, 0);
      }
    });
    
    // Если остались очки, добавляем их случайно
    while (pointsLeft > 0) {
      const randomParam = shuffled[Math.floor(Math.random() * shuffled.length)];
      const current = newParams.get(randomParam)!;
      if (current < this.maxPerParam) {
        newParams.set(randomParam, current + 1);
        pointsLeft--;
      }
    }
    
    this.params[this.currentVirusIndex] = newParams;
    this.updateDisplay();
    this.notifyParamsChange();
  }
  
  /**
   * Рандомизировать все вирусы
   */
  randomizeAllViruses(): void {
    for (let i = 0; i < 4; i++) {
      this.currentVirusIndex = i;
      this.randomizeCurrentVirus();
    }
    console.log('[VirusTube] All 4 viruses randomized!');
  }

  /**
   * Randomize all 4 viruses (sandbox mode)
   */
  randomizeAll(): void {
    this.randomizeAllViruses();
  }

  /**
   * Добавить очко к параметру
   */
  addPoint(paramName: string): boolean {
    const currentValue = this.params[this.currentVirusIndex].get(paramName) || 0;
    const usedPoints = this.getUsedPoints();

    // Проверка: не превышен ли лимит на параметр
    if (currentValue >= this.maxPerParam) {
      console.log(`[VirusTube] Parameter ${paramName} already at max (${this.maxPerParam})`);
      return false;
    }

    // Проверка: не использованы ли все очки
    if (usedPoints >= this.maxTotalPoints) {
      console.log(`[VirusTube] All points used (${this.maxTotalPoints}/${this.maxTotalPoints})`);
      return false;
    }

    // Увеличиваем значение
    this.params[this.currentVirusIndex].set(paramName, currentValue + 1);

    // Запускаем анимацию
    this.playDropAnimation(paramName);

    // Обновляем UI
    this.updateDisplay();

    // Вызываем callback
    this.notifyParamsChange();

    console.log(`[VirusTube] Added point to ${paramName}: ${currentValue} → ${currentValue + 1}`);
    return true;
  }

  /**
   * Убрать очко от параметра
   */
  removePoint(paramName: string): boolean {
    const currentValue = this.params[this.currentVirusIndex].get(paramName) || 0;

    // Проверка: не ноль ли уже
    if (currentValue <= 0) {
      console.log(`[VirusTube] Parameter ${paramName} already at 0`);
      return false;
    }

    // Уменьшаем значение
    this.params[this.currentVirusIndex].set(paramName, currentValue - 1);

    // Обновляем UI
    this.updateDisplay();

    // Вызываем callback
    this.notifyParamsChange();

    console.log(`[VirusTube] Removed point from ${paramName}: ${currentValue} → ${currentValue - 1}`);
    return true;
  }

  /**
   * Получить количество использованных очков (для текущего вируса)
   */
  private getUsedPoints(): number {
    let total = 0;
    this.params[this.currentVirusIndex].forEach(value => {
      total += value;
    });
    return total;
  }

  /**
   * Обновить отображение всех параметров (для текущего вируса)
   */
  updateDisplay(): void {
    // Обновляем каждую пробирку
    this.params[this.currentVirusIndex].forEach((value, paramName) => {
      // Обновляем цифру
      const valueEl = this.paramValues.get(paramName);
      if (valueEl) {
        valueEl.textContent = value.toString();
      }

      // Обновляем высоту жидкости
      const liquidEl = this.paramLiquids.get(paramName);
      if (liquidEl) {
        const heightPercent = (value / this.maxPerParam) * 100;
        liquidEl.style.height = `${heightPercent}%`;
      }

      // Обновляем состояние disabled для пробирки
      const cell = this.paramCells.get(paramName);
      if (cell) {
        const usedPoints = this.getUsedPoints();
        const isFull = value >= this.maxPerParam;
        const noPointsLeft = usedPoints >= this.maxTotalPoints && value === 0;

        if (isFull || noPointsLeft) {
          cell.classList.add('disabled');
        } else {
          cell.classList.remove('disabled');
        }
      }
    });

    // Обновляем счётчик оставшихся очков
    if (this.pointsRemainingElement) {
      const remaining = this.maxTotalPoints - this.getUsedPoints();
      this.pointsRemainingElement.textContent = remaining.toString();
      
      // Add "ready" class when all 12 points spent
      if (remaining === 0) {
        this.pointsRemainingElement.classList.add('ready');
        this.pointsRemainingElement.textContent = '✅ READY (12/12)';
      } else {
        this.pointsRemainingElement.classList.remove('ready');
      }
    }
  }

  /**
   * Проиграть анимацию капли для параметра
   */
  private playDropAnimation(paramName: string): void {
    const cell = this.paramCells.get(paramName);
    if (!cell) return;

    const color = this.paramColors[paramName] || '#00ffff';

    // Создаём каплю
    const drop = document.createElement('div');
    drop.className = 'tube-drop';
    drop.style.setProperty('--tube-color', color);
    cell.appendChild(drop);

    // Запускаем падение
    requestAnimationFrame(() => {
      drop.classList.add('falling');
    });

    // После падения: всплеск и пузырьки
    setTimeout(() => {
      this.playSplashEffect(cell, color);
      this.playBubblesEffect(cell, color);
      
      // Удаляем каплю
      drop.remove();
    }, 400);
  }

  /**
   * Эффект всплеска
   */
  private playSplashEffect(cell: HTMLElement, color: string): void {
    const splash = document.createElement('div');
    splash.className = 'tube-splash';
    splash.style.background = `rgba(255, 255, 255, 0.6)`;
    cell.appendChild(splash);

    requestAnimationFrame(() => {
      splash.classList.add('active');
    });

    setTimeout(() => {
      splash.remove();
    }, 400);
  }

  /**
   * Эффект пузырьков (2-3 пузырька)
   */
  private playBubblesEffect(cell: HTMLElement, color: string): void {
    const bubbleCount = 2 + Math.floor(Math.random() * 2); // 2 or 3

    for (let i = 0; i < bubbleCount; i++) {
      setTimeout(() => {
        const bubble = document.createElement('div');
        bubble.className = 'tube-bubble';
        
        // Случайная позиция и размер
        const left = 20 + Math.random() * 60; // 20-80%
        const size = 4 + Math.random() * 4; // 4-8px
        
        bubble.style.left = `${left}%`;
        bubble.style.bottom = '10%';
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.background = `rgba(255, 255, 255, 0.4)`;
        
        cell.appendChild(bubble);

        setTimeout(() => {
          bubble.remove();
        }, 1500);
      }, i * 200);
    }
  }

  /**
   * Случайное распределение 12 очков (для текущего вируса)
   */
  randomize(): void {
    // Сброс
    this.params[this.currentVirusIndex].forEach((_, key) => {
      this.params[this.currentVirusIndex].set(key, 0);
    });

    // Распределяем 12 очков случайно
    let pointsLeft = this.maxTotalPoints;
    const paramKeys = Array.from(this.params[this.currentVirusIndex].keys());

    while (pointsLeft > 0) {
      // Выбираем случайный параметр
      const randomIndex = Math.floor(Math.random() * paramKeys.length);
      const paramName = paramKeys[randomIndex];
      const currentValue = this.params[this.currentVirusIndex].get(paramName) || 0;

      // Если ещё не достигнут максимум для этого параметра
      if (currentValue < this.maxPerParam) {
        this.params[this.currentVirusIndex].set(paramName, currentValue + 1);
        pointsLeft--;
      }
    }

    // Обновляем UI
    this.updateDisplay();

    // Вызываем callback
    this.notifyParamsChange();

    console.log('[VirusTube] Randomized params for Virus ' + (this.currentVirusIndex + 1) + ':', Object.fromEntries(this.params[this.currentVirusIndex]));
  }

  /**
   * Сбросить все параметры в 0 (для текущего вируса)
   */
  reset(): void {
    this.params[this.currentVirusIndex].forEach((_, key) => {
      this.params[this.currentVirusIndex].set(key, 0);
    });

    this.updateDisplay();
    this.notifyParamsChange();

    console.log('[VirusTube] Reset all params to 0 for Virus ' + (this.currentVirusIndex + 1));
  }

  /**
   * Получить текущие значения параметров (для текущего вируса)
   * В режиме multiplayer возвращает параметры только текущего игрока
   * В режиме sandbox возвращает параметры текущего выбранного вируса
   */
  getParams(): { [key: string]: number } {
    const result: { [key: string]: number } = {};
    this.params[this.currentVirusIndex].forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  /**
   * Получить параметры конкретного вируса
   */
  getVirusParams(virusIdx: number): { [key: string]: number } {
    const result: { [key: string]: number } = {};
    this.params[virusIdx].forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  /**
   * Получить параметры всех 4 вирусов (только для sandbox режима)
   */
  getAllVirusParams(): VirusParams[] {
    if (this.mode === 'multiplayer') {
      console.warn('[VirusTube] getAllVirusParams() called in multiplayer mode!');
    }
    return [
      this.getVirusParamsAsVirusParams(0),
      this.getVirusParamsAsVirusParams(1),
      this.getVirusParamsAsVirusParams(2),
      this.getVirusParamsAsVirusParams(3)
    ];
  }

  /**
   * Get virus params as VirusParams type
   */
  private getVirusParamsAsVirusParams(index: number): VirusParams {
    const params = this.getVirusParams(index);
    return {
      aggression: params.aggression || 0,
      virulence: params.virulence || 0,
      defense: params.defense || 0,
      resilience: params.resilience || 0,
      propagation: params.propagation || 0,
      mobility: params.mobility || 0,
      mutation: params.mutation || 0,
      stealth: params.stealth || 0,
      replication: params.replication || 0,
      synergy: params.synergy || 0,
      // Legacy aliases
      speed: params.propagation || 0,
      reproduction: params.replication || 0,
      intellect: params.synergy || 0,
      contagiousness: params.mutation || 0,
      lethality: params.virulence || 0
    };
  }

  /**
   * Получить текущие параметры как VirusParams
   */
  getParamsAsVirusParams(): VirusParams {
    const params = this.getParams();
    return {
      aggression: params.aggression || 0,
      virulence: params.virulence || 0,
      defense: params.defense || 0,
      resilience: params.resilience || 0,
      propagation: params.propagation || 0,
      mobility: params.mobility || 0,
      mutation: params.mutation || 0,
      stealth: params.stealth || 0,
      replication: params.replication || 0,
      synergy: params.synergy || 0,
      // Legacy aliases
      speed: params.propagation || 0,
      reproduction: params.replication || 0,
      intellect: params.synergy || 0,
      contagiousness: params.mutation || 0,
      lethality: params.virulence || 0
    };
  }

  /**
   * Установить callback при изменении параметров
   */
  setOnParamsChange(callback: (params: { [key: string]: number }) => void): void {
    this.onParamsChangeCallback = callback;
  }

  /**
   * Уведомить об изменении параметров
   */
  private notifyParamsChange(): void {
    if (this.onParamsChangeCallback) {
      this.onParamsChangeCallback(this.getParams());
    }
  }

  /**
   * Установить параметры извне (при получении от сервера)
   */
  setParams(params: { [key: string]: number }): void {
    Object.entries(params).forEach(([key, value]) => {
      if (this.params[this.currentVirusIndex].has(key)) {
        this.params[this.currentVirusIndex].set(key, value);
      }
    });

    this.updateDisplay();
    console.log('[VirusTube] Set params from external:', params);
  }

  /**
   * Получить количество оставшихся очков
   */
  getRemainingPoints(): number {
    return this.maxTotalPoints - this.getUsedPoints();
  }

  /**
   * Проверить, все ли очки распределены
   */
  isMaxedOut(): boolean {
    return this.getUsedPoints() >= this.maxTotalPoints;
  }
}
