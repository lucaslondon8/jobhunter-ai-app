-- This migration sets up the secure table for storing encrypted user session cookies.
-- CRITICAL: This assumes you have pgsodium enabled on your Supabase instance for encryption.

-- Create a secure table to store encrypted user credentials
CREATE TABLE IF NOT EXISTS public.user_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL, -- e.g., 'linkedin', 'indeed'
  encrypted_cookies bytea NOT NULL, -- Storing encrypted data
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Comments for your understanding
COMMENT ON TABLE public.user_credentials IS 'Stores encrypted session cookies for job platforms.';
COMMENT ON COLUMN public.user_credentials.encrypted_cookies IS 'Cookies encrypted using pgsodium.';

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Ensures users can only access and manage their own credentials
CREATE POLICY "Users can manage their own credentials"
  ON public.user_credentials
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- A function to automatically update the updated_at timestamp on any change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to use the function
CREATE TRIGGER update_user_credentials_updated_at
  BEFORE UPDATE ON public.user_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
