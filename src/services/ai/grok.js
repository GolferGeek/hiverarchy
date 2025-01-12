import { supabase } from '../../lib/supabase'

export class GrokService {
  constructor(apiKey) {
    this.apiKey = apiKey
  }

  async generateCompletion(prompt, options = {}) {
    const defaultOptions = {
      model: 'grok-1',
      temperature: 0.7,
      maxTokens: 1000
    }

    const mergedOptions = { ...defaultOptions, ...options }

    try {
      const response = await fetch('/api/grok', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: this.apiKey,
          prompt,
          ...mergedOptions
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'API request failed')
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      return data.content
    } catch (error) {
      throw error
    }
  }
} 