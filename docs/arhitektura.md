agency-platform/
├── apps/
│   ├── web/                        # Next.js — сайт + веб-приложение
│   │   ├── app/
│   │   │   ├── (marketing)/        # Публичный лендинг
│   │   │   │   ├── page.tsx        # Главная
│   │   │   │   └── layout.tsx
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── register/       # Регистрация с выбором роли
│   │   │   ├── dashboard/          # Кабинет владельца
│   │   │   │   ├── orders/
│   │   │   │   ├── commissions/
│   │   │   │   └── users/
│   │   │   ├── manager/            # Кабинет менеджера
│   │   │   │   ├── orders/
│   │   │   │   └── balance/
│   │   │   └── client/             # Кабинет клиента
│   │   │       └── orders/
│   │   ├── components/
│   │   │   ├── ui/                 # Базовые компоненты
│   │   │   ├── orders/             # Order-специфичные компоненты
│   │   │   └── chat/               # Чат заявки (Supabase Realtime)
│   │   └── lib/
│   │       ├── api.ts              # Клиентские запросы к backend
│   │       └── auth.ts             # Next-auth или кастомный auth
│   │
│   └── api/                        # Node.js / Fastify backend
│       ├── src/
│       │   ├── index.ts            # Точка входа, запуск сервера
│       │   ├── config.ts           # ENV переменные
│       │   ├── db/
│       │   │   ├── client.ts       # Подключение к PostgreSQL
│       │   │   └── schema.sql      # Наша схема
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   │   ├── auth.routes.ts
│       │   │   │   ├── auth.service.ts
│       │   │   │   └── auth.schema.ts  # Zod-схемы валидации
│       │   │   ├── orders/
│       │   │   │   ├── orders.routes.ts
│       │   │   │   ├── orders.service.ts
│       │   │   │   └── orders.schema.ts
│       │   │   ├── manager/
│       │   │   │   ├── manager.routes.ts
│       │   │   │   └── manager.service.ts
│       │   │   ├── admin/
│       │   │   │   ├── admin.routes.ts
│       │   │   │   └── admin.service.ts
│       │   │   ├── messages/
│       │   │   │   ├── messages.routes.ts
│       │   │   │   └── messages.service.ts
│       │   │   ├── ai/
│       │   │   │   ├── ai.routes.ts
│       │   │   │   ├── ai.service.ts       # Whisper + GPT логика
│       │   │   │   └── brief.prompt.ts     # Промпт для структуризации
│       │   │   ├── notifications/
│       │   │   │   ├── notifications.routes.ts
│       │   │   │   ├── notifications.service.ts
│       │   │   │   └── telegram.service.ts # Отправка в Telegram
│       │   │   └── storage/
│       │   │       └── supabase.service.ts  # Загрузка аудио/файлов в Supabase Storage
│       │   ├── middleware/
│       │   │   ├── auth.middleware.ts      # Проверка JWT
│       │   │   ├── role.middleware.ts      # Проверка роли
│       │   │   └── rls.middleware.ts       # SET app.current_user_id
│       │   └── utils/
│       │       ├── jwt.ts
│       │       ├── hash.ts
│       │       ├── errors.ts           # Централизованная обработка ошибок (AppError)
│       │       └── logger.ts           # Pino логгер
│       └── package.json
│
├── packages/                       # Shared код
│   └── types/                      # Общие TypeScript типы
│       └── index.ts                # Order, User, Brief и т.д.
│
└── package.json                    # Monorepo (turborepo / pnpm workspaces)


Монорепозиторий (apps/web + apps/api) — это правильный выбор под масштаб, packages/types даёт единые TypeScript-типы между фронтом и бэком без дублирования. Модули в бэке (modules/orders, modules/ai и т.д.) изолированы — каждый модуль сам управляет своими роутами, сервисом и схемой валидации. brief.prompt.ts — отдельный файл специально, промпт для GPT будешь редактировать часто.