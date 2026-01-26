export default function AdminAnalytics() {
  const monthlyData = [
    { month: 'Jan', requests: 45, approved: 32, rejected: 8, pending: 5 },
    { month: 'Feb', requests: 52, approved: 38, rejected: 9, pending: 5 },
    { month: 'Mar', requests: 48, approved: 35, rejected: 7, pending: 6 },
    { month: 'Apr', requests: 61, approved: 42, rejected: 11, pending: 8 },
    { month: 'May', requests: 58, approved: 40, rejected: 10, pending: 8 },
    { month: 'Jun', requests: 55, approved: 38, rejected: 9, pending: 8 },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-600 mt-1">Detailed insights and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 card-hover border border-gray-100">
          <p className="text-sm text-gray-600 mb-2">Total Volume</p>
          <p className="text-3xl font-bold text-gray-900">1.2B MAD</p>
          <p className="text-sm text-green-600 mt-2">↑ 18% vs last month</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Avg Processing Time</p>
          <p className="text-3xl font-bold text-gray-900">2.3 days</p>
          <p className="text-sm text-green-600 mt-2">↓ 12% vs last month</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Client Satisfaction</p>
          <p className="text-3xl font-bold text-gray-900">4.7/5</p>
          <p className="text-sm text-green-600 mt-2">↑ 0.3 vs last month</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Active Clients</p>
          <p className="text-3xl font-bold text-gray-900">1,847</p>
          <p className="text-sm text-green-600 mt-2">↑ 156 new this month</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Monthly Requests Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Monthly Requests Trend
          </h2>
          <div className="space-y-4">
            {monthlyData.map((data) => (
              <div key={data.month}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{data.month}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {data.requests} requests
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full"
                    style={{ width: `${(data.requests / 70) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Approval Rate Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Approval Rate Trend</h2>
          <div className="space-y-4">
            {monthlyData.map((data) => {
              const approvalRate = ((data.approved / data.requests) * 100).toFixed(1);
              return (
                <div key={data.month}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{data.month}</span>
                    <span className="text-sm font-semibold text-green-600">
                      {approvalRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full"
                      style={{ width: `${approvalRate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Score Distribution */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Score Distribution by Month
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  High Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Medium Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Low Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Avg Score
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {monthlyData.map((data) => (
                <tr key={data.month}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {data.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">
                    {Math.round(data.requests * 0.42)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-yellow-600 font-semibold">
                    {Math.round(data.requests * 0.38)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-red-600 font-semibold">
                    {Math.round(data.requests * 0.2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold">
                    {(68 + Math.random() * 6).toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Professions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Top Professions (Applicants)
          </h2>
          <div className="space-y-3">
            {[
              { profession: 'Software Engineer', count: 42, color: 'blue' },
              { profession: 'Teacher', count: 38, color: 'green' },
              { profession: 'Business Owner', count: 31, color: 'purple' },
              { profession: 'Doctor', count: 28, color: 'red' },
              { profession: 'Sales Representative', count: 24, color: 'yellow' },
            ].map((item) => (
              <div key={item.profession} className="flex items-center justify-between">
                <span className="text-gray-700">{item.profession}</span>
                <span className="font-semibold text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Average Credit Amount by Purpose
          </h2>
          <div className="space-y-3">
            {[
              { purpose: 'Real Estate', amount: 450000 },
              { purpose: 'Car Purchase', amount: 280000 },
              { purpose: 'Home Renovation', amount: 180000 },
              { purpose: 'Business Investment', amount: 520000 },
              { purpose: 'Education', amount: 95000 },
            ].map((item) => (
              <div key={item.purpose} className="flex items-center justify-between">
                <span className="text-gray-700">{item.purpose}</span>
                <span className="font-semibold text-gray-900">
                  {item.amount.toLocaleString()} MAD
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
