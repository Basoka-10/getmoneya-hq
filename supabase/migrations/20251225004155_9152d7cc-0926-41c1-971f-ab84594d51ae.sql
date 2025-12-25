-- Permettre aux owners d'insérer des abonnements pour n'importe quel utilisateur
CREATE POLICY "Owners can insert any subscription"
ON public.subscriptions
FOR INSERT
TO authenticated
WITH CHECK (is_owner(auth.uid()));

-- Permettre aux owners de mettre à jour n'importe quel abonnement
CREATE POLICY "Owners can update any subscription"
ON public.subscriptions
FOR UPDATE
TO authenticated
USING (is_owner(auth.uid()))
WITH CHECK (is_owner(auth.uid()));