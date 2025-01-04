import { createContext, useContext, useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const ProfileContext = createContext()

export function useProfile() {
  return useContext(ProfileContext)
}

export function ProfileProvider({ children }) {
  const [blogProfile, setBlogProfile] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const { username: routeUsername } = useParams()
  const { user } = useAuth()
  const defaultUsername = import.meta.env.VITE_DEFAULT_USERNAME
  const location = useLocation()

  // Fetch the blog profile (based on URL)
  const fetchBlogProfile = async (username) => {
    if (!username) return null
    
    console.log('Fetching blog profile for username:', username)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', username)
      .single()

    if (error) {
      console.error('Error fetching blog profile:', error)
      return null
    }
    
    console.log('Found blog profile:', data)
    return data
  }

  // Fetch the user profile (based on auth)
  const fetchUserProfile = async (userId) => {
    if (!userId) return null
    
    console.log('Fetching user profile for ID:', userId)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
    
    console.log('Found user profile:', data)
    return data
  }

  // Get username from path if not available from useParams
  const getUsernameFromPath = () => {
    const pathParts = location.pathname.split('/').filter(Boolean)
    return pathParts[0] === 'login' || pathParts[0] === 'signup' 
      ? defaultUsername 
      : pathParts[0]
  }

  // Fetch both profiles when needed
  const fetchProfiles = async () => {
    try {
      setLoading(true)
      const effectiveUsername = routeUsername || getUsernameFromPath()
      console.log('Fetching profiles for:', { effectiveUsername, userId: user?.id })

      // Get blog profile from route username or default
      const blogUsername = effectiveUsername || defaultUsername
      console.log('Using blog username:', blogUsername)
      const newBlogProfile = await fetchBlogProfile(blogUsername)
      setBlogProfile(newBlogProfile)

      // Get user profile if logged in
      const newUserProfile = user ? await fetchUserProfile(user.id) : null
      setUserProfile(newUserProfile)

    } catch (error) {
      console.error('Error in fetchProfiles:', error)
      setBlogProfile(null)
      setUserProfile(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('ProfileContext: Dependencies changed:', { 
      routeUsername, 
      userId: user?.id, 
      pathname: location.pathname 
    })
    fetchProfiles()
  }, [routeUsername, user?.id, location.pathname])

  const value = {
    // The profile being viewed (from URL)
    blogProfile,
    // The logged-in user's profile
    userProfile,
    loading,
    fetchProfiles,
    isDefaultProfile: routeUsername === defaultUsername,
    // For backward compatibility
    profile: blogProfile,
    currentUsername: routeUsername || getUsernameFromPath() || blogProfile?.username || userProfile?.username || defaultUsername
  }

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  )
}
