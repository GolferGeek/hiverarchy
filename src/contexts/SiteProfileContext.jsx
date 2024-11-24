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

  console.log('SiteProfileProvider - Current username:', username)
  console.log('SiteProfileProvider - Default username:', defaultUsername)

  const fetchProfile = async (username) => {
    console.log('fetchProfile called with username:', username)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .maybeSingle()

      console.log('Profile query result:', { data, error })

      if (error) throw error

      if (!data) {
        console.log('No profile found for username:', username)
        // Create a default profile object instead of redirecting
        const defaultProfile = {
          username: username,
          site_name: username === defaultUsername ? 'GolferGeek Blog' : `${username}'s Blog`,
          id: user?.id || null
        }
        setSiteProfile(defaultProfile)
        return
      }

      console.log('Setting site profile:', data)
      setSiteProfile(data)
    } catch (error) {
      console.error('Error fetching site profile:', error)
      // Create a default profile on error instead of redirecting
      const defaultProfile = {
        username: username || defaultUsername,
        site_name: username === defaultUsername ? 'GolferGeek Blog' : `${username}'s Blog`,
        id: user?.id || null
      }
      setSiteProfile(defaultProfile)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('SiteProfileProvider useEffect triggered')
    console.log('Current username:', username)
    console.log('Default username:', defaultUsername)
    
    if (!username && !defaultUsername) {
      console.log('No username or default username available')
      setLoading(false)
      return
    }
    
    const profileUsername = username || defaultUsername
    console.log('Loading profile for:', profileUsername)
    setLoading(true)
    setRetryCount(0)
    fetchProfile(profileUsername)
  }, [username, user?.id])

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
