-- ============================================================================
-- FIX: handle_new_auth_user search_path
-- ============================================================================
-- Проблема: search_path = 'public', 'auth' создаёт конфликт с таблицей users
-- Решение: изменить порядок на 'auth', 'public'
-- Дата: 2026-04-03
-- ============================================================================

-- Исправляем функцию handle_new_auth_user
-- Меняем порядок search_path с 'public', 'auth' на 'auth', 'public'
-- Это гарантирует, что обращение к users будет к auth.users, а не к public.users

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'auth', 'public'
AS $function$
DECLARE
  v_role public.user_role;
  v_role_text TEXT;
BEGIN
  -- Получаем роль из raw_app_meta_data (auth.users)
  v_role_text := NEW.raw_app_meta_data->>'role';
  
  BEGIN
    v_role := v_role_text::public.user_role;
  EXCEPTION WHEN OTHERS THEN
    v_role := 'client'::public.user_role;
  END;
  
  -- Вставляем запись в public.users
  -- Явно указываем public.users для избежания конфликта
  INSERT INTO public.users (
    id,
    email,
    full_name,
    role,
    password_hash,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_app_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    v_role,
    '',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
  
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_auth_user failed: %', SQLERRM;
  RETURN NEW;
END;
$function$;

-- ============================================================================
-- COMMENT
-- ============================================================================
-- После применения этой миграции:
-- 1. Вход owner@agency.dev должен работать без ошибок
-- 2. Триггер on_auth_user_created будет корректно создавать записи в public.users
-- 3. Конфликт имён таблиц будет устранён
-- ============================================================================
