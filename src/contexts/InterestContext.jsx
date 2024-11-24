import { createContext, useContext, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { useSiteProfile } from './SiteProfileContext'

const InterestContext = createContext()

export function useInterests() {
  return useContext(InterestContext)
}

export function InterestProvider({ children }) {
  const [interests, setInterests] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { siteProfile } = useSiteProfile()
  const defaultUserId = import.meta.env.VITE_DEFAULT_USER

  useEffect(() => {
    if (siteProfile) {
      fetchInterests(siteProfile.id)
    } else if (defaultUserId) {
      fetchInterests(defaultUserId)
    }
  }, [siteProfile, user])

  async function fetchInterests(userId = null) {
    try {
      console.log('Fetching interests for user:', userId)
      let query = supabase
        .from('interests')
        .select('*')
        .order('sequence', { ascending: true })
        .order('title')

      if (userId) {
        const { data: userInterests, error: userError } = await query
          .eq('user_id', userId)

        if (!userError && userInterests?.length > 0) {
          console.log('Found interests:', userInterests)
          setInterests(userInterests)
          setLoading(false)
          return
        }
      }

      // If no user or no user interests, get default user's interests
      const { data: defaultInterests, error: defaultError } = await query
        .eq('user_id', defaultUserId)

      if (defaultError) {
        console.error('Error fetching default interests:', defaultError)
        setInterests([])
      } else {
        console.log('Using default interests:', defaultInterests)
        setInterests(defaultInterests || [])
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching interests:', error)
      setLoading(false)
      setInterests([])
    }
  }

  async function updatePostTags(postId, tags) {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ tags })
        .eq('id', postId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating post tags:', error)
      return false
    }
  }

  const value = {
    interests,
    loading,
    updatePostTags,
    fetchInterests
  }

  return (
    <InterestContext.Provider value={value}>
      {children}
    </InterestContext.Provider>
  )
}
