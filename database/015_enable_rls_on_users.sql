-- Исправляем RLS политики для таблицы users
-- Проблема: рекурсия при запросе SELECT FROM public.users внутри политики на public.users
-- Решение: используем auth.jwt() для получения роли без запроса в таблицу

-- Удаляем все проблемные политики
DROP POLICY IF EXISTS users_select_own ON public.users;
DROP POLICY IF EXISTS users_update_own ON public.users;
DROP POLICY IF EXISTS users_select_all_for_owner ON public.users;
DROP POLICY IF EXISTS users_select_clients_for_manager ON public.users;
DROP POLICY IF EXISTS users_select_for_manager ON public.users;
DROP POLICY IF EXISTS users_select_for_client ON public.users;

-- 1. Каждый видит себя — базовая политика
CREATE POLICY users_select_own ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- 2. Owner видит всех — роль из JWT, без запроса в таблицу
CREATE POLICY users_select_owner ON public.users
  FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'owner'
  );

-- 3. Manager видит клиентов своих заказов
CREATE POLICY users_select_manager ON public.users
  FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'manager'
    AND (
      id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.orders
        WHERE manager_user_id = auth.uid()
        AND client_user_id = public.users.id
      )
    )
  );

-- 4. Обновление только своей записи
CREATE POLICY users_update_own ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
