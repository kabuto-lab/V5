import { RoomState, BattleCellSchema, PlayerSchema } from '../rooms/schema';

export class GridSystem {
  private readonly DIRECTIONS = [
    { x: 1, y: 0 }, { x: -1, y: 0 },
    { x: 0, y: 1 }, { x: 0, y: -1 }
  ];

  private readonly DIAGONALS = [
    { x: 1, y: 1 }, { x: -1, y: -1 },
    { x: 1, y: -1 }, { x: -1, y: 1 }
  ];

  calculateSpread(state: RoomState): Array<{ index: number; owner: number; hp: number }> {
    const updates: Array<{ index: number; owner: number; hp: number }> = [];
    const width = state.gridWidth;

    state.battleGrid.forEach((cell) => {
      if (cell.owner === 0 || cell.hp < 20) return;

      const player = this.getPlayerByTeam(state, cell.owner);
      if (!player) return;

      const params = player.virusParams;
      const spreadChance = 0.1 + (params.propagation * 0.05) + (params.replication * 0.02);

      if (Math.random() > spreadChance) return;

      // Get neighbors based on mobility
      let neighbors = this.getNeighbors(cell.index, width, state.gridHeight);
      if (params.mobility >= 5) {
        neighbors = neighbors.concat(this.getDiagonalNeighbors(cell.index, width, state.gridHeight));
      }

      neighbors.forEach(n => {
        const neighbor = state.battleGrid.get(n.index.toString());
        if (neighbor && neighbor.owner === 0) {
          updates.push({
            index: n.index,
            owner: cell.owner,
            hp: 50 + (params.replication * 5)
          });
        }
      });
    });

    return updates;
  }

  private getNeighbors(index: number, width: number, height: number) {
    const x = index % width;
    const y = Math.floor(index / width);

    return this.DIRECTIONS
      .map(d => ({ x: x + d.x, y: y + d.y }))
      .filter(p => p.x >= 0 && p.x < width && p.y >= 0 && p.y < height)
      .map(p => ({ index: p.y * width + p.x }));
  }

  private getDiagonalNeighbors(index: number, width: number, height: number) {
    const x = index % width;
    const y = Math.floor(index / width);

    return this.DIAGONALS
      .map(d => ({ x: x + d.x, y: y + d.y }))
      .filter(p => p.x >= 0 && p.x < width && p.y >= 0 && p.y < height)
      .map(p => ({ index: p.y * width + p.x }));
  }

  private getPlayerByTeam(state: RoomState, team: number) {
    return Array.from(state.players.values()).find(p => p.team === team);
  }
}
