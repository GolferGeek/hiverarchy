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

    const apiKey = req.headers.get('x-grok-key')
    console.log('API Key present:', !!apiKey)
    if (!apiKey) {
      console.error('Missing Grok API key')
      throw new Error('Missing Grok API key')
    }

    console.log('Making request to Grok API')
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'grok-beta',
        stream: false,
        temperature: options?.temperature || 0
      })
    })

    console.log('Grok API response status:', response.status)
    const data = await response.json()
    console.log('Grok API response:', data)

    if (!response.ok) {
      throw new Error(`Grok API error: ${JSON.stringify(data)}`)
    }

    // Format the response to match what IdeationPanel expects
    const formattedResponse = {
      choices: [
        {
          message: {
            content: data.choices[0].message.content
          }
        }
      ],
      usage: data.usage || {}
    }

    return new Response(
      JSON.stringify(formattedResponse),
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