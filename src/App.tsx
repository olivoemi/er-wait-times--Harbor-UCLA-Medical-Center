import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Clock, RefreshCw, AlertTriangle, Heart, FirstAid, Phone, Thermometer, Pill, Eye, Plus, Globe, Info, X, Building } from '@phosphor-icons/react'
import qrCodeImage from '@/assets/images/qr-code.png'

interface Hospital {
  id: string
  name: string
  address: string
  distance?: number
  waitTime: number
  lastUpdated: string
  specialties: string[]
  phone: string
}

interface UserLocation {
  lat: number
  lng: number
}

interface CareGuideItem {
  id: string
  title: string
  description: string
  urgency: 'emergency' | 'urgent' | 'non-urgent'
  symptoms: string[]
  recommendations: string[]
  icon: JSX.Element
}

function App() {
  const [hospitals, setHospitals] = useKV<Hospital[]>('hospitals', [])
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [locationError, setLocationError] = useState<string>('')
  const [activeTab, setActiveTab] = useState('wait-times')
  const [language, setLanguage] = useState<'en' | 'es'>('en')
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview')
  const [sortBy, setSortBy] = useState('wait-time')

  // Translation object
  const t = {
    en: {
      title: 'ER Wait Times',
      waitTimes: 'Wait Times',
      careGuide: 'Care Guide',
      emergency: '911',
      language: 'English',
      emergencyLabel: 'Emergency:',
      emergencyDepartments: 'Emergency Departments',
      realTimeWaitTimes: 'Real-time wait times by condition severity for 1 ED',
      live: 'Live',
      timeAgo: '1m ago',
      refreshButton: 'Refresh',
      emergencyDepartmentDemo: 'Emergency Department Demo',
      demoDescription: 'Demo showing Harbor-UCLA Medical Center emergency department with acuity-based wait times.',
      demoTime: '8/4/2025, 1:30:10 PM',
      howSystemWorks: 'How Our Wait Time System Works',
      systemDescription: 'Each facility shows estimated wait times for all 5 acuity levels based on current patient queue, staffing levels, and facility efficiency. Higher acuity conditions (Level 1-2) are seen immediately, while lower acuity conditions may have longer wait times depending on facility capacity.',
      conditionSeverityLevels: 'Emergency Condition Severity Levels',
      acuityDescription: 'Understanding the 5 acuity levels helps you know what to expect when visiting an emergency department.',
      level1Critical: 'Level 1 - Critical',
      level2Urgent: 'Level 2 - Urgent',
      level3LessUrgent: 'Level 3 - Less Urgent',
      level4NonUrgent: 'Level 4 - Non-Urgent',
      level5LowAcuity: 'Level 5 - Low Acuity',
      cardiacArrest: 'Cardiac arrest',
      severeBreathing: 'Severe breathing difficulty',
      majorTrauma: 'Major trauma',
      strokeSymptoms: 'Stroke symptoms',
      chestPain: 'Chest pain',
      severeAbdominal: 'Severe abdominal pain',
      highFeverConfusion: 'High fever with confusion',
      moderateBleeding: 'Moderate bleeding',
      moderatePain: 'Moderate pain',
      minorFractures: 'Minor fractures',
      persistentFever: 'Persistent fever',
      vomitingDiarrhea: 'Vomiting/diarrhea',
      minorCuts: 'Minor cuts',
      mildHeadache: 'Mild headache',
      coldFluSymptoms: 'Cold/flu symptoms',
      minorSprains: 'Minor sprains',
      minorSkinConditions: 'Minor skin conditions',
      prescriptionRefills: 'Prescription refills',
      routineConcerns: 'Routine concerns',
      minorEyeIrritation: 'Minor eye irritation',
      highestPriority: 'Highest Priority',
      highPriority: 'High Priority',
      mediumPriority: 'Medium Priority',
      lowPriority: 'Low Priority',
      lowestPriority: 'Lowest Priority',
      locationDenied: 'Location access denied. Showing all hospitals.',
      searchPlaceholder: 'Search hospitals by name or address...',
      refresh: 'Refresh',
      lastUpdated: 'Last updated:',
      milesAway: 'miles away',
      estimatedWait: 'Estimated wait:',
      minutes: 'minutes',
      updated: 'Updated:',
      noHospitalsFound: 'No hospitals found matching your search.',
      medicalCareGuide: 'Medical Care Guide',
      careGuideSubtitle: 'Quick reference for common medical situations and when to seek care',
      emergencyAlert: 'Life-threatening emergency?',
      emergencyAlertText: 'Call 911 immediately. Don\'t wait or drive yourself to the hospital.',
      emergencyBadge: 'Emergency - Call 911',
      urgentBadge: 'Urgent Care',
      selfCareBadge: 'Self Care',
      lowWait: 'Low:',
      moderateWait: 'Moderate:',
      highWait: 'High:',
      min: 'min',
      commonSymptoms: 'Common Symptoms:',
      recommendations: 'Recommendations:',
      importantNumbers: 'Important Numbers',
      emergency911: 'Emergency',
      poisonControl: 'Poison Control',
      disclaimer: 'This information is for reference only and should not replace professional medical judgment. Wait times are estimates and may vary. For life-threatening emergencies, call 911 immediately.',
      important: 'Important:',
      oneEmergencyDepartment: '1 emergency department',
      overview: 'Overview',
      detailed: 'Detailed',
      sortByWaitTime: 'Sort by Wait Time',
      status: 'Status',
      open: 'Open',
      harborShort: 'Harbor',
      harborUCLAMedicalCenter: 'Harbor-UCLA Medical Center Emergency Department',
      avgWaitTime: 'Avg Wait Time',
      currentCensus: 'Current Census',
      patients: 'patients',
      waitTimesByConditionSeverity: 'Wait Times by Condition Severity',
      serviciosEspecializadosDisponibles: 'Servicios Especializados Disponibles',
      centroDeTrauma: 'Centro de Trauma',
      atencionCardiaca: 'Atención Cardíaca',
      additionalInfoPanel: 'Additional information panel'
    },
    es: {
      title: 'ER Wait Times',
      waitTimes: 'Tiempos de Espera',
      careGuide: 'Guía de Atención',
      emergency: '911',
      language: 'Español',
      emergencyLabel: 'Emergencia:',
      emergencyDepartments: 'Departamentos de Emergencia',
      realTimeWaitTimes: 'Tiempos de espera en tiempo real por severidad de condición para 1 DE',
      live: 'En Vivo',
      timeAgo: 'hace 1m',
      refreshButton: 'Actualizar',
      emergencyDepartmentDemo: 'Demo del Departamento de Emergencias',
      demoDescription: 'Demo mostrando el departamento de emergencias de Harbor-UCLA Medical Center con tiempos de espera basados en acuidad.',
      demoTime: '8/4/2025, 1:30:10 PM',
      howSystemWorks: 'Cómo Funciona Nuestro Sistema de Tiempos de Espera',
      systemDescription: 'Cada instalación muestra tiempos de espera estimados para los 5 niveles de acuidad basados en la cola de pacientes actual, niveles de personal y eficiencia de la instalación. Las condiciones de alta acuidad (Nivel 1-2) se ven inmediatamente, mientras que las condiciones de menor acuidad pueden tener tiempos de espera más largos dependiendo de la capacidad de la instalación.',
      conditionSeverityLevels: 'Niveles de Severidad de Condiciones de Emergencia',
      acuityDescription: 'Entender los 5 niveles de acuidad te ayuda a saber qué esperar al visitar un departamento de emergencias.',
      level1Critical: 'Nivel 1 - Crítico',
      level2Urgent: 'Nivel 2 - Urgente',
      level3LessUrgent: 'Nivel 3 - Menos Urgente',
      level4NonUrgent: 'Nivel 4 - No Urgente',
      level5LowAcuity: 'Nivel 5 - Baja Acuidad',
      cardiacArrest: 'Paro cardíaco',
      severeBreathing: 'Dificultad respiratoria severa',
      majorTrauma: 'Trauma mayor',
      strokeSymptoms: 'Síntomas de derrame cerebral',
      chestPain: 'Dolor de pecho',
      severeAbdominal: 'Dolor abdominal severo',
      highFeverConfusion: 'Fiebre alta con confusión',
      moderateBleeding: 'Sangrado moderado',
      moderatePain: 'Dolor moderado',
      minorFractures: 'Fracturas menores',
      persistentFever: 'Fiebre persistente',
      vomitingDiarrhea: 'Vómitos/diarrea',
      minorCuts: 'Cortes menores',
      mildHeadache: 'Dolor de cabeza leve',
      coldFluSymptoms: 'Síntomas de resfriado/gripe',
      minorSprains: 'Esguinces menores',
      minorSkinConditions: 'Condiciones de piel menores',
      prescriptionRefills: 'Reposición de recetas',
      routineConcerns: 'Preocupaciones rutinarias',
      minorEyeIrritation: 'Irritación de ojos menor',
      highestPriority: 'Prioridad Más Alta',
      highPriority: 'Alta Prioridad',
      mediumPriority: 'Prioridad Media',
      lowPriority: 'Baja Prioridad',
      lowestPriority: 'Prioridad Más Baja',
      locationDenied: 'Acceso a ubicación denegado. Mostrando todos los hospitales.',
      searchPlaceholder: 'Buscar hospitales por nombre o dirección...',
      refresh: 'Actualizar',
      lastUpdated: 'Última actualización:',
      milesAway: 'millas de distancia',
      estimatedWait: 'Tiempo estimado de espera:',
      minutes: 'minutos',
      updated: 'Actualizado:',
      noHospitalsFound: 'No se encontraron hospitales que coincidan con su búsqueda.',
      medicalCareGuide: 'Guía de Atención Médica',
      careGuideSubtitle: 'Referencia rápida para situaciones médicas comunes y cuándo buscar atención',
      emergencyAlert: '¿Emergencia que amenaza la vida?',
      emergencyAlertText: 'Llame al 911 inmediatamente. No espere ni conduzca usted mismo al hospital.',
      emergencyBadge: 'Emergencia - Llame al 911',
      urgentBadge: 'Atención Urgente',
      selfCareBadge: 'Autocuidado',
      lowWait: 'Bajo:',
      moderateWait: 'Moderado:',
      highWait: 'Alto:',
      min: 'min',
      commonSymptoms: 'Síntomas Comunes:',
      recommendations: 'Recomendaciones:',
      importantNumbers: 'Números Importantes',
      emergency911: 'Emergencia',
      poisonControl: 'Control de Envenenamiento',
      disclaimer: 'Esta información es solo para referencia y no debe reemplazar el juicio médico profesional. Los tiempos de espera son estimados y pueden variar. Para emergencias que amenazan la vida, llame al 911 inmediatamente.',
      important: 'Importante:',
      oneEmergencyDepartment: '1 departamento de emergencia',
      overview: 'Vista General',
      detailed: 'Detallado',
      sortByWaitTime: 'Ordenar por Tiempo de Espera',
      status: 'Estado',
      open: 'Abierto',
      harborShort: 'Harbor',
      harborUCLAMedicalCenter: 'Departamento de Emergencias Harbor-UCLA Medical Center',
      avgWaitTime: 'Tiempo Promedio de Espera',
      currentCensus: 'Censo Actual',
      patients: 'pacientes',
      waitTimesByConditionSeverity: 'Tiempos de Espera por Severidad de Condición',
      serviciosEspecializadosDisponibles: 'Servicios Especializados Disponibles',
      centroDeTrauma: 'Centro de Trauma',
      atencionCardiaca: 'Atención Cardíaca',
      additionalInfoPanel: 'Panel de información adicional'
    }
  }

  // Care guide data
  const careGuideItems: CareGuideItem[] = [
    {
      id: '1',
      title: 'Chest Pain',
      description: 'Experiencing chest pain or pressure that could indicate a heart attack',
      urgency: 'emergency',
      symptoms: ['Severe chest pain', 'Pain radiating to arm/jaw', 'Shortness of breath', 'Nausea', 'Sweating'],
      recommendations: ['Call 911 immediately', 'Chew aspirin if not allergic', 'Stay calm and rest'],
      icon: <Heart className="h-6 w-6" />
    },
    {
      id: '2',
      title: 'High Fever',
      description: 'Fever over 103°F (39.4°C) or fever with severe symptoms',
      urgency: 'urgent',
      symptoms: ['Temperature over 103°F', 'Severe headache', 'Difficulty breathing', 'Persistent vomiting'],
      recommendations: ['Seek medical care within 2-4 hours', 'Stay hydrated', 'Take fever reducer as directed'],
      icon: <Thermometer className="h-6 w-6" />
    },
    {
      id: '3',
      title: 'Minor Cuts & Bruises',
      description: 'Small wounds that can typically be treated at home',
      urgency: 'non-urgent',
      symptoms: ['Small cuts', 'Minor bruising', 'Scrapes', 'Light bleeding'],
      recommendations: ['Clean wound thoroughly', 'Apply pressure to stop bleeding', 'Use bandage', 'Monitor for infection'],
      icon: <FirstAid className="h-6 w-6" />
    },
    {
      id: '4',
      title: 'Eye Injury',
      description: 'Any injury to the eye that affects vision or causes pain',
      urgency: 'urgent',
      symptoms: ['Vision changes', 'Eye pain', 'Foreign object in eye', 'Chemical exposure'],
      recommendations: ['Do not rub eye', 'Flush with clean water if chemical exposure', 'Seek immediate medical care'],
      icon: <Eye className="h-6 w-6" />
    },
    {
      id: '5',
      title: 'Medication Overdose',
      description: 'Suspected overdose of prescription or over-the-counter medication',
      urgency: 'emergency',
      symptoms: ['Difficulty breathing', 'Unconsciousness', 'Severe confusion', 'Irregular heartbeat'],
      recommendations: ['Call 911 or Poison Control: 1-800-222-1222', 'Bring medication container', 'Do not induce vomiting'],
      icon: <Pill className="h-6 w-6" />
    }
  ]

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'emergency':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{t[language].emergencyBadge}</Badge>
      case 'urgent':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{t[language].urgentBadge}</Badge>
      case 'non-urgent':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{t[language].selfCareBadge}</Badge>
      default:
        return null
    }
  }

  useEffect(() => {
    // Try to get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setLocationError('')
        },
        (error) => {
          setLocationError('Location access denied. Showing all hospitals.')
        }
      )
    }
  }, [])

  useEffect(() => {
    // Initialize with sample data if empty
    if (hospitals.length === 0) {
      refreshData()
    }
  }, [hospitals.length])

  const refreshData = async () => {
    setIsLoading(true)
    
    // Simulate API call with sample data
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const sampleHospitals: Hospital[] = [
      {
        id: '1',
        name: 'Harbor-UCLA Medical Center Emergency Department',
        address: '1000 W Carson St, Torrance, CA 90509',
        waitTime: 42,
        lastUpdated: new Date().toISOString(),
        specialties: ['Emergency', 'Trauma', 'Cardiac', 'Stroke', 'Pediatric'],
        phone: '(310) 222-2345'
      }
    ]

    // Add simulated distances if user location is available
    const hospitalsWithDistance = sampleHospitals.map(hospital => ({
      ...hospital,
      distance: userLocation ? Math.random() * 20 + 1 : undefined
    }))

    setHospitals(hospitalsWithDistance)
    setLastRefresh(new Date())
    setIsLoading(false)
  }

  const getWaitTimeBadge = (waitTime: number) => {
    if (waitTime <= 20) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{t[language].lowWait} {waitTime} {t[language].min}</Badge>
    } else if (waitTime <= 45) {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{t[language].moderateWait} {waitTime} {t[language].min}</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{t[language].highWait} {waitTime} {t[language].min}</Badge>
    }
  }

  const sortedHospitals = hospitals.sort((a, b) => {
    if (sortBy === 'wait-time') {
      return a.waitTime - b.waitTime
    }
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <Plus className="h-6 w-6" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                {t[language].title}
              </h1>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-4">
              {/* Language Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
                className="flex items-center gap-2 bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
              >
                <Globe className="h-4 w-4" />
                {language === 'en' ? 'English' : 'Español'}
              </Button>

              {/* Emergency Button */}
              <span className="text-gray-600 text-sm">{t[language].emergencyLabel}</span>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-4"
              >
                📞 911
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-transparent h-auto p-0 gap-6">
                <TabsTrigger 
                  value="wait-times" 
                  className="flex items-center gap-2 bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none pb-2 font-medium"
                >
                  <Clock className="h-4 w-4" />
                  {t[language].waitTimes}
                </TabsTrigger>
                <TabsTrigger 
                  value="care-guide" 
                  className="flex items-center gap-2 bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none pb-2 font-medium"
                >
                  <FirstAid className="h-4 w-4" />
                  {t[language].careGuide}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

          {/* Wait Times Tab */}
          <TabsContent value="wait-times" className="space-y-6">
            {/* Emergency Departments Header Section */}
            <div className="space-y-6">
              {/* Title and Status Row */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{t[language].emergencyDepartments}</h2>
                  <p className="text-gray-600">{t[language].realTimeWaitTimes}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">{t[language].live}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{t[language].timeAgo}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshData}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    {t[language].refreshButton}
                  </Button>
                </div>
              </div>

              {/* How Our Wait Time System Works */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">{t[language].howSystemWorks}</h3>
                    <p className="text-blue-800 text-sm leading-relaxed">{t[language].systemDescription}</p>
                  </div>
                </div>
              </div>

              {/* Emergency Condition Severity Levels */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t[language].conditionSeverityLevels}</h3>
                  <p className="text-gray-600">{t[language].acuityDescription}</p>
                </div>

                {/* Acuity Level Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Level 1 - Critical */}
                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                        <h4 className="font-semibold text-red-900">{t[language].level1Critical}</h4>
                      </div>
                      <ul className="space-y-1 text-sm text-red-800 mb-3">
                        <li>• {t[language].cardiacArrest}</li>
                        <li>• {t[language].severeBreathing}</li>
                        <li>• {t[language].majorTrauma}</li>
                        <li>• {t[language].strokeSymptoms}</li>
                      </ul>
                      <div className="text-xs font-medium text-red-900">{t[language].highestPriority}</div>
                    </CardContent>
                  </Card>

                  {/* Level 2 - Urgent */}
                  <Card className="bg-orange-50 border-orange-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                        <h4 className="font-semibold text-orange-900">{t[language].level2Urgent}</h4>
                      </div>
                      <ul className="space-y-1 text-sm text-orange-800 mb-3">
                        <li>• {t[language].chestPain}</li>
                        <li>• {t[language].severeAbdominal}</li>
                        <li>• {t[language].highFeverConfusion}</li>
                        <li>• {t[language].moderateBleeding}</li>
                      </ul>
                      <div className="text-xs font-medium text-orange-900">{t[language].highPriority}</div>
                    </CardContent>
                  </Card>

                  {/* Level 3 - Less Urgent */}
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                        <h4 className="font-semibold text-yellow-900">{t[language].level3LessUrgent}</h4>
                      </div>
                      <ul className="space-y-1 text-sm text-yellow-800 mb-3">
                        <li>• {t[language].moderatePain}</li>
                        <li>• {t[language].minorFractures}</li>
                        <li>• {t[language].persistentFever}</li>
                        <li>• {t[language].vomitingDiarrhea}</li>
                      </ul>
                      <div className="text-xs font-medium text-yellow-900">{t[language].mediumPriority}</div>
                    </CardContent>
                  </Card>

                  {/* Level 4 - Non-Urgent */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                        <h4 className="font-semibold text-blue-900">{t[language].level4NonUrgent}</h4>
                      </div>
                      <ul className="space-y-1 text-sm text-blue-800 mb-3">
                        <li>• {t[language].minorCuts}</li>
                        <li>• {t[language].mildHeadache}</li>
                        <li>• {t[language].coldFluSymptoms}</li>
                        <li>• {t[language].minorSprains}</li>
                      </ul>
                      <div className="text-xs font-medium text-blue-900">{t[language].lowPriority}</div>
                    </CardContent>
                  </Card>

                  {/* Level 5 - Low Acuity */}
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <h4 className="font-semibold text-green-900">{t[language].level5LowAcuity}</h4>
                      </div>
                      <ul className="space-y-1 text-sm text-green-800 mb-3">
                        <li>• {t[language].minorSkinConditions}</li>
                        <li>• {t[language].prescriptionRefills}</li>
                        <li>• {t[language].routineConcerns}</li>
                        <li>• {t[language].minorEyeIrritation}</li>
                      </ul>
                      <div className="text-xs font-medium text-green-900">{t[language].lowestPriority}</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              {/* Overview/Detailed Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'overview' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('overview')}
                  className={viewMode === 'overview' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  {t[language].overview}
                </Button>
                <Button
                  variant={viewMode === 'detailed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('detailed')}
                  className={viewMode === 'detailed' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  {t[language].detailed}
                </Button>
              </div>

              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t[language].sortByWaitTime} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wait-time">{t[language].sortByWaitTime}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Harbor-UCLA Medical Center Card */}
            {viewMode === 'overview' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left side - Hospital Card */}
                <div>
                  {sortedHospitals.map((hospital) => (
                    <Card key={hospital.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        {/* Hospital Header */}
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-start gap-4">
                            {/* Harbor Logo */}
                            <div className="bg-red-600 text-white px-3 py-2 rounded font-bold text-sm">
                              {t[language].harborShort}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <div>
                                <h3 className="font-semibold text-gray-900 mb-1">
                                  {t[language].harborUCLAMedicalCenter}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <MapPin className="h-3 w-3" />
                                  <span>18.4 {language === 'en' ? 'miles' : 'millas'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600 mb-1">{t[language].status}</div>
                            <div className="font-semibold text-green-600">{t[language].open}</div>
                          </div>
                        </div>

                        {/* Stats Row */}
                        <div className="flex gap-8 mb-6">
                          <div className="text-center">
                            <div className="text-sm text-gray-600 mb-1">{t[language].avgWaitTime}</div>
                            <div className="text-3xl font-bold text-orange-500">42</div>
                            <div className="text-sm text-gray-600">{t[language].minutes}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-600 mb-1">{t[language].currentCensus}</div>
                            <div className="text-3xl font-bold text-gray-700">46</div>
                            <div className="text-sm text-gray-600">{t[language].patients}</div>
                          </div>
                        </div>

                        {/* Wait Times by Condition Severity */}
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-900 mb-4">{t[language].waitTimesByConditionSeverity}</h4>
                          <div className="flex gap-4">
                            {/* L1 */}
                            <div className="text-center flex-1">
                              <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-2"></div>
                              <div className="text-xs font-medium text-gray-600 mb-1">L1</div>
                              <div className="text-xs text-gray-500 mb-1">Q: 3</div>
                              <div className="text-sm font-bold text-green-600">&lt;15m</div>
                            </div>
                            {/* L2 */}
                            <div className="text-center flex-1">
                              <div className="w-3 h-3 bg-orange-500 rounded-full mx-auto mb-2"></div>
                              <div className="text-xs font-medium text-gray-600 mb-1">L2</div>
                              <div className="text-xs text-gray-500 mb-1">Q: 7</div>
                              <div className="text-sm font-bold text-green-600">&lt;15m</div>
                            </div>
                            {/* L3 */}
                            <div className="text-center flex-1">
                              <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-2"></div>
                              <div className="text-xs font-medium text-gray-600 mb-1">L3</div>
                              <div className="text-xs text-gray-500 mb-1">Q: 19</div>
                              <div className="text-sm font-bold text-orange-600">693m</div>
                            </div>
                            {/* L4 */}
                            <div className="text-center flex-1">
                              <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-2"></div>
                              <div className="text-xs font-medium text-gray-600 mb-1">L4</div>
                              <div className="text-xs text-gray-500 mb-1">Q: 13</div>
                              <div className="text-sm font-bold text-red-600">1020m</div>
                            </div>
                            {/* L5 */}
                            <div className="text-center flex-1">
                              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                              <div className="text-xs font-medium text-gray-600 mb-1">L5</div>
                              <div className="text-xs text-gray-500 mb-1">Q: 3</div>
                              <div className="text-sm font-bold text-red-600">943m</div>
                            </div>
                          </div>
                        </div>

                        {/* Specialized Services */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">{t[language].serviciosEspecializadosDisponibles}</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                  <Plus className="h-4 w-4 text-red-600" />
                                </div>
                                <span className="font-medium text-red-900">{t[language].centroDeTrauma}</span>
                              </div>
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg border border-pink-200">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                                  <Heart className="h-4 w-4 text-pink-600" />
                                </div>
                                <span className="font-medium text-pink-900">{t[language].atencionCardiaca}</span>
                              </div>
                              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {/* Right side - QR Code and Information */}
                <div className="bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center space-y-6">
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 text-center">
                    {language === 'en' ? 'Harbor QR Code' : 'Código QR de Harbor'}
                  </h3>
                  
                  {/* QR Code */}
                  <a 
                    href="https://youtu.be/86z2k4zEOlw" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <img 
                      src={qrCodeImage} 
                      alt="QR Code for ED visit information" 
                      width="120" 
                      height="120" 
                      className="block"
                    />
                  </a>
                  
                  {/* Descriptive text */}
                  <p className="text-sm text-gray-600 text-center max-w-56 leading-relaxed">
                    {language === 'en' 
                      ? 'Scan this QR code for quick access to Harbor facility information'
                      : 'Escanee este código QR para acceso rápido a la información de la instalación Harbor'
                    }
                  </p>
                </div>
              </div>
            ) : (
              /* Detailed view - Full width */
              sortedHospitals.map((hospital) => (
                <Card key={hospital.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    {/* Hospital Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start gap-4">
                        {/* Harbor Logo */}
                        <div className="bg-red-600 text-white px-3 py-2 rounded font-bold text-sm">
                          {t[language].harborShort}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {t[language].harborUCLAMedicalCenter}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="h-3 w-3" />
                              <span>18.4 {language === 'en' ? 'miles' : 'millas'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 mb-1">{t[language].status}</div>
                        <div className="font-semibold text-green-600">{t[language].open}</div>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex gap-8 mb-6">
                      <div className="text-center">
                        <div className="text-sm text-gray-600 mb-1">{t[language].avgWaitTime}</div>
                        <div className="text-3xl font-bold text-orange-500">42</div>
                        <div className="text-sm text-gray-600">{t[language].minutes}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600 mb-1">{t[language].currentCensus}</div>
                        <div className="text-3xl font-bold text-gray-700">46</div>
                        <div className="text-sm text-gray-600">{t[language].patients}</div>
                      </div>
                    </div>

                    {/* Wait Times by Condition Severity */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-4">{t[language].waitTimesByConditionSeverity}</h4>
                      <div className="flex gap-4">
                        {/* L1 */}
                        <div className="text-center flex-1">
                          <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-2"></div>
                          <div className="text-xs font-medium text-gray-600 mb-1">L1</div>
                          <div className="text-xs text-gray-500 mb-1">Q: 3</div>
                          <div className="text-sm font-bold text-green-600">&lt;15m</div>
                        </div>
                        {/* L2 */}
                        <div className="text-center flex-1">
                          <div className="w-3 h-3 bg-orange-500 rounded-full mx-auto mb-2"></div>
                          <div className="text-xs font-medium text-gray-600 mb-1">L2</div>
                          <div className="text-xs text-gray-500 mb-1">Q: 7</div>
                          <div className="text-sm font-bold text-green-600">&lt;15m</div>
                        </div>
                        {/* L3 */}
                        <div className="text-center flex-1">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-2"></div>
                          <div className="text-xs font-medium text-gray-600 mb-1">L3</div>
                          <div className="text-xs text-gray-500 mb-1">Q: 19</div>
                          <div className="text-sm font-bold text-orange-600">693m</div>
                        </div>
                        {/* L4 */}
                        <div className="text-center flex-1">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-2"></div>
                          <div className="text-xs font-medium text-gray-600 mb-1">L4</div>
                          <div className="text-xs text-gray-500 mb-1">Q: 13</div>
                          <div className="text-sm font-bold text-red-600">1020m</div>
                        </div>
                        {/* L5 */}
                        <div className="text-center flex-1">
                          <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                          <div className="text-xs font-medium text-gray-600 mb-1">L5</div>
                          <div className="text-xs text-gray-500 mb-1">Q: 3</div>
                          <div className="text-sm font-bold text-red-600">943m</div>
                        </div>
                      </div>
                    </div>

                    {/* Specialized Services */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">{t[language].serviciosEspecializadosDisponibles}</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                              <Plus className="h-4 w-4 text-red-600" />
                            </div>
                            <span className="font-medium text-red-900">{t[language].centroDeTrauma}</span>
                          </div>
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg border border-pink-200">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                              <Heart className="h-4 w-4 text-pink-600" />
                            </div>
                            <span className="font-medium text-pink-900">{t[language].atencionCardiaca}</span>
                          </div>
                          <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {sortedHospitals.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t[language].noHospitalsFound}</p>
              </div>
            )}
          </TabsContent>

          {/* Care Guide Tab */}
          <TabsContent value="care-guide" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold mb-2">{t[language].medicalCareGuide}</h2>
              <p className="text-muted-foreground">
                {t[language].careGuideSubtitle}
              </p>
            </div>

            {/* Emergency Call-to-Action */}
            <Alert className="border-red-200 bg-red-50">
              <Phone className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>{t[language].emergencyAlert}</strong> {t[language].emergencyAlertText}
              </AlertDescription>
            </Alert>

            {/* Care Guide Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {careGuideItems.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          item.urgency === 'emergency' ? 'bg-red-100 text-red-600' :
                          item.urgency === 'urgent' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {item.icon}
                        </div>
                        <span className="text-lg">{item.title}</span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    
                    {getUrgencyBadge(item.urgency)}

                    <div>
                      <h4 className="font-medium text-sm mb-2">{t[language].commonSymptoms}</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {item.symptoms.map((symptom, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                            {symptom}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm mb-2">{t[language].recommendations}</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {item.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Additional Resources */}
            <Card className="bg-muted">
              <CardHeader>
                <CardTitle className="text-lg">{t[language].importantNumbers}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-red-600" />
                  <div>
                    <div className="font-medium">{t[language].emergency911}</div>
                    <div className="text-lg font-bold text-red-600">911</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">{t[language].poisonControl}</div>
                    <div className="text-lg font-bold text-blue-600">1-800-222-1222</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Disclaimer */}
      <div className="container mx-auto px-4">
        <div className="mt-12 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            <strong>{t[language].important}</strong> {t[language].disclaimer}
          </p>
        </div>
      </div>
    </div>
  )
}

export default App