import OpenAI from 'openai'

export class OpenAIService {
  constructor(apiKey) {
    this.client = new OpenAI({ 
      apiKey,
      dangerouslyAllowBrowser: true // Enable browser usage
    })
  }

  async generateCompletion(prompt, options = {}) {
    try {
      const response = await this.client.chat.completions.create({
        model: options.model || 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1000,
      })

      return {
        text: response.choices[0].message.content,
        usage: response.usage,
      }
    } catch (error) {
      console.error('OpenAI API Error:', error)
      throw new Error(`OpenAI API Error: ${error.message}`)
    }
  }

  async generateImage(prompt, options = {}) {
    try {
      const response = await this.client.images.generate({
        prompt,
        n: options.n || 1,
        size: options.size || '1024x1024',
        quality: options.quality || 'standard',
        style: options.style || 'vivid',
      })

      return response.data
    } catch (error) {
      console.error('OpenAI Image API Error:', error)
      throw new Error(`OpenAI Image API Error: ${error.message}`)
    }
  }
} 