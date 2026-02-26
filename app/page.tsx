import Link from 'next/link';
import TrackMyLoan from '@/components/TrackMyLoan';
import ChatBot from '@/components/ChatBot';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <ChatBot />
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                CreditPro Tunisie
              </span>
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium">Fonctionnalités</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600 font-medium">Comment ça marche</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium">À propos</a>
              <Link
                href="/login"
                className="text-gray-700 hover:text-blue-600 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Créer un compte
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="text-center md:text-left">
              <div className="inline-block mb-6">
                <span className="bg-blue-50 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full border border-blue-200">
                  Crédit en dinars tunisiens (TND)
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Votre crédit en TND
                <span className="block text-blue-600 mt-2">
                  en quelques minutes
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-xl">
                Crédit à la consommation ou immobilier, 100 % en dinars tunisiens. Dépôt de dossier en ligne, réponse préliminaire sous 2 min.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Réservé aux résidents en Tunisie • Montants et mensualités en TND
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link
                  href="/register"
                  className="group bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center"
                >
                  Démarrer ma demande
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/client/simulator"
                  className="bg-white text-gray-900 border-2 border-gray-300 px-8 py-4 rounded-lg text-lg font-semibold hover:border-gray-400 hover:shadow-md transition-all flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Simulateur de crédit
                </Link>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="hidden md:block relative">
              <div className="relative bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b">
                    <span className="text-sm font-semibold text-gray-500">Statut de la demande</span>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">Approuvé</span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Montant du crédit (dinars tunisiens)</div>
                    <div className="text-3xl font-bold text-gray-900">50 000 <span className="text-blue-600">TND</span></div>
                    <div className="text-xs text-gray-500 mt-1">~1 450 TND/mois sur 60 mois</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Score</div>
                      <div className="flex items-center">
                        <span className="text-2xl font-bold text-green-600">85</span>
                        <span className="text-gray-400 ml-1">/100</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Durée</div>
                      <div className="text-2xl font-bold text-gray-900">60 mois</div>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Probabilité d&apos;acceptation</span>
                      <span className="text-lg font-bold text-green-600">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg">
                  ✓
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TrackMyLoan />

      {/* Stats Section */}
      <section className="bg-gray-50 py-16 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm font-medium mb-10">Chiffres du marché tunisien • Tous les montants en TND</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                10K+
              </div>
              <div className="text-gray-600 font-medium">Dossiers traités en Tunisie</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2">
                2,5 M <span className="text-2xl md:text-3xl font-semibold text-gray-700">TND</span>
              </div>
              <div className="text-gray-600 font-medium">Crédits accordés</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-purple-600 mb-2">
                85%
              </div>
              <div className="text-gray-600 font-medium">Taux d&apos;acceptation</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-orange-600 mb-2">
                2 min
              </div>
              <div className="text-gray-600 font-medium">Délai moyen de traitement</div>
            </div>
          </div>
          <p className="text-center text-gray-500 text-sm mt-6">Notation clients 4,9/5 (Tunisie)</p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Pourquoi choisir CreditPro Tunisie ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Crédit conso et immobilier en dinars tunisiens (TND). Une plateforme pensée pour les Tunisiens.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow border border-gray-200">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Rapide</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Résultat préliminaire en moins de 2 minutes. Analyse de votre dossier en temps réel.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Réponse immédiate
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Mise à jour en temps réel
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Décision rapide
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow border border-gray-200">
              <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Sécurité bancaire</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Vos données sont protégées par un chiffrement de niveau bancaire et une infrastructure sécurisée.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Chiffrement 256 bits
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Conforme BCT
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Stockage sécurisé
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow border border-gray-200">
              <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Scoring fiable</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Évaluation de votre dossier selon les critères habituels, adaptée au marché tunisien.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Score de crédit
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Critères transparents
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Évaluation du risque
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Comment ça marche
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Obtenez une réponse à votre demande de crédit en 4 étapes
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 transform -translate-y-1/2"></div>

            <div className="grid md:grid-cols-4 gap-8 relative">
              <div className="text-center group">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow mx-auto">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                    1
                  </div>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Créer un compte</h4>
                <p className="text-gray-600">Inscription rapide avec vérification par e-mail</p>
              </div>

              <div className="text-center group">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow mx-auto">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                    2
                  </div>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Remplir le dossier</h4>
                <p className="text-gray-600">Formulaire guidé avec assistance en ligne</p>
              </div>

              <div className="text-center group">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow mx-auto">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                    3
                  </div>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Analyse du dossier</h4>
                <p className="text-gray-600">Évaluation de votre dossier en quelques secondes</p>
              </div>

              <div className="text-center group">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 bg-pink-600 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow mx-auto">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                    4
                  </div>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Réponse</h4>
                <p className="text-gray-600">Recevez le statut avec les détails de votre score</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Tout ce dont vous avez besoin,
                <span className="block text-blue-600">
                  en un seul endroit
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Crédit à la consommation ou immobilier : tout en <strong className="text-gray-800">TND</strong>. Simulateur de mensualités, suivi de dossier et scoring adaptés aux résidents en Tunisie.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-bold text-gray-900 mb-1">Suivi en temps réel</h4>
                    <p className="text-gray-600">Suivez l&apos;état de votre dossier 24h/24 avec accès par QR code</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-bold text-gray-900 mb-1">Simulateur en TND</h4>
                    <p className="text-gray-600">Mensualités et montant maximal en dinars tunisiens. Estimez votre éligibilité avant de déposer un dossier.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-bold text-gray-900 mb-1">Documents sécurisés</h4>
                    <p className="text-gray-600">Téléversez et gérez vos pièces (CIN, bulletins, justificatifs) en un seul endroit</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-gray-900">Avancement du dossier</h4>
                    <span className="text-sm text-gray-500">75 % complété</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: '75%' }}></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-green-50 rounded-xl border-l-4 border-green-500">
                    <svg className="w-6 h-6 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">État civil</div>
                      <div className="text-sm text-gray-600">Complété</div>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-green-50 rounded-xl border-l-4 border-green-500">
                    <svg className="w-6 h-6 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Situation financière</div>
                      <div className="text-sm text-gray-600">Complété</div>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-blue-50 rounded-xl border-l-4 border-blue-500">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Pièces jointes</div>
                      <div className="text-sm text-gray-600">En cours</div>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-gray-50 rounded-xl border-l-4 border-gray-300">
                    <div className="w-6 h-6 bg-gray-300 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-500">Examen final</div>
                      <div className="text-sm text-gray-400">En attente</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 text-sm">
            CreditPro Tunisie — Projet de fin d&apos;études
          </p>
          <p className="text-gray-500 text-xs mt-2">
            © 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
