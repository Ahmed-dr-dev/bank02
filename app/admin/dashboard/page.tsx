import DashboardCard from '@/components/DashboardCard';
import { mockAdminStats, mockRequests } from '@/lib/mockData';
import Link from 'next/link';

export default function AdminDashboard() {
  const recentRequests = mockRequests.slice(0, 5);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of all credit applications</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Total Requests"
          value={mockAdminStats.totalRequests}
          icon="📋"
          trend="up"
          trendValue="12%"
        />
        <DashboardCard
          title="Approval Rate"
          value={`${mockAdminStats.approvalRate}%`}
          icon="✅"
          trend="up"
          trendValue="5%"
        />
        <DashboardCard
          title="Average Score"
          value={mockAdminStats.averageScore}
          icon="📊"
          subtitle="AI Scoring"
        />
        <DashboardCard
          title="Pending Review"
          value={mockAdminStats.pendingRequests}
          icon="⏳"
          subtitle="Needs attention"
        />
      </div>

      {/* Score Distribution */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Score Distribution</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  High Score (70-100)
                </span>
                <span className="text-sm font-semibold text-green-600">42%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full" style={{ width: '42%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Medium Score (50-69)
                </span>
                <span className="text-sm font-semibold text-yellow-600">38%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-yellow-500 h-3 rounded-full" style={{ width: '38%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Low Score (0-49)</span>
                <span className="text-sm font-semibold text-red-600">20%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-red-500 h-3 rounded-full" style={{ width: '20%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Status Overview</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-l-4 border-green-500">
              <span className="font-semibold text-gray-700">Approved</span>
              <span className="text-3xl font-bold text-green-600">170</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border-l-4 border-yellow-500">
              <span className="font-semibold text-gray-700">Pending</span>
              <span className="text-3xl font-bold text-yellow-600">23</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border-l-4 border-orange-500">
              <span className="font-semibold text-gray-700">Guarantees Required</span>
              <span className="text-3xl font-bold text-orange-600">31</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border-l-4 border-red-500">
              <span className="font-semibold text-gray-700">Rejected</span>
              <span className="text-3xl font-bold text-red-600">24</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Recent Applications</h2>
          <Link
            href="/admin/requests"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View All →
          </Link>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-5 border-2 border-gray-200 rounded-xl hover:border-blue-500 transition-all card-hover bg-gradient-to-r from-white to-gray-50"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{request.clientName}</h3>
                  <p className="text-sm text-gray-600">
                    {request.amount.toLocaleString()} MAD • {request.duration} months
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      request.scoreCategory === 'high'
                        ? 'bg-green-100 text-green-800'
                        : request.scoreCategory === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    Score: {request.score}
                  </span>
                  <Link
                    href={`/admin/requests/${request.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Review →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
