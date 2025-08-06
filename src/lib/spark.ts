// Placeholder implementation for spark API functions
// In a real deployment, you'd replace these with actual implementations

interface UserInfo {
  avatarUrl: string
  email: string
  id: string
  isOwner: boolean
  login: string
}

interface SparkKV {
  keys: () => Promise<string[]>
  get: <T>(key: string) => Promise<T | undefined>
  set: <T>(key: string, value: T) => Promise<void>
  delete: (key: string) => Promise<void>
}

interface SparkAPI {
  llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string
  llm: (prompt: string, modelName?: string, jsonMode?: boolean) => Promise<string>
  user: () => Promise<UserInfo>
  kv: SparkKV
}

// Mock implementation for standalone use
const mockSparkAPI: SparkAPI = {
  llmPrompt: (strings: TemplateStringsArray, ...values: any[]): string => {
    // Simple template literal implementation
    return strings.reduce((result, string, i) => {
      return result + string + (values[i] || '')
    }, '')
  },

  llm: async (prompt: string, modelName?: string, jsonMode?: boolean): Promise<string> => {
    console.warn('LLM functionality not available in standalone mode')
    return Promise.resolve('LLM functionality not available in standalone mode')
  },

  user: async (): Promise<UserInfo> => {
    // Return a default user for standalone mode
    return Promise.resolve({
      avatarUrl: '',
      email: 'user@example.com',
      id: 'standalone-user',
      isOwner: true,
      login: 'standalone-user'
    })
  },

  kv: {
    keys: async (): Promise<string[]> => {
      const keys: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) keys.push(key)
      }
      return Promise.resolve(keys)
    },

    get: async <T>(key: string): Promise<T | undefined> => {
      try {
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : undefined
      } catch (error) {
        console.error('Error reading from localStorage:', error)
        return undefined
      }
    },

    set: async <T>(key: string, value: T): Promise<void> => {
      try {
        localStorage.setItem(key, JSON.stringify(value))
        return Promise.resolve()
      } catch (error) {
        console.error('Error writing to localStorage:', error)
        return Promise.reject(error)
      }
    },

    delete: async (key: string): Promise<void> => {
      try {
        localStorage.removeItem(key)
        return Promise.resolve()
      } catch (error) {
        console.error('Error deleting from localStorage:', error)
        return Promise.reject(error)
      }
    }
  }
}

// Make spark available globally
declare global {
  interface Window {
    spark: SparkAPI
  }
}

// Initialize spark on window
if (typeof window !== 'undefined') {
  window.spark = mockSparkAPI
}

export default mockSparkAPI