import wsClient from '../api/ws.js';
import { MediaUploader } from './MediaUploader.js';
import { Recorder } from './Recorder.js';
import store from '../store/store.js';

const BOT_HINT = '@chaos: weather | joke | time | date | coin | help';

export class MessageInput {
  constructor(container) {
    this.container = container;
    this._el = null;
    this._textarea = null;
    this._hint = null;
    this._recordBtn = null;
    this._uploader = null;
    this._recorder = null;
    this._uploading = false;
    this._unsubscribe = null;
  }

  mount() {
    this._el = document.createElement('div');
    this._el.className = 'border-t border-gray-100 bg-white px-4 py-3';

    // Bot hint
    this._hint = document.createElement('div');
    this._hint.className = 'text-xs text-teal-600 mb-1 hidden';
    this._hint.textContent = `💡 ${BOT_HINT}`;
    this._el.appendChild(this._hint);

    // Input row
    const row = document.createElement('div');
    row.className = 'flex items-end gap-2';

    // Attach button
    const attachBtn = document.createElement('button');
    attachBtn.className = 'btn-icon flex-shrink-0';
    attachBtn.title = 'Прикрепить файл';
    attachBtn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
    </svg>`;
    attachBtn.addEventListener('click', () => this._uploader.openPicker());

    // Textarea
    this._textarea = document.createElement('textarea');
    this._textarea.placeholder = 'Написать сообщение...';
    this._textarea.rows = 1;
    this._textarea.className = [
      'flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-2 text-sm',
      'outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 bg-white',
      'max-h-32 leading-relaxed',
    ].join(' ');
    this._textarea.addEventListener('input', () => this._onInput());
    this._textarea.addEventListener('keydown', (e) => this._onKeydown(e));

    // Record button
    this._recordBtn = document.createElement('button');
    this._recordBtn.className = 'btn-icon flex-shrink-0';
    this._recordBtn.title = 'Записать голосовое';
    this._recordBtn.innerHTML = this._micIcon();
    this._recordBtn.addEventListener('click', () => this._toggleRecord());

    // Send button
    const sendBtn = document.createElement('button');
    sendBtn.className = 'flex-shrink-0 bg-teal-600 hover:bg-teal-700 text-white rounded-full p-2 transition-colors';
    sendBtn.title = 'Отправить';
    sendBtn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
    </svg>`;
    sendBtn.addEventListener('click', () => this._send());

    row.appendChild(attachBtn);
    row.appendChild(this._textarea);
    row.appendChild(this._recordBtn);
    row.appendChild(sendBtn);
    this._el.appendChild(row);
    this.container.appendChild(this._el);

    // Init uploader
    this._uploader = new MediaUploader(
      this._el,
      () => { this._uploading = true; },
      () => { this._uploading = false; },
    );

    // Init recorder
    this._recorder = new Recorder(
      () => this._onRecordStart(),
      () => this._onRecordStop(),
    );

    // Status
    this._unsubscribe = store.on((key) => {
      if (key === 'connectionStatus') this._updateStatus();
    });
  }

  unmount() {
    this._unsubscribe?.();
    this._uploader?.destroy();
    this._el?.remove();
  }

  _onInput() {
    // Auto-resize
    this._textarea.style.height = 'auto';
    this._textarea.style.height = `${Math.min(this._textarea.scrollHeight, 128)}px`;

    // Bot hint
    const val = this._textarea.value;
    if (val.startsWith('@chaos:')) {
      this._hint.classList.remove('hidden');
    } else {
      this._hint.classList.add('hidden');
    }
  }

  _onKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this._send();
    }
  }

  _send() {
    const text = this._textarea.value.trim();
    if (!text) return;
    wsClient.send('message:send', { content: text });
    this._textarea.value = '';
    this._textarea.style.height = 'auto';
    this._hint.classList.add('hidden');
  }

  async _toggleRecord() {
    if (this._recorder.isRecording) {
      this._recorder.stop();
    } else {
      await this._recorder.start();
    }
  }

  _onRecordStart() {
    this._recordBtn.innerHTML = this._stopIcon();
    this._recordBtn.classList.add('btn-icon--active', 'rec-pulse');
    this._recordBtn.title = 'Остановить запись';
  }

  _onRecordStop() {
    this._recordBtn.innerHTML = this._micIcon();
    this._recordBtn.classList.remove('btn-icon--active', 'rec-pulse');
    this._recordBtn.title = 'Записать голосовое';
  }

  _updateStatus() {
    const status = store.get('connectionStatus');
    this._textarea.disabled = status !== 'open';
    this._textarea.placeholder = status === 'open'
      ? 'Написать сообщение...'
      : status === 'connecting' ? 'Подключение...' : 'Нет соединения...';
  }

  _micIcon() {
    return `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
    </svg>`;
  }

  _stopIcon() {
    return `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <rect x="6" y="6" width="12" height="12" rx="2"/>
    </svg>`;
  }
}
