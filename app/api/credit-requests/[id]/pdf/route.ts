import { NextResponse } from 'next/server';
import { getSessionProfileId } from '@/lib/session';
import { createClient } from '@/lib/supabase/server';
import { jsPDF } from 'jspdf';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const profileId = await getSessionProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createClient();
  const { id } = await params;
  const { data, error } = await supabase
    .from('credit_requests')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (data.user_id !== profileId) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', profileId).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const statusLabel =
    data.status === 'approved' ? 'Approuvé' : data.status === 'pending' ? 'En attente' : data.status === 'rejected' ? 'Refusé' : 'Garanties requises';
  const submitted = new Date(data.submitted_at).toLocaleDateString('fr-FR');
  const updated = new Date(data.updated_at).toLocaleDateString('fr-FR');
  const amount = Number(data.amount).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const income = Number(data.monthly_income || 0).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 20;
  const pageW = doc.internal.pageSize.getWidth();
  let y = margin;
  const lineH = 7;

  const addCenter = (text: string, fontSize?: number) => {
    if (fontSize) doc.setFontSize(fontSize);
    doc.text(text, pageW / 2, y, { align: 'center' });
    y += lineH;
  };
  const addLeft = (text: string, fontSize?: number) => {
    if (fontSize) doc.setFontSize(fontSize);
    doc.text(text, margin, y);
    y += lineH;
  };

  doc.setFontSize(18);
  addCenter('CreditPro Tunisie');
  doc.setFontSize(11);
  doc.setTextColor(102, 102, 102);
  addCenter('Récapitulatif de la demande de crédit');
  doc.setTextColor(0, 0, 0);
  y += 4;
  doc.setFontSize(10);
  addCenter(`Dossier ${String(data.id).slice(0, 8).toUpperCase()}`);
  addCenter(`Déposé le ${submitted} · Dernière mise à jour : ${updated}`);
  addCenter(`Statut : ${statusLabel}`);
  y += 10;

  doc.setFontSize(12);
  doc.setDrawColor(0, 0, 0);
  addLeft('Résumé');
  doc.setFontSize(10);
  addLeft(`Montant : ${amount} TND`);
  addLeft(`Durée : ${data.duration} mois`);
  addLeft(`Objet : ${data.credit_purpose || '—'}`);
  addLeft(`Garantie : ${data.guarantee_type || '—'}`);
  y += 5;

  doc.setFontSize(12);
  addLeft('Demandeur');
  doc.setFontSize(10);
  addLeft(`Nom : ${data.client_name}`);
  addLeft(`E-mail : ${data.client_email}`);
  y += 5;

  doc.setFontSize(12);
  addLeft('Situation professionnelle');
  doc.setFontSize(10);
  addLeft(`Profession : ${data.profession || '—'}`);
  addLeft(`Employeur : ${data.employer || '—'}`);
  y += 5;

  doc.setFontSize(12);
  addLeft('Revenus (TND)');
  doc.setFontSize(10);
  addLeft(`Revenu mensuel : ${income} TND`);
  y += 10;

  doc.setFontSize(8);
  doc.setTextColor(136, 136, 136);
  doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')} · CreditPro Tunisie`, pageW / 2, y, { align: 'center' });

  const pdf = Buffer.from(doc.output('arraybuffer'));

  return new NextResponse(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="dossier-${String(data.id).slice(0, 8)}.pdf"`,
      'Content-Length': String(pdf.length),
    },
  });
}
