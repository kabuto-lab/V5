# ViRU5 V5 - ПОЛНАЯ ДОКУМЕНТАЦИЯ КОДА
# ViRU5 V5 - COMPLETE CODE DOCUMENTATION

**Версия / Version:** 5.0  
**Дата / Date:** 2026-03-08  
**Язык / Language:** Русский / English (билингвальный / bilingual)

---

## 📁 СТРУКТУРА ПРОЕКТА / PROJECT STRUCTURE

```
V5/
├── client/                    # Клиентская часть / Client-side
│   └── src/
│       ├── main.ts            # Точка входа / Entry point
│       ├── core/              # Основные движки / Core engines
│       │   ├── GameEngine.ts  # Инициализация PixiJS / PixiJS init
│       │   ├── NetworkManager.ts # Сетевой менеджер / Network manager
│       │   └── InputManager.ts # Ввод (мышь/клавиатура) / Input (mouse/keyboard)
│       ├── features/          # Игровые функции / Game features
│       │   ├── battle/        # Битва / Battle
│       │   │   ├── BattleManager.ts    # Логика битвы / Battle logic
│       │   │   ├── BattleRenderer.ts   # Визуализация / Visualization
│       │   │   └── VirusTubeManager.ts # UI параметров / Parameters UI
│       │   └── ...
│       └── ui/                # Интерфейс / User Interface
│           └── UIController.ts # Контроллер UI / UI controller
│
└── server/                    # Серверная часть / Server-side
    └── src/
        ├── index.ts           # Точка входа сервера / Server entry point
        └── rooms/             # Игровые комнаты / Game rooms
            ├── schema.ts      # Схема состояния / State schema
            └── BattleRoom.ts  # Логика комнаты / Room logic
```

---

## 📄 ФАЙЛЫ / FILES

### 1. client/src/main.ts
**Назначение / Purpose:** Главная точка входа приложения  
**Main entry point of the application**

#### ФУНКЦИИ / FUNCTIONS:
- **Инициализация всех систем** / Initialize all systems
- **Управление режимами** (песочница/мультиплеер) / Manage modes (sandbox/multiplayer)
- **Координация компонентов** / Coordinate components

#### КЛЮЧЕВЫЕ МЕТОДЫ / KEY METHODS:

```typescript
constructor()
// Создаёт все менеджеры / Creates all managers
// Порядок / Order:
// 1. GameEngine → PixiJS рендерер
// 2. NetworkManager → Colyseus клиент
// 3. InputManager → Отслеживание мыши
// 4. UIController → Переключение экранов
// 5. VirusTubeManager → Параметры вируса
// 6. BattleManager → Логика битвы

setupInteractions()
// Настраивает связи между компонентами через callback
// Sets up connections between components via callbacks

enterSandboxMode()
// Создаёт отдельное PixiJS приложение для песочницы
// Creates separate PixiJS app for sandbox mode
// - 4 вируса вместо 2 / 4 viruses instead of 2
// - Локальная симуляция / Local simulation

leaveSandboxMode()
// Уничтожает приложение песочницы
// Destroys sandbox application
```

#### СВЯЗИ / CONNECTIONS:
```
VirusTubeManager → onParamsChange → NetworkManager → Server
   (параметры)         (событие)      (отправка)

BattleManager → onGridUpdate → BattleRenderer → Screen
   (состояние)      (событие)     (отрисовка)

BattleManager → onStateChange → MainApp → UI/Alerts
   (битва)         (событие)    (обработка)
```

---

### 2. client/src/core/GameEngine.ts
**Назначение / Purpose:** Инициализация и управление PixiJS  
**Initialize and manage PixiJS**

#### ФУНКЦИИ / FUNCTIONS:
- Создание приложения PixiJS / Create PixiJS application
- Настройка рендерера / Setup renderer
- Запуск игрового цикла / Start game loop

#### КЛЮЧЕВЫЕ МЕТОДЫ / KEY METHODS:

```typescript
init(containerId: string): Promise<void>
// Инициализирует PixiJS в указанном HTML контейнере
// Initializes PixiJS in specified HTML container

start()
// Запускает игровой цикл (ticker)
// Starts game loop (ticker)

resize(width: number, height: number)
// Изменяет размер рендерера
// Resizes renderer
```

#### ИГРОВОЙ ЦИКЛ / GAME LOOP:
```
60 FPS → update() → render() → repeat
         (логика)   (отрисовка)
```

---

### 3. client/src/core/NetworkManager.ts
**Назначение / Purpose:** Сетевое взаимодействие с сервером  
**Network communication with server**

#### ФУНКЦИИ / FUNCTIONS:
- Подключение к Colyseus серверу / Connect to Colyseus server
- Отправка действий игрока / Send player actions
- Получение обновлений состояния / Receive state updates

#### КЛЮЧЕВЫЕ МЕТОДЫ / KEY METHODS:

```typescript
connectToServer(url: string): Promise<void>
// Подключается к серверу по WebSocket
// Connects to server via WebSocket

joinRoom(roomId: string): Promise<void>
// Присоединяется к игровой комнате
// Joins game room

sendParameterUpdate(params: VirusParams): void
// Отправляет параметры вируса на сервер
// Sends virus parameters to server

sendToggleReady(ready: boolean): void
// Отправляет готовность игрока
// Sends player readiness
```

#### СОБЫТИЯ / EVENTS:
```
Server → NetworkManager → MainApp → UI
  ↓           ↓            ↓       ↓
tick      callback     handle   update
```

---

### 4. client/src/features/battle/BattleManager.ts
**Назначение / Purpose:** Логика и состояние битвы  
**Battle logic and state**

#### ФУНКЦИИ / FUNCTIONS:
- Управление состоянием битвы / Manage battle state
- Распространение вирусов / Virus spread
- Обработка столкновений / Handle collisions
- Определение победителя / Determine winner

#### СТРУКТУРА ДАННЫХ / DATA STRUCTURE:
```typescript
grid: number[]  // Сетка 64×40 = 2560 клеток
                // Grid 64×40 = 2560 cells
                // 0 = пусто, 1 = вирус A, 2 = вирус B

state: BattleState  // Текущее состояние
                    // Current state
                    // 'idle' | 'preparing' | 'running' | 'ended'
```

#### КЛЮЧЕВЫЕ МЕТОДЫ / KEY METHODS:

```typescript
startBattle(grid: number[], width: number, height: number): void
// Начинает битву с заданной сеткой
// Starts battle with given grid

spreadTick(): void
// Тик распространения (каждые 500ms)
// Spread tick (every 500ms)
// 1. Проход по всем клеткам / Loop through all cells
// 2. Попытка распространения / Attempt spread
// 3. Обработка столкновений / Handle collisions
// 4. Проверка победы / Check victory

spreadVirus(grid, x, y, virusType, width, height): void
// Распространяет вирус из клетки
// Spreads virus from cell

checkWinCondition(): void
// Проверяет условие победы (96% территории)
// Checks victory condition (96% territory)
```

#### МЕХАНИКА БИТВЫ / BATTLE MECHANICS:
```
Тик 500ms → Spread Phase → Combat Phase → Infestation → Victory Check
           (распростр.)    (бой)          (заражение)   (проверка)
```

---

### 5. client/src/features/battle/BattleRenderer.ts
**Назначение / Purpose:** Визуализация битвы на PixiJS  
**Battle visualization using PixiJS**

#### ФУНКЦИИ / FUNCTIONS:
- Отрисовка сетки клеток / Draw grid of cells
- Визуализация вирусов / Visualize viruses
- Эффекты сражений / Battle effects

#### КЛЮЧЕВЫЕ МЕТОДЫ / KEY METHODS:

```typescript
initGrid(width: number, height: number): void
// Создаёт спрайты для всех клеток
// Creates sprites for all cells

updateGrid(grid: number[]): void
// Обновляет цвета клеток по данным сетки
// Updates cell colors from grid data

show(): void
// Показывает контейнер битвы
// Shows battle container

hide(): void
// Скрывает контейнер битвы
// Hides battle container

onResize(): void
// Адаптирует размер к окну
// Adapts size to window
```

#### ОТРИСОВКА / RENDERING:
```typescript
cellSprites: PIXI.Sprite[]  // Массив спрайтов клеток
                            // Array of cell sprites
colors: {
  empty: 0x1a1a1a,   // Тёмно-серый / Dark gray
  virus1: 0xff0000,  // Красный / Red
  virus2: 0x0000ff,  // Синий / Blue
  virus3: 0x00ff00,  // Зелёный / Green
  virus4: 0xffff00,  // Жёлтый / Yellow
}
```

---

### 6. client/src/features/battle/VirusTubeManager.ts
**Назначение / Purpose:** UI для настройки параметров вируса  
**UI for configuring virus parameters**

#### ФУНКЦИИ / FUNCTIONS:
- Отображение 12 параметров вируса / Display 12 virus parameters
- Распределение 12 очков / Distribute 12 points
- Валидация параметров / Validate parameters

#### ПАРАМЕТРЫ / PARAMETERS:
```
1. Aggression ⚔️    - Сила атаки / Attack power
2. Mutation 🧬      - Шанс конвертации / Conversion chance
3. Speed ⚡         - Скорость распространения / Spread speed
4. Defense 🛡️      - Защита / Defense
5. Reproduction 🦠  - Размножение / Reproduction
6. Stealth 👻       - Скрытность / Stealth
7. Virulence ☣️     - Разрушение / Destruction
8. Resilience 💪    - Выживание / Survival
9. Mobility 🚶      - Передвижение / Mobility
10. Intellect 🧠    - Стратегия / Strategy
11. Contagiousness 🫁 - Заражение / Contagion
12. Lethality 💀    - Смертельность / Lethality
```

#### КЛЮЧЕВЫЕ МЕТОДЫ / KEY METHODS:

```typescript
addPoint(paramName: string): void
// Добавляет очко параметру (+1)
// Adds point to parameter (+1)

removePoint(paramName: string): void
// Убирает очко параметра (-1)
// Removes point from parameter (-1)

randomizeCurrentVirus(): void
// Случайно распределяет 12 очков
// Randomly distributes 12 points

updateDisplay(): void
// Обновляет отображение всех параметров
// Updates display of all parameters
```

#### ПРАВИЛА / RULES:
```
- Всего очков / Total points: 12
- Максимум в стат / Max per stat: 10
- Минимум / Minimum: 0
- Кнопка ГОТОВ активна только при 0 очков / READY button active only at 0 points
```

---

### 7. client/src/ui/UIController.ts
**Назначение / Purpose:** Управление переключением экранов  
**Manage screen switching**

#### ФУНКЦИИ / FUNCTIONS:
- Переключение Lobby ↔ Room ↔ Sandbox
- Управление боковыми панелями / Manage side panels
- Обработка кнопок меню / Handle menu buttons

#### ЭКРАНЫ / SCREENS:
```typescript
screens = {
  landingScreen: 'Главное меню / Main menu',
  sandboxScreen: 'Песочница / Sandbox',
  gameScreen: 'Игра / Game',
  roomScreen: 'Комната / Room'
}
```

#### КЛЮЧЕВЫЕ МЕТОДЫ / KEY METHODS:

```typescript
setView(view: 'lobby' | 'room' | 'sandbox'): void
// Переключает видимый экран
// Switches visible screen

showScreen(screenId: string): void
// Показывает указанный экран
// Shows specified screen

hideScreen(screenId: string): void
// Скрывает указанный экран
// Hides specified screen
```

---

### 8. server/src/index.ts
**Назначение / Purpose:** Точка входа сервера  
**Server entry point**

#### ФУНКЦИИ / FUNCTIONS:
- Настройка Express сервера / Setup Express server
- Инициализация Colyseus / Initialize Colyseus
- Запуск WebSocket сервера / Start WebSocket server

#### КОНФИГУРАЦИЯ / CONFIGURATION:
```typescript
port: 2567              // Порт сервера / Server port
cors: { origin: '*' }   // CORS для клиента / CORS for client
```

---

### 9. server/src/rooms/schema.ts
**Назначение / Purpose:** Схема состояния комнаты  
**Room state schema**

#### СТРУКТУРА / STRUCTURE:
```typescript
RoomState {
  players: Map<Player>,     // Игроки в комнате / Players in room
  battleGrid: number[],     // Сетка битвы / Battle grid
  tick: number,             // Номер тика / Tick number
  state: 'waiting' | 'countdown' | 'running' | 'ended'
}
```

---

### 10. server/src/rooms/BattleRoom.ts
**Назначение / Purpose:** Логика игровой комнаты  
**Game room logic**

#### ФУНКЦИИ / FUNCTIONS:
- Синхронизация состояния / Synchronize state
- Обработка действий игроков / Handle player actions
- Запуск симуляции битвы / Start battle simulation

#### КЛЮЧЕВЫЕ МЕТОДЫ / KEY METHODS:

```typescript
onCreate(options: any): void
// Создаёт комнату с начальным состоянием
// Creates room with initial state

onJoin(client: Client, options: any): void
// Игрок присоединяется к комнате
// Player joins room

onLeave(client: Client, consented: boolean): void
// Игрок покидает комнату
// Player leaves room

setSimulationInterval(callback: () => void, delay: number): void
// Запускает цикл симуляции (500ms)
// Starts simulation loop (500ms)
```

---

## 🎮 ПОТОК ДАННЫХ / DATA FLOW

### ОДИНОЧНАЯ ИГРА / SINGLE PLAYER (SANDBOX):
```
1. Игрок настраивает 4 вируса / Player configures 4 viruses
   ↓
2. VirusTubeManager сохраняет параметры / VirusTubeManager saves params
   ↓
3. Игрок нажимает "НАЧАТЬ БИТВУ" / Player clicks "START BATTLE"
   ↓
4. BattleManager.startBattle() создаёт сетку / creates grid
   ↓
5. BattleManager.spreadTick() каждые 500ms / every 500ms
   ↓
6. BattleRenderer.updateGrid() отрисовывает / renders
   ↓
7. Проверка победы / Victory check → alert()
```

### СЕТЕВАЯ ИГРА / MULTIPLAYER:
```
1. Игрок 1 создаёт комнату / Player 1 creates room
   ↓
2. NetworkManager.joinRoom() → Server
   ↓
3. Игрок 2 присоединяется / Player 2 joins
   ↓
4. Оба настраивают вирусы / Both configure viruses
   ↓
5. Оба нажимают ГОТОВ / Both click READY
   ↓
6. Server начинает отсчёт / Server starts countdown
   ↓
7. Server запускает симуляцию / Server starts simulation
   ↓
8. Server → tick данные → оба клиента / both clients
   ↓
9. BattleRenderer отрисовывает / renders
   ↓
10. Server определяет победителя / determines winner
```

---

## 🔧 ТЕХНИЧЕСКИЕ ДЕТАЛИ / TECHNICAL DETAILS

### СЕТКА / GRID:
- **Размер / Size:** 64 × 40 = 2,560 клеток / cells
- **Пустая клетка / Empty:** 0
- **Вирус A / Virus A:** 1 (красный / red)
- **Вирус B / Virus B:** 2 (синий / blue)
- **Вирус C / Virus C:** 3 (зелёный / green)
- **Вирус D / Virus D:** 4 (жёлтый / yellow)

### ТАЙМИНГ / TIMING:
- **Tick rate:** 500ms (2 тика/секунду / ticks per second)
- **Battle duration:** ~30-120 секунд / seconds
- **Victory:** 96% территории / territory

### РЕНДЕРИНГ / RENDERING:
- **Движок / Engine:** PixiJS v8.16
- **FPS:** 60
- **Метод / Method:** Graphics спрайты / sprites
- **Размер клетки / Cell size:** Вычисляется dynamically / dynamically computed

---

## 📝 ССЫЛКИ / REFERENCES

### Документация / Documentation:
- [README.md](./README.md) - Общая информация / General info
- [GAME_MECHANICS.md](./GAME_MECHANICS.md) - Механика игры / Game mechanics
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Развёртывание / Deployment

### Код / Code:
- [client/src/main.ts](./client/src/main.ts) - Entry point
- [client/src/features/battle/](./client/src/features/battle/) - Battle system
- [server/src/rooms/](./server/src/rooms/) - Server rooms

---

**Последнее обновление / Last updated:** 2026-03-08
