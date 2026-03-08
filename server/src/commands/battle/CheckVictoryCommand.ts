import { BaseCommand } from '../base/Command';

export class CheckVictoryCommand extends BaseCommand {
  execute(): void {
    const totals = new Map<number, number>();
    let totalOccupied = 0;

    this.state.battleGrid.forEach((cell) => {
      if (cell.owner > 0) {
        totalOccupied++;
        totals.set(cell.owner, (totals.get(cell.owner) || 0) + 1);
      }
    });

    if (totalOccupied === 0) return;

    const WIN_THRESHOLD = 0.96; // 96% domination

    // Check 96% domination
    totals.forEach((count, team) => {
      const ratio = count / totalOccupied;
      if (ratio >= WIN_THRESHOLD) {
        this.room.endBattle('domination', team);
      }
    });

    // Check timeout (1000 ticks)
    if (this.state.battleTick >= this.state.maxBattleTicks) {
      this.room.endBattle('timeout');
    }
  }
}
