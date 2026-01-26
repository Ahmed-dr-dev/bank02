interface QRCodeCardProps {
  requestId: string;
}

export default function QRCodeCard({ requestId }: QRCodeCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Track Your Request</h3>
      <div className="flex flex-col items-center">
        {/* QR Code Placeholder */}
        <div className="w-48 h-48 bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
          <div className="text-center">
            <div className="text-6xl mb-2">📱</div>
            <p className="text-sm text-gray-600">QR Code</p>
            <p className="text-xs text-gray-500">#{requestId}</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 text-center mb-4 leading-relaxed">
          Scan this QR code to track your request status
        </p>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold shadow-md">
          Download QR Code
        </button>
      </div>
    </div>
  );
}
