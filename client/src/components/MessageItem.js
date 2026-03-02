import { linkify } from '../utils/linkify.js';
import { formatTime } from '../utils/timeFormat.js';
import { formatBytes, getFileIcon } from '../utils/fileHelpers.js';
import { pinMessage, unpinMessage } from '../api/http.js';

function createDownloadBtn(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || '';
  a.className = 'inline-flex items-center gap-1 mt-1 text-xs opacity-75 hover:opacity-100 underline';
  a.textContent = '⬇ Скачать';
  return a;
}

function renderContent(msg, bubble) {
  const {
    type, content, url, size,
  } = msg;

  if (type === 'text') {
    bubble.appendChild(linkify(content));
    return;
  }

  if (type === 'image') {
    const img = document.createElement('img');
    img.src = url;
    img.alt = content;
    img.className = 'max-w-xs rounded-xl cursor-pointer';
    img.addEventListener('click', () => window.open(url, '_blank'));
    bubble.appendChild(img);
    if (content) {
      const cap = document.createElement('div');
      cap.className = 'text-xs mt-1 opacity-75';
      cap.textContent = content;
      bubble.appendChild(cap);
    }
    bubble.appendChild(createDownloadBtn(url, content));
    return;
  }

  if (type === 'video') {
    const video = document.createElement('video');
    video.src = url;
    video.controls = true;
    video.className = 'max-w-xs rounded-xl';
    video.style.maxHeight = '240px';
    bubble.appendChild(video);
    bubble.appendChild(createDownloadBtn(url, content));
    return;
  }

  if (type === 'audio') {
    const label = document.createElement('div');
    label.className = 'text-xs mb-1 opacity-75';
    label.textContent = `🎵 ${content}`;
    bubble.appendChild(label);
    const audio = document.createElement('audio');
    audio.src = url;
    audio.controls = true;
    audio.className = 'w-full max-w-xs';
    bubble.appendChild(audio);
    bubble.appendChild(createDownloadBtn(url, content));
    return;
  }

  // type === 'file'
  const icon = document.createElement('span');
  icon.textContent = getFileIcon(type);
  const nameEl = document.createElement('span');
  nameEl.textContent = ` ${content}`;
  if (size) {
    const sizeEl = document.createElement('span');
    sizeEl.className = 'text-xs opacity-60 ml-1';
    sizeEl.textContent = `(${formatBytes(size)})`;
    nameEl.appendChild(sizeEl);
  }
  bubble.appendChild(icon);
  bubble.appendChild(nameEl);
  bubble.appendChild(document.createElement('br'));
  bubble.appendChild(createDownloadBtn(url, content));
}

/**
 * Creates a message item DOM element.
 * @param {object} msg
 * @param {object} options
 * @param {boolean} options.showPin - show pin button
 * @param {Function} options.onPin - called with (msg)
 */
export function createMessageItem(msg, options = {}) {
  const isUser = msg.author === 'user';
  const wrapper = document.createElement('div');
  wrapper.dataset.id = msg.id;
  wrapper.className = `flex ${isUser ? 'justify-end' : 'justify-start'} mb-1 group px-4`;

  const bubble = document.createElement('div');
  bubble.className = `msg-bubble ${isUser ? 'msg-bubble--user' : 'msg-bubble--bot'}`;

  renderContent(msg, bubble);

  // Timestamp
  const meta = document.createElement('div');
  meta.className = `text-xs mt-1 ${isUser ? 'text-teal-100' : 'text-gray-400'} flex items-center gap-2`;
  meta.textContent = formatTime(msg.timestamp);

  if (msg.pinned) {
    const pin = document.createElement('span');
    pin.textContent = '📌';
    pin.title = 'Закреплено';
    meta.appendChild(pin);
  }

  bubble.appendChild(meta);

  // Pin button (visible on hover)
  if (options.showPin) {
    const pinBtn = document.createElement('button');
    pinBtn.className = 'opacity-0 group-hover:opacity-100 transition-opacity self-center ml-2 p-1 text-gray-400 hover:text-teal-600 text-xs';
    pinBtn.title = msg.pinned ? 'Открепить' : 'Закрепить';
    pinBtn.textContent = msg.pinned ? '📌' : '🔘';
    pinBtn.addEventListener('click', () => {
      if (options.onPin) {
        options.onPin(msg);
      } else {
        const action = msg.pinned ? unpinMessage : pinMessage;
        action(msg.id).catch((err) => console.warn('Pin error:', err.message));
      }
    });
    wrapper.appendChild(pinBtn);
  }

  wrapper.appendChild(bubble);
  return wrapper;
}
