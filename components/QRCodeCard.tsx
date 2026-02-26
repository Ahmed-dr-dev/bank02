'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeCardProps {
  requestId: string;
  locale?: 'fr' | 'en';
}

export default function QRCodeCard({ requestId, locale = 'en' }: QRCodeCardProps) {
  const isFr = locale === 'fr';
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !requestId) return;
    const origin = window.location.origin;
    const url = `${origin}/request/status/${requestId}`;
    QRCode.toDataURL(url, { width: 240, margin: 2 })
      .then(setDataUrl)
      .catch(() => setDataUrl(null));
  }, [requestId]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `creditpro-dossier-${requestId.slice(0, 8)}.png`;
    a.click();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-6">{isFr ? 'Suivi de votre demande' : 'Track Your Request'}</h3>
      <div className="flex flex-col items-center">
        <div className="w-48 h-48 flex items-center justify-center mb-6 rounded-2xl overflow-hidden bg-white border border-gray-200">
          {dataUrl ? (
            <img src={dataUrl} alt="QR Code" className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-sm">Chargement…</span>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600 text-center mb-4 leading-relaxed">
          {isFr ? "Scannez ce QR code pour voir l'état de votre dossier sur votre téléphone" : 'Scan this QR code to view your request status on your phone'}
        </p>
        <button
          type="button"
          onClick={handleDownload}
          disabled={!dataUrl}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-semibold shadow-md"
        >
          {isFr ? 'Télécharger le QR code' : 'Download QR Code'}
        </button>
      </div>
    </div>
  );
}
