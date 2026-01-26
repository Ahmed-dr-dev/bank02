import { mockRequests } from '@/lib/mockData';
import ScoreBadge from '@/components/ScoreBadge';

export default function AdminRequestDetail({ params }: { params: { id: string } }) {
  const request = mockRequests.find((r) => r.id === params.id) || mockRequests[0];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Request Details #{request.id}</h1>
        <p className="text-gray-600 mt-1">
          Submitted on {new Date(request.submittedAt).toLocaleDateString()}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Client Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="text-lg font-semibold text-gray-900">{request.clientName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-lg font-semibold text-gray-900">{request.clientEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Profession</p>
                <p className="text-lg font-semibold text-gray-900">{request.profession}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Income</p>
                <p className="text-lg font-semibold text-gray-900">
                  {request.monthlyIncome.toLocaleString()} MAD
                </p>
              </div>
            </div>
          </div>

          {/* Credit Details */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Credit Request Details</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Requested Amount</p>
                <p className="text-2xl font-bold text-blue-600">
                  {request.amount.toLocaleString()} MAD
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-2xl font-bold text-gray-900">
                  {request.duration} months
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Payment (Est.)</p>
                <p className="text-lg font-semibold text-gray-900">
                  {Math.round(request.amount / request.duration * 1.045).toLocaleString()} MAD
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Debt Ratio</p>
                <p className="text-lg font-semibold text-gray-900">
                  {((request.amount / request.duration * 1.045 / request.monthlyIncome) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* AI Score Analysis */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Score Analysis</h2>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-700 font-medium">Overall Score</span>
                <ScoreBadge score={request.score} category={request.scoreCategory} size="lg" />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Income Stability</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {Math.min(100, Math.round(request.score + Math.random() * 10))}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, Math.round(request.score + Math.random() * 10))}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Payment Capacity</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {Math.max(0, Math.round(request.score - 5))}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${Math.max(0, Math.round(request.score - 5))}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Document Quality</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {Math.round(request.score + 2)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${Math.round(request.score + 2)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Risk Assessment</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {Math.round(request.score - 3)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${Math.round(request.score - 3)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-sm">
              <h4 className="font-bold text-blue-900 mb-3 text-lg">AI Recommendation</h4>
              <p className="text-sm text-blue-800 leading-relaxed">
                {request.scoreCategory === 'high'
                  ? 'This applicant shows strong financial capacity and low risk. Approval is recommended.'
                  : request.scoreCategory === 'medium'
                  ? 'This applicant shows moderate financial capacity. Consider approval with standard terms or request additional guarantees.'
                  : 'This applicant shows higher risk factors. Additional guarantees or co-signer recommended before approval.'}
              </p>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Uploaded Documents</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {request.documents.map((doc, index) => (
                <div
                  key={index}
                  className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-500 cursor-pointer transition-all card-hover bg-gradient-to-r from-white to-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-3xl mr-3">📄</span>
                      <div>
                        <p className="font-medium text-gray-900">{doc}</p>
                        <p className="text-xs text-gray-500">Verified</p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Current Status</h3>
            <div
              className={`p-4 rounded-lg text-center font-semibold text-lg mb-4 ${
                request.status === 'approved'
                  ? 'bg-green-100 text-green-800'
                  : request.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : request.status === 'rejected'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-orange-100 text-orange-800'
              }`}
            >
              {request.status === 'approved'
                ? 'Approved'
                : request.status === 'pending'
                ? 'Pending Review'
                : request.status === 'rejected'
                ? 'Rejected'
                : 'Guarantees Required'}
            </div>
            <p className="text-sm text-gray-600 text-center">
              Last updated: {new Date(request.updatedAt).toLocaleDateString()}
            </p>
          </div>

          {/* Decision Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Decision</h3>
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3.5 rounded-xl hover:from-green-700 hover:to-emerald-700 font-bold shadow-lg">
                ✓ Approve Request
              </button>
              <button className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-3.5 rounded-xl hover:from-orange-700 hover:to-red-700 font-bold shadow-lg">
                ⚠ Request Guarantees
              </button>
              <button className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-3.5 rounded-xl hover:from-red-700 hover:to-pink-700 font-bold shadow-lg">
                ✗ Reject Request
              </button>
            </div>
          </div>

          {/* Additional Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left text-blue-600 hover:text-blue-800 font-medium py-2">
                📧 Contact Client
              </button>
              <button className="w-full text-left text-blue-600 hover:text-blue-800 font-medium py-2">
                📄 Generate Report
              </button>
              <button className="w-full text-left text-blue-600 hover:text-blue-800 font-medium py-2">
                📝 Add Note
              </button>
              <button className="w-full text-left text-blue-600 hover:text-blue-800 font-medium py-2">
                🔄 Request More Documents
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
