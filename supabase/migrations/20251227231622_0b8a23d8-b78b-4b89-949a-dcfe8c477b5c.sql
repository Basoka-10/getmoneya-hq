-- Migration: Convertir les montants des transactions de EUR vers FCFA
-- Taux de conversion: 1 EUR = 655.957 FCFA (arrondi à 656 pour les montants entiers FCFA)

UPDATE public.transactions 
SET amount = ROUND(amount * 655.957, 0)
WHERE amount < 1000; -- Seules les transactions avec des montants "petits" sont en EUR

-- Note: Les montants FCFA n'ont pas de décimales, on arrondit à l'entier