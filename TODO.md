# Chaos Organizer — Plan

## Phase 0 — Scaffolding ✅
- [x] Root `package.json` with npm workspaces
- [x] `.gitignore`
- [x] `.eslintrc.js` (root)
- [x] `.appveyor.yml`
- [x] `server/uploads/.gitkeep`
- [x] `server/package.json` + `.eslintrc.js`
- [x] `client/package.json`

## Phase 1 — Backend ✅
- [x] `server/src/store/memStore.js` — in-memory store + cursor pagination + seed data (10 msgs)
- [x] `server/src/utils/botResponder.js` — 6 commands: weather, joke, time, date, coin, help
- [x] `server/src/middleware/cors.js` + `errorHandler.js`
- [x] `server/src/controllers/messages.js` + `files.js` + `pins.js`
- [x] `server/src/router.js` — all REST endpoints under `/api`
- [x] `server/src/app.js` — Koa app factory
- [x] `server/src/ws.js` — WebSocket server + broadcast to all clients
- [x] `server/index.js` — http.createServer entry point
- [x] `server/Procfile` — Heroku

**Start:** `npm run dev --workspace=server` (port 7070)

## Phase 2 — Frontend Build Infrastructure ✅
- [x] `client/webpack.config.js` — Babel, CSS, Tailwind, dev-server proxy, HMR на `/webpack-hmr`
- [x] `client/babel.config.js`
- [x] `client/postcss.config.js` + `tailwind.config.js`
- [x] `client/.eslintrc.js`
- [x] `client/public/index.html` + `favicon.svg`
- [x] Dependencies installed (`style-loader`, `webpack-dev-server`, etc.)

**Start:** `npm run dev --workspace=client` (port 8080)

## Phase 3 — Frontend Foundation ✅
- [x] `client/src/styles/main.css` — Tailwind base + custom component classes
- [x] `client/src/store/store.js` — observable state (messages, pinnedMessage, hasMore, connectionStatus, searchResults)
- [x] `client/src/api/http.js` — fetch wrappers: getMessages, postMessage, search, upload, pins
- [x] `client/src/api/ws.js` — WebSocket client, exponential backoff reconnect
- [x] `client/src/utils/linkify.js` — URL → `<a>` без innerHTML
- [x] `client/src/utils/timeFormat.js` — timestamp → HH:MM / дата-разделитель
- [x] `client/src/utils/fileHelpers.js` — formatBytes, getFileIcon
- [x] `client/src/components/App.js` — root, инициализирует WS + ChatWindow
- [x] `client/src/components/ChatWindow.js` — sidebar + header + messages area + input
- [x] `client/src/components/MessageItem.js` — рендер text/image/video/audio/file
- [x] `client/src/components/MessageInput.js` — textarea, send, attach, record buttons
- [x] `client/src/index.js` — entry point

## Phase 4 — Mandatory Features ✅
- [x] `client/src/components/MessageList.js` — IntersectionObserver lazy load (по 10 сообщений)
- [x] `client/src/components/MediaUploader.js` — drag & drop overlay + file picker
- [x] Linkify — ссылки в тексте автоматически становятся кликабельными `<a>`
- [x] Download — кнопка «Скачать» на каждом медиа-сообщении

## Phase 5 — Optional Features ✅ (6 из 6)
- [x] **Multi-tab sync** — работает через WS broadcast (Phase 1)
- [x] `client/src/components/PinBar.js` — закреплённое сообщение вверху чата
- [x] Pin/Unpin кнопка на сообщении (hover)
- [x] `client/src/components/SearchPanel.js` — поиск с debounce + подсветка результатов
- [x] Bot hint — при вводе `@chaos:` появляется подсказка со списком команд
- [x] Audio/Video плеер — `<audio controls>` / `<video controls>` прямо в чате
- [x] `client/src/components/Recorder.js` — запись голоса через MediaRecorder → upload

## Phase 6 — Deployment (не начато)
- [ ] Heroku: `heroku create`, `git subtree push --prefix server heroku master`
- [ ] GitHub Pages: добавить `gh-pages` в client scripts, `npm run deploy`
- [ ] AppVeyor CI: проверить `.appveyor.yml`, добавить badge в README
- [ ] README: ссылки на live demo + CI badge

---

## Что сейчас должно работать — чеклист для тестирования

### Запуск
```
Терминал 1: npm run dev --workspace=server   → http://localhost:7070
Терминал 2: npm run dev --workspace=client   → http://localhost:8080
```

### Базовый UI
- [ ] Открывается чат с 10 seed-сообщениями при загрузке
- [ ] Статус «● В сети» (зелёный) в шапке — WS подключён
- [ ] Слева сайдбар с полем поиска, справа область сообщений + поле ввода
- [ ] Сообщения бота — слева (белые), пользователя — справа (зелёные)
- [ ] Первое сообщение закреплено — отображается в PinBar над чатом

### Отправка сообщений
- [ ] Вводишь текст → Enter или кнопка → сообщение появляется справа
- [ ] В другой вкладке браузера то же сообщение появляется автоматически (multi-tab sync)
- [ ] Ссылки в тексте (`https://...`) — кликабельные, открываются в новой вкладке

### Бот-команды
- [ ] Вводишь `@chaos:` → появляется подсказка с командами
- [ ] Отправляешь `@chaos: joke` → через ~0.4s бот отвечает случайной шуткой
- [ ] Работают все 6 команд: `weather`, `joke`, `time`, `date`, `coin`, `help`

### Файлы
- [ ] Кнопка скрепки — открывает file picker, можно выбрать изображение
- [ ] Drag & Drop файла в окно чата → появляется overlay «Отпустите файл» → файл загружается
- [ ] Изображение рендерится прямо в чате (не просто ссылка)
- [ ] Аудио/видео — встроенный плеер `<audio>`/`<video>` с кнопкой Play
- [ ] Кнопка «⬇ Скачать» — скачивает файл на компьютер

### Поиск
- [ ] Вводишь слово в поле поиска → сообщения фильтруются, совпадения подсвечены жёлтым
- [ ] Кнопка «Сбросить» — возвращает полную историю

### Пин
- [ ] Наводишь мышь на сообщение → появляется кнопка 🔘
- [ ] Нажимаешь → сообщение закрепляется, появляется в PinBar
- [ ] Нажимаешь ✕ в PinBar → сообщение откреплено
- [ ] В другой вкладке изменение пина отображается автоматически

### Запись голоса
- [ ] Нажимаешь кнопку микрофона → браузер просит разрешение → кнопка пульсирует красным
- [ ] Нажимаешь снова → запись останавливается, аудио загружается и появляется в чате

---

## REST API Contract

| Method | Path | Params | Description |
|--------|------|--------|-------------|
| GET | `/api/messages` | `?limit=10&before=<id>` | Paginated history |
| POST | `/api/messages` | `{ content }` | Text message |
| GET | `/api/search` | `?q=<string>` | Search by text |
| POST | `/api/files` | multipart `file` | Upload file/media |
| GET | `/api/files/:filename` | — | Download file |
| GET | `/api/pins` | — | List pinned messages |
| POST | `/api/pins/:id` | — | Pin message |
| DELETE | `/api/pins/:id` | — | Unpin message |

## WebSocket Protocol

**Client → Server:**
```json
{ "type": "message:send", "payload": { "content": "..." } }
{ "type": "message:pin",   "payload": { "id": "..." } }
{ "type": "message:unpin", "payload": { "id": "..." } }
```

**Server → All clients (broadcast):**
```json
{ "type": "message:new",      "payload": { ...Message } }
{ "type": "message:pinned",   "payload": { ...Message } }
{ "type": "message:unpinned", "payload": { "id": "..." } }
```
