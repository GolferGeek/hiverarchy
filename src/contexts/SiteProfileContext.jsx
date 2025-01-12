import { createContext, useContext, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const SiteProfileContext = createContext({})

export function SiteProfileProvider({ children }) {
  const [siteProfile, setSiteProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const { username } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const defaultUsername = import.meta.env.VITE_DEFAULT_USERNAME
  const [retryCount, setRetryCount] = useState(0)

  const fetchProfile = async (username) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (error) throw error
      setSiteProfile(data)
    } catch (error) {
      setSiteProfile(null)
    }
  }

  useEffect(() => {
    const profileUsername = username || defaultUsername
    if (profileUsername) {
      fetchProfile(profileUsername)
    }
  }, [username, defaultUsername])

  const isOwner = () => {
    if (!user || !siteProfile) return false
    return user.id === siteProfile.id
  }

  const value = {
    siteProfile,
    loading,
    isOwner,
    fetchProfile,
    defaultUsername
  }

  return (
    <SiteProfileContext.Provider value={value}>
      {children}
    </SiteProfileContext.Provider>
  )
}

export function useSiteProfile() {
  return useContext(SiteProfileContext)
}
