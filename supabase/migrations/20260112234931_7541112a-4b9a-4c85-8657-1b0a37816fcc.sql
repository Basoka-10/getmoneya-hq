-- Add reminder columns to tasks table
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS reminder_minutes INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE;

-- Add index for efficient reminder checking (tasks with due_date, due_time and not yet reminded)
CREATE INDEX IF NOT EXISTS idx_tasks_reminder_check 
ON public.tasks (user_id, due_date, due_time) 
WHERE reminder_minutes IS NOT NULL AND reminder_sent = FALSE AND completed = FALSE;

-- Comment on columns
COMMENT ON COLUMN public.tasks.reminder_minutes IS 'Minutes before due time to send reminder (e.g., 10, 15, 30)';
COMMENT ON COLUMN public.tasks.reminder_sent IS 'Whether the reminder notification has been sent';