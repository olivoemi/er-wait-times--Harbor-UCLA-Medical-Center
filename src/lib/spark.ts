// Mock Spark API for GitHub Pages deployment
// This provides fallback implementations for Spark-specific functionality

// Mock spark global object for production builds
declare global {
  interface Window {
    spark: {
      llmPrompt: (strings: string[], ...values: any[]) => string
      llm: (prompt: string, modelName?: string, jsonMode?: boolean) => Promise<string>
      user: () => Promise<{
        avatarUrl: string
        email: string
        id: string
        isOwner: boolean
        login: string
      }>
      kv: {
        keys: () => Promise<string[]>
        get: <T>(key: string) => Promise<T | undefined>
        set: <T>(key: string, value: T) => Promise<void>
        delete: (key: string) => Promise<void>
      }
    }
  }
}

// Mock implementations for GitHub Pages
const mockSpark = {
  llmPrompt: (strings: string[], ...values: any[]) => {
    return strings.reduce((result, string, i) => {
      return result + string + (values[i] || '')
    }, '')
  },

  llm: async (prompt: string, modelName?: string, jsonMode?: boolean) => {
    // Return a mock response for demo purposes
    return jsonMode 
      ? '{"message": "This is a demo response. LLM functionality requires the Spark runtime."}' 
      : 'This is a demo response. LLM functionality requires the Spark runtime.'
  },

  user: async () => ({
    avatarUrl: '',
    email: 'demo@example.com',
    id: 'demo-user',
    isOwner: true,
    login: 'demo-user'
  }),

  kv: {
    keys: async () => {
      const keys: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('spark_kv_')) {
          keys.push(key.replace('spark_kv_', ''))
        }
      }
      return keys
    },

    get: async <T>(key: string): Promise<T | undefined> => {
      try {
        const stored = localStorage.getItem(`spark_kv_${key}`)
        return stored ? JSON.parse(stored) : undefined
      } catch {
        return undefined
      }
    },

    set: async <T>(key: string, value: T): Promise<void> => {
      try {
        localStorage.setItem(`spark_kv_${key}`, JSON.stringify(value))
      } catch (error) {
        console.warn('Failed to save to localStorage:', error)
      }
    },

    delete: async (key: string): Promise<void> => {
      try {
        localStorage.removeItem(`spark_kv_${key}`)
      } catch (error) {
        console.warn('Failed to delete from localStorage:', error)
      }
    }
  }
}

// Initialize mock spark if not already available
if (typeof window !== 'undefined' && !window.spark) {
  window.spark = mockSpark
}

export default mockSpark