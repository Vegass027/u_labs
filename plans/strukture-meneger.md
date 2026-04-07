# 📋 План реализации UX обновлений для менеджера

## 🎯 Цель

Обновить UX менеджера на странице заказа, чтобы он соответствовал UX клиента:
- Блок "Документы по проекту" с разделением на файлы от команды и свои файлы
- Блок "последовательность работы" с тремя шагами
- Удалить чат с командой (менеджер не общается напрямую с owner)
- Добавить подписи к аккордеонам

---

## 📊 Анализ текущей реализации

### Что работает правильно:

#### 1. ProjectInfoPanel.tsx (shared компонент)
**Файл:** [`apps/web/src/components/ProjectInfoPanel.tsx`](apps/web/src/components/ProjectInfoPanel.tsx)

**Текущее состояние:** ✅ УЖЕ РАБОТАЕТ ПРАВИЛЬНО

```tsx
interface ProjectInfoPanelProps {
  price: number | null
  documents: Document[]
  orderId: string
  currentUserId?: string  // ✅ Уже есть
}

export function ProjectInfoPanel({ price, documents, orderId, currentUserId }: ProjectInfoPanelProps) {
  // ...
  <DocumentList 
    documents={documents} 
    onDownload={handleDownload} 
    canDelete={!!currentUserId} 
    currentUserId={currentUserId} 
    orderId={orderId} 
  />
}
```

**Функционал:**
- ✅ Принимает `currentUserId` проп
- ✅ Передаёт его в `DocumentList`
- ✅ `DocumentList` разделяет файлы:
  - Левая колонка: "файлы от команды" (только скачать)
  - Правая колонка: "ваши файлы" (скачать + удалить + загрузить новые)

**Проверка правил:**
- ✅ Shared компонент в `apps/web/src/components/`
- ✅ Не дублирует логику между ролями
- ✅ Поддерживает `currentUserId` для проверки прав удаления

**Вывод:** ИЗМЕНЕНИЙ НЕ НУЖНО ✅

---

#### 2. DocumentList.tsx (shared компонент)
**Файл:** [`apps/web/src/components/DocumentList.tsx`](apps/web/src/components/DocumentList.tsx)

**Текущее состояние:** ✅ УЖЕ РАБОТАЕТ ПРАВИЛЬНО

```tsx
export function DocumentList({ documents, onDownload, canDelete = false, currentUserId, onDelete, orderId }: DocumentListProps) {
  // ...
  if (currentUserId) {
    const teamFiles = documents.filter(d => d.uploaded_by !== currentUserId)
    const myFiles = documents.filter(d => d.uploaded_by === currentUserId)
    
    return (
      <div className="flex gap-4">
        {teamFiles.length > 0 && (
          <div className="flex-1 space-y-3">
            <p className="text-xs text-muted-foreground font-mono mb-2">
              // файлы от команды
            </p>
            {/* team files - только скачать */}
          </div>
        )}
        <div className="w-px bg-border/50"></div>
        {currentUserId && orderId && (
          <div className="flex-1 space-y-3">
            <p className="text-xs text-muted-foreground font-mono mb-2">
              // ваши файлы
            </p>
            <DocumentUploadSection orderId={orderId} initialDocuments={myFiles} currentUserId={currentUserId} />
          </div>
        )}
      </div>
    )
  }
}
```

**Функционал:**
- ✅ Разделяет файлы на "файлы от команды" и "ваши файлы"
- ✅ Показывает кнопку удаления только для своих файлов (`doc.uploaded_by === currentUserId`)
- ✅ Интегрирует `DocumentUploadSection` для загрузки новых файлов

**Проверка правил:**
- ✅ Shared компонент в `apps/web/src/components/`
- ✅ Не дублирует логику между ролями
- ✅ Безопасность — проверка `uploaded_by === currentUserId`

**Вывод:** ИЗМЕНЕНИЙ НЕ НУЖНО ✅

---

#### 3. DocumentUploadSection.tsx (shared компонент)
**Файл:** [`apps/web/src/app/dashboard/components/DocumentUploadSection.tsx`](apps/web/src/app/dashboard/components/DocumentUploadSection.tsx)

**Текущее состояние:** ✅ УЖЕ РАБОТАЕТ ПРАВИЛЬНО

```tsx
export function DocumentUploadSection({ orderId, initialDocuments, onDocumentsChange, currentUserId }: DocumentUploadSectionProps) {
  const canDeleteThis = (doc: Document) => {
    if (!currentUserId) return false
    return doc.uploaded_by === currentUserId  // ✅ Проверка прав
  }
  
  // Загрузка файлов через API
  // Удаление только своих файлов
}
```

**Функционал:**
- ✅ Загружает файлы через API
- ✅ Удаляет только свои файлы
- ✅ Показывает прогресс загрузки

**Проверка правил:**
- ✅ Shared компонент
- ✅ Безопасность — проверка `uploaded_by === currentUserId`

**Вывод:** ИЗМЕНЕНИЙ НЕ НУЖНО ✅

---

### Что нужно изменить:

#### Страница заказа менеджера
**Файл:** [`apps/web/src/app/manager/orders/[id]/page.tsx`](apps/web/src/app/manager/orders/[id]/page.tsx)

**Текущие проблемы:**

1. ❌ **Использует fetch для документов** (строки 31-54)
   ```tsx
   async function getOrderDocuments(orderId: string): Promise<Document[]> {
     const response = await fetch(
       `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/documents`,
       {
         headers: { 'Authorization': `Bearer ${session?.access_token || ''}` },
         cache: 'no-store',
       }
     )
     // ...
   }
   ```
   **Нарушение правила:** "Все запросы к БД только через сервисный слой"
   **Решение:** Использовать `apiServer` из `@/lib/api-server` вместо прямого fetch

2. ❌ **Нет блока "последовательность работы"**
   **Решение:** Добавить блок как у клиента (строки 160-183 в [`apps/web/src/app/client/orders/[id]/page.tsx`](apps/web/src/app/client/orders/[id]/page.tsx:160-183))

3. ❌ **Есть чат с командой** (строки 222-246)
   ```tsx
   {/* Chat with Owner */}
   <Accordion className="...">
     <AccordionItem value="chat-owner">
       ...
     </AccordionItem>
   </Accordion>
   ```
   **Проблема:** Менеджер не должен общаться напрямую с owner
   **Решение:** Удалить этот блок

4. ❌ **Нет подписей к аккордеонам**
   **Решение:** Добавить подписи как у клиента

5. ❌ **Не передаётся `currentUserId` в `ProjectInfoPanel`**
   ```tsx
   <ProjectInfoPanel
     price={order.price}
     documents={documents}
     orderId={order.id}
     // ❌ Нет currentUserId
   />
   ```
   **Решение:** Добавить `currentUserId={currentUser.id}`

---

## 📝 Детальный план реализации

### Шаг 1: Обновить [`apps/web/src/app/manager/orders/[id]/page.tsx`](apps/web/src/app/manager/orders/[id]/page.tsx)

#### 1.1. Удалить функцию `getOrderDocuments` с fetch

**Что удалить:** Строки 31-54

```tsx
// ❌ УДАЛИТЬ ЭТО
async function getOrderDocuments(orderId: string): Promise<Document[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: { session } } = await supabase.auth.getSession()

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/documents`,
      {
        headers: {
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        cache: 'no-store',
      }
    )

    if (!response.ok) return []
    return await response.json() || []
  } catch {
    return []
  }
}
```

**Проверка правил:**
- ✅ Удаляем нарушение "Все запросы к БД только через сервисный слой"
- ✅ Удаляем дублирование логики

---

#### 1.2. Использовать `apiServer` для получения документов

**Где добавить:** Внутри `ManagerOrderDetailPage` функции, перед рендером

**Что добавить:**

```tsx
import { apiServer } from '@/lib/api-server'

export default async function ManagerOrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  noStore()
  const supabase = await createClient()
  const currentUser = await getCurrentUser()

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      client:users!client_user_id(full_name, email)
    `)
    .eq('id', params.id)
    .single()

  // ✅ ИСПОЛЬЗОВАТЬ apiServer
  const { data: documents } = await apiServer.get(
    `/api/orders/${params.id}/documents`
  )

  // ❌ УДАЛИТЬ ЭТО
  // const documents = await getOrderDocuments(params.id)

  if (error || !order) {
    // ...
  }
}
```

**Проверка правил:**
- ✅ Все запросы к БД через сервисный слой (`documents.service.ts`)
- ✅ Используем `apiServer` для Server Components
- ✅ Нет дублирования логики

---

#### 1.3. Добавить блок "последовательность работы"

**Где добавить:** После `OrderTitleSaver`, перед `ProjectInfoPanel`

**Что добавить:**

```tsx
export default async function ManagerOrderDetailPage({ params }: { params: { id: string } }) {
  // ...

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Save order title for tabs */}
      <OrderTitleSaver orderId={order.id} title={order.title} />

      {/* Back link with order header */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mb-4">
        {/* ... */}
      </div>

      {/* ✅ ДОБАВИТЬ БЛОК "ПОСЛЕДОВАТЕЛЬНОСТЬ РАБОТЫ" */}
      <div className="border border-border rounded-lg overflow-hidden bg-card mb-4">
        <div className="px-4 py-3 border-b border-border bg-muted/50">
          <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
            последовательность работы
          </h2>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-500/20 border border-sky-500/50 flex items-center justify-center text-sky-500 font-mono font-bold">1</div>
            <span className="text-muted-foreground font-mono">Передайте информацию о проекте</span>
            <span className="text-sky-500 font-mono">[Ассистент]</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#dcb67a]/20 border border-[#dcb67a]/50 flex items-center justify-center text-[#dcb67a] font-mono font-bold">2</div>
            <span className="text-muted-foreground font-mono">Карточка проекта сформирована</span>
            <span className="text-[#dcb67a] font-mono">[О проекте]</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center text-green-500 font-mono font-bold">3</div>
            <span className="text-muted-foreground font-mono">Общение с клиентом</span>
            <span className="text-green-500 font-mono">[Чат с клиентом]</span>
          </div>
        </div>
      </div>

      {/* Project Info Panel */}
      <ProjectInfoPanel
        price={order.price}
        documents={documents}
        orderId={order.id}
        currentUserId={currentUser.id}  // ✅ ДОБАВИТЬ
      />
      
      {/* ... */}
    </div>
  )
}
```

**Проверка правил:**
- ✅ Не создаёт новый компонент — логика в одном файле
- ✅ Использует тот же стиль что и у клиента
- ✅ Простота — меньше абстракций

---

#### 1.4. Удалить чат с командой

**Что удалить:** Строки 222-246

```tsx
// ❌ УДАЛИТЬ ВЕСЬ БЛОК
{/* Chat with Owner */}
<Accordion className="border border-border rounded-lg overflow-hidden bg-card terminal-glow">
  <AccordionItem value="chat-owner">
    <AccordionTrigger className="px-4 py-3 bg-muted/50 hover:bg-muted/70 transition-colors [&_[data-slot=accordion-indicator]]:hidden items-center">
      <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
        <span className="text-purple-500">&gt;&gt;&gt;</span> Чат с Product Architect <span className="text-purple-500">&lt;&lt;&lt;</span>
      </h2>
      <div className="w-8 h-8 rounded border border-purple-500/50 flex items-center justify-center bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors data-[state=open]:rotate-180">
        <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </AccordionTrigger>
    <AccordionPanel className="px-0">
      <div className="h-96">
        <ChatWindow 
          orderId={order.id} 
          currentUserId={currentUser.id} 
          currentUserRole={currentUser.role}
          messageType="manager_owner"
        />
      </div>
    </AccordionPanel>
  </AccordionItem>
</Accordion>
```

**Проверка правил:**
- ✅ Не дублирует бизнес-логику — менеджер не общается с командой напрямую
- ✅ Простота — меньше кода

---

#### 1.5. Добавить подписи к аккордеонам

**Что изменить:** Обновить `AccordionTrigger` для каждого аккордеона

**Бриф (строки 139-160):**

```tsx
{/* Brief */}
<Accordion className="border border-border rounded-lg overflow-visible bg-card terminal-glow">
  <AccordionItem value="brief">
    <AccordionTrigger className="px-4 py-3 bg-muted/50 hover:bg-muted/70 transition-colors [&_[data-slot=accordion-indicator]]:hidden items-center">
      <div className="flex-1">
        <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
          <span className="text-[#dcb67a]">&gt;&gt;&gt;</span> Бриф <span className="text-[#dcb67a]">&lt;&lt;&lt;</span>
        </h2>
        {/* ✅ ДОБАВИТЬ ПОДПИСЬ */}
        <p className="text-sm text-muted-foreground font-mono mt-1 max-w-xl">
          Опишите проект клиента или загрузите голосовое — AI соберёт карточку проекта
        </p>
      </div>
      <div className="w-8 h-8 rounded border border-[#dcb67a]/50 flex items-center justify-center bg-[#dcb67a]/10 group-hover:bg-[#dcb67a]/20 transition-colors data-[state=open]:rotate-180">
        <svg className="w-4 h-4 text-[#dcb67a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </AccordionTrigger>
    <AccordionPanel className="px-0 overflow-visible">
      <div className="p-4">
        <BriefSection
          orderId={order.id}
          brief={order.structured_brief}
          rawText={order.raw_text}
        />
      </div>
    </AccordionPanel>
  </AccordionItem>
</Accordion>
```

**Чат с клиентом (строки 196-220):**

```tsx
{/* Chat with Client */}
<Accordion className="border border-border rounded-lg overflow-hidden bg-card terminal-glow">
  <AccordionItem value="chat-client">
    <AccordionTrigger className="px-4 py-3 bg-muted/50 hover:bg-muted/70 transition-colors [&_[data-slot=accordion-indicator]]:hidden items-center">
      <div className="flex-1">
        <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
          <span className="text-green-500">&gt;&gt;&gt;</span> Чат с клиентом <span className="text-green-500">&lt;&lt;&lt;</span>
        </h2>
        {/* ✅ ДОБАВИТЬ ПОДПИСЬ */}
        <p className="text-sm text-muted-foreground font-mono mt-1 max-w-xl">
          Общение с клиентом по деталям проекта
        </p>
      </div>
      <div className="w-8 h-8 rounded border border-green-500/50 flex items-center justify-center bg-green-500/10 group-hover:bg-green-500/20 transition-colors data-[state=open]:rotate-180">
        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </AccordionTrigger>
    <AccordionPanel className="px-0">
      <div className="h-96">
        <ChatWindow 
          orderId={order.id} 
          currentUserId={currentUser.id} 
          currentUserRole={currentUser.role}
          messageType="client_manager"
        />
      </div>
    </AccordionPanel>
  </AccordionItem>
</Accordion>
```

**Чат с Брифером (строки 248-270):**

```tsx
{/* Brief Chat with AI */}
<Accordion className="border border-border rounded-lg overflow-hidden bg-card terminal-glow">
  <AccordionItem value="brief-chat">
    <AccordionTrigger className="px-4 py-3 bg-muted/50 hover:bg-muted/70 transition-colors [&_[data-slot=accordion-indicator]]:hidden items-center">
      <h2 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider flex items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted-foreground font-mono">онлайн</span>
        </div>
        <span className="text-sky-400">&gt;&gt;&gt;</span>
        Чат с Брифером <span className="text-sky-400">&lt;&lt;&lt;</span>
      </h2>
      <div className="w-8 h-8 rounded border border-sky-400/50 flex items-center justify-center bg-sky-400/10 group-hover:bg-sky-400/20 transition-colors data-[state=open]:rotate-180">
        <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </AccordionTrigger>
    <AccordionPanel className="px-0">
      <BriefChat orderId={order.id} />
    </AccordionPanel>
  </AccordionItem>
</Accordion>
```

**Проверка правил:**
- ✅ Не создаёт новый компонент — логика в одном файле
- ✅ Консистентность с клиентом

---

#### 1.6. Передать `currentUserId` в `ProjectInfoPanel`

**Что изменить:** Строки 132-136

```tsx
{/* Project Info Panel */}
<ProjectInfoPanel
  price={order.price}
  documents={documents}
  orderId={order.id}
  currentUserId={currentUser.id}  // ✅ ДОБАВИТЬ
/>
```

**Проверка правил:**
- ✅ Shared компонент используется одинаково
- ✅ Безопасность — RLS проверка через `uploaded_by`

---

## 📊 Итоговая структура файлов

```
apps/web/src/
├── components/
│   ├── ProjectInfoPanel.tsx          # ✅ НЕ МЕНЯТЬ — уже работает
│   ├── DocumentList.tsx              # ✅ НЕ МЕНЯТЬ — уже работает
│   └── DocumentUploadSection.tsx      # ✅ НЕ МЕНЯТЬ — уже работает
└── app/
    ├── manager/
    │   └── orders/
    │       └── [id]/
    │           └── page.tsx          # ✅ ОБНОВИТЬ
    └── client/
        └── orders/
            └── [id]/
                └── page.tsx          # ✅ НЕ МЕНЯТЬ — уже работает
```

---

## ✅ Проверка соответствия глобальным правилам

| Правило | Реализация | Статус |
|---|---|---|
| Один файл — одна ответственность | Каждый компонент делает одну вещь | ✅ |
| Shared типы только в packages/types | Используются существующие типы | ✅ |
| Все запросы к БД через сервисный слой | Используем `apiServer` → `documents.service.ts` | ✅ |
| Shared компоненты в components/ | ProjectInfoPanel и DocumentList в shared | ✅ |
| Не дублировать UI между ролями | Один компонент для manager и client | ✅ |
| Не использовать fetch напрямую в Server Components | Используем `apiServer` | ✅ |
| Не создавать лишние файлы | Обновляем только один файл | ✅ |
| Безопасность — RLS | currentUserId для проверки прав | ✅ |
| Простота — меньше кода | Удалён ненужный чат с командой | ✅ |
| Не писать логику в роутах | Логика в сервисах, не в компонентах | ✅ |
| Не делать N+1 запросы | Один запрос через сервисный слой | ✅ |

---

## 🎨 Визуальный результат

### До (менеджер):
```
[Заголовок заказа]
[ProjectInfoPanel]  ❌ Без currentUserId
[Бриф ▼]  ❌ Без подписи
[Транскрипция ▼]
[Аудио ▼]
[Чат с клиентом ▼]  ❌ Без подписи
[Чат с командой ▼]  ❌ Лишний
[Чат с Брифером ▼]
```

### После (менеджер):
```
[Заголовок заказа]

[последовательность работы]
  1. Передайте информацию о проекте [Ассистент]
  2. Карточка проекта сформирована [О проекте]
  3. Общение с клиентом [Чат с клиентом]

[ProjectInfoPanel]  ✅ С currentUserId
  ┌─────────────────┬─────────────────┐
  │ файлы от команды │   ваши файлы    │
  │   [скачать]     │ [скачать]      │
  │                  │ [удалить]      │
  │                  │ [+ загрузить]    │
  └─────────────────┴─────────────────┘

[Бриф ▼] Опишите проект клиента или загрузите голосовое — AI соберёт карточку проекта
[Транскрипция ▼]
[Аудио ▼]
[Чат с клиентом ▼] Общение с клиентом по деталям проекта
[Чат с Брифером ▼]
```

---

## 🚀 Порядок реализации

1. **Шаг 1:** Обновить [`apps/web/src/app/manager/orders/[id]/page.tsx`](apps/web/src/app/manager/orders/[id]/page.tsx)
    - Удалить `getOrderDocuments` с fetch
    - Использовать `apiServer` для получения документов
    - Добавить блок "последовательность работы"
    - Удалить чат с командой (>>> Чат с Product Architect <<<)
    - Добавить подписи к аккордеонам
    - Передать `currentUserId` в `ProjectInfoPanel`

2. **Шаг 2:** Проверить [`apps/web/src/app/client/orders/[id]/page.tsx`](apps/web/src/app/client/orders/[id]/page.tsx)
   - Убедиться, что `currentUserId` передаётся в `ProjectInfoPanel`
   - Проверить консистентность UX

3. **Шаг 3:** Тестирование всех сценариев
   - Менеджер видит файлы от команды (только скачать)
   - Менеджер видит свои файлы (скачать + удалить)
   - Менеджер может загружать новые файлы
   - Блок "последовательность работы" отображается
   - Подписи к аккордеонам отображаются
   - Чат с командой отсутствует

---

## 📋 Чек-лист перед реализацией

- [x] Изучена текущая реализация у клиента
- [x] Проверены shared компоненты (ProjectInfoPanel, DocumentList, DocumentUploadSection)
- [x] Определены изменения для страницы менеджера
- [x] Проверено соответствие глобальным правилам
- [x] Создан детальный план реализации
- [ ] Реализовать изменения в [`apps/web/src/app/manager/orders/[id]/page.tsx`](apps/web/src/app/manager/orders/[id]/page.tsx)
- [ ] Проверить консистентность с клиентом
- [ ] Тестирование всех сценариев

---

## 🎯 Ключевые моменты

1. **НЕ МЕНЯТЬ** shared компоненты — они уже работают правильно
2. **МЕНЯТЬ ТОЛЬКО** страницу менеджера
3. **УДАЛИТЬ** fetch — использовать `apiServer` для запросов к БД
4. **УДАЛИТЬ** чат с командой (>>> Чат с Product Architect <<<) — менеджер не общается напрямую с owner
5. **ДОБАВИТЬ** блок "последовательность работы" — как у клиента
6. **ДОБАВИТЬ** подписи к аккордеонам — как у клиента
7. **ДОБАВИТЬ** `currentUserId` в `ProjectInfoPanel` — для разделения файлов

---

Этот план полностью соответствует глобальным правилам проекта и решает все указанные проблемы UX менеджера.