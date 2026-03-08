import { BaseCommand } from '../base/Command';

export class SendMessageCommand extends BaseCommand<{ sessionId: string; message: string }> {
  execute(data: { sessionId: string; message: string }): void {
    const { sessionId, message } = data;
    const player = this.state.players.get(sessionId);
    
    if (!player || message.length > 200) return;

    const chatEntry = `[${new Date().toLocaleTimeString()}] ${player.name}: ${message}`;
    this.state.chatHistory.push(chatEntry);
    
    if (this.state.chatHistory.length > 50) {
      this.state.chatHistory.shift();
    }

    this.room.broadcast('chatMessage', {
      sessionId,
      name: player.name,
      message,
      timestamp: Date.now()
    });
  }
}
