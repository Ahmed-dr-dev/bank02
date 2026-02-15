import SimulatorCard from '@/components/SimulatorCard';

export default function ClientSimulator() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Simulateur de crédit</h1>
        <p className="text-gray-600 mt-1">
          Calculez vos mensualités et estimez vos chances d&apos;acceptation
        </p>
      </div>

      <SimulatorCard locale="fr" currency="TND" />

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 shadow-lg">
          <h3 className="text-xl font-bold text-blue-900 mb-4">💡 Conseils pour une meilleure acceptation</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start"><span className="mr-2">•</span><span>Gardez un taux d&apos;endettement inférieur à 33 %</span></li>
            <li className="flex items-start"><span className="mr-2">•</span><span>Fournissez des pièces complètes et exactes</span></li>
            <li className="flex items-start"><span className="mr-2">•</span><span>Une durée plus longue réduit la mensualité</span></li>
            <li className="flex items-start"><span className="mr-2">•</span><span>Une situation professionnelle stable est un atout</span></li>
          </ul>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 shadow-lg">
          <h3 className="text-xl font-bold text-green-900 mb-4">✓ Comprendre votre score</h3>
          <ul className="space-y-2 text-sm text-green-800">
            <li className="flex items-start"><span className="mr-2">•</span><span><strong>Score élevé (70-100) :</strong> Très bonnes chances d&apos;acceptation</span></li>
            <li className="flex items-start"><span className="mr-2">•</span><span><strong>Score moyen (50-69) :</strong> Bonnes chances, parfois sous conditions</span></li>
            <li className="flex items-start"><span className="mr-2">•</span><span><strong>Score faible (0-49) :</strong> Garanties supplémentaires possibles</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
