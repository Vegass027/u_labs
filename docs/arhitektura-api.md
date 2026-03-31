
## 🗄 Архитектура базы данных

### Таблицы и связиНачнём с самого важного — схема базы данных. Это фундамент всего.Несколько ключевых решений, которые стоит объяснить.

**`USERS` — одна таблица, роль через `enum`.** Это позволяет менеджеру в будущем стать клиентом и наоборот. Регистрация разная, но сущность — одна.

**`ORDERS.structured_brief` — тип `jsonb`.** Сюда LLM кладёт структурированный результат после обработки голосового/текстового. Поле гибкое — схема брифа может меняться без миграций БД.

**`COMMISSION_TRANSACTIONS` — отдельная таблица**, не просто поле в `ORDERS`. Это даёт тебе историю всех движений по балансу менеджера, статусы `reserved → payable → paid` и возможность делать выплаты частями в будущем.

**`ORDER_MESSAGES`** — чат привязан к заказу, не к пользователю. Это важно: вся переписка по конкретному заказу в одном месте, и ты и менеджер видят одну и ту же историю.


---
API
---

Покажу API в виде интерактивной справочной карты — удобно и для разработки, и для будущей документации.Несколько важных решений по архитектуре.

**Разделение роутов** — `/api/manager/*` и `/api/admin/*` намеренно разные префиксы. Middleware проверяет роль на уровне роута, не внутри контроллера. Это чисто и легко расширять.

**AI-эндпоинты выделены отдельно** — `/api/ai/transcribe` и `/api/ai/structure` работают независимо. Менеджер может сначала загрузить аудио, получить транскрипт, отредактировать его и только потом запустить структуризацию. Или сразу всё автоматом — на выбор.

**Чат через Supabase Realtime** — подписка на `order_messages` через `supabase.channel()` на клиенте. Это уже в стеке, грех не использовать. Realtime-подписка даёт мгновенные обновления без polling.

**`/api/admin/orders/:id/price`** — отдельный эндпоинт специально. Когда ты выставляешь цену, сервер автоматически считает комиссию (цена × 0.3) и создаёт запись в `commission_transactions` со статусом `reserved`.

POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout

POST   /api/orders
GET    /api/orders/:id

POST   /api/manager/orders
POST   /api/manager/orders/:id/audio
GET    /api/manager/orders
GET    /api/manager/balance

GET    /api/admin/orders
GET    /api/admin/orders/:id
PATCH  /api/admin/orders/:id/status
PATCH  /api/admin/orders/:id/price
DELETE /api/admin/orders/:id

GET    /api/orders/:id/messages
POST   /api/orders/:id/messages

POST   /api/ai/transcribe
POST   /api/ai/structure

GET    /api/admin/commissions
PATCH  /api/admin/commissions/:id/pay

GET    /api/notifications
PATCH  /api/notifications/:id/read

GET    /api/admin/users
PATCH  /api/admin/users/:id/role