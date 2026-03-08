import * as PIXI from 'pixi.js';

/**
 * Базовый игровой движок
 * Только рендер + ticker, без логики
 */
export class GameEngine {
  app: PIXI.Application | null = null;
  private ticker: PIXI.Ticker | null = null;

  constructor() {
  }

  /**
   * Инициализировать PixiJS (асинхронно)
   */
  async init(containerId: string): Promise<void> {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container element with id "${containerId}" not found`);
    }

    // Создаём и инициализируем приложение
    this.app = new PIXI.Application();

    await this.app.init({
      backgroundColor: 0x1a1a1a,
      width: window.innerWidth,
      height: window.innerHeight,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio, 2),
    });

    // КРИТИЧЕСКИЕ СТИЛИ — позиционирование canvas ниже кнопок
    this.app.canvas.style.position = 'absolute';
    this.app.canvas.style.top = '0';
    this.app.canvas.style.left = '0';
    this.app.canvas.style.zIndex = '1';                // низкий z-index
    this.app.canvas.style.pointerEvents = 'auto';      // для интерактивных объектов

    // Получаем ticker после инициализации
    this.ticker = this.app.ticker;

    // Добавляем canvas в контейнер
    container.appendChild(this.app.canvas);
  }

  /**
   * Добавить обновление на тикер
   */
  addTickerUpdate(updateFn: (dt: number) => void): void {
    if (this.ticker) {
      this.ticker.add((ticker) => {
        const dt = ticker.deltaTime;
        updateFn(dt);
      });
    } else {
      console.error('[GameEngine] Ticker is null!');
    }
  }

  /**
   * Запустить тикер
   */
  start(): void {
    if (this.ticker) {
      this.ticker.start();
    } else {
      console.error('[GameEngine] Cannot start: ticker is null');
    }
  }

  /**
   * Остановить тикер
   */
  stop(): void {
    if (this.ticker) {
      this.ticker.stop();
    }
  }
}