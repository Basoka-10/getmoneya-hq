-- Allow users to delete their own role (needed for account deletion)
CREATE POLICY "Users can delete own roles" 
  ON user_roles FOR DELETE 
  USING (auth.uid() = user_id);