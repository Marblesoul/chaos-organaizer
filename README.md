# Chaos Organizer

[![CI](https://github.com/Marblesoul/chaos-organaizer/actions/workflows/ci.yml/badge.svg)](https://github.com/Marblesoul/chaos-organaizer/actions/workflows/ci.yml)
[![Deploy](https://github.com/Marblesoul/chaos-organaizer/actions/workflows/deploy.yml/badge.svg)](https://github.com/Marblesoul/chaos-organaizer/actions/workflows/deploy.yml)

Дипломный проект курса «Продвинутый JavaScript в браузере» (Netology).

Чат-органайзер в стиле Telegram/Slack: сохраняй сообщения, ссылки, файлы, записывай голос, ищи по истории, закрепляй важное.

**Live demo:** https://marblesoul.github.io/chaos-organaizer/

---

## Функциональность

### Обязательное
- Отправка текстовых сообщений и ссылок (автоматически кликабельные)
- Загрузка изображений, видео, аудио через Drag & Drop и кнопку прикрепления
- Скачивание файлов на компьютер
- Lazy loading — 10 сообщений за раз, подгрузка при прокрутке вверх

### Опциональное (6 из требуемых 5)
- **Multi-tab sync** — WebSocket синхронизирует все открытые вкладки
- **Закреплённые сообщения** — одно сообщение вверху чата
- **Поиск** — мгновенная фильтрация с подсветкой совпадений
- **Бот-команды** — `@chaos: weather | joke | time | date | coin | help`
- **Воспроизведение** — аудио и видео прямо в чате
- **Запись голоса** — через MediaRecorder API

---

## Стек

| | |
|---|---|
| **Frontend** | Vanilla JS, Webpack 5, Babel, Tailwind CSS, PostCSS |
| **Backend** | Node.js, Koa 2, koa-router, koa-body, ws |
| **CI/CD** | GitHub Actions → GitHub Pages (frontend), Heroku (backend) |
| **Данные** | In-memory (Array + Map), без базы данных |

---

## Локальный запуск

```bash
# 1. Установить зависимости
npm install

# 2. Запустить бэкенд (порт 7070)
npm run dev --workspace=server

# 3. Запустить фронтенд (порт 8080)
npm run dev --workspace=client
```

Открыть: http://localhost:8080

---

## Деплой

### Backend → Heroku

```bash
heroku create chaos-organaizer-api
heroku config:set NODE_ENV=production
git subtree push --prefix server heroku master
```

### Frontend → GitHub Pages

Деплой происходит автоматически при пуше в `master` через GitHub Actions.

Для ручного деплоя:

```bash
npm run build:client
```

### Переменные окружения (GitHub Secrets)

В **Settings → Secrets and variables → Actions** добавить:

| Secret | Значение |
|--------|----------|
| `BACKEND_URL` | URL бэкенда, например `https://chaos-organaizer-api.herokuapp.com` |

---

## API

### WebSocket

**Client → Server:**

```json
{ "type": "message:send", "payload": { "content": "text" } }
{ "type": "message:pin",   "payload": { "id": "..." } }
{ "type": "message:unpin", "payload": { "id": "..." } }
```

**Server → All clients (broadcast):**

```json
{ "type": "message:new",      "payload": { ...Message } }
{ "type": "message:pinned",   "payload": { ...Message } }
{ "type": "message:unpinned", "payload": { "id": "..." } }
```

### REST

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/messages?limit=10&before=<id>` | История (cursor pagination) |
| POST | `/api/messages` | Текстовое сообщение |
| GET | `/api/search?q=<string>` | Поиск |
| POST | `/api/files` | Загрузка файла (multipart) |
| GET | `/api/files/:filename` | Скачивание файла |
| GET | `/api/pins` | Закреплённые сообщения |
| POST | `/api/pins/:id` | Закрепить |
| DELETE | `/api/pins/:id` | Открепить |
