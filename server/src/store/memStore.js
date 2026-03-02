const { nanoid } = require('nanoid');
const path = require('path');
const fs = require('fs');

const messages = [];
const uploadsDir = path.resolve(__dirname, '../../uploads');

function addMessage({ type = 'text', content, url = null, size = null, author = 'user' }) {
  const msg = {
    id: nanoid(),
    type,
    content,
    url,
    size,
    timestamp: Date.now(),
    pinned: false,
    author,
  };
  messages.push(msg);
  return msg;
}

/**
 * Cursor-based pagination: returns up to `limit` messages older than `beforeId`.
 * If `beforeId` is null/undefined — returns the latest `limit` messages.
 */
function getMessages(limit = 10, beforeId = null) {
  let endIndex = messages.length;
  if (beforeId) {
    const idx = messages.findIndex((m) => m.id === beforeId);
    if (idx !== -1) endIndex = idx;
  }
  const start = Math.max(0, endIndex - limit);
  const slice = messages.slice(start, endIndex);
  return {
    items: slice,
    hasMore: start > 0,
    oldestId: slice.length > 0 ? slice[0].id : null,
  };
}

function searchMessages(query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return messages.filter((m) => m.content && m.content.toLowerCase().includes(q));
}

function pinMessage(id) {
  // Unpin all first (only one pinned at a time)
  messages.forEach((m) => { m.pinned = false; });
  const msg = messages.find((m) => m.id === id);
  if (!msg) return null;
  msg.pinned = true;
  return msg;
}

function unpinMessage(id) {
  const msg = messages.find((m) => m.id === id);
  if (!msg) return null;
  msg.pinned = false;
  return msg;
}

function getPinned() {
  return messages.filter((m) => m.pinned);
}

function saveFile(filename, buffer) {
  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, buffer);
}

function getFilePath(filename) {
  return path.join(uploadsDir, filename);
}

// ── Seed data ──────────────────────────────────────────────────────────────
function seed() {
  const now = Date.now();

  const seedMessages = [
    {
      id: nanoid(),
      type: 'text',
      content: 'Добро пожаловать в Chaos Organizer! Это ваш личный бот-органайзер.',
      url: null,
      size: null,
      timestamp: now - 60000 * 10,
      pinned: true,
      author: 'bot',
    },
    {
      id: nanoid(),
      type: 'text',
      content: 'Вы можете отправлять текстовые сообщения, ссылки, файлы, аудио и видео.',
      url: null,
      size: null,
      timestamp: now - 60000 * 9,
      pinned: false,
      author: 'bot',
    },
    {
      id: nanoid(),
      type: 'text',
      content: 'Попробуйте команды бота: @chaos: weather, @chaos: joke, @chaos: time, @chaos: date, @chaos: coin, @chaos: help',
      url: null,
      size: null,
      timestamp: now - 60000 * 8,
      pinned: false,
      author: 'bot',
    },
    {
      id: nanoid(),
      type: 'text',
      content: 'Полезная ссылка: https://developer.mozilla.org/ru/',
      url: null,
      size: null,
      timestamp: now - 60000 * 7,
      pinned: false,
      author: 'user',
    },
    {
      id: nanoid(),
      type: 'text',
      content: '@chaos: help',
      url: null,
      size: null,
      timestamp: now - 60000 * 6,
      pinned: false,
      author: 'user',
    },
    {
      id: nanoid(),
      type: 'text',
      content: '🤖 Доступные команды:\n• @chaos: weather — прогноз погоды\n• @chaos: joke — случайная шутка\n• @chaos: time — текущее время\n• @chaos: date — текущая дата\n• @chaos: coin — подбросить монету\n• @chaos: help — список команд',
      url: null,
      size: null,
      timestamp: now - 60000 * 5,
      pinned: false,
      author: 'bot',
    },
    {
      id: nanoid(),
      type: 'text',
      content: 'Для загрузки файлов используйте кнопку прикрепления или перетащите файл в окно чата.',
      url: null,
      size: null,
      timestamp: now - 60000 * 4,
      pinned: false,
      author: 'bot',
    },
    {
      id: nanoid(),
      type: 'text',
      content: 'Для поиска нажмите на иконку 🔍 в верхней панели.',
      url: null,
      size: null,
      timestamp: now - 60000 * 3,
      pinned: false,
      author: 'bot',
    },
    {
      id: nanoid(),
      type: 'text',
      content: 'Вы можете записать голосовое или видео сообщение с помощью кнопки записи.',
      url: null,
      size: null,
      timestamp: now - 60000 * 2,
      pinned: false,
      author: 'bot',
    },
    {
      id: nanoid(),
      type: 'text',
      content: 'Chaos Organizer синхронизирует сообщения между всеми открытыми вкладками в реальном времени.',
      url: null,
      size: null,
      timestamp: now - 60000,
      pinned: false,
      author: 'bot',
    },
  ];

  messages.push(...seedMessages);
}

seed();

module.exports = {
  addMessage,
  getMessages,
  searchMessages,
  pinMessage,
  unpinMessage,
  getPinned,
  saveFile,
  getFilePath,
};
