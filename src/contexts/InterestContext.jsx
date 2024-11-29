import { createContext, useContext, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const InterestContext = createContext()

export function useInterests() {
  return useContext(InterestContext)
}

export function InterestProvider({ children }) {
  const [interests, setInterests] = useState([])
  const [loading, setLoading] = useState(true)
  const { username: routeUsername } = useParams()
  const defaultUsername = import.meta.env.VITE_DEFAULT_USERNAME

  const fetchInterests = async (username) => {
    if (!username) {
      setLoading(false)
      return
    }

    try {
      console.log('Fetching interests for username:', username)
      // First get the user_id from the profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .ilike('username', username)
        .single()

      if (profileError) {
        console.error('Profile fetch error:', profileError)
        setInterests([])
        return
      }

      if (!profile) {
        console.error('No profile found for username:', username)
        setInterests([])
        return
      }

      console.log('Found profile:', profile)

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

  useEffect(() => {
    const usernameToFetch = defaultUsername || routeUsername
    if (!usernameToFetch) {
      setInterests([])
      setLoading(false)
      return
    }
    
    setLoading(true)
    fetchInterests(usernameToFetch)
  }, [defaultUsername, routeUsername])

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
