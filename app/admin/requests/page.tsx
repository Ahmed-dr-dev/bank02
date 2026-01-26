import DataTable from '@/components/DataTable';
import { mockRequests } from '@/lib/mockData';

export default function AdminRequests() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Credit Requests</h1>
        <p className="text-gray-600 mt-1">Manage and review all credit applications</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-100">
        <div className="grid md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option>All Status</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
              <option>Guarantees Required</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Score Range</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option>All Scores</option>
              <option>High (70-100)</option>
              <option>Medium (50-69)</option>
              <option>Low (0-49)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option>All Time</option>
              <option>Today</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option>All Amounts</option>
              <option>0 - 100k MAD</option>
              <option>100k - 300k MAD</option>
              <option>300k - 500k MAD</option>
              <option>500k+ MAD</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg">
              Apply Filters
            </button>
          </div>
        </div>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search by client name or email..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 card-hover">
          <p className="text-sm text-gray-600">Total Displayed</p>
          <p className="text-2xl font-bold text-gray-900">{mockRequests.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 card-hover">
          <p className="text-sm text-gray-600">Approved</p>
          <p className="text-2xl font-bold text-green-600">
            {mockRequests.filter((r) => r.status === 'approved').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 card-hover">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {mockRequests.filter((r) => r.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500 card-hover">
          <p className="text-sm text-gray-600">Action Required</p>
          <p className="text-2xl font-bold text-red-600">
            {
              mockRequests.filter(
                (r) => r.status === 'rejected' || r.status === 'guarantees_required'
              ).length
            }
          </p>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <DataTable requests={mockRequests} />
      </div>
    </div>
  );
}
