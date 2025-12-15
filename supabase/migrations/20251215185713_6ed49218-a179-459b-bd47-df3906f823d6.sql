-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('user', 'owner');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create profiles table for user information
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    company_name TEXT,
    company_logo TEXT,
    phone TEXT,
    address TEXT,
    is_suspended BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create free_limits table for FREE plan limits
CREATE TABLE public.free_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    limit_name TEXT NOT NULL UNIQUE,
    limit_value INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on free_limits
ALTER TABLE public.free_limits ENABLE ROW LEVEL SECURITY;

-- Insert default FREE limits
INSERT INTO public.free_limits (limit_name, limit_value, description) VALUES
('max_clients', 10, 'Nombre maximum de clients'),
('max_quotations', 10, 'Nombre maximum de devis'),
('max_invoices', 10, 'Nombre maximum de factures'),
('max_tasks_per_week', 10, 'Nombre maximum de tâches par semaine'),
('analysis_enabled', 0, 'Accès aux analyses (0 = désactivé, 1 = activé)');

-- Create activity_logs table for system logs
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on activity_logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create system_settings table for global settings
CREATE TABLE public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on system_settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Insert default system settings
INSERT INTO public.system_settings (setting_key, setting_value, description) VALUES
('supported_currencies', '["EUR", "USD", "XOF"]', 'Devises supportées'),
('default_currency', '"EUR"', 'Devise par défaut'),
('maintenance_mode', 'false', 'Mode maintenance'),
('beta_mode', 'true', 'Mode beta actif');

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
        AND role = _role
    )
$$;

-- Function to check if user is owner
CREATE OR REPLACE FUNCTION public.is_owner(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.has_role(_user_id, 'owner')
$$;

-- Function to check if user is suspended
CREATE OR REPLACE FUNCTION public.is_user_suspended(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(
        (SELECT is_suspended FROM public.profiles WHERE user_id = _user_id),
        false
    )
$$;

-- Function to get user limit usage
CREATE OR REPLACE FUNCTION public.get_user_limit_usage(_user_id UUID, _entity_type TEXT)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT CASE _entity_type
        WHEN 'clients' THEN (SELECT COUNT(*)::INTEGER FROM public.clients WHERE user_id = _user_id)
        WHEN 'quotations' THEN (SELECT COUNT(*)::INTEGER FROM public.quotations WHERE user_id = _user_id)
        WHEN 'invoices' THEN (SELECT COUNT(*)::INTEGER FROM public.invoices WHERE user_id = _user_id)
        WHEN 'tasks' THEN (SELECT COUNT(*)::INTEGER FROM public.tasks WHERE user_id = _user_id AND created_at > now() - interval '7 days')
        ELSE 0
    END
$$;

-- Function to check if user can create entity
CREATE OR REPLACE FUNCTION public.can_create_entity(_user_id UUID, _entity_type TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT CASE
        WHEN public.is_owner(_user_id) THEN true
        ELSE (
            SELECT public.get_user_limit_usage(_user_id, _entity_type) < 
                COALESCE((SELECT limit_value FROM public.free_limits WHERE limit_name = 'max_' || _entity_type), 999999)
        )
    END
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_owner(auth.uid()));

CREATE POLICY "Only owners can insert roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.is_owner(auth.uid()));

CREATE POLICY "Only owners can update roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (public.is_owner(auth.uid()));

CREATE POLICY "Only owners can delete roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.is_owner(auth.uid()));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_owner(auth.uid()));

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR public.is_owner(auth.uid()));

-- RLS Policies for free_limits
CREATE POLICY "Anyone can view free limits"
ON public.free_limits FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only owners can modify free limits"
ON public.free_limits FOR UPDATE
TO authenticated
USING (public.is_owner(auth.uid()));

-- RLS Policies for activity_logs
CREATE POLICY "Users can view their own logs"
ON public.activity_logs FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_owner(auth.uid()));

CREATE POLICY "Anyone can insert logs"
ON public.activity_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- RLS Policies for system_settings
CREATE POLICY "Anyone can view system settings"
ON public.system_settings FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only owners can modify system settings"
ON public.system_settings FOR UPDATE
TO authenticated
USING (public.is_owner(auth.uid()));

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$$;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update profiles updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update free_limits updated_at
CREATE TRIGGER update_free_limits_updated_at
    BEFORE UPDATE ON public.free_limits
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update system_settings updated_at
CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();