import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Clock, RefreshCw, AlertTriangle, Heart, FirstAid, Phone, Thermometer, Pill, Eye, Plus, Globe, Info, X, Building, CaretDown, CaretUp } from '@phosphor-icons/react'
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
  const [facilityInfoExpanded, setFacilityInfoExpanded] = useState(true)

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
      additionalInfoPanel: 'Panel de información adicional',
      facilityInformation: 'Información de la Instalación',
      level1TraumaCenter: 'Centro de Trauma Nivel 1',
      traumaCenterDescription: 'Centro de trauma mayor Nivel 1 sirviendo el área de South Bay y Harbor con servicios de emergencia integrales.',
      contactInformation: 'Información de Contacto',
      operatingHours: 'Horarios de Operación',
      open24_7: 'Abierto 24/7 para Atención de Emergencia',
      mainLine: 'Línea Principal',
      officialWebsite: 'Sitio Web Oficial',
      nedocs: 'NEDOCS',
      severelyOvercrowded: 'Severamente saturado',
      facilityInformation: 'Facility Information',
      level1TraumaCenter: 'Level 1 Trauma Center',
      traumaCenterDescription: 'Major Level 1 trauma center serving South Bay and Harbor area with comprehensive emergency services.',
      contactInformation: 'Contact Information',
      operatingHours: 'Operating Hours',
      open24_7: 'Open 24/7 for Emergency Care',
      mainLine: 'Main Line',
      officialWebsite: 'Official Website',
      nedocs: 'NEDOCS',
      severelyOvercrowded: 'Severely overcrowded'
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
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t[language].conditionSeverityLevels}</h3>
                  <p className="text-gray-600">{t[language].acuityDescription}</p>
                </div>

                {/* Acuity Level Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Level 1 - Critical */}
                  <Card className="bg-red-50 border-red-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">1</span>
                        </div>
                        <h4 className="font-bold text-red-900 text-sm">{t[language].level1Critical}</h4>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-xs text-red-700 mb-3 leading-relaxed">
                          {language === 'en' 
                            ? 'Life-threatening conditions requiring immediate medical intervention'
                            : 'Condiciones que amenazan la vida que requieren intervención médica inmediata'
                          }
                        </p>
                      </div>

                      <div className="mb-4">
                        <h5 className="text-xs font-semibold text-red-900 mb-2">
                          {language === 'en' ? 'Common Examples:' : 'Ejemplos Comunes:'}
                        </h5>
                        <ul className="space-y-1 text-xs text-red-800">
                          <li>• {t[language].cardiacArrest}</li>
                          <li>• {t[language].severeBreathing}</li>
                          <li>• {t[language].majorTrauma}</li>
                          <li>• {t[language].strokeSymptoms}</li>
                        </ul>
                      </div>

                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-red-900 mb-2">
                          {language === 'en' ? 'What to Expect:' : 'Qué Esperar:'}
                        </h5>
                        <ul className="space-y-1 text-xs text-red-700">
                          <li>• {language === 'en' ? 'Seen immediately' : 'Atendido inmediatamente'}</li>
                          <li>• {language === 'en' ? 'Multiple medical staff' : 'Múltiple personal médico'}</li>
                          <li>• {language === 'en' ? 'May require surgery' : 'Puede requerir cirugía'}</li>
                        </ul>
                      </div>

                      <div className="bg-red-600 text-white text-center py-2 px-3 rounded-lg">
                        <div className="text-xs font-black tracking-wide">{t[language].highestPriority}</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Level 2 - Urgent */}
                  <Card className="bg-orange-50 border-orange-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">2</span>
                        </div>
                        <h4 className="font-bold text-orange-900 text-sm">{t[language].level2Urgent}</h4>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-xs text-orange-700 mb-3 leading-relaxed">
                          {language === 'en' 
                            ? 'Serious conditions that need prompt medical attention'
                            : 'Condiciones serias que necesitan atención médica pronta'
                          }
                        </p>
                      </div>

                      <div className="mb-4">
                        <h5 className="text-xs font-semibold text-orange-900 mb-2">
                          {language === 'en' ? 'Common Examples:' : 'Ejemplos Comunes:'}
                        </h5>
                        <ul className="space-y-1 text-xs text-orange-800">
                          <li>• {t[language].chestPain}</li>
                          <li>• {t[language].severeAbdominal}</li>
                          <li>• {t[language].highFeverConfusion}</li>
                          <li>• {t[language].moderateBleeding}</li>
                        </ul>
                      </div>

                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-orange-900 mb-2">
                          {language === 'en' ? 'What to Expect:' : 'Qué Esperar:'}
                        </h5>
                        <ul className="space-y-1 text-xs text-orange-700">
                          <li>• {language === 'en' ? 'Seen within 15 minutes' : 'Atendido en 15 minutos'}</li>
                          <li>• {language === 'en' ? 'Urgent diagnostic tests' : 'Pruebas diagnósticas urgentes'}</li>
                          <li>• {language === 'en' ? 'Possible admission' : 'Posible admisión'}</li>
                        </ul>
                      </div>

                      <div className="bg-orange-600 text-white text-center py-2 px-3 rounded-lg">
                        <div className="text-xs font-black tracking-wide">{t[language].highPriority}</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Level 3 - Less Urgent */}
                  <Card className="bg-yellow-50 border-yellow-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">3</span>
                        </div>
                        <h4 className="font-bold text-yellow-900 text-sm">{t[language].level3LessUrgent}</h4>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-xs text-yellow-700 mb-3 leading-relaxed">
                          {language === 'en' 
                            ? 'Conditions that require medical care but can wait if needed'
                            : 'Condiciones que requieren atención médica pero pueden esperar si es necesario'
                          }
                        </p>
                      </div>

                      <div className="mb-4">
                        <h5 className="text-xs font-semibold text-yellow-900 mb-2">
                          {language === 'en' ? 'Common Examples:' : 'Ejemplos Comunes:'}
                        </h5>
                        <ul className="space-y-1 text-xs text-yellow-800">
                          <li>• {t[language].moderatePain}</li>
                          <li>• {t[language].minorFractures}</li>
                          <li>• {t[language].persistentFever}</li>
                          <li>• {t[language].vomitingDiarrhea}</li>
                        </ul>
                      </div>

                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-yellow-900 mb-2">
                          {language === 'en' ? 'What to Expect:' : 'Qué Esperar:'}
                        </h5>
                        <ul className="space-y-1 text-xs text-yellow-700">
                          <li>• {language === 'en' ? 'Wait time varies' : 'Tiempo de espera varía'}</li>
                          <li>• {language === 'en' ? 'Standard evaluation' : 'Evaluación estándar'}</li>
                          <li>• {language === 'en' ? 'Treatment plan provided' : 'Plan de tratamiento provisto'}</li>
                        </ul>
                      </div>

                      <div className="bg-yellow-600 text-white text-center py-2 px-3 rounded-lg">
                        <div className="text-xs font-black tracking-wide">{t[language].mediumPriority}</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Level 4 - Non-Urgent */}
                  <Card className="bg-blue-50 border-blue-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">4</span>
                        </div>
                        <h4 className="font-bold text-blue-900 text-sm">{t[language].level4NonUrgent}</h4>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-xs text-blue-700 mb-3 leading-relaxed">
                          {language === 'en' 
                            ? 'Minor conditions that should be treated but are not urgent'
                            : 'Condiciones menores que deben tratarse pero no son urgentes'
                          }
                        </p>
                      </div>

                      <div className="mb-4">
                        <h5 className="text-xs font-semibold text-blue-900 mb-2">
                          {language === 'en' ? 'Common Examples:' : 'Ejemplos Comunes:'}
                        </h5>
                        <ul className="space-y-1 text-xs text-blue-800">
                          <li>• {t[language].minorCuts}</li>
                          <li>• {t[language].mildHeadache}</li>
                          <li>• {t[language].coldFluSymptoms}</li>
                          <li>• {t[language].minorSprains}</li>
                        </ul>
                      </div>

                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-blue-900 mb-2">
                          {language === 'en' ? 'What to Expect:' : 'Qué Esperar:'}
                        </h5>
                        <ul className="space-y-1 text-xs text-blue-700">
                          <li>• {language === 'en' ? 'Longer wait times' : 'Tiempos de espera más largos'}</li>
                          <li>• {language === 'en' ? 'Basic examination' : 'Examen básico'}</li>
                          <li>• {language === 'en' ? 'Consider urgent care' : 'Considerar atención urgente'}</li>
                        </ul>
                      </div>

                      <div className="bg-blue-600 text-white text-center py-2 px-3 rounded-lg">
                        <div className="text-xs font-black tracking-wide">{t[language].lowPriority}</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Level 5 - Low Acuity */}
                  <Card className="bg-green-50 border-green-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">5</span>
                        </div>
                        <h4 className="font-bold text-green-900 text-sm">{t[language].level5LowAcuity}</h4>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-xs text-green-700 mb-3 leading-relaxed">
                          {language === 'en' 
                            ? 'Minor issues that could be addressed elsewhere'
                            : 'Problemas menores que podrían ser atendidos en otro lugar'
                          }
                        </p>
                      </div>

                      <div className="mb-4">
                        <h5 className="text-xs font-semibold text-green-900 mb-2">
                          {language === 'en' ? 'Common Examples:' : 'Ejemplos Comunes:'}
                        </h5>
                        <ul className="space-y-1 text-xs text-green-800">
                          <li>• {t[language].minorSkinConditions}</li>
                          <li>• {t[language].prescriptionRefills}</li>
                          <li>• {t[language].routineConcerns}</li>
                          <li>• {t[language].minorEyeIrritation}</li>
                        </ul>
                      </div>

                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-green-900 mb-2">
                          {language === 'en' ? 'What to Expect:' : 'Qué Esperar:'}
                        </h5>
                        <ul className="space-y-1 text-xs text-green-700">
                          <li>• {language === 'en' ? 'Longest wait times' : 'Tiempos de espera más largos'}</li>
                          <li>• {language === 'en' ? 'Simple treatment' : 'Tratamiento simple'}</li>
                          <li>• {language === 'en' ? 'Try clinic first' : 'Pruebe clínica primero'}</li>
                        </ul>
                      </div>

                      <div className="bg-green-600 text-white text-center py-2 px-3 rounded-lg">
                        <div className="text-xs font-black tracking-wide">{t[language].lowestPriority}</div>
                      </div>
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
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-gray-600 text-sm">Census = 46</span>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {t[language].harborUCLAMedicalCenter}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-3 w-3" />
                            <span>18.4 {language === 'en' ? 'miles' : 'millas'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="font-semibold text-green-600">{t[language].open}</span>
                        </div>
                        <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded text-sm font-medium">
                          {t[language].nedocs} 165 ({t[language].severelyOvercrowded})
                        </div>
                      </div>
                    </div>

                    {/* Facility Information Section */}
                    <div className="mb-6">
                      <button 
                        onClick={() => setFacilityInfoExpanded(!facilityInfoExpanded)}
                        className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Building className="h-5 w-5 text-blue-600" />
                          <span className="font-semibold text-gray-900">{t[language].facilityInformation}</span>
                        </div>
                        {facilityInfoExpanded ? <CaretUp className="h-4 w-4" /> : <CaretDown className="h-4 w-4" />}
                      </button>
                      
                      {facilityInfoExpanded && (
                        <div className="mt-4 p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Plus className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-blue-900 mb-1">{t[language].level1TraumaCenter}</h4>
                              <p className="text-sm text-gray-600">{t[language].traumaCenterDescription}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Two Column Layout for Contact and Operating Hours */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Contact Information */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">{t[language].contactInformation}</h4>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <MapPin className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-gray-900">1000 W Carson St, Torrance, CA 90509</div>
                              <div className="text-sm text-gray-600">Torrance, CA 90509</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Phone className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                            <div>
                              <div className="font-medium text-gray-900">(310) 222-2345</div>
                              <div className="text-sm text-gray-600">{t[language].mainLine}</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <Globe className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                            <div>
                              <a 
                                href="https://dhs.lacounty.gov/harbor-ucla-medical-center/" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="font-medium text-blue-600 hover:text-blue-800"
                              >
                                dhs.lacounty.gov/harbor-ucla-medical-center/
                              </a>
                              <div className="text-sm text-gray-600">{t[language].officialWebsite}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Operating Hours */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">{t[language].operatingHours}</h4>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="font-medium text-green-900">{t[language].open24_7}</span>
                          </div>
                        </div>
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

                    {/* Wait Times by Condition Severity - Detailed */}
                    <div className="mb-8">
                      <h4 className="text-xl font-bold text-gray-900 mb-6">{t[language].waitTimesByConditionSeverity}</h4>
                      <div className="space-y-4">
                        {/* Level 1 - Critical */}
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">1</span>
                              </div>
                              <div>
                                <h5 className="font-bold text-red-900">{t[language].level1Critical}</h5>
                                <p className="text-sm text-red-700">
                                  {language === 'en' 
                                    ? 'Life-threatening emergencies requiring immediate intervention'
                                    : 'Emergencias que amenazan la vida que requieren intervención inmediata'
                                  }
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-600">&lt;15m</div>
                              <div className="text-sm text-gray-600">
                                {language === 'en' ? 'Queue: 3 patients' : 'Cola: 3 pacientes'}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <h6 className="font-semibold text-red-900 mb-2">
                                {language === 'en' ? 'Examples:' : 'Ejemplos:'}
                              </h6>
                              <ul className="space-y-1 text-red-800">
                                <li>• {t[language].cardiacArrest}</li>
                                <li>• {t[language].severeBreathing}</li>
                                <li>• {t[language].majorTrauma}</li>
                              </ul>
                            </div>
                            <div>
                              <h6 className="font-semibold text-red-900 mb-2">
                                {language === 'en' ? 'Process:' : 'Proceso:'}
                              </h6>
                              <ul className="space-y-1 text-red-800">
                                <li>• {language === 'en' ? 'Immediate triage bypass' : 'Omisión inmediata de triaje'}</li>
                                <li>• {language === 'en' ? 'Resuscitation team activated' : 'Equipo de resucitación activado'}</li>
                                <li>• {language === 'en' ? 'Multiple specialists available' : 'Múltiples especialistas disponibles'}</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Level 2 - Urgent */}
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">2</span>
                              </div>
                              <div>
                                <h5 className="font-bold text-orange-900">{t[language].level2Urgent}</h5>
                                <p className="text-sm text-orange-700">
                                  {language === 'en' 
                                    ? 'High-priority conditions requiring rapid assessment'
                                    : 'Condiciones de alta prioridad que requieren evaluación rápida'
                                  }
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-600">&lt;15m</div>
                              <div className="text-sm text-gray-600">
                                {language === 'en' ? 'Queue: 7 patients' : 'Cola: 7 pacientes'}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <h6 className="font-semibold text-orange-900 mb-2">
                                {language === 'en' ? 'Examples:' : 'Ejemplos:'}
                              </h6>
                              <ul className="space-y-1 text-orange-800">
                                <li>• {t[language].chestPain}</li>
                                <li>• {t[language].severeAbdominal}</li>
                                <li>• {t[language].highFeverConfusion}</li>
                              </ul>
                            </div>
                            <div>
                              <h6 className="font-semibold text-orange-900 mb-2">
                                {language === 'en' ? 'Process:' : 'Proceso:'}
                              </h6>
                              <ul className="space-y-1 text-orange-800">
                                <li>• {language === 'en' ? 'Fast-track assessment' : 'Evaluación de vía rápida'}</li>
                                <li>• {language === 'en' ? 'Priority diagnostic testing' : 'Pruebas diagnósticas prioritarias'}</li>
                                <li>• {language === 'en' ? 'Specialist consultation available' : 'Consulta especializada disponible'}</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Level 3 - Less Urgent */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">3</span>
                              </div>
                              <div>
                                <h5 className="font-bold text-yellow-900">{t[language].level3LessUrgent}</h5>
                                <p className="text-sm text-yellow-700">
                                  {language === 'en' 
                                    ? 'Stable conditions requiring medical evaluation within hours'
                                    : 'Condiciones estables que requieren evaluación médica en horas'
                                  }
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-orange-600">693m</div>
                              <div className="text-sm text-gray-600">
                                {language === 'en' ? 'Queue: 19 patients' : 'Cola: 19 pacientes'}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <h6 className="font-semibold text-yellow-900 mb-2">
                                {language === 'en' ? 'Examples:' : 'Ejemplos:'}
                              </h6>
                              <ul className="space-y-1 text-yellow-800">
                                <li>• {t[language].moderatePain}</li>
                                <li>• {t[language].minorFractures}</li>
                                <li>• {t[language].persistentFever}</li>
                              </ul>
                            </div>
                            <div>
                              <h6 className="font-semibold text-yellow-900 mb-2">
                                {language === 'en' ? 'Process:' : 'Proceso:'}
                              </h6>
                              <ul className="space-y-1 text-yellow-800">
                                <li>• {language === 'en' ? 'Standard triage protocol' : 'Protocolo de triaje estándar'}</li>
                                <li>• {language === 'en' ? 'Routine diagnostic workup' : 'Evaluación diagnóstica rutinaria'}</li>
                                <li>• {language === 'en' ? 'Treatment plan development' : 'Desarrollo de plan de tratamiento'}</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Level 4 - Non-Urgent */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">4</span>
                              </div>
                              <div>
                                <h5 className="font-bold text-blue-900">{t[language].level4NonUrgent}</h5>
                                <p className="text-sm text-blue-700">
                                  {language === 'en' 
                                    ? 'Minor conditions that can wait for available resources'
                                    : 'Condiciones menores que pueden esperar recursos disponibles'
                                  }
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-red-600">1020m</div>
                              <div className="text-sm text-gray-600">
                                {language === 'en' ? 'Queue: 13 patients' : 'Cola: 13 pacientes'}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <h6 className="font-semibold text-blue-900 mb-2">
                                {language === 'en' ? 'Examples:' : 'Ejemplos:'}
                              </h6>
                              <ul className="space-y-1 text-blue-800">
                                <li>• {t[language].minorCuts}</li>
                                <li>• {t[language].mildHeadache}</li>
                                <li>• {t[language].coldFluSymptoms}</li>
                              </ul>
                            </div>
                            <div>
                              <h6 className="font-semibold text-blue-900 mb-2">
                                {language === 'en' ? 'Alternatives:' : 'Alternativas:'}
                              </h6>
                              <ul className="space-y-1 text-blue-800">
                                <li>• {language === 'en' ? 'Urgent care centers' : 'Centros de atención urgente'}</li>
                                <li>• {language === 'en' ? 'Primary care physician' : 'Médico de atención primaria'}</li>
                                <li>• {language === 'en' ? 'Retail health clinics' : 'Clínicas de salud minoristas'}</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Level 5 - Low Acuity */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">5</span>
                              </div>
                              <div>
                                <h5 className="font-bold text-green-900">{t[language].level5LowAcuity}</h5>
                                <p className="text-sm text-green-700">
                                  {language === 'en' 
                                    ? 'Non-urgent issues better suited for primary care settings'
                                    : 'Problemas no urgentes más adecuados para entornos de atención primaria'
                                  }
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-red-600">943m</div>
                              <div className="text-sm text-gray-600">
                                {language === 'en' ? 'Queue: 3 patients' : 'Cola: 3 pacientes'}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <h6 className="font-semibold text-green-900 mb-2">
                                {language === 'en' ? 'Examples:' : 'Ejemplos:'}
                              </h6>
                              <ul className="space-y-1 text-green-800">
                                <li>• {t[language].prescriptionRefills}</li>
                                <li>• {t[language].routineConcerns}</li>
                                <li>• {t[language].minorSkinConditions}</li>
                              </ul>
                            </div>
                            <div>
                              <h6 className="font-semibold text-green-900 mb-2">
                                {language === 'en' ? 'Best Options:' : 'Mejores Opciones:'}
                              </h6>
                              <ul className="space-y-1 text-green-800">
                                <li>• {language === 'en' ? 'Schedule primary care visit' : 'Programar visita de atención primaria'}</li>
                                <li>• {language === 'en' ? 'Telehealth consultation' : 'Consulta de telemedicina'}</li>
                                <li>• {language === 'en' ? 'Pharmacy clinic services' : 'Servicios de clínica de farmacia'}</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Specialized Services Section */}
                    <div className="mb-8">
                      <h4 className="text-xl font-bold text-gray-900 mb-6">{t[language].serviciosEspecializadosDisponibles}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Trauma Center */}
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Plus className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-bold text-red-900">{t[language].centroDeTrauma}</h5>
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              </div>
                              <p className="text-sm text-red-700 mb-3">
                                {language === 'en' 
                                  ? 'Level 1 Trauma Center with 24/7 surgical capabilities for the most critical injuries'
                                  : 'Centro de Trauma Nivel 1 con capacidades quirúrgicas 24/7 para las lesiones más críticas'
                                }
                              </p>
                              <div className="space-y-2">
                                <div className="text-xs">
                                  <span className="font-semibold text-red-900">
                                    {language === 'en' ? 'Specializes in:' : 'Se especializa en:'}
                                  </span>
                                  <ul className="text-red-800 mt-1 space-y-1">
                                    <li>• {language === 'en' ? 'Multi-system trauma' : 'Trauma multisistémico'}</li>
                                    <li>• {language === 'en' ? 'Neurosurgical emergencies' : 'Emergencias neuroquirúrgicas'}</li>
                                    <li>• {language === 'en' ? 'Emergency surgery' : 'Cirugía de emergencia'}</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Cardiac Care */}
                        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Heart className="h-6 w-6 text-pink-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-bold text-pink-900">{t[language].atencionCardiaca}</h5>
                                <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                              </div>
                              <p className="text-sm text-pink-700 mb-3">
                                {language === 'en' 
                                  ? 'Comprehensive cardiac emergency services including catheterization lab'
                                  : 'Servicios integrales de emergencia cardíaca incluyendo laboratorio de cateterización'
                                }
                              </p>
                              <div className="space-y-2">
                                <div className="text-xs">
                                  <span className="font-semibold text-pink-900">
                                    {language === 'en' ? 'Services include:' : 'Los servicios incluyen:'}
                                  </span>
                                  <ul className="text-pink-800 mt-1 space-y-1">
                                    <li>• {language === 'en' ? 'STEMI interventions' : 'Intervenciones STEMI'}</li>
                                    <li>• {language === 'en' ? 'Cardiac catheterization' : 'Cateterización cardíaca'}</li>
                                    <li>• {language === 'en' ? 'Electrophysiology' : 'Electrofisiología'}</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Stroke Center */}
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <AlertTriangle className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-bold text-purple-900">
                                  {language === 'en' ? 'Stroke Center' : 'Centro de Accidentes Cerebrovasculares'}
                                </h5>
                                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                              </div>
                              <p className="text-sm text-purple-700 mb-3">
                                {language === 'en' 
                                  ? 'Certified stroke center with rapid neurological intervention capabilities'
                                  : 'Centro de accidentes cerebrovasculares certificado con capacidades de intervención neurológica rápida'
                                }
                              </p>
                              <div className="space-y-2">
                                <div className="text-xs">
                                  <span className="font-semibold text-purple-900">
                                    {language === 'en' ? 'Capabilities:' : 'Capacidades:'}
                                  </span>
                                  <ul className="text-purple-800 mt-1 space-y-1">
                                    <li>• {language === 'en' ? 'tPA administration' : 'Administración de tPA'}</li>
                                    <li>• {language === 'en' ? 'Mechanical thrombectomy' : 'Trombectomía mecánica'}</li>
                                    <li>• {language === 'en' ? '24/7 neurology coverage' : 'Cobertura de neurología 24/7'}</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Pediatric Emergency */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <FirstAid className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-bold text-blue-900">
                                  {language === 'en' ? 'Pediatric Emergency' : 'Emergencia Pediátrica'}
                                </h5>
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              </div>
                              <p className="text-sm text-blue-700 mb-3">
                                {language === 'en' 
                                  ? 'Specialized pediatric emergency care with child-friendly environment'
                                  : 'Atención de emergencia pediátrica especializada con ambiente amigable para niños'
                                }
                              </p>
                              <div className="space-y-2">
                                <div className="text-xs">
                                  <span className="font-semibold text-blue-900">
                                    {language === 'en' ? 'Features:' : 'Características:'}
                                  </span>
                                  <ul className="text-blue-800 mt-1 space-y-1">
                                    <li>• {language === 'en' ? 'Pediatric specialists on-call' : 'Especialistas pediátricos de guardia'}</li>
                                    <li>• {language === 'en' ? 'Child life services' : 'Servicios de vida infantil'}</li>
                                    <li>• {language === 'en' ? 'Family-centered care' : 'Atención centrada en la familia'}</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Information Section */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-4">
                        {language === 'en' ? 'Additional ED Information' : 'Información Adicional del DE'}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-3">
                            {language === 'en' ? 'Current Status Indicators' : 'Indicadores de Estado Actual'}
                          </h5>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-orange-50 rounded border border-orange-200">
                              <span className="text-sm font-medium text-orange-900">NEDOCS Score</span>
                              <span className="font-bold text-orange-700">165</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-red-50 rounded border border-red-200">
                              <span className="text-sm font-medium text-red-900">
                                {language === 'en' ? 'Capacity Status' : 'Estado de Capacidad'}
                              </span>
                              <span className="font-bold text-red-700">
                                {language === 'en' ? 'Severely Overcrowded' : 'Severamente Saturado'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-200">
                              <span className="text-sm font-medium text-blue-900">
                                {language === 'en' ? 'Diversion Status' : 'Estado de Desvío'}
                              </span>
                              <span className="font-bold text-green-700">
                                {language === 'en' ? 'Open' : 'Abierto'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-3">
                            {language === 'en' ? 'Patient Flow Metrics' : 'Métricas de Flujo de Pacientes'}
                          </h5>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-100 rounded">
                              <span className="text-sm font-medium text-gray-700">
                                {language === 'en' ? 'Average Length of Stay' : 'Tiempo Promedio de Estancia'}
                              </span>
                              <span className="font-bold text-gray-900">4.2 hrs</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-100 rounded">
                              <span className="text-sm font-medium text-gray-700">
                                {language === 'en' ? 'Left Without Being Seen' : 'Se Fue Sin Ser Visto'}
                              </span>
                              <span className="font-bold text-gray-900">12%</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-100 rounded">
                              <span className="text-sm font-medium text-gray-700">
                                {language === 'en' ? 'Admission Rate' : 'Tasa de Admisión'}
                              </span>
                              <span className="font-bold text-gray-900">18%</span>
                            </div>
                          </div>
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