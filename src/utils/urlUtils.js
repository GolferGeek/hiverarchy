import { supabase } from '../lib/supabase'
import { useProfile } from '../contexts/ProfileContext'

const DEFAULT_USERNAME = import.meta.env.VITE_DEFAULT_USERNAME || 'golfergeek'

export const getDomain = () => {
  return window.location.hostname
}

export const isHiverarchyDomain = () => {
  const domain = getDomain()
  return domain.includes('hiverarchy.com')
}

export const isUserDomain = () => {
  const domain = getDomain()
  return !isHiverarchyDomain() && !isLocalhost()
}

export const isLocalhost = () => {
  const domain = getDomain()
  return domain === 'localhost'
}

export const shouldShowUsernameInUrl = () => {
  // Only show username in URL for hiverarchy.com domain
  return isHiverarchyDomain()
}

export const shouldShowWelcomePage = () => {
  // Only show welcome page on hiverarchy.com domain root path
  return isHiverarchyDomain() && window.location.pathname === '/'
}

export const getEffectiveUsername = async (blogProfile = null) => {
  // First check if we have a blog profile
  if (blogProfile?.username) {
    return blogProfile.username
  }

  // For localhost, use the environment variable
  if (isLocalhost()) {
    return import.meta.env.VITE_DEFAULT_USERNAME || 'golfergeek'
  }

  // For user domains (e.g., golfergeek.com), extract username from domain
  if (isUserDomain()) {
    const domain = getDomain()
    return domain.split('.')[0]
  }

  // For hiverarchy domain, get username from URL if present, otherwise use default
  if (isHiverarchyDomain()) {
    const pathParts = window.location.pathname.split('/').filter(Boolean)
    if (pathParts[0]) {
      return pathParts[0]
    }
  }

  // If all else fails, return default username from env
  return import.meta.env.VITE_DEFAULT_USERNAME || 'golfergeek'
}

export const formatPath = (path = '', username = null) => {
  // Remove leading/trailing slashes and filter out empty segments
  const cleanPath = path.split('/').filter(Boolean).join('/')
  
  if (!shouldShowUsernameInUrl()) {
    return `/${cleanPath}`
  }

  return `/${username}/${cleanPath}`
}

export const isValidPath = (path) => {
  const parts = path.split('/').filter(Boolean)
  
  // Check if it's a root path that needs redirection
  if (parts.length === 0) {
    return false
  }

  // If we're on hiverarchy domain, first part should be username
  if (shouldShowUsernameInUrl()) {
    return parts[0] === DEFAULT_USERNAME
  }

  // For non-hiverarchy domains, path should not start with username
  return parts[0] !== DEFAULT_USERNAME
}

export const getRedirectPath = async (currentPath, blogProfile = null) => {
  const parts = currentPath.split('/').filter(Boolean)
  const username = await getEffectiveUsername(blogProfile)
  
  console.log('getRedirectPath:', {
    currentPath,
    parts,
    username,
    shouldShowUsername: shouldShowUsernameInUrl(),
    isLocalhost: isLocalhost(),
    isHiverarchy: isHiverarchyDomain()
  })

  // For localhost or user domains
  if (isLocalhost() || isUserDomain()) {
    // If we're at root, go straight to home
    if (parts.length === 0) {
      return '/home'
    }
    
    // If first part is a username, remove it
    if (parts[0] === username) {
      return '/' + parts.slice(1).join('/')
    }
    
    return null
  }

  // For hiverarchy domain
  if (isHiverarchyDomain()) {
    // Root path shows welcome page (handled by shouldShowWelcomePage)
    if (parts.length === 0) {
      return null
    }
    
    // Otherwise ensure username is in path
    if (parts[0] !== username) {
      return `/${username}${parts.length ? '/' + parts.join('/') : ''}`
    }
  }
  
  return null
}

export const removeUsernameFromPath = async (path) => {
  const parts = path.split('/').filter(Boolean)
  if (parts.length > 0) {
    // Remove the username part if it exists
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', parts[0])
      .single()
    
    if (data) {
      return '/' + parts.slice(1).join('/')
    }
  }
  return path
} 