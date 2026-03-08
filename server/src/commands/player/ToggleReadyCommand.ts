import { BaseCommand } from '../base/Command';

export class ToggleReadyCommand extends BaseCommand<{ sessionId: string }> {
  execute(data: { sessionId: string }): void {
    const player = this.state.players.get(data.sessionId);
    
    if (!player || this.state.phase !== 'setup') return;

    player.isReady = !player.isReady;
    
    this.room.broadcast('playerReady', {
      sessionId: data.sessionId,
      isReady: player.isReady
    });

    // Check if all players ready
    this.room.checkStartCondition();
  }
}
