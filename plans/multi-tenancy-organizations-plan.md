# План внедрения мульти-тенантности (Организации)

## 📋 Обзор

Этот план описывает внедрение полноценной мульти-тенантной архитектуры на основе **организаций** для Agency Platform. Это позволит нескольким владельцам (фрилансерам/агентствам) использовать одну платформу с полной изоляцией данных.

---

## 🎯 Цели

1. **Изоляция данных**: Каждый владелец видит только свои заказы, менеджеров, клиентов
2. **Масштабируемость**: Легко добавлять новых владельцев без изменений в коде
3. **Гибкость**: Возможность управления ролями внутри организации
4. **Безопасность**: RLS политики гарантируют защиту от утечек данных

---

## 🏗️ Архитектура

### Концепция

```
Организация (Organization)
  ├─ Владелец (Owner) - 1 на организацию
  ├─ Менеджеры (Managers) - много
  └─ Клиенты (Clients) - много

Заказ (Order)
  ├─ Принадлежит организации
  ├─ Связан с менеджером из этой организации
  └─ Связан с клиентом из этой организации
```

### Таблицы БД

#### 1. `organizations` - Организации
```sql
CREATE TABLE organizations (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  slug              TEXT UNIQUE NOT NULL, -- Для URL: agency-name.platform.com
  owner_user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  settings          JSONB DEFAULT '{}', -- Настройки организации
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_organizations_owner ON organizations (owner_user_id);
CREATE INDEX idx_organizations_slug ON organizations (slug);
```

#### 2. `organization_members` - Члены организации
```sql
CREATE TABLE organization_members (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role              TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'client')),
  joined_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_org_members_org ON organization_members (organization_id);
CREATE INDEX idx_org_members_user ON organization_members (user_id);
CREATE INDEX idx_org_members_role ON organization_members (organization_id, role);
```

#### 3. Обновление существующих таблиц

```sql
-- Добавить organization_id в orders
ALTER TABLE orders ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- Добавить organization_id в manager_profiles
ALTER TABLE manager_profiles ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- Добавить organization_id в notifications
ALTER TABLE notifications ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- Добавить organization_id в commission_transactions
ALTER TABLE commission_transactions ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- Индексы для производительности
CREATE INDEX idx_orders_org ON orders (organization_id);
CREATE INDEX idx_manager_profiles_org ON manager_profiles (organization_id);
CREATE INDEX idx_notifications_org ON notifications (organization_id);
CREATE INDEX idx_commissions_org ON commission_transactions (organization_id);
```

---

## 📦 Миграции БД

### Migration 030: Организации

```sql
-- ============================================================
-- Migration 030: Multi-tenancy - Organizations
-- ============================================================

-- 1. Создать таблицу organizations
CREATE TABLE IF NOT EXISTS organizations (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  slug              TEXT UNIQUE NOT NULL,
  owner_user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  settings          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organizations_owner ON organizations (owner_user_id);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations (slug);

-- 2. Создать таблицу organization_members
CREATE TABLE IF NOT EXISTS organization_members (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role              TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'client')),
  joined_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members (organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members (user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_role ON organization_members (organization_id, role);

-- 3. Добавить organization_id в существующие таблицы
ALTER TABLE orders ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE manager_profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE commission_transactions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- 4. Создать индексы
CREATE INDEX IF NOT EXISTS idx_orders_org ON orders (organization_id);
CREATE INDEX IF NOT EXISTS idx_manager_profiles_org ON manager_profiles (organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_org ON notifications (organization_id);
CREATE INDEX IF NOT EXISTS idx_commissions_org ON commission_transactions (organization_id);

-- 5. Создать организацию для существующего owner
INSERT INTO organizations (name, slug, owner_user_id)
SELECT 
  'Default Agency',
  'default-agency',
  id
FROM users
WHERE role = 'owner'
LIMIT 1
ON CONFLICT (slug) DO NOTHING;

-- 6. Привязать существующие данные к организации
UPDATE orders
SET organization_id = (SELECT id FROM organizations WHERE slug = 'default-agency')
WHERE organization_id IS NULL;

UPDATE manager_profiles
SET organization_id = (SELECT id FROM organizations WHERE slug = 'default-agency')
WHERE organization_id IS NULL;

UPDATE notifications
SET organization_id = (SELECT id FROM organizations WHERE slug = 'default-agency')
WHERE organization_id IS NULL;

UPDATE commission_transactions
SET organization_id = (SELECT id FROM organizations WHERE slug = 'default-agency')
WHERE organization_id IS NULL;

-- 7. Добавить owner в organization_members
INSERT INTO organization_members (organization_id, user_id, role)
SELECT 
  o.id,
  u.id,
  'owner'
FROM organizations o
JOIN users u ON o.owner_user_id = u.id
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- 8. Обновить триггер updated_at для organizations
CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

### Migration 031: Обновление RLS политик

```sql
-- ============================================================
-- Migration 031: Update RLS policies for multi-tenancy
-- ============================================================

-- Вспомогательная функция для получения organization_id пользователя
CREATE OR REPLACE FUNCTION get_user_organization_id(user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT organization_id FROM organization_members 
  WHERE user_id = user_id 
  LIMIT 1;
$$;

-- Вспомогательная функция для проверки роли внутри организации
CREATE OR REPLACE FUNCTION get_user_org_role(user_id uuid, organization_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM organization_members 
  WHERE user_id = user_id AND organization_id = organization_id
  LIMIT 1;
$$;

-- Удалить старые политики
DROP POLICY IF EXISTS orders_owner_all ON orders;
DROP POLICY IF EXISTS orders_manager_own ON orders;
DROP POLICY IF EXISTS orders_client_own ON orders;
DROP POLICY IF EXISTS orders_client_insert ON orders;
DROP POLICY IF EXISTS orders_manager_insert ON orders;
DROP POLICY IF EXISTS orders_owner_insert ON orders;
DROP POLICY IF EXISTS orders_owner_update ON orders;
DROP POLICY IF EXISTS orders_manager_update ON orders;

-- Новые политики для orders
CREATE POLICY orders_org_select ON orders
  FOR SELECT USING (
    organization_id = get_user_organization_id(NULLIF(current_setting('app.current_user_id', true), '')::uuid)
  );

CREATE POLICY orders_org_insert ON orders
  FOR INSERT WITH CHECK (
    organization_id = get_user_organization_id(NULLIF(current_setting('app.current_user_id', true), '')::uuid)
  );

CREATE POLICY orders_org_update ON orders
  FOR UPDATE USING (
    organization_id = get_user_organization_id(NULLIF(current_setting('app.current_user_id', true), '')::uuid)
    AND (
      get_user_org_role(NULLIF(current_setting('app.current_user_id', true), '')::uuid, organization_id) = 'owner'
      OR manager_user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
      OR client_user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
    )
  );

-- Обновить политики для order_messages
DROP POLICY IF EXISTS messages_participants ON order_messages;
DROP POLICY IF EXISTS messages_insert ON order_messages;

CREATE POLICY messages_org_select ON order_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id
      AND o.organization_id = get_user_organization_id(NULLIF(current_setting('app.current_user_id', true), '')::uuid)
    )
  );

CREATE POLICY messages_org_insert ON order_messages
  FOR INSERT WITH CHECK (
    sender_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
    AND EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id
      AND o.organization_id = get_user_organization_id(NULLIF(current_setting('app.current_user_id', true), '')::uuid)
    )
  );

-- Обновить политики для notifications
DROP POLICY IF EXISTS notifications_own ON notifications;
DROP POLICY IF EXISTS notifications_insert ON notifications;
DROP POLICY IF EXISTS notifications_update ON notifications;

CREATE POLICY notifications_org_select ON notifications
  FOR SELECT USING (
    organization_id = get_user_organization_id(NULLIF(current_setting('app.current_user_id', true), '')::uuid)
    AND user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
  );

CREATE POLICY notifications_org_insert ON notifications
  FOR INSERT WITH CHECK (
    organization_id = get_user_organization_id(NULLIF(current_setting('app.current_user_id', true), '')::uuid)
  );

CREATE POLICY notifications_org_update ON notifications
  FOR UPDATE USING (
    organization_id = get_user_organization_id(NULLIF(current_setting('app.current_user_id', true), '')::uuid)
    AND user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
  );

-- Обновить политики для commission_transactions
DROP POLICY IF EXISTS commissions_select ON commission_transactions;
DROP POLICY IF EXISTS commissions_insert ON commission_transactions;
DROP POLICY IF EXISTS commissions_update ON commission_transactions;

CREATE POLICY commissions_org_select ON commission_transactions
  FOR SELECT USING (
    organization_id = get_user_organization_id(NULLIF(current_setting('app.current_user_id', true), '')::uuid)
    AND (
      manager_user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
      OR get_user_org_role(NULLIF(current_setting('app.current_user_id', true), '')::uuid, organization_id) = 'owner'
    )
  );

CREATE POLICY commissions_org_insert ON commission_transactions
  FOR INSERT WITH CHECK (
    organization_id = get_user_organization_id(NULLIF(current_setting('app.current_user_id', true), '')::uuid)
  );

CREATE POLICY commissions_org_update ON commission_transactions
  FOR UPDATE USING (
    organization_id = get_user_organization_id(NULLIF(current_setting('app.current_user_id', true), '')::uuid)
    AND get_user_org_role(NULLIF(current_setting('app.current_user_id', true), '')::uuid, organization_id) = 'owner'
  );

-- Обновить политики для manager_profiles
DROP POLICY IF EXISTS manager_profiles_select ON manager_profiles;
DROP POLICY IF EXISTS manager_profiles_insert ON manager_profiles;
DROP POLICY IF EXISTS manager_profiles_update ON manager_profiles;

CREATE POLICY manager_profiles_org_select ON manager_profiles
  FOR SELECT USING (
    organization_id = get_user_organization_id(NULLIF(current_setting('app.current_user_id', true), '')::uuid)
    AND (
      user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
      OR get_user_org_role(NULLIF(current_setting('app.current_user_id', true), '')::uuid, organization_id) = 'owner'
    )
  );

CREATE POLICY manager_profiles_org_insert ON manager_profiles
  FOR INSERT WITH CHECK (
    organization_id = get_user_organization_id(NULLIF(current_setting('app.current_user_id', true), '')::uuid)
  );

CREATE POLICY manager_profiles_org_update ON manager_profiles
  FOR UPDATE USING (
    organization_id = get_user_organization_id(NULLIF(current_setting('app.current_user_id', true), '')::uuid)
    AND (
      user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
      OR get_user_org_role(NULLIF(current_setting('app.current_user_id', true), '')::uuid, organization_id) = 'owner'
    )
  );
```

---

## 🔧 Backend изменения

### 1. Обновить `packages/types/index.ts`

```typescript
// Добавить новые типы
export interface Organization {
  id: string
  name: string
  slug: string
  owner_user_id: string
  is_active: boolean
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

export interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  role: 'owner' | 'manager' | 'client'
  joined_at: string
}

// Обновить существующие типы
export interface Order {
  // ... существующие поля
  organization_id: string // Добавить
}

export interface ManagerProfile {
  // ... существующие поля
  organization_id: string // Добавить
}

export interface Notification {
  // ... существующие поля
  organization_id: string // Добавить
}

export interface CommissionTransaction {
  // ... существующие поля
  organization_id: string // Добавить
}
```

### 2. Создать модуль `organizations/`

#### `apps/api/src/modules/organizations/organizations.schema.ts`
```typescript
import { z } from 'zod'

export const createOrganizationSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
})

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>
```

#### `apps/api/src/modules/organizations/organizations.service.ts`
```typescript
import { supabase } from '../../db/client'
import { logger } from '../../utils/logger'
import { AppError, ConflictError } from '../../utils/errors'
import type { CreateOrganizationInput } from './organizations.schema'

export async function createOrganization(input: CreateOrganizationInput, ownerId: string) {
  logger.info({ ownerId, name: input.name, slug: input.slug }, 'Creating organization')

  // Проверить что slug уникален
  const { data: existing } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', input.slug)
    .single()

  if (existing) {
    throw new ConflictError('Organization with this slug already exists')
  }

  // Создать организацию
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: input.name,
      slug: input.slug,
      owner_user_id: ownerId,
    })
    .select()
    .single()

  if (orgError || !org) {
    logger.error({ error: orgError }, 'Failed to create organization')
    throw new AppError('Failed to create organization', 500)
  }

  // Добавить owner в organization_members
  const { error: memberError } = await supabase
    .from('organization_members')
    .insert({
      organization_id: org.id,
      user_id: ownerId,
      role: 'owner',
    })

  if (memberError) {
    logger.error({ error: memberError }, 'Failed to add owner to organization_members')
    throw new AppError('Failed to create organization', 500)
  }

  logger.info({ organizationId: org.id }, 'Organization created successfully')
  return org
}

export async function getUserOrganization(userId: string) {
  const { data, error } = await supabase
    .from('organization_members')
    .select('organization_id, role, organizations(*)')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return {
    organizationId: data.organization_id,
    role: data.role,
    organization: data.organizations,
  }
}

export async function inviteUserToOrganization(
  organizationId: string,
  email: string,
  role: 'manager' | 'client',
  inviterUserId: string
) {
  // Проверить что inviter - owner
  const { data: member } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', inviterUserId)
    .single()

  if (!member || member.role !== 'owner') {
    throw new AppError('Only owner can invite users', 403)
  }

  // Создать invite (отдельная таблица для invites)
  // TODO: Реализовать систему приглашений
}
```

#### `apps/api/src/modules/organizations/organizations.routes.ts`
```typescript
import { FastifyInstance } from 'fastify'
import { requireAuth } from '../../middleware/auth.middleware'
import { createOrganization, getUserOrganization } from './organizations.service'
import { createOrganizationSchema } from './organizations.schema'

export async function organizationRoutes(fastify: FastifyInstance) {
  // Создать организацию
  fastify.post('/api/organizations', {
    preHandler: [requireAuth],
  }, async (req, reply) => {
    const input = createOrganizationSchema.parse(req.body)
    const organization = await createOrganization(input, req.user!.id)
    return reply.status(201).send(organization)
  })

  // Получить организацию пользователя
  fastify.get('/api/organizations/my', {
    preHandler: [requireAuth],
  }, async (req, reply) => {
    const org = await getUserOrganization(req.user!.id)
    if (!org) {
      return reply.status(404).send({ error: 'Organization not found' })
    }
    return reply.send(org)
  })
}
```

### 3. Обновить `apps/api/src/modules/auth/auth.service.ts`

```typescript
// В функции registerUser добавить создание организации для owner
export async function registerUser(input: RegisterInput): Promise<{ requiresEmailConfirmation: boolean; user?: User }> {
  // ... существующий код ...

  // Если роль owner - создать организацию
  if (role === 'owner' && !requiresEmailConfirmation) {
    const orgSlug = `${fullName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`
    
    try {
      await createOrganization({
        name: `${fullName}'s Agency`,
        slug: orgSlug,
      }, authData.user.id)
    } catch (error) {
      logger.error({ error }, 'Failed to create organization for owner')
      // Не прерываем регистрацию, но логируем ошибку
    }
  }

  // ... существующий код ...
}
```

### 4. Обновить `apps/api/src/middleware/auth.middleware.ts`

```typescript
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string
      email: string
      role: string
      organizationId?: string // Добавить
    }
  }
}

export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  // ... существующий код ...

  // Получить organization_id
  const { data: member } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  req.user = {
    id: user.id,
    email: user.email || '',
    role: user.user_metadata?.role || 'client',
    organizationId: member?.organization_id, // Добавить
  }
}
```

### 5. Обновить `apps/api/src/modules/orders/orders.service.ts`

```typescript
// В createOrder добавить organization_id
export async function createOrder(input: CreateOrderInput, clientUserId: string, organizationId: string): Promise<Order> {
  // ...
  const insertData = {
    client_user_id: clientUserId,
    manager_user_id: null,
    title: input.title,
    raw_text: input.raw_text ?? null,
    status: 'new' as const,
    organization_id: organizationId, // Добавить
  }
  // ...
}

// В createManagerOrder добавить organization_id
export async function createManagerOrder(input: CreateManagerOrderInput, managerUserId: string, organizationId: string): Promise<Order> {
  // ...
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      // ... существующие поля
      organization_id: organizationId, // Добавить
    })
    // ...
}
```

### 6. Обновить `apps/api/src/modules/orders/orders.routes.ts`

```typescript
// Обновить вызовы сервисов с organizationId
app.post('/api/orders', { preHandler: [requireAuth] }, async (req, reply) => {
  const input = createOrderSchema.parse(req.body)
  const order = await createOrder(input, req.user!.id, req.user!.organizationId!) // Добавить organizationId
  return reply.status(201).send(order)
})
```

---

## 🎨 Frontend изменения

### 1. Обновить `apps/web/src/middleware.ts`

```typescript
// Добавить organizationId в user object
interface User {
  sub: string
  app_metadata?: {
    role?: string
    organizationId?: string // Добавить
  }
}

function getUserFromCookies(req: NextRequest) {
  // ... существующий код ...
  
  const decoded = jwtDecode<User>(session.access_token)
  return decoded
}

export async function middleware(req: NextRequest) {
  // ... существующий код ...
  
  const user = getUserFromCookies(req)
  const role = user?.app_metadata?.role
  const organizationId = user?.app_metadata?.organizationId // Добавить

  console.log('[MIDDLEWARE] Path:', pathname, 'User:', user?.sub, 'Role:', role, 'Org:', organizationId)

  // ... существующий код ...
}
```

### 2. Создать страницу создания организации

#### `apps/web/src/app/(auth)/create-organization/page.tsx`
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateOrganizationPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('access_token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/organizations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, slug }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create organization')
      }

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center">Создайте организацию</h2>
          <p className="mt-2 text-center text-gray-600">
            Для начала работы создайте свою организацию
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Название</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Slug (URL)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              pattern="[a-z0-9-]+"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Будет использоваться в URL: {slug}.platform.com
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Создание...' : 'Создать организацию'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

### 3. Обновить `apps/web/src/app/(auth)/register/page.tsx`

```typescript
// После успешной регистрации owner перенаправлять на создание организации
const handleRegister = async (e: React.FormEvent) => {
  // ... существующий код ...

  if (data.requiresEmailConfirmation) {
    router.push('/auth/confirm')
  } else {
    // Если owner - перенаправить на создание организации
    if (formData.role === 'owner') {
      router.push('/create-organization')
    } else {
      router.push('/login')
    }
  }
}
```

### 4. Обновить все Server Components для работы с organizationId

Пример обновления для [`apps/web/src/app/dashboard/page.tsx`](apps/web/src/app/dashboard/page.tsx:1):

```typescript
// Добавить фильтрацию по organization_id
const { data: orders } = await supabase
  .from('orders')
  .select('*')
  .eq('organization_id', user.organizationId) // Добавить
  .order('created_at', { ascending: false })
```

---

## 🧪 Тестирование

### 1. Тестирование RLS политик

```sql
-- Тест: Owner видит только свои заказы
SET LOCAL app.current_user_id = 'owner-uuid';
SELECT COUNT(*) FROM orders; -- Должно вернуть только заказы этой организации

-- Тест: Manager видит только свои заказы
SET LOCAL app.current_user_id = 'manager-uuid';
SELECT COUNT(*) FROM orders; -- Должно вернуть только заказы этого менеджера

-- Тест: Client видит только свои заказы
SET LOCAL app.current_user_id = 'client-uuid';
SELECT COUNT(*) FROM orders; -- Должно вернуть только заказы этого клиента
```

### 2. Тестирование изоляции данных

```typescript
// Создать два owner'а
const owner1 = await registerUser({ email: 'owner1@test.com', role: 'owner' })
const owner2 = await registerUser({ email: 'owner2@test.com', role: 'owner' })

// Создать организации
const org1 = await createOrganization({ name: 'Org 1', slug: 'org-1' }, owner1.id)
const org2 = await createOrganization({ name: 'Org 2', slug: 'org-2' }, owner2.id)

// Создать заказы от owner1
const order1 = await createOrder({ title: 'Order 1' }, owner1.id, org1.id)

// Проверить что owner2 НЕ видит заказ owner1
const orders = await listOrders({}, owner2.id)
assert(orders.orders.length === 0) // Должно быть 0
```

---

## 📋 Порядок внедрения

### Фаза 1: База данных (1-2 дня)
- [ ] Создать Migration 030 (организации)
- [ ] Создать Migration 031 (RLS политики)
- [ ] Применить миграции в Supabase
- [ ] Протестировать RLS политики вручную

### Фаза 2: Backend API (3-4 дня)
- [ ] Обновить `packages/types/index.ts`
- [ ] Создать модуль `organizations/`
- [ ] Обновить `auth.service.ts` (автосоздание организации)
- [ ] Обновить `auth.middleware.ts` (organizationId в req.user)
- [ ] Обновить `orders.service.ts` (organization_id в заказах)
- [ ] Обновить все сервисы для работы с organizationId
- [ ] Написать тесты для API

### Фаза 3: Frontend (2-3 дня)
- [ ] Обновить `middleware.ts` (organizationId в токене)
- [ ] Создать страницу `/create-organization`
- [ ] Обновить `/register` (перенаправление на создание организации)
- [ ] Обновить все Server Components для фильтрации по organizationId
- [ ] Обновить Client Components для передачи organizationId

### Фаза 4: Тестирование (2-3 дня)
- [ ] Тестирование RLS политик
- [ ] Тестирование изоляции данных между организациями
- [ ] Тестирование создания организации
- [ ] Тестирование приглашения пользователей
- [ ] Интеграционное тестирование

### Фаза 5: Деплой (1 день)
- [ ] Деплой на staging
- [ ] Финальное тестирование
- [ ] Деплой на production
- [ ] Мониторинг

---

## ⚠️ Риски и рекомендации

### Риски

1. **RLS политики** - Ошибка в политике может привести к утечке данных
   - **Митигация**: Тщательное тестирование каждой политики

2. **Миграция данных** - Потеря данных при неправильной миграции
   - **Митигация**: Бэкап перед миграцией, тестирование на staging

3. **Производительность** - Дополнительные JOIN'ы могут замедлить запросы
   - **Митигация**: Индексы на `organization_id`, кэширование

4. **Сложность** - Увеличение сложности кодовой базы
   - **Митигация**: Чёткая документация, code review

### Рекомендации

1. **Начать с staging** - Не внедрять сразу на production
2. **Бэкапы** - Создать бэкап БД перед миграциями
3. **Мониторинг** - Добавить логирование для отслеживания ошибок RLS
4. **Документация** - Документировать все изменения для команды
5. **Постепенный rollout** - Можно внедрять по частям (сначала backend, потом frontend)

---

## 🚀 Следующие шаги после внедрения

1. **Подписки** - Добавить таблицу `subscriptions` для монетизации
2. **Приглашения** - Реализовать систему приглашений пользователей
3. **Настройки организации** - Добавить кастомизацию (логотип, цвета)
4. **Аналитика** - Добавить аналитику по организациям
5. **Multi-tenant Storage** - Разделить файлы по организациям в Supabase Storage

---

## 📚 Дополнительные ресурсы

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Multi-tenancy patterns](https://www.postgresql.org/docs/current/ddl-partitioning.html)
- [SaaS multi-tenancy best practices](https://www.heroku.com/podcasts/codeish/67-multi-tenancy)

---

**Версия документа**: 1.0  
**Дата создания**: 2026-04-06  
**Статус**: Черновик для обсуждения
