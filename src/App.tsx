import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MapPin, Clock, RefreshCw, Search, AlertTriangle } from '@phosphor-icons/react'

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

function App() {
  const [hospitals, setHospitals] = useKV<Hospital[]>('hospitals', [])
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [locationError, setLocationError] = useState<string>('')

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
        name: 'St. Mary\'s Medical Center',
        address: '450 Stanyan St, San Francisco, CA 94117',
        waitTime: 25,
        lastUpdated: new Date().toISOString(),
        specialties: ['Emergency', 'Trauma', 'Cardiac'],
        phone: '(415) 668-1000'
      },
      {
        id: '2',
        name: 'UCSF Medical Center',
        address: '505 Parnassus Ave, San Francisco, CA 94143',
        waitTime: 45,
        lastUpdated: new Date().toISOString(),
        specialties: ['Emergency', 'Trauma', 'Pediatric', 'Stroke'],
        phone: '(415) 476-1000'
      },
      {
        id: '3',
        name: 'California Pacific Medical Center',
        address: '2333 Buchanan St, San Francisco, CA 94115',
        waitTime: 15,
        lastUpdated: new Date().toISOString(),
        specialties: ['Emergency', 'Cardiac'],
        phone: '(415) 600-6000'
      },
      {
        id: '4',
        name: 'San Francisco General Hospital',
        address: '1001 Potrero Ave, San Francisco, CA 94110',
        waitTime: 90,
        lastUpdated: new Date().toISOString(),
        specialties: ['Emergency', 'Trauma', 'Burn', 'Psychiatric'],
        phone: '(415) 206-8000'
      },
      {
        id: '5',
        name: 'Kaiser Permanente San Francisco',
        address: '2425 Geary Blvd, San Francisco, CA 94115',
        waitTime: 30,
        lastUpdated: new Date().toISOString(),
        specialties: ['Emergency', 'Urgent Care'],
        phone: '(415) 833-2000'
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
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low: {waitTime} min</Badge>
    } else if (waitTime <= 45) {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Moderate: {waitTime} min</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">High: {waitTime} min</Badge>
    }
  }

  const filteredHospitals = hospitals
    .filter(hospital => 
      hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.address.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (userLocation && a.distance && b.distance) {
        return a.distance - b.distance
      }
      return a.waitTime - b.waitTime
    })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            ER Wait Times
          </h1>
          <p className="text-lg text-muted-foreground">
            Find emergency room wait times near you to make informed healthcare decisions
          </p>
        </div>

        {/* Location Alert */}
        {locationError && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{locationError}</AlertDescription>
          </Alert>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search hospitals by name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            onClick={refreshData} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Last Updated */}
        <div className="text-sm text-muted-foreground mb-6 text-center">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>

        {/* Hospital Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredHospitals.map((hospital) => (
            <Card key={hospital.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">{hospital.name}</span>
                  {getWaitTimeBadge(hospital.waitTime)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{hospital.address}</span>
                </div>
                
                {hospital.distance && (
                  <div className="text-sm text-muted-foreground">
                    📍 {hospital.distance.toFixed(1)} miles away
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    Estimated wait: {hospital.waitTime} minutes
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {hospital.specialties.map((specialty) => (
                    <Badge key={specialty} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>

                <div className="text-sm text-muted-foreground">
                  📞 {hospital.phone}
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Updated: {new Date(hospital.lastUpdated).toLocaleTimeString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredHospitals.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hospitals found matching your search.</p>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-12 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            <strong>Important:</strong> Wait times are estimates and may vary. For life-threatening emergencies, call 911 immediately. 
            This information is for reference only and should not replace professional medical judgment.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App