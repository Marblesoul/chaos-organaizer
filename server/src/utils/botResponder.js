const jokes = [
  'Почему программисты предпочитают тёмную тему? Потому что Light привлекает баги.',
  'Есть два вида проблем с кешированием: инвалидация кеша и придумывание имён.',
  'Чем занимается JavaScript-разработчик в отпуске? Отдыхает от undefined.',
  'Почему фронтендер грустит? Потому что дизайнер сказал «просто сделай красиво».',
  'Git blame показал, что виноват я. Git blame всегда прав.',
  'Синьор отличается от джуниора тем, что знает, какие углы можно срезать.',
  '99 маленьких багов в коде. Взял один, исправил его — 127 маленьких багов в коде.',
  'Задача была простая: сделать форму логина. Прошло три недели.',
];

const weatherVariants = [
  '🌤 Сегодня переменная облачность, +18°C. Возможен небольшой дождь из необработанных исключений.',
  '☀️ Ясно и солнечно, +24°C. Отличный день для деплоя в продакшн!',
  '⛈ Грозовые предупреждения! Ожидается сильный ветер из-за бесконечных циклов.',
  '❄️ Морозно, -5°C. Все процессы заморожены. Рекомендуется перезагрузка.',
  '🌈 После дождя выходит радуга. Баг наконец исправлен!',
];

const BOT_PREFIX = '@chaos:';

function getCommand(text) {
  const trimmed = text.trim().toLowerCase();
  if (!trimmed.startsWith(BOT_PREFIX)) return null;
  return trimmed.slice(BOT_PREFIX.length).trim();
}

function respond(command) {
  switch (command) {
    case 'weather':
      return weatherVariants[Math.floor(Math.random() * weatherVariants.length)];

    case 'joke':
      return jokes[Math.floor(Math.random() * jokes.length)];

    case 'time': {
      const now = new Date();
      return `🕐 Текущее время: ${now.toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow' })} (МСК)`;
    }

    case 'date': {
      const now = new Date();
      return `📅 Сегодня: ${now.toLocaleDateString('ru-RU', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Europe/Moscow',
      })}`;
    }

    case 'coin':
      return Math.random() < 0.5 ? '🪙 Орёл!' : '🪙 Решка!';

    case 'help':
      return '🤖 Доступные команды:\n• @chaos: weather — прогноз погоды\n• @chaos: joke — случайная шутка\n• @chaos: time — текущее время\n• @chaos: date — текущая дата\n• @chaos: coin — подбросить монету\n• @chaos: help — список команд';

    default:
      return `🤖 Неизвестная команда «${command}». Введите @chaos: help для списка команд.`;
  }
}

/**
 * Returns bot reply text if the message is a bot command, otherwise null.
 */
function getBotReply(text) {
  const command = getCommand(text);
  if (command === null) return null;
  return respond(command);
}

module.exports = { getBotReply, BOT_PREFIX };
