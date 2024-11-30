import { supabase } from '../../lib/supabase'

export class AnthropicService {
  constructor(apiKey) {
    this.apiKey = apiKey
  }

  async generateCompletion(prompt, options = {}) {
    try {
      console.log('Sending request to Edge Function with options:', options)
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/anthropic`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'x-anthropic-key': this.apiKey
          },
          body: JSON.stringify({ prompt, options })
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
        text: data.content[0].text,
        usage: data.usage
      }
    } catch (error) {
      console.error('Anthropic service error:', error)
      throw new Error(`Anthropic API Error: ${error.message}`)
    }
  }
} 