-- DIELL Solar Database Initialization
-- RUN THIS IN YOUR SUPABASE SQL EDITOR

CREATE TABLE IF NOT EXISTS leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  name text NOT NULL,
  surname text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  installer text,
  calculations jsonb NOT NULL
);

-- (Optional) Add unique constraint if you want to avoid duplicates
-- ALTER TABLE leads ADD CONSTRAINT unique_contact UNIQUE (email, phone);
