import OpenAI from 'openai'

export class OpenAIService {
  constructor(apiKey) {
    console.log('Initializing OpenAI service with API key:', apiKey ? 'Present' : 'Missing')
    this.client = new OpenAI({ 
      apiKey,
      dangerouslyAllowBrowser: true // Enable browser usage
    })
  }

  async generateCompletion(prompt, options = {}) {
    try {
      console.log('OpenAI generateCompletion called with:', {
        promptLength: prompt.length,
        options
      })

      const messages = [
        { role: 'system', content: 'You are a helpful assistant that generates structured content.' },
        { role: 'user', content: prompt }
      ]

      console.log('Sending request to OpenAI with messages:', messages)

      const response = await this.client.chat.completions.create({
        model: options.model || 'gpt-4',
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1000,
      })

      console.log('Received response from OpenAI:', response)

      return {
        text: response.choices[0].message.content,
        usage: response.usage,
      }
    } catch (error) {
      console.error('OpenAI API Error:', error)
      console.error('Error details:', {
        message: error.message,
        type: error.type,
        code: error.code,
        status: error.status
      })
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