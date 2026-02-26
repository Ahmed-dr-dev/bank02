import { NextResponse } from 'next/server';
import { getSessionProfileId } from '@/lib/session';
import { createClient } from '@/lib/supabase/server';
import { writeFile, mkdir, readdir, readFile } from 'fs/promises';
import path from 'path';

async function checkAccess(requestId: string, profileId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: reqRow } = await supabase
    .from('credit_requests')
    .select('user_id')
    .eq('id', requestId)
    .single();
  if (!reqRow || reqRow.user_id !== profileId) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', profileId).single();
    if (profile?.role !== 'admin') return false;
  }
  return true;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const profileId = await getSessionProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createClient();
  const id = (await params).id;
  const allowed = await checkAccess(id, profileId, supabase);
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const docDir = path.join(process.cwd(), 'doc', id);
  const { searchParams } = new URL(request.url);
  const fileParam = searchParams.get('file');

  if (fileParam) {
    const name = path.basename(fileParam).replace(/\.\./g, '');
    if (!name) return NextResponse.json({ error: 'Bad request' }, { status: 400 });
    try {
      const filePath = path.join(docDir, name);
      const buf = await readFile(filePath);
      const ext = path.extname(name).toLowerCase();
      const mime: Record<string, string> = {
        '.pdf': 'application/pdf',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      };
      const contentType = mime[ext] || 'application/octet-stream';
      return new NextResponse(buf, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${name}"`,
        },
      });
    } catch {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  }

  try {
    const entries = await readdir(docDir, { withFileTypes: true });
    const files = entries.filter((e) => e.isFile()).map((e) => e.name);
    return NextResponse.json({ files });
  } catch {
    return NextResponse.json({ files: [] });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const profileId = await getSessionProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createClient();
  const id = (await params).id;
  const allowed = await checkAccess(id, profileId, supabase);
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const formData = await request.formData();
  const files = formData.getAll('files');
  if (!files.length) return NextResponse.json({ error: 'Aucun fichier' }, { status: 400 });

  const docDir = path.join(process.cwd(), 'doc', id);
  await mkdir(docDir, { recursive: true });

  const saved: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const entry = files[i];
    if (entry instanceof File) {
      const buf = Buffer.from(await entry.arrayBuffer());
      const raw = entry.name.replace(/[^a-zA-Z0-9._-]/g, '_') || 'file';
      const ext = path.extname(raw);
      const base = ext ? raw.slice(0, -ext.length) : raw;
      const name = files.length > 1 ? `${base}_${i}${ext || ''}` : raw;
      const filePath = path.join(docDir, name);
      await writeFile(filePath, buf);
      saved.push(name);
    }
  }

  return NextResponse.json({ saved });
}
