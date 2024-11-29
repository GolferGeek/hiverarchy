import { createContext, useContext, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const ProfileContext = createContext()

export function useProfile() {
  return useContext(ProfileContext)
}

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const { username: routeUsername } = useParams()
  const defaultUsername = import.meta.env.VITE_DEFAULT_USERNAME

  useEffect(() => {
    fetchProfile()
  }, [routeUsername])

  async function fetchProfile() {
    try {
      setLoading(true)
      // If default username exists, use it, otherwise use username from route
      const usernameToFetch = defaultUsername || routeUsername

      if (!usernameToFetch) {
        setProfile(null)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', usernameToFetch)
        .single()

      if (error) {
        setProfile(null)
      } else {
        setProfile(data)
      }
    } catch (error) {
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    profile,
    loading,
    fetchProfile,
    isDefaultProfile: routeUsername === defaultUsername
  }

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  )
}
