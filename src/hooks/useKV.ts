// Mock implementation of useKV for GitHub Pages deployment
import { useState, useEffect } from 'react'

export function useKV<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') {
        return defaultValue
      }
      const stored = localStorage.getItem(`kv_${key}`)
      return stored ? JSON.parse(stored) : defaultValue
    } catch (error) {
      console.warn(`Failed to load ${key} from localStorage:`, error)
      return defaultValue
    }
  })

  const setValueAndStore = (newValue: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const finalValue = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prev) : newValue
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`kv_${key}`, JSON.stringify(finalValue))
        }
      } catch (error) {
        console.warn(`Failed to save ${key} to localStorage:`, error)
      }
      return finalValue
    })
  }

  const deleteValue = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`kv_${key}`)
      }
      setValue(defaultValue)
    } catch (error) {
      console.warn(`Failed to delete ${key} from localStorage:`, error)
      setValue(defaultValue)
    }
  }

  return [value, setValueAndStore, deleteValue]
}