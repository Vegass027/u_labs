-- Создаём функцию привязки заказов
CREATE OR REPLACE FUNCTION link_orders_to_new_client()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.orders
  SET client_user_id = NEW.id
  WHERE client_contact = NEW.email
    AND client_user_id IS NULL;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'link_orders_to_new_client failed: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Вешаем триггер на таблицу users
CREATE TRIGGER trg_link_orders_to_new_client
  AFTER INSERT OR UPDATE OF email ON public.users
  FOR EACH ROW
  WHEN (NEW.role = 'client')
  EXECUTE FUNCTION link_orders_to_new_client();