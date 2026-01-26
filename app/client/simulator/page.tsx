import SimulatorCard from '@/components/SimulatorCard';

export default function ClientSimulator() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Credit Simulator</h1>
        <p className="text-gray-600 mt-1">
          Calculate your monthly payments and check your acceptance probability
        </p>
      </div>

      <SimulatorCard />

      {/* Information Cards */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 shadow-lg">
          <h3 className="text-xl font-bold text-blue-900 mb-4">💡 Tips for Better Approval</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Keep your debt ratio below 33% for best approval chances</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Provide complete and accurate documentation</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Consider a longer duration for lower monthly payments</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Maintain a stable employment history</span>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 shadow-lg">
          <h3 className="text-xl font-bold text-green-900 mb-4">
            ✓ Understanding Your Score
          </h3>
          <ul className="space-y-2 text-sm text-green-800">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>High Score (70-100):</strong> Excellent approval chances
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Medium Score (50-69):</strong> Good approval chances with conditions
              </span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                <strong>Low Score (0-49):</strong> May require additional guarantees
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
