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
  // Ensure we always have a default username
  const defaultUsername = import.meta.env.VITE_DEFAULT_USERNAME || 'golfergeek'
  const location = useLocation()

  const getFullLogoUrl = (filename) => {
    if (!filename || filename === 'null' || filename === 'undefined') return '/images/gg-logo.jpg'
    if (filename.startsWith('http')) return filename
    if (filename.startsWith('data:')) return filename
    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/profile_logos/${filename}`
  }

  // Fetch the blog profile (based on URL)
  const fetchBlogProfile = async (username) => {
    try {
      if (!username || username === 'undefined' || username === 'null') {
        console.log('Invalid username provided for profile fetch, using default:', defaultUsername)
        username = defaultUsername
      }

      console.log('fetchBlogProfile starting for username:', username)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (error) {
        console.error('Error in fetchBlogProfile:', error)
        if (username !== defaultUsername) {
          console.log('Retrying with default username')
          return fetchBlogProfile(defaultUsername)
        }
        throw error
      }

      console.log('fetchBlogProfile success:', data)
      return data
    } catch (error) {
      console.error('Error fetching blog profile:', error)
      if (username !== defaultUsername) {
        console.log('Error occurred, retrying with default username')
        return fetchBlogProfile(defaultUsername)
      }
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
    
    // Check if we're on localhost:4021 (hierarchy mode)
    const isHierarchyMode = window.location.hostname === 'localhost' && window.location.port === '4021'
    
    // If we're in hierarchy mode and have a user profile, prefer that
    if (isHierarchyMode && user && userProfile?.username) {
      return userProfile.username
    }
    
    // Always return defaultUsername for login/signup pages or empty paths
    if (!pathParts.length || pathParts[0] === 'login' || pathParts[0] === 'signup') {
      // Exception: Don't default to golfergeek on localhost:4021 (leave null)
      if (isHierarchyMode) {
        return null
      }
      return defaultUsername
    }
    
    // Ensure we never return invalid values
    const username = pathParts[0]
    if (username && username !== 'undefined' && username !== 'null') {
      return username
    }
    
    // If we're in hierarchy mode, don't default to golfergeek
    if (isHierarchyMode) {
      return null
    }
    
    return defaultUsername
  }

  // Fetch both profiles when needed
  const fetchProfiles = async () => {
    try {
      setLoading(true)
      console.log('Starting fetchProfiles')
      
      // Get username with proper fallbacks
      let blogUsername = routeUsername || getUsernameFromPath()
      
      // Check if we're on localhost:4021 (hierarchy mode)
      const isHierarchyMode = window.location.hostname === 'localhost' && window.location.port === '4021'
      
      // If we're on localhost:4021 and the user is logged in, use their profile
      if (isHierarchyMode && user && !blogUsername) {
        // Get user profile first
        const newUserProfile = await fetchUserProfile(user.id)
        if (newUserProfile?.username) {
          console.log('Using logged-in user profile for localhost:4021:', newUserProfile.username)
          setUserProfile(newUserProfile)
          setBlogProfile(newUserProfile)
          setLoading(false)
          return
        }
      }
      
      // Ensure we always have a valid username
      if (!blogUsername || blogUsername === 'undefined' || blogUsername === 'null') {
        // For hierarchy mode (localhost:4021), only use default if no user is logged in
        if (isHierarchyMode && user) {
          // Try to get the user's profile
          const newUserProfile = await fetchUserProfile(user.id)
          if (newUserProfile?.username) {
            blogUsername = newUserProfile.username
          } else {
            // If user has no profile yet, redirect to profile setup
            console.log('User has no profile yet, will use default for now')
            blogUsername = defaultUsername
          }
        } else {
          console.log('Invalid username detected, using default:', defaultUsername)
          blogUsername = defaultUsername
        }
      }

      console.log('Fetching profile for username:', blogUsername)
      
      // Get blog profile
      const newBlogProfile = await fetchBlogProfile(blogUsername)
      console.log('Fetched blog profile:', newBlogProfile)
      setBlogProfile(newBlogProfile)

      // Get user profile if logged in
      const newUserProfile = user ? await fetchUserProfile(user.id) : null
      console.log('Fetched user profile:', newUserProfile)
      setUserProfile(newUserProfile)
      
      // Special case for localhost:4021 - if user is viewing their own profile
      if (isHierarchyMode && user && newUserProfile && 
          (!blogUsername || blogUsername === newUserProfile.username)) {
        console.log('Setting blog profile to user profile for localhost:4021')
        setBlogProfile(newUserProfile)
      }

    } catch (error) {
      console.error('Error in fetchProfiles:', error)
      setBlogProfile(null)
      setUserProfile(null)
    } finally {
      console.log('Completing fetchProfiles')
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    console.log('ProfileContext effect triggered:', { 
      routeUsername, 
      pathname: location.pathname,
      blogProfileExists: !!blogProfile,
      loading
    })

    // Check if we're on localhost:4021 (hierarchy mode)
    const isHierarchyMode = window.location.hostname === 'localhost' && window.location.port === '4021'

    // Don't fetch if we already have a profile and the username matches
    const currentUsername = routeUsername || getUsernameFromPath()
    
    // For localhost:4021, if the user is logged in and we already have their profile loaded,
    // don't refetch unless the path contains a different username
    if (isHierarchyMode && user && userProfile?.username && blogProfile?.username === userProfile.username) {
      if (routeUsername && routeUsername !== userProfile.username) {
        // Different username in route, continue with fetch
      } else {
        console.log('Already showing user profile on localhost:4021, skipping fetch')
        if (loading && mounted) {
          setLoading(false)
        }
        return () => { mounted = false }
      }
    }
    // Otherwise, normal check for existing profile
    else if (blogProfile?.username === currentUsername) {
      console.log('Profile already exists with correct username, skipping fetch')
      if (loading && mounted) {
        setLoading(false)
      }
      return () => { mounted = false }
    }

    const doFetch = async () => {
      if (!mounted) return
      
      try {
        if (!loading) setLoading(true)
        
        // Check for localhost:4021 special case first
        if (isHierarchyMode && user && !routeUsername) {
          console.log('Localhost:4021 detected, fetching user profile')
          
          // Get user profile
          const newUserProfile = user ? await fetchUserProfile(user.id) : null
          if (!mounted) return
          
          if (newUserProfile?.username) {
            console.log('Setting user profile for localhost:4021:', newUserProfile.username)
            setUserProfile(newUserProfile)
            
            // For localhost:4021, also set this as blog profile (what's being displayed)
            setBlogProfile(newUserProfile)
            setLoading(false)
            return
          }
        }
        
        console.log('Starting profile fetch for:', currentUsername)
        
        // Get blog profile
        const newBlogProfile = await fetchBlogProfile(currentUsername)
        if (!mounted) return
        
        if (newBlogProfile) {
          console.log('Setting blog profile:', newBlogProfile.username)
          setBlogProfile(newBlogProfile)
          // Only set loading false after we have a profile
          setLoading(false)
        }

        // Get user profile if logged in
        const newUserProfile = user ? await fetchUserProfile(user.id) : null
        if (!mounted) return
        
        if (newUserProfile) {
          console.log('Setting user profile:', newUserProfile.username)
          setUserProfile(newUserProfile)
          
          // If on localhost:4021 and viewing a page without username in URL path,
          // use the logged-in user's profile
          if (isHierarchyMode && !routeUsername && !currentUsername) {
            console.log('Setting blog profile to user profile for localhost:4021')
            setBlogProfile(newUserProfile)
          }
        }

      } catch (error) {
        console.error('Error in profile fetch:', error)
        if (mounted) {
          setBlogProfile(null)
          setUserProfile(null)
          setLoading(false)
        }
      }
    }

    doFetch()

    return () => {
      mounted = false
    }
  }, [routeUsername, user?.id, location.pathname])

  const value = {
    // The profile being viewed (from URL)
    blogProfile,
    setBlogProfile,
    // The logged-in user's profile
    userProfile,
    loading: loading || !blogProfile, // Ensure loading is true until we have a profile
    fetchProfiles,
    isDefaultProfile: routeUsername === defaultUsername,
    // For backward compatibility
    profile: blogProfile,
    currentUsername: routeUsername || getUsernameFromPath() || blogProfile?.username || userProfile?.username || defaultUsername,
    getFullLogoUrl // Export the URL helper function
  }

  console.log('ProfileContext render:', { loading, blogProfile: blogProfile?.username })

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  )
}
