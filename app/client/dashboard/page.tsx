import Link from 'next/link';
import DashboardCard from '@/components/DashboardCard';
import { mockRequests, mockClientStats } from '@/lib/mockData';

export default function ClientDashboard() {
  // Filter client's own requests (mock - showing first 2)
  const myRequests = mockRequests.slice(0, 2);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, Ahmed!</h1>
        <p className="text-gray-600 mt-1">Here's an overview of your credit applications</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <DashboardCard
          title="Active Requests"
          value={mockClientStats.activeRequests}
          icon="📋"
          subtitle="In progress"
        />
        <DashboardCard
          title="Approved Credits"
          value={mockClientStats.approvedRequests}
          icon="✅"
          subtitle="Successfully approved"
        />
        <DashboardCard
          title="Total Applications"
          value={mockClientStats.totalRequests}
          icon="📊"
          subtitle="All time"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            href="/client/new-request"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 text-center font-semibold shadow-lg card-hover"
          >
            <span className="text-2xl block mb-2">+</span>
            New Credit Request
          </Link>
          <Link
            href="/client/simulator"
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-xl hover:from-green-700 hover:to-emerald-700 text-center font-semibold shadow-lg card-hover"
          >
            <span className="text-2xl block mb-2">💰</span>
            Credit Simulator
          </Link>
          <Link
            href="/client/requests"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-xl hover:from-purple-700 hover:to-pink-700 text-center font-semibold shadow-lg card-hover"
          >
            <span className="text-2xl block mb-2">📄</span>
            View All Requests
          </Link>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Recent Applications</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {myRequests.map((request) => (
              <div
                key={request.id}
                className="border-2 border-gray-200 rounded-xl p-5 hover:border-blue-500 transition-all card-hover bg-gradient-to-r from-white to-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Credit Request - {request.amount.toLocaleString()} MAD
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {request.duration} months • Submitted on{' '}
                      {new Date(request.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
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
                        ? 'Pending'
                        : request.status === 'rejected'
                        ? 'Rejected'
                        : 'Guarantees Required'}
                    </span>
                    <Link
                      href={`/client/request/${request.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {myRequests.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No applications yet</p>
              <Link
                href="/client/new-request"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Create your first application
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
