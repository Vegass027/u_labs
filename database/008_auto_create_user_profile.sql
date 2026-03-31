-- Автоматическое создание профиля пользователя в public.users при регистрации через invite
-- Триггер срабатывает при создании записи в auth.users и создаёт соответствующую запись в public.users

CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role public.user_role;
  v_role_text TEXT;
BEGIN
  v_role_text := NEW.raw_user_meta_data->>'role';
  
  BEGIN
    v_role := v_role_text::public.user_role;
  EXCEPTION WHEN OTHERS THEN
    v_role := 'client'::public.user_role;
  END;

  INSERT INTO public.users (
    id, email, full_name, role, password_hash, created_at, updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Триггер на создание пользователя в auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_auth_user();
