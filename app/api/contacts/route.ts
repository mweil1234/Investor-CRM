import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const VALID_PRIORITIES = ['', 'HOT', 'WARM', 'COLD'];
const VALID_PITCH = ['', 'Never been pitched', 'Pitched previously', 'Existing Investor'];

function sanitize(val: any): string {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, 500);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const name = sanitize(body.name);
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const priority = VALID_PRIORITIES.includes(body.priority) ? body.priority : '';
    const pitch_status = VALID_PITCH.includes(body.pitch_status) ? body.pitch_status : '';

    const payload = {
      name,
      title: sanitize(body.title),
      company: sanitize(body.company),
      email: sanitize(body.email),
      phone: sanitize(body.phone),
      priority,
      pitch_status: pitch_status || 'Never been pitched',
      status: '',
      dri: sanitize(body.dri),
      support: '',
      last_contact: '',
      contact_date: null,
      source: sanitize(body.source),
      project: sanitize(body.project) || 'PHX JAX',
      notes: sanitize(body.notes),
    };

    const { data, error } = await supabase.from('contacts').insert([payload]).select();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to save contact' }, { status: 500 });
    }

    return NextResponse.json({ success: true, contact: data?.[0] });
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
