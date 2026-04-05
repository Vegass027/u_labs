CREATE POLICY orders_client_update ON orders
  FOR UPDATE 
  USING (client_user_id = auth.uid())
  WITH CHECK (client_user_id = auth.uid());