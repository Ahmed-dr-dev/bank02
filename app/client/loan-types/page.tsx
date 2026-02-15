import Link from 'next/link';

const loanTypes = [
  {
    id: 'immobilier',
    title: 'Crédit immobilier',
    icon: '🏠',
    description: 'Financez l\'achat de votre résidence principale ou secondaire, ou un terrain pour construction.',
    amount: 'À partir de 30 000 TND jusqu’à 500 000 TND et plus',
    duration: '12 à 300 mois (25 ans max)',
    rate: 'Taux indicatif à partir de 4,5 % annuel (variable selon profil)',
    conditions: [
      'Apport personnel généralement demandé (10 à 20 %)',
      'Garantie hypothèque ou virement de salaire',
      'Justificatifs de revenus et pièce d’identité',
    ],
  },
  {
    id: 'consommation',
    title: 'Crédit à la consommation',
    icon: '🛒',
    description: 'Crédit personnel pour vos projets : équipement maison, voyage, mariage, études, etc.',
    amount: '2 000 TND à 80 000 TND',
    duration: '12 à 84 mois',
    rate: 'Taux indicatif à partir de 5 % annuel',
    conditions: [
      'Revenus stables et justifiés',
      'Taux d\'endettement inférieur à 40 %',
      'CIN et justificatif de domicile',
    ],
  },
  {
    id: 'vehicule',
    title: 'Crédit véhicule',
    icon: '🚗',
    description: 'Achat d\'un véhicule neuf ou d\'occasion, voiture ou deux-roues.',
    amount: '10 000 TND à 150 000 TND',
    duration: '12 à 84 mois',
    rate: 'Taux indicatif à partir de 4,75 % annuel',
    conditions: [
      'Véhicule en garantie (gage)',
      'Assurance et carte grise à jour',
      'Revenus et CIN',
    ],
  },
  {
    id: 'travaux',
    title: 'Crédit travaux / rénovation',
    icon: '🔧',
    description: 'Rénovation, extension ou aménagement de votre logement.',
    amount: '5 000 TND à 100 000 TND',
    duration: '12 à 120 mois',
    rate: 'Taux indicatif à partir de 5 % annuel',
    conditions: [
      'Justificatif de propriété ou accord du propriétaire',
      'Devis ou factures selon montant',
      'Revenus et pièces d\'identité',
    ],
  },
];

export default function ClientLoanTypes() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Types de crédit proposés</h1>
        <p className="text-gray-600 mt-1">
          Découvrez les offres de crédit en TND proposées par la banque (conditions indicatives)
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        {loanTypes.map((loan) => (
          <div
            key={loan.id}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-2xl flex-shrink-0">
                {loan.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{loan.title}</h2>
                <p className="text-gray-600 text-sm mb-4">{loan.description}</p>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-gray-500 font-medium">Montant</dt>
                    <dd className="text-gray-900">{loan.amount}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 font-medium">Durée</dt>
                    <dd className="text-gray-900">{loan.duration}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500 font-medium">Taux</dt>
                    <dd className="text-gray-900">{loan.rate}</dd>
                  </div>
                </dl>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Conditions principales
                  </p>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {loan.conditions.map((c, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Vous souhaitez faire une demande ?</h3>
        <p className="text-gray-700 text-sm mb-4">
          Utilisez le simulateur pour estimer vos mensualités, puis déposez votre dossier en ligne.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/client/simulator"
            className="inline-flex items-center px-5 py-2.5 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
          >
            Simulateur
          </Link>
          <Link
            href="/client/new-request"
            className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Nouvelle demande
          </Link>
        </div>
      </div>
    </div>
  );
}
