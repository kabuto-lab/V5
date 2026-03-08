# ViRU5 V4 - КОНТЕКСТ РАЗРАБОТКИ
**Дата сохранения:** 2026-03-03 01:30
**Статус:** В ПРОЦЕССЕ - Битва вирусов запущена, но не видна визуально
**Следующий шаг:** Исправить визуализацию BattleRenderer

---

## 🎯 ТЕКУЩАЯ ПРОБЛЕМА

**Кнопка START BATTLE работает**, но вирусы **НЕ ВИДНЫ** на экране.

### Что работает:
✅ Кнопка START BATTLE появляется в центре sandbox
✅ DEBUG PANEL показывает логи
✅ BattleManager.startBattle() вызывается
✅ Сетка создаётся 32×20 = 640 клеток
✅ Вирусы размещаются (9 красных слева, 9 синих справа)
✅ Spread cycle запущен (каждые 500ms)
✅ BattleRenderer.show() вызывается
✅ initGrid() вызывается

### Что НЕ работает:
❌ Вирусы НЕ ВИДНЫ на экране (BattleRenderer не рисует)

---

## 📊 ПОСЛЕДНИЕ СОБЫТИЯ (ЛОГИ)

```
[MainApp] ⚔️ START BATTLE button clicked!
[MainApp] Initial grid created: { width: 32, height: 20 }
[MainApp] Virus A cells: 9
[MainApp] Virus B cells: 9
[MainApp] Initializing BattleRenderer grid...
[BattleRenderer] Init grid: 32×20 = 640 cells
[BattleManager] Battle starting now!
[BattleManager] Spread cycle started (500ms interval)
[MainApp] Battle state changed: { type: "running", startTime: ..., tick: 0 }
[MainApp] Calling battleRenderer.show()
[BattleRenderer] show() CALLED
[BattleRenderer] Container state after show: { alpha: 1, visible: true }
[MainApp] Grid update received, calling battleRenderer.updateGrid()
[BattleRenderer] Grid updated: RED=9, BLUE=9, EMPTY=622, TOTAL=640
```

**ВСЁ РАБОТАЕТ!** Но вирусы не видны.

---

## 🔧 ЧТО НУЖНО ИСПРАВИТЬ

### Гипотеза 1: BattleRenderer контейнер перекрыт другими элементами

**Проверить:**
```javascript
// В консоли браузера (F12):
const container = document.getElementById('sandboxCanvasContainer');
console.log('Container z-index:', container.style.zIndex);
console.log('Container children:', container.children);

const sidebar = document.getElementById('sidebar');
console.log('Sidebar z-index:', sidebar.style.zIndex);
```

**Решение:** Убедиться, что canvas имеет `z-index: 1`, а BattleRenderer `z-index: 1000`

### Гипотеза 2: BattleRenderer контейнер не добавлен на stage

**Проверить в main.ts:**
```typescript
// В enterSandboxMode():
this.battleRenderer = new BattleRenderer(this.sandboxApp.stage);
// → Добавляет ли конструктор контейнер на stage?
```

**В BattleRenderer.ts конструктор:**
```typescript
constructor(stage: PIXI.Container, config?: ...) {
  this.container = new PIXI.Container();
  this.linesContainer = new PIXI.Graphics();
  this.container.addChild(this.linesContainer);
  
  // → ДОБАВЛЯЕТ ЛИ this.container НА stage???
  stage.addChild(this.container);  // ← ЭТОГО НЕТ!
}
```

**Решение:** Добавить `stage.addChild(this.container)` в конструктор!

### Гипотеза 3: Клетки не создаются правильно

**Проверить в консоли:**
```javascript
// После нажатия START BATTLE:
[BattleRenderer] Grid positioned at: ...
// → Какую позицию выводит?
```

---

## 📁 ИЗМЕНЁННЫЕ ФАЙЛЫ

### V4/client/src/main.ts
**Добавлено:**
1. `updateDebugPanel()` - обновление debug панели
2. Подписка на `battleManager.onGridUpdate()`
3. Подписка на `battleManager.setOnStateChange()`
4. Создание `battleRenderer` в `enterSandboxMode()`
5. Вызов `battleRenderer.initGrid()` перед `startBattle()`
6. Обработчик кнопки START BATTLE

**Строки для проверки:**
- Лины 119-127: Подписка на grid update
- Линии 130-152: Подписка на state change
- Линии 364-373: Создание BattleRenderer
- Линии 665-668: Вызов initGrid()

### V4/client/index.html
**Добавлено:**
1. DEBUG PANEL (bottom-left, z-index: 10000)
2. START BATTLE button (center, z-index: 1000)

**Строки:**
- Линии 835-839: DEBUG PANEL
- Линии 849-851: START BATTLE button

### V4/client/src/features/battle/
**Созданы новые файлы (биологическая симуляция):**
- `BioTypes.ts` - 10 параметров + hidden genome
- `SynergyCalculator.ts` - 20+ синергий
- `BiologicalStateMachine.ts` - 11 состояний вируса
- `ChaosEngine.ts` - 10 chaos events + 20 weird events
- `AIArchetypes.ts` - 10 AI архетипов

**Существующие файлы:**
- `BattleManager.ts` - работает (spread cycle)
- `BattleRenderer.ts` - ТРЕБУЕТ ИСПРАВЛЕНИЯ
- `VirusTubeManager.ts` - работает (4 вируса)

---

## 🚀 СЛЕДУЮЩИЕ ШАГИ (НА ЗАВТРА)

### Шаг 1: Проверить, добавлен ли BattleRenderer на stage

**В BattleRenderer.ts конструктор (линия ~88):**
```typescript
constructor(stage: PIXI.Container, config?: ...) {
  this.container = new PIXI.Container();
  this.linesContainer = new PIXI.Graphics();
  this.container.addChild(this.linesContainer);
  
  this.config = { ... };
  
  // → ДОБАВИТЬ:
  stage.addChild(this.container);  // ← ДОБАВИТЬ ЭТУ СТРОКУ!
  
  console.log('[BattleRenderer] Created');
}
```

### Шаг 2: Проверить позицию контейнера

**После добавления stage.addChild(), проверить в консоли:**
```
[BattleRenderer] Grid positioned at: { x: ..., y: ... }
```

**Если позиция за пределами экрана** → исправить `centerGrid()`

### Шаг 3: Проверить, рисуются ли клетки

**Добавить лог в updateCell():**
```typescript
private updateCell(container: PIXI.Container, value: number, ...): void {
  console.log('[BattleRenderer] updateCell called:', { value, cellIndex });
  // ... остальной код
}
```

### Шаг 4: Проверить z-index canvas

**В main.ts, после создания sandboxApp:**
```typescript
this.sandboxApp.canvas.style.zIndex = '1';
```

### Шаг 5: Упростить отладку - нарисовать тестовый квадрат

**Добавить в BattleRenderer после initGrid:**
```typescript
// Тест - нарисовать красный квадрат в центре
const testGraphics = new PIXI.Graphics();
testGraphics.beginFill(0xff0000);
testGraphics.drawRect(100, 100, 50, 50);
testGraphics.endFill();
this.stage.addChild(testGraphics);
```

**Если квадрат виден** → проблема в клетках
**Если квадрат НЕ виден** → проблема со stage/canvas

---

## 📋 ПОЛНЫЙ СПИСОК ФАЙЛОВ V4

```
V4/
├── client/
│   ├── src/
│   │   ├── main.ts                          ← ИЗМЕНЁН (добавлена подписка)
│   │   ├── core/
│   │   │   ├── GameEngine.ts
│   │   │   ├── NetworkManager.ts
│   │   │   └── InputManager.ts
│   │   ├── features/
│   │   │   ├── battle/
│   │   │   │   ├── BattleManager.ts         ← РАБОТАЕТ
│   │   │   │   ├── BattleRenderer.ts        ← ТРЕБУЕТ ИСПРАВЛЕНИЯ
│   │   │   │   ├── BattleRendererOptimized.ts
│   │   │   │   ├── VirusTubeManager.ts      ← РАБОТАЕТ
│   │   │   │   ├── VirusParamsUI.ts
│   │   │   │   ├── BioTypes.ts              ← НОВЫЙ
│   │   │   │   ├── SynergyCalculator.ts     ← НОВЫЙ
│   │   │   │   ├── BiologicalStateMachine.ts← НОВЫЙ
│   │   │   │   ├── ChaosEngine.ts           ← НОВЫЙ
│   │   │   │   └── AIArchetypes.ts          ← НОВЫЙ
│   │   │   └── lab/
│   │   │       ├── index.ts
│   │   │       └── LaboratoryManager.ts     ← STUB
│   │   └── ui/
│   │       └── UIController.ts
│   ├── index.html                           ← ИЗМЕНЁН (кнопка + debug)
│   ├── vite.config.ts
│   └── package.json
├── server/
│   └── src/
├── MIGRATION_COMPLETE.md                    ← Документ миграции
├── ВИРУСНАЯ_БИТВА_МЕХАНИКА.md              ← Механика битвы
└── package.json
```

---

## 🔍 ОТЛАДОЧНЫЕ КОМАНДЫ

### Запустить V4:
```bash
cd C:\__Qwen1\TOVCH\V4
npm run dev
```

### Открыть в браузере:
```
http://localhost:3000
```

### Тестировать:
1. Кликнуть **SANDBOX**
2. Кликнуть **⚔️ START BATTLE ⚔️**
3. Смотреть **DEBUG PANEL** (bottom-left)
4. Смотреть **Console** (F12)

### Ожидаемые логи:
```
[MainApp] Entering sandbox mode...
[MainApp] BattleRenderer created
[MainApp] BattleRenderer subscribed to ticker
[MainApp] ⚔️ START BATTLE button clicked!
[BattleRenderer] Init grid: 32×20 = 640 cells
[BattleManager] Battle starting now!
[BattleRenderer] Grid updated: RED=9, BLUE=9, EMPTY=622
```

---

## 💡 ЗАМЕТКИ

### Что уже работает:
- ✅ VirusTubeManager - 4 вируса, рандомизация
- ✅ BattleManager - spread cycle, параметры
- ✅ START BATTLE кнопка - создаёт сетку
- ✅ DEBUG PANEL - показывает логи

### Что требует исправления:
- ⚠️ BattleRenderer - не добавлен на stage
- ⚠️ Визуализация - клетки не рисуются

### Приоритеты:
1. **Исправить BattleRenderer** (добавить на stage)
2. **Проверить отрисовку** (клетки видны?)
3. **Запустить битву** (распространение работает?)
4. **Добавить механики** (параметры, синергии)
5. **Добавить хаос** (weird events, мутации)

---

## 📞 КОНТАКТЫ ДЛЯ ПОМОЩИ

Если что-то не работает, проверить:

1. **Консоль браузера (F12)** - есть ли ошибки?
2. **DEBUG PANEL** - что показывает?
3. **Элементы (F12 → Elements)** - виден ли canvas?
4. **z-index** - не перекрыт ли BattleRenderer?

---

**СОХРАНЕНО:** 2026-03-03 01:30
**СЛЕДУЮЩИЙ ШАГ:** Исправить BattleRenderer - добавить stage.addChild(this.container)
**ОЖИДАЕМЫЙ РЕЗУЛЬТАТ:** Вирусы видны на экране, распространяются каждые 500ms
