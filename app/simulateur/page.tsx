import Link from 'next/link';
import SimulatorCard from '@/components/SimulatorCard';

export const metadata = {
  title: 'Simulateur de crédit | CreditPro Tunisie',
  description:
    'Estimez vos mensualités et votre score indicatif en TND, sans connexion ni espace client.',
};

export default function PublicSimulateurPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap justify-between items-center gap-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              CreditPro Tunisie
            </span>
          </Link>
          <nav className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/login"
              className="text-gray-700 hover:text-blue-600 font-medium px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-semibold shadow-md transition-all text-sm sm:text-base"
            >
              Créer un compte
            </Link>
          </nav>
        </div>
      </header>

      <main className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Simulateur de crédit</h1>
          <p className="text-gray-600 mt-1">
            Calculez vos mensualités et estimez vos chances d&apos;acceptation — sans accéder à l&apos;espace
            client.
          </p>
        </div>

        <SimulatorCard locale="fr" currency="TND" />

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 shadow-lg">
            <h3 className="text-xl font-bold text-blue-900 mb-4">💡 Conseils pour une meilleure acceptation</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Gardez un taux d&apos;endettement inférieur à 33 %</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Fournissez des pièces complètes et exactes</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Une durée plus longue réduit la mensualité</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Une situation professionnelle stable est un atout</span>
              </li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 shadow-lg">
            <h3 className="text-xl font-bold text-green-900 mb-4">✓ Comprendre votre score</h3>
            <ul className="space-y-2 text-sm text-green-800">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  <strong>Score élevé (70-100) :</strong> Très bonnes chances d&apos;acceptation
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  <strong>Score moyen (50-69) :</strong> Bonnes chances, parfois sous conditions
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  <strong>Score faible (0-49) :</strong> Garanties supplémentaires possibles
                </span>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-gray-500">
          <Link href="/" className="text-blue-600 hover:underline font-medium">
            ← Retour à l&apos;accueil
          </Link>
        </p>
      </main>
    </div>
  );
}
