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

  const fetchInterests = async (userId) => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      const { data: userInterests, error } = await supabase
        .from('interests')
        .select('*')
        .eq('user_id', userId)
        .order('sequence', { ascending: true })
        .order('title')

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

  useEffect(() => {
    const userId = defaultUserId
    if (!userId) {
      setInterests([])
      setLoading(false)
      return
    }
    
    setLoading(true)
    fetchInterests(userId)
  }, [defaultUserId])

  async function updatePostTags(postId, tags) {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ tags })
        .eq('id', postId)

      if (error) throw error
      return true
    } catch (error) {
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
