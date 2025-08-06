// Mock implementation of useKV for GitHub Pages deployment
import { useState, useEffect } from 'react'

export function useKV<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(`kv_${key}`)
      return stored ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const setValueAndStore = (newValue: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const finalValue = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prev) : newValue
      try {
        localStorage.setItem(`kv_${key}`, JSON.stringify(finalValue))
      } catch (error) {
        console.warn('Failed to save to localStorage:', error)
      }
      return finalValue
    })
  }

  const deleteValue = () => {
    try {
      localStorage.removeItem(`kv_${key}`)
      setValue(defaultValue)
    } catch (error) {
      console.warn('Failed to delete from localStorage:', error)
    }
  }

  return [value, setValueAndStore, deleteValue]
}