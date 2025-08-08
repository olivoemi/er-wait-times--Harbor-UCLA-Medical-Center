import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function SimpleApp() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>ER Wait Times - Simple Test</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This is a simple test to verify the app works.</p>
            <p>Count: {count}</p>
            <Button onClick={() => setCount(count + 1)}>
              Increment
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SimpleApp