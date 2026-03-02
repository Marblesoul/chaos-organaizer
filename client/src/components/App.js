import wsClient from '../api/ws.js';
import { ChatWindow } from './ChatWindow.js';

export class App {
  constructor(rootEl) {
    this.rootEl = rootEl;
    this._chatWindow = null;
  }

  async mount() {
    this.rootEl.className = 'h-full';

    wsClient.connect();

    this._chatWindow = new ChatWindow(this.rootEl);
    await this._chatWindow.mount();
  }

  unmount() {
    this._chatWindow?.unmount();
    wsClient.disconnect();
  }
}
