-- Allow authenticated users to insert their own profile on signup
CREATE POLICY profiles_insert_self ON profiles
  FOR INSERT
  WITH CHECK (id = auth.uid());


