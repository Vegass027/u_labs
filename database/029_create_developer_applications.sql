-- Таблица заявок разработчиков (Coming Soon форма на /dev-mode)
CREATE TABLE public.developer_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  experience_years INTEGER NOT NULL CHECK (experience_years >= 0 AND experience_years <= 50),
  experience_months INTEGER NOT NULL DEFAULT 0 CHECK (experience_months >= 0 AND experience_months <= 11),
  telegram TEXT,
  about TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS
ALTER TABLE public.developer_applications ENABLE ROW LEVEL SECURITY;

-- Публичный INSERT — форма на лендинге, без авторизации
CREATE POLICY "Anyone can submit developer application"
  ON public.developer_applications
  FOR INSERT
  WITH CHECK (true);

-- Только owner может читать заявки
CREATE POLICY "Only owner can read developer applications"
  ON public.developer_applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'owner'
    )
  );

-- Только owner может обновлять статус заявок
CREATE POLICY "Only owner can update developer applications"
  ON public.developer_applications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'owner'
    )
  );
