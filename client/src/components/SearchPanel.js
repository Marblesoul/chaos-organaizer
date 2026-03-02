import store from '../store/store.js';
import { searchMessages } from '../api/http.js';

export class SearchPanel {
  constructor(container) {
    this.container = container;
    this._el = null;
    this._input = null;
    this._debounceTimer = null;
  }

  mount() {
    this._el = document.createElement('div');
    this._el.className = 'flex flex-col h-full';

    const header = document.createElement('div');
    header.className = 'p-4 border-b border-gray-100';
    header.innerHTML = '<h3 class="font-semibold text-gray-700 mb-3">Поиск</h3>';

    this._input = document.createElement('input');
    this._input.type = 'text';
    this._input.placeholder = 'Поиск по сообщениям...';
    this._input.className = 'input-field';
    this._input.addEventListener('input', () => this._onInput());

    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Сбросить';
    clearBtn.className = 'text-xs text-teal-600 mt-2 hover:underline';
    clearBtn.addEventListener('click', () => this._clear());

    header.appendChild(this._input);
    header.appendChild(clearBtn);
    this._el.appendChild(header);

    this.container.appendChild(this._el);
  }

  unmount() {
    this._el?.remove();
    this._clear();
  }

  _onInput() {
    clearTimeout(this._debounceTimer);
    const q = this._input.value.trim();
    if (!q) {
      this._clear();
      return;
    }
    this._debounceTimer = setTimeout(() => this._search(q), 300);
  }

  async _search(q) {
    try {
      const data = await searchMessages(q);
      store.set('searchQuery', q);
      store.set('searchResults', data.items);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Search error:', err.message);
    }
  }

  _clear() {
    if (this._input) this._input.value = '';
    store.set('searchQuery', '');
    store.set('searchResults', null);
  }
}
