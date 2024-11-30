import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-perplexity-key',
}

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

    const apiKey = req.headers.get('x-perplexity-key')
    console.log('API Key present:', !!apiKey)
    if (!apiKey) {
      console.error('Missing Perplexity API key')
      throw new Error('Missing Perplexity API key')
    }

    console.log('Making request to Perplexity API')
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: options?.model || 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI research assistant.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false,
        temperature: options?.temperature || 0.7
      })
    })

    console.log('Perplexity API response status:', response.status)
    const data = await response.json()
    console.log('Perplexity API response:', data)

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${JSON.stringify(data)}`)
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
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
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