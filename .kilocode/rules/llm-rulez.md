# Глобальные правила для LLM-агента — Agency Platform

## Контекст проекта

Монорепо. Стек: Next.js 14 (App Router) + Fastify + Supabase (PostgreSQL, Auth, Storage, Realtime) + OpenAI + Telegram Bot API. TypeScript везде. Три роли: owner, manager, client.

---

## Архитектурные правила

### Структура кода

- Один файл — одна ответственность. Роуты отдельно, сервисы отдельно, схемы валидации отдельно.
- Модули: `auth/`, `orders/`, `manager/`, `admin/`, `ai/`, `notifications/`, `storage/`. Каждый модуль содержит `.routes.ts`, `.service.ts`, `.schema.ts`.
- Shared типы — только в `packages/types/index.ts`. Никогда не дублировать типы между фронтом и бэком.
- Конфиг только через `config.ts` с Zod-валидацией. Никаких `process.env.VAR` напрямую в бизнес-коде.

### База данных

- Все запросы к БД только через сервисный слой. Никаких SQL-запросов в роутах или компонентах.
- Использовать Supabase клиент, не голый pg.
- RLS включён. Всегда передавать user context при запросах.
- Триггеры в БД обрабатывают: автосоздание manager_profile, комиссии, обновление балансов. Не дублировать эту логику в коде.
- JSONB поле `structured_brief` — не создавать отдельные таблицы для полей брифа. Бриф — единый документ.


- **Два источника данных, чёткое разделение:**
  - **`auth.users`** — только для аутентификации:
    - `supabase.auth.getUser()` → получить `user.id` и `user.app_metadata.role`
    - Никогда не читать `full_name`, `phone` отсюда
  - **`public.users`** — только для профиля:
    - `supabase.from('users').select('full_name, phone, avatar_url, telegram_chat_id').eq('id', user.id)`
    - Никогда не читать роль отсюда — только из `auth.users`
  - **Конфликта нет:** роль дублируется в обоих местах (триггер), но всегда читай роль из `app_metadata`, а профиль из `public.users`

### API

- REST. Префиксы: `/api/auth/*`, `/api/orders/*`, `/api/manager/*`, `/api/admin/*`, `/api/ai/*`, `/api/notifications/*`.
- Валидация входных данных через Zod-схемы на каждом эндпоинте. Никогда не доверять входным данным без валидации.
- Ошибки — единый формат: `{ error: string, code?: string }`.
- Авторизация через middleware, не внутри хендлеров.
- HTTP-статусы по смыслу: 200 / 201 / 400 / 401 / 403 / 404 / 500. Не возвращать 200 с `{ success: false }`.

### Frontend

- App Router. Серверные компоненты по умолчанию, клиентские (`use client`) только когда нужна интерактивность или хуки.
- Роутинг по ролям через middleware Next.js (`middleware.ts` в корне).
- Запросы к API — через отдельный модуль `lib/api.ts`. Никаких fetch напрямую в компонентах.
- Состояние: локальное через `useState`, серверное через Server Components и revalidation. Никакого глобального стора пока не потребуется.

---

## Что делать

- Писать TypeScript строго. Никаких `any`. Если тип неизвестен — описать интерфейс.
- Использовать `async/await`, не `.then()` цепочки.
- Обрабатывать ошибки через `try/catch` в сервисах. Роуты только пробрасывают ошибку наверх.
- Комментировать только неочевидные решения. Очевидный код — без комментариев.
- Называть переменные и функции по смыслу. `getUserOrders` лучше чем `getOrders2`.
- Env переменные — только через `config.ts`. Импорт: `import { config } from '../config'`.
- При работе с Supabase Storage — всегда удалять временные файлы после обработки.
- Миграции БД — отдельные SQL файлы с порядковым номером: `001_initial.sql`, `002_add_field.sql`.

---

## Что не делать

- Не дублировать бизнес-логику между фронтом и бэком. Логика — на бэке, фронт только отображает.
- Не писать логику в роутах. Роут = валидация + вызов сервиса + ответ. Всё.
- Не создавать новые таблицы там где можно использовать JSONB или enum.
- Не использовать `useEffect` для загрузки данных — использовать Server Components или React Query.
- Не хардкодить URL, секреты, магические числа. Всё в config или константы.
- Не делать N+1 запросы. Если нужны связанные данные — JOIN или одним запросом с Supabase.
- Не игнорировать ошибки через пустой `catch {}`.
- Не писать middleware логику внутри компонентов.
- Не создавать новый файл если логика помещается в существующий модуль.
- Не использовать `console.log` в продакшн коде. Только структурированный логгер (pino).

---

## Приоритеты при конфликте решений

1. Безопасность — RLS, валидация, никаких утечек данных между ролями
2. Простота — меньше кода, меньше абстракций
3. Масштабируемость — структура должна выдержать рост без рефакторинга
4. Производительность — оптимизировать только там где есть реальная проблема

---

## Паттерны которые используем

**Сервисный слой:**
```ts
// orders.service.ts
export async function getOrderById(orderId: string, userId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()
  if (error) throw new Error(error.message)
  return data
}
```

**Роут:**
```ts
// orders.routes.ts
app.get('/api/orders/:id', { preHandler: [requireAuth] }, async (req, reply) => {
  const order = await getOrderById(req.params.id, req.user.id)
  return reply.send(order)
})
```

**Валидация:**
```ts
// orders.schema.ts
export const createOrderSchema = z.object({
  title: z.string().min(3).max(200),
  raw_text: z.string().min(10).optional(),
})
export type CreateOrderInput = z.infer<typeof createOrderSchema>
```

---

## AI-специфичные правила

- Промпт для брифа — только в `brief.prompt.ts`. Не дублировать промпт в других местах.
- `temperature: 0.2` для структуризации брифа — не менять без причины.
- `response_format: { type: 'json_object' }` всегда для структурированных ответов GPT.
- Всегда обрабатывать случай когда GPT вернул невалидный JSON — try/catch + fallback.
- Временные аудиофайлы удалять в `finally` блоке, не в `then`.

---

## Supabase-специфичные правила

- Supabase клиент инициализировать один раз в `db/client.ts`. Не создавать новые инстансы.
- Для серверных запросов — `createServerClient` с cookies. Для клиентских — `createBrowserClient`.
- RLS политики уже написаны в schema.sql. Не обходить их через `service_role` ключ без крайней необходимости.
- Realtime подписки — только на клиенте, не на сервере.
- Storage buckets: `audio-uploads` для голосовых, `attachments` для файлов заявок.