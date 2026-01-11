# UBR Voice Chat Server

Простой сервер для голосового чата UBR Client.

## Установка на Render.com (бесплатно)

1. Зарегистрируйтесь на [Render.com](https://render.com)
2. Создайте новый "Web Service"
3. Подключите ваш GitHub репозиторий или загрузите файлы
4. Укажите:
   - **Name**: `ubr-voice-chat-server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Port**: Оставьте пустым (Render автоматически установит PORT)
5. Нажмите "Create Web Service"
6. После деплоя скопируйте URL (например: `https://ubr-voice-chat-server.onrender.com`)

## Установка на Railway.app (бесплатно)

1. Зарегистрируйтесь на [Railway.app](https://railway.app)
2. Нажмите "New Project" → "Deploy from GitHub repo"
3. Выберите репозиторий или создайте новый
4. Railway автоматически определит Node.js проект
5. После деплоя скопируйте URL

## Настройка клиента

В настройках клиента (UBR → Voice chat) укажите URL вашего сервера:
- Например: `https://ubr-voice-chat-server.onrender.com`
- Или: `https://your-app.railway.app`

## Локальное тестирование

```bash
npm install
node server.js
```

Сервер запустится на `http://localhost:3000`

## API Endpoints

- `POST /api/voice` - Отправка аудио данных
- `GET /health` - Проверка здоровья сервера
- WebSocket соединение для real-time передачи голоса
