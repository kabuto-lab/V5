import { BaseCommand } from '../base/Command';

export class OnJoinCommand extends BaseCommand<{ sessionId: string; options: any }> {
  execute(data: { sessionId: string; options: any }): void {
    const { sessionId, options } = data;

    // Clear empty room timeout
    if (this.room.emptyRoomTimeout) {
      clearTimeout(this.room.emptyRoomTimeout);
      this.room.emptyRoomTimeout = null;
    }

    // Create new player
    const player = this.room.createPlayer(sessionId, options);
    this.state.players.set(sessionId, player);

    console.log(`[BattleRoom] ${player.name} joined as Team ${player.team}`);

    // Send init state to new player
    this.room.clients.get(sessionId)?.send('initState', {
      roomId: this.state.roomId,
      isLaboratoryMode: this.state.isLaboratoryMode,
      yourSessionId: sessionId,
      yourTeam: player.team,
      phase: this.state.phase
    });

    // Notify others
    this.room.broadcast('playerJoined', {
      sessionId,
      name: player.name,
      team: player.team,
      isCreator: player.isRoomCreator
    }, { except: sessionId });

    // Auto-start setup phase if first player
    if (this.state.players.size === 1 && !this.state.isLaboratoryMode) {
      this.state.phase = 'setup';
    }
  }
}
