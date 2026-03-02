import store from '../store/store.js';
import { getMessages, getPins } from '../api/http.js';
import { MessageList } from './MessageList.js';
import { MessageInput } from './MessageInput.js';
import { PinBar } from './PinBar.js';
import { SearchPanel } from './SearchPanel.js';

export class ChatWindow {
  constructor(container) {
    this.container = container;
    this._messageList = null;
    this._messageInput = null;
    this._pinBar = null;
    this._searchPanel = null;
    this._sidebarOpen = false;
    this._unsubscribe = null;
  }

  async mount() {
    this.container.innerHTML = '';
    this.container.className = 'flex h-full';

    // ── Sidebar ────────────────────────────────────────────────────────────
    this._sidebar = document.createElement('aside');
    this._sidebar.className = [
      'flex-shrink-0 w-72 bg-white border-r border-gray-100 flex flex-col',
      'hidden md:flex',
    ].join(' ');
    this._sidebar.id = 'sidebar';

    // Sidebar header
    const sidebarHeader = document.createElement('div');
    sidebarHeader.className = 'px-4 py-3 border-b border-gray-100 flex items-center gap-2';
    sidebarHeader.innerHTML = `
      <span class="text-teal-600 text-xl">💬</span>
      <span class="font-bold text-gray-800">Chaos Organizer</span>
    `;
    this._sidebar.appendChild(sidebarHeader);

    // Search panel
    const searchContainer = document.createElement('div');
    searchContainer.className = 'flex-1 overflow-auto';
    this._searchPanel = new SearchPanel(searchContainer);
    this._searchPanel.mount();
    this._sidebar.appendChild(searchContainer);

    // ── Main area ──────────────────────────────────────────────────────────
    const main = document.createElement('main');
    main.className = 'flex-1 flex flex-col min-w-0 bg-gray-50';

    // Header
    const header = document.createElement('header');
    header.className = 'flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm';

    // Mobile sidebar toggle
    const menuBtn = document.createElement('button');
    menuBtn.className = 'btn-icon md:hidden';
    menuBtn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
    </svg>`;
    menuBtn.addEventListener('click', () => this._toggleSidebar());

    const avatar = document.createElement('div');
    avatar.className = 'w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0';
    avatar.textContent = 'CO';

    const titleWrap = document.createElement('div');
    titleWrap.className = 'flex-1 min-w-0';
    titleWrap.innerHTML = `
      <div class="font-semibold text-gray-800 text-sm">Chaos Organizer</div>
      <div id="conn-status" class="text-xs text-gray-400">Подключение...</div>
    `;

    header.appendChild(menuBtn);
    header.appendChild(avatar);
    header.appendChild(titleWrap);

    // ── Pin bar ────────────────────────────────────────────────────────────
    const pinContainer = document.createElement('div');
    this._pinBar = new PinBar(pinContainer);
    this._pinBar.mount();

    // ── Message area ───────────────────────────────────────────────────────
    const messagesArea = document.createElement('div');
    messagesArea.className = 'flex-1 overflow-y-auto py-4 messages-area';
    this._messageList = new MessageList(messagesArea);
    this._messageList.mount();

    // ── Input ──────────────────────────────────────────────────────────────
    const inputContainer = document.createElement('div');
    inputContainer.className = 'input-container';
    this._messageInput = new MessageInput(inputContainer);
    this._messageInput.mount();

    main.appendChild(header);
    main.appendChild(pinContainer);
    main.appendChild(messagesArea);
    main.appendChild(inputContainer);

    this.container.appendChild(this._sidebar);
    this.container.appendChild(main);

    // Status indicator
    this._statusEl = titleWrap.querySelector('#conn-status');
    this._unsubscribe = store.on((key) => {
      if (key === 'connectionStatus') this._updateStatus();
    });
    this._updateStatus();

    // Load initial messages
    await this._loadInitial();
  }

  unmount() {
    this._unsubscribe?.();
    this._messageList?.unmount();
    this._messageInput?.unmount();
    this._pinBar?.unmount();
    this._searchPanel?.unmount();
  }

  async _loadInitial() {
    try {
      const [msgData, pinData] = await Promise.all([getMessages(10), getPins()]);

      store.set('hasMore', msgData.hasMore);
      store.set('oldestLoadedId', msgData.oldestId);
      store.set('messages', msgData.items);

      // Set pinned from server
      const pinned = pinData.items?.[0] || msgData.items.find((m) => m.pinned) || null;
      store.set('pinnedMessage', pinned);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to load initial messages:', err);
    }
  }

  _updateStatus() {
    if (!this._statusEl) return;
    const status = store.get('connectionStatus');
    const labels = {
      open: '● В сети',
      connecting: '○ Подключение...',
      closed: '○ Нет соединения',
    };
    const colors = {
      open: 'text-green-500',
      connecting: 'text-yellow-500',
      closed: 'text-red-400',
    };
    this._statusEl.textContent = labels[status] || status;
    this._statusEl.className = `text-xs ${colors[status] || 'text-gray-400'}`;
  }

  _toggleSidebar() {
    this._sidebarOpen = !this._sidebarOpen;
    if (this._sidebarOpen) {
      this._sidebar.classList.remove('hidden');
      this._sidebar.classList.add('flex', 'fixed', 'inset-y-0', 'left-0', 'z-40', 'shadow-xl');
      this._backdrop = document.createElement('div');
      this._backdrop.className = 'fixed inset-0 z-30 bg-black/30 md:hidden';
      this._backdrop.addEventListener('click', () => this._toggleSidebar());
      document.body.appendChild(this._backdrop);
    } else {
      this._sidebar.classList.add('hidden');
      this._sidebar.classList.remove('flex', 'fixed', 'inset-y-0', 'left-0', 'z-40', 'shadow-xl');
      this._backdrop?.remove();
      this._backdrop = null;
    }
  }
}
