import { supabase } from '../lib/supabase'

const DEFAULT_USERNAME = import.meta.env.VITE_DEFAULT_USERNAME || 'golfergeek'

export const getDomain = () => {
  return window.location.hostname
}

export const getPort = () => {
  return window.location.port
}

export const isHiverarchyDomain = () => {
  const domain = getDomain()
  const port = getPort()
  
  // Consider localhost:4021 as hierarchy.com (for development)
  if (domain === 'localhost' && port === '4021') {
    return true
  }
  
  return domain.includes('hiverarchy.com')
}

export const isLocalhost = () => {
  const domain = getDomain()
  return domain === 'localhost'
}

// Simplify URL handling - always show username in URL except for plain localhost
export const shouldShowUsernameInUrl = () => {
  // Always show username in URL except on plain localhost for development
  return getDomain() !== 'localhost' || getPort() === '4021'
}

export const shouldShowWelcomePage = () => {
  // Only show welcome page on hiverarchy.com domain root path
  return isHiverarchyDomain() && window.location.pathname === '/'
}

// Extract domain name as username (e.g., golfergeek.com → golfergeek)
export const extractUsernameFromDomain = () => {
  const domain = getDomain()
  if (domain === 'localhost') return null
  
  // Extract the first part of the domain (before first dot)
  const parts = domain.split('.')
  if (parts.length > 0) {
    return parts[0]
  }
  
  return null
}

export const getEffectiveUsername = async (blogProfile = null) => {
  // First check if we have a blog profile
  if (blogProfile?.username) {
    return blogProfile.username
  }

  // Check if this is a custom domain (not hiverarchy.com and not localhost)
  if (!isHiverarchyDomain() && !isLocalhost()) {
    const domainUsername = extractUsernameFromDomain()
    if (domainUsername) return domainUsername
  }

  // For plain localhost, use the environment variable
  if (isLocalhost() && getPort() !== '4021') {
    return DEFAULT_USERNAME
  }

  // For hiverarchy domain or localhost:4021, get username from URL if present
  const pathParts = window.location.pathname.split('/').filter(Boolean)
  if (pathParts[0]) {
    // Check if the first path segment is a valid username
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', pathParts[0])
        .single()
      
      if (profile) {
        return profile.username
      }
    } catch (error) {
      // Not a valid username in the URL
      console.log('First URL part is not a valid username:', pathParts[0])
    }
  }
  
  // If we're on localhost:4021 and don't have a username in the URL,
  // return null to let the app use the logged-in user's profile
  if (getDomain() === 'localhost' && getPort() === '4021') {
    return null
  }
  
  // Default fallback
  return DEFAULT_USERNAME
}

export const formatPath = (path = '', username = null) => {
  // Remove leading/trailing slashes and filter out empty segments
  const cleanPath = path.split('/').filter(Boolean).join('/')
  
  // If username should not be shown in URL, just return the path
  if (!shouldShowUsernameInUrl()) {
    return `/${cleanPath}`
  }

  // For all other cases, include username in path
  if (username) {
    return `/${username}/${cleanPath}`
  }
  
  // If no username is provided but we should show it, 
  // we'll let the app redirect to include username
  return `/${cleanPath}`
}

export const isValidPath = (path) => {
  const parts = path.split('/').filter(Boolean)
  
  // Check if it's a root path
  if (parts.length === 0) {
    // Root path is only valid for hiverarchy.com (welcome page)
    return isHiverarchyDomain()
  }

  // If we're on a domain that should show username in URL, first part should be a username
  if (shouldShowUsernameInUrl()) {
    // Validation will be handled by getRedirectPath since it needs async access
    // to check if the first part is a valid username
    return true
  }

  // For regular localhost, any path is valid
  return true
}

export const getRedirectPath = async (currentPath, blogProfile = null) => {
  // Sanitize the input path
  let cleanPath = currentPath.split(/[?#]/)[0]
  
  // Split the path into its components and filter out empty segments
  const parts = cleanPath.split('/').filter(Boolean)
  const username = await getEffectiveUsername(blogProfile)
  
  console.log('getRedirectPath:', {
    originalPath: currentPath,
    cleanPath,
    parts,
    username,
    isHiverarchyDomain: isHiverarchyDomain(),
    domain: getDomain(),
    port: getPort()
  })
  
  // Early return if we don't have a username but username is required in path
  if (!username && shouldShowUsernameInUrl()) {
    console.log('Early return: Username required but not available')
    return null
  }
  
  // Never redirect to the same path
  const currentPathClean = '/' + parts.join('/')
  
  // For hiverarchy.com root path, show welcome page
  if (isHiverarchyDomain() && parts.length === 0) {
    return null // Keep at root path for welcome page
  }
  
  // For all other domains including custom domains (e.g., golfergeek.com)
  // We want to use the username in the URL
  if (shouldShowUsernameInUrl()) {
    // If at root path and we have a username, redirect to /:username
    if (parts.length === 0 && username) {
      return `/${username}`
    }
    
    // If first part is already a valid username, no need to redirect
    if (parts.length > 0) {
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', parts[0])
          .single()
        
        if (profileData) {
          console.log(`Found valid username ${parts[0]} in URL, no redirection needed`)
          return null
        }
      } catch (error) {
        // First part is not a valid username
        console.log('First URL part is not a valid username:', parts[0])
      }
    }
    
    // If we get here, we need to prepend the username to the path
    if (username) {
      return `/${username}/${parts.join('/')}`
    }
  }
  
  // For plain localhost, no redirects needed
  if (isLocalhost() && getPort() !== '4021') {
    return null
  }
  
  return null
}

// Remove username from path for internal navigation
export const removeUsernameFromPath = async (path) => {
  const parts = path.split('/').filter(Boolean)
  
  // If path doesn't have enough parts or we shouldn't show username, return as is
  if (parts.length === 0 || !shouldShowUsernameInUrl()) {
    return path
  }
  
  // Check if first part is a username
  try {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', parts[0])
      .single()
    
    if (profileData) {
      // Remove username from path
      return '/' + parts.slice(1).join('/')
    }
  } catch (error) {
    // Not a username, return as is
  }
  
  return path
}