import { createContext, useContext, useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useProfile } from './ProfileContext'
import { useAuth } from './AuthContext'

const InterestContext = createContext()

export function useInterests() {
  return useContext(InterestContext)
}

export function InterestProvider({ children }) {
  const [interests, setInterests] = useState([])
  const [loading, setLoading] = useState(true)
  const { username: routeUsername } = useParams()
  const { blogProfile } = useProfile()
  const { user } = useAuth()
  const location = useLocation()
  const isManageRoute = location.pathname.includes('/manage/interests')

  // Get username from path if not available from useParams
  const getUsernameFromPath = () => {
    const pathParts = location.pathname.split('/').filter(Boolean)
    return pathParts[0]
  }

  const fetchInterestsQuery = (query) => {
    // If we're on the manage page and we're the owner, show all interests
    if (isManageRoute && user?.email === blogProfile?.email) {
      return query
    }
    // Otherwise, only show active interests
    return query.eq('is_active', true)
  }

  useEffect(() => {
    const effectiveUsername = routeUsername || getUsernameFromPath()
    
    // If we have a blog profile, use its ID directly
    if (blogProfile?.id) {
      setLoading(true)
      
      const fetchInterestsForProfile = async () => {
        try {
          let query = supabase
            .from('interests')
            .select('*')
            .eq('user_id', blogProfile.id)
            .order('sequence', { ascending: true })
            .order('title')

          // Apply active filter if not on manage page
          query = fetchInterestsQuery(query)

          const { data: userInterests, error } = await query

          if (error) {
            setInterests([])
          } else {
            setInterests(userInterests || [])
          }
        } catch (error) {
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
            setInterests([])
            return
          }

          // Get the interests
          let query = supabase
            .from('interests')
            .select('*')
            .eq('user_id', profile.id)
            .order('sequence', { ascending: true })
            .order('title')

          // Apply active filter if not on manage page
          query = fetchInterestsQuery(query)

          const { data: userInterests, error } = await query

          if (error) {
            setInterests([])
          } else {
            setInterests(userInterests || [])
          }
        } catch (error) {
          setInterests([])
        } finally {
          setLoading(false)
        }
      }

      fetchProfileAndInterests()
      return
    }

    // If we have neither, clear interests
    setInterests([])
    setLoading(false)
  }, [routeUsername, blogProfile, location.pathname, user?.email, isManageRoute])

  const value = {
    interests,
    loading,
    fetchInterests: async (includeInactive = false) => {
      const effectiveUsername = routeUsername || getUsernameFromPath()
      if (blogProfile?.id) {
        let query = supabase
          .from('interests')
          .select('*')
          .eq('user_id', blogProfile.id)
          .order('sequence', { ascending: true })
          .order('title')
        
        if (!includeInactive) {
          query = query.eq('is_active', true)
        }
        
        const { data, error } = await query
        
        if (error) {
          return []
        }
        return data || []
      } else if (effectiveUsername) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .ilike('username', effectiveUsername)
          .single()
        
        if (profile?.id) {
          let query = supabase
            .from('interests')
            .select('*')
            .eq('user_id', profile.id)
            .order('sequence', { ascending: true })
            .order('title')
          
          if (!includeInactive) {
            query = query.eq('is_active', true)
          }
          
          const { data, error } = await query
          
          if (error) {
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
