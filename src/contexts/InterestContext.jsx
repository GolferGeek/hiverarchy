import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const InterestContext = createContext()

export function useInterests() {
  return useContext(InterestContext)
}

export function InterestProvider({ children }) {
  const [interests, setInterests] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const defaultUserId = import.meta.env.VITE_DEFAULT_USER

  useEffect(() => {
    fetchInterests()
  }, [user])

  async function fetchInterests() {
    try {
      let query = supabase
        .from('interests')
        .select('*')
        .order('sequence', { ascending: true })
        .order('title')

      // If user is authenticated, get their interests
      if (user) {
        const { data: userInterests, error: userError } = await query
          .eq('user_id', user.id)

        if (!userError && userInterests?.length > 0) {
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
