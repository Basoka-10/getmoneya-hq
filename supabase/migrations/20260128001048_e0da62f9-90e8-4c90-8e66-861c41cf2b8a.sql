-- ============================================
-- FIX SECURITY VULNERABILITIES
-- ============================================

-- 1. ADD MISSING DELETE POLICIES FOR SELF-DELETION
-- ============================================

-- Allow users to delete their own subscription
CREATE POLICY "Users can delete own subscription" 
  ON subscriptions FOR DELETE 
  USING (auth.uid() = user_id);

-- Allow users to delete their own payments
CREATE POLICY "Users can delete own payments" 
  ON payments FOR DELETE 
  USING (auth.uid() = user_id);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete own profile" 
  ON profiles FOR DELETE 
  USING (auth.uid() = user_id);

-- Allow users to delete their own private profile
CREATE POLICY "Users can delete own private profile" 
  ON profiles_private FOR DELETE 
  USING (auth.uid() = user_id);

-- Allow users to delete their own activity logs
CREATE POLICY "Users can delete own logs" 
  ON activity_logs FOR DELETE 
  USING (auth.uid() = user_id);

-- 2. DROP OVERLY PERMISSIVE "SYSTEM" POLICIES
-- (Service role key bypasses RLS anyway, so these are unnecessary security holes)
-- ============================================

-- Drop permissive insert policy on api_logs
DROP POLICY IF EXISTS "System can insert API logs" ON api_logs;

-- Drop permissive insert/update policies on payments
DROP POLICY IF EXISTS "System can insert payments" ON payments;
DROP POLICY IF EXISTS "System can update payments" ON payments;

-- Drop permissive update policy on subscriptions  
DROP POLICY IF EXISTS "System can update subscriptions" ON subscriptions;

-- 3. ADD SECURE REPLACEMENT POLICIES
-- (Only owners/admins can perform system operations via client, edge functions use service role)
-- ============================================

-- Owners can insert API logs for any user (for admin operations)
CREATE POLICY "Owners can insert API logs"
  ON api_logs FOR INSERT
  WITH CHECK (is_owner(auth.uid()));

-- Owners can manage payments
CREATE POLICY "Owners can insert payments"
  ON payments FOR INSERT
  WITH CHECK (is_owner(auth.uid()));

CREATE POLICY "Owners can update payments"
  ON payments FOR UPDATE
  USING (is_owner(auth.uid()));

-- Owners can update any subscription
CREATE POLICY "Owners can update subscriptions"
  ON subscriptions FOR UPDATE
  USING (is_owner(auth.uid()));