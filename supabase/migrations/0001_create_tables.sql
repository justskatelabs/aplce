-- Create tables for APLE MVP

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('customer', 'company')),
  full_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  zip_codes TEXT[] NOT NULL,
  weekly_capacity INT NOT NULL DEFAULT 10,
  specialties TEXT[] NOT NULL,
  metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_zip TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  diagnosis JSONB NOT NULL,
  estimate JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'accepted', 'rejected', 'completed')),
  assigned_company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_customer_id ON leads(customer_id);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_company_id ON leads(assigned_company_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for companies
CREATE POLICY "Companies can read own data" ON companies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Companies can update own data" ON companies
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for leads
CREATE POLICY "Customers can read own leads" ON leads
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Companies can read assigned leads" ON leads
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM companies WHERE id = leads.assigned_company_id
    )
  );

CREATE POLICY "Customers can create leads" ON leads
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Companies can update assigned leads" ON leads
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM companies WHERE id = leads.assigned_company_id
    )
  );
