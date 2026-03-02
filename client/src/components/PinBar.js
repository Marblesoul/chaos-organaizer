import store from '../store/store.js';
import { unpinMessage } from '../api/http.js';

export class PinBar {
  constructor(container) {
    this.container = container;
    this._el = null;
    this._unsubscribe = null;
  }

  mount() {
    this._el = document.createElement('div');
    this._el.className = 'pin-bar';
    this._el.style.display = 'none'; // hidden by default via style, not class
    this.container.appendChild(this._el);

    this._unsubscribe = store.on((key) => {
      if (key === 'messages' || key === 'pinnedMessage') this._render();
    });

    this._render();
  }

  unmount() {
    this._unsubscribe?.();
    this._el?.remove();
  }

  _render() {
    const pinned = store.get('pinnedMessage')
      || store.get('messages').find((m) => m.pinned);

    if (!pinned) {
      this._el.style.display = 'none';
      return;
    }

    this._el.style.display = 'flex';
    this._el.innerHTML = '';

    const icon = document.createElement('span');
    icon.textContent = '📌';
    icon.className = 'text-teal-600 flex-shrink-0';

    const textWrap = document.createElement('div');
    textWrap.className = 'flex-1 min-w-0';

    const label = document.createElement('div');
    label.className = 'text-xs text-teal-600 font-semibold';
    label.textContent = 'Закреплённое сообщение';

    const text = document.createElement('div');
    text.className = 'text-sm text-gray-700 truncate';
    text.textContent = pinned.content;

    textWrap.appendChild(label);
    textWrap.appendChild(text);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn-icon flex-shrink-0';
    closeBtn.title = 'Открепить';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      unpinMessage(pinned.id).catch((err) => console.warn('Unpin error:', err.message));
    });

    this._el.appendChild(icon);
    this._el.appendChild(textWrap);
    this._el.appendChild(closeBtn);
  }
}
