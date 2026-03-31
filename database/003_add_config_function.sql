-- Add function to set configuration variables for RLS
-- This function is used to pass current user ID to RLS policies

CREATE OR REPLACE FUNCTION set_config(name text, value text)
RETURNS void AS $$
BEGIN
  PERFORM set_config(name, value, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
