import { createContext, useContext, useState, useEffect } from 'react'
import { OpenAIService } from './openai'
import { AnthropicService } from './anthropic'
import { GrokService } from './grok'
import { PerplexityService } from './perplexity'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

const AIContext = createContext()

export function AIProvider({ children }) {
  const { user } = useAuth()
  const [currentService, setCurrentService] = useState('')
  const [services, setServices] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadAPIKeys()
    }
  }, [user?.id])

  const loadAPIKeys = async () => {
    try {
      setLoading(true)
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('"api-openai", "api-anthropic", "api-grok2", "api-perplexity"')
        .eq('id', user.id)
        .single()

      if (error) throw error

      const newServices = {}
      
      if (profile['api-openai']) {
        newServices.openai = new OpenAIService(profile['api-openai'])
      }
      if (profile['api-anthropic']) {
        newServices.anthropic = new AnthropicService(profile['api-anthropic'])
      }
      if (profile['api-grok2']) {
        newServices.grok = new GrokService(profile['api-grok2'])
      }
      if (profile['api-perplexity']) {
        newServices.perplexity = new PerplexityService(profile['api-perplexity'])
      }

      setServices(newServices)
      
      // Set first available service if none is selected
      if (!currentService && Object.keys(newServices).length > 0) {
        setCurrentService(Object.keys(newServices)[0])
      }
    } catch (error) {
      console.error('Error loading API keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentService = () => {
    if (!currentService || !services[currentService]) {
      const firstAvailable = Object.keys(services)[0]
      if (firstAvailable) {
        setCurrentService(firstAvailable)
        return services[firstAvailable]
      }
      return null
    }
    return services[currentService]
  }

  const value = {
    currentService,
    setCurrentService,
    services,
    loading,
    getCurrentService,
    reloadServices: loadAPIKeys
  }

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>
}

export function useAI() {
  const context = useContext(AIContext)
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider')
  }
  return context
}

export const AI_SERVICE_NAMES = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  grok: 'Grok',
  perplexity: 'Perplexity'
} 