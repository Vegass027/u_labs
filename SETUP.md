# 🚀 Установка и запуск проекта Agency Platform

## 📋 Требования

- Node.js 18+
- pnpm 8+
- Supabase аккаунт (БД в облаке)
- OpenAI API ключ (для AI-функций)

---

## 🔧 Установка зависимостей

```bash
# Установить pnpm если не установлен
npm install -g pnpm

# Установить зависимости монорепо
pnpm install
```

---

## 📝 Настройка переменных окружения

1. Скопируйте шаблон:
```bash
cp .env.example .env
```

2. Откройте `.env` и заполните переменные:

### Основные переменные (обязательно):
```bash
# Supabase (обязательно - БД в облаке)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project.supabase.co:5432/postgres

# Environment
NODE_ENV=development

# JWT Secrets (сгенерируйте: openssl rand -hex 64)
JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars

# API
PORT=3001
API_URL=http://localhost:3001

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001

# OpenAI (для AI-функций - обязательно)
OPENAI_API_KEY=sk-your-openai-api-key
```

### Опциональные переменные:
```bash
# Telegram (для уведомлений)
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_WEBHOOK_SECRET=your-webhook-secret
```

---

## 🗄️ Настройка Supabase

1. Создайте новый проект в [Supabase Dashboard](https://supabase.com/dashboard)
2. Скопируйте URL и ключи из Settings → API:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` → `SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`
3. Получите Database URL из Settings → Database → Connection string → URI
4. Примените схему БД:
   - Откройте SQL Editor в Supabase
   - Скопируйте содержимое `database/001_initial.sql`
   - Выполните SQL

Или через CLI:
```bash
# Установить Supabase CLI
npm install -g supabase

# Применить миграцию
supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.your-project.supabase.co:5432/postgres"
```

---

## 🐳 Локальная PostgreSQL (опционально)

Если хотите использовать локальную PostgreSQL вместо Supabase:

```bash
# Запустить PostgreSQL через Docker
docker compose up -d

# Проверить что контейнер запущен
docker compose ps

# Посмотреть логи
docker compose logs -f postgres
```

При первом запуске PostgreSQL автоматически применит схему из `database/001_initial.sql`.

---

## 🚀 Запуск проекта

### Режим разработки (dev):

```bash
# В одном терминале - API backend
cd apps/api
pnpm dev

# В другом терминале - Frontend
cd apps/web
pnpm dev
```

API будет доступен на: http://localhost:3001
Frontend будет доступен на: http://localhost:3000

### Одновременный запуск (с Turbo):

```bash
# Из корня проекта
pnpm dev
```

---

## 🧪 Проверка компиляции

```bash
# Проверить API backend
cd apps/api && npx tsc --noEmit

# Проверить Frontend
cd apps/web && npx tsc --noEmit

# Обе проверки сразу
pnpm typecheck
```

---

## 🏗️ Сборка для продакшена

```bash
# Собрать API backend
cd apps/api
pnpm build

# Собрать Frontend
cd apps/web
pnpm build

# Всё сразу
pnpm build
```

---

## 📦 Docker для продакшена

```bash
# Собрать и запустить продакшен версии
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 🔧 Полезные команды

```bash
# Установить зависимости
pnpm install

# Установить зависимости в конкретном пакете
pnpm --filter @agency/api install
pnpm --filter @agency/web install

# Запустить dev сервер
pnpm dev

# Собрать проект
pnpm build

# Проверить типы
pnpm typecheck

# Очистить node_modules
pnpm clean

# Запустить линтер
pnpm lint
```

---

## 🐛 Troubleshooting

### Ошибки TypeScript
```bash
# Проверить типы
pnpm typecheck

# Переустановить зависимости
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Проблемы с Supabase
- Убедитесь что RLS политики включены
- Проверьте что SERVICE_ROLE_KEY имеет правильные права
- Проверьте логи в Supabase Dashboard
- Убедитесь что DATABASE_URL правильный (включает пароль)

### PostgreSQL не запускается (локально)
```bash
# Остановить и удалить контейнеры
docker compose down -v

# Перезапустить
docker compose up -d
```

---

## 📚 Дополнительная документация

- [Идея проекта](docs/Idea.md)
- [Архитектура](docs/arhitektura.md)
- [API документация](docs/arhitektura-api.md)
- [AI сервис](docs/ai-service.md)
- [ENV и Docker](docs/ENV%20%2B%20docker-compose.md)

---

## 🆘 Поддержка

Если возникли проблемы:
1. Проверьте что все ENV переменные заполнены
2. Убедитесь что Supabase проект создан и схема применена
3. Проверьте логи в терминале
4. Посмотрите документацию в папке `docs/`
