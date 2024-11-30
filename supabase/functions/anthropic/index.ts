import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  console.log('Received request:', req.method)
  console.log('Request headers:', Object.fromEntries(req.headers.entries()))

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, options } = await req.json()
    console.log('Received prompt:', prompt)
    console.log('Received options:', options)

    const apiKey = req.headers.get('x-anthropic-key')
    if (!apiKey) {
      console.error('Missing Anthropic API key')
      throw new Error('Missing Anthropic API key')
    }

    console.log('Making request to Anthropic API')
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: options?.model || 'claude-3-opus-20240229',
        max_tokens: options?.maxTokens || 1000,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature || 0.7,
      })
    })

    console.log('Anthropic API response status:', response.status)
    const data = await response.json()
    console.log('Anthropic API response:', data)

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${JSON.stringify(data)}`)
    }

    return new Response(
      JSON.stringify(data),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  } catch (error) {
    console.error('Error in Edge Function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
}) 