import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const ProfileContext = createContext()

export function useProfile() {
  return useContext(ProfileContext)
}

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const defaultUserId = import.meta.env.VITE_DEFAULT_USER

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', defaultUserId)
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
    fetchProfile
  }

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  )
}
