import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Phone } from '@phosphor-icons/react'

function TestApp() {
  const [language, setLanguage] = useState<'en' | 'es'>('en')

  const t = {
    en: {
      title: 'ER Wait Times',
      emergency: '911',
      language: 'English'
    },
    es: {
      title: 'Tiempos de Espera ER', 
      emergency: '911',
      language: 'Español'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-xl font-semibold text-gray-900">
              {t[language].title}
            </h1>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
                className="flex items-center gap-2"
              >
                {language === 'en' ? 'English' : 'Español'}
              </Button>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white font-bold"
                onClick={() => window.open('tel:911', '_self')}
              >
                <Phone className="h-4 w-4 mr-1" />
                911
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Harbor-UCLA Medical Center</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Badge className="bg-green-100 text-green-800">Open</Badge>
              <p>Emergency Department with real-time wait times</p>
              <div className="text-2xl font-bold text-blue-600">22 minutes</div>
              <p className="text-sm text-gray-600">Average wait time to triage</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TestApp