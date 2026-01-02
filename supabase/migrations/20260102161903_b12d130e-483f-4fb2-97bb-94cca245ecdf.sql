-- ============================================
-- API MONEYA - Tables pour clés API et logs
-- ============================================

-- Extension pour générer des UUID et hasher les clés
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Table des clés API utilisateurs
CREATE TABLE public.api_keys (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL DEFAULT 'Clé API',
    key_hash text NOT NULL, -- Clé hashée (SHA256)
    key_prefix text NOT NULL, -- 8 premiers caractères pour identification
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    last_used_at timestamptz,
    expires_at timestamptz,
    
    -- Contrainte unicité sur le hash
    UNIQUE(key_hash)
);

-- Index pour recherche rapide par hash
CREATE INDEX idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);

-- Table des logs API
CREATE TABLE public.api_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    api_key_id uuid REFERENCES public.api_keys(id) ON DELETE SET NULL,
    endpoint text NOT NULL,
    method text NOT NULL DEFAULT 'POST',
    source text, -- ex: chariow, maketou
    status_code integer NOT NULL,
    error_message text,
    ip_address text,
    request_body jsonb,
    response_time_ms integer,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Index pour les requêtes de logs
CREATE INDEX idx_api_logs_user_id ON public.api_logs(user_id);
CREATE INDEX idx_api_logs_created_at ON public.api_logs(created_at DESC);
CREATE INDEX idx_api_logs_api_key_id ON public.api_logs(api_key_id);

-- Table des limites API par plan
CREATE TABLE public.api_limits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    plan text NOT NULL UNIQUE,
    max_api_keys integer NOT NULL DEFAULT 1,
    max_sales_per_month integer NOT NULL DEFAULT 50,
    webhooks_enabled boolean NOT NULL DEFAULT false,
    advanced_logs boolean NOT NULL DEFAULT false,
    rate_limit_per_minute integer NOT NULL DEFAULT 10,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Insérer les limites par plan
INSERT INTO public.api_limits (plan, max_api_keys, max_sales_per_month, webhooks_enabled, advanced_logs, rate_limit_per_minute)
VALUES 
    ('free', 1, 50, false, false, 10),
    ('pro', 3, 500, true, false, 30),
    ('business', 999, 10000, true, true, 100);

-- Activer RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_limits ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour api_keys
CREATE POLICY "Users can view their own API keys"
ON public.api_keys FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own API keys"
ON public.api_keys FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys"
ON public.api_keys FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys"
ON public.api_keys FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Owners can view all API keys"
ON public.api_keys FOR SELECT
USING (is_owner(auth.uid()));

CREATE POLICY "Owners can update any API key"
ON public.api_keys FOR UPDATE
USING (is_owner(auth.uid()));

-- Politiques RLS pour api_logs
CREATE POLICY "Users can view their own API logs"
ON public.api_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert API logs"
ON public.api_logs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Owners can view all API logs"
ON public.api_logs FOR SELECT
USING (is_owner(auth.uid()));

-- Politiques RLS pour api_limits (lecture publique)
CREATE POLICY "Anyone can view API limits"
ON public.api_limits FOR SELECT
USING (true);

CREATE POLICY "Only owners can modify API limits"
ON public.api_limits FOR UPDATE
USING (is_owner(auth.uid()));

-- Fonction pour compter les ventes API du mois
CREATE OR REPLACE FUNCTION public.get_api_sales_this_month(_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COUNT(*)::integer
    FROM public.api_logs
    WHERE user_id = _user_id
    AND endpoint = '/api/v1/sales'
    AND status_code = 200
    AND created_at >= date_trunc('month', now())
$$;

-- Fonction pour compter les clés API actives
CREATE OR REPLACE FUNCTION public.get_active_api_keys_count(_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COUNT(*)::integer
    FROM public.api_keys
    WHERE user_id = _user_id
    AND is_active = true
$$;

-- Fonction pour vérifier si l'utilisateur peut créer une clé API
CREATE OR REPLACE FUNCTION public.can_create_api_key(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT (
        SELECT public.get_active_api_keys_count(_user_id) < 
        COALESCE(
            (SELECT al.max_api_keys 
             FROM public.api_limits al
             JOIN public.subscriptions s ON s.plan = al.plan
             WHERE s.user_id = _user_id AND s.status = 'active'
             ORDER BY s.created_at DESC LIMIT 1),
            (SELECT max_api_keys FROM public.api_limits WHERE plan = 'free')
        )
    )
$$;

-- Fonction pour obtenir les limites du plan de l'utilisateur
CREATE OR REPLACE FUNCTION public.get_user_api_limits(_user_id uuid)
RETURNS TABLE(
    plan text,
    max_api_keys integer,
    max_sales_per_month integer,
    webhooks_enabled boolean,
    advanced_logs boolean,
    rate_limit_per_minute integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT al.plan, al.max_api_keys, al.max_sales_per_month, 
           al.webhooks_enabled, al.advanced_logs, al.rate_limit_per_minute
    FROM public.api_limits al
    WHERE al.plan = COALESCE(
        (SELECT s.plan FROM public.subscriptions s 
         WHERE s.user_id = _user_id AND s.status = 'active'
         ORDER BY s.created_at DESC LIMIT 1),
        'free'
    )
$$;

-- Trigger pour mettre à jour updated_at sur api_limits
CREATE TRIGGER update_api_limits_updated_at
BEFORE UPDATE ON public.api_limits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();