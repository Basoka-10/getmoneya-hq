-- Add OWNER role to the specified user
INSERT INTO public.user_roles (user_id, role)
VALUES ('7b8ecf9d-c95a-4b68-befa-efa82ca07819', 'owner')
ON CONFLICT (user_id, role) DO NOTHING;