import { useState } from 'react'
import '@/lib/spark' // Initialize mock spark API
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function App() {
  const [activeTab, setActiveTab] = useState('wait-times')
  const [language, setLanguage] = useState<'en' | 'es'>('en')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-lg md:text-xl font-semibold text-gray-900">
              ER Wait Times
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
              className="flex items-center gap-2"
            >
              {language === 'en' ? 'English' : 'Español'}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {language === 'en' ? 'Emergency Department' : 'Departamento de Emergencias'}
            </h2>
            <p className="text-gray-600">
              {language === 'en' 
                ? 'This is a simplified test version to debug the preview issue.'
                : 'Esta es una versión de prueba simplificada para depurar el problema de vista previa.'
              }
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App