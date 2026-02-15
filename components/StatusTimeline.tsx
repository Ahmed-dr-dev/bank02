interface TimelineEvent {
  status: string;
  description: string;
  date: string;
  completed: boolean;
}

interface StatusTimelineProps {
  events: TimelineEvent[];
  locale?: 'fr' | 'en';
}

export default function StatusTimeline({ events, locale = 'en' }: StatusTimelineProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-8">{locale === 'fr' ? 'Suivi du dossier' : 'Request Timeline'}</h3>
      <div className="space-y-6">
        {events.map((event, index) => (
          <div key={index} className="flex">
            <div className="flex flex-col items-center mr-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-md transition-all ${
                  event.completed
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white scale-110'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {event.completed ? '✓' : index + 1}
              </div>
              {index < events.length - 1 && (
                <div
                  className={`w-0.5 h-full min-h-[40px] ${
                    event.completed ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
            <div className="flex-1 pb-8">
              <h4
                className={`font-semibold ${
                  event.completed ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {event.status}
              </h4>
              <p className="text-sm text-gray-600 mt-1">{event.description}</p>
              <p className="text-xs text-gray-500 mt-1">{event.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
