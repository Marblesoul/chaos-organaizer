import { uploadFile } from '../api/http.js';

export class MediaUploader {
  constructor(container, onUploadStart, onUploadEnd) {
    this.container = container;
    this.onUploadStart = onUploadStart;
    this.onUploadEnd = onUploadEnd;
    this._overlay = null;
    this._dragCounter = 0;
    this._input = null;
    this._init();
  }

  _init() {
    // Hidden file input
    this._input = document.createElement('input');
    this._input.type = 'file';
    this._input.multiple = false;
    this._input.accept = 'image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip';
    this._input.style.display = 'none';
    document.body.appendChild(this._input);
    this._input.addEventListener('change', () => {
      if (this._input.files[0]) this._upload(this._input.files[0]);
      this._input.value = '';
    });

    // Drop overlay — hidden by default via CSS (display: none)
    this._overlay = document.createElement('div');
    this._overlay.className = 'drop-overlay';
    this._overlay.innerHTML = `
      <div class="bg-white rounded-2xl shadow-xl p-10 text-center" style="pointer-events:none">
        <div class="text-6xl mb-4">📎</div>
        <p class="text-xl font-semibold text-gray-700">Отпустите файл для загрузки</p>
      </div>
    `;
    document.body.appendChild(this._overlay);

    // Drag events — only react to actual file drags
    document.addEventListener('dragenter', this._onDragEnter.bind(this));
    document.addEventListener('dragleave', this._onDragLeave.bind(this));
    document.addEventListener('dragover', (e) => {
      if (this._hasFiles(e)) e.preventDefault();
    });
    document.addEventListener('drop', this._onDrop.bind(this));
  }

  openPicker() {
    this._input.click();
  }

  _hasFiles(e) {
    return Array.from(e.dataTransfer?.types ?? []).includes('Files');
  }

  _onDragEnter(e) {
    if (!this._hasFiles(e)) return;
    e.preventDefault();
    this._dragCounter += 1;
    this._showOverlay();
  }

  _onDragLeave() {
    // No _hasFiles check here: dragleave fires without dataTransfer sometimes
    this._dragCounter -= 1;
    if (this._dragCounter <= 0) {
      this._dragCounter = 0;
      this._hideOverlay();
    }
  }

  _onDrop(e) {
    if (!this._hasFiles(e)) return;
    e.preventDefault();
    this._dragCounter = 0;
    this._hideOverlay();
    const file = e.dataTransfer?.files?.[0];
    if (file) this._upload(file);
  }

  _showOverlay() {
    this._overlay.style.display = 'flex';
    this._overlay.style.pointerEvents = 'all';
  }

  _hideOverlay() {
    this._overlay.style.display = 'none';
    this._overlay.style.pointerEvents = 'none';
  }

  async _upload(file) {
    this.onUploadStart?.();
    try {
      const fd = new FormData();
      fd.append('file', file);
      await uploadFile(fd);
      // Новое сообщение придёт через WebSocket broadcast
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Upload failed:', err.message);
      alert(`Ошибка загрузки: ${err.message}`);
    } finally {
      this.onUploadEnd?.();
    }
  }

  destroy() {
    this._input.remove();
    this._overlay.remove();
  }
}
