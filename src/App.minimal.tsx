import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Globe, Clock, FirstAid, Phone } from '@phosphor-icons/react'

function AppMinimal() {
  const [language, setLanguage] = useState<'en' | 'es'>('en')
  const [activeTab, setActiveTab] = useState('wait-times')

  const t = {
    en: {
      title: 'ER Wait Times',
      waitTimes: 'Wait Times',
      careGuide: 'Care Guide',
      emergency: '911',
      language: 'English',
      emergencyLabel: 'Emergency:'
    },
    es: {
      title: 'Tiempos de Espera ER',
      waitTimes: 'Tiempos de Espera',
      careGuide: 'Guía de Atención',
      emergency: '911',
      language: 'Español',
      emergencyLabel: 'Emergencia:'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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

          {/* Navigation Tabs */}
          <div className="mt-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-transparent h-auto p-0 gap-3 md:gap-6 overflow-x-auto">
                <TabsTrigger 
                  value="wait-times" 
                  className="flex items-center gap-1 md:gap-2 bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none pb-2 font-medium text-sm md:text-base whitespace-nowrap flex-shrink-0"
                >
                  <Clock className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">{t[language].waitTimes}</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="care-guide" 
                  className="flex items-center gap-1 md:gap-2 bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none pb-2 font-medium text-sm md:text-base whitespace-nowrap flex-shrink-0"
                >
                  <FirstAid className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">{t[language].careGuide}</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Wait Times Tab */}
          <TabsContent value="wait-times" className="space-y-4 md:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t[language].waitTimes}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Wait times content would go here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Care Guide Tab */}
          <TabsContent value="care-guide" className="space-y-4 md:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t[language].careGuide}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Care guide content would go here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AppMinimal