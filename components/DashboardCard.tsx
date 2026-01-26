interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  trend?: 'up' | 'down';
  trendValue?: string;
}

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
}: DashboardCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 card-hover border border-gray-100">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide">{title}</p>
          <p className="text-4xl font-bold text-gray-900 mt-3">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-2">{subtitle}</p>}
          {trend && trendValue && (
            <div className="flex items-center mt-3">
              <span
                className={`text-sm font-semibold px-2 py-1 rounded-lg ${
                  trend === 'up' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                }`}
              >
                {trend === 'up' ? '↑' : '↓'} {trendValue}
              </span>
              <span className="text-xs text-gray-500 ml-2">vs last month</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-4xl bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-xl">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
