import { createContext, useContext, useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useProfile } from './ProfileContext'

const InterestContext = createContext()

export function useInterests() {
  return useContext(InterestContext)
}

export function InterestProvider({ children }) {
  const [interests, setInterests] = useState([])
  const [loading, setLoading] = useState(true)
  const { username: routeUsername } = useParams()
  const { blogProfile } = useProfile()
  const location = useLocation()

  // Get username from path if not available from useParams
  const getUsernameFromPath = () => {
    const pathParts = location.pathname.split('/').filter(Boolean)
    return pathParts[0]
  }

  useEffect(() => {
    const effectiveUsername = routeUsername || getUsernameFromPath()
    console.log('InterestContext: Dependencies changed:', { 
      effectiveUsername,
      blogProfileId: blogProfile?.id,
      blogProfileUsername: blogProfile?.username,
      pathname: location.pathname
    })
    
    // If we have a blog profile, use its ID directly
    if (blogProfile?.id) {
      console.log('Using blog profile ID to fetch interests:', blogProfile.id)
      setLoading(true)
      
      const fetchInterestsForProfile = async () => {
        try {
          const { data: userInterests, error } = await supabase
            .from('interests')
            .select('*')
            .eq('user_id', blogProfile.id)
            .order('sequence', { ascending: true })
            .order('title')

          if (error) {
            console.error('Interests fetch error:', error)
            setInterests([])
          } else {
            console.log('Fetched interests:', userInterests)
            setInterests(userInterests || [])
          }
        } catch (error) {
          console.error('Unexpected error:', error)
          setInterests([])
        } finally {
          setLoading(false)
        }
      }
      
      fetchInterestsForProfile()
      return
    }
    
    // If we don't have a blog profile but have a username, fetch the profile first
    if (effectiveUsername) {
      console.log('Fetching profile for username:', effectiveUsername)
      setLoading(true)
      
      const fetchProfileAndInterests = async () => {
        try {
          // Get the profile ID
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .ilike('username', effectiveUsername)
            .single()

          if (profileError || !profile) {
            console.error('Profile fetch error:', profileError)
            setInterests([])
            return
          }

          console.log('Found profile:', profile)

          // Get the interests
          const { data: userInterests, error } = await supabase
            .from('interests')
            .select('*')
            .eq('user_id', profile.id)
            .order('sequence', { ascending: true })
            .order('title')

          if (error) {
            console.error('Interests fetch error:', error)
            setInterests([])
          } else {
            console.log('Fetched interests:', userInterests)
            setInterests(userInterests || [])
          }
        } catch (error) {
          console.error('Unexpected error:', error)
          setInterests([])
        } finally {
          setLoading(false)
        }
      }

      fetchProfileAndInterests()
      return
    }

    // If we have neither, clear interests
    console.log('No profile or username available, clearing interests')
    setInterests([])
    setLoading(false)
  }, [routeUsername, blogProfile, location.pathname])

  const value = {
    interests,
    loading,
    fetchInterests: async () => {
      const effectiveUsername = routeUsername || getUsernameFromPath()
      if (blogProfile?.id) {
        console.log('Fetching interests for profile ID:', blogProfile.id)
        const { data, error } = await supabase
          .from('interests')
          .select('*')
          .eq('user_id', blogProfile.id)
          .order('sequence', { ascending: true })
          .order('title')
        
        if (error) {
          console.error('Error fetching interests:', error)
          return []
        }
        return data || []
      } else if (effectiveUsername) {
        console.log('Fetching interests for username:', effectiveUsername)
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .ilike('username', effectiveUsername)
          .single()
        
        if (profile?.id) {
          const { data, error } = await supabase
            .from('interests')
            .select('*')
            .eq('user_id', profile.id)
            .order('sequence', { ascending: true })
            .order('title')
          
          if (error) {
            console.error('Error fetching interests:', error)
            return []
          }
          return data || []
        }
      }
      return []
    }
  }

  return (
    <InterestContext.Provider value={value}>
      {children}
    </InterestContext.Provider>
  )
}
