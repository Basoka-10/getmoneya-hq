-- Mise à jour des limites pour l'offre gratuite
UPDATE public.free_limits SET limit_value = 3, description = 'Nombre maximum de clients (Gratuit: 3, Pro: 20, Business: 100)' WHERE limit_name = 'max_clients';
UPDATE public.free_limits SET limit_value = 10, description = 'Nombre maximum de factures (Gratuit: 10, Pro: 40, Business: 200)' WHERE limit_name = 'max_invoices';
UPDATE public.free_limits SET limit_value = 10, description = 'Nombre maximum de devis (Gratuit: 10, Pro: 40, Business: 200)' WHERE limit_name = 'max_quotations';
UPDATE public.free_limits SET limit_value = 10, description = 'Nombre maximum de tâches par semaine (Gratuit: 10, Pro/Business: illimité)' WHERE limit_name = 'max_tasks_per_week';
UPDATE public.free_limits SET limit_value = 0, description = 'Accès aux analyses avancées (Gratuit: 0, Pro: 1, Business: 2)' WHERE limit_name = 'analysis_enabled';

-- Ajout de nouvelles limites
INSERT INTO public.free_limits (limit_name, limit_value, description) 
VALUES ('export_enabled', 0, 'Export PDF/CSV (Gratuit: 0, Pro/Business: 1)')
ON CONFLICT DO NOTHING;

INSERT INTO public.free_limits (limit_name, limit_value, description)
VALUES ('history_days', 30, 'Historique en jours (Gratuit: 30, Pro: 180, Business: 365)')
ON CONFLICT DO NOTHING;