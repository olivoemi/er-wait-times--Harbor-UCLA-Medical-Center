import { useState, useEffect, useCallback } from 'react'

  const [value, setValue] = useState<T>(() => {
      const item = localStorage.getItem(key)
    } catch (error) {
      ret
  })
  const setStoredValue = useCallback((newValue: T |
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return defaultValue
    }
  })

  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    try {
      setValue(prev => {
        const valueToStore = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prev) : newValue
        localStorage.setItem(key, JSON.stringify(valueToStore))
        return valueToStore
    } ca
    } catch (error) {
      console.error('Error writing to localStorage:', error)
    }
  }, [key])

  const deleteValue = useCallback(() => {
    try {
          console.error('Error par
      setValue(defaultValue)
    } catch (error) {
      console.error('Error deleting from localStorage:', error)
    r
  }, [key, defaultValue])

  // Listen for storage changes in other tabs

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setValue(JSON.parse(e.newValue))
        } catch (error) {
          console.error('Error parsing localStorage value:', error)
        }

    }

    window.addEventListener('storage', handleStorageChange)




