import { supabase } from '../../lib/supabase'

export class PerplexityService {
  constructor(apiKey) {
    this.apiKey = apiKey
    console.log('PerplexityService initialized with API key:', !!apiKey)
  }

  async generateCompletion(prompt, options = {}) {
    try {
      console.log('PerplexityService generating completion with options:', {
        ...options,
        apiKeyPresent: !!this.apiKey
      })
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/perplexity`,
        {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'x-perplexity-key': this.apiKey
          },
          body: JSON.stringify({ 
            prompt, 
            options: {
              ...options,
              model: options.model || 'llama-3.1-sonar-small-128k-online',
              stream: false,
              temperature: options.temperature || 0.7
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
      console.error('Perplexity service error:', error)
      throw new Error(`Perplexity API Error: ${error.message}`)
    }
  }
} 