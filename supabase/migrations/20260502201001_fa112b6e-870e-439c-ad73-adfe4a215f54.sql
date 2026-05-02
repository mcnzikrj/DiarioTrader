-- Enum for transaction type
DO $$ BEGIN
  CREATE TYPE public.account_tx_type AS ENUM ('deposit', 'withdraw');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE public.account_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type public.account_tx_type NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.account_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own tx"
ON public.account_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own tx"
ON public.account_transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own tx"
ON public.account_transactions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users delete own tx"
ON public.account_transactions FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_account_tx_user_date ON public.account_transactions(user_id, date DESC);