import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Contact = {
  id: string;
  name: string;
  title: string;
  company: string;
  dri: string;
  support: string;
  status: string;
  priority: string;
  last_contact: string;
  contact_date: string | null;
  source: string;
  project: string;
  notes: string;
  phone: string;
  email: string;
  pitch_status: string;
  created_at: string;
  updated_at: string;
};
