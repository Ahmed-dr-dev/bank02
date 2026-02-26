'use client';

import Link from 'next/link';
import { CreditRequest } from '@/lib/mockData';
import ScoreBadge from './ScoreBadge';

interface DataTableProps {
  requests: CreditRequest[];
  showActions?: boolean;
  linkPrefix?: string;
  editPrefix?: string;
  onDelete?: (request: CreditRequest) => void;
  locale?: 'fr' | 'en';
  currency?: string;
}

export default function DataTable({ requests = [], showActions = true, linkPrefix = '/admin/requests', editPrefix, onDelete, locale = 'en', currency = 'MAD' }: DataTableProps) {
  const isFr = locale === 'fr';
  const safeRequests = Array.isArray(requests) ? requests : [];

  const getStatusBadge = (status: CreditRequest['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      guarantees_required: 'bg-orange-100 text-orange-800',
    };

    const labels: Record<CreditRequest['status'], string> = isFr
      ? { pending: 'En attente', approved: 'Approuvé', rejected: 'Refusé', guarantees_required: 'Garanties requises' }
      : { pending: 'Pending', approved: 'Approved', rejected: 'Rejected', guarantees_required: 'Guarantees Required' };

    const style = styles[status] ?? 'bg-gray-100 text-gray-800';
    const label = labels[status] ?? status;

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${style}`}>
        {label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      if (Number.isNaN(d.getTime())) return dateString || '—';
      return d.toLocaleDateString(isFr ? 'fr-FR' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString || '—';
    }
  };

  const formatCurrency = (amount: number) => {
    const curr = typeof currency === 'string' ? currency : 'MAD';
    if (curr === 'TND') {
      return `${Number(amount).toLocaleString(isFr ? 'fr-FR' : 'en-US')} TND`;
    }
    try {
      return new Intl.NumberFormat(isFr ? 'fr-FR' : 'en-US', {
        style: 'currency',
        currency: curr,
        minimumFractionDigits: 0,
      }).format(Number(amount));
    } catch {
      return `${Number(amount).toLocaleString(isFr ? 'fr-FR' : 'en-US')} ${curr}`;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isFr ? 'Client' : 'Client'}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isFr ? 'Montant' : 'Amount'}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isFr ? 'Durée' : 'Duration'}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isFr ? 'Score' : 'Score'}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isFr ? 'Statut' : 'Status'}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isFr ? 'Date' : 'Date'}</th>
            {showActions && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isFr ? 'Actions' : 'Actions'}</th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {safeRequests.map((request, index) => (
            <tr key={request?.id ?? `row-${index}`} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">{request?.clientName ?? '—'}</div>
                  <div className="text-sm text-gray-500">{request?.clientEmail ?? ''}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(Number(request?.amount) || 0)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {request?.duration ?? 0} {isFr ? 'mois' : 'months'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <ScoreBadge
                  score={Number(request?.score) || 0}
                  category={request?.scoreCategory ?? 'medium'}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge((request?.status ?? 'pending') as CreditRequest['status'])}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(request?.submittedAt ?? '')}
              </td>
              {showActions && (
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Link href={`${linkPrefix}/${request?.id ?? ''}`} className="text-blue-600 hover:text-blue-800 font-medium">
                      {isFr ? 'Voir' : 'View Details'}
                    </Link>
                    {editPrefix && (
                      <Link href={`${editPrefix}/${request?.id ?? ''}/edit`} className="text-amber-600 hover:text-amber-800 font-medium">
                        {isFr ? 'Modifier' : 'Edit'}
                      </Link>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(request as CreditRequest)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        {isFr ? 'Supprimer' : 'Delete'}
                      </button>
                    )}
                  </span>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
