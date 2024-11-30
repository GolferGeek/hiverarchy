import { supabase } from '../../lib/supabase'

export class GrokService {
  constructor(apiKey) {
    this.apiKey = apiKey
    console.log('GrokService initialized with API key:', !!apiKey)
  }

  async generateCompletion(prompt, options = {}) {
    try {
      console.log('GrokService generating completion with options:', {
        ...options,
        apiKeyPresent: !!this.apiKey
      })
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/grok`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'x-grok-key': this.apiKey
          },
          body: JSON.stringify({ 
            prompt, 
            options: {
              ...options,
              model: 'grok-beta',
              stream: false,
              temperature: options.temperature || 0
            }
          })
        }
      )

      console.log('Edge Function response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Edge Function error:', errorData)
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Edge Function response data:', data)

      if (data.error) {
        console.error('API error:', data.error)
        throw new Error(data.error)
      }

      return {
        text: data.choices[0].message.content,
        usage: data.usage || {}
      }
    } catch (error) {
      console.error('Grok service error:', error)
      throw new Error(`Grok API Error: ${error.message}`)
    }
  }
} 