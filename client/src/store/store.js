/**
 * Minimal observable store.
 * Listeners are called with the changed slice name.
 */
class Store {
  constructor() {
    this._state = {
      messages: [],
      pinnedMessage: null,
      hasMore: false,
      oldestLoadedId: null,
      connectionStatus: 'connecting', // 'connecting' | 'open' | 'closed'
      searchResults: null, // null = not searching; [] = results
      searchQuery: '',
    };
    this._listeners = [];
  }

  get(key) {
    return this._state[key];
  }

  set(key, value) {
    this._state[key] = value;
    this._emit(key);
  }

  on(fn) {
    this._listeners.push(fn);
    return () => {
      this._listeners = this._listeners.filter((l) => l !== fn);
    };
  }

  _emit(key) {
    this._listeners.forEach((fn) => fn(key));
  }

  /** Prepend older messages (lazy load) */
  prependMessages(items) {
    this._state.messages = [...items, ...this._state.messages];
    this._emit('messages');
  }

  /** Append a new incoming message */
  appendMessage(msg) {
    // Avoid duplicates
    if (this._state.messages.some((m) => m.id === msg.id)) return;
    this._state.messages = [...this._state.messages, msg];
    if (msg.pinned) this._state.pinnedMessage = msg;
    this._emit('messages');
  }

  /** Update pin status for a message */
  setMessagePinned(updatedMsg) {
    this._state.messages = this._state.messages.map((m) => {
      if (m.id === updatedMsg.id) return updatedMsg;
      return { ...m, pinned: false }; // only one pinned at a time
    });
    this._state.pinnedMessage = updatedMsg;
    this._emit('messages');
    this._emit('pinnedMessage');
  }

  /** Clear pin */
  clearPin(id) {
    this._state.messages = this._state.messages.map((m) =>
      m.id === id ? { ...m, pinned: false } : m,
    );
    if (this._state.pinnedMessage?.id === id) {
      this._state.pinnedMessage = null;
    }
    this._emit('messages');
    this._emit('pinnedMessage');
  }
}

export default new Store();
