import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Clock, RefreshCw, AlertTriangle, Heart, FirstAid, Phone, Thermometer, Pill, Eye, Plus, Globe, Info, X, Building, CaretDown, CaretUp, MagnifyingGlass, CheckCircle, Brain, Lungs, Drop, Bandage, Siren, Pulse, Tooth, Activity } from '@phosphor-icons/react'
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

interface Symptom {
  id: string
  name: string
  acuityLevel: number
  category: string
}

interface SymptomCategory {
  name: string
  symptoms: Symptom[]
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
  const [careGuideSection, setCareGuideSection] = useState<'recommendation' | 'options' | 'prepare'>('recommendation')
  const [selectedInsurance, setSelectedInsurance] = useState('')
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [showAssessmentResult, setShowAssessmentResult] = useState(false)
  const [manualZipCode, setManualZipCode] = useState('')
  const [locationEnabled, setLocationEnabled] = useState(false)
  const [urgentCareLocations, setUrgentCareLocations] = useState<Array<{
    id: string
    name: string
    address: string
    phone: string
    hours: string[]
    distance?: number
    isER?: boolean
  }>>([])
  const [isCalculatingProximity, setIsCalculatingProximity] = useState(false)

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
      emergencyCareGuidance: 'Emergency Care Guidance',
      emergencyCareGuidanceSubtitle: 'Get expert guidance on when to seek emergency care, understand how emergency rooms work, and discover alternative care options that might be faster and more appropriate for your needs.',
      lifeThreatening: 'Life-Threatening Emergency?',
      lifeThreateneingDescription: 'If you\'re experiencing chest pain, difficulty breathing, severe bleeding, or any life-threatening symptoms, don\'t wait - call 911 immediately.',
      careRecommendation: 'Care Recommendation',
      careOptions: 'Care Options',
      prepareForVisit: 'Prepare for Your Visit',
      call911: 'Call 911',
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
      emergencyCareGuidance: 'Orientación para Atención de Emergencia',
      emergencyCareGuidanceSubtitle: 'Obtenga orientación experta sobre cuándo buscar atención de emergencia, comprenda cómo funcionan las salas de emergencia y descubra opciones de atención alternativas que podrían ser más rápidas y apropiadas para sus necesidades.',
      lifeThreatening: '¿Emergencia que Amenaza la Vida?',
      lifeThreateneingDescription: 'Si está experimentando dolor en el pecho, dificultad para respirar, sangrado severo, o cualquier síntoma que amenace la vida, no espere - llame al 911 inmediatamente.',
      careRecommendation: 'Recomendación de Atención',
      careOptions: 'Opciones de Atención',
      prepareForVisit: 'Prepárese para su Visita',
      call911: 'Llamar 911',
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

  // Urgent care locations data
  const urgentCareData = [
    {
      id: 'roybal',
      name: 'Edward R. Roybal Comprehensive Health Center',
      address: '245 S. Fetterly Ave., Los Angeles, CA 90022',
      phone: '(323) 362-1010',
      hours: [
        language === 'en' ? 'Mon-Fri: 7:30 AM - 4:30 PM' : 'Lun-Vie: 7:30 AM - 4:30 PM',
        language === 'en' ? 'Sat: 8:00 AM - 4:30 PM' : 'Sáb: 8:00 AM - 4:30 PM'
      ],
      lat: 34.0522,
      lng: -118.1825
    },
    {
      id: 'elmonte',
      name: 'El Monte Comprehensive Health Center',
      address: '10953 Ramona Blvd, El Monte, CA 91731',
      phone: '(626) 434-2500',
      hours: [
        language === 'en' ? 'Mon-Sat: 8:00 AM - 4:30 PM' : 'Lun-Sáb: 8:00 AM - 4:30 PM'
      ],
      lat: 34.0686,
      lng: -118.0276
    },
    {
      id: 'hudson',
      name: 'H. Claude Hudson Comprehensive Health Center',
      address: '2829 South Grand Ave., Los Angeles, CA 90007',
      phone: '(213) 699-7000',
      hours: [
        language === 'en' ? 'Mon-Fri: 7:30 AM - 11:00 PM' : 'Lun-Vie: 7:30 AM - 11:00 PM',
        language === 'en' ? 'Sat-Sun: 8:00 AM - 11:00 PM' : 'Sáb-Dom: 8:00 AM - 11:00 PM'
      ],
      lat: 34.0259,
      lng: -118.2637
    },
    {
      id: 'highdesert',
      name: 'High Desert Regional Health Center',
      address: '335 East Avenue I, Lancaster, CA 93535',
      phone: '(661) 471-4000',
      hours: [
        language === 'en' ? 'Daily: 8:00 AM - 10:30 PM' : 'Diario: 8:00 AM - 10:30 PM'
      ],
      lat: 34.7086,
      lng: -118.1372
    },
    {
      id: 'humphrey',
      name: 'Hubert Humphrey Comprehensive Health Center',
      address: '5850 So. Main St., Los Angeles, CA 90003',
      phone: '(323) 897-6000',
      hours: [
        language === 'en' ? 'Mon-Fri: 8:00 AM - 10:00 PM' : 'Lun-Vie: 8:00 AM - 10:00 PM',
        language === 'en' ? 'Sat-Sun: 8:00 AM - 6:30 PM' : 'Sáb-Dom: 8:00 AM - 6:30 PM'
      ],
      lat: 34.0072,
      lng: -118.2437
    },
    {
      id: 'longbeach',
      name: 'Long Beach Comprehensive Health Center',
      address: '1333 Chestnut Ave., Long Beach, CA 90813',
      phone: '(562) 753-2300',
      hours: [
        language === 'en' ? 'Mon-Fri: 7:30 AM - 7:30 PM' : 'Lun-Vie: 7:30 AM - 7:30 PM',
        language === 'en' ? 'Sat: 8:00 AM - 4:30 PM' : 'Sáb: 8:00 AM - 4:30 PM'
      ],
      lat: 33.7701,
      lng: -118.1937
    },
    {
      id: 'mlk',
      name: 'Martin Luther King, Jr. Outpatient Center',
      address: '12021 S Wilmington Ave, Los Angeles, CA 90059, First Floor, Suite 1D',
      phone: '(424) 338-1000',
      hours: [
        language === 'en' ? 'Daily: 7:30 AM - 11:00 PM' : 'Diario: 7:30 AM - 11:00 PM'
      ],
      lat: 33.9259,
      lng: -118.2437
    },
    {
      id: 'midvalley',
      name: 'Mid-Valley Comprehensive Health Center',
      address: '7515 Van Nuys Blvd., Van Nuys, CA 91405',
      phone: '(818) 627-3000',
      hours: [
        language === 'en' ? 'Mon-Fri: 8:00 AM - 9:00 PM' : 'Lun-Vie: 8:00 AM - 9:00 PM',
        language === 'en' ? 'Sat-Sun: 8:00 AM - 3:00 PM' : 'Sáb-Dom: 8:00 AM - 3:00 PM'
      ],
      lat: 34.1936,
      lng: -118.4492
    },
    {
      id: 'southvalley',
      name: 'South Valley Health Center',
      address: '38350 40th St. East, Palmdale, CA 93552',
      phone: '(661) 225-3001',
      hours: [
        language === 'en' ? 'Daily: 8:00 AM - 10:30 PM' : 'Diario: 8:00 AM - 10:30 PM'
      ],
      lat: 34.5794,
      lng: -118.1164
    },
    {
      id: 'harbor',
      name: 'Harbor –UCLA Med Center (UCC)',
      address: '1000 W. Carson St., Torrance, CA 90509',
      phone: '(424) 306-4110',
      hours: [
        language === 'en' ? 'Mon-Fri: 8:00 AM - 9:00 PM' : 'Lun-Vie: 8:00 AM - 9:00 PM',
        language === 'en' ? 'Sat: 8:00 AM - 3:00 PM' : 'Sáb: 8:00 AM - 3:00 PM'
      ],
      lat: 33.8303,
      lng: -118.2934,
      isER: true
    },
    {
      id: 'lageneral',
      name: 'LA General Medical Center (UCC)',
      address: '1100 N State Street, Tower A2B (second floor), Los Angeles, CA 90033',
      phone: '(323) 409-3753',
      hours: [
        language === 'en' ? 'Mon-Sat: 8:00 AM - 7:00 PM' : 'Lun-Sáb: 8:00 AM - 7:00 PM'
      ],
      lat: 34.0608,
      lng: -118.2073,
      isER: true
    },
    {
      id: 'oliveview',
      name: 'Olive View Medical Center (UCC)',
      address: '14445 Olive View Drive, Sylmar, CA 91342',
      phone: '(747) 210-3127',
      hours: [
        language === 'en' ? 'Mon-Fri: 8:00 AM - 8:00 PM' : 'Lun-Vie: 8:00 AM - 8:00 PM',
        language === 'en' ? 'Sat: 8:00 AM - 4:30 PM' : 'Sáb: 8:00 AM - 4:30 PM',
        language === 'en' ? 'Holidays: 8:00 AM - 8:00 PM' : 'Días Festivos: 8:00 AM - 8:00 PM',
        language === 'en' ? 'Major holidays: 8:00 AM - 4:30 PM' : 'Días festivos principales: 8:00 AM - 4:30 PM'
      ],
      lat: 34.3031,
      lng: -118.4231,
      isER: true
    }
  ]

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 3959 // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Get coordinates from zip code (simplified - in real app would use geocoding API)
  const getCoordinatesFromZip = (zipCode: string): { lat: number, lng: number } | null => {
    // Simplified mapping of some LA area zip codes to coordinates
    const zipCoordinates: { [key: string]: { lat: number, lng: number } } = {
      '90210': { lat: 34.0901, lng: -118.4065 }, // Beverly Hills
      '90211': { lat: 34.0901, lng: -118.4065 }, // Beverly Hills
      '90028': { lat: 34.1016, lng: -118.3432 }, // Hollywood
      '90210': { lat: 34.0901, lng: -118.4065 }, // Beverly Hills
      '90401': { lat: 34.0195, lng: -118.4912 }, // Santa Monica
      '90291': { lat: 33.9778, lng: -118.4695 }, // Venice
      '90405': { lat: 34.0195, lng: -118.4912 }, // Santa Monica
      '90212': { lat: 34.0901, lng: -118.4065 }, // Beverly Hills
      '90036': { lat: 34.0669, lng: -118.3370 }, // Hollywood/West Hollywood
      '90048': { lat: 34.0669, lng: -118.3370 }, // West Hollywood
      '90067': { lat: 34.0583, lng: -118.4220 }, // Century City
      '90024': { lat: 34.0612, lng: -118.4421 }, // Westwood
      '90025': { lat: 34.0412, lng: -118.4437 }, // West LA
      '90035': { lat: 34.0583, lng: -118.3781 }, // Mid-City
      '90034': { lat: 34.0301, lng: -118.4037 }, // Palms
      '90064': { lat: 34.0301, lng: -118.4378 }, // West LA
      '90066': { lat: 33.9778, lng: -118.4328 }, // Mar Vista
      '90230': { lat: 33.9425, lng: -118.3964 }, // Culver City
      '90232': { lat: 33.9425, lng: -118.3964 }, // Culver City
      '90405': { lat: 34.0195, lng: -118.4912 }, // Santa Monica
      '90503': { lat: 33.8303, lng: -118.2934 }, // Torrance
      '90505': { lat: 33.8303, lng: -118.2934 }, // Torrance
      '90501': { lat: 33.8303, lng: -118.2934 }, // Torrance
      '90502': { lat: 33.8303, lng: -118.2934 }, // Torrance
      '90504': { lat: 33.8303, lng: -118.2934 }, // Torrance
      '90506': { lat: 33.8303, lng: -118.2934 }, // Torrance
      '90507': { lat: 33.8303, lng: -118.2934 }, // Torrance
      '90508': { lat: 33.8303, lng: -118.2934 }, // Torrance
      '90509': { lat: 33.8303, lng: -118.2934 }, // Torrance
      '90510': { lat: 33.8303, lng: -118.2934 }, // Torrance
      '90731': { lat: 33.7701, lng: -118.2937 }, // San Pedro
      '90732': { lat: 33.7701, lng: -118.2937 }, // San Pedro
      '90744': { lat: 33.7701, lng: -118.2937 }, // San Pedro
      '90745': { lat: 33.7701, lng: -118.1937 }, // Carson
      '90746': { lat: 33.7701, lng: -118.1937 }, // Carson
      '90247': { lat: 33.9259, lng: -118.2437 }, // Gardena
      '90248': { lat: 33.9259, lng: -118.2437 }, // Gardena
      '90249': { lat: 33.9259, lng: -118.2437 }, // Gardena
      '90250': { lat: 33.9259, lng: -118.2437 }, // Hawthorne
      '91731': { lat: 34.0686, lng: -118.0276 }, // El Monte
      '91732': { lat: 34.0686, lng: -118.0276 }, // El Monte
      '91733': { lat: 34.0686, lng: -118.0276 }, // South El Monte
      '90022': { lat: 34.0522, lng: -118.1825 }, // East LA
      '90023': { lat: 34.0522, lng: -118.1825 }, // East LA
      '90033': { lat: 34.0608, lng: -118.2073 }, // Boyle Heights
      '90063': { lat: 34.0522, lng: -118.1825 }, // East LA
      '90007': { lat: 34.0259, lng: -118.2637 }, // USC area
      '90003': { lat: 34.0072, lng: -118.2437 }, // South LA
      '90059': { lat: 33.9259, lng: -118.2437 }, // Watts
      '90813': { lat: 33.7701, lng: -118.1937 }, // Long Beach
      '90814': { lat: 33.7701, lng: -118.1937 }, // Long Beach
      '90815': { lat: 33.7701, lng: -118.1937 }, // Long Beach
      '90802': { lat: 33.7701, lng: -118.1937 }, // Long Beach
      '90803': { lat: 33.7701, lng: -118.1937 }, // Long Beach
      '90804': { lat: 33.7701, lng: -118.1937 }, // Long Beach
      '90805': { lat: 33.7701, lng: -118.1937 }, // Long Beach
      '90806': { lat: 33.7701, lng: -118.1937 }, // Long Beach
      '90807': { lat: 33.7701, lng: -118.1937 }, // Long Beach
      '90808': { lat: 33.7701, lng: -118.1937 }, // Long Beach
      '90810': { lat: 33.7701, lng: -118.1937 }, // Long Beach
      '90831': { lat: 33.7701, lng: -118.1937 }, // Long Beach
      '90832': { lat: 33.7701, lng: -118.1937 }, // Long Beach
      '90833': { lat: 33.7701, lng: -118.1937 }, // Long Beach
      '90834': { lat: 33.7701, lng: -118.1937 }, // Long Beach
      '90835': { lat: 33.7701, lng: -118.1937 }, // Long Beach
      '91405': { lat: 34.1936, lng: -118.4492 }, // Van Nuys
      '91406': { lat: 34.1936, lng: -118.4492 }, // Van Nuys
      '91411': { lat: 34.1936, lng: -118.4492 }, // Van Nuys
      '91316': { lat: 34.1936, lng: -118.4492 }, // Encino
      '91436': { lat: 34.1936, lng: -118.4492 }, // Encino
      '93535': { lat: 34.7086, lng: -118.1372 }, // Lancaster
      '93536': { lat: 34.7086, lng: -118.1372 }, // Lancaster
      '93551': { lat: 34.7086, lng: -118.1372 }, // Palmdale
      '93552': { lat: 34.5794, lng: -118.1164 }, // Palmdale
      '93553': { lat: 34.5794, lng: -118.1164 }, // Palmdale
      '93591': { lat: 34.5794, lng: -118.1164 }, // Palmdale
      '91342': { lat: 34.3031, lng: -118.4231 }  // Sylmar
    }
    
    return zipCoordinates[zipCode] || null
  }

  // Calculate proximity for urgent care centers
  const calculateProximity = async (referenceLocation: { lat: number, lng: number }) => {
    setIsCalculatingProximity(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const locationsWithDistance = urgentCareData.map(location => ({
      ...location,
      distance: calculateDistance(
        referenceLocation.lat,
        referenceLocation.lng,
        location.lat,
        location.lng
      )
    }))
    
    // Sort by distance
    locationsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0))
    
    setUrgentCareLocations(locationsWithDistance)
    setIsCalculatingProximity(false)
  }

  // Handle location enable
  const handleEnableLocation = () => {
    if (navigator.geolocation) {
      setLocationEnabled(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(userLoc)
          calculateProximity(userLoc)
          setLocationError('')
        },
        (error) => {
          setLocationError('Location access denied')
          setLocationEnabled(false)
        }
      )
    }
  }

  // Handle manual zip code
  const handleZipCodeClassify = () => {
    if (manualZipCode.trim()) {
      const coords = getCoordinatesFromZip(manualZipCode.trim())
      if (coords) {
        calculateProximity(coords)
        setLocationError('')
      } else {
        setLocationError('Invalid or unsupported zip code')
      }
    }
  }

  // Initialize urgent care locations on component mount
  useEffect(() => {
    // Initialize with default sorting (alphabetical)
    const sortedLocations = [...urgentCareData].sort((a, b) => a.name.localeCompare(b.name))
    setUrgentCareLocations(sortedLocations)
  }, [language])

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

  // Insurance options
  const insuranceOptions = [
    { value: 'medicare', label: 'Medicare' },
    { value: 'medicaid', label: 'Medicaid/Medi-Cal' },
    { value: 'private', label: 'Private Insurance' },
    { value: 'uninsured', label: 'Uninsured/Self-Pay' },
    { value: 'covered-ca', label: 'Covered California' }
  ]

  // Function to get icon for symptom
  const getSymptomIcon = (symptomId: string, category: string) => {
    // Specific icon mappings for certain symptoms
    const specificIcons: { [key: string]: JSX.Element } = {
      'thoughts-harm': <Brain className="h-4 w-4 text-purple-600" />,
      'severe-chest-pain': <Heart className="h-4 w-4 text-red-600" />,
      'chest-pain-moderate': <Heart className="h-4 w-4 text-red-600" />,
      'cardiac-arrest': <Pulse className="h-4 w-4 text-red-600" />,
      'severe-breathing': <Lungs className="h-4 w-4 text-blue-600" />,
      'breathing-difficulty': <Lungs className="h-4 w-4 text-blue-600" />,
      'cold-flu-symptoms': <Lungs className="h-4 w-4 text-blue-600" />,
      'severe-bleeding': <Drop className="h-4 w-4 text-red-600" />,
      'moderate-bleeding': <Drop className="h-4 w-4 text-red-600" />,
      'vomiting-blood': <Drop className="h-4 w-4 text-red-600" />,
      'stroke-signs': <Brain className="h-4 w-4 text-purple-600" />,
      'active-seizure': <Brain className="h-4 w-4 text-purple-600" />,
      'loss-consciousness': <Brain className="h-4 w-4 text-purple-600" />,
      'severe-headache': <Brain className="h-4 w-4 text-purple-600" />,
      'mild-headache': <Brain className="h-4 w-4 text-purple-600" />,
      'head-injury': <Brain className="h-4 w-4 text-purple-600" />,
      'minor-cuts': <Bandage className="h-4 w-4 text-orange-600" />,
      'minor-fractures': <Bandage className="h-4 w-4 text-orange-600" />,
      'burns-minor': <Bandage className="h-4 w-4 text-orange-600" />,
      'animal-bite': <Bandage className="h-4 w-4 text-orange-600" />,
      'eye-injury': <Eye className="h-4 w-4 text-blue-600" />,
      'minor-eye-irritation': <Eye className="h-4 w-4 text-blue-600" />,
      'high-fever-confusion': <Thermometer className="h-4 w-4 text-orange-600" />,
      'persistent-fever': <Thermometer className="h-4 w-4 text-orange-600" />,
      'prescription-refills': <Pill className="h-4 w-4 text-green-600" />,
      'minor-dental': <Tooth className="h-4 w-4 text-blue-600" />,
      'blood-pressure-check': <Activity className="h-4 w-4 text-blue-600" />
    }

    if (specificIcons[symptomId]) {
      return specificIcons[symptomId]
    }

    // Category-based fallback icons
    switch (category) {
      case 'cardiac':
        return <Heart className="h-4 w-4 text-red-600" />
      case 'respiratory':
        return <Lungs className="h-4 w-4 text-blue-600" />
      case 'neurological':
      case 'mental-health':
        return <Brain className="h-4 w-4 text-purple-600" />
      case 'trauma':
        return <Bandage className="h-4 w-4 text-orange-600" />
      case 'gastrointestinal':
        return <Activity className="h-4 w-4 text-green-600" />
      case 'general':
        return <Thermometer className="h-4 w-4 text-orange-600" />
      case 'allergic':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'musculoskeletal':
        return <Bandage className="h-4 w-4 text-orange-600" />
      case 'dermatological':
        return <Activity className="h-4 w-4 text-green-600" />
      case 'dental':
        return <Tooth className="h-4 w-4 text-blue-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  // Symptom categories and symptoms
  const symptomCategories: SymptomCategory[] = [
    {
      name: 'Level 1 - Immediate (Life-Threatening)',
      symptoms: [
        { id: 'thoughts-harm', name: 'Thoughts of Harming Yourself or Others', acuityLevel: 1, category: 'mental-health' },
        { id: 'severe-chest-pain', name: 'Severe Chest Pain', acuityLevel: 1, category: 'cardiac' },
        { id: 'severe-breathing', name: 'Severe Difficulty Breathing', acuityLevel: 1, category: 'respiratory' },
        { id: 'severe-bleeding', name: 'Severe Bleeding (Uncontrollable)', acuityLevel: 1, category: 'trauma' },
        { id: 'stroke-signs', name: 'Signs of Stroke (FAST symptoms)', acuityLevel: 1, category: 'neurological' },
        { id: 'active-seizure', name: 'Active Seizure', acuityLevel: 1, category: 'neurological' },
        { id: 'vomiting-blood', name: 'Vomiting Blood', acuityLevel: 1, category: 'gastrointestinal' },
        { id: 'loss-consciousness', name: 'Loss of Consciousness', acuityLevel: 1, category: 'neurological' },
        { id: 'cardiac-arrest', name: 'Cardiac Arrest Symptoms', acuityLevel: 1, category: 'cardiac' }
      ]
    },
    {
      name: 'Level 2 - Emergent (High Priority)',
      symptoms: [
        { id: 'chest-pain-moderate', name: 'Chest Pain (Moderate)', acuityLevel: 2, category: 'cardiac' },
        { id: 'breathing-difficulty', name: 'Breathing Difficulty', acuityLevel: 2, category: 'respiratory' },
        { id: 'severe-abdominal-pain', name: 'Severe Abdominal Pain', acuityLevel: 2, category: 'gastrointestinal' },
        { id: 'high-fever-confusion', name: 'High Fever with Confusion', acuityLevel: 2, category: 'general' },
        { id: 'severe-headache', name: 'Severe Headache', acuityLevel: 2, category: 'neurological' },
        { id: 'head-injury', name: 'Head Injury', acuityLevel: 2, category: 'trauma' },
        { id: 'moderate-bleeding', name: 'Moderate Bleeding', acuityLevel: 2, category: 'trauma' },
        { id: 'allergic-reaction-severe', name: 'Severe Allergic Reaction', acuityLevel: 2, category: 'allergic' }
      ]
    },
    {
      name: 'Level 3 - Urgent (Less Urgent)',
      symptoms: [
        { id: 'moderate-pain', name: 'Moderate Pain', acuityLevel: 3, category: 'general' },
        { id: 'minor-fractures', name: 'Minor Fractures', acuityLevel: 3, category: 'trauma' },
        { id: 'persistent-fever', name: 'Persistent Fever', acuityLevel: 3, category: 'general' },
        { id: 'vomiting-diarrhea', name: 'Vomiting/Diarrhea', acuityLevel: 3, category: 'gastrointestinal' },
        { id: 'eye-injury', name: 'Eye Injury', acuityLevel: 3, category: 'trauma' },
        { id: 'animal-bite', name: 'Animal Bite', acuityLevel: 3, category: 'trauma' },
        { id: 'burns-minor', name: 'Minor Burns', acuityLevel: 3, category: 'trauma' },
        { id: 'dehydration', name: 'Dehydration', acuityLevel: 3, category: 'general' }
      ]
    },
    {
      name: 'Level 4 - Semi-Urgent (Non-Urgent)',
      symptoms: [
        { id: 'minor-cuts', name: 'Minor Cuts and Scrapes', acuityLevel: 4, category: 'trauma' },
        { id: 'mild-headache', name: 'Mild Headache', acuityLevel: 4, category: 'neurological' },
        { id: 'cold-flu-symptoms', name: 'Cold or Flu Symptoms', acuityLevel: 4, category: 'respiratory' },
        { id: 'minor-sprains', name: 'Minor Sprains or Strains', acuityLevel: 4, category: 'musculoskeletal' },
        { id: 'minor-allergic', name: 'Minor Allergic Reactions', acuityLevel: 4, category: 'allergic' },
        { id: 'back-pain-nonsevere', name: 'Non-Severe Back Pain', acuityLevel: 4, category: 'musculoskeletal' },
        { id: 'extreme-fatigue', name: 'Extreme Fatigue', acuityLevel: 4, category: 'general' },
        { id: 'joint-pain', name: 'Joint Pain', acuityLevel: 4, category: 'musculoskeletal' }
      ]
    },
    {
      name: 'Level 5 - Fast Track (Minimal Resources)',
      symptoms: [
        { id: 'minor-skin-conditions', name: 'Minor Skin Conditions', acuityLevel: 5, category: 'dermatological' },
        { id: 'prescription-refills', name: 'Prescription Refills (Non-Emergency)', acuityLevel: 5, category: 'general' },
        { id: 'routine-checkup', name: 'Routine Check-up Needs', acuityLevel: 5, category: 'general' },
        { id: 'minor-eye-irritation', name: 'Minor Eye or Ear Irritation', acuityLevel: 5, category: 'general' },
        { id: 'wound-dressing', name: 'Simple Wound Dressing Changes', acuityLevel: 5, category: 'general' },
        { id: 'blood-pressure-check', name: 'Blood Pressure Checks', acuityLevel: 5, category: 'general' },
        { id: 'minor-dental', name: 'Minor Dental Issues', acuityLevel: 5, category: 'dental' }
      ]
    }
  ]

  const handleSymptomToggle = (symptomId: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId) 
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    )
  }

  const clearAllSymptoms = () => {
    setSelectedSymptoms([])
    setShowAssessmentResult(false)
  }

  const getAssessmentResult = () => {
    if (selectedSymptoms.length === 0) return null

    // Find the highest acuity level among selected symptoms
    const allSymptoms = symptomCategories.flatMap(cat => cat.symptoms)
    const selectedSymptomObjects = allSymptoms.filter(symptom => selectedSymptoms.includes(symptom.id))
    const highestAcuity = Math.min(...selectedSymptomObjects.map(s => s.acuityLevel))

    return {
      acuityLevel: highestAcuity,
      waitTime: highestAcuity === 1 ? '<15' : highestAcuity === 2 ? '<15' : highestAcuity === 3 ? '693' : highestAcuity === 4 ? '1020' : '943',
      recommendation: highestAcuity <= 2 ? 'Emergency Department' : highestAcuity === 3 ? 'Emergency Department or Urgent Care' : 'Urgent Care or Primary Care'
    }
  }

  const performAssessment = () => {
    setShowAssessmentResult(true)
  }

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
                  <Card className="bg-red-50 border-red-200 hover:shadow-md transition-shadow h-full flex flex-col">
                    <CardContent className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">1</span>
                        </div>
                        <h4 className="font-bold text-red-900 text-sm">{t[language].level1Critical}</h4>
                      </div>
                      
                      <div className="mb-4 flex-1">
                        <p className="text-xs text-red-700 mb-4 leading-relaxed">
                          {language === 'en' 
                            ? 'Life-threatening conditions requiring immediate medical intervention'
                            : 'Condiciones que amenazan la vida que requieren intervención médica inmediata'
                          }
                        </p>

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

                        <div className="mb-4">
                          <h5 className="text-xs font-semibold text-red-900 mb-2">
                            {language === 'en' ? 'What to Expect:' : 'Qué Esperar:'}
                          </h5>
                          <ul className="space-y-1 text-xs text-red-700">
                            <li>• {language === 'en' ? 'Seen immediately' : 'Atendido inmediatamente'}</li>
                            <li>• {language === 'en' ? 'Multiple medical staff' : 'Múltiple personal médico'}</li>
                            <li>• {language === 'en' ? 'May require surgery' : 'Puede requerir cirugía'}</li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-red-600 text-white text-center py-2 px-3 rounded-lg mt-auto">
                        <div className="text-xs font-black tracking-wide">{t[language].highestPriority}</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Level 2 - Urgent */}
                  <Card className="bg-orange-50 border-orange-200 hover:shadow-md transition-shadow h-full flex flex-col">
                    <CardContent className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">2</span>
                        </div>
                        <h4 className="font-bold text-orange-900 text-sm">{t[language].level2Urgent}</h4>
                      </div>
                      
                      <div className="mb-4 flex-1">
                        <p className="text-xs text-orange-700 mb-4 leading-relaxed">
                          {language === 'en' 
                            ? 'Serious conditions that need prompt medical attention'
                            : 'Condiciones serias que necesitan atención médica pronta'
                          }
                        </p>

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

                        <div className="mb-4">
                          <h5 className="text-xs font-semibold text-orange-900 mb-2">
                            {language === 'en' ? 'What to Expect:' : 'Qué Esperar:'}
                          </h5>
                          <ul className="space-y-1 text-xs text-orange-700">
                            <li>• {language === 'en' ? 'Seen within 15 minutes' : 'Atendido en 15 minutos'}</li>
                            <li>• {language === 'en' ? 'Urgent diagnostic tests' : 'Pruebas diagnósticas urgentes'}</li>
                            <li>• {language === 'en' ? 'Possible admission' : 'Posible admisión'}</li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-orange-600 text-white text-center py-2 px-3 rounded-lg mt-auto">
                        <div className="text-xs font-black tracking-wide">{t[language].highPriority}</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Level 3 - Less Urgent */}
                  <Card className="bg-yellow-50 border-yellow-200 hover:shadow-md transition-shadow h-full flex flex-col">
                    <CardContent className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">3</span>
                        </div>
                        <h4 className="font-bold text-yellow-900 text-sm">{t[language].level3LessUrgent}</h4>
                      </div>
                      
                      <div className="mb-4 flex-1">
                        <p className="text-xs text-yellow-700 mb-4 leading-relaxed">
                          {language === 'en' 
                            ? 'Conditions that require medical care but can wait if needed'
                            : 'Condiciones que requieren atención médica pero pueden esperar si es necesario'
                          }
                        </p>

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

                        <div className="mb-4">
                          <h5 className="text-xs font-semibold text-yellow-900 mb-2">
                            {language === 'en' ? 'What to Expect:' : 'Qué Esperar:'}
                          </h5>
                          <ul className="space-y-1 text-xs text-yellow-700">
                            <li>• {language === 'en' ? 'Wait time varies' : 'Tiempo de espera varía'}</li>
                            <li>• {language === 'en' ? 'Standard evaluation' : 'Evaluación estándar'}</li>
                            <li>• {language === 'en' ? 'Treatment plan provided' : 'Plan de tratamiento provisto'}</li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-yellow-600 text-white text-center py-2 px-3 rounded-lg mt-auto">
                        <div className="text-xs font-black tracking-wide">{t[language].mediumPriority}</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Level 4 - Non-Urgent */}
                  <Card className="bg-blue-50 border-blue-200 hover:shadow-md transition-shadow h-full flex flex-col">
                    <CardContent className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">4</span>
                        </div>
                        <h4 className="font-bold text-blue-900 text-sm">{t[language].level4NonUrgent}</h4>
                      </div>
                      
                      <div className="mb-4 flex-1">
                        <p className="text-xs text-blue-700 mb-4 leading-relaxed">
                          {language === 'en' 
                            ? 'Minor conditions that should be treated but are not urgent'
                            : 'Condiciones menores que deben tratarse pero no son urgentes'
                          }
                        </p>

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

                        <div className="mb-4">
                          <h5 className="text-xs font-semibold text-blue-900 mb-2">
                            {language === 'en' ? 'What to Expect:' : 'Qué Esperar:'}
                          </h5>
                          <ul className="space-y-1 text-xs text-blue-700">
                            <li>• {language === 'en' ? 'Longer wait times' : 'Tiempos de espera más largos'}</li>
                            <li>• {language === 'en' ? 'Basic examination' : 'Examen básico'}</li>
                            <li>• {language === 'en' ? 'Consider urgent care' : 'Considerar atención urgente'}</li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-blue-600 text-white text-center py-2 px-3 rounded-lg mt-auto">
                        <div className="text-xs font-black tracking-wide">{t[language].lowPriority}</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Level 5 - Low Acuity */}
                  <Card className="bg-green-50 border-green-200 hover:shadow-md transition-shadow h-full flex flex-col">
                    <CardContent className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">5</span>
                        </div>
                        <h4 className="font-bold text-green-900 text-sm">{t[language].level5LowAcuity}</h4>
                      </div>
                      
                      <div className="mb-4 flex-1">
                        <p className="text-xs text-green-700 mb-4 leading-relaxed">
                          {language === 'en' 
                            ? 'Minor issues that could be addressed elsewhere'
                            : 'Problemas menores que podrían ser atendidos en otro lugar'
                          }
                        </p>

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

                        <div className="mb-4">
                          <h5 className="text-xs font-semibold text-green-900 mb-2">
                            {language === 'en' ? 'What to Expect:' : 'Qué Esperar:'}
                          </h5>
                          <ul className="space-y-1 text-xs text-green-700">
                            <li>• {language === 'en' ? 'Longest wait times' : 'Tiempos de espera más largos'}</li>
                            <li>• {language === 'en' ? 'Simple treatment' : 'Tratamiento simple'}</li>
                            <li>• {language === 'en' ? 'Try clinic first' : 'Pruebe clínica primero'}</li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-green-600 text-white text-center py-2 px-3 rounded-lg mt-auto">
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
                <Card key={hospital.id} className="overflow-hidden shadow-lg">
                  <CardContent className="p-0">
                    {/* Enhanced Hospital Header with gradient background */}
                    <div className="bg-gradient-to-r from-blue-50 to-red-50 border-b border-gray-200 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          {/* Harbor Logo */}
                          <div className="bg-red-600 text-white px-4 py-3 rounded-lg font-bold text-lg shadow-md">
                            {t[language].harborShort}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                                Census: 46
                              </div>
                              <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">
                                {t[language].nedocs} 165
                              </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {t[language].harborUCLAMedicalCenter}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>18.4 {language === 'en' ? 'miles' : 'millas'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="font-semibold text-green-600">{t[language].open}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg border border-red-200">
                            <div className="text-xs font-medium">{t[language].severelyOvercrowded}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">

                      {/* Key Metrics Dashboard */}
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                          <div className="text-center">
                            <div className="text-xs font-medium text-blue-700 mb-2">
                              {language === 'en' ? 'Avg. Boarding De (%' : 'Prom. Internación De (%'}
                            </div>
                            <div className="text-2xl font-bold text-blue-600 mb-1">6:45</div>
                            <div className="text-xs text-blue-600">
                              {language === 'en' ? 'last 6 hours' : 'últimas 6 horas'}
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                          <div className="text-center">
                            <div className="text-xs font-medium text-orange-700 mb-2">
                              {language === 'en' ? 'Avg. Arrival to DOC' : 'Prom. Llegada a DOC'}
                            </div>
                            <div className="text-2xl font-bold text-orange-600 mb-1">42 mins.</div>
                            <div className="text-xs text-orange-600">
                              {language === 'en' ? 'last 6 hours' : 'últimas 6 horas'}
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
                          <div className="text-center">
                            <div className="text-xs font-medium text-yellow-700 mb-2">
                              {language === 'en' ? 'Avg. Disposition to Discharge' : 'Prom. Disposición a Alta'}
                            </div>
                            <div className="text-2xl font-bold text-yellow-600 mb-1">21 mins.</div>
                            <div className="text-xs text-yellow-600">
                              {language === 'en' ? 'last 6 hours' : 'últimas 6 horas'}
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                          <div className="text-center">
                            <div className="text-xs font-medium text-blue-700 mb-2">{t[language].currentCensus}</div>
                            <div className="text-3xl font-bold text-blue-600 mb-1">46</div>
                            <div className="text-xs text-blue-600">{t[language].patients}</div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                          <div className="text-center">
                            <div className="text-xs font-medium text-green-700 mb-2">{t[language].status}</div>
                            <div className="text-xl font-bold text-green-600 mb-1">{t[language].open}</div>
                          </div>
                        </div>
                        </div>

                      {/* Comprehensive Facility Information */}
                      <div className="space-y-6">
                        {/* Facility Information Section */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                          <button 
                            onClick={() => setFacilityInfoExpanded(!facilityInfoExpanded)}
                            className="flex items-center justify-between w-full p-6 hover:bg-gray-50 transition-colors rounded-xl"
                          >
                            <div className="flex items-center gap-4">
                              <div className="bg-blue-100 p-3 rounded-lg">
                                <Building className="h-6 w-6 text-blue-600" />
                              </div>
                              <div className="text-left">
                                <h3 className="text-lg font-semibold text-gray-900">{t[language].facilityInformation}</h3>
                                <p className="text-sm text-gray-600">{t[language].level1TraumaCenter}</p>
                              </div>
                            </div>
                            <div className="bg-gray-100 p-2 rounded-lg">
                              {facilityInfoExpanded ? <CaretUp className="h-5 w-5 text-gray-600" /> : <CaretDown className="h-5 w-5 text-gray-600" />}
                            </div>
                          </button>
                          
                          {facilityInfoExpanded && (
                            <div className="px-6 pb-6">
                              <div className="border-t border-gray-100 pt-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                  <div className="space-y-6">
                                    <div>
                                      <h4 className="text-lg font-semibold text-gray-900 mb-3">{t[language].level1TraumaCenter}</h4>
                                      <p className="text-gray-600 mb-4 leading-relaxed">{t[language].traumaCenterDescription}</p>
                                      
                                      <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                          <span className="text-sm font-medium text-blue-900">
                                            {language === 'en' ? '298 licensed beds' : '298 camas con licencia'}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                          <span className="text-sm font-medium text-blue-900">
                                            {language === 'en' ? 'Level 1 Trauma Center designation' : 'Designación de Centro de Trauma Nivel 1'}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                          <span className="text-sm font-medium text-blue-900">
                                            {language === 'en' ? 'UCLA teaching hospital' : 'Hospital de enseñanza de UCLA'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-6">
                                    <div>
                                      <h4 className="text-lg font-semibold text-gray-900 mb-3">
                                        {language === 'en' ? 'Accreditations' : 'Acreditaciones'}
                                      </h4>
                                      <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                          <span className="text-sm font-medium text-green-900">
                                            {language === 'en' ? 'Joint Commission Accredited' : 'Acreditado por Joint Commission'}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                          <span className="text-sm font-medium text-green-900">
                                            {language === 'en' ? 'Magnet Recognition Program' : 'Programa de Reconocimiento Magnet'}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                          <span className="text-sm font-medium text-green-900">
                                            {language === 'en' ? 'ACS Verified Level 1 Trauma Center' : 'Centro de Trauma Nivel 1 Verificado por ACS'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Contact Information & Operating Hours */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Contact Information */}
                          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-6">
                              <div className="bg-blue-100 p-3 rounded-lg">
                                <Phone className="h-6 w-6 text-blue-600" />
                              </div>
                              <h4 className="text-lg font-semibold text-gray-900">{t[language].contactInformation}</h4>
                            </div>
                            <div className="space-y-4">
                              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                                <MapPin className="h-5 w-5 text-gray-500 mt-1 flex-shrink-0" />
                                <div>
                                  <div className="font-semibold text-gray-900 mb-1">1000 W Carson St</div>
                                  <div className="text-gray-600">Torrance, CA 90509</div>
                                </div>
                              </div>
                              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                                <Phone className="h-5 w-5 text-gray-500 mt-1 flex-shrink-0" />
                                <div>
                                  <div className="font-semibold text-gray-900 mb-1">(310) 222-2345</div>
                                  <div className="text-gray-600">{t[language].mainLine}</div>
                                </div>
                              </div>
                              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                                <Globe className="h-5 w-5 text-gray-500 mt-1 flex-shrink-0" />
                                <div>
                                  <a 
                                    href="https://dhs.lacounty.gov/harbor-ucla-medical-center/" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="font-semibold text-blue-600 hover:text-blue-800 block mb-1"
                                  >
                                    dhs.lacounty.gov/harbor-ucla-medical-center/
                                  </a>
                                  <div className="text-gray-600">{t[language].officialWebsite}</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Operating Hours */}
                          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-6">
                              <div className="bg-green-100 p-3 rounded-lg">
                                <Clock className="h-6 w-6 text-green-600" />
                              </div>
                              <h4 className="text-lg font-semibold text-gray-900">{t[language].operatingHours}</h4>
                            </div>
                            <div className="space-y-4">
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                  <span className="font-semibold text-green-900">{t[language].open24_7}</span>
                                </div>
                                <div className="text-green-800">
                                  {language === 'en' ? 'Emergency Department never closes' : 'Departamento de Emergencias nunca cierra'}
                                </div>
                              </div>
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h5 className="font-medium text-blue-900 mb-3">
                                  {language === 'en' ? 'Other Departments:' : 'Otros Departamentos:'}
                                </h5>
                                <div className="space-y-2 text-sm text-blue-800">
                                  <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    <span>{language === 'en' ? 'Outpatient Services: 6:00 AM - 6:00 PM' : 'Servicios Ambulatorios: 6:00 AM - 6:00 PM'}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    <span>{language === 'en' ? 'Visitor Hours: 8:00 AM - 8:00 PM' : 'Horario de Visitas: 8:00 AM - 8:00 PM'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Amenities and Services */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="bg-purple-100 p-3 rounded-lg">
                              <FirstAid className="h-6 w-6 text-purple-600" />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              {language === 'en' ? 'Amenities & Services' : 'Servicios y Comodidades'}
                            </h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                {language === 'en' ? 'Patient Amenities' : 'Comodidades para Pacientes'}
                              </h5>
                              <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                  <span className="text-sm font-medium text-blue-900">
                                    {language === 'en' ? 'Free WiFi' : 'WiFi Gratuito'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                  <span className="text-sm font-medium text-blue-900">
                                    {language === 'en' ? 'Cafeteria' : 'Cafetería'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                  <span className="text-sm font-medium text-blue-900">
                                    {language === 'en' ? 'Gift Shop' : 'Tienda de Regalos'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                  <span className="text-sm font-medium text-blue-900">
                                    {language === 'en' ? 'Parking Available' : 'Estacionamiento Disponible'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                {language === 'en' ? 'Support Services' : 'Servicios de Apoyo'}
                              </h5>
                              <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                  <span className="text-sm font-medium text-purple-900">
                                    {language === 'en' ? 'Interpreter Services' : 'Servicios de Interpretación'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                  <span className="text-sm font-medium text-purple-900">
                                    {language === 'en' ? 'Social Services' : 'Servicios Sociales'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                  <span className="text-sm font-medium text-purple-900">
                                    {language === 'en' ? 'Chaplain Services' : 'Servicios de Capellán'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                  <span className="text-sm font-medium text-purple-900">
                                    {language === 'en' ? 'Patient Relations' : 'Relaciones con Pacientes'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                {language === 'en' ? 'Accessibility' : 'Accesibilidad'}
                              </h5>
                              <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                  <span className="text-sm font-medium text-green-900">
                                    {language === 'en' ? 'ADA Compliant' : 'Cumple con ADA'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                  <span className="text-sm font-medium text-green-900">
                                    {language === 'en' ? 'Wheelchair Access' : 'Acceso para Sillas de Ruedas'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                  <span className="text-sm font-medium text-green-900">
                                    {language === 'en' ? 'Accessible Restrooms' : 'Baños Accesibles'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                  <span className="text-sm font-medium text-green-900">
                                    {language === 'en' ? 'Hearing Assistance' : 'Asistencia Auditiva'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Emergency Contact & Insurance Info */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Emergency Contact */}
                          <div className="bg-red-50 border border-red-200 rounded-xl shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-6">
                              <div className="bg-red-100 p-3 rounded-lg">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                              </div>
                              <h4 className="text-lg font-semibold text-red-900">
                                {language === 'en' ? 'Emergency Contact' : 'Contacto de Emergencia'}
                              </h4>
                            </div>
                            <div className="space-y-4">
                              <div className="flex items-center gap-4 p-4 bg-red-100 rounded-lg border border-red-300">
                                <div className="bg-red-600 p-2 rounded-lg">
                                  <Phone className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                  <div className="text-2xl font-bold text-red-900">911</div>
                                  <div className="text-sm font-medium text-red-700">
                                    {language === 'en' ? 'Life-threatening emergencies' : 'Emergencias que amenazan la vida'}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 p-4 bg-red-100 rounded-lg border border-red-300">
                                <div className="bg-red-500 p-2 rounded-lg">
                                  <Phone className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                  <div className="text-lg font-semibold text-red-900">(310) 222-2345</div>
                                  <div className="text-sm font-medium text-red-700">
                                    {language === 'en' ? 'Hospital main line' : 'Línea principal del hospital'}
                                  </div>
                                </div>
                              </div>
                              <div className="bg-red-200 border border-red-400 rounded-lg p-4">
                                <p className="text-sm font-medium text-red-900">
                                  {language === 'en' 
                                    ? 'For life-threatening emergencies, call 911 immediately. Do not drive yourself to the hospital.'
                                    : 'Para emergencias que amenazan la vida, llame al 911 inmediatamente. No conduzca usted mismo al hospital.'
                                  }
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Insurance Information */}
                          <div className="bg-blue-50 border border-blue-200 rounded-xl shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-6">
                              <div className="bg-blue-100 p-3 rounded-lg">
                                <Building className="h-6 w-6 text-blue-600" />
                              </div>
                              <h4 className="text-lg font-semibold text-blue-900">
                                {language === 'en' ? 'Insurance Information' : 'Información de Seguro'}
                              </h4>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <h5 className="font-semibold text-blue-800 mb-3">
                                  {language === 'en' ? 'Accepted Insurance:' : 'Seguros Aceptados:'}
                                </h5>
                                <div className="grid grid-cols-1 gap-2">
                                  {['Medi-Cal', 'Medicare', 'Blue Cross Blue Shield', 'Aetna', 'United Healthcare'].map((insurance) => (
                                    <div key={insurance} className="flex items-center gap-3 p-3 bg-blue-100 rounded-lg">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                      <span className="text-sm font-medium text-blue-900">{insurance}</span>
                                    </div>
                                  ))}
                                  <div className="flex items-center gap-3 p-3 bg-blue-100 rounded-lg">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-blue-900">
                                      {language === 'en' ? 'Most major insurance plans' : 'La mayoría de planes de seguro principales'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-blue-200 border border-blue-400 rounded-lg p-4">
                                <p className="text-sm font-medium text-blue-900">
                                  {language === 'en' 
                                    ? 'Emergency services are provided regardless of insurance status or ability to pay.'
                                    : 'Los servicios de emergencia se brindan independientemente del estado del seguro o la capacidad de pago.'
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Patient Resources */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="bg-indigo-100 p-3 rounded-lg">
                              <Info className="h-6 w-6 text-indigo-600" />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900">
                              {language === 'en' ? 'Patient Resources' : 'Recursos para Pacientes'}
                            </h4>
                          </div>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                              <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                                {language === 'en' ? 'Before Your Visit' : 'Antes de su Visita'}
                              </h5>
                              <div className="space-y-3">
                                {[
                                  language === 'en' ? 'Bring valid ID and insurance card' : 'Traiga ID válida y tarjeta de seguro',
                                  language === 'en' ? 'List of current medications' : 'Lista de medicamentos actuales',
                                  language === 'en' ? 'Emergency contact information' : 'Información de contacto de emergencia',
                                  language === 'en' ? 'Medical history summary' : 'Resumen de historial médico'
                                ].map((item, index) => (
                                  <div key={index} className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-indigo-900">{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                {language === 'en' ? 'During Your Visit' : 'Durante su Visita'}
                              </h5>
                              <div className="space-y-3">
                                {[
                                  language === 'en' ? 'Check in at registration desk' : 'Registrarse en el mostrador de registro',
                                  language === 'en' ? 'Triage assessment will prioritize care' : 'La evaluación de triaje priorizará la atención',
                                  language === 'en' ? 'Family member can accompany you' : 'Un familiar puede acompañarlo',
                                  language === 'en' ? 'Ask questions about your treatment' : 'Haga preguntas sobre su tratamiento'
                                ].map((item, index) => (
                                  <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                    <span className="text-sm font-medium text-green-900">{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-8 pt-6 border-t border-gray-200">
                            <h5 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              {language === 'en' ? 'Additional Resources' : 'Recursos Adicionales'}
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                                <div className="font-semibold text-gray-800 mb-2">
                                  {language === 'en' ? 'Patient Portal' : 'Portal del Paciente'}
                                </div>
                                <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">
                                  mylaharbor.org
                                </a>
                              </div>
                              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                                <div className="font-semibold text-gray-800 mb-2">
                                  {language === 'en' ? 'Financial Assistance' : 'Asistencia Financiera'}
                                </div>
                                <div className="text-gray-700 font-medium">(310) 222-1234</div>
                              </div>
                              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                                <div className="font-semibold text-gray-800 mb-2">
                                  {language === 'en' ? 'Medical Records' : 'Registros Médicos'}
                                </div>
                                <div className="text-gray-700 font-medium">(310) 222-5678</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Wait Times Graph Section */}
                      <div className="mb-8">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div className="bg-blue-100 p-3 rounded-lg">
                                <Clock className="h-6 w-6 text-blue-600" />
                              </div>
                              <h4 className="text-xl font-bold text-gray-900">
                                {language === 'en' ? 'Wait Times by Acuity Level Over Time' : 'Tiempos de Espera por Nivel de Acuidad a lo Largo del Tiempo'}
                              </h4>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                {language === 'en' ? 'Today' : 'Hoy'}
                              </Button>
                              <Button variant="outline" size="sm">
                                {language === 'en' ? 'Yesterday' : 'Ayer'}
                              </Button>
                              <Button variant="outline" size="sm">
                                {language === 'en' ? 'Week' : 'Semana'}
                              </Button>
                            </div>
                          </div>

                          {/* Graph Container */}
                          <div className="relative bg-gray-50 rounded-lg p-6 mb-6" style={{ height: '300px' }}>
                            {/* Y-axis label */}
                            <div className="absolute left-4 top-1/2 transform -rotate-90 text-sm text-gray-600 font-medium origin-center">
                              {language === 'en' ? 'Wait Time (min)' : 'Tiempo de Espera (min)'}
                            </div>
                            
                            {/* Graph area */}
                            <div className="ml-12 mr-4 h-full relative">
                              {/* Y-axis grid lines and labels */}
                              <div className="absolute left-0 top-0 h-full border-l border-gray-300">
                                {[280, 210, 140, 70, 0].map((value, index) => (
                                  <div key={value} className="absolute left-0 w-full border-t border-gray-200" style={{ top: `${index * 25}%` }}>
                                    <span className="absolute -left-8 -mt-2 text-xs text-gray-500">{value}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Current time indicator */}
                              <div className="absolute right-1/4 top-0 h-full">
                                <div className="w-px h-full bg-blue-600 opacity-75"></div>
                                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-blue-600 font-medium whitespace-nowrap">
                                  {language === 'en' ? 'Current Time' : 'Tiempo Actual'}
                                </div>
                              </div>

                              {/* Time axis labels */}
                              <div className="absolute -bottom-8 left-0 w-full flex justify-between text-xs text-gray-500">
                                <span>12 AM</span>
                                <span>3 AM</span>
                                <span>6 AM</span>
                                <span>9 AM</span>
                                <span>12 PM</span>
                                <span>3 PM</span>
                                <span>6 PM</span>
                                <span>9 PM</span>
                              </div>

                              {/* Graph lines - SVG for better line drawing */}
                              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                {/* Level 1 - Red line (lowest, near bottom) */}
                                <polyline
                                  fill="none"
                                  stroke="#EF4444"
                                  strokeWidth="0.5"
                                  points="0,90 12,88 25,85 37,82 50,80 62,78 75,82 87,85 100,88"
                                />
                                {/* Level 2 - Orange line */}
                                <polyline
                                  fill="none"
                                  stroke="#F97316"
                                  strokeWidth="0.5"
                                  points="0,85 12,83 25,80 37,75 50,70 62,65 75,68 87,72 100,75"
                                />
                                {/* Level 3 - Yellow line */}
                                <polyline
                                  fill="none"
                                  stroke="#EAB308"
                                  strokeWidth="0.5"
                                  points="0,70 12,65 25,55 37,45 50,40 62,35 75,30 87,25 100,20"
                                />
                                {/* Level 4 - Blue line */}
                                <polyline
                                  fill="none"
                                  stroke="#3B82F6"
                                  strokeWidth="0.5"
                                  points="0,45 12,40 25,35 37,25 50,15 62,10 75,8 87,12 100,18"
                                />
                                {/* Level 5 - Green line (highest, near top) */}
                                <polyline
                                  fill="none"
                                  stroke="#10B981"
                                  strokeWidth="0.5"
                                  points="0,50 12,45 25,40 37,30 50,20 62,15 75,12 87,15 100,22"
                                />
                              </svg>
                            </div>
                          </div>

                          {/* Legend */}
                          <div className="flex justify-center gap-6 mb-6">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <span className="text-sm text-gray-700">Level 1</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                              <span className="text-sm text-gray-700">Level 2</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                              <span className="text-sm text-gray-700">Level 3</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <span className="text-sm text-gray-700">Level 4</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="text-sm text-gray-700">Level 5</span>
                            </div>
                          </div>

                          {/* Peak times summary */}
                          <div className="grid grid-cols-5 gap-4">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                              <div className="font-semibold text-red-900 text-sm">L1</div>
                              <div className="text-xs text-red-700 mt-1">
                                {language === 'en' ? 'Peak: 70 min' : 'Pico: 70 min'}
                              </div>
                            </div>
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                              <div className="font-semibold text-orange-900 text-sm">L2</div>
                              <div className="text-xs text-orange-700 mt-1">
                                {language === 'en' ? 'Peak: 120 min' : 'Pico: 120 min'}
                              </div>
                            </div>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                              <div className="font-semibold text-yellow-900 text-sm">L3</div>
                              <div className="text-xs text-yellow-700 mt-1">
                                {language === 'en' ? 'Peak: 220 min' : 'Pico: 220 min'}
                              </div>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                              <div className="font-semibold text-blue-900 text-sm">L4</div>
                              <div className="text-xs text-blue-700 mt-1">
                                {language === 'en' ? 'Peak: 270 min' : 'Pico: 270 min'}
                              </div>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                              <div className="font-semibold text-green-900 text-sm">L5</div>
                              <div className="text-xs text-green-700 mt-1">
                                {language === 'en' ? 'Peak: 190 min' : 'Pico: 190 min'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Wait Times by Condition Severity - Detailed */}
                      <div className="mb-8">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="bg-orange-100 p-3 rounded-lg">
                            <Clock className="h-6 w-6 text-orange-600" />
                          </div>
                          <h4 className="text-xl font-bold text-gray-900">{t[language].waitTimesByConditionSeverity}</h4>
                        </div>
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

                        {/* Specialized Services */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="bg-red-100 p-3 rounded-lg">
                              <Heart className="h-6 w-6 text-red-600" />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900">{t[language].serviciosEspecializadosDisponibles}</h4>
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                  <Plus className="h-5 w-5 text-red-600" />
                                </div>
                                <span className="font-semibold text-red-900">{t[language].centroDeTrauma}</span>
                              </div>
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-pink-50 rounded-lg border border-pink-200 hover:bg-pink-100 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                                  <Heart className="h-5 w-5 text-pink-600" />
                                </div>
                                <span className="font-semibold text-pink-900">{t[language].atencionCardiaca}</span>
                              </div>
                              <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
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
            <div className="text-center mb-8">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t[language].emergencyCareGuidance}</h2>
              <p className="text-gray-600 max-w-4xl mx-auto text-lg leading-relaxed">
                {t[language].emergencyCareGuidanceSubtitle}
              </p>
            </div>

            {/* Life-Threatening Emergency Alert */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-900 mb-2">{t[language].lifeThreatening}</h3>
                    <p className="text-red-800 leading-relaxed">
                      {t[language].lifeThreateneingDescription}
                    </p>
                  </div>
                </div>
                <Button className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3">
                  📞 {t[language].call911}
                </Button>
              </div>
            </div>

            {/* Care Guide Navigation */}
            <div className="flex border-b border-gray-200 mb-8">
              <Button
                variant={careGuideSection === 'recommendation' ? 'default' : 'ghost'}
                onClick={() => setCareGuideSection('recommendation')}
                className={`flex items-center gap-2 rounded-none border-b-2 px-6 py-3 ${
                  careGuideSection === 'recommendation' 
                    ? 'border-blue-600 bg-transparent text-blue-600 hover:bg-blue-50' 
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Heart className="h-4 w-4" />
                {t[language].careRecommendation}
              </Button>
              <Button
                variant={careGuideSection === 'options' ? 'default' : 'ghost'}
                onClick={() => setCareGuideSection('options')}
                className={`flex items-center gap-2 rounded-none border-b-2 px-6 py-3 ${
                  careGuideSection === 'options' 
                    ? 'border-blue-600 bg-transparent text-blue-600 hover:bg-blue-50' 
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <MapPin className="h-4 w-4" />
                {t[language].careOptions}
              </Button>
              <Button
                variant={careGuideSection === 'prepare' ? 'default' : 'ghost'}
                onClick={() => setCareGuideSection('prepare')}
                className={`flex items-center gap-2 rounded-none border-b-2 px-6 py-3 ${
                  careGuideSection === 'prepare' 
                    ? 'border-blue-600 bg-transparent text-blue-600 hover:bg-blue-50' 
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Clock className="h-4 w-4" />
                {t[language].prepareForVisit}
              </Button>
            </div>

            {/* Care Guide Content */}
            {careGuideSection === 'recommendation' && (
              <div className="space-y-8">
                {/* Enhanced Acuity-Based Assessment */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <div className="mb-6">
                    <div className="text-sm text-gray-600 mb-2">
                      {language === 'en' 
                        ? 'Get personalized guidance on urgent care vs emergency room'
                        : 'Obtenga orientación personalizada sobre atención urgente vs sala de emergencias'
                      }
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {language === 'en' 
                        ? 'Enhanced Acuity-Based Assessment'
                        : 'Evaluación Mejorada Basada en Acuidad'
                      }
                    </h3>
                    <p className="text-gray-600">
                      {language === 'en' 
                        ? 'Select your symptoms to receive a clinical acuity level assessment (1-5) with personalized care recommendations and estimated wait times.'
                        : 'Seleccione sus síntomas para recibir una evaluación de nivel de acuidad clínica (1-5) con recomendaciones de atención personalizadas y tiempos de espera estimados.'
                      }
                    </p>
                  </div>

                  {/* Insurance Coverage Section */}
                  <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-xs font-bold">1</span>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {language === 'en' ? 'Insurance Coverage' : 'Cobertura de Seguro'}
                      </h4>
                    </div>
                    <p className="text-sm text-blue-700 mb-4">
                      {language === 'en' 
                        ? 'Select your insurance type to see personalized cost estimates'
                        : 'Seleccione su tipo de seguro para ver estimaciones de costo personalizadas'
                      }
                    </p>
                    <Select value={selectedInsurance} onValueChange={setSelectedInsurance}>
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue placeholder={
                          language === 'en' ? 'Select your insurance type...' : 'Seleccione su tipo de seguro...'
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {insuranceOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Symptom Selection Section */}
                  <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-xs font-bold">2</span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {language === 'en' ? 'Select Your Symptoms' : 'Seleccione sus Síntomas'}
                        </h4>
                      </div>
                      {selectedSymptoms.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllSymptoms}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          {language === 'en' ? 'Reset' : 'Reiniciar'}
                        </Button>
                      )}
                    </div>

                    {/* Search symptoms input */}
                    <div className="relative mb-6">
                      <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder={language === 'en' ? 'Search symptoms...' : 'Buscar síntomas...'}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Selected Symptoms */}
                    {selectedSymptoms.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-gray-900">
                            {language === 'en' ? `Selected Symptoms (${selectedSymptoms.length})` : `Síntomas Seleccionados (${selectedSymptoms.length})`}
                          </h5>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllSymptoms}
                            className="text-gray-600 hover:text-gray-900 text-sm"
                          >
                            <X className="h-4 w-4 mr-1" />
                            {language === 'en' ? 'Clear All' : 'Limpiar Todo'}
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedSymptoms.map((symptomId) => {
                            const allSymptoms = symptomCategories.flatMap(cat => cat.symptoms)
                            const symptom = allSymptoms.find(s => s.id === symptomId)
                            if (!symptom) return null
                            
                            return (
                              <div
                                key={symptomId}
                                className="flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm"
                              >
                                <AlertTriangle className="h-3 w-3" />
                                <span>{symptom.name}</span>
                                <span className="font-semibold">Level {symptom.acuityLevel}</span>
                                <button
                                  onClick={() => handleSymptomToggle(symptomId)}
                                  className="ml-1 hover:bg-red-200 rounded-full p-0.5"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Assessment Button */}
                    {selectedSymptoms.length > 0 && (
                      <Button
                        onClick={performAssessment}
                        className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 mb-6"
                      >
                        <MagnifyingGlass className="h-4 w-4 mr-2" />
                        {language === 'en' ? 'Get Acuity Assessment & Wait Time' : 'Obtener Evaluación de Acuidad y Tiempo de Espera'}
                      </Button>
                    )}
                  </div>

                  {/* Assessment Result */}
                  {showAssessmentResult && selectedSymptoms.length > 0 && (
                    <div className="mb-8">
                      {(() => {
                        const result = getAssessmentResult()
                        if (!result) return null

                        // Level 1 - Emergency/Critical
                        if (result.acuityLevel === 1) {
                          return (
                            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
                              <div className="flex items-start gap-4 mb-6">
                                <div className="bg-red-500 p-2 rounded-lg">
                                  <Phone className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-red-900 mb-2">
                                    {language === 'en' ? 'Acuity Level 1 - Immediate' : 'Nivel de Acuidad 1 - Inmediato'}
                                  </h3>
                                  <div className="flex items-center gap-2 mb-3">
                                    <Siren className="h-5 w-5 text-red-600" />
                                    <span className="text-lg font-bold text-red-900">
                                      {language === 'en' ? 'Call 911 Immediately' : 'Llame al 911 Inmediatamente'}
                                    </span>
                                  </div>
                                  <p className="text-red-800 leading-relaxed">
                                    {language === 'en' 
                                      ? 'Your symptoms indicate a potentially life-threatening emergency requiring immediate medical intervention.'
                                      : 'Sus síntomas indican una emergencia potencialmente mortal que requiere intervención médica inmediata.'
                                    }
                                  </p>
                                </div>
                              </div>

                              {/* Wait Time Info */}
                              <div className="bg-white rounded-lg p-4 mb-6 border border-red-200">
                                <div className="flex items-center gap-2 mb-3">
                                  <Clock className="h-5 w-5 text-gray-600" />
                                  <span className="font-medium text-gray-900">
                                    {language === 'en' ? 'Estimated Wait Time IN THE ER for your acuity level' : 'Tiempo de Espera Estimado EN LA SALA DE EMERGENCIAS para su nivel de acuidad'}
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 gap-6 text-center">
                                  <div>
                                    <div className="text-3xl font-bold text-green-600">0 min</div>
                                    <div className="text-sm text-gray-600">{language === 'en' ? 'Predicted Wait' : 'Espera Predicha'}</div>
                                  </div>
                                  <div>
                                    <div className="text-3xl font-bold text-red-600">Level 1</div>
                                    <div className="text-sm text-gray-600">{language === 'en' ? 'Predicted Acuity Level' : 'Nivel de Acuidad Predicho'}</div>
                                  </div>
                                  <div>
                                    <div className="text-3xl font-bold text-blue-600">95%</div>
                                    <div className="text-sm text-gray-600">{language === 'en' ? 'Confidence' : 'Confianza'}</div>
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-4">
                                <Button className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3">
                                  <Phone className="h-4 w-4 mr-2" />
                                  {language === 'en' ? 'Call 911' : 'Llamar 911'}
                                </Button>
                                <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                                  <Phone className="h-4 w-4 mr-2" />
                                  {language === 'en' ? 'Call Harbor Medical Center' : 'Llamar al Centro Médico Harbor'}
                                </Button>
                              </div>
                            </div>
                          )
                        }

                        // Level 2 - Visit Emergency Room Now
                        if (result.acuityLevel === 2) {
                          return (
                            <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-6">
                              <div className="flex items-start gap-4 mb-6">
                                <div className="bg-orange-500 p-2 rounded-lg">
                                  <AlertTriangle className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-orange-900 mb-2">
                                    {language === 'en' ? 'Acuity Level 2 - Urgent' : 'Nivel de Acuidad 2 - Urgente'}
                                  </h3>
                                  <div className="flex items-center gap-2 mb-3">
                                    <Plus className="h-5 w-5 text-orange-600" />
                                    <span className="text-lg font-bold text-orange-900">
                                      {language === 'en' ? 'Visit Emergency Room Now' : 'Visite la Sala de Emergencias Ahora'}
                                    </span>
                                  </div>
                                  <p className="text-orange-800 leading-relaxed">
                                    {language === 'en' 
                                      ? 'Your symptoms require urgent medical attention. Visit the emergency room as soon as possible.'
                                      : 'Sus síntomas requieren atención médica urgente. Visite la sala de emergencias lo antes posible.'
                                    }
                                  </p>
                                </div>
                              </div>

                              <div className="bg-white rounded-lg p-4 mb-6 border border-orange-200">
                                <div className="grid grid-cols-3 gap-6 text-center">
                                  <div>
                                    <div className="text-3xl font-bold text-green-600">&lt;15 min</div>
                                    <div className="text-sm text-gray-600">{language === 'en' ? 'Predicted Wait' : 'Espera Predicha'}</div>
                                  </div>
                                  <div>
                                    <div className="text-3xl font-bold text-orange-600">Level 2</div>
                                    <div className="text-sm text-gray-600">{language === 'en' ? 'Predicted Acuity Level' : 'Nivel de Acuidad Predicho'}</div>
                                  </div>
                                  <div>
                                    <div className="text-3xl font-bold text-blue-600">92%</div>
                                    <div className="text-sm text-gray-600">{language === 'en' ? 'Confidence' : 'Confianza'}</div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-4">
                                <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3">
                                  <MapPin className="h-4 w-4 mr-2" />
                                  {language === 'en' ? 'Go to Emergency Room' : 'Ir a Sala de Emergencias'}
                                </Button>
                                <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                                  <Phone className="h-4 w-4 mr-2" />
                                  {language === 'en' ? 'Call Harbor Medical Center' : 'Llamar al Centro Médico Harbor'}
                                </Button>
                              </div>
                            </div>
                          )
                        }

                        // Level 3 - Urgent Care Recommended
                        if (result.acuityLevel === 3) {
                          return (
                            <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-6">
                              <div className="flex items-start gap-4 mb-6">
                                <div className="bg-yellow-500 p-2 rounded-lg">
                                  <Clock className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                                    {language === 'en' ? 'Acuity Level 3 - Less Urgent' : 'Nivel de Acuidad 3 - Menos Urgente'}
                                  </h3>
                                  <div className="flex items-center gap-2 mb-3">
                                    <FirstAid className="h-5 w-5 text-yellow-600" />
                                    <span className="text-lg font-bold text-yellow-900">
                                      {language === 'en' ? 'Urgent Care Recommended' : 'Se Recomienda Atención Urgente'}
                                    </span>
                                  </div>
                                  <p className="text-yellow-800 leading-relaxed">
                                    {language === 'en' 
                                      ? 'Your symptoms can be effectively treated at an urgent care center with shorter wait times.'
                                      : 'Sus síntomas pueden ser tratados eficazmente en un centro de atención urgente con tiempos de espera más cortos.'
                                    }
                                  </p>
                                </div>
                              </div>

                              <div className="bg-white rounded-lg p-4 mb-6 border border-yellow-200">
                                <div className="grid grid-cols-3 gap-6 text-center">
                                  <div>
                                    <div className="text-3xl font-bold text-orange-600">693 min</div>
                                    <div className="text-sm text-gray-600">{language === 'en' ? 'ER Wait Time' : 'Tiempo de Espera ER'}</div>
                                  </div>
                                  <div>
                                    <div className="text-3xl font-bold text-yellow-600">Level 3</div>
                                    <div className="text-sm text-gray-600">{language === 'en' ? 'Predicted Acuity Level' : 'Nivel de Acuidad Predicho'}</div>
                                  </div>
                                  <div>
                                    <div className="text-3xl font-bold text-blue-600">88%</div>
                                    <div className="text-sm text-gray-600">{language === 'en' ? 'Confidence' : 'Confianza'}</div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-4">
                                <Button className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold px-6 py-3">
                                  <Clock className="h-4 w-4 mr-2" />
                                  {language === 'en' ? 'Find Urgent Care' : 'Buscar Atención Urgente'}
                                </Button>
                                <Button variant="outline" className="border-yellow-300 text-yellow-700 hover:bg-yellow-50">
                                  <MapPin className="h-4 w-4 mr-2" />
                                  {language === 'en' ? 'Still Go to ER' : 'Aún Ir a ER'}
                                </Button>
                              </div>
                            </div>
                          )
                        }

                        // Level 4 - Primary Care or Telehealth
                        if (result.acuityLevel === 4) {
                          return (
                            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
                              <div className="flex items-start gap-4 mb-6">
                                <div className="bg-blue-500 p-2 rounded-lg">
                                  <Phone className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                                    {language === 'en' ? 'Acuity Level 4 - Non-Urgent' : 'Nivel de Acuidad 4 - No Urgente'}
                                  </h3>
                                  <div className="flex items-center gap-2 mb-3">
                                    <Building className="h-5 w-5 text-blue-600" />
                                    <span className="text-lg font-bold text-blue-900">
                                      {language === 'en' ? 'Primary Care or Telehealth Recommended' : 'Se Recomienda Atención Primaria o Telemedicina'}
                                    </span>
                                  </div>
                                  <p className="text-blue-800 leading-relaxed">
                                    {language === 'en' 
                                      ? 'Your symptoms are better suited for a primary care visit or telehealth consultation, which will be faster and more cost-effective.'
                                      : 'Sus síntomas son más adecuados para una visita de atención primaria o consulta de telemedicina, que será más rápida y rentable.'
                                    }
                                  </p>
                                </div>
                              </div>

                              <div className="bg-white rounded-lg p-4 mb-6 border border-blue-200">
                                <div className="grid grid-cols-3 gap-6 text-center">
                                  <div>
                                    <div className="text-3xl font-bold text-red-600">1020 min</div>
                                    <div className="text-sm text-gray-600">{language === 'en' ? 'ER Wait Time' : 'Tiempo de Espera ER'}</div>
                                  </div>
                                  <div>
                                    <div className="text-3xl font-bold text-blue-600">Level 4</div>
                                    <div className="text-sm text-gray-600">{language === 'en' ? 'Predicted Acuity Level' : 'Nivel de Acuidad Predicho'}</div>
                                  </div>
                                  <div>
                                    <div className="text-3xl font-bold text-blue-600">85%</div>
                                    <div className="text-sm text-gray-600">{language === 'en' ? 'Confidence' : 'Confianza'}</div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-4">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3">
                                  <Phone className="h-4 w-4 mr-2" />
                                  {language === 'en' ? 'Start Telehealth' : 'Iniciar Telemedicina'}
                                </Button>
                                <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                                  <Building className="h-4 w-4 mr-2" />
                                  {language === 'en' ? 'Find Primary Care' : 'Buscar Atención Primaria'}
                                </Button>
                              </div>
                            </div>
                          )
                        }

                        // Level 5 - Primary Care or Telehealth
                        if (result.acuityLevel === 5) {
                          return (
                            <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-6">
                              <div className="flex items-start gap-4 mb-6">
                                <div className="bg-green-500 p-2 rounded-lg">
                                  <CheckCircle className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                                    {language === 'en' ? 'Acuity Level 5 - Low Acuity' : 'Nivel de Acuidad 5 - Baja Acuidad'}
                                  </h3>
                                  <div className="flex items-center gap-2 mb-3">
                                    <Phone className="h-5 w-5 text-green-600" />
                                    <span className="text-lg font-bold text-green-900">
                                      {language === 'en' ? 'Telehealth or Routine Care Recommended' : 'Se Recomienda Telemedicina o Atención Rutinaria'}
                                    </span>
                                  </div>
                                  <p className="text-green-800 leading-relaxed">
                                    {language === 'en' 
                                      ? 'Your symptoms can likely be addressed through telehealth, a pharmacy clinic, or by scheduling a routine primary care appointment.'
                                      : 'Sus síntomas probablemente pueden ser atendidos a través de telemedicina, una clínica de farmacia, o programando una cita de rutina de atención primaria.'
                                    }
                                  </p>
                                </div>
                              </div>

                              <div className="bg-white rounded-lg p-4 mb-6 border border-green-200">
                                <div className="grid grid-cols-3 gap-6 text-center">
                                  <div>
                                    <div className="text-3xl font-bold text-red-600">943 min</div>
                                    <div className="text-sm text-gray-600">{language === 'en' ? 'ER Wait Time' : 'Tiempo de Espera ER'}</div>
                                  </div>
                                  <div>
                                    <div className="text-3xl font-bold text-green-600">Level 5</div>
                                    <div className="text-sm text-gray-600">{language === 'en' ? 'Predicted Acuity Level' : 'Nivel de Acuidad Predicho'}</div>
                                  </div>
                                  <div>
                                    <div className="text-3xl font-bold text-blue-600">82%</div>
                                    <div className="text-sm text-gray-600">{language === 'en' ? 'Confidence' : 'Confianza'}</div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-4">
                                <Button className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3">
                                  <Phone className="h-4 w-4 mr-2" />
                                  {language === 'en' ? 'Start Telehealth' : 'Iniciar Telemedicina'}
                                </Button>
                                <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                                  <Building className="h-4 w-4 mr-2" />
                                  {language === 'en' ? 'Schedule Primary Care' : 'Programar Atención Primaria'}
                                </Button>
                              </div>
                            </div>
                          )
                        }

                        return null
                      })()}
                    </div>
                  )}

                  {/* Symptom Categories */}
                  <div className="space-y-6">
                    {symptomCategories.map((category) => (
                      <div key={category.name}>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                          {category.name}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {category.symptoms.map((symptom) => {
                            const isSelected = selectedSymptoms.includes(symptom.id)
                            const isThoughtsOfHarm = symptom.id === 'thoughts-harm'
                            
                            // Define colors based on acuity level
                            const getAcuityColors = (level: number, isSelected: boolean) => {
                              const colorMap = {
                                1: {
                                  bg: isSelected ? 'bg-red-50' : 'bg-white',
                                  border: isSelected ? 'border-red-300 ring-2 ring-red-200' : 'border-red-200 hover:border-red-300',
                                  text: 'text-red-900',
                                  badge: 'bg-red-500 text-white'
                                },
                                2: {
                                  bg: isSelected ? 'bg-orange-50' : 'bg-white',
                                  border: isSelected ? 'border-orange-300 ring-2 ring-orange-200' : 'border-orange-200 hover:border-orange-300',
                                  text: 'text-orange-900',
                                  badge: 'bg-orange-500 text-white'
                                },
                                3: {
                                  bg: isSelected ? 'bg-yellow-50' : 'bg-white',
                                  border: isSelected ? 'border-yellow-300 ring-2 ring-yellow-200' : 'border-yellow-200 hover:border-yellow-300',
                                  text: 'text-yellow-900',
                                  badge: 'bg-yellow-500 text-white'
                                },
                                4: {
                                  bg: isSelected ? 'bg-blue-50' : 'bg-white',
                                  border: isSelected ? 'border-blue-300 ring-2 ring-blue-200' : 'border-blue-200 hover:border-blue-300',
                                  text: 'text-blue-900',
                                  badge: 'bg-blue-500 text-white'
                                },
                                5: {
                                  bg: isSelected ? 'bg-green-50' : 'bg-white',
                                  border: isSelected ? 'border-green-300 ring-2 ring-green-200' : 'border-green-200 hover:border-green-300',
                                  text: 'text-green-900',
                                  badge: 'bg-green-500 text-white'
                                }
                              }
                              return colorMap[level as keyof typeof colorMap] || colorMap[5]
                            }

                            const colors = getAcuityColors(symptom.acuityLevel, isSelected)
                            
                            return (
                              <div
                                key={symptom.id}
                                onClick={() => handleSymptomToggle(symptom.id)}
                                className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${colors.bg} ${colors.border}`}
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    {getSymptomIcon(symptom.id, symptom.category)}
                                    {isSelected && (
                                      <CheckCircle className="h-5 w-5 text-red-600" />
                                    )}
                                  </div>
                                  <div className="text-xs font-semibold text-gray-600">
                                    {language === 'en' ? `Acuity Level ${symptom.acuityLevel}` : `Nivel de Acuidad ${symptom.acuityLevel}`}
                                  </div>
                                </div>
                                <div className="text-sm font-medium text-gray-900 leading-tight">
                                  {symptom.name}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Disclaimer and Medical Information Boxes */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* When in Doubt, Seek Immediate Care */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                      <h3 className="text-lg font-semibold text-red-900">
                        {language === 'en' ? 'When in Doubt, Seek Immediate Care' : 'Cuando Tenga Dudas, Busque Atención Inmediata'}
                      </h3>
                    </div>
                    <p className="text-sm text-red-800 mb-4">
                      {language === 'en' 
                        ? 'This enhanced acuity-based assessment provides clinical-grade triaging and wait time predictions, but should not replace professional medical judgment. The 5-level acuity system helps prioritize care based on medical urgency.'
                        : 'Esta evaluación mejorada basada en acuidad proporciona triaje de grado clínico y predicciones de tiempo de espera, pero no debe reemplazar el juicio médico profesional. El sistema de acuidad de 5 niveles ayuda a priorizar la atención basada en la urgencia médica.'
                      }
                    </p>
                    <p className="text-sm font-medium text-red-900">
                      {language === 'en' 
                        ? 'Always call 911 immediately for Acuity Level 1 conditions: Life-threatening symptoms require immediate emergency response.'
                        : 'Siempre llame al 911 inmediatamente para condiciones de Nivel de Acuidad 1: Los síntomas que amenazan la vida requieren respuesta de emergencia inmediata.'
                      }
                    </p>
                  </div>

                  {/* Medical Disclaimer */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <Info className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                      <h3 className="text-lg font-semibold text-blue-900">
                        {language === 'en' ? 'Medical Disclaimer' : 'Descargo de Responsabilidad Médica'}
                      </h3>
                    </div>
                    <div className="space-y-3 text-sm text-blue-800">
                      <p>
                        {language === 'en' 
                          ? 'The information provided on this page is for educational purposes only and should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider about any health concerns or before making any decisions related to your health or treatment.'
                          : 'La información proporcionada en esta página es solo para fines educativos y no debe usarse como sustituto del consejo médico profesional, diagnóstico o tratamiento. Siempre consulte con un proveedor de atención médica calificado sobre cualquier preocupación de salud o antes de tomar cualquier decisión relacionada con su salud o tratamiento.'
                        }
                      </p>
                      <p className="font-medium">
                        {language === 'en' 
                          ? 'In case of a medical emergency, call 911 immediately. This facility is not responsible for any actions taken based on the information provided through this guidance tool.'
                          : 'En caso de emergencia médica, llame al 911 inmediatamente. Esta instalación no es responsable de ninguna acción tomada basada en la información proporcionada a través de esta herramienta de orientación.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {careGuideSection === 'options' && (
              <div className="space-y-8">
                {/* Header */}
                <div className="text-left">
                  <div className="text-sm text-gray-600 mb-2">
                    {language === 'en' ? 'Alternative care facilities' : 'Instalaciones de atención alternativa'}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {language === 'en' ? 'Alternative Care Options' : 'Opciones de Atención Alternativa'}
                  </h3>
                  <p className="text-gray-600 max-w-4xl">
                    {language === 'en' 
                      ? 'Many health concerns can be addressed faster and more cost-effectively outside the emergency room.'
                      : 'Muchas preocupaciones de salud pueden ser abordadas más rápido y de manera más rentable fuera de la sala de emergencias.'
                    }
                  </p>
                </div>

                {/* Location and Filter Controls */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Location-Based Classification */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <h4 className="text-lg font-semibold text-gray-900">
                        {language === 'en' ? 'Location-Based Classification' : 'Clasificación Basada en Ubicación'}
                      </h4>
                    </div>
                    
                    {/* Enable Location Toggle */}
                    <div className="mb-4">
                      <button 
                        onClick={handleEnableLocation}
                        disabled={locationEnabled || userLocation !== null}
                        className={`flex items-center gap-2 text-sm font-medium hover:text-blue-700 ${
                          locationEnabled || userLocation !== null 
                            ? 'text-green-600 cursor-default' 
                            : 'text-blue-600 cursor-pointer'
                        }`}
                      >
                        <div className={`w-4 h-4 border rounded flex items-center justify-center ${
                          locationEnabled || userLocation !== null 
                            ? 'border-green-600 bg-green-600' 
                            : 'border-blue-600'
                        }`}>
                          {(locationEnabled || userLocation !== null) && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </div>
                        {(locationEnabled || userLocation !== null) 
                          ? (language === 'en' ? 'Location Enabled - Sorting by Distance' : 'Ubicación Habilitada - Ordenando por Distancia')
                          : (language === 'en' ? 'Enable Location for Distance Sorting' : 'Habilitar Ubicación para Ordenar por Distancia')
                        }
                      </button>
                    </div>

                    {/* Location Warning */}
                    {!locationEnabled && !userLocation && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-orange-900 text-sm">
                              {language === 'en' ? 'Location unavailable' : 'Ubicación no disponible'}
                            </div>
                            <div className="text-orange-700 text-xs mt-1">
                              {language === 'en' ? 'Enable location or enter zip code below for distance-based sorting' : 'Habilite la ubicación o ingrese el código postal a continuación para ordenar por distancia'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Location Success */}
                    {(locationEnabled || userLocation) && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-medium text-green-900 text-sm">
                              {language === 'en' ? 'Location enabled' : 'Ubicación habilitada'}
                            </div>
                            <div className="text-green-700 text-xs mt-1">
                              {language === 'en' ? 'Urgent care centers are now sorted by distance from your location' : 'Los centros de atención urgente ahora están ordenados por distancia desde su ubicación'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Manual Location Entry */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="font-medium text-blue-900 text-sm mb-2">
                            {language === 'en' ? 'Enter Zip Code for Manual Location' : 'Ingrese Código Postal para Ubicación Manual'}
                          </div>
                          <div className="text-blue-700 text-xs mb-3">
                            {language === 'en' 
                              ? 'Enter your zip code to classify urgent care centers by proximity to your location.'
                              : 'Ingrese su código postal para clasificar los centros de atención urgente por proximidad a su ubicación.'
                            }
                          </div>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={manualZipCode}
                              onChange={(e) => setManualZipCode(e.target.value)}
                              placeholder={language === 'en' ? 'Enter 5-digit zip code' : 'Ingrese código postal de 5 dígitos'}
                              className="flex-1 px-3 py-2 border border-blue-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              maxLength={5}
                            />
                            <Button 
                              size="sm" 
                              onClick={handleZipCodeClassify}
                              disabled={!manualZipCode.trim() || isCalculatingProximity}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                            >
                              {isCalculatingProximity ? (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                                  {language === 'en' ? 'Loading...' : 'Cargando...'}
                                </>
                              ) : (
                                <>
                                  <MagnifyingGlass className="h-4 w-4 mr-1" />
                                  {language === 'en' ? 'Classify by Zip Code' : 'Clasificar por Código Postal'}
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cost Transparency Filter */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Building className="h-5 w-5 text-green-600" />
                      <h4 className="text-lg font-semibold text-gray-900">
                        {language === 'en' ? 'Cost Transparency Filter' : 'Filtro de Transparencia de Costos'}
                      </h4>
                    </div>
                    
                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={
                          language === 'en' ? 'Select your insurance type' : 'Seleccione su tipo de seguro'
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="medicare">Medicare</SelectItem>
                        <SelectItem value="medicaid">Medicaid/Medi-Cal</SelectItem>
                        <SelectItem value="private">Private Insurance</SelectItem>
                        <SelectItem value="uninsured">Uninsured/Self-Pay</SelectItem>
                        <SelectItem value="covered-ca">Covered California</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="text-green-800 text-xs leading-relaxed break-words">
                          {language === 'en' 
                            ? 'All costs shown are adapted to specific insurance plans including copays, coinsurance and out-of-pocket maximums'
                            : 'Todos los costos mostrados están adaptados a planes de seguro específicos incluyendo copagos, coseguro y máximos de gastos de bolsillo'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Urgent Care Centers */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Clock className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">
                          {language === 'en' ? 'Urgent Care Centers' : 'Centros de Atención Urgente'}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {language === 'en' 
                            ? 'For conditions that are not life-threatening but need same-day care'
                            : 'Para condiciones que no amenazan la vida que necesitan atención el mismo día'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-8 mb-6">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-600">
                            {language === 'en' ? 'Wait Time' : 'Tiempo de Espera'}
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-blue-600 mb-1">15-45 {language === 'en' ? 'minutes' : 'minutos'}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Building className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-600">
                            {language === 'en' ? 'Your expected cost without insurance or if your deductible hasn\'t been met yet' : 'Su costo esperado sin seguro o si su deducible aún no se ha cumplido'}
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-green-600 mb-1">$150-$300</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-gray-600">
                            {language === 'en' ? 'Availability' : 'Disponibilidad'}
                          </span>
                        </div>
                        <div className="text-lg font-bold text-purple-600">
                          {language === 'en' ? '7 days a week, extended hours' : '7 días a la semana, horario extendido'}
                        </div>
                      </div>
                    </div>

                    {/* Best For Section */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <h5 className="font-semibold text-gray-900">
                          {language === 'en' ? 'Best For' : 'Mejor Para'}
                        </h5>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                            {language === 'en' ? 'Minor injuries and cuts' : 'Lesiones menores y cortes'}
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                            {language === 'en' ? 'Cold and flu symptoms' : 'Síntomas de resfriado y gripe'}
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                            {language === 'en' ? 'Ear infections' : 'Infecciones del oído'}
                          </li>
                        </ul>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                            {language === 'en' ? 'Sprains and strains' : 'Esguinces y distensiones'}
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                            {language === 'en' ? 'Minor burns' : 'Quemaduras menores'}
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                            {language === 'en' ? 'Urinary tract infections' : 'Infecciones del tracto urinario'}
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Nearby Locations */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-blue-600" />
                          <h5 className="font-semibold text-gray-900">
                            {language === 'en' ? 'LA County Health Centers' : 'Centros de Salud del Condado de LA'}
                          </h5>
                        </div>
                        {(userLocation || manualZipCode) && (
                          <div className="text-xs text-gray-500">
                            {language === 'en' ? 'Sorted by distance' : 'Ordenado por distancia'}
                          </div>
                        )}
                      </div>
                      
                      {isCalculatingProximity && (
                        <div className="flex items-center justify-center py-8">
                          <div className="flex items-center gap-3">
                            <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                            <span className="text-sm text-gray-600">
                              {language === 'en' ? 'Calculating distances...' : 'Calculando distancias...'}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {/* Comprehensive Health Centers */}
                        <div className="space-y-2">
                          <h6 className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                            {language === 'en' ? 'Comprehensive Health Centers & Medical Centers' : 'Centros de Salud Integral y Centros Médicos'}
                          </h6>
                          
                          {urgentCareLocations.map((location) => (
                            <div key={location.id} className="bg-white border border-blue-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h6 className="font-semibold text-gray-900 text-sm">{location.name}</h6>
                                    {location.isER && (
                                      <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full font-medium">
                                        ER 24/7
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600 mt-1">{location.address}</p>
                                  <p className="text-xs text-blue-600 mt-1">{location.phone}</p>
                                  <div className="text-xs text-gray-500 mt-2">
                                    {location.hours.map((hour, index) => (
                                      <div key={index}>{hour}</div>
                                    ))}
                                  </div>
                                  {location.distance && (
                                    <div className="mt-2 text-xs font-medium text-green-600">
                                      {location.distance.toFixed(1)} {language === 'en' ? 'miles away' : 'millas de distancia'}
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full mt-2 ${location.isER ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                  {location.distance && (
                                    <div className="text-xs text-gray-500 text-center">
                                      #{urgentCareLocations.indexOf(location) + 1}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {urgentCareLocations.some(loc => loc.isER) && (
                            <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                              {language === 'en' 
                                ? '* Emergency Room services available at these facilities 24/7' 
                                : '* Servicios de Sala de Emergencias disponibles en estas instalaciones 24/7'
                              }
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Telehealth */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Phone className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">
                          {language === 'en' ? 'Telehealth Services' : 'Servicios de Telesalud'}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {language === 'en' 
                            ? 'Virtual consultations with healthcare providers'
                            : 'Consultas virtuales con proveedores de atención médica'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-6 mb-6">
                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-600">
                            {language === 'en' ? 'Wait Time' : 'Tiempo de Espera'}
                          </span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {language === 'en' ? '5-15 minutes' : '5-15 minutos'}
                        </div>
                      </div>
                      
                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-2">
                          <Building className="h-4 w-4 text-orange-600" />
                          <span className="text-xs font-medium text-gray-500 leading-tight">
                            {language === 'en' ? 'Your expected cost without insurance or if your deductible hasn\'t been met yet' : 'Su costo esperado sin seguro o si su deducible aún no se ha cumplido'}
                          </span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">$50-$150</div>
                      </div>
                      
                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-600">
                            {language === 'en' ? 'Availability' : 'Disponibilidad'}
                          </span>
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          {language === 'en' ? '24/7 availability' : 'Disponibilidad 24/7'}
                        </div>
                      </div>
                    </div>
                    {/* Best For Section */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <h5 className="font-semibold text-gray-900">
                          {language === 'en' ? 'Best For' : 'Mejor Para'}
                        </h5>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                            {language === 'en' ? 'Cold and flu symptoms' : 'Síntomas de resfriado y gripe'}
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                            {language === 'en' ? 'Mental health support' : 'Apoyo de salud mental'}
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                            {language === 'en' ? 'Follow-up appointments' : 'Citas de seguimiento'}
                          </li>
                        </ul>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                            {language === 'en' ? 'Skin conditions' : 'Condiciones de la piel'}
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                            {language === 'en' ? 'Prescription refills' : 'Reposición de recetas'}
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                            {language === 'en' ? 'General health questions' : 'Preguntas generales de salud'}
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Available Services */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <h5 className="font-semibold text-gray-900">
                          {language === 'en' ? 'Available Services' : 'Servicios Disponibles'}
                        </h5>
                      </div>
                      <div className="space-y-4">
                        {/* Virtual Urgent Care */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h6 className="font-semibold text-blue-900 mb-1">
                                {language === 'en' ? 'Virtual Urgent Care' : 'Atención Urgente Virtual'}
                              </h6>
                              <p className="text-sm text-blue-700 mb-2">
                                {language === 'en' ? 'Same-day virtual visits for urgent health concerns' : 'Visitas virtuales el mismo día para problemas de salud urgentes'}
                              </p>
                              <div className="text-xs text-blue-600">
                                {language === 'en' ? 'Daily: 7:00 AM - 11:00 PM' : 'Diario: 7:00 AM - 11:00 PM'}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-blue-900">10 min</div>
                            </div>
                          </div>
                        </div>

                        {/* Video Visits */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h6 className="font-semibold text-green-900 mb-1">
                                {language === 'en' ? 'Video Visits' : 'Visitas por Video'}
                              </h6>
                              <p className="text-sm text-green-700 mb-2">
                                {language === 'en' ? 'Scheduled appointments with your regular provider' : 'Citas programadas con su proveedor habitual'}
                              </p>
                              <div className="text-xs text-green-600">
                                {language === 'en' ? 'Mon-Fri: 8:00 AM - 5:00 PM' : 'Lun-Vie: 8:00 AM - 5:00 PM'}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-green-900">
                                {language === 'en' ? 'Scheduled' : 'Programado'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button className="bg-green-600 hover:bg-green-700 text-white flex-1">
                        <Phone className="h-4 w-4 mr-2" />
                        {language === 'en' ? 'Start Virtual Visit' : 'Iniciar Visita Virtual'}
                      </Button>
                      <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                        <Phone className="h-4 w-4 mr-2" />
                        {language === 'en' ? 'Call for Info' : 'Llamar para Información'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Primary Care Centers */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <FirstAid className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">
                          {language === 'en' ? 'Primary Care' : 'Atención Primaria'}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {language === 'en' 
                            ? 'Routine care and non-urgent health concerns'
                            : 'Atención rutinaria y problemas de salud no urgentes'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-6 mb-6">
                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-600">
                            {language === 'en' ? 'Wait Time' : 'Tiempo de Espera'}
                          </span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {language === 'en' ? 'Same day to 1 week' : 'Mismo día a 1 semana'}
                        </div>
                      </div>
                      
                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-2">
                          <Building className="h-4 w-4 text-green-600" />
                          <span className="text-xs font-medium text-gray-500 leading-tight">
                            {language === 'en' ? 'Your expected cost without insurance or if your deductible hasn\'t been met yet' : 'Su costo esperado sin seguro o si su deducible aún no se ha cumplido'}
                          </span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">$200-$400</div>
                      </div>
                      
                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-gray-600">
                            {language === 'en' ? 'Availability' : 'Disponibilidad'}
                          </span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {language === 'en' ? 'Scheduled appointments' : 'Citas programadas'}
                        </div>
                      </div>
                    </div>

                    {/* Best For Section */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <h5 className="font-semibold text-gray-900">
                          {language === 'en' ? 'Best For' : 'Mejor Para'}
                        </h5>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                            {language === 'en' ? 'Annual check-ups' : 'Exámenes anuales'}
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                            {language === 'en' ? 'Preventive care' : 'Atención preventiva'}
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                            {language === 'en' ? 'Medication management' : 'Manejo de medicamentos'}
                          </li>
                        </ul>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                            {language === 'en' ? 'Chronic condition management' : 'Manejo de condiciones crónicas'}
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                            {language === 'en' ? 'Routine screenings' : 'Exámenes de rutina'}
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                            {language === 'en' ? 'Health maintenance' : 'Mantenimiento de salud'}
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Available Services */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <h5 className="font-semibold text-gray-900">
                          {language === 'en' ? 'Available Services' : 'Servicios Disponibles'}
                        </h5>
                      </div>
                      <div className="space-y-4">
                        {/* Same-Day Appointments */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h6 className="font-semibold text-blue-900 mb-1">
                                {language === 'en' ? 'Same-Day Appointments' : 'Citas del Mismo Día'}
                              </h6>
                              <p className="text-sm text-blue-700 mb-2">
                                {language === 'en' ? 'Available for urgent but non-emergency concerns' : 'Disponible para problemas urgentes pero no de emergencia'}
                              </p>
                              <div className="text-xs text-blue-600 mb-2">
                                {language === 'en' ? 'Mon-Fri: 8:00 AM - 5:00 PM' : 'Lun-Vie: 8:00 AM - 5:00 PM'}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-orange-600">
                                <Info className="h-3 w-3" />
                                {language === 'en' ? 'Book via: Call or LA County DHS health portal' : 'Reservar vía: Llamada o portal de salud de LA County DHS'}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-blue-900">
                                {language === 'en' ? 'Same day' : 'Mismo día'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Routine Appointments */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h6 className="font-semibold text-green-900 mb-1">
                                {language === 'en' ? 'Routine Appointments' : 'Citas de Rutina'}
                              </h6>
                              <p className="text-sm text-green-700 mb-2">
                                {language === 'en' ? 'Scheduled visits for ongoing care' : 'Visitas programadas para atención continua'}
                              </p>
                              <div className="text-xs text-green-600 mb-2">
                                {language === 'en' ? 'Mon-Fri: 8:00 AM - 5:00 PM' : 'Lun-Vie: 8:00 AM - 5:00 PM'}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-orange-600">
                                <Info className="h-3 w-3" />
                                {language === 'en' ? 'Book via: LA County DHS health portal or phone' : 'Reservar vía: Portal de salud de LA County DHS o teléfono'}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-green-900">
                                {language === 'en' ? '1-7 days' : '1-7 días'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Preventive Care */}
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h6 className="font-semibold text-purple-900 mb-1">
                                {language === 'en' ? 'Preventive Care' : 'Atención Preventiva'}
                              </h6>
                              <p className="text-sm text-purple-700 mb-2">
                                {language === 'en' ? 'Annual exams, screenings, and vaccinations' : 'Exámenes anuales, evaluaciones y vacunas'}
                              </p>
                              <div className="text-xs text-purple-600 mb-2">
                                {language === 'en' ? 'Mon-Fri: 8:00 AM - 5:00 PM' : 'Lun-Vie: 8:00 AM - 5:00 PM'}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-orange-600">
                                <Info className="h-3 w-3" />
                                {language === 'en' ? 'Book via: LA County DHS health portal recommended' : 'Reservar vía: Portal de salud de LA County DHS recomendado'}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-purple-900">
                                {language === 'en' ? '1-4 weeks' : '1-4 semanas'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button className="bg-green-600 hover:bg-green-700 text-white flex-1">
                        <FirstAid className="h-4 w-4 mr-2" />
                        {language === 'en' ? 'Schedule Appointment' : 'Programar Cita'}
                      </Button>
                      <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                        <Phone className="h-4 w-4 mr-2" />
                        {language === 'en' ? 'Call for Info' : 'Llamar para Información'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {careGuideSection === 'prepare' && (
              <div className="space-y-8">
                {/* Header Section */}
                <div className="text-left mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {language === 'en' ? 'Emergency Room Preparation' : 'Preparación para Sala de Emergencias'}
                  </h3>
                  <p className="text-gray-600 max-w-4xl">
                    {language === 'en' 
                      ? 'Get ready for your emergency room visit with essential items to bring and understand what to expect during triage and treatment.'
                      : 'Prepárese para su visita a la sala de emergencias con elementos esenciales que debe traer y comprenda qué esperar durante el triaje y tratamiento.'
                    }
                  </p>
                </div>



                {/* Essential Items to Bring */}
                <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <CheckCircle className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">
                        {language === 'en' ? 'Essential Items to Bring' : 'Elementos Esenciales para Traer'}
                      </h4>
                      <p className="text-gray-700 mb-4 text-sm">
                        {language === 'en' 
                          ? 'Having these items ready can help medical staff provide faster, more accurate care.'
                          : 'Tener estos elementos listos puede ayudar al personal médico a brindar atención más rápida y precisa.'
                        }
                      </p>
                      
                      <div className="space-y-3">
                        {/* Government-issued photo ID */}
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h5 className="font-medium text-gray-900 text-sm">
                              {language === 'en' ? "Government-issued photo ID (driver's license, passport)" : 'ID con foto emitida por el gobierno (licencia de conducir, pasaporte)'}
                            </h5>
                          </div>
                        </div>

                        {/* Insurance cards */}
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h5 className="font-medium text-gray-900 text-sm">
                              {language === 'en' ? 'Insurance cards and medical ID cards' : 'Tarjetas de seguro y tarjetas de identificación médica'}
                            </h5>
                          </div>
                        </div>

                        {/* Current prescription medications */}
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h5 className="font-medium text-gray-900 text-sm">
                              {language === 'en' ? 'Current prescription medications in original bottles' : 'Medicamentos recetados actuales en frascos originales'}
                            </h5>
                          </div>
                        </div>

                        {/* List of medications */}
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h5 className="font-medium text-gray-900 text-sm">
                              {language === 'en' ? 'List of all medications, vitamins, and supplements with dosages' : 'Lista de todos los medicamentos, vitaminas y suplementos con dosis'}
                            </h5>
                          </div>
                        </div>

                        {/* Medical history */}
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h5 className="font-medium text-gray-900 text-sm">
                              {language === 'en' ? 'Medical history summary including allergies and chronic conditions' : 'Resumen del historial médico incluyendo alergias y condiciones crónicas'}
                            </h5>
                          </div>
                        </div>

                        {/* Emergency contacts */}
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h5 className="font-medium text-gray-900 text-sm">
                              {language === 'en' ? 'Emergency contact information' : 'Información de contacto de emergencia'}
                            </h5>
                          </div>
                        </div>

                        {/* Personal comfort items */}
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h5 className="font-medium text-gray-900 text-sm">
                              {language === 'en' ? 'Personal comfort items (phone charger, small snack, water)' : 'Artículos de comodidad personal (cargador de teléfono, refrigerio pequeño, agua)'}
                            </h5>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* What to Expect During Your Visit */}
                <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">
                        {language === 'en' ? 'What to Expect During Your Visit' : 'Qué Esperar Durante su Visita'}
                      </h4>
                      <p className="text-gray-700 mb-4 text-sm">
                        {language === 'en' 
                          ? 'Understanding the emergency room process can help reduce anxiety and ensure smooth care.'
                          : 'Entender el proceso de la sala de emergencias puede ayudar a reducir la ansiedad y asegurar una atención fluida.'
                        }
                      </p>
                      
                      <div className="space-y-4">
                        {/* Arrival and Registration */}
                        <div className="border-l-4 border-blue-500 pl-4">
                          <h5 className="font-semibold text-gray-900 mb-2">
                            {language === 'en' ? '1. Arrival and Registration' : '1. Llegada y Registro'}
                          </h5>
                          <ul className="space-y-1 text-sm text-gray-700">
                            <li>• {language === 'en' ? 'Check in at the registration desk' : 'Regístrese en el mostrador de registro'}</li>
                            <li>• {language === 'en' ? 'Provide identification and insurance information' : 'Proporcione identificación e información del seguro'}</li>
                            <li>• {language === 'en' ? 'Complete medical history forms' : 'Complete formularios de historial médico'}</li>
                          </ul>
                        </div>

                        {/* Triage Assessment */}
                        <div className="border-l-4 border-orange-500 pl-4">
                          <h5 className="font-semibold text-gray-900 mb-2">
                            {language === 'en' ? '2. Triage Assessment (Priority Evaluation)' : '2. Evaluación de Triaje (Evaluación de Prioridad)'}
                          </h5>
                          <ul className="space-y-1 text-sm text-gray-700">
                            <li>• {language === 'en' ? 'Nurse evaluates your symptoms and vital signs' : 'La enfermera evalúa sus síntomas y signos vitales'}</li>
                            <li>• {language === 'en' ? 'Assignment of acuity level (1-5) based on urgency' : 'Asignación de nivel de acuidad (1-5) basado en urgencia'}</li>
                            <li>• {language === 'en' ? 'More urgent cases are seen first, regardless of arrival time' : 'Los casos más urgentes se ven primero, independientemente de la hora de llegada'}</li>
                          </ul>
                        </div>

                        {/* Treatment and Care */}
                        <div className="border-l-4 border-green-500 pl-4">
                          <h5 className="font-semibold text-gray-900 mb-2">
                            {language === 'en' ? '3. Treatment and Care' : '3. Tratamiento y Atención'}
                          </h5>
                          <ul className="space-y-1 text-sm text-gray-700">
                            <li>• {language === 'en' ? 'Medical evaluation by physician or nurse practitioner' : 'Evaluación médica por médico o enfermero practicante'}</li>
                            <li>• {language === 'en' ? 'Diagnostic tests if needed (blood work, imaging, etc.)' : 'Pruebas diagnósticas si es necesario (análisis de sangre, imágenes, etc.)'}</li>
                            <li>• {language === 'en' ? 'Treatment plan discussion and implementation' : 'Discusión e implementación del plan de tratamiento'}</li>
                            <li>• {language === 'en' ? 'Specialist consultation if required' : 'Consulta con especialista si es necesario'}</li>
                          </ul>
                        </div>

                        {/* Discharge or Admission */}
                        <div className="border-l-4 border-purple-500 pl-4">
                          <h5 className="font-semibold text-gray-900 mb-2">
                            {language === 'en' ? '4. Discharge or Admission' : '4. Alta o Admisión'}
                          </h5>
                          <ul className="space-y-1 text-sm text-gray-700">
                            <li>• {language === 'en' ? 'Discharge instructions and follow-up care plans' : 'Instrucciones de alta y planes de atención de seguimiento'}</li>
                            <li>• {language === 'en' ? 'Prescription medications if needed' : 'Medicamentos recetados si es necesario'}</li>
                            <li>• {language === 'en' ? 'Hospital admission if condition requires ongoing care' : 'Admisión hospitalaria si la condición requiere atención continua'}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Preparation Tips */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Before You Leave Home */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-blue-900">
                        {language === 'en' ? 'Before You Leave Home' : 'Antes de Salir de Casa'}
                      </h4>
                    </div>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li>• {language === 'en' ? 'Call ahead if your condition allows' : 'Llame antes si su condición lo permite'}</li>
                      <li>• {language === 'en' ? 'Arrange reliable transportation or call 911' : 'Organice transporte confiable o llame al 911'}</li>
                      <li>• {language === 'en' ? 'Secure your home and bring house keys' : 'Asegure su hogar y traiga llaves de casa'}</li>
                      <li>• {language === 'en' ? 'Dress comfortably and appropriately' : 'Vístase cómoda y apropiadamente'}</li>
                    </ul>
                  </div>

                  {/* During Your Stay */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Heart className="h-5 w-5 text-green-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-green-900">
                        {language === 'en' ? 'During Your Stay' : 'Durante su Estadía'}
                      </h4>
                    </div>
                    <ul className="space-y-2 text-sm text-green-800">
                      <li>• {language === 'en' ? 'Be honest and detailed about all symptoms' : 'Sea honesto y detallado sobre todos los síntomas'}</li>
                      <li>• {language === 'en' ? 'Ask questions if anything is unclear' : 'Haga preguntas si algo no está claro'}</li>
                      <li>• {language === 'en' ? 'Inform staff of any changes in your condition' : 'Informe al personal de cualquier cambio en su condición'}</li>
                      <li>• {language === 'en' ? 'Follow all medical instructions carefully' : 'Siga todas las instrucciones médicas cuidadosamente'}</li>
                      <li>• {language === 'en' ? 'Request interpreter services if needed' : 'Solicite servicios de interpretación si es necesario'}</li>
                    </ul>
                  </div>
                </div>

                {/* Additional Emergency Resources */}
                <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="bg-red-100 p-2 rounded-full">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        {language === 'en' ? 'Additional Emergency Resources' : 'Recursos Adicionales de Emergencia'}
                      </h4>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Emergency Contacts */}
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-4">
                            {language === 'en' ? 'Emergency Contacts' : 'Contactos de Emergencia'}
                          </h5>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                              <div>
                                <span className="font-medium text-gray-900">{language === 'en' ? 'Emergency Services:' : 'Servicios de Emergencia:'}</span>
                              </div>
                              <div className="font-bold text-red-600">911</div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div>
                                <span className="font-medium text-gray-900">{language === 'en' ? 'Poison Control:' : 'Control de Envenenamiento:'}</span>
                              </div>
                              <div className="font-bold text-blue-600">1-800-222-1222</div>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div>
                                <span className="font-medium text-gray-900">{language === 'en' ? 'Red Cross:' : 'Cruz Roja:'}</span>
                              </div>
                              <div className="font-bold text-blue-600">1-800-733-2767</div>
                            </div>
                          </div>
                        </div>

                        {/* Useful Apps & Websites */}
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-4">
                            {language === 'en' ? 'Useful Apps & Websites' : 'Aplicaciones y Sitios Web Útiles'}
                          </h5>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <Phone className="h-4 w-4 text-red-600" />
                              <span className="font-medium text-gray-900">{language === 'en' ? 'Red Cross Emergency App' : 'App de Emergencia Cruz Roja'}</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <Globe className="h-4 w-4 text-blue-600" />
                              <span className="font-medium text-gray-900">Ready.gov</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <Phone className="h-4 w-4 text-orange-600" />
                              <span className="font-medium text-gray-900">{language === 'en' ? 'FEMA Mobile App' : 'App Móvil FEMA'}</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <Globe className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-gray-900">Weather.gov</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Remember Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h5 className="font-semibold text-blue-900 mb-2">
                        {language === 'en' ? 'Remember' : 'Recuerde'}
                      </h5>
                      <p className="text-blue-800 text-sm mb-3">
                        {language === 'en' 
                          ? "In a true emergency, don't delay care to gather these items. Your safety comes first - these are helpful when possible to bring."
                          : "En una verdadera emergencia, no retrase la atención para reunir estos elementos. Su seguridad es lo primero: estos son útiles cuando sea posible traerlos."
                        }
                      </p>
                      <p className="text-blue-800 text-sm">
                        {language === 'en'
                          ? "Consider keeping copies of important medical documents in an easily accessible location for emergency situations."
                          : "Considere mantener copias de documentos médicos importantes en un lugar fácilmente accesible para situaciones de emergencia."
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Medical Disclaimer */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-gray-600 mt-1 flex-shrink-0" />
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">
                        {language === 'en' ? 'Medical Disclaimer' : 'Descargo de Responsabilidad Médica'}
                      </h5>
                      <p className="text-gray-700 text-sm mb-3">
                        {language === 'en'
                          ? "The information provided on this page is for educational purposes only and should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider about any health concerns or before making any decisions related to your health or treatment."
                          : "La información proporcionada en esta página es solo para fines educativos y no debe usarse como sustituto del consejo médico profesional, diagnóstico o tratamiento. Siempre consulte con un proveedor de atención médica calificado sobre cualquier preocupación de salud o antes de tomar cualquier decisión relacionada con su salud o tratamiento."
                        }
                      </p>
                      <p className="text-gray-700 text-sm font-medium">
                        {language === 'en'
                          ? "In case of a medical emergency, call 911 immediately. This facility is not responsible for any actions taken based on the information provided through this guidance tool."
                          : "En caso de emergencia médica, llame al 911 inmediatamente. Esta instalación no es responsable de ninguna acción tomada basada en la información proporcionada a través de esta herramienta de orientación."
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            <strong>{t[language].important}</strong> {t[language].disclaimer}
          </p>
        </div>
      </div>
    </div>
  )
}

export default App