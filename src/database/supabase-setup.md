# Supabase Setup Instructions

Follow these steps to set up your Supabase project and configure it for the TFPS Club Website:

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com/) and create a new account or sign in
   - Create a new project and note your project URL and anon key

2. **Update Configuration**:
   - Open `src/utils/supabase.ts`
   - Replace the placeholder values with your actual Supabase URL and anon key

3. **Run SQL Setup Script**:
   - In your Supabase dashboard, go to the SQL Editor
   - Copy the contents of `src/database/schema.sql`
   - Run the script to create all tables and sample data

4. **Configure Row-Level Security (RLS)**:
   - From the Supabase dashboard, go to Authentication → Policies
   - For each table, set up the following policies:

### Users Table Policies
```sql
-- Users can read all user profiles
CREATE POLICY "Users can view all profiles" ON users
FOR SELECT USING (true);

-- Only admins can insert/update/delete users
CREATE POLICY "Only admins can insert users" ON users
FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE is_admin = true));

CREATE POLICY "Only admins can update users" ON users
FOR UPDATE USING (auth.uid() IN (SELECT id FROM users WHERE is_admin = true));

CREATE POLICY "Only admins can delete users" ON users
FOR DELETE USING (auth.uid() IN (SELECT id FROM users WHERE is_admin = true));
```

### Equipment Table Policies
```sql
-- Everyone can view equipment
CREATE POLICY "Everyone can view equipment" ON equipment
FOR SELECT USING (true);

-- Only admins can modify equipment
CREATE POLICY "Only admins can insert equipment" ON equipment
FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE is_admin = true));

CREATE POLICY "Only admins can update equipment" ON equipment
FOR UPDATE USING (auth.uid() IN (SELECT id FROM users WHERE is_admin = true));

CREATE POLICY "Only admins can delete equipment" ON equipment
FOR DELETE USING (auth.uid() IN (SELECT id FROM users WHERE is_admin = true));
```

### Events & Requests Table Policies
```sql
-- Similar policies for events and requests tables
-- Set up policies that allow users to see all events but only modify their own
-- Admins should have full access
```

5. **Test the Connection**:
   - Make sure your application can connect to Supabase and query data
   - Check that authentication and data operations work as expected

For a full production setup, make sure to:
- Use environment variables for sensitive credentials
- Implement proper password hashing and security measures
- Configure CORS settings in Supabase to allow only your application domains