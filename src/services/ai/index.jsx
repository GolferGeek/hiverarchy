import { createContext, useContext, useState, useEffect } from 'react'
import { OpenAIService } from './openai'
import { AnthropicService } from './anthropic'
import { GrokService } from './grok'
import { PerplexityService } from './perplexity'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

// Define which services are available for each development step
export const STEP_SERVICES = {
  ideation: ['openai', 'anthropic', 'grok'],
  research: ['serper', 'perplexity'],
  // Add other steps as needed
}

const AIContext = createContext()

export function AIProvider({ children }) {
  const { user } = useAuth()
  const [currentService, setCurrentService] = useState('')
  const [services, setServices] = useState({})
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState(null)
  const [currentStep, setCurrentStep] = useState('ideation')

  useEffect(() => {
    if (user?.id) {
      loadProfile()
    }
  }, [user?.id])

  // Add effect to initialize services when profile is loaded
  useEffect(() => {
    if (profile) {
      const initializeServices = async () => {
        for (const serviceType of ['openai', 'anthropic', 'grok', 'perplexity', 'serper']) {
          const service = await initializeService(serviceType)
          if (service) {
            setServices(prev => ({ ...prev, [serviceType]: service }))
            if (!currentService) {
              setCurrentService(serviceType)
            }
          }
        }
      }
      initializeServices()
    }
  }, [profile])

  const loadProfile = async () => {
    if (!user?.id) return null

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) return null

      return data
    } catch (error) {
      return null
    }
  }

  const initializeService = async (serviceType) => {
    if (!profile?.[`api_${serviceType}`]) return false

    try {
      switch (serviceType) {
        case 'openai':
          services.openai = new OpenAIService(profile.api_openai)
          break
        case 'anthropic':
          services.anthropic = new AnthropicService(profile.api_anthropic)
          break
        case 'grok':
          services.grok = new GrokService(profile.api_grok)
          break
        case 'perplexity':
          services.perplexity = new PerplexityService(profile.api_perplexity)
          break
        case 'serper':
          services.serper = new SerperService(profile.api_serper)
          break
      }
      return true
    } catch (error) {
      return false
    }
  }

  const getCurrentService = async () => {
    if (currentService && services[currentService]) {
      return services[currentService]
    }

    // Try to initialize first available service
    for (const serviceType of ['openai', 'anthropic', 'grok', 'perplexity', 'serper']) {
      if (await initializeService(serviceType)) {
        setCurrentService(serviceType)
        return services[serviceType]
      }
    }

    return null
  }

  useEffect(() => {
    const initServices = async () => {
      const loadedProfile = await loadProfile()
      if (loadedProfile) {
        setProfile(loadedProfile)
        for (const serviceType of ['openai', 'anthropic', 'grok', 'perplexity', 'serper']) {
          await initializeService(serviceType)
        }
      }
    }

    initServices()
  }, [user])

  const value = {
    currentService,
    setCurrentService,
    services,
    loading,
    getCurrentService,
    reloadProfile: loadProfile,
    currentStep,
    setCurrentStep,
    availableServices: STEP_SERVICES[currentStep] || []
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
  perplexity: 'Perplexity',
  serper: 'Serper'
} 