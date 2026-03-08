import { describe, it, expect, beforeEach } from 'vitest';
import { GridSystem } from '../systems/GridSystem';
import { RoomState, BattleCellSchema, PlayerSchema } from '../rooms/schema';

describe('BattleSystem', () => {
  let gridSystem: GridSystem;
  let state: RoomState;

  beforeEach(() => {
    gridSystem = new GridSystem();
    state = new RoomState();
    state.gridWidth = 10;
    state.gridHeight = 10;

    // Initialize test grid
    for (let i = 0; i < 100; i++) {
      const cell = new BattleCellSchema();
      cell.index = i;
      state.battleGrid.set(i.toString(), cell);
    }
  });

  it('should calculate spread correctly', () => {
    const player = new PlayerSchema();
    player.team = 1;
    player.virusParams.propagation = 10;
    state.players.set('test', player);

    // Set starting cell
    const startCell = state.battleGrid.get('45')!;
    startCell.owner = 1;
    startCell.hp = 100;

    const updates = gridSystem.calculateSpread(state);

    expect(updates.length).toBeGreaterThan(0);
    expect(updates[0].owner).toBe(1);
  });

  it('should respect mobility diagonal spread', () => {
    const player = new PlayerSchema();
    player.team = 1;
    player.virusParams.propagation = 10;
    player.virusParams.mobility = 5; // Enable diagonal
    state.players.set('test', player);

    const startCell = state.battleGrid.get('45')!;
    startCell.owner = 1;
    startCell.hp = 100;

    const updates = gridSystem.calculateSpread(state);

    // Should have more options with diagonal (8 directions vs 4)
    const diagonalUpdates = updates.filter(u => {
      const x = u.index % 10;
      const y = Math.floor(u.index / 10);
      const startX = 5;
      const startY = 4;
      return Math.abs(x - startX) === 1 && Math.abs(y - startY) === 1;
    });

    expect(diagonalUpdates.length).toBeGreaterThan(0);
  });
});
