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

  const getFullLogoUrl = (filename) => {
    if (!filename || filename === 'null' || filename === 'undefined') return '/images/default.jpg'
    if (filename.startsWith('http')) return filename
    if (filename.startsWith('data:')) return filename
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/profile_logos/${filename}`
  }

  // Fetch the blog profile (based on URL)
  const fetchBlogProfile = async (username) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      return null
    }
  }

  // Fetch the user profile (based on auth)
  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      return null
    }
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

      // Get blog profile from route username or default
      const blogUsername = effectiveUsername || defaultUsername
      const newBlogProfile = await fetchBlogProfile(blogUsername)
      setBlogProfile(newBlogProfile)

      // Get user profile if logged in
      const newUserProfile = user ? await fetchUserProfile(user.id) : null
      setUserProfile(newUserProfile)

    } catch (error) {
      setBlogProfile(null)
      setUserProfile(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
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
    currentUsername: routeUsername || getUsernameFromPath() || blogProfile?.username || userProfile?.username || defaultUsername,
    getFullLogoUrl // Export the URL helper function
  }

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  )
}
