-- Миграция: Автоматическое назначение менеджера из истории клиента
-- Логика: если клиент делает новый заказ и у него есть предыдущие заказы с менеджером,
-- менеджер автоматически подтягивается (Вариант B — комиссия за все заказы навсегда)

-- ============================================================
-- Шаг 1: Создать триггер-функцию
-- ============================================================
CREATE OR REPLACE FUNCTION assign_manager_from_client_history()
RETURNS TRIGGER AS $$
DECLARE
  v_manager_id UUID;
BEGIN
  IF NEW.client_user_id IS NOT NULL AND NEW.manager_user_id IS NULL THEN
    SELECT manager_user_id INTO v_manager_id
    FROM public.orders
    WHERE client_user_id = NEW.client_user_id
      AND manager_user_id IS NOT NULL
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_manager_id IS NOT NULL THEN
      NEW.manager_user_id := v_manager_id;
    END IF;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'assign_manager_from_client_history failed: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================
-- Шаг 2: Создать BEFORE INSERT триггер на orders
-- ============================================================
DROP TRIGGER IF EXISTS trg_assign_manager_from_history ON public.orders;
CREATE TRIGGER trg_assign_manager_from_history
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION assign_manager_from_client_history();

-- ============================================================
-- Шаг 3: Расширить create_commission_on_price
-- Добавить реакцию на появление manager_user_id при уже установленной цене
-- ============================================================
CREATE OR REPLACE FUNCTION create_commission_on_price()
RETURNS TRIGGER AS $$
BEGIN
  -- Случай 1: цена появилась или изменилась, и есть менеджер
  IF NEW.price IS NOT NULL AND NEW.manager_user_id IS NOT NULL
     AND (OLD.price IS NULL OR OLD.price <> NEW.price) THEN

    DELETE FROM commission_transactions
    WHERE order_id = NEW.id AND tx_status = 'reserved';

    INSERT INTO commission_transactions (order_id, manager_user_id, amount, tx_status)
    VALUES (NEW.id, NEW.manager_user_id, NEW.manager_commission, 'reserved');

    UPDATE manager_profiles
    SET balance_reserved = (
      SELECT COALESCE(SUM(amount), 0)
      FROM commission_transactions
      WHERE manager_user_id = NEW.manager_user_id AND tx_status = 'reserved'
    )
    WHERE user_id = NEW.manager_user_id;

  -- Случай 2: менеджер появился (был NULL → стал не NULL), цена уже стоит
  ELSIF NEW.manager_user_id IS NOT NULL
     AND OLD.manager_user_id IS NULL
     AND NEW.price IS NOT NULL THEN

    DELETE FROM commission_transactions
    WHERE order_id = NEW.id AND tx_status = 'reserved';

    INSERT INTO commission_transactions (order_id, manager_user_id, amount, tx_status)
    VALUES (NEW.id, NEW.manager_user_id, NEW.manager_commission, 'reserved');

    UPDATE manager_profiles
    SET balance_reserved = (
      SELECT COALESCE(SUM(amount), 0)
      FROM commission_transactions
      WHERE manager_user_id = NEW.manager_user_id AND tx_status = 'reserved'
    )
    WHERE user_id = NEW.manager_user_id;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================
-- Шаг 4: Обновить существующие заказы без менеджера
-- ============================================================
UPDATE public.orders o
SET manager_user_id = (
  SELECT manager_user_id FROM public.orders
  WHERE client_user_id = o.client_user_id
    AND manager_user_id IS NOT NULL
    AND id != o.id
  ORDER BY created_at ASC
  LIMIT 1
)
WHERE manager_user_id IS NULL
  AND client_user_id IS NOT NULL;

-- ============================================================
-- Шаг 5: Создать комиссии для обновлённых заказов
-- (trg_commission_on_price не сработает при UPDATE manager_user_id,
--  поэтому создаём вручную)
-- ============================================================
INSERT INTO commission_transactions (order_id, manager_user_id, amount, tx_status)
SELECT id, manager_user_id, manager_commission, 'reserved'
FROM public.orders
WHERE manager_user_id IS NOT NULL
  AND manager_commission IS NOT NULL
  AND price IS NOT NULL
  AND id NOT IN (
    SELECT order_id FROM commission_transactions WHERE tx_status = 'reserved'
  );

-- Обновить балансы менеджеров после создания комиссий
UPDATE manager_profiles mp
SET balance_reserved = (
  SELECT COALESCE(SUM(ct.amount), 0)
  FROM commission_transactions ct
  WHERE ct.manager_user_id = mp.user_id AND ct.tx_status = 'reserved'
);
