import { uploadFile } from '../api/http.js';

const MIME_PREFERENCE = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg',
  'audio/mp4',
];

function getSupportedMime() {
  return MIME_PREFERENCE.find((m) => MediaRecorder.isTypeSupported(m)) || '';
}

export class Recorder {
  constructor(onStart, onStop) {
    this.onStart = onStart;
    this.onStop = onStop;
    this._recorder = null;
    this._chunks = [];
    this._stream = null;
  }

  get isRecording() {
    return this._recorder?.state === 'recording';
  }

  async start() {
    try {
      this._stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = getSupportedMime();
      this._recorder = new MediaRecorder(this._stream, mime ? { mimeType: mime } : {});
      this._chunks = [];

      this._recorder.addEventListener('dataavailable', (e) => {
        if (e.data.size > 0) this._chunks.push(e.data);
      });

      this._recorder.addEventListener('stop', () => this._handleStop());
      this._recorder.start();
      this.onStart?.();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Recorder error:', err);
      alert('Не удалось получить доступ к микрофону');
    }
  }

  stop() {
    if (this._recorder && this._recorder.state !== 'inactive') {
      this._recorder.stop();
    }
    this._stream?.getTracks().forEach((t) => t.stop());
  }

  async _handleStop() {
    const mime = this._recorder.mimeType || 'audio/webm';
    const ext = mime.includes('ogg') ? 'ogg' : mime.includes('mp4') ? 'm4a' : 'webm';
    const blob = new Blob(this._chunks, { type: mime });
    const filename = `voice-${Date.now()}.${ext}`;

    this.onStop?.();

    try {
      const fd = new FormData();
      fd.append('file', blob, filename);
      await uploadFile(fd);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Voice upload failed:', err);
    }
  }
}
