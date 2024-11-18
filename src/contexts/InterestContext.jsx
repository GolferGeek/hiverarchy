import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const InterestContext = createContext()

export function useInterests() {
  return useContext(InterestContext)
}

export function InterestProvider({ children }) {
  const [interests, setInterests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInterests()
  }, [])

  async function fetchInterests() {
    try {
      const { data, error } = await supabase
        .from('interests')
        .select('*')
        .order('title')

      if (error) {
        throw error
      }
      setInterests(data || [])
      setLoading(false)
    } catch (error) {
      setLoading(false)
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
    updatePostTags
  }

  return (
    <InterestContext.Provider value={value}>
      {children}
    </InterestContext.Provider>
  )
}
