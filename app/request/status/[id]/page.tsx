import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

const statusLabels: Record<string, string> = {
  approved: 'Approuvé',
  pending: 'En attente',
  rejected: 'Refusé',
  guarantees_required: 'Garanties requises',
};

const statusStyles: Record<string, string> = {
  approved: 'bg-green-100 text-green-800',
  pending: 'bg-amber-100 text-amber-800',
  rejected: 'bg-red-100 text-red-800',
  guarantees_required: 'bg-orange-100 text-orange-800',
};

export default async function RequestStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('credit_requests')
    .select('id, status, amount, duration, submitted_at, updated_at')
    .eq('id', id)
    .single();

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <p className="text-gray-600">Dossier introuvable.</p>
          <p className="text-sm text-gray-500 mt-2">Vérifiez le lien ou scannez à nouveau le QR code.</p>
        </div>
      </div>
    );
  }

  const statusLabel = statusLabels[data.status] ?? data.status;
  const statusClass = statusStyles[data.status] ?? 'bg-gray-100 text-gray-800';
  const submitted = new Date(data.submitted_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const updated = new Date(data.updated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const amount = Number(data.amount).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">CreditPro Tunisie</h1>
          <p className="text-sm text-gray-500 mt-1">Suivi de votre demande</p>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Référence</p>
            <p className="font-mono font-semibold text-gray-900">{data.id.slice(0, 8).toUpperCase()}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Statut</p>
            <span className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${statusClass}`}>
              {statusLabel}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-xs text-gray-500">Montant</p>
              <p className="font-semibold text-gray-900">{amount} TND</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Durée</p>
              <p className="font-semibold text-gray-900">{data.duration} mois</p>
            </div>
          </div>

          <div className="text-sm text-gray-500 space-y-1 pt-2 border-t border-gray-100">
            <p>Déposé le {submitted}</p>
            <p>Dernière mise à jour : {updated}</p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          <Link href="/" className="text-blue-600 hover:underline">CreditPro Tunisie</Link>
        </p>
      </div>
    </div>
  );
}
