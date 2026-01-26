import { mockRequests } from '@/lib/mockData';
import ScoreBadge from '@/components/ScoreBadge';
import QRCodeCard from '@/components/QRCodeCard';
import StatusTimeline from '@/components/StatusTimeline';

export default function ClientRequestDetail({ params }: { params: { id: string } }) {
  const request = mockRequests.find((r) => r.id === params.id) || mockRequests[0];

  const timelineEvents = [
    {
      status: 'Application Submitted',
      description: 'Your credit application has been received',
      date: new Date(request.submittedAt).toLocaleDateString(),
      completed: true,
    },
    {
      status: 'Document Verification',
      description: 'Your documents are being verified',
      date: new Date(request.submittedAt).toLocaleDateString(),
      completed: true,
    },
    {
      status: 'AI Score Analysis',
      description: 'Your application is being scored by our AI system',
      date: new Date(request.updatedAt).toLocaleDateString(),
      completed: request.status !== 'pending',
    },
    {
      status: 'Final Decision',
      description:
        request.status === 'approved'
          ? 'Your application has been approved!'
          : request.status === 'rejected'
          ? 'Application requires review'
          : request.status === 'guarantees_required'
          ? 'Additional guarantees required'
          : 'Awaiting final decision',
      date: new Date(request.updatedAt).toLocaleDateString(),
      completed: request.status !== 'pending',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Credit Request #{request.id}
        </h1>
        <p className="text-gray-600 mt-1">
          Submitted on {new Date(request.submittedAt).toLocaleDateString()}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Request Details</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Credit Amount</p>
                <p className="text-lg font-semibold text-gray-900">
                  {request.amount.toLocaleString()} MAD
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-lg font-semibold text-gray-900">
                  {request.duration} months ({Math.round(request.duration / 12)} years)
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Income</p>
                <p className="text-lg font-semibold text-gray-900">
                  {request.monthlyIncome.toLocaleString()} MAD
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Profession</p>
                <p className="text-lg font-semibold text-gray-900">{request.profession}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-lg font-semibold capitalize text-gray-900">
                  {request.status.replace('_', ' ')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">AI Score</p>
                <div className="mt-1">
                  <ScoreBadge score={request.score} category={request.scoreCategory} size="lg" />
                </div>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Score Analysis</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Income Stability</span>
                  <span className="text-sm font-semibold text-gray-900">92/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Debt Ratio</span>
                  <span className="text-sm font-semibold text-gray-900">78/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '78%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Document Completeness
                  </span>
                  <span className="text-sm font-semibold text-gray-900">85/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Credit History</span>
                  <span className="text-sm font-semibold text-gray-900">88/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '88%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Uploaded Documents</h2>
            <div className="space-y-3">
              {request.documents.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500"
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📄</span>
                    <span className="font-medium text-gray-900">{doc}</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* QR Code */}
          <QRCodeCard requestId={request.id} />

          {/* Timeline */}
          <StatusTimeline events={timelineEvents} />

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">
                Contact Support
              </button>
              <button className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium">
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
