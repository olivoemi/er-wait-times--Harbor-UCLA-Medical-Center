// Simple test component to check if React is working
import { useState } from 'react'

function TestApp() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <div style={{ marginTop: '20px' }}>
        <p>React is working correctly!</p>
      </div>
    </div>
  )
}

export default TestApp