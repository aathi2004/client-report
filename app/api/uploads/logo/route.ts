import { randomUUID } from 'node:crypto';

import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth';
import {
  ALLOWED_LOGO_TYPES,
  LOGO_BUCKET,
  MAX_LOGO_SIZE_BYTES,
  extensionForMime,
  getSupabaseAdmin,
} from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.error('[uploads/logo] Supabase env vars are not set');
    return NextResponse.json(
      {
        error:
          'Storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
      },
      { status: 500 },
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data.' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }

  if (!ALLOWED_LOGO_TYPES.includes(file.type as (typeof ALLOWED_LOGO_TYPES)[number])) {
    return NextResponse.json(
      { error: 'Unsupported format. Use JPG, PNG, or WebP.' },
      { status: 400 },
    );
  }

  if (file.size > MAX_LOGO_SIZE_BYTES) {
    return NextResponse.json(
      { error: 'File is too large. Max size is 20 MB.' },
      { status: 400 },
    );
  }

  const ext = extensionForMime(file.type);
  const path = `${user.id}/${Date.now()}-${randomUUID()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(LOGO_BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
      cacheControl: '31536000',
    });

  if (uploadError) {
    console.error('[uploads/logo] Supabase upload failed:', uploadError);
    return NextResponse.json(
      { error: uploadError.message ?? 'Upload failed.' },
      { status: 500 },
    );
  }

  const { data } = supabase.storage.from(LOGO_BUCKET).getPublicUrl(path);

  return NextResponse.json({ url: data.publicUrl, path });
}
