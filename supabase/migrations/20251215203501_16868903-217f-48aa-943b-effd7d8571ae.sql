-- Enable REPLICA IDENTITY FULL for real-time updates
ALTER TABLE public.system_settings REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_settings;