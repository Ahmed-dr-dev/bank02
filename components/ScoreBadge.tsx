interface ScoreBadgeProps {
  score: number;
  category: 'low' | 'medium' | 'high';
  size?: 'sm' | 'md' | 'lg';
}

export default function ScoreBadge({ score, category, size = 'md' }: ScoreBadgeProps) {
  const styles = {
    low: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-400',
    medium: 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-400',
    high: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-400',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-2.5',
  };

  return (
    <div className="flex items-center space-x-3">
      <span
        className={`font-bold rounded-xl border-2 shadow-sm ${styles[category]} ${sizes[size]}`}
      >
        {score}/100
      </span>
      <span className={`text-xs uppercase font-semibold tracking-wide ${size === 'lg' ? 'text-sm' : ''}`}>
        {category}
      </span>
    </div>
  );
}
