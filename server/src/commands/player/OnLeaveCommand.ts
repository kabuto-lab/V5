import { BaseCommand } from '../base/Command';

export class OnLeaveCommand extends BaseCommand<{ sessionId: string; consented: boolean }> {
  execute(data: { sessionId: string; consented: boolean }): void {
    const { sessionId } = data;
    const player = this.state.players.get(sessionId);
    
    if (!player) return;

    player.isConnected = false;
    console.log(`[BattleRoom] ${player.name} left`);

    this.room.broadcast('playerLeft', {
      sessionId,
      name: player.name
    });

    // If battle hasn't started, remove player entirely
    if (this.state.phase === 'lobby' || this.state.phase === 'setup') {
      this.state.players.delete(sessionId);
    }

    // Check if room empty
    if (this.state.players.size === 0) {
      this.room.emptyRoomTimeout = setTimeout(() => {
        this.room.disconnect();
      }, 5 * 60 * 1000); // 5 minutes
    }
  }
}
