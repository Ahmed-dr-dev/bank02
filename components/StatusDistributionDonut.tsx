'use client';

const STATUS_DONUT_COLORS = {
  approved: 'rgb(34 197 94)',
  pending: 'rgb(234 179 8)',
  guarantees: 'rgb(251 146 60)',
  rejected: 'rgb(239 68 68)',
} as const;

const DEFAULT_LEGEND: Record<'approved' | 'pending' | 'guarantees' | 'rejected', string> = {
  approved: 'Approuvés',
  pending: 'En attente',
  guarantees: 'Garanties req.',
  rejected: 'Refusés',
};

export type StatusDistributionDonutProps = {
  approved: number;
  pending: number;
  guarantees: number;
  rejected: number;
  /** Libellés légende (ex. admin : Approuvées / Refusées) */
  legendLabels?: Partial<Record<keyof typeof DEFAULT_LEGEND, string>>;
  centerCaption?: string;
};

export default function StatusDistributionDonut({
  approved,
  pending,
  guarantees,
  rejected,
  legendLabels,
  centerCaption = 'dossiers',
}: StatusDistributionDonutProps) {
  const labels = { ...DEFAULT_LEGEND, ...legendLabels };
  const total = approved + pending + guarantees + rejected;
  const legend = [
    { key: 'approved', label: labels.approved, count: approved, dot: 'bg-green-500' },
    { key: 'pending', label: labels.pending, count: pending, dot: 'bg-yellow-500' },
    { key: 'guarantees', label: labels.guarantees, count: guarantees, dot: 'bg-orange-400' },
    { key: 'rejected', label: labels.rejected, count: rejected, dot: 'bg-red-500' },
  ] as const;

  let background: string;
  if (total <= 0) {
    background = 'rgb(229 231 235)';
  } else {
    const a = approved / total;
    const b = (approved + pending) / total;
    const c = (approved + pending + guarantees) / total;
    const { approved: cA, pending: cP, guarantees: cG, rejected: cR } = STATUS_DONUT_COLORS;
    background = `conic-gradient(
      ${cA} 0turn ${a}turn,
      ${cP} ${a}turn ${b}turn,
      ${cG} ${b}turn ${c}turn,
      ${cR} ${c}turn 1turn
    )`;
  }

  const ariaLabel =
    total <= 0
      ? 'Aucun dossier par statut'
      : `Répartition : ${approved} ${labels.approved.toLowerCase()}, ${pending} ${labels.pending.toLowerCase()}, ${guarantees} ${labels.guarantees.toLowerCase()}, ${rejected} ${labels.rejected.toLowerCase()}, sur ${total} dossiers`;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-8">
      <div className="relative shrink-0 w-44 h-44 sm:w-52 sm:h-52" role="img" aria-label={ariaLabel}>
        <div className="absolute inset-0 rounded-full shadow-inner" style={{ background }} aria-hidden />
        <div className="absolute inset-[32%] rounded-full bg-white shadow-md flex flex-col items-center justify-center">
          <span className="text-2xl sm:text-3xl font-bold text-gray-900 leading-none">{total}</span>
          <span className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{centerCaption}</span>
        </div>
      </div>
      <ul className="flex-1 w-full max-w-xs space-y-2.5">
        {legend.map((row) => (
          <li key={row.key} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 min-w-0 text-gray-700">
              <span className={`w-3 h-3 rounded-full shrink-0 ${row.dot}`} aria-hidden />
              <span className="truncate">{row.label}</span>
            </span>
            <span className="font-semibold text-gray-900 tabular-nums shrink-0">{row.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
