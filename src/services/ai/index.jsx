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
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (user?.id) {
      loadProfile()
    }
  }, [user?.id])

  const loadProfile = async () => {
    try {
      setLoading(true)
      console.log('Loading profile for user:', user.id)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.log('Error or no profile found:', error)
        return
      }

      console.log('Found existing profile:', data)
      setProfile(data)
    } catch (error) {
      console.error('Error in loadProfile:', error)
    } finally {
      setLoading(false)
    }
  }

  const initializeService = async (serviceType) => {
    if (!profile) return null

    try {
      switch (serviceType) {
        case 'openai':
          if (profile.api_openai && !services.openai) {
            const OpenAIService = (await import('./openai')).OpenAIService
            return new OpenAIService(profile.api_openai)
          }
          break
        case 'anthropic':
          if (profile.api_anthropic && !services.anthropic) {
            const AnthropicService = (await import('./anthropic')).AnthropicService
            return new AnthropicService(profile.api_anthropic)
          }
          break
        case 'grok':
          if (profile.api_grok && !services.grok) {
            const GrokService = (await import('./grok')).GrokService
            return new GrokService(profile.api_grok)
          }
          break
        case 'perplexity':
          if (profile.api_perplexity && !services.perplexity) {
            const PerplexityService = (await import('./perplexity')).PerplexityService
            return new PerplexityService(profile.api_perplexity)
          }
          break
      }
    } catch (error) {
      console.error(`Error initializing ${serviceType} service:`, error)
    }
    return null
  }

  const getCurrentService = async () => {
    if (!currentService) {
      // Try to initialize first available service
      for (const serviceType of ['openai', 'anthropic', 'grok', 'perplexity']) {
        const service = await initializeService(serviceType)
        if (service) {
          setServices(prev => ({ ...prev, [serviceType]: service }))
          setCurrentService(serviceType)
          return service
        }
      }
      return null
    }

    // Initialize the current service if not already initialized
    if (!services[currentService]) {
      const service = await initializeService(currentService)
      if (service) {
        setServices(prev => ({ ...prev, [currentService]: service }))
        return service
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
    reloadProfile: loadProfile
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