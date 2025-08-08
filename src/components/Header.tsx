import { Button } from '@/components/ui/button'
import { Globe, Phone } from '@phosphor-icons/react'

interface HeaderProps {
  language: 'en' | 'es'
  setLanguage: (language: 'en' | 'es') => void
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function Header({ language, setLanguage, activeTab, setActiveTab }: HeaderProps) {
  const t = {
    en: {
      title: 'ER Wait Times',
      waitTimes: 'Wait Times',
      careGuide: 'Care Guide',
      emergencyLabel: 'Emergency:'
    },
    es: {
      title: 'Tiempos de Espera ER',
      waitTimes: 'Tiempos de Espera',
      careGuide: 'Guía de Atención',
      emergencyLabel: 'Emergencia:'
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Logo and Title */}
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            <div className="bg-gradient-to-br from-red-500 to-red-700 text-white p-2 md:p-3 rounded-xl shadow-lg border border-red-400 flex-shrink-0">
              <div className="relative w-5 h-5 md:w-7 md:h-7">
                {/* Enhanced Healthcare Cross */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white w-4 h-1.5 md:w-6 md:h-2 rounded-full shadow-sm"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white w-1.5 h-4 md:w-2 md:h-6 rounded-full shadow-sm"></div>
                </div>
                {/* Add subtle glow effect */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  <div className="bg-white w-4 h-1.5 md:w-6 md:h-2 rounded-full blur-sm"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  <div className="bg-white w-1.5 h-4 md:w-2 md:h-6 rounded-full blur-sm"></div>
                </div>
              </div>
            </div>
            <h1 className="text-lg md:text-xl font-semibold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis flex-1 min-w-0">
              {t[language].title}
            </h1>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-1 md:gap-4 flex-shrink-0">
            {/* Language Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
              className="flex items-center gap-1 md:gap-2 text-white border-2 border-yellow-400 hover:bg-yellow-500 hover:border-yellow-500 font-bold shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 transition-all duration-200 hover:scale-105 px-2 md:px-4 py-2 whitespace-nowrap"
            >
              <Globe className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span className="text-xs md:text-sm font-semibold hidden sm:inline whitespace-nowrap">
                {language === 'en' ? 'English' : 'Español'}
              </span>
              <span className="text-xs font-semibold sm:hidden whitespace-nowrap">
                {language === 'en' ? 'EN' : 'ES'}
              </span>
            </Button>

            {/* Emergency Button with label */}
            <div className="flex items-center gap-1">
              <span className="text-gray-600 text-xs hidden sm:inline whitespace-nowrap">{t[language].emergencyLabel}</span>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-2 md:px-4 whitespace-nowrap"
                onClick={() => window.open('tel:911', '_self')}
              >
                <Phone className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
                <span className="whitespace-nowrap">911</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}