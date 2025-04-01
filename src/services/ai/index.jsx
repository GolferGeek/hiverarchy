import { createContext, useContext, useState, useEffect } from 'react'
import { OpenAIService } from './openai'
import { AnthropicService } from './anthropic'
import { GrokService } from './grok'
import { PerplexityService } from './perplexity'
import SerperService from './serper'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

// Define which services are available for each development step
export const STEP_SERVICES = {
  child_posts: ['openai', 'anthropic', 'grok'],
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
      console.log('AIProvider: User ID detected, loading profile')
      loadProfile()
    }
  }, [user?.id])

  // Add effect to initialize services when profile is loaded
  useEffect(() => {
    if (profile) {
      console.log('AIProvider: Profile loaded, initializing services')
      const initializeServices = async () => {
        for (const serviceType of ['openai', 'anthropic', 'grok', 'perplexity', 'serper']) {
          console.log(`AIProvider: Initializing ${serviceType} service`)
          const service = await initializeService(serviceType)
          if (service) {
            console.log(`AIProvider: Successfully initialized ${serviceType} service`)
            setServices(prev => ({ ...prev, [serviceType]: service }))
            if (!currentService) {
              console.log(`AIProvider: Setting ${serviceType} as current service`)
              setCurrentService(serviceType)
            }
          } else {
            console.log(`AIProvider: Failed to initialize ${serviceType} service`)
          }
        }
      }
      initializeServices()
    }
  }, [profile])

  const loadProfile = async () => {
    if (!user?.id) {
      console.log('AIProvider: No user ID available')
      return null
    }

    try {
      console.log('AIProvider: Loading profile from Supabase')
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('AIProvider: Error loading profile:', error)
        return null
      }

      console.log('AIProvider: Profile loaded successfully')
      setProfile(data)
      return data
    } catch (error) {
      console.error('AIProvider: Exception loading profile:', error)
      return null
    }
  }

  const initializeService = async (serviceType) => {
    console.log(`AIProvider: Checking API key for ${serviceType}`)
    if (!profile?.[`api_${serviceType}`]) {
      console.log(`AIProvider: No API key found for ${serviceType}`)
      return null
    }

    try {
      console.log(`AIProvider: Creating ${serviceType} service`)
      let service = null
      switch (serviceType) {
        case 'openai':
          service = new OpenAIService(profile.api_openai)
          break
        case 'anthropic':
          service = new AnthropicService(profile.api_anthropic)
          break
        case 'grok':
          service = new GrokService(profile.api_grok)
          break
        case 'perplexity':
          service = new PerplexityService(profile.api_perplexity)
          break
        case 'serper':
          service = new SerperService(profile.api_serper)
          break
      }
      if (service) {
        console.log(`AIProvider: Successfully created ${serviceType} service`)
        services[serviceType] = service
      }
      return service
    } catch (error) {
      console.error(`AIProvider: Error initializing ${serviceType} service:`, error)
      return null
    }
  }

  const getCurrentService = async () => {
    console.log('AIProvider: Getting current service')
    if (currentService && services[currentService]) {
      console.log(`AIProvider: Returning existing service: ${currentService}`)
      return services[currentService]
    }

    // Try to initialize first available service
    console.log('AIProvider: No current service, trying to initialize')
    for (const serviceType of ['openai', 'anthropic', 'grok', 'perplexity', 'serper']) {
      const service = await initializeService(serviceType)
      if (service) {
        console.log(`AIProvider: Successfully initialized and setting ${serviceType} as current service`)
        setCurrentService(serviceType)
        return service
      }
    }

    console.error('AIProvider: No AI service available')
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